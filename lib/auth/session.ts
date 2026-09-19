import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Barber, Profile } from "@/lib/types/database";

export interface SessionData {
  userId: string;
  email: string | null;
  profile: Profile;
  barber: Barber | null;
}

/**
 * Aviso para contas que logam mas, por RLS, não enxergam agendamentos: o RLS
 * devolve lista vazia (não erro), então sem isso o painel pareceria "sem dados".
 */
export function getAccessNotice(session: SessionData): string | null {
  if (session.profile.role === "barber" && !session.barber) {
    return "Sua conta ainda não está vinculada a um barbeiro, por isso nenhum agendamento é exibido. Fale com o administrador.";
  }
  return null;
}

/**
 * Retorna o usuário autenticado + perfil, ou null se não houver sessão ou
 * perfil. `cache` evita repetir as consultas quando layout e página pedem a
 * sessão na mesma requisição.
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  let barber: Barber | null = null;
  if (profile.role === "barber") {
    const { data } = await supabase
      .from("barbers")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();
    barber = data ?? null;
  }

  return { userId: user.id, email: user.email ?? null, profile, barber };
});
