// Activities discovery hub — county-optional route (/activities and /{county}/activities).
// Map: real walk pins geocoded from walks.json via postcodes.io (same approach as Walks.jsx).
// county prop = null on /activities (hub view), or county slug on /{county}/activities.
// localCounty state lets county filter update without forcing a URL change.

import React from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import walksData from '../../data/walks.json';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin } = Icons;

// Stable ref — must not recreate on render (useJsApiLoader warning)
const ACT_MAP_LIBS = [];

// ── Data ─────────────────────────────────────────────────────────────────────

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
  { value: 'events',      label: 'Events' },
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

// Map centre per county
const COUNTY_CENTERS = {
  '':         { lat: 51.00, lng: -3.50, zoom: 8 }, // South-west England
  cornwall:   { lat: 50.35, lng: -4.80, zoom: 9 },
  devon:      { lat: 50.72, lng: -3.80, zoom: 9 },
  somerset:   { lat: 51.10, lng: -2.95, zoom: 9 },
  bristol:    { lat: 51.45, lng: -2.60, zoom: 10 },
  dorset:     { lat: 50.75, lng: -2.35, zoom: 9 },
  wiltshire:  { lat: 51.35, lng: -1.99, zoom: 9 },
};

// Sample walks — one per unique area for geographic spread across Cornwall
// walks.json is Cornwall-only; other counties show centred map + note
const SAMPLE_WALKS = (() => {
  const seenAreas = new Set();
  return walksData.filter((w) => {
    if (!w.postcode || !w.area || seenAreas.has(w.area)) return false;
    seenAreas.add(w.area);
    return seenAreas.size <= 16; // up to 16 map pins
  });
})();

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

const POPULAR_CHIPS = [
  { label: 'Free activities',    sub: 'No cost',       icon: '🆓', type: '',          cost: 'free',       access: '' },
  { label: 'Accessible places',  sub: 'Easy access',   icon: '♿', type: '',          cost: '',           access: 'low-mobility' },
  { label: 'Coastal walks',      sub: 'Scenic routes', icon: '🌊', type: 'walks',     cost: '',           access: '' },
  { label: 'Family days out',    sub: 'All ages',      icon: '👨‍👩‍👧', type: 'days-out',  cost: '',           access: '' },
  { label: 'Wellbeing sessions', sub: 'Mind & body',   icon: '🧘', type: 'wellbeing', cost: '',           access: '' },
  { label: 'Carer discounts',    sub: 'Save money',    icon: '🏷️', type: '',          cost: 'discounted', access: '' },
];

// Hero featured cards — visual highlights, all route to walks page
const HERO_FEATURED = [
  { title: 'Porthcurno coastal walk', type: 'Walk',    tag: 'Free · 3.2 miles',    grad: 'linear-gradient(135deg, #D4F0C8 0%, #B8E4A4 100%)', accent: '#3DA832' },
  { title: 'Carer coffee morning',    type: 'Group',   tag: 'Free · Weekly',        grad: 'linear-gradient(135deg, #C8E4F8 0%, #A8D4F0 100%)', accent: '#1c78b5' },
  { title: 'Accessible day out',      type: 'Day Out', tag: 'Discounted · Booking', grad: 'linear-gradient(135deg, #FDE8C4 0%, #F8D4A0 100%)', accent: '#B45309' },
];

// ── Shared style ──────────────────────────────────────────────────────────────

const iStyle = {
  padding: '10px 14px', borderRadius: 12, border: '1px solid #E9EEF5',
  background: '#FAFBFF', fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', flex: '1 1 140px', minWidth: 0,
  cursor: 'pointer', appearance: 'auto',
};

// ── Map component ─────────────────────────────────────────────────────────────
// Geocodes real walk postcodes from walks.json via postcodes.io (same as Walks.jsx).
// No new API dependencies. Uses existing VITE_GOOGLE_MAPS_API_KEY.
// Falls back gracefully on API error or missing key.

const ActivitiesMap = ({ localCounty, onNavigate }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'ic-activity-map',
    googleMapsApiKey: apiKey || '',
    libraries: ACT_MAP_LIBS,
  });

  const [walkCoords, setWalkCoords] = React.useState({});
  const [geoLoading, setGeoLoading] = React.useState(false);

  // Geocode sample walk postcodes once (Cornwall data only)
  React.useEffect(() => {
    const postcodes = SAMPLE_WALKS.map((w) => w.postcode).filter(Boolean);
    if (!postcodes.length) return;
    let cancelled = false;
    setGeoLoading(true);
    (async () => {
      try {
        const resp = await fetch('https://api.postcodes.io/postcodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcodes }),
        });
        const data = await resp.json();
        const coords = {};
        (data.result || []).forEach(({ query, result }) => {
          if (result?.latitude && result?.longitude) {
            coords[query] = { lat: result.latitude, lng: result.longitude };
          }
        });
        if (!cancelled) { setWalkCoords(coords); setGeoLoading(false); }
      } catch {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // one-shot — sample walks don't change

  const { lat, lng, zoom } = COUNTY_CENTERS[localCounty] || COUNTY_CENTERS[''];
  const center = { lat, lng };

  // Walk pins only available for Cornwall data in walks.json
  const isCornwallOrAll = !localCounty || localCounty === 'cornwall';
  const pins = isCornwallOrAll
    ? SAMPLE_WALKS.filter((w) => walkCoords[w.postcode]).map((w) => ({ ...walkCoords[w.postcode], title: w.name, area: w.area }))
    : [];

  const Fallback = ({ msg }) => (
    <div style={{ height: 400, borderRadius: 20, background: 'linear-gradient(160deg, #E8F5E4 0%, #EEF7FF 100%)', border: '1px solid #DEE8F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 32, marginBottom: 4 }}>📍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{msg}</div>
      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', maxWidth: 280, lineHeight: 1.6 }}>Explore walks, coastal paths and local activities by location.</div>
      <button className="btn btn-gold btn-sm" onClick={() => onNavigate('walks', localCounty || null)} style={{ marginTop: 4 }}>
        Explore walks map <IArrow s={12} />
      </button>
    </div>
  );

  if (loadError) return <Fallback msg="Map unavailable" />;
  if (!isLoaded || geoLoading) return (
    <div style={{ height: 400, borderRadius: 20, background: '#F0F5FB', border: '1px solid #DEE8F4', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', color: 'rgba(26,39,68,0.5)', fontSize: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
        {geoLoading ? 'Locating walks…' : 'Loading map…'}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,39,68,0.10)', border: '1px solid #EEF1F7' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={center}
          zoom={zoom}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: true, gestureHandling: 'cooperative' }}
        >
          {pins.map((pin, i) => (
            <MarkerF
              key={i}
              position={{ lat: pin.lat, lng: pin.lng }}
              title={`${pin.title} · ${pin.area}`}
              label={{ text: 'W', color: 'white', fontWeight: '800', fontSize: '11px' }}
              onClick={() => onNavigate('walks', localCounty || null)}
            />
          ))}
        </GoogleMap>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(26,39,68,0.48)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        {isCornwallOrAll
          ? <span>{pins.length} Cornwall walk locations shown · <em>Resource locations added as listings are mapped</em></span>
          : <span>Walk data for {COUNTY_LABELS[localCounty]} being added · Cornwall shown by default</span>}
        <button onClick={() => onNavigate('walks', localCounty || 'cornwall')} style={{ fontSize: 12, fontWeight: 700, color: '#5BC94A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Open full walks map →
        </button>
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const ActivitiesPage = ({ onNavigate, session, county }) => {
  // county prop: null on /activities (hub), county slug on /{county}/activities
  const [localCounty,   setLocalCounty]   = React.useState(county || '');
  const [areaSearch,    setAreaSearch]    = React.useState('');
  const [activityType,  setActivityType]  = React.useState('');
  const [accessibility, setAccessibility] = React.useState('');
  const [cost,          setCost]          = React.useState('');
  const [chipHov,       setChipHov]       = React.useState(null);
  const [catHov,        setCatHov]        = React.useState(null);

  // Sync if parent county prop changes (e.g. URL changes via popstate)
  React.useEffect(() => { setLocalCounty(county || ''); }, [county]);

  const countyLabel  = localCounty ? (COUNTY_LABELS[localCounty] || localCounty) : null;
  const isHubView    = !localCounty; // true on /activities, false on /{county}/activities

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  // County selector updates local state only — no URL navigation
  const handleCountyChange = (e) => setLocalCounty(e.target.value);

  const handleChip = (chip) => {
    setActivityType(chip.type);
    setCost(chip.cost);
    setAccessibility(chip.access);
  };

  const chipIsActive = (chip) =>
    activityType === chip.type && cost === chip.cost && accessibility === chip.access;

  // Helper: navigate to walks.
  // county='' or falsy → navigate('walks', null) → /walks (all-county hub)
  // county='cornwall' etc → navigate('walks', 'cornwall') → /cornwall/walks
  const goToWalks = (county) => onNavigate('walks', county || null);

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #EAF5E7 0%, #F2F8FF 55%, #F9FBFF 100%)', paddingTop: 52, paddingBottom: 40, borderBottom: '1px solid rgba(91,201,74,0.10)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'center' }}>

            <div>
              <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 10 }}>Activities</div>
              <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 800, color: '#1A2744', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 12px', textWrap: 'balance' }}>
                {isHubView ? 'Explore activities near you' : `Explore activities in ${countyLabel}`}
              </h1>
              <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65, margin: '0 0 18px', maxWidth: 440 }}>
                Discover walks, groups, days out and wellbeing activities for carers, families and communities.
              </p>

              {/* Showing filter pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: isHubView ? 'rgba(26,39,68,0.06)' : 'rgba(91,201,74,0.12)', border: `1px solid ${isHubView ? 'rgba(26,39,68,0.10)' : 'rgba(91,201,74,0.25)'}`, fontSize: 13, fontWeight: 600, color: isHubView ? 'rgba(26,39,68,0.65)' : '#2D6B1F', marginBottom: 18 }}>
                <span>{isHubView ? 'Showing: All counties' : `Showing: ${countyLabel}`}</span>
                {!isHubView && <button onClick={() => setLocalCounty('')} style={{ fontSize: 11, fontWeight: 700, color: '#5BC94A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ All</button>}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button className="btn btn-gold" onClick={() => document.getElementById('act-map')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: 14 }}>
                  <IPin s={13} /> Explore by map
                </button>
                <button className="btn btn-ghost" onClick={() => onNavigate('find-help')} style={{ fontSize: 14 }}>
                  Suggest an activity
                </button>
              </div>

              {/* Walks CTAs — correctly county-aware */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => goToWalks('')} style={{ fontSize: 13 }}>
                  <IWalks s={13} /> Explore all walks
                </button>
                {localCounty && (
                  <button className="btn btn-ghost btn-sm" onClick={() => goToWalks(localCounty)} style={{ fontSize: 13 }}>
                    Explore {countyLabel} walks <IArrow s={11} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(26,39,68,0.07)' }}>
                {[{ n: '333+', l: 'Walks' }, { n: '6', l: 'Counties' }, { n: '100+', l: 'Places' }, { n: 'Free', l: 'To browse' }].map(({ n, l }, i) => (
                  <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(26,39,68,0.09)' : 'none' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2744', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.48)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured this week — all navigate to walks with correct county */}
            <div className="card" style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.92)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2744' }}>Featured this week</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,39,68,0.40)' }}>{countyLabel || 'All counties'}</span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {HERO_FEATURED.map((item) => (
                  <div key={item.title}
                    onClick={() => goToWalks(localCounty)}
                    style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(26,39,68,0.06)', transition: 'box-shadow .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,39,68,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ height: 34, background: item.grad }} />
                    <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2744', marginBottom: 2 }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: item.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.type}</span>
                          <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.45)' }}>· {item.tag}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: item.accent, fontWeight: 700, flexShrink: 0 }}>View →</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => goToWalks(localCounty)} style={{ width: '100%', marginTop: 10, justifyContent: 'center', fontSize: 12.5 }}>
                See all activities <IArrow s={11} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 14, paddingBottom: 14, position: 'sticky', top: 72, zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            {/* County selector — local state only, no URL change */}
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

      {/* ── Discovery map + nearby cards ─────────────────────────── */}
      <section id="act-map" style={{ paddingTop: 56, paddingBottom: 52, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Explore nearby</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
              {isHubView ? 'Explore activities across all counties' : `Explore activities in ${countyLabel}`}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>

            {/* Real map */}
            <ActivitiesMap localCounty={localCounty} onNavigate={onNavigate} />

            {/* Nearby highlights */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.40)', marginBottom: 12 }}>
                {countyLabel ? `Featured in ${countyLabel}` : 'Featured activities'}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { title: 'Accessible coastal walk', type: 'Walk',     location: 'St Ives',  tags: ['Wheelchair', 'Free'],    accent: '#5BC94A', grad: 'linear-gradient(135deg, #D8F0CC, #C4E8B4)', dest: () => goToWalks(localCounty || 'cornwall') },
                  { title: 'Carer coffee morning',    type: 'Group',    location: 'Truro',    tags: ['All welcome', 'Free'],   accent: '#2D9CDB', grad: 'linear-gradient(135deg, #C8E4F8, #B4D8F4)', dest: () => onNavigate('find-help') },
                  { title: 'Family-friendly day out', type: 'Day Out',  location: 'Falmouth', tags: ['Family', 'Free entry'],  accent: '#F5A623', grad: 'linear-gradient(135deg, #FDE8C4, #FDDCA8)', dest: () => onNavigate('find-help') },
                  { title: 'Wellbeing swim session',  type: 'Wellbeing',location: 'Penzance', tags: ['Low mobility', 'Free'],  accent: '#F4613A', grad: 'linear-gradient(135deg, #FADCD4, #F8C8BC)', dest: () => onNavigate('find-help') },
                ].map((card) => (
                  <div key={card.title} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, borderLeft: `3px solid ${card.accent}` }}>
                    <div style={{ height: 26, background: card.grad }} />
                    <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: card.accent }}>{card.type}</span>
                          <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.40)' }}>· {card.location}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>{card.title}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {card.tags.map((t) => <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: `${card.accent}18`, color: card.accent }}>{t}</span>)}
                        </div>
                      </div>
                      <button onClick={card.dest} style={{ fontSize: 11.5, fontWeight: 700, color: card.accent, background: `${card.accent}14`, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        View →
                      </button>
                    </div>
                  </div>
                ))}
                {/* Native sponsor slot */}
                <div className="card" style={{ padding: '11px 14px', borderRadius: 14, border: '1px dashed rgba(245,166,35,0.35)', background: 'rgba(245,166,35,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,39,68,0.36)', marginBottom: 2 }}>Featured partner slot available</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(26,39,68,0.55)' }}>Your venue or activity here.</div>
                  </div>
                  {/* Sponsor CTA goes to login, NOT to walks */}
                  <button onClick={() => onNavigate('login')} style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Promote →
                  </button>
                </div>
              </div>
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
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 12, border: `1px solid ${hov ? cat.accent : cat.border}`, boxShadow: hov ? '0 16px 40px rgba(26,39,68,0.09)' : '0 3px 10px rgba(26,39,68,0.04)', transition: 'border-color .16s, box-shadow .16s' }}>
                <div style={{ height: 50, background: `linear-gradient(135deg, ${cat.bg.replace('0.08', '0.24')} 0%, ${cat.bg} 100%)`, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={18} />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: cat.accent }}>
                    Live now{countyLabel ? ` — ${countyLabel}` : ' — All counties'}
                  </span>
                </div>
                <div style={{ padding: '18px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1A2744', margin: '0 0 5px' }}>{cat.label}</h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6, margin: 0, maxWidth: 460 }}>{cat.desc}</p>
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
              <div key={cat.key} className="card" style={{ padding: 18, border: `1px solid ${cat.border}`, opacity: 0.76, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: cat.accent }}>Coming soon</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{cat.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.56)', lineHeight: 1.55, margin: 0 }}>{cat.desc}</p>
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
              {/* "Explore all walks" — no hardcoded county */}
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
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.5, marginBottom: 12 }}>Rated trails, coastal paths and accessible routes{countyLabel ? ` across ${countyLabel}` : ''}.</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5BC94A' }}>Explore walks →</div>
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.75, border: '1px solid rgba(45,156,219,0.14)' }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #2D9CDB66, #2D9CDB33)' }} />
              <div style={{ padding: '16px 18px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2D9CDB' }}>Coming soon</span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', margin: '5px 0' }}>Groups</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', lineHeight: 1.5, marginBottom: 12 }}>Social groups, carer circles and peer support activities near you.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.35)' }}>Listings being added</div>
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.75, border: '1px solid rgba(245,166,35,0.14)' }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #F5A62366, #F5A62333)' }} />
              <div style={{ padding: '16px 18px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#F5A623' }}>Coming soon</span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', margin: '5px 0' }}>Days Out</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', lineHeight: 1.5, marginBottom: 12 }}>Gardens, beaches, attractions and family-friendly destinations.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.35)' }}>Listings being added</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner section ──────────────────────────────────────── */}
      <section style={{ paddingTop: 44, paddingBottom: 44, background: '#FFFFFF', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { icon: '🏆', title: 'County sponsorship',       desc: 'Own the headline partner slot for a county and appear across all activity discovery pages.' },
              { icon: '📍', title: 'Featured activity listings', desc: 'Promote events, venues and wellbeing opportunities to carers searching locally.' },
            ].map((c) => (
              <div key={c.title} className="card" style={{ padding: '18px 20px', borderRadius: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>{c.title}</div>
                  <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.55, margin: '0 0 12px' }}>{c.desc}</p>
                  {/* Partner CTAs go to login, NOT to walks */}
                  <button onClick={() => onNavigate('login')} style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer' }}>
                    Find out more →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>Advertise activities, venues or discounts <IArrow s={11} /></button>
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
              {/* Suggest goes to find-help, NOT to walks */}
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
