import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getActiveServices } from "@/lib/data/public";
import { formatDuration, formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export async function Services() {
  const services = await getActiveServices();

  return (
    <section id="servicos" className="bg-ink-950 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="O QUE OFERECEMOS"
          title="Serviços"
          description="Cada detalhe pensado para uma experiência de precisão e cuidado."
        />

        {services.length === 0 ? (
          <p className="mt-16 text-center text-sm text-bone-200/50">
            Nenhum serviço cadastrado ainda. Configure os serviços pelo painel administrativo.
          </p>
        ) : (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.08}>
                <div className="group flex h-full flex-col rounded-2xl border border-white/8 bg-ink-900/60 p-6 transition-colors hover:border-brass-400/40">
                  <h3 className="font-display text-xl text-bone-50">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 flex-1 text-sm text-bone-200/60">{service.description}</p>
                  )}
                  <div className="mt-5 flex items-center gap-1.5 text-xs text-bone-200/50">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(service.duration_minutes)}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="font-display text-lg text-brass-400">
                      {formatPrice(service.price_cents)}
                    </span>
                    <Link
                      href={`/agendamento?service=${service.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-bone-100 transition-colors group-hover:text-brass-400"
                    >
                      Agendar <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
