// Find Help Near You — the signposting engine with postcode, filters, list/map

import React from 'react';
import Icons from '../Icons.jsx';
const { ISparkle, IGroups, IPin, ISearch, IHeart, IChevron, IArrow, IconTile } = Icons;

const FindHelpPage = ({ onNavigate }) => {
  const [view, setView] = React.useState('list'); // list | map
  const [activeCat, setActiveCat] = React.useState('all');
  const [savedIds, setSavedIds] = React.useState(new Set([2]));

  const categories = [
    { id: 'all',    label: 'All',           icon: <ISparkle s={16}/>,   tone: 'navy' },
    { id: 'groups', label: 'Groups',        icon: <IGroups s={16}/>,    tone: 'sky' },
    { id: 'walks',  label: 'Walks',         icon: <IWalks s={16}/>,     tone: 'lime' },
    { id: 'events', label: 'Events',        icon: <IEvent s={16}/>,     tone: 'violet' },
    { id: 'hubs',   label: 'Community hubs',icon: <IHub s={16}/>,       tone: 'sky' },
    { id: 'libs',   label: 'Libraries',     icon: <ILibrary s={16}/>,   tone: 'gold' },
    { id: 'mind',   label: 'Mental wellbeing', icon: <IMind s={16}/>,   tone: 'violet' },
    { id: 'family', label: 'Family support',icon: <IFamily s={16}/>,    tone: 'lime' },
    { id: 'advice', label: 'Advice',        icon: <IAdvice s={16}/>,    tone: 'sky' },
    { id: 'money',  label: 'Finance help',  icon: <IFinance s={16}/>,   tone: 'lime' },
    { id: 'travel', label: 'Transport',     icon: <ITransport s={16}/>, tone: 'coral' },
    { id: 'safe',   label: 'Safe spaces',   icon: <IShield s={16}/>,    tone: 'gold' },
  ];

  const listings = [
    { id: 1, cat: 'groups', title: 'Parkinson\u2019s UK support group', venue: 'Holy Trinity Church Hall', area: 'St Austell', when: 'Mon 10:00–12:00', distance: '0.4 mi', tags: ['Accessible', 'Free', 'Weekly'], tone: 'sky', icon: <IGroups s={22}/>, desc: 'Peer support and guest speakers. New members welcome.' },
    { id: 2, cat: 'walks', title: 'Memory walk · Menacuddle', venue: 'Menacuddle Woods entrance', area: 'St Austell', when: 'Wed 13:00', distance: '1.1 mi', tags: ['Accessible', 'Outdoor', 'Dementia friendly'], tone: 'lime', icon: <IWalks s={22}/>, desc: 'Gentle 1.2 mile loop with benches. Carer-led.' },
    { id: 3, cat: 'groups', title: 'Stroke survivors coffee', venue: 'Community Hub Charlestown', area: 'Charlestown', when: 'Thu 11:00', distance: '1.8 mi', tags: ['Free', 'Refreshments'], tone: 'sky', icon: <ICoffee s={22}/>, desc: 'Relaxed social. 5 spaces left today.' },
    { id: 4, cat: 'hubs', title: 'NHS Community Wellbeing Hub', venue: 'Penrice Hospital Annex', area: 'St Austell', when: 'Daily 09:00–16:00', distance: '0.9 mi', tags: ['NHS-linked', 'Drop-in'], tone: 'sky', icon: <IHub s={22}/>, desc: 'Nurse-led drop-in for carers and clients.' },
    { id: 5, cat: 'events', title: 'Arts for wellbeing afternoon', venue: 'St Austell Arts Centre', area: 'St Austell', when: 'Fri 14:00', distance: '0.6 mi', tags: ['Creative', 'Free', '5 spaces'], tone: 'violet', icon: <IEvent s={22}/>, desc: 'Watercolour, ceramics, tea. Materials provided.' },
    { id: 6, cat: 'libs', title: 'Books on prescription', venue: 'St Austell Library', area: 'St Austell', when: 'Mon–Sat', distance: '0.5 mi', tags: ['Advice', 'Free'], tone: 'gold', icon: <ILibrary s={22}/>, desc: 'Reading lists curated for carers and their clients.' },
    { id: 7, cat: 'mind', title: 'Carer breathing space', venue: 'Mindline Cornwall', area: 'Online', when: 'Tue 19:00', distance: 'Online', tags: ['Online', 'Therapist-led'], tone: 'violet', icon: <IMind s={22}/>, desc: 'Small-group online wellbeing for carers only.' },
    { id: 8, cat: 'money', title: 'Attendance Allowance advice', venue: 'Age UK Cornwall', area: 'Truro', when: 'By appointment', distance: '6.2 mi', tags: ['1-to-1', 'Free'], tone: 'lime', icon: <IFinance s={22}/>, desc: 'Free benefits check and application help.' },
    { id: 9, cat: 'travel', title: 'Accessible taxi voucher scheme', venue: 'Cornwall Council', area: 'County-wide', when: 'Apply anytime', distance: 'N/A', tags: ['Subsidised'], tone: 'coral', icon: <ITransport s={22}/>, desc: 'Reduced-fare taxis for clients with mobility needs.' },
  ];

  const filtered = activeCat === 'all' ? listings : listings.filter(l => l.cat === activeCat);

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} />

      {/* Page hero */}
      <section style={{
        paddingTop: 40, paddingBottom: 36,
        background: 'linear-gradient(180deg, #E7F3FB 0%, #FAFBFF 100%)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>Find help near you</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>For the people you support</div>
              <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginTop: 10, letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance' }}>
                Find help near you.
              </h1>
              <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 520 }}>
                Real groups, services, walks and support — filtered for what your client actually needs, right now.
              </p>
            </div>

            {/* Search box */}
            <div style={{
              background: 'white', borderRadius: 20, padding: 18,
              border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 12,
                  background: '#FAFBFF', border: '1px solid #EFF1F7',
                }}>
                  <IPin s={18} />
                  <input defaultValue="PL25 5QP" style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744',
                    fontFamily: 'Inter, sans-serif',
                  }} />
                </div>
                <button className="btn btn-sky btn-sm">
                  <ISearch s={14} /> Search
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {['Within 2 mi', 'Today', 'Accessible', 'Free'].map(t => (
                  <span key={t} className="chip" style={{ padding: '5px 10px', fontSize: 11 }}>
                    {t} <IClose s={12} />
                  </span>
                ))}
                <button style={{ fontSize: 12, color: '#2D9CDB', fontWeight: 600, padding: '5px 6px' }}>
                  + Add filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category chip rail */}
      <section style={{ paddingTop: 24, paddingBottom: 0, background: '#FAFBFF' }}>
        <div className="container">
          <div className="no-scrollbar" style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {categories.map(c => {
              const active = activeCat === c.id;
              const tone = toneMapColor(c.tone);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 999,
                    background: active ? tone.fg : 'white',
                    color: active ? (c.tone === 'gold' || c.tone === 'lime' ? '#1A2744' : 'white') : '#1A2744',
                    border: '1px solid ' + (active ? tone.fg : '#EFF1F7'),
                    fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
                    transition: 'all .15s',
                    boxShadow: active ? '0 4px 12px ' + tone.fg + '55' : 'none',
                  }}
                >
                  {c.icon} {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main results */}
      <section style={{ paddingTop: 32, paddingBottom: 80, background: '#FAFBFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}>
              <strong style={{ color: '#1A2744' }}>{filtered.length} results</strong> near PL25 5QP · sorted by distance
            </div>
            <div style={{ display: 'flex', gap: 6, padding: 4, background: 'white', borderRadius: 999, border: '1px solid #EFF1F7' }}>
              {['list', 'map'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '7px 16px', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  background: view === v ? '#1A2744' : 'transparent',
                  color: view === v ? 'white' : '#1A2744',
                  textTransform: 'capitalize',
                }}>{v}</button>
              ))}
            </div>
          </div>

          {view === 'list' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {filtered.map(l => (
                <ListingCard key={l.id} l={l} saved={savedIds.has(l.id)} onToggleSave={() => toggleSave(l.id)} />
              ))}
            </div>
          ) : (
            <MapView listings={filtered} savedIds={savedIds} onToggleSave={toggleSave} />
          )}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

const toneMapColor = (tone) => ({
  navy: { fg: '#1A2744' },
  gold: { fg: '#F5A623' },
  lime: { fg: '#5BC94A' },
  sky:  { fg: '#2D9CDB' },
  coral:{ fg: '#F4613A' },
  violet:{ fg: '#7B5CF5' },
}[tone] || { fg: '#1A2744' });

const ListingCard = ({ l, saved, onToggleSave }) => (
  <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
      <IconTile tone={l.tone} size={52} radius={14}>{l.icon}</IconTile>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="eyebrow" style={{ color: toneMapColor(l.tone).fg }}>{l.cat}</div>
          <button onClick={onToggleSave} style={{
            width: 34, height: 34, borderRadius: 999,
            background: saved ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
            color: saved ? '#F4613A' : '#1A2744',
            display: 'grid', placeItems: 'center',
          }}>
            <IHeart s={16} />
          </button>
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: '-0.01em' }}>
          {l.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginTop: 4 }}>
          {l.venue} · {l.area}
        </div>
      </div>
    </div>
    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)', lineHeight: 1.5 }}>
      {l.desc}
    </p>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {l.tags.map(t => <span key={t} className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>{t}</span>)}
    </div>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: 12, borderTop: '1px solid #EFF1F7',
    }}>
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>{l.when}</span>
        <span style={{ color: 'rgba(26,39,68,0.5)' }}> · {l.distance}</span>
      </div>
      <button className="btn btn-ghost btn-sm">
        Share with client <IArrow s={14} />
      </button>
    </div>
  </div>
);

const MapView = ({ listings, savedIds, onToggleSave }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, minHeight: 640 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 640, overflowY: 'auto', paddingRight: 6 }}>
      {listings.map(l => (
        <div key={l.id} className="card" style={{ padding: 14, display: 'flex', gap: 12 }}>
          <IconTile tone={l.tone} size={42} radius={10}>{l.icon}</IconTile>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{l.title}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 2 }}>{l.when} · {l.distance}</div>
          </div>
          <button onClick={() => onToggleSave(l.id)} style={{
            width: 32, height: 32, borderRadius: 999,
            background: savedIds.has(l.id) ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
            color: savedIds.has(l.id) ? '#F4613A' : '#1A2744',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <IHeart s={14} />
          </button>
        </div>
      ))}
    </div>

    {/* Stylized map */}
    <div style={{
      position: 'relative',
      borderRadius: 22,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #E7F3FB, #EEFBEB)',
      border: '1px solid #EFF1F7',
      minHeight: 640,
    }}>
      {/* subtle grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,39,68,0.06)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
        {/* winding road */}
        <path d="M -20 400 Q 150 350 280 410 T 520 380 T 720 420" fill="none" stroke="#FAFBFF" strokeWidth="14" strokeLinecap="round" />
        <path d="M -20 400 Q 150 350 280 410 T 520 380 T 720 420" fill="none" stroke="#E6E8F0" strokeWidth="2" strokeDasharray="6 6" />
        {/* river */}
        <path d="M 0 180 Q 180 230 340 170 T 700 180" fill="none" stroke="rgba(45,156,219,0.25)" strokeWidth="24" strokeLinecap="round" />
        {/* park */}
        <ellipse cx="180" cy="500" rx="120" ry="70" fill="rgba(91,201,74,0.22)" />
        <ellipse cx="540" cy="230" rx="90" ry="55" fill="rgba(91,201,74,0.20)" />
      </svg>

      {/* Pins */}
      {listings.slice(0,7).map((l, i) => {
        const positions = [
          { x: '28%', y: '40%' },
          { x: '52%', y: '30%' },
          { x: '68%', y: '55%' },
          { x: '38%', y: '65%' },
          { x: '75%', y: '35%' },
          { x: '20%', y: '70%' },
          { x: '58%', y: '78%' },
        ];
        const p = positions[i % positions.length];
        const color = toneMapColor(l.tone).fg;
        return (
          <div key={l.id} style={{
            position: 'absolute', left: p.x, top: p.y,
            transform: 'translate(-50%, -100%)',
          }}>
            <div style={{
              background: color, color: l.tone === 'gold' || l.tone === 'lime' ? '#1A2744' : 'white',
              width: 38, height: 38, borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 6px 14px rgba(26,39,68,0.25)',
              border: '3px solid white',
            }}>
              <div style={{ transform: 'rotate(45deg)' }}>{React.cloneElement(l.icon, { s: 16 })}</div>
            </div>
          </div>
        );
      })}

      {/* "You are here" */}
      <div style={{ position: 'absolute', left: '45%', top: '48%', transform: 'translate(-50%, -50%)' }}>
        <div style={{
          width: 18, height: 18, borderRadius: 999,
          background: '#1A2744', border: '4px solid white',
          boxShadow: '0 4px 10px rgba(26,39,68,0.3)',
        }} />
        <div style={{
          position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#1A2744', color: 'white', padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 6,
        }}>You are here</div>
      </div>

      <div style={{
        position: 'absolute', top: 16, left: 16,
        background: 'white', padding: '8px 14px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, boxShadow: 'var(--shadow-sm)',
      }}>
        St Austell · 2 mile radius
      </div>
    </div>
  </div>
);

window.FindHelpPage = FindHelpPage;

export default FindHelpPage;
