-- ============================================================
-- 001_organizations.sql
-- Foundation: organizations, profiles, members, invitations
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Organizations (tenants)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  logo_url TEXT,
  plano TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free', 'pro', 'enterprise')),
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Profiles (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Organization members (links users to orgs with roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'tecnico' CHECK (role IN ('owner', 'admin', 'tecnico', 'financeiro')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================================
-- Invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tecnico' CHECK (role IN ('admin', 'tecnico', 'financeiro')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email, status)
);

-- ============================================================
-- Trigger: auto-create profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
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
-- ============================================================
-- 003_rls_policies.sql
-- Row Level Security for all tables
-- ============================================================

-- ============================================================
-- Helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM org_members
  WHERE user_id = auth.uid() AND ativo = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND ativo = true
      AND role = ANY(allowed_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE instalacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_instalacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "profiles_select_org_members"
  ON profiles FOR SELECT
  USING (
    user_id IN (
      SELECT om.user_id FROM org_members om
      WHERE om.organization_id IN (SELECT get_user_org_ids())
        AND om.ativo = true
    )
  );

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "orgs_select"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "orgs_insert"
  ON organizations FOR INSERT
  WITH CHECK (true); -- anyone can create an org (they become owner)

CREATE POLICY "orgs_update"
  ON organizations FOR UPDATE
  USING (has_org_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(id, ARRAY['owner', 'admin']));

CREATE POLICY "orgs_delete"
  ON organizations FOR DELETE
  USING (has_org_role(id, ARRAY['owner']));

-- ============================================================
-- ORG_MEMBERS
-- ============================================================
CREATE POLICY "org_members_select"
  ON org_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_members_insert"
  ON org_members FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "org_members_update"
  ON org_members FOR UPDATE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "org_members_delete"
  ON org_members FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- INVITATIONS
-- ============================================================
CREATE POLICY "invitations_select_org"
  ON invitations FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "invitations_select_invited"
  ON invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "invitations_insert"
  ON invitations FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "invitations_update_accept"
  ON invitations FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "invitations_delete"
  ON invitations FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE POLICY "clientes_select"
  ON clientes FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "clientes_insert"
  ON clientes FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "clientes_update"
  ON clientes FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "clientes_delete"
  ON clientes FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- EQUIPES
-- ============================================================
CREATE POLICY "equipes_select"
  ON equipes FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "equipes_insert"
  ON equipes FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "equipes_update"
  ON equipes FOR UPDATE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "equipes_delete"
  ON equipes FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- EQUIPE_MEMBROS
-- ============================================================
CREATE POLICY "equipe_membros_select"
  ON equipe_membros FOR SELECT
  USING (
    equipe_id IN (
      SELECT id FROM equipes WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "equipe_membros_insert"
  ON equipe_membros FOR INSERT
  WITH CHECK (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE has_org_role(e.organization_id, ARRAY['owner', 'admin'])
    )
  );

CREATE POLICY "equipe_membros_update"
  ON equipe_membros FOR UPDATE
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE has_org_role(e.organization_id, ARRAY['owner', 'admin'])
    )
  );

CREATE POLICY "equipe_membros_delete"
  ON equipe_membros FOR DELETE
  USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      WHERE has_org_role(e.organization_id, ARRAY['owner', 'admin'])
    )
  );

-- ============================================================
-- INSTALACOES
-- ============================================================
CREATE POLICY "instalacoes_select"
  ON instalacoes FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "instalacoes_insert"
  ON instalacoes FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "instalacoes_update"
  ON instalacoes FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "instalacoes_delete"
  ON instalacoes FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- RECEBIMENTOS
-- ============================================================
CREATE POLICY "recebimentos_select"
  ON recebimentos FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "recebimentos_insert"
  ON recebimentos FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'financeiro']));

CREATE POLICY "recebimentos_update"
  ON recebimentos FOR UPDATE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'financeiro']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'financeiro']));

CREATE POLICY "recebimentos_delete"
  ON recebimentos FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- EQUIPAMENTOS
-- ============================================================
CREATE POLICY "equipamentos_select"
  ON equipamentos FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "equipamentos_insert"
  ON equipamentos FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "equipamentos_update"
  ON equipamentos FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "equipamentos_delete"
  ON equipamentos FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- DOCUMENTOS
-- ============================================================
CREATE POLICY "documentos_select"
  ON documentos FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "documentos_insert"
  ON documentos FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "documentos_delete"
  ON documentos FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- FOTOS_INSTALACAO
-- ============================================================
CREATE POLICY "fotos_select"
  ON fotos_instalacao FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "fotos_insert"
  ON fotos_instalacao FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "fotos_delete"
  ON fotos_instalacao FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- HISTORICO_STATUS
-- ============================================================
CREATE POLICY "historico_select"
  ON historico_status FOR SELECT
  USING (
    instalacao_id IN (
      SELECT id FROM instalacoes WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- Insert is handled by trigger (SECURITY DEFINER), no user insert policy needed

-- ============================================================
-- CHECKLISTS
-- ============================================================
CREATE POLICY "checklists_select"
  ON checklists FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "checklists_insert"
  ON checklists FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "checklists_update"
  ON checklists FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "checklists_delete"
  ON checklists FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ============================================================
-- CHECKLIST_ITEMS
-- ============================================================
CREATE POLICY "checklist_items_select"
  ON checklist_items FOR SELECT
  USING (
    checklist_id IN (
      SELECT id FROM checklists WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "checklist_items_insert"
  ON checklist_items FOR INSERT
  WITH CHECK (
    checklist_id IN (
      SELECT id FROM checklists WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "checklist_items_update"
  ON checklist_items FOR UPDATE
  USING (
    checklist_id IN (
      SELECT id FROM checklists WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "checklist_items_delete"
  ON checklist_items FOR DELETE
  USING (
    checklist_id IN (
      SELECT c.id FROM checklists c
      WHERE has_org_role(c.organization_id, ARRAY['owner', 'admin'])
    )
  );
-- ============================================================
-- 004_audit_logs.sql
-- Audit logging for compliance and debugging
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read audit logs for their orgs
CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Only service_role can insert (no user insert policy)
-- Inserts happen via SECURITY DEFINER functions below

-- ============================================================
-- Generic audit function
-- ============================================================
CREATE OR REPLACE FUNCTION audit_log(
  p_org_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (p_org_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Auto-audit triggers for critical tables
-- ============================================================
CREATE OR REPLACE FUNCTION audit_instalacoes_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM audit_log(NEW.organization_id, 'INSERT', 'instalacoes', NEW.id, NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM audit_log(NEW.organization_id, 'UPDATE', 'instalacoes', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM audit_log(OLD.organization_id, 'DELETE', 'instalacoes', OLD.id, to_jsonb(OLD), NULL);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_instalacoes
  AFTER INSERT OR UPDATE OR DELETE ON instalacoes
  FOR EACH ROW EXECUTE FUNCTION audit_instalacoes_changes();

CREATE OR REPLACE FUNCTION audit_recebimentos_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM audit_log(NEW.organization_id, 'INSERT', 'recebimentos', NEW.id, NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM audit_log(NEW.organization_id, 'UPDATE', 'recebimentos', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM audit_log(OLD.organization_id, 'DELETE', 'recebimentos', OLD.id, to_jsonb(OLD), NULL);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_recebimentos
  AFTER INSERT OR UPDATE OR DELETE ON recebimentos
  FOR EACH ROW EXECUTE FUNCTION audit_recebimentos_changes();
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
-- Consent tracking for LGPD compliance
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('termos_uso', 'politica_privacidade', 'cookies', 'marketing')),
  aceito BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consents_user ON consents(user_id);
CREATE INDEX idx_consents_tipo ON consents(user_id, tipo);

-- Data deletion requests
CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_deletion_requests_user ON data_deletion_requests(user_id);

-- RLS
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own consents" ON consents
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own deletion requests" ON data_deletion_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own deletion requests" ON data_deletion_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
