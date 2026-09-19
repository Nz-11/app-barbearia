/**
 * Configuração central da barbearia.
 * Troque estes valores pelos dados reais do negócio.
 * Nenhum dado aqui é sensível — pode ficar no repositório.
 */
export const siteConfig = {
  name: "Barbearia Nobre",
  shortName: "Nobre",
  tagline: "PRECISION. STYLE. EXPERIENCE.",
  description:
    "Barbearia premium especializada em cortes de precisão, barboterapia e experiência exclusiva.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // --- Placeholder: substitua pelos dados reais ---
  contact: {
    phone: "(11) 0000-0000",
    whatsapp: "5511000000000",
    email: "contato@barbearianobre.example",
    instagram: "@barbearianobre",
    instagramUrl: "https://instagram.com/barbearianobre",
  },
  address: {
    street: "Rua Exemplo, 123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zip: "00000-000",
    mapsUrl: "https://maps.google.com/?q=Barbearia+Nobre",
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
