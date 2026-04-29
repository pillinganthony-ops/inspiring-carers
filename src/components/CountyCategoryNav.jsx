// CountyCategoryNav — horizontal category switcher for Cornwall county pages.
// Lets users navigate between Activities, Places to Visit, Wellbeing and Walks
// while staying in the same county.

import React from 'react';

const CATS = [
  { key: 'activities',      label: 'Things to Do',     accent: '#3DA832' },
  { key: 'places-to-visit', label: 'Places to Visit',  accent: '#7B5CF5' },
  { key: 'wellbeing',       label: 'Wellbeing',        accent: '#0D9488' },
  { key: 'walks',           label: 'Walks',            accent: '#5BC94A' },
  { key: 'events',          label: 'Events',           accent: '#2D9CDB' },
];

const CountyCategoryNav = ({ county, activePage, onNavigate }) => (
  <nav style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7' }}>
    <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

export default CountyCategoryNav;
