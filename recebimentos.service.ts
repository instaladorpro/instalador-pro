import { supabase } from './supabase'
import type { Recebimento, InstalacaoPendente, ResumoMensal } from '../types'
import type { RecebimentoInput } from '../utils/validators'

export const recebimentosService = {
  async register(instalacaoId: string, input: RecebimentoInput): Promise<Recebimento> {
    const { data, error } = await supabase
      .from('recebimentos')
      .insert({ ...input, instalacao_id: instalacaoId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getByInstalacao(instalacaoId: string): Promise<Recebimento[]> {
    const { data, error } = await supabase
      .from('recebimentos')
      .select('*')
      .eq('instalacao_id', instalacaoId)
      .order('data_recebimento', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getPendencias(): Promise<InstalacaoPendente[]> {
    const { data, error } = await supabase
      .from('instalacoes_pendentes')
      .select('*')
      .order('data_conclusao', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getResumoMensal(mes?: string): Promise<ResumoMensal[]> {
    let query = supabase
      .from('resumo_financeiro_mensal')
      .select('*')
      .order('mes', { ascending: false })
      .limit(6)

    if (mes) {
      query = query.gte('mes', mes + '-01')
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },
}
