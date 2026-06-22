'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInstalacao, useUpdateInstalacao } from '@/hooks/use-instalacoes';
import { useClientes } from '@/hooks/use-clientes';
import { PageHeader, Button, Input, Select, Textarea, Loading } from '@/components/ui';
import { useEffect } from 'react';

const schema = z.object({
  tipo_servico: z.string().min(1),
  endereco: z.string().min(1),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cliente_id: z.string().optional(),
  potencia_kwp: z.coerce.number().positive().optional(),
  numero_paineis: z.coerce.number().int().positive().optional(),
  inversor: z.string().optional(),
  valor_total: z.coerce.number().positive(),
  data_prevista: z.string().optional(),
  localizacao_url: z.string().url().optional().or(z.literal('')),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIPOS = [
  { value: 'Residencial', label: 'Residencial' },
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Rural', label: 'Rural' },
];

const ESTADOS = 'AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO'.split(',').map((s) => ({ value: s, label: s }));

export default function EditarInstalacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: inst, isLoading } = useInstalacao(id);
  const { mutateAsync, isPending } = useUpdateInstalacao();
  const { data: clientesData } = useClientes({ limit: 100 } as never);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (inst) {
      reset({
        tipo_servico: inst.tipo_servico,
        endereco: inst.endereco,
        cidade: inst.cidade || '',
        estado: inst.estado || '',
        cliente_id: inst.cliente_id || '',
        potencia_kwp: inst.potencia_kwp || undefined,
        numero_paineis: inst.numero_paineis || undefined,
        inversor: inst.inversor || '',
        valor_total: Number(inst.valor_total) || 0,
        data_prevista: inst.data_prevista || '',
        localizacao_url: inst.localizacao_url || '',
        observacoes: inst.observacoes || '',
      });
    }
  }, [inst, reset]);

  if (isLoading) return <Loading message="Carregando..." />;

  const clienteOptions = (clientesData?.data || []).map((c: Record<string, unknown>) => ({ value: c.id as string, label: c.nome as string }));

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ id, input: data });
      router.push(`/instalacoes/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar Instalação" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Tipo de Serviço" options={TIPOS} error={errors.tipo_servico?.message} {...register('tipo_servico')} />
          <Select label="Cliente" options={clienteOptions} placeholder="Selecione..." {...register('cliente_id')} />
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
        <Input label="Localização (link Google Maps/Waze)" {...register('localizacao_url')} placeholder="https://maps.google.com/..." />
        <Textarea label="Observações" {...register('observacoes')} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Salvar</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
