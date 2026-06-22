'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import type { Organization, OrgMember, OrgRole } from '@instalador-pro/shared'
import Link from 'next/link'

interface OrgWithMember {
  org: Organization
  member: OrgMember
}

const roleLabels: Record<OrgRole, string> = {
  owner: 'Proprietario',
  admin: 'Administrador',
  tecnico: 'Tecnico',
  financeiro: 'Financeiro',
}

export default function SelectOrgPage() {
  const router = useRouter()
  const setOrg = useAuthStore((s) => s.setOrg)
  const [orgs, setOrgs] = useState<OrgWithMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: members } = await supabase
        .from('org_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)
        .eq('ativo', true)

      if (!members || members.length === 0) {
        router.push('/create-org')
        return
      }

      if (members.length === 1) {
        const org = members[0].organizations as Organization
        const { organizations: _o, ...memberData } = members[0]
        setOrg(org, memberData as unknown as OrgMember)
        router.push('/inicio')
        return
      }

      const mapped = members.map((m: Record<string, unknown>) => {
        const { organizations: orgData, ...memberData } = m
        return {
          org: orgData as Organization,
          member: memberData as unknown as OrgMember,
        }
      })

      setOrgs(mapped)
      setLoading(false)
    }

    load()
  }, [router, setOrg])

  function handleSelect(item: OrgWithMember) {
    setOrg(item.org, item.member)
    router.push('/inicio')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Selecionar empresa</h2>
      <p className="mb-6 text-sm text-gray-500">
        Voce faz parte de mais de uma empresa. Selecione qual deseja acessar.
      </p>

      <div className="flex flex-col gap-3">
        {orgs.map((item) => (
          <button
            key={item.org.id}
            onClick={() => handleSelect(item)}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{item.org.nome}</p>
              {item.org.cnpj && (
                <p className="text-xs text-gray-500">{item.org.cnpj}</p>
              )}
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {roleLabels[item.member.role]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4 text-center">
        <Link
          href="/create-org"
          className="text-sm font-medium text-primary hover:underline"
        >
          Criar nova empresa
        </Link>
      </div>
    </div>
  )
}
