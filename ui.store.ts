import { create } from 'zustand'
import type { StatusInstalacao } from '../types'

interface UIState {
  filtroStatus: StatusInstalacao | 'todas'
  searchQuery: string
  setFiltroStatus: (status: StatusInstalacao | 'todas') => void
  setSearchQuery: (q: string) => void
  resetFiltros: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  filtroStatus: 'todas',
  searchQuery: '',
  setFiltroStatus: (filtroStatus) => set({ filtroStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFiltros: () => set({ filtroStatus: 'todas', searchQuery: '' }),
}))
