import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  return (
    <section id="contato" className="bg-ink-900 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="VENHA NOS VISITAR" title="Localização & Contato" />

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <Reveal className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-950/60 p-6">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brass-400" />
              <div>
                <p className="text-sm text-bone-100">
                  {siteConfig.address.street} — {siteConfig.address.neighborhood}
                </p>
                <p className="text-sm text-bone-200/60">
                  {siteConfig.address.city}/{siteConfig.address.state} · {siteConfig.address.zip}
                </p>
                <a
                  href={siteConfig.address.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-brass-400 hover:underline"
                >
                  Ver no mapa
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-950/60 p-6">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-brass-400" />
              <p className="text-sm text-bone-100">{siteConfig.contact.phone}</p>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-950/60 p-6">
              <Instagram className="mt-1 h-5 w-5 shrink-0 text-brass-400" />
              <a
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-bone-100 hover:text-brass-400"
              >
                {siteConfig.contact.instagram}
              </a>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-ink-950/60 p-6">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-brass-400" />
              <div className="space-y-1">
                {siteConfig.hours.map((h) => (
                  <p key={h.day} className="flex gap-4 text-sm text-bone-100">
                    <span className="w-32 text-bone-200/60">{h.day}</span>
                    {h.time}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full min-h-[320px] overflow-hidden rounded-2xl border border-white/8 bg-ink-950/60">
              <iframe
                title="Localização"
                className="h-full w-full grayscale invert-[0.92] contrast-[1.1]"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${siteConfig.address.street}, ${siteConfig.address.city}`
                )}&output=embed`}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
