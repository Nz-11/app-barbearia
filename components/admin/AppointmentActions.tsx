"use client";

import { useState, useTransition } from "react";
import { Check, X, CheckCheck } from "lucide-react";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import type { AppointmentStatus } from "@/lib/types/database";

export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(next: AppointmentStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateAppointmentStatus(id, next);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {status === "pending" && (
          <button
            disabled={isPending}
            onClick={() => run("confirmed")}
            title="Confirmar"
            className="rounded-lg border border-emerald-500/30 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {status !== "completed" && status !== "cancelled" && (
          <button
            disabled={isPending}
            onClick={() => run("completed")}
            title="Marcar como concluído"
            className="rounded-lg border border-sky-500/30 p-1.5 text-sky-400 transition-colors hover:bg-sky-500/10 disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        {status !== "cancelled" && status !== "completed" && (
          <button
            disabled={isPending}
            onClick={() => run("cancelled")}
            title="Cancelar"
            className="rounded-lg border border-red-500/30 p-1.5 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
