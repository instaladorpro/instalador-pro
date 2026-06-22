import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as estoqueService from '@/services/estoque.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useEquipamentos(filters: { search?: string; page?: number } = {}) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['equipamentos', orgId, filters],
    queryFn: () => estoqueService.list(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useEquipamento(id: string) {
  return useQuery({ queryKey: ['equipamento', id], queryFn: () => estoqueService.getById(id), enabled: !!id });
}

export function useCreateEquipamento() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => estoqueService.create(orgId!, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }); },
  });
}

export function useUpdateEquipamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => estoqueService.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }); qc.invalidateQueries({ queryKey: ['equipamento'] }); },
  });
}

export function useDeleteEquipamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estoqueService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }); },
  });
}
