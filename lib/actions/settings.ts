"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types/database";

export async function updateSiteSettings(input: Partial<Omit<SiteSettings, "id" | "updated_at">>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { error: "Não foi possível salvar as configurações." };
  revalidatePath("/admin/configuracoes");
  return { success: true };
}
