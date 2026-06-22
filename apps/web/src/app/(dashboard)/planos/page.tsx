'use client';

import { useAuthStore } from '@/stores/auth-store';
import { PageHeader, Button, Badge } from '@/components/ui';

const PLANS = [
  {
    id: 'free',
    nome: 'Gratuito',
    preco: 'R$ 0',
    periodo: '/mês',
    descricao: 'Para começar a organizar suas instalações',
    features: ['Até 5 instalações/mês', 'Até 2 membros', '1 GB de armazenamento', 'Dashboard básico', 'Suporte por email'],
    cta: 'Plano atual',
    destaque: false,
  },
  {
    id: 'pro',
    nome: 'Profissional',
    preco: 'R$ 97',
    periodo: '/mês',
    descricao: 'Para empresas em crescimento',
    features: ['Instalações ilimitadas', 'Até 10 membros', '10 GB de armazenamento', 'Relatórios avançados', 'Checklists personalizáveis', 'Exportação CSV/PDF', 'Suporte prioritário'],
    cta: 'Assinar Pro',
    destaque: true,
  },
  {
    id: 'enterprise',
    nome: 'Empresarial',
    preco: 'R$ 247',
    periodo: '/mês',
    descricao: 'Para operações de grande porte',
    features: ['Tudo do Pro', 'Membros ilimitados', '50 GB de armazenamento', 'API de integração', 'Múltiplas filiais', 'Suporte dedicado', 'SLA 99.9%', 'Onboarding personalizado'],
    cta: 'Falar com Vendas',
    destaque: false,
  },
];

export default function PlanosPage() {
  const currentPlan = useAuthStore((s) => s.currentOrg?.plano) || 'free';

  return (
    <div>
      <PageHeader title="Planos" subtitle="Escolha o melhor plano para sua empresa" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} className={`rounded-xl border-2 p-6 flex flex-col ${plan.destaque ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-foreground">{plan.nome}</h3>
                {isCurrent && <Badge variant="info" size="sm">Atual</Badge>}
                {plan.destaque && !isCurrent && <Badge variant="success" size="sm">Popular</Badge>}
              </div>

              <div className="mb-3">
                <span className="text-3xl font-bold text-foreground">{plan.preco}</span>
                <span className="text-sm text-muted">{plan.periodo}</span>
              </div>

              <p className="text-sm text-secondary mb-4">{plan.descricao}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? 'outline' : plan.destaque ? 'primary' : 'outline'}
                disabled={isCurrent}
                className="w-full"
              >
                {isCurrent ? 'Plano atual' : plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted text-center mt-6">
        Todos os planos incluem SSL, backups diários e conformidade com LGPD. Cancele a qualquer momento.
      </p>
    </div>
  );
}
