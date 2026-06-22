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
