'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as documentosService from '@/services/documentos.service';
import { PageHeader, Button, SearchInput, Badge, EmptyState, Skeleton, Modal, Input, Select } from '@/components/ui';

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'laudo', label: 'Laudo' },
  { value: 'homologacao', label: 'Homologação' },
  { value: 'outro', label: 'Outro' },
];

const TIPO_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  contrato: 'info',
  procuracao: 'warning',
  nota_fiscal: 'success',
  laudo: 'default',
  homologacao: 'info',
  outro: 'default',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

export default function DocumentosPage() {
  const orgId = useAuthStore((s) => s.currentOrg?.id);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ tipo: 'contrato', nome: '' });
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documentos', orgId, tipo, page],
    queryFn: () => documentosService.list(orgId!, { tipo: tipo || undefined, page }),
    enabled: !!orgId,
  });

  const uploadMutation = useMutation({
    mutationFn: () => documentosService.upload(orgId!, file!, { tipo: uploadData.tipo, nome: uploadData.nome || file!.name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documentos'] }); setShowUpload(false); setFile(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, path }: { id: string; path: string }) => documentosService.remove(id, path),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documentos'] }); },
  });

  async function handleDownload(path: string) {
    try {
      const url = await documentosService.getSignedUrl(path);
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao abrir documento');
    }
  }

  return (
    <div>
      <PageHeader title="Documentos" actions={<Button onClick={() => setShowUpload(true)}>Enviar Documento</Button>} />

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {TIPOS.map((t) => (
          <button key={t.value} onClick={() => { setTipo(t.value); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${tipo === t.value ? 'bg-primary text-white' : 'bg-surface text-secondary hover:bg-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <EmptyState icon="📄" title="Nenhum documento" description="Envie seus primeiros documentos." action={<Button size="sm" onClick={() => setShowUpload(true)}>Enviar Documento</Button>} />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface">
              <tr>
                <th className="text-left text-xs font-medium text-secondary px-4 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-secondary px-4 py-3">Tipo</th>
                <th className="text-left text-xs font-medium text-secondary px-4 py-3 hidden sm:table-cell">Data</th>
                <th className="text-right text-xs font-medium text-secondary px-4 py-3 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((doc: Record<string, unknown>) => (
                <tr key={doc.id as string} className="border-t border-border">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{doc.nome as string}</td>
                  <td className="px-4 py-3"><Badge variant={TIPO_VARIANT[(doc.tipo as string)] || 'default'} size="sm">{doc.tipo as string}</Badge></td>
                  <td className="px-4 py-3 text-sm text-secondary hidden sm:table-cell">{formatDate(doc.created_at as string)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.storage_path as string)}>Abrir</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: doc.id as string, path: doc.storage_path as string })}>×</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Enviar Documento" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setShowUpload(false)}>Cancelar</Button>
          <Button loading={uploadMutation.isPending} disabled={!file} onClick={() => uploadMutation.mutate()}>Enviar</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Tipo" options={TIPOS.filter((t) => t.value)} value={uploadData.tipo} onChange={(e) => setUploadData({ ...uploadData, tipo: e.target.value })} />
          <Input label="Nome do documento" value={uploadData.nome} onChange={(e) => setUploadData({ ...uploadData, nome: e.target.value })} placeholder="Ex: Contrato João Silva" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Arquivo</label>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => { setFile(e.target.files?.[0] || null); if (!uploadData.nome && e.target.files?.[0]) setUploadData({ ...uploadData, nome: e.target.files[0].name }); }}
              className="w-full text-sm text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:bg-surface file:text-foreground file:text-xs file:font-medium hover:file:bg-border" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
