import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as service from '@/services/extra-costs.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useExtraCosts(instalacaoId: string) {
  return useQuery({
    queryKey: ['extraCosts', instalacaoId],
    queryFn: () => service.getByInstalacao(instalacaoId),
    enabled: !!instalacaoId,
  });
}

export function useCreateExtraCost() {
  const orgId = useOrgId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { instalacao_id: string; descricao: string; valor: number; data: string; observacao?: string; comprovante_url?: string }) =>
      service.create(orgId!, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['extraCosts'] }); },
  });
}

export function useDeleteExtraCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['extraCosts'] }); },
  });
}
