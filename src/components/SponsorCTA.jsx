// SponsorCTA — standardised sponsorship/partner CTA strip.
// Used on all main hub and discovery pages. Replaces ad-hoc "For organisations"
// sections and navy CTA strips with a single consistent component.

import React from 'react';

const SponsorCTA = ({
  eyebrow        = 'FOR ORGANISATIONS',
  title,
  body,
  accent         = '#2D9CDB',
  onNavigate,
  primaryLabel   = 'Become a sponsor',
  secondaryLabel = 'Offer a discount',
}) => (
  <section style={{ paddingBottom: 64, background: '#FAFBFF' }}>
    <div className="container">
      <div style={{
        padding: '28px 36px',
        borderRadius: 24,
        background: `${accent}08`,
        border: `1px solid ${accent}22`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: accent, marginBottom: 6 }}>
            {eyebrow}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1A2744', margin: '0 0 10px', lineHeight: 1.2 }}>
            {title}
          </h3>
          <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.62)', margin: 0, lineHeight: 1.6 }}>
            {body}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            onClick={() => onNavigate('advertise')}
            style={{ padding: '12px 22px', borderRadius: 11, background: accent, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity .13s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {primaryLabel}
          </button>
          <button
            onClick={() => onNavigate('offer-a-discount')}
            style={{ padding: '11px 20px', borderRadius: 11, background: 'transparent', border: `1.5px solid ${accent}45`, color: accent, fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default SponsorCTA;
