// Sticky top navigation with a dual-path mega-menu hint.
// Props: activePage ('home' | 'find-help' | 'benefits' | etc), onNavigate

import React from 'react';
import Icons from './Icons.jsx';
const { IChevron, IClose, IMenu } = Icons;

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
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
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
        <button onClick={() => onNavigate('home')} style={{ background: 'none' }}>
          <LogoLockup size={40} />
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavItem label="For you" accent="#F5A623" active={activePage === 'benefits'} onClick={() => onNavigate('benefits')} hasCaret />
          <NavItem label="Walks" accent="#5BC94A" active={activePage === 'walks'} onClick={() => onNavigate('walks')} />
          <NavItem label="For the people you support" accent="#2D9CDB" active={activePage === 'find-help'} onClick={() => onNavigate('find-help')} hasCaret />
          <NavItem label="Recognition" onClick={() => onNavigate('recognition')} />
          <NavItem label="For businesses" onClick={() => onNavigate('business')} />
          <NavItem label="About" onClick={() => onNavigate('about')} />
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>Admin sign in</button>
          <button className="btn btn-gold btn-sm">
            Get your free card
            <IArrow s={16} />
          </button>
        </div>
      </div>

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
