-- ============================================================
-- 009_material_lists.sql
-- Material list templates and installation material lists
-- ============================================================

-- Categories for future ERP/stock integration
CREATE TYPE material_categoria AS ENUM (
  'modulos', 'inversores', 'estruturas', 'eletricos', 'protecoes', 'cabos', 'conectores', 'outros'
);

-- ============================================================
-- Templates (modelos reutilizáveis por empresa)
-- ============================================================
CREATE TABLE IF NOT EXISTS material_list_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS material_list_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES material_list_templates(id) ON DELETE CASCADE,
  nome_material TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  sku TEXT,
  categoria material_categoria DEFAULT 'outros',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Installation material lists (cópias independentes)
-- ============================================================
CREATE TABLE IF NOT EXISTS installation_material_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES material_list_templates(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installation_material_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_list_id UUID NOT NULL REFERENCES installation_material_lists(id) ON DELETE CASCADE,
  nome_material TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  sku TEXT,
  categoria material_categoria DEFAULT 'outros',
  conferido BOOLEAN NOT NULL DEFAULT false,
  conferido_em TIMESTAMPTZ,
  conferido_por UUID REFERENCES auth.users(id),
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_material_templates_org ON material_list_templates(organization_id);
CREATE INDEX idx_material_template_items_template ON material_list_template_items(template_id);
CREATE INDEX idx_installation_material_lists_inst ON installation_material_lists(instalacao_id);
CREATE INDEX idx_installation_material_items_list ON installation_material_items(material_list_id);

-- Updated_at trigger
CREATE TRIGGER update_material_list_templates_updated_at
  BEFORE UPDATE ON material_list_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE material_list_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_list_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_material_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_material_items ENABLE ROW LEVEL SECURITY;

-- Templates
CREATE POLICY "Members can view material templates" ON material_list_templates
  FOR SELECT TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "Members can create material templates" ON material_list_templates
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "Members can update material templates" ON material_list_templates
  FOR UPDATE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "Members can delete material templates" ON material_list_templates
  FOR DELETE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));

-- Template items
CREATE POLICY "Members can view material template items" ON material_list_template_items
  FOR SELECT TO authenticated USING (template_id IN (SELECT id FROM material_list_templates WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can manage material template items" ON material_list_template_items
  FOR INSERT TO authenticated WITH CHECK (template_id IN (SELECT id FROM material_list_templates WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can update material template items" ON material_list_template_items
  FOR UPDATE TO authenticated USING (template_id IN (SELECT id FROM material_list_templates WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can delete material template items" ON material_list_template_items
  FOR DELETE TO authenticated USING (template_id IN (SELECT id FROM material_list_templates WHERE organization_id IN (SELECT get_user_org_ids())));

-- Installation material lists
CREATE POLICY "Members can view installation materials" ON installation_material_lists
  FOR SELECT TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "Members can create installation materials" ON installation_material_lists
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "Members can delete installation materials" ON installation_material_lists
  FOR DELETE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));

-- Installation material items
CREATE POLICY "Members can view installation material items" ON installation_material_items
  FOR SELECT TO authenticated USING (material_list_id IN (SELECT id FROM installation_material_lists WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can manage installation material items" ON installation_material_items
  FOR INSERT TO authenticated WITH CHECK (material_list_id IN (SELECT id FROM installation_material_lists WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can update installation material items" ON installation_material_items
  FOR UPDATE TO authenticated USING (material_list_id IN (SELECT id FROM installation_material_lists WHERE organization_id IN (SELECT get_user_org_ids())));
CREATE POLICY "Members can delete installation material items" ON installation_material_items
  FOR DELETE TO authenticated USING (material_list_id IN (SELECT id FROM installation_material_lists WHERE organization_id IN (SELECT get_user_org_ids())));
