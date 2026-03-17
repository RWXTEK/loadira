-- ============================================================
-- Loadira: Consent & Terms Acceptance Tracking
-- Run in: Supabase SQL Editor
-- ============================================================

-- Add consent tracking columns to carriers table
ALTER TABLE carriers
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE;

-- Create index for compliance queries
CREATE INDEX IF NOT EXISTS idx_carriers_terms_accepted ON carriers(terms_accepted_at);
