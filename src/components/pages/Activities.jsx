// Activities discovery hub — county-optional route (/activities and /{county}/activities).
// Map: real Cornwall walk pins (walks.json → postcodes.io geocoding) + ACTIVITY_SAMPLE_DATA
//      for all other categories. Find Help/resource data intentionally NOT imported here.
// Future: replace ACTIVITY_SAMPLE_DATA with Supabase activities table.

import React from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import walksData from '../../data/walks.json';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin } = Icons;

// Stable ref — must not recreate on render (useJsApiLoader warning)
const ACT_MAP_LIBS = [];

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTY_LABELS = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  dorset:    'Dorset',
  somerset:  'Somerset',
  bristol:   'Bristol',
  wiltshire: 'Wiltshire',
};

const COUNTY_OPTIONS = [
  { value: '',          label: 'All counties' },
  { value: 'cornwall',  label: 'Cornwall' },
  { value: 'devon',     label: 'Devon' },
  { value: 'somerset',  label: 'Somerset' },
  { value: 'bristol',   label: 'Bristol' },
  { value: 'dorset',    label: 'Dorset' },
  { value: 'wiltshire', label: 'Wiltshire' },
];

const ACTIVITY_TYPE_OPTIONS = [
  { value: '',            label: 'All activities' },
  { value: 'walks',       label: 'Walks' },
  { value: 'groups',      label: 'Groups' },
  { value: 'days-out',    label: 'Days Out' },
  { value: 'attractions', label: 'Attractions' },
  { value: 'wellbeing',   label: 'Wellbeing' },
  { value: 'discounts',   label: 'Carer Discounts' },
];

const ACCESSIBILITY_OPTIONS = [
  { value: '',             label: 'Any accessibility' },
  { value: 'wheelchair',   label: 'Wheelchair friendly' },
  { value: 'transport',    label: 'Public transport' },
  { value: 'low-mobility', label: 'Low mobility' },
  { value: 'dementia',     label: 'Dementia friendly' },
  { value: 'dogs',         label: 'Dog friendly' },
];

const COST_OPTIONS = [
  { value: '',           label: 'Any cost' },
  { value: 'free',       label: 'Free' },
  { value: 'discounted', label: 'Discounted' },
  { value: 'paid',       label: 'Paid' },
];

// Category config — accent colours + map marker labels
const CAT_CONFIG = {
  walks:       { accent: '#3DA832', label: 'W', bg: 'rgba(61,168,50,0.12)'  },
  groups:      { accent: '#2D9CDB', label: 'G', bg: 'rgba(45,156,219,0.12)' },
  'days-out':  { accent: '#F5A623', label: 'D', bg: 'rgba(245,166,35,0.12)' },
  attractions: { accent: '#7B5CF5', label: 'A', bg: 'rgba(123,92,245,0.12)' },
  wellbeing:   { accent: '#F4613A', label: 'H', bg: 'rgba(244,97,58,0.12)'  },
  discounts:   { accent: '#0D7A55', label: '£', bg: 'rgba(16,185,129,0.12)' },
};

const COUNTY_CENTERS = {
  '':        { lat: 51.00, lng: -3.50, zoom: 8 },
  cornwall:  { lat: 50.35, lng: -4.80, zoom: 9 },
  devon:     { lat: 50.72, lng: -3.80, zoom: 9 },
  somerset:  { lat: 51.10, lng: -2.95, zoom: 9 },
  bristol:   { lat: 51.45, lng: -2.60, zoom: 10 },
  dorset:    { lat: 50.75, lng: -2.35, zoom: 9 },
  wiltshire: { lat: 51.35, lng: -1.99, zoom: 9 },
};

// ── Activity sample data ───────────────────────────────────────────────────────
// Future: replace ACTIVITY_SAMPLE_DATA with Supabase activities table.
// Do NOT import or use Find Help / resources data here.
// Each entry: title, category, county, area, lat, lng, cost, tags[], description.

const ACTIVITY_SAMPLE_DATA = [
  // ── Cornwall · Groups ──
  { id: 'cg-01', category: 'groups', county: 'cornwall', area: 'St Austell',
    title: 'St Austell Carers Support Group', lat: 50.3395, lng: -4.7906,
    cost: 'free', tags: ['Weekly', 'Refreshments', 'All welcome'],
    description: 'Weekly meetup for carers to share experiences and find peer support.' },
  { id: 'cg-02', category: 'groups', county: 'cornwall', area: 'Truro',
    title: 'Truro Carers Connect', lat: 50.2632, lng: -5.0501,
    cost: 'free', tags: ['Fortnightly', 'Refreshments'],
    description: 'Fortnightly gathering for carers in and around Truro.' },
  { id: 'cg-03', category: 'groups', county: 'cornwall', area: 'Penzance',
    title: 'Penzance Carer Circle', lat: 50.1193, lng: -5.5347,
    cost: 'free', tags: ['Monthly', 'Wheelchair friendly'],
    description: 'Monthly carer circle supporting people across the far west.' },
  { id: 'cg-04', category: 'groups', county: 'cornwall', area: 'Newquay',
    title: 'Newquay Peer Support Group', lat: 50.4159, lng: -5.0795,
    cost: 'free', tags: ['Weekly', 'Dog friendly'],
    description: 'Open peer support for carers in the Newquay area.' },
  { id: 'cg-05', category: 'groups', county: 'cornwall', area: 'Falmouth',
    title: 'Falmouth Carers Network', lat: 50.1553, lng: -5.0655,
    cost: 'free', tags: ['Fortnightly', 'Public transport nearby'],
    description: 'Community network for carers in Falmouth and the Fal estuary area.' },

  // ── Cornwall · Days Out ──
  { id: 'cd-01', category: 'days-out', county: 'cornwall', area: 'St Austell',
    title: 'Eden Project', lat: 50.3601, lng: -4.7446,
    cost: 'discounted', tags: ['Carer discount', 'Family', 'Wheelchair friendly'],
    description: 'World-famous biomes and gardens — discounted entry for registered carers.' },
  { id: 'cd-02', category: 'days-out', county: 'cornwall', area: 'St Ives',
    title: 'Tate St Ives', lat: 50.2125, lng: -5.4813,
    cost: 'discounted', tags: ['Free for carers', 'Accessible', 'Public transport nearby'],
    description: 'Gallery of modern and contemporary art with stunning coastal views.' },
  { id: 'cd-03', category: 'days-out', county: 'cornwall', area: 'Mawnan Smith',
    title: 'Trebah Garden', lat: 50.0988, lng: -5.1269,
    cost: 'discounted', tags: ['Wheelchair friendly', 'Dog friendly', 'Carer discount'],
    description: 'Subtropical jungle garden with beach access — discounted for carers.' },
  { id: 'cd-04', category: 'days-out', county: 'cornwall', area: 'Falmouth',
    title: 'National Maritime Museum Falmouth', lat: 50.1511, lng: -5.0638,
    cost: 'discounted', tags: ['Accessible', 'Family', 'Free carer entry'],
    description: 'National Maritime Museum with harbour views — free entry for caring companions.' },

  // ── Cornwall · Attractions ──
  { id: 'ca-01', category: 'attractions', county: 'cornwall', area: 'Porthcurno',
    title: 'Minack Theatre', lat: 50.0625, lng: -5.5793,
    cost: 'paid', tags: ['Scenic', 'Accessible seating available'],
    description: 'Clifftop open-air theatre — one of Cornwall\'s most iconic venues.' },
  { id: 'ca-02', category: 'attractions', county: 'cornwall', area: 'Tintagel',
    title: 'Tintagel Castle', lat: 50.6686, lng: -4.7580,
    cost: 'discounted', tags: ['Historic', 'Free for carers', 'Coastal views'],
    description: 'Legendary Arthurian castle with dramatic Atlantic coastline.' },
  { id: 'ca-03', category: 'attractions', county: 'cornwall', area: 'Mevagissey',
    title: 'Lost Gardens of Heligan', lat: 50.2779, lng: -4.7858,
    cost: 'discounted', tags: ['Wheelchair paths', 'Dog friendly', 'Carer discount'],
    description: 'Award-winning heritage gardens with restored Victorian productive gardens.' },
  { id: 'ca-04', category: 'attractions', county: 'cornwall', area: 'St Just',
    title: 'Geevor Tin Mine', lat: 50.1412, lng: -5.6843,
    cost: 'discounted', tags: ['Heritage', 'Accessible areas', 'Family'],
    description: 'Underground tin mine experience — a window into Cornwall\'s industrial heritage.' },

  // ── Cornwall · Wellbeing ──
  { id: 'cw-01', category: 'wellbeing', county: 'cornwall', area: 'Falmouth',
    title: 'Falmouth Leisure Centre', lat: 50.1527, lng: -5.0635,
    cost: 'free', tags: ['Swimming', 'Low mobility', 'Accessible'],
    description: 'Community leisure centre with discounted carer swim sessions.' },
  { id: 'cw-02', category: 'wellbeing', county: 'cornwall', area: 'Truro',
    title: 'Truro Wellness Hub', lat: 50.2632, lng: -5.0501,
    cost: 'free', tags: ['Yoga', 'Mindfulness', 'All welcome'],
    description: 'Wellbeing sessions specifically designed for carers — mind and body.' },
  { id: 'cw-03', category: 'wellbeing', county: 'cornwall', area: 'St Ives',
    title: 'St Ives Beach Yoga', lat: 50.2121, lng: -5.4808,
    cost: 'discounted', tags: ['Yoga', 'Outdoor', 'Dog friendly'],
    description: 'Morning yoga sessions on Porthmeor beach — all abilities welcome.' },
  { id: 'cw-04', category: 'wellbeing', county: 'cornwall', area: 'Penzance',
    title: 'Penzance Hydrotherapy Pool', lat: 50.1193, lng: -5.5347,
    cost: 'discounted', tags: ['Hydrotherapy', 'Low mobility', 'Wheelchair friendly'],
    description: 'Warm water hydrotherapy — ideal for low-mobility carers and those they support.' },

  // ── Cornwall · Discounts ──
  { id: 'c$-01', category: 'discounts', county: 'cornwall', area: 'St Austell',
    title: 'The Cornish Bakery — St Austell', lat: 50.3395, lng: -4.7906,
    cost: 'discounted', tags: ['Food & drink', '20% off', 'Show card'],
    description: '20% off for Inspiring Carers card holders. Show your staff benefits card.' },
  { id: 'c$-02', category: 'discounts', county: 'cornwall', area: 'St Ives',
    title: 'St Austell Leisure — St Ives', lat: 50.2121, lng: -5.4808,
    cost: 'discounted', tags: ['Gym', 'Pool', 'Free guest pass'],
    description: 'Free guest pass for registered carers. Gym, pool and fitness classes.' },
  { id: 'c$-03', category: 'discounts', county: 'cornwall', area: 'Newquay',
    title: 'Newquay Surf Experience', lat: 50.4159, lng: -5.0795,
    cost: 'discounted', tags: ['Activities', 'Family', '1-for-1'],
    description: '1-for-1 beginner surf lessons for carers and the person they support.' },
  { id: 'c$-04', category: 'discounts', county: 'cornwall', area: 'Falmouth',
    title: 'Falmouth Boat Trips', lat: 50.1553, lng: -5.0655,
    cost: 'discounted', tags: ['Days out', 'Accessible vessel', 'Carer goes free'],
    description: 'Scenic harbour and estuary trips — caring companion travels free.' },

  // ── Devon ──
  { id: 'dg-01', category: 'groups', county: 'devon', area: 'Exeter',
    title: 'Exeter Carers Support Group', lat: 50.7236, lng: -3.5275,
    cost: 'free', tags: ['Weekly', 'All welcome'], description: 'Weekly carer support group in central Exeter.' },
  { id: 'dd-01', category: 'days-out', county: 'devon', area: 'Dartmoor',
    title: 'Dartmoor National Park', lat: 50.5793, lng: -3.9024,
    cost: 'free', tags: ['Outdoor', 'Dog friendly', 'Accessible trails'], description: 'Open moorland with accessible trails and guided carer walks.' },
  { id: 'da-01', category: 'attractions', county: 'devon', area: 'Plymouth',
    title: 'Plymouth City Museum', lat: 50.3754, lng: -4.1427,
    cost: 'free', tags: ['Free entry', 'Accessible', 'Family'], description: 'Free admission museum covering Plymouth\'s maritime history.' },
  { id: 'dw-01', category: 'wellbeing', county: 'devon', area: 'Torquay',
    title: 'Torquay Carer Yoga', lat: 50.4612, lng: -3.5247,
    cost: 'free', tags: ['Yoga', 'Low mobility'], description: 'Chair yoga and wellbeing sessions for carers.' },

  // ── Somerset ──
  { id: 'sg-01', category: 'groups', county: 'somerset', area: 'Taunton',
    title: 'Taunton Carers Hub', lat: 51.0153, lng: -3.1064,
    cost: 'free', tags: ['Weekly', 'Refreshments'], description: 'Friendly weekly hub for carers across the Taunton area.' },
  { id: 'sw-01', category: 'wellbeing', county: 'somerset', area: 'Wells',
    title: 'Wells Wellness Studio', lat: 51.2095, lng: -2.6446,
    cost: 'discounted', tags: ['Yoga', 'Mindfulness', 'Dog friendly'], description: 'Wellness studio offering discounted sessions for carers.' },
  { id: 'sd-01', category: 'days-out', county: 'somerset', area: 'Bath',
    title: 'Roman Baths, Bath', lat: 51.3812, lng: -2.3590,
    cost: 'discounted', tags: ['Heritage', 'Accessible', 'Carer discount'], description: 'World Heritage Site — discounted entry for carers.' },

  // ── Bristol ──
  { id: 'bg-01', category: 'groups', county: 'bristol', area: 'Bristol',
    title: 'Bristol Carers Connect', lat: 51.4545, lng: -2.5879,
    cost: 'free', tags: ['Weekly', 'Wheelchair friendly'], description: 'Accessible weekly group for carers across Bristol.' },
  { id: 'bd-01', category: 'days-out', county: 'bristol', area: 'Bristol',
    title: 'SS Great Britain', lat: 51.4488, lng: -2.6271,
    cost: 'discounted', tags: ['Heritage', 'Accessible', 'Carer discount'], description: 'Brunel\'s famous steamship museum — discounted for registered carers.' },

  // ── Dorset ──
  { id: 'org-01', category: 'groups', county: 'dorset', area: 'Bournemouth',
    title: 'Bournemouth Carers Group', lat: 50.7192, lng: -1.8808,
    cost: 'free', tags: ['Fortnightly', 'Refreshments'], description: 'Fortnightly support group for carers in the Bournemouth area.' },
  { id: 'ord-01', category: 'days-out', county: 'dorset', area: 'Wareham',
    title: 'Durdle Door', lat: 50.6205, lng: -2.2739,
    cost: 'free', tags: ['Coastal', 'Dog friendly', 'Scenic walk'], description: 'Iconic Jurassic Coast landmark — accessible from nearby car park.' },

  // ── Wiltshire ──
  { id: 'wg-01', category: 'groups', county: 'wiltshire', area: 'Salisbury',
    title: 'Salisbury Carers Network', lat: 51.0693, lng: -1.7944,
    cost: 'free', tags: ['Monthly', 'All welcome'], description: 'Monthly gathering for carers in the Salisbury area.' },
  { id: 'wa-01', category: 'attractions', county: 'wiltshire', area: 'Avebury',
    title: 'Avebury Stone Circle', lat: 51.4288, lng: -1.8542,
    cost: 'free', tags: ['Free entry', 'Outdoor', 'Dog friendly'], description: 'Neolithic stone circle — free access, wide paths suitable for all mobilities.' },
];

// Activity categories shown in UI (featured section)
const ACTIVITY_CATEGORIES = [
  { key: 'walks',       label: 'Walks',       status: 'live', cta: 'Explore walks',
    desc: 'Trails, coastal paths and nature routes rated by difficulty and accessibility.',
    accent: '#5BC94A', bg: 'rgba(91,201,74,0.08)', border: 'rgba(91,201,74,0.18)', Icon: IWalks },
  { key: 'groups',      label: 'Groups',      status: 'soon',
    desc: 'Social groups, carer circles and peer support activities near you.',
    accent: '#2D9CDB', bg: 'rgba(45,156,219,0.08)', border: 'rgba(45,156,219,0.16)', Icon: IGroups },
  { key: 'days-out',    label: 'Days Out',    status: 'soon',
    desc: 'Gardens, beaches, attractions and family-friendly destinations.',
    accent: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.16)', Icon: ISparkle },
  { key: 'attractions', label: 'Attractions', status: 'soon',
    desc: 'Discounted and carer-friendly venues, museums and cultural experiences.',
    accent: '#7B5CF5', bg: 'rgba(123,92,245,0.08)', border: 'rgba(123,92,245,0.14)', Icon: ISparkle },
  { key: 'wellbeing',   label: 'Wellbeing',   status: 'soon',
    desc: 'Yoga, swimming, sport and wellbeing sessions supporting carer health.',
    accent: '#F4613A', bg: 'rgba(244,97,58,0.08)', border: 'rgba(244,97,58,0.14)', Icon: IWellbeing },
];

// Module-level geocode cache — persists across component re-mounts
const _geoCache = {};
const _geoCacheAttempted = new Set(); // tracks attempted postcodes, avoids re-fetch on failed lookups

// Deduplicated walk postcodes, capped at 80 to avoid map clutter
const WALK_POSTCODES = (() => {
  const seen = new Set();
  const result = [];
  for (const w of walksData) {
    if (w.postcode && !seen.has(w.postcode)) {
      seen.add(w.postcode);
      result.push(w.postcode);
      if (result.length >= 80) break;
    }
  }
  return result;
})();

// Walk data indexed by postcode for O(1) pin assembly
const WALK_BY_POSTCODE = walksData.reduce((acc, w) => {
  if (w.postcode && !acc[w.postcode]) acc[w.postcode] = w;
  return acc;
}, {});

const POPULAR_CHIPS = [
  { label: 'Free activities',    sub: 'No cost',       icon: '🆓', type: '',           cost: 'free',       access: '' },
  { label: 'Accessible places',  sub: 'Easy access',   icon: '♿', type: '',           cost: '',           access: 'low-mobility' },
  { label: 'Coastal walks',      sub: 'Scenic routes', icon: '🌊', type: 'walks',      cost: '',           access: '' },
  { label: 'Family days out',    sub: 'All ages',      icon: '👨‍👩‍👧', type: 'days-out',   cost: '',           access: '' },
  { label: 'Wellbeing sessions', sub: 'Mind & body',   icon: '🧘', type: 'wellbeing',  cost: '',           access: '' },
  { label: 'Carer discounts',    sub: 'Save money',    icon: '🏷️', type: 'discounts',  cost: 'discounted', access: '' },
];

// Hero featured preview cards — walk routes to walks, others are info-only (no navigation)
const HERO_FEATURED = [
  { title: 'Porthcurno coastal walk', type: 'Walk',    tag: 'Free · 3.2 miles',    grad: 'linear-gradient(135deg, #D4F0C8 0%, #B8E4A4 100%)', accent: '#3DA832', dest: 'walks' },
  { title: 'Carer coffee morning',    type: 'Group',   tag: 'Free · Weekly',        grad: 'linear-gradient(135deg, #C8E4F8 0%, #A8D4F0 100%)', accent: '#1c78b5', dest: null    },
  { title: 'Accessible day out',      type: 'Day Out', tag: 'Discounted · Booking', grad: 'linear-gradient(135deg, #FDE8C4 0%, #F8D4A0 100%)', accent: '#B45309', dest: 'places-to-visit' },
];

// ── Shared style ──────────────────────────────────────────────────────────────

const iStyle = {
  padding: '10px 14px', borderRadius: 12, border: '1px solid #E9EEF5',
  background: '#FAFBFF', fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', flex: '1 1 140px', minWidth: 0,
  cursor: 'pointer', appearance: 'auto',
};

// Inputs inside the dark hero panel
const heroInputStyle = {
  padding: '10px 14px', borderRadius: 12,
  border: '1px solid rgba(26,39,68,0.12)',
  background: 'rgba(255,255,255,0.95)',
  fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif',
  width: '100%', cursor: 'pointer', appearance: 'auto',
  boxSizing: 'border-box',
};

// ── Activities map ────────────────────────────────────────────────────────────
// Combines geocoded walk pins (walks.json → postcodes.io) with ACTIVITY_SAMPLE_DATA.
// Find Help / resource data is NOT used here.
// Walk markers → navigate to walks page. Non-walk markers → info card only (no navigation CTA).

const ActivitiesMap = ({ localCounty, activityType, cost, accessibility, onNavigate }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'ic-activity-map',
    googleMapsApiKey: apiKey || '',
    libraries: ACT_MAP_LIBS,
  });

  const [walkCoords,  setWalkCoords]  = React.useState({});
  const [geoLoading,  setGeoLoading]  = React.useState(false);
  const [activePin,   setActivePin]   = React.useState(null);

  // Geocode up to 150 unique walk postcodes — batched, non-blocking, module-level cached
  React.useEffect(() => {
    const uncached = WALK_POSTCODES.filter((pc) => !_geoCacheAttempted.has(pc));
    if (!uncached.length) {
      setWalkCoords({ ..._geoCache });
      return;
    }
    let cancelled = false;
    setGeoLoading(true);
    (async () => {
      try {
        const BATCH = 100; // postcodes.io bulk limit
        for (let i = 0; i < uncached.length && !cancelled; i += BATCH) {
          const chunk = uncached.slice(i, i + BATCH);
          chunk.forEach((pc) => _geoCacheAttempted.add(pc));
          const resp = await fetch('https://api.postcodes.io/postcodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postcodes: chunk }),
          });
          const data = await resp.json();
          (data.result || []).forEach(({ query, result }) => {
            if (result?.latitude && result?.longitude) {
              _geoCache[query] = { lat: result.latitude, lng: result.longitude };
            }
          });
        }
        if (!cancelled) setWalkCoords({ ..._geoCache });
      } catch {
        if (!cancelled) setWalkCoords({ ..._geoCache });
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { lat, lng, zoom } = COUNTY_CENTERS[localCounty] || COUNTY_CENTERS[''];

  // Walk pins — geocoded from walks.json (Cornwall data); shown for Cornwall or all-counties view
  const showWalks = !activityType || activityType === 'walks';
  const showWalksForCounty = showWalks && (!localCounty || localCounty === 'cornwall');
  const walkPins = showWalksForCounty
    ? WALK_POSTCODES
        .filter((pc) => walkCoords[pc])
        .filter(() => !cost || cost === 'free')
        .map((pc) => {
          const w = WALK_BY_POSTCODE[pc];
          return {
            id: `walk-${pc}`,
            lat: walkCoords[pc].lat,
            lng: walkCoords[pc].lng,
            title: w.name,
            category: 'walks',
            area: w.area,
            cost: 'free',
            description: `${w.distanceMiles} miles · ${w.difficulty} · ${w.area}`,
            action: () => onNavigate('walks', localCounty || null),
          };
        })
    : [];

  // Sample activity pins — filtered by county, category, cost, accessibility
  const samplePins = ACTIVITY_SAMPLE_DATA.filter((item) => {
    if (item.category === 'walks') return false; // walks come from geocoded data
    if (localCounty && item.county !== localCounty) return false;
    if (activityType && item.category !== activityType) return false;
    if (cost && item.cost !== cost) return false;
    if (accessibility) {
      const tagStr = item.tags.join(' ').toLowerCase();
      const accessMap = {
        wheelchair: 'wheelchair',
        'low-mobility': 'low mobility',
        transport: 'public transport',
        dogs: 'dog',
        dementia: 'dementia',
      };
      const keyword = accessMap[accessibility];
      if (keyword && !tagStr.includes(keyword)) return false;
    }
    return true;
  }).map((item) => ({
    ...item,
    action: null, // non-walk activity pins: info card only, no navigation CTA
  }));

  const allPins = [...walkPins, ...samplePins];

  const Fallback = () => (
    <div style={{ height: 'clamp(300px, calc(20vw + 225px), 460px)', borderRadius: 20, background: 'linear-gradient(160deg, #E8F5E4 0%, #EEF7FF 100%)', border: '1px solid #DEE8F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 32, marginBottom: 4 }}>📍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>Activity map loading</div>
      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', maxWidth: 280, lineHeight: 1.6 }}>Explore walks, groups, days out, attractions and wellbeing activities by location.</div>
      <button className="btn btn-gold btn-sm" onClick={() => onNavigate('walks', localCounty || null)} style={{ marginTop: 4 }}>
        Explore walks map <IArrow s={12} />
      </button>
    </div>
  );

  if (loadError) return <Fallback />;
  if (!isLoaded || geoLoading) return (
    <div style={{ height: 'clamp(300px, calc(20vw + 225px), 460px)', borderRadius: 20, background: '#F0F5FB', border: '1px solid #DEE8F4', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', color: 'rgba(26,39,68,0.5)', fontSize: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
        {geoLoading ? 'Locating activities…' : 'Loading map…'}
      </div>
    </div>
  );

  // Categories with no pins for "more being added" note
  const visibleCats = activityType ? [activityType] : ['walks', 'groups', 'days-out', 'attractions', 'wellbeing', 'discounts'];
  const emptyCats = visibleCats.filter((cat) => !allPins.some((p) => p.category === cat));

  return (
    <div>
      <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,39,68,0.10)', border: '1px solid #EEF1F7' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: 'clamp(300px, calc(20vw + 225px), 460px)' }}
          center={{ lat, lng }}
          zoom={zoom}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: true, gestureHandling: 'cooperative' }}
          onClick={() => setActivePin(null)}
        >
          {allPins.map((pin) => {
            const cfg = CAT_CONFIG[pin.category] || CAT_CONFIG.walks;
            return (
              <MarkerF
                key={pin.id}
                position={{ lat: pin.lat, lng: pin.lng }}
                title={pin.title}
                icon={{
                  path: 0, // google.maps.SymbolPath.CIRCLE
                  fillColor: cfg.accent,
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2.5,
                  scale: 12,
                }}
                label={{ text: cfg.label, color: 'white', fontWeight: '900', fontSize: '11px' }}
                onClick={() => setActivePin(activePin?.id === pin.id ? null : pin)}
              />
            );
          })}

          {activePin && (
            <InfoWindowF
              position={{ lat: activePin.lat, lng: activePin.lng }}
              onCloseClick={() => setActivePin(null)}
            >
              <div style={{ maxWidth: 220, fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CAT_CONFIG[activePin.category]?.accent || '#1A2744', marginBottom: 4 }}>
                  {ACTIVITY_TYPE_OPTIONS.find((o) => o.value === activePin.category)?.label || activePin.category}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>{activePin.title}</div>
                {activePin.area && <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)', marginBottom: 4 }}>{activePin.area}</div>}
                {activePin.description && <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.72)', lineHeight: 1.5, marginBottom: activePin.category === 'walks' ? 8 : 0 }}>{activePin.description}</div>}
                {activePin.category === 'walks' && (
                  <button
                    onClick={activePin.action}
                    style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: CAT_CONFIG.walks.bg, color: CAT_CONFIG.walks.accent, border: 'none', cursor: 'pointer' }}
                  >
                    View walks →
                  </button>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Map legend + note */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(CAT_CONFIG).map(([cat, cfg]) => (
              <span key={cat} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px 3px 6px', borderRadius: 999, background: `${cfg.accent}18`, color: cfg.accent, border: `1px solid ${cfg.accent}33`, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.accent, flexShrink: 0 }} />
                {ACTIVITY_TYPE_OPTIONS.find((o) => o.value === cat)?.label || cat}
              </span>
            ))}
          </div>
          <button onClick={() => onNavigate('walks', localCounty || null)} style={{ fontSize: 11.5, fontWeight: 700, color: '#5BC94A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>
            Full walks map →
          </button>
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.40)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontStyle: 'italic' }}>Showing selected mapped activity points. Open the full walks map for all 333 routes.</span>
          <span>Ctrl + scroll to zoom map</span>
        </div>
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const ActivitiesPage = ({ onNavigate, session, county }) => {
  const [localCounty,   setLocalCounty]   = React.useState(county || '');
  const [areaSearch,    setAreaSearch]    = React.useState('');
  const [activityType,  setActivityType]  = React.useState('');
  const [accessibility, setAccessibility] = React.useState('');
  const [cost,          setCost]          = React.useState('');
  const [chipHov,       setChipHov]       = React.useState(null);
  const [catHov,        setCatHov]        = React.useState(null);

  React.useEffect(() => { setLocalCounty(county || ''); }, [county]);

  const countyLabel = localCounty ? (COUNTY_LABELS[localCounty] || localCounty) : null;
  const isHubView   = !localCounty;

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  const handleCountyChange = (e) => setLocalCounty(e.target.value);

  const handleChip = (chip) => {
    setActivityType(chip.type);
    setCost(chip.cost);
    setAccessibility(chip.access);
  };

  const chipIsActive = (chip) =>
    activityType === chip.type && cost === chip.cost && accessibility === chip.access;

  const goToWalks = (c) => onNavigate('walks', c || null);

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Hero — premium dark navy search hub ─────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 50%, #1A3460 100%)', paddingTop: 36, paddingBottom: 36 }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'start' }}>

            {/* Left — headline + search panel */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(91,201,74,0.15)', border: '1px solid rgba(91,201,74,0.28)', fontSize: 11, fontWeight: 800, color: '#78E060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Activities · UK Discovery Hub
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 10px', textWrap: 'balance' }}>
                Explore activities, walks and days out
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: '0 0 12px', maxWidth: 460 }}>
                Find carer-friendly walks, groups, wellbeing sessions, attractions, days out and local offers across the UK. Choose a county to start exploring.
              </p>

              {/* Selected county status pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: localCounty ? '#5BC94A' : 'rgba(255,255,255,0.30)', display: 'inline-block', flexShrink: 0 }} />
                {localCounty ? `Selected county: ${countyLabel}` : 'Select a county to explore'}
                {localCounty && <button onClick={() => setLocalCounty('')} style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}>✕</button>}
              </div>

              {/* Inline search + filter card */}
              <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 16 }}>
                <div style={{ display: 'grid', gap: 9 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                    <select value={localCounty} onChange={handleCountyChange} style={{ ...heroInputStyle, fontWeight: 700 }} aria-label="Select county">
                      {COUNTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={heroInputStyle} aria-label="Activity type">
                      {ACTIVITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} placeholder="Search by town, activity or place…" style={{ ...heroInputStyle, paddingLeft: 34 }} />
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}><ISearch s={14} /></span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-gold" onClick={() => document.getElementById('act-map')?.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
                      <IPin s={13} /> Explore map
                    </button>
                    <button onClick={() => onNavigate('find-help')} style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <ISparkle s={13} /> Suggest an activity
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                {[{ n: '333+', l: 'Walks' }, { n: '6', l: 'Counties' }, { n: '100+', l: 'Places' }, { n: 'Free', l: 'To browse' }].map(({ n, l }, i) => (
                  <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — activity discovery panel */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: 22, padding: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.90)' }}>Activity discovery map</div>
                <button onClick={() => document.getElementById('act-map')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: 11.5, fontWeight: 700, color: '#5BC94A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  View map →
                </button>
              </div>

              {/* Category chips */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'Walks',       color: '#5BC94A', bg: 'rgba(91,201,74,0.18)'   },
                  { label: 'Groups',      color: '#2D9CDB', bg: 'rgba(45,156,219,0.18)'  },
                  { label: 'Days Out',    color: '#F5A623', bg: 'rgba(245,166,35,0.18)'  },
                  { label: 'Attractions', color: '#7B5CF5', bg: 'rgba(123,92,245,0.18)'  },
                  { label: 'Wellbeing',   color: '#F4613A', bg: 'rgba(244,97,58,0.18)'   },
                  { label: 'Discounts',   color: '#10B981', bg: 'rgba(16,185,129,0.18)'  },
                ].map((chip) => (
                  <span key={chip.label} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: chip.bg, color: chip.color, border: `1px solid ${chip.color}44` }}>
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Featured preview cards — richer mini cards */}
              <div style={{ display: 'grid', gap: 8 }}>
                {HERO_FEATURED.map((item) => {
                  const itemClick = item.dest === 'walks'
                    ? () => goToWalks(localCounty)
                    : item.dest ? () => onNavigate(item.dest) : undefined;
                  return (
                    <div key={item.title}
                      onClick={itemClick}
                      style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', cursor: item.dest ? 'pointer' : 'default', transition: 'box-shadow .15s, transform .15s' }}
                      onMouseEnter={item.dest ? (e) => { e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
                      onMouseLeave={item.dest ? (e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; } : undefined}
                    >
                      {/* Gradient strip with category badge */}
                      <div style={{ height: 36, background: item.grad, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 7 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', color: item.accent }}>
                          {item.type}
                        </span>
                        {item.dest && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto' }}>Live now</span>
                        )}
                      </div>
                      <div style={{ padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.90)', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.48)' }}>{item.tag}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.dest ? item.accent : 'rgba(255,255,255,0.26)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {item.dest ? 'Explore →' : 'Details coming soon'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)', fontSize: 12, color: 'rgba(255,255,255,0.40)', textAlign: 'center' }}>
                More activities being added weekly
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <section id="act-filters" style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 14, paddingBottom: 14, position: 'sticky', top: 72, zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            <select value={localCounty} onChange={handleCountyChange} style={{ ...iStyle, fontWeight: 700, flex: '1 1 130px' }}>
              {COUNTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div style={{ position: 'relative', flex: '1 1 170px', minWidth: 0 }}>
              <input type="text" value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} placeholder="Town or area…" style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 32, flex: 'none' }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}><ISearch s={13} /></span>
            </div>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={iStyle}>
              {ACTIVITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={accessibility} onChange={(e) => setAccessibility(e.target.value)} style={iStyle}>
              {ACCESSIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={cost} onChange={(e) => setCost(e.target.value)} style={iStyle}>
              {COST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Discovery map — full width ───────────────────────────── */}
      <section id="act-map" style={{ paddingTop: 36, paddingBottom: 32, background: '#FFFFFF' }}>
        <div className="container">

          {/* Compact map header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Explore nearby</div>
              <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 800, color: '#1A2744', margin: '0 0 3px' }}>
                Explore the activity map
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', margin: 0 }}>
                Showing activities for: <strong style={{ color: '#1A2744', fontWeight: 700 }}>{localCounty ? countyLabel : 'All counties'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('act-filters')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 10, background: '#F0F5FB', border: '1px solid #DEE8F4', color: '#1A2744', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <ISearch s={12} /> Search this area
              </button>
              <button onClick={() => goToWalks(localCounty)} className="btn btn-gold btn-sm">
                Full walks map <IArrow s={11} />
              </button>
            </div>
          </div>

          {/* Full-width map */}
          <ActivitiesMap
            localCounty={localCounty}
            activityType={activityType}
            cost={cost}
            accessibility={accessibility}
            onNavigate={onNavigate}
          />

        </div>
      </section>

      {/* ── Featured activities below map ────────────────────────── */}
      <section style={{ paddingTop: 28, paddingBottom: 36, background: '#FFFFFF', borderTop: '1px solid #F0F4FA' }}>
        <div className="container">
          <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.40)', marginBottom: 14 }}>
            {countyLabel ? `Featured in ${countyLabel}` : 'Featured activities'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { title: 'Accessible coastal walk', type: 'walks',    location: 'St Ives',  tags: ['Wheelchair', 'Free'],   accent: '#5BC94A', grad: 'linear-gradient(135deg, #D8F0CC, #C4E8B4)', dest: () => goToWalks(localCounty) },
              { title: 'Carer coffee morning',    type: 'groups',   location: 'Truro',    tags: ['All welcome', 'Free'],  accent: '#2D9CDB', grad: 'linear-gradient(135deg, #C8E4F8, #B4D8F4)', dest: null },
              { title: 'Family-friendly day out', type: 'days-out', location: 'Falmouth', tags: ['Family', 'Free entry'], accent: '#F5A623', grad: 'linear-gradient(135deg, #FDE8C4, #FDDCA8)', dest: null },
              { title: 'Wellbeing swim session',  type: 'wellbeing',location: 'Penzance', tags: ['Low mobility', 'Free'], accent: '#F4613A', grad: 'linear-gradient(135deg, #FADCD4, #F8C8BC)', dest: null },
            ].filter((c) => !activityType || c.type === activityType).map((card) => (
              <div key={card.title} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, borderLeft: `3px solid ${card.accent}` }}>
                <div style={{ height: 24, background: card.grad }} />
                <div style={{ padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: card.accent }}>{ACTIVITY_TYPE_OPTIONS.find((o) => o.value === card.type)?.label || card.type}</span>
                      <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.40)' }}>· {card.location}</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744', marginBottom: 5 }}>{card.title}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {card.tags.map((t) => <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: `${card.accent}18`, color: card.accent }}>{t}</span>)}
                    </div>
                  </div>
                  {card.dest
                    ? <button onClick={card.dest} style={{ fontSize: 11.5, fontWeight: 700, color: card.accent, background: `${card.accent}14`, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>View →</button>
                    : <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,39,68,0.35)', flexShrink: 0, whiteSpace: 'nowrap' }}>Details coming soon</span>
                  }
                </div>
              </div>
            ))}
            {/* Native sponsor slot */}
            <div className="card" style={{ padding: '13px 16px', borderRadius: 14, border: '1px dashed rgba(245,166,35,0.35)', background: 'rgba(245,166,35,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,39,68,0.36)', marginBottom: 2 }}>Featured partner slot</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(26,39,68,0.55)' }}>Your venue or activity here.</div>
              </div>
              <button onClick={() => onNavigate('login')} style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Promote →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular ways to explore ───────────────────────────────── */}
      <section style={{ paddingTop: 44, paddingBottom: 44, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Quick filters</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Popular ways to explore</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 9 }}>
            {POPULAR_CHIPS.map((chip) => {
              const active = chipIsActive(chip);
              const hov    = chipHov === chip.label;
              return (
                <button key={chip.label} onClick={() => handleChip(chip)} onMouseEnter={() => setChipHov(chip.label)} onMouseLeave={() => setChipHov(null)}
                  style={{ padding: '13px 13px 11px', borderRadius: 14, border: active ? '1.5px solid #F5A623' : `1px solid ${hov ? '#D8E4F0' : '#E9EEF5'}`, background: active ? 'rgba(245,166,35,0.07)' : hov ? 'rgba(26,39,68,0.02)' : '#FAFBFF', cursor: 'pointer', textAlign: 'left', transition: 'all .14s', boxShadow: active ? '0 3px 12px rgba(245,166,35,0.12)' : '0 1px 4px rgba(26,39,68,0.03)' }}>
                  <div style={{ fontSize: 20, marginBottom: 5, lineHeight: 1 }}>{chip.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#B45309' : '#1A2744', marginBottom: 2 }}>{chip.label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.46)', fontWeight: 500 }}>{chip.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured categories ──────────────────────────────────── */}
      <section style={{ paddingTop: 52, paddingBottom: 20, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Activity categories</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Featured activity categories</h2>
          </div>
          {liveCategories.map((cat) => {
            const hov = catHov === cat.key;
            return (
              <div key={cat.key} className="card" onClick={() => goToWalks(localCounty)} onMouseEnter={() => setCatHov(cat.key)} onMouseLeave={() => setCatHov(null)}
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 14, border: `1px solid ${hov ? cat.accent : cat.border}`, boxShadow: hov ? '0 16px 40px rgba(26,39,68,0.09)' : '0 3px 10px rgba(26,39,68,0.04)', transition: 'border-color .16s, box-shadow .16s' }}>
                {/* Rich header strip */}
                <div style={{ height: 66, background: `linear-gradient(135deg, ${cat.bg.replace('0.08', '0.28')} 0%, ${cat.bg.replace('0.08', '0.10')} 100%)`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.accent + '22', border: `1.5px solid ${cat.accent}44`, display: 'grid', placeItems: 'center', color: cat.accent, flexShrink: 0 }}>
                    <cat.Icon s={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: cat.accent, marginBottom: 3 }}>
                      Live now{countyLabel ? ` — ${countyLabel}` : ' — All counties'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2744' }}>{cat.label}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: cat.accent + '18', color: cat.accent }}>333+ routes</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(26,39,68,0.06)', color: 'rgba(26,39,68,0.50)' }}>Free</span>
                  </div>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6, margin: '0 0 10px', maxWidth: 460 }}>{cat.desc}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['Coastal paths', 'Accessible routes', 'Rated trails', 'Dog friendly'].map((t) => (
                        <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: cat.bg, color: cat.accent }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-gold" onClick={(e) => { e.stopPropagation(); goToWalks(localCounty); }} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {cat.cta} <IArrow s={13} />
                  </button>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.34)', marginBottom: 10, marginTop: 4 }}>Coming next</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: 9 }}>
            {soonCategories.map((cat) => (
              <div key={cat.key} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${cat.border}`, cursor: 'default' }}>
                <div style={{ height: 42, background: `linear-gradient(135deg, ${cat.bg.replace('0.08', '0.22')} 0%, ${cat.bg.replace('0.08', '0.06')} 100%)`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cat.accent + '20', display: 'grid', placeItems: 'center', color: cat.accent, flexShrink: 0 }}>
                    <cat.Icon s={16} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: cat.accent + '18', color: cat.accent }}>
                    Coming soon
                  </span>
                </div>
                <div style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>{cat.label}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.56)', lineHeight: 1.55, margin: 0 }}>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Activity listings growing ─────────────────────────────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Activity listings</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Activity listings are growing</h2>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button className="btn btn-gold btn-sm" onClick={() => goToWalks('')}>Explore all walks <IArrow s={11} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('find-help')}>Suggest an activity</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            <div className="card" onClick={() => goToWalks(localCounty)} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(91,201,74,0.20)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,201,74,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #5BC94A, #3DA832)' }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5BC94A' }}>Live now</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0D7A55', background: 'rgba(16,185,129,0.10)', padding: '2px 8px', borderRadius: 6 }}>333+ routes</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>Walks</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.5, marginBottom: 12 }}>
                  Rated trails, coastal paths and accessible routes{countyLabel ? ` across ${countyLabel}` : ''}.
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5BC94A' }}>Explore walks →</div>
              </div>
            </div>
            {/* Groups — routes to find-help, not walks */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.75, border: '1px solid rgba(45,156,219,0.14)' }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #2D9CDB66, #2D9CDB33)' }} />
              <div style={{ padding: '16px 18px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2D9CDB' }}>Coming soon</span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', margin: '5px 0' }}>Groups</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', lineHeight: 1.5, marginBottom: 12 }}>Social groups, carer circles and peer support activities near you.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.35)' }}>Listings being added</div>
              </div>
            </div>
            <div className="card" onClick={() => onNavigate('places-to-visit')} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(123,92,245,0.22)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,92,245,0.14)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #7B5CF5, #6D4EE8)' }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#7B5CF5' }}>Live now</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#5B3DB5', background: 'rgba(123,92,245,0.10)', padding: '2px 8px', borderRadius: 6 }}>233 venues</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>Places to Visit</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.5, marginBottom: 12 }}>
                  Carer-friendly attractions, gardens, heritage sites and family days out{countyLabel ? ` in ${countyLabel}` : ''}.
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7B5CF5' }}>Explore places →</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner / advertising inventory section ──────────────── */}
      <section style={{ paddingTop: 28, paddingBottom: 32, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.36)', marginBottom: 3 }}>Advertising inventory</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744' }}>Reach carers where they discover</div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={() => onNavigate('login')}>View options <IArrow s={11} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { icon: '🏆', badge: 'Limited slots', title: 'County sponsorship',      desc: 'Headline partner for a full county — appears across all activity and discovery pages.' },
              { icon: '📍', badge: 'Self-serve',    title: 'Featured activity listing', desc: 'Promoted placement for your venue, event or activity seen by carers searching nearby.' },
              { icon: '🏷️', badge: 'Free to list',  title: 'Carer discount partner',   desc: 'Add your business to the carer discounts map and build loyalty with a growing audience.' },
            ].map((c) => (
              <div key={c.title} style={{ borderRadius: 16, border: '1px solid #E9EEF5', background: '#FAFBFF', padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{c.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(245,166,35,0.12)', color: '#B45309' }}>{c.badge}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A2744', marginBottom: 4 }}>{c.title}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.55, margin: 0 }}>{c.desc}</p>
                </div>
                <button onClick={() => onNavigate('login')} style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginTop: 'auto' }}>
                  Find out more →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section style={{ paddingTop: 40, paddingBottom: 56, background: '#F8FBFF', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 23px)', fontWeight: 800, color: '#1A2744', margin: '0 0 8px' }}>Know an activity carers would love?</h2>
              <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.6, margin: 0 }}>
                Help carers{countyLabel ? ` in ${countyLabel}` : ''} discover local activities, groups and days out.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => onNavigate('find-help')}>Suggest an activity</button>
              <button className="btn btn-ghost" onClick={() => onNavigate('find-help')}>Claim your organisation</button>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ActivitiesPage;
