// Activities hub — county-aware landing page for all activity categories.
// Add future categories to ACTIVITY_CATEGORIES; they render automatically.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IWalks, IGroups, IWellbeing, IArrow, ISparkle } = Icons;

const COUNTY_LABELS = {
  cornwall: 'Cornwall',
  devon: 'Devon',
  dorset: 'Dorset',
  somerset: 'Somerset',
};

// Single source of truth for activity categories.
// status: 'live' renders a CTA; 'soon' renders a "coming soon" badge.
const ACTIVITY_CATEGORIES = [
  {
    key: 'walks',
    label: 'Walks',
    description: 'Trails, coastal paths and nature routes across the county — rated by distance, difficulty and accessibility.',
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
    description: 'Accessible attractions, gardens, beaches and family-friendly places.',
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

const ActivitiesPage = ({ onNavigate, session, county }) => {
  const countyLabel = COUNTY_LABELS[county] || 'your area';
  const [hovered, setHovered] = React.useState(null);

  const liveCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'live');
  const soonCategories = ACTIVITY_CATEGORIES.filter((c) => c.status === 'soon');

  return (
    <>
      <Nav activePage="activities" onNavigate={onNavigate} session={session} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #F0FAF0 0%, #F8FBFF 60%, #FFFFFF 100%)',
        paddingTop: 72, paddingBottom: 64,
        borderBottom: '1px solid rgba(91,201,74,0.12)',
      }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#3DA832', marginBottom: 14 }}>Activities</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 800, color: '#1A2744', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, textWrap: 'balance' }}>
            Activities in {countyLabel}
          </h1>
          <p style={{ marginTop: 18, fontSize: 18, color: 'rgba(26,39,68,0.72)', lineHeight: 1.65, maxWidth: 560, fontWeight: 500 }}>
            Explore walks, days out, groups and wellbeing activities near you.
          </p>
        </div>
      </section>

      {/* ── Live categories (Walks prominently above fold) ───── */}
      <section style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div className="container">
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
                  padding: 0, overflow: 'hidden', cursor: 'pointer',
                  border: `1px solid ${isHov ? cat.accent : cat.border}`,
                  boxShadow: isHov ? `0 20px 48px rgba(26,39,68,0.10)` : '0 4px 16px rgba(26,39,68,0.05)',
                  transition: 'border-color .18s, box-shadow .18s',
                  marginBottom: 16,
                }}
              >
                {/* Colour band */}
                <div style={{ height: 6, background: `linear-gradient(90deg, ${cat.accent}, ${cat.accent}88)` }} />
                <div style={{ padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent, flexShrink: 0 }}>
                        <cat.Icon s={26} />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.accent }}>Live now</span>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1A2744', margin: 0, lineHeight: 1.1 }}>{cat.label}</h2>
                      </div>
                    </div>
                    <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.7)', lineHeight: 1.65, margin: 0, maxWidth: 520 }}>{cat.description}</p>
                  </div>
                  <button
                    className="btn btn-gold"
                    onClick={(e) => { e.stopPropagation(); onNavigate(cat.key); }}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {cat.cta} <IArrow s={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Coming soon grid ─────────────────────────────────── */}
      <section style={{ paddingTop: 8, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,39,68,0.38)', marginBottom: 16 }}>
            Coming next
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {soonCategories.map((cat) => (
              <div
                key={cat.key}
                className="card"
                style={{
                  padding: 24,
                  border: `1px solid ${cat.border}`,
                  opacity: 0.78,
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.bg, display: 'grid', placeItems: 'center', color: cat.accent }}>
                    <cat.Icon s={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: cat.accent }}>Coming soon</span>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#1A2744', lineHeight: 1.2 }}>{cat.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.6, margin: 0 }}>{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ActivitiesPage;
