import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import walks from '../../data/walks.json';
const { IWalks, IArrow, IChevron, IStar, IClose, IconTile } = Icons;

// Compute true dataset bounds once — used for slider init and reset
const DATASET_MAX_DISTANCE = Math.ceil(Math.max(...walks.map(w => w.distanceMiles)));
const DATASET_MAX_DURATION = Math.ceil(Math.max(...walks.map(w => w.durationMinutes).filter(d => d > 0)));

const formatDistance = (miles) => `${miles.toFixed(1)} mi`;
const formatDuration = (minutes) => minutes < 60 ? `${minutes} mins` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

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

  const filteredWalks = React.useMemo(() => walks.filter((walk) => {
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
                <Stat label="Curated Cornwall routes" value="15" />
                <Stat label="Accessible options" value="7" />
                <Stat label="Public transport friendly" value="10" />
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
                  <NumberInput label="Max distance" value={maxDistance} onChange={setMaxDistance} suffix="mi" min={1} max={DATASET_MAX_DISTANCE} />
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

const WalkDetailModal = ({ walk, onClose }) => (
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
        <button onClick={onClose} className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          Back to results
        </button>
      </div>
    </div>
  </div>
);

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
