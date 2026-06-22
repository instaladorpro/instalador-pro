import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as instalacoesService from '@/services/instalacoes.service';

function useOrgId() {
  return useAuthStore((s) => s.currentOrg?.id);
}

export function useInstalacoes(filters: { status?: string; search?: string; page?: number } = {}) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['instalacoes', orgId, filters],
    queryFn: () => instalacoesService.list(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useInstalacao(id: string) {
  return useQuery({
    queryKey: ['instalacao', id],
    queryFn: () => instalacoesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInstalacao() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => instalacoesService.create(orgId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instalacoes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInstalacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      instalacoesService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instalacoes'] });
      qc.invalidateQueries({ queryKey: ['instalacao'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: ({ id, status, observacao }: { id: string; status: string; observacao?: string }) =>
      instalacoesService.updateStatus(id, status, userId!, observacao),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instalacoes'] });
      qc.invalidateQueries({ queryKey: ['instalacao'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useDeleteInstalacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instalacoesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instalacoes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useHistoricoStatus(instalacaoId: string) {
  return useQuery({
    queryKey: ['historico', instalacaoId],
    queryFn: () => instalacoesService.getHistorico(instalacaoId),
    enabled: !!instalacaoId,
  });
}
