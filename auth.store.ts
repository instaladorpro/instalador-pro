import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Instalador } from '../types'
import { supabase } from '../services/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  instalador: Instalador | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  fetchInstalador: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  instalador: null,
  isLoading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoading: false })
    // Só busca se ainda não tem o perfil em memória
    const { instalador } = get()
    if (session && !instalador) {
      get().fetchInstalador()
    }
  },

  fetchInstalador: async () => {
    const { data, error } = await supabase
      .from('instaladores')
      .select('*')
      .single()
    if (!error && data) {
      set({ instalador: data })
    }
  },

  reset: () => set({
    session: null,
    user: null,
    instalador: null,
    isLoading: false,
  }),
}))
