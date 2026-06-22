import { z } from 'zod'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe o email').email('Email inválido'),
  password: z.string().min(6, 'Senha mínima: 6 caracteres'),
})

export const registerSchema = z
  .object({
    nome: z.string().min(2, 'Nome muito curto').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha mínima: 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export const organizationSchema = z.object({
  nome: z.string().min(2, 'Informe o nome da empresa').max(150),
  cnpj: z.string().max(18).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().max(20).optional(),
  endereco: z.string().max(300).optional(),
})

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

export const clienteSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do cliente').max(150),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().max(20).optional(),
  cpf_cnpj: z.string().max(18).optional(),
  endereco: z.string().max(300).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().length(2, 'Use a sigla do estado (ex: MG)').optional().or(z.literal('')),
  cep: z.string().max(10).optional(),
  tipo: z.enum(['pf', 'pj'], {
    errorMap: () => ({ message: 'Selecione Pessoa Física ou Jurídica' }),
  }),
})

// ---------------------------------------------------------------------------
// Instalacao
// ---------------------------------------------------------------------------

export const instalacaoSchema = z.object({
  tipo_servico: z.string().min(2, 'Informe o tipo de serviço').max(100),
  endereco: z.string().min(5, 'Informe o endereço').max(300),
  cidade: z.string().max(100).optional(),
  estado: z.string().length(2).optional().or(z.literal('')),
  cliente_id: z.string().uuid().optional(),
  equipe_id: z.string().uuid().optional(),
  potencia_kwp: z.coerce.number().positive('Potência deve ser positiva').optional(),
  numero_paineis: z.coerce.number().int().positive().optional(),
  inversor: z.string().max(100).optional(),
  valor_total: z.coerce.number().positive('Valor deve ser positivo').max(9999999).optional(),
  data_prevista: z.string().optional(),
  data_inicio: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
})

// ---------------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------------

export const equipeSchema = z.object({
  nome: z.string().min(2, 'Informe o nome da equipe').max(100),
  responsavel_id: z.string().uuid().optional(),
  tipo: z.enum(['fixa', 'diarista'], {
    errorMap: () => ({ message: 'Selecione o tipo de equipe' }),
  }),
})

// ---------------------------------------------------------------------------
// Recebimento
// ---------------------------------------------------------------------------

export const recebimentoSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser positivo'),
  forma_pagamento: z.enum(['pix', 'dinheiro', 'transferencia', 'boleto', 'cartao'], {
    errorMap: () => ({ message: 'Selecione a forma de pagamento' }),
  }),
  data_recebimento: z.string().min(1, 'Informe a data'),
  observacoes: z.string().max(500).optional(),
})

// ---------------------------------------------------------------------------
// Equipamento
// ---------------------------------------------------------------------------

export const equipamentoSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do equipamento').max(150),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  tipo: z.string().max(50).optional(),
  quantidade: z.coerce.number().int().positive('Quantidade deve ser positiva'),
  unidade: z.string().max(20).optional(),
  preco_unitario: z.coerce.number().positive('Preço deve ser positivo').optional(),
  fornecedor: z.string().max(150).optional(),
})

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

export const documentoSchema = z.object({
  tipo: z.enum(['contrato', 'procuracao', 'nota_fiscal', 'laudo', 'homologacao', 'outro'], {
    errorMap: () => ({ message: 'Selecione o tipo de documento' }),
  }),
  nome: z.string().min(2, 'Informe o nome do documento').max(200),
  instalacao_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
})

// ---------------------------------------------------------------------------
// Inferred input types
// ---------------------------------------------------------------------------

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OrganizationInput = z.infer<typeof organizationSchema>
export type ClienteInput = z.infer<typeof clienteSchema>
export type InstalacaoInput = z.infer<typeof instalacaoSchema>
export type EquipeInput = z.infer<typeof equipeSchema>
export type RecebimentoInput = z.infer<typeof recebimentoSchema>
export type EquipamentoInput = z.infer<typeof equipamentoSchema>
export type DocumentoInput = z.infer<typeof documentoSchema>
