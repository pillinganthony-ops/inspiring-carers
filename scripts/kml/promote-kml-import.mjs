import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_CATEGORIES, slugify } from './utils.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const index = args.findIndex((item) => item === `--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const importBatch = getArg('batch');
const limit = Number(getArg('limit', '1000'));
const includeReview = args.includes('--include-review');

if (!importBatch) {
  console.error('Missing required --batch argument.');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ensureCategories = async () => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id,name,slug')
    .limit(500);

  if (error) throw error;

  const byName = new Map((categories || []).map((item) => [item.name, item]));
  const missing = APPROVED_CATEGORIES.filter((name) => !byName.has(name));

  if (missing.length) {
    const payload = missing.map((name, idx) => ({
      name,
      slug: slugify(name),
      sort_order: idx,
      active: true,
    }));

    const { error: insertError } = await supabase.from('categories').insert(payload);
    if (insertError) throw insertError;
  }

  const { data: refreshed, error: refreshedError } = await supabase
    .from('categories')
    .select('id,name')
    .limit(500);

  if (refreshedError) throw refreshedError;

  return new Map((refreshed || []).map((item) => [item.name, item.id]));
};

const safeSlug = (baseSlug, id) => {
  if (!baseSlug) return `kml-${id}`;
  return baseSlug.length > 110 ? baseSlug.slice(0, 110) : baseSlug;
};

const promote = async () => {
  const categoryMap = await ensureCategories();

  let query = supabase
    .from('resources_staging')
    .select('*')
    .eq('import_batch', importBatch)
    .eq('parse_status', 'parsed')
    .is('imported_resource_id', null)
    .order('confidence_score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!includeReview) {
    query = query.eq('needs_review', false).eq('approved_for_import', true);
  }

  const { data: stagingRows, error: stagingError } = await query;
  if (stagingError) throw stagingError;

  const promotedIds = [];

  for (const row of stagingRows || []) {
    const slug = safeSlug(row.clean_slug || slugify(row.clean_name || row.raw_name || ''), row.id);

    const payload = {
      name: row.clean_name || row.raw_name || 'Unnamed resource',
      slug,
      category: row.mapped_category || 'Community Groups & Social Connection',
      subcategory: row.subcategory || null,
      town: row.town || null,
      postcode: row.postcode || null,
      description: row.clean_description || null,
      website: row.clean_website || null,
      phone: row.clean_phone || null,
      email: row.clean_email || null,
      lat: Number.isFinite(Number(row.raw_lat)) ? Number(row.raw_lat) : null,
      lng: Number.isFinite(Number(row.raw_lng)) ? Number(row.raw_lng) : null,
      active: true,
      verified: false,
      featured: false,
      needs_review: row.needs_review,
      raw_folder: row.raw_folder,
    };

    const { data: insertedRows, error: insertError } = await supabase
      .from('resources')
      .insert(payload)
      .select('id')
      .limit(1);

    if (insertError) {
      console.error(`Row ${row.clean_name}: ${insertError.message}`);
      await supabase.from('resources_staging').update({
        parse_status: 'promotion_error',
      }).eq('id', row.id);
      continue;
    }

    const importedResourceId = insertedRows?.[0]?.id || null;
    promotedIds.push(row.id);

    await supabase.from('resources_staging').update({
      parse_status: 'promoted',
      imported_resource_id: importedResourceId,
      promoted_at: new Date().toISOString(),
    }).eq('id', row.id);
  }

  const { data: countsRows, error: countsError } = await supabase
    .from('resources_staging')
    .select('id,parse_status,needs_review', { count: 'exact' })
    .eq('import_batch', importBatch);

  if (countsError) throw countsError;

  const stagedTotal = countsRows?.length || 0;
  const promotedCount = countsRows?.filter((item) => item.parse_status === 'promoted').length || 0;
  const reviewCount = countsRows?.filter((item) => item.needs_review).length || 0;

  const status = promotedCount >= stagedTotal && stagedTotal > 0
    ? 'promoted'
    : promotedCount > 0
      ? 'partially_promoted'
      : 'staged';

  await supabase.from('resources_import_batches').update({
    status,
    promoted_count: promotedCount,
    review_required: reviewCount,
  }).eq('batch_code', importBatch);

  console.log(JSON.stringify({
    import_batch: importBatch,
    staged_total: stagedTotal,
    promoted_count: promotedCount,
    review_required: reviewCount,
    include_review: includeReview,
  }, null, 2));
};

promote().catch((error) => {
  console.error('KML promote failed:', error.message || error);
  process.exitCode = 1;
});
