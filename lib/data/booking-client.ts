"use client";

import { createClient } from "@/lib/supabase/client";
import type { Barber, Service } from "@/lib/types/database";

export async function fetchActiveServices(): Promise<Service[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("duration_minutes", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveBarbers(): Promise<Barber[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Dias da semana (0=domingo..6=sábado) em que o barbeiro tem expediente. */
export async function fetchBarberWorkWeekdays(barberId: string): Promise<Set<number>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("working_hours")
    .select("weekday")
    .eq("barber_id", barberId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.weekday));
}

export async function fetchAvailableSlots(
  barberId: string,
  serviceId: string,
  dateISO: string
): Promise<string[]> {
  const res = await fetch(
    `/api/availability?barberId=${barberId}&serviceId=${serviceId}&date=${dateISO}`
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erro ao buscar horários");
  return json.slots as string[];
}

export async function createAppointment(payload: {
  barberId: string;
  serviceId: string;
  startAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ appointmentId: string }> {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erro ao criar agendamento");
  return json;
}
