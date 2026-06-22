# Instalador Pro

Plataforma SaaS multi-empresa para gestão de instalações de energia solar.

## Stack

- **Web**: Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- **Mobile**: Expo/React Native (planejado, em `apps/mobile`)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Monorepo**: Turborepo com workspaces npm
- **State**: Zustand (auth/UI) + React Query (server state)
- **Forms**: React Hook Form + Zod
- **Monitoring**: Sentry
- **Hosting**: Vercel (web), Supabase (backend)

## Estrutura

```
apps/web/          → Next.js web app
apps/mobile/       → Expo mobile app (futuro)
packages/shared/   → Types, validações Zod, formatters, errors
packages/ui/       → Design system tokens (cores, spacing)
supabase/          → Migrations SQL e seed data
_legacy/           → Código do MVP anterior (referência)
```

## Arquitetura Multi-Tenant

Toda tabela de dados tem `organization_id`. RLS policies filtram por org via `get_user_org_ids()`.

Roles: `owner`, `admin`, `tecnico`, `financeiro`.

## Comandos

```bash
npm install          # Instalar dependências (root)
npm run dev          # Dev server (turborepo)
cd apps/web && npm run dev   # Dev server web only
npm run build        # Build produção
npm run typecheck    # Verificar tipos
npm run lint         # ESLint
```

## Variáveis de Ambiente

Copie `apps/web/.env.example` para `apps/web/.env.local` e preencha com seus dados do Supabase.

## Banco de Dados

Migrations em `supabase/migrations/` (001-007). Rodar na ordem via Supabase Dashboard ou CLI.

## Convenções

- Componentes em `src/components/ui/` — design system próprio
- Services em `src/services/` — toda comunicação com Supabase
- Hooks em `src/hooks/` — React Query com cache por org
- Páginas em `src/app/(dashboard)/` — roteamento por grupo
- Texto da UI sempre em português (pt-BR)
- Sem `any` no TypeScript
