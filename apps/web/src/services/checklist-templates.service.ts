import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function list(orgId: string) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*, checklist_template_items(id, descricao, obrigatorio, ordem)')
    .eq('organization_id', orgId)
    .order('nome', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((t: Record<string, unknown>) => ({
    ...t,
    checklist_template_items: ((t.checklist_template_items as Record<string, unknown>[]) || [])
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
  }));
}

export async function getById(id: string) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*, checklist_template_items(id, descricao, obrigatorio, ordem)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    checklist_template_items: ((data.checklist_template_items as Record<string, unknown>[]) || [])
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
  };
}

export async function create(orgId: string, nome: string, descricao: string, items: { descricao: string; obrigatorio: boolean }[]) {
  const { data: template, error } = await supabase
    .from('checklist_templates')
    .insert({ organization_id: orgId, nome, descricao: descricao || null })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      template_id: template.id,
      descricao: item.descricao,
      obrigatorio: item.obrigatorio,
      ordem: i + 1,
    }));
    const { error: itemsError } = await supabase.from('checklist_template_items').insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  return template;
}

export async function update(id: string, nome: string, descricao: string, items: { id?: string; descricao: string; obrigatorio: boolean }[]) {
  const { error } = await supabase
    .from('checklist_templates')
    .update({ nome, descricao: descricao || null })
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Delete existing items and re-insert
  await supabase.from('checklist_template_items').delete().eq('template_id', id);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      template_id: id,
      descricao: item.descricao,
      obrigatorio: item.obrigatorio,
      ordem: i + 1,
    }));
    const { error: itemsError } = await supabase.from('checklist_template_items').insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }
}

export async function remove(id: string) {
  const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicate(id: string, orgId: string) {
  const original = await getById(id);
  const items = (original.checklist_template_items as Record<string, unknown>[]).map((item) => ({
    descricao: item.descricao as string,
    obrigatorio: item.obrigatorio as boolean,
  }));
  return create(orgId, `${original.nome} (cópia)`, original.descricao || '', items);
}

export async function applyToInstalacao(templateId: string, orgId: string, instalacaoId: string) {
  const template = await getById(templateId);
  const items = (template.checklist_template_items as Record<string, unknown>[]) || [];

  // Create checklist as independent copy
  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({
      organization_id: orgId,
      instalacao_id: instalacaoId,
      nome: template.nome,
      template_id: templateId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      checklist_id: checklist.id,
      descricao: item.descricao as string,
      obrigatorio: item.obrigatorio as boolean,
      ordem: (item.ordem as number) || i + 1,
    }));
    const { error: itemsError } = await supabase.from('checklist_items').insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  return checklist;
}
