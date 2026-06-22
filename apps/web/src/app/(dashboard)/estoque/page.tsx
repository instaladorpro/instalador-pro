'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useEquipamentos, useDeleteEquipamento } from '@/hooks/use-estoque';
import { PageHeader, Button, SearchInput, EmptyState, Skeleton, Modal } from '@/components/ui';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEquipamentos({ search, page });
  const deleteEquipamento = useDeleteEquipamento();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteEquipamento.mutateAsync(deleteId); setDeleteId(null); } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  return (
    <div>
      <PageHeader title="Estoque" subtitle="Equipamentos e materiais" actions={<Link href="/estoque/novo"><Button>Novo Equipamento</Button></Link>} />

      <SearchInput onSearch={handleSearch} placeholder="Buscar equipamento..." className="mb-4 sm:w-80" />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <EmptyState icon="📦" title="Estoque vazio" description="Cadastre seus equipamentos e materiais." action={<Link href="/estoque/novo"><Button size="sm">Novo Equipamento</Button></Link>} />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface">
              <tr>
                <th className="text-left text-xs font-medium text-secondary px-4 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden sm:table-cell">Marca/Modelo</th>
                <th className="text-right text-xs font-medium text-secondary px-4 py-3">Qtd</th>
                <th className="text-right text-xs font-medium text-secondary px-4 py-3 hidden md:table-cell">Preço Unit.</th>
                <th className="text-right text-xs font-medium text-secondary px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((eq: Record<string, unknown>) => (
                <tr key={eq.id as string} className="border-t border-border">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{eq.nome as string}</td>
                  <td className="px-4 py-3 text-sm text-secondary hidden sm:table-cell">{[eq.marca, eq.modelo].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{eq.quantidade as number} {eq.unidade as string}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right hidden md:table-cell">{eq.preco_unitario ? formatCurrency(Number(eq.preco_unitario)) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(eq.id as string)}>×</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir equipamento?" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleteEquipamento.isPending} onClick={handleDelete}>Excluir</Button>
        </>
      }>
        <p className="text-sm text-secondary">Este equipamento será removido do estoque.</p>
      </Modal>
    </div>
  );
}
