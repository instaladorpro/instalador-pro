-- ============================================================
-- 005_views.sql
-- Useful views for dashboard and reports
-- ============================================================

-- ============================================================
-- Monthly financial summary per org
-- ============================================================
CREATE OR REPLACE VIEW resumo_financeiro_mensal AS
SELECT
  i.organization_id,
  DATE_TRUNC('month', r.data_recebimento) AS mes,
  COUNT(DISTINCT r.id) AS total_recebimentos,
  SUM(r.valor) AS valor_recebido,
  COUNT(DISTINCT i.id) AS instalacoes_com_pagamento,
  SUM(i.valor_total) AS valor_total_instalacoes
FROM recebimentos r
JOIN instalacoes i ON r.instalacao_id = i.id
WHERE r.data_recebimento IS NOT NULL
GROUP BY i.organization_id, DATE_TRUNC('month', r.data_recebimento);

-- ============================================================
-- Completed but unpaid installations
-- ============================================================
CREATE OR REPLACE VIEW instalacoes_pendentes AS
SELECT
  i.id,
  i.organization_id,
  i.cliente_id,
  c.nome AS cliente_nome,
  c.telefone AS cliente_telefone,
  i.valor_total,
  COALESCE(SUM(r.valor), 0) AS valor_recebido,
  i.valor_total - COALESCE(SUM(r.valor), 0) AS saldo_pendente,
  i.data_conclusao,
  i.status
FROM instalacoes i
JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN recebimentos r ON r.instalacao_id = i.id
WHERE i.status = 'concluida'
GROUP BY i.id, i.organization_id, i.cliente_id, c.nome, c.telefone,
         i.valor_total, i.data_conclusao, i.status
HAVING i.valor_total - COALESCE(SUM(r.valor), 0) > 0;

-- ============================================================
-- Dashboard stats per org
-- ============================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  o.id AS organization_id,
  (SELECT COUNT(*) FROM clientes cl WHERE cl.organization_id = o.id) AS total_clientes,
  (SELECT COUNT(*) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status = 'agendada') AS instalacoes_agendadas,
  (SELECT COUNT(*) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status = 'em_andamento') AS instalacoes_em_andamento,
  (SELECT COUNT(*) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status = 'concluida') AS instalacoes_concluidas,
  (SELECT COUNT(*) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status = 'paga') AS instalacoes_pagas,
  (SELECT COALESCE(SUM(inst.valor_total), 0) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status != 'cancelada') AS receita_total,
  (SELECT COALESCE(SUM(r.valor), 0) FROM recebimentos r WHERE r.organization_id = o.id) AS total_recebido,
  (SELECT COALESCE(SUM(inst.potencia_kwp), 0) FROM instalacoes inst WHERE inst.organization_id = o.id AND inst.status IN ('concluida', 'paga')) AS kwp_instalado,
  (SELECT COUNT(*) FROM equipes eq WHERE eq.organization_id = o.id AND eq.ativa = true) AS equipes_ativas
FROM organizations o;
