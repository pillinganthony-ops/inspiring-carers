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
import CountyBanner from '../CountyBanner.jsx';
import CountyInterestModal from '../CountyInterestModal.jsx';

const { IArrow, ISearch, IPin, IChevron } = Icons;

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

const PlacesToVisitCountyPage = ({ onNavigate, session, county, venueSlug }) => {
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

  // Venue profile — rendered after all hooks so hook count stays constant
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

  const anyFilter = search || filterSubcat || filterPrice || filterIndoorOut || filterFamily || filterWheelchair || filterDog;
  const hasCoords = venues.some((v) => v.latitude && v.longitude);

  const clearFilters = () => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterFamily(false);
    setFilterWheelchair(false); setFilterDog(false);
  };

  // Opening-soon: explicit non-Cornwall county with no venues yet
  if (!loading && !error && venues.length === 0 && county && county !== 'cornwall') {
    return (
      <>
        <Nav activePage="places-to-visit" onNavigate={onNavigate} session={session} county={county} />
        <CountyBanner county={county} isFallback={false} onChangeCounty={(c) => onNavigate('places-to-visit', c)} />

        {/* A. Hero panel */}
        <section style={{ background: 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)', paddingTop: 64, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.18) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.28)', fontSize: 10.5, fontWeight: 800, color: '#B89EF8', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 22 }}>
              County Launch Page
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1, textWrap: 'balance' }}>
              {countyLabel} places to visit<br />is opening soon
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 28px' }}>
              We are preparing trusted days out, attractions and accessible places for carers, families and support organisations in {countyLabel}.
            </p>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 600 }}>
              {['Free to list', 'Carer-friendly focus', 'Accessible venues'].map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* B. Three value cards */}
        <section style={{ paddingTop: 56, paddingBottom: 48, background: '#FAFBFF' }}>
          <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#7B5CF5', marginBottom: 10 }}>Who benefits</div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
                {countyLabel} is being built for everyone
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { accent: '#2563EB', bg: 'rgba(37,99,235,0.08)',  title: 'For carers',        body: `Discover accessible days out and supportive venues across ${countyLabel}.` },
                { accent: '#16A34A', bg: 'rgba(22,163,74,0.08)',  title: 'For organisations', body: 'Submit local attractions, groups and community spaces to the directory.' },
                { accent: '#D97706', bg: 'rgba(217,119,6,0.08)',  title: 'For businesses',    body: 'Offer discounts, featured placement or founding sponsorship to reach carers.' },
              ].map(({ accent, bg, title, body }) => (
                <div key={title} className="card" style={{ padding: '22px 20px', borderRadius: 18, borderTop: `3px solid ${accent}` }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: accent, marginBottom: 14 }} />
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', marginBottom: 7 }}>{title}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* C. Sponsor CTA strip */}
        <section style={{ paddingBottom: 64, background: '#FAFBFF' }}>
          <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ padding: '28px 32px', borderRadius: 22, background: 'linear-gradient(135deg, #1A2744 0%, #2D3E6B 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.42)', marginBottom: 7 }}>Founding partnership</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.2 }}>
                  Become a founding {countyLabel} partner
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', margin: 0, lineHeight: 1.55 }}>
                  Founding businesses and organisations can be featured early while this county launches.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button onClick={() => onNavigate('profile')} className="btn btn-gold" style={{ fontWeight: 800, fontSize: 14, padding: '10px 22px', whiteSpace: 'nowrap' }}>
                  Submit organisation
                </button>
                <button onClick={() => onNavigate('offer-a-discount')} style={{ padding: '9px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Offer a discount
                </button>
                <button onClick={() => onNavigate('advertise')} style={{ padding: '9px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Featured sponsorship
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Nav activePage="places-to-visit" onNavigate={onNavigate} session={session} county={county} />
      <CountyBanner
        county={county}
        isFallback={!county}
        onChangeCounty={(c) => onNavigate('places-to-visit', c)}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)', paddingTop: 36, paddingBottom: 36 }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 14 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <button onClick={() => onNavigate('places-to-visit', null)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Places to Visit</button>
            {countyLabel && <><IChevron s={12} /><span style={{ color: '#FFFFFF', fontWeight: 600 }}>{countyLabel}</span></>}
          </div>

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
                  onViewProfile={(slug) => onNavigate('places-to-visit', county, slug)}
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

// ── National hub — shown when no county is set (/places-to-visit) ────────────
const PTV_COUNTY_CARDS = [
  { key: 'cornwall', label: 'Cornwall', status: 'live',        badge: 'Live now',    accent: '#7B5CF5', badgeBg: 'rgba(22,163,74,0.10)',  badgeColor: '#166534' },
  { key: 'devon',    label: 'Devon',    status: 'launching',   badge: 'Launching',   accent: '#D97706', badgeBg: 'rgba(217,119,6,0.10)',  badgeColor: '#92400E' },
  { key: 'somerset', label: 'Somerset', status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.25)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.50)' },
  { key: 'bristol',  label: 'Bristol',  status: 'coming-soon', badge: 'Coming soon', accent: 'rgba(26,39,68,0.25)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.50)' },
];

const PlacesToVisitNationalHub = ({ onNavigate, session }) => (
  <>
    <Nav activePage="places-to-visit" onNavigate={onNavigate} session={session} />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(150deg, #1A0C35 0%, #2C1452 50%, #341A60 100%)', paddingTop: 64, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.18) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.28)', fontSize: 10.5, fontWeight: 800, color: '#B89EF8', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 22 }}>
          National hub
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Days out and places to visit<br />for carers across the UK
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
          Find accessible attractions, restorative places, family-friendly days out and supportive venues in your local county.
        </p>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 600, marginTop: 28 }}>
          {['Family-friendly', 'Carer discounts available', 'Accessible venues'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />{t}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* County cards */}
    <section style={{ paddingTop: 56, paddingBottom: 56, background: '#FAFBFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#7B5CF5', marginBottom: 10 }}>Select your county</div>
          <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
            Choose your area to discover local places to visit
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {PTV_COUNTY_CARDS.map(c => {
            const isLive = c.status === 'live';
            const isLaunching = c.status === 'launching';
            return (
              <div key={c.key} className="card" style={{ padding: '22px 20px', borderRadius: 18, borderLeft: `3px solid ${c.accent}`, opacity: isLive || isLaunching ? 1 : 0.70 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2744' }}>{c.label}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: c.badgeBg, color: c.badgeColor, whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
                {isLive ? (
                  <button
                    onClick={() => onNavigate('places-to-visit', c.key)}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: '#7B5CF5', color: 'white', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', transition: 'opacity .13s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Choose {c.label}
                  </button>
                ) : (
                  <CountyInterestModal county={c.key} label={c.label} sourcePage="places-to-visit" />
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(26,39,68,0.50)', marginTop: 20, lineHeight: 1.6, maxWidth: 560, margin: '20px auto 0' }}>
          Find carer-friendly days out, attractions and venues. Choose your county above to discover local places.
        </p>
      </div>
    </section>

    {/* What you can find */}
    <section style={{ paddingTop: 56, paddingBottom: 56, background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#7B5CF5', marginBottom: 10 }}>Discover</div>
          <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>What you can find</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { title: 'Days out',               body: 'Carer-friendly attractions, parks and destinations the whole family can enjoy together.' },
            { title: 'Attractions',            body: 'Heritage sites, museums and cultural venues with accessible facilities and carer support.' },
            { title: 'Carer-friendly venues',  body: 'Places that actively welcome carers with accessible facilities, discounts and special access.' },
          ].map(({ title, body }) => (
            <div key={title} className="card" style={{ padding: '24px 22px', borderRadius: 20, borderTop: '3px solid #7B5CF5' }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1A2744', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section style={{ paddingTop: 56, paddingBottom: 56, background: '#F7F9FC' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>How it works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 28 }}>
          {[
            { n: '1', title: 'Choose your county',        body: 'Select your area above to see accessible attractions and carer-friendly venues near you.' },
            { n: '2', title: 'Explore trusted places',    body: 'Browse verified days out, attractions and venues that actively welcome carers and families.' },
            { n: '3', title: 'Register where launching',  body: 'Devon and Somerset are coming soon. Register interest to be first to know when we open.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#7B5CF5', color: 'white', fontWeight: 800, fontSize: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A2744', margin: '0 0 6px', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* For organisations */}
    <section style={{ paddingTop: 56, paddingBottom: 56, background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(123,92,245,0.05)', border: '1px solid rgba(123,92,245,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#7B5CF5', marginBottom: 7 }}>For organisations</div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1A2744', margin: '0 0 7px', lineHeight: 1.2 }}>Reach carers looking for days out</h3>
            <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.60)', margin: 0, lineHeight: 1.55 }}>
              Add your attraction, venue or destination to be found by carers searching for accessible places to visit in your county.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, flexShrink: 0 }}>
            <button onClick={() => onNavigate('profile')} style={{ padding: '10px 20px', borderRadius: 10, background: '#7B5CF5', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Get involved</button>
            <button onClick={() => onNavigate('offer-a-discount')} style={{ padding: '9px 18px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(123,92,245,0.28)', color: '#7B5CF5', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>Offer a discount</button>
          </div>
        </div>
      </div>
    </section>

    {/* CTA section */}
    <section style={{ paddingBottom: 64, background: '#FAFBFF' }}>
      <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ padding: '28px 32px', borderRadius: 22, background: 'linear-gradient(135deg, #1A2744 0%, #2D3E6B 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.42)', marginBottom: 7 }}>Get involved</div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#FFFFFF', margin: '0 0 7px', lineHeight: 1.2 }}>
              Join the places to visit network
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', margin: 0, lineHeight: 1.55 }}>
              Register your county, add a venue or become a founding sponsor of places in your area.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, flexShrink: 0 }}>
            <button
              onClick={() => onNavigate('places-to-visit', 'cornwall')}
              className="btn btn-gold"
              style={{ fontWeight: 800, fontSize: 14, padding: '10px 20px', whiteSpace: 'nowrap' }}
            >
              Choose Cornwall
            </button>
            <button
              onClick={() => onNavigate('profile')}
              style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Register your county
            </button>
            <button
              onClick={() => onNavigate('advertise')}
              style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Sponsor this category
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer onNavigate={onNavigate} />
  </>
);

// ── Public export — routes between national hub and county page ───────────────
const PlacesToVisitPage = ({ onNavigate, session, county, venueSlug }) => {
  if (!county) return <PlacesToVisitNationalHub onNavigate={onNavigate} session={session} />;
  return <PlacesToVisitCountyPage onNavigate={onNavigate} session={session} county={county} venueSlug={venueSlug} />;
};

export default PlacesToVisitPage;
