'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstalacao, useUpdateStatus, useDeleteInstalacao, useHistoricoStatus } from '@/hooks/use-instalacoes';
import { PageHeader, Button, Card, StatusBadge, Modal, Loading } from '@/components/ui';

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

export default function InstalacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: inst, isLoading } = useInstalacao(id);
  const { data: historico } = useHistoricoStatus(id);
  const updateStatus = useUpdateStatus();
  const deleteInstalacao = useDeleteInstalacao();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <Loading message="Carregando instalação..." />;
  if (!inst) return <p className="text-center text-muted py-8">Instalação não encontrada</p>;

  const transition = TRANSITIONS[inst.status];

  async function handleTransition() {
    if (!transition) return;
    try {
      await updateStatus.mutateAsync({ id, status: transition.next });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  }

  async function handleDelete() {
    try {
      await deleteInstalacao.mutateAsync(id);
      router.push('/instalacoes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div>
      <PageHeader
        title={inst.tipo_servico}
        subtitle={inst.endereco}
        actions={
          <div className="flex gap-2">
            <Link href={`/instalacoes/${id}/editar`}><Button variant="outline" size="sm">Editar</Button></Link>
            {(inst.status === 'agendada' || inst.status === 'em_andamento') && (
              <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Excluir</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={inst.status} />
              {transition && (
                <Button size="sm" variant={transition.variant} loading={updateStatus.isPending} onClick={handleTransition}>
                  {transition.label}
                </Button>
              )}
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
              <div><dt className="text-muted">Início</dt><dd className="text-foreground">{formatDate(inst.data_inicio)}</dd></div>
              <div><dt className="text-muted">Conclusão</dt><dd className="text-foreground">{formatDate(inst.data_conclusao)}</dd></div>
            </dl>

            {inst.observacoes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted mb-1">Observações</p>
                <p className="text-sm text-foreground">{inst.observacoes}</p>
              </div>
            )}
          </Card>

          {inst.clientes && (
            <Card header={{ title: 'Cliente' }}>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted">Nome</dt><dd className="font-medium text-foreground">{(inst.clientes as Record<string, unknown>).nome as string}</dd></div>
                <div><dt className="text-muted">Telefone</dt><dd className="text-foreground">{((inst.clientes as Record<string, unknown>).telefone as string) || '—'}</dd></div>
                <div><dt className="text-muted">Email</dt><dd className="text-foreground">{((inst.clientes as Record<string, unknown>).email as string) || '—'}</dd></div>
              </dl>
            </Card>
          )}
        </div>

        <div>
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

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir instalação?" description="Esta ação não pode ser desfeita." footer={
        <>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleteInstalacao.isPending} onClick={handleDelete}>Excluir</Button>
        </>
      }>
        <p className="text-sm text-secondary">A instalação <strong>{inst.tipo_servico}</strong> em <strong>{inst.endereco}</strong> será excluída permanentemente.</p>
      </Modal>
    </div>
  );
}
