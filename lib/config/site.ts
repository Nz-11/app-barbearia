/**
 * Configuração central da barbearia.
 * Troque estes valores pelos dados reais do negócio.
 * Nenhum dado aqui é sensível — pode ficar no repositório.
 */
export const siteConfig = {
  name: "BLACKLINE BARBER CLUB",
  shortName: "BLACKLINE",
  tagline: "PRECISION. CHARACTER. STYLE.",
  description:
    "Uma barbearia contemporânea que combina cortes de precisão, atendimento personalizado e uma experiência sofisticada.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // --- Dados demonstrativos (site fictício) — não são contatos reais ---
  contact: {
    phone: "(11) 4000-2026",
    whatsapp: "551140002026",
    email: "contato@blackline-demo.example",
    instagram: "@blackline.barber.demo",
    instagramUrl: "https://instagram.com/blackline.barber.demo",
  },
  address: {
    street: "Rua Exemplo, 123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zip: "00000-000",
    mapsUrl: "https://maps.google.com/?q=Blackline+Barber+Club",
  },
  hours: [
    { day: "Segunda a Sexta", time: "09:00 – 20:00" },
    { day: "Sábado", time: "09:00 – 18:00" },
    { day: "Domingo", time: "Fechado" },
  ],
  // ---------------------------------------------------

  stats: [
    { label: "Clientes atendidos", value: "500+" },
    { label: "Anos de experiência", value: "5+" },
    { label: "Cortes realizados", value: "10.000+" },
  ],

  nav: [
    { label: "Início", href: "#hero" },
    { label: "Serviços", href: "#servicos" },
    { label: "Barbeiros", href: "#barbeiros" },
    { label: "Galeria", href: "#galeria" },
    { label: "Sobre", href: "#sobre" },
    { label: "Agendamento", href: "/agendamento" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
