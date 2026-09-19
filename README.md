# Barbearia Premium

Site + sistema de agendamento completo para uma barbearia premium, construído com Next.js (App
Router), TypeScript, Tailwind CSS, Framer Motion e Supabase (banco de dados, autenticação e RLS).

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** para estilo
- **Framer Motion** para animações
- **Supabase** — Postgres, Auth, Row Level Security
- **Lucide React** para ícones

## Estrutura do projeto

```
app/
  page.tsx                 # Home (Hero, Serviços, Barbeiros, Galeria, Sobre, Avaliações, Contato)
  agendamento/              # Wizard de agendamento (público)
  admin/
    login/                  # Login (fora do guard de autenticação)
    (dashboard)/            # Área autenticada (guard no layout.tsx)
      page.tsx              # Dashboard
      agenda/               # Visualização dia/semana
      agendamentos/         # Lista de agendamentos com filtros
      clientes/              # Lista de clientes
      barbeiros/             # CRUD de barbeiros (admin)
      servicos/              # CRUD de serviços (admin)
      horarios/              # Expediente + bloqueios
      configuracoes/         # Dados da barbearia (admin)
  api/
    availability/            # GET horários disponíveis (RPC get_available_slots)
    appointments/            # POST criar agendamento (RPC create_appointment)
components/
  hero/ScrollVideoHero.tsx   # Vídeo sincronizado ao scroll
  layout/                    # Header, Footer
  sections/                  # Seções da home
  booking/                   # Wizard de agendamento (6 passos)
  admin/                     # Sidebar, tabelas, formulários do painel
  ui/                         # Componentes genéricos (Modal, Reveal, Avatar, etc.)
hooks/                       # useScrollVideo, useScrolled
lib/
  config/site.ts             # Config central (nome, contato, endereço, horários, stats)
  supabase/                  # Clients (browser, server, admin, middleware)
  data/                      # Leitura de dados (público e admin)
  actions/                   # Server Actions (mutações: services, barbers, schedule, settings)
  auth/session.ts            # Sessão + perfil do usuário autenticado
  types/                     # Tipos de banco e do domínio de agendamento
supabase/
  migrations/0001_init.sql   # Schema completo + RLS + funções
  seed.sql                   # Dados de demonstração (opcional)
public/videos/barbearia-hero.mp4
```

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql` (schema, RLS,
   funções e a constraint que impede dupla-reserva).
3. (Opcional) Rode `supabase/seed.sql` para popular serviços e barbeiros de demonstração.
4. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha no frontend)

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Onde usar | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Chave pública (respeita RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **somente server** | Usada em `lib/supabase/admin.ts`, apenas para convidar barbeiros por e-mail (Server Action `createBarber`). Nunca é enviada ao navegador. |
| `NEXT_PUBLIC_SITE_URL` | metadata/SEO | URL pública do site (ex.: `https://barbearia.vercel.app`) |

## 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 5. Criar o primeiro administrador

Não existe senha de admin no código — o primeiro acesso é feito manualmente pelo Supabase:

1. No painel do Supabase, vá em **Authentication → Users → Add user** e crie um usuário com
   e-mail/senha (isso cria automaticamente uma linha em `public.profiles` com `role = 'barber'`,
   via trigger).
2. No **SQL Editor**, promova esse usuário a admin:

   ```sql
   update public.profiles set role = 'admin' where id =
     (select id from auth.users where email = 'seu-email@exemplo.com');
   ```

3. Acesse `/admin/login` no site e entre com esse e-mail/senha.

A partir daí, o admin pode criar outros barbeiros pelo painel (`/admin/barbeiros`), com opção de
enviar convite de acesso por e-mail (usa `SUPABASE_SERVICE_ROLE_KEY` no servidor).

## 6. Vídeo do Hero

O vídeo já está em `public/videos/barbearia-hero.mp4`. Para trocar, basta substituir esse arquivo
mantendo o mesmo nome/caminho — o componente `components/hero/ScrollVideoHero.tsx` sincroniza o
`currentTime` do vídeo ao progresso do scroll via `requestAnimationFrame`, com fallback automático
(autoplay em loop) caso o navegador não suporte a técnica ou o usuário tenha `prefers-reduced-motion`
ativado.

## 7. Personalização

- **Nome, contato, endereço, horários, redes sociais**: `lib/config/site.ts`.
- **Galeria**: `lib/config/gallery.ts` (adicione `src` apontando para `/public/images/gallery/...`).
- **Avaliações**: `lib/config/testimonials.ts` (dados de exemplo — marcados como tal no arquivo).
- **Serviços e barbeiros**: gerenciados pelo painel admin (`/admin/servicos`, `/admin/barbeiros`),
  vindos do banco de dados — nunca hardcoded.

> Observação: a página `/admin/configuracoes` grava os dados de contato na tabela `site_settings`
> para referência futura, mas as seções públicas do site hoje leem de `lib/config/site.ts` (mais
> simples e compatível com geração estática). Integrar as seções públicas diretamente com
> `site_settings` é um próximo passo natural, se desejado.

## 8. Como funciona o sistema de agendamento

- Fluxo público em 6 passos (`/agendamento`): serviço → barbeiro → data → horário → dados → confirmação.
- Disponibilidade calculada pela função Postgres `get_available_slots` (considera expediente,
  intervalo, bloqueios e agendamentos existentes) — chamada via RPC, sem expor dados de clientes.
- Criação do agendamento pela função `create_appointment` (SECURITY DEFINER), que cria/reaproveita
  o cliente pelo telefone e insere o agendamento.
- **Proteção contra dupla-reserva**: a tabela `appointments` tem uma *exclusion constraint*
  (`EXCLUDE USING gist`) que impede, no nível do banco, dois agendamentos sobrepostos para o mesmo
  barbeiro — mesmo sob concorrência real. Se duas pessoas tentarem reservar o mesmo horário ao
  mesmo tempo, apenas uma consegue; a outra recebe a mensagem "Esse horário acabou de ser
  reservado. Escolha outro horário." (tratado em `app/api/appointments/route.ts`).

## 9. Autorização (RLS)

Toda a autorização é reforçada no banco via Row Level Security (não apenas escondendo botões no
frontend):

- **Admin**: acesso total a agendamentos, clientes, barbeiros, serviços, horários e configurações.
- **Barbeiro**: só enxerga/edita os próprios agendamentos e bloqueios; não altera configurações
  administrativas, serviços ou outros barbeiros (bloqueado pelas policies em
  `supabase/migrations/0001_init.sql`, não apenas pela UI).
- **Público/anônimo**: não tem acesso direto a nenhuma tabela sensível — toda leitura de
  disponibilidade e criação de agendamento passa pelas funções RPC `get_available_slots` /
  `create_appointment`.

## 10. Subir para o GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

`.env.local` já está no `.gitignore` — não será commitado.

## 11. Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SITE_URL` apontando para o domínio final da Vercel).
3. Deploy. O vídeo do Hero (`public/videos/barbearia-hero.mp4`) é servido como asset estático —
   se o arquivo for muito grande, considere hospedá-lo em um CDN/bucket e apontar o `src` do
   `<video>` para essa URL.

## O que depende de configuração manual

- Criar o projeto Supabase e rodar a migration/seed (passo 2).
- Criar o primeiro usuário admin (passo 5).
- Preencher os dados reais da barbearia em `lib/config/site.ts` (endereço, telefone, Instagram,
  horários — hoje preenchidos com placeholders claramente identificados).
- Substituir as imagens placeholder da galeria por fotos reais (`lib/config/gallery.ts`).
- Definir as variáveis de ambiente na Vercel antes do primeiro deploy.
