'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCliente, useUpdateCliente } from '@/hooks/use-clientes';
import { PageHeader, Button, Input, Select, Textarea, Loading } from '@/components/ui';

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
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'rural', label: 'Rural' },
];

const ESTADOS = 'AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO'.split(',').map((s) => ({ value: s, label: s }));

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: cliente, isLoading } = useCliente(id);
  const { mutateAsync, isPending } = useUpdateCliente();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (cliente) reset({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cpf_cnpj: cliente.cpf_cnpj || '',
      tipo: cliente.tipo || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      observacoes: cliente.observacoes || '',
    });
  }, [cliente, reset]);

  if (isLoading) return <Loading message="Carregando..." />;

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ id, input: data });
      router.push(`/clientes/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar Cliente" />
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
          <Button type="submit" loading={isPending}>Salvar</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
