// CountyWalksBanner — cross-link strip from activity/venue pages to the walks section.
// Preserves the active county when routing. Shows for all counties; if the county has
// no walk data the walks page will show the empty/coming-soon state.

import React from 'react';
import Icons from './Icons.jsx';

const { IArrow } = Icons;

const CountyWalksBanner = ({
  county,
  onNavigate,
  headline = 'Outdoor routes and green spaces can support wellbeing.',
  detail   = 'Find accessible walks in your area.',
}) => (
  <div style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', padding: '12px 0' }}>
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 13.5, color: '#166534', lineHeight: 1.5 }}>
        <strong>{headline}</strong>{' '}{detail}
      </p>
      <button
        onClick={() => onNavigate('walks', county || null)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#16A34A', color: '#FFFFFF', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        Explore local walks <IArrow s={13} />
      </button>
    </div>
  </div>
);

export default CountyWalksBanner;
