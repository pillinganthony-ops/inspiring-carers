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
  county text,
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

create table if not exists public.listing_claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.resources(id) on delete set null,
  listing_slug text,
  listing_title text,
  full_name text not null,
  org_name text,
  role text not null,
  email text not null,
  phone text,
  relationship text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  duplicate_of_claim_id uuid references public.listing_claims(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organisation_profiles (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid unique references public.resources(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  bio text,
  logo_url text,
  cover_image_url text,
  website text,
  phone text,
  email text,
  socials jsonb not null default '{}'::jsonb,
  service_categories text[] not null default '{}',
  areas_covered text[] not null default '{}',
  verified_status text not null default 'community' check (verified_status in ('community', 'verified', 'claimed')),
  claim_status text not null default 'unclaimed' check (claim_status in ('unclaimed', 'pending', 'claimed', 'suspended')),
  featured boolean not null default false,
  package_name text,
  entitlement_status text not null default 'inactive' check (entitlement_status in ('inactive', 'trial', 'active', 'paused', 'expired')),
  start_date date,
  end_date date,
  featured_enabled boolean not null default false,
  event_quota integer not null default 0 check (event_quota >= 0),
  enquiry_tools_enabled boolean not null default false,
  analytics_enabled boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organisation_profile_members (
  id uuid primary key default gen_random_uuid(),
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  owner_email text,
  full_name text,
  role_label text not null default 'owner',
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_profile_id, owner_email)
);

create table if not exists public.organisation_events (
  id uuid primary key default gen_random_uuid(),
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  event_type text not null default 'community meetup',
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  spaces_note text,
  cta_type text not null default 'contact' check (cta_type in ('contact', 'book')),
  contact_email text,
  contact_phone text,
  booking_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_profile_id, slug)
);

create table if not exists public.organisation_event_enquiries (
  id uuid primary key default gen_random_uuid(),
  organisation_event_id uuid not null references public.organisation_events(id) on delete cascade,
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  cta_type text not null check (cta_type in ('contact', 'book')),
  full_name text not null,
  email text not null,
  phone text,
  message text,
  spaces_requested integer,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  attendance_status text not null default 'unknown' check (attendance_status in ('unknown', 'attended', 'no_show', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organisation_event_feedback (
  id uuid primary key default gen_random_uuid(),
  organisation_event_id uuid not null references public.organisation_events(id) on delete cascade,
  enquiry_id uuid references public.organisation_event_enquiries(id) on delete set null,
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  satisfaction_score integer check (satisfaction_score between 1 and 5),
  usefulness_score integer check (usefulness_score between 1 and 5),
  would_recommend boolean,
  repeat_interest boolean,
  outcomes text,
  comments text,
  submitted_at timestamptz not null default now()
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
create index if not exists listing_claims_status_idx on public.listing_claims(status);
create index if not exists listing_claims_created_idx on public.listing_claims(created_at desc);
create index if not exists listing_claims_listing_id_idx on public.listing_claims(listing_id);
create index if not exists organisation_profiles_resource_idx on public.organisation_profiles(resource_id);
create index if not exists organisation_profiles_featured_idx on public.organisation_profiles(featured);
create index if not exists organisation_profiles_entitlement_status_idx on public.organisation_profiles(entitlement_status);
create index if not exists organisation_profile_members_owner_idx on public.organisation_profile_members(owner_email);
create index if not exists organisation_events_profile_idx on public.organisation_events(organisation_profile_id);
create index if not exists organisation_events_starts_at_idx on public.organisation_events(starts_at);
create index if not exists organisation_event_enquiries_event_idx on public.organisation_event_enquiries(organisation_event_id);
create index if not exists organisation_event_feedback_event_idx on public.organisation_event_feedback(organisation_event_id);

drop trigger if exists set_resource_categories_updated_at on public.resource_categories;
create trigger set_resource_categories_updated_at
before update on public.resource_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute procedure public.set_updated_at();

drop trigger if exists set_listing_claims_updated_at on public.listing_claims;
create trigger set_listing_claims_updated_at
before update on public.listing_claims
for each row execute procedure public.set_updated_at();

drop trigger if exists set_organisation_profiles_updated_at on public.organisation_profiles;
create trigger set_organisation_profiles_updated_at
before update on public.organisation_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_organisation_profile_members_updated_at on public.organisation_profile_members;
create trigger set_organisation_profile_members_updated_at
before update on public.organisation_profile_members
for each row execute procedure public.set_updated_at();

drop trigger if exists set_organisation_events_updated_at on public.organisation_events;
create trigger set_organisation_events_updated_at
before update on public.organisation_events
for each row execute procedure public.set_updated_at();

drop trigger if exists set_organisation_event_enquiries_updated_at on public.organisation_event_enquiries;
create trigger set_organisation_event_enquiries_updated_at
before update on public.organisation_event_enquiries
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

create or replace function public.is_profile_owner(profile_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organisation_profile_members members
    where members.organisation_profile_id = profile_uuid
      and members.status = 'active'
      and (
        members.user_id = auth.uid()
        or lower(coalesce(members.owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
      )
  );
$$;

alter table public.admin_users enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.resource_update_submissions enable row level security;
alter table public.resource_view_events enable row level security;
alter table public.resource_import_jobs enable row level security;
alter table public.listing_claims enable row level security;
alter table public.organisation_profiles enable row level security;
alter table public.organisation_profile_members enable row level security;
alter table public.organisation_events enable row level security;
alter table public.organisation_event_enquiries enable row level security;
alter table public.organisation_event_feedback enable row level security;

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

drop policy if exists "Active admins manage listing claims" on public.listing_claims;
create policy "Active admins manage listing claims"
on public.listing_claims for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Active admins manage organisation profiles" on public.organisation_profiles;
create policy "Active admins manage organisation profiles"
on public.organisation_profiles for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Owners and admins read organisation profiles" on public.organisation_profiles;
create policy "Owners and admins read organisation profiles"
on public.organisation_profiles for select
to authenticated
using (public.is_active_admin() or public.is_profile_owner(id));

drop policy if exists "Public can read active organisation profiles" on public.organisation_profiles;
create policy "Public can read active organisation profiles"
on public.organisation_profiles for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Active admins manage organisation members" on public.organisation_profile_members;
create policy "Active admins manage organisation members"
on public.organisation_profile_members for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Owners and admins read organisation members" on public.organisation_profile_members;
create policy "Owners and admins read organisation members"
on public.organisation_profile_members for select
to authenticated
using (public.is_active_admin() or public.is_profile_owner(organisation_profile_id));

drop policy if exists "Active admins manage organisation events" on public.organisation_events;
create policy "Active admins manage organisation events"
on public.organisation_events for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Owners manage organisation events" on public.organisation_events;
create policy "Owners manage organisation events"
on public.organisation_events for all
to authenticated
using (public.is_profile_owner(organisation_profile_id))
with check (public.is_profile_owner(organisation_profile_id));

drop policy if exists "Public can read scheduled organisation events" on public.organisation_events;
create policy "Public can read scheduled organisation events"
on public.organisation_events for select
to anon, authenticated
using (status in ('scheduled', 'completed'));

drop policy if exists "Active admins manage event enquiries" on public.organisation_event_enquiries;
create policy "Active admins manage event enquiries"
on public.organisation_event_enquiries for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Owners manage event enquiries" on public.organisation_event_enquiries;
create policy "Owners manage event enquiries"
on public.organisation_event_enquiries for all
to authenticated
using (public.is_profile_owner(organisation_profile_id))
with check (public.is_profile_owner(organisation_profile_id));

drop policy if exists "Public can create event enquiries" on public.organisation_event_enquiries;
create policy "Public can create event enquiries"
on public.organisation_event_enquiries for insert
to anon, authenticated
with check (true);

drop policy if exists "Active admins manage event feedback" on public.organisation_event_feedback;
create policy "Active admins manage event feedback"
on public.organisation_event_feedback for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Owners manage event feedback" on public.organisation_event_feedback;
create policy "Owners manage event feedback"
on public.organisation_event_feedback for all
to authenticated
using (public.is_profile_owner(organisation_profile_id))
with check (public.is_profile_owner(organisation_profile_id));

drop policy if exists "Public can create event feedback" on public.organisation_event_feedback;
create policy "Public can create event feedback"
on public.organisation_event_feedback for insert
to anon, authenticated
with check (true);

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

drop policy if exists "Anyone can insert listing claims" on public.listing_claims;
create policy "Anyone can insert listing claims"
on public.listing_claims for insert
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

create or replace view public.organisation_event_kpis as
select
  profiles.id as organisation_profile_id,
  profiles.display_name,
  count(distinct events.id)::bigint as total_events,
  count(enquiries.id)::bigint as total_enquiries,
  count(*) filter (where enquiries.cta_type = 'book')::bigint as total_bookings,
  count(*) filter (where enquiries.attendance_status = 'attended')::bigint as attended,
  count(*) filter (where enquiries.attendance_status = 'no_show')::bigint as no_shows,
  count(distinct enquiries.email) filter (where enquiries.attendance_status = 'attended')::bigint as unique_attendees,
  coalesce(round(avg(nullif(feedback.satisfaction_score, 0))::numeric, 2), 0) as avg_satisfaction,
  coalesce(round(avg(nullif(feedback.usefulness_score, 0))::numeric, 2), 0) as avg_usefulness
from public.organisation_profiles profiles
left join public.organisation_events events on events.organisation_profile_id = profiles.id
left join public.organisation_event_enquiries enquiries on enquiries.organisation_event_id = events.id
left join public.organisation_event_feedback feedback on feedback.organisation_event_id = events.id
group by profiles.id, profiles.display_name;

/* ─── Walk Risk Assessment System ──────────────────────────── */

create table if not exists public.walk_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  walk_id integer not null,
  walk_name text not null,
  title text not null,
  version integer not null default 1,
  summary text not null,
  hazards_json jsonb not null default '[]'::jsonb,
  accessibility_notes text,
  weather_notes text,
  emergency_notes text,
  last_verified_date date not null default current_date,
  status text not null default 'approved' check (status in ('draft', 'pending', 'approved', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (walk_id, version)
);

create table if not exists public.walk_risk_updates (
  id uuid primary key default gen_random_uuid(),
  walk_id integer not null,
  walk_name text not null,
  submitted_by text not null,
  submitted_email text not null,
  submitted_phone text,
  organisation text,
  update_type text not null check (update_type in ('hazard_update', 'accessibility_note', 'accessibility_update', 'weather_warning', 'seasonal_weather_update', 'route_condition_update', 'itinerary_journey_update', 'general_update', 'new_assessment')),
  description text not null,
  itinerary_step_title text,
  itinerary_step_detail text,
  revised_walk_sequence text,
  route_notes text,
  wayfinding_notes text,
  landmarks text,
  start_point_notes text,
  finish_point_notes text,
  circular_route_clarification text,
  rest_points text,
  points_of_interest text,
  transport_notes text,
  parking_notes text,
  safety_sensitive_sections text,
  accessibility_notes text,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected', 'archived')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.walk_risk_updates add column if not exists itinerary_step_title text;
alter table public.walk_risk_updates add column if not exists itinerary_step_detail text;
alter table public.walk_risk_updates add column if not exists revised_walk_sequence text;
alter table public.walk_risk_updates add column if not exists route_notes text;
alter table public.walk_risk_updates add column if not exists wayfinding_notes text;
alter table public.walk_risk_updates add column if not exists landmarks text;
alter table public.walk_risk_updates add column if not exists start_point_notes text;
alter table public.walk_risk_updates add column if not exists finish_point_notes text;
alter table public.walk_risk_updates add column if not exists circular_route_clarification text;
alter table public.walk_risk_updates add column if not exists rest_points text;
alter table public.walk_risk_updates add column if not exists points_of_interest text;
alter table public.walk_risk_updates add column if not exists transport_notes text;
alter table public.walk_risk_updates add column if not exists parking_notes text;
alter table public.walk_risk_updates add column if not exists safety_sensitive_sections text;
alter table public.walk_risk_updates add column if not exists accessibility_notes text;

/* Indexes for walk risk assessments */
create index if not exists walk_risk_assessments_walk_id_idx on public.walk_risk_assessments(walk_id);
create index if not exists walk_risk_assessments_status_idx on public.walk_risk_assessments(status);
create index if not exists walk_risk_assessments_created_idx on public.walk_risk_assessments(created_at desc);
create index if not exists walk_risk_updates_walk_id_idx on public.walk_risk_updates(walk_id);
create index if not exists walk_risk_updates_status_idx on public.walk_risk_updates(status);
create index if not exists walk_risk_updates_created_idx on public.walk_risk_updates(created_at desc);

/* Enable RLS */
alter table public.walk_risk_assessments enable row level security;
alter table public.walk_risk_updates enable row level security;

/* RLS Policies for walk risk assessments */
drop policy if exists "Active admins manage walk risk assessments" on public.walk_risk_assessments;
create policy "Active admins manage walk risk assessments"
on public.walk_risk_assessments for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Public can read approved walk risk assessments" on public.walk_risk_assessments;
create policy "Public can read approved walk risk assessments"
on public.walk_risk_assessments for select
to anon, authenticated
using (status = 'approved');

/* RLS Policies for walk risk updates */
drop policy if exists "Active admins manage walk risk updates" on public.walk_risk_updates;
create policy "Active admins manage walk risk updates"
on public.walk_risk_updates for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Anyone can submit walk risk updates" on public.walk_risk_updates;
create policy "Anyone can submit walk risk updates"
on public.walk_risk_updates for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read approved walk risk updates" on public.walk_risk_updates;
create policy "Public can read approved walk risk updates"
on public.walk_risk_updates for select
to anon, authenticated
using (status = 'approved');

/* Triggers for timestamps */
drop trigger if exists set_walk_risk_assessments_updated_at on public.walk_risk_assessments;
create trigger set_walk_risk_assessments_updated_at
before update on public.walk_risk_assessments
for each row execute procedure public.set_updated_at();

drop trigger if exists set_walk_risk_updates_updated_at on public.walk_risk_updates;
create trigger set_walk_risk_updates_updated_at
before update on public.walk_risk_updates
for each row execute procedure public.set_updated_at();
