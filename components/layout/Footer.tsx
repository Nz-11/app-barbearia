import Link from "next/link";
import { Instagram, MapPin, Phone, Scissors } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/#hero" className="flex items-center gap-2 text-bone-50">
            <Scissors className="h-5 w-5 text-brass-400" strokeWidth={1.5} />
            <span className="font-display text-lg">{siteConfig.shortName}</span>
          </Link>
          <p className="mt-4 text-sm text-bone-200/60">{siteConfig.description}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-widest2 text-bone-200/50">NAVEGAÇÃO</h4>
          <ul className="mt-4 space-y-3">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-bone-200/70 hover:text-brass-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-widest2 text-bone-200/50">CONTATO</h4>
          <ul className="mt-4 space-y-3 text-sm text-bone-200/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brass-400" /> {siteConfig.contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-brass-400" />
              <a href={siteConfig.contact.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-brass-400">
                {siteConfig.contact.instagram}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
              <span>
                {siteConfig.address.street} — {siteConfig.address.neighborhood},{" "}
                {siteConfig.address.city}/{siteConfig.address.state}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-widest2 text-bone-200/50">HORÁRIOS</h4>
          <ul className="mt-4 space-y-2 text-sm text-bone-200/70">
            {siteConfig.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span className="text-bone-200/50">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 pt-8 text-xs text-bone-200/40">
        © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
