import { Star } from "lucide-react";
import { testimonials } from "@/lib/config/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Avatar } from "@/components/ui/Avatar";

export function Testimonials() {
  return (
    <section className="bg-ink-950 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="QUEM JÁ PASSOU POR AQUI" title="Avaliações" />
        <p className="mt-2 text-xs uppercase tracking-widest2 text-bone-200/40">
          Depoimentos demonstrativos — conteúdo fictício para fins de apresentação
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-white/8 bg-ink-900/60 p-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={
                        idx < t.rating
                          ? "h-4 w-4 fill-brass-400 text-brass-400"
                          : "h-4 w-4 text-bone-200/20"
                      }
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm text-bone-200/70">&ldquo;{t.comment}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar name={t.name} className="h-9 w-9 text-xs" />
                  <span className="text-sm text-bone-100">{t.name}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
