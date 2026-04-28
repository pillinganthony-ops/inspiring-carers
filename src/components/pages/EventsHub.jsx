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

    {/* County cards */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FAFBFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: ACCENT, marginBottom: 10 }}>Select your county</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
            Choose your area to see local events
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto' }}>
          {EVT_COUNTY_CARDS.map(c => {
            const isLive = c.status === 'live';
            return (
              <div key={c.key} className="card" style={{ padding: '28px 24px', borderRadius: 20, borderLeft: `4px solid ${c.accent}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744' }}>{c.label}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: c.badgeBg, color: c.badgeColor, whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
                {isLive ? (
                  <button
                    onClick={() => onNavigate('events', c.key)}
                    style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: ACCENT, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .13s', marginTop: 'auto' }}
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
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(26,39,68,0.50)', marginTop: 24, lineHeight: 1.6, maxWidth: 560, margin: '24px auto 0' }}>
          Find local sessions, workshops and community activities. Choose your county above to explore what's on near you.
        </p>
      </div>
    </section>

    {/* What you can find */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: ACCENT, marginBottom: 10 }}>Discover</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>What you can find</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {[
            { title: 'Local workshops',   body: 'Skills, creative and learning sessions hosted by local organisations across your county.' },
            { title: 'Community groups',  body: 'Social meetups, carers circles and peer support activities to connect with others near you.' },
            { title: 'Support sessions',  body: 'Wellbeing, advice and practical support sessions designed for carers and their families.' },
          ].map(({ title, body }) => (
            <div key={title} className="card" style={{ padding: '28px 26px', borderRadius: 20, borderTop: `4px solid ${ACCENT}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(123,92,245,0.10)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#1A2744', margin: '0 0 10px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.7, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
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
            { n: '1', title: 'Choose your county',       body: 'Select your area above to see events and sessions available near you.' },
            { n: '2', title: 'Explore trusted options',  body: 'Browse verified events from local organisations, charities and support groups.' },
            { n: '3', title: 'Register where launching', body: 'Devon and Somerset are coming soon. Register interest to be first to know.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '24px 22px', background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(26,39,68,0.06)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: ACCENT, color: 'white', fontWeight: 800, fontSize: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1A2744', margin: '0 0 7px', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* For organisations */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ padding: '36px 40px', borderRadius: 24, background: 'rgba(123,92,245,0.05)', border: '1px solid rgba(123,92,245,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: ACCENT, marginBottom: 8 }}>For organisations</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1A2744', margin: '0 0 10px', lineHeight: 1.15 }}>Reach carers with your events</h3>
            <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.60)', margin: 0, lineHeight: 1.6 }}>
              Submit events, workshops and support sessions free of charge. Advertising and sponsorship options also available.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flexShrink: 0 }}>
            <button onClick={() => onNavigate('profile')} style={{ padding: '13px 26px', borderRadius: 11, background: ACCENT, color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Get involved</button>
            <button onClick={() => onNavigate('advertise')} style={{ padding: '12px 22px', borderRadius: 11, background: 'transparent', border: `1.5px solid rgba(123,92,245,0.35)`, color: ACCENT, fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>Advertise with us</button>
          </div>
        </div>
      </div>
    </section>

    {/* CTA sponsor strip — matching all other hubs exactly */}
    <section style={{ paddingBottom: 64, background: '#FAFBFF' }}>
      <div className="container">
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
