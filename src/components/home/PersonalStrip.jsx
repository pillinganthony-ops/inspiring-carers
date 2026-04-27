// PersonalStrip — logged-in: personalised panel; logged-out: join CTA
import Icons from '../Icons.jsx';
const { ISparkle, IWalks, ICoffee, IGroups, IPin, ISearch, IChevron, IconTile, IArrow } = Icons;

const NAVY = '#1A2744';
const GOLD = '#F5A623';

const JoinStrip = ({ onNavigate }) => (
  <section style={{ paddingTop: 56, paddingBottom: 56, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 12 }}>Free forever</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Join free for local support, offers and updates.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.65, margin: '0 0 26px' }}>
            Get personalised recommendations, save local resources, and access exclusive carer discounts in your area.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate?.('profile')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 12, background: 'linear-gradient(135deg, #1A2744, #2D3E6B)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(26,39,68,0.22)' }}
            >
              Create free account <IArrow s={15} />
            </button>
            <button
              onClick={() => onNavigate?.('find-help')}
              style={{ padding: '13px 22px', borderRadius: 12, background: 'white', border: '1px solid rgba(26,39,68,0.14)', color: NAVY, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              Browse without joining
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(26,39,68,0.38)' }}>
            No credit card. No obligation.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            [GOLD,      '500+ local resources', 'Updated regularly'         ],
            ['#16A34A', 'Free to use',          'Always free for carers'    ],
            ['#2563EB', 'Carer discounts',      'From local businesses'     ],
            ['#7B5CF5', 'Events & groups',      'Near you'                  ],
          ].map(([dot, label, sub]) => (
            <div key={label} className="card" style={{ padding: '14px 16px', borderRadius: 14, borderLeft: `3px solid ${dot}` }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{label}</div>
              <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.48)', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PersonalStrip = ({ greeting, location, session, onNavigate }) => {
  if (!session) return <JoinStrip onNavigate={onNavigate} />;

  const items = [
    { tag: 'NEW',       tagTone: GOLD,      icon: <ISparkle s={22}/>, iconTone: 'gold',   title: '24 new deals just added',       meta: 'Fresh offers from your local partners', cta: "See what's new" },
    { tag: 'TODAY',     tagTone: '#5BC94A', icon: <IWalks s={22}/>,   iconTone: 'lime',   title: 'Memory walk near you',          meta: 'Wed 13:00 · 1.2 miles · fully accessible', cta: 'Save for a client' },
    { tag: '5 SPACES',  tagTone: '#F4613A', icon: <ICoffee s={22}/>,  iconTone: 'coral',  title: 'Coffee morning at Holy Trinity', meta: 'Thu 10:30 · dementia-friendly group', cta: 'Reserve now' },
    { tag: 'NEW GROUP', tagTone: '#7B5CF5', icon: <IGroups s={22}/>,  iconTone: 'violet', title: "Parkinson's carers launch",     meta: 'New group · Mondays · 10am', cta: 'Invite a client' },
  ];

  return (
    <section style={{ paddingTop: 72, paddingBottom: 56, background: '#FFFEF9' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #F5A623, #F4613A)', color: 'white', display: 'grid', placeItems: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, boxShadow: '0 6px 18px rgba(245,166,35,0.25)' }}>
              {(greeting || 'S').charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em', color: NAVY, margin: 0 }}>
                Welcome back, {greeting}
              </h2>
              <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <IPin s={14} /> Near {location}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm">My saved</button>
            <button className="btn btn-ghost btn-sm"><ISearch s={14} /> Search</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {items.map((it, i) => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <IconTile tone={it.iconTone} size={44} radius={13}>{it.icon}</IconTile>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', padding: '3px 9px', borderRadius: 999, background: it.tagTone + '22', color: it.tagTone }}>{it.tag}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15.5, lineHeight: 1.35, color: NAVY }}>{it.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', marginTop: 6, fontWeight: 500 }}>{it.meta}</div>
              </div>
              <button style={{ marginTop: 'auto', alignSelf: 'start', color: NAVY, fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {it.cta} <IChevron s={14} />
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
