// Saved — Phase 1 saved/favourite items page.
// Data source: localStorage key "saved_items".
// No backend. Read/write handled by useSavedItems hook.

import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import CardGrid from '../shared/CardGrid.jsx';
import DiscoveryCard from '../shared/DiscoveryCard.jsx';
import useSavedItems from '../../hooks/useSavedItems.js';
import useRecentlyViewed from '../../hooks/useRecentlyViewed.js';

// ── Category → accent colour ──────────────────────────────────────────────

const CAT_ACCENT = {
  'Days Out':    '#F5A623',
  'Attractions': '#7B5CF5',
  'Wellbeing':   '#0D9488',
  'Walks':       '#5BC94A',
  'Events':      '#2D9CDB',
};
const getAccent = (cat) => CAT_ACCENT[cat] || '#7B5CF5';

// ── Category → destination page for venue profile navigation ─────────────
// Mirrors the routing logic used in Activities, PlacesToVisit, Wellbeing.

const CAT_DEST = {
  'Wellbeing':   'wellbeing',
  'Days Out':    'places-to-visit',
  'Attractions': 'places-to-visit',
};
const getDest = (cat) => CAT_DEST[cat] || 'places-to-visit';

// ── Page ─────────────────────────────────────────────────────────────────

const SavedPage = ({ onNavigate, session }) => {
  const { savedItems, toggleSave, isSaved } = useSavedItems();
  const { recentlyViewed } = useRecentlyViewed();
  const recentSlice = recentlyViewed.slice(0, 6);

  const [email,     setEmail]     = React.useState('');
  const [emailSent, setEmailSent] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setEmailSent(true);
    // Phase 1 — frontend only. Backend connection pending.
  };

  const handleOpen = (item) => {
    const dest   = getDest(item.category);
    const county = item.county ? item.county.toLowerCase() : null;
    onNavigate(dest, county, item.slug);
  };

  return (
    <>
      <Nav activePage="saved" onNavigate={onNavigate} session={session} />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)',
        paddingTop: 48, paddingBottom: 48,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.30)', fontSize: 11, fontWeight: 800, color: '#B89EF8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Saved
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 10px', textWrap: 'balance' }}>
            Your Saved
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: 0, maxWidth: 480 }}>
            Places, activities and support you've saved
            {savedItems.length > 0 && (
              <> — <strong style={{ color: '#FFFFFF' }}>{savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}</strong></>
            )}
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ paddingTop: 32, paddingBottom: 56, background: '#FAFBFF', minHeight: '50vh' }}>
        <div className="container">

          {/* Empty state */}
          {savedItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🤍</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>
                You haven't saved anything yet
              </div>
              <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 24px' }}>
                Tap the heart on any place, activity or wellbeing space to save it here.
              </p>
              <button
                onClick={() => onNavigate('activities')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: '#7B5CF5', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .13s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Explore things to do
              </button>
            </div>
          )}

          {/* Email capture CTA — soft, non-blocking, shown when items are saved */}
          {savedItems.length > 0 && (
            <div style={{ marginBottom: 28, padding: '20px 24px', borderRadius: 18, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 12px rgba(26,39,68,0.05)' }}>
              {!emailSent ? (
                <>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#7B5CF5', marginBottom: 5 }}>
                    Keep your list
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 4 }}>
                    Keep your saved list
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', margin: '0 0 14px', lineHeight: 1.55 }}>
                    Get your saved places and support options sent to your inbox so you can come back to them anytime.
                  </p>
                  <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="Enter your email"
                        style={{ padding: '9px 13px', borderRadius: 10, border: emailError ? '1.5px solid #E11D48' : '1px solid #DDE5F0', background: '#F8FAFD', fontSize: 13.5, color: '#1A2744', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', width: '100%' }}
                      />
                      {emailError && (
                        <span style={{ fontSize: 12, color: '#A03A2D' }}>{emailError}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      style={{ padding: '9px 18px', borderRadius: 10, background: '#7B5CF5', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity .13s', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Send my list
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(16,185,129,0.10)', display: 'grid', placeItems: 'center', flexShrink: 0, color: '#059669' }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="m5 12 5 5L20 7"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744', marginBottom: 2 }}>You're all set</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.50)' }}>Saved list email capture is ready for backend connection.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved cards grid */}
          {savedItems.length > 0 && (
            <CardGrid>
              {savedItems.map((item) => {
                const accent = getAccent(item.category);
                return (
                  <DiscoveryCard
                    key={item.id}
                    title={item.name}
                    accentColor={accent}
                    categoryLabel={item.category}
                    location={item.county}
                    onClick={() => handleOpen(item)}
                    saveButton={
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
                        aria-label="Remove from saved"
                        style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 999, background: `${accent}18`, border: `1.5px solid ${accent}44`, display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'transform 0.15s ease, background 0.15s', boxShadow: '0 1px 4px rgba(26,39,68,0.10)', color: accent, zIndex: 2 }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                      >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    }
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpen(item); }}
                      style={{ fontSize: 13, fontWeight: 700, color: accent, background: `${accent}14`, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'background .14s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}26`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}14`; }}
                    >
                      View details →
                    </button>
                  </DiscoveryCard>
                );
              })}
            </CardGrid>
          )}

          {/* ── Recently viewed ── */}
          {recentSlice.length > 0 && (
            <div style={{ marginTop: savedItems.length > 0 ? 48 : 0 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 800, color: '#1A2744', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  Recently viewed
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', margin: 0 }}>
                  Places you've looked at recently
                </p>
              </div>
              <CardGrid>
                {recentSlice.map((item) => {
                  const accent  = getAccent(item.category);
                  const saved   = isSaved(item.id);
                  return (
                    <DiscoveryCard
                      key={item.id}
                      title={item.name}
                      accentColor={accent}
                      categoryLabel={item.category}
                      location={item.county}
                      onClick={() => handleOpen(item)}
                      saveButton={
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
                          aria-label={saved ? 'Remove from saved' : 'Save'}
                          style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 999, background: saved ? `${accent}18` : 'rgba(255,255,255,0.92)', border: saved ? `1.5px solid ${accent}44` : '1px solid rgba(26,39,68,0.12)', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'transform 0.15s ease, background 0.15s', boxShadow: '0 1px 4px rgba(26,39,68,0.10)', color: saved ? accent : 'rgba(26,39,68,0.35)', zIndex: 2 }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                        >
                          <svg width={13} height={13} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      }
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpen(item); }}
                        style={{ fontSize: 13, fontWeight: 700, color: accent, background: `${accent}14`, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'background .14s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}26`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}14`; }}
                      >
                        View details →
                      </button>
                    </DiscoveryCard>
                  );
                })}
              </CardGrid>
            </div>
          )}

        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default SavedPage;
