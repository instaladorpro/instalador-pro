-- ============================================================
-- 008_checklist_templates.sql
-- Checklist templates per organization
-- ============================================================

-- Templates (modelos de checklist por empresa)
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template items
CREATE TABLE IF NOT EXISTS checklist_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add template_id reference to existing checklists (nullable, for traceability)
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_checklist_templates_org ON checklist_templates(organization_id);
CREATE INDEX idx_checklist_template_items_template ON checklist_template_items(template_id);
CREATE INDEX idx_checklists_template ON checklists(template_id);

-- Updated_at trigger
CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;

-- Templates: members can read, admin/owner can manage
CREATE POLICY "Members can view org templates" ON checklist_templates
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admin/owner can create templates" ON checklist_templates
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admin/owner can update templates" ON checklist_templates
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admin/owner can delete templates" ON checklist_templates
  FOR DELETE TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Template items: follow parent template access
CREATE POLICY "Members can view template items" ON checklist_template_items
  FOR SELECT TO authenticated
  USING (template_id IN (
    SELECT id FROM checklist_templates WHERE organization_id IN (SELECT get_user_org_ids())
  ));

CREATE POLICY "Admin can manage template items" ON checklist_template_items
  FOR INSERT TO authenticated
  WITH CHECK (template_id IN (
    SELECT id FROM checklist_templates WHERE organization_id IN (SELECT get_user_org_ids())
  ));

CREATE POLICY "Admin can update template items" ON checklist_template_items
  FOR UPDATE TO authenticated
  USING (template_id IN (
    SELECT id FROM checklist_templates WHERE organization_id IN (SELECT get_user_org_ids())
  ));

CREATE POLICY "Admin can delete template items" ON checklist_template_items
  FOR DELETE TO authenticated
  USING (template_id IN (
    SELECT id FROM checklist_templates WHERE organization_id IN (SELECT get_user_org_ids())
  ));
