import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const currentOrg = useAuthStore((s) => s.currentOrg)
  const currentMember = useAuthStore((s) => s.currentMember)
  const organizations = useAuthStore((s) => s.organizations)
  const isLoading = useAuthStore((s) => s.isLoading)
  const signOut = useAuthStore((s) => s.signOut)
  const setOrg = useAuthStore((s) => s.setOrg)

  return {
    user,
    profile,
    currentOrg,
    currentMember,
    organizations,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    setOrg,
  }
}
