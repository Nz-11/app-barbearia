"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createBlockedTime, deleteBlockedTime } from "@/lib/actions/schedule";
import { datetimeLocalToUtc, formatDateTimeInTz } from "@/lib/datetime";
import type { BlockedTime } from "@/lib/types/database";

export function BlockedTimesManager({
  barberId,
  blockedTimes,
}: {
  barberId: string;
  blockedTimes: BlockedTime[];
}) {
  const router = useRouter();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!start || !end) {
      setError("Informe início e fim do bloqueio.");
      return;
    }
    // Os campos datetime-local são horário de São Paulo (fuso da agenda), não o
    // fuso do navegador de quem está no painel.
    const startUtc = datetimeLocalToUtc(start);
    const endUtc = datetimeLocalToUtc(end);
    if (!startUtc || !endUtc) {
      setError("Data inválida.");
      return;
    }
    if (endUtc <= startUtc) {
      setError("O fim deve ser depois do início.");
      return;
    }
    startTransition(async () => {
      const res = await createBlockedTime({
        barberId,
        startAt: startUtc.toISOString(),
        endAt: endUtc.toISOString(),
        reason,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setStart("");
      setEnd("");
      setReason("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBlockedTime(id);
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="grid gap-3 rounded-xl border border-white/8 bg-ink-900/40 p-4 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs text-bone-200/50">Início</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-950/60 px-2 py-2 text-sm text-bone-50"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs text-bone-200/50">Fim</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-950/60 px-2 py-2 text-sm text-bone-50"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs text-bone-200/50">Motivo</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Folga, compromisso..."
            className="w-full rounded-lg border border-white/10 bg-ink-950/60 px-2 py-2 text-sm text-bone-50"
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <button
            disabled={isPending}
            type="submit"
            className="w-full rounded-lg bg-brass-500 py-2 text-sm font-medium text-ink-950 hover:bg-brass-400 disabled:opacity-60"
          >
            Bloquear
          </button>
        </div>
        {error && <p className="text-xs text-red-400 sm:col-span-4">{error}</p>}
      </form>

      <div className="mt-4 space-y-2">
        {blockedTimes.length === 0 && (
          <p className="text-sm text-bone-200/40">Nenhum bloqueio registrado.</p>
        )}
        {blockedTimes.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-900/30 p-3 text-sm"
          >
            <div>
              <p className="text-bone-100">
                {formatDateTimeInTz(b.start_at)} — {formatDateTimeInTz(b.end_at)}
              </p>
              {b.reason && <p className="text-xs text-bone-200/50">{b.reason}</p>}
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              disabled={isPending}
              className="rounded-lg border border-white/10 p-1.5 text-bone-200/60 hover:border-red-400 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
