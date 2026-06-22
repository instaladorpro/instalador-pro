'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEquipamento } from '@/hooks/use-estoque';
import { PageHeader, Button, Input, Select } from '@/components/ui';

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  tipo: z.string().optional(),
  quantidade: z.coerce.number().int().min(0).default(0),
  unidade: z.string().default('un'),
  preco_unitario: z.coerce.number().min(0).optional(),
  fornecedor: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIPOS = [
  { value: 'painel', label: 'Painel Solar' },
  { value: 'inversor', label: 'Inversor' },
  { value: 'estrutura', label: 'Estrutura' },
  { value: 'cabo', label: 'Cabo/Fio' },
  { value: 'conector', label: 'Conector' },
  { value: 'disjuntor', label: 'Disjuntor' },
  { value: 'outro', label: 'Outro' },
];

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEquipamento();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try { await mutateAsync(data); router.push('/estoque'); } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Novo Equipamento" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Marca" {...register('marca')} />
          <Input label="Modelo" {...register('modelo')} />
        </div>
        <Select label="Tipo" options={TIPOS} placeholder="Selecione..." {...register('tipo')} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Quantidade" type="number" {...register('quantidade')} />
          <Input label="Unidade" placeholder="un, m, kg..." {...register('unidade')} />
          <Input label="Preço Unit. (R$)" type="number" step="0.01" {...register('preco_unitario')} />
        </div>
        <Input label="Fornecedor" {...register('fornecedor')} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Cadastrar</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
