// CountyCategoryNav — combined county selector + category tabs in a single sticky bar.
// Left: county selector dropdown. Right: Things to Do | Places to Visit | Wellbeing | Walks | Events.
// Replaces the separate CountyBanner strip on all county pages.

import React from 'react';
import { LIVE_COUNTIES } from './CountyBanner.jsx';

const COMING_SOON = ['Somerset', 'Bristol', 'Dorset', 'Wiltshire'];

const CATS = [
  { key: 'activities',      label: 'Things to Do',     accent: '#3DA832' },
  { key: 'places-to-visit', label: 'Places to Visit',  accent: '#7B5CF5' },
  { key: 'wellbeing',       label: 'Wellbeing',        accent: '#0D9488' },
  { key: 'walks',           label: 'Walks',            accent: '#5BC94A' },
  { key: 'events',          label: 'Events',           accent: '#2D9CDB' },
];

const CountyCategoryNav = ({ county, activePage, onNavigate }) => {
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
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #EEF1F7',
      position: 'sticky',
      top: 64,
      zIndex: 90,
      boxShadow: '0 2px 8px rgba(26,39,68,0.06)',
    }}>
      <div
        className="container"
        style={{ paddingTop: 0, paddingBottom: 0, display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 0 }}
      >
        {/* County selector */}
        <div
          ref={ref}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            paddingRight: 14,
            paddingTop: 6,
            paddingBottom: 6,
            borderRight: '1px solid #EEF1F7',
            flexShrink: 0,
            marginRight: 4,
          }}
        >
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px 5px 8px', borderRadius: 8,
              background: 'rgba(26,39,68,0.04)', border: '1px solid rgba(26,39,68,0.10)',
              fontSize: 13, fontWeight: 700, color: '#1A2744',
              cursor: 'pointer', transition: 'box-shadow .12s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,39,68,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#16A34A', flexShrink: 0 }} />
            {current.label}
            <svg
              width={9} height={9} viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', opacity: 0.45, flexShrink: 0 }}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 300,
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
                  <button
                    key={c.key}
                    onClick={() => { onNavigate(activePage, c.key); setOpen(false); }}
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

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: '1 1 auto' }}>
          {CATS.map(({ key, label, accent }) => {
            const active = key === activePage;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key, county)}
                style={{
                  padding: '12px 17px',
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? accent : 'rgba(26,39,68,0.52)',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
                  cursor: active ? 'default' : 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color .14s, border-color .14s',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#1A2744'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(26,39,68,0.52)'; }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CountyCategoryNav;
