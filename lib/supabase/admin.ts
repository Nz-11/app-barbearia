import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Client com a service role key — SOMENTE para uso em Route Handlers
 * (server-side). Nunca importe este arquivo em código que roda no browser.
 * Ignora RLS por completo; use com cuidado e apenas quando necessário
 * (ex.: RPCs de agendamento que precisam rodar antes do usuário existir).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
