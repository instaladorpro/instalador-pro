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
