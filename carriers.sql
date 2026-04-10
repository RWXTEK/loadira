create table public.carriers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mc_number text not null,
  dot_number text not null,
  legal_name text not null,
  dba_name text,
  entity_type text,
  operating_status text,
  phone text,
  email text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  mailing_street text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  safety_rating text,
  safety_rating_date text,
  total_drivers integer,
  total_power_units integer,
  operation_classification text[],
  carrier_operation text[],
  cargo_carried text[],
  bipd_required integer,
  bipd_on_file integer,
  bipd_insurer text,
  bipd_policy_number text,
  cargo_required integer,
  cargo_on_file integer,
  cargo_insurer text,
  cargo_policy_number text,
  bond_required integer,
  bond_on_file integer,
  vehicle_inspections_total integer,
  vehicle_inspections_oos integer,
  driver_inspections_total integer,
  driver_inspections_oos integer,
  hazmat_inspections_total integer,
  hazmat_inspections_oos integer,
  crashes_fatal integer,
  crashes_injury integer,
  crashes_towaway integer,
  equipment jsonb,
  service_lanes text[],
  company_description text,
  logo_url text,
  brand_color text default '#f97316',
  website_slug text not null unique,
  plan text default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  fmcsa_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_carriers_website_slug on public.carriers(website_slug);
create index idx_carriers_user_id on public.carriers(user_id);
create index idx_carriers_mc_number on public.carriers(mc_number);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  name text not null,
  email text not null,
  details text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_quote_requests_carrier_id on public.quote_requests(carrier_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  name text not null,
  type text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index idx_documents_carrier_id on public.documents(carrier_id);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger carriers_updated_at
  before update on public.carriers
  for each row execute function public.update_updated_at();

alter table public.carriers enable row level security;

create policy "Carriers are viewable by everyone"
  on public.carriers for select
  using (true);

create policy "Users can insert their own carrier"
  on public.carriers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own carrier"
  on public.carriers for update
  using (auth.uid() = user_id);

create policy "Users can delete their own carrier"
  on public.carriers for delete
  using (auth.uid() = user_id);

alter table public.quote_requests enable row level security;

create policy "Anyone can submit a quote request"
  on public.quote_requests for insert
  with check (true);

create policy "Carrier owners can view their quote requests"
  on public.quote_requests for select
  using (
    carrier_id in (
      select id from public.carriers where user_id = auth.uid()
    )
  );

alter table public.documents enable row level security;

create policy "Carrier owners can view their documents"
  on public.documents for select
  using (
    carrier_id in (
      select id from public.carriers where user_id = auth.uid()
    )
  );

create policy "Carrier owners can insert documents"
  on public.documents for insert
  with check (
    carrier_id in (
      select id from public.carriers where user_id = auth.uid()
    )
  );

create policy "Carrier owners can delete documents"
  on public.documents for delete
  using (
    carrier_id in (
      select id from public.carriers where user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('carrier-assets', 'carrier-assets', true)
on conflict do nothing;

create policy "Anyone can view carrier assets"
  on storage.objects for select
  using (bucket_id = 'carrier-assets');

create policy "Authenticated users can upload carrier assets"
  on storage.objects for insert
  with check (bucket_id = 'carrier-assets' and auth.role() = 'authenticated');

create policy "Users can update their own uploads"
  on storage.objects for update
  using (bucket_id = 'carrier-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own uploads"
  on storage.objects for delete
  using (bucket_id = 'carrier-assets' and auth.uid()::text = (storage.foldername(name))[1]);
