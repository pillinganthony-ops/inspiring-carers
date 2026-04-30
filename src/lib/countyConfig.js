// countyConfig.js — shared county label and DB name mappings.
// Source of truth for all county pages (Activities, PlacesToVisit, WellbeingSupport, Events).
//
// County slugs (lowercase) are used in URLs and React state.
// DB names (Capitalised) are what Supabase stores in the county column.
// Display labels are what users see in headings and breadcrumbs.
//
// All three values happen to be identical for current counties.
// Keeping COUNTY_DB and COUNTY_LABELS as separate exports preserves the
// semantic distinction between DB queries and UI rendering.

export const COUNTY_LABELS = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  somerset:  'Somerset',
  bristol:   'Bristol',
  dorset:    'Dorset',
  wiltshire: 'Wiltshire',
};

// DB name used in Supabase .eq('county', ...) queries.
// Currently identical to COUNTY_LABELS; kept separate for clarity.
export const COUNTY_DB = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  somerset:  'Somerset',
  bristol:   'Bristol',
  dorset:    'Dorset',
  wiltshire: 'Wiltshire',
};

// Returns the display label for a county slug.
// Falls back to the raw slug if the county is unrecognised.
export const getCountyLabel = (county) => COUNTY_LABELS[county] || county || '';

// Returns the DB name for a county slug used in Supabase queries.
// Falls back to 'Cornwall' to prevent empty .eq() calls.
export const getCountyDbName = (county) => COUNTY_DB[county] || 'Cornwall';
