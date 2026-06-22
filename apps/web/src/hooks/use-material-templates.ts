import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as service from '@/services/material-templates.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useMaterialTemplates() {
  const orgId = useOrgId();
  return useQuery({ queryKey: ['materialTemplates', orgId], queryFn: () => service.list(orgId!), enabled: !!orgId });
}

export function useCreateMaterialTemplate() {
  const orgId = useOrgId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nome: string; descricao: string; items: { nome_material: string; quantidade: number; unidade?: string; sku?: string; categoria?: string }[] }) =>
      service.create(orgId!, data.nome, data.descricao, data.items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['materialTemplates'] }); },
  });
}

export function useUpdateMaterialTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; nome: string; descricao: string; items: { nome_material: string; quantidade: number; unidade?: string; sku?: string; categoria?: string }[] }) =>
      service.update(data.id, data.nome, data.descricao, data.items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['materialTemplates'] }); },
  });
}

export function useDeleteMaterialTemplate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => service.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['materialTemplates'] }); } });
}

export function useDuplicateMaterialTemplate() {
  const orgId = useOrgId(); const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => service.duplicate(id, orgId!), onSuccess: () => { qc.invalidateQueries({ queryKey: ['materialTemplates'] }); } });
}

export function useInstallationMaterials(instalacaoId: string) {
  return useQuery({ queryKey: ['installationMaterials', instalacaoId], queryFn: () => service.getByInstalacao(instalacaoId), enabled: !!instalacaoId });
}

export function useApplyMaterialTemplate() {
  const orgId = useOrgId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, instalacaoId }: { templateId: string; instalacaoId: string }) =>
      service.applyToInstalacao(templateId, orgId!, instalacaoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationMaterials'] }); },
  });
}

export function useToggleMaterialItem() {
  const userId = useAuthStore((s) => s.user?.id); const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, conferido }: { itemId: string; conferido: boolean }) => service.toggleItemConferido(itemId, conferido, userId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationMaterials'] }); },
  });
}

export function useAddMaterialItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, item }: { listId: string; item: { nome_material: string; quantidade: number; unidade?: string; ordem: number } }) =>
      service.addItem(listId, item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationMaterials'] }); },
  });
}

export function useRemoveMaterialItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (itemId: string) => service.removeItem(itemId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationMaterials'] }); } });
}

export function useRemoveMaterialList() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (listId: string) => service.removeList(listId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationMaterials'] }); } });
}
