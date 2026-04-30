// Wellbeing Support — live Supabase data from venues_public view.
// Shows category = 'Wellbeing' for selected county.
// DB category is NOT renamed — only mapped for public page label.
// Calmer, more supportive tone than Places to Visit.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import ClaimModal from '../ClaimModal.jsx';
import VenueProfile from './VenueProfile.jsx';
import CountyInterestModal from '../CountyInterestModal.jsx';
import SponsorCTA from '../SponsorCTA.jsx';
import SponsorStrip from '../shared/SponsorStrip.jsx';
import CardGrid from '../shared/CardGrid.jsx';
import CountyCategoryNav from '../CountyCategoryNav.jsx';
import CountyWalksBanner from '../CountyWalksBanner.jsx';
import CountyHero from '../shared/CountyHero.jsx';
import DiscoveryCard from '../shared/DiscoveryCard.jsx';
import FilterStrip from '../shared/FilterStrip.jsx';
import SkeletonCard from '../shared/SkeletonCard.jsx';
import { COUNTY_DB, COUNTY_LABELS } from '../../lib/countyConfig.js';
import useSavedItems from '../../hooks/useSavedItems.js';
import { Leaf } from 'lucide-react';

const { IArrow } = Icons;

// ── Constants ──────────────────────────────────────────────────────────────

const WELLBEING_ACCENT = '#0D9488'; // teal — calm, therapeutic
const WB_BADGE_BG = 'linear-gradient(145deg, rgba(13,148,136,0.64), rgba(9,110,100,0.46))';
const WB_PAGE_SIZE = 12;

// ── Venue card ─────────────────────────────────────────────────────────────

const WellbeingCard = ({ venue, onClaim, onViewProfile }) => {
  const { isSaved, toggleSave } = useSavedItems();
  const accent = WELLBEING_ACCENT;
  const saved  = isSaved(venue.id);

  const tags = [];
  if (venue.free_or_paid)      tags.push({ label: venue.free_or_paid,  color: venue.free_or_paid === 'Free' ? '#0D7A55' : '#1A2744' });
  if (venue.indoor_outdoor)    tags.push({ label: venue.indoor_outdoor, color: '#2D9CDB' });
  if (venue.carer_friendly)    tags.push({ label: 'Carer friendly',     color: '#F4613A' });
  if (venue.wheelchair_access) tags.push({ label: 'Wheelchair',         color: '#7B5CF5' });
  if (venue.family_friendly)   tags.push({ label: 'Family friendly',    color: '#F5A623' });
  if (venue.dog_friendly)      tags.push({ label: 'Dog friendly',       color: '#3DA832' });

  const trustLine = venue.carer_friendly
    ? 'Carer-friendly space · Wellbeing support'
    : venue.wheelchair_access
      ? 'Accessible space · Wellbeing support'
      : 'Wellbeing place · Check details before visiting';

  const badges = [
    ...(venue.verified ? [{ label: '✓ Verified', color: '#0D7A55', bg: 'rgba(16,185,129,0.10)' }] : []),
    ...(venue.featured ? [{ label: 'Featured',   color: '#B45309', bg: 'rgba(245,166,35,0.12)' }] : []),
  ];

  return (
    <DiscoveryCard
      title={venue.name}
      description={venue.short_description}
      accessibilityNote={venue.accessibility_info}
      tags={tags}
      image={(isHovered) => (
        <div style={{
          width: 52, height: 52, borderRadius: 15, flexShrink: 0,
          background: WB_BADGE_BG,
          border: `1px solid ${accent}33`,
          boxShadow: isHovered ? `0 10px 24px ${accent}28` : `0 8px 20px ${accent}22`,
          display: 'grid', placeItems: 'center',
          transform: isHovered ? 'translateY(-2px) scale(1.03)' : 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.04)', display: 'grid', placeItems: 'center' }}>
            <Leaf size={22} color={accent} strokeWidth={1.8} />
          </div>
        </div>
      )}
      accentColor={accent}
      location={venue.town}
      categoryLabel={`Wellbeing${venue.subcategory ? ` · ${venue.subcategory}` : ''}`}
      trustLine={trustLine}
      badges={badges}
      onClick={() => onViewProfile(venue.slug)}
      saveButton={
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(venue); }}
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
      footer={
        <>
          <span style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.40)' }}>Own or manage this place?</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClaim(venue); }}
            style={{ fontSize: 11.5, fontWeight: 700, color: '#1A2744', background: 'rgba(26,39,68,0.05)', border: '1px solid rgba(26,39,68,0.12)', padding: '4px 10px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .14s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.09)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.05)'; }}
          >
            Claim listing
          </button>
        </>
      }
    >
      <button
        onClick={(e) => { e.stopPropagation(); onViewProfile(venue.slug); }}
        style={{ fontSize: 13, fontWeight: 700, color: accent, background: `${accent}14`, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'background .14s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}26`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}14`; }}
      >
        View details →
      </button>
      {venue.website && (
        <a
          href={venue.website} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.50)', background: 'rgba(26,39,68,0.05)', padding: '8px 14px', borderRadius: 9, textDecoration: 'none', display: 'inline-block', transition: 'background .14s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.09)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,39,68,0.05)'; }}
        >
          Website ↗
        </a>
      )}
    </DiscoveryCard>
  );
};

// ── Skeleton loading cards ─────────────────────────────────────────────────

// ── Page component ─────────────────────────────────────────────────────────

const WellbeingCountyPage = ({ onNavigate, session, county, venueSlug }) => {
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
  const [filterWheelchair, setFilterWheelchair] = React.useState(false);
  const [filterDog,        setFilterDog]        = React.useState(false);
  const [filterFamily,     setFilterFamily]     = React.useState(false);
  const [filterCarer,      setFilterCarer]      = React.useState(false);
  const [visibleCount,     setVisibleCount]     = React.useState(WB_PAGE_SIZE);

  // Reset filters and pagination on county change
  React.useEffect(() => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterWheelchair(false);
    setFilterDog(false); setFilterFamily(false); setFilterCarer(false);
    setVisibleCount(WB_PAGE_SIZE);
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

  // Reset pagination when any filter or search changes
  React.useEffect(() => { setVisibleCount(WB_PAGE_SIZE); }, [search, filterSubcat, filterPrice, filterIndoorOut, filterWheelchair, filterDog, filterFamily, filterCarer]);

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

  // Venue profile — rendered after all hooks so hook count stays constant
  if (venueSlug) {
    return (
      <VenueProfile
        slug={venueSlug}
        county={county}
        backPage="wellbeing"
        onNavigate={onNavigate}
        session={session}
      />
    );
  }

  const anyFilter = search || filterSubcat || filterPrice || filterIndoorOut || filterWheelchair || filterDog || filterFamily || filterCarer;
  const hasCoords = venues.some((v) => v.latitude && v.longitude);

  const clearFilters = () => {
    setSearch(''); setFilterSubcat(''); setFilterPrice('');
    setFilterIndoorOut(''); setFilterWheelchair(false);
    setFilterDog(false); setFilterFamily(false); setFilterCarer(false);
  };

  return (
    <>
      <Nav activePage="wellbeing" onNavigate={onNavigate} session={session} county={county} />
<CountyCategoryNav county={county} activePage="wellbeing" onNavigate={onNavigate} />

      {/* ── Hero ── */}
      <CountyHero
        county={county}
        pageName="Wellbeing"
        eyebrow="Wellbeing Support"
        title={`Wellbeing in ${countyLabel}`}
        subtitle={
          <>
            Find calm, restorative and community wellbeing places across {countyLabel}.
            {!loading && venues.length > 0 && (
              <> Browse <strong style={{ color: '#FFFFFF' }}>{venues.length} places</strong> supporting carer wellbeing.</>
            )}
          </>
        }
        stats={!loading && venues.length > 0 ? [
          { n: venues.length,                                           l: 'Wellbeing places' },
          { n: venues.filter((v) => v.free_or_paid === 'Free').length,  l: 'Free' },
          { n: venues.filter((v) => v.wheelchair_access).length,        l: 'Wheelchair accessible' },
          { n: venues.filter((v) => v.carer_friendly).length,           l: 'Carer friendly' },
        ] : []}
        onNavigate={onNavigate}
        gradient="linear-gradient(150deg, #0A1F25 0%, #0F2E38 50%, #133640 100%)"
        accent="#5EEAD4"
        orbTopColor="rgba(13,148,136,0.14)"
      >
        {/* Map note — page-specific */}
        {!loading && !hasCoords && venues.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.40)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', display: 'inline-block' }}>
            Map view will appear as locations are verified.
          </div>
        )}
      </CountyHero>

      {/* ── Walks cross-link ──────────────────────────────────────────── */}
      <div style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#166534', lineHeight: 1.5 }}>
            <strong>Outdoor routes and green spaces can support wellbeing.</strong>{' '}
            Find accessible walks in your area.
          </p>
          <button
            onClick={() => onNavigate('walks', county)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#16A34A', color: '#FFFFFF', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Explore local walks <IArrow s={13} />
          </button>
        </div>
      </div>

      {/* ── Sponsorship strip ── */}
      <SponsorStrip type="wellbeing" countyLabel={countyLabel} onNavigate={onNavigate} />

      {/* ── Sticky filter bar ─────────────────────────────────────────── */}
      <section id="wb-filters" style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', paddingTop: 12, paddingBottom: 12, position: 'sticky', top: 112, zIndex: 40 }}>
        <div className="container">
          <FilterStrip
            layout="horizontal"
            search={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            searchPlaceholder="Search by name or town…"
            subcatVisible={subcatOptions.length > 0}
            subcatOptions={subcatOptions}
            subcat={filterSubcat}
            onSubcatChange={(e) => setFilterSubcat(e.target.value)}
            price={filterPrice}
            onPriceChange={(e) => setFilterPrice(e.target.value)}
            settingVisible
            setting={filterIndoorOut}
            onSettingChange={(e) => setFilterIndoorOut(e.target.value)}
            suitability={[
              { label: 'Carer friendly',  active: filterCarer,      onToggle: setFilterCarer,      color: WELLBEING_ACCENT },
              { label: 'Wheelchair',      active: filterWheelchair, onToggle: setFilterWheelchair, color: '#7B5CF5' },
              { label: 'Dog friendly',    active: filterDog,        onToggle: setFilterDog,        color: '#3DA832' },
              { label: 'Family friendly', active: filterFamily,     onToggle: setFilterFamily,     color: '#F5A623' },
            ]}
            anyFilter={anyFilter}
            onClear={clearFilters}
          />
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <section style={{ paddingTop: 32, paddingBottom: 56, background: '#F7FAFA', minHeight: '50vh' }}>
        <div className="container">

          {/* Section header */}
          {!loading && !error && venues.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', fontWeight: 800, color: '#1A2744', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                Wellbeing places in {countyLabel}
              </h2>
              <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.52)', margin: '0 0 8px', lineHeight: 1.5 }}>
                Calm spaces, supportive venues and restorative activities near you.
              </p>
              <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.46)', borderTop: '1px solid #EEF1F7', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span>
                  {filtered.length === venues.length
                    ? <><strong style={{ color: '#1A2744' }}>{venues.length}</strong> wellbeing places in {countyLabel}</>
                    : <><strong style={{ color: '#1A2744' }}>{filtered.length}</strong> of {venues.length} places</>
                  }
                </span>
                {anyFilter && filtered.length === 0 && (
                  <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear filters</button>
                )}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <CardGrid>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </CardGrid>
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
                {venues.length === 0 ? `No wellbeing places in ${countyLabel} yet` : 'No places match your filters'}
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 18, maxWidth: 360, margin: '0 auto 18px' }}>
                {venues.length === 0
                  ? `We're building this area — new wellbeing places will appear here soon.`
                  : 'Try adjusting or clearing your filters.'}
              </div>
              {anyFilter && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear all filters</button>
              )}
            </div>
          )}

          {/* Venue cards + load more */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <CardGrid marginBottom={20}>
                {filtered.slice(0, visibleCount).map((venue) => (
                  <WellbeingCard
                    key={venue.id}
                    venue={venue}
                    onClaim={setClaimVenue}
                    onViewProfile={(slug) => onNavigate('wellbeing', county, slug)}
                  />
                ))}
              </CardGrid>

              {visibleCount < filtered.length && (
                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <button onClick={() => setVisibleCount((v) => v + WB_PAGE_SIZE)} className="btn btn-ghost" style={{ minWidth: 200 }}>
                    Load more places{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(26,39,68,0.45)', marginLeft: 4 }}>
                      ({filtered.length - visibleCount} remaining)
                    </span>
                  </button>
                </div>
              )}

              {visibleCount >= filtered.length && filtered.length > WB_PAGE_SIZE && (
                <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(26,39,68,0.38)', paddingTop: 8 }}>
                  All {filtered.length} wellbeing places shown
                </div>
              )}
            </>
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

// ── National hub — shown when no county is set (/wellbeing) ──────────────────
const COUNTY_CARDS = [
  { key: 'cornwall', label: 'Cornwall',  status: 'live',         badge: 'Live now',     accent: '#16A34A', badgeBg: 'rgba(22,163,74,0.10)',  badgeColor: '#166534' },
  { key: 'devon',    label: 'Devon',     status: 'launching',    badge: 'Launching',    accent: '#D97706', badgeBg: 'rgba(217,119,6,0.10)',  badgeColor: '#92400E' },
  { key: 'somerset', label: 'Somerset',  status: 'coming-soon',  badge: 'Coming soon',  accent: 'rgba(26,39,68,0.25)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.50)' },
  { key: 'bristol',  label: 'Bristol',   status: 'coming-soon',  badge: 'Coming soon',  accent: 'rgba(26,39,68,0.25)', badgeBg: 'rgba(26,39,68,0.06)', badgeColor: 'rgba(26,39,68,0.50)' },
];

const WellbeingNationalHub = ({ onNavigate, session }) => (
  <>
    <Nav activePage="wellbeing" onNavigate={onNavigate} session={session} />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(150deg, #0A1F25 0%, #0F2E38 50%, #133640 100%)', paddingTop: 64, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(13,148,136,0.20)', border: '1px solid rgba(13,148,136,0.30)', fontSize: 10.5, fontWeight: 800, color: '#5EEAD4', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 22 }}>
          National hub
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1, textWrap: 'balance' }}>
          Wellbeing support for<br />carers across the UK
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
          Find calm spaces, wellbeing venues, support groups and restorative places in your local county.
        </p>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 600, marginTop: 28 }}>
          {['Free to access', 'Verified venues', 'Carer-focused spaces'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />{t}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* County cards */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FAFBFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#0D9488', marginBottom: 10 }}>Select your county</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>
            Choose your area to see local wellbeing places
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto' }}>
          {COUNTY_CARDS.map(c => {
            const isLive = c.status === 'live';
            return (
              <div key={c.key} className="card" style={{ padding: '28px 24px', borderRadius: 20, borderLeft: `4px solid ${c.accent}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744' }}>{c.label}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: c.badgeBg, color: c.badgeColor, whiteSpace: 'nowrap' }}>{c.badge}</span>
                </div>
                {isLive ? (
                  <button
                    onClick={() => onNavigate('wellbeing', c.key)}
                    style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: '#0D9488', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'opacity .13s', marginTop: 'auto' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Choose {c.label}
                  </button>
                ) : (
                  <CountyInterestModal county={c.key} label={c.label} sourcePage="wellbeing" />
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(26,39,68,0.50)', marginTop: 24, lineHeight: 1.6, maxWidth: 560, margin: '24px auto 0' }}>
          Discover calm, restorative and supportive places. Choose your county above to find wellbeing support near you.
        </p>
      </div>
    </section>

    {/* What you can find */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#0D9488', marginBottom: 10 }}>Discover</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>What you can find</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {[
            { title: 'Calm spaces',           body: 'Quiet, supportive venues where carers can rest, reflect and reset away from caring responsibilities.' },
            { title: 'Supportive venues',      body: 'Community centres, health hubs and wellbeing spaces that actively welcome carers near you.' },
            { title: 'Restorative activities', body: 'Classes, gentle sessions and therapeutic activities designed specifically for carers and their families.' },
          ].map(({ title, body }) => (
            <div key={title} className="card" style={{ padding: '28px 26px', borderRadius: 20, borderTop: '4px solid #0D9488' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(13,148,136,0.10)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#1A2744', margin: '0 0 10px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.7, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: '#F7F9FC' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#1A2744', margin: 0, letterSpacing: '-0.02em' }}>How it works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '1', title: 'Choose your county',        body: 'Select your area above to discover wellbeing places and supportive spaces near you.' },
            { n: '2', title: 'Explore trusted venues',    body: 'Browse verified wellbeing spaces from local organisations, health hubs and community groups.' },
            { n: '3', title: 'Register where launching',  body: 'Devon and Somerset are coming soon. Register interest to be first to know when we open.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '24px 22px', background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(26,39,68,0.06)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#0D9488', color: 'white', fontWeight: 800, fontSize: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#1A2744', margin: '0 0 7px', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <SponsorCTA
      accent="#0D9488"
      title="Promote wellbeing spaces and support"
      body="List wellbeing spaces, calm venues and community resources to help carers find the support they need in your area."
      onNavigate={onNavigate}
    />

    <Footer onNavigate={onNavigate} />
  </>
);

// ── Public export — routes between national hub and county page ───────────────
const WellbeingSupportPage = ({ onNavigate, session, county, venueSlug }) => {
  if (!county) return <WellbeingNationalHub onNavigate={onNavigate} session={session} />;
  return <WellbeingCountyPage onNavigate={onNavigate} session={session} county={county} venueSlug={venueSlug} />;
};

export default WellbeingSupportPage;
