'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Button, Card, StatCard, Select, Skeleton } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

const PERIODOS = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '60', label: 'Últimos 60 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '180', label: 'Últimos 6 meses' },
  { value: '365', label: 'Último ano' },
];

async function fetchRelatorio(orgId: string, dias: number) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - dias);
  const sinceStr = since.toISOString();

  const [instalacoes, recebimentos, clientes] = await Promise.all([
    supabase.from('instalacoes').select('id, tipo_servico, status, valor_total, created_at').eq('organization_id', orgId).gte('created_at', sinceStr),
    supabase.from('recebimentos').select('id, valor, forma_pagamento, data_recebimento').eq('organization_id', orgId).gte('created_at', sinceStr),
    supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).gte('created_at', sinceStr),
  ]);

  const inst = instalacoes.data || [];
  const rec = recebimentos.data || [];

  const totalRecebido = rec.reduce((s, r) => s + Number(r.valor), 0);
  const totalInstalacoes = inst.length;
  const totalValor = inst.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const novosClientes = clientes.count || 0;

  const porStatus: Record<string, number> = {};
  inst.forEach((i) => { porStatus[i.status] = (porStatus[i.status] || 0) + 1; });

  const porForma: Record<string, number> = {};
  rec.forEach((r) => { porForma[r.forma_pagamento] = (porForma[r.forma_pagamento] || 0) + Number(r.valor); });

  const ticketMedio = totalInstalacoes > 0 ? totalValor / totalInstalacoes : 0;
  const taxaConversao = inst.filter((i) => i.status === 'paga').length / (totalInstalacoes || 1) * 100;

  return { totalRecebido, totalInstalacoes, totalValor, novosClientes, ticketMedio, taxaConversao, porStatus, porForma, instalacoes: inst, recebimentos: rec };
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const STATUS_LABELS: Record<string, string> = { agendada: 'Agendada', em_andamento: 'Em andamento', concluida: 'Concluída', paga: 'Paga', cancelada: 'Cancelada' };
const FORMA_LABELS: Record<string, string> = { pix: 'PIX', dinheiro: 'Dinheiro', transferencia: 'Transferência', boleto: 'Boleto', cartao: 'Cartão' };

export default function RelatoriosPage() {
  const orgId = useAuthStore((s) => s.currentOrg?.id);
  const [periodo, setPeriodo] = useState('30');

  const { data: rel, isLoading } = useQuery({
    queryKey: ['relatorio', orgId, periodo],
    queryFn: () => fetchRelatorio(orgId!, parseInt(periodo)),
    enabled: !!orgId,
  });

  return (
    <div>
      <PageHeader title="Relatórios" actions={
        <div className="flex gap-2">
          <Select options={PERIODOS} value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
          {rel && (
            <>
              <Button variant="outline" size="sm" onClick={() => exportCSV(rel.instalacoes, 'instalacoes')}>Exportar Instalações</Button>
              <Button variant="outline" size="sm" onClick={() => exportCSV(rel.recebimentos, 'recebimentos')}>Exportar Recebimentos</Button>
            </>
          )}
        </div>
      } />

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : rel ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Recebido" value={formatCurrency(rel.totalRecebido)} icon="💰" />
            <StatCard title="Instalações" value={rel.totalInstalacoes} icon="⚡" />
            <StatCard title="Valor Total Contratado" value={formatCurrency(rel.totalValor)} icon="📋" />
            <StatCard title="Novos Clientes" value={rel.novosClientes} icon="👥" />
            <StatCard title="Ticket Médio" value={formatCurrency(rel.ticketMedio)} icon="📊" />
            <StatCard title="Taxa de Conversão" value={`${rel.taxaConversao.toFixed(1)}%`} icon="🎯" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={{ title: 'Por Status' }}>
              <div className="space-y-3">
                {Object.entries(rel.porStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-secondary">{STATUS_LABELS[status] || status}</span>
                    <span className="text-sm font-medium text-foreground">{count}</span>
                  </div>
                ))}
                {Object.keys(rel.porStatus).length === 0 && <p className="text-sm text-muted text-center py-2">Sem dados</p>}
              </div>
            </Card>

            <Card header={{ title: 'Receita por Forma de Pagamento' }}>
              <div className="space-y-3">
                {Object.entries(rel.porForma).sort((a, b) => b[1] - a[1]).map(([forma, valor]) => (
                  <div key={forma} className="flex items-center justify-between">
                    <span className="text-sm text-secondary">{FORMA_LABELS[forma] || forma}</span>
                    <span className="text-sm font-medium text-foreground">{formatCurrency(valor)}</span>
                  </div>
                ))}
                {Object.keys(rel.porForma).length === 0 && <p className="text-sm text-muted text-center py-2">Sem dados</p>}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
