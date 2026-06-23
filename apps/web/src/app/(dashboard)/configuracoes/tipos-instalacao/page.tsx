'use client';

import { useState } from 'react';
import { useInstallationTypes, useCreateInstallationType, useUpdateInstallationType, useDeleteInstallationType } from '@/hooks/use-installation-types';
import { useChecklistTemplates } from '@/hooks/use-checklist-templates';
import { useMaterialTemplates } from '@/hooks/use-material-templates';
import { PageHeader, Button, Card, Modal, Input, Textarea, Select, Badge, EmptyState, Loading } from '@/components/ui';

interface EditingType {
  id?: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  checklist_template_id: string;
  material_template_id: string;
}

const EMPTY: EditingType = { nome: '', descricao: '', ativo: true, checklist_template_id: '', material_template_id: '' };

export default function TiposInstalacaoPage() {
  const { data: types, isLoading } = useInstallationTypes(true);
  const { data: checklistTemplates } = useChecklistTemplates();
  const { data: materialTemplates } = useMaterialTemplates();
  const createType = useCreateInstallationType();
  const updateType = useUpdateInstallationType();
  const deleteType = useDeleteInstallationType();

  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<EditingType>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openNew() { setEditing(EMPTY); setShowEditor(true); }

  function openEdit(t: Record<string, unknown>) {
    setEditing({
      id: t.id as string,
      nome: t.nome as string,
      descricao: (t.descricao as string) || '',
      ativo: t.ativo as boolean,
      checklist_template_id: (t.checklist_template_id as string) || '',
      material_template_id: (t.material_template_id as string) || '',
    });
    setShowEditor(true);
  }

  async function handleSave() {
    if (!editing.nome.trim()) { alert('Informe o nome do tipo'); return; }
    const input = {
      nome: editing.nome,
      descricao: editing.descricao || undefined,
      ativo: editing.ativo,
      checklist_template_id: editing.checklist_template_id || null,
      material_template_id: editing.material_template_id || null,
    };
    try {
      if (editing.id) {
        await updateType.mutateAsync({ id: editing.id, input });
      } else {
        await createType.mutateAsync(input);
      }
      setShowEditor(false);
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao salvar'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteType.mutateAsync(deleteId); setDeleteId(null); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  }

  async function toggleAtivo(t: Record<string, unknown>) {
    try {
      await updateType.mutateAsync({
        id: t.id as string,
        input: { nome: t.nome as string, ativo: !(t.ativo as boolean) },
      });
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  const checklistOptions = (checklistTemplates || []).map((t: Record<string, unknown>) => ({ value: t.id as string, label: t.nome as string }));
  const materialOptions = (materialTemplates || []).map((t: Record<string, unknown>) => ({ value: t.id as string, label: t.nome as string }));

  if (isLoading) return <Loading message="Carregando tipos..." />;

  return (
    <div>
      <PageHeader title="Tipos de Instalação" subtitle="Defina os tipos de serviço que sua empresa realiza" actions={<Button onClick={openNew}>Novo Tipo</Button>} />

      {!types?.length ? (
        <EmptyState icon="⚡" title="Nenhum tipo cadastrado" description="Crie os tipos de instalação que sua empresa realiza." action={<Button size="sm" onClick={openNew}>Novo Tipo</Button>} />
      ) : (
        <div className="space-y-2">
          {types.map((t: Record<string, unknown>, index: number) => {
            const checklistT = t.checklist_templates as Record<string, unknown> | null;
            const materialT = t.material_list_templates as Record<string, unknown> | null;
            return (
              <div key={t.id as string} className={`bg-white border border-border rounded-lg p-4 flex items-center justify-between ${!(t.ativo as boolean) ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted w-6 text-center">{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground">{t.nome as string}</h3>
                      {!(t.ativo as boolean) && <Badge variant="default" size="sm">Inativo</Badge>}
                    </div>
                    {t.descricao ? <p className="text-xs text-muted mt-0.5">{String(t.descricao)}</p> : null}
                    <div className="flex gap-3 mt-1">
                      {checklistT && <span className="text-[10px] text-secondary">✅ {checklistT.nome as string}</span>}
                      {materialT && <span className="text-[10px] text-secondary">📦 {materialT.nome as string}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => toggleAtivo(t)}>{t.ativo ? 'Desativar' : 'Ativar'}</Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id as string)} className="text-danger">×</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? 'Editar Tipo' : 'Novo Tipo de Instalação'} size="md" footer={
        <><Button variant="outline" onClick={() => setShowEditor(false)}>Cancelar</Button><Button loading={createType.isPending || updateType.isPending} onClick={handleSave}>{editing.id ? 'Salvar' : 'Criar Tipo'}</Button></>
      }>
        <div className="space-y-4">
          <Input label="Nome do Tipo" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Ex: Residencial, Comercial, Manutenção..." />
          <Textarea label="Descrição (opcional)" value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} />

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-secondary mb-3">Modelos padrão (opcional)</p>
            <p className="text-xs text-muted mb-3">Ao criar uma instalação deste tipo, estes modelos serão sugeridos automaticamente.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Checklist padrão" options={checklistOptions} placeholder="Nenhum" value={editing.checklist_template_id} onChange={(e) => setEditing({ ...editing, checklist_template_id: e.target.value })} />
              <Select label="Lista de materiais padrão" options={materialOptions} placeholder="Nenhuma" value={editing.material_template_id} onChange={(e) => setEditing({ ...editing, material_template_id: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir tipo?" size="sm" footer={
        <><Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button><Button variant="danger" loading={deleteType.isPending} onClick={handleDelete}>Excluir</Button></>
      }>
        <p className="text-sm text-secondary">Se este tipo estiver em uso, a exclusão será bloqueada. Considere desativá-lo.</p>
      </Modal>
    </div>
  );
}
