// Benefits & Offers — the personal value engine

import React from 'react';
import Icons from '../Icons.jsx';
const { ICoffee, IWellbeing, IStar, IArrow, ISearch, IChevron, IconTile, BloomMark } = Icons;

const BenefitsPage = ({ onNavigate, session }) => {
  const [activeCat,  setActiveCat]  = React.useState('all');
  const [savedIds,   setSavedIds]   = React.useState(new Set([1, 4]));
  const [offerSearch, setOfferSearch] = React.useState('');

  const categories = [
    { id: 'all',    label: 'All offers',   tone: 'navy' },
    { id: 'food',   label: 'Food & drink', tone: 'gold' },
    { id: 'well',   label: 'Wellbeing',    tone: 'lime' },
    { id: 'fam',    label: 'Family & fun', tone: 'sky'  },
    { id: 'home',   label: 'Home',         tone: 'violet' },
    { id: 'shop',   label: 'High street',  tone: 'coral' },
    { id: 'travel', label: 'Travel',       tone: 'sky'  },
  ];

  // ── Demo offer data ──────────────────────────────────────────────────────
  // Fictional business names used for preview only.
  // Live partner discounts will be added as organisations join.

  const offers = [
    { id: 1, cat: 'food',   brand: 'Bloom Café Co.',            discount: '20% off',       desc: 'Any hot drink and pastry, all day every day.',               area: 'Local partner locations',  tone: 'gold',   tag: 'Preview' },
    { id: 2, cat: 'well',   brand: 'Harbour Wellbeing Studio',  discount: 'Free guest pass', desc: 'One free swim or studio session per month.',               area: 'Partner locations',        tone: 'lime',   tag: 'Wellbeing' },
    { id: 3, cat: 'fam',    brand: 'Coastline Garden Centre',   discount: '£5 day ticket',  desc: 'Adult and companion. Includes seasonal glasshouse.',         area: 'Nationwide partners',      tone: 'sky',    tag: 'Family' },
    { id: 4, cat: 'food',   brand: 'The Community Kitchen',     discount: '1-for-1 brunch', desc: 'Bring someone. Weekdays before 11am.',                       area: 'Partner venues',           tone: 'coral',  tag: 'Preview' },
    { id: 5, cat: 'shop',   brand: 'Everyday Rewards Market',   discount: '15% off',        desc: 'Books, cards and gifts. Online and partner stores.',         area: 'Online + partner stores',  tone: 'violet', tag: 'Preview' },
    { id: 6, cat: 'home',   brand: 'HomeKind Essentials',       discount: '£20 off £80',    desc: 'Bedding, cookware and home comfort essentials.',             area: 'Online',                   tone: 'gold',   tag: 'Preview' },
    { id: 7, cat: 'travel', brand: 'BrightPath Travel',         discount: '10% off',        desc: 'Named carer and companion. Flexible fares nationwide.',      area: 'Nationwide',               tone: 'sky',    tag: 'Travel' },
    { id: 8, cat: 'well',   brand: 'CalmSpace Therapy Rooms',   discount: '6 months free',  desc: 'Guided mindfulness sessions and sleep programmes.',          area: 'Online',                   tone: 'lime',   tag: 'Digital' },
    { id: 9, cat: 'fam',    brand: 'Meadow Family Adventures',  discount: '2-for-1 entry',  desc: 'Family-friendly outdoor venue. Carers and clients welcome.', area: 'Partner venues',           tone: 'sky',    tag: 'Family' },
  ];

  // Filter by category + search term (combined)
  const filtered = offers.filter(o => {
    const matchCat = activeCat === 'all' || o.cat === activeCat;
    const q = offerSearch.toLowerCase().trim();
    if (!q) return matchCat;
    const catLabel = (categories.find(c => c.id === o.cat) || {}).label || '';
    const hay = [o.brand, o.desc, o.area, o.tag, catLabel].join(' ').toLowerCase();
    return matchCat && hay.includes(q);
  });

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tones = { gold: '#F5A623', lime: '#5BC94A', sky: '#2D9CDB', coral: '#F4613A', violet: '#7B5CF5' };
  const catTones = { navy: '#1A2744', gold: '#F5A623', lime: '#5BC94A', sky: '#2D9CDB', coral: '#F4613A', violet: '#7B5CF5' };

  return (
    <>
      <Nav activePage="for-you" onNavigate={onNavigate} session={session} />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 40, paddingBottom: 20, background: 'linear-gradient(180deg, #FFF4E0 0%, #FAFBFF 100%)' }}>
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

            {/* Member card preview */}
            <div style={{ position: 'relative', height: 280 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 22, padding: 22,
                background: 'linear-gradient(135deg, #F5A623 0%, #F4613A 60%, #7B5CF5 120%)',
                color: '#1A2744', boxShadow: '0 28px 60px rgba(245,166,35,0.35)',
                transform: 'rotate(-2deg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>inspiring carers</div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, marginTop: 2, opacity: 0.75 }}>staff benefits card · gold tier</div>
                  </div>
                  <BloomMark size={40} showRing={false} />
                </div>
                <div style={{ marginTop: 80, fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 700 }}>Sarah Morgan</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12.5, opacity: 0.85 }}>
                  <span>IC-228714</span><span>Member since Jan 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search + Category chips ── */}
      <section style={{ paddingTop: 24, paddingBottom: 12 }}>
        <div className="container">

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 520, marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
              <ISearch s={16} />
            </span>
            <input
              type="text"
              value={offerSearch}
              onChange={e => setOfferSearch(e.target.value)}
              placeholder="Search discounts, rewards or businesses"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 44, paddingRight: offerSearch ? 40 : 18,
                paddingTop: 12, paddingBottom: 12,
                borderRadius: 999, border: '1px solid #E0E7F0',
                background: '#FFFFFF', fontSize: 14, color: '#1A2744',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 2px 8px rgba(26,39,68,0.06)',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#F5A623'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = '#E0E7F0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,39,68,0.06)'; }}
            />
            {offerSearch && (
              <button
                onClick={() => setOfferSearch('')}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: 999, border: 'none', background: 'rgba(26,39,68,0.10)', color: '#1A2744', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {categories.map(c => {
              const active = activeCat === c.id;
              const col = catTones[c.tone];
              return (
                <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                  padding: '10px 16px', borderRadius: 999,
                  background: active ? col : 'white',
                  color: active ? (c.tone === 'gold' || c.tone === 'lime' ? '#1A2744' : 'white') : '#1A2744',
                  border: '1px solid ' + (active ? col : '#EFF1F7'),
                  fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
                  boxShadow: active ? '0 4px 12px ' + col + '55' : 'none',
                  cursor: 'pointer',
                }}>{c.label}</button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Offers grid ── */}
      <section style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="container">

          {/* Results count + demo disclaimer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}>
              <strong style={{ color: '#1A2744' }}>{filtered.length}</strong> offer{filtered.length !== 1 ? 's' : ''}{offerSearch && <> matching <em>"{offerSearch}"</em></>}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.42)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', display: 'inline-block', flexShrink: 0 }} />
              Example offers shown for preview. Live partner discounts will be added as organisations join.
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: 18, border: '1px dashed #E0E7F0', background: '#FAFBFF' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>No matching offers yet.</div>
              <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.55)', maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                Try another search term or check back as new partners join.
              </div>
              {(offerSearch || activeCat !== 'all') && (
                <button
                  onClick={() => { setOfferSearch(''); setActiveCat('all'); }}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 16 }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Offer cards */}
          {filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {filtered.map(o => {
                const col = tones[o.tone];
                const saved = savedIds.has(o.id);
                return (
                  <div key={o.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className={`placeholder tint-${o.tone}`} style={{ height: 140, borderRadius: 0, fontSize: 11 }}>
                      {o.brand} · partner preview
                    </div>
                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 999, background: col + '22', color: col }}>
                          {o.tag.toUpperCase()}
                        </span>
                        <button onClick={() => toggleSave(o.id)} style={{
                          width: 32, height: 32, borderRadius: 999, border: 'none',
                          background: saved ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
                          color: saved ? '#F4613A' : '#1A2744', cursor: 'pointer',
                          display: 'grid', placeItems: 'center',
                        }}>
                          <IHeart s={14} />
                        </button>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{o.brand}</div>
                        <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <IPin s={11} /> {o.area}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: col, letterSpacing: '-0.02em' }}>
                        {o.discount}
                      </div>
                      <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.5 }}>{o.desc}</p>
                      <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8 }}>
                        <button className="btn btn-navy btn-sm" style={{ flex: 1 }}>Show card</button>
                        <button className="btn btn-ghost btn-sm"><IArrow s={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Rewards rail ── */}
      <section style={{ paddingTop: 20, paddingBottom: 60 }}>
        <div className="container">
          <div style={{
            borderRadius: 28, background: 'linear-gradient(135deg, #1A2744 0%, #2D3D66 100%)',
            color: 'white', padding: 44, position: 'relative', overflow: 'hidden',
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
                  { icon: <ICoffee s={22}/>,    tone: 'gold',   label: 'Free coffee',     meta: 'Any partner café' },
                  { icon: <IWellbeing s={22}/>, tone: 'coral',  label: 'Spa afternoon',   meta: '1 per quarter' },
                  { icon: <IStar s={22}/>,      tone: 'violet', label: 'Carer of Month',  meta: 'Nominate a friend' },
                ].map((r, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
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
