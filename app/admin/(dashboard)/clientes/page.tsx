import { getCustomers } from "@/lib/data/admin";
import { QueryError } from "@/components/admin/QueryError";
import { formatDateInTz } from "@/lib/datetime";

export default async function ClientesPage() {
  const { data: customers, error } = await getCustomers();

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Clientes</h1>
      <p className="mt-1 text-sm text-bone-200/60">{customers.length} clientes cadastrados.</p>

      {error && <QueryError message={error} />}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase tracking-wide text-bone-200/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Cliente desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c) => (
              <tr key={c.id} className="bg-ink-900/20">
                <td className="px-4 py-3 text-bone-100">{c.name}</td>
                <td className="px-4 py-3 text-bone-200/70">{c.phone}</td>
                <td className="px-4 py-3 text-bone-200/70">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-bone-200/70">
                  {formatDateInTz(c.created_at)}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-bone-200/40">
                  Nenhum cliente ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
