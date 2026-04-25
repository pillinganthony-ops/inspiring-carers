// VenueProfile — individual venue detail page.
// Loaded from venues_public by slug.
// Rendered inside PlacesToVisit or WellbeingSupport when venueSlug is set.
// Back navigation returns user to the parent listing page.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import ClaimModal from '../ClaimModal.jsx';

const { IPin } = Icons;

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
  'places-to-visit': 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)',
  'wellbeing':       'linear-gradient(150deg, #0A1F25 0%, #0F2E38 50%, #133640 100%)',
};

// ── Sub-components ─────────────────────────────────────────────────────────

const tagPill = (color) => ({
  fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5,
  background: `${color}18`, color, display: 'inline-block',
});

const SectionCard = ({ title, children }) => (
  <div className="card" style={{ padding: '18px 20px', borderRadius: 16, marginBottom: 14 }}>
    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.38)', marginBottom: 12 }}>
      {title}
    </div>
    {children}
  </div>
);

const BoolRow = ({ label, value, color }) => {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, background: value ? `${color}22` : 'rgba(26,39,68,0.06)', color: value ? color : 'rgba(26,39,68,0.35)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
        {value ? '✓' : '✗'}
      </span>
      <span style={{ fontSize: 13.5, color: value ? '#1A2744' : 'rgba(26,39,68,0.40)' }}>{label}</span>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,39,68,0.44)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: '#1A2744', lineHeight: 1.55 }}>{value}</div>
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

  // Derive non-null suitability items to avoid showing an empty section
  const suitability = venue ? [
    { label: 'Family friendly',   value: venue.family_friendly,   color: '#F5A623' },
    { label: 'Dog friendly',      value: venue.dog_friendly,       color: '#3DA832' },
    { label: 'Carer friendly',    value: venue.carer_friendly,     color: '#F4613A' },
    { label: 'Dementia friendly', value: venue.dementia_friendly,  color: '#2D9CDB' },
  ].filter((i) => i.value !== null && i.value !== undefined) : [];

  const hasAccessibility = venue && (
    venue.accessibility_info || venue.wheelchair_access !== null ||
    venue.toilets !== null || venue.parking_info || venue.public_transport_info
  );

  const hasPractical = venue && (
    venue.opening_hours || venue.seasonality ||
    venue.price_adult || venue.price_child || venue.price_family ||
    venue.address_line_1 || venue.town
  );

  return (
    <>
      <Nav activePage={backPage} onNavigate={onNavigate} session={session} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ background: heroGrad, paddingTop: 22, paddingBottom: 36, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${accent}20 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Back button */}
          <button
            onClick={goBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.62)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', padding: '6px 13px', borderRadius: 8, cursor: 'pointer', marginBottom: 22 }}
          >
            ← {backLabel}
          </button>

          {loading && (
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>Loading venue…</div>
          )}

          {!loading && venue && (
            <>
              {/* Category badges */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '3px 11px', borderRadius: 999, background: `${accent}30`, border: `1px solid ${accent}50`, color: '#FFFFFF' }}>
                  {venue.category}
                </span>
                {venue.subcategory && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.78)' }}>
                    {venue.subcategory}
                  </span>
                )}
                {venue.verified && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: 'rgba(16,185,129,0.20)', color: '#5EEAD4' }}>
                    Verified
                  </span>
                )}
                {venue.featured && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: 'rgba(245,166,35,0.22)', color: '#FDE68A' }}>
                    Featured
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 style={{ fontSize: 'clamp(24px, 4.5vw, 44px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 10px', textWrap: 'balance' }}>
                {venue.name}
              </h1>

              {/* Location line */}
              {(venue.town || venue.county || venue.postcode) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'rgba(255,255,255,0.58)', marginBottom: 14 }}>
                  <IPin s={13} />
                  {[venue.town, venue.county, venue.postcode].filter(Boolean).join(', ')}
                </div>
              )}

              {/* Short description */}
              {venue.short_description && (
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.74)', lineHeight: 1.65, margin: '0 0 18px', maxWidth: 600 }}>
                  {venue.short_description}
                </p>
              )}

              {/* Quick info badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {venue.free_or_paid && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 7, background: venue.free_or_paid === 'Free' ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.12)', color: venue.free_or_paid === 'Free' ? '#5EEAD4' : 'rgba(255,255,255,0.72)' }}>
                    {venue.free_or_paid}
                  </span>
                )}
                {venue.indoor_outdoor && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 7, background: 'rgba(45,156,219,0.20)', color: '#7DD3FC' }}>
                    {venue.indoor_outdoor}
                  </span>
                )}
                {venue.wheelchair_access && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 7, background: 'rgba(123,92,245,0.22)', color: '#C4B5FD' }}>
                    ♿ Wheelchair accessible
                  </span>
                )}
                {venue.carer_friendly && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 7, background: 'rgba(244,97,58,0.22)', color: '#FCA5A5' }}>
                    Carer friendly
                  </span>
                )}
                {venue.dog_friendly && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 7, background: 'rgba(61,168,50,0.22)', color: '#86EFAC' }}>
                    Dog friendly
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 28, paddingBottom: 56, background: '#FAFBFF', minHeight: '40vh' }}>
        <div className="container">

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: 18, borderRadius: 16, minHeight: 180 }}>
                  <div style={{ height: 12, width: '70%', borderRadius: 6, background: '#E4ECF8', marginBottom: 14 }} />
                  <div style={{ height: 10, width: '92%', borderRadius: 6, background: '#EAF0FA', marginBottom: 8 }} />
                  <div style={{ height: 10, width: '60%', borderRadius: 6, background: '#EAF0FA' }} />
                </div>
              ))}
            </div>
          )}

          {/* Error / not found */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{error.includes('not found') ? '🔍' : '⚠️'}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>
                {error.includes('not found') ? 'Venue not found' : 'Could not load venue'}
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 22, maxWidth: 380, margin: '0 auto 22px' }}>{error}</div>
              <button onClick={goBack} className="btn btn-gold btn-sm">← Back to {backLabel}</button>
            </div>
          )}

          {/* Venue detail */}
          {!loading && !error && venue && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>

              {/* ── Left column ── */}
              <div>
                {/* Full description */}
                {venue.full_description && venue.full_description !== venue.short_description && (
                  <SectionCard title="About this venue">
                    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.70)', lineHeight: 1.72, margin: 0, whiteSpace: 'pre-line' }}>
                      {venue.full_description}
                    </p>
                  </SectionCard>
                )}

                {/* Suitability */}
                {suitability.length > 0 && (
                  <SectionCard title="Suitability">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {suitability.map((item) => (
                        <BoolRow key={item.label} label={item.label} value={item.value} color={item.color} />
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Features & best for */}
                {(venue.features?.length > 0 || venue.best_for?.length > 0) && (
                  <SectionCard title="Highlights">
                    {venue.features?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: venue.best_for?.length > 0 ? 12 : 0 }}>
                        {venue.features.map((f) => <span key={f} style={tagPill(accent)}>{f}</span>)}
                      </div>
                    )}
                    {venue.best_for?.length > 0 && (
                      <>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,39,68,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Best for</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {venue.best_for.map((b) => <span key={b} style={tagPill('#7B5CF5')}>{b}</span>)}
                        </div>
                      </>
                    )}
                  </SectionCard>
                )}
              </div>

              {/* ── Right column ── */}
              <div>
                {/* Practical information */}
                {hasPractical && (
                  <SectionCard title="Practical information">
                    <InfoRow label="Opening hours"   value={venue.opening_hours} />
                    <InfoRow label="Seasonality"     value={venue.seasonality} />
                    {venue.price_adult  != null && <InfoRow label="Adult price"  value={`£${venue.price_adult}`} />}
                    {venue.price_child  != null && <InfoRow label="Child price"  value={`£${venue.price_child}`} />}
                    {venue.price_family != null && <InfoRow label="Family price" value={`£${venue.price_family}`} />}
                    <InfoRow label="Address" value={[venue.address_line_1, venue.address_line_2, venue.town, venue.postcode].filter(Boolean).join(', ')} />
                  </SectionCard>
                )}

                {/* Accessibility */}
                {hasAccessibility && (
                  <SectionCard title="Accessibility">
                    <BoolRow label="Wheelchair accessible" value={venue.wheelchair_access} color="#7B5CF5" />
                    <BoolRow label="Toilets available"     value={venue.toilets}           color="#2D9CDB" />
                    <InfoRow label="Accessibility notes"   value={venue.accessibility_info} />
                    <InfoRow label="Parking"               value={venue.parking_info} />
                    <InfoRow label="Public transport"      value={venue.public_transport_info} />
                  </SectionCard>
                )}

                {/* Contact & booking */}
                {(venue.website || venue.booking_url || venue.phone) && (
                  <SectionCard title="Contact & booking">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {venue.website && (
                        <a href={venue.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 13.5, fontWeight: 700, color: accent, background: `${accent}14`, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                          Visit website →
                        </a>
                      )}
                      {venue.booking_url && venue.booking_url !== venue.website && (
                        <a href={venue.booking_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744', background: 'rgba(26,39,68,0.06)', padding: '10px 14px', borderRadius: 10, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                          Book / reserve →
                        </a>
                      )}
                      {venue.phone && <InfoRow label="Phone" value={venue.phone} />}
                    </div>
                  </SectionCard>
                )}

                {/* Claim panel */}
                <div className="card" style={{ padding: '16px 18px', borderRadius: 16, border: '1px dashed rgba(26,39,68,0.16)', background: 'rgba(26,39,68,0.015)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>Own or manage this place?</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.52)', lineHeight: 1.55, margin: '0 0 12px' }}>
                    Claim this listing to update details, add photos and manage your profile.
                  </p>
                  <button
                    onClick={() => setClaimOpen(true)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(26,39,68,0.06)', color: '#1A2744', fontWeight: 700, fontSize: 13.5, border: '1px solid rgba(26,39,68,0.12)', cursor: 'pointer' }}
                  >
                    Claim this listing
                  </button>
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
