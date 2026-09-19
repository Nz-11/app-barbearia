import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Instante ISO com fuso explícito (Z ou ±hh:mm). Sem fuso a data seria
// interpretada no fuso do servidor, o que é ambíguo.
const ISO_WITH_TZ_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Erros levantados por public.create_appointment (ver migration 0002). A
 * validação de verdade — expediente, almoço, folga, bloqueios, passado,
 * duração — mora no banco, porque a função também pode ser chamada direto via
 * PostgREST sem passar por esta rota. Aqui só traduzimos para o cliente.
 */
const BOOKING_ERRORS: Record<string, { status: number; message: string }> = {
  SLOT_TAKEN: { status: 409, message: "Esse horário acabou de ser reservado. Escolha outro horário." },
  PAST_TIME: { status: 422, message: "Esse horário já passou. Escolha outro horário." },
  DAY_OFF: { status: 422, message: "O barbeiro não atende neste dia. Escolha outra data." },
  OUTSIDE_HOURS: {
    status: 422,
    message: "Esse horário está fora do expediente ou o serviço não termina a tempo. Escolha outro horário.",
  },
  BREAK_TIME: { status: 422, message: "Esse horário coincide com o intervalo do barbeiro. Escolha outro horário." },
  BLOCKED_TIME: { status: 422, message: "O barbeiro está indisponível nesse horário. Escolha outro horário." },
  INVALID_SLOT: { status: 422, message: "Horário inválido. Escolha um dos horários disponíveis." },
  INVALID_SERVICE: { status: 422, message: "Esse serviço não está disponível. Escolha outro serviço." },
  INVALID_BARBER: { status: 422, message: "Esse barbeiro não está disponível. Escolha outro barbeiro." },
  INVALID_INPUT: { status: 400, message: "Dados inválidos. Confira seu nome e telefone." },
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Requisição inválida.");
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return badRequest("Requisição inválida.");
  }

  const body = raw as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const barberId = text(body.barberId);
  const serviceId = text(body.serviceId);
  const startAt = text(body.startAt);
  const customerName = text(body.customerName);
  const customerPhone = text(body.customerPhone);
  const customerEmail = text(body.customerEmail);

  if (!barberId || !serviceId || !startAt || !customerName || !customerPhone) {
    return badRequest("Preencha todos os campos obrigatórios.");
  }
  if (!UUID_RE.test(barberId) || !UUID_RE.test(serviceId)) {
    return badRequest("Barbeiro ou serviço inválido.");
  }
  if (!ISO_WITH_TZ_RE.test(startAt) || Number.isNaN(Date.parse(startAt))) {
    return badRequest("Horário inválido.");
  }
  if (customerName.length < 3 || customerName.length > 120) {
    return badRequest("Informe seu nome completo.");
  }
  const phoneDigits = customerPhone.replace(/\D/g, "").length;
  if (customerPhone.length > 30 || phoneDigits < 10 || phoneDigits > 13) {
    return badRequest("Informe um telefone válido com DDD.");
  }
  if (customerEmail && (customerEmail.length > 254 || !EMAIL_RE.test(customerEmail))) {
    return badRequest("E-mail inválido.");
  }

  const start = new Date(startAt);
  // Checagem barata antes de ir ao banco (o banco também rejeita o passado).
  if (start.getTime() <= Date.now()) {
    return badRequest(BOOKING_ERRORS.PAST_TIME.message, BOOKING_ERRORS.PAST_TIME.status);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_barber_id: barberId,
    p_service_id: serviceId,
    p_start_at: start.toISOString(),
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || null,
  });

  if (error) {
    const code =
      error.code === "23P01" /* exclusion_violation */
        ? "SLOT_TAKEN"
        : Object.keys(BOOKING_ERRORS).find((k) => error.message?.includes(k));

    if (code) {
      const { status, message } = BOOKING_ERRORS[code];
      return badRequest(message, status);
    }

    console.error("create_appointment rpc error", error);
    return badRequest("Não foi possível concluir o agendamento. Tente novamente.", 500);
  }

  return NextResponse.json({ appointmentId: data }, { status: 201 });
}
