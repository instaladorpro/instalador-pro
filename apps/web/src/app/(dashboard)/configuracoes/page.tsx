'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Button, Input, Card, Badge, Modal, Select } from '@/components/ui';

const ROLE_LABELS: Record<string, string> = { owner: 'Dono', admin: 'Admin', tecnico: 'Técnico', financeiro: 'Financeiro' };
const ROLE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'default'> = { owner: 'info', admin: 'success', tecnico: 'default', financeiro: 'warning' };

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const { currentOrg, currentMember } = useAuthStore();
  const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [members, setMembers] = useState<Record<string, unknown>[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('tecnico');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setNome(currentOrg.nome || '');
      setCnpj(currentOrg.cnpj || '');
      setEmail(currentOrg.email || '');
      setTelefone(currentOrg.telefone || '');
      loadMembers();
    }
  }, [currentOrg]);

  async function loadMembers() {
    if (!currentOrg) return;
    const { data } = await supabase
      .from('org_members')
      .select('id, role, ativo, user_id, profiles(nome, email, avatar_url)')
      .eq('organization_id', currentOrg.id);
    setMembers(data || []);
  }

  async function handleSave() {
    if (!currentOrg || !isAdmin) return;
    setSaving(true); setMsg('');
    try {
      const { error } = await supabase.from('organizations').update({ nome, cnpj, email, telefone }).eq('id', currentOrg.id);
      if (error) throw error;
      setMsg('Salvo!');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro');
    } finally { setSaving(false); }
  }

  async function handleInvite() {
    if (!currentOrg) return;
    setInviting(true);
    try {
      const { error } = await supabase.from('invitations').insert({
        organization_id: currentOrg.id,
        email: inviteEmail,
        role: inviteRole,
        invited_by: useAuthStore.getState().user?.id,
      });
      if (error) throw error;
      setShowInvite(false); setInviteEmail(''); setInviteRole('tecnico');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao convidar');
    } finally { setInviting(false); }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Remover este membro?')) return;
    await supabase.from('org_members').update({ ativo: false }).eq('id', memberId);
    loadMembers();
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Configurações" subtitle="Gerencie sua organização" />

      <div className="space-y-6">
        <Card header={{ title: 'Dados da Empresa' }}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nome da Empresa" value={nome} onChange={(e) => setNome(e.target.value)} disabled={!isAdmin} />
              <Input label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isAdmin} />
              <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={!isAdmin} />
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3 mt-4">
              <Button loading={saving} onClick={handleSave}>Salvar</Button>
              {msg && <span className="text-xs text-emerald-600">{msg}</span>}
            </div>
          )}
        </Card>

        <Card header={{ title: 'Modelos de Checklist' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Gerencie os modelos de checklist usados nas instalações.</p>
            </div>
            <Link href="/configuracoes/checklists"><Button variant="outline" size="sm">Gerenciar Modelos</Button></Link>
          </div>
        </Card>

        <Card header={{ title: 'Plano Atual' }}>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="info" size="md">{(currentOrg?.plano || 'free').toUpperCase()}</Badge>
              <p className="text-xs text-muted mt-2">
                {currentOrg?.plano === 'free' ? 'Plano gratuito com funcionalidades básicas' :
                 currentOrg?.plano === 'pro' ? 'Plano profissional com recursos avançados' : 'Plano enterprise com suporte dedicado'}
              </p>
            </div>
            {currentOrg?.plano === 'free' && <Button variant="outline" size="sm" disabled>Em breve</Button>}
          </div>
        </Card>

        <Card header={{
          title: `Membros (${members.filter((m) => m.ativo !== false).length})`,
          action: isAdmin ? <Button size="sm" onClick={() => setShowInvite(true)}>Convidar</Button> : undefined,
        }}>
          <div className="divide-y divide-border">
            {members.filter((m) => m.ativo !== false).map((m) => {
              const profile = (m.profiles as Record<string, unknown>) || {};
              return (
                <div key={m.id as string} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {((profile.nome as string) || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.nome as string}</p>
                      <p className="text-xs text-muted">{profile.email as string}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ROLE_VARIANT[m.role as string] || 'default'} size="sm">{ROLE_LABELS[m.role as string] || m.role}</Badge>
                    {isAdmin && m.role !== 'owner' && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.id as string)}>×</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Convidar Membro" size="sm" footer={
        <>
          <Button variant="outline" onClick={() => setShowInvite(false)}>Cancelar</Button>
          <Button loading={inviting} onClick={handleInvite} disabled={!inviteEmail}>Enviar Convite</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" />
          <Select label="Função" options={[
            { value: 'admin', label: 'Administrador' },
            { value: 'tecnico', label: 'Técnico' },
            { value: 'financeiro', label: 'Financeiro' },
          ]} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
