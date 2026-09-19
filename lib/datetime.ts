/**
 * Datas no fuso da barbearia.
 *
 * O expediente (working_hours), get_available_slots e create_appointment
 * interpretam horários em America/Sao_Paulo. Tudo que o painel mostra ou
 * agrupa por "dia" precisa usar o MESMO fuso — independente do fuso do
 * servidor (ex.: Vercel roda em UTC) ou do navegador.
 *
 * "Data" aqui é sempre uma string "YYYY-MM-DD" (dia civil em São Paulo).
 */
export const BUSINESS_TZ = "America/Sao_Paulo";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedParts(date: Date) {
  const p: Record<string, number> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return p as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

/** Diferença (ms) entre o horário local de São Paulo e UTC no instante dado. */
function zoneOffsetMs(date: Date): number {
  const p = zonedParts(date);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - Math.floor(date.getTime() / 1000) * 1000;
}

/** Valida "YYYY-MM-DD" (inclusive datas inexistentes como 2026-02-31). */
export function isValidDateStr(value: string | undefined | null): value is string {
  if (!value) return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** Dia civil (YYYY-MM-DD) em São Paulo de um instante. */
export function dateStrInBusinessTz(input: Date | string): string {
  const p = zonedParts(typeof input === "string" ? new Date(input) : input);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function todayInBusinessTz(now: Date = new Date()): string {
  return dateStrInBusinessTz(now);
}

/** Soma dias a um dia civil (aritmética de calendário, sem depender de fuso). */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Dia da semana (0=domingo .. 6=sábado) de um dia civil. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Instante UTC em que é `time` (HH:mm[:ss]) no dia civil `dateStr`, em São
 * Paulo. Ex.: zonedTimeToUtc("2026-10-05", "09:00") -> 2026-10-05T12:00:00Z.
 */
export function zonedTimeToUtc(dateStr: string, time = "00:00:00"): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh = 0, mm = 0, ss = 0] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss);
  let utc = guess - zoneOffsetMs(new Date(guess));
  // Segunda passada cobre datas próximas a mudança de horário de verão.
  const second = guess - zoneOffsetMs(new Date(utc));
  if (second !== utc) utc = second;
  return new Date(utc);
}

/** Meia-noite local do dia (inclusive) e da meia-noite seguinte (exclusive). */
export function dayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  return {
    start: zonedTimeToUtc(dateStr),
    end: zonedTimeToUtc(addDays(dateStr, 1)),
  };
}

/** Converte o valor de um <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") em UTC. */
export function datetimeLocalToUtc(value: string): Date | null {
  const [datePart, timePart] = value.split("T");
  if (!isValidDateStr(datePart) || !timePart) return null;
  return zonedTimeToUtc(datePart, timePart);
}

type DateInput = Date | string;
const toDate = (v: DateInput) => (typeof v === "string" ? new Date(v) : v);

export function formatTimeInTz(value: DateInput): string {
  return toDate(value).toLocaleTimeString("pt-BR", {
    timeZone: BUSINESS_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateInTz(value: DateInput, options?: Intl.DateTimeFormatOptions): string {
  return toDate(value).toLocaleDateString("pt-BR", { timeZone: BUSINESS_TZ, ...options });
}

export function formatDateTimeInTz(value: DateInput): string {
  return toDate(value).toLocaleString("pt-BR", { timeZone: BUSINESS_TZ });
}

/** Formata um dia civil ("YYYY-MM-DD") — não sofre deslocamento de fuso. */
export function formatDayStr(dateStr: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", ...options });
}
