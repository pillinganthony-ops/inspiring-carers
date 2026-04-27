// Hero.jsx — homepage hero + quick actions strip
import Icons from '../Icons.jsx';
const {
  IDot, ICard, IPin, IArrow, ISparkle, IDiscount, IReward,
  IRecognition, IChevron, IconTile, BloomMark, ICoffee,
} = Icons;

const NAVY = '#1A2744';
const GOLD = '#F5A623';

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = ({ onNavigate }) => (
  <section style={{
    paddingTop: 96, paddingBottom: 100,
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(145deg, #0F172A 0%, #1A2744 55%, #1E3A5F 100%)',
  }}>
    <div style={{ position: 'absolute', right: -140, top: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(245,166,35,0.22), rgba(212,175,55,0.1), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', left: -160, bottom: -180, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(45,156,219,0.24), rgba(16,185,129,0.1), transparent 75%)', filter: 'blur(18px)', pointerEvents: 'none' }} />

    <div className="container" style={{ position: 'relative' }}>
      <div className="hero-grid">
        <div>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 999, padding: '6px 16px', fontSize: 12.5, fontWeight: 700, color: GOLD }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: GOLD, flexShrink: 0 }} />
            For carers, organisations &amp; communities
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 66px)', lineHeight: 1.06, fontWeight: 800, letterSpacing: '-0.04em', color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', margin: '0 0 20px' }}>
            Support for carers.<br />
            <span style={{ color: '#7CC8F8', WebkitTextFillColor: '#7CC8F8' }}>Growth tools for organisations.</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)', maxWidth: 500, fontWeight: 500, margin: '0 0 32px', fontFamily: 'Inter, sans-serif' }}>
            Benefits, local support, groups, events and powerful tools that help organisations engage carers, grow communities and save time.
          </p>

          {/* Primary CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => onNavigate?.('find-help')}
              style={{ fontSize: 16, padding: '15px 30px', fontWeight: 800, boxShadow: '0 12px 32px rgba(212,175,55,0.38)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IPin s={18} /> Find help near me
            </button>
            <button
              className="btn btn-lg"
              onClick={() => onNavigate?.('benefits')}
              style={{ fontSize: 16, padding: '15px 28px', fontWeight: 700, background: 'rgba(255,255,255,0.10)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Claim carer benefits <IArrow s={16} />
            </button>
          </div>

          {/* Secondary text CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 16 }}>
            <button
              onClick={() => onNavigate?.('offer-a-discount')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, transition: 'color .14s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.78)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              Businesses: Offer a discount →
            </button>
            <button
              onClick={() => onNavigate?.('business')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, transition: 'color .14s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.78)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              Organisations: Explore your platform →
            </button>
          </div>

          {/* Premium feature strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 28 }}>
            {[
              'Bookings & events',
              'Feedback tools',
              'Social media hub',
              'Community growth',
              'Insights & analytics',
              'Organisation profiles',
            ].map(f => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.68)', whiteSpace: 'nowrap' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </div>
  </section>
);

// ── Quick action strip — pulls out of hero, zIndex overlap ────────────────────
const QuickActions = ({ onNavigate }) => {
  const actions = [
    { icon: <IPin s={26} />,      tone: 'sky',   label: 'Find Help',        sub: 'Local services',      route: 'find-help'        },
    { icon: <IDiscount s={26} />, tone: 'gold',  label: 'Benefits',         sub: 'Exclusive offers',    route: 'benefits'         },
    { icon: <ICoffee s={26} />,   tone: 'lime',  label: 'Activities',       sub: 'Things to do',        route: 'activities'       },
    { icon: <IReward s={26} />,   tone: 'coral', label: 'Offer a Discount', sub: 'For businesses',      route: 'offer-a-discount' },
  ];

  return (
    <section style={{ paddingTop: 0, paddingBottom: 0, position: 'relative', zIndex: 10, marginTop: -28 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10 }}>
          {actions.map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate?.(a.route)}
              className="card"
              style={{ padding: '18px 14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', border: 'none', borderRadius: 18, transition: 'box-shadow .14s, transform .14s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,39,68,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <IconTile tone={a.tone} size={52} radius={14}>{a.icon}</IconTile>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY, lineHeight: 1.2 }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.50)', marginTop: 3, fontWeight: 500 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Hero visual — unchanged layered cards ─────────────────────────────────────
const HeroVisual = () => (
  <div className="hero-visual" style={{ position: 'relative', minHeight: 580, width: '100%', maxWidth: 720, margin: '0 auto' }}>
    <div style={{ position: 'absolute', inset: '20px 20px 20px 20px', borderRadius: 32, background: 'linear-gradient(160deg, #FFF4E0 0%, #EEFBEB 55%, #E7F3FB 100%)', boxShadow: 'var(--shadow-xl), var(--shadow-inner), 0 0 80px rgba(212,175,55,0.08)' }} />

    <div className="card hero-card" style={{ position: 'absolute', left: 0, top: 40, width: 295, borderRadius: 24, padding: 24, background: 'linear-gradient(135deg, var(--trust-gold) 0%, #F4613A 100%)', color: NAVY, boxShadow: 'var(--shadow-xl), 0 0 40px rgba(212,175,55,0.25)', transform: 'rotate(-4deg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, color: NAVY }}>inspiring carers</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, marginTop: 3, opacity: 0.8, color: NAVY }}>member card</div>
        </div>
        <BloomMark size={38} showRing={false} />
      </div>
      <div style={{ marginTop: 48, fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: NAVY }}>Sarah M.</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, opacity: 0.85, fontWeight: 500, color: NAVY }}>
        <span>IC-228714</span><span>Cornwall</span>
      </div>
    </div>

    <div className="card hero-card" style={{ position: 'absolute', right: 0, top: 0, width: 250, padding: 22, transform: 'rotate(3deg)', boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(245,166,35,0.15)', background: 'var(--warm-white)', borderRadius: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <IconTile tone="gold" size={42} radius={12}><IDiscount s={22} /></IconTile>
        <div>
          <div style={{ fontSize: 11, color: NAVY, fontWeight: 700, letterSpacing: '0.04em', opacity: 0.7 }}>FOR YOU</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: NAVY }}>This week</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: GOLD, textShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
        24<span style={{ fontSize: 17, color: NAVY, opacity: 0.6 }}> offers</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {['var(--trust-gold)', '#5BC94A', '#2D9CDB', '#7B5CF5'].map(c => (
          <div key={c} style={{ flex: 1, height: 7, borderRadius: 4, background: c }} />
        ))}
      </div>
    </div>

    <div className="card hero-card" style={{ position: 'absolute', right: 10, top: 220, width: 310, padding: 22, boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(15,23,42,0.12)', background: 'var(--warm-white)', borderRadius: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <IconTile tone="sky" size={42} radius={12}><IPin s={22} /></IconTile>
        <div>
          <div style={{ fontSize: 11, color: NAVY, fontWeight: 700, letterSpacing: '0.04em', opacity: 0.7 }}>NEAR ST AUSTELL</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: NAVY }}>Today</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <MiniItem dot="#5BC94A" label="Coffee morning · Holy Trinity" time="10:30" />
        <MiniItem dot="#2D9CDB" label="Memory walk · Menacuddle" time="13:00" />
        <MiniItem dot="#7B5CF5" label="Carer wellbeing session" time="15:15" />
      </div>
    </div>

    <div className="card hero-card" style={{ position: 'absolute', left: 20, bottom: 24, width: 250, padding: 18, transform: 'rotate(-2deg)', boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(91,201,74,0.15)', background: 'var(--warm-white)', borderRadius: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(91,201,74,0.18)', display: 'grid', placeItems: 'center', color: '#5BC94A' }}>
          <ICoffee s={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>5 spaces left</div>
          <div style={{ fontSize: 12, color: NAVY, opacity: 0.65, marginTop: 2 }}>Today's activity group</div>
        </div>
      </div>
      <button style={{ marginTop: 14, width: '100%', padding: '11px 14px', background: 'linear-gradient(135deg, #5BC94A 0%, #4CAF50 100%)', color: NAVY, borderRadius: 999, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
        Book for a client
      </button>
    </div>

    <div style={{ position: 'absolute', left: '52%', top: 30, color: GOLD, opacity: 0.9, filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.4))' }}><ISparkle s={40} /></div>
    <div style={{ position: 'absolute', right: '15%', top: 120, color: '#2D9CDB', opacity: 0.7, transform: 'rotate(15deg)' }}><ISparkle s={24} /></div>
  </div>
);

const MiniItem = ({ dot, label, time }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 2px' }}>
    <span style={{ width: 9, height: 9, borderRadius: 999, background: dot, flexShrink: 0 }} />
    <span style={{ fontSize: 14, flex: 1, color: NAVY, fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', fontWeight: 700 }}>{time}</span>
  </div>
);

// ── DualEntry (kept, not used in main flow) ───────────────────────────────────
const DualEntry = ({ onNavigate }) => (
  <section style={{ paddingTop: 20 }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="eyebrow">Two-tier support for carers and families</div>
        <h2 style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', marginTop: 10, lineHeight: 1.05 }}>
          One trusted movement.<br/>Two essential support paths.
        </h2>
      </div>
    </div>
  </section>
);

window.Hero = Hero;
window.DualEntry = DualEntry;
window.QuickActions = QuickActions;

export { Hero, DualEntry, QuickActions };
