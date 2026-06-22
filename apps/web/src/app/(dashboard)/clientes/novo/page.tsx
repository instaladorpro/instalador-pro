'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCliente } from '@/hooks/use-clientes';
import { PageHeader, Button, Input, Select, Textarea } from '@/components/ui';

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  telefone: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  tipo: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIPOS = [
  { value: 'pf', label: 'Pessoa Física' },
  { value: 'pj', label: 'Pessoa Jurídica' },
];

const ESTADOS = 'AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO'.split(',').map((s) => ({ value: s, label: s }));

export default function NovoClientePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateCliente();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync(data);
      router.push('/clientes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar cliente');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo Cliente" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Telefone" {...register('telefone')} />
          <Input label="CPF/CNPJ" {...register('cpf_cnpj')} />
        </div>
        <Select label="Tipo" options={TIPOS} placeholder="Selecione..." {...register('tipo')} />
        <Input label="Endereço" {...register('endereco')} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Cidade" {...register('cidade')} />
          <Select label="Estado" options={ESTADOS} placeholder="UF" {...register('estado')} />
          <Input label="CEP" {...register('cep')} />
        </div>
        <Textarea label="Observações" {...register('observacoes')} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending}>Cadastrar</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
