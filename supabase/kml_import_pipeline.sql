create table if not exists public.resources_import_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  source_filename text,
  source_type text not null default 'kml' check (source_type in ('kml', 'csv', 'json', 'manual')),
  status text not null default 'draft' check (status in ('draft', 'staged', 'partially_promoted', 'promoted', 'failed')),
  total_rows integer not null default 0,
  parse_errors integer not null default 0,
  duplicates_flagged integer not null default 0,
  review_required integer not null default 0,
  ready_to_import integer not null default 0,
  promoted_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources_staging (
  id uuid primary key default gen_random_uuid(),
  import_batch text not null references public.resources_import_batches(batch_code) on delete cascade,
  raw_name text,
  raw_folder text,
  raw_description text,
  raw_lat double precision,
  raw_lng double precision,
  raw_data_json jsonb not null default '{}'::jsonb,
  parse_status text not null default 'parsed' check (parse_status in ('parsed', 'parse_error', 'promoted', 'promotion_error')),
  duplicate_flag boolean not null default false,
  duplicate_reasons text[] not null default '{}'::text[],
  confidence_score numeric(5,2) not null default 0,
  needs_review boolean not null default true,
  approved_for_import boolean not null default false,
  clean_name text,
  clean_slug text,
  clean_summary text,
  clean_description text,
  clean_website text,
  clean_phone text,
  clean_email text,
  mapped_category text,
  subcategory text,
  town text,
  postcode text,
  source_reference text,
  imported_resource_id uuid references public.resources(id) on delete set null,
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_staging_batch_idx on public.resources_staging(import_batch);
create index if not exists resources_staging_status_idx on public.resources_staging(parse_status);
create index if not exists resources_staging_review_idx on public.resources_staging(needs_review, approved_for_import);
create index if not exists resources_staging_slug_idx on public.resources_staging(clean_slug);
create index if not exists resources_staging_duplicate_idx on public.resources_staging(duplicate_flag);

alter table public.resources_import_batches enable row level security;
alter table public.resources_staging enable row level security;

create or replace function public.set_import_tables_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_resources_import_batches_updated_at on public.resources_import_batches;
create trigger set_resources_import_batches_updated_at
before update on public.resources_import_batches
for each row execute procedure public.set_import_tables_updated_at();

drop trigger if exists set_resources_staging_updated_at on public.resources_staging;
create trigger set_resources_staging_updated_at
before update on public.resources_staging
for each row execute procedure public.set_import_tables_updated_at();

drop policy if exists "Active admins manage import batches" on public.resources_import_batches;
create policy "Active admins manage import batches"
on public.resources_import_batches for all
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Active admins manage resources staging" on public.resources_staging;
create policy "Active admins manage resources staging"
on public.resources_staging for all
using (public.is_active_admin())
with check (public.is_active_admin());
