// Benefits & Offers — the personal value engine

import React from 'react';
import Icons from '../Icons.jsx';
const { ICoffee, IWellbeing, IStar, IArrow, IPin, ISearch, IChevron, IconTile, BloomMark } = Icons;

const BenefitsPage = ({ onNavigate, session }) => {
  const [activeCat, setActiveCat] = React.useState('all');
  const [savedIds, setSavedIds] = React.useState(new Set([1, 4]));

  const categories = [
    { id: 'all',     label: 'All offers',      tone: 'navy' },
    { id: 'food',    label: 'Food & drink',    tone: 'gold' },
    { id: 'well',    label: 'Wellbeing',       tone: 'lime' },
    { id: 'fam',     label: 'Family & fun',    tone: 'sky' },
    { id: 'home',    label: 'Home',            tone: 'violet' },
    { id: 'shop',    label: 'High street',     tone: 'coral' },
    { id: 'travel',  label: 'Travel',          tone: 'sky' },
  ];

  const offers = [
    { id: 1, cat: 'food', brand: 'The Cornish Bakery', discount: '20% off', desc: 'Any hot drink + pasty, all day every day', area: 'St Austell · Truro', tone: 'gold', tag: 'Local hero' },
    { id: 2, cat: 'well', brand: 'St Austell Leisure', discount: 'Free guest pass', desc: 'One free swim/gym session per month', area: 'St Austell', tone: 'lime', tag: 'Carer favourite' },
    { id: 3, cat: 'fam',  brand: 'Trelawney Garden',   discount: '£5 day ticket', desc: 'Adult + companion. Includes glasshouse.', area: 'Countywide', tone: 'sky',  tag: 'New' },
    { id: 4, cat: 'food', brand: 'Moor & Mist',        discount: '1-for-1 brunch', desc: 'Bring someone. Weekdays before 11am.', area: 'Falmouth', tone: 'coral', tag: 'Local hero' },
    { id: 5, cat: 'shop', brand: 'Warmstone Books',    discount: '15% off', desc: 'Books, cards, gifts. Online + in store.', area: 'Online + 4 stores', tone: 'violet', tag: 'Partner' },
    { id: 6, cat: 'home', brand: 'Keveral Home',       discount: '£20 off £80', desc: 'Fresh bedding, cookware, slow-living kit.', area: 'Online', tone: 'gold', tag: 'New' },
    { id: 7, cat: 'travel', brand: 'GWR Cornwall',     discount: '10% off rail', desc: 'Named-carer + client. Anytime fares.', area: 'Countywide', tone: 'sky', tag: 'Flagship' },
    { id: 8, cat: 'well', brand: 'Headspace',          discount: '6 months free', desc: 'Guided meditations and sleep stories.', area: 'Online', tone: 'lime', tag: 'Digital' },
    { id: 9, cat: 'fam',  brand: 'Eden Project',       discount: '2-for-1 entry', desc: 'Outdoors classroom for your clients too.', area: 'Bodelva', tone: 'sky', tag: 'Flagship' },
  ];

  const filtered = activeCat === 'all' ? offers : offers.filter(o => o.cat === activeCat);

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Nav activePage="benefits" onNavigate={onNavigate} session={session} />

      {/* Hero */}
      <section style={{
        paddingTop: 40, paddingBottom: 20,
        background: 'linear-gradient(180deg, #FFF4E0 0%, #FAFBFF 100%)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>Benefits & offers</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: '#F5A623' }}>For you · Benefits engine</div>
              <h1 style={{ fontSize: 'clamp(40px, 4.4vw, 60px)', marginTop: 10, letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance' }}>
                Businesses saying thank you, <span style={{ color: '#F5A623' }}>in your postcode.</span>
              </h1>
              <p style={{ marginTop: 16, fontSize: 17, color: 'rgba(26,39,68,0.72)', maxWidth: 560 }}>
                Over 1,240 local and national partners support participating organisations and their teams. Show your card. Save favourites. Pick up your rewards.
              </p>

              <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
                {[
                  ['£384', 'avg. yearly saving'],
                  ['1,240', 'partner businesses'],
                  ['24', 'new this week'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.6)', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member card hero preview */}
            <div style={{ position: 'relative', height: 280 }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 22, padding: 22,
                background: 'linear-gradient(135deg, #F5A623 0%, #F4613A 60%, #7B5CF5 120%)',
                color: '#1A2744',
                boxShadow: '0 28px 60px rgba(245,166,35,0.35)',
                transform: 'rotate(-2deg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>
                      inspiring carers
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, marginTop: 2, opacity: 0.75 }}>
                      staff benefits card · gold tier
                    </div>
                  </div>
                  <BloomMark size={40} showRing={false} />
                </div>
                <div style={{ marginTop: 80, fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 700 }}>
                  Sarah Morgan
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12.5, opacity: 0.85 }}>
                  <span>IC-228714</span>
                  <span>Member since Jan 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section style={{ paddingTop: 28, paddingBottom: 12 }}>
        <div className="container">
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {categories.map(c => {
              const active = activeCat === c.id;
              const tones = { navy: '#1A2744', gold: '#F5A623', lime: '#5BC94A', sky: '#2D9CDB', coral: '#F4613A', violet: '#7B5CF5' };
              const col = tones[c.tone];
              return (
                <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                  padding: '10px 16px', borderRadius: 999,
                  background: active ? col : 'white',
                  color: active ? (c.tone === 'gold' || c.tone === 'lime' ? '#1A2744' : 'white') : '#1A2744',
                  border: '1px solid ' + (active ? col : '#EFF1F7'),
                  fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
                  boxShadow: active ? '0 4px 12px ' + col + '55' : 'none',
                }}>{c.label}</button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offers grid */}
      <section style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}>
              <strong style={{ color: '#1A2744' }}>{filtered.length} offers</strong> · sorted by nearest
            </div>
            <button className="btn btn-ghost btn-sm">
              <ISave s={14} /> My saved ({savedIds.size})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(o => {
              const tones = { gold: '#F5A623', lime: '#5BC94A', sky: '#2D9CDB', coral: '#F4613A', violet: '#7B5CF5' };
              const col = tones[o.tone];
              const saved = savedIds.has(o.id);
              return (
                <div key={o.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className={`placeholder tint-${o.tone}`} style={{ height: 140, borderRadius: 0, fontSize: 11 }}>
                    {o.brand} · shopfront
                  </div>
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em',
                        padding: '3px 9px', borderRadius: 999,
                        background: col + '22', color: col,
                      }}>{o.tag.toUpperCase()}</span>
                      <button onClick={() => toggleSave(o.id)} style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: saved ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
                        color: saved ? '#F4613A' : '#1A2744',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <IHeart s={14} />
                      </button>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>
                        {o.brand}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 2 }}>
                        {o.area}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: col, letterSpacing: '-0.02em' }}>
                      {o.discount}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.5 }}>
                      {o.desc}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8 }}>
                      <button className="btn btn-navy btn-sm" style={{ flex: 1 }}>Show card</button>
                      <button className="btn btn-ghost btn-sm">
                        <IArrow s={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rewards rail */}
      <section style={{ paddingTop: 20, paddingBottom: 60 }}>
        <div className="container">
          <div style={{
            borderRadius: 28,
            background: 'linear-gradient(135deg, #1A2744 0%, #2D3D66 100%)',
            color: 'white', padding: 44,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ color: '#F5A623' }}>Rewards</div>
                <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', marginTop: 10, letterSpacing: '-0.025em' }}>
                  Every month, a little something back.
                </h2>
                <p style={{ marginTop: 14, color: 'rgba(255,255,255,0.72)', fontSize: 15.5, lineHeight: 1.55 }}>
                  Carer of the Month wins rewards nominated by real businesses.
                  Every cardholder unlocks one pick-me-up per month — on us.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[
                  { icon: <ICoffee s={22}/>, tone: 'gold',   label: 'Free coffee',       meta: 'Any partner café' },
                  { icon: <IWellbeing s={22}/>, tone: 'coral', label: 'Spa afternoon',  meta: '1 per quarter' },
                  { icon: <IStar s={22}/>,   tone: 'violet', label: 'Carer of Month', meta: 'Nominate a friend' },
                ].map((r, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 18, padding: 18,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <IconTile tone={r.tone} size={42} radius={12}>{r.icon}</IconTile>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 15, marginTop: 14 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{r.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

window.BenefitsPage = BenefitsPage;

export default BenefitsPage;
