'use client';

import { useState } from 'react';
import { useMaterialTemplates, useCreateMaterialTemplate, useUpdateMaterialTemplate, useDeleteMaterialTemplate, useDuplicateMaterialTemplate } from '@/hooks/use-material-templates';
import { PageHeader, Button, Card, Modal, Input, Textarea, EmptyState, Loading, Select } from '@/components/ui';

const CATEGORIAS = [
  { value: 'modulos', label: 'Módulos' },
  { value: 'inversores', label: 'Inversores' },
  { value: 'estruturas', label: 'Estruturas' },
  { value: 'eletricos', label: 'Elétricos' },
  { value: 'protecoes', label: 'Proteções' },
  { value: 'cabos', label: 'Cabos' },
  { value: 'conectores', label: 'Conectores' },
  { value: 'outros', label: 'Outros' },
];

interface MaterialItem {
  nome_material: string;
  quantidade: number;
  unidade: string;
  sku: string;
  categoria: string;
}

interface EditingTemplate {
  id?: string;
  nome: string;
  descricao: string;
  items: MaterialItem[];
}

const EMPTY: EditingTemplate = { nome: '', descricao: '', items: [] };

export default function MaterialTemplatesPage() {
  const { data: templates, isLoading } = useMaterialTemplates();
  const createT = useCreateMaterialTemplate();
  const updateT = useUpdateMaterialTemplate();
  const deleteT = useDeleteMaterialTemplate();
  const duplicateT = useDuplicateMaterialTemplate();

  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<EditingTemplate>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openNew() { setEditing(EMPTY); setShowEditor(true); }

  function openEdit(t: Record<string, unknown>) {
    const items = (t.material_list_template_items as Record<string, unknown>[]) || [];
    setEditing({
      id: t.id as string, nome: t.nome as string, descricao: (t.descricao as string) || '',
      items: items.map((i) => ({
        nome_material: i.nome_material as string, quantidade: Number(i.quantidade),
        unidade: (i.unidade as string) || 'un', sku: (i.sku as string) || '', categoria: (i.categoria as string) || 'outros',
      })),
    });
    setShowEditor(true);
  }

  function addItem() { setEditing((p) => ({ ...p, items: [...p.items, { nome_material: '', quantidade: 1, unidade: 'un', sku: '', categoria: 'outros' }] })); }
  function updateItem(i: number, field: string, value: string | number) { setEditing((p) => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) })); }
  function removeItem(i: number) { setEditing((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) })); }
  function moveItem(i: number, dir: -1 | 1) {
    const ni = i + dir;
    if (ni < 0 || ni >= editing.items.length) return;
    setEditing((p) => { const items = [...p.items]; [items[i], items[ni]] = [items[ni], items[i]]; return { ...p, items }; });
  }

  async function handleSave() {
    if (!editing.nome.trim()) { alert('Informe o nome'); return; }
    const valid = editing.items.filter((i) => i.nome_material.trim());
    try {
      if (editing.id) {
        await updateT.mutateAsync({ id: editing.id, nome: editing.nome, descricao: editing.descricao, items: valid });
      } else {
        await createT.mutateAsync({ nome: editing.nome, descricao: editing.descricao, items: valid });
      }
      setShowEditor(false);
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao salvar'); }
  }

  if (isLoading) return <Loading message="Carregando modelos..." />;

  return (
    <div>
      <PageHeader title="Modelos de Lista de Materiais" subtitle="Crie listas reutilizáveis de materiais para suas instalações" actions={<Button onClick={openNew}>Nova Lista</Button>} />

      {!templates?.length ? (
        <EmptyState icon="📦" title="Nenhum modelo criado" description="Crie seu primeiro modelo de lista de materiais." action={<Button size="sm" onClick={openNew}>Nova Lista</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t: Record<string, unknown>) => {
            const items = (t.material_list_template_items as Record<string, unknown>[]) || [];
            return (
              <Card key={t.id as string}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.nome as string}</h3>
                    {t.descricao && <p className="text-xs text-muted mt-0.5">{t.descricao as string}</p>}
                  </div>
                  <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{items.length} itens</span>
                </div>
                <ul className="space-y-1 mb-4 max-h-40 overflow-y-auto">
                  {items.slice(0, 8).map((item, i) => (
                    <li key={i} className="text-xs text-secondary flex justify-between">
                      <span>{item.nome_material as string}</span>
                      <span className="text-muted">{item.quantidade as number} {item.unidade as string}</span>
                    </li>
                  ))}
                  {items.length > 8 && <li className="text-xs text-muted">+{items.length - 8} mais...</li>}
                </ul>
                <div className="flex gap-1.5 border-t border-border pt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => duplicateT.mutate(t.id as string)}>Duplicar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id as string)} className="text-danger ml-auto">Excluir</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? 'Editar Modelo' : 'Nova Lista de Materiais'} size="lg" footer={
        <><Button variant="outline" onClick={() => setShowEditor(false)}>Cancelar</Button><Button loading={createT.isPending || updateT.isPending} onClick={handleSave}>{editing.id ? 'Salvar' : 'Criar Modelo'}</Button></>
      }>
        <div className="space-y-4">
          <Input label="Nome da Lista" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Ex: Kit Residencial 5kWp" />
          <Textarea label="Descrição (opcional)" value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Materiais</label>
              <Button variant="outline" size="sm" onClick={addItem}>+ Adicionar Material</Button>
            </div>
            {editing.items.length === 0 ? (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg">Nenhum material adicionado.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {editing.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                    <span className="text-xs text-muted w-5 text-center">{index + 1}</span>
                    <input type="text" value={item.nome_material} onChange={(e) => updateItem(index, 'nome_material', e.target.value)}
                      className="flex-1 h-8 px-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Nome do material" />
                    <input type="number" value={item.quantidade} onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 px-2 text-sm rounded border border-border bg-white text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="text" value={item.unidade} onChange={(e) => updateItem(index, 'unidade', e.target.value)}
                      className="w-14 h-8 px-2 text-sm rounded border border-border bg-white text-center focus:outline-none focus:ring-1 focus:ring-primary" placeholder="un" />
                    <div className="flex gap-0.5">
                      <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="text-muted hover:text-foreground disabled:opacity-30 text-xs p-1">↑</button>
                      <button onClick={() => moveItem(index, 1)} disabled={index === editing.items.length - 1} className="text-muted hover:text-foreground disabled:opacity-30 text-xs p-1">↓</button>
                    </div>
                    <button onClick={() => removeItem(index)} className="text-muted hover:text-danger text-sm p-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir modelo?" size="sm" footer={
        <><Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button><Button variant="danger" loading={deleteT.isPending} onClick={async () => { await deleteT.mutateAsync(deleteId!); setDeleteId(null); }}>Excluir</Button></>
      }>
        <p className="text-sm text-secondary">O modelo será excluído. Listas já aplicadas em instalações <strong>não serão afetadas</strong>.</p>
      </Modal>
    </div>
  );
}
