import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css';

// Import components
import Logo from './components/Logo.jsx';
import Icons from './components/Icons.jsx';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import { Hero, DualEntry } from './components/home/Hero.jsx'; // DualEntry is in Hero.jsx
import PersonalStrip from './components/home/PersonalStrip.jsx';
import IconDiscovery from './components/home/IconDiscovery.jsx';
import Signposting from './components/home/Signposting.jsx';
import Businesses from './components/home/Businesses.jsx';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js';

const FindHelpPage = React.lazy(() => import('./components/pages/FindHelp.jsx'));
const BenefitsPage = React.lazy(() => import('./components/pages/Benefits.jsx'));
const WalksPage = React.lazy(() => import('./components/pages/Walks.jsx'));
const ActivitiesPage = React.lazy(() => import('./components/pages/Activities.jsx'));
const EventsPage = React.lazy(() => import('./components/pages/Events.jsx'));
const AdminPage = React.lazy(() => import('./components/pages/Admin.jsx'));
const LoginPage = React.lazy(() => import('./components/pages/Login.jsx'));
const ProfileDashboardPage = React.lazy(() => import('./components/pages/ProfileDashboard.jsx'));
const ResetPasswordPage = React.lazy(() => import('./components/pages/ResetPassword.jsx'));
const PlacesToVisitPage    = React.lazy(() => import('./components/pages/PlacesToVisit.jsx'));
const WellbeingSupportPage = React.lazy(() => import('./components/pages/WellbeingSupport.jsx'));
const GroupsPage           = React.lazy(() => import('./components/pages/Groups.jsx'));
const VenueProfilePage     = React.lazy(() => import('./components/pages/VenueProfile.jsx'));
const FindHelpHubPage      = React.lazy(() => import('./components/pages/FindHelpHub.jsx'));
const EventsHubPage        = React.lazy(() => import('./components/pages/EventsHub.jsx'));

// Make icons global for JSX
window.IDot = Icons.IDot;
window.IArrow = Icons.IArrow;
window.ICard = Icons.ICard;
window.IPin = Icons.IPin;
window.ISparkle = Icons.ISparkle;
window.IWalks = Icons.IWalks;
window.ICoffee = Icons.ICoffee;
window.IGroups = Icons.IGroups;
window.IDiscount = Icons.IDiscount;
window.IReward = Icons.IReward;
window.IRecognition = Icons.IRecognition;
window.IAdvice = Icons.IAdvice;
window.IHub = Icons.IHub;
window.ISearch = Icons.ISearch;
window.IChevron = Icons.IChevron;
window.IWellbeing = Icons.IWellbeing;
window.IEvent = Icons.IEvent;
window.ILibrary = Icons.ILibrary;
window.IFamily = Icons.IFamily;
window.IMind = Icons.IMind;
window.IFinance = Icons.IFinance;
window.ITransport = Icons.ITransport;
window.IShield = Icons.IShield;
window.IStar = Icons.IStar;
window.ISave = Icons.ISave;
window.BloomMark = Icons.BloomMark;
window.IconTile = Icons.IconTile;

// Placeholder component
const Placeholder = ({ title, onNavigate, note, activePage, session }) => (
  <>
    <Nav activePage={activePage} onNavigate={onNavigate} session={session} />
    <section style={{ minHeight: '60vh' }}>
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="eyebrow">Coming next</div>
        <h1 style={{ fontSize: 56, marginTop: 12, letterSpacing: '-0.03em' }}>{title}</h1>
        <p style={{ marginTop: 16, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 520, margin: '16px auto 0' }}>
          {note || 'This page is in the next round. The platform structure is in place — homepage, Find Help Near You, and Benefits & Offers are live.'}
        </p>
        <button className="btn btn-gold" style={{ marginTop: 32 }} onClick={() => onNavigate('home')}>
          Back to home <IArrow s={16} />
        </button>
      </div>
    </section>
    <Footer onNavigate={onNavigate} />
  </>
);

// ClosingBand component
const ClosingBand = ({ onNavigate }) => (
  <section style={{ paddingTop: 80, paddingBottom: 120 }}>
    <div className="container">
      <div
        style={{
          borderRadius: 40,
          background: 'linear-gradient(135deg, #1A2744 0%, #1F3A5E 100%)',
          color: 'white',
          padding: '72px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative bloom glow */}
        <div style={{
          position: 'absolute', right: -80, top: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(245,166,35,0.15), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', maxWidth: 680 }}>
          <div className="eyebrow" style={{ color: '#F5A623', fontWeight: 800 }}>
            Free · Forever
          </div>

          <h2
            style={{
              fontSize: 'clamp(40px, 4.8vw, 60px)',
              marginTop: 18,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textWrap: 'balance',
              color: '#FFFFFF',
              WebkitTextFillColor: '#FFFFFF',
              opacity: 1,
            }}
          >
            Bring staff benefits to your team.
          </h2>

          <p
            style={{
              marginTop: 22,
              fontSize: 18,
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.65,
              maxWidth: 620,
              fontWeight: 500,
            }}
          >
            Approved organisations can apply for workforce benefit cards — giving your staff access to local discounts, wellbeing perks and partner rewards across Cornwall.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 36,
              flexWrap: 'wrap',
            }}
          >
            <button className="btn btn-gold btn-lg" style={{
              fontSize: 18,
              padding: '22px 36px',
              fontWeight: 700,
              boxShadow: '0 16px 40px rgba(245,166,35,0.35)',
            }} onClick={() => onNavigate('for-you')}>
              Apply for team benefits <IArrow s={20} />
            </button>

            <button
              className="btn btn-lg"
              style={{
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.35)',
                fontSize: 18,
                padding: '22px 36px',
                fontWeight: 700,
              }}
              onClick={() => onNavigate('profile')}
            >
              Sign in to your account
            </button>
          </div>

          <p style={{
            marginTop: 20,
            fontSize: 13,
            color: '#FFFFFF',
            WebkitTextFillColor: '#FFFFFF',
            opacity: 1,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            ✓ For approved organisations · ✓ Staff and workforce perks · ✓ Local and national partners
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Global Enquiry Float ───────────────────────────────── */
const GlobalEnquiry = ({ visible }) => {
  const fld = { width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '11px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', boxSizing: 'border-box', fontFamily: 'inherit' };
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', org: '', message: '' });
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState('');
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Please enter your name and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!isSupabaseConfigured() || !supabase) { setError('Database unavailable.'); return; }
    setBusy(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('resource_update_submissions').insert({
        organisation_name: form.org.trim() || null,
        submitter_name: form.name.trim(),
        submitter_email: form.email.trim(),
        reason: form.message.trim() || 'General enquiry submitted via site.',
        status: 'pending',
        update_type: 'general_enquiry',
      });
      if (dbErr) throw dbErr;
      setDone(true);
      setForm({ name: '', email: '', org: '', message: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setDone(false); setError(''); }}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1A2744,#2D3E6B)', color: 'white', padding: '13px 20px', borderRadius: 999, fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,39,68,0.32)', transition: 'transform 0.15s,box-shadow 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(26,39,68,0.42)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,39,68,0.32)'; }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
        Get in touch
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,0.52)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '28px 26px', width: '100%', maxWidth: 460, boxShadow: '0 40px 80px rgba(15,23,42,0.24)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', right: 18, top: 18, width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
            {done ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#10B981' }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="m5 12 5 5L20 7"/></svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1A2744' }}>Message sent</h3>
                <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.65)', fontSize: 14, lineHeight: 1.6 }}>The Inspiring Carers team will be in touch soon.</p>
                <button onClick={() => setOpen(false)} style={{ marginTop: 18, padding: '10px 24px', borderRadius: 12, background: '#1A2744', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,39,68,0.45)', marginBottom: 6 }}>Contact</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Get in touch</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.55, marginBottom: 18 }}>Questions about the platform, listing your organisation, or joining as a carer? We'll respond quickly.</p>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
                  <input value={form.name} onChange={set('name')} required placeholder="Your name *" style={fld} />
                  <input value={form.email} onChange={set('email')} type="email" required placeholder="Email address *" style={fld} />
                  <input value={form.org} onChange={set('org')} placeholder="Organisation (optional)" style={fld} />
                  <textarea value={form.message} onChange={set('message')} rows={4} placeholder="How can we help?" style={{ ...fld, resize: 'vertical' }} />
                  {error && <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13 }}>{error}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="submit" disabled={busy} style={{ flex: 1, padding: '12px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#F5A623,#D4AF37)', color: '#0F172A', fontSize: 14, fontWeight: 800, border: 'none', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.75 : 1 }}>
                      {busy ? 'Sending…' : 'Send message'}
                    </button>
                    <button type="button" onClick={() => setOpen(false)} style={{ padding: '12px 16px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontSize: 14, fontWeight: 600, border: '1px solid #E9EEF5', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// HomePage component
const HomePage = ({ onNavigate, tweaks }) => (
  <>
    <Nav activePage="home" onNavigate={onNavigate} />
    <Hero headline={tweaks.hero_headline} onNavigate={onNavigate} />
    <DualEntry onNavigate={onNavigate} />
    <PersonalStrip greeting={tweaks.greeting_name} location={tweaks.location} />
    <IconDiscovery onNavigate={onNavigate} />
    <Signposting onNavigate={onNavigate} />
    <Businesses />
    <ClosingBand onNavigate={onNavigate} />
    <Footer onNavigate={onNavigate} />
  </>
);

const RouteLoading = () => (
  <section style={{ minHeight: '52vh', display: 'grid', placeItems: 'center', background: '#FAFBFF' }}>
    <div className="card" style={{ padding: 26, borderRadius: 20, display: 'grid', gap: 10, width: 'min(420px, 92vw)' }}>
      <div style={{ width: 110, height: 10, borderRadius: 999, background: '#EAF0FA' }} />
      <div style={{ width: '72%', height: 12, borderRadius: 999, background: '#E4ECF8' }} />
      <div style={{ width: '56%', height: 12, borderRadius: 999, background: '#E4ECF8' }} />
    </div>
  </section>
);

// Admin email allowlist — single source of truth for access control.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const isAdminEmail = (email) => Boolean(email && ADMIN_EMAILS.includes(`${email}`.trim().toLowerCase()));

// County-aware routing constants
// 'activities' intentionally excluded — it is a county-optional hub (/activities and /{county}/activities both work)
const COUNTY_PAGES = new Set(['find-help', 'training', 'events', 'for-you', 'walks', 'places-to-visit', 'wellbeing', 'groups']);
const COUNTY_SLUGS = ['cornwall', 'devon', 'dorset', 'somerset', 'bristol', 'wiltshire'];
const COUNTY_DEFAULT = 'cornwall';

// App component
const App = () => {
  const parseRoute = (path) => {
    const clean = (path || '/').replace(/\/+$/, '').toLowerCase();
    const segs = clean.replace(/^\//, '').split('/').filter(Boolean);

    if (!segs.length) return { page: 'home', county: null };

    // Profile sub-routes
    if (segs[0] === 'profile') {
      const PROFILE_SUBS = { organisation: 'profile-org', posts: 'profile-posts', enquiries: 'profile-enquiries', settings: 'profile-settings' };
      return { page: PROFILE_SUBS[segs[1]] || 'profile', county: null };
    }

    // Dedicated password reset completion page — isolated from all auth logic.
    if (segs[0] === 'reset-password') return { page: 'reset-password', county: null };

    // Login
    if (segs[0] === 'login') return { page: 'login', county: null };

    // Global pages — no county prefix
    const GLOBAL = ['admin', 'recognition', 'business', 'about', 'card'];
    if (GLOBAL.includes(segs[0])) return { page: segs[0], county: null };

    // Hub routes — standalone URLs without county prefix load county selector pages
    if (segs[0] === 'activities') return { page: 'activities', county: null };
    if (segs[0] === 'find-help'  && segs.length === 1) return { page: 'find-help', county: null };
    if (segs[0] === 'events'     && segs.length === 1) return { page: 'events',    county: null };

    // Walks hub — /walks loads all walks; /{county}/walks loads county view (via COUNTY_SLUGS above)
    // WalksPage does not filter by county so content is identical — but URL matters for clarity
    if (segs[0] === 'walks' && segs.length === 1) return { page: 'walks', county: null };

    // County-prefixed routes: /cornwall/find-help, /cornwall, or /cornwall/places-to-visit/some-slug
    if (COUNTY_SLUGS.includes(segs[0])) {
      return { page: segs[1] || 'home', county: segs[0], slug: segs[2] || null };
    }

    // Legacy flat routes — silently redirect and return new page/county
    const LEGACY = { 'benefits': 'for-you', 'walks': 'walks' };
    if (LEGACY[segs[0]]) {
      const pg = LEGACY[segs[0]];
      const newPath = COUNTY_PAGES.has(pg) ? `/${COUNTY_DEFAULT}/${pg}` : `/${pg}`;
      window.history.replaceState({}, '', newPath);
      return { page: pg, county: COUNTY_DEFAULT };
    }

    return { page: 'home', county: null };
  };

  const [page, setPage] = React.useState(() => parseRoute(window.location.pathname).page);
  const [county, setCounty] = React.useState(() => {
    const { county: urlCounty, page: urlPage } = parseRoute(window.location.pathname);
    // Hub pages (no county in URL) must not inherit county from localStorage
    const HUB_PAGES = ['activities', 'find-help', 'events'];
    if (HUB_PAGES.includes(urlPage) && !urlCounty) return null;
    try { return urlCounty || localStorage.getItem('ic_county') || null; } catch { return urlCounty || null; }
  });
  const [venueSlug, setVenueSlug] = React.useState(() => parseRoute(window.location.pathname).slug || null);
  const [authRouteGraceUntil, setAuthRouteGraceUntil] = React.useState(0);
  const [session, setSession] = React.useState(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [tweaks, setTweaks] = React.useState(() => {
    try { return { ...{ hero_headline: "Support for you. Real help for those in your care.", greeting_name: "Sarah", location: "St Austell", accent_emphasis: "balanced" }, ...(JSON.parse(localStorage.getItem('ic_tweaks_v1') || '{}')) }; }
    catch { return { hero_headline: "Support for you. Real help for those in your care.", greeting_name: "Sarah", location: "St Austell", accent_emphasis: "balanced" }; }
  });

  // Check session and set up auth listener
  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setSessionLoading(false);
      return;
    }

    let mounted = true;

    // Check current session.
    // Guard: do NOT apply a recovery session as app-wide auth — the user
    // hasn't re-authenticated yet and must complete the password reset first.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const isResetRoute = window.location.pathname.toLowerCase().includes('/reset-password');
      if (!isResetRoute) setSession(data.session ?? null);
      setSessionLoading(false);
    });

    // Subscribe to auth state changes.
    // PASSWORD_RECOVERY is a temporary session grant — do NOT activate app auth.
    // Also skip any event arriving while the user is on the reset-password route.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      if (_event === 'PASSWORD_RECOVERY') return;
      if (window.location.pathname.toLowerCase().includes('/reset-password')) return;
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const onPop = () => {
      const { page: pg, county: co, slug: sl } = parseRoute(window.location.pathname);
      setPage(pg);
      setCounty(co || null); // always sync county from URL (clears on non-county pages)
      setVenueSlug(sl || null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    if (page !== 'admin' || sessionLoading) return;
    if (!session) {
      // No session — redirect to login unless within post-login grace window.
      if (Date.now() > authRouteGraceUntil) {
        setPage('login');
        window.history.replaceState({ page: 'login' }, '', '/login');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }
    // Session exists but email is not on the admin allowlist → access denied.
    if (!isAdminEmail(session.user?.email)) {
      setPage('profile');
      window.history.replaceState({ page: 'profile' }, '', '/profile');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [page, sessionLoading, session, authRouteGraceUntil]);

  const navigate = (key, explicitCounty, slug) => {
    // Normalise legacy page keys so internal links don't need updating.
    if (key === 'benefits') key = 'for-you';

    // Admin guard: must be authenticated AND on the admin email allowlist.
    if (key === 'admin') {
      if (!sessionLoading && !session) {
        // Not authenticated — handle post-login grace period for session hydration.
        if (page === 'login') {
          setAuthRouteGraceUntil(Date.now() + 15000);
        } else {
          setPage('login');
          window.history.pushState({ page: 'login' }, '', '/login');
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
      } else if (session && !isAdminEmail(session.user?.email)) {
        // Authenticated but not on admin allowlist — redirect to account.
        setPage('profile');
        window.history.pushState({ page: 'profile' }, '', '/profile');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
    }

    // Activities routing:
    // navigate('activities', 'cornwall') → /cornwall/activities
    // navigate('activities') → use stored county (localStorage) if any, else hub
    // navigate('activities', null) → /activities hub (explicit null)
    if (key === 'activities') {
      setPage('activities');
      setVenueSlug(null);
      if (explicitCounty === null) {
        // Explicit null → hub regardless of stored county
        setCounty(null);
        window.history.pushState({ page: 'activities', county: null }, '', '/activities');
      } else {
        const stored = (() => { try { return localStorage.getItem('ic_county'); } catch { return null; } })();
        const targetCounty = explicitCounty || stored || null;
        if (!targetCounty) {
          // No county selected anywhere → hub
          setCounty(null);
          window.history.pushState({ page: 'activities', county: null }, '', '/activities');
        } else {
          setCounty(targetCounty);
          try { localStorage.setItem('ic_county', targetCounty); } catch {}
          window.history.pushState({ page: 'activities', county: targetCounty }, '', `/${targetCounty}/activities`);
        }
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // find-help and events: county-optional hub pattern (same as activities)
    // navigate('find-help', null) or navigate('events', null) → hub
    // navigate('find-help') → stored county or hub
    // navigate('find-help', 'cornwall') → /cornwall/find-help
    if (key === 'find-help' || key === 'events') {
      setPage(key);
      setVenueSlug(null);
      if (explicitCounty) {
        // Explicit truthy county → go directly to county page, no localStorage lookup
        setCounty(explicitCounty);
        try { localStorage.setItem('ic_county', explicitCounty); } catch {}
        window.history.pushState({ page: key, county: explicitCounty }, '', `/${explicitCounty}/${key}`);
      } else {
        // null, undefined, or '' → always hub (no Cornwall fallback)
        setCounty(null);
        window.history.pushState({ page: key, county: null }, '', `/${key}`);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // navigate('walks', null) — explicit all-county intent → /walks (county-agnostic hub)
    // navigate('walks') or navigate('walks', 'cornwall') → /{county}/walks as normal
    if (key === 'walks' && explicitCounty === null) {
      setPage('walks');
      setVenueSlug(null);
      window.history.pushState({ page: 'walks', county: null }, '', '/walks');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const isCountyPage = COUNTY_PAGES.has(key);
    const effectiveCounty = explicitCounty || county || COUNTY_DEFAULT;

    const PROFILE_URLS = { 'profile-org': '/profile/organisation', 'profile-posts': '/profile/posts', 'profile-enquiries': '/profile/enquiries', 'profile-settings': '/profile/settings' };
    const path = key === 'home'
      ? '/'
      : PROFILE_URLS[key]
        ? PROFILE_URLS[key]
        : isCountyPage
          ? (slug ? `/${effectiveCounty}/${key}/${slug}` : `/${effectiveCounty}/${key}`)
          : `/${key}`;

    setPage(key);
    setVenueSlug(slug || null);
    if (isCountyPage) {
      setCounty(effectiveCounty);
      try { localStorage.setItem('ic_county', effectiveCounty); } catch {}
    }
    window.history.pushState({ page: key, county: isCountyPage ? effectiveCounty : null, slug: slug || null }, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  let displayPage = page;

  let content;
  switch (displayPage) {
    case 'login': content = <React.Suspense fallback={<RouteLoading />}><LoginPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'reset-password': content = <React.Suspense fallback={<RouteLoading />}><ResetPasswordPage onNavigate={navigate} /></React.Suspense>; break;
    case 'find-help': content = county
      ? <React.Suspense fallback={<RouteLoading />}><FindHelpPage    onNavigate={navigate} session={session} county={county} /></React.Suspense>
      : <React.Suspense fallback={<RouteLoading />}><FindHelpHubPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'events': content = county
      ? <React.Suspense fallback={<RouteLoading />}><EventsPage    onNavigate={navigate} session={session} county={county} /></React.Suspense>
      : <React.Suspense fallback={<RouteLoading />}><EventsHubPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'for-you':
    case 'benefits': content = <React.Suspense fallback={<RouteLoading />}><BenefitsPage onNavigate={navigate} session={session} county={county} /></React.Suspense>; break;
    case 'walks': content = <React.Suspense fallback={<RouteLoading />}><WalksPage onNavigate={navigate} session={session} county={county} /></React.Suspense>; break;
    case 'activities': content = <React.Suspense fallback={<RouteLoading />}><ActivitiesPage onNavigate={navigate} session={session} county={county} /></React.Suspense>; break;
    case 'places-to-visit': content = <React.Suspense fallback={<RouteLoading />}><PlacesToVisitPage    onNavigate={navigate} session={session} county={county} venueSlug={venueSlug} /></React.Suspense>; break;
    case 'wellbeing':       content = <React.Suspense fallback={<RouteLoading />}><WellbeingSupportPage onNavigate={navigate} session={session} county={county} venueSlug={venueSlug} /></React.Suspense>; break;
    case 'groups':          content = <React.Suspense fallback={<RouteLoading />}><GroupsPage           onNavigate={navigate} session={session} county={county} venueSlug={venueSlug} /></React.Suspense>; break;
    case 'training': content = <Placeholder title="Training" activePage="training" onNavigate={navigate} session={session} note="Carer training, CPD, professional development and awareness sessions across Cornwall — coming in the next round." />; break;
    case 'admin': content = <React.Suspense fallback={<RouteLoading />}><AdminPage onNavigate={navigate} session={session} sessionLoading={sessionLoading} /></React.Suspense>; break;
    case 'profile': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage section="dashboard" onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'profile-org': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage section="organisation" onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'profile-posts': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage section="posts" onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'profile-enquiries': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage section="enquiries" onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'profile-settings': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage section="settings" onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'recognition': content = <Placeholder title="Recognition & awards" activePage="recognition" onNavigate={navigate} session={session} note="Carer of the Month, stories, nominations and community recognition — coming in the next round. Preview lives in the homepage Recognition section." />; break;
    case 'business': content = <Placeholder title="For businesses" activePage="business" onNavigate={navigate} session={session} note="Submit offers, see the why-carers-matter statement, badge tiers and featured partner placements — next round." />; break;
    case 'about': content = <Placeholder title="About inspiring carers" activePage="about" onNavigate={navigate} session={session} note="Mission, the two-tier model, and the local-first national vision — next round." />; break;
    case 'card': content = <Placeholder title="Team Benefits" activePage="card" onNavigate={navigate} session={session} note="Approved organisations can apply for workforce benefit cards for eligible staff teams — organisation account required." />; break;
    default: content = <HomePage onNavigate={navigate} tweaks={tweaks} />;
  }

  return (
    <>
      {content}
      <GlobalEnquiry visible={!['admin', 'login', 'reset-password'].includes(displayPage)} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);