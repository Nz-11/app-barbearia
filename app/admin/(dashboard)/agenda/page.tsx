import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAppointmentsInRange } from "@/lib/data/admin";
import { getAccessNotice, getSession } from "@/lib/auth/session";
import {
  addDays,
  dateStrInBusinessTz,
  dayBoundsUtc,
  formatDayStr,
  formatTimeInTz,
  isValidDateStr,
  todayInBusinessTz,
  weekdayOf,
} from "@/lib/datetime";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AppointmentActions } from "@/components/admin/AppointmentActions";
import { QueryError } from "@/components/admin/QueryError";
import { cn } from "@/lib/utils";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "week" ? "week" : "day";
  // Dias são "YYYY-MM-DD" no fuso da barbearia (America/Sao_Paulo).
  const baseDate = isValidDateStr(params.date) ? params.date : todayInBusinessTz();

  const firstDay = view === "week" ? addDays(baseDate, -weekdayOf(baseDate)) : baseDate;
  const days = Array.from({ length: view === "week" ? 7 : 1 }, (_, i) => addDays(firstDay, i));

  const [{ data: appointments, error }, session] = await Promise.all([
    getAppointmentsInRange(
      dayBoundsUtc(days[0]).start.toISOString(),
      dayBoundsUtc(days[days.length - 1]).end.toISOString()
    ),
    getSession(),
  ]);
  const notice = session ? getAccessNotice(session) : null;

  const step = view === "week" ? 7 : 1;
  const prevDate = addDays(baseDate, -step);
  const nextDate = addDays(baseDate, step);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Agenda</h1>
          <p className="mt-1 text-sm text-bone-200/60">
            {formatDayStr(baseDate, { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-white/10 p-1">
            <Link
              href={`?view=day&date=${baseDate}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs",
                view === "day" ? "bg-brass-400 text-ink-950" : "text-bone-200/60"
              )}
            >
              Dia
            </Link>
            <Link
              href={`?view=week&date=${baseDate}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs",
                view === "week" ? "bg-brass-400 text-ink-950" : "text-bone-200/60"
              )}
            >
              Semana
            </Link>
          </div>

          <Link
            href={`?view=${view}&date=${prevDate}`}
            className="rounded-full border border-white/10 p-2 text-bone-200/70 hover:text-bone-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`?view=${view}&date=${nextDate}`}
            className="rounded-full border border-white/10 p-2 text-bone-200/70 hover:text-bone-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {error && <QueryError message={error} />}
      {notice && <QueryError message={notice} />}

      <div
        className={cn(
          "mt-8 grid gap-4",
          view === "week" ? "grid-cols-1 lg:grid-cols-7" : "grid-cols-1"
        )}
      >
        {days.map((day) => {
          const dayAppointments = appointments.filter((a) => dateStrInBusinessTz(a.start_at) === day);
          return (
            <div key={day} className="rounded-2xl border border-white/8 bg-ink-900/40 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-bone-200/50">
                {formatDayStr(day, { weekday: "short", day: "2-digit", month: "2-digit" })}
              </p>
              <div className="space-y-2">
                {dayAppointments.length === 0 && (
                  <p className="text-xs text-bone-200/30">Sem agendamentos</p>
                )}
                {dayAppointments.map((a) => (
                  <div key={a.id} className="rounded-xl border border-white/8 bg-ink-950/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-bone-50">{formatTimeInTz(a.start_at)}</p>
                        <p className="mt-0.5 text-xs text-bone-200/60">{a.customer?.name}</p>
                        <p className="text-xs text-bone-200/50">
                          {a.service?.name} · {a.barber?.name}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <AppointmentActions id={a.id} status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
