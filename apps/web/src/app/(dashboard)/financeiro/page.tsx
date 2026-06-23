'use client';

import { useState } from 'react';
import { usePendencias, useResumoMensal, useRegistrarRecebimento } from '@/hooks/use-financeiro';
import { PageHeader, StatCard, Card, Button, Modal, Input, Select, Textarea, StatusBadge, Skeleton } from '@/components/ui';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const FORMAS = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao', label: 'Cartão' },
];

export default function FinanceiroPage() {
  const { data: pendencias, isLoading: loadingPend } = usePendencias();
  const { data: resumo, isLoading: loadingResumo } = useResumoMensal(6);
  const registrar = useRegistrarRecebimento();

  const [showModal, setShowModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({ valor: '', forma_pagamento: 'pix', data_recebimento: new Date().toISOString().split('T')[0], observacoes: '' });

  const totalRecebido = (resumo || []).reduce((s, m) => s + m.total, 0);
  const totalPendente = (pendencias || []).reduce((s, p) => s + Number((p as Record<string, unknown>).saldoPendente ?? (p as Record<string, unknown>).valor_total ?? 0), 0);
  const mediaMensal = resumo?.length ? totalRecebido / resumo.length : 0;
  const maxMes = Math.max(...(resumo || []).map((m) => m.total), 1);

  function openPayment(inst: Record<string, unknown>) {
    setSelectedInst(inst);
    const saldo = Number(inst.saldoPendente) || Number(inst.valor_total) || 0;
    setFormData({ valor: String(saldo), forma_pagamento: 'pix', data_recebimento: new Date().toISOString().split('T')[0], observacoes: '' });
    setShowModal(true);
  }

  async function handlePayment() {
    if (!selectedInst) return;
    try {
      await registrar.mutateAsync({
        instalacao_id: selectedInst.id,
        valor: parseFloat(formData.valor),
        forma_pagamento: formData.forma_pagamento,
        data_recebimento: formData.data_recebimento,
        observacoes: formData.observacoes || null,
      });
      setShowModal(false);
      setSelectedInst(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    }
  }

  return (
    <div>
      <PageHeader title="Financeiro" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loadingResumo ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard title="Total Recebido" value={formatCurrency(totalRecebido)} icon="💰" />
            <StatCard title="Total Pendente" value={formatCurrency(totalPendente)} icon="⏳" />
            <StatCard title="Média Mensal" value={formatCurrency(mediaMensal)} icon="📊" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card header={{ title: 'Receita Mensal' }}>
          {loadingResumo ? (
            <Skeleton className="h-40" />
          ) : !resumo?.length ? (
            <p className="text-sm text-muted py-4 text-center">Sem dados</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {resumo.map((item) => {
                const monthIdx = parseInt(item.mes.split('-')[1], 10) - 1;
                const height = (item.total / maxMes) * 100;
                return (
                  <div key={item.mes} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-foreground">{formatCurrency(item.total)}</span>
                    <div className="w-full rounded-t overflow-hidden" style={{ height: `${Math.max(height, 4)}%` }}>
                      <div className="w-full h-full bg-emerald-500 rounded-t" />
                    </div>
                    <span className="text-[10px] text-muted">{MONTH_NAMES[monthIdx]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card header={{ title: 'Pendências' }}>
          {loadingPend ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !pendencias?.length ? (
            <p className="text-sm text-muted py-4 text-center">Nenhuma pendência</p>
          ) : (
            <div className="divide-y divide-border">
              {pendencias.map((p: Record<string, unknown>) => {
                const totalRec = Number(p.totalRecebido) || 0;
                const saldo = Number(p.saldoPendente) ?? (Number(p.valor_total) || 0);
                const valorTotal = Number(p.valor_total) || 0;
                return (
                <div key={p.id as string} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.tipo_servico as string}</p>
                    <p className="text-xs text-muted">{((p.clientes as Record<string, unknown>)?.nome as string) || 'Sem cliente'}</p>
                    {totalRec > 0 && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        Recebido: {formatCurrency(totalRec)} de {formatCurrency(valorTotal)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">{formatCurrency(saldo)}</span>
                      {totalRec > 0 && <p className="text-[10px] text-muted">restante</p>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openPayment(p)}>Receber</Button>
                  </div>
                </div>
                );
              }
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Pagamento" description={selectedInst ? `${selectedInst.tipo_servico} — ${selectedInst.endereco}` : ''} size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button loading={registrar.isPending} onClick={handlePayment}>Confirmar</Button>
        </>
      }>
        <div className="space-y-4">
          {selectedInst && (() => {
            const valorTotal = Number(selectedInst.valor_total) || 0;
            const jaRecebido = Number(selectedInst.totalRecebido) || 0;
            const saldo = Number(selectedInst.saldoPendente) ?? valorTotal;
            return (
              <div className="bg-surface rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted">Valor total</span><span className="text-foreground">{formatCurrency(valorTotal)}</span></div>
                {jaRecebido > 0 && <div className="flex justify-between"><span className="text-muted">Já recebido</span><span className="text-emerald-600">{formatCurrency(jaRecebido)}</span></div>}
                <div className="flex justify-between font-medium border-t border-border pt-1"><span className="text-foreground">Saldo pendente</span><span className="text-foreground">{formatCurrency(saldo)}</span></div>
              </div>
            );
          })()}
          <Input label="Valor deste recebimento (R$)" type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} helperText="Informe o valor parcial ou total a receber" />
          <Select label="Forma de Pagamento" options={FORMAS} value={formData.forma_pagamento} onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })} />
          <Input label="Data do Recebimento" type="date" value={formData.data_recebimento} onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })} />
          <Textarea label="Observações" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
