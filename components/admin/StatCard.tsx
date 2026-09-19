import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-900/50 p-5">
      <div className="flex items-center gap-2 text-bone-200/50">
        <Icon className="h-4 w-4 text-brass-400" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-display text-2xl text-bone-50 sm:text-3xl">{value}</p>
    </div>
  );
}
