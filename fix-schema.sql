-- Drop all existing tables
drop table if exists public.carrier_documents cascade;
drop table if exists public.documents cascade;
drop table if exists public.quote_requests cascade;
drop table if exists public.fmcsa_data cascade;
drop table if exists public.website_settings cascade;
drop table if exists public.tenants cascade;
drop table if exists public.carriers cascade;

-- Drop existing trigger and function
drop trigger if exists carriers_updated_at on public.carriers;
drop function if exists public.update_updated_at();

-- Carriers table: minimal required columns + fmcsa_raw for all FMCSA data
create table public.carriers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mc_number text not null,
  dot_number text not null,
  legal_name text not null,
  website_slug text not null unique,
  fmcsa_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_carriers_website_slug on public.carriers(website_slug);
create index idx_carriers_user_id on public.carriers(user_id);
create index idx_carriers_mc_number on public.carriers(mc_number);

-- Quote requests
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

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  name text not null,
  type text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index idx_documents_carrier_id on public.documents(carrier_id);

-- Updated_at trigger
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

-- RLS: carriers
alter table public.carriers enable row level security;

create policy "Carriers are viewable by everyone"
  on public.carriers for select using (true);

create policy "Users can insert their own carrier"
  on public.carriers for insert with check (auth.uid() = user_id);

create policy "Users can update their own carrier"
  on public.carriers for update using (auth.uid() = user_id);

create policy "Users can delete their own carrier"
  on public.carriers for delete using (auth.uid() = user_id);

-- RLS: quote_requests
alter table public.quote_requests enable row level security;

create policy "Anyone can submit a quote request"
  on public.quote_requests for insert with check (true);

create policy "Carrier owners can view their quote requests"
  on public.quote_requests for select
  using (carrier_id in (select id from public.carriers where user_id = auth.uid()));

-- RLS: documents
alter table public.documents enable row level security;

create policy "Carrier owners can view their documents"
  on public.documents for select
  using (carrier_id in (select id from public.carriers where user_id = auth.uid()));

create policy "Carrier owners can insert documents"
  on public.documents for insert
  with check (carrier_id in (select id from public.carriers where user_id = auth.uid()));

create policy "Carrier owners can delete documents"
  on public.documents for delete
  using (carrier_id in (select id from public.carriers where user_id = auth.uid()));

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('carrier-assets', 'carrier-assets', true)
on conflict do nothing;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';
