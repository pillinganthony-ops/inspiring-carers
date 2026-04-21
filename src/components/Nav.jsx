// Sticky top navigation with a dual-path mega-menu hint.
// Props: activePage ('home' | 'find-help' | 'benefits' | etc), onNavigate

import React from 'react';
import Icons from './Icons.jsx';
import LogoLockup from './Logo.jsx';

const { IChevron, IClose, IMenu, IArrow } = Icons;

const NavItem = ({ label, active, accent, onClick, hasCaret }) => (
  <button
    onClick={onClick}
    style={{
      position: 'relative',
      padding: '10px 14px',
      borderRadius: 999,
      fontSize: 14.5,
      fontWeight: 600,
      color: active ? '#1A2744' : 'rgba(26,39,68,0.72)',
      background: active ? 'rgba(26,39,68,0.06)' : 'transparent',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'background .15s, color .15s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(26,39,68,0.04)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    {accent && <span style={{
      width: 8, height: 8, borderRadius: 2,
      background: accent, display: 'inline-block',
    }} />}
    {label}
    {hasCaret && <IChevron s={14} dir="down" />}
  </button>
);

const Nav = ({ activePage = 'home', onNavigate = () => {} }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'benefits', label: 'For you', accent: '#F5A623' },
    { key: 'events', label: 'Events', accent: '#2D9CDB' },
    { key: 'walks', label: 'Walks', accent: '#5BC94A' },
    { key: 'find-help', label: 'Find help', accent: '#2D9CDB' },
    { key: 'recognition', label: 'Recognition' },
    { key: 'business', label: 'For businesses' },
    { key: 'about', label: 'About' },
  ];

  const handleNavigate = (key) => {
    setMobileOpen(false);
    onNavigate(key);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 90,
      background: scrolled ? 'rgba(250,251,255,0.88)' : 'rgba(250,251,255,0.0)',
      backdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(26,39,68,0.08)' : '1px solid transparent',
      transition: 'background .2s, border-color .2s',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, height: 76,
      }}>
        <button onClick={() => handleNavigate('home')} style={{ background: 'none' }}>
          <LogoLockup size={40} />
        </button>

        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map((item) => (
            <NavItem key={item.key} label={item.label} accent={item.accent} active={activePage === item.key} onClick={() => handleNavigate(item.key)} />
          ))}
        </nav>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('profile')}>Profile</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('login')}>Admin sign in</button>
          <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')}>
            Get your free card
            <IArrow s={16} />
          </button>
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen((open) => !open)} style={{ width: 42, height: 42, borderRadius: 999, border: '1px solid rgba(26,39,68,0.12)', display: 'none', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            {mobileOpen ? <IClose s={18} /> : <IMenu s={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="container" style={{ paddingBottom: 18 }}>
          <div className="card" style={{ padding: 14, borderRadius: 22, display: 'grid', gap: 8 }}>
            {navItems.map((item) => (
              <button key={item.key} onClick={() => handleNavigate(item.key)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, background: activePage === item.key ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: 700 }}>{item.label}</button>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('profile')}>Profile</button>
              <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')}>Get card</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* subtle bloom line */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #F5A623 0%, #5BC94A 33%, #2D9CDB 66%, #7B5CF5 100%)',
        opacity: scrolled ? 0.0 : 0.0,
      }} />
    </header>
  );
};

window.Nav = Nav;

export default Nav;
