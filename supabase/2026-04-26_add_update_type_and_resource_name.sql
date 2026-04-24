-- 2026-04-26  Add update_type and resource_name to resource_update_submissions
-- Fixes: "Could not find column update_type" and "Could not find column resource_name"
--
-- These columns are needed by all new contact forms:
--   general_enquiry, upgrade_enquiry, organisation_message, callback_request,
--   event_enquiry, claim_request (fallback path)
--
-- Both are nullable text — existing rows get NULL, no data loss, no constraint change.

ALTER TABLE public.resource_update_submissions
  ADD COLUMN IF NOT EXISTS update_type  text,
  ADD COLUMN IF NOT EXISTS resource_name text;

-- Optional: index update_type for admin queue filtering
CREATE INDEX IF NOT EXISTS idx_resource_update_submissions_update_type
  ON public.resource_update_submissions (update_type);
