// VenueProfile — premium individual venue detail page.
// Loaded from venues_public by slug.
// Rendered inside PlacesToVisit or WellbeingSupport when venueSlug is set.
// Back navigation returns user to the parent listing page.
// No schema changes, no routing changes — visual upgrade only.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import ClaimModal from '../ClaimModal.jsx';
import {
  Route, Mountain, Leaf, Landmark, Waves, Castle, Train,
  Theater, Palette, Sailboat, Building2, TreePine,
  MapPin, Compass, FerrisWheel, Flower2, Users, PawPrint,
  ShoppingBag, Gem, Bird, HeartHandshake, Sparkles, Star,
  Heart, Tent, Coffee,
} from 'lucide-react';

const { IPin, IArrow } = Icons;

// ── Constants ──────────────────────────────────────────────────────────────

const BACK_LABELS = {
  'places-to-visit': 'Places to Visit',
  'wellbeing':       'Wellbeing Support',
};

const PAGE_ACCENT = {
  'places-to-visit': '#7B5CF5',
  'wellbeing':       '#0D9488',
};

const PAGE_HERO = {
  'places-to-visit': 'linear-gradient(150deg, #160B30 0%, #261048 50%, #301558 100%)',
  'wellbeing':       'linear-gradient(150deg, #071A20 0%, #0C2830 50%, #102E38 100%)',
};

// Premium icon map — lucide-react, consistent 1.5 stroke, no emojis
const SUBCAT_ICONS = {
  // Nature & outdoors
  'Beach':                Waves,
  'Garden':               Leaf,
  'Walking Route':        Route,
  'Nature Reserve':       TreePine,
  'Wildlife':             Bird,
  'Outdoor Activity':     Mountain,
  'Adventure':            Compass,
  'Watersports':          Sailboat,
  'Boat Trip':            Sailboat,
  'Tent':                 Tent,
  // Culture & heritage
  'Museum':               Landmark,
  'Historic Site':        Castle,
  'Heritage Railway':     Train,
  'Landmark':             MapPin,
  'Theatre':              Theater,
  'Arts & Culture':       Palette,
  'Art Gallery':          Palette,
  // Wellbeing & community
  'Wellbeing':            HeartHandshake,
  'Spa':                  Flower2,
  'Community Attraction': Users,
  'Community Space':      Users,
  // Family & entertainment
  'Family Attraction':    Sparkles,
  'Theme Park':           FerrisWheel,
  'Indoor Activity':      Building2,
  'Rainy Day':            Coffee,
  'Animal Park':          PawPrint,
  'Free Attraction':      Gem,
  'Shopping Village':     ShoppingBag,
};

// Per-category fallback when subcategory has no match
const CATEGORY_FALLBACK = {
  'Days Out':    Landmark,
  'Attractions': Star,
  'Wellbeing':   HeartHandshake,
};

const DefaultVenueIcon = MapPin;

// ── Shared styles ──────────────────────────────────────────────────────────

const tagPill = (color) => ({
  fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
  background: `${color}18`, color, display: 'inline-block',
});

// ── Sub-components ─────────────────────────────────────────────────────────

const SectionCard = ({ title, accent, children }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, marginBottom: 14 }}>
    <div style={{ height: 3, background: `linear-gradient(90deg, ${accent || '#7B5CF5'}, ${accent || '#7B5CF5'}44)` }} />
    <div style={{ padding: '16px 20px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.38)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  </div>
);

// BoolRow: true = colored chip, false = dimmed label, null = hidden
const BoolRow = ({ label, value, color }) => {
  if (value === null || value === undefined) return null;
  if (value) {
    return (
      <span style={{ ...tagPill(color), marginRight: 6, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 10 }}>✓</span> {label}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'rgba(26,39,68,0.04)', color: 'rgba(26,39,68,0.30)', display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 6, marginBottom: 6 }}>
      <span style={{ fontSize: 10 }}>✗</span> {label}
    </span>
  );
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #F0F4FA' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,39,68,0.40)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: '#1A2744', lineHeight: 1.6 }}>{value}</div>
    </div>
  );
};

// Premium illustration card — lucide icon in frosted-glass circular badge, no emojis
const VenueIllustration = ({ venue, accent }) => {
  const IconComp = SUBCAT_ICONS[venue.subcategory]
    || CATEGORY_FALLBACK[venue.category]
    || DefaultVenueIcon;

  return (
    <div style={{
      borderRadius: 24,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
      border: '1px solid rgba(255,255,255,0.13)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      padding: '36px 22px',
      minHeight: 268,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
      position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      {/* Ambient radial glow — inherits accent */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, ${accent}2E 0%, transparent 68%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -56, right: -56, width: 190, height: 190, borderRadius: '50%', background: `${accent}16`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -44, left: -44, width: 150, height: 150, borderRadius: '50%', background: `${accent}0E`, pointerEvents: 'none' }} />

      {/* Icon badge — glass circle with outer glow ring */}
      <div style={{ position: 'relative' }}>
        {/* Outer glow */}
        <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: `radial-gradient(circle, ${accent}32 0%, transparent 68%)`, pointerEvents: 'none' }} />
        {/* Glass circle */}
        <div style={{
          width: 86, height: 86, borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)',
          border: '1.5px solid rgba(255,255,255,0.26)',
          boxShadow: `0 10px 40px ${accent}38, 0 2px 10px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.20)`,
          display: 'grid', placeItems: 'center',
          position: 'relative',
        }}>
          <IconComp size={34} color="#FFFFFF" strokeWidth={1.5} />
        </div>
      </div>

      {/* Subcategory + location */}
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.01em' }}>
          {venue.subcategory || venue.category}
        </div>
        {venue.town && (
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.46)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <IPin s={11} /> {venue.town}{venue.county ? `, ${venue.county}` : ''}
          </div>
        )}
      </div>

      {/* Quick attribute pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {venue.free_or_paid === 'Free' && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.22)', color: '#5EEAD4' }}>Free entry</span>
        )}
        {venue.wheelchair_access && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(123,92,245,0.22)', color: '#C4B5FD' }}>♿ Accessible</span>
        )}
        {venue.dog_friendly && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(61,168,50,0.22)', color: '#86EFAC' }}>Dogs welcome</span>
        )}
        {venue.carer_friendly && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(244,97,58,0.22)', color: '#FCA5A5' }}>Carer friendly</span>
        )}
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────

const VenueProfile = ({ slug, county, backPage, onNavigate, session }) => {
  const accent    = PAGE_ACCENT[backPage]  || '#7B5CF5';
  const heroGrad  = PAGE_HERO[backPage]    || PAGE_HERO['places-to-visit'];
  const backLabel = BACK_LABELS[backPage]  || 'Back';

  const [venue,     setVenue]     = React.useState(null);
  const [loading,   setLoading]   = React.useState(true);
  const [error,     setError]     = React.useState(null);
  const [claimOpen, setClaimOpen] = React.useState(false);

  React.useEffect(() => {
    if (!slug) { setLoading(false); setError('No venue specified.'); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (!cancelled) { setError('Database not available.'); setLoading(false); }
        return;
      }
      try {
        const { data, error: dbErr } = await supabase
          .from('venues_public')
          .select('*')
          .eq('slug', slug)
          .single();

        if (dbErr) throw dbErr;
        if (!cancelled) { setVenue(data); setLoading(false); }
      } catch (err) {
        if (!cancelled) {
          const notFound = err.code === 'PGRST116' || err.message?.includes('0 rows');
          setError(notFound ? 'Venue not found.' : (err.message || 'Could not load venue.'));
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [slug]);

  const goBack = () => onNavigate(backPage, county || 'cornwall');

  // Non-null suitability items only
  const suitability = venue ? [
    { label: 'Family friendly',   value: venue.family_friendly,   color: '#F5A623' },
    { label: 'Dog friendly',      value: venue.dog_friendly,       color: '#3DA832' },
    { label: 'Carer friendly',    value: venue.carer_friendly,     color: '#F4613A' },
    { label: 'Dementia friendly', value: venue.dementia_friendly,  color: '#2D9CDB' },
    { label: 'Wheelchair access', value: venue.wheelchair_access,  color: '#7B5CF5' },
    { label: 'Toilets',           value: venue.toilets,            color: '#0D9488' },
  ].filter((i) => i.value !== null && i.value !== undefined) : [];

  const hasPractical = venue && (
    venue.opening_hours || venue.seasonality || venue.address_line_1 || venue.town ||
    venue.price_adult != null || venue.price_child != null || venue.price_family != null
  );

  const hasAccessibility = venue && (
    venue.accessibility_info || venue.parking_info || venue.public_transport_info
  );

  const hasHighlights = venue && (
    (venue.features?.length > 0) || (venue.best_for?.length > 0)
  );

  return (
    <>
      <Nav activePage={backPage} onNavigate={onNavigate} session={session} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ background: heroGrad, paddingTop: 24, paddingBottom: 44, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '20%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Back button */}
          <button
            onClick={goBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.60)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 24 }}
          >
            ← {backLabel}
          </button>

          {/* Loading in hero */}
          {loading && (
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 15 }}>Loading venue…</div>
          )}

          {/* Hero content */}
          {!loading && venue && (
            <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>

              {/* ── Left: metadata ── */}
              <div style={{ flex: '1 1 340px', minWidth: 0 }}>

                {/* Badges row */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 12px', borderRadius: 999, background: `${accent}35`, border: `1px solid ${accent}55`, color: '#FFFFFF' }}>
                    {venue.category}
                  </span>
                  {venue.subcategory && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.82)' }}>
                      {venue.subcategory}
                    </span>
                  )}
                  {venue.free_or_paid && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: venue.free_or_paid === 'Free' ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.10)', color: venue.free_or_paid === 'Free' ? '#5EEAD4' : 'rgba(255,255,255,0.65)' }}>
                      {venue.free_or_paid}
                    </span>
                  )}
                  {venue.verified && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.22)', color: '#5EEAD4' }}>
                      ✓ Verified
                    </span>
                  )}
                  {venue.featured && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,166,35,0.22)', color: '#FDE68A' }}>
                      ★ Featured
                    </span>
                  )}
                </div>

                {/* Name — H1 for SEO */}
                <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 10px', textWrap: 'balance' }}>
                  {venue.name}
                </h1>

                {/* Location */}
                {(venue.town || venue.county) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
                    <IPin s={13} />
                    {[venue.town, venue.county, venue.postcode].filter(Boolean).join(', ')}
                  </div>
                )}

                {/* Short description — intro paragraph */}
                {venue.short_description && (
                  <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.76)', lineHeight: 1.68, margin: '0 0 22px', maxWidth: 560 }}>
                    {venue.short_description}
                  </p>
                )}

                {/* Quick suitability pills in hero */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 26 }}>
                  {venue.indoor_outdoor && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: 'rgba(45,156,219,0.22)', color: '#7DD3FC' }}>
                      {venue.indoor_outdoor}
                    </span>
                  )}
                  {venue.wheelchair_access && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: 'rgba(123,92,245,0.22)', color: '#C4B5FD' }}>
                      ♿ Wheelchair accessible
                    </span>
                  )}
                  {venue.carer_friendly && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: 'rgba(244,97,58,0.22)', color: '#FCA5A5' }}>
                      Carer friendly
                    </span>
                  )}
                  {venue.dog_friendly && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: 'rgba(61,168,50,0.22)', color: '#86EFAC' }}>
                      Dog friendly
                    </span>
                  )}
                  {venue.family_friendly && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: 'rgba(245,166,35,0.22)', color: '#FDE68A' }}>
                      Family friendly
                    </span>
                  )}
                </div>

                {/* Hero CTAs */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {venue.website && (
                    <a
                      href={venue.website} target="_blank" rel="noopener noreferrer"
                      className="btn btn-gold"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}
                    >
                      Visit website <IArrow s={13} />
                    </a>
                  )}
                  <button
                    onClick={() => setClaimOpen(true)}
                    style={{ padding: '11px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}
                  >
                    Claim this listing
                  </button>
                </div>
              </div>

              {/* ── Right: illustration card ── */}
              <div style={{ flex: '0 0 260px', maxWidth: '100%' }}>
                <VenueIllustration venue={venue} accent={accent} />
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 32, paddingBottom: 60, background: '#F7F9FC', minHeight: '40vh' }}>
        <div className="container">

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card" style={{ padding: 20, borderRadius: 16, minHeight: 160 }}>
                  <div style={{ height: 3, background: '#E4ECF8', borderRadius: 2, marginBottom: 16 }} />
                  <div style={{ height: 11, width: '45%', borderRadius: 6, background: '#EAF0FA', marginBottom: 14 }} />
                  <div style={{ height: 13, width: '80%', borderRadius: 6, background: '#E4ECF8', marginBottom: 10 }} />
                  <div style={{ height: 10, width: '65%', borderRadius: 6, background: '#EAF0FA', marginBottom: 8 }} />
                  <div style={{ height: 10, width: '90%', borderRadius: 6, background: '#EAF0FA' }} />
                </div>
              ))}
            </div>
          )}

          {/* Error / not found */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '72px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{error.includes('not found') ? '🔍' : '⚠️'}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>
                {error.includes('not found') ? 'Venue not found' : 'Could not load venue'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.55)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>{error}</div>
              <button onClick={goBack} className="btn btn-gold btn-sm">← Back to {backLabel}</button>
            </div>
          )}

          {/* Venue detail — two-column responsive grid */}
          {!loading && !error && venue && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, alignItems: 'start' }}>

              {/* ── Left column ── */}
              <div>
                {/* About this place */}
                {venue.full_description && venue.full_description !== venue.short_description && (
                  <SectionCard title="About this place" accent={accent}>
                    <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
                      {venue.full_description}
                    </p>
                  </SectionCard>
                )}

                {/* Suitability */}
                {suitability.length > 0 && (
                  <SectionCard title="Suitability" accent={accent}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                      {suitability.map((item) => (
                        <BoolRow key={item.label} label={item.label} value={item.value} color={item.color} />
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Features & Best for */}
                {hasHighlights && (
                  <SectionCard title="Highlights" accent={accent}>
                    {venue.features?.length > 0 && (
                      <div style={{ marginBottom: venue.best_for?.length > 0 ? 14 : 0 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,39,68,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Features</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {venue.features.map((f) => <span key={f} style={tagPill(accent)}>{f}</span>)}
                        </div>
                      </div>
                    )}
                    {venue.best_for?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,39,68,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Best for</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {venue.best_for.map((b) => <span key={b} style={tagPill('#7B5CF5')}>{b}</span>)}
                        </div>
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* Accessibility notes — if text present */}
                {venue.accessibility_info && (
                  <SectionCard title="Accessibility" accent="#7B5CF5">
                    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.70)', lineHeight: 1.65, margin: 0 }}>
                      {venue.accessibility_info}
                    </p>
                  </SectionCard>
                )}
              </div>

              {/* ── Right column ── */}
              <div>
                {/* Practical information */}
                {hasPractical && (
                  <SectionCard title="Practical information" accent={accent}>
                    <InfoRow label="Opening hours" value={venue.opening_hours} />
                    <InfoRow label="Seasonality"   value={venue.seasonality} />
                    {venue.price_adult  != null && <InfoRow label="Adult price"  value={`£${Number(venue.price_adult).toFixed(2)}`} />}
                    {venue.price_child  != null && <InfoRow label="Child price"  value={`£${Number(venue.price_child).toFixed(2)}`} />}
                    {venue.price_family != null && <InfoRow label="Family price" value={`£${Number(venue.price_family).toFixed(2)}`} />}
                    <InfoRow label="Address" value={[venue.address_line_1, venue.address_line_2, venue.town, venue.postcode].filter(Boolean).join(', ')} />
                  </SectionCard>
                )}

                {/* Getting there */}
                {(venue.parking_info || venue.public_transport_info) && (
                  <SectionCard title="Getting there" accent="#2D9CDB">
                    <InfoRow label="Parking"          value={venue.parking_info} />
                    <InfoRow label="Public transport"  value={venue.public_transport_info} />
                  </SectionCard>
                )}

                {/* Contact & booking */}
                {(venue.website || venue.booking_url || venue.phone) && (
                  <SectionCard title="Contact & booking" accent={accent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {venue.website && (
                        <a href={venue.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', background: accent, padding: '11px 16px', borderRadius: 10, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                          Visit website →
                        </a>
                      )}
                      {venue.booking_url && venue.booking_url !== venue.website && (
                        <a href={venue.booking_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 14, fontWeight: 700, color: '#1A2744', background: 'rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.10)', padding: '11px 16px', borderRadius: 10, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                          Book / reserve →
                        </a>
                      )}
                      {venue.phone && (
                        <div style={{ paddingTop: 8 }}>
                          <InfoRow label="Phone" value={venue.phone} />
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}

                {/* ── Claim this listing — premium panel ── */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 18, border: `1px solid ${accent}28` }}>
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: `${accent}`, marginBottom: 8 }}>
                      Venue owner?
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>
                      Claim this listing
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.6, margin: '0 0 16px' }}>
                      Update details, add photos and manage how this venue appears across Inspiring Carers. Claims are reviewed before going live.
                    </p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <button
                        onClick={() => setClaimOpen(true)}
                        style={{ padding: '11px 16px', borderRadius: 10, background: accent, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
                      >
                        Claim this listing
                      </button>
                      <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.38)', textAlign: 'center', lineHeight: 1.5 }}>
                        Free to claim · Reviewed before changes go live
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>

      {claimOpen && venue && (
        <ClaimModal venue={venue} onClose={() => setClaimOpen(false)} />
      )}

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default VenueProfile;
