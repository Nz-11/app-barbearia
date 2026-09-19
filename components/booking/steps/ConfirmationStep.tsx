import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { BookingState } from "@/lib/types/booking";
import { siteConfig } from "@/lib/config/site";

export function ConfirmationStep({ state }: { state: BookingState }) {
  const slotDate = state.slot ? new Date(state.slot) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
      >
        <CheckCircle2 className="h-9 w-9 text-emerald-400" />
      </motion.div>

      <h2 className="mt-6 font-display text-2xl text-bone-50 sm:text-3xl">
        Agendamento confirmado!
      </h2>
      <p className="mt-2 text-sm text-bone-200/70">
        Enviamos os detalhes para o seu contato. Aguardamos você em {siteConfig.name}.
      </p>

      {slotDate && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/50 p-5 text-sm">
          <p className="text-bone-50">{state.service?.name}</p>
          <p className="mt-1 text-bone-200/60">
            {slotDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}{" "}
            às {slotDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-bone-200/60">com {state.barber?.name}</p>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-full border border-white/15 px-6 py-3 text-sm text-bone-100 hover:border-brass-400 hover:text-brass-400"
      >
        Voltar ao início
      </Link>
    </motion.div>
  );
}
