// Nav — national platform navigation
// Props: activePage, onNavigate, session

import React from 'react';
import Icons from './Icons.jsx';
import LogoLockup from './Logo.jsx';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const { IChevron, IClose, IMenu, IArrow } = Icons;

const ADMIN_EMAIL_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

/* ─── NavItem ─────────────────────────────────────────────── */
const NavItem = ({ label, active, accent, onClick, hasCaret }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 14px',
      borderRadius: 999,
      fontSize: 14,
      fontWeight: active ? 700 : 600,
      color: active ? '#1A2744' : 'rgba(26,39,68,0.68)',
      background: active ? 'rgba(26,39,68,0.07)' : 'transparent',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      transition: 'background .15s, color .15s',
      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(26,39,68,0.04)'; e.currentTarget.style.color = '#1A2744'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,39,68,0.68)'; } }}
  >
    {accent && <span style={{ width: 7, height: 7, borderRadius: 2, background: accent, display: 'inline-block', flexShrink: 0 }} />}
    {label}
    {hasCaret && <IChevron s={13} />}
  </button>
);

/* ─── DropItem ────────────────────────────────────────────── */
const DropItem = ({ label, active, onClick, danger }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'left', width: '100%',
        padding: '9px 13px', borderRadius: 10,
        fontSize: 13.5, fontWeight: 600,
        background: hov
          ? (danger ? 'rgba(160,58,45,0.07)' : 'rgba(26,39,68,0.05)')
          : (active ? 'rgba(26,39,68,0.05)' : 'transparent'),
        color: danger ? '#A03A2D' : '#1A2744',
        border: 'none', cursor: 'pointer', display: 'block',
        transition: 'background .12s',
      }}
    >
      {label}
    </button>
  );
};

const DropDivider = () => (
  <div style={{ height: 1, background: '#EEF1F8', margin: '4px 6px' }} />
);

/* ─── Nav ─────────────────────────────────────────────────── */
const Nav = ({ activePage = 'home', onNavigate = () => {}, session: sessionProp, county = null }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [activitiesOpen, setActivitiesOpen] = React.useState(false);
  const moreRef = React.useRef(null);
  const accountRef = React.useRef(null);
  const activitiesRef = React.useRef(null);
  const [sessionInternal, setSessionInternal] = React.useState(null);
  const session = sessionProp !== undefined ? sessionProp : sessionInternal;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (sessionProp !== undefined) return undefined;
    if (!isSupabaseConfigured() || !supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionInternal(data.session ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSessionInternal(s ?? null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [sessionProp]);

  React.useEffect(() => {
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (activitiesRef.current && !activitiesRef.current.contains(e.target)) setActivitiesOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setMoreOpen(false); setAccountOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const primaryNavItems = [
    { key: 'find-help',  label: 'Find help',  accent: '#2D9CDB' },
    { key: 'training',   label: 'Training',    accent: '#7B5CF5' },
    { key: 'events',     label: 'Events',      accent: '#2D9CDB' },
    { key: 'for-you',    label: 'For you',     accent: '#F5A623' },
  ];

  // Activities sub-pages — Walks, Places to Visit, and Wellbeing Support are live.
  const activitiesItems = [
    { key: 'walks',           label: 'Walks',             note: 'Trails and routes'     },
    { key: 'places-to-visit', label: 'Places to Visit',   note: 'Attractions & days out' },
    { key: 'wellbeing',       label: 'Wellbeing Support', note: 'Calm & restorative'    },
    { key: 'groups',          label: 'Groups',            note: 'Social & peer support'  },
  ];
  const isActivitiesPage = activitiesItems.some((i) => i.key === activePage) || activePage === 'activities';

  const moreItems = [
    { key: 'recognition', label: 'Recognition' },
    { key: 'business',    label: 'For businesses' },
    { key: 'about',       label: 'About' },
  ];

  const profileItems = [
    { label: 'Account Dashboard', key: 'profile',            isActive: activePage === 'profile' },
    { label: 'My Organisation',   key: 'profile-org',        isActive: activePage === 'profile-org' },
    { label: 'My Posts',          key: 'profile-posts',      isActive: activePage === 'profile-posts' },
    { label: 'My Enquiries',      key: 'profile-enquiries',  isActive: activePage === 'profile-enquiries' },
    { label: 'Settings',          key: 'profile-settings',   isActive: activePage === 'profile-settings' },
  ];
  const isAccountPage = ['profile', 'profile-org', 'profile-posts', 'profile-enquiries', 'profile-settings'].includes(activePage);

  const isAdmin = Boolean(session?.user?.email && ADMIN_EMAIL_ALLOWLIST.includes(session.user.email.toLowerCase()));

  const handleNavigate = (key) => {
    setMobileOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
    setActivitiesOpen(false);
    onNavigate(key);
  };

  // County-aware nav handlers: county selected → /county/page; no county → hub
  const handleActivitiesClick = () => {
    setMobileOpen(false); setMoreOpen(false); setAccountOpen(false); setActivitiesOpen(false);
    onNavigate('activities', null);
  };
  // Find Help goes directly to county directory (no hub page).
  const handleFindHelpClick = () => {
    setMobileOpen(false); setMoreOpen(false); setAccountOpen(false); setActivitiesOpen(false);
    onNavigate('find-help');
  };
  const handleEventsClick = () => {
    setMobileOpen(false); setMoreOpen(false); setAccountOpen(false); setActivitiesOpen(false);
    onNavigate('events', null);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    handleNavigate('home');
  };

  /* ─── dropdown card shared style ─── */
  const dropCard = {
    position: 'absolute', top: 'calc(100% + 8px)',
    minWidth: 210, borderRadius: 16, padding: 6,
    display: 'grid', gap: 2, zIndex: 120,
    background: '#fff',
    boxShadow: '0 8px 32px rgba(26,39,68,0.13), 0 1px 4px rgba(26,39,68,0.06)',
    border: '1px solid rgba(26,39,68,0.06)',
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 90,
      background: scrolled ? 'rgba(250,251,255,0.92)' : 'rgba(250,251,255,0.0)',
      backdropFilter: scrolled ? 'blur(16px) saturate(150%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(150%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(26,39,68,0.08)' : '1px solid transparent',
      transition: 'background .2s, border-color .2s',
    }}>

      {/* ── 3-column grid: logo | centre nav | actions ── */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 16,
        height: 72,
      }}>

        {/* Logo */}
        <button onClick={() => handleNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <LogoLockup size={38} />
        </button>

        {/* Centre nav */}
        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {/* Find Help — county-aware: hub when no county, county page when set */}
          <NavItem label="Find help" accent="#2D9CDB" active={activePage === 'find-help'} onClick={handleFindHelpClick} />

          {/* Activities — split button: label navigates conditionally, caret opens dropdown */}
          <div ref={activitiesRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button
              onClick={handleActivitiesClick}
              style={{
                padding: '8px 8px 8px 14px', borderRadius: '999px 0 0 999px',
                fontSize: 14, fontWeight: isActivitiesPage ? 700 : 600,
                color: isActivitiesPage ? '#1A2744' : 'rgba(26,39,68,0.68)',
                background: isActivitiesPage ? 'rgba(26,39,68,0.07)' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { if (!isActivitiesPage) { e.currentTarget.style.background = 'rgba(26,39,68,0.04)'; e.currentTarget.style.color = '#1A2744'; }}}
              onMouseLeave={e => { if (!isActivitiesPage) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,39,68,0.68)'; }}}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: '#5BC94A', display: 'inline-block', flexShrink: 0 }} />
              Activities
            </button>
            <button
              onClick={() => setActivitiesOpen((o) => !o)}
              style={{
                padding: '8px 10px 8px 4px', borderRadius: '0 999px 999px 0',
                fontSize: 14, fontWeight: 600,
                color: isActivitiesPage ? '#1A2744' : 'rgba(26,39,68,0.68)',
                background: isActivitiesPage ? 'rgba(26,39,68,0.07)' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { if (!isActivitiesPage) { e.currentTarget.style.background = 'rgba(26,39,68,0.04)'; e.currentTarget.style.color = '#1A2744'; }}}
              onMouseLeave={e => { if (!isActivitiesPage) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,39,68,0.68)'; }}}
            >
              <IChevron s={13} />
            </button>
            {activitiesOpen && (
              <div style={{ ...dropCard, left: '50%', transform: 'translateX(-50%)', minWidth: 200 }}>
                {activitiesItems.map((item) => (
                  <DropItem key={item.key} label={item.label} active={activePage === item.key} onClick={() => handleNavigate(item.key)} />
                ))}
              </div>
            )}
          </div>

          {/* Remaining primary items — Events is county-aware, others use generic handler */}
          {primaryNavItems.slice(1).map((item) => (
            <NavItem key={item.key} label={item.label} accent={item.accent} active={activePage === item.key}
              onClick={item.key === 'events' ? handleEventsClick : () => handleNavigate(item.key)} />
          ))}

          {/* More ▾ */}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <NavItem
              label="More"
              hasCaret
              active={moreItems.some((i) => i.key === activePage)}
              onClick={() => setMoreOpen((o) => !o)}
            />
            {moreOpen && (
              <div style={{ ...dropCard, left: '50%', transform: 'translateX(-50%)', minWidth: 200 }}>
                {moreItems.map((item) => (
                  <DropItem key={item.key} label={item.label} active={activePage === item.key} onClick={() => handleNavigate(item.key)} />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {session ? (
            /* ── Profile ▾ — logged in ── */
            <div ref={accountRef} style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setAccountOpen((o) => !o)}
                style={{ gap: 5, fontSize: 13.5, fontWeight: isAccountPage ? 700 : 600 }}
              >
                Account <IChevron s={13} />
              </button>
              {accountOpen && (
                <div style={{ ...dropCard, right: 0 }}>
                  {profileItems.map(({ label, key, isActive }) => (
                    <DropItem key={label} label={label} active={isActive} onClick={() => handleNavigate(key)} />
                  ))}
                  {isAdmin && (
                    <>
                      <DropDivider />
                      <DropItem label="Admin dashboard" active={activePage === 'admin'} onClick={() => handleNavigate('admin')} />
                    </>
                  )}
                  <DropDivider />
                  <DropItem label="Logout" danger onClick={handleLogout} />
                </div>
              )}
            </div>
          ) : (
            /* ── Claim / Sign In — logged out ── */
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleNavigate('login')}
              style={{ whiteSpace: 'nowrap', fontSize: 13.5, fontWeight: 700 }}
            >
              Claim / Sign In
            </button>
          )}

          <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')} style={{ whiteSpace: 'nowrap' }}>
            Team Benefits
          </button>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid rgba(26,39,68,0.12)', display: 'none', alignItems: 'center', justifyContent: 'center', background: '#fff', flexShrink: 0 }}
          >
            {mobileOpen ? <IClose s={17} /> : <IMenu s={17} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="container" style={{ paddingBottom: 20 }}>
          <div className="card" style={{ padding: 16, borderRadius: 22, display: 'grid', gap: 5 }}>

            {/* Primary nav */}
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(26,39,68,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 2px 2px' }}>
              Navigation
            </div>
            {/* Find Help — county-aware */}
            <button onClick={handleFindHelpClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%', background: activePage === 'find-help' ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: activePage === 'find-help' ? 700 : 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2D9CDB', flexShrink: 0 }} />
              Find help
            </button>

            {/* Activities — hub button + sub-pages */}
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(26,39,68,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 2px 2px' }}>Activities</div>
            {/* Hub button — navigates to /activities county selector */}
            <button onClick={handleActivitiesClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%', background: activePage === 'activities' ? 'rgba(91,201,74,0.10)' : '#FAFBFF', color: '#1A2744', fontWeight: activePage === 'activities' ? 700 : 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#5BC94A', flexShrink: 0 }} />
              Browse all activities
            </button>
            {activitiesItems.map((item) => (
              <button key={item.key} onClick={() => handleNavigate(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%', background: activePage === item.key ? 'rgba(91,201,74,0.10)' : '#FAFBFF', color: '#1A2744', fontWeight: activePage === item.key ? 700 : 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#5BC94A', flexShrink: 0 }} />
                {item.label}
              </button>
            ))}

            {/* Remaining primary items — Events is county-aware */}
            {primaryNavItems.slice(1).map((item) => (
              <button key={item.key}
                onClick={item.key === 'events' ? handleEventsClick : () => handleNavigate(item.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%', background: activePage === item.key ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: activePage === item.key ? 700 : 600 }}>
                {item.accent && <span style={{ width: 8, height: 8, borderRadius: 2, background: item.accent, flexShrink: 0 }} />}
                {item.label}
              </button>
            ))}

            {/* More */}
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(26,39,68,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 2px 2px' }}>
              More
            </div>
            {moreItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%',
                  background: activePage === item.key ? 'rgba(26,39,68,0.06)' : '#FAFBFF',
                  color: '#1A2744', fontWeight: 600,
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Account */}
            <div style={{ height: 1, background: '#EEF1F8', margin: '8px 0 2px' }} />

            {session ? (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(26,39,68,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 2px 2px' }}>
                  Account
                </div>
                {profileItems.map(({ label, key, isActive }) => (
                  <button
                    key={label}
                    onClick={() => handleNavigate(key)}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%',
                      background: isActive ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: isActive ? 700 : 600,
                    }}
                  >
                    {label}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%',
                      background: activePage === 'admin' ? 'rgba(26,39,68,0.06)' : '#FAFBFF', color: '#1A2744', fontWeight: 600,
                    }}
                  >
                    Admin dashboard
                  </button>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')} style={{ justifyContent: 'center' }}>
                    Team Benefits
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(160,58,45,0.07)', color: '#A03A2D', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13.5 }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleNavigate('login')} style={{ justifyContent: 'center', fontWeight: 700 }}>
                  Claim / Sign In
                </button>
                <button className="btn btn-gold btn-sm" onClick={() => handleNavigate('card')} style={{ justifyContent: 'center' }}>
                  Team Benefits
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Bloom accent line — fades in on scroll */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, #F5A623 0%, #5BC94A 25%, #2D9CDB 60%, #7B5CF5 100%)',
        opacity: scrolled ? 0.5 : 0,
        transition: 'opacity .3s',
      }} />
    </header>
  );
};

window.Nav = Nav;

export default Nav;
