import Image from "next/image";
import { cn } from "@/lib/utils";

/** Avatar com foto real quando disponível, ou iniciais sobre fundo
 * gerado a partir do nome — nunca quebra por imagem ausente. */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-ink-800", className)}>
        <Image src={src} alt={name} fill className="object-cover" sizes="200px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 font-display text-brass-400",
        className
      )}
    >
      {initials}
    </div>
  );
}
