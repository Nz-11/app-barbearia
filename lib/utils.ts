import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function formatTimeBR(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};
