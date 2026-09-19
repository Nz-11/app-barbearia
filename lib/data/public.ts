import { createClient } from "@/lib/supabase/server";
import type { Barber, Service } from "@/lib/types/database";

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("duration_minutes", { ascending: true });

  if (error) {
    console.error("getActiveServices", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveBarbers(): Promise<Barber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getActiveBarbers", error);
    return [];
  }
  return data ?? [];
}
