// SponsorStrip — county-page sponsor/partnership strip.
// Source of truth: Things to Do (Activities.jsx), PlacesToVisit, WellbeingSupport, Events (May 2026).
// Layout is identical across all types; copy, accent, and button config are
// mapped internally from the type prop.
//
// Props:
//   type         'things-to-do' | 'places' | 'wellbeing' | 'events'
//   countyLabel  string   — formatted county name e.g. 'Cornwall'
//   onNavigate   function — app navigation handler

import React from 'react';

const CONFIG = {
  'things-to-do': {
    accent:          '#3DA832',
    outerBg:         '#FAFBFF',
    cardBg:          'rgba(91,201,74,0.05)',
    cardBorder:      'rgba(91,201,74,0.14)',
    headline:        (c) => `Sponsor Things to Do across ${c}`,
    body:            'Promote your organisation to carers, families, and community users exploring local days out, activities and support-friendly places.',
    primaryLabel:    'Become a sponsor →',
    primaryBg:       'linear-gradient(135deg, #F5A623, #D4AF37)',
    primaryColor:    '#0F172A',
    primaryWeight:   800,
    secondaryLabel:  'Offer a discount',
    secondaryRoute:  'offer-a-discount',
    secondaryBorder: 'rgba(91,201,74,0.30)',
  },
  'places': {
    accent:          '#7B5CF5',
    outerBg:         '#FAFBFF',
    cardBg:          'rgba(123,92,245,0.05)',
    cardBorder:      'rgba(123,92,245,0.14)',
    headline:        (c) => `Sponsor Places to Visit across ${c}`,
    body:            'Showcase your attraction, venue or destination to carers and families looking for accessible, welcoming places to visit.',
    primaryLabel:    'Become a sponsor',
    primaryBg:       '#7B5CF5',
    primaryColor:    'white',
    primaryWeight:   700,
    secondaryLabel:  'Offer a discount',
    secondaryRoute:  'offer-a-discount',
    secondaryBorder: 'rgba(123,92,245,0.28)',
  },
  'wellbeing': {
    accent:          '#0D9488',
    outerBg:         '#F7FAFA',
    cardBg:          'rgba(13,148,136,0.05)',
    cardBorder:      'rgba(13,148,136,0.14)',
    headline:        (c) => `Sponsor wellbeing support across ${c}`,
    body:            'Position your organisation in front of carers and families looking for trusted wellbeing, support and community resources.',
    primaryLabel:    'Become a sponsor',
    primaryBg:       '#0D9488',
    primaryColor:    'white',
    primaryWeight:   700,
    secondaryLabel:  'Offer a discount',
    secondaryRoute:  'offer-a-discount',
    secondaryBorder: 'rgba(13,148,136,0.28)',
  },
  'events': {
    accent:          '#2D9CDB',
    outerBg:         '#FAFBFF',
    cardBg:          'rgba(45,156,219,0.05)',
    cardBorder:      'rgba(45,156,219,0.14)',
    headline:        (c) => `Sponsor events across ${c}`,
    body:            (c) => `Get your organisation in front of carers, families, and community networks across ${c}.`,
    secondaryLabel:  'Add your event',
    secondaryRoute:  'profile',
    secondaryBorder: 'rgba(45,156,219,0.30)',
    primaryLabel:    'Become a sponsor →',
    primaryBg:       '#2D9CDB',
    primaryColor:    'white',
    primaryWeight:   700,
  },
};

const SponsorStrip = ({ type, countyLabel = '', onNavigate }) => {
  const c = CONFIG[type];
  if (!c) return null;

  return (
    <div style={{ background: c.outerBg, borderBottom: '1px solid #EEF1F7', padding: '14px 0' }}>
      <div className="container">
        <div style={{ padding: '20px 24px', borderRadius: 22, background: c.cardBg, border: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

          {/* Copy */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: c.accent, marginBottom: 5 }}>
              County sponsorship
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 4, lineHeight: 1.28 }}>
              {c.headline(countyLabel)}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)', margin: '0 0 4px', lineHeight: 1.55 }}>
              {typeof c.body === 'function' ? c.body(countyLabel) : c.body}
            </p>
            <p style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.38)', margin: 0, fontStyle: 'italic' }}>
              Limited to 1 headline partner per county.
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              onClick={() => onNavigate('advertise')}
              style={{ padding: '9px 18px', borderRadius: 10, background: c.primaryBg, color: c.primaryColor, fontWeight: c.primaryWeight, fontSize: 13, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity .13s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {c.primaryLabel}
            </button>
            <button
              onClick={() => onNavigate(c.secondaryRoute)}
              style={{ padding: '9px 16px', borderRadius: 10, background: 'transparent', border: `1.5px solid ${c.secondaryBorder}`, color: c.accent, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {c.secondaryLabel}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SponsorStrip;
