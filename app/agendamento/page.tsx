import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Agendamento",
  description: "Agende seu horário na barbearia em poucos passos.",
};

export default function AgendamentoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink-950 pt-16 sm:pt-20">
        <Suspense fallback={null}>
          <BookingWizard />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
