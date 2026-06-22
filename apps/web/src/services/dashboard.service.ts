import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getStats(orgId: string) {
  const [instalacoes, clientes, receitaMes, pendencias] = await Promise.all([
    supabase.from('instalacoes').select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId).in('status', ['agendada', 'em_andamento']),
    supabase.from('clientes').select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase.from('recebimentos').select('valor')
      .eq('organization_id', orgId)
      .gte('data_recebimento', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('instalacoes').select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId).eq('status', 'concluida'),
  ]);

  const receitaTotal = (receitaMes.data || []).reduce((sum, r) => sum + Number(r.valor), 0);

  return {
    instalacoesAtivas: instalacoes.count || 0,
    receitaMensal: receitaTotal,
    totalClientes: clientes.count || 0,
    pendencias: pendencias.count || 0,
  };
}

export async function getRecentInstalacoes(orgId: string, limit = 5) {
  const { data, error } = await supabase
    .from('instalacoes')
    .select('id, tipo_servico, endereco, status, valor_total, data_prevista, clientes(nome)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getInstalacoesPorMes(orgId: string, meses = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - meses);

  const { data, error } = await supabase
    .from('instalacoes')
    .select('created_at')
    .eq('organization_id', orgId)
    .gte('created_at', startDate.toISOString());

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  (data || []).forEach((item) => {
    const key = item.created_at.substring(0, 7);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([mes, count]) => ({ mes, count }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export async function getInstalacoesPorStatus(orgId: string) {
  const { data, error } = await supabase
    .from('instalacoes')
    .select('status')
    .eq('organization_id', orgId);

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  (data || []).forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
  });

  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}
