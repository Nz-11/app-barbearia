-- =============================================================================
-- Dados de demonstração (EXEMPLO) — rode manualmente após criar o schema.
-- Substitua pelos serviços/barbeiros reais pelo painel admin depois.
-- =============================================================================

insert into public.services (name, description, duration_minutes, price_cents, active) values
  ('Corte Masculino', 'Corte moderno com acabamento na navalha.', 45, 4000, true),
  ('Barba', 'Modelagem e hidratação completa da barba.', 30, 3000, true),
  ('Corte + Barba', 'Combo completo de corte e barba.', 60, 6500, true),
  ('Platinado', 'Descoloração e tonalização completa.', 120, 15000, true)
on conflict do nothing;

-- Barbeiros de demonstração (sem profile_id — vincule depois de criar o
-- usuário Auth correspondente pelo painel admin).
insert into public.barbers (name, bio, specialties, active) values
  ('Carlos Mendes', 'Barbeiro clássico, especialista em navalha.', array['Corte clássico', 'Barba'], true),
  ('Rafael Souza', 'Especialista em cortes modernos e degradê.', array['Degradê', 'Platinado'], true)
on conflict do nothing;

-- Expediente padrão (seg-sex 09:00-18:00, intervalo 12:00-13:00; sáb 09:00-15:00)
-- para cada barbeiro de demonstração acima.
do $$
declare
  b record;
begin
  for b in select id from public.barbers loop
    insert into public.working_hours (barber_id, weekday, start_time, end_time, break_start, break_end)
    values
      (b.id, 1, '09:00', '18:00', '12:00', '13:00'),
      (b.id, 2, '09:00', '18:00', '12:00', '13:00'),
      (b.id, 3, '09:00', '18:00', '12:00', '13:00'),
      (b.id, 4, '09:00', '18:00', '12:00', '13:00'),
      (b.id, 5, '09:00', '18:00', '12:00', '13:00'),
      (b.id, 6, '09:00', '15:00', null, null)
    on conflict (barber_id, weekday) do nothing;
  end loop;
end $$;
