import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import walks from '../../data/walks.json';
import { RiskAssessmentDisclaimer, WalkRiskSummary, SubmitRiskUpdateModal, downloadRiskAssessmentPDF } from '../WalkRiskAssessment.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';
const { IWalks, IArrow, IChevron, IStar, IClose, IconTile } = Icons;

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

const WalksPage = ({ onNavigate }) => {
  const [query, setQuery] = React.useState('');
  const [area, setArea] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('Any');
  const [maxDistance, setMaxDistance] = React.useState(DATASET_MAX_DISTANCE);
  const [maxDuration, setMaxDuration] = React.useState(DATASET_MAX_DURATION);
  const [filters, setFilters] = React.useState({ toilets: false, refreshments: false, parking: false, publicTransport: false, accessible: false, circular: false });
  const [detailWalk, setDetailWalk] = React.useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

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
      <Nav activePage="walks" onNavigate={onNavigate} />

      <section style={{ paddingTop: 48, paddingBottom: 36, background: 'linear-gradient(180deg, #FEFEFE 0%, #F7FBFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 36, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: '#5BC94A' }}>Cornwall Walk Finder</div>
              <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', marginTop: 16, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.04em' }}>
                Find safe local walks across Cornwall
              </h1>
              <p style={{ marginTop: 18, fontSize: 18, color: 'rgba(26,39,68,0.78)', maxWidth: 660, lineHeight: 1.75 }}>
                Search handpicked routes with accessibility, transport and wellbeing filters. Designed for carers, support workers and anyone needing gentle outdoor connection.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 30 }}>
                <button className="btn btn-gold btn-lg" onClick={() => document.getElementById('walk-filters')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: 17, padding: '20px 38px', boxShadow: '0 18px 60px rgba(212,175,55,0.28)' }}>
                  Start exploring
                  <IArrow s={16} />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => onNavigate('find-help')} style={{ fontSize: 17, padding: '20px 36px' }}>
                  Browse related support
                </button>
              </div>

              <div style={{ marginTop: 34, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <Stat label="Curated Cornwall routes" value={DATASET_TOTAL_ROUTES} />
                <Stat label="Accessible options" value={DATASET_ACCESSIBLE_ROUTES} />
                <Stat label="Public transport friendly" value={DATASET_PUBLIC_TRANSPORT_ROUTES} />
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ borderRadius: 30, padding: 28, background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FBFF 100%)', border: '1px solid #E9EEF5', boxShadow: '0 22px 58px rgba(26,39,68,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <IconTile tone="lime" size={56} radius={18}><IWalks s={26} /></IconTile>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1A2744' }}>Wellbeing walk finder</div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: 'rgba(26,39,68,0.9)' }}>Safe walks, practical routes and care-friendly details.</div>
                  </div>
                </div>
                <div style={{ color: 'rgba(26,39,68,0.74)', lineHeight: 1.7, fontSize: 15 }}>
                  Find routes with toilets, parking, public transport, easy terrain, circular loops and nearby refreshments — all within Cornwall.
                </div>
              </div>
            </div>
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Results</div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{filteredWalks.length} walks matched</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)' }}><strong>Max distance</strong> {maxDistance} mi</div>
                  <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)' }}><strong>Max duration</strong> {formatDuration(maxDuration)}</div>
                </div>
              </div>

              {filteredWalks.length === 0 ? (
                <div style={{ borderRadius: 24, padding: 32, background: 'white', border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No matching walks found</div>
                  <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>Try reducing filters or removing the duration and distance caps. Our collection is built for accessible wellbeing routes.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
                  {filteredWalks.map((walk) => (
                    <WalkCard key={walk.id} walk={walk} onView={() => setDetailWalk(walk)} />
                  ))}
                </div>
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

const WalkCard = ({ walk, onView }) => (
  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 320, borderRadius: 28, border: '1px solid #EEF1F6' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <IconTile tone="lime" size={52} radius={18}><IWalks s={24} /></IconTile>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{walk.name}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'rgba(26,39,68,0.68)' }}>{walk.area}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ borderRadius: 999, padding: '8px 14px', background: 'rgba(91,201,74,0.12)', color: '#1A2744', fontSize: 13, fontWeight: 700 }}>{walk.difficulty}</div>
        <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.72)' }}>{formatDistance(walk.distanceMiles)}</div>
        <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.72)' }}>{formatDuration(walk.durationMinutes)}</div>
      </div>
    </div>

    <div style={{ color: 'rgba(26,39,68,0.74)', lineHeight: 1.7, fontSize: 15 }}>{walk.highlights}</div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
      <MiniStat label="Toilets" value={walk.toilets ? 'Yes' : 'No'} />
      <MiniStat label="Parking" value={walk.parking ? 'Yes' : 'No'} />
      <MiniStat label="Transport" value={walk.publicTransport ? 'Yes' : 'No'} />
    </div>

    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <button className="btn btn-sky btn-sm" onClick={onView} style={{ minWidth: 140, padding: '12px 16px' }}>
        View details
      </button>
      <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.68)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <IStar s={16} /> Accessible: {hasAccessibleTerrain(walk) ? 'Easier terrain' : 'See notes'}
      </div>
    </div>
  </div>
);

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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(15,23,42,0.42)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 1100, maxHeight: '90vh', overflowY: 'auto', borderRadius: 34, background: 'white', boxShadow: '0 34px 85px rgba(26,39,68,0.24)', padding: 'clamp(22px, 3vw, 38px)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 24, top: 24, width: 42, height: 42, borderRadius: 999, border: '1px solid #E9EEF5', background: 'white', display: 'grid', placeItems: 'center' }}>
          <IClose s={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <IconTile tone="lime" size={64} radius={20}><IWalks s={28} /></IconTile>
          <div>
            <div className="eyebrow" style={{ color: '#5BC94A' }}>Walk details</div>
            <h2 style={{ marginTop: 8, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, maxWidth: 740 }}>{walk.name}</h2>
            <div style={{ marginTop: 8, fontSize: 14, color: 'rgba(26,39,68,0.72)', letterSpacing: '0.02em' }}>{walk.area} · {walk.postcode}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 22, marginBottom: 28 }}>
          <div style={{ display: 'grid', gap: 10, color: 'rgba(26,39,68,0.82)', lineHeight: 1.75, fontSize: 15, border: '1px solid #E9EEF5', background: '#FCFDFF', borderRadius: 22, padding: 16 }}>
            <SectionItem label="Distance" value={formatDistance(walk.distanceMiles)} />
            <SectionItem label="Duration" value={formatDuration(walk.durationMinutes)} />
            <SectionItem label="Difficulty" value={walk.difficulty} />
            <SectionItem label="Terrain" value={walk.terrain} />
            <SectionItem label="Elevation" value={`${walk.elevation} m`} />
            <SectionItem label="Circular route" value={walk.circular ? 'Yes' : 'No'} />
          </div>
          <div style={{ background: 'rgba(245,250,255,1)', border: '1px solid #E9EEF5', borderRadius: 22, padding: 18, display: 'grid', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>Practical details</div>
            <DetailBadge label="Toilets" value={walk.toilets} />
            <DetailBadge label="Parking" value={walk.parking} />
            <DetailBadge label="Public transport" value={walk.publicTransport} />
            <DetailBadge label="Refreshments" value={walk.refreshments} />
            <DetailBadge label="Accessibility" value={walk.accessibility} secondary />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
          <DetailSection title="Highlights" content={walk.highlights} />
          <DetailSection title="Safety notes" content={walk.safetyNotes} />
          <DetailSection title="Accessibility notes" content={walk.accessibility} />
          <DetailSection title="Bus information" content={walk.busInfo} />
          
          {/* Risk Assessment Section */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛡️</span> Professional Risk Assessment
            </div>
            {riskLoading ? (
              <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.65)', padding: '16px', background: '#F8FBFF', borderRadius: 12 }}>Loading assessment...</div>
            ) : (
              <>
                <WalkRiskSummary assessment={riskAssessment} walk={walk} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {riskAssessment && (
                    <button onClick={() => downloadRiskAssessmentPDF(riskAssessment, walk)} className="btn btn-sky btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      📥 Download Assessment
                    </button>
                  )}
                  {!SUPPORTS_WALK_UPDATES ? (
                    <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>Risk update submissions are disabled on the current live schema.</div>
                  ) : (
                    <button onClick={() => setShowRiskSubmission(true)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      📋 Submit Risk Update
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Itinerary journey</div>
            {itinerarySteps.length > 0 ? (
              <ItineraryFlow steps={itinerarySteps} />
            ) : (
              <div style={{ color: 'rgba(26,39,68,0.72)', fontSize: 14 }}>Detailed itinerary not available for this route yet.</div>
            )}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2744', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Approved journey improvements</div>
              {itineraryLoading ? (
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.6)', padding: '10px 12px', borderRadius: 12, background: '#F8FBFF', border: '1px solid #E9EEF5' }}>Loading itinerary improvements...</div>
              ) : itineraryUpdates.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {itineraryUpdates.map((update, index) => (
                    <div key={update.id || `${walk.id}-update-${index}`} style={{ borderRadius: 14, border: '1px solid #E9EEF5', background: '#FCFDFF', padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#1A2744', fontSize: 13.5 }}>{update.itinerary_step_title || update.update_type?.replaceAll('_', ' ') || 'Route update'}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.58)' }}>{update.created_at ? new Date(update.created_at).toLocaleDateString('en-GB') : ''}</div>
                      </div>
                      <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'rgba(26,39,68,0.75)', lineHeight: 1.6 }}>
                        {update.itinerary_step_detail ? <div><strong style={{ color: '#1A2744' }}>Step detail:</strong> {update.itinerary_step_detail}</div> : null}
                        {update.revised_walk_sequence ? <div><strong style={{ color: '#1A2744' }}>Sequence:</strong> {update.revised_walk_sequence}</div> : null}
                        {update.wayfinding_notes ? <div><strong style={{ color: '#1A2744' }}>Wayfinding:</strong> {update.wayfinding_notes}</div> : null}
                        {update.landmarks ? <div><strong style={{ color: '#1A2744' }}>Landmarks:</strong> {update.landmarks}</div> : null}
                        {update.route_notes ? <div><strong style={{ color: '#1A2744' }}>Route notes:</strong> {update.route_notes}</div> : null}
                        {update.start_point_notes ? <div><strong style={{ color: '#1A2744' }}>Start point:</strong> {update.start_point_notes}</div> : null}
                        {update.finish_point_notes ? <div><strong style={{ color: '#1A2744' }}>Finish point:</strong> {update.finish_point_notes}</div> : null}
                        {update.circular_route_clarification ? <div><strong style={{ color: '#1A2744' }}>Circular route:</strong> {update.circular_route_clarification}</div> : null}
                        {update.rest_points ? <div><strong style={{ color: '#1A2744' }}>Rest points:</strong> {update.rest_points}</div> : null}
                        {update.points_of_interest ? <div><strong style={{ color: '#1A2744' }}>Points of interest:</strong> {update.points_of_interest}</div> : null}
                        {update.transport_notes ? <div><strong style={{ color: '#1A2744' }}>Transport:</strong> {update.transport_notes}</div> : null}
                        {update.parking_notes ? <div><strong style={{ color: '#1A2744' }}>Parking:</strong> {update.parking_notes}</div> : null}
                        {update.safety_sensitive_sections ? <div><strong style={{ color: '#1A2744' }}>Safety-sensitive sections:</strong> {update.safety_sensitive_sections}</div> : null}
                        {update.accessibility_notes ? <div><strong style={{ color: '#1A2744' }}>Accessibility:</strong> {update.accessibility_notes}</div> : null}
                        {update.description ? <div><strong style={{ color: '#1A2744' }}>Contributor notes:</strong> {update.description}</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.6)', padding: '10px 12px', borderRadius: 12, background: '#F8FBFF', border: '1px solid #E9EEF5' }}>
                  {SUPPORTS_WALK_UPDATES
                    ? 'No approved itinerary improvements yet. Use Submit Risk Update to contribute route details for moderation.'
                    : 'Itinerary moderation updates are unavailable on the current live schema.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, border: '1px solid #E9EEF5', borderRadius: 24, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, alignItems: 'center' }}>
            <a href={walk.googleMapsLink} target="_blank" rel="noreferrer" className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Open in Google Maps
              <IArrow s={18} />
            </a>
            <a href={buildWalkEmailHref(walk)} className="btn btn-sky btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              Email walk details
            </a>
            {SUPPORTS_WALK_UPDATES ? (
              <button onClick={() => setShowUpdateForm((open) => !open)} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                Submit an update
              </button>
            ) : null}
            <button onClick={onClose} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              Back to results
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(26,39,68,0.65)' }}>
            {SUPPORTS_WALK_UPDATES
              ? 'Community-maintained route information. Updates may be reviewed before appearing. Check route conditions before travel.'
              : 'Community route submissions are currently disabled on the live legacy schema. Check route conditions before travel.'}
          </div>
        </div>

        <div style={{ marginTop: 24, borderTop: '1px solid #EFF1F7', paddingTop: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Share</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {showNativeShare ? (
              <button onClick={handleNativeShare} className="btn btn-sky btn-sm">Share via device</button>
            ) : null}
            <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Facebook</a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">WhatsApp</a>
            <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">X / Twitter</a>
            <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">LinkedIn</a>
            <button onClick={handleCopyLink} className="btn btn-ghost btn-sm">Copy Link</button>
          </div>
          {copySuccess ? <div style={{ marginTop: 10, fontSize: 13, color: '#1A2744' }}>{copySuccess}</div> : null}
        </div>

        <div style={{ marginTop: 24, borderTop: '1px solid #EFF1F7', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Comments / Community Notes</div>
            {SUPPORTS_WALK_UPDATES ? <button className="btn btn-sky btn-sm" onClick={() => setShowCommentForm((open) => !open)}>Leave a comment</button> : null}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.72)' }}>
            {SUPPORTS_WALK_UPDATES ? 'Comments may be reviewed before appearing.' : 'Comment submissions are disabled on the current live schema.'}
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
          <div style={{ marginTop: 24, borderTop: '1px solid #EFF1F7', paddingTop: 20 }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Submit an update</div>
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

const DetailBadge = ({ label, value, secondary }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start', padding: '10px 12px', borderRadius: 14, background: secondary ? 'rgba(255,255,255,0.8)' : 'rgba(245,255,235,1)', border: '1px solid #E9EEF5' }}>
    <div style={{ color: '#1A2744', fontWeight: 600, fontSize: 13 }}>{label}</div>
    <div style={{ color: value ? '#1A2744' : 'rgba(26,39,68,0.6)', fontWeight: 700, fontSize: 13, textAlign: 'right', maxWidth: 180 }}>{value ? (value === true ? 'Yes' : value) : 'No'}</div>
  </div>
);

const DetailSection = ({ title, content }) => (
  <div style={{ border: '1px solid #E9EEF5', borderRadius: 18, background: '#FFFFFF', padding: '14px 16px' }}>
    <div style={{ fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, color: '#1A2744' }}>{title}</div>
    <div style={{ color: 'rgba(26,39,68,0.82)', lineHeight: 1.75, maxWidth: '72ch' }}>{content || 'Not provided for this route.'}</div>
  </div>
);

const ItineraryFlow = ({ steps }) => (
  <div style={{ display: 'grid', gap: 10 }}>
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;
      return (
        <div key={`itinerary-step-${index}`} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 10, alignItems: 'start' }}>
          <div style={{ display: 'grid', justifyItems: 'center' }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, background: '#5BC94A', color: '#0F2B1A', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{index + 1}</div>
            {!isLast ? <div style={{ width: 2, minHeight: 30, marginTop: 6, background: 'linear-gradient(180deg, rgba(91,201,74,0.55), rgba(45,156,219,0.35))' }} /> : null}
          </div>
          <div style={{ borderRadius: 14, border: '1px solid #E9EEF5', background: '#FAFBFF', padding: '10px 12px', color: 'rgba(26,39,68,0.82)', lineHeight: 1.6, fontSize: 14 }}>
            {step}
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
