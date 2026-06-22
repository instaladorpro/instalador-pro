'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const fetchOrgs = useAuthStore((s) => s.fetchOrgs)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await Promise.all([
          useAuthStore.getState().fetchProfile(),
          useAuthStore.getState().fetchOrgs(),
        ])
      }
      useAuthStore.setState({ isLoading: false })
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await Promise.all([
          useAuthStore.getState().fetchProfile(),
          useAuthStore.getState().fetchOrgs(),
        ])
      } else {
        setUser(null)
        useAuthStore.setState({
          profile: null,
          currentOrg: null,
          currentMember: null,
          organizations: [],
        })
      }
      useAuthStore.setState({ isLoading: false })
    })

    return () => subscription.unsubscribe()
  }, [setUser, fetchProfile, fetchOrgs])

  return <>{children}</>
}
