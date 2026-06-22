import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function list(orgId: string) {
  const { data, error } = await supabase
    .from('material_list_templates')
    .select('*, material_list_template_items(id, nome_material, quantidade, unidade, sku, categoria, ordem)')
    .eq('organization_id', orgId)
    .order('nome');

  if (error) throw new Error(error.message);
  return (data || []).map((t: Record<string, unknown>) => ({
    ...t,
    material_list_template_items: ((t.material_list_template_items as Record<string, unknown>[]) || [])
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
  }));
}

export async function getById(id: string) {
  const { data, error } = await supabase
    .from('material_list_templates')
    .select('*, material_list_template_items(id, nome_material, quantidade, unidade, sku, categoria, ordem)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    material_list_template_items: ((data.material_list_template_items as Record<string, unknown>[]) || [])
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
  };
}

interface TemplateItem {
  nome_material: string;
  quantidade: number;
  unidade?: string;
  sku?: string;
  categoria?: string;
}

export async function create(orgId: string, nome: string, descricao: string, items: TemplateItem[]) {
  const { data: template, error } = await supabase
    .from('material_list_templates')
    .insert({ organization_id: orgId, nome, descricao: descricao || null })
    .select().single();

  if (error) throw new Error(error.message);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      template_id: template.id, nome_material: item.nome_material,
      quantidade: item.quantidade, unidade: item.unidade || 'un',
      sku: item.sku || null, categoria: item.categoria || 'outros', ordem: i + 1,
    }));
    const { error: e } = await supabase.from('material_list_template_items').insert(rows);
    if (e) throw new Error(e.message);
  }
  return template;
}

export async function update(id: string, nome: string, descricao: string, items: TemplateItem[]) {
  const { error } = await supabase.from('material_list_templates').update({ nome, descricao: descricao || null }).eq('id', id);
  if (error) throw new Error(error.message);

  await supabase.from('material_list_template_items').delete().eq('template_id', id);
  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      template_id: id, nome_material: item.nome_material,
      quantidade: item.quantidade, unidade: item.unidade || 'un',
      sku: item.sku || null, categoria: item.categoria || 'outros', ordem: i + 1,
    }));
    const { error: e } = await supabase.from('material_list_template_items').insert(rows);
    if (e) throw new Error(e.message);
  }
}

export async function remove(id: string) {
  const { error } = await supabase.from('material_list_templates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicate(id: string, orgId: string) {
  const original = await getById(id);
  const items = (original.material_list_template_items as Record<string, unknown>[]).map((i) => ({
    nome_material: i.nome_material as string, quantidade: Number(i.quantidade),
    unidade: i.unidade as string, sku: i.sku as string, categoria: i.categoria as string,
  }));
  return create(orgId, `${original.nome} (cópia)`, original.descricao || '', items);
}

export async function applyToInstalacao(templateId: string, orgId: string, instalacaoId: string) {
  const template = await getById(templateId);
  const items = (template.material_list_template_items as Record<string, unknown>[]) || [];

  const { data: list, error } = await supabase
    .from('installation_material_lists')
    .insert({ instalacao_id: instalacaoId, organization_id: orgId, template_id: templateId, nome: template.nome })
    .select().single();

  if (error) throw new Error(error.message);

  if (items.length > 0) {
    const rows = items.map((item, i) => ({
      material_list_id: list.id, nome_material: item.nome_material as string,
      quantidade: Number(item.quantidade), unidade: item.unidade as string,
      sku: item.sku as string || null, categoria: item.categoria as string || 'outros',
      ordem: (item.ordem as number) || i + 1,
    }));
    const { error: e } = await supabase.from('installation_material_items').insert(rows);
    if (e) throw new Error(e.message);
  }
  return list;
}

export async function getByInstalacao(instalacaoId: string) {
  const { data, error } = await supabase
    .from('installation_material_lists')
    .select('*, installation_material_items(id, nome_material, quantidade, unidade, sku, categoria, conferido, conferido_em, ordem)')
    .eq('instalacao_id', instalacaoId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return (data || []).map((l: Record<string, unknown>) => ({
    ...l,
    installation_material_items: ((l.installation_material_items as Record<string, unknown>[]) || [])
      .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
  }));
}

export async function toggleItemConferido(itemId: string, conferido: boolean, userId: string) {
  const { error } = await supabase.from('installation_material_items').update({
    conferido, conferido_em: conferido ? new Date().toISOString() : null,
    conferido_por: conferido ? userId : null,
  }).eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function addItem(listId: string, item: { nome_material: string; quantidade: number; unidade?: string; ordem: number }) {
  const { data, error } = await supabase.from('installation_material_items')
    .insert({ material_list_id: listId, ...item, unidade: item.unidade || 'un' }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateItem(itemId: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('installation_material_items').update(updates).eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function removeItem(itemId: string) {
  const { error } = await supabase.from('installation_material_items').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
}

export async function removeList(listId: string) {
  const { error } = await supabase.from('installation_material_lists').delete().eq('id', listId);
  if (error) throw new Error(error.message);
}
