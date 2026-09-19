import { Check } from "lucide-react";
import { BOOKING_STEPS, type BookingStep } from "@/lib/types/booking";
import { cn } from "@/lib/utils";

export function StepIndicator({ current }: { current: BookingStep }) {
  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 sm:justify-center sm:gap-3">
      {BOOKING_STEPS.map(({ step, label }, i) => {
        const state = step < current ? "done" : step === current ? "active" : "upcoming";
        return (
          <div key={step} className="flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  state === "done" && "border-brass-400 bg-brass-400 text-ink-950",
                  state === "active" && "border-brass-400 text-brass-400",
                  state === "upcoming" && "border-white/15 text-bone-200/40"
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] uppercase tracking-wide sm:block",
                  state === "upcoming" ? "text-bone-200/30" : "text-bone-200/70"
                )}
              >
                {label}
              </span>
            </div>
            {i < BOOKING_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  step < current ? "bg-brass-400" : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
