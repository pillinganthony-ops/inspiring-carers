-- 2026-04-26  Add Activities & Things To Do category
-- Adds a new category alongside the existing 15.
-- sort_order 155 places it after Nature & Outdoors (150).

INSERT INTO public.categories (name, slug, sort_order, active)
VALUES ('Activities & Things To Do', 'activities-things-to-do', 155, true)
ON CONFLICT (slug) DO NOTHING;
