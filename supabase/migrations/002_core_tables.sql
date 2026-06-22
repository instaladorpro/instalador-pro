-- ============================================================
-- 002_core_tables.sql
-- Core business tables: clientes, equipes, instalacoes, etc.
-- ============================================================

-- ============================================================
-- Clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  tipo TEXT NOT NULL DEFAULT 'residencial' CHECK (tipo IN ('residencial', 'comercial', 'industrial', 'rural')),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Equipes
-- ============================================================
CREATE TABLE IF NOT EXISTS equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  responsavel_id UUID REFERENCES profiles(id),
  tipo TEXT NOT NULL DEFAULT 'fixa' CHECK (tipo IN ('fixa', 'diarista')),
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Equipe membros
-- ============================================================
CREATE TABLE IF NOT EXISTS equipe_membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  funcao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, profile_id)
);

-- ============================================================
-- Instalacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS instalacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  tipo_servico TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  potencia_kwp DECIMAL(10,2),
  numero_paineis INTEGER,
  inversor TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'paga', 'cancelada')),
  valor_total DECIMAL(12,2),
  data_prevista DATE,
  data_inicio DATE,
  data_conclusao DATE,
  observacoes TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Recebimentos
-- ============================================================
CREATE TABLE IF NOT EXISTS recebimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  valor DECIMAL(12,2) NOT NULL,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('pix', 'dinheiro', 'transferencia', 'boleto', 'cartao')),
  data_recebimento DATE,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Equipamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  tipo TEXT,
  quantidade INTEGER NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'un',
  preco_unitario DECIMAL(12,2),
  fornecedor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Documentos
-- ============================================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  instalacao_id UUID REFERENCES instalacoes(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('contrato', 'procuracao', 'nota_fiscal', 'laudo', 'homologacao', 'outro')),
  nome TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Fotos de instalacao
-- ============================================================
CREATE TABLE IF NOT EXISTS fotos_instalacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('antes', 'durante', 'depois')),
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Historico de status
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Checklists
-- ============================================================
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Checklist items
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  concluido BOOLEAN NOT NULL DEFAULT false,
  concluido_por UUID REFERENCES auth.users(id),
  concluido_em TIMESTAMPTZ,
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Trigger: track installation status changes
-- ============================================================
CREATE OR REPLACE FUNCTION track_instalacao_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO historico_status (instalacao_id, status_anterior, status_novo, usuario_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_instalacao_status_change
  BEFORE UPDATE ON instalacoes
  FOR EACH ROW EXECUTE FUNCTION track_instalacao_status();

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_instalacoes_updated_at
  BEFORE UPDATE ON instalacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipamentos_updated_at
  BEFORE UPDATE ON equipamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clientes_org ON clientes(organization_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(organization_id, cpf_cnpj);

CREATE INDEX IF NOT EXISTS idx_equipes_org ON equipes(organization_id);

CREATE INDEX IF NOT EXISTS idx_equipe_membros_equipe ON equipe_membros(equipe_id);
CREATE INDEX IF NOT EXISTS idx_equipe_membros_profile ON equipe_membros(profile_id);

CREATE INDEX IF NOT EXISTS idx_instalacoes_org ON instalacoes(organization_id);
CREATE INDEX IF NOT EXISTS idx_instalacoes_cliente ON instalacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_instalacoes_equipe ON instalacoes(equipe_id);
CREATE INDEX IF NOT EXISTS idx_instalacoes_status ON instalacoes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_instalacoes_data_prevista ON instalacoes(organization_id, data_prevista);

CREATE INDEX IF NOT EXISTS idx_recebimentos_org ON recebimentos(organization_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_instalacao ON recebimentos(instalacao_id);

CREATE INDEX IF NOT EXISTS idx_equipamentos_org ON equipamentos(organization_id);

CREATE INDEX IF NOT EXISTS idx_documentos_org ON documentos(organization_id);
CREATE INDEX IF NOT EXISTS idx_documentos_instalacao ON documentos(instalacao_id);
CREATE INDEX IF NOT EXISTS idx_documentos_cliente ON documentos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_fotos_instalacao ON fotos_instalacao(instalacao_id);
CREATE INDEX IF NOT EXISTS idx_fotos_org ON fotos_instalacao(organization_id);

CREATE INDEX IF NOT EXISTS idx_historico_instalacao ON historico_status(instalacao_id);

CREATE INDEX IF NOT EXISTS idx_checklists_org ON checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_checklists_instalacao ON checklists(instalacao_id);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
