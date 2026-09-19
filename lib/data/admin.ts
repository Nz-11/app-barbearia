import { createClient } from "@/lib/supabase/server";
import { dayBoundsUtc, todayInBusinessTz } from "@/lib/datetime";
import type { AppointmentStatus, AppointmentWithRelations, Customer } from "@/lib/types/database";

const VALID_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

/**
 * Traduz um erro do Supabase em mensagem para o painel. Erros reais são
 * logados no servidor; a mensagem exibida nunca vaza detalhes internos.
 *
 * Importante: o RLS NÃO gera erro quando o usuário não pode ver as linhas — a
 * consulta simplesmente volta vazia. Por isso as telas também avisam quando a
 * conta não é admin nem está vinculada a um barbeiro (ver getSession).
 */
export function describeQueryError(context: string, error: { code?: string; message?: string }): string {
  console.error(context, error);
  const denied =
    error.code === "42501" ||
    error.code === "PGRST301" ||
    /permission denied|row-level security|jwt/i.test(error.message ?? "");
  return denied
    ? "Você não tem permissão para ver estes dados. Saia e entre novamente; se persistir, fale com o administrador."
    : "Não foi possível carregar os dados agora. Atualize a página; se o problema continuar, tente novamente em instantes.";
}

export type QueryResult<T> = { data: T; error: string | null };

const relationSelect = `
  id, barber_id, service_id, customer_id, start_at, end_at, status, notes, created_at, updated_at,
  barber:barbers ( id, name, photo_url ),
  service:services ( id, name, duration_minutes, price_cents ),
  customer:customers ( id, name, phone, email )
`;

export async function getDashboardStats() {
  const supabase = await createClient();
  // "Hoje" é o dia civil de São Paulo, não o do servidor.
  const { start, end } = dayBoundsUtc(todayInBusinessTz());

  const [
    { data: today, error: todayError },
    { data: upcoming, error: upcomingError },
    { count: customersCount, error: customersError },
    { count: barbersCount, error: barbersError },
    { count: servicesCount, error: servicesError },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(relationSelect)
      .gte("start_at", start.toISOString())
      .lt("start_at", end.toISOString())
      .order("start_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(relationSelect)
      .gt("start_at", new Date().toISOString())
      .neq("status", "cancelled")
      .order("start_at", { ascending: true })
      .limit(8),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("barbers").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  const firstError = [todayError, upcomingError, customersError, barbersError, servicesError].find(Boolean);
  const error = firstError ? describeQueryError("getDashboardStats", firstError) : null;

  const todayAppointments = (today ?? []) as unknown as AppointmentWithRelations[];
  const upcomingAppointments = (upcoming ?? []) as unknown as AppointmentWithRelations[];

  const confirmed = todayAppointments.filter((a) => a.status === "confirmed").length;
  const pending = todayAppointments.filter((a) => a.status === "pending").length;
  const cancelled = todayAppointments.filter((a) => a.status === "cancelled").length;
  const completed = todayAppointments.filter((a) => a.status === "completed").length;

  const estimatedRevenue = todayAppointments
    .filter((a) => a.status !== "cancelled")
    .reduce((sum, a) => sum + (a.service?.price_cents ?? 0), 0);

  return {
    todayAppointments,
    upcomingAppointments,
    confirmed,
    pending,
    cancelled,
    completed,
    estimatedRevenue,
    customersCount: customersCount ?? 0,
    barbersCount: barbersCount ?? 0,
    servicesCount: servicesCount ?? 0,
    error,
  };
}

/** Agendamentos com início em [startISO, endExclusiveISO). */
export async function getAppointmentsInRange(
  startISO: string,
  endExclusiveISO: string
): Promise<QueryResult<AppointmentWithRelations[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(relationSelect)
    .gte("start_at", startISO)
    .lt("start_at", endExclusiveISO)
    .order("start_at", { ascending: true });

  if (error) return { data: [], error: describeQueryError("getAppointmentsInRange", error) };
  return { data: (data ?? []) as unknown as AppointmentWithRelations[], error: null };
}

export async function getAllAppointments(filters?: {
  status?: string;
}): Promise<QueryResult<AppointmentWithRelations[]>> {
  const supabase = await createClient();
  let query = supabase.from("appointments").select(relationSelect).order("start_at", { ascending: false });
  if (filters?.status && VALID_STATUSES.includes(filters.status as AppointmentStatus)) {
    query = query.eq("status", filters.status as AppointmentStatus);
  }

  const { data, error } = await query.limit(200);
  if (error) return { data: [], error: describeQueryError("getAllAppointments", error) };
  return { data: (data ?? []) as unknown as AppointmentWithRelations[], error: null };
}

export async function getCustomers(): Promise<QueryResult<Customer[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return { data: [], error: describeQueryError("getCustomers", error) };
  return { data: data ?? [], error: null };
}

export async function getAllBarbers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("barbers").select("*").order("created_at");
  if (error) return [];
  return data ?? [];
}

export async function getAllServices() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").order("created_at");
  if (error) return [];
  return data ?? [];
}

export async function getWorkingHoursForBarber(barberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("working_hours")
    .select("*")
    .eq("barber_id", barberId)
    .order("weekday");
  if (error) return [];
  return data ?? [];
}

export async function getBlockedTimes(barberId?: string) {
  const supabase = await createClient();
  let query = supabase.from("blocked_times").select("*").order("start_at", { ascending: false });
  if (barberId) query = query.eq("barber_id", barberId);
  const { data, error } = await query.limit(100);
  if (error) return [];
  return data ?? [];
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}
