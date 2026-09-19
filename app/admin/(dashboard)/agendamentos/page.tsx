import Link from "next/link";
import { getAllAppointments } from "@/lib/data/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AppointmentActions } from "@/components/admin/AppointmentActions";
import { QueryError } from "@/components/admin/QueryError";
import { getAccessNotice, getSession } from "@/lib/auth/session";
import { formatDateInTz, formatTimeInTz } from "@/lib/datetime";
import { formatPrice, cn } from "@/lib/utils";

const filters = [
  { label: "Todos", value: undefined },
  { label: "Pendentes", value: "pending" },
  { label: "Confirmados", value: "confirmed" },
  { label: "Concluídos", value: "completed" },
  { label: "Cancelados", value: "cancelled" },
];

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const [{ data: appointments, error }, session] = await Promise.all([
    getAllAppointments({ status: params.status }),
    getSession(),
  ]);
  const notice = session ? getAccessNotice(session) : null;

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Agendamentos</h1>
      <p className="mt-1 text-sm text-bone-200/60">Todos os agendamentos registrados.</p>

      {error && <QueryError message={error} />}
      {notice && <QueryError message={notice} />}

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `?status=${f.value}` : "?"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs",
              (params.status ?? undefined) === f.value
                ? "border-brass-400 bg-brass-400/10 text-brass-400"
                : "border-white/10 text-bone-200/60 hover:text-bone-50"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase tracking-wide text-bone-200/50">
            <tr>
              <th className="px-4 py-3">Data / Hora</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Barbeiro</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.map((a) => (
              <tr key={a.id} className="bg-ink-900/20">
                <td className="px-4 py-3 text-bone-100">
                  {formatDateInTz(a.start_at)} {formatTimeInTz(a.start_at)}
                </td>
                <td className="px-4 py-3">
                  <p className="text-bone-100">{a.customer?.name}</p>
                  <p className="text-xs text-bone-200/50">{a.customer?.phone}</p>
                </td>
                <td className="px-4 py-3 text-bone-200/80">{a.service?.name}</td>
                <td className="px-4 py-3 text-bone-200/80">{a.barber?.name}</td>
                <td className="px-4 py-3 text-bone-200/80">
                  {a.service ? formatPrice(a.service.price_cents) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <AppointmentActions id={a.id} status={a.status} />
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-bone-200/40">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
