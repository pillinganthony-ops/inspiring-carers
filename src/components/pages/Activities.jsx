// Activities hub — premium multi-county discovery marketplace.
// Map: reuses @react-google-maps/api (already in project) with static pins.
//       Uses id 'ic-activity-map' to share the already-loaded Maps script.
//       No new env vars. Falls back gracefully if API unavailable.
// All filter state is frontend-only — no SQL until activity DB rows exist.

import React from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin } = Icons;

// Stable reference — must not recreate on each render (useJsApiLoader warning)
const ACT_MAP_LIBS = [];

// ── Data ────────────────────────────────────────────────────────────────────

const COUNTY_LABELS = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  dorset:    'Dorset',
  somerset:  'Somerset',
  bristol:   'Bristol',
  wiltshire: 'Wiltshire',
};

const COUNTY_OPTIONS = [
  { value: 'cornwall',  label: 'Cornwall' },
  { value: 'devon',     label: 'Devon' },
  { value: 'somerset',  label: 'Somerset' },
  { value: 'bristol',   label: 'Bristol' },
  { value: 'dorset',    label: 'Dorset' },
  { value: 'wiltshire', label: 'Wiltshire' },
  { value: '',          label: 'All counties' },
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
  { value: '',              label: 'Any accessibility' },
  { value: 'wheelchair',    label: 'Wheelchair friendly' },
  { value: 'transport',     label: 'Public transport' },
  { value: 'low-mobility',  label: 'Low mobility' },
  { value: 'dementia',      label: 'Dementia friendly' },
  { value: 'dogs',          label: 'Dog friendly' },
];

const COST_OPTIONS = [
  { value: '',           label: 'Any cost' },
  { value: 'free',       label: 'Free' },
  { value: 'discounted', label: 'Discounted' },
  { value: 'paid',       label: 'Paid' },
];

// Map centres and sample activity pins per county
const COUNTY_MAP = {
  cornwall: {
    center: { lat: 50.35, lng: -4.80 },
    zoom: 9,
    pins: [
      { lat: 50.26, lng: -5.05, title: 'Coastal Walk · Truro',    label: 'W', color: '#5BC94A' },
      { lat: 50.41, lng: -5.08, title: 'Carer Group · Newquay',  label: 'G', color: '#2D9CDB' },
      { lat: 50.15, lng: -5.07, title: 'Day Out · Falmouth',      label: 'D', color: '#F5A623' },
      { lat: 50.12, lng: -5.53, title: 'Wellbeing · Penzance',    label: 'W', color: '#F4613A' },
      { lat: 50.34, lng: -4.79, title: 'Attraction · St Austell', label: 'A', color: '#7B5CF5' },
    ],
  },
  devon: {
    center: { lat: 50.72, lng: -3.80 },
    zoom: 9,
    pins: [
      { lat: 50.72, lng: -3.53, title: 'Walk · Exeter',          label: 'W', color: '#5BC94A' },
      { lat: 50.37, lng: -4.14, title: 'Group · Plymouth',       label: 'G', color: '#2D9CDB' },
      { lat: 50.46, lng: -3.52, title: 'Day Out · Torquay',      label: 'D', color: '#F5A623' },
      { lat: 51.08, lng: -4.06, title: 'Wellbeing · Barnstaple', label: 'W', color: '#F4613A' },
      { lat: 50.59, lng: -3.74, title: 'Walk · Dartmoor',        label: 'W', color: '#5BC94A' },
    ],
  },
  somerset: {
    center: { lat: 51.10, lng: -2.95 },
    zoom: 9,
    pins: [
      { lat: 51.10, lng: -2.95, title: 'Walk · Somerset Levels', label: 'W', color: '#5BC94A' },
      { lat: 51.07, lng: -3.08, title: 'Group · Taunton',        label: 'G', color: '#2D9CDB' },
      { lat: 51.20, lng: -2.64, title: 'Day Out · Bath area',    label: 'D', color: '#F5A623' },
    ],
  },
  bristol: {
    center: { lat: 51.45, lng: -2.60 },
    zoom: 10,
    pins: [
      { lat: 51.45, lng: -2.60, title: 'Walk · Bristol',         label: 'W', color: '#5BC94A' },
      { lat: 51.47, lng: -2.63, title: 'Group · Bristol',        label: 'G', color: '#2D9CDB' },
      { lat: 51.43, lng: -2.56, title: 'Day Out · Bristol',      label: 'D', color: '#F5A623' },
    ],
  },
  dorset: {
    center: { lat: 50.75, lng: -2.35 },
    zoom: 9,
    pins: [
      { lat: 50.72, lng: -1.88, title: 'Walk · Bournemouth',     label: 'W', color: '#5BC94A' },
      { lat: 50.75, lng: -2.45, title: 'Group · Dorchester',     label: 'G', color: '#2D9CDB' },
      { lat: 50.64, lng: -2.09, title: 'Day Out · Swanage',      label: 'D', color: '#F5A623' },
    ],
  },
  wiltshire: {
    center: { lat: 51.35, lng: -1.99 },
    zoom: 9,
    pins: [
      { lat: 51.35, lng: -1.80, title: 'Walk · Marlborough Downs', label: 'W', color: '#5BC94A' },
      { lat: 51.07, lng: -1.79, title: 'Group · Salisbury',        label: 'G', color: '#2D9CDB' },
      { lat: 51.56, lng: -2.05, title: 'Day Out · Avebury',        label: 'D', color: '#F5A623' },
    ],
  },
};

const ACTIVITY_CATEGORIES = [
  { key: 'walks',       label: 'Walks',              status: 'live', cta: 'Explore walks',
    desc: 'Trails, coastal paths and nature routes rated by difficulty and accessibility.',
    accent: '#5BC94A', bg: 'rgba(91,201,74,0.08)', border: 'rgba(91,201,74,0.18)', Icon: IWalks },
  { key: 'groups',      label: 'Groups',             status: 'soon',
    desc: 'Social groups, carer circles and peer support activities near you.',
    accent: '#2D9CDB', bg: 'rgba(45,156,219,0.08)', border: 'rgba(45,156,219,0.16)', Icon: IGroups },
  { key: 'days-out',    label: 'Days Out',           status: 'soon',
    desc: 'Gardens, beaches, attractions and family-friendly destinations.',
    accent: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.16)', Icon: ISparkle },
  { key: 'attractions', label: 'Attractions',        status: 'soon',
    desc: 'Discounted and carer-friendly venues, museums and cultural experiences.',
    accent: '#7B5CF5', bg: 'rgba(123,92,245,0.08)', border: 'rgba(123,92,245,0.14)', Icon: ISparkle },
  { key: 'wellbeing',   label: 'Wellbeing',          status: 'soon',
    desc: 'Yoga, swimming, sport and wellbeing sessions supporting carer health.',
    accent: '#F4613A', bg: 'rgba(244,97,58,0.08)', border: 'rgba(244,97,58,0.14)', Icon: IWellbeing },
];

const FEATURED_NEAR = [
  { title: 'Accessible coastal walk',  type: 'Walk',      location: 'St Ives',  tags: ['Wheelchair friendly', 'Free'],   accent: '#5BC94A', grad: 'linear-gradient(135deg, #D8F0CC 0%, #C4E8B4 100%)' },
  { title: 'Carer coffee morning',     type: 'Group',     location: 'Truro',    tags: ['All welcome', 'Free'],           accent: '#2D9CDB', grad: 'linear-gradient(135deg, #C8E4F8 0%, #B4D8F4 100%)' },
  { title: 'Family-friendly day out',  type: 'Day Out',   location: 'Falmouth', tags: ['Family', 'Free entry'],          accent: '#F5A623', grad: 'linear-gradient(135deg, #FDE8C4 0%, #FDDCA8 100%)' },
  { title: 'Wellbeing swim session',   type: 'Wellbeing', location: 'Penzance', tags: ['Low mobility', 'Free'],          accent: '#F4613A', grad: 'linear-gradient(135deg, #FADCD4 0%, #F8C8BC 100%)' },
];

const POPULAR_CHIPS = [
  { label: 'Free activities',    sub: 'No cost',       icon: '🆓', type: '',          cost: 'free',       access: '' },
  { label: 'Accessible places',  sub: 'Easy access',   icon: '♿', type: '',          cost: '',           access: 'low-mobility' },
  { label: 'Coastal walks',      sub: 'Scenic routes', icon: '🌊', type: 'walks',     cost: '',           access: '' },
  { label: 'Family days out',    sub: 'All ages',      icon: '👨‍👩‍👧', type: 'days-out',  cost: '',           access: '' },
  { label: 'Wellbeing sessions', sub: 'Mind & body',   icon: '🧘', type: 'wellbeing', cost: '',           access: '' },
  { label: 'Carer discounts',    sub: 'Save money',    icon: '🏷️', type: '',          cost: 'discounted', access: '' },
];

// Hero "Featured this week" cards — county-agnostic highlights
const HERO_FEATURED = [
  { title: 'Porthcurno coastal walk', type: 'Walk',   tag: 'Free · 3.2 miles',   grad: 'linear-gradient(135deg, #D4F0C8 0%, #B8E4A4 100%)', accent: '#3DA832' },
  { title: 'Carer coffee morning',    type: 'Group',  tag: 'Free · Weekly',       grad: 'linear-gradient(135deg, #C8E4F8 0%, #A8D4F0 100%)', accent: '#1c78b5' },
  { title: 'Eden Project carers day', type: 'Day Out',tag: 'Discounted · Booking', grad: 'linear-gradient(135deg, #FDE8C4 0%, #F8D4A0 100%)', accent: '#B45309' },
];

// ── Shared style ─────────────────────────────────────────────────────────────

const iStyle = {
  padding: '10px 14px', borderRadius: 12, border: '1px solid #E9EEF5',
  background: '#FAFBFF', fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', flex: '1 1 140px', minWidth: 0,
  cursor: 'pointer', appearance: 'auto',
};

// ── Activities map component ─────────────────────────────────────────────────

const ActivitiesMap = ({ county, onNavigate }) => {
  const countyData = COUNTY_MAP[county] || COUNTY_MAP.cornwall;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'ic-activity-map',
    googleMapsApiKey: apiKey || '',
    libraries: ACT_MAP_LIBS,
  });

  // Premium fallback — used if API key missing or network error
  const Fallback = ({ message }) => (
    <div style={{
      height: 400, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(160deg, #E8F5E4 0%, #EEF7FF 100%)',
      border: '1px solid #DEE8F4', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 32,
    }}>
      <div style={{ fontSize: 32, marginBottom: 4 }}>📍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{message}</div>
      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', maxWidth: 280, lineHeight: 1.6 }}>
        Explore walks, coastal paths and local activities by location.
      </div>
      <button className="btn btn-gold btn-sm" onClick={() => onNavigate('walks')} style={{ marginTop: 4 }}>
        Open walks map <IArrow s={12} />
      </button>
    </div>
  );

  if (loadError) return <Fallback message="Map unavailable — open walks map" />;

  if (!isLoaded) return (
    <div style={{ height: 400, borderRadius: 20, background: '#F0F5FB', border: '1px solid #DEE8F4', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', color: 'rgba(26,39,68,0.5)', fontSize: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
        Loading map…
      </div>
    </div>
  );

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,39,68,0.10)', border: '1px solid #EEF1F7' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={countyData.center}
        zoom={countyData.zoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
        }}
      >
        {countyData.pins.map((pin, i) => (
          <MarkerF
            key={i}
            position={{ lat: pin.lat, lng: pin.lng }}
            title={pin.title}
            label={{
              text: pin.label,
              color: 'white',
              fontWeight: '800',
              fontSize: '11px',
            }}
            onClick={() => onNavigate('walks')}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const ActivitiesPage = ({ onNavigate, session, county }) => {
  const activeCounty = county || 'cornwall';
  const countyLabel  = COUNTY_LABELS[activeCounty] || 'your area';

  const [areaSearch,    setAreaSearch]    = React.useState('');
  const [activityType,  setActivityType]  = React.useState('');
  const [accessibility, setAccessibility] = React.useState('');
  const [cost,          setCost]          = React.useState('');
  const [chipHov,       setChipHov]       = React.useState(null);
  const [catHov,        setCatHov]        = React.useState(null);

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  const handleCountyChange = (e) => onNavigate('activities', e.target.value || 'cornwall');

  const handleChip = (chip) => {
    setActivityType(chip.type);
    setCost(chip.cost);
    setAccessibility(chip.access);
  };

  const chipIsActive = (chip) =>
    activityType === chip.type && cost === chip.cost && accessibility === chip.access;

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #EAF5E7 0%, #F2F8FF 55%, #F9FBFF 100%)',
        paddingTop: 52, paddingBottom: 40,
        borderBottom: '1px solid rgba(91,201,74,0.10)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'center' }}>

            {/* Left — headline + CTAs + stats */}
            <div>
              <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 10 }}>Activities near you</div>
              <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 800, color: '#1A2744', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 12px', textWrap: 'balance' }}>
                Find activities, walks and days out near you
              </h1>
              <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65, margin: '0 0 18px', maxWidth: 440 }}>
                Discover walks, groups, days out and wellbeing activities for carers, families and communities.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button className="btn btn-gold" onClick={() => document.getElementById('act-map')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: 14 }}>
                  <IPin s={13} /> Explore by map
                </button>
                <button className="btn btn-ghost" onClick={() => onNavigate('find-help')} style={{ fontSize: 14 }}>
                  Suggest an activity
                </button>
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

            {/* Right — featured this week card */}
            <div className="card" style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.92)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2744' }}>Featured this week</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,39,68,0.40)' }}>{countyLabel}</span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {HERO_FEATURED.map((item) => (
                  <div
                    key={item.title}
                    onClick={() => onNavigate('walks')}
                    style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(26,39,68,0.06)', transition: 'box-shadow .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,39,68,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ height: 36, background: item.grad }} />
                    <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2744', marginBottom: 2 }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: item.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.type}</span>
                          <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.45)' }}>· {item.tag}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: item.accent, fontWeight: 700, flexShrink: 0 }}>View →</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('walks')} style={{ width: '100%', marginTop: 10, justifyContent: 'center', fontSize: 12.5 }}>
                See all activities <IArrow s={11} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 14, paddingBottom: 14, position: 'sticky', top: 72, zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            <select value={activeCounty} onChange={handleCountyChange} style={{ ...iStyle, fontWeight: 700, flex: '1 1 130px' }}>
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

      {/* ── Discovery: map + featured nearby ────────────────────── */}
      <section id="act-map" style={{ paddingTop: 56, paddingBottom: 52, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Explore nearby</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Explore what's nearby</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>

            {/* Real Google Map */}
            <div>
              <ActivitiesMap county={activeCounty} onNavigate={onNavigate} />
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'W · Walks',       color: '#5BC94A' },
                  { label: 'G · Groups',      color: '#2D9CDB' },
                  { label: 'D · Days Out',    color: '#F5A623' },
                  { label: 'W · Wellbeing',   color: '#F4613A' },
                  { label: 'A · Attractions', color: '#7B5CF5' },
                ].map((k) => (
                  <span key={k.label} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,39,68,0.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.color, display: 'inline-block' }} />
                    {k.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured near you */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.40)', marginBottom: 12 }}>Featured near you</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {FEATURED_NEAR.map((card) => (
                  <div key={card.title} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, borderLeft: `3px solid ${card.accent}` }}>
                    <div style={{ height: 28, background: card.grad }} />
                    <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: card.accent }}>{card.type}</span>
                          <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.40)' }}>· {card.location}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>{card.title}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {card.tags.map((t) => (
                            <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: `${card.accent}18`, color: card.accent }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => onNavigate('walks')} style={{ fontSize: 11.5, fontWeight: 700, color: card.accent, background: `${card.accent}14`, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        View →
                      </button>
                    </div>
                  </div>
                ))}
                {/* Single native sponsor slot */}
                <div className="card" style={{ padding: '11px 14px', borderRadius: 14, border: '1px dashed rgba(245,166,35,0.35)', background: 'rgba(245,166,35,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,39,68,0.36)', marginBottom: 2 }}>Featured partner slot available</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(26,39,68,0.55)' }}>Your venue or activity here.</div>
                  </div>
                  <button onClick={() => onNavigate('login')} style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Promote →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Popular ways to explore ──────────────────────────────── */}
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

      {/* ── Featured categories ─────────────────────────────────── */}
      <section style={{ paddingTop: 52, paddingBottom: 20, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Activity categories</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Featured activity categories</h2>
          </div>
          {liveCategories.map((cat) => {
            const hov = catHov === cat.key;
            return (
              <div key={cat.key} className="card" onClick={() => onNavigate(cat.key)} onMouseEnter={() => setCatHov(cat.key)} onMouseLeave={() => setCatHov(null)}
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 12, border: `1px solid ${hov ? cat.accent : cat.border}`, boxShadow: hov ? '0 16px 40px rgba(26,39,68,0.09)' : '0 3px 10px rgba(26,39,68,0.04)', transition: 'border-color .16s, box-shadow .16s' }}>
                <div style={{ height: 50, background: `linear-gradient(135deg, ${cat.bg.replace('0.08', '0.24')} 0%, ${cat.bg} 100%)`, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={18} />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: cat.accent }}>Live now — {countyLabel}</span>
                </div>
                <div style={{ padding: '18px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1A2744', margin: '0 0 5px' }}>{cat.label}</h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6, margin: 0, maxWidth: 460 }}>{cat.desc}</p>
                  </div>
                  <button className="btn btn-gold" onClick={(e) => { e.stopPropagation(); onNavigate(cat.key); }} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
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

      {/* ── Activity listings growing ────────────────────────────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Activity listings</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Activity listings are growing</h2>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button className="btn btn-gold btn-sm" onClick={() => onNavigate('walks')}>Explore walks <IArrow s={11} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('find-help')}>Suggest an activity</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {/* Walks live */}
            <div className="card" onClick={() => onNavigate('walks')} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(91,201,74,0.20)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,201,74,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #5BC94A, #3DA832)' }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5BC94A' }}>Live now</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0D7A55', background: 'rgba(16,185,129,0.10)', padding: '2px 8px', borderRadius: 6 }}>333+ routes</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>Walks</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.5, marginBottom: 12 }}>Rated trails, coastal paths and accessible routes across {countyLabel}.</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5BC94A' }}>Explore walks →</div>
              </div>
            </div>
            {/* Groups soon */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.75, border: '1px solid rgba(45,156,219,0.14)' }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #2D9CDB66, #2D9CDB33)' }} />
              <div style={{ padding: '16px 18px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2D9CDB' }}>Coming soon</span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', margin: '5px 0', }}>Groups</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', lineHeight: 1.5, marginBottom: 12 }}>Social groups, carer circles and peer support activities near you.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.35)' }}>Listings being added</div>
              </div>
            </div>
            {/* Days Out soon */}
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

      {/* ── Single partner section ──────────────────────────────── */}
      <section style={{ paddingTop: 44, paddingBottom: 44, background: '#FFFFFF', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { icon: '🏆', title: 'County sponsorship',       desc: 'Own the headline partner slot for a county and appear across all activity pages.', badge: 'Premium' },
              { icon: '📍', title: 'Featured activity listings', desc: 'Promote events, venues and wellbeing opportunities to carers searching nearby.',    badge: 'Popular' },
            ].map((c) => (
              <div key={c.title} className="card" style={{ padding: '18px 20px', borderRadius: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744' }}>{c.title}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(245,166,35,0.12)', color: '#B45309' }}>{c.badge}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.55, margin: '0 0 12px' }}>{c.desc}</p>
                  <button onClick={() => onNavigate('login')} style={{ fontSize: 12, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer' }}>
                    Find out more →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>Advertise activities, venues or discounts <IArrow s={11} /></button>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────── */}
      <section style={{ paddingTop: 40, paddingBottom: 56, background: '#F8FBFF', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 23px)', fontWeight: 800, color: '#1A2744', margin: '0 0 8px' }}>Know an activity carers would love?</h2>
              <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.6, margin: 0 }}>Help carers in {countyLabel} discover local activities, groups and days out.</p>
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
