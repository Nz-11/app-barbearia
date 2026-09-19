"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scissors, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config/site";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "sem-perfil"
      ? "Sua conta não tem perfil de acesso ao painel. Fale com o administrador."
      : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom") ?? "/admin";
    router.push(redirectedFrom);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Scissors className="h-8 w-8 text-brass-400" strokeWidth={1.5} />
          <h1 className="mt-4 font-display text-2xl text-bone-50">{siteConfig.shortName} Admin</h1>
          <p className="mt-1 text-sm text-bone-200/60">Acesse o painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3.5 text-bone-50 outline-none focus:border-brass-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3.5 text-bone-50 outline-none focus:border-brass-400"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brass-500 py-3.5 text-sm font-medium text-ink-950 transition-all hover:bg-brass-400 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
