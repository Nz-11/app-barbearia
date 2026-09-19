-- =============================================================================
-- 0002 — Validação de agendamento no banco + permissões de clientes
-- =============================================================================
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).
-- É idempotente (create or replace / drop policy if exists) e NÃO altera nem
-- remove nenhum agendamento existente: só troca a função create_appointment e
-- uma policy de leitura.
--
-- Por que no banco: create_appointment é chamada por RPC e está liberada para
-- `anon`. Qualquer pessoa com a chave pública pode chamá-la direto no
-- PostgREST, sem passar pela API do Next.js. Só uma validação dentro da função
-- (SECURITY DEFINER, que também enxerga blocked_times) protege de verdade.
--
-- Códigos de erro levantados (mensagem da exceção, errcode P0001):
--   INVALID_INPUT   dados obrigatórios ausentes ou grandes demais
--   INVALID_SERVICE serviço inexistente ou inativo
--   INVALID_BARBER  barbeiro inexistente ou inativo
--   PAST_TIME       horário no passado
--   DAY_OFF         barbeiro não trabalha nesse dia da semana
--   OUTSIDE_HOURS   início antes do expediente ou término depois dele
--   INVALID_SLOT    horário fora da grade de 15 min do expediente
--   BREAK_TIME      sobrepõe o intervalo de almoço/descanso
--   BLOCKED_TIME    sobrepõe um bloqueio (folga, compromisso...)
--   SLOT_TAKEN      já existe agendamento no intervalo (constraint de exclusão)
-- =============================================================================

create or replace function public.create_appointment(
  p_barber_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Fuso em que o expediente é interpretado (mesmo de get_available_slots) e
  -- passo da grade de horários (mesmo default de get_available_slots).
  c_tz   constant text := 'America/Sao_Paulo';
  c_step constant int  := 15;

  v_name         text := trim(coalesce(p_customer_name, ''));
  v_phone        text := trim(coalesce(p_customer_phone, ''));
  v_email        text := nullif(trim(coalesce(p_customer_email, '')), '');
  v_duration     int;
  v_end_at       timestamptz;
  v_local_date   date;
  v_wh           record;
  v_shift_start  timestamptz;
  v_shift_end    timestamptz;
  v_customer_id  uuid;
  v_appointment_id uuid;
begin
  -- 1. Entrada ---------------------------------------------------------------
  if p_barber_id is null or p_service_id is null or p_start_at is null
     or v_name = '' or v_phone = ''
     or char_length(v_name) > 120
     or char_length(v_phone) > 30
     or char_length(coalesce(v_email, '')) > 254 then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  -- 2. Serviço e barbeiro ----------------------------------------------------
  select duration_minutes into v_duration from services where id = p_service_id and active;
  if v_duration is null then
    raise exception 'INVALID_SERVICE' using errcode = 'P0001';
  end if;

  if not exists (select 1 from barbers where id = p_barber_id and active) then
    raise exception 'INVALID_BARBER' using errcode = 'P0001';
  end if;

  -- 3. Passado ---------------------------------------------------------------
  if p_start_at <= now() then
    raise exception 'PAST_TIME' using errcode = 'P0001';
  end if;

  v_end_at := p_start_at + make_interval(mins => v_duration);
  v_local_date := (p_start_at at time zone c_tz)::date;

  -- 4. Dia de folga ----------------------------------------------------------
  select * into v_wh
    from working_hours
   where barber_id = p_barber_id
     and weekday = extract(dow from v_local_date)::int
   limit 1;

  if not found then
    raise exception 'DAY_OFF' using errcode = 'P0001';
  end if;

  -- 5. Expediente: início e término (início + duração) dentro do turno ------
  v_shift_start := (v_local_date + v_wh.start_time) at time zone c_tz;
  v_shift_end   := (v_local_date + v_wh.end_time)   at time zone c_tz;

  if p_start_at < v_shift_start or v_end_at > v_shift_end then
    raise exception 'OUTSIDE_HOURS' using errcode = 'P0001';
  end if;

  -- 6. Grade de horários (só aceita o que get_available_slots ofereceria) ---
  if mod(extract(epoch from (p_start_at - v_shift_start))::numeric, c_step * 60) <> 0 then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;

  -- 7. Intervalo de almoço/descanso -----------------------------------------
  if v_wh.break_start is not null and v_wh.break_end is not null
     and tstzrange(p_start_at, v_end_at) && tstzrange(
           (v_local_date + v_wh.break_start) at time zone c_tz,
           (v_local_date + v_wh.break_end)   at time zone c_tz
         ) then
    raise exception 'BREAK_TIME' using errcode = 'P0001';
  end if;

  -- 8. Bloqueios pontuais ----------------------------------------------------
  if exists (
    select 1 from blocked_times bt
     where bt.barber_id = p_barber_id
       and tstzrange(bt.start_at, bt.end_at) && tstzrange(p_start_at, v_end_at)
  ) then
    raise exception 'BLOCKED_TIME' using errcode = 'P0001';
  end if;

  -- 9. Cliente + agendamento -------------------------------------------------
  -- A constraint de exclusão em `appointments` continua sendo a última linha
  -- de defesa contra duas reservas simultâneas no mesmo intervalo.
  insert into customers (name, phone, email)
  values (v_name, v_phone, v_email)
  on conflict (phone) do update
    set name = excluded.name,
        email = coalesce(excluded.email, customers.email)
  returning id into v_customer_id;

  insert into appointments (barber_id, service_id, customer_id, start_at, end_at, status)
  values (p_barber_id, p_service_id, v_customer_id, p_start_at, v_end_at, 'pending')
  returning id into v_appointment_id;

  return v_appointment_id;
exception
  when exclusion_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
end;
$$;

grant execute on function public.create_appointment(uuid, uuid, timestamptz, text, text, text)
  to anon, authenticated;

-- =============================================================================
-- Permissões: barbeiro só enxerga os PRÓPRIOS clientes
-- =============================================================================
-- Antes: qualquer barbeiro autenticado lia TODOS os clientes (nome, telefone,
-- e-mail). Agora: admin lê todos; barbeiro lê apenas quem tem agendamento com
-- ele. (A própria RLS de appointments já restringe o subselect ao barbeiro.)
drop policy if exists "customers_staff_read" on public.customers;
create policy "customers_staff_read" on public.customers for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.appointments a
       where a.customer_id = customers.id
         and a.barber_id = public.current_barber_id()
    )
  );
