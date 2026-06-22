import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recebimentosService } from '../services/recebimentos.service'
import type { RecebimentoInput } from '../utils/validators'

export function useFinanceiro(mes?: string) {
  const queryClient = useQueryClient()

  const pendenciasQuery = useQuery({
    queryKey: ['financeiro', 'pendencias'],
    queryFn: () => recebimentosService.getPendencias(),
    staleTime: 1000 * 60 * 2,
  })

  const resumoQuery = useQuery({
    queryKey: ['financeiro', 'resumo', mes],
    queryFn: () => recebimentosService.getResumoMensal(mes),
    staleTime: 1000 * 60 * 5,
  })

  const registerMutation = useMutation({
    mutationFn: ({ instalacaoId, input }: { instalacaoId: string; input: RecebimentoInput }) =>
      recebimentosService.register(instalacaoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro'] })
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
    },
  })

  const pendencias = pendenciasQuery.data ?? []
  const resumoMeses = resumoQuery.data ?? []

  const totalRecebido = resumoMeses.length > 0
    ? resumoMeses[0].total_recebido
    : 0

  const totalPendente = pendencias.reduce(
    (acc, p) => acc + p.saldo_pendente, 0
  )

  return {
    pendencias,
    resumoMeses,
    totalRecebido,
    totalPendente,
    isLoading: pendenciasQuery.isLoading || resumoQuery.isLoading,
    refetch: () => {
      pendenciasQuery.refetch()
      resumoQuery.refetch()
    },
    registrarRecebimento: (instalacaoId: string, input: RecebimentoInput) =>
      registerMutation.mutateAsync({ instalacaoId, input }),
  }
}
