'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

const STEPS = [
  {
    icon: '👋',
    title: 'Bem-vindo ao Instalador Pro!',
    description: 'A plataforma completa para gestão de instalações de energia solar. Vamos configurar sua empresa em poucos passos.',
  },
  {
    icon: '🏢',
    title: 'Sua empresa está criada',
    description: 'Você já pode adicionar clientes, equipes e instalações. Comece cadastrando seu primeiro cliente.',
  },
  {
    icon: '⚡',
    title: 'Crie sua primeira instalação',
    description: 'Registre os dados do projeto solar: potência, painéis, inversor, valor e data prevista. Acompanhe todo o ciclo da obra.',
  },
  {
    icon: '👷',
    title: 'Monte suas equipes',
    description: 'Adicione seus técnicos e organize equipes fixas ou diaristas. Atribua equipes a cada instalação.',
  },
  {
    icon: '🚀',
    title: 'Tudo pronto!',
    description: 'Sua plataforma está configurada. Use o Dashboard para acompanhar KPIs, Financeiro para controlar pagamentos e Relatórios para analisar resultados.',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center">
        <span className="text-5xl mb-4 inline-block">{current.icon}</span>
        <h2 className="text-xl font-bold text-foreground mb-2">{current.title}</h2>
        <p className="text-sm text-secondary mb-6">{current.description}</p>

        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Anterior</Button>}
          {isLast ? (
            <Button onClick={onComplete}>Começar a usar</Button>
          ) : (
            <Button onClick={() => setStep(step + 1)}>Próximo</Button>
          )}
        </div>

        <button onClick={onComplete} className="text-xs text-muted hover:text-secondary mt-4 inline-block">
          Pular introdução
        </button>
      </div>
    </div>
  );
}
