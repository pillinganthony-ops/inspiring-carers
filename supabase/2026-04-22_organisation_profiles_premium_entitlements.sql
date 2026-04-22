-- Premium entitlement extension for public.organisation_profiles
-- Status: migration-ready proposal only. Do not execute automatically.
--
-- Rollback notes:
-- 1. Before applying to a live database, export the schema for public.organisation_profiles and snapshot any rows that will receive manual entitlement assignments.
-- 2. If this migration alone needs to be rolled back before entitlement data is used, run:
--      drop index if exists public.organisation_profiles_entitlement_status_idx;
--      alter table public.organisation_profiles drop constraint if exists organisation_profiles_entitlement_status_check;
--      alter table public.organisation_profiles drop constraint if exists organisation_profiles_event_quota_check;
--      alter table public.organisation_profiles drop column if exists analytics_enabled;
--      alter table public.organisation_profiles drop column if exists enquiry_tools_enabled;
--      alter table public.organisation_profiles drop column if exists event_quota;
--      alter table public.organisation_profiles drop column if exists featured_enabled;
--      alter table public.organisation_profiles drop column if exists end_date;
--      alter table public.organisation_profiles drop column if exists start_date;
--      alter table public.organisation_profiles drop column if exists entitlement_status;
--      alter table public.organisation_profiles drop column if exists package_name;
-- 3. If rows have already been manually provisioned, export those rows before rollback so entitlement decisions can be restored later.

begin;

alter table public.organisation_profiles
  add column if not exists package_name text,
  add column if not exists entitlement_status text not null default 'inactive',
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists featured_enabled boolean not null default false,
  add column if not exists event_quota integer not null default 0,
  add column if not exists enquiry_tools_enabled boolean not null default false,
  add column if not exists analytics_enabled boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'organisation_profiles_entitlement_status_check'
  ) then
    alter table public.organisation_profiles
      add constraint organisation_profiles_entitlement_status_check
      check (entitlement_status in ('inactive', 'trial', 'active', 'paused', 'expired'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'organisation_profiles_event_quota_check'
  ) then
    alter table public.organisation_profiles
      add constraint organisation_profiles_event_quota_check
      check (event_quota >= 0);
  end if;
end $$;

create index if not exists organisation_profiles_entitlement_status_idx
  on public.organisation_profiles(entitlement_status);

comment on column public.organisation_profiles.package_name is
  'Commercial package label assigned before checkout automation exists, for example starter, growth, or featured_plus.';

comment on column public.organisation_profiles.entitlement_status is
  'Manual commercial entitlement lifecycle before payments are implemented: inactive, trial, active, paused, or expired.';

comment on column public.organisation_profiles.featured_enabled is
  'Whether the organisation is entitled to featured placement, independent of whether featured placement is currently switched on.';

comment on column public.organisation_profiles.event_quota is
  'How many promoted or premium-managed events the organisation can run in the entitlement period.';

commit;