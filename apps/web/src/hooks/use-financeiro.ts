import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as financeiroService from '@/services/financeiro.service';

function useOrgId() {
  return useAuthStore((s) => s.currentOrg?.id);
}

export function usePendencias() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['financeiro', 'pendencias', orgId],
    queryFn: () => financeiroService.getPendencias(orgId!),
    enabled: !!orgId,
  });
}

export function useResumoMensal(meses = 6) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['financeiro', 'mensal', orgId, meses],
    queryFn: () => financeiroService.getResumoMensal(orgId!, meses),
    enabled: !!orgId,
  });
}

export function useRecebimentos(filters: { instalacaoId?: string; page?: number } = {}) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['financeiro', 'recebimentos', orgId, filters],
    queryFn: () => financeiroService.getRecebimentos(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useRegistrarRecebimento() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => financeiroService.registrarRecebimento(orgId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
      qc.invalidateQueries({ queryKey: ['instalacoes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
