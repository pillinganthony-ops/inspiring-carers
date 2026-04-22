do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'resources'
      and column_name = 'moderation_status'
  ) then
    alter table public.resources add column moderation_status text;
  end if;
end $$;

update public.resources
set moderation_status = case
  when is_archived = true then 'ARCHIVED'
  when coalesce(active, false) = true then 'LIVE'
  else 'REVIEW_QUEUE'
end
where moderation_status is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_moderation_status_check'
  ) then
    alter table public.resources
      add constraint resources_moderation_status_check
      check (moderation_status in ('LIVE', 'REVIEW_QUEUE', 'ARCHIVED'));
  end if;
end $$;

alter table public.resources
  alter column moderation_status set default 'LIVE';

update public.resources
set moderation_status = coalesce(moderation_status, 'LIVE');

alter table public.resources
  alter column moderation_status set not null;

create index if not exists resources_moderation_status_idx on public.resources(moderation_status);