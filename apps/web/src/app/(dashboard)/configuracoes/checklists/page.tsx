'use client';

import { useState } from 'react';
import { useChecklistTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useDuplicateTemplate } from '@/hooks/use-checklist-templates';
import { PageHeader, Button, Card, Modal, Input, Textarea, EmptyState, Loading } from '@/components/ui';

interface TemplateItem {
  id?: string;
  descricao: string;
  obrigatorio: boolean;
}

interface EditingTemplate {
  id?: string;
  nome: string;
  descricao: string;
  items: TemplateItem[];
}

const EMPTY_TEMPLATE: EditingTemplate = { nome: '', descricao: '', items: [] };

export default function ChecklistTemplatesPage() {
  const { data: templates, isLoading } = useChecklistTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<EditingTemplate>(EMPTY_TEMPLATE);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openNew() {
    setEditing(EMPTY_TEMPLATE);
    setShowEditor(true);
  }

  function openEdit(template: Record<string, unknown>) {
    const items = (template.checklist_template_items as Record<string, unknown>[]) || [];
    setEditing({
      id: template.id as string,
      nome: template.nome as string,
      descricao: (template.descricao as string) || '',
      items: items.map((i) => ({
        id: i.id as string,
        descricao: i.descricao as string,
        obrigatorio: i.obrigatorio as boolean,
      })),
    });
    setShowEditor(true);
  }

  function addItem() {
    setEditing((prev) => ({
      ...prev,
      items: [...prev.items, { descricao: '', obrigatorio: false }],
    }));
  }

  function updateItem(index: number, field: string, value: string | boolean) {
    setEditing((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  }

  function removeItem(index: number) {
    setEditing((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editing.items.length) return;
    setEditing((prev) => {
      const items = [...prev.items];
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return { ...prev, items };
    });
  }

  async function handleSave() {
    if (!editing.nome.trim()) { alert('Informe o nome do checklist'); return; }
    const validItems = editing.items.filter((i) => i.descricao.trim());
    try {
      if (editing.id) {
        await updateTemplate.mutateAsync({ id: editing.id, nome: editing.nome, descricao: editing.descricao, items: validItems });
      } else {
        await createTemplate.mutateAsync({ nome: editing.nome, descricao: editing.descricao, items: validItems });
      }
      setShowEditor(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function handleDuplicate(id: string) {
    try { await duplicateTemplate.mutateAsync(id); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao duplicar'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteTemplate.mutateAsync(deleteId); setDeleteId(null); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  }

  if (isLoading) return <Loading message="Carregando modelos..." />;

  return (
    <div>
      <PageHeader title="Modelos de Checklist" subtitle="Crie e gerencie modelos reutilizáveis para suas instalações" actions={<Button onClick={openNew}>Novo Checklist</Button>} />

      {!templates?.length ? (
        <EmptyState icon="✅" title="Nenhum modelo criado" description="Crie seu primeiro modelo de checklist para padronizar suas instalações." action={<Button size="sm" onClick={openNew}>Novo Checklist</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t: Record<string, unknown>) => {
            const items = (t.checklist_template_items as Record<string, unknown>[]) || [];
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
                    <li key={i} className="text-xs text-secondary flex items-start gap-1.5">
                      <span className="text-muted mt-0.5">○</span>
                      <span>{item.descricao as string}{item.obrigatorio && <span className="text-danger ml-0.5">*</span>}</span>
                    </li>
                  ))}
                  {items.length > 8 && <li className="text-xs text-muted">+{items.length - 8} mais...</li>}
                </ul>

                <div className="flex gap-1.5 border-t border-border pt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(t.id as string)}>Duplicar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id as string)} className="text-danger ml-auto">Excluir</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        open={showEditor}
        onClose={() => setShowEditor(false)}
        title={editing.id ? 'Editar Modelo' : 'Novo Modelo de Checklist'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditor(false)}>Cancelar</Button>
            <Button loading={createTemplate.isPending || updateTemplate.isPending} onClick={handleSave}>
              {editing.id ? 'Salvar' : 'Criar Modelo'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome do Checklist" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Ex: Instalação Residencial" />
          <Textarea label="Descrição (opcional)" value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} placeholder="Descreva quando usar este modelo..." />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Itens do Checklist</label>
              <Button variant="outline" size="sm" onClick={addItem}>+ Adicionar Item</Button>
            </div>

            {editing.items.length === 0 ? (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg">Nenhum item adicionado. Clique em &quot;+ Adicionar Item&quot; para começar.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {editing.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                    <span className="text-xs text-muted w-5 text-center">{index + 1}</span>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                      className="flex-1 h-8 px-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Descrição do item..."
                    />
                    <label className="flex items-center gap-1 text-xs text-secondary whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={item.obrigatorio} onChange={(e) => updateItem(index, 'obrigatorio', e.target.checked)} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
                      Obrig.
                    </label>
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

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir modelo?" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleteTemplate.isPending} onClick={handleDelete}>Excluir</Button>
        </>
      }>
        <p className="text-sm text-secondary">O modelo será excluído. Checklists já aplicados em instalações <strong>não serão afetados</strong>.</p>
      </Modal>
    </div>
  );
}
