// ---------------------------------------------------------------------------
// Enums / union types
// ---------------------------------------------------------------------------

export type StatusInstalacao =
  | 'agendada'
  | 'em_andamento'
  | 'concluida'
  | 'paga'
  | 'cancelada'

export type FormaPagamento =
  | 'pix'
  | 'dinheiro'
  | 'transferencia'
  | 'boleto'
  | 'cartao'

export type PlanoOrganizacao = 'free' | 'pro' | 'enterprise'

export type OrgRole = 'owner' | 'admin' | 'tecnico' | 'financeiro'

export type TipoCliente = 'residencial' | 'comercial' | 'industrial' | 'rural'

export type TipoEquipe = 'fixa' | 'diarista'

export type TipoDocumento =
  | 'contrato'
  | 'procuracao'
  | 'nota_fiscal'
  | 'laudo'
  | 'homologacao'
  | 'outro'

export type CategoriaFoto = 'antes' | 'durante' | 'depois'

// ---------------------------------------------------------------------------
// Organization (multi-tenant root)
// ---------------------------------------------------------------------------

export interface Organization {
  id: string
  nome: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  logo_url: string | null
  plano: PlanoOrganizacao
  ativa: boolean
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// OrgMember — links users to organizations with roles
// ---------------------------------------------------------------------------

export interface OrgMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  ativo: boolean
  created_at: string
}

// ---------------------------------------------------------------------------
// Profile — user profile (1:1 with auth.users)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string
  user_id: string
  nome: string
  email: string
  telefone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

export interface Cliente {
  id: string
  organization_id: string
  nome: string
  email: string | null
  telefone: string | null
  cpf_cnpj: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  tipo: TipoCliente
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------------

export interface Equipe {
  id: string
  organization_id: string
  nome: string
  responsavel_id: string | null
  tipo: TipoEquipe
  ativa: boolean
  created_at: string
}

export interface EquipeMembro {
  id: string
  equipe_id: string
  profile_id: string
  funcao: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Instalacao
// ---------------------------------------------------------------------------

export interface Instalacao {
  id: string
  organization_id: string
  cliente_id: string | null
  equipe_id: string | null
  tipo_servico: string
  endereco: string
  cidade: string | null
  estado: string | null
  potencia_kwp: number | null
  numero_paineis: number | null
  inversor: string | null
  status: StatusInstalacao
  valor_total: number | null
  data_prevista: string | null
  data_inicio: string | null
  data_conclusao: string | null
  observacoes: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Recebimento
// ---------------------------------------------------------------------------

export interface Recebimento {
  id: string
  organization_id: string
  instalacao_id: string
  valor: number
  forma_pagamento: FormaPagamento
  data_recebimento: string
  comprovante_url: string | null
  observacoes: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Equipamento
// ---------------------------------------------------------------------------

export interface Equipamento {
  id: string
  organization_id: string
  nome: string
  marca: string | null
  modelo: string | null
  tipo: string | null
  quantidade: number
  unidade: string | null
  preco_unitario: number | null
  fornecedor: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

export interface Documento {
  id: string
  organization_id: string
  instalacao_id: string | null
  cliente_id: string | null
  tipo: TipoDocumento
  nome: string
  storage_path: string
  created_at: string
}

// ---------------------------------------------------------------------------
// FotoInstalacao
// ---------------------------------------------------------------------------

export interface FotoInstalacao {
  id: string
  instalacao_id: string
  organization_id: string
  storage_path: string
  categoria: CategoriaFoto
  descricao: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// HistoricoStatus
// ---------------------------------------------------------------------------

export interface HistoricoStatus {
  id: string
  instalacao_id: string
  status_anterior: StatusInstalacao | null
  status_novo: StatusInstalacao
  usuario_id: string | null
  observacao: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export interface ChecklistItem {
  id: string
  descricao: string
  concluido: boolean
  concluido_por: string | null
  concluido_em: string | null
  obrigatorio: boolean
}

export interface Checklist {
  id: string
  organization_id: string
  instalacao_id: string
  nome: string
  items: ChecklistItem[]
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string
  organization_id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Derived / view types (kept from legacy, adapted)
// ---------------------------------------------------------------------------

export interface InstalacaoPendente {
  id: string
  organization_id: string
  cliente_id: string | null
  cliente_nome: string | null
  tipo_servico: string
  endereco: string
  valor_total: number
  data_conclusao: string | null
  total_recebido: number
  saldo_pendente: number
}

export interface ResumoMensal {
  organization_id: string
  mes: string
  total_recebido: number
  qtd_recebimentos: number
}

export interface InstalacaoFiltros {
  status?: StatusInstalacao
  cliente_id?: string
  equipe_id?: string
  search?: string
}
