import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import * as dashboardService from '@/services/dashboard.service';

function useOrgId() {
  return useAuthStore((s) => s.currentOrg?.id);
}

export function useDashboardStats() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['dashboard', 'stats', orgId],
    queryFn: () => dashboardService.getStats(orgId!),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}

export function useRecentInstalacoes() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['dashboard', 'recent', orgId],
    queryFn: () => dashboardService.getRecentInstalacoes(orgId!),
    enabled: !!orgId,
  });
}

export function useInstalacoesPorMes() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['dashboard', 'porMes', orgId],
    queryFn: () => dashboardService.getInstalacoesPorMes(orgId!),
    enabled: !!orgId,
  });
}

export function useInstalacoesPorStatus() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['dashboard', 'porStatus', orgId],
    queryFn: () => dashboardService.getInstalacoesPorStatus(orgId!),
    enabled: !!orgId,
  });
}
