// EventsHubPage — national hub at /events
// Standardised to match FindHelp, Activities, Walks, Wellbeing, PlacesToVisit hub design system.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import CountyInterestModal from '../CountyInterestModal.jsx';

const ACCENT = '#7B5CF5'; // indigo — consistent with Events county page

const EVT_COUNTY_CARDS = [
  { key: 'cornwall', label: 'Cornwall', status: 'live',        badge: 'Live now',    accent: ACCENT,               badgeBg: 'rgba(22,163,74,0.10)',  badgeColor: '#166534' },
  { key: 'devon',    label: 'Devon',    status: 'launching',   badge: 'Launching',   accent: '#D97706',            badgeBg: 'rgba(217,119,6,0.10)',  badgeColor: '#92400E' },
  { key: 'somerset', label: 'Somerset', status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.22)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.48)' },
  { key: 'bristol',  label: 'Bristol',  status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.22)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.48)' },
];

const EventsHubPage = ({ onNavigate, session }) => (
  <>
    <Nav activePage="events" onNavigate={onNavigate} session={session} />

    {/* Hero — paddingTop/Bottom: 64 matching all other hubs */}
    <section style={{ background: 'linear-gradient(150deg, #100A2A 0%, #1A0E40 55%, #1E1248 100%)', paddingTop: 64, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.18) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: '20%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.08) 0%, transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

        {/* Eyebrow — fontSize: 10.5, letterSpacing: 0.09em matching system */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.28)', fontSize: 10.5, fontWeight: 800, color: '#C4B5FD', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 22 }}>
          National hub
        </div>

        {/* H1 — clamp(28px,4.5vw,48px), lineHeight 1.1, marginBottom 16 */}
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Events for carers<br />across the UK
        </h1>

        {/* Subheadline — fontSize: 17, rgba(255,255,255,0.68), lineHeight 1.65 */}
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
          Discover local events, workshops, social meetups and training sessions for carers in your county.
        </p>

        {/* Trust pills */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 600, marginTop: 28 }}>
          {['Free to attend', 'Local organisations', 'Carer-friendly sessions'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />{t}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* County cards — minmax(180px,1fr), gap 14, matching system */}
    <section style={{ paddingTop: 56, paddingBottom: 56, background: '#FAFBFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: ACCENT, marginBottom: 10 }}>Select your county</div>
          <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
            Choose your area to see local events
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {EVT_COUNTY_CARDS.map(c => {
            const isLive = c.status === 'live';
            const isLaunching = c.status === 'launching';
            return (
              /* card — padding: 22px 20px, borderRadius: 18, borderLeft: 3px solid matching system */
              <div key={c.key} className="card" style={{ padding: '22px 20px', borderRadius: 18, borderLeft: `3px solid ${c.accent}`, opacity: isLive || isLaunching ? 1 : 0.70 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2744' }}>{c.label}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: c.badgeBg, color: c.badgeColor, whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
                {isLive ? (
                  /* Live button — background: accent, padding: 9px 0, borderRadius: 10, fontWeight: 700, fontSize: 13.5 */
                  <button
                    onClick={() => onNavigate('events', c.key)}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: ACCENT, color: 'white', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', transition: 'opacity .13s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Choose {c.label}
                  </button>
                ) : (
                  <CountyInterestModal county={c.key} label={c.label} sourcePage="events" />
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(26,39,68,0.50)', marginTop: 20, lineHeight: 1.6, maxWidth: 560, margin: '20px auto 0' }}>
          Find local sessions, workshops and community activities. Choose your county above to explore what's on near you.
        </p>
      </div>
    </section>

    {/* CTA sponsor strip — matching all other hubs exactly */}
    <section style={{ paddingBottom: 64, background: '#FAFBFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ padding: '28px 32px', borderRadius: 22, background: 'linear-gradient(135deg, #1A2744 0%, #2D3E6B 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.42)', marginBottom: 7 }}>Get involved</div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#FFFFFF', margin: '0 0 7px', lineHeight: 1.2 }}>
              Add an event or sponsor this category
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', margin: 0, lineHeight: 1.55 }}>
              Register your organisation, submit events, or become a founding events sponsor in your county.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, flexShrink: 0 }}>
            <button
              onClick={() => onNavigate('events', 'cornwall')}
              className="btn btn-gold"
              style={{ fontWeight: 800, fontSize: 14, padding: '10px 20px', whiteSpace: 'nowrap' }}
            >
              Choose Cornwall
            </button>
            <button
              onClick={() => onNavigate('profile')}
              style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Submit an event
            </button>
            <button
              onClick={() => onNavigate('advertise')}
              style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Sponsor this category
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer onNavigate={onNavigate} />
  </>
);

export default EventsHubPage;
