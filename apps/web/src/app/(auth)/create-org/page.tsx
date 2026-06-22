'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { organizationSchema, type OrganizationInput } from '@instalador-pro/shared'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import type { Organization, OrgMember } from '@instalador-pro/shared'
import Link from 'next/link'

export default function CreateOrgPage() {
  const router = useRouter()
  const setOrg = useAuthStore((s) => s.setOrg)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
  })

  async function onSubmit(data: OrganizationInput) {
    setError(null)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        nome: data.nome,
        cnpj: data.cnpj || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
      })
      .select()
      .single()

    if (orgError || !org) {
      console.error('Org create error:', orgError)
      setError(`Erro: ${orgError?.message || 'Desconhecido'} (${orgError?.code || ''})`)
      return
    }

    const { data: member, error: memberError } = await supabase
      .from('org_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })
      .select()
      .single()

    if (memberError || !member) {
      setError('Empresa criada, mas erro ao vincular usuario. Entre em contato com o suporte.')
      return
    }

    setOrg(org as Organization, member as OrgMember)
    router.push('/inicio')
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Criar empresa</h2>
      <p className="mb-6 text-sm text-gray-500">
        Cadastre sua empresa para comecar a usar a plataforma.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
            Nome da empresa *
          </label>
          <input
            id="nome"
            type="text"
            {...register('nome')}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Minha Empresa Solar"
          />
          {errors.nome && (
            <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cnpj" className="mb-1 block text-sm font-medium text-gray-700">
            CNPJ (opcional)
          </label>
          <input
            id="cnpj"
            type="text"
            {...register('cnpj')}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="00.000.000/0000-00"
          />
          {errors.cnpj && (
            <p className="mt-1 text-xs text-red-600">{errors.cnpj.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email da empresa (opcional)
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="contato@empresa.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="telefone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefone (opcional)
          </label>
          <input
            id="telefone"
            type="text"
            {...register('telefone')}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && (
            <p className="mt-1 text-xs text-red-600">{errors.telefone.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Criando...' : 'Criar empresa'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/select-org" className="font-medium text-primary hover:underline">
          Voltar para selecao de empresa
        </Link>
      </p>
    </div>
  )
}
