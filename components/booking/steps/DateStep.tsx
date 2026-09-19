"use client";

import { cn } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function DateStep({
  workWeekdays,
  selected,
  onSelect,
  daysAhead = 30,
}: {
  workWeekdays: Set<number>;
  selected?: Date | null;
  onSelect: (date: Date) => void;
  daysAhead?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: daysAhead }, (_, i) => addDays(today, i));

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
      {days.map((day) => {
        const disabled = !workWeekdays.has(day.getDay());
        const isSelected =
          selected && selected.toDateString() === day.toDateString();
        return (
          <button
            key={day.toISOString()}
            disabled={disabled}
            onClick={() => onSelect(day)}
            className={cn(
              "flex flex-col items-center rounded-xl border px-2 py-4 transition-all active:scale-[0.96]",
              disabled && "cursor-not-allowed border-white/5 text-bone-200/20",
              !disabled && isSelected && "border-brass-400 bg-brass-400/10 text-brass-400",
              !disabled &&
                !isSelected &&
                "border-white/10 bg-ink-900/50 text-bone-100 hover:border-white/25"
            )}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-70">
              {day.toLocaleDateString("pt-BR", { weekday: "short" })}
            </span>
            <span className="mt-1 font-display text-xl">{day.getDate()}</span>
            <span className="text-[10px] opacity-50">
              {day.toLocaleDateString("pt-BR", { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
