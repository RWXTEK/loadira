-- ============================================================
-- Loadira: Profile Access Log for Broker Verification
-- Run in: Supabase SQL Editor
-- ============================================================

-- Track who viewed carrier profiles (broker MC verification)
CREATE TABLE IF NOT EXISTS access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  viewer_mc_number TEXT,
  viewer_name TEXT,
  viewer_email TEXT,
  access_tier TEXT NOT NULL DEFAULT 'public',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_log_carrier_id ON access_log(carrier_id);
CREATE INDEX IF NOT EXISTS idx_access_log_created_at ON access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_access_log_viewer_mc ON access_log(viewer_mc_number);

ALTER TABLE access_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (brokers verify MC to view profiles)
CREATE POLICY "Anyone can log access"
  ON access_log FOR INSERT
  WITH CHECK (true);

-- Carrier owners can read their own access logs
CREATE POLICY "Carrier owners can view access logs"
  ON access_log FOR SELECT
  USING (
    carrier_id IN (
      SELECT id FROM carriers WHERE user_id = auth.uid()
    )
  );

-- Service role full access
CREATE POLICY "Service role manages access logs"
  ON access_log FOR ALL
  USING (auth.role() = 'service_role');
