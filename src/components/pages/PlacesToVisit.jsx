// Places to Visit — live Supabase data from venues_public view.
// Shows category = 'Days Out' OR 'Attractions' for selected county.
// DB categories are NOT renamed here — only mapped for public page label.
// If lat/lng are absent, shows list view only with a clean note.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import ClaimModal from '../ClaimModal.jsx';
import VenueProfile from './VenueProfile.jsx';

const { IArrow, ISearch, IPin } = Icons;

// ── Constants ──────────────────────────────────────────────────────────────

// county prop is lowercase slug; DB stores capitalized county name
const COUNTY_DB = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  somerset:  'Somerset',
  bristol:   'Bristol',
  dorset:    'Dorset',
  wiltshire: 'Wiltshire',
};

const COUNTY_LABELS = {
  cornwall:  'Cornwall',
  devon:     'Devon',
  somerset:  'Somerset',
  bristol:   'Bristol',
  dorset:    'Dorset',
  wiltshire: 'Wiltshire',
};

// "Places to Visit" maps to these two DB categories
const PLACES_CATEGORIES = ['Days Out', 'Attractions'];

const FREE_PAID_OPTS = [
  { value: '', label: 'Any price' },
  { value: 'Free', label: 'Free' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Mixed', label: 'Mixed' },
];

const INDOOR_OUTDOOR_OPTS = [
  { value: '', label: 'Indoor or outdoor' },
  { value: 'Indoor', label: 'Indoor' },
  { value: 'Outdoor', label: 'Outdoor' },
  { value: 'Both', label: 'Both' },
];

const CAT_ACCENT = {
  'Days Out':   '#F5A623',
  'Attractions': '#7B5CF5',
};

// ── Shared styles ──────────────────────────────────────────────────────────

const iStyle = {
  padding: '9px 13px', borderRadius: 10, border: '1px solid #E9EEF5',
  background: '#FAFBFF', fontSize: 13, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer', appearance: 'auto',
  boxSizing: 'border-box',
};

const chip = (color, active) => ({
  fontSize: 12.5, fontWeight: 700, padding: '8px 13px', borderRadius: 10,
  border: active ? `1.5px solid ${color}` : '1px solid #E9EEF5',
  background: active ? `${color}14` : '#FAFBFF',
  color: active ? color : 'rgba(26,39,68,0.60)',
  cursor: 'pointer', whiteSpace: 'nowrap',
});

const tagPill = (color) => ({
  fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
  background: `${color}18`, color, display: 'inline-block',
});

// ── Venue card ─────────────────────────────────────────────────────────────

const VenueCard = ({ venue, onClaim, onViewProfile }) => {
  const accent = CAT_ACCENT[venue.category] || '#7B5CF5';

  const tags = [];
  if (venue.free_or_paid)    tags.push({ label: venue.free_or_paid,   color: venue.free_or_paid === 'Free' ? '#0D7A55' : '#1A2744' });
  if (venue.indoor_outdoor)  tags.push({ label: venue.indoor_outdoor,  color: '#2D9CDB' });
  if (venue.family_friendly) tags.push({ label: 'Family friendly',     color: '#F5A623' });
  if (venue.wheelchair_access) tags.push({ label: 'Wheelchair',        color: '#7B5CF5' });
  if (venue.dog_friendly)    tags.push({ label: 'Dog friendly',        color: '#3DA832' });
  if (venue.carer_friendly)  tags.push({ label: 'Carer friendly',      color: '#F4613A' });

  return (
    <div
      className="card"
      onClick={() => onViewProfile(venue.slug)}
      style={{ padding: 0, overflow: 'hidden', borderRadius: 16, border: `1px solid ${accent}28`, display: 'flex', flexDirection: 'column', background: '#FFFFFF', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.16s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${accent}22, 0 4px 12px rgba(26,39,68,0.06)`; e.currentTarget.style.borderColor = `${accent}55`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${accent}28`; }}
    >
      {/* Category colour strip — gradient */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}88)`, flexShrink: 0 }} />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 7 }}>
        {/* Category + subcategory */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...tagPill(accent), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 9.5 }}>
            {venue.category}
          </span>
          {venue.subcategory && (
            <span style={tagPill('rgba(26,39,68,0.42)')}>{venue.subcategory}</span>
          )}
          {venue.verified && (
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.10)', color: '#0D7A55' }}>
              Verified
            </span>
          )}
          {venue.featured && (
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,166,35,0.12)', color: '#B45309' }}>
              Featured
            </span>
          )}
        </div>

        {/* Name — color transitions on hover; card container handles click */}
        <div
          style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', lineHeight: 1.3, transition: 'color .14s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#1A2744'; }}
        >
          {venue.name}
        </div>

        {/* Town */}
        {venue.town && (
          <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.52)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IPin s={11} /> {venue.town}
          </div>
        )}

        {/* Short description */}
        {venue.short_description && (
          <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.66)', lineHeight: 1.62, margin: 0 }}>
            {venue.short_description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {tags.map((t) => (
              <span key={t.label} style={tagPill(t.color)}>{t.label}</span>
            ))}
          </div>
        )}

        {/* CTAs — pushed to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(venue.slug); }}
            style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: `${accent}14`, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'background .14s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}26`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}14`; }}
          >
            View profile →
          </button>
          {venue.website && (
            <a
              href={venue.website} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(26,39,68,0.50)', background: 'rgba(26,39,68,0.05)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', transition: 'background .14s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.09)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.05)'; }}
            >
              Website ↗
            </a>
          )}
        </div>

        {/* Claim CTA */}
        <div style={{ marginTop: 8, paddingTop: 9, borderTop: '1px solid #F0F4FA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.40)' }}>Own or manage this place?</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClaim(venue); }}
            style={{ fontSize: 11.5, fontWeight: 700, color: '#1A2744', background: 'rgba(26,39,68,0.05)', border: '1px solid rgba(26,39,68,0.12)', padding: '4px 10px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .14s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.09)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.05)'; }}
          >
            Claim listing
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton loading cards ─────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="card" style={{ padding: 16, borderRadius: 16, minHeight: 180 }}>
    <div style={{ height: 10, width: '55%', borderRadius: 6, background: '#EAF0FA', marginBottom: 12 }} />
    <div style={{ height: 14, width: '82%', borderRadius: 6, background: '#E4ECF8', marginBottom: 10 }} />
    <div style={{ height: 10, width: '38%', borderRadius: 6, background: '#EAF0FA', marginBottom: 14 }} />
    <div style={{ height: 10, width: '94%', borderRadius: 6, background: '#EAF0FA', marginBottom: 7 }} />
    <div style={{ height: 10, width: '75%', borderRadius: 6, background: '#EAF0FA', marginBottom: 7 }} />
    <div style={{ height: 10, width: '60%', borderRadius: 6, background: '#EAF0FA' }} />
  </div>
);

// ── Page component ─────────────────────────────────────────────────────────

const PlacesToVisitPage = ({ onNavigate, session, county, venueSlug }) => {
  // Show venue profile if a slug is active
  if (venueSlug) {
    return (
      <VenueProfile
        slug={venueSlug}
        county={county}
        backPage="places-to-visit"
        onNavigate={onNavigate}
        session={session}
      />
    );
  }

  const dbCounty    = COUNTY_DB[county]    || 'Cornwall';
  const countyLabel = COUNTY_LABELS[county] || 'Cornwall';

  const [venues,     setVenues]     = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);
  const [error,      setError]      = React.useState(null);
  const [claimVenue, setClaimVenue] = React.useState(null); // venue being claimed (null = modal closed)

  // Filter state
  const [search,           setSearch]           = React.useState('');
  const [filterSubcat,     setFilterSubcat]     = React.useState('');
  const [filterPrice,      setFilterPrice]      = React.useState('');
  const [filterIndoorOut,  setFilterIndoorOut]  = React.useState('');
  const [filterFamily,     setFilterFamily]     = React.useState(false);
  const [filterWheelchair, setFilterWheelchair] = React.useState(false);
  const [filterDog,        setFilterDog]        = React.useState(false);

  // Reset filters when county changes
  React.useEffect(() => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterFamily(false);
    setFilterWheelchair(false); setFilterDog(false);
  }, [dbCounty]);

  // Load venues from Supabase
  React.useEffect(() => {
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
          .select('id, name, slug, category, subcategory, short_description, town, county, free_or_paid, indoor_outdoor, family_friendly, dog_friendly, wheelchair_access, carer_friendly, website, latitude, longitude, featured, verified')
          .eq('county', dbCounty)
          .in('category', PLACES_CATEGORIES)
          .order('name', { ascending: true });

        if (dbErr) throw dbErr;
        if (!cancelled) { setVenues(data || []); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err.message || 'Could not load places.'); setLoading(false); }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [dbCounty]);

  // Derive subcategory options from loaded data
  const subcatOptions = React.useMemo(() => {
    const seen = new Set();
    venues.forEach((v) => { if (v.subcategory) seen.add(v.subcategory); });
    return Array.from(seen).sort();
  }, [venues]);

  // Client-side filtering
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return venues.filter((v) => {
      if (q && !v.name?.toLowerCase().includes(q) && !v.town?.toLowerCase().includes(q)) return false;
      if (filterSubcat && v.subcategory !== filterSubcat)         return false;
      if (filterPrice  && v.free_or_paid !== filterPrice)         return false;
      if (filterIndoorOut && v.indoor_outdoor !== filterIndoorOut) return false;
      if (filterFamily     && !v.family_friendly)                 return false;
      if (filterWheelchair && !v.wheelchair_access)               return false;
      if (filterDog        && !v.dog_friendly)                    return false;
      return true;
    });
  }, [venues, search, filterSubcat, filterPrice, filterIndoorOut, filterFamily, filterWheelchair, filterDog]);

  const anyFilter = search || filterSubcat || filterPrice || filterIndoorOut || filterFamily || filterWheelchair || filterDog;
  const hasCoords = venues.some((v) => v.latitude && v.longitude);

  const clearFilters = () => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterFamily(false);
    setFilterWheelchair(false); setFilterDog(false);
  };

  return (
    <>
      <Nav activePage="places-to-visit" onNavigate={onNavigate} session={session} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)', paddingTop: 36, paddingBottom: 36 }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.30)', fontSize: 11, fontWeight: 800, color: '#B89EF8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Places to Visit · {countyLabel}
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 10px', textWrap: 'balance' }}>
            Days out and attractions in {countyLabel}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 520 }}>
            Carer-friendly attractions, gardens, heritage sites and family days out.
            {!loading && venues.length > 0 && (
              <> Browse <strong style={{ color: '#FFFFFF' }}>{venues.length} places</strong> across {countyLabel}.</>
            )}
          </p>

          {/* Stats row */}
          {!loading && venues.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {[
                { n: venues.length,                                          l: 'Places' },
                { n: venues.filter((v) => v.free_or_paid === 'Free').length, l: 'Free entry' },
                { n: venues.filter((v) => v.family_friendly).length,         l: 'Family friendly' },
                { n: venues.filter((v) => v.wheelchair_access).length,       l: 'Wheelchair accessible' },
              ].map(({ n, l }, i) => (
                <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Map coming note */}
          {!loading && !hasCoords && venues.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.40)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', display: 'inline-block' }}>
              Map view will appear as locations are verified.
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky filter bar ─────────────────────────────────────────── */}
      <section id="ptv-filters" style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 12, paddingBottom: 12, position: 'sticky', top: 72, zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or town…"
                style={{ ...iStyle, width: '100%', paddingLeft: 30 }}
              />
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
                <ISearch s={12} />
              </span>
            </div>

            {/* Subcategory */}
            {subcatOptions.length > 0 && (
              <select value={filterSubcat} onChange={(e) => setFilterSubcat(e.target.value)} style={{ ...iStyle, flex: '1 1 140px' }}>
                <option value="">All types</option>
                {subcatOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Price */}
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} style={{ ...iStyle, flex: '1 1 110px' }}>
              {FREE_PAID_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Indoor / outdoor */}
            <select value={filterIndoorOut} onChange={(e) => setFilterIndoorOut(e.target.value)} style={{ ...iStyle, flex: '1 1 140px' }}>
              {INDOOR_OUTDOOR_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Toggle chips */}
            <button onClick={() => setFilterFamily(!filterFamily)}     style={chip('#F5A623', filterFamily)}>Family friendly</button>
            <button onClick={() => setFilterWheelchair(!filterWheelchair)} style={chip('#7B5CF5', filterWheelchair)}>Wheelchair</button>
            <button onClick={() => setFilterDog(!filterDog)}           style={chip('#3DA832', filterDog)}>Dog friendly</button>

            {/* Clear */}
            {anyFilter && (
              <button onClick={clearFilters} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,39,68,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', whiteSpace: 'nowrap' }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <section style={{ paddingTop: 32, paddingBottom: 56, background: '#FAFBFF', minHeight: '50vh' }}>
        <div className="container">

          {/* Result count */}
          {!loading && !error && venues.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)' }}>
                {filtered.length === venues.length
                  ? <><strong style={{ color: '#1A2744' }}>{venues.length}</strong> places in {countyLabel}</>
                  : <><strong style={{ color: '#1A2744' }}>{filtered.length}</strong> of {venues.length} places</>
                }
              </div>
              {anyFilter && filtered.length === 0 && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear filters</button>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>⚠️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>Could not load places</div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 22, maxWidth: 360, margin: '0 auto 22px' }}>{error}</div>
              <button className="btn btn-gold btn-sm" onClick={() => window.location.reload()}>Try again</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>🗺️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>
                {venues.length === 0 ? 'No places listed yet' : 'No places match your filters'}
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 18, maxWidth: 360, margin: '0 auto 18px' }}>
                {venues.length === 0
                  ? `We're adding places to visit in ${countyLabel} — check back soon.`
                  : 'Try adjusting or clearing your filters.'}
              </div>
              {anyFilter && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear all filters</button>
              )}
            </div>
          )}

          {/* Venue cards */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {filtered.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onClaim={setClaimVenue}
                  onViewProfile={(slug) => onNavigate('places-to-visit', county || 'cornwall', slug)}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Claim modal — rendered at page level so only one exists at a time */}
      {claimVenue && (
        <ClaimModal venue={claimVenue} onClose={() => setClaimVenue(null)} />
      )}

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default PlacesToVisitPage;
