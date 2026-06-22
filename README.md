# InstaladorPro

App mobile para instaladores gerenciarem suas instalações, empresas contratantes e recebimentos.

**Stack:** React Native (Expo) · Supabase · Zustand · React Query · MMKV · Zod

---

## Sumário

- [Visão geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de dados](#banco-de-dados)
- [Arquitetura](#arquitetura)
- [Módulos](#módulos)
- [Convenção de commits](#convenção-de-commits)
- [Testes](#testes)
- [Segurança](#segurança)
- [Deploy](#deploy)
- [Roadmap](#roadmap)

---

## Visão geral

O InstaladorPro resolve três problemas do instalador autônomo:

- **Instalações** — cadastro, acompanhamento de status e histórico de cada serviço
- **Empresas** — registro das empresas contratantes com dados de contato
- **Financeiro** — controle de recebimentos, pendências e resumo mensal

Cada instalador vê apenas seus próprios dados. A segurança é garantida por Row Level Security (RLS) no banco, não por lógica no app.

---

## Pré-requisitos

- Node.js 18+
- npm 9+ ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com) (gratuita)
- Android Studio ou Xcode (para emuladores nativos)

---

## Configuração do ambiente

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/instalador-pro.git
cd instalador-pro
npm install
```

### 2. Configurar o Supabase

Crie um projeto em [supabase.com](https://supabase.com) e execute as migrations em ordem no SQL Editor:

```bash
# Ordem de execução obrigatória
supabase/migrations/001_tables.sql
supabase/migrations/002_rls.sql
supabase/migrations/003_indexes.sql
supabase/migrations/004_functions.sql
```

### 3. Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

> ⚠️ **Nunca commitar `.env.local`.** O arquivo já está no `.gitignore`.

### 4. Configurações de segurança no Supabase

Antes de qualquer teste com usuários reais:

1. **Rate limiting** → Authentication → Rate Limits → habilitar proteções padrão
2. **Bucket de fotos** → Executar SQL de `002_rls.sql` para criar bucket privado
3. **Edge Functions** → Verificar JWT em cada função antes do deploy

### 5. Rodar o app

```bash
# Expo Go (recomendado para desenvolvimento)
npx expo start

# Android nativo
npx expo run:android

# iOS nativo
npx expo run:ios
```

---

## Estrutura do projeto

```
instalador-pro/
├── app/                        # Rotas (Expo Router)
│   ├── (auth)/                 # Telas sem autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                 # Tabs principais
│   │   ├── index.tsx           # Dashboard
│   │   ├── instalacoes.tsx
│   │   ├── empresas.tsx
│   │   └── financeiro.tsx
│   ├── instalacao/
│   │   ├── [id].tsx            # Detalhe
│   │   └── nova.tsx
│   └── _layout.tsx             # Root layout — gerencia sessão
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Button, Input, Card, Badge
│   │   ├── instalacoes/        # InstalacaoCard, StatusBadge
│   │   └── financeiro/         # ResumoMensal, GraficoBarras
│   ├── hooks/                  # React hooks com React Query
│   │   ├── useInstalacoes.ts
│   │   ├── useEmpresas.ts
│   │   ├── useFinanceiro.ts
│   │   └── useAuth.ts
│   ├── services/               # Camada de acesso a dados
│   │   ├── supabase.ts         # Cliente singleton com MMKV
│   │   ├── auth.service.ts
│   │   ├── instalacoes.service.ts
│   │   ├── empresas.service.ts
│   │   ├── recebimentos.service.ts
│   │   └── storage.service.ts
│   ├── store/                  # Estado global (Zustand)
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   ├── types/
│   │   └── index.ts            # Interfaces e tipos de domínio
│   └── utils/
│       ├── formatters.ts       # formatCurrency, formatDate, formatStatus
│       ├── validators.ts       # Schemas Zod
│       └── errors.ts           # getAuthError, getErrorMessage
├── supabase/
│   ├── migrations/             # SQL versionado
│   └── functions/              # Edge Functions (Node.js/Deno)
│       ├── gerar-relatorio/
│       └── notificar-pendencias/
├── .env.example                # Template — copiar para .env.local
├── .gitignore
├── app.json
├── jest.config.js
└── package.json
```

---

## Banco de dados

### Tabelas

| Tabela | Descrição | RLS |
|---|---|---|
| `instaladores` | Perfil do instalador, ligado ao auth.users | ✓ |
| `empresas` | Empresas contratantes por instalador | ✓ |
| `instalacoes` | Registros de serviços com status e valor | ✓ |
| `recebimentos` | Pagamentos vinculados a instalações | ✓ |
| `fotos_instalacao` | Caminhos no Storage por instalação | ✓ |
| `historico_status` | Auditoria automática de mudanças de status | ✓ |

### Enums

```sql
-- Status do ciclo de vida da instalação
type status_instalacao: 'agendada' | 'em_andamento' | 'concluida' | 'paga' | 'cancelada'

-- Formas de pagamento aceitas
type forma_pagamento: 'pix' | 'dinheiro' | 'transferencia' | 'boleto' | 'cartao'
```

### Triggers automáticos

- `trg_instalacoes_updated_at` — atualiza `updated_at` em qualquer edição
- `trg_historico_status` — registra toda mudança de status sem código no app
- `trg_novo_usuario` — cria perfil em `instaladores` após signup no Auth

### Views úteis

```sql
-- Resumo financeiro por mês do instalador logado
SELECT * FROM resumo_financeiro_mensal;

-- Instalações concluídas sem pagamento total
SELECT * FROM instalacoes_pendentes;
```

---

## Arquitetura

### Camadas

```
Telas (app/)
    ↓ apenas lê estado / dispara actions
Hooks (src/hooks/) — React Query cache + invalidação
    ↓ chama services
Services (src/services/) — única camada que fala com Supabase
    ↓ usa
Supabase (PostgreSQL + Auth + Storage + Edge Functions)
```

**Regra de ouro:** nenhuma tela importa `supabase` diretamente. Todo acesso ao banco passa por `src/services/`.

### Estado

- **Zustand** (`src/store/`) — estado global leve: sessão, filtros de UI
- **React Query** (`src/hooks/`) — cache de dados do servidor, loading/error states, invalidação
- **MMKV** — persistência da sessão Supabase no device (AES-256)

### Segurança

- **RLS** em todas as tabelas — isolamento por `instalador_id` no banco
- **Função helper** `meu_instalador_id()` usada em todas as policies
- **Bucket privado** — fotos acessíveis apenas por URL assinada (1h de expiração)
- **JWT obrigatório** em todas as Edge Functions

---

## Módulos

### Autenticação

Gerenciada pelo `root _layout.tsx`. Fluxo:

1. App inicia → `getSession()` verifica MMKV
2. Sessão válida → redireciona para `/(tabs)`
3. Sem sessão → redireciona para `/(auth)/login`
4. `onAuthStateChange` monitora mudanças em tempo real

### Instalações

Status e transições válidas:

```
agendada → em_andamento → concluida → paga
    ↓                          ↓
cancelada                  cancelada
```

Toda transição é registrada automaticamente em `historico_status`.

### Financeiro

- Recebimentos são vinculados a uma instalação específica
- `saldo_pendente = valor_combinado - SUM(recebimentos.valor)`
- Instalação some de `instalacoes_pendentes` quando `saldo_pendente = 0`
- Edge Function `notificar-pendencias` roda como cron para alertar pagamentos em atraso

---

## Convenção de commits

Formato: `tipo(escopo): descrição imperativa em português`

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Setup, config, dependências |
| `docs` | Documentação |
| `refactor` | Reestruturação sem nova feature |
| `test` | Testes |
| `perf` | Performance |

Exemplos:
```bash
feat(auth): implementa tela de login
fix(instalacoes): corrige filtro por status em_andamento
chore(deps): atualiza supabase-js para 2.44.0
```

### Branches

| Branch | Uso |
|---|---|
| `main` | Produção — nunca commitar direto |
| `develop` | Integração de features |
| `feature/*` | Desenvolvimento de funcionalidades |
| `fix/*` | Hotfixes urgentes |

---

## Testes

### Configuração

```bash
# Instalar dependências de teste
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native

# Rodar testes
npx jest

# Com cobertura
npx jest --coverage

# Modo watch
npx jest --watch
```

### Cobertura mínima configurada

- Branches: 70%
- Functions: 80%
- Lines: 80%

### Estrutura de testes

```
src/__tests__/
├── utils/
│   ├── formatters.test.ts      # Testes unitários puros
│   └── validators.test.ts
├── store/
│   └── auth.store.test.ts
└── services/
    ├── auth.service.test.ts    # Testes de integração com mock
    └── instalacoes.service.test.ts
```

---

## Segurança

### Score: 8.2/10

| Área | Status |
|---|---|
| RLS em todas as tabelas | ✓ Ativo |
| Sessão criptografada (MMKV) | ✓ AES-256 |
| Prepared statements | ✓ Supabase JS |
| Rate limiting no login | ⚠️ Configurar no painel |
| Bucket de fotos privado | ⚠️ Executar SQL |
| JWT nas Edge Functions | ⚠️ Implementar |
| Auditoria de dependências | Rodar `npm audit` antes de releases |

Referência completa: ver relatório do `/agent security` no histórico da conversa.

---

## Deploy

### Build para testes (EAS Build)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure

# Build Android (APK para testes internos)
eas build --platform android --profile preview

# Build iOS (TestFlight)
eas build --platform ios --profile preview
```

### Variáveis de ambiente no EAS

Configure no `eas.json` ou pelo painel do Expo:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ..."
      }
    }
  }
}
```

### Checklist pré-release

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx jest --coverage` passando (≥80%)
- [ ] `npm audit --audit-level=high` limpo
- [ ] Rate limiting configurado no Supabase
- [ ] Bucket de fotos privado com policy
- [ ] JWT validado em todas as Edge Functions
- [ ] Sentry configurado para captura de erros

---

## Roadmap

### v1.0 — MVP (Sprint 1–4)
- [x] Autenticação completa
- [x] CRUD de instalações e empresas
- [x] Controle de recebimentos
- [x] Dashboard financeiro
- [ ] Notificações push
- [ ] Modo offline básico

### v1.1 — Pós-lançamento
- [ ] Exclusão de conta (LGPD)
- [ ] Exportação de relatório em PDF
- [ ] Widget de instalações do dia
- [ ] Integração com Google Maps para endereços

### v2.0 — Futuro
- [ ] Multi-instalador (equipes pequenas)
- [ ] Assinatura digital de ordens de serviço
- [ ] Integração com nota fiscal eletrônica

---

## Licença

Privado — todos os direitos reservados.
