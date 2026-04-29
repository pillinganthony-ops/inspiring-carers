// CountyHero — standardised county page hero section.
// Source of truth: PlacesToVisit.jsx hero (confirmed aligned with Wellbeing, Events,
// and Things To Do after the May 2026 hero standardisation pass).
//
// Props:
//   county       string   — 'cornwall', 'devon', etc. (countyLabel derived internally)
//   pageName     string   — 'Places to Visit' (used in breadcrumb last segment)
//   eyebrow      string   — 'Places to Visit' (pill badge prefix; ' · County' appended)
//   title        node     — h1 content
//   subtitle     node     — paragraph content (may include inline data counts)
//   stats        array    — [{ n: number, l: string }] — rendered as stat row; omit or
//                           pass empty array to hide the row
//   onNavigate   function — for breadcrumb Home link
//
// Optional styling props (defaults match PlacesToVisit purple-navy):
//   gradient     string   — CSS background value for the section
//   accent       string   — hex colour for eyebrow pill tint and text
//   orbTopColor  string   — rgba for the top-right decorative orb
//
// children — rendered inside the container after the stats row (for page-specific notes)

import React from 'react';
import Icons from '../Icons.jsx';

const { IChevron } = Icons;

const CountyHero = ({
  county,
  pageName,
  eyebrow,
  title,
  subtitle,
  stats,
  onNavigate,
  gradient    = 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)',
  accent      = '#7B5CF5',
  orbTopColor = 'rgba(123,92,245,0.13)',
  children,
}) => {
  const countyLabel = county
    ? county.charAt(0).toUpperCase() + county.slice(1)
    : '';

  // Derive eyebrow pill colours from the accent hex
  const eyebrowBg     = `${accent}2E`;   // ~18 % opacity
  const eyebrowBorder = `${accent}4D`;   // ~30 % opacity
  const eyebrowText   = accent;

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: gradient,
      paddingTop: 48,
      paddingBottom: 48,
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${orbTopColor} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: '30%',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>

        {/* Breadcrumb — Home > County > PageName */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 14,
        }}>
          <button
            onClick={() => onNavigate('home', county)}
            style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Home
          </button>
          {countyLabel && (
            <>
              <IChevron s={12} />
              <button
                onClick={() => onNavigate('home', county)}
                style={{ color: 'rgba(255,255,255,0.60)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                {countyLabel}
              </button>
            </>
          )}
          <IChevron s={12} />
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{pageName}</span>
        </div>

        {/* Eyebrow pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: eyebrowBg, border: `1px solid ${eyebrowBorder}`,
          fontSize: 11, fontWeight: 800, color: eyebrowText,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {eyebrow}{countyLabel ? ` · ${countyLabel}` : ''}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 42px)',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1.06,
          margin: '0 0 10px',
          textWrap: 'balance',
        }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.68)',
          lineHeight: 1.6,
          margin: '0 0 16px',
          maxWidth: 520,
        }}>
          {subtitle}
        </p>

        {/* Stats row — shown only when stats array is non-empty */}
        {stats && stats.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 0,
            borderTop: '1px solid rgba(255,255,255,0.10)',
            paddingTop: 14, marginTop: 4,
          }}>
            {stats.map(({ n, l }, i) => (
              <div
                key={l}
                style={{
                  paddingRight: 18,
                  paddingLeft: i > 0 ? 18 : 0,
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Page-specific additions (e.g. map-coming note) */}
        {children}

      </div>
    </section>
  );
};

export default CountyHero;
