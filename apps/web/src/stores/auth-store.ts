import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, Organization, OrgMember } from '@instalador-pro/shared'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  profile: Profile | null
  currentOrg: Organization | null
  currentMember: OrgMember | null
  organizations: Organization[]
  isLoading: boolean

  setUser: (user: User | null) => void
  setOrg: (org: Organization | null, member: OrgMember | null) => void
  fetchProfile: () => Promise<void>
  fetchOrgs: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  currentOrg: null,
  currentMember: null,
  organizations: [],
  isLoading: true,

  setUser: (user) => set({ user }),

  setOrg: (org, member) => {
    if (org) {
      document.cookie = `current_org_id=${org.id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    } else {
      document.cookie = 'current_org_id=; path=/; max-age=0'
    }
    set({ currentOrg: org, currentMember: member })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      set({ profile: data as Profile })
    }
  },

  fetchOrgs: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createClient()
    const { data: members } = await supabase
      .from('org_members')
      .select('*, organizations(*)')
      .eq('user_id', user.id)
      .eq('ativo', true)

    if (members && members.length > 0) {
      const orgs = members.map((m: Record<string, unknown>) => m.organizations as Organization)
      set({ organizations: orgs })

      const currentOrgId = getCookie('current_org_id')
      const matchedMember = currentOrgId
        ? members.find((m: Record<string, unknown>) => (m.organizations as Organization)?.id === currentOrgId)
        : null

      if (matchedMember) {
        const org = matchedMember.organizations as Organization
        const { organizations: _orgs, ...memberData } = matchedMember
        set({ currentOrg: org, currentMember: memberData as unknown as OrgMember })
      } else if (members.length === 1) {
        const org = members[0].organizations as Organization
        const { organizations: _orgs, ...memberData } = members[0]
        get().setOrg(org, memberData as unknown as OrgMember)
      }
    } else {
      set({ organizations: [] })
    }
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    document.cookie = 'current_org_id=; path=/; max-age=0'
    set({
      user: null,
      profile: null,
      currentOrg: null,
      currentMember: null,
      organizations: [],
    })
    window.location.href = '/login'
  },
}))

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : undefined
}
