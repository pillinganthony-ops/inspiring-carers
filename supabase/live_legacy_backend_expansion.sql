-- Inspiring Carers: additive backend expansion for the live legacy resources schema
--
-- Assumptions:
-- 1. public.resources already exists in production and remains the source-of-truth listing table.
-- 2. public.resources.id is uuid. If the live id type differs, adjust FK column types below before running.
-- 3. This migration is additive. It does not replace or rebuild the legacy resources table.
-- 4. Walk data currently comes from app/static sources, so walk moderation tables use walk_id + walk_name snapshots rather than a DB FK.

begin;

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

-- Phase B: listing claims
create table if not exists public.listing_claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.resources(id) on delete set null,
  submitted_by_user_id uuid references auth.users(id) on delete set null,
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

create index if not exists listing_claims_status_idx on public.listing_claims(status);
create index if not exists listing_claims_created_idx on public.listing_claims(created_at desc);
create index if not exists listing_claims_listing_id_idx on public.listing_claims(listing_id);
create index if not exists listing_claims_listing_slug_idx on public.listing_claims(lower(coalesce(listing_slug, '')));
create index if not exists listing_claims_email_idx on public.listing_claims(lower(email));

drop trigger if exists set_listing_claims_updated_at on public.listing_claims;
create trigger set_listing_claims_updated_at
before update on public.listing_claims
for each row execute procedure public.set_updated_at();

-- Phase C + E: profiles and authenticated profile access
create table if not exists public.organisation_profiles (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid unique references public.resources(id) on delete cascade,
  approved_claim_id uuid references public.listing_claims(id) on delete set null,
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
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organisation_profiles_resource_idx on public.organisation_profiles(resource_id);
create index if not exists organisation_profiles_active_idx on public.organisation_profiles(is_active);
create index if not exists organisation_profiles_featured_idx on public.organisation_profiles(featured);
create index if not exists organisation_profiles_claim_status_idx on public.organisation_profiles(claim_status);

drop trigger if exists set_organisation_profiles_updated_at on public.organisation_profiles;
create trigger set_organisation_profiles_updated_at
before update on public.organisation_profiles
for each row execute procedure public.set_updated_at();

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
  updated_at timestamptz not null default now()
);

create index if not exists organisation_profile_members_profile_idx on public.organisation_profile_members(organisation_profile_id);
create index if not exists organisation_profile_members_user_idx on public.organisation_profile_members(user_id);
create index if not exists organisation_profile_members_owner_idx on public.organisation_profile_members(lower(coalesce(owner_email, '')));
create unique index if not exists organisation_profile_members_profile_user_uidx on public.organisation_profile_members(organisation_profile_id, user_id) where user_id is not null;
create unique index if not exists organisation_profile_members_profile_email_uidx on public.organisation_profile_members(organisation_profile_id, lower(owner_email)) where owner_email is not null;

drop trigger if exists set_organisation_profile_members_updated_at on public.organisation_profile_members;
create trigger set_organisation_profile_members_updated_at
before update on public.organisation_profile_members
for each row execute procedure public.set_updated_at();

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

-- Phase C: events
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

create index if not exists organisation_events_profile_idx on public.organisation_events(organisation_profile_id);
create index if not exists organisation_events_status_idx on public.organisation_events(status);
create index if not exists organisation_events_starts_at_idx on public.organisation_events(starts_at);

drop trigger if exists set_organisation_events_updated_at on public.organisation_events;
create trigger set_organisation_events_updated_at
before update on public.organisation_events
for each row execute procedure public.set_updated_at();

create table if not exists public.organisation_event_enquiries (
  id uuid primary key default gen_random_uuid(),
  organisation_event_id uuid not null references public.organisation_events(id) on delete cascade,
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  submitted_by_user_id uuid references auth.users(id) on delete set null,
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

create index if not exists organisation_event_enquiries_event_idx on public.organisation_event_enquiries(organisation_event_id);
create index if not exists organisation_event_enquiries_profile_idx on public.organisation_event_enquiries(organisation_profile_id);
create index if not exists organisation_event_enquiries_status_idx on public.organisation_event_enquiries(status);
create index if not exists organisation_event_enquiries_created_idx on public.organisation_event_enquiries(created_at desc);

drop trigger if exists set_organisation_event_enquiries_updated_at on public.organisation_event_enquiries;
create trigger set_organisation_event_enquiries_updated_at
before update on public.organisation_event_enquiries
for each row execute procedure public.set_updated_at();

create table if not exists public.organisation_event_feedback (
  id uuid primary key default gen_random_uuid(),
  organisation_event_id uuid not null references public.organisation_events(id) on delete cascade,
  enquiry_id uuid references public.organisation_event_enquiries(id) on delete set null,
  organisation_profile_id uuid not null references public.organisation_profiles(id) on delete cascade,
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  satisfaction_score integer check (satisfaction_score between 1 and 5),
  usefulness_score integer check (usefulness_score between 1 and 5),
  would_recommend boolean,
  repeat_interest boolean,
  outcomes text,
  comments text,
  submitted_at timestamptz not null default now()
);

create index if not exists organisation_event_feedback_event_idx on public.organisation_event_feedback(organisation_event_id);
create index if not exists organisation_event_feedback_profile_idx on public.organisation_event_feedback(organisation_profile_id);
create index if not exists organisation_event_feedback_submitted_idx on public.organisation_event_feedback(submitted_at desc);

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

-- Phase D: walk moderation backend
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
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  submitted_by text not null,
  submitted_email text not null,
  submitted_phone text,
  organisation text,
  update_type text not null check (update_type in ('hazard_update', 'accessibility_update', 'seasonal_weather_update', 'route_condition_update', 'itinerary_journey_update', 'general_update', 'new_assessment')),
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

create index if not exists walk_risk_assessments_walk_id_idx on public.walk_risk_assessments(walk_id);
create index if not exists walk_risk_assessments_status_idx on public.walk_risk_assessments(status);
create index if not exists walk_risk_assessments_created_idx on public.walk_risk_assessments(created_at desc);
create index if not exists walk_risk_updates_walk_id_idx on public.walk_risk_updates(walk_id);
create index if not exists walk_risk_updates_status_idx on public.walk_risk_updates(status);
create index if not exists walk_risk_updates_created_idx on public.walk_risk_updates(created_at desc);

drop trigger if exists set_walk_risk_assessments_updated_at on public.walk_risk_assessments;
create trigger set_walk_risk_assessments_updated_at
before update on public.walk_risk_assessments
for each row execute procedure public.set_updated_at();

drop trigger if exists set_walk_risk_updates_updated_at on public.walk_risk_updates;
create trigger set_walk_risk_updates_updated_at
before update on public.walk_risk_updates
for each row execute procedure public.set_updated_at();

-- Row level security
alter table public.admin_users enable row level security;
alter table public.listing_claims enable row level security;
alter table public.organisation_profiles enable row level security;
alter table public.organisation_profile_members enable row level security;
alter table public.organisation_events enable row level security;
alter table public.organisation_event_enquiries enable row level security;
alter table public.organisation_event_feedback enable row level security;
alter table public.walk_risk_assessments enable row level security;
alter table public.walk_risk_updates enable row level security;

drop policy if exists "Admin users can view own profile" on public.admin_users;
create policy "Admin users can view own profile"
on public.admin_users for select
to authenticated
using (auth.uid() = user_id or public.is_active_admin());

drop policy if exists "Active admins manage listing claims" on public.listing_claims;
create policy "Active admins manage listing claims"
on public.listing_claims for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Anyone can insert listing claims" on public.listing_claims;
create policy "Anyone can insert listing claims"
on public.listing_claims for insert
to anon, authenticated
with check (true);

drop policy if exists "Claimants can read own listing claims" on public.listing_claims;
create policy "Claimants can read own listing claims"
on public.listing_claims for select
to authenticated
using (
  public.is_active_admin()
  or submitted_by_user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
);

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

drop policy if exists "Owners and admins manage own organisation profiles" on public.organisation_profiles;
create policy "Owners and admins manage own organisation profiles"
on public.organisation_profiles for update
to authenticated
using (public.is_active_admin() or public.is_profile_owner(id))
with check (public.is_active_admin() or public.is_profile_owner(id));

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
using (
  public.is_active_admin()
  or public.is_profile_owner(organisation_profile_id)
  or user_id = auth.uid()
  or lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
);

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

commit;