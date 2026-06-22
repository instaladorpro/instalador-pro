import type { StatusInstalacao } from '../types'

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

export function formatDate(date: string | undefined | null): string {
  if (!date) return '—'
  const parts = date.split('T')[0].split('-')
  if (parts.length !== 3) return date
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  return formatDate(dateStr)
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<StatusInstalacao, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  paga: 'Paga',
  cancelada: 'Cancelada',
}

export function formatStatus(status: StatusInstalacao): string {
  return STATUS_LABELS[status] ?? status
}

// ---------------------------------------------------------------------------
// Phone / CPF / CNPJ
// ---------------------------------------------------------------------------

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '—'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '—'
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return cnpj
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}
