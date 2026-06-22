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
