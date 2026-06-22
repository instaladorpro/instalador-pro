'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import Link from 'next/link';

export function ConsentBanner() {
  const user = useAuthStore((s) => s.user);
  const [show, setShow] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    checkConsent();
  }, [user]);

  async function checkConsent() {
    const { data } = await supabase
      .from('consents')
      .select('id')
      .eq('user_id', user!.id)
      .eq('tipo', 'termos_uso')
      .eq('aceito', true)
      .limit(1);

    if (!data?.length) setShow(true);
  }

  async function handleAccept() {
    if (!user) return;
    const consents = ['termos_uso', 'politica_privacidade'].map((tipo) => ({
      user_id: user.id,
      tipo,
      aceito: true,
      version: '1.0',
    }));
    await supabase.from('consents').insert(consents);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Termos de Uso e Privacidade</p>
          <p className="text-xs text-muted mt-1">
            Ao continuar usando a plataforma, você concorda com nossos{' '}
            <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link> e{' '}
            <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
            Seus dados são protegidos conforme a LGPD.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAccept}>Aceitar e Continuar</Button>
        </div>
      </div>
    </div>
  );
}
