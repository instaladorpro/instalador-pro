-- ============================================================
-- 006_seed.sql
-- Sample data for development/testing
-- Run with: supabase db seed
-- NOTE: This requires a test user in auth.users first.
--        Use Supabase Dashboard or Auth API to create test users,
--        then update the UUIDs below.
-- ============================================================

-- Placeholder UUIDs (replace with real auth.users IDs after signup)
DO $$
DECLARE
  v_org_id UUID := uuid_generate_v4();
  v_org2_id UUID := uuid_generate_v4();
  v_cliente1_id UUID;
  v_cliente2_id UUID;
  v_cliente3_id UUID;
  v_equipe1_id UUID;
  v_equipe2_id UUID;
  v_inst1_id UUID;
  v_inst2_id UUID;
  v_inst3_id UUID;
  v_checklist_id UUID;
BEGIN

  -- ============================================================
  -- Organizations
  -- ============================================================
  INSERT INTO organizations (id, nome, cnpj, email, telefone, cidade, estado, plano)
  VALUES
    (v_org_id, 'Solar Tech Instalacoes', '12345678000190', 'contato@solartech.com.br', '31999990001', 'Belo Horizonte', 'MG', 'pro'),
    (v_org2_id, 'EcoSol Energia', '98765432000110', 'contato@ecosol.com.br', '11999990002', 'Sao Paulo', 'SP', 'free');

  -- ============================================================
  -- Clientes
  -- ============================================================
  INSERT INTO clientes (id, organization_id, nome, email, telefone, cpf_cnpj, cidade, estado, tipo)
  VALUES
    (uuid_generate_v4(), v_org_id, 'Maria Silva', 'maria@email.com', '31988880001', '12345678901', 'Belo Horizonte', 'MG', 'residencial')
  RETURNING id INTO v_cliente1_id;

  INSERT INTO clientes (id, organization_id, nome, email, telefone, cpf_cnpj, cidade, estado, tipo)
  VALUES
    (uuid_generate_v4(), v_org_id, 'Padaria Pao Dourado LTDA', 'padaria@email.com', '31977770002', '12345678000199', 'Contagem', 'MG', 'comercial')
  RETURNING id INTO v_cliente2_id;

  INSERT INTO clientes (id, organization_id, nome, email, telefone, cpf_cnpj, cidade, estado, tipo)
  VALUES
    (uuid_generate_v4(), v_org_id, 'Joao Fazenda', 'joao@email.com', '31966660003', '98765432100', 'Sete Lagoas', 'MG', 'rural')
  RETURNING id INTO v_cliente3_id;

  -- ============================================================
  -- Equipes
  -- ============================================================
  INSERT INTO equipes (id, organization_id, nome, tipo)
  VALUES (uuid_generate_v4(), v_org_id, 'Equipe Alpha', 'fixa')
  RETURNING id INTO v_equipe1_id;

  INSERT INTO equipes (id, organization_id, nome, tipo)
  VALUES (uuid_generate_v4(), v_org_id, 'Equipe Beta', 'diarista')
  RETURNING id INTO v_equipe2_id;

  -- ============================================================
  -- Instalacoes
  -- ============================================================
  INSERT INTO instalacoes (id, organization_id, cliente_id, equipe_id, tipo_servico, cidade, estado, potencia_kwp, numero_paineis, inversor, status, valor_total, data_prevista, data_inicio, data_conclusao)
  VALUES (uuid_generate_v4(), v_org_id, v_cliente1_id, v_equipe1_id, 'Instalacao Residencial', 'Belo Horizonte', 'MG', 6.60, 12, 'Growatt MIN 6000TL-X', 'concluida', 28500.00, '2026-05-15', '2026-05-15', '2026-05-17')
  RETURNING id INTO v_inst1_id;

  INSERT INTO instalacoes (id, organization_id, cliente_id, equipe_id, tipo_servico, cidade, estado, potencia_kwp, numero_paineis, inversor, status, valor_total, data_prevista)
  VALUES (uuid_generate_v4(), v_org_id, v_cliente2_id, v_equipe1_id, 'Instalacao Comercial', 'Contagem', 'MG', 15.40, 28, 'Sungrow SG15RT', 'agendada', 62000.00, '2026-07-10')
  RETURNING id INTO v_inst2_id;

  INSERT INTO instalacoes (id, organization_id, cliente_id, equipe_id, tipo_servico, cidade, estado, potencia_kwp, numero_paineis, inversor, status, valor_total, data_prevista, data_inicio)
  VALUES (uuid_generate_v4(), v_org_id, v_cliente3_id, v_equipe2_id, 'Instalacao Rural', 'Sete Lagoas', 'MG', 10.00, 18, 'Deye SUN-10K-SG04LP3', 'em_andamento', 45000.00, '2026-06-20', '2026-06-20')
  RETURNING id INTO v_inst3_id;

  -- ============================================================
  -- Recebimentos
  -- ============================================================
  INSERT INTO recebimentos (organization_id, instalacao_id, valor, forma_pagamento, data_recebimento, observacoes)
  VALUES
    (v_org_id, v_inst1_id, 14250.00, 'pix', '2026-05-10', 'Sinal - 50%'),
    (v_org_id, v_inst1_id, 14250.00, 'transferencia', '2026-05-20', 'Parcela final'),
    (v_org_id, v_inst2_id, 18600.00, 'pix', '2026-06-15', 'Sinal - 30%');

  -- ============================================================
  -- Equipamentos
  -- ============================================================
  INSERT INTO equipamentos (organization_id, nome, marca, modelo, tipo, quantidade, preco_unitario, fornecedor)
  VALUES
    (v_org_id, 'Painel Solar 550W', 'Canadian Solar', 'CS7L-550MS', 'painel', 120, 890.00, 'Aldo Solar'),
    (v_org_id, 'Inversor 6kW', 'Growatt', 'MIN 6000TL-X', 'inversor', 8, 3200.00, 'Aldo Solar'),
    (v_org_id, 'Inversor 15kW', 'Sungrow', 'SG15RT', 'inversor', 3, 7800.00, 'NeoSolar'),
    (v_org_id, 'Estrutura Telhado Colonial', 'Romagnole', 'RSF-12', 'estrutura', 15, 1450.00, 'Romagnole'),
    (v_org_id, 'Cabo Solar 6mm', 'Nexans', 'ENERGYFLEX SOLAR', 'cabo', 500, 12.50, 'Aldo Solar');

  -- ============================================================
  -- Checklist
  -- ============================================================
  INSERT INTO checklists (id, organization_id, instalacao_id, nome)
  VALUES (uuid_generate_v4(), v_org_id, v_inst3_id, 'Checklist Instalacao Rural')
  RETURNING id INTO v_checklist_id;

  INSERT INTO checklist_items (checklist_id, descricao, obrigatorio, ordem) VALUES
    (v_checklist_id, 'Vistoria do telhado/estrutura', true, 1),
    (v_checklist_id, 'Instalacao da estrutura de fixacao', true, 2),
    (v_checklist_id, 'Instalacao dos paineis', true, 3),
    (v_checklist_id, 'Passagem de cabos DC', true, 4),
    (v_checklist_id, 'Instalacao do inversor', true, 5),
    (v_checklist_id, 'Conexao ao quadro eletrico', true, 6),
    (v_checklist_id, 'Teste de funcionamento', true, 7),
    (v_checklist_id, 'Fotos antes/depois', true, 8),
    (v_checklist_id, 'Limpeza do local', false, 9),
    (v_checklist_id, 'Assinatura do cliente', true, 10);

  -- ============================================================
  -- Documentos
  -- ============================================================
  INSERT INTO documentos (organization_id, instalacao_id, cliente_id, tipo, nome, storage_path)
  VALUES
    (v_org_id, v_inst1_id, v_cliente1_id, 'contrato', 'Contrato Maria Silva', 'documentos/org1/contrato_maria_silva.pdf'),
    (v_org_id, v_inst1_id, v_cliente1_id, 'procuracao', 'Procuracao Maria Silva', 'documentos/org1/procuracao_maria_silva.pdf');

  RAISE NOTICE 'Seed data inserted. Org ID: %, Org2 ID: %', v_org_id, v_org2_id;

END $$;
