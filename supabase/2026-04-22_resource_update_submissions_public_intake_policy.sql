-- Public moderated intake policy for legacy public.resource_update_submissions
-- Status: migration-ready proposal only. Do not execute automatically.
--
-- Purpose:
-- Allow the public/anon Find Help "Submit a new organisation" flow to insert
-- pending moderation rows into the existing legacy submissions table without
-- opening public update/delete access or bypassing admin review.
--
-- Rollback notes:
-- 1. If this migration alone needs to be rolled back, run:
--      drop policy if exists "Public can submit moderated resource updates" on public.resource_update_submissions;
-- 2. This migration does not change table structure or disable RLS.

begin;

do $$
begin
  if to_regclass('public.resource_update_submissions') is null then
    raise exception 'public.resource_update_submissions does not exist';
  end if;
end $$;

alter table public.resource_update_submissions enable row level security;

drop policy if exists "Public can submit moderated resource updates" on public.resource_update_submissions;
create policy "Public can submit moderated resource updates"
on public.resource_update_submissions for insert
to anon, authenticated
with check (
  status = 'pending'
  and nullif(btrim(coalesce(organisation_name, '')), '') is not null
  and nullif(btrim(coalesce(submitter_name, '')), '') is not null
  and nullif(btrim(coalesce(submitter_email, '')), '') is not null
  and nullif(btrim(coalesce(reason, '')), '') is not null
  and coalesce(relationship_to_organisation, '') like 'New organisation submission%'
  and resource_id is null
  and admin_notes is null
);

commit;