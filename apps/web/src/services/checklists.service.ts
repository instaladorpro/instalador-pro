import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getByInstalacao(instalacaoId: string) {
  const { data, error } = await supabase
    .from('checklists')
    .select('*, checklist_items(id, descricao, concluido, concluido_por, concluido_em, obrigatorio, ordem)')
    .eq('instalacao_id', instalacaoId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((cl: Record<string, unknown>) => ({
    ...cl,
    checklist_items: ((cl.checklist_items as Record<string, unknown>[]) || []).sort(
      (a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)
    ),
  }));
}

export async function create(orgId: string, instalacaoId: string, nome: string, items: { descricao: string; obrigatorio: boolean }[]) {
  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({ organization_id: orgId, instalacao_id: instalacaoId, nome })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      checklist_id: checklist.id,
      descricao: item.descricao,
      obrigatorio: item.obrigatorio,
      ordem: i + 1,
    }));
    const { error: itemsError } = await supabase.from('checklist_items').insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  return checklist;
}

export async function toggleItem(itemId: string, concluido: boolean, userId: string) {
  const { error } = await supabase
    .from('checklist_items')
    .update({
      concluido,
      concluido_por: concluido ? userId : null,
      concluido_em: concluido ? new Date().toISOString() : null,
    })
    .eq('id', itemId);

  if (error) throw new Error(error.message);
}

export async function addItem(checklistId: string, descricao: string, obrigatorio: boolean, ordem: number) {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert({ checklist_id: checklistId, descricao, obrigatorio, ordem })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeItem(itemId: string) {
  const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function remove(checklistId: string) {
  const { error } = await supabase.from('checklists').delete().eq('id', checklistId);
  if (error) throw new Error(error.message);
}
