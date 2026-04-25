// Activities hub — premium multi-county discovery page.
// ACTIVITY_CATEGORIES drives the featured section; add new entries here.
// All filter state is frontend-only — no SQL needed until activity DB rows exist.
// Map section uses a pure SVG illustration — no Google Maps API dependency.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin, IStar, ICheck, IHeart, IShield } = Icons;

// ── Data constants ──────────────────────────────────────────────────────────

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
  { value: 'wellbeing',   label: 'Wellbeing Activities' },
  { value: 'events',      label: 'Events' },
];

const ACCESSIBILITY_OPTIONS = [
  { value: '',              label: 'Any accessibility' },
  { value: 'wheelchair',    label: 'Wheelchair friendly' },
  { value: 'transport',     label: 'Public transport nearby' },
  { value: 'toilets',       label: 'Toilets nearby' },
  { value: 'low-mobility',  label: 'Low mobility friendly' },
  { value: 'dementia',      label: 'Dementia friendly' },
  { value: 'dogs',          label: 'Dog friendly' },
];

const COST_OPTIONS = [
  { value: '',           label: 'Any cost' },
  { value: 'free',       label: 'Free' },
  { value: 'discounted', label: 'Discounted' },
  { value: 'paid',       label: 'Paid' },
];

const ACTIVITY_CATEGORIES = [
  {
    key: 'walks',
    label: 'Walks',
    description: 'Trails, coastal paths and nature routes — rated by distance, difficulty and accessibility.',
    accent: '#5BC94A',
    bg: 'rgba(91,201,74,0.08)',
    border: 'rgba(91,201,74,0.20)',
    status: 'live',
    cta: 'Explore walks',
    Icon: IWalks,
  },
  {
    key: 'groups',
    label: 'Groups',
    description: 'Social groups, carer circles and peer support activities near you.',
    accent: '#2D9CDB',
    bg: 'rgba(45,156,219,0.08)',
    border: 'rgba(45,156,219,0.18)',
    status: 'soon',
    Icon: IGroups,
  },
  {
    key: 'days-out',
    label: 'Days Out',
    description: 'Accessible attractions, gardens, beaches and family-friendly days out.',
    accent: '#F5A623',
    bg: 'rgba(245,166,35,0.08)',
    border: 'rgba(245,166,35,0.18)',
    status: 'soon',
    Icon: ISparkle,
  },
  {
    key: 'attractions',
    label: 'Attractions',
    description: 'Discounted and carer-friendly venues, museums and cultural experiences.',
    accent: '#7B5CF5',
    bg: 'rgba(123,92,245,0.08)',
    border: 'rgba(123,92,245,0.18)',
    status: 'soon',
    Icon: ISparkle,
  },
  {
    key: 'wellbeing',
    label: 'Wellbeing Activities',
    description: 'Yoga, swimming, sport and wellbeing sessions that support carer health.',
    accent: '#F4613A',
    bg: 'rgba(244,97,58,0.08)',
    border: 'rgba(244,97,58,0.18)',
    status: 'soon',
    Icon: IWellbeing,
  },
];

// Chips that apply local filter state — clicking them is useful not decorative
const POPULAR_CHIPS = [
  { label: 'Free activities',           type: '',          cost: 'free',        access: '',            icon: '🆓' },
  { label: 'Accessible places',         type: '',          cost: '',            access: 'low-mobility', icon: '♿' },
  { label: 'Coastal walks',             type: 'walks',     cost: '',            access: '',            icon: '🌊' },
  { label: 'Family-friendly days out',  type: 'days-out',  cost: '',            access: '',            icon: '👨‍👩‍👧' },
  { label: 'Wellbeing sessions',        type: 'wellbeing', cost: '',            access: '',            icon: '🧘' },
  { label: 'Carer discounts',           type: '',          cost: 'discounted',  access: '',            icon: '🏷️' },
];

// Map highlight cards — right panel of map section
const MAP_HIGHLIGHTS = [
  { label: 'Coastal walks',      desc: 'Scenic coastal paths rated for accessibility and distance.', accent: '#5BC94A', Icon: IWalks },
  { label: 'Accessible routes',  desc: 'Flat, easy-access walks suitable for all mobilities.',        accent: '#2D9CDB', Icon: IShield },
  { label: 'Community groups',   desc: 'Local support groups, social walks and shared activities.',   accent: '#7B5CF5', Icon: IGroups },
  { label: 'Days out',           desc: 'Gardens, beaches, attractions and family destinations.',       accent: '#F5A623', Icon: ISparkle },
];

// ── Shared styles ───────────────────────────────────────────────────────────

const selStyle = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #E9EEF5',
  background: '#FAFBFF',
  fontSize: 13.5,
  color: '#1A2744',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  flex: '1 1 148px',
  minWidth: 0,
  appearance: 'auto',
};

// ── SVG map illustration — pure CSS/SVG, no API ─────────────────────────────

const MapIllustration = ({ countyLabel, onNavigate }) => (
  <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 360, background: '#B8D4E8' }}>
    {/* Terrain SVG */}
    <svg
      viewBox="0 0 520 360"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ac-sea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A8C8E0" />
          <stop offset="100%" stopColor="#88B8D8" />
        </linearGradient>
        <linearGradient id="ac-land" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8EDD0" />
          <stop offset="50%" stopColor="#C8E4C0" />
          <stop offset="100%" stopColor="#BCDBAC" />
        </linearGradient>
        <linearGradient id="ac-upland" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C8D8B8" />
          <stop offset="100%" stopColor="#B8CC9C" />
        </linearGradient>
      </defs>

      {/* Sea */}
      <rect width="520" height="360" fill="url(#ac-sea)" />

      {/* Coastline / land */}
      <path
        d="M100 0 L520 0 L520 360 L220 360 L160 330 L100 290 L60 240 L30 180 L20 110 L50 50 Z"
        fill="url(#ac-land)"
      />

      {/* Upland moor areas */}
      <ellipse cx="320" cy="140" rx="70" ry="42" fill="url(#ac-upland)" opacity="0.7" />
      <ellipse cx="430" cy="70" rx="55" ry="30" fill="url(#ac-upland)" opacity="0.5" />

      {/* Forest patches */}
      <circle cx="260" cy="200" r="22" fill="#A8C898" opacity="0.6" />
      <circle cx="380" cy="180" r="18" fill="#B0CC9C" opacity="0.55" />
      <circle cx="460" cy="140" r="14" fill="#A0C090" opacity="0.5" />

      {/* Rivers */}
      <path d="M310 50 Q295 100 310 155 Q325 200 310 250" stroke="#7AAAC8" strokeWidth="3.5" fill="none" opacity="0.65" strokeLinecap="round" />
      <path d="M420 30 Q400 75 415 115" stroke="#7AAAC8" strokeWidth="2.5" fill="none" opacity="0.55" strokeLinecap="round" />

      {/* Main roads */}
      <path d="M120 360 Q200 320 270 250 Q340 180 400 120 Q445 75 520 50" stroke="#F0EAD8" strokeWidth="3.5" fill="none" opacity="0.9" strokeLinecap="round" />
      <path d="M160 220 Q260 208 350 220 Q430 232 500 210" stroke="#F0EAD8" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M200 80 Q280 95 340 130 Q380 155 410 190" stroke="#F0EAD8" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />

      {/* Coastline accent */}
      <path d="M100 0 L50 50 L20 110 L30 180 L60 240 L100 290 L160 330 L220 360" stroke="#5898C0" strokeWidth="2" fill="none" opacity="0.5" />

      {/* Subtle grid */}
      {[1,2,3,4,5].map((i) => (
        <line key={`hg${i}`} x1="0" y1={i * 72} x2="520" y2={i * 72} stroke="white" strokeWidth="0.5" opacity="0.12" />
      ))}
      {[1,2,3,4,5,6,7].map((i) => (
        <line key={`vg${i}`} x1={i * 74} y1="0" x2={i * 74} y2="360" stroke="white" strokeWidth="0.5" opacity="0.12" />
      ))}

      {/* Town dot markers */}
      {[[180,270],[300,210],[390,155],[270,105],[450,100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="white" opacity="0.75" />
      ))}
    </svg>

    {/* Animated pins */}
    {[
      { top: '28%', left: '52%', color: '#5BC94A', label: 'Coastal walk' },
      { top: '48%', left: '36%', color: '#F5A623', label: 'Day out' },
      { top: '38%', left: '72%', color: '#2D9CDB', label: 'Group activity' },
      { top: '62%', left: '60%', color: '#F4613A', label: 'Wellbeing' },
      { top: '22%', left: '82%', color: '#7B5CF5', label: 'Attraction' },
    ].map((pin, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: pin.top,
          left: pin.left,
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: pin.color,
          boxShadow: `0 4px 12px ${pin.color}66`,
          border: '2px solid white',
          flexShrink: 0,
        }} />
        <div style={{
          marginTop: 2,
          background: 'rgba(26,39,68,0.82)',
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}>
          {pin.label}
        </div>
      </div>
    ))}

    {/* County label overlay */}
    <div style={{
      position: 'absolute',
      top: 16,
      left: 16,
      padding: '6px 12px',
      borderRadius: 8,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(8px)',
      fontSize: 12,
      fontWeight: 700,
      color: '#1A2744',
    }}>
      {countyLabel}
    </div>

    {/* Map preview badge */}
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      padding: '4px 10px',
      borderRadius: 6,
      background: 'rgba(26,39,68,0.55)',
      backdropFilter: 'blur(6px)',
      fontSize: 11,
      fontWeight: 600,
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: '0.04em',
    }}>
      Map preview
    </div>

    {/* Open walks map CTA */}
    <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
      <button
        className="btn btn-gold btn-sm"
        onClick={() => onNavigate('walks')}
        style={{ fontSize: 12.5, boxShadow: '0 4px 16px rgba(245,166,35,0.4)' }}
      >
        Open walks map <IArrow s={12} />
      </button>
    </div>
  </div>
);

// ── Component ───────────────────────────────────────────────────────────────

const ActivitiesPage = ({ onNavigate, session, county }) => {
  const activeCounty = county || 'cornwall';
  const countyLabel  = COUNTY_LABELS[activeCounty] || 'your area';

  const [areaSearch,    setAreaSearch]    = React.useState('');
  const [activityType,  setActivityType]  = React.useState('');
  const [accessibility, setAccessibility] = React.useState('');
  const [cost,          setCost]          = React.useState('');
  const [hovered,       setHovered]       = React.useState(null);
  const [chipHov,       setChipHov]       = React.useState(null);

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  const handleCountyChange = (e) => {
    const next = e.target.value || 'cornwall';
    onNavigate('activities', next);
  };

  const handleChip = (chip) => {
    if (chip.type  !== undefined) setActivityType(chip.type);
    if (chip.cost  !== undefined) setCost(chip.cost);
    if (chip.access !== undefined) setAccessibility(chip.access);
    // Scroll filter bar into view so user can see applied filters
    document.getElementById('act-filter-bar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const isChipActive = (chip) =>
    (chip.type   === '' || activityType  === chip.type) &&
    (chip.cost   === '' || cost          === chip.cost) &&
    (chip.access === '' || accessibility === chip.access);

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Premium Hero ──────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #E8F5E4 0%, #F0F7FF 55%, #F8FBFF 100%)',
        paddingTop: 80,
        paddingBottom: 60,
      }}>
        {/* Decorative background blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '40%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 14 }}>Activities near you</div>

          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 800, color: '#1A2744',
            letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0, textWrap: 'balance',
            maxWidth: 720,
          }}>
            Find activities, walks and days out near you
          </h1>

          <p style={{ marginTop: 18, fontSize: 17.5, color: 'rgba(26,39,68,0.70)', lineHeight: 1.68, maxWidth: 560, fontWeight: 500 }}>
            Discover walks, groups, days out, attractions and wellbeing activities for carers, families and communities.
          </p>

          <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.45)', fontWeight: 500 }}>
            Showing {countyLabel} first — change county anytime.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
            <button
              className="btn btn-gold"
              onClick={() => document.getElementById('act-map-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontSize: 14.5, padding: '12px 22px' }}
            >
              <IPin s={14} style={{ marginRight: 4 }} /> Explore by map
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => onNavigate('find-help')}
              style={{ fontSize: 14.5 }}
            >
              Suggest an activity
            </button>
          </div>

          {/* Trust / stat counters */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(26,39,68,0.08)' }}>
            {[
              { num: '333+', label: 'Walks mapped' },
              { num: '6',    label: 'Counties covered' },
              { num: '100+', label: 'Carer-friendly places' },
              { num: 'Weekly', label: 'New activities added' },
            ].map(({ num, label }, i) => (
              <div key={label} style={{ paddingRight: 28, paddingLeft: i === 0 ? 0 : 28, borderLeft: i > 0 ? '1px solid rgba(26,39,68,0.10)' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2744', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.52)', fontWeight: 600, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter panel ──────────────────────────────────────── */}
      <section id="act-filter-bar" style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 16, paddingBottom: 16, position: 'sticky', top: 72, zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>

            <select
              value={activeCounty}
              onChange={handleCountyChange}
              style={{ ...selStyle, fontWeight: 700, flex: '1 1 138px' }}
              aria-label="Select county"
            >
              {COUNTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
              <input
                type="text"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="Town or area…"
                style={{ ...selStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 33 }}
              />
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
                <ISearch s={13} />
              </span>
            </div>

            <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={selStyle} aria-label="Activity type">
              {ACTIVITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={accessibility} onChange={(e) => setAccessibility(e.target.value)} style={selStyle} aria-label="Accessibility">
              {ACCESSIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={cost} onChange={(e) => setCost(e.target.value)} style={selStyle} aria-label="Cost">
              {COST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

          </div>
        </div>
      </section>

      {/* ── Map section ───────────────────────────────────────── */}
      <section id="act-map-section" style={{ paddingTop: 64, paddingBottom: 48, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Location discovery</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#1A2744', margin: '0 0 8px' }}>
              Explore activities by location
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.62)', margin: 0, maxWidth: 540, lineHeight: 1.6 }}>
              Find walks, groups, venues and wellbeing activities across {countyLabel}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
            {/* Map illustration — left column */}
            <div style={{ gridColumn: 'span 1' }}>
              <MapIllustration countyLabel={countyLabel} onNavigate={onNavigate} />
            </div>

            {/* Highlights panel — right column */}
            <div style={{ display: 'grid', gap: 12 }}>
              {MAP_HIGHLIGHTS.map((h) => (
                <div
                  key={h.label}
                  className="card"
                  style={{ padding: '16px 18px', borderRadius: 16, display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'box-shadow .15s' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${h.accent}18`, display: 'grid', placeItems: 'center', color: h.accent, flexShrink: 0 }}>
                    <h.Icon s={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744', marginBottom: 3 }}>{h.label}</div>
                    <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.55 }}>{h.desc}</div>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-gold"
                onClick={() => onNavigate('walks')}
                style={{ marginTop: 4 }}
              >
                Open full walks map <IArrow s={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular ways to explore ───────────────────────────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Quick filters</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
              Popular ways to explore
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {POPULAR_CHIPS.map((chip) => {
              const active = isChipActive(chip);
              const isHov  = chipHov === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip)}
                  onMouseEnter={() => setChipHov(chip.label)}
                  onMouseLeave={() => setChipHov(null)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: active ? '1.5px solid #F5A623' : '1px solid #E9EEF5',
                    background: active ? 'rgba(245,166,35,0.08)' : isHov ? 'rgba(26,39,68,0.03)' : '#FAFBFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .15s',
                    boxShadow: active ? '0 4px 16px rgba(245,166,35,0.12)' : '0 2px 8px rgba(26,39,68,0.04)',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{chip.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? '#B45309' : '#1A2744', lineHeight: 1.3 }}>{chip.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured activity categories ──────────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 20 }}>
        <div className="container">
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Activity categories</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
              Featured activity categories
            </h2>
          </div>

          {/* Live category cards */}
          {liveCategories.map((cat) => {
            const isHov = hovered === cat.key;
            return (
              <div
                key={cat.key}
                className="card"
                onClick={() => onNavigate(cat.key)}
                onMouseEnter={() => setHovered(cat.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 16,
                  border: `1px solid ${isHov ? cat.accent : cat.border}`,
                  boxShadow: isHov ? '0 20px 48px rgba(26,39,68,0.10)' : '0 4px 16px rgba(26,39,68,0.05)',
                  transition: 'border-color .18s, box-shadow .18s',
                }}
              >
                <div style={{ height: 5, background: `linear-gradient(90deg, ${cat.accent}, ${cat.accent}88)` }} />
                <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent, flexShrink: 0 }}>
                        <cat.Icon s={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.accent }}>Live now</span>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1A2744', margin: 0, lineHeight: 1.1 }}>{cat.label}</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.7)', lineHeight: 1.65, margin: 0, maxWidth: 500 }}>{cat.description}</p>
                  </div>
                  <button
                    className="btn btn-gold"
                    onClick={(e) => { e.stopPropagation(); onNavigate(cat.key); }}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {cat.cta} <IArrow s={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Coming soon grid */}
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,39,68,0.36)', marginBottom: 14, marginTop: 8 }}>
            Coming next
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {soonCategories.map((cat) => (
              <div
                key={cat.key}
                className="card"
                style={{ padding: 22, border: `1px solid ${cat.border}`, opacity: 0.80, cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: cat.accent }}>Coming soon</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', lineHeight: 1.2 }}>{cat.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.60)', lineHeight: 1.6, margin: 0 }}>{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse activities — future-ready empty state ───────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: 'linear-gradient(180deg, #FAFBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: '#1A2744', marginBottom: 16 }}>
            Browse activities
          </h2>
          <div className="card" style={{ padding: '36px 32px', borderRadius: 24, textAlign: 'center', border: '1px dashed rgba(26,39,68,0.12)', background: 'rgba(248,250,255,0.85)' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>🗺️</div>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.66)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 22px', fontWeight: 500 }}>
              More activity listings are being added. Start with walks, or suggest an activity for your area.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => onNavigate('walks')}>
                Explore walks <IArrow s={14} />
              </button>
              <button className="btn btn-ghost" onClick={() => onNavigate('find-help')}>
                Suggest an activity
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sponsored county banner ────────────────────────────── */}
      <section style={{
        paddingTop: 56, paddingBottom: 56,
        background: 'linear-gradient(135deg, #0F1F3D 0%, #1A3A5C 50%, #1E4570 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
                Sponsorship opportunity
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 14px', textWrap: 'balance' }}>
                Reach carers and families in {countyLabel}
              </h2>
              <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: '0 0 22px', maxWidth: 460 }}>
                Promote your venue, activity, discount or community offer to people actively looking for local support.
              </p>
              {/* Sponsor badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {['Featured placement', 'County sponsor', 'Map visibility'].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      background: 'rgba(245,166,35,0.20)',
                      border: '1px solid rgba(245,166,35,0.35)',
                      color: '#FFD980',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    ✓ {badge}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-gold"
                  onClick={() => onNavigate('login')}
                  style={{ fontSize: 14 }}
                >
                  Sponsor this county
                </button>
                <button
                  onClick={() => onNavigate('find-help')}
                  style={{ padding: '11px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background .15s' }}
                >
                  Add your activity
                </button>
              </div>
            </div>
            {/* Sponsor stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { num: '10k+', label: 'Monthly page views' },
                { num: '333+', label: 'Active walks listed' },
                { num: '6',    label: 'Counties expanding' },
                { num: 'Free', label: 'Claim your listing' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  style={{
                    padding: '18px 16px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#FFD980', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 5 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Advertising inventory ──────────────────────────────── */}
      <section style={{ paddingTop: 64, paddingBottom: 64, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Partnerships</div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
                Built for local discovery — ready for partners
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                className="btn btn-gold"
                onClick={() => onNavigate('login')}
                style={{ fontSize: 14 }}
              >
                Discuss partnership options <IArrow s={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                icon: '🏆',
                title: 'County sponsorship',
                desc: 'Own the headline partner slot for a county and appear across all activity discovery pages.',
                badge: 'Premium',
                badgeColor: '#F5A623',
                badgeBg: 'rgba(245,166,35,0.12)',
              },
              {
                icon: '📍',
                title: 'Featured activity listings',
                desc: 'Promote events, venues, days out and wellbeing opportunities to carers and families searching locally.',
                badge: 'Popular',
                badgeColor: '#5BC94A',
                badgeBg: 'rgba(91,201,74,0.10)',
              },
              {
                icon: '🗺️',
                title: 'Boosted map visibility',
                desc: 'Stand out when people search by area, activity type or accessibility need. Pin your venue on the discovery map.',
                badge: 'Coming soon',
                badgeColor: '#7B5CF5',
                badgeBg: 'rgba(123,92,245,0.10)',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="card"
                style={{ padding: 26, borderRadius: 20, position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744' }}>{card.title}</div>
                  <span style={{ padding: '3px 9px', borderRadius: 999, background: card.badgeBg, color: card.badgeColor, fontSize: 11, fontWeight: 700 }}>{card.badge}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.6, margin: '0 0 18px' }}>{card.desc}</p>
                <button
                  onClick={() => onNavigate('login')}
                  style={{ fontSize: 12.5, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.22)', cursor: 'pointer', transition: 'background .15s' }}
                >
                  Find out more →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commercial CTA ────────────────────────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 56, background: 'linear-gradient(135deg, #1A2744 0%, #22466E 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.60)', marginBottom: 14 }}>For businesses &amp; organisations</div>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 auto 14px', maxWidth: 580, textWrap: 'balance' }}>
            Promote an activity or venue to carers
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 28px', fontWeight: 500 }}>
            Businesses, charities and community groups can feature activities, days out and wellbeing opportunities for carers in their county.
          </p>
          <button
            className="btn btn-gold"
            onClick={() => onNavigate('login')}
            style={{ fontSize: 15, padding: '13px 26px' }}
          >
            Feature your activity <IArrow s={14} />
          </button>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 72, background: '#FAFBFF' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: '0 0 10px' }}>
                Know an activity carers would love?
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.64)', lineHeight: 1.65, margin: 0 }}>
                Help carers in {countyLabel} discover local activities, groups and days out.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => onNavigate('find-help')}>
                Suggest an activity
              </button>
              <button className="btn btn-ghost" onClick={() => onNavigate('find-help')}>
                Claim your organisation
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ActivitiesPage;
