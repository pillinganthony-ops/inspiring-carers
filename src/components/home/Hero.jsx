// Homepage — expresses both engines from the first glance.
import Icons from '../Icons.jsx';
const { IDot, ICard, IPin, IArrow, ISparkle, IDiscount, IReward, IRecognition, IChevron, IconTile, BloomMark } = Icons;

const Hero = ({ headline, onNavigate }) => (
  <section style={{ paddingTop: 100, paddingBottom: 90, position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #FEFEFE 0%, #FFFBF3 100%)' }}>
    <div style={{ position: 'absolute', right: -140, top: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(245,166,35,0.12), rgba(212,175,55,0.08), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', left: -160, bottom: -180, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(45,156,219,0.14), rgba(16,185,129,0.06), transparent 75%)', filter: 'blur(18px)', pointerEvents: 'none' }} />

    <div className="container" style={{ position: 'relative' }}>
      <div className="hero-grid">
        <div>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.22)', borderRadius: 999, padding: '7px 16px', fontSize: 13.5, fontWeight: 700, color: '#8B5A00' }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: '#F5A623', flexShrink: 0 }} />
            Free community platform for carers
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(42px, 5.5vw, 68px)', lineHeight: 1.06, fontWeight: 800, letterSpacing: '-0.04em', color: '#1A2744', marginBottom: 22 }}>
            Support for carers.<br />
            <span style={{ color: '#2D9CDB' }}>Opportunities for organisations.</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(26,39,68,0.72)', maxWidth: 500, fontWeight: 500, marginBottom: 36, fontFamily: 'Inter, sans-serif' }}>
            Discover help, walks, events, discounts and trusted local services across Cornwall.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-gold btn-lg" onClick={() => onNavigate?.('benefits')} style={{ fontSize: 17, padding: '18px 34px', fontWeight: 700, boxShadow: '0 14px 40px rgba(212,175,55,0.3)', background: 'linear-gradient(135deg, #F5A623 0%, #D4AF37 100%)' }}>
              <ICard s={20} /> Get your free card
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => onNavigate?.('profile')} style={{ fontSize: 17, padding: '18px 34px', fontWeight: 700 }}>
              List your organisation <IArrow s={18} />
            </button>
          </div>

          {/* Subtle trust signals — no hype numbers */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 28, fontSize: 13, color: 'rgba(26,39,68,0.52)', fontWeight: 600 }}>
            {['Free to join', 'Cornwall focused', 'Walks, events & support', 'Growing community'].map((sig) => (
              <span key={sig} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#10B981', flexShrink: 0 }} />
                {sig}
              </span>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </div>
  </section>
);

// Composed hero visual: layered cards showing both engines
const HeroVisual = () => (
  <div className="hero-visual" style={{ position: 'relative', minHeight: 580, width: '100%', maxWidth: 720, margin: '0 auto' }}>
    {/* background disc */}
    <div style={{
      position: 'absolute', inset: '20px 20px 20px 20px',
      borderRadius: 32,
      background: 'linear-gradient(160deg, #FFF4E0 0%, #EEFBEB 55%, #E7F3FB 100%)',
      boxShadow: 'var(--shadow-xl), var(--shadow-inner), 0 0 80px rgba(212,175,55,0.08)',
    }} />

    {/* Card 1: Membership card (top left) */}
    <div className="card hero-card" style={{
      position: 'absolute', left: 0, top: 40,
      width: 295,
      borderRadius: 24,
      padding: 24,
      background: 'linear-gradient(135deg, var(--trust-gold) 0%, #F4613A 100%)',
      color: 'var(--authority-navy)',
      boxShadow: 'var(--shadow-xl), 0 0 40px rgba(212,175,55,0.25)',
      transform: 'rotate(-4deg)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, color: 'var(--authority-navy)' }}>
            inspiring carers
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, marginTop: 3, opacity: 0.8, color: 'var(--authority-navy)' }}>
            member card
          </div>
        </div>
        <BloomMark size={38} showRing={false} />
      </div>
      <div style={{ marginTop: 48, fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--authority-navy)' }}>
        Sarah M.
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, opacity: 0.85, fontWeight: 500, color: 'var(--authority-navy)' }}>
        <span>IC-228714</span>
        <span>Cornwall</span>
      </div>
    </div>

    {/* Card 2: Benefits snapshot (top right) */}
    <div className="card hero-card" style={{
      position: 'absolute', right: 0, top: 0,
      width: 250, padding: 22,
      transform: 'rotate(3deg)',
      boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(245,166,35,0.15)',
      background: 'var(--warm-white)',
      borderRadius: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <IconTile tone="gold" size={42} radius={12}><IDiscount s={22} /></IconTile>
        <div>
          <div style={{ fontSize: 11, color: 'var(--authority-navy)', fontWeight: 700, letterSpacing: '0.04em', opacity: 0.7 }}>FOR YOU</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--authority-navy)' }}>This week</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--trust-gold)', textShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
        24<span style={{ fontSize: 17, color: 'var(--authority-navy)', opacity: 0.6 }}> offers</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {['var(--trust-gold)', '#5BC94A', '#2D9CDB', '#7B5CF5'].map(c => (
          <div key={c} style={{ flex: 1, height: 7, borderRadius: 4, background: c, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        ))}
      </div>
    </div>

    {/* Card 3: Near you / map (center right) */}
    <div className="card hero-card" style={{
      position: 'absolute', right: 10, top: 220,
      width: 310, padding: 22,
      boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(15,23,42,0.12)',
      background: 'var(--warm-white)',
      borderRadius: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconTile tone="sky" size={42} radius={12}><IPin s={22} /></IconTile>
          <div>
            <div style={{ fontSize: 11, color: 'var(--authority-navy)', fontWeight: 700, letterSpacing: '0.04em', opacity: 0.7 }}>NEAR ST AUSTELL</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--authority-navy)' }}>Today</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <MiniItem dot="#5BC94A" label="Coffee morning · Holy Trinity" time="10:30" />
        <MiniItem dot="#2D9CDB" label="Memory walk · Menacuddle" time="13:00" />
        <MiniItem dot="#7B5CF5" label="Carer wellbeing session" time="15:15" />
      </div>
    </div>

    {/* Card 4: Activity bubble (bottom left) */}
    <div className="card hero-card" style={{
      position: 'absolute', left: 20, bottom: 24,
      width: 250, padding: 18,
      transform: 'rotate(-2deg)',
      boxShadow: 'var(--shadow-glow-navy), 0 0 32px rgba(91,201,74,0.15)',
      background: 'var(--warm-white)',
      borderRadius: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(91,201,74,0.18)',
          display: 'grid', placeItems: 'center',
          color: '#5BC94A',
          boxShadow: '0 4px 12px rgba(91,201,74,0.2)',
        }}>
          <ICoffee s={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--authority-navy)' }}>5 spaces left</div>
          <div style={{ fontSize: 12, color: 'var(--authority-navy)', opacity: 0.65, marginTop: 2 }}>Today's activity group</div>
        </div>
      </div>
      <button style={{
        marginTop: 14, width: '100%', padding: '11px 14px',
        background: 'linear-gradient(135deg, #5BC94A 0%, #4CAF50 100%)',
        color: 'var(--authority-navy)',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 13,
        boxShadow: '0 6px 18px rgba(91,201,74,0.28), var(--shadow-inner)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}>Book for a client</button>
    </div>

    {/* floating bloom sparkles */}
    <div style={{
      position: 'absolute', left: '52%', top: 30,
      color: 'var(--trust-gold)', opacity: 0.9,
      filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.4))',
    }}>
      <ISparkle s={40} />
    </div>
    <div style={{
      position: 'absolute', right: '15%', top: 120,
      color: '#2D9CDB', opacity: 0.7,
      transform: 'rotate(15deg)',
    }}>
      <ISparkle s={24} />
    </div>
  </div>
);

const MiniItem = ({ dot, label, time }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 2px' }}>
    <span style={{ width: 9, height: 9, borderRadius: 999, background: dot, flexShrink: 0 }} />
    <span style={{ fontSize: 14, flex: 1, color: '#1A2744', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', fontWeight: 700 }}>{time}</span>
  </div>
);

// The big dual-entry section — the strategic centerpiece
const DualEntry = ({ onNavigate }) => (
  <section style={{ paddingTop: 20 }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="eyebrow">Two-tier support for carers and families</div>
        <h2 style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', marginTop: 10, lineHeight: 1.05 }}>
          One trusted movement.<br/>
          Two essential support paths.
        </h2>
      </div>

      <div className="dual-entry-grid">
        <DualPanel
          eyebrow="Path 1 · For you"
          title="Benefits, rewards & recognition"
          description="Discounts, local offers, member perks and thank-yous from businesses who value what you do."
          tone="gold"
          accent="#F5A623"
          items={[
            { icon: <IDiscount s={22} />, tone: 'gold',   label: 'Discounts & offers' },
            { icon: <IReward s={22} />,   tone: 'coral',  label: 'Rewards' },
            { icon: <IRecognition s={22}/>,tone: 'violet', label: 'Recognition' },
            { icon: <ICard s={22} />,     tone: 'gold',   label: 'Member benefits' },
          ]}
          cta="Explore benefits"
          onClick={() => onNavigate('benefits')}
        />
        <DualPanel
          eyebrow="Path 2 · For the people you support"
          title="Find local help, every day"
          description="Signposting that actually works. Real groups, activities, walks, services and practical support near you."
          tone="sky"
          accent="#2D9CDB"
          items={[
            { icon: <IGroups s={22} />, tone: 'sky',  label: 'Local groups' },
            { icon: <IWalks s={22} />,  tone: 'lime', label: 'Walks' },
            { icon: <IAdvice s={22} />, tone: 'sky',  label: 'Advice' },
            { icon: <IHub s={22} />,    tone: 'violet', label: 'Support services' },
          ]}
          cta="Find help near you"
          onClick={() => onNavigate('find-help')}
        />
      </div>
    </div>
  </section>
);

const DualPanel = ({ eyebrow, title, description, tone, accent, items, cta, onClick }) => {
  const bgMap = {
    gold: 'linear-gradient(180deg, #FFF4E0 0%, #FFFBF1 100%)',
    sky:  'linear-gradient(180deg, #E7F3FB 0%, #F4FAFE 100%)',
  };
  return (
    <div style={{
      borderRadius: 28,
      background: bgMap[tone],
      border: '1px solid rgba(26,39,68,0.05)',
      padding: 36,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 440,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* accent ribbon */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: accent,
      }} />
      <div className="eyebrow" style={{ color: accent }}>{eyebrow}</div>
      <h3 style={{ fontSize: 32, fontWeight: 700, marginTop: 14, letterSpacing: '-0.025em', maxWidth: 420 }}>
        {title}
      </h3>
      <p style={{ marginTop: 14, color: 'rgba(26,39,68,0.72)', fontSize: 15.5, maxWidth: 460, lineHeight: 1.55 }}>
        {description}
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12,
        marginTop: 28, marginBottom: 28,
      }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: '1px solid rgba(26,39,68,0.05)',
          }}>
            <IconTile tone={it.tone} size={36} radius={10}>{it.icon}</IconTile>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{it.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={onClick}
          className={tone === 'gold' ? 'btn btn-gold' : 'btn btn-sky'}
        >
          {cta} <IArrow s={16} />
        </button>
      </div>
    </div>
  );
};

window.Hero = Hero;
window.DualEntry = DualEntry;

export { Hero, DualEntry };
