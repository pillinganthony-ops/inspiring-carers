-- Coverage model migration for public.resources
-- Status: migration-ready proposal only. Do not execute automatically.
--
-- Rollback notes:
-- 1. Before applying to a live database, export the schema for public.resources and snapshot any rows that will later receive coverage data writes.
-- 2. If this migration alone needs to be rolled back before any data migration, run:
--      drop index if exists public.resources_service_footprint_model_idx;
--      alter table public.resources drop constraint if exists resources_service_footprint_model_check;
--      alter table public.resources drop column if exists coverage_area_label;
--      alter table public.resources drop column if exists service_footprint_model;
-- 3. If data has already been written into these columns, restore row values from the wave-specific rollback JSON before dropping columns.

begin;

alter table public.resources
  add column if not exists service_footprint_model text,
  add column if not exists coverage_area_label text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_service_footprint_model_check'
  ) then
    alter table public.resources
      add constraint resources_service_footprint_model_check
      check (
        service_footprint_model is null
        or service_footprint_model in ('physical_venue', 'county_wide', 'multi_location', 'hq_only')
      );
  end if;
end $$;

create index if not exists resources_service_footprint_model_idx
  on public.resources(service_footprint_model);

comment on column public.resources.service_footprint_model is
  'Public coverage behaviour for a resource: physical_venue, county_wide, multi_location, or hq_only. Null preserves legacy behaviour until migrated.';

comment on column public.resources.coverage_area_label is
  'Optional public-facing area label for non-local coverage, e.g. Cornwall-wide, Multiple locations across Cornwall, or Head office only - service covers Cornwall.';

commit;