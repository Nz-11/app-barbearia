"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface WorkingHoursInput {
  barberId: string;
  weekday: number;
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export async function upsertWorkingHours(input: WorkingHoursInput) {
  const supabase = await createClient();

  if (!input.enabled) {
    const { error } = await supabase
      .from("working_hours")
      .delete()
      .eq("barber_id", input.barberId)
      .eq("weekday", input.weekday);
    if (error) return { error: "Não foi possível remover o expediente deste dia." };
    revalidatePath("/admin/horarios");
    return { success: true };
  }

  const { error } = await supabase.from("working_hours").upsert(
    {
      barber_id: input.barberId,
      weekday: input.weekday,
      start_time: input.startTime,
      end_time: input.endTime,
      break_start: input.breakStart || null,
      break_end: input.breakEnd || null,
    },
    { onConflict: "barber_id,weekday" }
  );

  if (error) return { error: "Não foi possível salvar o expediente. " + error.message };
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function createBlockedTime(input: {
  barberId: string;
  startAt: string;
  endAt: string;
  reason: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("blocked_times").insert({
    barber_id: input.barberId,
    start_at: input.startAt,
    end_at: input.endAt,
    reason: input.reason || "Indisponível",
    created_by: user?.id ?? null,
  });

  if (error) return { error: "Não foi possível bloquear o horário. " + error.message };
  revalidatePath("/admin/horarios");
  revalidatePath("/admin/agenda");
  return { success: true };
}

export async function deleteBlockedTime(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").delete().eq("id", id);
  if (error) return { error: "Não foi possível remover o bloqueio." };
  revalidatePath("/admin/horarios");
  revalidatePath("/admin/agenda");
  return { success: true };
}
