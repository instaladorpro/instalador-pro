'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstalacao, useUpdateStatus, useDeleteInstalacao, useHistoricoStatus } from '@/hooks/use-instalacoes';
import { useChecklists, useToggleItem, useDeleteChecklist } from '@/hooks/use-checklists';
import { useChecklistTemplates, useApplyTemplate } from '@/hooks/use-checklist-templates';
import { useFotos, useUploadFoto, useDeleteFoto } from '@/hooks/use-fotos';
import { useInstallationMaterials, useMaterialTemplates, useApplyMaterialTemplate, useToggleMaterialItem, useAddMaterialItem, useRemoveMaterialItem, useRemoveMaterialList } from '@/hooks/use-material-templates';
import { useExtraCosts, useCreateExtraCost, useDeleteExtraCost } from '@/hooks/use-extra-costs';
import { PageHeader, Button, Card, StatusBadge, Modal, Loading, Input, Select, Textarea } from '@/components/ui';
import * as fotosService from '@/services/fotos.service';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

const TRANSITIONS: Record<string, { label: string; next: string; variant: 'primary' | 'danger'; confirm?: boolean }> = {
  agendada: { label: 'Iniciar Instalação', next: 'em_andamento', variant: 'primary' },
  em_andamento: { label: 'Finalizar Instalação', next: 'concluida', variant: 'primary', confirm: true },
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
  const { data: materialLists } = useInstallationMaterials(id);
  const { data: materialTemplates } = useMaterialTemplates();
  const applyMaterialTemplate = useApplyMaterialTemplate();
  const toggleMaterialItem = useToggleMaterialItem();
  const addMaterialItem = useAddMaterialItem();
  const removeMaterialItem = useRemoveMaterialItem();
  const removeMaterialList = useRemoveMaterialList();
  const { data: extraCosts } = useExtraCosts(id);
  const createExtraCost = useCreateExtraCost();
  const deleteExtraCost = useDeleteExtraCost();

  const [showDelete, setShowDelete] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);
  const [costForm, setCostForm] = useState({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], observacao: '' });
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [selectedMaterialTemplateId, setSelectedMaterialTemplateId] = useState('');
  const [materialFilter, setMaterialFilter] = useState<'todos' | 'conferidos' | 'pendentes'>('todos');
  const [newItemListId, setNewItemListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [fotoCategoria, setFotoCategoria] = useState('durante');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <Loading message="Carregando instalação..." />;
  if (!inst) return <p className="text-center text-muted py-8">Instalação não encontrada</p>;

  const transition = TRANSITIONS[inst.status];

  async function handleTransition() {
    if (!transition) return;
    if (transition.confirm) { setShowFinalize(true); return; }
    try { await updateStatus.mutateAsync({ id, status: transition.next }); }
    catch (err) { alert(err instanceof Error ? err.message : 'Erro ao atualizar status'); }
  }

  async function handleFinalize() {
    try {
      await updateStatus.mutateAsync({ id, status: 'concluida' });
      setShowFinalize(false);
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao finalizar'); }
  }

  async function handleAddCost() {
    if (!costForm.descricao || !costForm.valor) return;
    try {
      await createExtraCost.mutateAsync({
        instalacao_id: id, descricao: costForm.descricao,
        valor: parseFloat(costForm.valor), data: costForm.data, observacao: costForm.observacao || undefined,
      });
      setShowAddCost(false);
      setCostForm({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], observacao: '' });
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  function handleShareWhatsApp() {
    const clienteNome = inst.clientes ? (inst.clientes as Record<string, unknown>).nome : 'N/A';
    const clienteTel = inst.clientes ? (inst.clientes as Record<string, unknown>).telefone : '';
    const costs = extraCosts || [];
    const custoExtra = costs.reduce((s: number, c: Record<string, unknown>) => s + Number(c.valor || 0), 0);
    const valorBase = Number(inst.valor_total) || 0;
    const valorFinal = valorBase + custoExtra;
    const numFotos = fotos?.length || 0;

    let text = `🏗️ *RELATÓRIO DE INSTALAÇÃO*\n\n`;
    text += `👤 *Cliente:* ${clienteNome}\n`;
    if (clienteTel) text += `📱 *Telefone:* ${clienteTel}\n`;
    text += `\n🏠 *Tipo:* ${inst.tipo_servico}\n`;
    text += `📍 *Endereço:* ${inst.endereco}\n`;
    if (inst.data_inicio) text += `📅 *Início:* ${formatDate(inst.data_inicio)}\n`;
    if (inst.data_conclusao) text += `✅ *Conclusão:* ${formatDate(inst.data_conclusao)}\n`;

    text += `\n💰 *RESUMO FINANCEIRO*\n\n`;
    text += `Valor da Instalação: ${formatCurrency(valorBase)}\n`;
    if (costs.length > 0) {
      text += `\nCustos Adicionais:\n`;
      costs.forEach((c: Record<string, unknown>) => {
        text += `• ${c.descricao} — ${formatCurrency(Number(c.valor))}\n`;
      });
      text += `\nTotal Custos Adicionais: ${formatCurrency(custoExtra)}\n`;
    }
    text += `\n*Valor Final da Instalação: ${formatCurrency(valorFinal)}*\n`;

    if (numFotos > 0) text += `\n📸 Fotos anexadas: ${numFotos}\n`;
    text += `\n_Gerado pelo Instalador Pro_`;

    navigator.clipboard.writeText(text);
    alert('Relatório copiado! Cole no WhatsApp.');
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
              <div className="flex gap-2">
                {transition && <Button size="sm" variant={transition.variant} loading={updateStatus.isPending} onClick={handleTransition}>{transition.label}</Button>}
                {(inst.status === 'concluida' || inst.status === 'paga') && (
                  <Button size="sm" variant="outline" onClick={handleShareWhatsApp}>📋 Compartilhar</Button>
                )}
              </div>
            </div>
            {(() => {
              const valorBase = Number(inst.valor_total) || 0;
              const custoExtra = (extraCosts || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.valor || 0), 0);
              const valorFinal = valorBase + custoExtra;
              return (
                <>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><dt className="text-muted">Tipo</dt><dd className="font-medium text-foreground">{inst.tipo_servico}</dd></div>
                    <div><dt className="text-muted">Endereço</dt><dd className="text-foreground">{inst.endereco}</dd></div>
                    <div><dt className="text-muted">Cidade/UF</dt><dd className="text-foreground">{[inst.cidade, inst.estado].filter(Boolean).join('/') || '—'}</dd></div>
                    <div><dt className="text-muted">Potência</dt><dd className="text-foreground">{inst.potencia_kwp ? `${inst.potencia_kwp} kWp` : '—'}</dd></div>
                    <div><dt className="text-muted">Painéis</dt><dd className="text-foreground">{inst.numero_paineis || '—'}</dd></div>
                    <div><dt className="text-muted">Inversor</dt><dd className="text-foreground">{inst.inversor || '—'}</dd></div>
                    <div><dt className="text-muted">Data Prevista</dt><dd className="text-foreground">{formatDate(inst.data_prevista)}</dd></div>
                    <div><dt className="text-muted">Início</dt><dd className="text-foreground">{formatDate(inst.data_inicio)}</dd></div>
                    <div><dt className="text-muted">Conclusão</dt><dd className="text-foreground">{formatDate(inst.data_conclusao)}</dd></div>
                  </dl>

                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-secondary uppercase mb-2">Resumo Financeiro</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Valor da Instalação</span>
                        <span className="text-foreground">{formatCurrency(valorBase)}</span>
                      </div>
                      {custoExtra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Custos Adicionais</span>
                          <span className="text-amber-600">+ {formatCurrency(custoExtra)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-border">
                        <span className="text-foreground">Valor Final</span>
                        <span className="text-foreground">{formatCurrency(valorFinal)}</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
            {inst.localizacao_url && (
              <div className="mt-4 pt-4 border-t border-border">
                <a href={inst.localizacao_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  📍 Abrir Localização
                </a>
              </div>
            )}
            {inst.observacoes && <div className="mt-4 pt-4 border-t border-border"><p className="text-xs text-muted mb-1">Observações</p><p className="text-sm text-foreground">{inst.observacoes}</p></div>}
          </Card>

          {/* Custos Adicionais */}
          <Card header={{ title: 'Custos Adicionais', action: <Button size="sm" variant="outline" onClick={() => setShowAddCost(true)}>Adicionar Custo</Button> }}>
            {(() => {
              const costs = extraCosts || [];
              const total = costs.reduce((s: number, c: Record<string, unknown>) => s + Number(c.valor || 0), 0);
              return costs.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">Nenhum custo adicional registrado</p>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {costs.map((c: Record<string, unknown>) => (
                      <div key={c.id as string} className="flex items-center justify-between py-2 group">
                        <div>
                          <p className="text-sm text-foreground">{c.descricao as string}</p>
                          <p className="text-xs text-muted">{formatDate(c.data as string)}{c.observacao ? ` · ${c.observacao}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{formatCurrency(Number(c.valor))}</span>
                          <button onClick={() => { if (confirm('Excluir este custo?')) deleteExtraCost.mutate(c.id as string); }}
                            className="text-muted hover:text-danger text-xs opacity-0 group-hover:opacity-100">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex justify-between">
                    <span className="text-sm font-medium text-secondary">Total custos adicionais</span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(total)}</span>
                  </div>
                </>
              );
            })()}
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

          {/* Lista de Materiais */}
          <Card header={{
            title: 'Lista de Materiais',
            action: <Button size="sm" variant="outline" onClick={() => setShowAddMaterial(true)}>Adicionar Lista</Button>,
          }}>
            {!materialLists?.length ? (
              <p className="text-sm text-muted text-center py-4">Nenhuma lista de materiais</p>
            ) : (
              <div className="space-y-6">
                {materialLists.map((ml: Record<string, unknown>) => {
                  const items = (ml.installation_material_items as Record<string, unknown>[]) || [];
                  const conferidos = items.filter((i) => i.conferido).length;
                  const filteredItems = items.filter((i) => {
                    if (materialFilter === 'conferidos') return i.conferido;
                    if (materialFilter === 'pendentes') return !i.conferido;
                    return true;
                  });

                  function handleExportWhatsApp() {
                    const clienteNome = inst.clientes ? (inst.clientes as Record<string, unknown>).nome : 'N/A';
                    let text = `📦 LISTA DE MATERIAIS\n\nObra: ${inst.tipo_servico} - ${inst.endereco}\nCliente: ${clienteNome}\n\n`;
                    items.forEach((i) => { text += `• ${i.quantidade}${i.unidade !== 'un' ? i.unidade : 'x'} ${i.nome_material}\n`; });
                    text += `\nTotal de itens: ${items.length}\nConferidos: ${conferidos}/${items.length}\n\nGerado pelo Instalador Pro`;
                    navigator.clipboard.writeText(text);
                    alert('Lista copiada! Cole no WhatsApp.');
                  }

                  return (
                    <div key={ml.id as string}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">{ml.nome as string}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{conferidos}/{items.length} conferidos</span>
                          <button onClick={handleExportWhatsApp} className="text-xs text-primary hover:underline" title="Copiar para WhatsApp">📋</button>
                          <button onClick={() => { if (confirm('Excluir esta lista?')) removeMaterialList.mutate(ml.id as string); }}
                            className="text-muted hover:text-danger text-sm" title="Excluir lista">×</button>
                        </div>
                      </div>

                      <div className="h-1.5 bg-surface rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${items.length ? (conferidos / items.length) * 100 : 0}%` }} />
                      </div>

                      <div className="flex gap-1.5 mb-2">
                        {(['todos', 'conferidos', 'pendentes'] as const).map((f) => (
                          <button key={f} onClick={() => setMaterialFilter(f)}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${materialFilter === f ? 'bg-primary text-white' : 'bg-surface text-muted'}`}>
                            {f === 'todos' ? 'Todos' : f === 'conferidos' ? 'Conferidos' : 'Pendentes'}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        {filteredItems.map((item) => (
                          <div key={item.id as string} className="flex items-center gap-2 py-1 group">
                            <input type="checkbox" checked={!!item.conferido}
                              onChange={() => toggleMaterialItem.mutate({ itemId: item.id as string, conferido: !item.conferido })}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                            <span className={`text-sm flex-1 ${item.conferido ? 'line-through text-muted' : 'text-foreground'}`}>
                              <strong>{item.quantidade as number}{(item.unidade as string) !== 'un' ? (item.unidade as string) : 'x'}</strong>{' '}
                              {item.nome_material as string}
                            </span>
                            <button onClick={() => removeMaterialItem.mutate(item.id as string)}
                              className="text-muted hover:text-danger text-xs opacity-0 group-hover:opacity-100">×</button>
                          </div>
                        ))}
                      </div>

                      {/* Add item inline */}
                      {newItemListId === (ml.id as string) ? (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                          <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                            className="flex-1 h-8 px-2 text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Nome do material" />
                          <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)}
                            className="w-16 h-8 px-2 text-sm rounded border border-border bg-white text-center" />
                          <Button size="sm" onClick={async () => {
                            if (!newItemName.trim()) return;
                            await addMaterialItem.mutateAsync({ listId: ml.id as string, item: { nome_material: newItemName, quantidade: parseFloat(newItemQty) || 1, ordem: items.length + 1 } });
                            setNewItemName(''); setNewItemQty('1'); setNewItemListId(null);
                          }}>+</Button>
                          <Button size="sm" variant="ghost" onClick={() => setNewItemListId(null)}>×</Button>
                        </div>
                      ) : (
                        <button onClick={() => setNewItemListId(ml.id as string)}
                          className="text-xs text-primary hover:underline mt-2 pt-2 border-t border-border block w-full text-left">
                          + Adicionar material
                        </button>
                      )}
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

      {/* Finalize Confirmation Modal */}
      <Modal open={showFinalize} onClose={() => setShowFinalize(false)} title="Finalizar Instalação?" size="sm" footer={
        <><Button variant="outline" onClick={() => setShowFinalize(false)}>Cancelar</Button><Button loading={updateStatus.isPending} onClick={handleFinalize}>Finalizar</Button></>
      }>
        <p className="text-sm text-secondary">Tem certeza que deseja finalizar esta instalação? A data de conclusão será registrada automaticamente.</p>
      </Modal>

      {/* Add Extra Cost Modal */}
      <Modal open={showAddCost} onClose={() => setShowAddCost(false)} title="Adicionar Custo Adicional" size="sm" footer={
        <><Button variant="outline" onClick={() => setShowAddCost(false)}>Cancelar</Button><Button loading={createExtraCost.isPending} onClick={handleAddCost} disabled={!costForm.descricao || !costForm.valor}>Adicionar</Button></>
      }>
        <div className="space-y-4">
          <Input label="Descrição" value={costForm.descricao} onChange={(e) => setCostForm({ ...costForm, descricao: e.target.value })} placeholder="Ex: Cabo adicional" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" step="0.01" value={costForm.valor} onChange={(e) => setCostForm({ ...costForm, valor: e.target.value })} />
            <Input label="Data" type="date" value={costForm.data} onChange={(e) => setCostForm({ ...costForm, data: e.target.value })} />
          </div>
          <Textarea label="Observação (opcional)" value={costForm.observacao} onChange={(e) => setCostForm({ ...costForm, observacao: e.target.value })} />
        </div>
      </Modal>

      {/* Material Template Selection Modal */}
      <Modal open={showAddMaterial} onClose={() => setShowAddMaterial(false)} title="Adicionar Lista de Materiais" size="sm" footer={
        <><Button variant="outline" onClick={() => setShowAddMaterial(false)}>Cancelar</Button>
        <Button loading={applyMaterialTemplate.isPending} onClick={async () => {
          if (!selectedMaterialTemplateId) return;
          await applyMaterialTemplate.mutateAsync({ templateId: selectedMaterialTemplateId, instalacaoId: id });
          setShowAddMaterial(false); setSelectedMaterialTemplateId('');
        }} disabled={!selectedMaterialTemplateId}>Aplicar</Button></>
      }>
        {!materialTemplates?.length ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-2">Nenhum modelo de materiais criado.</p>
            <a href="/configuracoes/materiais" className="text-sm text-primary hover:underline">Criar modelo em Configurações →</a>
          </div>
        ) : (
          <>
            <Select
              label="Modelo de Lista"
              options={materialTemplates.map((t: Record<string, unknown>) => ({
                value: t.id as string,
                label: `${t.nome} (${((t.material_list_template_items as unknown[]) || []).length} itens)`,
              }))}
              placeholder="Selecione um modelo..."
              value={selectedMaterialTemplateId}
              onChange={(e) => setSelectedMaterialTemplateId(e.target.value)}
            />
            {selectedMaterialTemplateId && (() => {
              const sel = materialTemplates.find((t: Record<string, unknown>) => t.id === selectedMaterialTemplateId);
              if (!sel) return null;
              const items = (sel.material_list_template_items as Record<string, unknown>[]) || [];
              return (
                <div className="mt-3 p-3 bg-surface rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-secondary mb-2">Materiais:</p>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-foreground flex justify-between">
                        <span>{item.nome_material as string}</span>
                        <span className="text-muted">{item.quantidade as number} {item.unidade as string}</span>
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
