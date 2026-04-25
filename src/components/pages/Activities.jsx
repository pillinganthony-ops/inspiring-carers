// Activities hub — premium multi-county discovery marketplace.
// Map: CSS tile-style placeholder (no API, no crash risk).
// All filter state is frontend-only — no SQL until activity DB rows exist.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch, IPin, ICheck, IHeart } = Icons;

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

const ACTIVITY_CATEGORIES = [
  {
    key: 'walks', label: 'Walks', status: 'live', cta: 'Explore walks',
    desc: 'Trails, coastal paths and nature routes rated by difficulty and accessibility.',
    accent: '#5BC94A', bg: 'rgba(91,201,74,0.08)', border: 'rgba(91,201,74,0.18)', Icon: IWalks,
  },
  {
    key: 'groups', label: 'Groups', status: 'soon',
    desc: 'Social groups, carer circles and peer support activities near you.',
    accent: '#2D9CDB', bg: 'rgba(45,156,219,0.08)', border: 'rgba(45,156,219,0.16)', Icon: IGroups,
  },
  {
    key: 'days-out', label: 'Days Out', status: 'soon',
    desc: 'Gardens, beaches, attractions and family-friendly destinations.',
    accent: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.16)', Icon: ISparkle,
  },
  {
    key: 'attractions', label: 'Attractions', status: 'soon',
    desc: 'Discounted and carer-friendly venues, museums and cultural experiences.',
    accent: '#7B5CF5', bg: 'rgba(123,92,245,0.08)', border: 'rgba(123,92,245,0.14)', Icon: ISparkle,
  },
  {
    key: 'wellbeing', label: 'Wellbeing', status: 'soon',
    desc: 'Yoga, swimming, sport and wellbeing sessions supporting carer health.',
    accent: '#F4613A', bg: 'rgba(244,97,58,0.08)', border: 'rgba(244,97,58,0.14)', Icon: IWellbeing,
  },
];

// Sample discovery cards — county-aware copy, frontend-only
const FEATURED_NEAR = [
  { title: 'Accessible coastal walk',  type: 'Walk',     location: 'St Ives',  tags: ['Wheelchair friendly', 'Free'],   accent: '#5BC94A' },
  { title: 'Carer coffee morning',     type: 'Group',    location: 'Truro',    tags: ['All welcome', 'Free'],           accent: '#2D9CDB' },
  { title: 'Family-friendly day out',  type: 'Day Out',  location: 'Falmouth', tags: ['Family', 'Free entry'],          accent: '#F5A623' },
  { title: 'Wellbeing swim session',   type: 'Wellbeing',location: 'Penzance', tags: ['Low mobility', 'Free'],          accent: '#F4613A' },
];

// Chips: type/cost/access values map to local filter state
const POPULAR_CHIPS = [
  { label: 'Free activities',      sub: 'No cost',       icon: '🆓', type: '',          cost: 'free',        access: '' },
  { label: 'Accessible places',    sub: 'Easy access',   icon: '♿', type: '',          cost: '',            access: 'low-mobility' },
  { label: 'Coastal walks',        sub: 'Scenic routes', icon: '🌊', type: 'walks',     cost: '',            access: '' },
  { label: 'Family days out',      sub: 'All ages',      icon: '👨‍👩‍👧', type: 'days-out',  cost: '',            access: '' },
  { label: 'Wellbeing sessions',   sub: 'Mind & body',   icon: '🧘', type: 'wellbeing', cost: '',            access: '' },
  { label: 'Carer discounts',      sub: 'Save money',    icon: '🏷️', type: '',          cost: 'discounted',  access: '' },
];

// ── Shared input style ──────────────────────────────────────────────────────

const iStyle = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #E9EEF5',
  background: '#FAFBFF',
  fontSize: 13.5,
  color: '#1A2744',
  fontFamily: 'Inter, sans-serif',
  flex: '1 1 140px',
  minWidth: 0,
  cursor: 'pointer',
  appearance: 'auto',
};

// ── Premium map placeholder ─────────────────────────────────────────────────
// CSS tile-style design: neutral muted tones, grid, road lines.
// No API key. No external request. Cannot crash.

const MapPlaceholder = ({ countyLabel, onNavigate }) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      height: 400,
      background: '#E9E5DC',
      backgroundImage: [
        'linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: '44px 44px',
    }}
  >
    {/* Muted green park/area blocks */}
    <div style={{ position: 'absolute', top: '10%',  left: '8%',  width: '22%', height: '28%', borderRadius: 6,  background: 'rgba(160,200,140,0.35)' }} />
    <div style={{ position: 'absolute', top: '55%',  left: '62%', width: '28%', height: '22%', borderRadius: 6,  background: 'rgba(160,200,140,0.28)' }} />
    <div style={{ position: 'absolute', top: '20%',  left: '72%', width: '18%', height: '18%', borderRadius: 4,  background: 'rgba(160,200,140,0.22)' }} />

    {/* Road-like light strips */}
    <div style={{ position: 'absolute', top: '42%',  left: 0,     width: '100%', height: 6, background: 'rgba(255,255,255,0.65)', transform: 'rotate(-2deg)' }} />
    <div style={{ position: 'absolute', top: '68%',  left: 0,     width: '100%', height: 4, background: 'rgba(255,255,255,0.50)' }} />
    <div style={{ position: 'absolute', top: 0,      left: '38%', width: 5,      height: '100%', background: 'rgba(255,255,255,0.55)' }} />
    <div style={{ position: 'absolute', top: 0,      left: '72%', width: 4,      height: '100%', background: 'rgba(255,255,255,0.45)', transform: 'rotate(3deg)' }} />

    {/* Water-like block bottom-left */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: '25%', background: 'rgba(140,188,215,0.45)', borderTopRightRadius: 8 }} />

    {/* Overlay frost */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,246,242,0.32)' }} />

    {/* Centre message */}
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10,
    }}>
      <div style={{
        padding: '18px 24px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(26,39,68,0.10)',
        maxWidth: 260,
      }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>📍</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>Live activity map coming soon</div>
        <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.52)', marginBottom: 12 }}>Explore walks, groups and days out by area across {countyLabel}.</div>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => onNavigate('walks')}
          style={{ fontSize: 13, width: '100%', justifyContent: 'center' }}
        >
          Open walks map <IArrow s={12} />
        </button>
      </div>
    </div>

    {/* County badge */}
    <div style={{
      position: 'absolute', top: 14, left: 14,
      padding: '5px 11px', borderRadius: 8,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(6px)',
      fontSize: 12, fontWeight: 700, color: '#1A2744',
    }}>
      {countyLabel}
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

      {/* ── Compact hero ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #EAF5E7 0%, #F2F8FF 55%, #F9FBFF 100%)',
        paddingTop: 56, paddingBottom: 40,
        borderBottom: '1px solid rgba(91,201,74,0.10)',
      }}>
        {/* Subtle blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 12 }}>Activities near you</div>
              <h1 style={{
                fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 800, color: '#1A2744',
                letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px', textWrap: 'balance',
              }}>
                Find activities, walks and days out near you
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 480 }}>
                Discover walks, groups, days out and wellbeing activities for carers, families and communities.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                  className="btn btn-gold"
                  onClick={() => document.getElementById('act-discovery')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ fontSize: 14 }}
                >
                  <IPin s={13} /> Explore by map
                </button>
                <button className="btn btn-ghost" onClick={() => onNavigate('find-help')} style={{ fontSize: 14 }}>
                  Suggest an activity
                </button>
              </div>
              {/* Stat row */}
              <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(26,39,68,0.07)' }}>
                {[
                  { n: '333+', l: 'Walks' },
                  { n: '6',    l: 'Counties' },
                  { n: '100+', l: 'Places' },
                  { n: 'Free', l: 'To browse' },
                ].map(({ n, l }, i) => (
                  <div key={l} style={{ paddingRight: 20, paddingLeft: i > 0 ? 20 : 0, borderLeft: i > 0 ? '1px solid rgba(26,39,68,0.09)' : 'none' }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#1A2744', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.50)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline search + county on right at desktop */}
            <div className="card" style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744', marginBottom: 12 }}>Where would you like to explore?</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    placeholder="Town or area…"
                    style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 34, flex: 'none' }}
                  />
                  <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
                    <ISearch s={13} />
                  </span>
                </div>
                <select value={activeCounty} onChange={handleCountyChange} style={{ ...iStyle, fontWeight: 700, flex: 'none' }}>
                  {COUNTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={{ ...iStyle, flex: 'none' }}>
                  {ACTIVITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={accessibility} onChange={(e) => setAccessibility(e.target.value)} style={{ ...iStyle, flex: '1 1 50%' }}>
                    {ACCESSIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={cost} onChange={(e) => setCost(e.target.value)} style={{ ...iStyle, flex: '1 1 50%' }}>
                    {COST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button className="btn btn-gold" onClick={() => onNavigate('walks')} style={{ justifyContent: 'center' }}>
                  Search activities <IArrow s={14} />
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(26,39,68,0.42)', textAlign: 'center' }}>
                Showing {countyLabel} — change county above
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Discovery section: map + featured cards ───────────── */}
      <section id="act-discovery" style={{ paddingTop: 60, paddingBottom: 52, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Explore nearby</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
              Explore what's nearby
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>
            {/* Map — left, wider */}
            <div style={{ gridColumn: 'span 1' }}>
              <MapPlaceholder countyLabel={countyLabel} onNavigate={onNavigate} />
            </div>

            {/* Featured near you — right */}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.42)', marginBottom: 12 }}>
                Featured near you
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {FEATURED_NEAR.map((card) => (
                  <div
                    key={card.title}
                    className="card"
                    style={{ padding: '14px 16px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, borderLeft: `3px solid ${card.accent}` }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: card.accent }}>{card.type}</span>
                        <span style={{ fontSize: 10.5, color: 'rgba(26,39,68,0.42)', fontWeight: 600 }}>· {card.location}</span>
                      </div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1A2744', marginBottom: 6, lineHeight: 1.3 }}>{card.title}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {card.tags.map((t) => (
                          <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${card.accent}18`, color: card.accent }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('walks')}
                      style={{ fontSize: 11.5, fontWeight: 700, color: card.accent, background: `${card.accent}14`, padding: '6px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      View →
                    </button>
                  </div>
                ))}
                {/* Sponsored slot */}
                <div className="card" style={{ padding: '12px 16px', borderRadius: 16, border: '1px dashed rgba(245,166,35,0.40)', background: 'rgba(245,166,35,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(26,39,68,0.40)', marginBottom: 3 }}>Sponsored placement available</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.60)', lineHeight: 1.4 }}>Your venue or activity could appear here.</div>
                  </div>
                  <button onClick={() => onNavigate('login')} style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.12)', padding: '6px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Promote →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Small county partner banner ───────────────────────── */}
      <section style={{ paddingTop: 0, paddingBottom: 24, background: '#FFFFFF' }}>
        <div className="container">
          <div className="card" style={{ padding: '18px 22px', borderRadius: 16, background: 'linear-gradient(135deg, #F8FBFF 0%, #EFF8FF 100%)', border: '1px solid rgba(45,156,219,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1c78b5', marginBottom: 4 }}>Featured county partner</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>Support carers in {countyLabel} by sponsoring local activity discovery.</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')} style={{ whiteSpace: 'nowrap' }}>
              Sponsor this county <IArrow s={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Popular ways to explore ───────────────────────────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Quick filters</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Popular ways to explore</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(152px, 1fr))', gap: 10 }}>
            {POPULAR_CHIPS.map((chip) => {
              const active = chipIsActive(chip);
              const hov    = chipHov === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip)}
                  onMouseEnter={() => setChipHov(chip.label)}
                  onMouseLeave={() => setChipHov(null)}
                  style={{
                    padding: '14px 14px 12px',
                    borderRadius: 16,
                    border: active ? '1.5px solid #F5A623' : `1px solid ${hov ? '#D8E4F0' : '#E9EEF5'}`,
                    background: active ? 'rgba(245,166,35,0.07)' : hov ? 'rgba(26,39,68,0.02)' : '#FAFBFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .14s',
                    boxShadow: active ? '0 4px 14px rgba(245,166,35,0.12)' : '0 2px 6px rgba(26,39,68,0.03)',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6, lineHeight: 1 }}>{chip.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? '#B45309' : '#1A2744', marginBottom: 3, lineHeight: 1.2 }}>{chip.label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.48)', fontWeight: 500 }}>{chip.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured activity categories ──────────────────────── */}
      <section style={{ paddingTop: 52, paddingBottom: 20, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Activity categories</div>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Featured activity categories</h2>
          </div>

          {/* Live: Walks */}
          {liveCategories.map((cat) => {
            const hov = catHov === cat.key;
            return (
              <div
                key={cat.key}
                className="card"
                onClick={() => onNavigate(cat.key)}
                onMouseEnter={() => setCatHov(cat.key)}
                onMouseLeave={() => setCatHov(null)}
                style={{
                  padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 14,
                  border: `1px solid ${hov ? cat.accent : cat.border}`,
                  boxShadow: hov ? '0 16px 40px rgba(26,39,68,0.09)' : '0 3px 12px rgba(26,39,68,0.04)',
                  transition: 'border-color .16s, box-shadow .16s',
                }}
              >
                {/* Gradient header strip */}
                <div style={{ height: 56, background: `linear-gradient(135deg, ${cat.bg.replace('0.08', '0.22')} 0%, ${cat.bg} 100%)`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={20} />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: cat.accent }}>Live now — {countyLabel}</span>
                </div>
                <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1A2744', margin: '0 0 6px', lineHeight: 1.1 }}>{cat.label}</h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6, margin: 0, maxWidth: 480 }}>{cat.desc}</p>
                  </div>
                  <button
                    className="btn btn-gold"
                    onClick={(e) => { e.stopPropagation(); onNavigate(cat.key); }}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {cat.cta} <IArrow s={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Coming soon grid */}
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.35)', marginBottom: 12, marginTop: 6 }}>Coming next</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {soonCategories.map((cat) => (
              <div key={cat.key} className="card" style={{ padding: 20, border: `1px solid ${cat.border}`, opacity: 0.78, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: cat.accent }}>Coming soon</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{cat.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', lineHeight: 1.55, margin: 0 }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse activities — 3 preview cards ───────────────── */}
      <section style={{ paddingTop: 52, paddingBottom: 52, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Activity listings</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>Activity listings are growing</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-gold btn-sm" onClick={() => onNavigate('walks')}>Explore walks <IArrow s={12} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('find-help')}>Suggest an activity</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {/* Walks — live */}
            <div
              className="card"
              onClick={() => onNavigate('walks')}
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(91,201,74,0.22)' }}
            >
              <div style={{ height: 6, background: 'linear-gradient(90deg, #5BC94A, #3DA832)' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5BC94A' }}>Live now</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0D7A55', background: 'rgba(16,185,129,0.10)', padding: '2px 8px', borderRadius: 6 }}>333+ routes</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Walks</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.62)', lineHeight: 1.5, marginBottom: 14 }}>Rated trails, coastal paths and accessible routes across {countyLabel}.</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5BC94A' }}>Explore walks →</div>
              </div>
            </div>

            {/* Groups — coming soon */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.78, border: '1px solid rgba(45,156,219,0.16)' }}>
              <div style={{ height: 6, background: 'linear-gradient(90deg, #2D9CDB88, #2D9CDB44)' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2D9CDB' }}>Coming soon</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Groups</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', lineHeight: 1.5, marginBottom: 14 }}>Social groups, carer circles and peer support activities near you.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.40)' }}>Listings being added</div>
              </div>
            </div>

            {/* Days Out — coming soon */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default', opacity: 0.78, border: '1px solid rgba(245,166,35,0.16)' }}>
              <div style={{ height: 6, background: 'linear-gradient(90deg, #F5A62388, #F5A62344)' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F5A623' }}>Coming soon</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Days Out</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', lineHeight: 1.5, marginBottom: 14 }}>Gardens, beaches, attractions and family-friendly destinations.</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.40)' }}>Listings being added</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner / advertising ─────────────────────────────── */}
      <section style={{ paddingTop: 48, paddingBottom: 48, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {[
              {
                icon: '🏆', title: 'County sponsorship',
                desc: 'Own the headline partner slot for a county and appear across all activity discovery pages.',
                badge: 'Premium', badgeColor: '#B45309', badgeBg: 'rgba(245,166,35,0.10)',
              },
              {
                icon: '📍', title: 'Featured activity listings',
                desc: 'Promote events, venues, days out and wellbeing opportunities to carers searching locally.',
                badge: 'Popular', badgeColor: '#0D7A55', badgeBg: 'rgba(16,185,129,0.08)',
              },
              {
                icon: '🗺️', title: 'Boosted map visibility',
                desc: 'Stand out when people search by area, activity type or accessibility — coming soon.',
                badge: 'Coming', badgeColor: '#5B3DBA', badgeBg: 'rgba(123,92,245,0.08)',
              },
            ].map((c) => (
              <div key={c.title} className="card" style={{ padding: 20, borderRadius: 18 }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: '#1A2744' }}>{c.title}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: c.badgeBg, color: c.badgeColor }}>{c.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.62)', lineHeight: 1.55, margin: '0 0 14px' }}>{c.desc}</p>
                <button onClick={() => onNavigate('login')} style={{ fontSize: 12.5, fontWeight: 700, color: '#B45309', background: 'rgba(245,166,35,0.10)', padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.20)', cursor: 'pointer' }}>
                  Find out more →
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn btn-gold" onClick={() => onNavigate('login')} style={{ fontSize: 14 }}>
              Discuss partnership options <IArrow s={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section style={{ paddingTop: 44, paddingBottom: 60, background: '#F8FBFF', borderTop: '1px solid #EEF1F7' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(19px, 2.5vw, 24px)', fontWeight: 800, color: '#1A2744', margin: '0 0 8px' }}>
                Know an activity carers would love?
              </h2>
              <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.6, margin: 0 }}>
                Help carers in {countyLabel} discover local activities, groups and days out.
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
