import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

export async function list(orgId: string, filters: { search?: string; page?: number; limit?: number } = {}) {
  const { search, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('equipes')
    .select('*, equipe_membros(id, funcao, profiles(id, nome, avatar_url))', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('nome', { ascending: true })
    .range(from, to);

  if (search) query = query.ilike('nome', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0, page, totalPages: Math.ceil((count || 0) / limit) };
}

export async function getById(id: string) {
  const { data, error } = await supabase
    .from('equipes')
    .select('*, equipe_membros(id, funcao, profile_id, profiles(id, nome, email, telefone, avatar_url))')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function create(orgId: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('equipes')
    .insert({ ...input, organization_id: orgId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function update(id: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('equipes')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase.from('equipes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addMembro(equipeId: string, profileId: string, funcao: string) {
  const { data, error } = await supabase
    .from('equipe_membros')
    .insert({ equipe_id: equipeId, profile_id: profileId, funcao })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeMembro(membroId: string) {
  const { error } = await supabase.from('equipe_membros').delete().eq('id', membroId);
  if (error) throw new Error(error.message);
}

export async function getOrgMembers(orgId: string) {
  const { data, error } = await supabase
    .from('org_members')
    .select('user_id, role, profiles(id, nome, email, avatar_url)')
    .eq('organization_id', orgId)
    .eq('ativo', true);

  if (error) throw new Error(error.message);
  return data || [];
}
