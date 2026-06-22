'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInstalacoes } from '@/hooks/use-instalacoes';
import { PageHeader, Button, SearchInput, StatusBadge, EmptyState, Skeleton } from '@/components/ui';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

const STATUSES = [
  { value: '', label: 'Todas' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'paga', label: 'Paga' },
  { value: 'cancelada', label: 'Cancelada' },
];

export default function InstalacoesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInstalacoes({ search, status: status || undefined, page });

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  return (
    <div>
      <PageHeader
        title="Instalações"
        actions={<Link href="/instalacoes/nova"><Button>Nova Instalação</Button></Link>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput onSearch={handleSearch} placeholder="Buscar por endereço ou tipo..." className="sm:w-80" />
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${status === s.value ? 'bg-primary text-white' : 'bg-surface text-secondary hover:bg-border'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <EmptyState icon="⚡" title="Nenhuma instalação" description="Crie sua primeira instalação para começar." action={<Link href="/instalacoes/nova"><Button size="sm">Nova Instalação</Button></Link>} />
      ) : (
        <>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden sm:table-cell">Endereço</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden md:table-cell">Cliente</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-secondary px-4 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((inst: Record<string, unknown>) => (
                  <tr key={inst.id as string} onClick={() => router.push(`/instalacoes/${inst.id}`)} className="border-t border-border hover:bg-surface/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{inst.tipo_servico as string}</td>
                    <td className="px-4 py-3 text-sm text-secondary hidden sm:table-cell">{inst.endereco as string}</td>
                    <td className="px-4 py-3 text-sm text-secondary hidden md:table-cell">{((inst.clientes as Record<string, unknown>)?.nome as string) || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={inst.status as string} size="sm" /></td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground text-right">{formatCurrency(Number(inst.valor_total) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted">{data.count} resultado{data.count !== 1 ? 's' : ''}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-sm text-secondary px-2 py-1">{page} / {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
