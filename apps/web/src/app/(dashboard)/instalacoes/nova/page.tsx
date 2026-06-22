'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInstalacao } from '@/hooks/use-instalacoes';
import { useClientes } from '@/hooks/use-clientes';
import { PageHeader, Button, Input, Select, Textarea } from '@/components/ui';

const schema = z.object({
  tipo_servico: z.string().min(1, 'Selecione o tipo'),
  endereco: z.string().min(1, 'Endereço obrigatório'),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cliente_id: z.string().optional(),
  potencia_kwp: z.coerce.number().positive().optional(),
  numero_paineis: z.coerce.number().int().positive().optional(),
  inversor: z.string().optional(),
  valor_total: z.coerce.number().positive('Valor deve ser positivo'),
  data_prevista: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIPOS = [
  { value: 'Residencial', label: 'Residencial' },
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Rural', label: 'Rural' },
];

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((s) => ({ value: s, label: s }));

export default function NovaInstalacaoPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateInstalacao();
  const { data: clientesData } = useClientes({ limit: 100 } as never);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const clienteOptions = (clientesData?.data || []).map((c: Record<string, unknown>) => ({
    value: c.id as string,
    label: c.nome as string,
  }));

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync(data);
      router.push('/instalacoes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar instalação');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nova Instalação" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Tipo de Serviço" options={TIPOS} placeholder="Selecione..." error={errors.tipo_servico?.message} {...register('tipo_servico')} />
          <Select label="Cliente" options={clienteOptions} placeholder="Selecione o cliente..." {...register('cliente_id')} />
        </div>

        <Input label="Endereço" error={errors.endereco?.message} {...register('endereco')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Cidade" {...register('cidade')} />
          <Select label="Estado" options={ESTADOS} placeholder="UF" {...register('estado')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Potência (kWp)" type="number" step="0.01" {...register('potencia_kwp')} />
          <Input label="Nº de Painéis" type="number" {...register('numero_paineis')} />
          <Input label="Inversor" {...register('inversor')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Valor Total (R$)" type="number" step="0.01" error={errors.valor_total?.message} {...register('valor_total')} />
          <Input label="Data Prevista" type="date" {...register('data_prevista')} />
        </div>

        <Textarea label="Observações" {...register('observacoes')} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Criar Instalação</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
