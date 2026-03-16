-- ============================================================
-- Loadira: Security Hardening Migration
-- Fixes: storage RLS, audit logging, carrier column restrictions
-- Run in: Supabase SQL Editor
-- ============================================================

-- 1. Audit log table for tracking sensitive actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can write audit logs
CREATE POLICY "Service role manages audit logs"
  ON audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own audit logs
CREATE POLICY "Users read own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Make storage bucket private and add folder-scoped RLS
-- Update bucket to private (if it was public)
UPDATE storage.buckets SET public = false WHERE id = 'carrier-assets';

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "Anyone can view carrier assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload carrier assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- New folder-scoped policies: users can only access files in their own user_id folder
CREATE POLICY "Users can view their own carrier assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'carrier-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read for logo files only (needed for public profile pages)
CREATE POLICY "Public can view logo files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'carrier-assets'
    AND name LIKE '%/logo.%'
  );

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'carrier-assets'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update files in their own folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'carrier-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete files in their own folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'carrier-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Create a restricted view for public carrier data
-- This excludes sensitive fields (stripe IDs, fmcsa_raw, user_id)
CREATE OR REPLACE VIEW public_carriers AS
  SELECT
    id, mc_number, dot_number, legal_name, dba_name,
    entity_type, operating_status, phone, email,
    address_street, address_city, address_state, address_zip,
    mailing_street, mailing_city, mailing_state, mailing_zip,
    safety_rating, safety_rating_date, total_drivers, total_power_units,
    operation_classification, carrier_operation, cargo_carried,
    bipd_required, bipd_on_file, bipd_insurer, bipd_policy_number,
    cargo_required, cargo_on_file, cargo_insurer, cargo_policy_number,
    bond_required, bond_on_file,
    vehicle_inspections_total, vehicle_inspections_oos,
    driver_inspections_total, driver_inspections_oos,
    hazmat_inspections_total, hazmat_inspections_oos,
    crashes_fatal, crashes_injury, crashes_towaway,
    equipment, service_lanes,
    company_description, logo_url, brand_color, website_slug,
    plan, created_at, updated_at
  FROM carriers;

-- 4. Audit trigger on carriers table for tracking changes
CREATE OR REPLACE FUNCTION audit_carrier_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, carrier_id, action, table_name, old_values, new_values)
  VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    'carriers',
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
         WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
           'changed_fields', (
             SELECT jsonb_object_agg(key, value)
             FROM jsonb_each(to_jsonb(NEW))
             WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
           )
         )
         ELSE NULL
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER carriers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON carriers
  FOR EACH ROW EXECUTE FUNCTION audit_carrier_changes();

-- 5. Audit trigger on documents table
CREATE OR REPLACE FUNCTION audit_document_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, carrier_id, action, table_name, new_values)
  VALUES (
    auth.uid(),
    COALESCE(NEW.carrier_id, OLD.carrier_id),
    TG_OP || '_document',
    'documents',
    CASE WHEN TG_OP = 'DELETE' THEN jsonb_build_object('name', OLD.name, 'type', OLD.type)
         ELSE jsonb_build_object('name', NEW.name, 'type', NEW.type)
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_document_changes();
