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
const EventsPage = React.lazy(() => import('./components/pages/Events.jsx'));
const AdminPage = React.lazy(() => import('./components/pages/Admin.jsx'));
const LoginPage = React.lazy(() => import('./components/pages/Login.jsx'));
const ProfileDashboardPage = React.lazy(() => import('./components/pages/ProfileDashboard.jsx'));

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
const Placeholder = ({ title, onNavigate, note }) => (
  <>
    <Nav onNavigate={onNavigate} />
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
            Your free Inspiring Carers card. No cost, no catch.
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
            Connect with local groups, events, walks, and support services across Cornwall. Physical card, PDF backup — free now and always.
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
            }} onClick={() => onNavigate('find-help')}>
              Get my free card <IArrow s={20} />
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
              Already a member
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
            ✓ Trusted by local providers · ✓ Carer-first approach · ✓ Free to join
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

// App component
const App = () => {
  const parseRoute = (path) => {
    const normalized = path.replace(/\/\/+$/, '').toLowerCase();
    if (normalized === '/login') return 'login';
    if (normalized.startsWith('/find-help/')) return 'find-help';
    if (normalized === '/find-help') return 'find-help';
    if (normalized === '/events') return 'events';
    if (normalized === '/benefits') return 'benefits';
    if (normalized === '/walks') return 'walks';
    if (normalized === '/admin') return 'admin';
    if (normalized === '/profile') return 'profile';
    if (normalized === '/recognition') return 'recognition';
    if (normalized === '/business') return 'business';
    if (normalized === '/about') return 'about';
    if (normalized === '/card') return 'card';
    return 'home';
  };

  const [page, setPage] = React.useState(() => {
    return parseRoute(window.location.pathname);
  });
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

    // Check current session
    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        setSession(data.session ?? null);
        setSessionLoading(false);
      }
    });

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession ?? null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const onPop = () => setPage(parseRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    // Protect only /admin. Public routes remain open regardless of auth state.
    if (page === 'admin' && !sessionLoading && !session && Date.now() > authRouteGraceUntil) {
      setPage('login');
      window.history.replaceState({ page: 'login' }, '', '/login');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [page, sessionLoading, session, authRouteGraceUntil]);

  const navigate = (key) => {
    // Only redirect away from admin if auth has fully resolved (sessionLoading done)
    // and there really is no session. Avoids false redirect during localStorage restore.
    if (key === 'admin' && !sessionLoading && !session) {
      if (page === 'login') {
        // Allow a longer auth hydration window right after successful sign-in.
        setAuthRouteGraceUntil(Date.now() + 15000);
      } else {
        setPage('login');
        window.history.pushState({ page: 'login' }, '', '/login');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
    }

    setPage(key);
    const path = key === 'home' ? '/' : `/${key}`;
    window.history.pushState({ page: key }, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  let displayPage = page;

  let content;
  switch (displayPage) {
    case 'login': content = <React.Suspense fallback={<RouteLoading />}><LoginPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'find-help': content = <React.Suspense fallback={<RouteLoading />}><FindHelpPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'events': content = <React.Suspense fallback={<RouteLoading />}><EventsPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'benefits': content = <React.Suspense fallback={<RouteLoading />}><BenefitsPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'walks': content = <React.Suspense fallback={<RouteLoading />}><WalksPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'admin': content = <React.Suspense fallback={<RouteLoading />}><AdminPage onNavigate={navigate} session={session} sessionLoading={sessionLoading} /></React.Suspense>; break;
    case 'profile': content = <React.Suspense fallback={<RouteLoading />}><ProfileDashboardPage onNavigate={navigate} session={session} /></React.Suspense>; break;
    case 'recognition': content = <Placeholder title="Recognition & awards" onNavigate={navigate} note="Carer of the Month, stories, nominations and community recognition — coming in the next round. Preview lives in the homepage Recognition section." />; break;
    case 'business': content = <Placeholder title="For businesses" onNavigate={navigate} note="Submit offers, see the why-carers-matter statement, badge tiers and featured partner placements — next round." />; break;
    case 'about': content = <Placeholder title="About inspiring carers" onNavigate={navigate} note="Mission, the two-tier model, and the local-first national vision — next round." />; break;
    case 'card': content = <Placeholder title="Get your free card" onNavigate={navigate} note="Three-minute sign-up flow with PDF + physical card in the post — next round." />; break;
    default: content = <HomePage onNavigate={navigate} tweaks={tweaks} />;
  }

  return (
    <>
      {content}
      <GlobalEnquiry visible={!['admin', 'login'].includes(displayPage)} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);