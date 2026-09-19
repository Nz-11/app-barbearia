import { AlertCircle, Calendar, Clock, Scissors, User } from "lucide-react";
import type { BookingState } from "@/lib/types/booking";
import { formatDuration, formatPrice } from "@/lib/utils";

export function SummaryStep({
  state,
  error,
  submitting,
  onConfirm,
}: {
  state: BookingState;
  error: string | null;
  submitting: boolean;
  onConfirm: () => void;
}) {
  if (!state.service || !state.barber || !state.slot) return null;
  const slotDate = new Date(state.slot);

  const rows = [
    { icon: Scissors, label: "Serviço", value: state.service.name },
    { icon: User, label: "Barbeiro", value: state.barber.name },
    {
      icon: Calendar,
      label: "Data",
      value: slotDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    },
    {
      icon: Clock,
      label: "Horário",
      value: slotDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ];

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
        <dl className="space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-200/50">
                <row.icon className="h-4 w-4 text-brass-400" /> {row.label}
              </dt>
              <dd className="text-right text-sm text-bone-50">{row.value}</dd>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <dt className="text-xs uppercase tracking-wide text-bone-200/50">Duração</dt>
              <dd className="text-sm text-bone-50">
                {formatDuration(state.service.duration_minutes)}
              </dd>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <dt className="text-sm font-medium text-bone-100">Total</dt>
              <dd className="font-display text-xl text-brass-400">
                {formatPrice(state.service.price_cents)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-900/30 p-4 text-sm text-bone-200/70">
        <p>
          <span className="text-bone-50">{state.customerName}</span> · {state.customerPhone}
        </p>
        {state.customerEmail && <p className="mt-0.5">{state.customerEmail}</p>}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full rounded-full bg-brass-500 py-4 text-sm font-medium text-ink-950 transition-all hover:bg-brass-400 active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? "Confirmando..." : "Confirmar agendamento"}
      </button>
    </div>
  );
}
