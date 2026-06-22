import { supabase } from './supabase'
import type {
  Instalacao, StatusInstalacao, InstalacaoFiltros, HistoricoStatus,
} from '../types'
import type { InstalacaoInput } from '../utils/validators'

export const instalacoesService = {
  async getAll(filtros: InstalacaoFiltros = {}): Promise<Instalacao[]> {
    let query = supabase
      .from('instalacoes')
      .select('*, empresa:empresas(id, nome, contato_telefone)')
      .order('created_at', { ascending: false })

    if (filtros.status) {
      query = query.eq('status', filtros.status)
    }
    if (filtros.empresa_id) {
      query = query.eq('empresa_id', filtros.empresa_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Instalacao> {
    const { data, error } = await supabase
      .from('instalacoes')
      .select('*, empresa:empresas(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(input: InstalacaoInput): Promise<Instalacao> {
    const { data, error } = await supabase
      .from('instalacoes')
      .insert(input)
      .select('*, empresa:empresas(id, nome)')
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<InstalacaoInput>): Promise<Instalacao> {
    const { data, error } = await supabase
      .from('instalacoes')
      .update(input)
      .eq('id', id)
      .select('*, empresa:empresas(id, nome)')
      .single()
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: StatusInstalacao): Promise<void> {
    const updates: Record<string, unknown> = { status }
    if (status === 'concluida') {
      updates.data_conclusao = new Date().toISOString().split('T')[0]
    }
    const { error } = await supabase
      .from('instalacoes')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('instalacoes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getHistorico(instalacaoId: string): Promise<HistoricoStatus[]> {
    const { data, error } = await supabase
      .from('historico_status')
      .select('*')
      .eq('instalacao_id', instalacaoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
}
