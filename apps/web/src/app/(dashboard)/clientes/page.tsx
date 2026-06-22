'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientes } from '@/hooks/use-clientes';
import { PageHeader, Button, SearchInput, Badge, EmptyState, Skeleton } from '@/components/ui';

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'pf', label: 'Pessoa Física' },
  { value: 'pj', label: 'Pessoa Jurídica' },
];

const TIPO_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  pf: 'info',
  pj: 'success',
};

export default function ClientesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useClientes({ search, tipo: tipo || undefined, page });

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  return (
    <div>
      <PageHeader title="Clientes" actions={<Link href="/clientes/novo"><Button>Novo Cliente</Button></Link>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput onSearch={handleSearch} placeholder="Buscar por nome, email ou CPF/CNPJ..." className="sm:w-80" />
        <div className="flex gap-1.5">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTipo(t.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${tipo === t.value ? 'bg-primary text-white' : 'bg-surface text-secondary hover:bg-border'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <EmptyState icon="👥" title="Nenhum cliente" description="Cadastre seu primeiro cliente." action={<Link href="/clientes/novo"><Button size="sm">Novo Cliente</Button></Link>} />
      ) : (
        <>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden md:table-cell">Telefone</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden lg:table-cell">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c: Record<string, unknown>) => (
                  <tr key={c.id as string} onClick={() => router.push(`/clientes/${c.id}`)} className="border-t border-border hover:bg-surface/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{c.nome as string}</td>
                    <td className="px-4 py-3 text-sm text-secondary hidden sm:table-cell">{(c.email as string) || '—'}</td>
                    <td className="px-4 py-3 text-sm text-secondary hidden md:table-cell">{(c.telefone as string) || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={TIPO_VARIANT[(c.tipo as string)] || 'default'} size="sm">{(c.tipo as string) || '—'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-secondary hidden lg:table-cell">{(c.cidade as string) || '—'}</td>
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
