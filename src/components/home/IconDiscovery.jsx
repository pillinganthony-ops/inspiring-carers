// Icon-led discovery grid — the bespoke icon ecosystem on display
import Icons from '../Icons.jsx';
const { IDiscount, IWellbeing, IGroups, IWalks, IEvent, IAdvice, ILibrary, IHub, IReward, IRecognition, IFamily, IMind, IArrow, IconTile } = Icons;

const IconDiscovery = ({ onNavigate }) => {
  const items = [
    { icon: <IDiscount s={32}/>,    tone: 'gold',   label: 'Discounts & offers',        side: 'you',     count: 'Local & regional offers' },
    { icon: <IWellbeing s={32}/>,   tone: 'coral',  label: 'Wellbeing & courses',      side: 'both',    count: 'Regular sessions' },
    { icon: <IGroups s={32}/>,      tone: 'sky',    label: 'Local groups & socials',   side: 'support', count: 'Cornwall & beyond' },
    { icon: <IWalks s={32}/>,       tone: 'lime',   label: 'Walks & outdoors',        side: 'support', count: 'Walks & trails' },
    { icon: <IEvent s={32}/>,       tone: 'violet', label: 'Events everywhere',        side: 'both',    count: 'Near you' },
    { icon: <IAdvice s={32}/>,      tone: 'sky',    label: 'Expert advice',            side: 'support', count: 'Updated daily' },
    { icon: <ILibrary s={32}/>,     tone: 'gold',   label: 'Libraries & hubs',        side: 'support', count: '38+ near you' },
    { icon: <IHub s={32}/>,         tone: 'violet', label: 'Community centres',       side: 'support', count: '17 local hubs' },
    { icon: <IReward s={32}/>,      tone: 'coral',  label: 'Rewards & cashback',      side: 'you',     count: 'Points you can spend' },
    { icon: <IRecognition s={32}/>, tone: 'gold',   label: 'Recognition & awards',    side: 'you',     count: 'Get featured' },
    { icon: <IFamily s={32}/>,      tone: 'lime',   label: 'Family support',          side: 'support', count: 'Local services' },
    { icon: <IMind s={32}/>,        tone: 'violet', label: 'Mental wellbeing',        side: 'both',    count: '63 resources' },
  ];
  const sideAccent = { you: '#F5A623', support: '#2D9CDB', both: '#7B5CF5' };
  const sideLabel = { you: 'For you', support: 'For clients', both: 'Both' };

  return (
    <section style={{ background: '#FFFDF7', paddingTop: 80, paddingBottom: 80 }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 44, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="eyebrow" style={{ color: '#F5A623' }}>Explore Categories</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginTop: 12, maxWidth: 700, textWrap: 'balance', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Everything you need, organized one way.
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, color: 'rgba(26,39,68,0.7)', maxWidth: 600, lineHeight: 1.6, fontWeight: 500 }}>
              From discounts and local groups to advice and family events. Discover what each category offers to you and those you support.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('find-help')} style={{ whiteSpace: 'nowrap' }}>
            See all <IArrow s={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {items.map((it, i) => (
            <button key={i} className="card" style={{
              padding: 24, textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 16,
              minHeight: 180,
            }}
              onClick={() => onNavigate(it.side === 'you' ? 'benefits' : 'find-help')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <IconTile tone={it.tone} size={56} radius={16}>{it.icon}</IconTile>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 999,
                  background: sideAccent[it.side] + '22', color: sideAccent[it.side],
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {sideLabel[it.side]}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A2744' }}>{it.label}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.6)', marginTop: 4, fontWeight: 500 }}>{it.count}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

window.IconDiscovery = IconDiscovery;

export default IconDiscovery;
