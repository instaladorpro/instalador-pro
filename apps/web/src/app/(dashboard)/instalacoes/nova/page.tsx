'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInstalacao } from '@/hooks/use-instalacoes';
import { useClientes } from '@/hooks/use-clientes';
import { useInstallationTypes } from '@/hooks/use-installation-types';
import { PageHeader, Button, Input, Select, Textarea } from '@/components/ui';

const schema = z.object({
  tipo_servico: z.string().min(1, 'Selecione o tipo'),
  installation_type_id: z.string().optional(),
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

const ESTADOS = 'AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO'.split(',').map((s) => ({ value: s, label: s }));

export default function NovaInstalacaoPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateInstalacao();
  const { data: clientesData } = useClientes({ limit: 100 } as never);
  const { data: installationTypes } = useInstallationTypes();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const clienteOptions = (clientesData?.data || []).map((c: Record<string, unknown>) => ({
    value: c.id as string, label: c.nome as string,
  }));

  const typeOptions = (installationTypes || []).map((t: Record<string, unknown>) => ({
    value: t.id as string, label: t.nome as string,
  }));

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const typeId = e.target.value;
    setValue('installation_type_id', typeId);
    const selected = (installationTypes || []).find((t: Record<string, unknown>) => t.id === typeId);
    if (selected) {
      setValue('tipo_servico', selected.nome as string);
    }
  }

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
          {typeOptions.length > 0 ? (
            <div>
              <Select label="Tipo de Instalação" options={typeOptions} placeholder="Selecione o tipo..."
                onChange={handleTypeChange} error={errors.tipo_servico?.message} />
              <input type="hidden" {...register('tipo_servico')} />
              <input type="hidden" {...register('installation_type_id')} />
            </div>
          ) : (
            <Input label="Tipo de Serviço" error={errors.tipo_servico?.message} {...register('tipo_servico')} placeholder="Ex: Residencial" />
          )}
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

        {/* Show suggested templates if type has defaults */}
        {watch('installation_type_id') && (() => {
          const selected = (installationTypes || []).find((t: Record<string, unknown>) => t.id === watch('installation_type_id'));
          if (!selected) return null;
          const hasChecklist = selected.checklist_templates;
          const hasMaterial = selected.material_list_templates;
          if (!hasChecklist && !hasMaterial) return null;
          return (
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">Modelos sugeridos para este tipo:</p>
              {hasChecklist && <p>✅ Checklist: {(hasChecklist as Record<string, unknown>).nome as string}</p>}
              {hasMaterial && <p>📦 Materiais: {(hasMaterial as Record<string, unknown>).nome as string}</p>}
              <p className="text-blue-500 mt-1">Serão disponíveis após criar a instalação.</p>
            </div>
          );
        })()}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Criar Instalação</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
