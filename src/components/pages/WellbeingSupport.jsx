// Wellbeing Support — live Supabase data from venues_public view.
// Shows category = 'Wellbeing' for selected county.
// DB category is NOT renamed — only mapped for public page label.
// Calmer, more supportive tone than Places to Visit.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { ISearch, IPin } = Icons;

// ── Constants ──────────────────────────────────────────────────────────────

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

const WELLBEING_ACCENT = '#0D9488'; // teal — calm, therapeutic

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

const WellbeingCard = ({ venue }) => {
  const accent = WELLBEING_ACCENT;

  const tags = [];
  if (venue.free_or_paid)      tags.push({ label: venue.free_or_paid,  color: venue.free_or_paid === 'Free' ? '#0D7A55' : '#1A2744' });
  if (venue.indoor_outdoor)    tags.push({ label: venue.indoor_outdoor, color: '#2D9CDB' });
  if (venue.carer_friendly)    tags.push({ label: 'Carer friendly',     color: '#F4613A' });
  if (venue.wheelchair_access) tags.push({ label: 'Wheelchair',         color: '#7B5CF5' });
  if (venue.family_friendly)   tags.push({ label: 'Family friendly',    color: '#F5A623' });
  if (venue.dog_friendly)      tags.push({ label: 'Dog friendly',       color: '#3DA832' });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, border: `1px solid ${accent}28`, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
      {/* Teal colour strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, #14B8A6)`, flexShrink: 0 }} />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 7 }}>
        {/* Subcategory + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...tagPill(accent), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 9.5 }}>
            Wellbeing
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

        {/* Name */}
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', lineHeight: 1.3 }}>
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
          <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.68)', lineHeight: 1.55, margin: 0 }}>
            {venue.short_description}
          </p>
        )}

        {/* Accessibility info (wellbeing-specific detail) */}
        {venue.accessibility_info && (
          <p style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
            ♿ {venue.accessibility_info}
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

        {/* Website CTA — pushed to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          {venue.website ? (
            <a
              href={venue.website} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: `${accent}14`, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
            >
              Visit website →
            </a>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(26,39,68,0.30)', fontStyle: 'italic' }}>
              No website listed
            </span>
          )}
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

const WellbeingSupportPage = ({ onNavigate, session, county }) => {
  const dbCounty    = COUNTY_DB[county]    || 'Cornwall';
  const countyLabel = COUNTY_LABELS[county] || 'Cornwall';

  const [venues,  setVenues]  = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState(null);

  // Filter state
  const [search,           setSearch]           = React.useState('');
  const [filterSubcat,     setFilterSubcat]     = React.useState('');
  const [filterPrice,      setFilterPrice]      = React.useState('');
  const [filterIndoorOut,  setFilterIndoorOut]  = React.useState('');
  const [filterWheelchair, setFilterWheelchair] = React.useState(false);
  const [filterDog,        setFilterDog]        = React.useState(false);
  const [filterFamily,     setFilterFamily]     = React.useState(false);
  const [filterCarer,      setFilterCarer]      = React.useState(false);

  // Reset filters on county change
  React.useEffect(() => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterWheelchair(false);
    setFilterDog(false); setFilterFamily(false); setFilterCarer(false);
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
          .select('id, name, slug, category, subcategory, short_description, accessibility_info, town, county, free_or_paid, indoor_outdoor, family_friendly, dog_friendly, wheelchair_access, carer_friendly, website, latitude, longitude, featured, verified')
          .eq('county', dbCounty)
          .eq('category', 'Wellbeing')
          .order('name', { ascending: true });

        if (dbErr) throw dbErr;
        if (!cancelled) { setVenues(data || []); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err.message || 'Could not load wellbeing places.'); setLoading(false); }
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
      if (filterSubcat    && v.subcategory !== filterSubcat)          return false;
      if (filterPrice     && v.free_or_paid !== filterPrice)          return false;
      if (filterIndoorOut && v.indoor_outdoor !== filterIndoorOut)    return false;
      if (filterWheelchair && !v.wheelchair_access)                   return false;
      if (filterDog        && !v.dog_friendly)                        return false;
      if (filterFamily     && !v.family_friendly)                     return false;
      if (filterCarer      && !v.carer_friendly)                      return false;
      return true;
    });
  }, [venues, search, filterSubcat, filterPrice, filterIndoorOut, filterWheelchair, filterDog, filterFamily, filterCarer]);

  const anyFilter = search || filterSubcat || filterPrice || filterIndoorOut || filterWheelchair || filterDog || filterFamily || filterCarer;
  const hasCoords = venues.some((v) => v.latitude && v.longitude);

  const clearFilters = () => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterWheelchair(false);
    setFilterDog(false); setFilterFamily(false); setFilterCarer(false);
  };

  return (
    <>
      <Nav activePage="wellbeing" onNavigate={onNavigate} session={session} />

      {/* ── Hero — calm deep teal ──────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0A1F25 0%, #0F2E38 50%, #133640 100%)', paddingTop: 36, paddingBottom: 36 }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(13,148,136,0.20)', border: '1px solid rgba(13,148,136,0.32)', fontSize: 11, fontWeight: 800, color: '#5EEAD4', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Wellbeing Support · {countyLabel}
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 10px', textWrap: 'balance' }}>
            Wellbeing Support in {countyLabel}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 520 }}>
            Find calm, restorative and community wellbeing places across {countyLabel}.
            {!loading && venues.length > 0 && (
              <> Browse <strong style={{ color: '#FFFFFF' }}>{venues.length} places</strong> supporting carer wellbeing.</>
            )}
          </p>

          {/* Stats row */}
          {!loading && venues.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {[
                { n: venues.length,                                           l: 'Wellbeing places' },
                { n: venues.filter((v) => v.free_or_paid === 'Free').length,  l: 'Free' },
                { n: venues.filter((v) => v.wheelchair_access).length,        l: 'Wheelchair accessible' },
                { n: venues.filter((v) => v.carer_friendly).length,           l: 'Carer friendly' },
              ].map(({ n, l }, i) => (
                <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Map note if no coords */}
          {!loading && !hasCoords && venues.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.40)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', display: 'inline-block' }}>
              Map view will appear as locations are verified.
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky filter bar ─────────────────────────────────────────── */}
      <section id="wb-filters" style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 12, paddingBottom: 12, position: 'sticky', top: 72, zIndex: 40 }}>
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
            <button onClick={() => setFilterCarer(!filterCarer)}       style={chip(WELLBEING_ACCENT, filterCarer)}>Carer friendly</button>
            <button onClick={() => setFilterWheelchair(!filterWheelchair)} style={chip('#7B5CF5', filterWheelchair)}>Wheelchair</button>
            <button onClick={() => setFilterDog(!filterDog)}           style={chip('#3DA832', filterDog)}>Dog friendly</button>
            <button onClick={() => setFilterFamily(!filterFamily)}     style={chip('#F5A623', filterFamily)}>Family friendly</button>

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
      <section style={{ paddingTop: 32, paddingBottom: 56, background: '#F7FAFA', minHeight: '50vh' }}>
        <div className="container">

          {/* Result count */}
          {!loading && !error && venues.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)' }}>
                {filtered.length === venues.length
                  ? <><strong style={{ color: '#1A2744' }}>{venues.length}</strong> wellbeing places in {countyLabel}</>
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
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>Could not load wellbeing places</div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 22, maxWidth: 360, margin: '0 auto 22px' }}>{error}</div>
              <button className="btn btn-gold btn-sm" onClick={() => window.location.reload()}>Try again</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>🌿</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>
                {venues.length === 0 ? 'No wellbeing places listed yet' : 'No places match your filters'}
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 18, maxWidth: 360, margin: '0 auto 18px' }}>
                {venues.length === 0
                  ? `We're adding wellbeing places in ${countyLabel} — check back soon.`
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
                <WellbeingCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default WellbeingSupportPage;
