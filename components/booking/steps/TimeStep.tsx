import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function TimeStep({
  slots,
  loading,
  selected,
  onSelect,
}: {
  slots: string[];
  loading: boolean;
  selected?: string | null;
  onSelect: (slot: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-8 text-center text-sm text-bone-200/60">
        Nenhum horário disponível nesta data. Escolha outro dia.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {slots.map((slot) => {
        const time = new Date(slot).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={cn(
              "rounded-xl border py-4 text-sm font-medium transition-all active:scale-[0.96]",
              isSelected
                ? "border-brass-400 bg-brass-400 text-ink-950"
                : "border-white/10 bg-ink-900/50 text-bone-100 hover:border-white/25"
            )}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
