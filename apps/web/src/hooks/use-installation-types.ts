import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as service from '@/services/installation-types.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useInstallationTypes(includeInactive = false) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['installationTypes', orgId, includeInactive],
    queryFn: () => service.list(orgId!, includeInactive),
    enabled: !!orgId,
  });
}

export function useCreateInstallationType() {
  const orgId = useOrgId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nome: string; descricao?: string; checklist_template_id?: string | null; material_template_id?: string | null }) =>
      service.create(orgId!, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationTypes'] }); },
  });
}

export function useUpdateInstallationType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { nome: string; descricao?: string; ativo?: boolean; checklist_template_id?: string | null; material_template_id?: string | null } }) =>
      service.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationTypes'] }); },
  });
}

export function useDeleteInstallationType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installationTypes'] }); },
  });
}
