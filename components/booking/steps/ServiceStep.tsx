import { Clock } from "lucide-react";
import type { Service } from "@/lib/types/database";
import { formatDuration, formatPrice, cn } from "@/lib/utils";

export function ServiceStep({
  services,
  selectedId,
  onSelect,
}: {
  services: Service[];
  selectedId?: string;
  onSelect: (service: Service) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service)}
          className={cn(
            "flex flex-col rounded-2xl border p-5 text-left transition-all active:scale-[0.98]",
            selectedId === service.id
              ? "border-brass-400 bg-brass-400/10"
              : "border-white/10 bg-ink-900/50 hover:border-white/25"
          )}
        >
          <span className="font-display text-lg text-bone-50">{service.name}</span>
          {service.description && (
            <span className="mt-1 text-sm text-bone-200/60">{service.description}</span>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-bone-200/50">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration_minutes)}
            </span>
            <span className="font-display text-brass-400">{formatPrice(service.price_cents)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
