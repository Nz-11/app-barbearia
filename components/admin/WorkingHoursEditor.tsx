"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertWorkingHours } from "@/lib/actions/schedule";
import type { WorkingHours } from "@/lib/types/database";

const weekdayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface RowState {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

function buildInitialRows(hours: WorkingHours[]): RowState[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const found = hours.find((h) => h.weekday === weekday);
    return {
      enabled: !!found,
      startTime: found?.start_time?.slice(0, 5) ?? "09:00",
      endTime: found?.end_time?.slice(0, 5) ?? "18:00",
      breakStart: found?.break_start?.slice(0, 5) ?? "",
      breakEnd: found?.break_end?.slice(0, 5) ?? "",
    };
  });
}

export function WorkingHoursEditor({
  barberId,
  workingHours,
  readOnly = false,
}: {
  barberId: string;
  workingHours: WorkingHours[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<RowState[]>(buildInitialRows(workingHours));
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [errorIdx, setErrorIdx] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  function updateRow(idx: number, patch: Partial<RowState>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  function save(idx: number) {
    const row = rows[idx];
    setSavingIdx(idx);
    setErrorIdx((e) => ({ ...e, [idx]: "" }));
    startTransition(async () => {
      const res = await upsertWorkingHours({
        barberId,
        weekday: idx,
        enabled: row.enabled,
        startTime: row.startTime,
        endTime: row.endTime,
        breakStart: row.breakStart || null,
        breakEnd: row.breakEnd || null,
      });
      setSavingIdx(null);
      if (res?.error) setErrorIdx((e) => ({ ...e, [idx]: res.error! }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-3 rounded-xl border border-white/8 bg-ink-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <label className="flex items-center gap-2 text-sm text-bone-100 sm:w-32">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={row.enabled}
              onChange={(e) => updateRow(idx, { enabled: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-brass-500"
            />
            {weekdayLabels[idx]}
          </label>

          {row.enabled && (
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
              <input
                type="time"
                disabled={readOnly}
                value={row.startTime}
                onChange={(e) => updateRow(idx, { startTime: e.target.value })}
                className="rounded-lg border border-white/10 bg-ink-950/60 px-2 py-1.5 text-sm text-bone-50"
              />
              <input
                type="time"
                disabled={readOnly}
                value={row.endTime}
                onChange={(e) => updateRow(idx, { endTime: e.target.value })}
                className="rounded-lg border border-white/10 bg-ink-950/60 px-2 py-1.5 text-sm text-bone-50"
              />
              <input
                type="time"
                disabled={readOnly}
                value={row.breakStart}
                placeholder="Intervalo início"
                onChange={(e) => updateRow(idx, { breakStart: e.target.value })}
                className="rounded-lg border border-white/10 bg-ink-950/60 px-2 py-1.5 text-sm text-bone-50"
              />
              <input
                type="time"
                disabled={readOnly}
                value={row.breakEnd}
                placeholder="Intervalo fim"
                onChange={(e) => updateRow(idx, { breakEnd: e.target.value })}
                className="rounded-lg border border-white/10 bg-ink-950/60 px-2 py-1.5 text-sm text-bone-50"
              />
            </div>
          )}

          {!readOnly && (
            <button
              disabled={isPending && savingIdx === idx}
              onClick={() => save(idx)}
              className="shrink-0 rounded-full border border-white/15 px-4 py-1.5 text-xs text-bone-100 hover:border-brass-400 hover:text-brass-400"
            >
              {savingIdx === idx && isPending ? "Salvando..." : "Salvar"}
            </button>
          )}
          {errorIdx[idx] && <p className="text-xs text-red-400">{errorIdx[idx]}</p>}
        </div>
      ))}
    </div>
  );
}
