import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empresasService } from '../services/empresas.service'
import type { EmpresaInput } from '../utils/validators'

export function useEmpresas(apenasAtivas = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['empresas', { apenasAtivas }],
    queryFn: () => empresasService.getAll(apenasAtivas),
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: (input: EmpresaInput) => empresasService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empresas'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmpresaInput> }) =>
      empresasService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empresas'] }),
  })

  const arquivarMutation = useMutation({
    mutationFn: (id: string) => empresasService.arquivar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empresas'] }),
  })

  return {
    empresas: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createEmpresa: createMutation.mutateAsync,
    updateEmpresa: (id: string, input: Partial<EmpresaInput>) =>
      updateMutation.mutateAsync({ id, input }),
    arquivarEmpresa: arquivarMutation.mutateAsync,
  }
}
