// Find Help Hub — county selector landing page at /find-help
// Lets carers choose their county before diving into local resource listings.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IPin, IArrow, ISearch } = Icons;

const COUNTIES = [
  { key: 'cornwall',  label: 'Cornwall',  desc: 'Carers services, support groups and resources' },
  { key: 'devon',     label: 'Devon',     desc: 'Local help, advice and peer support' },
  { key: 'somerset',  label: 'Somerset',  desc: 'Resources and services for carers' },
  { key: 'bristol',   label: 'Bristol',   desc: 'City-wide carer support and services' },
  { key: 'dorset',    label: 'Dorset',    desc: 'Carers resources across Dorset' },
  { key: 'wiltshire', label: 'Wiltshire', desc: 'Support and services for Wiltshire carers' },
];

const ACCENT = '#2D9CDB';

const FindHelpHubPage = ({ onNavigate, session }) => {
  const [hovered, setHovered] = React.useState(null);
  const [search, setSearch] = React.useState('');

  const filtered = COUNTIES.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} session={session} />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0A1828 0%, #0E2A42 55%, #112F4E 100%)', paddingTop: 48, paddingBottom: 52 }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(45,156,219,0.18)', border: '1px solid rgba(45,156,219,0.30)', fontSize: 11, fontWeight: 800, color: '#7DD3F8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            Find Help · Select your county
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 12px', textWrap: 'balance' }}>
            Find help near you
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 24px', maxWidth: 520 }}>
            Browse local carers services, support groups, benefits advice and resources. Select your county to see what's available near you.
          </p>

          {/* County search */}
          <div style={{ position: 'relative', maxWidth: 380 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type your county…"
              style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: 14.5, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.40)', display: 'flex', pointerEvents: 'none' }}>
              <ISearch s={16} />
            </span>
          </div>
        </div>
      </section>

      {/* ── County grid ── */}
      <section style={{ background: '#F7F9FC', paddingTop: 40, paddingBottom: 64 }}>
        <div className="container">
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600, marginBottom: 20 }}>
            {filtered.length} {filtered.length === 1 ? 'county' : 'counties'} available
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map((c) => {
              const active = hovered === c.key;
              return (
                <div
                  key={c.key}
                  className="card"
                  onClick={() => onNavigate('find-help', c.key)}
                  onMouseEnter={() => setHovered(c.key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ padding: 0, overflow: 'hidden', borderRadius: 16, border: `1px solid ${active ? ACCENT + '55' : ACCENT + '20'}`, cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.16s ease', transform: active ? 'translateY(-3px)' : 'none', boxShadow: active ? `0 14px 40px ${ACCENT}22, 0 4px 12px rgba(26,39,68,0.06)` : '0 2px 8px rgba(26,39,68,0.05)', background: '#FFFFFF' }}
                >
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${ACCENT}, #60C3F0)`, flexShrink: 0 }} />
                  <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <IPin s={12} color={ACCENT} />
                        <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: ACCENT }}>
                          Find help in
                        </span>
                      </div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? ACCENT : `${ACCENT}14`, display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .16s' }}>
                      <IArrow s={14} color={active ? '#FFFFFF' : ACCENT} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>No counties found</div>
              <button onClick={() => setSearch('')} style={{ fontSize: 13, fontWeight: 600, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear search</button>
            </div>
          )}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default FindHelpHubPage;
