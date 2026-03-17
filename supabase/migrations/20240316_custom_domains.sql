-- ============================================================
-- Loadira: Custom Subdomain & Domain Support
-- Run in: Supabase SQL Editor
-- ============================================================

-- Add custom domain columns to carriers table
ALTER TABLE carriers
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_domain_status TEXT DEFAULT 'none'
    CHECK (custom_domain_status IN ('none', 'pending', 'verified', 'error'));

-- Index for fast custom domain lookups (every page load for custom domain visitors)
CREATE INDEX IF NOT EXISTS idx_carriers_custom_domain
  ON carriers(custom_domain) WHERE custom_domain IS NOT NULL;
