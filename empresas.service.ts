import { supabase } from './supabase'
import type { Empresa } from '../types'
import type { EmpresaInput } from '../utils/validators'

export const empresasService = {
  async getAll(apenasAtivas = true): Promise<Empresa[]> {
    let query = supabase
      .from('empresas')
      .select('*')
      .order('nome', { ascending: true })

    if (apenasAtivas) {
      query = query.eq('ativa', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(input: EmpresaInput): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<EmpresaInput>): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async arquivar(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .update({ ativa: false })
      .eq('id', id)
    if (error) throw error
  },
}
