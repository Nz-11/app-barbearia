"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Barber, Service } from "@/lib/types/database";
import { type BookingState, type BookingStep, initialBookingState } from "@/lib/types/booking";
import {
  createAppointment,
  fetchActiveBarbers,
  fetchActiveServices,
  fetchAvailableSlots,
  fetchBarberWorkWeekdays,
} from "@/lib/data/booking-client";
import { StepIndicator } from "./StepIndicator";
import { ServiceStep } from "./steps/ServiceStep";
import { BarberStep } from "./steps/BarberStep";
import { DateStep } from "./steps/DateStep";
import { TimeStep } from "./steps/TimeStep";
import { DetailsStep, type DetailsValue } from "./steps/DetailsStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { Skeleton } from "@/components/ui/Skeleton";

const stepTitles: Record<BookingStep, string> = {
  1: "Escolha o serviço",
  2: "Escolha o barbeiro",
  3: "Escolha a data",
  4: "Escolha o horário",
  5: "Seus dados",
  6: "Confirme seu agendamento",
};

export function BookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<BookingStep>(1);
  const [state, setState] = useState<BookingState>(initialBookingState);
  const [confirmed, setConfirmed] = useState(false);

  const [services, setServices] = useState<Service[] | null>(null);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [workWeekdays, setWorkWeekdays] = useState<Set<number>>(new Set());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [detailsValid, setDetailsValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchActiveServices(), fetchActiveBarbers()])
      .then(([svc, brb]) => {
        setServices(svc);
        setBarbers(brb);

        const preselectedServiceId = searchParams.get("service");
        const preselectedBarberId = searchParams.get("barber");
        if (preselectedServiceId) {
          const found = svc.find((s) => s.id === preselectedServiceId);
          if (found) setState((s) => ({ ...s, service: found }));
        }
        if (preselectedBarberId) {
          const found = brb.find((b) => b.id === preselectedBarberId);
          if (found) setState((s) => ({ ...s, barber: found }));
        }
      })
      .catch(() => setLoadError("Não foi possível carregar os dados. Recarregue a página."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.barber) return;
    fetchBarberWorkWeekdays(state.barber.id)
      .then(setWorkWeekdays)
      .catch(() => setWorkWeekdays(new Set()));
  }, [state.barber]);

  useEffect(() => {
    if (!state.barber || !state.service || !state.date) return;
    setSlotsLoading(true);
    setSlots([]);
    const dateISO = toISODate(state.date);
    fetchAvailableSlots(state.barber.id, state.service.id, dateISO)
      .then(setSlots)
      .catch(() => setLoadError("Não foi possível carregar os horários disponíveis."))
      .finally(() => setSlotsLoading(false));
  }, [state.barber, state.service, state.date]);

  const goNext = useCallback(() => setStep((s) => Math.min(6, s + 1) as BookingStep), []);
  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1) as BookingStep), []);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return !!state.service;
      case 2:
        return !!state.barber;
      case 3:
        return !!state.date;
      case 4:
        return !!state.slot;
      case 5:
        return detailsValid;
      default:
        return false;
    }
  }, [step, state, detailsValid]);

  async function handleConfirm() {
    if (!state.barber || !state.service || !state.slot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createAppointment({
        barberId: state.barber.id,
        serviceId: state.service.id,
        startAt: state.slot,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerEmail: state.customerEmail || undefined,
      });
      setConfirmed(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
      // se o horário foi tomado, força recarregar os horários disponíveis
      if (state.date) {
        const dateISO = toISODate(state.date);
        fetchAvailableSlots(state.barber.id, state.service.id, dateISO).then(setSlots);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <ConfirmationStep state={state} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-widest2 text-brass-400">AGENDAMENTO</p>
        <h1 className="mt-3 font-display text-3xl text-bone-50 sm:text-4xl">
          {stepTitles[step]}
        </h1>
      </div>

      <div className="mb-10">
        <StepIndicator current={step} />
      </div>

      {loadError && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {loadError}
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 &&
            (services ? (
              <ServiceStep
                services={services}
                selectedId={state.service?.id}
                onSelect={(service) => {
                  setState((s) => ({ ...s, service }));
                  goNext();
                }}
              />
            ) : (
              <SkeletonGrid />
            ))}

          {step === 2 &&
            (barbers ? (
              <BarberStep
                barbers={barbers}
                selectedId={state.barber?.id}
                onSelect={(barber) => {
                  setState((s) => ({ ...s, barber, date: null, slot: null }));
                  goNext();
                }}
              />
            ) : (
              <SkeletonGrid />
            ))}

          {step === 3 && (
            <DateStep
              workWeekdays={workWeekdays}
              selected={state.date}
              onSelect={(date) => {
                setState((s) => ({ ...s, date, slot: null }));
                goNext();
              }}
            />
          )}

          {step === 4 && (
            <TimeStep
              slots={slots}
              loading={slotsLoading}
              selected={state.slot}
              onSelect={(slot) => {
                setState((s) => ({ ...s, slot }));
                goNext();
              }}
            />
          )}

          {step === 5 && (
            <DetailsStep
              value={{
                name: state.customerName,
                phone: state.customerPhone,
                email: state.customerEmail,
              }}
              onChange={(v: DetailsValue) =>
                setState((s) => ({
                  ...s,
                  customerName: v.name,
                  customerPhone: v.phone,
                  customerEmail: v.email,
                }))
              }
              onValidChange={setDetailsValid}
            />
          )}

          {step === 6 && (
            <SummaryStep
              state={state}
              error={submitError}
              submitting={submitting}
              onConfirm={handleConfirm}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={step === 1}
          className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-bone-200/60 transition-colors hover:text-bone-50 disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        {step < 6 && step !== 3 && step !== 4 && (
          <button
            onClick={goNext}
            disabled={!canAdvance}
            className="flex items-center gap-1.5 rounded-full bg-brass-500 px-6 py-3 text-sm font-medium text-ink-950 transition-all hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
