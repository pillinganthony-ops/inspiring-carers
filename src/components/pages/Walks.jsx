import React from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import walks from '../../data/walks.json';
import { RiskAssessmentDisclaimer, WalkRiskSummary, SubmitRiskUpdateModal, downloadRiskAssessmentPDF } from '../WalkRiskAssessment.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
const { IWalks, IArrow, IChevron, IStar, IClose, IPin, IconTile, IShield, ICheck, ISparkle, ITransport } = Icons;

const WALKS_MAP_LIBRARIES = ['places'];
const WALKS_MAP_CENTER = { lat: 50.45, lng: -4.65 }; // Cornwall centre
const _walkGeoCache = {}; // module-level: persists across list/map toggles

const parseDistanceMiles = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;

  const normalized = value.trim().toLowerCase();
  const milesMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)\b/);
  if (milesMatch) return Number(milesMatch[1]);

  const numeric = normalized.match(/\d+(?:\.\d+)?/);
  return numeric ? Number(numeric[0]) : 0;
};

const parseDurationMinutes = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value !== 'string') return 0;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return 0;

  let totalMinutes = 0;
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
  const compactMatch = normalized.match(/^(\d+(?:\.\d+)?)h(\d+(?:\.\d+)?)m$/);

  if (compactMatch) {
    return Math.round(Number(compactMatch[1]) * 60 + Number(compactMatch[2]));
  }

  if (hourMatch) totalMinutes += Number(hourMatch[1]) * 60;
  if (minMatch) totalMinutes += Number(minMatch[1]);

  if (totalMinutes > 0) return Math.round(totalMinutes);

  const numericOnly = normalized.match(/^(\d+(?:\.\d+)?)$/);
  return numericOnly ? Math.round(Number(numericOnly[1])) : 0;
};

const parseBooleanFlag = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value !== 'string') return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (['true', 'yes', 'y', '1', 'available'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'none', 'unavailable'].includes(normalized)) return false;

  return false;
};

const normalizeText = (value) => `${value || ''}`.toLowerCase().replace(/\s+/g, ' ').trim();

const normalizeDifficultyLabel = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return 'Moderate';
  if (['easy', 'gentle', 'beginner', 'low'].includes(normalized)) return 'Easy';
  if (['moderate', 'medium', 'intermediate'].includes(normalized)) return 'Moderate';
  if (['hard', 'challenging', 'difficult', 'advanced', 'strenuous'].includes(normalized)) return 'Hard';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizedWalks = walks.map((walk) => ({
  ...walk,
  distanceMiles: parseDistanceMiles(walk.distanceMiles),
  durationMinutes: parseDurationMinutes(walk.durationMinutes),
  difficulty: normalizeDifficultyLabel(walk.difficulty),
  toilets: parseBooleanFlag(walk.toilets),
  refreshments: parseBooleanFlag(walk.refreshments),
  parking: parseBooleanFlag(walk.parking),
  publicTransport: parseBooleanFlag(walk.publicTransport),
  circular: parseBooleanFlag(walk.circular),
}));

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const hasAccessibleTerrain = (walk) => {
  const accessibilityText = hasText(walk.accessibility) ? walk.accessibility.toLowerCase() : '';
  return /accessible|level|easy|wheelchair|partially accessible/.test(accessibilityText);
};

const isValidWalkRecord = (walk) => {
  if (!hasText(walk.name) || !hasText(walk.area)) return false;
  if (!Number.isFinite(walk.distanceMiles) || walk.distanceMiles < 0) return false;
  if (!Number.isFinite(walk.durationMinutes) || walk.durationMinutes < 0) return false;
  return true;
};

const validWalks = normalizedWalks.filter(isValidWalkRecord);

const DATASET_TOTAL_ROUTES = validWalks.length;
const DATASET_ACCESSIBLE_ROUTES = validWalks.filter((walk) => hasText(walk.accessibility) || hasAccessibleTerrain(walk)).length;
const DATASET_PUBLIC_TRANSPORT_ROUTES = validWalks.filter((walk) => walk.publicTransport === true).length;

// Compute true dataset bounds once from the complete normalized dataset.
const DATASET_MAX_DISTANCE = Number(Math.max(...validWalks.map((w) => w.distanceMiles), 0).toFixed(1));
const DATASET_MAX_DURATION = Math.ceil(Math.max(...validWalks.map((w) => w.durationMinutes), 0));

const formatDistance = (miles) => `${miles.toFixed(1)} mi`;
const formatDuration = (minutes) => minutes < 60 ? `${minutes} mins` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const getWalkShareUrl = (walk) => {
  const mapsLink = hasText(walk.googleMapsLink) ? walk.googleMapsLink.trim() : '';
  if (mapsLink) return mapsLink;
  if (typeof window !== 'undefined') return `${window.location.origin}/walks`;
  return '/walks';
};

const getWalkShareText = (walk) => {
  const walkName = hasText(walk.name) ? walk.name.trim() : 'Cornwall walk';
  const area = hasText(walk.area) ? walk.area.trim() : 'Cornwall';
  return `Found this Cornwall walk on Inspiring Carers: ${walkName} in ${area}. Could be useful for a gentle local outing.`;
};

const mapPublicUpdateTypeToDbType = (value) => {
  const normalized = normalizeText(value);
  if (normalized === 'accessibility change') return 'accessibility_update';
  if (normalized === 'safety issue') return 'hazard_update';
  if (normalized === 'route condition update') return 'route_condition_update';
  if (normalized === 'transport / parking update') return 'route_condition_update';
  if (normalized === 'toilet / refreshments update') return 'general_update';
  if (normalized === 'incorrect information') return 'general_update';
  if (normalized === 'other') return 'general_update';
  return 'general_update';
};

const parseItinerarySteps = (itinerary) => {
  if (!hasText(itinerary)) return [];

  const chunks = itinerary
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length > 1) {
    return chunks.map((step) => step.replace(/^\d+\s*[-.)]?\s*/, '').trim()).filter(Boolean);
  }

  const numbered = itinerary
    .split(/\s(?=\d+\s*[-.)]?\s)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((step) => step.replace(/^\d+\s*[-.)]?\s*/, '').trim())
    .filter(Boolean);

  return numbered;
};

const getMapEmbedUrl = (walk) => {
  if (!hasText(walk.googleMapsLink)) return '';
  try {
    const parsed = new URL(walk.googleMapsLink);
    const query = parsed.searchParams.get('q');
    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }
  } catch {
    return '';
  }
  return '';
};

const buildWalkEmailHref = (walk) => {
  const walkName = hasText(walk.name) ? walk.name.trim() : 'Unnamed walk';
  const area = hasText(walk.area) ? walk.area.trim() : 'Not provided';
  const distance = Number.isFinite(walk.distanceMiles) && walk.distanceMiles > 0 ? formatDistance(walk.distanceMiles) : 'Not provided';
  const duration = Number.isFinite(walk.durationMinutes) && walk.durationMinutes > 0 ? formatDuration(walk.durationMinutes) : 'Not provided';
  const difficulty = hasText(walk.difficulty) ? walk.difficulty.trim() : 'Not provided';
  const highlights = hasText(walk.highlights) ? walk.highlights.trim() : 'Not provided';
  const mapsLink = hasText(walk.googleMapsLink) ? walk.googleMapsLink.trim() : 'Map link not available';

  const subject = `Cornwall Walk Recommendation: ${walkName}`;
  const body = [
    'I thought this walk may be useful.',
    '',
    `Walk: ${walkName}`,
    `Area: ${area}`,
    `Distance: ${distance}`,
    `Duration: ${duration}`,
    `Difficulty: ${difficulty}`,
    '',
    'Highlights:',
    highlights,
    '',
    'Google Maps:',
    mapsLink,
    '',
    'Shared via Inspiring Carers Walk Finder',
  ].join('\n');

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const WalkMapView = ({ walks: mapWalks, onSelectWalk }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'ic-walk-map',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: WALKS_MAP_LIBRARIES,
  });
  const [coords, setCoords] = React.useState({ ..._walkGeoCache });
  const [geocoding, setGeocoding] = React.useState(false);
  const [activeWalk, setActiveWalk] = React.useState(null);

  React.useEffect(() => {
    const postcodes = [...new Set(mapWalks.map((w) => w.postcode).filter(Boolean))];
    const uncached = postcodes.filter((pc) => !_walkGeoCache[pc]);
    if (!uncached.length) return;

    let cancelled = false;
    setGeocoding(true);

    (async () => {
      for (let i = 0; i < uncached.length; i += 100) {
        if (cancelled) break;
        const chunk = uncached.slice(i, i + 100);
        try {
          const resp = await fetch('https://api.postcodes.io/postcodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postcodes: chunk }),
          });
          const data = await resp.json();
          (data.result || []).forEach(({ query, result }) => {
            if (result?.latitude && result?.longitude) {
              _walkGeoCache[query] = { lat: result.latitude, lng: result.longitude };
            }
          });
        } catch { /* chunk failure — skip silently */ }
      }
      if (!cancelled) {
        setCoords({ ..._walkGeoCache });
        setGeocoding(false);
      }
    })();

    return () => { cancelled = true; };
  }, [mapWalks]);

  const pinWalks = mapWalks.filter((w) => w.postcode && coords[w.postcode]);

  if (!isLoaded || geocoding) {
    return (
      <div style={{ height: 480, borderRadius: 22, background: '#F0F7FF', border: '1px solid #D8E8F8', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(26,39,68,0.6)', fontSize: 15 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🗺</div>
          {geocoding ? `Locating ${mapWalks.length} walks…` : 'Loading map…'}
        </div>
      </div>
    );
  }

  if (!pinWalks.length) {
    return (
      <div style={{ height: 200, borderRadius: 22, background: '#F8FAFF', border: '1px dashed #C8D8F0', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div style={{ color: 'rgba(26,39,68,0.55)', fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color: '#1A2744', display: 'block', marginBottom: 6 }}>No map locations for current filters</strong>
          Try broadening your search to see walk pins on the map.
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,39,68,0.12)', border: '1px solid #EFF1F7', marginBottom: 18 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={WALKS_MAP_CENTER}
        zoom={9}
        options={{ mapTypeId: 'roadmap', mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}
        onClick={() => setActiveWalk(null)}
      >
        {pinWalks.map((walk) => {
          const pinDiff  = normalizeDifficultyLabel(walk.difficulty);
          const pinColor = DIFF_ACCENT[pinDiff] || DIFF_ACCENT.Moderate;
          const isActive = activeWalk?.id === walk.id;
          return (
            <MarkerF
              key={walk.id}
              position={coords[walk.postcode]}
              title={walk.name}
              onClick={() => setActiveWalk(walk)}
              zIndex={isActive ? 999 : 1}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: pinColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: isActive ? 3.5 : 2.5,
                scale: isActive ? 12 : 8,
              }}
            />
          );
        })}
        {activeWalk && coords[activeWalk.postcode] && (() => {
          const diff    = normalizeDifficultyLabel(activeWalk.difficulty);
          const accent  = DIFF_ACCENT[diff] || DIFF_ACCENT.Moderate;
          const accentBg = DIFF_BG[diff]   || DIFF_BG.Moderate;
          const accentFg = DIFF_FG[diff]   || DIFF_FG.Moderate;
          const accessible = hasAccessibleTerrain(activeWalk);
          return (
            <InfoWindowF
              position={coords[activeWalk.postcode]}
              onCloseClick={() => setActiveWalk(null)}
              options={{ maxWidth: 340, disableAutoPan: false }}
            >
              <div style={{ fontFamily: 'Inter, sans-serif', width: 300, paddingRight: 20, paddingTop: 2 }}>
                {/* Difficulty stripe */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${accent} 0%, ${accent}77 100%)`, borderRadius: 2, marginBottom: 10, marginRight: -20 }} />

                {/* Header: difficulty pill + area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 9px', borderRadius: 999, background: accent, color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{diff}</span>
                  <span style={{ fontSize: 12, color: accentFg, fontWeight: 700, background: accentBg, padding: '2px 8px', borderRadius: 999 }}>{activeWalk.area}</span>
                </div>

                {/* Walk name — 2-line clamp */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 15, color: '#1A2744', lineHeight: 1.22, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {activeWalk.name}
                </div>

                {/* Distance · Duration */}
                <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.56)', marginBottom: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span>{formatDistance(activeWalk.distanceMiles)}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{formatDuration(activeWalk.durationMinutes)}</span>
                  {activeWalk.startLocation && (
                    <>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{activeWalk.startLocation}</span>
                    </>
                  )}
                </div>

                {/* Info chips */}
                {(accessible || activeWalk.circular) && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {accessible && (
                      <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(45,156,219,0.1)', color: '#1054A0', fontSize: 11.5, fontWeight: 700 }}>♿ Accessible</span>
                    )}
                    {activeWalk.circular && (
                      <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(91,201,74,0.1)', color: '#1E6B10', fontSize: 11.5, fontWeight: 700 }}>Circular</span>
                    )}
                  </div>
                )}

                {/* Facilities row */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #EEF2FA', marginBottom: 12 }}>
                  {[
                    { label: 'Toilets', has: activeWalk.toilets },
                    { label: 'Parking', has: activeWalk.parking },
                    { label: 'Buses',   has: activeWalk.publicTransport },
                    { label: 'Cafes',   has: activeWalk.refreshments },
                  ].map(({ label, has }) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: has ? '#1E6B10' : 'rgba(26,39,68,0.32)' }}>
                      <span style={{ width: 13, height: 13, borderRadius: 999, background: has ? 'rgba(91,201,74,0.18)' : 'rgba(26,39,68,0.07)', display: 'inline-grid', placeItems: 'center', fontSize: 8, flexShrink: 0 }}>
                        {has ? '✓' : '–'}
                      </span>
                      {label}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => { onSelectWalk(activeWalk); setActiveWalk(null); }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#1A2744,#2D3E6B)', color: 'white', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 16px rgba(26,39,68,0.22)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,#263659,#1A2744)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,#1A2744,#2D3E6B)'; }}
                >
                  View walk details →
                </button>
              </div>
            </InfoWindowF>
          );
        })()}
      </GoogleMap>
      <div style={{ padding: '10px 16px', background: '#FAFBFF', borderTop: '1px solid #EFF1F7', fontSize: 12.5, color: 'rgba(26,39,68,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#5BC94A', fontWeight: 800 }}>●</span>
        {pinWalks.length} walk{pinWalks.length !== 1 ? 's' : ''} pinned · click any marker to see details
      </div>
    </div>
  );
};

const WalksPage = ({ onNavigate, session }) => {
  const [query, setQuery] = React.useState('');
  const [area, setArea] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('Any');
  const [maxDistance, setMaxDistance] = React.useState(DATASET_MAX_DISTANCE);
  const [maxDuration, setMaxDuration] = React.useState(DATASET_MAX_DURATION);
  const [filters, setFilters] = React.useState({ toilets: false, refreshments: false, parking: false, publicTransport: false, accessible: false, circular: false });
  const [detailWalk, setDetailWalk] = React.useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('list');
  const [visibleCount, setVisibleCount] = React.useState(24);

  // Reset pagination when any filter or search changes
  React.useEffect(() => {
    setVisibleCount(24);
  }, [query, area, difficulty, maxDistance, maxDuration, filters]);

  const difficultyOptions = ['Any', 'Easy', 'Moderate', 'Hard'];

  const filteredWalks = React.useMemo(() => validWalks.filter((walk) => {
    const searchText = normalizeText(`${walk.name} ${walk.area} ${walk.startLocation} ${walk.finishLocation}`);
    const normalizedQuery = normalizeText(query);
    const normalizedArea = normalizeText(area);
    if (normalizedQuery && !searchText.includes(normalizedQuery)) return false;
    if (normalizedArea && !searchText.includes(normalizedArea)) return false;
    if (difficulty !== 'Any' && normalizeDifficultyLabel(walk.difficulty) !== normalizeDifficultyLabel(difficulty)) return false;
    if (walk.distanceMiles > maxDistance) return false;
    if (walk.durationMinutes > maxDuration) return false;
    if (filters.toilets && !walk.toilets) return false;
    if (filters.refreshments && !walk.refreshments) return false;
    if (filters.parking && !walk.parking) return false;
    if (filters.publicTransport && !walk.publicTransport) return false;
    if (filters.accessible && !hasAccessibleTerrain(walk)) return false;
    if (filters.circular && !walk.circular) return false;
    return true;
  }), [query, area, difficulty, maxDistance, maxDuration, filters]);

  const clearFilters = () => {
    setQuery('');
    setArea('');
    setDifficulty('Any');
    setMaxDistance(DATASET_MAX_DISTANCE);
    setMaxDuration(DATASET_MAX_DURATION);
    setFilters({ toilets: false, refreshments: false, parking: false, publicTransport: false, accessible: false, circular: false });
  };

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Nav activePage="walks" onNavigate={onNavigate} session={session} />

      <section style={{ background: 'linear-gradient(160deg, #0F2A1A 0%, #1A3A2A 45%, #1A2744 100%)', paddingTop: 64, paddingBottom: 56, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', right: -120, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(91,201,74,0.18), transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -100, bottom: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(45,156,219,0.14), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(91,201,74,0.15)', border: '1px solid rgba(91,201,74,0.3)', borderRadius: 999, padding: '6px 16px', fontSize: 12.5, fontWeight: 800, color: '#7FDE6A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: '#5BC94A', flexShrink: 0 }} />
            Walks &amp; Wellbeing
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 64px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', marginBottom: 18, maxWidth: 720 }}>
            Discover walks across Cornwall
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 18, lineHeight: 1.72, color: 'rgba(255,255,255,0.8)', maxWidth: 580, fontWeight: 500, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
            Find accessible walks, nature routes, coastal paths and wellbeing-friendly places to explore.
          </p>

          {/* Trust chips */}
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Coastal routes', icon: '✓' },
              { label: 'Accessible options', icon: '✓' },
              { label: 'Mental wellbeing', icon: '✓' },
              { label: 'Cornwall wide', icon: '✓' },
            ].map(({ label, icon }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                <span style={{ color: '#5BC94A', fontWeight: 900 }}>{icon}</span> {label}
              </span>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 24, maxWidth: 680 }}>
            <div style={{ display: 'flex', borderRadius: 18, overflow: 'hidden', background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 18, color: 'rgba(26,39,68,0.4)', flexShrink: 0 }}>
                <IWalks s={18} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search walks, towns, beaches, woodland..."
                style={{ flex: 1, border: 'none', outline: 'none', padding: '16px 14px', fontSize: 16, background: 'transparent', color: '#1A2744', fontFamily: 'inherit' }}
              />
              <button
                onClick={() => document.getElementById('walk-filters')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '0 26px', background: 'linear-gradient(135deg,#5BC94A,#4CAF50)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => { setViewMode('list'); setTimeout(() => document.getElementById('walk-filters')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              style={{ fontSize: 16, padding: '16px 32px', fontWeight: 700, boxShadow: '0 14px 40px rgba(212,175,55,0.35)', background: 'linear-gradient(135deg,#F5A623,#D4AF37)' }}
            >
              Browse all walks <IArrow s={16} />
            </button>
            <button
              className="btn btn-lg"
              onClick={() => { setViewMode('map'); setTimeout(() => document.getElementById('walk-results')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              style={{ fontSize: 16, padding: '16px 32px', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 16 }}
            >
              View map
            </button>
          </div>
        </div>
      </section>

      <section id="walk-filters" style={{ padding: '20px 0 48px', background: '#FAFBFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow" style={{ color: '#5BC94A' }}>Filters</div>
              <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700 }}>Refine routes for your care journey</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Reset filters</button>
              <button className="btn btn-sky btn-sm" onClick={() => setMobileFiltersOpen((open) => !open)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
                <IChevron s={16} dir={mobileFiltersOpen ? 'up' : 'down'} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '325px 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: 96, alignSelf: 'start' }}>
              <div className={mobileFiltersOpen ? 'walk-filter-panel walk-filter-panel-open' : 'walk-filter-panel'} style={{ background: 'white', borderRadius: 26, border: '1px solid #EFF1F7', padding: 24, boxShadow: 'var(--shadow-md)' }}>
                <FilterField label="Search name, town or route" value={query} onChange={setQuery} placeholder="e.g. Truro, St Ives, harbour" />
                <FilterField label="Area or town" value={area} onChange={setArea} placeholder="Cornwall area" />
                <FilterSelect label="Difficulty" value={difficulty} options={difficultyOptions} onChange={setDifficulty} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginTop: 18 }}>
                  <NumberInput label="Max distance" value={maxDistance} onChange={setMaxDistance} suffix="mi" min={1} max={DATASET_MAX_DISTANCE} step={0.1} />
                  <NumberInput label="Max duration" value={maxDuration} onChange={setMaxDuration} suffix="mins" min={30} max={DATASET_MAX_DURATION} step={15} />
                </div>

                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A2744', marginBottom: 14 }}>Quick options</div>
                  {[
                    ['toilets', 'Toilets available'],
                    ['refreshments', 'Refreshments nearby'],
                    ['parking', 'Parking available'],
                    ['publicTransport', 'Public transport'],
                    ['accessible', 'Accessible terrain'],
                    ['circular', 'Circular route'],
                  ].map(([key, labelText]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={filters[key]} onChange={() => toggleFilter(key)} style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 15, color: 'rgba(26,39,68,0.84)' }}>{labelText}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div id="walk-results">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Results</div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{filteredWalks.length} walks matched</div>
                  {viewMode === 'list' && filteredWalks.length > 24 && (
                    <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.55)' }}>
                      Showing {Math.min(visibleCount, filteredWalks.length)} of {filteredWalks.length}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)' }}><strong>Max distance</strong> {maxDistance} mi</div>
                  <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)' }}><strong>Max duration</strong> {formatDuration(maxDuration)}</div>
                  <div style={{ display: 'flex', gap: 4, padding: 4, background: 'white', borderRadius: 999, border: '1px solid #EFF1F7', marginLeft: 4 }}>
                    {['list', 'map'].map((mode) => (
                      <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: viewMode === mode ? '#1A2744' : 'transparent', color: viewMode === mode ? 'white' : '#1A2744', textTransform: 'capitalize', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}>{mode}</button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredWalks.length === 0 ? (
                <div style={{ borderRadius: 24, padding: 32, background: 'white', border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No matching walks found</div>
                  <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>Try reducing filters or removing the duration and distance caps. Our collection is built for accessible wellbeing routes.</p>
                </div>
              ) : viewMode === 'map' ? (
                <div>
                  {/* Map uses full filteredWalks for all pins */}
                  <WalkMapView walks={filteredWalks} onSelectWalk={setDetailWalk} />
                  {/* Cards below map are also paginated */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18, marginTop: 4 }}>
                    {filteredWalks.slice(0, visibleCount).map((walk) => (
                      <WalkCard key={walk.id} walk={walk} onView={() => setDetailWalk(walk)} />
                    ))}
                  </div>
                  {filteredWalks.length > visibleCount && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)' }}>
                        Showing {Math.min(visibleCount, filteredWalks.length)} of {filteredWalks.length} walks
                      </span>
                      <button className="btn btn-ghost" onClick={() => setVisibleCount((n) => n + 24)}>
                        Load 24 more
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
                    {filteredWalks.slice(0, visibleCount).map((walk) => (
                      <WalkCard key={walk.id} walk={walk} onView={() => setDetailWalk(walk)} />
                    ))}
                  </div>
                  {filteredWalks.length > visibleCount ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)' }}>
                        Showing {Math.min(visibleCount, filteredWalks.length)} of {filteredWalks.length} walks
                      </span>
                      <button className="btn btn-ghost" onClick={() => setVisibleCount((n) => n + 24)}>
                        Load 24 more
                      </button>
                      {visibleCount > 24 && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setVisibleCount(24); document.getElementById('walk-results')?.scrollIntoView({ behavior: 'smooth' }); }}
                        >
                          ↑ Back to top
                        </button>
                      )}
                    </div>
                  ) : filteredWalks.length > 24 ? (
                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(26,39,68,0.45)' }}>
                      All {filteredWalks.length} walks shown
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />

      {detailWalk && <WalkDetailModal walk={detailWalk} onClose={() => setDetailWalk(null)} />}
    </>
  );
};

const FilterField = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginTop: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A2744', marginBottom: 8 }}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', borderRadius: 16, border: '1px solid #E9EEF5', padding: '14px 16px', fontSize: 15, color: '#1A2744', fontFamily: 'Inter, sans-serif', background: '#FAFBFF' }}
    />
  </div>
);

const FilterSelect = ({ label, value, options, onChange }) => (
  <div style={{ marginTop: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A2744', marginBottom: 8 }}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', borderRadius: 16, border: '1px solid #E9EEF5', padding: '14px 16px', fontSize: 15, color: '#1A2744', fontFamily: 'Inter, sans-serif', background: '#FAFBFF' }}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const NumberInput = ({ label, value, onChange, suffix, min = 0, max = 100, step = 1 }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A2744', marginBottom: 8 }}>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', display: 'block' }}
    />
    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#1A2744' }}>{value} {suffix}</div>
  </div>
);

const DIFF_ACCENT = { Easy: '#5BC94A', Moderate: '#2D9CDB', Hard: '#F5A623' };
const DIFF_BG    = { Easy: 'rgba(91,201,74,0.09)', Moderate: 'rgba(45,156,219,0.09)', Hard: 'rgba(245,166,35,0.1)' };
const DIFF_FG    = { Easy: '#1E6B10', Moderate: '#1054A0', Hard: '#7A4B00' };

const WalkCard = ({ walk, onView }) => {
  const diff   = normalizeDifficultyLabel(walk.difficulty);
  const accent = DIFF_ACCENT[diff] || DIFF_ACCENT.Moderate;
  const bg     = DIFF_BG[diff]    || DIFF_BG.Moderate;
  const fg     = DIFF_FG[diff]    || DIFF_FG.Moderate;
  const accessible = hasAccessibleTerrain(walk);

  return (
    <div
      className="card"
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 22px 52px rgba(26,39,68,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 24, border: '1px solid #E8EEF8', overflow: 'hidden', background: 'white', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    >
      {/* Difficulty-coded top stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 100%)`, flexShrink: 0 }} />

      {/* Tinted header: area + difficulty pill */}
      <div style={{ padding: '12px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: bg }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
          <IPin s={12} /> {walk.area}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: 999, background: accent, color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
          {diff}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 18px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Walk name — 2-line clamp */}
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, lineHeight: 1.22, color: '#1A2744', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {walk.name}
        </div>

        {/* Start → Finish */}
        <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.56)', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
          <IWalks s={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {walk.startLocation}{walk.finishLocation && walk.finishLocation !== walk.startLocation ? ` → ${walk.finishLocation}` : ''}
          </span>
        </div>

        {/* Info chips: distance, duration, accessible, circular */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {walk.distanceMiles > 0 && (
            <span style={{ padding: '4px 11px', borderRadius: 999, background: '#EEF4FF', color: '#2A4A90', fontSize: 12.5, fontWeight: 700 }}>
              {formatDistance(walk.distanceMiles)}
            </span>
          )}
          {walk.durationMinutes > 0 && (
            <span style={{ padding: '4px 11px', borderRadius: 999, background: '#EEF4FF', color: '#2A4A90', fontSize: 12.5, fontWeight: 700 }}>
              {formatDuration(walk.durationMinutes)}
            </span>
          )}
          {accessible && (
            <span style={{ padding: '4px 11px', borderRadius: 999, background: 'rgba(45,156,219,0.1)', color: '#1054A0', fontSize: 12.5, fontWeight: 700 }}>
              ♿ Accessible
            </span>
          )}
          {walk.circular && (
            <span style={{ padding: '4px 11px', borderRadius: 999, background: 'rgba(91,201,74,0.1)', color: '#1E6B10', fontSize: 12.5, fontWeight: 700 }}>
              Circular
            </span>
          )}
        </div>

        {/* Highlights — 2-line clamp */}
        {walk.highlights ? (
          <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.64)', lineHeight: 1.58, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {walk.highlights}
          </div>
        ) : null}
      </div>

      {/* Facilities strip */}
      <div style={{ padding: '9px 18px', borderTop: '1px solid #EEF2FA', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'Toilets', has: walk.toilets },
          { label: 'Parking', has: walk.parking },
          { label: 'Buses',   has: walk.publicTransport },
          { label: 'Cafes',   has: walk.refreshments },
        ].map(({ label, has }) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: has ? '#1E6B10' : 'rgba(26,39,68,0.34)' }}>
            <span style={{ width: 15, height: 15, borderRadius: 999, background: has ? 'rgba(91,201,74,0.18)' : 'rgba(26,39,68,0.06)', display: 'inline-grid', placeItems: 'center', fontSize: 9, flexShrink: 0 }}>
              {has ? '✓' : '–'}
            </span>
            {label}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '10px 18px 18px' }}>
        <button
          className="btn btn-sky"
          onClick={onView}
          style={{ width: '100%', justifyContent: 'center', fontWeight: 700, padding: '12px 16px', borderRadius: 14, gap: 8, fontSize: 14 }}
        >
          View walk details <IArrow s={14} />
        </button>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div style={{ borderRadius: 18, padding: '12px 14px', background: 'rgba(250,251,255,0.9)', border: '1px solid #EFF1F7' }}>
    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontWeight: 700, color: '#1A2744' }}>{value}</div>
  </div>
);

const WalkDetailModal = ({ walk, onClose }) => {
  const SUPPORTS_WALK_UPDATES = true;
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const [showCommentForm, setShowCommentForm] = React.useState(false);
  const [showRiskSubmission, setShowRiskSubmission] = React.useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = React.useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);
  const [updateSuccess, setUpdateSuccess] = React.useState('');
  const [commentSuccess, setCommentSuccess] = React.useState('');
  const [copySuccess, setCopySuccess] = React.useState('');
  const [updateErrors, setUpdateErrors] = React.useState({});
  const [commentErrors, setCommentErrors] = React.useState({});
  const [riskAssessment, setRiskAssessment] = React.useState(null);
  const [riskLoading, setRiskLoading] = React.useState(true);
  const [itineraryUpdates, setItineraryUpdates] = React.useState([]);
  const [itineraryLoading, setItineraryLoading] = React.useState(true);
  const [existingComments, setExistingComments] = React.useState([]);
  const [commentsLoading, setCommentsLoading] = React.useState(true);

  const mapEmbedUrl = getMapEmbedUrl(walk);
  const [mapPreviewEnabled, setMapPreviewEnabled] = React.useState(Boolean(mapEmbedUrl));
  const itinerarySteps = parseItinerarySteps(walk.itinerary);
  const showNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Fetch risk assessment for this walk
  React.useEffect(() => {
    const fetchRiskAssessment = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setRiskLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('walk_risk_updates')
          .select('*')
          .eq('walk_id', walk.id)
          .eq('status', 'approved')
          .in('update_type', ['new_assessment', 'hazard_update', 'general_update'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!data) {
          setRiskAssessment(null);
        } else {
          const parsedHazards = `${data.description || ''}`
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 6);
          setRiskAssessment({
            ...data,
            hazards_json: parsedHazards,
            last_verified_date: data.created_at,
            weather_notes: data.route_notes || null,
            emergency_notes: data.safety_sensitive_sections || null,
            accessibility_notes: data.accessibility_notes || null,
          });
        }
      } catch (err) {
        // No assessment found or error - that's ok
        setRiskAssessment(null);
      } finally {
        setRiskLoading(false);
      }
    };

    fetchRiskAssessment();
  }, [walk.id]);

  React.useEffect(() => {
    const fetchItineraryUpdates = async () => {
      if (!SUPPORTS_WALK_UPDATES) {
        setItineraryUpdates([]);
        setItineraryLoading(false);
        return;
      }
      if (!isSupabaseConfigured() || !supabase) {
        setItineraryLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('walk_risk_updates')
          .select('id, update_type, description, itinerary_step_title, itinerary_step_detail, revised_walk_sequence, route_notes, wayfinding_notes, landmarks, start_point_notes, finish_point_notes, circular_route_clarification, rest_points, points_of_interest, transport_notes, parking_notes, safety_sensitive_sections, accessibility_notes, created_at')
          .eq('walk_id', walk.id)
          .eq('status', 'approved')
          .in('update_type', ['itinerary_journey_update', 'route_condition_update'])
          .order('created_at', { ascending: false })
          .limit(8);

        setItineraryUpdates(Array.isArray(data) ? data : []);
      } catch {
        setItineraryUpdates([]);
      } finally {
        setItineraryLoading(false);
      }
    };

    fetchItineraryUpdates();
  }, [walk.id, SUPPORTS_WALK_UPDATES]);

  React.useEffect(() => {
    const fetchComments = async () => {
      if (!SUPPORTS_WALK_UPDATES || !isSupabaseConfigured() || !supabase) {
        setExistingComments([]);
        setCommentsLoading(false);
        return;
      }

      setCommentsLoading(true);
      try {
        const { data } = await supabase
          .from('walk_comments')
          .select('id, commenter_name, comment_text, visited, recommend, created_at')
          .eq('walk_id', walk.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(20);

        const mapped = (data || []).map((row) => ({
          id: row.id,
          name: row.commenter_name,
          comment: row.comment_text,
          visited: row.visited,
          recommend: row.recommend,
          createdAt: row.created_at,
        }));
        setExistingComments(mapped);
      } catch {
        setExistingComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [walk.id, SUPPORTS_WALK_UPDATES]);

  const [updateForm, setUpdateForm] = React.useState({
    walkName: walk.name || '',
    area: walk.area || '',
    updateType: 'Incorrect information',
    description: '',
    name: '',
    email: '',
    consent: false,
  });

  const [commentForm, setCommentForm] = React.useState({
    name: '',
    comment: '',
    visited: false,
    recommend: false,
  });

  const shareText = getWalkShareText(walk);
  const shareUrl = getWalkShareUrl(walk);

  const validateUpdateForm = () => {
    const nextErrors = {};
    if (!hasText(updateForm.updateType)) nextErrors.updateType = 'Select an update type.';
    if (!hasText(updateForm.description)) nextErrors.description = 'Please describe the update.';
    if (!updateForm.consent) nextErrors.consent = 'Please confirm review consent.';
    if (hasText(updateForm.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateForm.email.trim())) {
      nextErrors.email = 'Enter a valid email or leave blank.';
    }
    setUpdateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCommentForm = () => {
    const nextErrors = {};
    if (!hasText(commentForm.comment)) nextErrors.comment = 'Please add a comment.';
    setCommentErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitUpdate = async (event) => {
    event.preventDefault();
    if (!SUPPORTS_WALK_UPDATES) {
      setUpdateErrors({ general: 'Walk updates are currently unavailable on the live legacy schema.' });
      return;
    }
    if (!validateUpdateForm()) return;
    if (!isSupabaseConfigured() || !supabase) {
      setUpdateErrors({ general: 'Walk updates are temporarily unavailable. Please try again later.' });
      return;
    }

    setIsSubmittingUpdate(true);
    setUpdateSuccess('');
    setUpdateErrors({});
    try {
      const { error } = await supabase.from('walk_risk_updates').insert({
        walk_id: walk.id,
        walk_name: walk.name,
        update_type: mapPublicUpdateTypeToDbType(updateForm.updateType),
        description: updateForm.description.trim(),
        submitted_by: updateForm.name.trim() || 'Anonymous',
        submitted_email: updateForm.email.trim() || 'anonymous@inspiring-carers.local',
        organisation: null,
        status: 'pending',
        route_notes: `Submitted from walk detail update form. Area: ${walk.area || 'Unknown'}. Public type: ${updateForm.updateType}`,
      });
      if (error) throw error;

      setIsSubmittingUpdate(false);
      setUpdateSuccess('Update submitted to moderation queue. Thank you.');
      setUpdateForm((prev) => ({ ...prev, description: '', name: '', email: '', consent: false }));
    } catch (submitError) {
      setIsSubmittingUpdate(false);
      setUpdateErrors({ general: submitError?.message || 'Failed to submit update. Please try again.' });
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!SUPPORTS_WALK_UPDATES) {
      setCommentErrors({ general: 'Walk comments are currently unavailable on the live legacy schema.' });
      return;
    }
    if (!validateCommentForm()) return;
    if (!isSupabaseConfigured() || !supabase) {
      setCommentErrors({ general: 'Comments are temporarily unavailable. Please try again later.' });
      return;
    }

    setIsSubmittingComment(true);
    setCommentSuccess('');
    setCommentErrors({});
    try {
      const { error } = await supabase.from('walk_comments').insert({
        walk_id: walk.id,
        walk_name: walk.name,
        commenter_name: commentForm.name.trim() || 'Anonymous',
        comment_text: commentForm.comment.trim(),
        visited: commentForm.visited,
        recommend: commentForm.recommend,
        status: 'pending',
      });
      if (error) throw error;

      setIsSubmittingComment(false);
      setCommentSuccess('Comment submitted to moderation queue. Thank you.');
      setCommentForm({ name: '', comment: '', visited: false, recommend: false });
    } catch (submitError) {
      setIsSubmittingComment(false);
      setCommentErrors({ general: submitError?.message || 'Failed to submit comment. Please try again.' });
    }
  };

  const handleNativeShare = async () => {
    if (!showNativeShare) return;
    try {
      await navigator.share({
        title: `Inspiring Carers Walk Finder: ${walk.name}`,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // Share cancellation should be silent.
    }
  };

  const handleCopyLink = async () => {
    try {
      if (!navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess('Link copied.');
      setTimeout(() => setCopySuccess(''), 1600);
    } catch {
      setCopySuccess('Copy failed. Please copy from the address bar.');
      setTimeout(() => setCopySuccess(''), 2200);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const diff     = normalizeDifficultyLabel(walk.difficulty);
  const accent   = DIFF_ACCENT[diff] || DIFF_ACCENT.Moderate;
  const accessible = hasAccessibleTerrain(walk);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(15,23,42,0.46)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto', borderRadius: 34, background: 'white', boxShadow: '0 40px 100px rgba(15,23,42,0.3)', padding: 'clamp(22px, 3vw, 38px)', position: 'relative' }}>

        {/* ── Premium hero band — negative margins give full-width on dark bg ── */}
        <div style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1A3A2A 50%, #1A2744 100%)',
          margin: 'calc(-1 * clamp(22px, 3vw, 38px))',
          marginBottom: 28,
          padding: '28px clamp(22px,3vw,38px) 26px',
          borderRadius: '34px 34px 0 0',
          position: 'relative',
        }}>
          {/* Difficulty accent stripe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${accent} 0%, ${accent}55 100%)`, borderRadius: '34px 34px 0 0', pointerEvents: 'none' }} />
          {/* Close button */}
          <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 38, height: 38, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'white' }}>
            <IClose s={18} />
          </button>
          {/* Content */}
          <div style={{ paddingRight: 52, paddingTop: 4 }}>
            {/* Difficulty pill + area */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ padding: '3px 12px', borderRadius: 999, background: accent, color: 'white', fontSize: 12.5, fontWeight: 800 }}>{diff}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                {walk.area}{hasText(walk.postcode) ? ` · ${walk.postcode}` : ''}
              </span>
            </div>
            {/* Walk name */}
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', marginBottom: 16, maxWidth: 820 }}>
              {walk.name}
            </h2>
            {/* Info chips */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {walk.distanceMiles > 0 && <span style={{ padding: '5px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 700 }}>{formatDistance(walk.distanceMiles)}</span>}
              {walk.durationMinutes > 0 && <span style={{ padding: '5px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 700 }}>{formatDuration(walk.durationMinutes)}</span>}
              {accessible && <span style={{ padding: '5px 13px', borderRadius: 999, background: 'rgba(45,156,219,0.22)', border: '1px solid rgba(45,156,219,0.3)', color: '#7CC8F8', fontSize: 13, fontWeight: 700 }}>♿ Accessible</span>}
              {walk.circular && <span style={{ padding: '5px 13px', borderRadius: 999, background: 'rgba(91,201,74,0.18)', border: '1px solid rgba(91,201,74,0.25)', color: '#7FDE6A', fontSize: 13, fontWeight: 700 }}>Circular</span>}
              {hasText(walk.terrain) && <span style={{ padding: '5px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{walk.terrain}</span>}
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #E9EEF5', marginBottom: 26, background: '#F8FBFF' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E9EEF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744' }}>Route map preview</div>
            <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.68)' }}>Live route context</div>
          </div>
          {mapPreviewEnabled ? (
            <iframe
              title={`Map preview for ${walk.name}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setMapPreviewEnabled(false)}
              style={{ width: '100%', height: 250, border: 0, display: 'block' }}
            />
          ) : (
            <div style={{ height: 250, padding: 20, display: 'grid', alignContent: 'space-between', background: 'linear-gradient(135deg, #F8FBFF 0%, #EFF6FF 100%)' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744' }}>Preview unavailable in-app</div>
                <div style={{ marginTop: 8, fontSize: 14, color: 'rgba(26,39,68,0.72)', maxWidth: 600 }}>
                  Use Google Maps to view turn-by-turn details and live route conditions for this walk.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(45,156,219,0.12)', fontSize: 12, color: '#1A2744', fontWeight: 700 }}>{walk.area}</div>
                <div style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(91,201,74,0.12)', fontSize: 12, color: '#1A2744', fontWeight: 700 }}>{formatDistance(walk.distanceMiles)}</div>
                <div style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(244,97,58,0.12)', fontSize: 12, color: '#1A2744', fontWeight: 700 }}>{formatDuration(walk.durationMinutes)}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 28 }}>
          {/* Route facts */}
          <div style={{ border: '1px solid #E9EEF5', background: '#FCFDFF', borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E9EEF5', background: 'linear-gradient(135deg, rgba(91,201,74,0.08), rgba(45,156,219,0.05))', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IWalks s={15} />
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#1A2744' }}>Route facts</span>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 0 }}>
              <SectionItem label="Distance" value={formatDistance(walk.distanceMiles)} />
              <SectionItem label="Duration" value={formatDuration(walk.durationMinutes)} />
              <SectionItem label="Difficulty" value={walk.difficulty} />
              <SectionItem label="Terrain" value={walk.terrain} />
              {walk.elevation > 0 && <SectionItem label="Elevation" value={`${walk.elevation} m`} />}
              <SectionItem label="Circular" value={walk.circular ? 'Yes' : 'No'} />
            </div>
          </div>
          {/* Facilities & access */}
          <div style={{ border: '1px solid #E9EEF5', background: '#FAFEFF', borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E9EEF5', background: 'linear-gradient(135deg, rgba(45,156,219,0.08), rgba(91,201,74,0.05))', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IStar s={14} />
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#1A2744' }}>Facilities &amp; access</span>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 10 }}>
              <DetailBadge label="Toilets" value={walk.toilets} note={walk.toiletsNote} />
              <DetailBadge label="Parking" value={walk.parking} note={walk.parkingNote} />
              <DetailBadge label="Public transport" value={walk.publicTransport} note={walk.busInfo || undefined} />
              <DetailBadge label="Refreshments" value={walk.refreshments} note={walk.refreshmentsNote} />
              <DetailBadge label="Accessibility" value={walk.accessibility} secondary />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {/* Premium tinted info sections — icons from Icons.jsx, hover lift */}
          <DetailSection title="Highlights"          content={walk.highlights}    IconComp={ISparkle}   tint="linear-gradient(135deg,rgba(91,201,74,0.08),rgba(91,201,74,0.03))"   border="rgba(91,201,74,0.22)"   accentColor="#1E6B10" />
          <DetailSection title="Safety notes"        content={walk.safetyNotes}   IconComp={IShield}    tint="linear-gradient(135deg,rgba(245,166,35,0.09),rgba(245,166,35,0.03))"  border="rgba(245,166,35,0.28)"  accentColor="#8A4B00" />
          <DetailSection title="Accessibility notes" content={walk.accessibility}  IconComp={ICheck}     tint="linear-gradient(135deg,rgba(45,156,219,0.08),rgba(45,156,219,0.03))"  border="rgba(45,156,219,0.24)"  accentColor="#1054A0" />
          <DetailSection title="Bus information"     content={walk.busInfo}       IconComp={ITransport} tint="linear-gradient(135deg,rgba(123,92,245,0.08),rgba(123,92,245,0.03))"  border="rgba(123,92,245,0.24)"  accentColor="#5034A0" />

          {/* Professional Risk Assessment */}
          <div style={{ border: '1px solid rgba(26,39,68,0.12)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', background: 'linear-gradient(135deg, rgba(26,39,68,0.045) 0%, rgba(26,39,68,0.02) 100%)', borderBottom: '1px solid rgba(26,39,68,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', color: 'rgba(26,39,68,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IShield s={13} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Professional risk assessment</span>
              </div>
              {!riskLoading && (
                <span style={{ padding: '3px 10px', borderRadius: 999, background: riskAssessment ? 'rgba(16,185,129,0.1)' : 'rgba(26,39,68,0.06)', color: riskAssessment ? '#0D7A55' : 'rgba(26,39,68,0.4)', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em' }}>
                  {riskAssessment ? 'Assessment available' : 'Not yet published'}
                </span>
              )}
            </div>
            <div style={{ padding: '14px 16px' }}>
              {riskLoading ? (
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.45)', padding: '6px 0' }}>Loading assessment…</div>
              ) : riskAssessment ? (
                <>
                  <WalkRiskSummary assessment={riskAssessment} walk={walk} />
                  <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 12 }}>
                    <button onClick={() => downloadRiskAssessmentPDF(riskAssessment, walk)} className="btn btn-sky btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Download assessment
                    </button>
                    {SUPPORTS_WALK_UPDATES && (
                      <button onClick={() => setShowRiskSubmission(true)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Submit update
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'rgba(26,39,68,0.5)' }}>
                    <IShield s={14} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744' }}>Awaiting first professional submission</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.6, marginBottom: SUPPORTS_WALK_UPDATES ? 12 : 0 }}>
                    A verified risk assessment for this route has not yet been published. Assessments are submitted by qualified practitioners and reviewed by the Inspiring Carers team.
                  </p>
                  {SUPPORTS_WALK_UPDATES && (
                    <button onClick={() => setShowRiskSubmission(true)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Submit risk assessment
                    </button>
                  )}
                  {!SUPPORTS_WALK_UPDATES && <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.4)' }}>Risk submissions unavailable.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Itinerary journey */}
          <div style={{ border: '1px solid #E9EEF5', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', background: 'linear-gradient(135deg, rgba(91,201,74,0.07), rgba(45,156,219,0.04))', borderBottom: '1px solid #EEF4FF', display: 'flex', alignItems: 'center', gap: 7, color: '#1E6B10' }}>
              <IWalks s={13} />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Itinerary journey</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              {itinerarySteps.length > 0 ? (
                <ItineraryFlow steps={itinerarySteps} />
              ) : (
                <div style={{ padding: '14px 0', textAlign: 'center', color: 'rgba(26,39,68,0.45)', fontSize: 14 }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>🥾</div>
                  Detailed itinerary not available for this route yet.
                </div>
              )}
            </div>
          </div>

          {/* Approved route updates */}
          <div style={{ border: '1px solid #E9EEF5', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', background: 'linear-gradient(135deg, rgba(45,156,219,0.07), rgba(123,92,245,0.04))', borderBottom: '1px solid #EEF4FF', display: 'flex', alignItems: 'center', gap: 7, color: '#1054A0' }}>
              <IPin s={13} />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Approved route updates</span>
            </div>
            <div style={{ padding: '14px 18px' }}>
              {itineraryLoading ? (
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.5)', padding: '8px 0' }}>Loading updates…</div>
              ) : itineraryUpdates.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {itineraryUpdates.map((update, index) => (
                    <div key={update.id || `${walk.id}-update-${index}`} style={{ borderRadius: 14, border: '1px solid #E9EEF5', background: 'white', padding: '12px 14px', boxShadow: '0 2px 8px rgba(26,39,68,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#1A2744', fontSize: 13.5 }}>{update.itinerary_step_title || update.update_type?.replaceAll('_', ' ') || 'Route update'}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.5)' }}>{update.created_at ? new Date(update.created_at).toLocaleDateString('en-GB') : ''}</div>
                      </div>
                      <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'rgba(26,39,68,0.75)', lineHeight: 1.6 }}>
                        {update.itinerary_step_detail && <div><strong style={{ color: '#1A2744' }}>Step detail:</strong> {update.itinerary_step_detail}</div>}
                        {update.revised_walk_sequence && <div><strong style={{ color: '#1A2744' }}>Sequence:</strong> {update.revised_walk_sequence}</div>}
                        {update.wayfinding_notes && <div><strong style={{ color: '#1A2744' }}>Wayfinding:</strong> {update.wayfinding_notes}</div>}
                        {update.landmarks && <div><strong style={{ color: '#1A2744' }}>Landmarks:</strong> {update.landmarks}</div>}
                        {update.route_notes && <div><strong style={{ color: '#1A2744' }}>Route notes:</strong> {update.route_notes}</div>}
                        {update.start_point_notes && <div><strong style={{ color: '#1A2744' }}>Start point:</strong> {update.start_point_notes}</div>}
                        {update.finish_point_notes && <div><strong style={{ color: '#1A2744' }}>Finish point:</strong> {update.finish_point_notes}</div>}
                        {update.circular_route_clarification && <div><strong style={{ color: '#1A2744' }}>Circular route:</strong> {update.circular_route_clarification}</div>}
                        {update.rest_points && <div><strong style={{ color: '#1A2744' }}>Rest points:</strong> {update.rest_points}</div>}
                        {update.points_of_interest && <div><strong style={{ color: '#1A2744' }}>Points of interest:</strong> {update.points_of_interest}</div>}
                        {update.transport_notes && <div><strong style={{ color: '#1A2744' }}>Transport:</strong> {update.transport_notes}</div>}
                        {update.parking_notes && <div><strong style={{ color: '#1A2744' }}>Parking:</strong> {update.parking_notes}</div>}
                        {update.safety_sensitive_sections && <div><strong style={{ color: '#1A2744' }}>Safety-sensitive sections:</strong> {update.safety_sensitive_sections}</div>}
                        {update.accessibility_notes && <div><strong style={{ color: '#1A2744' }}>Accessibility:</strong> {update.accessibility_notes}</div>}
                        {update.description && <div><strong style={{ color: '#1A2744' }}>Contributor notes:</strong> {update.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2744', marginBottom: 5 }}>No approved route updates yet</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.55, marginBottom: SUPPORTS_WALK_UPDATES ? 14 : 0 }}>
                    Route improvements submitted by the community will appear here after review.
                  </div>
                  {SUPPORTS_WALK_UPDATES && (
                    <button onClick={() => setShowRiskSubmission(true)} className="btn btn-ghost btn-sm">Submit a route update</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, border: '1px solid #E9EEF5', borderRadius: 24, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)', padding: '18px 20px' }}>
          {/* Primary actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={walk.googleMapsLink} target="_blank" rel="noreferrer" className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: '1 1 200px', justifyContent: 'center', boxShadow: '0 8px 24px rgba(212,175,55,0.28)' }}>
              Open in Google Maps <IArrow s={16} />
            </a>
            <a href={buildWalkEmailHref(walk)} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: '1 1 160px' }}>
              Email details
            </a>
            <button onClick={onClose} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ← Back to results
            </button>
          </div>
          {/* Secondary actions */}
          {SUPPORTS_WALK_UPDATES && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setShowUpdateForm((open) => !open)} className="btn btn-ghost btn-sm" style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)' }}>
                Submit a route update
              </button>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(26,39,68,0.52)', lineHeight: 1.5 }}>
            Community-maintained route information. Always check current conditions before travel.
          </div>
        </div>

        {/* ── Share this walk ─────────────────────────────────────────── */}
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #EEF2FA' }}>
          <div style={{ marginBottom: 5, fontSize: 16, fontWeight: 800, color: '#1A2744' }}>Share this walk</div>
          <div style={{ marginBottom: 16, fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.55 }}>
            Send this route to a carer, colleague or family member.
          </div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            {showNativeShare && (
              <button
                onClick={handleNativeShare}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px', borderRadius: 14, background: 'rgba(45,156,219,0.07)', border: '1.5px solid rgba(45,156,219,0.22)', color: '#1054A0', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(45,156,219,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <span style={{ width: 20, height: 20, borderRadius: 5, background: '#2D9CDB', color: 'white', display: 'inline-grid', placeItems: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>↗</span>
                Share via device
              </button>
            )}
            {[
              { href: shareLinks.facebook,  label: 'Facebook',  init: 'f',  bg: '#1877F2', tint: 'rgba(24,119,242,0.07)',  border: 'rgba(24,119,242,0.22)',  text: '#1050B0' },
              { href: shareLinks.whatsapp,  label: 'WhatsApp',  init: 'W',  bg: '#25D366', tint: 'rgba(37,211,102,0.07)',  border: 'rgba(37,211,102,0.22)',  text: '#1A7040' },
              { href: shareLinks.twitter,   label: 'X',         init: 'X',  bg: '#1A1A1A', tint: 'rgba(0,0,0,0.05)',       border: 'rgba(0,0,0,0.14)',       text: '#1A1A1A' },
              { href: shareLinks.linkedin,  label: 'LinkedIn',  init: 'in', bg: '#0A66C2', tint: 'rgba(10,102,194,0.07)',  border: 'rgba(10,102,194,0.22)',  text: '#08509C' },
            ].map(({ href, label, init, bg, tint, border, text }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px', borderRadius: 14, background: tint, border: `1.5px solid ${border}`, color: text, fontSize: 13.5, fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 18px ${bg}33`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <span style={{ width: 20, height: 20, borderRadius: 5, background: bg, color: 'white', display: 'inline-grid', placeItems: 'center', fontSize: init === 'in' ? 9 : 11, fontWeight: 900, flexShrink: 0 }}>{init}</span>
                {label}
              </a>
            ))}
            <button
              onClick={handleCopyLink}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px', borderRadius: 14, background: copySuccess ? 'rgba(16,185,129,0.08)' : 'rgba(26,39,68,0.05)', border: `1.5px solid ${copySuccess ? 'rgba(16,185,129,0.3)' : 'rgba(26,39,68,0.14)'}`, color: copySuccess ? '#0D7A55' : '#1A2744', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { if (!copySuccess) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,39,68,0.12)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <span style={{ width: 20, height: 20, borderRadius: 5, background: copySuccess ? '#10B981' : '#1A2744', color: 'white', display: 'inline-grid', placeItems: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{copySuccess ? '✓' : '⎘'}</span>
              {copySuccess ? 'Link copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* ── Community notes ──────────────────────────────────────────── */}
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #EEF2FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2744' }}>Community notes</div>
            {SUPPORTS_WALK_UPDATES ? <button className="btn btn-sky btn-sm" onClick={() => setShowCommentForm((open) => !open)}>Leave a note</button> : null}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.55, marginBottom: 4 }}>
            {SUPPORTS_WALK_UPDATES ? 'Notes are reviewed before appearing.' : 'Community notes are currently unavailable.'}
          </div>

          {existingComments.length > 0 ? (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {existingComments.map((item, index) => (
                <div key={`${walk.id}-comment-${index}`} style={{ border: '1px solid #E9EEF5', borderRadius: 16, padding: 14, background: '#FAFBFF' }}>
                  <div style={{ fontWeight: 700, color: '#1A2744' }}>{hasText(item.name) ? item.name : 'Community member'}</div>
                  <div style={{ marginTop: 6, color: 'rgba(26,39,68,0.82)' }}>{item.comment}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 14, fontSize: 14, color: 'rgba(26,39,68,0.72)' }}>{commentsLoading ? 'Loading comments...' : 'No public comments yet for this walk.'}</div>
          )}

          {showCommentForm ? (
            <form onSubmit={handleSubmitComment} style={{ marginTop: 14, border: '1px solid #E9EEF5', borderRadius: 18, padding: 16, display: 'grid', gap: 12 }}>
              <input
                type="text"
                value={commentForm.name}
                onChange={(event) => setCommentForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your name (optional)"
                style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14 }}
              />
              <textarea
                value={commentForm.comment}
                onChange={(event) => setCommentForm((prev) => ({ ...prev, comment: event.target.value }))}
                placeholder="Share your experience with this walk"
                rows={4}
                style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, resize: 'vertical' }}
              />
              {commentErrors.comment ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{commentErrors.comment}</div> : null}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={commentForm.visited} onChange={(event) => setCommentForm((prev) => ({ ...prev, visited: event.target.checked }))} />
                Visited this walk?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={commentForm.recommend} onChange={(event) => setCommentForm((prev) => ({ ...prev, recommend: event.target.checked }))} />
                Would recommend
              </label>
              {commentErrors.general ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{commentErrors.general}</div> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-sky btn-sm" disabled={isSubmittingComment}>{isSubmittingComment ? 'Submitting...' : 'Submit comment'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCommentForm(false)}>Cancel</button>
              </div>
              {commentSuccess ? <div style={{ fontSize: 13, color: '#1A2744' }}>{commentSuccess}</div> : null}
            </form>
          ) : null}
        </div>

        {SUPPORTS_WALK_UPDATES && showUpdateForm ? (
          <div style={{ marginTop: 28, borderTop: '1px solid #EEF2FA', paddingTop: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2744', marginBottom: 14 }}>Submit a route update</div>
            <form onSubmit={handleSubmitUpdate} style={{ border: '1px solid #E9EEF5', borderRadius: 18, padding: 16, display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <input value={updateForm.walkName} readOnly style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#F8FAFD' }} />
                <input value={updateForm.area} readOnly style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#F8FAFD' }} />
              </div>
              <select
                value={updateForm.updateType}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, updateType: event.target.value }))}
                style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14 }}
              >
                <option value="Incorrect information">Incorrect information</option>
                <option value="Accessibility change">Accessibility change</option>
                <option value="Safety issue">Safety issue</option>
                <option value="Toilet / refreshments update">Toilet / refreshments update</option>
                <option value="Transport / parking update">Transport / parking update</option>
                <option value="Route condition update">Route condition update</option>
                <option value="Other">Other</option>
              </select>
              {updateErrors.updateType ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{updateErrors.updateType}</div> : null}
              <textarea
                value={updateForm.description}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe what changed"
                rows={5}
                style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, resize: 'vertical' }}
              />
              {updateErrors.description ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{updateErrors.description}</div> : null}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <input
                  type="text"
                  value={updateForm.name}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Your name (optional)"
                  style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14 }}
                />
                <input
                  type="email"
                  value={updateForm.email}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Your email (optional)"
                  style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14 }}
                />
              </div>
              {updateErrors.email ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{updateErrors.email}</div> : null}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#1A2744' }}>
                <input type="checkbox" checked={updateForm.consent} onChange={(event) => setUpdateForm((prev) => ({ ...prev, consent: event.target.checked }))} />
                <span>I understand this update may be reviewed before being published.</span>
              </label>
              {updateErrors.consent ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{updateErrors.consent}</div> : null}
              {updateErrors.general ? <div style={{ color: '#A03A2D', fontSize: 13 }}>{updateErrors.general}</div> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-sky btn-sm" disabled={isSubmittingUpdate}>{isSubmittingUpdate ? 'Submitting...' : 'Submit update'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUpdateForm(false)}>Cancel</button>
              </div>
              {updateSuccess ? <div style={{ fontSize: 13, color: '#1A2744' }}>{updateSuccess}</div> : null}
            </form>
          </div>
        ) : null}

        {/* Risk Assessment Disclaimer */}
        <div style={{ marginTop: 24, borderTop: '1px solid #EFF1F7', paddingTop: 20 }}>
          <RiskAssessmentDisclaimer />
        </div>
      </div>

      {/* Submit Risk Update Modal */}
      {SUPPORTS_WALK_UPDATES && showRiskSubmission && (
        <SubmitRiskUpdateModal 
          walk={walk} 
          onClose={() => setShowRiskSubmission(false)} 
          supabase={supabase}
          onSuccess={() => {
            // Could refresh risk assessment here
          }}
        />
      )}
    </div>
  );
};

const SectionItem = ({ label, value }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, alignItems: 'start', padding: '8px 6px', borderBottom: '1px solid rgba(233,238,245,0.65)' }}>
    <div style={{ color: 'rgba(26,39,68,0.62)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
    <div style={{ fontWeight: 700, color: '#1A2744', textAlign: 'left', lineHeight: 1.45 }}>{value}</div>
  </div>
);

const DetailBadge = ({ label, value, secondary, note }) => (
  <div style={{ padding: '10px 12px', borderRadius: 14, background: secondary ? 'rgba(255,255,255,0.8)' : 'rgba(245,255,235,1)', border: '1px solid #E9EEF5' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
      <div style={{ color: '#1A2744', fontWeight: 600, fontSize: 13 }}>{label}</div>
      <div style={{ color: value ? '#1A2744' : 'rgba(26,39,68,0.6)', fontWeight: 700, fontSize: 13, textAlign: 'right', maxWidth: 180 }}>{value ? (value === true ? 'Yes' : value) : 'No'}</div>
    </div>
    {note && <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(26,39,68,0.58)', lineHeight: 1.55 }}>{note}</div>}
  </div>
);

const DetailSection = ({ title, content, IconComp, tint = 'rgba(255,255,255,0.7)', border = '#E9EEF5', accentColor = 'rgba(26,39,68,0.5)' }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${border}`,
        borderRadius: 18,
        background: tint,
        padding: '12px 16px',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 28px rgba(26,39,68,0.09)' : '0 1px 4px rgba(26,39,68,0.04)',
        color: accentColor,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {IconComp && <IconComp s={13} />}
        <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 800 }}>{title}</div>
      </div>
      <div style={{ color: 'rgba(26,39,68,0.8)', lineHeight: 1.7, fontSize: 15 }}>
        {content || <span style={{ color: 'rgba(26,39,68,0.35)', fontStyle: 'italic', fontSize: 14 }}>Not provided for this route.</span>}
      </div>
    </div>
  );
};

const ItineraryFlow = ({ steps }) => (
  <div style={{ display: 'grid', gap: 12 }}>
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;
      return (
        <div key={`itinerary-step-${index}`} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'grid', justifyItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: 'linear-gradient(135deg, #5BC94A, #4CAF50)', color: 'white', fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 3px 10px rgba(91,201,74,0.3)', flexShrink: 0 }}>
              {index + 1}
            </div>
            {!isLast && <div style={{ width: 2, minHeight: 32, marginTop: 6, background: 'linear-gradient(180deg, rgba(91,201,74,0.45), rgba(45,156,219,0.25))' }} />}
          </div>
          <div style={{ borderRadius: 16, border: '1px solid #E9EEF5', background: 'white', padding: '12px 14px', boxShadow: '0 2px 8px rgba(26,39,68,0.05)', marginBottom: isLast ? 0 : 4 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5BC94A', marginBottom: 5 }}>Step {index + 1}</div>
            <div style={{ color: 'rgba(26,39,68,0.82)', lineHeight: 1.65, fontSize: 14 }}>{step}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Stat = ({ label, value }) => (
  <div style={{ padding: '16px 18px', borderRadius: 24, background: 'white', border: '1px solid #EFF1F7', minWidth: 160 }}>
    <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.65)', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2744' }}>{value}</div>
  </div>
);

window.WalksPage = WalksPage;
export default WalksPage;
