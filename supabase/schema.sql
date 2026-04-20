create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin', 'editor', 'reviewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text default '#2D9CDB',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.resource_categories(id) on delete set null,
  town text,
  summary text,
  description text,
  website text,
  phone text,
  email text,
  address text,
  postcode text,
  latitude double precision,
  longitude double precision,
  verified boolean not null default false,
  featured boolean not null default false,
  is_archived boolean not null default false,
  needs_review boolean not null default false,
  subcategory text,
  raw_folder text,
  source_reference text,
  last_reviewed_at date,
  source_type text not null default 'manual' check (source_type in ('manual', 'kml', 'csv', 'json', 'community')),
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_update_submissions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resources(id) on delete set null,
  resource_name text,
  resource_category text,
  update_type text not null,
  description text not null,
  submitter_name text,
  submitter_email text,
  consent_review boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected')),
  admin_notes text,
  payload jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_view_events (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.resources(id) on delete cascade,
  source text not null default 'web',
  viewed_at timestamptz not null default now()
);

create table if not exists public.resource_import_jobs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  import_format text not null check (import_format in ('csv', 'json')),
  status text not null default 'draft' check (status in ('draft', 'validated', 'imported', 'failed')),
  row_count integer default 0,
  field_mapping jsonb not null default '{}'::jsonb,
  preview_payload jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.resources add column if not exists needs_review boolean not null default false;
alter table public.resources add column if not exists subcategory text;
alter table public.resources add column if not exists raw_folder text;
alter table public.resources add column if not exists source_reference text;
alter table public.resources add column if not exists last_reviewed_at date;

create index if not exists resources_category_idx on public.resources(category_id);
create index if not exists resources_town_idx on public.resources(town);
create index if not exists resources_verified_idx on public.resources(verified);
create index if not exists resources_featured_idx on public.resources(featured);
create index if not exists resources_needs_review_idx on public.resources(needs_review);
create index if not exists resources_updated_idx on public.resources(updated_at desc);
create index if not exists submissions_status_idx on public.resource_update_submissions(status);
create index if not exists submissions_created_idx on public.resource_update_submissions(created_at desc);
create index if not exists views_resource_idx on public.resource_view_events(resource_id);

drop trigger if exists set_resource_categories_updated_at on public.resource_categories;
create trigger set_resource_categories_updated_at
before update on public.resource_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute procedure public.set_updated_at();

create or replace function public.is_active_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

alter table public.admin_users enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.resource_update_submissions enable row level security;
alter table public.resource_view_events enable row level security;
alter table public.resource_import_jobs enable row level security;

drop policy if exists "Admin users can view own profile" on public.admin_users;
create policy "Admin users can view own profile"
on public.admin_users for select
to authenticated
using (auth.uid() = user_id or public.is_active_admin());

drop policy if exists "Active admins manage categories" on public.resource_categories;
create policy "Active admins manage categories"
on public.resource_categories for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Active admins manage resources" on public.resources;
create policy "Active admins manage resources"
on public.resources for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Active admins manage submissions" on public.resource_update_submissions;
create policy "Active admins manage submissions"
on public.resource_update_submissions for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Active admins manage import jobs" on public.resource_import_jobs;
create policy "Active admins manage import jobs"
on public.resource_import_jobs for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Anyone can insert resource updates" on public.resource_update_submissions;
create policy "Anyone can insert resource updates"
on public.resource_update_submissions for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can insert view events" on public.resource_view_events;
create policy "Anyone can insert view events"
on public.resource_view_events for insert
to anon, authenticated
with check (true);

drop policy if exists "Active admins read view events" on public.resource_view_events;
create policy "Active admins read view events"
on public.resource_view_events for select
to authenticated
using (public.is_active_admin());

create or replace view public.resource_category_view_stats as
select
  c.id as category_id,
  c.name as category_name,
  count(v.id)::bigint as view_count
from public.resource_categories c
left join public.resources r on r.category_id = c.id and r.is_archived = false
left join public.resource_view_events v on v.resource_id = r.id
group by c.id, c.name
order by view_count desc, c.name asc;
