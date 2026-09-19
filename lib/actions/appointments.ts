"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types/database";

const VALID_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Status inválido." };
  }

  const supabase = await createClient();
  // .select("id") faz o Supabase devolver as linhas afetadas. Sem isso não dá
  // para distinguir "atualizou" de "o RLS filtrou e nada foi atualizado" — o
  // PostgREST responde sucesso nos dois casos.
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) {
    // 23P01 = exclusion_violation: reabrir um agendamento cancelado cujo
    // horário já foi ocupado por outro.
    if (error.code === "23P01") {
      return { error: "Este horário já foi ocupado por outro agendamento e não pode ser reativado." };
    }
    console.error("updateAppointmentStatus", error);
    return { error: "Não foi possível atualizar o agendamento. Tente novamente." };
  }

  if (!data || data.length === 0) {
    return { error: "Agendamento não encontrado ou sem permissão para alterá-lo." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin/agendamentos");
  return { success: true };
}
