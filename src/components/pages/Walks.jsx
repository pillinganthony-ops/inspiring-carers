import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import walks from '../../data/walks.json';
const { IWalks, IArrow, IChevron, IStar, IClose, IconTile } = Icons;

const FEEDBACK_EMAIL = import.meta.env.VITE_WALKS_FEEDBACK_EMAIL || '';

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

const normalizedWalks = walks.map((walk) => ({
  ...walk,
  distanceMiles: parseDistanceMiles(walk.distanceMiles),
  durationMinutes: parseDurationMinutes(walk.durationMinutes),
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

const getFeedbackRecipient = () => FEEDBACK_EMAIL.trim();

const buildUpdateSubmissionMailtoHref = (walk, formData) => {
  const recipient = getFeedbackRecipient();
  const mapsLink = hasText(walk.googleMapsLink) ? walk.googleMapsLink.trim() : 'Map link not available';
  const subject = `Walk Update Submission: ${walk.name} (${walk.area})`;
  const body = [
    'A walk update has been submitted for review.',
    '',
    `Walk: ${walk.name}`,
    `Area: ${walk.area}`,
    `Update type: ${formData.updateType}`,
    '',
    'Description:',
    formData.description,
    '',
    `Name: ${formData.name || 'Not provided'}`,
    `Email: ${formData.email || 'Not provided'}`,
    '',
    'Google Maps:',
    mapsLink,
    '',
    'Submitted via Inspiring Carers Walk Finder',
  ].join('\n');

  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const buildCommentSubmissionMailtoHref = (walk, formData) => {
  const recipient = getFeedbackRecipient();
  const subject = `Community Note Submission: ${walk.name} (${walk.area})`;
  const body = [
    'A community note has been submitted for moderation.',
    '',
    `Walk: ${walk.name}`,
    `Area: ${walk.area}`,
    `Visited this walk: ${formData.visited ? 'Yes' : 'No'}`,
    `Would recommend: ${formData.recommend ? 'Yes' : 'No'}`,
    '',
    'Comment:',
    formData.comment,
    '',
    `Name: ${formData.name || 'Anonymous'}`,
    '',
    'Submitted via Inspiring Carers Walk Finder',
  ].join('\n');

  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const openMailtoHref = (href) => {
  if (typeof window !== 'undefined') {
    window.location.href = href;
  }
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
    const searchText = `${walk.name} ${walk.area} ${walk.startLocation} ${walk.finishLocation}`.toLowerCase();
    if (query.trim() && !searchText.includes(query.trim().toLowerCase())) return false;
    if (area.trim() && !searchText.includes(area.trim().toLowerCase())) return false;
    if (difficulty !== 'Any' && walk.difficulty !== difficulty) return false;
    if (walk.distanceMiles > maxDistance) return false;
    if (walk.durationMinutes > maxDuration) return false;
    if (filters.toilets && !walk.toilets) return false;
    if (filters.refreshments && !walk.refreshments) return false;
    if (filters.parking && !walk.parking) return false;
    if (filters.publicTransport && !walk.publicTransport) return false;
    if (filters.accessible && !walk.accessibility.toLowerCase().includes('level') && !walk.accessibility.toLowerCase().includes('easy')) return false;
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
        <IStar s={16} /> Accessible: {walk.accessibility.includes('Level') || walk.accessibility.includes('easy') ? 'Easier terrain' : 'See notes'}
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
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const [showCommentForm, setShowCommentForm] = React.useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = React.useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);
  const [updateSuccess, setUpdateSuccess] = React.useState('');
  const [commentSuccess, setCommentSuccess] = React.useState('');
  const [copySuccess, setCopySuccess] = React.useState('');
  const [updateErrors, setUpdateErrors] = React.useState({});
  const [commentErrors, setCommentErrors] = React.useState({});

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

  const existingComments = Array.isArray(walk.comments)
    ? walk.comments.filter((item) => item && hasText(item.comment))
    : [];

  const shareText = getWalkShareText(walk);
  const shareUrl = getWalkShareUrl(walk);
  const feedbackConfigured = hasText(getFeedbackRecipient());

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

  const handleSubmitUpdate = (event) => {
    event.preventDefault();
    if (!validateUpdateForm()) return;

    setIsSubmittingUpdate(true);
    setUpdateSuccess('');
    const href = buildUpdateSubmissionMailtoHref(walk, updateForm);
    openMailtoHref(href);
    setTimeout(() => {
      setIsSubmittingUpdate(false);
      setUpdateSuccess('Email draft opened. Thank you, your update can now be sent for review.');
      setUpdateForm((prev) => ({ ...prev, description: '', name: '', email: '', consent: false }));
    }, 350);
  };

  const handleSubmitComment = (event) => {
    event.preventDefault();
    if (!validateCommentForm()) return;

    setIsSubmittingComment(true);
    setCommentSuccess('');
    const href = buildCommentSubmissionMailtoHref(walk, commentForm);
    openMailtoHref(href);
    setTimeout(() => {
      setIsSubmittingComment(false);
      setCommentSuccess('Email draft opened. Your comment can now be sent for moderation.');
      setCommentForm({ name: '', comment: '', visited: false, recommend: false });
    }, 350);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
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
      <div style={{ width: '100%', maxWidth: 980, maxHeight: '90vh', overflowY: 'auto', borderRadius: 32, background: 'white', boxShadow: '0 34px 85px rgba(26,39,68,0.24)', padding: 30, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 24, top: 24, width: 42, height: 42, borderRadius: 999, border: '1px solid #E9EEF5', background: 'white', display: 'grid', placeItems: 'center' }}>
          <IClose s={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <IconTile tone="lime" size={62} radius={20}><IWalks s={28} /></IconTile>
          <div>
            <div className="eyebrow" style={{ color: '#5BC94A' }}>Walk details</div>
            <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>{walk.name}</h2>
            <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)' }}>{walk.area} · {walk.postcode}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gap: 18, color: 'rgba(26,39,68,0.82)', lineHeight: 1.75, fontSize: 15 }}>
            <SectionItem label="Distance" value={formatDistance(walk.distanceMiles)} />
            <SectionItem label="Duration" value={formatDuration(walk.durationMinutes)} />
            <SectionItem label="Difficulty" value={walk.difficulty} />
            <SectionItem label="Terrain" value={walk.terrain} />
            <SectionItem label="Elevation" value={`${walk.elevation} m`} />
            <SectionItem label="Circular route" value={walk.circular ? 'Yes' : 'No'} />
          </div>
          <div style={{ background: 'rgba(245,250,255,1)', border: '1px solid #E9EEF5', borderRadius: 26, padding: 20, display: 'grid', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Practical details</div>
            <DetailBadge label="Toilets" value={walk.toilets} />
            <DetailBadge label="Parking" value={walk.parking} />
            <DetailBadge label="Public transport" value={walk.publicTransport} />
            <DetailBadge label="Refreshments" value={walk.refreshments} />
            <DetailBadge label="Accessibility" value={walk.accessibility} secondary />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, marginBottom: 20 }}>
          <DetailSection title="Highlights" content={walk.highlights} />
          <DetailSection title="Safety notes" content={walk.safetyNotes} />
          <DetailSection title="Accessibility notes" content={walk.accessibility} />
          <DetailSection title="Bus information" content={walk.busInfo} />
          <DetailSection title="Itinerary" content={walk.itinerary} />
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
          <a href={walk.googleMapsLink} target="_blank" rel="noreferrer" className="btn btn-gold btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Open in Google Maps
            <IArrow s={18} />
          </a>
          <a href={buildWalkEmailHref(walk)} className="btn btn-sky btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Email Walk Details
          </a>
          <button onClick={() => setShowUpdateForm((open) => !open)} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Submit an update
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Back to results
          </button>
        </div>

        <div style={{ marginTop: 24, borderTop: '1px solid #EFF1F7', paddingTop: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Share</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {typeof navigator !== 'undefined' && navigator.share ? (
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
            <button className="btn btn-sky btn-sm" onClick={() => setShowCommentForm((open) => !open)}>Leave a comment</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.72)' }}>Comments may be reviewed before appearing.</div>

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
            <div style={{ marginTop: 14, fontSize: 14, color: 'rgba(26,39,68,0.72)' }}>No public comments yet for this walk.</div>
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
              {!feedbackConfigured ? <div style={{ fontSize: 13, color: '#1A2744' }}>Feedback email is not configured. Set VITE_WALKS_FEEDBACK_EMAIL to route submissions to your team inbox.</div> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-sky btn-sm" disabled={isSubmittingComment}>{isSubmittingComment ? 'Opening draft...' : 'Submit comment'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCommentForm(false)}>Cancel</button>
              </div>
              {commentSuccess ? <div style={{ fontSize: 13, color: '#1A2744' }}>{commentSuccess}</div> : null}
            </form>
          ) : null}
        </div>

        {showUpdateForm ? (
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
              {!feedbackConfigured ? <div style={{ fontSize: 13, color: '#1A2744' }}>Feedback email is not configured. Set VITE_WALKS_FEEDBACK_EMAIL to route submissions to your team inbox.</div> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-sky btn-sm" disabled={isSubmittingUpdate}>{isSubmittingUpdate ? 'Opening draft...' : 'Submit update'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUpdateForm(false)}>Cancel</button>
              </div>
              {updateSuccess ? <div style={{ fontSize: 13, color: '#1A2744' }}>{updateSuccess}</div> : null}
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SectionItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ color: 'rgba(26,39,68,0.65)' }}>{label}</div>
    <div style={{ fontWeight: 700, color: '#1A2744' }}>{value}</div>
  </div>
);

const DetailBadge = ({ label, value, secondary }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 18, background: secondary ? 'rgba(255,255,255,0.8)' : 'rgba(245,255,235,1)', border: '1px solid #E9EEF5' }}>
    <div style={{ color: '#1A2744', fontWeight: 600 }}>{label}</div>
    <div style={{ color: value ? '#1A2744' : 'rgba(26,39,68,0.6)', fontWeight: 700 }}>{value ? (value === true ? 'Yes' : value) : 'No'}</div>
  </div>
);

const DetailSection = ({ title, content }) => (
  <div>
    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</div>
    <div style={{ color: 'rgba(26,39,68,0.78)', lineHeight: 1.75 }}>{content}</div>
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
