'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Button, Card, Modal } from '@/components/ui';

export default function PrivacidadeDashboardPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleExport() {
    setExporting(true);
    try {
      const [profile, orgs, instalacoes, clientes, recebimentos] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('org_members').select('*, organizations(nome)').eq('user_id', user!.id),
        supabase.from('instalacoes').select('*').limit(1000),
        supabase.from('clientes').select('*').limit(1000),
        supabase.from('recebimentos').select('*').limit(1000),
      ]);

      const data = {
        exportado_em: new Date().toISOString(),
        perfil: profile.data,
        organizacoes: orgs.data,
        instalacoes: instalacoes.data,
        clientes: clientes.data,
        recebimentos: recebimentos.data,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao exportar');
    } finally { setExporting(false); }
  }

  async function handleDeleteRequest() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('data_deletion_requests').insert({
        user_id: user!.id,
        reason: 'Solicitação do titular via plataforma',
      });
      if (error) throw error;
      setShowDelete(false);
      setMsg('Solicitação enviada. Seus dados serão excluídos em até 30 dias.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    } finally { setDeleting(false); }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Privacidade e Dados" subtitle="Gerencie seus dados conforme a LGPD" />

      <div className="space-y-6">
        <Card header={{ title: 'Exportar meus dados' }}>
          <p className="text-sm text-secondary mb-3">Baixe uma cópia de todos os seus dados pessoais em formato JSON. Inclui perfil, organizações, instalações, clientes e recebimentos.</p>
          <Button variant="outline" loading={exporting} onClick={handleExport}>Exportar Dados</Button>
        </Card>

        <Card header={{ title: 'Excluir meus dados' }}>
          <p className="text-sm text-secondary mb-3">Solicite a exclusão permanente de todos os seus dados pessoais. Esta ação é irreversível e será processada em até 30 dias.</p>
          <Button variant="danger" onClick={() => setShowDelete(true)}>Solicitar Exclusão</Button>
          {msg && <p className="text-sm text-emerald-600 mt-3">{msg}</p>}
        </Card>

        <Card header={{ title: 'Seus direitos (LGPD)' }}>
          <ul className="text-sm text-secondary space-y-2">
            <li><strong>Acesso</strong> — Você pode exportar todos os seus dados a qualquer momento</li>
            <li><strong>Correção</strong> — Edite seus dados no Perfil e nas páginas de cadastro</li>
            <li><strong>Exclusão</strong> — Solicite a eliminação completa dos seus dados</li>
            <li><strong>Portabilidade</strong> — Exporte em JSON para usar em outra plataforma</li>
            <li><strong>Revogação</strong> — Entre em contato para revogar consentimentos</li>
          </ul>
          <p className="text-xs text-muted mt-4">Dúvidas: privacidade@instaladorpro.com.br</p>
        </Card>
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir todos os meus dados?" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDeleteRequest}>Confirmar Exclusão</Button>
        </>
      }>
        <div className="space-y-3">
          <p className="text-sm text-secondary">Esta ação é <strong>irreversível</strong>. Após confirmação:</p>
          <ul className="text-sm text-secondary list-disc pl-5 space-y-1">
            <li>Seus dados pessoais serão excluídos em até 30 dias</li>
            <li>Sua conta será desativada imediatamente</li>
            <li>Dados da organização permanecem se houver outros membros</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
