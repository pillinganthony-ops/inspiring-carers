import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_KML_PATH,
  chunk,
  computeConfidence,
  computeDuplicateSignals,
  createBatchCode,
  parseKmlFile,
} from './utils.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const args = process.argv.slice(2);
const flags = new Set(args.filter((item) => item.startsWith('--')));
const getArg = (name, fallback) => {
  const index = args.findIndex((item) => item === `--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const dryRun = flags.has('--dry-run');
const kmlPath = getArg('kml', DEFAULT_KML_PATH);
const importBatch = getArg('batch', createBatchCode());

const main = async () => {
  const parsedRows = await parseKmlFile(kmlPath);

  let existingResources = [];
  let supabase = null;

  if (!dryRun) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for staging import.');
    }

    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: liveRows, error: liveError } = await supabase
      .from('resources')
      .select('name,latitude,longitude,website,phone,postcode')
      .limit(5000);

    if (liveError) throw liveError;
    existingResources = liveRows || [];
  }

  computeDuplicateSignals(parsedRows, existingResources);
  parsedRows.forEach((row) => computeConfidence(row));

  const summary = {
    import_batch: importBatch,
    kml_path: kmlPath,
    total_rows: parsedRows.length,
    parse_errors: parsedRows.filter((row) => row.parse_status !== 'parsed').length,
    duplicates_flagged: parsedRows.filter((row) => row.duplicate_flag).length,
    review_required: parsedRows.filter((row) => row.needs_review).length,
    ready_to_import: parsedRows.filter((row) => row.approved_for_import).length,
  };

  if (dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const { error: batchInsertError } = await supabase.from('resources_import_batches').upsert({
    batch_code: importBatch,
    source_filename: path.basename(kmlPath),
    source_type: 'kml',
    status: 'staged',
    total_rows: summary.total_rows,
    parse_errors: summary.parse_errors,
    duplicates_flagged: summary.duplicates_flagged,
    review_required: summary.review_required,
    ready_to_import: summary.ready_to_import,
  }, { onConflict: 'batch_code' });

  if (batchInsertError) throw batchInsertError;

  const { error: deleteError } = await supabase
    .from('resources_staging')
    .delete()
    .eq('import_batch', importBatch);

  if (deleteError) throw deleteError;

  const stagedRows = parsedRows.map((row) => ({
    import_batch: importBatch,
    raw_name: row.raw_name,
    raw_folder: row.raw_folder,
    raw_description: row.raw_description,
    raw_lat: row.raw_lat,
    raw_lng: row.raw_lng,
    raw_data_json: row.raw_data_json,
    parse_status: row.parse_status,
    duplicate_flag: row.duplicate_flag,
    duplicate_reasons: row.duplicate_reasons,
    confidence_score: row.confidence_score,
    needs_review: row.needs_review,
    approved_for_import: row.approved_for_import,
    clean_name: row.clean_name,
    clean_slug: row.clean_slug,
    clean_summary: row.clean_summary,
    clean_description: row.clean_description,
    clean_website: row.clean_website,
    clean_phone: row.clean_phone,
    clean_email: row.clean_email,
    mapped_category: row.mapped_category,
    subcategory: row.subcategory,
    town: row.town,
    postcode: row.postcode,
    source_reference: `kml:${importBatch}:${row.source_reference}`,
  }));

  for (const rows of chunk(stagedRows, 200)) {
    const { error } = await supabase.from('resources_staging').insert(rows);
    if (error) throw error;
  }

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error('KML staging import failed:', error.message || error);
  process.exitCode = 1;
});
