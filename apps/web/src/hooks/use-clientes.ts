import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as clientesService from '@/services/clientes.service';

function useOrgId() {
  return useAuthStore((s) => s.currentOrg?.id);
}

export function useClientes(filters: { search?: string; tipo?: string; page?: number } = {}) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['clientes', orgId, filters],
    queryFn: () => clientesService.list(orgId!, filters),
    enabled: !!orgId,
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clientesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => clientesService.create(orgId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      clientesService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['cliente'] });
    },
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
