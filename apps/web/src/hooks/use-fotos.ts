import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as fotosService from '@/services/fotos.service';

function useOrgId() { return useAuthStore((s) => s.currentOrg?.id); }

export function useFotos(instalacaoId: string) {
  return useQuery({
    queryKey: ['fotos', instalacaoId],
    queryFn: () => fotosService.getByInstalacao(instalacaoId),
    enabled: !!instalacaoId,
  });
}

export function useUploadFoto() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instalacaoId, file, categoria, descricao }: { instalacaoId: string; file: File; categoria: string; descricao?: string }) =>
      fotosService.upload(orgId!, instalacaoId, file, categoria, descricao),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fotos'] }); },
  });
}

export function useDeleteFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => fotosService.remove(id, storagePath),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fotos'] }); },
  });
}

export function useFotoUrl(path: string) {
  return useQuery({
    queryKey: ['fotoUrl', path],
    queryFn: () => fotosService.getSignedUrl(path),
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
  });
}
