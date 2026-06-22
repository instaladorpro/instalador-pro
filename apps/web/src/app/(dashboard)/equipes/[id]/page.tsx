'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEquipe, useDeleteEquipe, useAddMembro, useRemoveMembro, useOrgMembers } from '@/hooks/use-equipes';
import { PageHeader, Button, Card, Badge, Modal, Select, Input, Loading } from '@/components/ui';

export default function EquipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: equipe, isLoading } = useEquipe(id);
  const deleteEquipe = useDeleteEquipe();
  const addMembro = useAddMembro();
  const removeMembro = useRemoveMembro();
  const { data: orgMembers } = useOrgMembers();

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newMembro, setNewMembro] = useState({ profileId: '', funcao: '' });

  if (isLoading) return <Loading message="Carregando equipe..." />;
  if (!equipe) return <p className="text-center text-muted py-8">Equipe não encontrada</p>;

  const membros = (equipe.equipe_membros as Record<string, unknown>[]) || [];
  const membroIds = new Set(membros.map((m) => (m.profiles as Record<string, unknown>)?.id));
  const availableMembers = (orgMembers || [])
    .filter((m: Record<string, unknown>) => !membroIds.has((m.profiles as Record<string, unknown>)?.id))
    .map((m: Record<string, unknown>) => {
      const p = m.profiles as Record<string, unknown>;
      return { value: p.id as string, label: p.nome as string };
    });

  async function handleAdd() {
    try {
      await addMembro.mutateAsync({ equipeId: id, profileId: newMembro.profileId, funcao: newMembro.funcao });
      setShowAdd(false);
      setNewMembro({ profileId: '', funcao: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar');
    }
  }

  async function handleRemove(membroId: string) {
    if (!confirm('Remover este membro da equipe?')) return;
    try { await removeMembro.mutateAsync(membroId); } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  async function handleDelete() {
    try { await deleteEquipe.mutateAsync(id); router.push('/equipes'); } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  return (
    <div>
      <PageHeader
        title={equipe.nome}
        subtitle={equipe.tipo === 'fixa' ? 'Equipe Fixa' : 'Equipe Diarista'}
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowAdd(true)}>Adicionar Membro</Button>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Excluir</Button>
          </div>
        }
      />

      <Card header={{ title: `Membros (${membros.length})` }}>
        {membros.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Nenhum membro nesta equipe</p>
        ) : (
          <div className="divide-y divide-border">
            {membros.map((m: Record<string, unknown>) => {
              const profile = (m.profiles as Record<string, unknown>) || {};
              return (
                <div key={m.id as string} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {((profile.nome as string) || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.nome as string}</p>
                      <p className="text-xs text-muted">{(profile.email as string) || ''} {m.funcao ? `· ${m.funcao}` : ''}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id as string)}>Remover</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adicionar Membro" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
          <Button loading={addMembro.isPending} onClick={handleAdd} disabled={!newMembro.profileId}>Adicionar</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Membro" options={availableMembers} placeholder="Selecione..." value={newMembro.profileId} onChange={(e) => setNewMembro({ ...newMembro, profileId: e.target.value })} />
          <Input label="Função" placeholder="Ex: Eletricista, Ajudante..." value={newMembro.funcao} onChange={(e) => setNewMembro({ ...newMembro, funcao: e.target.value })} />
        </div>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir equipe?" footer={
        <>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleteEquipe.isPending} onClick={handleDelete}>Excluir</Button>
        </>
      }>
        <p className="text-sm text-secondary">A equipe <strong>{equipe.nome}</strong> será excluída permanentemente.</p>
      </Modal>
    </div>
  );
}
