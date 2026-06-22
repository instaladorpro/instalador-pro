import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

export async function list(orgId: string, filters: { search?: string; page?: number; limit?: number } = {}) {
  const { search, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('equipamentos')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('nome', { ascending: true })
    .range(from, to);

  if (search) query = query.or(`nome.ilike.%${search}%,marca.ilike.%${search}%,modelo.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0, page, totalPages: Math.ceil((count || 0) / limit) };
}

export async function getById(id: string) {
  const { data, error } = await supabase.from('equipamentos').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function create(orgId: string, input: Record<string, unknown>) {
  const { data, error } = await supabase.from('equipamentos').insert({ ...input, organization_id: orgId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function update(id: string, input: Record<string, unknown>) {
  const { data, error } = await supabase.from('equipamentos').update(input).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase.from('equipamentos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
