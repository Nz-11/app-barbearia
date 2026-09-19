"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BarberInput {
  name: string;
  bio: string;
  specialties: string[];
  active: boolean;
  email?: string; // se informado, envia convite de acesso ao painel
}

export async function createBarber(input: BarberInput) {
  const supabase = await createClient();
  let profileId: string | null = null;

  if (input.email) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
      data: { full_name: input.name },
    });
    if (error) {
      return { error: `Não foi possível convidar o barbeiro por e-mail: ${error.message}` };
    }
    profileId = data.user.id;
    // garante que o profile criado pelo trigger tenha o papel correto
    await admin.from("profiles").update({ role: "barber", full_name: input.name }).eq("id", profileId);
  }

  const { error } = await supabase.from("barbers").insert({
    name: input.name,
    bio: input.bio || null,
    specialties: input.specialties,
    active: input.active,
    profile_id: profileId,
  });

  if (error) return { error: "Não foi possível criar o barbeiro. " + error.message };
  revalidatePath("/admin/barbeiros");
  revalidatePath("/");
  return { success: true };
}

export async function updateBarber(
  id: string,
  input: Omit<BarberInput, "email"> & { photoUrl?: string | null }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbers")
    .update({
      name: input.name,
      bio: input.bio || null,
      specialties: input.specialties,
      active: input.active,
      photo_url: input.photoUrl ?? undefined,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o barbeiro." };
  revalidatePath("/admin/barbeiros");
  revalidatePath("/");
  return { success: true };
}

export async function setBarberActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("barbers").update({ active }).eq("id", id);
  if (error) return { error: "Não foi possível atualizar o status do barbeiro." };
  revalidatePath("/admin/barbeiros");
  revalidatePath("/");
  return { success: true };
}
