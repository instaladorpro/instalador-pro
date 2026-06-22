import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Organization, OrgMember } from '@instalador-pro/shared'

interface CurrentOrg {
  organization: Organization
  member: OrgMember
}

export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const supabase = createClient()
  const cookieStore = cookies()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const orgId = cookieStore.get('current_org_id')?.value
  if (!orgId) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (!member) return null

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (!organization) return null

  return {
    organization: organization as Organization,
    member: member as OrgMember,
  }
}
