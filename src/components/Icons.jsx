// Bespoke duotone icon set for inspiring carers.
// Style: rounded 24×24 grid, duotone with brand colors.
// Each icon accepts `size` and `tone` (gold|lime|sky|coral|violet|navy).

import { Route } from 'lucide-react';

// BloomMark is defined in Logo.jsx, we'll reference it from window
const toneMap = {
  gold:   { fg: '#F5A623', bg: 'rgba(245,166,35,0.18)' },
  lime:   { fg: '#5BC94A', bg: 'rgba(91,201,74,0.18)' },
  sky:    { fg: '#2D9CDB', bg: 'rgba(45,156,219,0.18)' },
  coral:  { fg: '#F4613A', bg: 'rgba(244,97,58,0.18)' },
  violet: { fg: '#7B5CF5', bg: 'rgba(123,92,245,0.18)' },
  navy:   { fg: '#1A2744', bg: 'rgba(26,39,68,0.08)' },
};

const IconTile = ({ children, tone = 'gold', size = 56, radius = 16 }) => {
  const c = toneMap[tone];
  return (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: c.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ color: c.fg, display: 'flex' }}>{children}</div>
    </div>
  );
};

// Individual glyphs (stroke-based, rounded)
const g = (size = 24) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round',
});

const IDiscount = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M20.5 12 12 20.5a2 2 0 0 1-2.83 0L3.5 14.83a2 2 0 0 1 0-2.83L12 3.5l8.5.01L20.5 12Z" />
    <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IWellbeing = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 11c0 5.65-7 10-7 10Z" transform="translate(-1 0)" />
  </svg>
);
const IGroups = ({ s = 24 }) => (
  <svg {...g(s)}>
    <circle cx="9" cy="9" r="3.2" />
    <circle cx="17" cy="10.5" r="2.4" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
    <path d="M15 18c.3-2.3 2-3.5 4-3.5S22.8 16 22.8 18" />
  </svg>
);
const IWalks = ({ s = 24 }) => (
  <Route size={s} strokeWidth={2.35} absoluteStrokeWidth aria-hidden="true" />
);
const IEvent = ({ s = 24 }) => (
  <svg {...g(s)}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4M16 3v4" />
  </svg>
);
const IAdvice = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M4 5.5A2 2 0 0 1 6 3.5h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2v-9Z" />
    <path d="M9 10h6M9 7.5h6" />
  </svg>
);
const ILibrary = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M4 5h5a3 3 0 0 1 3 3v12" />
    <path d="M20 5h-5a3 3 0 0 0-3 3" />
    <path d="M4 5v14h5M20 5v14h-5" />
  </svg>
);
const IHub = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M4 10l8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />
  </svg>
);
const IReward = ({ s = 24 }) => (
  <svg {...g(s)}>
    <circle cx="12" cy="9" r="5" />
    <path d="M8.5 13l-1.5 7 5-3 5 3-1.5-7" />
  </svg>
);
const IRecognition = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 3l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7L6.8 19l1-5.8L3.5 9.1l5.9-.8L12 3Z" />
  </svg>
);
const IFamily = ({ s = 24 }) => (
  <svg {...g(s)}>
    <circle cx="7" cy="7.5" r="2.3" />
    <circle cx="17" cy="7.5" r="2.3" />
    <circle cx="12" cy="15" r="1.8" />
    <path d="M3 15c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <path d="M13 15c0-2.2 1.8-4 4-4s4 1.8 4 4" />
  </svg>
);
const IMind = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M14.5 3.5a5 5 0 0 0-8 3.8A3.5 3.5 0 0 0 5 14a3.5 3.5 0 0 0 3 5h1v2h5V10a4 4 0 0 0 4-4 2.5 2.5 0 0 0-3.5-2.5Z" />
  </svg>
);
const ICard = ({ s = 24 }) => (
  <svg {...g(s)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </svg>
);
const IPin = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const ISearch = ({ s = 24 }) => (
  <svg {...g(s)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);
const IHeart = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 20s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 10c0 5.65-7 10-7 10Z" transform="translate(-1 0)" />
  </svg>
);
const ITransport = ({ s = 24 }) => (
  <svg {...g(s)}>
    <rect x="4" y="5" width="16" height="10" rx="2" />
    <path d="M4 11h16" />
    <circle cx="8" cy="17" r="1.5" />
    <circle cx="16" cy="17" r="1.5" />
  </svg>
);
const IFinance = ({ s = 24 }) => (
  <svg {...g(s)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.8-1.5-1.5 0-2.7.8-2.7 2s1 1.8 2.7 2 3 .8 3 2.2-1.4 2.2-3 2.2-2.8-.8-3.2-2" />
    <path d="M12 6v2M12 16v2" />
  </svg>
);
const ISave = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M6 3.5h12a1 1 0 0 1 1 1V20l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" />
  </svg>
);
const ISparkle = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
  </svg>
);
const ICoffee = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
    <path d="M16 11h2a2 2 0 0 1 0 4h-2" />
    <path d="M7 3c0 1 1 1.5 1 2.5S7 7 7 8M11 3c0 1 1 1.5 1 2.5S11 7 11 8" />
  </svg>
);
const IShield = ({ s = 24 }) => (
  <svg {...g(s)}>
    <path d="M12 3 4 6v6c0 4.5 3.3 7.8 8 9 4.7-1.2 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const IChevron = ({ s = 18, dir = 'right' }) => {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg {...g(s)} style={{ transform: `rotate(${rot}deg)` }}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
};
const IArrow = ({ s = 18 }) => (
  <svg {...g(s)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const IMenu = ({ s = 22 }) => (
  <svg {...g(s)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
const IClose = ({ s = 20 }) => (
  <svg {...g(s)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
const ICheck = ({ s = 18 }) => (
  <svg {...g(s)}><path d="m5 12 5 5 9-11" /></svg>
);
const IStar = ({ s = 18, fill = false }) => (
  <svg {...g(s)} fill={fill ? 'currentColor' : 'none'}>
    <path d="M12 3l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7L6.8 19l1-5.8L3.5 9.1l5.9-.8L12 3Z" />
  </svg>
);
const IDot = ({ s = 8 }) => (
  <svg width={s} height={s} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
);

// Community Bloom logo — referenced from Logo.jsx  
const BloomMark = ({ size = 40, showRing = true }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {showRing && <circle cx="32" cy="32" r="30" stroke="#1A2744" strokeOpacity="0.08" strokeWidth="1.5" />}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const colors = ['#F5A623', '#5BC94A', '#2D9CDB', '#F4613A', '#7B5CF5', '#F5A623'];
      return (
        <g key={i} transform={`rotate(${deg} 32 32)`}>
          <ellipse cx="32" cy="17" rx="7" ry="11" fill={colors[i]} opacity="0.92" />
        </g>
      );
    })}
    <circle cx="32" cy="32" r="6" fill="#1A2744" />
    <circle cx="32" cy="32" r="2.5" fill="#FAFBFF" />
  </svg>
);

const Icons = {
  IconTile,
  IDiscount, IWellbeing, IGroups, IWalks, IEvent, IAdvice, ILibrary, IHub,
  IReward, IRecognition, IFamily, IMind, ICard, IPin, ISearch, IHeart,
  ITransport, IFinance, ISave, ISparkle, ICoffee, IShield,
  IChevron, IArrow, IMenu, IClose, ICheck, IStar, IDot,
  BloomMark,
};

Object.assign(window, Icons);

export default Icons;
