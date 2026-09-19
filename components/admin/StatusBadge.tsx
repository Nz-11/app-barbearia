import { statusColors, statusLabels, cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types/database";

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        statusColors[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
