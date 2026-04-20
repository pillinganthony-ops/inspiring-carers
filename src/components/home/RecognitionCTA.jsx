// Recognition section + closing CTA band

const Recognition = () => {
  const stories = [
    { name: 'Priya Shah', place: 'Truro', role: 'Home carer · 6 years', tone: 'gold', quote: '"She knows every client\u2019s favourite song. Every one."' },
    { name: 'Tomás Lynch', place: 'Newquay', role: 'Live-in carer · 3 years', tone: 'lime', quote: '"Turned our dad\u2019s last year into his best year."' },
    { name: 'Amara Okafor', place: 'Falmouth', role: 'Dementia specialist', tone: 'sky', quote: '"No carer should feel unseen. Not on my watch."' },
  ];
  return (
    <section style={{ background: 'linear-gradient(180deg, #FFFDF7 0%, #FFF4E0 100%)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="eyebrow" style={{ color: '#F4613A' }}>Recognition</div>
          <h2 style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', marginTop: 10, letterSpacing: '-0.025em', textWrap: 'balance' }}>
            The people who keep communities going.
          </h2>
          <p style={{ marginTop: 14, fontSize: 16, color: 'rgba(26,39,68,0.7)', maxWidth: 560, margin: '14px auto 0' }}>
            Every month we name a Carer of the Month, nominated by the people they look after
            and the businesses who see them turn up, rain or shine.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 18 }}>
          {/* Featured carer of the month */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="placeholder tint-gold" style={{ height: 240, borderRadius: 0, fontSize: 11 }}>
              portrait · priya shah
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '5px 10px', borderRadius: 999,
                  background: '#F5A623', color: '#1A2744',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
                }}>CARER OF THE MONTH · APRIL</span>
              </div>
              <h3 style={{ fontSize: 26, marginTop: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Priya Shah, Truro
              </h3>
              <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.7)', marginTop: 10, lineHeight: 1.55 }}>
                Nominated by 14 clients and 3 local businesses. Priya has been a home carer for 6 years,
                known for the small things — remembered songs, the right biscuits, never rushing.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button className="btn btn-gold btn-sm">Read her story</button>
                <button className="btn btn-ghost btn-sm">Nominate a carer</button>
              </div>
            </div>
          </div>

          {/* Short story cards */}
          {stories.slice(1).map((s, i) => (
            <div key={i} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
              <div className={`placeholder tint-${s.tone}`} style={{ width: 60, height: 60, borderRadius: 999, fontSize: 0, marginBottom: 18 }} />
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 500, lineHeight: 1.4 }}>
                {s.quote}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.55)' }}>{s.role} · {s.place}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ClosingBand = () => (
  <section style={{ paddingTop: 40, paddingBottom: 100 }}>
    <div className="container">
      <div style={{
        borderRadius: 32,
        background: '#1A2744',
        color: 'white',
        padding: 56,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative bloom */}
        <div style={{ position: 'absolute', right: -60, top: -60, opacity: 0.8 }}>
          <BloomMark size={260} showRing={false} />
        </div>
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <div className="eyebrow" style={{ color: '#F5A623' }}>Free · forever</div>
          <h2 style={{ fontSize: 'clamp(32px, 3.6vw, 52px)', marginTop: 14, fontWeight: 700, letterSpacing: '-0.03em', color: 'white', textWrap: 'balance' }}>
            Your free member card. Both sides of the platform, unlocked.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Three minutes. A PDF and a physical card in the post. Then show it anywhere you see the bloom.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn btn-gold btn-lg">
              Get your free card <IArrow s={18} />
            </button>
            <button className="btn btn-lg" style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              I already have one
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

window.Recognition = Recognition;
window.ClosingBand = ClosingBand;
