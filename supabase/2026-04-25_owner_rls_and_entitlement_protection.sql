-- 2026-04-25 Owner RLS policies and entitlement field protection
--
-- Problem being solved:
-- 1. Non-admin owners cannot INSERT a new organisation_profile (no INSERT policy).
-- 2. Non-admin owners cannot UPDATE their own profile because is_profile_owner()
--    checks organisation_profile_members, which the claim-approval flow never populates.
--    Adding a direct owner_email match resolves this without depending on the members table.
-- 3. Once owners can UPDATE, they could theoretically escalate their own entitlement
--    fields (featured, analytics_enabled, event_quota, etc.) via the API. A BEFORE UPDATE
--    trigger blocks this — non-admins silently get the old values for those columns.

begin;

-- ── 1. Allow authenticated owners to INSERT their own profile ────────────────
DROP POLICY IF EXISTS "Owners can create their own profiles" ON public.organisation_profiles;
CREATE POLICY "Owners can create their own profiles"
ON public.organisation_profiles FOR INSERT
TO authenticated
WITH CHECK (
  lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  OR created_by = auth.uid()
);

-- ── 2. Allow owners to UPDATE their own profile by owner_email ───────────────
-- Complements the existing is_profile_owner() policy.
-- The owner_email match is direct and does not require organisation_profile_members.
DROP POLICY IF EXISTS "Profile owners can update own profile by email" ON public.organisation_profiles;
CREATE POLICY "Profile owners can update own profile by email"
ON public.organisation_profiles FOR UPDATE
TO authenticated
USING  (lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt()->>'email', '')))
WITH CHECK (lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt()->>'email', '')));

-- ── 3. Entitlement field protection trigger ──────────────────────────────────
-- Prevents non-admin owners from escalating their own commercial tier even via
-- direct Supabase API calls. Non-admins silently receive the existing column
-- values for any premium/entitlement fields included in an UPDATE payload.
CREATE OR REPLACE FUNCTION public.protect_org_profile_entitlement_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    -- Reset commercial fields to their existing values — owner cannot change these
    NEW.featured              := OLD.featured;
    NEW.featured_enabled      := OLD.featured_enabled;
    NEW.analytics_enabled     := OLD.analytics_enabled;
    NEW.enquiry_tools_enabled := OLD.enquiry_tools_enabled;
    NEW.event_quota           := OLD.event_quota;
    NEW.package_name          := OLD.package_name;
    NEW.entitlement_status    := OLD.entitlement_status;
    NEW.start_date            := OLD.start_date;
    NEW.end_date              := OLD.end_date;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_entitlement_on_update ON public.organisation_profiles;
CREATE TRIGGER protect_entitlement_on_update
BEFORE UPDATE ON public.organisation_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_org_profile_entitlement_fields();

-- ── 4. organisation_profile_members — no schema change needed ────────────────
-- The table and its unique index on (organisation_profile_id, lower(owner_email))
-- already exist. The claim-approval frontend code (Admin.jsx applyApprovedClaimOwnership)
-- is updated separately to INSERT a member row on approval, which makes
-- is_profile_owner() return true and enables owner access to organisation_events.

commit;
