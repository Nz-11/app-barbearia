"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ServiceInput {
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
}

export async function createService(input: ServiceInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    name: input.name,
    description: input.description || null,
    duration_minutes: input.durationMinutes,
    price_cents: input.priceCents,
    active: input.active,
  });

  if (error) return { error: "Não foi possível criar o serviço. " + error.message };
  revalidatePath("/admin/servicos");
  revalidatePath("/");
  return { success: true };
}

export async function updateService(id: string, input: ServiceInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      description: input.description || null,
      duration_minutes: input.durationMinutes,
      price_cents: input.priceCents,
      active: input.active,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o serviço." };
  revalidatePath("/admin/servicos");
  revalidatePath("/");
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    return {
      error:
        "Não foi possível excluir. Provavelmente já existem agendamentos vinculados — desative o serviço em vez de excluir.",
    };
  }
  revalidatePath("/admin/servicos");
  revalidatePath("/");
  return { success: true };
}
