# ⚡ Instalador Pro

Plataforma completa para empresas de instalação de energia solar. Gerencie instalações, clientes, equipes, estoque, documentos e finanças em um só lugar.

## Funcionalidades

- **Dashboard** — KPIs em tempo real, gráficos de status e receita
- **Instalações** — CRUD completo com timeline de status, checklists e fotos
- **Clientes** — Cadastro com filtros por tipo (residencial, comercial, industrial, rural)
- **Equipes** — Equipes fixas e diaristas com gestão de membros
- **Financeiro** — Receita mensal, pendências, registro de pagamentos
- **Estoque** — Controle de equipamentos e materiais
- **Documentos** — Upload e gestão de contratos, laudos, NFs
- **Relatórios** — Métricas por período com exportação CSV
- **Multi-empresa** — Isolamento total de dados entre organizações
- **LGPD** — Consentimento, exportação e exclusão de dados

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Web | Next.js 14, TypeScript, Tailwind CSS |
| Estado | Zustand + React Query |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Monorepo | Turborepo |
| Monitoramento | Sentry |

## Setup

```bash
# 1. Clone o repositório
git clone https://github.com/instaladorpro/instalador-pro.git
cd instalador-pro

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
# Preencha com seus dados do Supabase

# 4. Execute as migrations no Supabase
# Rode os arquivos em supabase/migrations/ na ordem (001-007)

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## Licença

Proprietário — © 2024 Instalador Pro
