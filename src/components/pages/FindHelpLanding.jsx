// FindHelpLanding — national county selector for /find-help
// Each live county card navigates to /{county}/find-help.
// Cornwall is LIVE NOW; others show "Coming soon."

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';

const COUNTIES = [
  { key: 'cornwall',  label: 'Cornwall',  live: true,
    desc: 'Browse verified local organisations, community groups, and specialist services across Cornwall.' },
  { key: 'devon',     label: 'Devon',     live: false, desc: 'Services and support for carers across Devon.' },
  { key: 'somerset',  label: 'Somerset',  live: false, desc: 'Services and support for carers across Somerset.' },
  { key: 'bristol',   label: 'Bristol',   live: false, desc: 'Services and support for carers in Bristol.' },
  { key: 'dorset',    label: 'Dorset',    live: false, desc: 'Services and support for carers across Dorset.' },
  { key: 'wiltshire', label: 'Wiltshire', live: false, desc: 'Services and support for carers across Wiltshire.' },
];

const ACCENT = '#2D9CDB';

const FindHelpLandingPage = ({ onNavigate, session }) => {
  const [hovered, setHovered] = React.useState(null);

  // SEO — set title/meta/canonical on mount, restore on unmount
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Find Trusted Local Support Near You | Inspiring Carers';

    let metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    if (createdDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    const prevDesc = metaDesc.content;
    metaDesc.content = 'Browse verified carer support organisations across England. Select your county to find trusted local services.';

    let canonical = document.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (createdCanonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    const prevCanonical = canonical.href;
    canonical.href = `${window.location.origin}/find-help`;

    return () => {
      document.title = prevTitle;
      if (createdDesc) metaDesc.remove(); else metaDesc.content = prevDesc;
      if (createdCanonical) canonical.remove(); else canonical.href = prevCanonical;
    };
  }, []);

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} session={session} />

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)', paddingTop: 48, paddingBottom: 52 }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
            Local Support Directory
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#1A2744', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' }}>
            Find trusted local support<br />near you.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, maxWidth: 520, margin: 0 }}>
            Select your county to browse verified organisations, groups, and services for carers and the people they support.
          </p>
        </div>
      </section>

      {/* ── County selector ── */}
      <section style={{ background: '#FFFFFF', paddingTop: 40, paddingBottom: 64 }}>
        <div className="container">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Choose your county</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.50)', marginBottom: 24 }}>
            Cornwall is live now. Other counties are being prepared — register your interest below.
          </p>

          {/* Live county card */}
          {COUNTIES.filter((c) => c.live).map((c) => (
            <div
              key={c.key}
              onClick={() => onNavigate('find-help', c.key)}
              onMouseEnter={() => setHovered(c.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '22px 24px', borderRadius: 16,
                border: `2px solid ${hovered === c.key ? ACCENT : '#D0E8F8'}`,
                background: hovered === c.key ? '#F0F8FF' : '#FAFCFF',
                cursor: 'pointer', marginBottom: 32,
                transition: 'border-color .15s, background .15s',
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${ACCENT}18`, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 22 }}>
                🗺️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1A2744' }}>{c.label}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#0D7A55', letterSpacing: '0.06em' }}>
                    ● LIVE NOW
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.60)', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
              <div style={{ color: ACCENT, fontSize: 22, flexShrink: 0 }}>→</div>
            </div>
          ))}

          {/* Coming soon grid */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(26,39,68,0.60)', marginBottom: 16 }}>
            Coming soon across England
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {COUNTIES.filter((c) => !c.live).map((c) => (
              <div key={c.key} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #E8EEF5', background: '#FAFBFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(26,39,68,0.55)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default FindHelpLandingPage;
