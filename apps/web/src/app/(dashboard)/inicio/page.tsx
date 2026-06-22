'use client';

import Link from 'next/link';
import { useDashboardStats, useRecentInstalacoes, useInstalacoesPorStatus, useInstalacoesPorMes } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/stores/auth-store';
import { StatCard, Card, StatusBadge, PageHeader, Skeleton } from '@/components/ui';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const STATUS_COLORS: Record<string, string> = {
  agendada: 'bg-blue-500',
  em_andamento: 'bg-amber-500',
  concluida: 'bg-emerald-500',
  paga: 'bg-green-600',
  cancelada: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  paga: 'Paga',
  cancelada: 'Cancelada',
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function DashboardPage() {
  const orgName = useAuthStore((s) => s.currentOrg?.nome);
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recent, isLoading: loadingRecent } = useRecentInstalacoes();
  const { data: porStatus } = useInstalacoesPorStatus();
  const { data: porMes } = useInstalacoesPorMes();

  const totalStatus = (porStatus || []).reduce((s, i) => s + i.count, 0);
  const maxMes = Math.max(...(porMes || []).map((m) => m.count), 1);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={orgName || ''} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard title="Instalações Ativas" value={stats?.instalacoesAtivas ?? 0} icon="⚡" />
            <StatCard title="Receita do Mês" value={formatCurrency(stats?.receitaMensal ?? 0)} icon="💰" />
            <StatCard title="Total de Clientes" value={stats?.totalClientes ?? 0} icon="👥" />
            <StatCard title="Pendências" value={stats?.pendencias ?? 0} icon="⏳" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card header={{
          title: 'Últimas Instalações',
          action: <Link href="/instalacoes" className="text-xs text-primary hover:underline">Ver todas →</Link>,
        }}>
          {loadingRecent ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !recent?.length ? (
            <p className="text-sm text-muted py-4 text-center">Nenhuma instalação ainda</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((inst: Record<string, unknown>) => (
                <Link key={inst.id as string} href={`/instalacoes/${inst.id}`} className="flex items-center justify-between py-2.5 hover:bg-surface/50 -mx-4 px-4 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inst.tipo_servico as string}</p>
                    <p className="text-xs text-muted">{((inst.clientes as Record<string, unknown>)?.nome as string) || 'Sem cliente'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inst.status as string} size="sm" />
                    <span className="text-sm font-medium text-foreground">{formatCurrency(Number(inst.valor_total) || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card header={{ title: 'Instalações por Status' }}>
          {!porStatus?.length ? (
            <p className="text-sm text-muted py-4 text-center">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {porStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-secondary">{STATUS_LABELS[item.status] || item.status}</span>
                    <span className="font-medium text-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-400'}`} style={{ width: `${(item.count / totalStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card header={{ title: 'Instalações por Mês' }}>
        {!porMes?.length ? (
          <p className="text-sm text-muted py-4 text-center">Sem dados</p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {porMes.map((item) => {
              const monthIdx = parseInt(item.mes.split('-')[1], 10) - 1;
              const height = (item.count / maxMes) * 100;
              return (
                <div key={item.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-foreground">{item.count}</span>
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${Math.max(height, 4)}%` }}>
                    <div className="w-full h-full bg-primary rounded-t" />
                  </div>
                  <span className="text-[10px] text-muted">{MONTH_NAMES[monthIdx]}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
