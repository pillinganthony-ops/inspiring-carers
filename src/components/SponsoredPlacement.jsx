// SponsoredPlacement — premium, discreet sponsor placement panel.
// Pure UI component — no database connections. Data will be injected by
// parent pages once a sponsor is sold for that page/county slot.
//
// Guard: returns null when sponsorName is absent, so it is safe to drop
// onto any page before a sponsor is assigned without affecting layout.
//
// Intended placement (do NOT put in global header):
//   Hub pages:    below hero / above SponsorCTA
//   County pages: below hero / before sticky filter bar
//
// Usage examples (parent supplies real data from future DB query):
//
//   // Full panel
//   <SponsoredPlacement
//     sponsorName="Eden Project"
//     sponsorLogoUrl="https://example.com/logo.png"
//     sponsorUrl="https://edenproject.com"
//     message="Proud supporter of carers in Cornwall"
//     accent="#16A34A"
//   />
//
//   // Compact bar (suits narrow county page slots)
//   <SponsoredPlacement
//     sponsorName="Cornwall Hospice Care"
//     message="Supporting wellbeing across Cornwall"
//     accent="#0D9488"
//     compact
//   />
//
//   // Not yet sold — renders nothing
//   <SponsoredPlacement sponsorName={null} />

import React from 'react';

const SponsoredPlacement = ({
  sponsorName,
  sponsorLogoUrl,
  sponsorUrl,
  pageName,         // informational only — not rendered, useful for analytics later
  accent    = '#2D9CDB',
  label     = 'Sponsored by',
  message,
  compact   = false,
}) => {
  // Safety guard: nothing renders until a real sponsor is assigned
  if (!sponsorName) return null;

  const initials = sponsorName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const Logo = sponsorLogoUrl ? (
    <img
      src={sponsorLogoUrl}
      alt={sponsorName}
      style={{
        width: compact ? 28 : 44,
        height: compact ? 28 : 44,
        objectFit: 'contain',
        borderRadius: 8,
        flexShrink: 0,
        display: 'block',
      }}
    />
  ) : (
    <div style={{
      width: compact ? 28 : 44,
      height: compact ? 28 : 44,
      borderRadius: 8,
      background: `${accent}18`,
      border: `1px solid ${accent}28`,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      fontSize: compact ? 10 : 13,
      fontWeight: 800,
      color: accent,
      letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );

  /* ── Compact bar ────────────────────────────────���──────────── */
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderRadius: 14,
        background: '#FAFBFF',
        border: '1px solid #EEF1F7',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.36)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {Logo}
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744' }}>{sponsorName}</span>
        {message && (
          <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.52)', flex: 1, minWidth: 0 }}>{message}</span>
        )}
        {sponsorUrl && (
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{ fontSize: 12.5, fontWeight: 700, color: accent, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 'auto', flexShrink: 0 }}
          >
            Learn more →
          </a>
        )}
      </div>
    );
  }

  /* ── Full panel ────────────────────────────────────────────── */
  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 22,
      background: '#FFFFFF',
      border: '1px solid #EEF1F7',
      boxShadow: '0 2px 14px rgba(26,39,68,0.05)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.34)', marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        {Logo}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: message ? 5 : 0, lineHeight: 1.2 }}>
            {sponsorName}
          </div>
          {message && (
            <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.6, margin: 0 }}>{message}</p>
          )}
        </div>
        {sponsorUrl && (
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{ fontSize: 13, fontWeight: 700, color: accent, textDecoration: 'none', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 10, border: `1px solid ${accent}28`, background: `${accent}08`, flexShrink: 0, transition: 'background .13s', display: 'inline-block' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${accent}16`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${accent}08`; }}
          >
            Learn more
          </a>
        )}
      </div>
    </div>
  );
};

export default SponsoredPlacement;
