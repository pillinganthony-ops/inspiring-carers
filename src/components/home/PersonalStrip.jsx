// Personalized "happening near you" strip + daily-dynamic content
import Icons from '../Icons.jsx';
const { ISparkle, IWalks, ICoffee, IGroups, IPin, ISearch, IChevron, IconTile } = Icons;

const PersonalStrip = ({ greeting, location }) => {
  const items = [
    { tag: 'NEW', tagTone: '#F5A623', icon: <ISparkle s={22}/>, iconTone: 'gold', title: '24 new deals just added', meta: 'Fresh offers from your local partners', cta: 'See what’s new' },
    { tag: 'TODAY', tagTone: '#5BC94A', icon: <IWalks s={22}/>, iconTone: 'lime', title: 'Memory walk near you', meta: 'Wed 13:00 · 1.2 miles · fully accessible', cta: 'Save for a client' },
    { tag: '5 SPACES', tagTone: '#F4613A', icon: <ICoffee s={22}/>, iconTone: 'coral', title: 'Coffee morning at Holy Trinity', meta: 'Thu 10:30 · dementia-friendly group', cta: 'Reserve now' },
    { tag: 'NEW GROUP', tagTone: '#7B5CF5', icon: <IGroups s={22}/>, iconTone: 'violet', title: 'Parkinson’s carers launch', meta: 'St Austell · Mondays · 10am', cta: 'Invite a client' },
  ];

  return (
    <section style={{ paddingTop: 72, paddingBottom: 56, background: '#FFFEF9' }}>
      <div className="container">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 36, flexWrap: 'wrap', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg, #F5A623, #F4613A)',
              color: 'white', display: 'grid', placeItems: 'center',
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22,
              boxShadow: '0 8px 20px rgba(245,166,35,0.25)',
            }}>S</div>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#1A2744' }}>
                Welcome back, {greeting} <span style={{ display: 'inline-block' }}>👋</span>
              </h2>
              <div style={{ fontSize: 15, color: 'rgba(26,39,68,0.65)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <IPin s={15} /> Near {location} · Wed 20 Apr
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 15 }}>My saved</button>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 15 }}><ISearch s={15} /> Search</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {items.map((it, i) => (
            <div key={i} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16, cursor: 'pointer', minHeight: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <IconTile tone={it.iconTone} size={44} radius={13}>{it.icon}</IconTile>
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
                  padding: '4px 10px', borderRadius: 999,
                  background: it.tagTone + '22', color: it.tagTone,
                }}>{it.tag}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16.5, lineHeight: 1.35, color: '#1A2744' }}>
                  {it.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginTop: 8, fontWeight: 500 }}>
                  {it.meta}
                </div>
              </div>
              <button style={{
                marginTop: 'auto', alignSelf: 'start',
                color: '#1A2744', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {it.cta} <IChevron s={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

window.PersonalStrip = PersonalStrip;

export default PersonalStrip;
