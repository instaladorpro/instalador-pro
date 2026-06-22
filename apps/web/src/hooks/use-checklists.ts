import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as checklistsService from '@/services/checklists.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useChecklists(instalacaoId: string) {
  return useQuery({
    queryKey: ['checklists', instalacaoId],
    queryFn: () => checklistsService.getByInstalacao(instalacaoId),
    enabled: !!instalacaoId,
  });
}

export function useCreateChecklist() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instalacaoId, nome, items }: { instalacaoId: string; nome: string; items: { descricao: string; obrigatorio: boolean }[] }) =>
      checklistsService.create(orgId!, instalacaoId, nome, items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}

export function useToggleItem() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, concluido }: { itemId: string; concluido: boolean }) =>
      checklistsService.toggleItem(itemId, concluido, userId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}

export function useDeleteChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistsService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}
