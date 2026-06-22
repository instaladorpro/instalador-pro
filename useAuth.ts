import { useAuthStore } from '../store/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const { session, user, instalador, isLoading, reset } = useAuthStore()

  async function signOut() {
    await authService.signOut()
    reset()
  }

  return {
    session,
    user,
    instalador,
    isLoading,
    isAuthenticated: !!session,
    signOut,
  }
}
