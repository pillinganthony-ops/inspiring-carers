// Featured businesses + "why carers matter to us" quote cards
import Icons from '../Icons.jsx';
const { IStar, IArrow, ISave } = Icons;

const Businesses = () => {
  const partners = [
    { name: 'The Cornish Bakery', cat: 'Food & drink', discount: '20% off', tone: 'gold', badge: 'Local hero' },
    { name: 'St Austell Leisure', cat: 'Wellbeing',    discount: 'Free guest pass', tone: 'lime', badge: 'Carer favourite' },
    { name: 'Trelawney Garden',   cat: 'Outdoors',     discount: '£5 day ticket',   tone: 'sky', badge: 'New partner' },
    { name: 'Moor & Mist',        cat: 'Cafés',        discount: '1-for-1 brunch',  tone: 'coral', badge: 'Local hero' },
  ];

  return (
    <section style={{ background: '#FFFDF7', paddingTop: 80, paddingBottom: 80 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ color: '#F5A623', fontWeight: 800 }}>For you · Benefits</div>
            <h2 style={{ fontSize: 'clamp(36px, 4.2vw, 52px)', fontWeight: 700, marginTop: 14, letterSpacing: '-0.03em', textWrap: 'balance', color: '#1A2744' }}>
              Local businesses who support carers.
            </h2>
            <p style={{ marginTop: 20, color: 'rgba(26,39,68,0.75)', fontSize: 17, lineHeight: 1.65, fontWeight: 500 }}>
              Restaurants, gyms, gardens, cafés—they all offer discounts and perks to carers. Show your free card and save money every day.
            </p>

            <div style={{
              marginTop: 36, padding: 28,
              background: 'linear-gradient(135deg, #FFF4E0 0%, #FFFBF5 100%)',
              borderRadius: 24,
              border: '1px solid rgba(245,166,35,0.18)',
            }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18, color: '#F5A623' }}>
                {[0,1,2,3,4].map(i => <IStar key={i} s={18} fill />)}
              </div>
              <p style={{ marginTop: 6, fontFamily: 'Sora, sans-serif', fontSize: 18.5, lineHeight: 1.5, fontWeight: 600, color: '#1A2744', textWrap: 'pretty' }}>
                "Carers are the backbone of our community. Offering 20% off is our way of saying thank you."
              </p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999, 
                  background: 'linear-gradient(135deg, #F5A623 0%, #F4613A 100%)',
                  display: 'grid', placeItems: 'center',
                  color: 'white', fontFamily: 'Sora, sans-serif', fontWeight: 700,
                }}>M</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744' }}>Maria Trelawney</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', marginTop: 2 }}>The Cornish Bakery · Partner since 2024</div>
                </div>
              </div>
            </div>

            <button className="btn" style={{ marginTop: 28, background: '#1A2744', color: 'white', fontWeight: 700 }} onClick={() => {}}>
              Browse all partners <IArrow s={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {partners.map((p, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div style={{
                  height: 140, 
                  background: `linear-gradient(135deg, #${p.tone === 'gold' ? 'FFE5CC' : p.tone === 'lime' ? 'E8F9E0' : p.tone === 'sky' ? 'E0F4FF' : 'FFE5D9'}, white)`,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 15,
                  color: 'rgba(26,39,68,0.4)',
                }}>
                  {p.name}
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                    <span className={`chip chip-${p.tone}`} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>{p.cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.6)', background: 'rgba(26,39,68,0.04)', padding: '4px 10px', borderRadius: 6 }}>{p.badge}</span>
                  </div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18.5, marginTop: 14, color: '#1A2744' }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: 14 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: '#F5A623' }}>
                      {p.discount}
                    </div>
                    <button style={{
                      width: 40, height: 40, borderRadius: 999,
                      background: 'rgba(26,39,68,0.08)',
                      display: 'grid', placeItems: 'center',
                      color: '#1A2744', fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}><ISave s={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

window.Businesses = Businesses;

export default Businesses;
