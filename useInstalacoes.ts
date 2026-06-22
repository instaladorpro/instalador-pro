import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { instalacoesService } from '../services/instalacoes.service'
import type { InstalacaoFiltros, StatusInstalacao } from '../types'
import type { InstalacaoInput } from '../utils/validators'

export function useInstalacoes(filtros: InstalacaoFiltros = {}) {
  const queryClient = useQueryClient()
  const queryKey = ['instalacoes', filtros]

  const query = useQuery({
    queryKey,
    queryFn: () => instalacoesService.getAll(filtros),
    staleTime: 1000 * 60 * 2,
  })

  const createMutation = useMutation({
    mutationFn: (input: InstalacaoInput) => instalacoesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
      queryClient.invalidateQueries({ queryKey: ['financeiro'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusInstalacao }) =>
      instalacoesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
      queryClient.invalidateQueries({ queryKey: ['financeiro'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => instalacoesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
    },
  })

  return {
    instalacoes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createInstalacao: createMutation.mutateAsync,
    updateStatus: (id: string, status: StatusInstalacao) =>
      updateStatusMutation.mutateAsync({ id, status }),
    deleteInstalacao: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  }
}

export function useInstalacaoDetalhe(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['instalacao', id],
    queryFn: () => instalacoesService.getById(id),
    enabled: !!id,
  })

  const historicoQuery = useQuery({
    queryKey: ['historico', id],
    queryFn: () => instalacoesService.getHistorico(id),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id: iId, status }: { id: string; status: StatusInstalacao }) =>
      instalacoesService.updateStatus(iId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacao', id] })
      queryClient.invalidateQueries({ queryKey: ['historico', id] })
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
      queryClient.invalidateQueries({ queryKey: ['financeiro'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (iId: string) => instalacoesService.delete(iId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
    },
  })

  return {
    instalacao: query.data,
    historico: historicoQuery.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateStatus: (iId: string, status: StatusInstalacao) =>
      updateStatusMutation.mutateAsync({ id: iId, status }),
    deleteInstalacao: deleteMutation.mutateAsync,
  }
}
