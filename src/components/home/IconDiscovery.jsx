// Icon-led discovery grid — the bespoke icon ecosystem on display
import Icons from '../Icons.jsx';
const { IDiscount, IWellbeing, IGroups, IWalks, IEvent, IAdvice, ILibrary, IHub, IReward, IRecognition, IFamily, IMind, IArrow, IconTile, ISparkle } = Icons;

const IconDiscovery = ({ onNavigate }) => {
  // Top 8 — show only priority categories on homepage
  const items = [
    { icon: <IDiscount s={32}/>,    tone: 'gold',   label: 'Discounts & Offers',    side: 'you',     count: 'Local & regional offers',  route: 'benefits' },
    { icon: <IWellbeing s={32}/>,   tone: 'coral',  label: 'Wellbeing Support',     side: 'both',    count: 'Calm & restorative',       route: 'wellbeing' },
    { icon: <IGroups s={32}/>,      tone: 'sky',    label: 'Groups & Social',       side: 'support', count: 'Cornwall & beyond',        route: 'find-help' },
    { icon: <IWalks s={32}/>,       tone: 'lime',   label: 'Walks & Outdoors',      side: 'support', count: 'Trails & coastal paths',   route: 'walks' },
    { icon: <IEvent s={32}/>,       tone: 'violet', label: 'Events',                side: 'both',    count: 'Near you',                 route: 'events' },
    { icon: <IMind s={32}/>,        tone: 'violet', label: 'Mental Wellbeing',      side: 'both',    count: '63 resources',             route: 'wellbeing' },
    { icon: <IAdvice s={32}/>,      tone: 'sky',    label: 'Money Help',            side: 'support', count: 'Benefits & grants',        route: 'find-help' },
    { icon: <IReward s={32}/>,      tone: 'coral',  label: 'Training',              side: 'you',     count: 'Skills & development',     route: 'training' },
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {items.map((it, i) => (
            <button key={i} className="card" style={{ padding: '20px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 18, border: 'none', transition: 'box-shadow .14s, transform .14s' }}
              onClick={() => onNavigate(it.route || 'find-help')}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,39,68,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <IconTile tone={it.tone} size={50} radius={14}>{it.icon}</IconTile>
                <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: sideAccent[it.side] + '1A', color: sideAccent[it.side], letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {sideLabel[it.side]}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16.5, color: '#1A2744' }}>{it.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', marginTop: 3, fontWeight: 500 }}>{it.count}</div>
              </div>
            </button>
          ))}
        </div>

        {/* View all */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => onNavigate('find-help')}
            className="btn btn-ghost"
            style={{ fontSize: 15, padding: '11px 28px', fontWeight: 700 }}
          >
            View all support <IArrow s={15} />
          </button>
        </div>
      </div>
    </section>
  );
};

window.IconDiscovery = IconDiscovery;

export default IconDiscovery;
