import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as templatesService from '@/services/checklist-templates.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useChecklistTemplates() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['checklistTemplates', orgId],
    queryFn: () => templatesService.list(orgId!),
    enabled: !!orgId,
  });
}

export function useChecklistTemplate(id: string) {
  return useQuery({
    queryKey: ['checklistTemplate', id],
    queryFn: () => templatesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nome, descricao, items }: { nome: string; descricao: string; items: { descricao: string; obrigatorio: boolean }[] }) =>
      templatesService.create(orgId!, nome, descricao, items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklistTemplates'] }); },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome, descricao, items }: { id: string; nome: string; descricao: string; items: { id?: string; descricao: string; obrigatorio: boolean }[] }) =>
      templatesService.update(id, nome, descricao, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklistTemplates'] });
      qc.invalidateQueries({ queryKey: ['checklistTemplate'] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklistTemplates'] }); },
  });
}

export function useDuplicateTemplate() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesService.duplicate(id, orgId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklistTemplates'] }); },
  });
}

export function useApplyTemplate() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, instalacaoId }: { templateId: string; instalacaoId: string }) =>
      templatesService.applyToInstalacao(templateId, orgId!, instalacaoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}
