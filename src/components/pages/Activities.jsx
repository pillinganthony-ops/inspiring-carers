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
import CountyBanner from '../CountyBanner.jsx';
import CountyInterestModal from '../CountyInterestModal.jsx';
import SponsorCTA from '../SponsorCTA.jsx';
import CountyCategoryNav from '../CountyCategoryNav.jsx';
import CountyWalksBanner from '../CountyWalksBanner.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import {
  Crown, MapPin as LMapPin, Ticket, Gift, Coffee, HeartHandshake,
  Waves, Accessibility, HeartPulse, TicketPercent, Tag, Trophy, Users as LUsers,
  Compass, Building2, Leaf, Route, Heart,
} from 'lucide-react';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin } = Icons;

// Stable ref — must not recreate on render (useJsApiLoader warning)
const ACT_MAP_LIBS = [];

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTY_DEFAULT = 'cornwall';

const COUNTY_LABELS = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  dorset:    'Dorset',
  somerset:  'Somerset',
  bristol:   'Bristol',
  wiltshire: 'Wiltshire',
};

const ACTIVITY_TYPE_OPTIONS = [
  { value: '',            label: 'All activities' },
  { value: 'walks',       label: 'Walks' },
  { value: 'groups',      label: 'Groups' },
  { value: 'days-out',    label: 'Days Out' },
  { value: 'attractions', label: 'Attractions' },
  { value: 'wellbeing',   label: 'Wellbeing' },
  { value: 'discounts',   label: 'Carer Discounts' },
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
  { key: 'walks',       label: 'Walks',            status: 'live', route: 'walks',
    cta: 'Explore walks',         count: '333+ routes',  countLabel: 'Cornwall',
    tags: ['Coastal paths', 'Accessible routes', 'Rated trails', 'Dog friendly'],
    desc: 'Trails, coastal paths and nature routes rated by difficulty and accessibility.',
    accent: '#5BC94A', bg: 'rgba(91,201,74,0.08)', border: 'rgba(91,201,74,0.18)', Icon: IWalks },
  { key: 'places',      label: 'Places to Visit',  status: 'live', route: 'places-to-visit',
    cta: 'Browse places',         count: 'Days Out & Attractions', countLabel: 'Cornwall',
    tags: ['Gardens', 'Beaches', 'Heritage sites', 'Family friendly'],
    desc: 'Carer-friendly days out, gardens, beaches, heritage sites and family-friendly attractions.',
    accent: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.16)', Icon: ISparkle },
  { key: 'wellbeing',   label: 'Wellbeing Support', status: 'live', route: 'wellbeing',
    cta: 'Browse wellbeing',      count: 'Calm & restorative',     countLabel: 'Cornwall',
    tags: ['Mindfulness', 'Accessible', 'Community', 'Free sessions'],
    desc: 'Calm, restorative and community wellbeing places supporting carer health.',
    accent: '#0D9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.16)', Icon: IWellbeing },
  { key: 'groups',      label: 'Groups & Social',  status: 'live', route: 'groups',
    cta: 'Find groups',           count: 'Support & social',      countLabel: 'Cornwall',
    tags: ['Peer support', 'All welcome', 'Weekly meetups', 'Free to join'],
    desc: 'Local carer support groups, social circles and peer-support meetups near you.',
    accent: '#2D9CDB', bg: 'rgba(45,156,219,0.08)', border: 'rgba(45,156,219,0.16)', Icon: IGroups },
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


// ── Editorial card header — layered gradient + icon + metadata overlay ──────────
// Used in featured activity cards. Replaces flat colour blocks with intentional
// visual panels without requiring real photography.

const ActivityCardHeader = ({ grad, Icon, label, accent, location }) => (
  <div style={{
    height: 106, background: grad,
    position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {/* Radial depth highlights */}
    <div style={{ position: 'absolute', top: -24, right: -16, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -36, left: -6, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', pointerEvents: 'none' }} />
    {/* Central icon badge */}
    <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', position: 'relative', zIndex: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.10)' }}>
      <Icon size={24} color={accent} strokeWidth={1.7} />
    </div>
    {/* Bottom overlay: category tag + location */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 10px' }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', color: accent, background: 'rgba(255,255,255,0.90)', padding: '2px 10px', borderRadius: 999, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {label}
      </span>
      <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.55)', background: 'rgba(255,255,255,0.80)', padding: '2px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
        <LMapPin size={9} color="rgba(26,39,68,0.40)" strokeWidth={2.5} /> {location}
      </span>
    </div>
  </div>
);

// ── Shared style ──────────────────────────────────────────────────────────────

const iStyle = {
  padding: '10px 14px', borderRadius: 12,
  border: '1px solid #DDE5F0',
  background: '#F8FAFD',
  fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', flex: '1 1 140px', minWidth: 0,
  cursor: 'pointer', appearance: 'auto',
  boxShadow: '0 1px 3px rgba(26,39,68,0.05)',
};

// ── Activities map ────────────────────────────────────────────────────────────
// Combines geocoded walk pins (walks.json → postcodes.io) with ACTIVITY_SAMPLE_DATA.
// Find Help / resource data is NOT used here.
// Walk markers → navigate to walks page. Non-walk markers → info card only (no navigation CTA).

// DB category → CAT_CONFIG key (for liveVenues pins)
const DB_CAT_TO_MAP_KEY = { 'Days Out': 'days-out', 'Attractions': 'attractions', 'Wellbeing': 'wellbeing', 'Walks': 'walks' };

const ActivitiesMap = ({ localCounty, activityType, cost, accessibility, onNavigate, compactHeight, liveVenues, onVenueClick }) => {
  const mapH = compactHeight || 'clamp(300px, calc(20vw + 225px), 460px)';
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

  // Activity pins — use live Supabase venues when provided, else ACTIVITY_SAMPLE_DATA
  const samplePins = liveVenues
    ? liveVenues
        .filter((v) => v.latitude && v.longitude)
        .filter((v) => !activityType || DB_CAT_TO_MAP_KEY[v.category] === activityType)
        .map((v) => ({
          id:          `live-${v.id}`,
          category:    DB_CAT_TO_MAP_KEY[v.category] || 'days-out',
          lat:         v.latitude,
          lng:         v.longitude,
          title:       v.name,
          area:        v.town,
          description: v.short_description,
          featured:    v.featured,
          tags:        [
            v.free_or_paid, v.indoor_outdoor,
            v.wheelchair_access && 'Wheelchair', v.dog_friendly && 'Dogs',
          ].filter(Boolean),
          _venue: v,
          action: null,
        }))
    : ACTIVITY_SAMPLE_DATA.filter((item) => {
        if (item.category === 'walks') return false;
        if (localCounty && item.county !== localCounty) return false;
        if (activityType && item.category !== activityType) return false;
        if (cost && item.cost !== cost) return false;
        if (accessibility) {
          const tagStr = item.tags.join(' ').toLowerCase();
          const accessMap = { wheelchair: 'wheelchair', 'low-mobility': 'low mobility', transport: 'public transport', dogs: 'dog', dementia: 'dementia' };
          const keyword = accessMap[accessibility];
          if (keyword && !tagStr.includes(keyword)) return false;
        }
        return true;
      }).map((item) => ({ ...item, action: null }));

  const allPins = [...walkPins, ...samplePins];

  const Fallback = () => (
    <div style={{ height: mapH, borderRadius: 20, background: 'linear-gradient(160deg, #E8F5E4 0%, #EEF7FF 100%)', border: '1px solid #DEE8F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 32 }}>
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
    <div style={{ height: mapH, borderRadius: 20, background: '#F0F5FB', border: '1px solid #DEE8F4', display: 'grid', placeItems: 'center' }}>
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
          mapContainerStyle={{ width: '100%', height: mapH }}
          center={{ lat, lng }}
          zoom={zoom}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: true, gestureHandling: 'cooperative' }}
          onClick={() => setActivePin(null)}
        >
          {allPins.map((pin) => {
            const cfg = CAT_CONFIG[pin.category] || CAT_CONFIG.walks;
            const isFeatured = !!pin.featured;
            return (
              <MarkerF
                key={pin.id}
                position={{ lat: pin.lat, lng: pin.lng }}
                title={pin.title}
                icon={{
                  path: 0, // google.maps.SymbolPath.CIRCLE
                  fillColor: cfg.accent,
                  fillOpacity: 1,
                  strokeColor: isFeatured ? '#F5A623' : '#ffffff',
                  strokeWeight: isFeatured ? 3.5 : 2.5,
                  scale: isFeatured ? 14 : 12,
                }}
                label={{ text: cfg.label, color: 'white', fontWeight: '900', fontSize: '11px' }}
                zIndex={isFeatured ? 10 : 1}
                onClick={() => setActivePin(activePin?.id === pin.id ? null : pin)}
              />
            );
          })}

          {activePin && (
            <InfoWindowF
              position={{ lat: activePin.lat, lng: activePin.lng }}
              onCloseClick={() => setActivePin(null)}
            >
              <div style={{ maxWidth: 240, fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>
                {/* Category badge + featured flag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '2px 7px', borderRadius: 5, background: `${CAT_CONFIG[activePin.category]?.accent || '#1A2744'}18`, color: CAT_CONFIG[activePin.category]?.accent || '#1A2744' }}>
                    {ACTIVITY_TYPE_OPTIONS.find((o) => o.value === activePin.category)?.label || activePin.category}
                  </span>
                  {activePin.featured && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,166,35,0.14)', color: '#B45309' }}>Featured</span>
                  )}
                </div>
                {/* Title */}
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2744', lineHeight: 1.25, marginBottom: 4 }}>{activePin.title}</div>
                {/* Area */}
                {activePin.area && (
                  <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.52)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
                    📍 {activePin.area}
                  </div>
                )}
                {/* Description */}
                {activePin.description && (
                  <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.70)', lineHeight: 1.5, marginBottom: 7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {activePin.description}
                  </div>
                )}
                {/* Tags */}
                {activePin.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {activePin.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(26,39,68,0.07)', color: 'rgba(26,39,68,0.60)' }}>{t}</span>
                    ))}
                  </div>
                )}
                {/* CTA */}
                {activePin.category === 'walks' ? (
                  <button
                    onClick={activePin.action}
                    style={{ width: '100%', fontSize: 12, fontWeight: 700, padding: '6px 0', borderRadius: 8, background: CAT_CONFIG.walks.bg, color: CAT_CONFIG.walks.accent, border: 'none', cursor: 'pointer' }}
                  >
                    View walks →
                  </button>
                ) : onVenueClick && activePin._venue ? (
                  <button
                    onClick={() => { setActivePin(null); onVenueClick(activePin._venue); }}
                    style={{ width: '100%', fontSize: 12, fontWeight: 700, padding: '6px 0', borderRadius: 8, background: `${CAT_CONFIG[activePin.category]?.accent || '#1A2744'}14`, color: CAT_CONFIG[activePin.category]?.accent || '#1A2744', border: 'none', cursor: 'pointer' }}
                  >
                    View details →
                  </button>
                ) : null}
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
          <span style={{ fontStyle: 'italic' }}>Showing selected mapped activity points. Open the full walks map for all {walksData.filter((w) => String(w.county || 'cornwall').toLowerCase() === String(localCounty || 'cornwall').toLowerCase()).length} routes.</span>
          <span>Ctrl + scroll to zoom map</span>
        </div>
      </div>
    </div>
  );
};

// ── County-specific activities listing ─────────────────────────────────────────
// Rendered at /{county}/activities. Two-column sidebar + card grid, map toggle, pagination.

const CAT_ACCENT_LISTING = {
  'Days Out':    '#F5A623',
  'Attractions': '#7B5CF5',
  'Wellbeing':   '#0D9488',
  'Walks':       '#5BC94A',
};

// Premium category icon system — vector icons from lucide-react.
// Extend by adding/updating entries here — no other changes needed.
const CATEGORY_ICON_COMPONENTS = {
  'Days Out':    Compass,
  'Attractions': Building2,
  'Wellbeing':   Leaf,
  'Walks':       Route,
  'Food':        Coffee,
  'Community':   LUsers,
  'Family':      Heart,
};
// Punchy saturated badge backgrounds — provide the coloured shell around the white inner plate.
const CAT_BADGE_BG = {
  'Days Out':    'linear-gradient(145deg, rgba(245,166,35,0.68), rgba(217,140,20,0.50))',
  'Attractions': 'linear-gradient(145deg, rgba(123,92,245,0.68), rgba(99,69,210,0.50))',
  'Wellbeing':   'linear-gradient(145deg, rgba(13,148,136,0.64), rgba(9,110,100,0.46))',
  'Walks':       'linear-gradient(145deg, rgba(91,201,74,0.66),  rgba(68,168,54,0.48))',
};

const LISTING_CATEGORIES = [
  { value: '',            label: 'All activities', color: '#1A2744',  dot: 'rgba(26,39,68,0.35)' },
  { value: 'Days Out',    label: 'Days Out',       color: '#F5A623',  dot: '#F5A623' },
  { value: 'Attractions', label: 'Attractions',    color: '#7B5CF5',  dot: '#7B5CF5' },
  { value: 'Wellbeing',   label: 'Wellbeing',      color: '#0D9488',  dot: '#0D9488' },
  { value: 'Walks',       label: 'Walks',          color: '#5BC94A',  dot: '#5BC94A' },
];

const MAP_CAT = {
  'Days Out':    'days-out',
  'Attractions': 'attractions',
  'Wellbeing':   'wellbeing',
  'Walks':       'walks',
  '':            '',
};

const PAGE_SIZE = 12;

const tagPill = (color) => ({
  fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
  background: `${color}15`, color, border: `1px solid ${color}28`, display: 'inline-block', lineHeight: 1.3,
});

const ActivityListCard = ({ venue, onViewProfile }) => {
  const [hovered, setHovered] = React.useState(false);
  const accent       = CAT_ACCENT_LISTING[venue.category] || '#7B5CF5';
  const CategoryIcon = CATEGORY_ICON_COMPONENTS[venue.category] || LMapPin;
  const badgeBg      = CAT_BADGE_BG[venue.category] || `linear-gradient(135deg, rgba(123,92,245,0.82), rgba(99,69,210,0.62))`;

  const tags = [];
  if (venue.free_or_paid)      tags.push({ label: venue.free_or_paid,  color: venue.free_or_paid === 'Free' ? '#0D7A55' : '#1A2744' });
  if (venue.indoor_outdoor)    tags.push({ label: venue.indoor_outdoor, color: '#2D9CDB' });
  if (venue.family_friendly)   tags.push({ label: 'Family',            color: '#F5A623' });
  if (venue.wheelchair_access) tags.push({ label: 'Wheelchair',        color: '#7B5CF5' });
  if (venue.dog_friendly)      tags.push({ label: 'Dogs welcome',      color: '#3DA832' });
  if (venue.carer_friendly)    tags.push({ label: 'Carer friendly',    color: '#F4613A' });

  const trustLine = venue.carer_friendly
    ? 'Carer-friendly venue · Local discovery'
    : venue.wheelchair_access
      ? 'Accessible venue · Local discovery'
      : venue.family_friendly
        ? 'Family-friendly option · Local discovery'
        : 'Local option · Check details before visiting';

  return (
    <div
      className="card"
      onClick={() => onViewProfile(venue)}
      style={{ padding: 0, overflow: 'hidden', borderRadius: 22, border: `1px solid ${accent}22`, display: 'flex', flexDirection: 'column', background: '#FFFFFF', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.16s ease' }}
      onMouseEnter={(e) => { setHovered(true);  e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${accent}22, 0 4px 14px rgba(26,39,68,0.07)`; e.currentTarget.style.borderColor = `${accent}44`; }}
      onMouseLeave={(e) => { setHovered(false); e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${accent}22`; }}
    >
      {/* Accent top strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}66)`, flexShrink: 0 }} />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
        {/* Premium icon badge + category row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15, flexShrink: 0,
            background: badgeBg,
            border: `1px solid ${accent}33`,
            boxShadow: hovered
              ? `0 10px 24px ${accent}28`
              : `0 8px 20px ${accent}22`,
            display: 'grid', placeItems: 'center',
            transform: hovered ? 'translateY(-2px) scale(1.03)' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.04)', display: 'grid', placeItems: 'center' }}>
              <CategoryIcon size={22} color={accent} strokeWidth={1.8} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: 3 }}>
              {venue.category}{venue.subcategory ? ` · ${venue.subcategory}` : ''}
            </div>
            {venue.town && (
              <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IPin s={10} /> {venue.town}
              </div>
            )}
          </div>
          {/* Verified / Featured mini-badges */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {venue.verified && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.10)', color: '#0D7A55' }}>✓ Verified</span>}
            {venue.featured && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,166,35,0.12)', color: '#B45309' }}>Featured</span>}
          </div>
        </div>

        {/* Name */}
        <div style={{ fontSize: 16.5, fontWeight: 800, color: '#1A2744', lineHeight: 1.28 }}>
          {venue.name}
        </div>

        {/* Description */}
        {venue.short_description && (
          <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, margin: 0 }}>
            {venue.short_description}
          </p>
        )}

        {/* Trust micro-line */}
        <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.36)', fontStyle: 'italic', lineHeight: 1.4 }}>
          {trustLine}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {tags.map((t) => <span key={t.label} style={tagPill(t.color)}>{t.label}</span>)}
          </div>
        )}

        {/* CTAs */}
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(venue); }}
            style={{ fontSize: 13, fontWeight: 700, color: accent, background: `${accent}14`, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'background .14s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}26`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}14`; }}
          >
            View details →
          </button>
          {venue.website && (
            <a
              href={venue.website} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.50)', background: 'rgba(26,39,68,0.05)', padding: '8px 14px', borderRadius: 9, textDecoration: 'none', display: 'inline-block', transition: 'background .14s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.09)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.05)'; }}
            >
              Website ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Walk difficulty colour system (mirrors Walks.jsx) ────────────────────────
const WALK_DIFF_ACCENT = { Easy: '#5BC94A', Moderate: '#F5A623', Hard: '#EF4444' };
const WALK_DIFF_BG     = { Easy: 'rgba(91,201,74,0.08)', Moderate: 'rgba(245,166,35,0.08)', Hard: 'rgba(239,68,68,0.08)' };
const WALK_DIFF_FG     = { Easy: '#1E6B10', Moderate: '#92400E', Hard: '#B91C1C' };
const normWalkDiff = (d) => {
  const s = (d || '').toString().toLowerCase().trim();
  if (s.includes('easy') || s.includes('gentle')) return 'Easy';
  if (s.includes('hard') || s.includes('strenuous') || s.includes('challeng')) return 'Hard';
  return 'Moderate';
};

// Premium walk card — matches Walks page WalkCard design. Click expands detail modal (no navigation).
const WalkListCard = ({ walk, onExpand }) => {
  const diff   = normWalkDiff(walk.difficulty);
  const accent = WALK_DIFF_ACCENT[diff];
  const bg     = WALK_DIFF_BG[diff];
  const fg     = WALK_DIFF_FG[diff];
  return (
    <div
      className="card"
      onClick={() => onExpand(walk)}
      style={{ padding: 0, overflow: 'hidden', borderRadius: 22, border: '1px solid #E8EEF8', display: 'flex', flexDirection: 'column', background: '#FFFFFF', cursor: 'pointer', transition: 'transform 0.20s ease, box-shadow 0.20s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 22px 52px rgba(26,39,68,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Difficulty-coded stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)`, flexShrink: 0 }} />
      {/* Tinted area + difficulty header */}
      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: bg }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: fg, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
          <IPin s={12} /> {walk.area || 'Cornwall'}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: 999, background: accent, color: 'white', fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>
          {diff}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, lineHeight: 1.22, color: '#1A2744', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {walk.name}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {walk.distanceMiles > 0 && (
            <span style={{ padding: '4px 10px', borderRadius: 999, background: '#EEF4FF', color: '#2A4A90', fontSize: 12, fontWeight: 700 }}>
              {Number(walk.distanceMiles).toFixed(1)} miles
            </span>
          )}
          <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(13,122,85,0.10)', color: '#0D7A55', fontSize: 12, fontWeight: 700 }}>Free</span>
        </div>
      </div>
      {/* CTA */}
      <div style={{ padding: '8px 16px 14px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(walk); }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(135deg, #1A2744, #2D3E6B)', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #263659, #1A2744)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #1A2744, #2D3E6B)'; }}
        >
          View walk details <IArrow s={13} />
        </button>
      </div>
    </div>
  );
};

// Walk detail modal — expands walk info in place without leaving the page
const WalkExpandModal = ({ walk, county, onNavigate, onClose }) => {
  if (!walk) return null;
  const diff   = normWalkDiff(walk.difficulty);
  const accent = WALK_DIFF_ACCENT[diff];
  const bg     = WALK_DIFF_BG[diff];
  const fg     = WALK_DIFF_FG[diff];
  const facilities = [
    { label: 'Toilets', has: walk.toilets },
    { label: 'Parking', has: walk.parking },
    { label: 'Buses',   has: walk.publicTransport },
    { label: 'Cafes',   has: walk.refreshments },
  ].filter((f) => f.has !== undefined && f.has !== null);
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(15,23,42,0.55)', display: 'grid', placeItems: 'center', padding: 16 }}
    >
      <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.22)', position: 'relative' }}>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
        <button onClick={onClose} style={{ position: 'absolute', right: 16, top: 18, width: 32, height: 32, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
        <div style={{ padding: '18px 22px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: bg, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: fg, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IPin s={12} /> {walk.area || 'Cornwall'}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 999, background: accent, color: 'white', fontSize: 12, fontWeight: 800 }}>{diff}</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#1A2744', marginBottom: 12, lineHeight: 1.2 }}>
            {walk.name}
          </h2>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
            {walk.distanceMiles > 0 && (
              <span style={{ padding: '5px 12px', borderRadius: 999, background: '#EEF4FF', color: '#2A4A90', fontSize: 13, fontWeight: 700 }}>
                {Number(walk.distanceMiles).toFixed(1)} miles
              </span>
            )}
            <span style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(13,122,85,0.10)', color: '#0D7A55', fontSize: 13, fontWeight: 700 }}>Free</span>
            {walk.circular && <span style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(91,201,74,0.10)', color: '#1E6B10', fontSize: 13, fontWeight: 700 }}>Circular</span>}
          </div>
          {walk.startLocation && (
            <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IWalks s={13} />
              {walk.startLocation}{walk.finishLocation && walk.finishLocation !== walk.startLocation ? ` → ${walk.finishLocation}` : ''}
            </div>
          )}
          {walk.highlights && (
            <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65, marginBottom: 14 }}>{walk.highlights}</p>
          )}
          {facilities.length > 0 && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 14px', background: '#F7F9FC', borderRadius: 10, marginBottom: 18 }}>
              {facilities.map(({ label, has }) => (
                <span key={label} style={{ fontSize: 12.5, fontWeight: 700, color: has ? '#1E6B10' : 'rgba(26,39,68,0.34)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 15, height: 15, borderRadius: 999, background: has ? 'rgba(91,201,74,0.18)' : 'rgba(26,39,68,0.06)', display: 'inline-grid', placeItems: 'center', fontSize: 9 }}>
                    {has ? '✓' : '–'}
                  </span>
                  {label}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" onClick={() => { onClose(); onNavigate('walks', county); }} style={{ flex: 1, justifyContent: 'center' }}>
              Explore on walks map <IArrow s={13} />
            </button>
            <button onClick={onClose} style={{ padding: '11px 16px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontWeight: 600, fontSize: 13.5, border: '1px solid #E9EEF5', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountyActivitiesView = ({ county, onNavigate, session }) => {
  const dbCounty    = COUNTY_LABELS[county] || 'Cornwall';
  const countyLabel = COUNTY_LABELS[county] || county;

  const [venues,       setVenues]       = React.useState([]);
  const [loading,      setLoading]      = React.useState(true);
  const [error,        setError]        = React.useState(null);
  const [showMap,      setShowMap]      = React.useState(true); // map shown by default above listings
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [walkSearch,   setWalkSearch]   = React.useState('');
  const [expandedWalk, setExpandedWalk] = React.useState(null);

  const [search,           setSearch]           = React.useState('');
  const [filterCat,        setFilterCat]        = React.useState('');
  const [filterSubcat,     setFilterSubcat]     = React.useState('');
  const [filterPrice,      setFilterPrice]      = React.useState('');
  const [filterInOut,      setFilterInOut]      = React.useState('');
  const [filterFamily,     setFilterFamily]     = React.useState(false);
  const [filterWheelchair, setFilterWheelchair] = React.useState(false);
  const [filterDog,        setFilterDog]        = React.useState(false);
  const [filterCarer,      setFilterCarer]      = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    setSearch(''); setFilterCat(''); setFilterSubcat(''); setFilterPrice(''); setFilterInOut('');
    setFilterFamily(false); setFilterWheelchair(false); setFilterDog(false); setFilterCarer(false);

    const load = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (!cancelled) { setError('Database not available.'); setLoading(false); }
        return;
      }
      try {
        const { data, error: dbErr } = await supabase
          .from('venues_public')
          .select('id, name, slug, category, subcategory, short_description, town, free_or_paid, indoor_outdoor, family_friendly, dog_friendly, wheelchair_access, carer_friendly, website, featured, verified, latitude, longitude')
          .eq('county', dbCounty)
          .in('category', ['Days Out', 'Attractions', 'Wellbeing'])
          .order('category', { ascending: true })
          .order('name', { ascending: true });
        if (dbErr) throw dbErr;
        if (!cancelled) { setVenues(data || []); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err.message || 'Could not load activities.'); setLoading(false); }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [dbCounty]);

  const subcatOptions = React.useMemo(() => {
    const seen = new Set();
    venues.forEach((v) => { if (v.subcategory) seen.add(v.subcategory); });
    return Array.from(seen).sort();
  }, [venues]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return venues.filter((v) => {
      if (q && !v.name?.toLowerCase().includes(q) && !v.town?.toLowerCase().includes(q)) return false;
      if (filterCat    && v.category !== filterCat)       return false;
      if (filterSubcat && v.subcategory !== filterSubcat)  return false;
      if (filterPrice  && v.free_or_paid !== filterPrice)  return false;
      if (filterInOut  && v.indoor_outdoor !== filterInOut) return false;
      if (filterFamily     && !v.family_friendly)          return false;
      if (filterWheelchair && !v.wheelchair_access)        return false;
      if (filterDog        && !v.dog_friendly)             return false;
      if (filterCarer      && !v.carer_friendly)           return false;
      return true;
    });
  }, [venues, search, filterCat, filterSubcat, filterPrice, filterInOut, filterFamily, filterWheelchair, filterDog, filterCarer]);

  const anyFilter = search || filterCat || filterSubcat || filterPrice || filterInOut || filterFamily || filterWheelchair || filterDog || filterCarer;

  // County-restricted walks. walks.json has no explicit county field — all rows default to
  // cornwall. Non-Cornwall counties correctly receive an empty array until data is added.
  const normalisedCountySlug = String(county || 'cornwall').toLowerCase().trim();
  const countyWalks = React.useMemo(() => {
    if (!Array.isArray(walksData)) return [];
    return walksData.filter((w) => {
      const wc = String(w.county || w.county_slug || w.countySlug || 'cornwall').toLowerCase().trim();
      return wc === normalisedCountySlug;
    });
  }, [normalisedCountySlug]);

  // Walk count is derived directly from the county-restricted pool.
  const countyWalksCount = countyWalks.length;

  // Filtered walks for the Walks tab — searches within county walks only.
  const filteredWalks = React.useMemo(() => {
    const q = walkSearch.trim().toLowerCase();
    if (!q) return countyWalks;
    return countyWalks.filter((w) =>
      w.name?.toLowerCase().includes(q) || w.area?.toLowerCase().includes(q)
    );
  }, [countyWalks, walkSearch]);

  const clearFilters = () => {
    setSearch(''); setFilterCat(''); setFilterSubcat(''); setFilterPrice(''); setFilterInOut('');
    setFilterFamily(false); setFilterWheelchair(false); setFilterDog(false); setFilterCarer(false);
    setWalkSearch(''); setVisibleCount(PAGE_SIZE);
  };

  const handleViewProfile = (venue) => {
    const dest = venue.category === 'Wellbeing' ? 'wellbeing' : 'places-to-visit';
    onNavigate(dest, county, venue.slug);
  };

  // Reset pagination and walk search when filters change
  React.useEffect(() => { setVisibleCount(PAGE_SIZE); setWalkSearch(''); }, [filterCat, filterSubcat, filterPrice, filterInOut, filterFamily, filterWheelchair, filterDog, filterCarer, search]);

  const visibleVenues   = filtered.slice(0, visibleCount);
  const visibleWalks    = filteredWalks.slice(0, visibleCount);
  const mapActivityType = MAP_CAT[filterCat] || '';

  // Dynamic hero title and subtitle
  const heroTitle = filterCat ? `${filterCat} in ${countyLabel}` : `Activities in ${countyLabel}`;
  const heroSubtitle =
    filterCat === 'Walks'       ? `Explore ${countyWalksCount}+ trails, coastal paths and accessible walking routes across ${countyLabel}.` :
    filterCat === 'Days Out'    ? `Carer-friendly days out, gardens and family destinations in ${countyLabel}.` :
    filterCat === 'Attractions' ? `Museums, heritage sites and cultural attractions in ${countyLabel}.` :
    filterCat === 'Wellbeing'   ? `Calm, restorative and community wellbeing places in ${countyLabel}.` :
    `Days out, attractions, wellbeing and ${countyWalksCount ? `${countyWalksCount}+ walks` : 'walks'} in ${countyLabel}.`;

  // Sidebar section header style
  const sectionLabel = { fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.38)', marginBottom: 10 };

  // Category filter button
  const catBtn = (cat) => {
    const active = filterCat === cat.value;
    return (
      <button key={cat.value} onClick={() => setFilterCat(cat.value)}
        style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 10, marginBottom: 4, border: active ? `1.5px solid ${cat.color}` : '1px solid #EEF1F7', background: active ? `${cat.color}10` : 'transparent', color: active ? cat.color : 'rgba(26,39,68,0.66)', fontWeight: active ? 700 : 500, fontSize: 13.5, cursor: 'pointer', transition: 'all .14s', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#F7F9FC'; e.currentTarget.style.color = '#1A2744'; }}}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,39,68,0.66)'; }}}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.dot, flexShrink: 0 }} />
        {cat.label}
      </button>
    );
  };

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} county={county} />
      <CountyBanner county={county} isFallback={!county} onChangeCounty={(c) => onNavigate('activities', c)} />
      <CountyCategoryNav county={county} activePage="activities" onNavigate={onNavigate} />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 50%, #1A3460 100%)', paddingTop: 28, paddingBottom: 36 }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <button
            onClick={() => onNavigate('activities', null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.60)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}
          >
            ← Activities hub
          </button>

          {/* Two-module hero: left = title/stats, right = sponsor panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left: title + stats ── */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(91,201,74,0.15)', border: '1px solid rgba(91,201,74,0.28)', fontSize: 11, fontWeight: 800, color: '#78E060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                {filterCat || 'Activities'} · {countyLabel}
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 10px', textWrap: 'balance' }}>
                {heroTitle}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 480 }}>
                {heroSubtitle}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                  {[
                    { n: venues.length,                                                l: 'Places' },
                    { n: countyWalksCount,                                             l: 'Walks' },
                    { n: venues.filter((v) => v.free_or_paid === 'Free').length,       l: 'Free entry' },
                    { n: venues.filter((v) => v.wheelchair_access).length,             l: 'Accessible' },
                  ].map(({ n, l }, i) => (
                    <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
            </div>

            {/* ── Right: county sponsorship module ── */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(255,255,255,0.40)', marginBottom: 8 }}>
                County sponsorship
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 7, lineHeight: 1.3 }}>
                Become the {countyLabel} activities partner
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Feature your organisation across all {countyLabel} discovery pages and reach carers searching for local activities.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16 }}>
                {[
                  { n: countyWalksCount, l: 'Walk routes' },
                  { n: venues.length,   l: 'Activity places' },
                ].map(({ n, l }) => (
                  <div key={l} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => onNavigate('advertise')}
                  style={{ width: '100%', padding: '11px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #F5A623, #D4AF37)', color: '#0F172A', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .14s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.90'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  Become a sponsor →
                </button>
                <button
                  onClick={() => onNavigate('offer-a-discount')}
                  style={{ width: '100%', padding: '9px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.82)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'opacity .14s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.80'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  Offer a discount
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.24)', textAlign: 'center', marginTop: 6 }}>
                Limited county slots available
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Explore Walks cross-link ── */}
      <CountyWalksBanner
        county={county}
        onNavigate={onNavigate}
        headline="Outdoor routes and green spaces can support wellbeing."
        detail={`Find accessible walks${countyLabel ? ` in ${countyLabel}` : ' near you'}.`}
      />

      {/* ── Main content — two-column sidebar + right (map + cards) ── */}
      <div style={{ background: '#F7F9FC', paddingTop: 28, paddingBottom: 56 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* ── LEFT: filter sidebar ── */}
            <div style={{ flex: '0 0 226px', minWidth: 0, position: 'sticky', top: 88 }}>
              <div className="card" style={{ padding: '18px 16px', borderRadius: 16 }}>

                {/* Search */}
                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Search</div>
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name or town…"
                      style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 30 }}
                    />
                    <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
                      <ISearch s={12} />
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Category</div>
                  {LISTING_CATEGORIES.map((cat) => catBtn(cat))}
                </div>

                {/* Subcategory — venue categories only */}
                {filterCat !== 'Walks' && subcatOptions.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={sectionLabel}>Type</div>
                    <select value={filterSubcat} onChange={(e) => setFilterSubcat(e.target.value)} style={{ ...iStyle, width: '100%' }}>
                      <option value="">All types</option>
                      {subcatOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Price */}
                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Price</div>
                  <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} style={{ ...iStyle, width: '100%' }}>
                    <option value="">Any price</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                {/* Setting — venue categories only */}
                {filterCat !== 'Walks' && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={sectionLabel}>Setting</div>
                    <select value={filterInOut} onChange={(e) => setFilterInOut(e.target.value)} style={{ ...iStyle, width: '100%' }}>
                      <option value="">Indoor or outdoor</option>
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                )}

                {/* Suitability */}
                <div style={{ marginBottom: 14 }}>
                  <div style={sectionLabel}>Suitability</div>
                  {[
                    { label: 'Family friendly', active: filterFamily,     set: setFilterFamily,     color: '#F5A623' },
                    { label: 'Wheelchair',      active: filterWheelchair, set: setFilterWheelchair, color: '#7B5CF5' },
                    { label: 'Dog friendly',    active: filterDog,        set: setFilterDog,        color: '#3DA832' },
                    { label: 'Carer friendly',  active: filterCarer,      set: setFilterCarer,      color: '#F4613A' },
                  ].map(({ label, active, set, color }) => (
                    <button key={label} onClick={() => set(!active)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 9, marginBottom: 5, border: active ? `1.5px solid ${color}` : '1px solid #EEF1F7', background: active ? `${color}10` : 'transparent', color: active ? color : 'rgba(26,39,68,0.65)', fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all .13s' }}
                    >
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: active ? `1.5px solid ${color}` : '1.5px solid rgba(26,39,68,0.22)', background: active ? color : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        {active && <span style={{ fontSize: 9, color: 'white', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Clear all */}
                {anyFilter && (
                  <button onClick={clearFilters} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,39,68,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'center' }}>
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: compact map at top, then cards ── */}
            <div style={{ flex: '1 1 400px', minWidth: 0 }}>

              {/* Compact map — sits above cards, toggleable */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMap ? 10 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.48)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IPin s={12} /> {filterCat || 'All categories'} · {countyLabel}
                  </div>
                  <button
                    onClick={() => setShowMap((s) => !s)}
                    style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 9, border: `1px solid ${showMap ? 'rgba(26,39,68,0.16)' : '#DEE8F4'}`, background: showMap ? 'rgba(26,39,68,0.04)' : '#F0F5FB', color: '#1A2744', cursor: 'pointer', transition: 'background .13s', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <IPin s={11} /> {showMap ? 'Hide map' : 'Show map'}
                  </button>
                </div>
                {showMap && (
                  <ActivitiesMap
                    localCounty={county}
                    activityType={mapActivityType}
                    cost={''}
                    accessibility={''}
                    onNavigate={onNavigate}
                    compactHeight='270px'
                    liveVenues={venues}
                    onVenueClick={handleViewProfile}
                  />
                )}
              </div>

              {/* Section header */}
              {!loading && !error && (
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', fontWeight: 800, color: '#1A2744', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {filterCat ? `${filterCat} in ${countyLabel}` : `Activities in ${countyLabel}`}
                  </h2>
                  <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.52)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {filterCat === 'Walks'
                      ? 'Accessible routes, trails and walking paths near you.'
                      : 'Browse local days out, wellbeing places, walks and community options.'}
                  </p>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.46)', borderTop: '1px solid #EEF1F7', paddingTop: 8 }}>
                    {filterCat === 'Walks'
                      ? <><strong style={{ color: '#1A2744' }}>{filteredWalks.length}</strong> {walkSearch ? `of ${walksData.length}` : ''} walks in {countyLabel}</>
                      : filtered.length === venues.length
                        ? <><strong style={{ color: '#1A2744' }}>{venues.length}</strong> {filterCat || 'activities'} in {countyLabel}</>
                        : <><strong style={{ color: '#1A2744' }}>{filtered.length}</strong> of {venues.length} {filterCat || 'activities'}</>
                    }
                  </div>
                </div>
              )}

              {/* Loading skeletons */}
              {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card" style={{ padding: 16, borderRadius: 16, minHeight: 180 }}>
                      <div style={{ height: 5, background: '#EAF0FA', borderRadius: 2, marginBottom: 14 }} />
                      <div style={{ height: 10, width: '55%', borderRadius: 6, background: '#EAF0FA', marginBottom: 10 }} />
                      <div style={{ height: 14, width: '82%', borderRadius: 6, background: '#E4ECF8', marginBottom: 10 }} />
                      <div style={{ height: 10, width: '38%', borderRadius: 6, background: '#EAF0FA', marginBottom: 12 }} />
                      <div style={{ height: 10, width: '94%', borderRadius: 6, background: '#EAF0FA' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>⚠️</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>Could not load activities</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 20 }}>{error}</div>
                  <button className="btn btn-gold btn-sm" onClick={() => window.location.reload()}>Try again</button>
                </div>
              )}

              {/* Walks category — search bar + walk cards */}
              {!loading && !error && filterCat === 'Walks' && (
                <div>
                  {/* Walk search */}
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <input
                      type="text" value={walkSearch} onChange={(e) => setWalkSearch(e.target.value)}
                      placeholder={`Search ${countyWalksCount || 'walks'} by name or area…`}
                      style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 34, fontSize: 14 }}
                    />
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
                      <ISearch s={14} />
                    </span>
                    {walkSearch && (
                      <button onClick={() => setWalkSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(26,39,68,0.40)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
                    )}
                  </div>

                  {/* Walk cards */}
                  {visibleWalks.length > 0 ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
                        {visibleWalks.map((walk, i) => (
                          <WalkListCard key={walk.id || `${walk.name}-${i}`} walk={walk} onExpand={setExpandedWalk} />
                        ))}
                      </div>
                      {visibleCount < filteredWalks.length && (
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <button onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} className="btn btn-ghost" style={{ minWidth: 200 }}>
                            Load more <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(26,39,68,0.45)', marginLeft: 4 }}>({filteredWalks.length - visibleCount} remaining)</span>
                          </button>
                        </div>
                      )}
                      <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 4 }}>
                        <button className="btn btn-gold" onClick={() => onNavigate('walks', county)}>
                          Open full walks map <IArrow s={13} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>No walks found</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 14 }}>Try a different search term.</div>
                      <button onClick={() => setWalkSearch('')} className="btn btn-ghost btn-sm">Clear search</button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && filterCat !== 'Walks' && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>🗺️</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>
                    {venues.length === 0 ? `No activities listed yet for ${countyLabel}` : 'No activities match your filters'}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 16 }}>
                    {venues.length === 0 ? 'Check back soon — more listings are being added.' : 'Try adjusting or clearing your filters.'}
                  </div>
                  {anyFilter && <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear all filters</button>}
                </div>
              )}

              {/* Cards grid + load more */}
              {!loading && !error && filterCat !== 'Walks' && filtered.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
                    {visibleVenues.map((venue) => (
                      <ActivityListCard key={venue.id} venue={venue} onViewProfile={handleViewProfile} />
                    ))}
                  </div>

                  {visibleCount < filtered.length && (
                    <div style={{ textAlign: 'center', paddingTop: 4 }}>
                      <button onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} className="btn btn-ghost" style={{ minWidth: 200 }}>
                        Load more{' '}
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(26,39,68,0.45)', marginLeft: 4 }}>
                          ({filtered.length - visibleCount} remaining)
                        </span>
                      </button>
                    </div>
                  )}

                  {visibleCount >= filtered.length && filtered.length > PAGE_SIZE && (
                    <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(26,39,68,0.38)', paddingTop: 8 }}>
                      All {filtered.length} activities shown
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Walk expand modal — shows walk detail in place, no page navigation */}
      {expandedWalk && (
        <WalkExpandModal
          walk={expandedWalk}
          county={county}
          onNavigate={onNavigate}
          onClose={() => setExpandedWalk(null)}
        />
      )}

      <Footer onNavigate={onNavigate} />
    </>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const ActivitiesCountyPage = ({ onNavigate, session, county }) => {
  if (county) {
    return <CountyActivitiesView county={county} onNavigate={onNavigate} session={session} />;
  }

};

// ── National hub — shown when no county prop (/activities) ───────────────────
const ACT_COUNTY_CARDS = [
  { key: 'cornwall', label: 'Cornwall', status: 'live',        badge: 'Live now',    accent: '#5BC94A', badgeBg: 'rgba(22,163,74,0.10)',  badgeColor: '#166534' },
  { key: 'devon',    label: 'Devon',    status: 'launching',   badge: 'Launching',   accent: '#D97706', badgeBg: 'rgba(217,119,6,0.10)',  badgeColor: '#92400E' },
  { key: 'somerset', label: 'Somerset', status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.22)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.48)' },
  { key: 'bristol',  label: 'Bristol',  status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.22)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.48)' },
];

const ActivitiesNationalHub = ({ onNavigate, session }) => (
  <>
    <Nav activePage="activities" onNavigate={onNavigate} session={session} />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(150deg, #0A1A0A 0%, #0F2E12 50%, #132B16 100%)', paddingTop: 64, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.18) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: '20%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(91,201,74,0.18)', border: '1px solid rgba(91,201,74,0.28)', fontSize: 10.5, fontWeight: 800, color: '#86EFAC', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 22 }}>
          National hub
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Everything to do<br />for carers across the UK
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
          Events, walks, wellbeing spaces and days out — all in one place. Find what's happening in your county.
        </p>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 600, marginTop: 28 }}>
          {['Events & sessions', 'Outdoor walks', 'Wellbeing places', 'Days out'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />{t}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Explore activity types */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5BC94A', marginBottom: 10 }}>Browse by type</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>Explore activity types</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { label: 'Events',          sub: 'Workshops, sessions and community meetups',    accent: '#2D9CDB', bg: 'rgba(45,156,219,0.08)',  page: 'events'          },
            { label: 'Walks',           sub: 'Accessible routes, trails and outdoor spaces', accent: '#5BC94A', bg: 'rgba(91,201,74,0.08)',   page: 'walks'           },
            { label: 'Places to Visit', sub: 'Days out, attractions and carer-friendly venues', accent: '#7B5CF5', bg: 'rgba(123,92,245,0.08)', page: 'places-to-visit' },
            { label: 'Wellbeing',       sub: 'Calm spaces, support venues and restorative places', accent: '#0D9488', bg: 'rgba(13,148,136,0.08)', page: 'wellbeing' },
          ].map(({ label, sub, accent, bg, page }) => (
            <button
              key={label}
              onClick={() => onNavigate(page)}
              style={{ padding: '28px 26px', borderRadius: 20, borderTop: `4px solid ${accent}`, background: '#FFFFFF', boxShadow: '0 2px 10px rgba(26,39,68,0.06)', textAlign: 'left', border: 'none', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', display: 'flex', flexDirection: 'column', gap: 0 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}22`; e.currentTarget.style.borderTop = `4px solid ${accent}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,39,68,0.06)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, marginBottom: 16 }} />
              <div style={{ fontSize: 16.5, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>{label}</div>
              <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>{sub}</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Explore {label} →</span>
            </button>
          ))}
        </div>
      </div>
    </section>

    {/* County cards */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FAFBFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5BC94A', marginBottom: 10 }}>Select your county</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
            Choose your area to find local activities
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto' }}>
          {ACT_COUNTY_CARDS.map(c => {
            const isLive = c.status === 'live';
            return (
              <div key={c.key} className="card" style={{ padding: '28px 24px', borderRadius: 20, borderLeft: `4px solid ${c.accent}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744' }}>{c.label}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: c.badgeBg, color: c.badgeColor, whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
                {isLive ? (
                  <button
                    onClick={() => onNavigate('activities', c.key)}
                    style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .13s', marginTop: 'auto' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Choose {c.label}
                  </button>
                ) : (
                  <CountyInterestModal county={c.key} label={c.label} sourcePage="activities" />
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(26,39,68,0.50)', marginTop: 24, lineHeight: 1.6, maxWidth: 560, margin: '24px auto 0' }}>
          Discover events, walks and wellbeing places. Choose your county above to explore what's available near you.
        </p>
      </div>
    </section>

    {/* How it works */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#F7F9FC' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>How it works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '1', title: 'Choose the type of activity', body: 'Pick from events, walks, wellbeing places or days out — whatever fits your needs today.' },
            { n: '2', title: 'Pick your county',            body: 'Select your area to see what\'s available near you from local organisations and venues.' },
            { n: '3', title: 'Explore or register interest', body: 'Cornwall is live now. Devon and Somerset are coming soon — register interest to be first to know.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '24px 22px', background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(26,39,68,0.06)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#16A34A', color: 'white', fontWeight: 800, fontSize: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1A2744', margin: '0 0 7px', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <SponsorCTA
      accent="#16A34A"
      title="Promote activities, events and venues"
      body="Submit events, walks, wellbeing places or carer-friendly venues. Organisations, community groups and businesses can all get involved."
      onNavigate={onNavigate}
    />

    <Footer onNavigate={onNavigate} />
  </>
);

// ── Public export — routes between national hub and county page ───────────────
const ActivitiesPage = ({ onNavigate, session, county }) => {
  if (!county) return <ActivitiesNationalHub onNavigate={onNavigate} session={session} />;
  return <ActivitiesCountyPage onNavigate={onNavigate} session={session} county={county} />;
};

export default ActivitiesPage;
