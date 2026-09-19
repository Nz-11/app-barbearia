/**
 * Galeria — troque `src` por uma imagem real em /public/images/gallery/
 * quando disponível. Sem `src`, é renderizado um tile placeholder elegante.
 */
export const galleryItems: { id: string; alt: string; src?: string; span?: "tall" | "wide" }[] = [
  { id: "g1", alt: "Corte de precisão", span: "tall" },
  { id: "g2", alt: "Ambiente da barbearia" },
  { id: "g3", alt: "Barba modelada" },
  { id: "g4", alt: "Estação de trabalho", span: "wide" },
  { id: "g5", alt: "Acabamento na navalha" },
  { id: "g6", alt: "Detalhe de corte" },
  { id: "g7", alt: "Recepção" },
  { id: "g8", alt: "Produtos premium", span: "tall" },
];
