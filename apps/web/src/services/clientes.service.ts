import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

interface ListFilters {
  search?: string;
  tipo?: string;
  page?: number;
  limit?: number;
}

export async function list(orgId: string, filters: ListFilters = {}) {
  const { search, tipo, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('clientes')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('nome', { ascending: true })
    .range(from, to);

  if (tipo) query = query.eq('tipo', tipo);
  if (search) query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: data || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getById(id: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function create(orgId: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert({ ...input, organization_id: orgId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function update(id: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('clientes')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
