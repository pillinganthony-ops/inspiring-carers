// CountyBanner — shared county selector strip used on all county-data pages.
// Shows the active county and lets the user switch between live counties.
// isFallback=true when county prop is null and Cornwall is being shown as default.

import React from 'react';

export const LIVE_COUNTIES = [
  { key: 'cornwall', label: 'Cornwall' },
  { key: 'devon',    label: 'Devon'    },
];

const COMING_SOON = ['Somerset', 'Bristol', 'Dorset', 'Wiltshire'];

const CountyBanner = ({ county, onChangeCounty, isFallback = false }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeKey = county || 'cornwall';
  const current   = LIVE_COUNTIES.find(c => c.key === activeKey) || LIVE_COUNTIES[0];

  return (
    <div style={{ background: '#EFF7FF', borderBottom: '1px solid #C9DFEF', padding: '8px 0', position: 'relative', zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

        <span style={{ fontSize: 13, color: 'rgba(26,39,68,0.52)', fontWeight: 500 }}>
          {isFallback ? 'Available now in:' : 'County:'}
        </span>

        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 11px 4px 9px', borderRadius: 8,
              background: 'white', border: '1px solid rgba(26,39,68,0.16)',
              fontSize: 13.5, fontWeight: 700, color: '#1A2744',
              cursor: 'pointer', transition: 'box-shadow .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,39,68,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 999, background: '#16A34A', flexShrink: 0 }} />
            {current.label}
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', opacity: 0.45, flexShrink: 0 }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 5px)', left: 0, zIndex: 300,
              background: 'white', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(26,39,68,0.14)',
              border: '1px solid #E0E8F0', padding: 8, minWidth: 195,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.36)', padding: '4px 8px 8px' }}>
                Live now
              </div>
              {LIVE_COUNTIES.map(c => {
                const isSelected = c.key === activeKey;
                return (
                  <button key={c.key} onClick={() => { onChangeCounty(c.key); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: 13.5, fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'rgba(22,163,74,0.08)' : 'transparent',
                      color: isSelected ? '#166534' : '#1A2744',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(26,39,68,0.04)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: '#16A34A', flexShrink: 0 }} />
                    {c.label}
                    {isSelected && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16A34A', fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}

              <div style={{ borderTop: '1px solid #EEF1F7', margin: '6px 0' }} />
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.36)', padding: '4px 8px 6px' }}>
                Coming soon
              </div>
              {COMING_SOON.map(name => (
                <div key={name} style={{ padding: '7px 10px', fontSize: 13, color: 'rgba(26,39,68,0.36)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: 'rgba(26,39,68,0.16)', flexShrink: 0 }} />
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {isFallback && (
          <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.42)', fontStyle: 'italic' }}>
            Choose another county as we expand across the UK.
          </span>
        )}
      </div>
    </div>
  );
};

window.CountyBanner = CountyBanner;
export default CountyBanner;
