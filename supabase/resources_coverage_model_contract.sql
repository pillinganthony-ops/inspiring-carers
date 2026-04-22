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
  'Public coverage behaviour for a resource: physical_venue, county_wide, multi_location, or hq_only. Null means legacy behaviour until migrated.';

comment on column public.resources.coverage_area_label is
  'Optional display/search label for non-local coverage, e.g. Cornwall-wide, Multiple locations across Cornwall, or Head office only.';