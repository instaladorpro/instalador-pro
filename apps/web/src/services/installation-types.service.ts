import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function list(orgId: string, includeInactive = false) {
  let query = supabase
    .from('installation_types')
    .select('*, checklist_templates(id, nome), material_list_templates(id, nome)')
    .eq('organization_id', orgId)
    .order('ordem', { ascending: true });

  if (!includeInactive) query = query.eq('ativo', true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getById(id: string) {
  const { data, error } = await supabase
    .from('installation_types')
    .select('*, checklist_templates(id, nome), material_list_templates(id, nome)')
    .eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

interface TypeInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  ordem?: number;
  checklist_template_id?: string | null;
  material_template_id?: string | null;
}

export async function create(orgId: string, input: TypeInput) {
  const { data, error } = await supabase
    .from('installation_types')
    .insert({ organization_id: orgId, ...input })
    .select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function update(id: string, input: TypeInput) {
  const { data, error } = await supabase
    .from('installation_types')
    .update(input).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function remove(id: string) {
  // Check if type is in use
  const { count } = await supabase
    .from('instalacoes')
    .select('id', { count: 'exact', head: true })
    .eq('installation_type_id', id);

  if (count && count > 0) {
    throw new Error('Este tipo está sendo usado em instalações. Desative-o em vez de excluir.');
  }

  const { error } = await supabase.from('installation_types').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorder(orgId: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, i) =>
    supabase.from('installation_types').update({ ordem: i }).eq('id', id).eq('organization_id', orgId)
  );
  await Promise.all(updates);
}
