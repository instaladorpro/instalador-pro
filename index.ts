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

export interface Instalador {
  id: string
  auth_user_id: string
  nome: string
  email: string
  telefone?: string
  especialidade?: string
  foto_url?: string
  created_at: string
}

export interface Empresa {
  id: string
  instalador_id: string
  nome: string
  cnpj?: string
  contato_nome?: string
  contato_telefone?: string
  email?: string
  endereco?: string
  ativa: boolean
  created_at: string
}

export interface Instalacao {
  id: string
  instalador_id: string
  empresa_id?: string
  empresa?: Empresa
  tipo_servico: string
  endereco: string
  status: StatusInstalacao
  valor_combinado?: number
  data_prevista?: string
  data_conclusao?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Recebimento {
  id: string
  instalacao_id: string
  instalador_id: string
  valor: number
  forma_pagamento: FormaPagamento
  data_recebimento: string
  observacoes?: string
  created_at: string
}

export interface FotoInstalacao {
  id: string
  instalacao_id: string
  storage_path: string
  descricao?: string
  created_at: string
}

export interface HistoricoStatus {
  id: string
  instalacao_id: string
  status_anterior?: StatusInstalacao
  status_novo: StatusInstalacao
  observacao?: string
  created_at: string
}

export interface InstalacaoPendente {
  id: string
  instalador_id: string
  empresa_id?: string
  empresa_nome?: string
  tipo_servico: string
  endereco: string
  valor_combinado: number
  data_conclusao?: string
  total_recebido: number
  saldo_pendente: number
}

export interface ResumoMensal {
  instalador_id: string
  mes: string
  total_recebido: number
  qtd_recebimentos: number
}

export interface InstalacaoFiltros {
  status?: StatusInstalacao
  empresa_id?: string
  search?: string
}
