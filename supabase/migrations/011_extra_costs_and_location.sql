-- ============================================================
-- 011_extra_costs_and_location.sql
-- Extra costs per installation + location link field
-- ============================================================

-- Custos adicionais por instalação
CREATE TABLE IF NOT EXISTS installation_extra_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  comprovante_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_extra_costs_instalacao ON installation_extra_costs(instalacao_id);
CREATE INDEX idx_extra_costs_org ON installation_extra_costs(organization_id);

-- Campo de localização (link Google Maps/Waze)
ALTER TABLE instalacoes ADD COLUMN IF NOT EXISTS localizacao_url TEXT;

-- Campo tipo cliente PF/PJ
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_tipo_check;
ALTER TABLE clientes ADD CONSTRAINT clientes_tipo_check CHECK (tipo IN ('pf', 'pj'));
-- Update existing data
UPDATE clientes SET tipo = 'pf' WHERE tipo = 'residencial';
UPDATE clientes SET tipo = 'pj' WHERE tipo IN ('comercial', 'industrial', 'rural');

-- RLS
ALTER TABLE installation_extra_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view extra costs" ON installation_extra_costs
  FOR SELECT TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "create extra costs" ON installation_extra_costs
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "update extra costs" ON installation_extra_costs
  FOR UPDATE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "delete extra costs" ON installation_extra_costs
  FOR DELETE TO authenticated USING (organization_id IN (SELECT get_user_org_ids()));

-- Also add INSERT policy for historico_status (was missing, caused RLS error)
CREATE POLICY "historico_insert" ON historico_status
  FOR INSERT TO authenticated
  WITH CHECK (
    instalacao_id IN (
      SELECT id FROM instalacoes WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );
