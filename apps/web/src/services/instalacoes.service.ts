import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

interface ListFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function list(orgId: string, filters: ListFilters = {}) {
  const { status, search, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('instalacoes')
    .select('id, tipo_servico, endereco, cidade, status, valor_total, data_prevista, potencia_kwp, created_at, clientes(id, nome)', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`endereco.ilike.%${search}%,tipo_servico.ilike.%${search}%`);

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
    .from('instalacoes')
    .select('*, clientes(id, nome, telefone, email), equipes(id, nome)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function create(orgId: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('instalacoes')
    .insert({ ...input, organization_id: orgId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function update(id: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('instalacoes')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateStatus(id: string, newStatus: string, userId: string, observacao?: string) {
  const { error: statusError } = await supabase
    .from('instalacoes')
    .update({ status: newStatus })
    .eq('id', id);

  if (statusError) throw new Error(statusError.message);

  const { error: histError } = await supabase
    .from('historico_status')
    .insert({ instalacao_id: id, status_novo: newStatus, usuario_id: userId, observacao });

  if (histError) throw new Error(histError.message);
}

export async function remove(id: string) {
  const { error } = await supabase.from('instalacoes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getHistorico(instalacaoId: string) {
  const { data, error } = await supabase
    .from('historico_status')
    .select('id, status_anterior, status_novo, observacao, created_at')
    .eq('instalacao_id', instalacaoId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
