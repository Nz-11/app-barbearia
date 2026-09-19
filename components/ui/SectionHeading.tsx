import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium tracking-widest2 text-brass-400">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl text-bone-50 sm:text-4xl md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-sm text-bone-200/70 sm:text-base">{description}</p>
      )}
    </Reveal>
  );
}
