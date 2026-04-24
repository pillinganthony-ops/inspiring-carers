-- 2026-04-24 Live schema alignment (corrected 2026-04-24)
-- Live production tables confirmed:
--   categories (NOT resource_categories)
--   walk_comments (EXISTS)
--   resource_categories (does NOT exist)
--
-- organisation_profiles: column names were changed from the original schema
-- (display_name → organisation_name, bio → short_bio/full_bio, email → contact_email,
--  phone → contact_phone, website → website_url, cover_image_url → banner_url,
--  socials JSONB → individual _url columns, owner_email added).

begin;

-- Add live columns if not present (idempotent).
-- These were added manually via the Supabase UI after the initial migration ran.
ALTER TABLE public.organisation_profiles
  ADD COLUMN IF NOT EXISTS organisation_name text,
  ADD COLUMN IF NOT EXISTS owner_email text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS short_bio text,
  ADD COLUMN IF NOT EXISTS full_bio text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS x_url text,
  ADD COLUMN IF NOT EXISTS threads_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text;

-- Fix is_active_admin() to use SECURITY DEFINER so admin_users SELECT
-- does not trigger RLS recursion when called from within RLS policies.
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, anon;

-- Drop the incorrect role check constraint if still present.
-- The live admin_users row uses role = 'super_admin' which violates the constraint.
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- Populate categories with the 15 standard categories if the table is empty.
-- Uses ON CONFLICT (slug) to be safe if some rows already exist.
INSERT INTO public.categories (name, slug, sort_order, active) VALUES
  ('Mental Health & Wellbeing',     'mental-health-wellbeing',              10,  true),
  ('Carer Support',                 'carer-support',                        20,  true),
  ('Health & Medical',              'health-medical-support',               30,  true),
  ('Advice & Guidance',             'advice-guidance',                      40,  true),
  ('Housing & Homelessness',        'housing-homelessness',                 50,  true),
  ('Food & Essentials',             'food-essentials',                      60,  true),
  ('Family & Children',             'family-children',                      70,  true),
  ('Older People',                  'older-people-support',                 80,  true),
  ('Community & Social Connection', 'community-groups-social-connection',   90,  true),
  ('Faith & Spiritual',             'faith-spiritual-support',              100, true),
  ('Employment & Skills',           'employment-skills',                    110, true),
  ('Crisis Support',                'crisis-safety-support',                120, true),
  ('Disability & Accessibility',    'disability-accessibility',             130, true),
  ('Transport & Access',            'transport-access',                     140, true),
  ('Nature & Outdoors',             'nature-activity-outdoors',             150, true)
ON CONFLICT (slug) DO NOTHING;

commit;
