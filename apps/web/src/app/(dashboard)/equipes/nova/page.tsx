'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEquipe } from '@/hooks/use-equipes';
import { PageHeader, Button, Input, Select } from '@/components/ui';

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  tipo: z.string().min(1, 'Selecione o tipo'),
});

type FormData = z.infer<typeof schema>;

export default function NovaEquipePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEquipe();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync(data);
      router.push('/equipes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar equipe');
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Nova Equipe" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome da Equipe" error={errors.nome?.message} {...register('nome')} />
        <Select label="Tipo" options={[{ value: 'fixa', label: 'Fixa' }, { value: 'diarista', label: 'Diarista' }]} placeholder="Selecione..." error={errors.tipo?.message} {...register('tipo')} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Criar Equipe</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
