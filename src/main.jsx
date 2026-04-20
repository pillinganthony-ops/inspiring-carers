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
import FindHelpPage from './components/pages/FindHelp.jsx';
import BenefitsPage from './components/pages/Benefits.jsx';
import WalksPage from './components/pages/Walks.jsx';
import AdminPage from './components/pages/Admin.jsx';
import LoginPage from './components/pages/Login.jsx';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js';

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
const ClosingBand = () => (
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
            }}
          >
            Join 84,000 carers. Get your free card in 3 minutes.
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
            Unlock instant access to 1,240+ discounts, local groups, activities, and support services. Physical card, PDF backup, and benefits all included. No hidden fees. No expiry.
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
            }}>
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
            >
              Already a member
            </button>
          </div>
          
          <p style={{
            marginTop: 20,
            fontSize: 13,
            color: 'rgba(255,255,255,0.65)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            ✓ Trusted by NHS-linked organisations · ✓ Recognised platform · ✓ Carer-first approach
          </p>
        </div>
      </div>
    </div>
  </section>
);

// HomePage component
const HomePage = ({ onNavigate, tweaks }) => (
  <>
    <Nav activePage="home" onNavigate={onNavigate} />
    <Hero headline={tweaks.hero_headline} />
    <DualEntry onNavigate={onNavigate} />
    <PersonalStrip greeting={tweaks.greeting_name} location={tweaks.location} />
    <IconDiscovery onNavigate={onNavigate} />
    <Signposting onNavigate={onNavigate} />
    <Businesses />
    <ClosingBand />
    <Footer onNavigate={onNavigate} />
  </>
);

// App component
const App = () => {
  const parseRoute = (path) => {
    const normalized = path.replace(/\/\/+$/, '').toLowerCase();
    if (normalized === '/login') return 'login';
    if (normalized === '/find-help') return 'find-help';
    if (normalized === '/benefits') return 'benefits';
    if (normalized === '/walks') return 'walks';
    if (normalized === '/admin') return 'admin';
    if (normalized === '/recognition') return 'recognition';
    if (normalized === '/business') return 'business';
    if (normalized === '/about') return 'about';
    if (normalized === '/card') return 'card';
    return 'home';
  };

  const [page, setPage] = React.useState(() => {
    const route = parseRoute(window.location.pathname);
    return route !== 'home' ? route : localStorage.getItem('ic_page_v1') || 'home';
  });
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

  const navigate = (key) => {
    // If trying to access admin without session, redirect to login
    if (key === 'admin' && !session) {
      setPage('login');
      localStorage.setItem('ic_page_v1', 'login');
      window.history.pushState({ page: 'login' }, '', '/login');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    setPage(key);
    localStorage.setItem('ic_page_v1', key);
    const path = key === 'home' ? '/' : `/${key}`;
    window.history.pushState({ page: key }, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // If visiting /admin without session, show login instead
  let displayPage = page;
  if (page === 'admin' && !session) {
    displayPage = 'login';
  }

  let content;
  switch (displayPage) {
    case 'login': content = <LoginPage onNavigate={navigate} />; break;
    case 'find-help': content = <FindHelpPage onNavigate={navigate} />; break;
    case 'benefits': content = <BenefitsPage onNavigate={navigate} />; break;
    case 'walks': content = <WalksPage onNavigate={navigate} />; break;
    case 'admin': content = <AdminPage />; break;
    case 'recognition': content = <Placeholder title="Recognition & awards" onNavigate={navigate} note="Carer of the Month, stories, nominations and community recognition — coming in the next round. Preview lives in the homepage Recognition section." />; break;
    case 'business': content = <Placeholder title="For businesses" onNavigate={navigate} note="Submit offers, see the why-carers-matter statement, badge tiers and featured partner placements — next round." />; break;
    case 'about': content = <Placeholder title="About inspiring carers" onNavigate={navigate} note="Mission, the two-tier model, and the local-first national vision — next round." />; break;
    case 'card': content = <Placeholder title="Get your free card" onNavigate={navigate} note="Three-minute sign-up flow with PDF + physical card in the post — next round." />; break;
    default: content = <HomePage onNavigate={navigate} tweaks={tweaks} />;
  }

  return content;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);