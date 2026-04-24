// Signposting / practical help section — the Engine 2 centerpiece
import Icons from '../Icons.jsx';
const { IGroups, ICoffee, IWalks, IEvent, ILibrary, IHub, IMind, IFinance, ITransport, IShield, IPin, IconTile } = Icons;

const Signposting = ({ onNavigate }) => {
  const tiles = [
    { icon: <IGroups s={24}/>,  tone: 'sky',   label: 'Support groups',    count: '312 nearby', big: true },
    { icon: <ICoffee s={24}/>,  tone: 'coral', label: 'Coffee mornings',   count: '48 this week' },
    { icon: <IWalks s={24}/>,   tone: 'lime',  label: 'Walks & outdoors',  count: '86 routes' },
    { icon: <IEvent s={24}/>,   tone: 'violet',label: 'Events',            count: '24 this week' },
    { icon: <ILibrary s={24}/>, tone: 'gold',  label: 'Libraries',         count: '38 nearby' },
    { icon: <IHub s={24}/>,     tone: 'sky',   label: 'Community hubs',    count: '17 local hubs' },
    { icon: <IMind s={24}/>,    tone: 'violet',label: 'Mental wellbeing',  count: '63 resources' },
    { icon: <IFinance s={24}/>, tone: 'lime',  label: 'Finance help',      count: '22 services' },
    { icon: <ITransport s={24}/>,tone: 'coral', label: 'Transport help',   count: '19 options' },
    { icon: <IShield s={24}/>,  tone: 'gold',  label: 'Safe spaces',       count: '41 locations' },
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.2fr', gap: 72, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="eyebrow" style={{ color: '#2D9CDB', fontWeight: 800 }}>For the people you support</div>
            <h2 style={{ fontSize: 'clamp(36px, 4.2vw, 52px)', fontWeight: 700, marginTop: 14, letterSpacing: '-0.03em', textWrap: 'balance', color: '#1A2744' }}>
              Real help, everywhere nearby.
            </h2>
            <p style={{ marginTop: 20, color: 'rgba(26,39,68,0.75)', fontSize: 17, lineHeight: 1.65, fontWeight: 500, maxWidth: 520 }}>
              This is why carers trust us. Verified local groups, real sessions, genuine support  — all searchable by postcode, need, and accessibility. No directories. Just results.
            </p>

            <div style={{ marginTop: 36,
              display: 'flex', flexDirection: 'column', gap: 16,
              padding: 28, background: 'linear-gradient(180deg, #E7F3FB 0%, #F4FAFE 100%)',
              borderRadius: 24, border: '1px solid rgba(45,156,219,0.22)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#165a85', letterSpacing: '0.02em' }}>Find activities now</div>
              <div style={{
                background: 'white', borderRadius: 16, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                border: '1px solid rgba(26,39,68,0.08)',
              }}>
                <IPin s={20} style={{ color: '#2D9CDB' }} />
                <input
                  type="text"
                  defaultValue="PL25 5QP"
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A2744',
                    background: 'transparent',
                  }}
                />
                <button onClick={() => onNavigate('find-help')} className="btn btn-sky btn-sm" style={{ fontWeight: 700 }}>
                  Search
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Accessible', 'This week', 'Free', 'Dementia-friendly'].map(t => (
                  <span key={t} className="chip" style={{ padding: '6px 12px', fontSize: 12, background: 'white', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '140px',
            gap: 16,
          }}>
            {tiles.map((t, i) => (
              <button
                key={i}
                onClick={() => onNavigate('find-help')}
                className="card"
                style={{
                  gridColumn: t.big ? 'span 2' : 'auto',
                  padding: 24, textAlign: 'left',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                }}
              >
                <IconTile tone={t.tone} size={48} radius={14}>{t.icon}</IconTile>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17.5, color: '#1A2744' }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', marginTop: 4, fontWeight: 500 }}>{t.count}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

window.Signposting = Signposting;

export default Signposting;
