"use client";

import { useState, useTransition } from "react";
import { createBarber, updateBarber } from "@/lib/actions/barbers";
import type { Barber } from "@/lib/types/database";

export function BarberForm({
  barber,
  onDone,
}: {
  barber?: Barber;
  onDone: () => void;
}) {
  const [name, setName] = useState(barber?.name ?? "");
  const [bio, setBio] = useState(barber?.bio ?? "");
  const [specialties, setSpecialties] = useState(barber?.specialties.join(", ") ?? "");
  const [active, setActive] = useState(barber?.active ?? true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const specialtiesArr = specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = barber
        ? await updateBarber(barber.id, { name, bio, specialties: specialtiesArr, active })
        : await createBarber({ name, bio, specialties: specialtiesArr, active, email: email || undefined });

      if (res?.error) {
        setError(res.error);
        return;
      }
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">Nome *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">Descrição</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
          Especialidades (separadas por vírgula)
        </label>
        <input
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          placeholder="Degradê, Barba, Platinado"
          className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
        />
      </div>

      {!barber && (
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
            E-mail (opcional — envia convite de acesso ao painel)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barbeiro@email.com"
            className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-bone-200/70">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-brass-500"
        />
        Ativo (visível no site)
      </label>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-brass-500 py-3 text-sm font-medium text-ink-950 hover:bg-brass-400 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : barber ? "Salvar alterações" : "Criar barbeiro"}
      </button>
    </form>
  );
}
