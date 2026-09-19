import type { Barber, Service } from "./database";

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const BOOKING_STEPS: { step: BookingStep; label: string }[] = [
  { step: 1, label: "Serviço" },
  { step: 2, label: "Barbeiro" },
  { step: 3, label: "Data" },
  { step: 4, label: "Horário" },
  { step: 5, label: "Dados" },
  { step: 6, label: "Confirmação" },
];

export interface BookingState {
  service: Service | null;
  barber: Barber | null;
  date: Date | null;
  slot: string | null; // ISO string
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export const initialBookingState: BookingState = {
  service: null,
  barber: null,
  date: null,
  slot: null,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
};
