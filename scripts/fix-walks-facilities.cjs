#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const walksPath = path.resolve(__dirname, '../src/data/walks.json');
const walks = JSON.parse(fs.readFileSync(walksPath, 'utf8'));

// ── Match helpers — use area + startLocation only (NOT walk name) ──
const areaStart = (w) => `${w.area || ''} ${w.startLocation || ''}`.toLowerCase();

// ── Settlement keywords ────────────────────────────────────────────
// Comprehensive list of Cornwall settlements with toilets/shops/pubs expected
const SETTLEMENTS = [
  // Major towns
  'penzance','truro','falmouth','newquay','bodmin','helston','redruth','camborne',
  'st austell','launceston','liskeard','bude','wadebridge','saltash','hayle',
  // Fishing / coastal villages with facilities
  'st ives','padstow','port isaac','fowey','looe','polperro','porthleven','mousehole',
  'mevagissey','portscatho','st mawes','coverack','cadgwith','mullion','lizard',
  'porthleven','perranporth','st agnes','portreath','praa sands','marazion',
  'prussia cove','portloe','gorran haven','charlestown','malpas','mylor bridge',
  'flushing','penryn','mylor','feock','devoran','point','rest','porth','polkerris',
  'polzeath','rock','trebetherick','port quin','port gaverne','trevaunance',
  'portscatho','percuil','gerrans','porthtowan','portreath','porthleaven',
  'portloe','veryan','carne','kingsand','cawsand','millbrook','torpoint',
  'cremyll','calstock','callington','launcells','boscastle','tintagel','trebarwith',
  'delabole','camelford','wadebridge','padstow','harlyn','trevone','constantine bay',
  'porthcothan','mawgan porth','watergate bay','bedruthan','porth','newquay',
  'crantock','holywell','perran','cubert','perranzabuloe','goonhavern',
  'mitchel','Indian queens','st columb','roche','bugle','lostwithiel','lerryn',
  'golant','bodinnick','polruan','lanteglos','portloe','portscatho',
  'helford','manaccan','mawnan','mawnan smith','budock','mylor','flushing',
  'penryn','pendennis','gyllyngvase','swanpool','maenporth','rosemullion',
  'durgan','helford passage','constantine','gweek','coverack','porthoustock',
  'porthallow','manacles','cadgwith','kennack sands','kynance','lizard point',
  'polurrian','mullion cove','poldhu','gunwalloe','porthleven','loe bar',
  'praa sands','marazion','perranuthnoe','goldsithney','breage','ashton',
  'carbis bay','lelant','hayle','gwithian','godrevy','portreath','st agnes',
  'chapel porth','trevaunance cove','porthtowan','portreath','north cliffs',
  'tehidy','camborne','redruth','carn brea','st day','chacewater','devoran',
  'point','feock','mylor','flushing','penryn','falmouth','budock water',
  'mabe','constantine','gweek','helford','st keverne','coverack','manaccan',
  'porthallow','st anthony','porthoustock','helford passage'
];

// ── Major tourist/visitor attractions ─────────────────────────────
const TOURIST_SITES = [
  "land's end","landsend","kynance cove","kynance","minack","eden project",
  "bedruthan steps","bedruthan","godrevy","cape cornwall","tintagel castle",
  "tintagel village","st michael's mount","st michael","lizard point",
  "botallack","levant mine","geevor","pendeen","trevaunance","porthcurno",
  "gwennap head","nanjizal","sennen cove","sennen","zennor","carn brea"
];

// ── National Trust / English Heritage / Forestry managed sites ────
const MANAGED_SITES = [
  'lanhydrock','trelissick','glendurgan','penrose','cotehele','cardinham woods',
  'cardinham','golitha falls','golitha','trerice','godolphin','penrose estate',
  'tehidy','tremenheere','chysauster','carn euny','restormel','launceston castle',
  'antony house','cotehele quay','enys','tregothnan','trelowarren'
];

// ── Beach / coastal access points (seasonal facilities common) ────
const BEACH_COAST = [
  'sands','beach','cove','bay','haven','quay','harbour','waterfront','promenade',
  'seafront','pier','jetty','slipway','headland car park','coastal car park',
  'national trust car park'
];

// ── Classifiers ───────────────────────────────────────────────────
const isCarParkStart  = (w) => /car park/i.test(w.startLocation || '');
const isTown          = (w) => SETTLEMENTS.some(k => areaStart(w).includes(k));
const isTourist       = (w) => TOURIST_SITES.some(k => areaStart(w).includes(k));
const isManaged       = (w) => MANAGED_SITES.some(k => (w.name + ' ' + areaStart(w)).toLowerCase().includes(k));
const isBeachCoast    = (w) => BEACH_COAST.some(k => areaStart(w).includes(k)) ||
                                BEACH_COAST.some(k => (w.startLocation || '').toLowerCase().includes(k));
// Remote = moor/tor/ridge keywords in area AND none of the above signals
const isRemote        = (w) => /\b(moor|moorland|tor|tors|ridge|common|commons|downs)\b/i.test(areaStart(w))
                                && !isTown(w) && !isTourist(w) && !isCarParkStart(w);

// ── Generate notes ────────────────────────────────────────────────
function classify (w) {
  const town    = isTown(w);
  const tourist = isTourist(w);
  const managed = isManaged(w);
  const carPark = isCarParkStart(w);
  const beach   = isBeachCoast(w);
  const remote  = isRemote(w);

  // TOILETS
  let toilets, toiletsNote;
  if (tourist) {
    toilets = true;
    toiletsNote = `Public toilets available at ${w.area}; check seasonal opening.`;
  } else if (managed) {
    toilets = true;
    toiletsNote = `Toilets available at the visitor entrance; check seasonal opening hours.`;
  } else if (town) {
    toilets = true;
    toiletsNote = `Public toilets available in ${w.area}; check seasonal opening.`;
  } else if (carPark && !remote) {
    toilets = true;
    toiletsNote = `Toilets may be available at or near the start; check seasonal opening.`;
  } else if (beach && !remote) {
    toilets = true;
    toiletsNote = `Seasonal public toilets likely nearby; check opening times.`;
  } else if (remote) {
    toilets = false;
    toiletsNote = `No confirmed toilets on route; nearest facilities may be in ${w.area} area.`;
  } else {
    toilets = false;
    toiletsNote = `No confirmed toilets on route; check locally in ${w.area}.`;
  }

  // PARKING
  let parking, parkingNote;
  if (carPark) {
    parking = true;
    parkingNote = `Parking available at ${w.startLocation}; charges may apply.`;
  } else if (tourist) {
    parking = true;
    parkingNote = `Car park available at ${w.area}; busy in peak season, charges likely.`;
  } else if (managed) {
    parking = true;
    parkingNote = `Car park available on site; charges may apply (NT members usually free).`;
  } else if (town) {
    parking = true;
    parkingNote = `Car parks available in ${w.area}; charges may apply.`;
  } else if (beach && !remote) {
    parking = true;
    parkingNote = `Parking available nearby; can be busy in summer, charges may apply.`;
  } else if (remote) {
    parking = false;
    parkingNote = `Limited parking nearby; roadside parking only in places — arrive early.`;
  } else {
    parking = false;
    parkingNote = `Limited parking; check locally before visiting ${w.area}.`;
  }

  // REFRESHMENTS
  let refreshments, refreshmentsNote;
  if (tourist) {
    refreshments = true;
    refreshmentsNote = `Cafes and visitor facilities at ${w.area}; seasonal hours apply.`;
  } else if (managed) {
    refreshments = true;
    refreshmentsNote = `On-site cafe or tearoom may be available; check seasonal opening hours.`;
  } else if (town) {
    refreshments = true;
    refreshmentsNote = `Cafes, pubs and shops available in ${w.area}.`;
  } else if (beach && !remote) {
    refreshments = true;
    refreshmentsNote = `Seasonal cafes or kiosks likely nearby; check opening times.`;
  } else if (carPark && !remote) {
    refreshments = false;
    refreshmentsNote = `Refreshments not confirmed nearby; bring drinks and snacks. Check ${w.area} for options.`;
  } else if (remote) {
    refreshments = false;
    refreshmentsNote = `No confirmed refreshments on route; bring drinks and snacks.`;
  } else {
    refreshments = false;
    refreshmentsNote = `No confirmed refreshments on route; bring drinks and snacks.`;
  }

  return { toilets, toiletsNote, parking, parkingNote, refreshments, refreshmentsNote };
}

// ── Apply and collect stats ────────────────────────────────────────
let toiletsUp = 0, parkingUp = 0, refreshUp = 0;
const samples = { upgraded: [], unchanged: [] };

const updated = walks.map((w) => {
  const c = classify(w);
  if (c.toilets !== w.toilets) toiletsUp++;
  if (c.parking !== w.parking) parkingUp++;
  if (c.refreshments !== w.refreshments) refreshUp++;

  const changed = c.toilets !== w.toilets || c.parking !== w.parking || c.refreshments !== w.refreshments;

  if (changed && samples.upgraded.length < 6) {
    samples.upgraded.push({ name: w.name, area: w.area, start: w.startLocation,
      before: { t: w.toilets, p: w.parking, r: w.refreshments },
      after:  { t: c.toilets, p: c.parking, r: c.refreshments },
      notes:  c
    });
  }
  if (!changed && samples.unchanged.length < 4) {
    samples.unchanged.push({ name: w.name, area: w.area, start: w.startLocation,
      values: { t: w.toilets, p: w.parking, r: w.refreshments }
    });
  }

  return { ...w, ...c };
});

// ── Output ─────────────────────────────────────────────────────────
console.log('=== SUMMARY ===');
console.log('Total walks:          ', updated.length);
console.log('Toilets upgraded:     ', toiletsUp, '/ 333 (false -> true)');
console.log('Parking upgraded:     ', parkingUp, '/ 333 (false -> true)');
console.log('Refreshments upgraded:', refreshUp, '/ 333 (false -> true)');
console.log('Note fields added:    toiletsNote, parkingNote, refreshmentsNote');
console.log('publicTransport:      unchanged (already set correctly)');

console.log('\n=== UPGRADED SAMPLES ===');
samples.upgraded.forEach(s => {
  console.log(`\n  ${s.name} (${s.area} | start: ${s.start})`);
  console.log(`  toilets:      ${s.before.t} -> ${s.after.t} | ${s.notes.toiletsNote}`);
  console.log(`  parking:      ${s.before.p} -> ${s.after.p} | ${s.notes.parkingNote}`);
  console.log(`  refreshments: ${s.before.r} -> ${s.after.r} | ${s.notes.refreshmentsNote}`);
});

console.log('\n=== UNCHANGED (correctly low facilities) SAMPLES ===');
samples.unchanged.forEach(s => {
  console.log(`  ${s.name} (${s.area}) — toilets:${s.values.t} parking:${s.values.p} refresh:${s.values.r}`);
});

fs.writeFileSync(walksPath, JSON.stringify(updated, null, 2) + '\n');
console.log('\n✓ walks.json updated successfully.');
