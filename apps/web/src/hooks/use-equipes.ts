import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as equipesService from '@/services/equipes.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useEquipes(filters: { search?: string; page?: number } = {}) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['equipes', orgId, filters],
    queryFn: () => equipesService.list(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useEquipe(id: string) {
  return useQuery({
    queryKey: ['equipe', id],
    queryFn: () => equipesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEquipe() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => equipesService.create(orgId!, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipes'] }); },
  });
}

export function useUpdateEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => equipesService.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipes'] }); qc.invalidateQueries({ queryKey: ['equipe'] }); },
  });
}

export function useDeleteEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipesService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipes'] }); },
  });
}

export function useAddMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ equipeId, profileId, funcao }: { equipeId: string; profileId: string; funcao: string }) =>
      equipesService.addMembro(equipeId, profileId, funcao),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipe'] }); },
  });
}

export function useRemoveMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membroId: string) => equipesService.removeMembro(membroId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipe'] }); },
  });
}

export function useOrgMembers() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['orgMembers', orgId],
    queryFn: () => equipesService.getOrgMembers(orgId!),
    enabled: !!orgId,
  });
}
