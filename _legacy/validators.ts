import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().min(1, 'Informe o email').email('Email inválido'),
  password: z.string().min(6, 'Senha mínima: 6 caracteres'),
})

export const registerSchema = z.object({
  nome:            z.string().min(2, 'Nome muito curto').max(100),
  email:           z.string().email('Email inválido'),
  password:        z.string().min(6, 'Senha mínima: 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export const instalacaoSchema = z.object({
  tipo_servico:    z.string().min(2, 'Informe o tipo de serviço').max(100),
  endereco:        z.string().min(5, 'Informe o endereço').max(300),
  empresa_id:      z.string().uuid().optional(),
  valor_combinado: z.coerce.number().positive('Valor deve ser positivo').max(999999).optional(),
  data_prevista:   z.string().optional(),
  observacoes:     z.string().max(2000).optional(),
})

export const empresaSchema = z.object({
  nome:             z.string().min(2, 'Informe o nome da empresa').max(150),
  cnpj:             z.string().max(18).optional(),
  contato_nome:     z.string().max(100).optional(),
  contato_telefone: z.string().max(20).optional(),
  email:            z.string().email('Email inválido').optional().or(z.literal('')),
  endereco:         z.string().max(300).optional(),
})

export const recebimentoSchema = z.object({
  valor:            z.coerce.number().positive('Valor deve ser positivo'),
  forma_pagamento:  z.enum(['pix','dinheiro','transferencia','boleto','cartao'], {
    errorMap: () => ({ message: 'Selecione a forma de pagamento' }),
  }),
  data_recebimento: z.string().min(1, 'Informe a data'),
  observacoes:      z.string().max(500).optional(),
})

export type LoginInput        = z.infer<typeof loginSchema>
export type RegisterInput     = z.infer<typeof registerSchema>
export type InstalacaoInput   = z.infer<typeof instalacaoSchema>
export type EmpresaInput      = z.infer<typeof empresaSchema>
export type RecebimentoInput  = z.infer<typeof recebimentoSchema>
