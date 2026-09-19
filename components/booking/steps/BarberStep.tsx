import type { Barber } from "@/lib/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export function BarberStep({
  barbers,
  selectedId,
  onSelect,
}: {
  barbers: Barber[];
  selectedId?: string;
  onSelect: (barber: Barber) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {barbers.map((barber) => (
        <button
          key={barber.id}
          onClick={() => onSelect(barber)}
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-5 text-left transition-all active:scale-[0.98]",
            selectedId === barber.id
              ? "border-brass-400 bg-brass-400/10"
              : "border-white/10 bg-ink-900/50 hover:border-white/25"
          )}
        >
          <Avatar name={barber.name} src={barber.photo_url} className="h-14 w-14 shrink-0 text-lg" />
          <div>
            <p className="font-display text-lg text-bone-50">{barber.name}</p>
            {barber.specialties.length > 0 && (
              <p className="mt-1 text-xs text-bone-200/60">{barber.specialties.join(" · ")}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
