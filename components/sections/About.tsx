import { siteConfig } from "@/lib/config/site";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-ink-900 px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-xs font-medium tracking-widest2 text-brass-400">NOSSA HISTÓRIA</p>
          <h2 className="mt-4 font-display text-3xl text-bone-50 sm:text-4xl md:text-5xl">
            Tradição e precisão em cada corte.
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-bone-200/70 sm:text-base">
            A {siteConfig.name} nasceu da paixão pela barbearia clássica combinada com técnicas
            modernas. Cada visita é pensada como uma experiência — do primeiro atendimento ao
            acabamento final — para clientes que valorizam estilo, qualidade e exclusividade.
          </p>
        </Reveal>

        <div className="grid grid-cols-3 gap-4">
          {siteConfig.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="rounded-2xl border border-white/8 bg-ink-950/60 px-4 py-8 text-center">
                <p className="font-display text-3xl text-brass-400 sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-bone-200/50 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
