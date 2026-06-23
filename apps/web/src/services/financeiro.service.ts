import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

export async function getPendencias(orgId: string) {
  const { data, error } = await supabase
    .from('instalacoes')
    .select('id, tipo_servico, endereco, valor_total, data_conclusao, clientes(nome), recebimentos(valor)')
    .eq('organization_id', orgId)
    .eq('status', 'concluida')
    .order('data_conclusao', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((inst) => {
    const recebimentos = (inst.recebimentos as { valor: number }[]) || [];
    const totalRecebido = recebimentos.reduce((s, r) => s + Number(r.valor), 0);
    const valorTotal = Number(inst.valor_total) || 0;
    const saldoPendente = valorTotal - totalRecebido;
    return { ...inst, totalRecebido, saldoPendente };
  });
}

export async function getResumoMensal(orgId: string, meses = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - meses);

  const { data, error } = await supabase
    .from('recebimentos')
    .select('valor, data_recebimento')
    .eq('organization_id', orgId)
    .gte('data_recebimento', startDate.toISOString().split('T')[0]);

  if (error) throw new Error(error.message);

  const mensal: Record<string, number> = {};
  (data || []).forEach((r) => {
    const key = r.data_recebimento.substring(0, 7);
    mensal[key] = (mensal[key] || 0) + Number(r.valor);
  });

  return Object.entries(mensal)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export async function registrarRecebimento(orgId: string, input: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('recebimentos')
    .insert({ ...input, organization_id: orgId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.instalacao_id) {
    const { data: allRecebimentos } = await supabase
      .from('recebimentos')
      .select('valor')
      .eq('instalacao_id', input.instalacao_id);

    const totalRecebido = (allRecebimentos || []).reduce((s, r) => s + Number(r.valor), 0);

    const { data: instalacao } = await supabase
      .from('instalacoes')
      .select('valor_total')
      .eq('id', input.instalacao_id)
      .single();

    const valorTotal = Number(instalacao?.valor_total) || 0;

    if (totalRecebido >= valorTotal) {
      await supabase
        .from('instalacoes')
        .update({ status: 'paga' })
        .eq('id', input.instalacao_id);
    }
  }

  return data;
}

export async function getRecebimentosPorInstalacao(instalacaoId: string) {
  const { data, error } = await supabase
    .from('recebimentos')
    .select('*')
    .eq('instalacao_id', instalacaoId)
    .order('data_recebimento', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getRecebimentos(orgId: string, filters: { instalacaoId?: string; page?: number; limit?: number } = {}) {
  const { instalacaoId, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('recebimentos')
    .select('*, instalacoes(id, tipo_servico, endereco)', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('data_recebimento', { ascending: false })
    .range(from, to);

  if (instalacaoId) query = query.eq('instalacao_id', instalacaoId);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: data || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}
