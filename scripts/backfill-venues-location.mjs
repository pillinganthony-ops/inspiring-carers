console.log('Script started');
console.log('DATABASE_URL found:', Boolean(process.env.DATABASE_URL));

/**
 * backfill-venues-location.mjs
 *
 * Populates public.venues.location from each venue's postcode
 * using the postcodes.io bulk geocoding API.
 *
 * Safe to rerun — the UPDATE guard (AND location IS NULL) means
 * already-set rows are never touched.
 *
 * Requires: Node 18+, pg package
 * Run:
 *   DATABASE_URL="postgresql://postgres:[pw]@[host]:5432/postgres" \
 *     node scripts/backfill-venues-location.mjs
 *
 * Get DATABASE_URL from:
 *   Supabase → Project Settings → Database → Connection string → URI
 *   Use the Transaction pooler URI if the session pooler times out.
 */

import pkg from 'pg';
const { Pool } = pkg;

// ── Config ────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL env var is not set.');
  console.error('');
  console.error('Get it from:');
  console.error('  Supabase → Project Settings → Database → Connection string → URI');
  console.error('');
  console.error('Then run:');
  console.error('  DATABASE_URL="postgresql://..." node scripts/backfill-venues-location.mjs');
  process.exit(1);
}

const ACTIVE_STATUS = 'active'; // status value for live venues
const BATCH_SIZE    = 100;      // postcodes.io bulk endpoint limit

// ── postcodes.io ──────────────────────────────────────────────────────────────

/**
 * Bulk geocode up to 100 postcodes.
 * Returns a map of UPPERCASE_POSTCODE → { lat, lng }.
 * Postcodes that return no result are omitted from the map.
 */
async function bulkGeocode(postcodes) {
  console.log(`  → postcodes.io request: ${postcodes.length} postcodes…`);
  const res = await fetch('https://api.postcodes.io/postcodes', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ postcodes }),
  });
  console.log(`  ← postcodes.io response: HTTP ${res.status}`);

  if (!res.ok) {
    throw new Error(`postcodes.io returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const map  = {};

  for (const item of (json.result || [])) {
    if (item.result) {
      map[item.query.toUpperCase()] = {
        lat: item.result.latitude,
        lng: item.result.longitude,
      };
    }
  }

  console.log(`  ← resolved: ${Object.keys(map).length} / ${postcodes.length}`);
  return map;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Creating pool…');
  const pool = new Pool({
    connectionString:        DATABASE_URL,
    ssl:                     { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    query_timeout:           15000,
  });

  console.log('Connecting to database…');
  let client;
  try {
    client = await pool.connect();
    console.log('Connected.');
  } catch (err) {
    console.error('Connection failed:', err.message);
    await pool.end();
    process.exit(1);
  }

  try {
    // ── 1. Rows we can geocode ────────────────────────────────────────────────
    console.log('\nQuery 1: fetching geocodable venues…');
    let venues;
    try {
      const result = await client.query(`
        SELECT id, name, category, town, county, postcode
        FROM   public.venues
        WHERE  status   = $1
          AND  location IS NULL
          AND  postcode IS NOT NULL
          AND  TRIM(postcode) <> ''
        ORDER  BY county, name
      `, [ACTIVE_STATUS]);
      venues = result.rows;
      console.log(`Query 1 complete: ${venues.length} rows`);
    } catch (err) {
      console.error('Query 1 failed:', err.message);
      throw err;
    }

    // ── 2. Rows with no postcode — log and skip ───────────────────────────────
    console.log('Query 2: fetching venues with no postcode…');
    let noPostcode;
    try {
      const result = await client.query(`
        SELECT id, name, town, county
        FROM   public.venues
        WHERE  status   = $1
          AND  location IS NULL
          AND  (postcode IS NULL OR TRIM(postcode) = '')
        ORDER  BY county, name
      `, [ACTIVE_STATUS]);
      noPostcode = result.rows;
      console.log(`Query 2 complete: ${noPostcode.length} rows`);
    } catch (err) {
      console.error('Query 2 failed:', err.message);
      throw err;
    }

    console.log('');
    console.log('── backfill-venues-location ──────────────────────────────────');
    console.log(`Geocodable    : ${venues.length}`);
    console.log(`No postcode   : ${noPostcode.length}`);

    if (noPostcode.length) {
      console.log('\nRows skipped (no postcode):');
      noPostcode.forEach(v =>
        console.log(`  [${v.county || '—'}] ${v.name} | ${v.town || '—'}`)
      );
    }

    if (venues.length === 0) {
      console.log('\nNothing to geocode. Exiting.');
      return;
    }

    let updated = 0;
    let failed  = 0;

    // ── 3. Process in batches of 100 ─────────────────────────────────────────
    for (let i = 0; i < venues.length; i += BATCH_SIZE) {
      const batch     = venues.slice(i, i + BATCH_SIZE);
      const postcodes = batch.map(v => v.postcode.trim().toUpperCase());
      const batchNum  = Math.ceil((i + 1) / BATCH_SIZE);

      console.log(`\nBatch ${batchNum}: ${batch.length} postcodes…`);

      let geoMap;
      try {
        geoMap = await bulkGeocode(postcodes);
      } catch (err) {
        console.error(`  postcodes.io request failed: ${err.message}`);
        console.error('  Skipping entire batch — will need a rerun.');
        failed += batch.length;
        continue;
      }

      for (const v of batch) {
        const key    = v.postcode.trim().toUpperCase();
        const coords = geoMap[key];

        if (!coords) {
          console.warn(`  SKIP  [${v.county}] ${v.name} — postcode not found: ${v.postcode}`);
          failed++;
          continue;
        }

        try {
          // longitude first, latitude second — required by ST_MakePoint
          // Cast to ::geography matches the column type (confirmed via view definition)
          const result = await client.query(
            `UPDATE public.venues
             SET    location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
             WHERE  id = $3
               AND  location IS NULL`,
            [coords.lng, coords.lat, v.id]
          );

          if (result.rowCount > 0) {
            console.log(`  OK    [${v.county}] ${v.name} → ${coords.lat}, ${coords.lng}`);
            updated++;
          } else {
            // location was set externally between SELECT and UPDATE — safe
            console.log(`  SAFE  [${v.county}] ${v.name} — already set, not overwritten`);
          }
        } catch (err) {
          console.error(`  ERROR [${v.name}]: ${err.message}`);
          failed++;
        }
      }
    }

    // ── 4. Summary ────────────────────────────────────────────────────────────
    console.log('');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`Updated       : ${updated}`);
    console.log(`Failed / skip : ${failed}`);
    console.log(`No postcode   : ${noPostcode.length}`);
    console.log('');

    if (updated > 0) {
      console.log('Run validation SQL to confirm:');
      console.log('');
      console.log("  SELECT COUNT(*) AS now_has_location");
      console.log("  FROM public.venues");
      console.log("  WHERE status = 'active' AND location IS NOT NULL;");
      console.log('');
      console.log("  SELECT name, latitude, longitude");
      console.log("  FROM public.venues_public");
      console.log("  WHERE latitude IS NOT NULL");
      console.log("  LIMIT 10;");
    }

  } finally {
    console.log('\nReleasing client and closing pool…');
    client.release();
    await pool.end();
    console.log('Done.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
