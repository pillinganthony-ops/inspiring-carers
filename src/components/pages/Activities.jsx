// Activities hub — multi-county discovery page.
// ACTIVITY_CATEGORIES drives the featured section; add new entries here.
// Filter state is frontend-only — no SQL needed until activity DB rows exist.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle, ISearch } = Icons;

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
  { value: '',           label: 'All activities' },
  { value: 'walks',      label: 'Walks' },
  { value: 'groups',     label: 'Groups' },
  { value: 'days-out',   label: 'Days Out' },
  { value: 'attractions',label: 'Attractions' },
  { value: 'wellbeing',  label: 'Wellbeing Activities' },
  { value: 'events',     label: 'Events' },
];

const ACCESSIBILITY_OPTIONS = [
  { value: '',             label: 'Any accessibility' },
  { value: 'wheelchair',   label: 'Wheelchair friendly' },
  { value: 'transport',    label: 'Public transport nearby' },
  { value: 'toilets',      label: 'Toilets nearby' },
  { value: 'low-mobility', label: 'Low mobility friendly' },
  { value: 'dementia',     label: 'Dementia friendly' },
  { value: 'dogs',         label: 'Dog friendly' },
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
    description: 'Yoga, swimming, sport and wellbeing sessions that support carers’ health.',
    accent: '#F4613A',
    bg: 'rgba(244,97,58,0.08)',
    border: 'rgba(244,97,58,0.18)',
    status: 'soon',
    Icon: IWellbeing,
  },
];

const selStyle = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #E9EEF5',
  background: '#FAFBFF',
  fontSize: 13.5,
  color: '#1A2744',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  flex: '1 1 150px',
  minWidth: 0,
  appearance: 'auto',
};

const ActivitiesPage = ({ onNavigate, session, county }) => {
  const activeCounty = county || 'cornwall';
  const countyLabel = COUNTY_LABELS[activeCounty] || 'your area';

  const [areaSearch, setAreaSearch]   = React.useState('');
  const [activityType, setActivityType] = React.useState('');
  const [accessibility, setAccessibility] = React.useState('');
  const [cost, setCost]               = React.useState('');
  const [hovered, setHovered]         = React.useState(null);

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  const handleCountyChange = (e) => {
    const next = e.target.value || 'cornwall';
    onNavigate('activities', next);
  };

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #F0FAF0 0%, #F8FBFF 60%, #FFFFFF 100%)',
        paddingTop: 72,
        paddingBottom: 48,
        borderBottom: '1px solid rgba(91,201,74,0.12)',
      }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 14 }}>Activities</div>
          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 800, color: '#1A2744',
            letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, textWrap: 'balance',
          }}>
            Find activities, walks and days out near you
          </h1>
          <p style={{ marginTop: 16, fontSize: 17, color: 'rgba(26,39,68,0.72)', lineHeight: 1.65, maxWidth: 580, fontWeight: 500 }}>
            Discover walks, groups, days out, attractions and wellbeing activities for carers, families and communities.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.48)', fontWeight: 500 }}>
            Showing {countyLabel} first — change county anytime.
          </p>
        </div>
      </section>

      {/* ── Filter panel ─────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 18, paddingBottom: 18 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>

            <select
              value={activeCounty}
              onChange={handleCountyChange}
              style={{ ...selStyle, fontWeight: 600, flex: '1 1 140px' }}
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
                style={{ ...selStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 34 }}
              />
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.4)', display: 'flex', pointerEvents: 'none' }}>
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

      {/* ── Featured activity categories ─────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 16 }}>
        <div className="container">
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Activity categories</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#1A2744', margin: 0 }}>
              Featured activity categories
            </h2>
          </div>

          {/* Live cards */}
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

      {/* ── Browse activities — future-ready empty state ─── */}
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

      {/* ── Commercial CTA ───────────────────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 56, background: 'linear-gradient(135deg, #1A2744 0%, #22466E 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.60)', marginBottom: 14 }}>For businesses &amp; organisations</div>
          <h2 style={{
            fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, color: '#FFFFFF',
            letterSpacing: '-0.02em', margin: '0 auto 14px', maxWidth: 580, textWrap: 'balance',
          }}>
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

      {/* ── Bottom CTA ───────────────────────────────────── */}
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
