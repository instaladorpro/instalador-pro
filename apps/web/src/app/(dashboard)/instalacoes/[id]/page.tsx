'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstalacao, useUpdateStatus, useDeleteInstalacao, useHistoricoStatus } from '@/hooks/use-instalacoes';
import { useChecklists, useToggleItem, useDeleteChecklist } from '@/hooks/use-checklists';
import { useChecklistTemplates, useApplyTemplate } from '@/hooks/use-checklist-templates';
import { useFotos, useUploadFoto, useDeleteFoto } from '@/hooks/use-fotos';
import { PageHeader, Button, Card, StatusBadge, Modal, Loading, Input, Select } from '@/components/ui';
import * as fotosService from '@/services/fotos.service';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

const TRANSITIONS: Record<string, { label: string; next: string; variant: 'primary' | 'danger' }> = {
  agendada: { label: 'Iniciar Instalação', next: 'em_andamento', variant: 'primary' },
  em_andamento: { label: 'Concluir', next: 'concluida', variant: 'primary' },
  concluida: { label: 'Registrar Pagamento', next: 'paga', variant: 'primary' },
};

const CATEGORIAS_FOTO = [
  { value: 'antes', label: 'Antes' },
  { value: 'durante', label: 'Durante' },
  { value: 'depois', label: 'Depois' },
];

export default function InstalacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: inst, isLoading } = useInstalacao(id);
  const { data: historico } = useHistoricoStatus(id);
  const { data: checklists } = useChecklists(id);
  const { data: fotos } = useFotos(id);
  const updateStatus = useUpdateStatus();
  const deleteInstalacao = useDeleteInstalacao();
  const toggleItem = useToggleItem();
  const deleteChecklist = useDeleteChecklist();
  const { data: templates } = useChecklistTemplates();
  const applyTemplate = useApplyTemplate();
  const uploadFoto = useUploadFoto();
  const deleteFoto = useDeleteFoto();

  const [showDelete, setShowDelete] = useState(false);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [fotoCategoria, setFotoCategoria] = useState('durante');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <Loading message="Carregando instalação..." />;
  if (!inst) return <p className="text-center text-muted py-8">Instalação não encontrada</p>;

  const transition = TRANSITIONS[inst.status];

  async function handleTransition() {
    if (!transition) return;
    try { await updateStatus.mutateAsync({ id, status: transition.next }); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao atualizar status'); }
  }

  async function handleDelete() {
    try { await deleteInstalacao.mutateAsync(id); router.push('/instalacoes'); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao excluir'); }
  }

  async function handleApplyTemplate() {
    if (!selectedTemplateId) return;
    try {
      await applyTemplate.mutateAsync({ templateId: selectedTemplateId, instalacaoId: id });
      setShowAddChecklist(false); setSelectedTemplateId('');
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao aplicar checklist'); }
  }

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await uploadFoto.mutateAsync({ instalacaoId: id, file, categoria: fotoCategoria }); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao enviar foto'); }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function loadPhotoUrl(path: string) {
    if (photoUrls[path]) return;
    try {
      const url = await fotosService.getSignedUrl(path);
      setPhotoUrls((prev) => ({ ...prev, [path]: url }));
    } catch {}
  }

  return (
    <div>
      <PageHeader title={inst.tipo_servico} subtitle={inst.endereco} actions={
        <div className="flex gap-2">
          <Link href={`/instalacoes/${id}/editar`}><Button variant="outline" size="sm">Editar</Button></Link>
          {(inst.status === 'agendada' || inst.status === 'em_andamento') && (
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Excluir</Button>
          )}
        </div>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={inst.status} />
              {transition && <Button size="sm" variant={transition.variant} loading={updateStatus.isPending} onClick={handleTransition}>{transition.label}</Button>}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted">Tipo</dt><dd className="font-medium text-foreground">{inst.tipo_servico}</dd></div>
              <div><dt className="text-muted">Valor</dt><dd className="font-medium text-foreground">{formatCurrency(Number(inst.valor_total) || 0)}</dd></div>
              <div><dt className="text-muted">Endereço</dt><dd className="text-foreground">{inst.endereco}</dd></div>
              <div><dt className="text-muted">Cidade/UF</dt><dd className="text-foreground">{[inst.cidade, inst.estado].filter(Boolean).join('/') || '—'}</dd></div>
              <div><dt className="text-muted">Potência</dt><dd className="text-foreground">{inst.potencia_kwp ? `${inst.potencia_kwp} kWp` : '—'}</dd></div>
              <div><dt className="text-muted">Painéis</dt><dd className="text-foreground">{inst.numero_paineis || '—'}</dd></div>
              <div><dt className="text-muted">Inversor</dt><dd className="text-foreground">{inst.inversor || '—'}</dd></div>
              <div><dt className="text-muted">Data Prevista</dt><dd className="text-foreground">{formatDate(inst.data_prevista)}</dd></div>
            </dl>
            {inst.observacoes && <div className="mt-4 pt-4 border-t border-border"><p className="text-xs text-muted mb-1">Observações</p><p className="text-sm text-foreground">{inst.observacoes}</p></div>}
          </Card>

          {/* Checklists */}
          <Card header={{ title: 'Checklists', action: <Button size="sm" variant="outline" onClick={() => setShowAddChecklist(true)}>Novo Checklist</Button> }}>
            {!checklists?.length ? (
              <p className="text-sm text-muted text-center py-4">Nenhum checklist criado</p>
            ) : (
              <div className="space-y-4">
                {checklists.map((cl: Record<string, unknown>) => {
                  const items = (cl.checklist_items as Record<string, unknown>[]) || [];
                  const done = items.filter((i) => i.concluido).length;
                  return (
                    <div key={cl.id as string}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">{cl.nome as string}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{done}/{items.length}</span>
                          <button
                            onClick={() => { if (confirm('Excluir este checklist?')) deleteChecklist.mutate(cl.id as string); }}
                            className="text-muted hover:text-danger text-sm p-0.5"
                            title="Excluir checklist"
                          >×</button>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
                      </div>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <label key={item.id as string} className="flex items-center gap-2 py-1 cursor-pointer group">
                            <input type="checkbox" checked={!!item.concluido} onChange={() => toggleItem.mutate({ itemId: item.id as string, concluido: !item.concluido })}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                            <span className={`text-sm ${item.concluido ? 'line-through text-muted' : 'text-foreground'}`}>
                              {item.descricao as string}
                              {item.obrigatorio && <span className="text-danger text-xs ml-1">*</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Fotos */}
          <Card header={{ title: 'Fotos' }}>
            <div className="flex items-center gap-3 mb-4">
              <Select options={CATEGORIAS_FOTO} value={fotoCategoria} onChange={(e) => setFotoCategoria(e.target.value)} />
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadFoto} className="hidden" />
              <Button size="sm" variant="outline" loading={uploadFoto.isPending} onClick={() => fileRef.current?.click()}>Enviar Foto</Button>
            </div>

            {!fotos?.length ? (
              <p className="text-sm text-muted text-center py-4">Nenhuma foto enviada</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((f: Record<string, unknown>) => {
                  const path = f.storage_path as string;
                  if (!photoUrls[path]) loadPhotoUrl(path);
                  return (
                    <div key={f.id as string} className="relative group">
                      {photoUrls[path] ? (
                        <img src={photoUrls[path]} alt={f.descricao as string || ''} className="w-full h-32 object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-32 bg-surface rounded-lg animate-pulse" />
                      )}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{f.categoria as string}</span>
                      <button onClick={() => deleteFoto.mutate({ id: f.id as string, storagePath: path })}
                        className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {inst.clientes && (
            <Card header={{ title: 'Cliente' }}>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted">Nome</dt><dd className="font-medium text-foreground">{(inst.clientes as Record<string, unknown>).nome as string}</dd></div>
                <div><dt className="text-muted">Telefone</dt><dd className="text-foreground">{((inst.clientes as Record<string, unknown>).telefone as string) || '—'}</dd></div>
                <div><dt className="text-muted">Email</dt><dd className="text-foreground">{((inst.clientes as Record<string, unknown>).email as string) || '—'}</dd></div>
              </dl>
            </Card>
          )}

          <Card header={{ title: 'Histórico de Status' }}>
            {!historico?.length ? (
              <p className="text-sm text-muted text-center py-4">Sem histórico</p>
            ) : (
              <div className="space-y-3">
                {historico.map((h: Record<string, unknown>) => (
                  <div key={h.id as string} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        {h.status_anterior && <StatusBadge status={h.status_anterior as string} size="sm" />}
                        {h.status_anterior && <span className="text-muted text-xs">→</span>}
                        <StatusBadge status={h.status_novo as string} size="sm" />
                      </div>
                      <p className="text-[10px] text-muted mt-1">{formatDate(h.created_at as string)}</p>
                      {h.observacao && <p className="text-xs text-secondary mt-0.5">{h.observacao as string}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir instalação?" footer={
        <><Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button><Button variant="danger" loading={deleteInstalacao.isPending} onClick={handleDelete}>Excluir</Button></>
      }>
        <p className="text-sm text-secondary">A instalação <strong>{inst.tipo_servico}</strong> será excluída permanentemente.</p>
      </Modal>

      <Modal open={showAddChecklist} onClose={() => setShowAddChecklist(false)} title="Aplicar Checklist" size="sm" footer={
        <><Button variant="outline" onClick={() => setShowAddChecklist(false)}>Cancelar</Button><Button loading={applyTemplate.isPending} onClick={handleApplyTemplate} disabled={!selectedTemplateId}>Aplicar</Button></>
      }>
        {!templates?.length ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-2">Nenhum modelo de checklist criado.</p>
            <a href="/configuracoes/checklists" className="text-sm text-primary hover:underline">Criar modelo em Configurações →</a>
          </div>
        ) : (
          <>
            <Select
              label="Modelo de Checklist"
              options={templates.map((t: Record<string, unknown>) => ({ value: t.id as string, label: `${t.nome} (${((t.checklist_template_items as unknown[]) || []).length} itens)` }))}
              placeholder="Selecione um modelo..."
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            />
            {selectedTemplateId && (() => {
              const selected = templates.find((t: Record<string, unknown>) => t.id === selectedTemplateId);
              if (!selected) return null;
              const items = (selected.checklist_template_items as Record<string, unknown>[]) || [];
              return (
                <div className="mt-3 p-3 bg-surface rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-secondary mb-2">Itens que serão criados:</p>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5">
                        <span className="text-muted">○</span>
                        {item.descricao as string}
                        {item.obrigatorio && <span className="text-danger">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
            <p className="text-xs text-muted mt-2">Uma cópia independente será criada para esta instalação.</p>
          </>
        )}
      </Modal>
    </div>
  );
}
