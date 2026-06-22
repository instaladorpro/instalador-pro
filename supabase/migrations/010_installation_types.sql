-- ============================================================
-- 010_installation_types.sql
-- Custom installation types per organization
-- ============================================================

CREATE TABLE IF NOT EXISTS installation_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  -- Future: default templates linked to this type
  checklist_template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,
  material_template_id UUID REFERENCES material_list_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add type reference to instalacoes (nullable for backward compat)
ALTER TABLE instalacoes ADD COLUMN IF NOT EXISTS installation_type_id UUID REFERENCES installation_types(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_installation_types_org ON installation_types(organization_id);
CREATE INDEX idx_installation_types_active ON installation_types(organization_id, ativo);
CREATE INDEX idx_instalacoes_type ON instalacoes(installation_type_id);

-- Updated_at trigger
CREATE TRIGGER update_installation_types_updated_at
  BEFORE UPDATE ON installation_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE installation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view installation types" ON installation_types
  FOR SELECT TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can create installation types" ON installation_types
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can update installation types" ON installation_types
  FOR UPDATE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can delete installation types" ON installation_types
  FOR DELETE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
