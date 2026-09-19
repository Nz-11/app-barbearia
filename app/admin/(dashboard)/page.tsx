import { CalendarCheck, Clock3, DollarSign, Scissors, Users, XCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/data/admin";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { QueryError } from "@/components/admin/QueryError";
import { getAccessNotice, getSession } from "@/lib/auth/session";
import { formatDateInTz, formatTimeInTz } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, session] = await Promise.all([getDashboardStats(), getSession()]);
  const notice = session ? getAccessNotice(session) : null;

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-bone-200/60">Visão geral de hoje.</p>

      {stats.error && <QueryError message={stats.error} />}
      {notice && <QueryError message={notice} />}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Confirmados hoje" value={stats.confirmed} />
        <StatCard icon={Clock3} label="Pendentes hoje" value={stats.pending} />
        <StatCard icon={XCircle} label="Cancelados hoje" value={stats.cancelled} />
        <StatCard
          icon={DollarSign}
          label="Faturamento estimado"
          value={formatPrice(stats.estimatedRevenue)}
        />
        <StatCard icon={Users} label="Clientes cadastrados" value={stats.customersCount} />
        <StatCard icon={Scissors} label="Barbeiros ativos" value={stats.barbersCount} />
        <StatCard icon={Scissors} label="Serviços ativos" value={stats.servicesCount} />
        <StatCard icon={CalendarCheck} label="Agendamentos hoje" value={stats.todayAppointments.length} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg text-bone-50">Hoje</h2>
          <div className="mt-4 space-y-2">
            {stats.todayAppointments.length === 0 && (
              <p className="rounded-xl border border-white/8 bg-ink-900/40 p-4 text-sm text-bone-200/50">
                Nenhum agendamento para hoje.
              </p>
            )}
            {stats.todayAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-900/40 p-4"
              >
                <div>
                  <p className="text-sm text-bone-50">
                    {formatTimeInTz(a.start_at)} · {a.customer?.name}
                  </p>
                  <p className="mt-0.5 text-xs text-bone-200/50">
                    {a.service?.name} com {a.barber?.name}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-bone-50">Próximos agendamentos</h2>
          <div className="mt-4 space-y-2">
            {stats.upcomingAppointments.length === 0 && (
              <p className="rounded-xl border border-white/8 bg-ink-900/40 p-4 text-sm text-bone-200/50">
                Nenhum agendamento futuro.
              </p>
            )}
            {stats.upcomingAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-900/40 p-4"
              >
                <div>
                  <p className="text-sm text-bone-50">
                    {formatDateInTz(a.start_at, { day: "2-digit", month: "2-digit" })} às{" "}
                    {formatTimeInTz(a.start_at)} · {a.customer?.name}
                  </p>
                  <p className="mt-0.5 text-xs text-bone-200/50">
                    {a.service?.name} com {a.barber?.name}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
