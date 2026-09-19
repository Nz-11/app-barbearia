-- =============================================================================
-- Barbearia Premium — Schema inicial
-- =============================================================================
-- Extensões necessárias
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "btree_gist";     -- exclusion constraint em appointments

-- =============================================================================
-- ENUMS
-- =============================================================================
do $$ begin
  create type user_role as enum ('admin', 'barber');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- TABELAS
-- =============================================================================

-- Perfis: 1:1 com auth.users. Define o papel (admin | barber).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'barber',
  created_at timestamptz not null default now()
);

-- Configurações gerais da barbearia (linha única, editável pelo admin)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Barbearia Nobre',
  phone text,
  whatsapp text,
  email text,
  instagram_url text,
  address text,
  maps_url text,
  hours jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Barbeiros
create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  photo_url text,
  bio text,
  specialties text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Serviços (fonte única de verdade para nome/preço/duração)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Horário fixo de trabalho por barbeiro/dia da semana (0=domingo .. 6=sábado)
create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  break_start time,
  break_end time,
  unique (barber_id, weekday)
);

-- Bloqueios pontuais (folga, compromisso, dia todo, etc.)
create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  reason text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index if not exists blocked_times_barber_range_idx on public.blocked_times (barber_id, start_at, end_at);

-- Clientes (capturados no momento do agendamento)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (phone)
);

-- Agendamentos
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  customer_id uuid not null references public.customers (id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  status appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Proteção real contra dupla-reserva: nenhum outro agendamento não-cancelado
  -- do mesmo barbeiro pode ter um intervalo de tempo sobreposto.
  exclude using gist (
    barber_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status <> 'cancelled')
);
create index if not exists appointments_barber_start_idx on public.appointments (barber_id, start_at);
create index if not exists appointments_start_idx on public.appointments (start_at);
create index if not exists appointments_customer_idx on public.appointments (customer_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Cria automaticamente um profile (role=barber por padrão) quando um novo
-- usuário se cadastra no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'barber'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- HELPERS
-- =============================================================================

create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.current_barber_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.barbers where profile_id = auth.uid();
$$;

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.blocked_times enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;

-- profiles ---------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_insert" on public.profiles for insert
  with check (public.is_admin());

-- site_settings ------------------------------------------------------------
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for update using (public.is_admin());

-- barbers ------------------------------------------------------------------
create policy "barbers_public_read_active" on public.barbers for select
  using (active or public.is_admin() or profile_id = auth.uid());
create policy "barbers_admin_write" on public.barbers for insert with check (public.is_admin());
create policy "barbers_admin_update" on public.barbers for update
  using (public.is_admin() or profile_id = auth.uid())
  with check (public.is_admin() or profile_id = auth.uid());
create policy "barbers_admin_delete" on public.barbers for delete using (public.is_admin());

-- services -------------------------------------------------------------------
create policy "services_public_read_active" on public.services for select
  using (active or public.is_admin());
create policy "services_admin_write" on public.services for insert with check (public.is_admin());
create policy "services_admin_update" on public.services for update using (public.is_admin());
create policy "services_admin_delete" on public.services for delete using (public.is_admin());

-- working_hours ----------------------------------------------------------
create policy "working_hours_public_read" on public.working_hours for select using (true);
create policy "working_hours_admin_write" on public.working_hours for insert with check (public.is_admin());
create policy "working_hours_admin_update" on public.working_hours for update using (public.is_admin());
create policy "working_hours_admin_delete" on public.working_hours for delete using (public.is_admin());

-- blocked_times ------------------------------------------------------------
create policy "blocked_times_read" on public.blocked_times for select
  using (public.is_admin() or barber_id = public.current_barber_id());
create policy "blocked_times_insert" on public.blocked_times for insert
  with check (public.is_admin() or barber_id = public.current_barber_id());
create policy "blocked_times_delete" on public.blocked_times for delete
  using (public.is_admin() or barber_id = public.current_barber_id());

-- customers ------------------------------------------------------------------
-- Nenhum acesso anônimo direto. Criação/leitura pública passa pela função
-- SECURITY DEFINER create_appointment(). Admin/barbeiro autenticados podem ler.
create policy "customers_staff_read" on public.customers for select
  using (public.is_admin() or public.current_role() = 'barber');
create policy "customers_admin_write" on public.customers for update using (public.is_admin());

-- appointments -----------------------------------------------------------
-- Sem policy de INSERT para anon/authenticated: toda criação passa pela
-- função SECURITY DEFINER public.create_appointment(), chamada via RPC.
create policy "appointments_staff_read" on public.appointments for select
  using (public.is_admin() or barber_id = public.current_barber_id());
create policy "appointments_staff_update" on public.appointments for update
  using (public.is_admin() or barber_id = public.current_barber_id())
  with check (public.is_admin() or barber_id = public.current_barber_id());
create policy "appointments_admin_delete" on public.appointments for delete using (public.is_admin());

-- =============================================================================
-- FUNÇÕES DE NEGÓCIO (SECURITY DEFINER) — chamadas via RPC pelo frontend
-- =============================================================================

-- Retorna os horários de início disponíveis (em UTC) para um barbeiro,
-- serviço e data, considerando expediente, intervalo, bloqueios e
-- agendamentos existentes. Não expõe nenhum dado de cliente.
-- Observação: o expediente é interpretado no fuso horário 'America/Sao_Paulo'.
-- Se a barbearia operar em outro fuso, ajuste as duas ocorrências abaixo.
create or replace function public.get_available_slots(
  p_barber_id uuid,
  p_service_id uuid,
  p_date date,
  p_slot_step_minutes int default 15
)
returns table (slot_start timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_duration int;
  v_weekday int;
  v_wh record;
  v_cursor timestamptz;
  v_slot_end timestamptz;
  v_day_start timestamptz;
  v_day_end timestamptz;
begin
  select duration_minutes into v_duration from services where id = p_service_id and active;
  if v_duration is null then
    return;
  end if;

  v_weekday := extract(dow from p_date);

  select * into v_wh from working_hours
    where barber_id = p_barber_id and weekday = v_weekday
    limit 1;

  if v_wh is null then
    return; -- barbeiro não trabalha nesse dia
  end if;

  v_day_start := (p_date::text || ' ' || v_wh.start_time::text)::timestamp at time zone 'America/Sao_Paulo';
  v_day_end := (p_date::text || ' ' || v_wh.end_time::text)::timestamp at time zone 'America/Sao_Paulo';

  v_cursor := v_day_start;
  while v_cursor + (v_duration || ' minutes')::interval <= v_day_end loop
    v_slot_end := v_cursor + (v_duration || ' minutes')::interval;

    if not (
      -- não pode cruzar o intervalo de almoço/descanso do barbeiro
      v_wh.break_start is not null and v_wh.break_end is not null and
      tstzrange(v_cursor, v_slot_end) && tstzrange(
        (p_date::text || ' ' || v_wh.break_start::text)::timestamp at time zone 'America/Sao_Paulo',
        (p_date::text || ' ' || v_wh.break_end::text)::timestamp at time zone 'America/Sao_Paulo'
      )
    ) and not exists (
      -- não pode conflitar com bloqueios
      select 1 from blocked_times bt
      where bt.barber_id = p_barber_id
        and tstzrange(bt.start_at, bt.end_at) && tstzrange(v_cursor, v_slot_end)
    ) and not exists (
      -- não pode conflitar com agendamentos existentes
      select 1 from appointments ap
      where ap.barber_id = p_barber_id
        and ap.status <> 'cancelled'
        and tstzrange(ap.start_at, ap.end_at) && tstzrange(v_cursor, v_slot_end)
    ) and v_cursor > now() then
      slot_start := v_cursor;
      return next;
    end if;

    v_cursor := v_cursor + (p_slot_step_minutes || ' minutes')::interval;
  end loop;

  return;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date, int) to anon, authenticated;

-- Cria (ou reaproveita) o cliente pelo telefone e insere o agendamento.
-- A constraint de exclusão em `appointments` é a última linha de defesa
-- contra corrida entre duas reservas simultâneas: se o horário já foi
-- ocupado entre a checagem de disponibilidade e este insert, o banco
-- rejeita com exclusion_violation e a API traduz para uma mensagem amigável.
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
  v_duration int;
  v_end_at timestamptz;
  v_customer_id uuid;
  v_appointment_id uuid;
begin
  select duration_minutes into v_duration from services where id = p_service_id and active;
  if v_duration is null then
    raise exception 'Serviço inválido ou inativo' using errcode = 'P0001';
  end if;

  v_end_at := p_start_at + (v_duration || ' minutes')::interval;

  insert into customers (name, phone, email)
  values (trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_email), ''))
  on conflict (phone) do update set name = excluded.name, email = coalesce(excluded.email, customers.email)
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

grant execute on function public.create_appointment(uuid, uuid, timestamptz, text, text, text) to anon, authenticated;
