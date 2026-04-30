// DiscoveryCard — reusable venue/activity card shell.
// Source of truth: Things to Do — Activities.jsx ActivityListCard (May 2026).
//
// Required props:
//   title        string             — card heading (16.5px / 800 weight)
//   accentColor  string             — hex accent for strip, border, hover tint
//   onClick      function           — card-level click handler
//
// Optional visual props (all match ActivityListCard structure):
//   description       string             — short description paragraph
//   accessibilityNote string             — italic ♿ line between description and trustLine
//   tags              { label, color }[] — pill chips below description
//   image             node | (hovered: boolean) => node
//                                        — icon badge slot; render function receives hover state
//   location          string             — town / location text shown with pin icon
//   categoryLabel     string             — "Days Out · Garden" shown above location
//   trustLine         string             — italic micro-line shown after description
//   badges            { label, color, bg }[]
//                                        — Verified / Featured chips aligned top-right
//   children                             — CTA area (buttons, links)
//   footer                               — optional section rendered below CTAs with a border-top
//                                          separator; used by PlacesToVisit for "Claim listing"

import React from 'react';
import Icons from '../Icons.jsx';

const { IPin } = Icons;

const DiscoveryCard = ({
  title,
  description,
  accessibilityNote,
  tags         = [],
  image,
  accentColor  = '#7B5CF5',
  location,
  onClick,
  children,
  footer,
  saveButton,
  categoryLabel,
  trustLine,
  badges       = [],
}) => {
  const [hovered, setHovered] = React.useState(false);

  // image may be a plain node OR a render function that receives hover state
  const imageNode = typeof image === 'function' ? image(hovered) : image;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        position: 'relative',
        padding: 0,
        overflow: 'hidden',
        borderRadius: 22,
        border: `1px solid ${accentColor}22`,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.16s ease',
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 16px 40px ${accentColor}22, 0 4px 14px rgba(26,39,68,0.07)`;
        e.currentTarget.style.borderColor = `${accentColor}44`;
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = `${accentColor}22`;
      }}
    >
      {/* Accent top strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)`, flexShrink: 0 }} />

      {/* Save button overlay — absolute top-right, does not affect layout */}
      {saveButton}

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>

        {/* Header row: icon badge + category/location meta + verified/featured chips */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {imageNode && <div style={{ flexShrink: 0 }}>{imageNode}</div>}

          <div style={{ flex: 1, minWidth: 0 }}>
            {categoryLabel && (
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: 3 }}>
                {categoryLabel}
              </div>
            )}
            {location && (
              <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IPin s={10} /> {location}
              </div>
            )}
          </div>

          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {badges.map((b) => (
                <span
                  key={b.label}
                  style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: b.bg, color: b.color }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: 16.5, fontWeight: 800, color: '#1A2744', lineHeight: 1.28 }}>
          {title}
        </div>

        {/* Description */}
        {description && (
          <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, margin: 0 }}>
            {description}
          </p>
        )}

        {/* Accessibility note — optional, between description and trustLine */}
        {accessibilityNote && (
          <p style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
            ♿ {accessibilityNote}
          </p>
        )}

        {/* Trust micro-line */}
        {trustLine && (
          <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.36)', fontStyle: 'italic', lineHeight: 1.4 }}>
            {trustLine}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {tags.map((t) => (
              <span
                key={t.label}
                style={{
                  fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                  background: `${t.color}15`, color: t.color,
                  border: `1px solid ${t.color}28`, display: 'inline-block', lineHeight: 1.3,
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* CTA area */}
        {children && (
          <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {children}
          </div>
        )}

        {/* Footer — separator row for supplementary actions (e.g. Claim listing) */}
        {footer && (
          <div style={{ marginTop: 8, paddingTop: 9, borderTop: '1px solid #F0F4FA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

export default DiscoveryCard;
