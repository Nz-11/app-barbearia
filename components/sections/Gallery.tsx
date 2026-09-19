import Image from "next/image";
import { Scissors } from "lucide-react";
import { galleryItems } from "@/lib/config/gallery";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function Gallery() {
  return (
    <section id="galeria" className="bg-ink-950 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="NOSSO AMBIENTE" title="Galeria" />

        <div className="mt-16 grid auto-rows-[160px] grid-cols-2 gap-4 sm:auto-rows-[200px] sm:grid-cols-3 lg:grid-cols-4">
          {galleryItems.map((item, i) => (
            <Reveal
              key={item.id}
              delay={(i % 4) * 0.06}
              className={cn(
                item.span === "tall" && "row-span-2",
                item.span === "wide" && "col-span-2"
              )}
            >
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/8 bg-gradient-to-br from-ink-800 to-ink-950">
                {item.src ? (
                  <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Scissors className="h-6 w-6 text-white/10" strokeWidth={1} />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
