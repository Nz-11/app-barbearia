import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!barberId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Parâmetros barberId, serviceId e date são obrigatórios." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_barber_id: barberId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) {
    console.error("availability rpc error", error);
    return NextResponse.json({ error: "Não foi possível carregar os horários." }, { status: 500 });
  }

  const slots = (data ?? []).map((row: { slot_start: string }) => row.slot_start);
  return NextResponse.json({ slots });
}
