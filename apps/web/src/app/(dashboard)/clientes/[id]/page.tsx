'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCliente, useDeleteCliente } from '@/hooks/use-clientes';
import { PageHeader, Button, Card, Badge, Modal, Loading, StatusBadge } from '@/components/ui';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: cliente, isLoading } = useCliente(id);
  const deleteCliente = useDeleteCliente();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <Loading message="Carregando cliente..." />;
  if (!cliente) return <p className="text-center text-muted py-8">Cliente não encontrado</p>;

  async function handleDelete() {
    try {
      await deleteCliente.mutateAsync(id);
      router.push('/clientes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div>
      <PageHeader
        title={cliente.nome}
        subtitle={cliente.tipo || undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/clientes/${id}/editar`}><Button variant="outline" size="sm">Editar</Button></Link>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Excluir</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={{ title: 'Informações' }}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-muted">Nome</dt><dd className="font-medium text-foreground">{cliente.nome}</dd></div>
            <div><dt className="text-muted">Tipo</dt><dd><Badge size="sm">{cliente.tipo || '—'}</Badge></dd></div>
            <div><dt className="text-muted">Email</dt><dd className="text-foreground">{cliente.email || '—'}</dd></div>
            <div><dt className="text-muted">Telefone</dt><dd className="text-foreground">{cliente.telefone || '—'}</dd></div>
            <div><dt className="text-muted">CPF/CNPJ</dt><dd className="text-foreground">{cliente.cpf_cnpj || '—'}</dd></div>
            <div><dt className="text-muted">CEP</dt><dd className="text-foreground">{cliente.cep || '—'}</dd></div>
            <div className="col-span-2"><dt className="text-muted">Endereço</dt><dd className="text-foreground">{[cliente.endereco, cliente.cidade, cliente.estado].filter(Boolean).join(', ') || '—'}</dd></div>
          </dl>
          {cliente.observacoes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted mb-1">Observações</p>
              <p className="text-sm text-foreground">{cliente.observacoes}</p>
            </div>
          )}
        </Card>
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir cliente?" description="Esta ação não pode ser desfeita." footer={
        <>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleteCliente.isPending} onClick={handleDelete}>Excluir</Button>
        </>
      }>
        <p className="text-sm text-secondary">O cliente <strong>{cliente.nome}</strong> será excluído permanentemente.</p>
      </Modal>
    </div>
  );
}
