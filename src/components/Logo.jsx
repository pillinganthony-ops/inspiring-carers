// Community Bloom logo — a bespoke six-petal bloom with a heart at the center.
// Original mark drawn for inspiring carers.

const BloomMark = ({ size = 40, showRing = true }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {showRing && <circle cx="32" cy="32" r="30" stroke="#1A2744" strokeOpacity="0.08" strokeWidth="1.5" />}
    {/* 6 petals arranged around center */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const colors = ['#F5A623', '#5BC94A', '#2D9CDB', '#F4613A', '#7B5CF5', '#F5A623'];
      return (
        <g key={i} transform={`rotate(${deg} 32 32)`}>
          <ellipse cx="32" cy="17" rx="7" ry="11" fill={colors[i]} opacity="0.92" />
        </g>
      );
    })}
    {/* Center dot */}
    <circle cx="32" cy="32" r="6" fill="#1A2744" />
    <circle cx="32" cy="32" r="2.5" fill="#FAFBFF" />
  </svg>
);

const LogoLockup = ({ size = 36 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <BloomMark size={size} />
    <div style={{ lineHeight: 1 }}>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: 18,
        color: '#1A2744',
        letterSpacing: '-0.02em'
      }}>
        inspiring carers
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 10.5,
        color: '#1A2744',
        opacity: 0.55,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginTop: 3
      }}>
        community bloom
      </div>
    </div>
  </div>
);

window.BloomMark = BloomMark;
window.LogoLockup = LogoLockup;

export default LogoLockup;
