-- CarrierShield Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Tenants (one per trucking company)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  mc_number text,
  dot_number text,
  legal_name text,
  dba_name text,
  slug text UNIQUE,
  custom_domain text,
  stripe_customer_id text,
  plan text DEFAULT 'starter',
  subscription_status text DEFAULT 'trialing',
  created_at timestamptz DEFAULT now()
);

-- FMCSA data (one row per tenant, pulled from FMCSA API)
CREATE TABLE fmcsa_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  operating_status text,
  safety_rating text,
  operation_type text,
  physical_address jsonb,
  phone text,
  power_units int,
  drivers int,
  insurance_data jsonb,
  boc3_on_file boolean,
  cargo_carried jsonb,
  basics_scores jsonb,
  last_fmcsa_sync timestamptz,
  raw_response jsonb
);

-- Carrier documents (W-9, COI, agreements, etc.)
CREATE TABLE carrier_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  doc_type text,
  file_name text,
  file_url text,
  expiration_date date,
  uploaded_at timestamptz DEFAULT now()
);

-- Website settings (branding, theme, etc.)
CREATE TABLE website_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  primary_color text DEFAULT '#FF6B35',
  logo_url text,
  hero_text text,
  theme text DEFAULT 'dark'
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmcsa_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Tenants: users can only access their own tenant
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenant"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenant"
  ON tenants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tenant"
  ON tenants FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access for tenants by slug (for public profile pages)
CREATE POLICY "Anyone can view tenant by slug"
  ON tenants FOR SELECT
  USING (slug IS NOT NULL);

-- FMCSA data: users can only access their own tenant's data
CREATE POLICY "Users can view their own fmcsa_data"
  ON fmcsa_data FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own fmcsa_data"
  ON fmcsa_data FOR INSERT
  WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own fmcsa_data"
  ON fmcsa_data FOR UPDATE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own fmcsa_data"
  ON fmcsa_data FOR DELETE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Public read access for fmcsa_data (for public profile pages)
CREATE POLICY "Anyone can view fmcsa_data for public profiles"
  ON fmcsa_data FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE slug IS NOT NULL));

-- Carrier documents: users can only access their own tenant's documents
CREATE POLICY "Users can view their own carrier_documents"
  ON carrier_documents FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own carrier_documents"
  ON carrier_documents FOR INSERT
  WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own carrier_documents"
  ON carrier_documents FOR UPDATE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own carrier_documents"
  ON carrier_documents FOR DELETE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Website settings: users can only access their own tenant's settings
CREATE POLICY "Users can view their own website_settings"
  ON website_settings FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own website_settings"
  ON website_settings FOR INSERT
  WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own website_settings"
  ON website_settings FOR UPDATE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own website_settings"
  ON website_settings FOR DELETE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Public read access for website_settings (for public profile pages)
CREATE POLICY "Anyone can view website_settings for public profiles"
  ON website_settings FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE slug IS NOT NULL));
