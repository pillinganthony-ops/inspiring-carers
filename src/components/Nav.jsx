// Sticky top navigation with a dual-path mega-menu hint.
// Props: activePage ('home' | 'find-help' | 'benefits' | etc), onNavigate

import React from 'react';
import Icons from './Icons.jsx';
import LogoLockup from './Logo.jsx';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

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
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const moreRef = React.useRef(null);
  const accountRef = React.useRef(null);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return undefined;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const onPointerDown = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) setMoreOpen(false);
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const primaryNavItems = [
    { key: 'benefits', label: 'For you', accent: '#F5A623' },
    { key: 'find-help', label: 'Find help', accent: '#2D9CDB' },
    { key: 'walks', label: 'Walks', accent: '#5BC94A' },
    { key: 'events', label: 'Events', accent: '#2D9CDB' },
  ];

  const secondaryNavItems = [
    { key: 'recognition', label: 'Recognition' },
    { key: 'business', label: 'For businesses' },
    { key: 'about', label: 'About' },
  ];

  const handleNavigate = (key) => {
    setMobileOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
    onNavigate(key);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    handleNavigate('home');
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
        gap: 30, height: 78,
        position: 'relative',
      }}>
        <button onClick={() => handleNavigate('home')} style={{ background: 'none' }}>
          <LogoLockup size={40} />
        </button>

        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', marginRight: 'auto' }}>
          {primaryNavItems.map((item) => (
            <NavItem key={item.key} label={item.label} accent={item.accent} active={activePage === item.key} onClick={() => handleNavigate(item.key)} />
          ))}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <NavItem label="More" hasCaret active={secondaryNavItems.some((item) => item.key === activePage)} onClick={() => setMoreOpen((open) => !open)} />
            {moreOpen ? (
              <div className="card" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 220, borderRadius: 18, padding: 8, display: 'grid', gap: 4, zIndex: 120 }}>
                {secondaryNavItems.map((item) => (
                  <button key={item.key} onClick={() => handleNavigate(item.key)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: activePage === item.key ? 'rgba(26,39,68,0.06)' : 'transparent', color: '#1A2744' }}>
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div ref={accountRef} style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAccountOpen((open) => !open)} style={{ gap: 6 }}>
              Profile <IChevron s={14} dir="down" />
            </button>
            {accountOpen ? (
              <div className="card" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 200, borderRadius: 16, padding: 8, display: 'grid', gap: 4, zIndex: 120 }}>
                <button onClick={() => handleNavigate('profile')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: activePage === 'profile' ? 'rgba(26,39,68,0.06)' : 'transparent', color: '#1A2744' }}>Profile</button>
                <button onClick={() => handleNavigate('login')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: activePage === 'login' ? 'rgba(26,39,68,0.06)' : 'transparent', color: '#1A2744' }}>Admin Login</button>
                {session ? <button onClick={handleLogout} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'transparent', color: '#A03A2D' }}>Logout</button> : null}
              </div>
            ) : null}
          </div>
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
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(26,39,68,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 4px' }}>Main sections</div>
            {primaryNavItems.map((item) => (
              <button key={item.key} onClick={() => handleNavigate(item.key)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, background: activePage === item.key ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: 700 }}>{item.label}</button>
            ))}

            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(26,39,68,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 4px 2px' }}>More</div>
            {secondaryNavItems.map((item) => (
              <button key={item.key} onClick={() => handleNavigate(item.key)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, background: activePage === item.key ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: 700 }}>{item.label}</button>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: session ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('profile')}>Profile</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('login')}>Admin Login</button>
              <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')}>Get card</button>
              {session ? <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button> : null}
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
