import Link from "next/link";
import { getActiveBarbers } from "@/lib/data/public";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Avatar } from "@/components/ui/Avatar";

export async function Barbers() {
  const barbers = await getActiveBarbers();

  return (
    <section id="barbeiros" className="bg-ink-900 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="NOSSA EQUIPE"
          title="Barbeiros"
          description="Profissionais experientes, cada um com sua especialidade."
        />

        {barbers.length === 0 ? (
          <p className="mt-16 text-center text-sm text-bone-200/50">
            Nenhum barbeiro cadastrado ainda. Adicione barbeiros pelo painel administrativo.
          </p>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber, i) => (
              <Reveal key={barber.id} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/8 bg-ink-950/60 p-8 text-center transition-colors hover:border-brass-400/40">
                  <Avatar name={barber.name} src={barber.photo_url} className="mx-auto h-24 w-24 text-2xl" />
                  <h3 className="mt-5 font-display text-xl text-bone-50">{barber.name}</h3>
                  {barber.bio && <p className="mt-2 text-sm text-bone-200/60">{barber.bio}</p>}
                  {barber.specialties.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {barber.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-brass-400/30 px-3 py-1 text-[11px] text-brass-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/agendamento?barber=${barber.id}`}
                    className="mt-6 inline-block rounded-full border border-white/15 px-5 py-2.5 text-xs text-bone-100 transition-colors hover:border-brass-400 hover:text-brass-400"
                  >
                    Agendar com {barber.name.split(" ")[0]}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
