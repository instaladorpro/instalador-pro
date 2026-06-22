'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Button, Input, Card } from '@/components/ui';

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const supabase = createClient();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [savingSenha, setSavingSenha] = useState(false);
  const [msgSenha, setMsgSenha] = useState('');

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setTelefone(profile.telefone || '');
    }
  }, [profile]);

  async function handleSaveProfile() {
    setSaving(true);
    setMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome, telefone })
        .eq('user_id', user?.id);
      if (error) throw error;
      setMsg('Perfil atualizado!');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setSavingSenha(true);
    setMsgSenha('');
    try {
      if (novaSenha.length < 6) { setMsgSenha('Mínimo 6 caracteres'); return; }
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      setMsgSenha('Senha alterada!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err) {
      setMsgSenha(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setSavingSenha(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push('/login');
  }

  const initials = (nome || user?.email || '?').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Meu Perfil" />

      <div className="space-y-6">
        <Card header={{ title: 'Informações pessoais' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{nome || 'Sem nome'}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled helperText="O email não pode ser alterado" />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button loading={saving} onClick={handleSaveProfile}>Salvar</Button>
            {msg && <span className={`text-xs ${msg.includes('!') ? 'text-emerald-600' : 'text-danger'}`}>{msg}</span>}
          </div>
        </Card>

        <Card header={{ title: 'Alterar senha' }}>
          <div className="space-y-4">
            <Input label="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" loading={savingSenha} onClick={handleChangePassword} disabled={!novaSenha}>Alterar Senha</Button>
            {msgSenha && <span className={`text-xs ${msgSenha.includes('!') ? 'text-emerald-600' : 'text-danger'}`}>{msgSenha}</span>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sair da conta</p>
              <p className="text-xs text-muted">Você será redirecionado para a tela de login</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>Sair</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
