import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getAllBarbers, getBlockedTimes, getWorkingHoursForBarber } from "@/lib/data/admin";
import { WorkingHoursEditor } from "@/components/admin/WorkingHoursEditor";
import { BlockedTimesManager } from "@/components/admin/BlockedTimesManager";
import { cn } from "@/lib/utils";

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ barber?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const isAdmin = session.profile.role === "admin";

  let barberId: string | null = null;
  let barbers: Awaited<ReturnType<typeof getAllBarbers>> = [];

  if (isAdmin) {
    barbers = await getAllBarbers();
    barberId = params.barber ?? barbers[0]?.id ?? null;
  } else {
    barberId = session.barber?.id ?? null;
  }

  if (!barberId) {
    return (
      <div>
        <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Horários</h1>
        <p className="mt-4 text-sm text-bone-200/60">
          {isAdmin
            ? "Cadastre um barbeiro primeiro."
            : "Sua conta ainda não está vinculada a um barbeiro. Contate o administrador."}
        </p>
      </div>
    );
  }

  const [workingHours, blockedTimes] = await Promise.all([
    getWorkingHoursForBarber(barberId),
    getBlockedTimes(barberId),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Horários</h1>
      <p className="mt-1 text-sm text-bone-200/60">
        Configure o expediente e bloqueie horários indisponíveis.
      </p>

      {isAdmin && barbers.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {barbers.map((b) => (
            <Link
              key={b.id}
              href={`?barber=${b.id}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs",
                barberId === b.id
                  ? "border-brass-400 bg-brass-400/10 text-brass-400"
                  : "border-white/10 text-bone-200/60 hover:text-bone-50"
              )}
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg text-bone-50">Expediente semanal</h2>
        <div className="mt-4">
          <WorkingHoursEditor
            barberId={barberId}
            workingHours={workingHours}
            readOnly={!isAdmin}
          />
        </div>
        {!isAdmin && (
          <p className="mt-2 text-xs text-bone-200/40">
            Apenas o administrador pode alterar o expediente fixo. Use os bloqueios abaixo para folgas
            pontuais.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-bone-50">Bloqueios</h2>
        <div className="mt-4">
          <BlockedTimesManager barberId={barberId} blockedTimes={blockedTimes} />
        </div>
      </section>
    </div>
  );
}
