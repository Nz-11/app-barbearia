"use client";

import { useState, useTransition } from "react";
import { createService, updateService } from "@/lib/actions/services";
import type { Service } from "@/lib/types/database";

export function ServiceForm({ service, onDone }: { service?: Service; onDone: () => void }) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? 45));
  const [price, setPrice] = useState(String(service ? service.price_cents / 100 : 40));
  const [active, setActive] = useState(service?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const durationMinutes = parseInt(duration, 10);
    const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);

    if (!durationMinutes || durationMinutes <= 0) {
      setError("Informe uma duração válida.");
      return;
    }
    if (isNaN(priceCents) || priceCents < 0) {
      setError("Informe um preço válido.");
      return;
    }

    startTransition(async () => {
      const input = { name, description, durationMinutes, priceCents, active };
      const res = service ? await updateService(service.id, input) : await createService(input);
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
            Duração (min) *
          </label>
          <input
            required
            type="number"
            min={5}
            step={5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
            Preço (R$) *
          </label>
          <input
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
          />
        </div>
      </div>

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
        {isPending ? "Salvando..." : service ? "Salvar alterações" : "Criar serviço"}
      </button>
    </form>
  );
}
