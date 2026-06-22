'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEquipes } from '@/hooks/use-equipes';
import { PageHeader, Button, SearchInput, Badge, EmptyState, Skeleton } from '@/components/ui';

export default function EquipesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEquipes({ search, page });

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  return (
    <div>
      <PageHeader title="Equipes" actions={<Link href="/equipes/nova"><Button>Nova Equipe</Button></Link>} />

      <SearchInput onSearch={handleSearch} placeholder="Buscar equipe..." className="mb-4 sm:w-80" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !data?.data.length ? (
        <EmptyState icon="👷" title="Nenhuma equipe" description="Crie sua primeira equipe para organizar seus técnicos." action={<Link href="/equipes/nova"><Button size="sm">Nova Equipe</Button></Link>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((eq: Record<string, unknown>) => {
              const membros = (eq.equipe_membros as Record<string, unknown>[]) || [];
              return (
                <div
                  key={eq.id as string}
                  onClick={() => router.push(`/equipes/${eq.id}`)}
                  className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{eq.nome as string}</h3>
                    <Badge variant={eq.tipo === 'fixa' ? 'info' : 'warning'} size="sm">{eq.tipo === 'fixa' ? 'Fixa' : 'Diarista'}</Badge>
                  </div>
                  <p className="text-xs text-muted mb-3">{membros.length} membro{membros.length !== 1 ? 's' : ''}</p>
                  <div className="flex -space-x-2">
                    {membros.slice(0, 5).map((m) => {
                      const profile = (m.profiles as Record<string, unknown>) || {};
                      const initials = ((profile.nome as string) || '?').substring(0, 2).toUpperCase();
                      return (
                        <div key={m.id as string} className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center border-2 border-white" title={profile.nome as string}>
                          {initials}
                        </div>
                      );
                    })}
                    {membros.length > 5 && <div className="w-7 h-7 rounded-full bg-surface text-muted text-[10px] font-bold flex items-center justify-center border-2 border-white">+{membros.length - 5}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
