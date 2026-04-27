// Business partner acquisition page — /business
// National landing. No county routing. No backend yet.
// Form is a static placeholder — registration opening soon.

import React from 'react';
import {
  HandHeart, Store, BadgeCheck, Megaphone, MapPin, Sparkles,
  Building2, Gift, Users, HeartHandshake, Crown, BarChart3,
  Coffee, Leaf, Dumbbell, Plane, GraduationCap, ChevronRight,
  CheckCircle2, Clock, ArrowRight,
} from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IArrow } = Icons;

const NAVY   = '#1A2744';
const GOLD   = '#F5A623';
const ACCENT = '#F5A623';

// ── Reusable icon badge ────────────────────────────────────────────────────

const IconBadge = ({ Icon, color, bg, size = 52, iconSize = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: 14, flexShrink: 0,
    background: bg, border: `1px solid ${color}28`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon size={iconSize} color={color} strokeWidth={1.75} />
  </div>
);

// ── Hero mock partner card ─────────────────────────────────────────────────

const HeroMockCard = () => (
  <div style={{ position: 'relative', height: 320 }}>
    {/* Background card */}
    <div style={{
      position: 'absolute', top: 24, right: 0, width: '88%', height: 260,
      borderRadius: 22, background: '#FFFFFF',
      boxShadow: '0 24px 60px rgba(26,39,68,0.14)',
      padding: '20px 22px',
    }}>
      {/* Supporting carers badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.28)', fontSize: 10.5, fontWeight: 800, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
        <BadgeCheck size={11} color={GOLD} /> Supporting Carers
      </div>
      {/* Mock business */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,166,35,0.12)', display: 'grid', placeItems: 'center' }}>
          <Coffee size={20} color={GOLD} strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>Bloom Café Co.</div>
          <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <MapPin size={11} color="rgba(26,39,68,0.40)" /> Local partner · Food & drink
          </div>
        </div>
      </div>
      {/* Offer strip */}
      <div style={{ padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(135deg, #FFF4E0 0%, #FFFBF4 100%)', border: '1px solid rgba(245,166,35,0.22)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Active offer</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>20% off all orders</div>
        <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.60)', marginTop: 2 }}>Show your Inspiring Carers card in-store</div>
      </div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid #EEF1F7' }}>
        {[['142', 'redeems'], ['4.9', 'rating'], ['Verified', 'status']].map(([n, l]) => (
          <div key={l}>
            <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{n}</div>
            <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.45)', fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
    {/* Floating badge */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, zIndex: 10,
      padding: '10px 16px', borderRadius: 14, background: NAVY,
      boxShadow: '0 8px 24px rgba(26,39,68,0.30)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <HeartHandshake size={16} color={GOLD} strokeWidth={2} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Free to join · Live in minutes</span>
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────

const BusinessPageComponent = ({ onNavigate, session }) => {
  const [formSent, setFormSent] = React.useState(false);

  const scrollToForm = () => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Nav activePage="business" onNavigate={onNavigate} session={session} />

      {/* ── 1. Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 55%, #1A3460 100%)',
        paddingTop: 60, paddingBottom: 68,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '15%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 18 }}>
                <Sparkles size={11} color="#FFD580" /> For Businesses & Partners
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 18px', textWrap: 'balance' }}>
                Partner with<br />Inspiring Carers
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 520 }}>
                Help carers feel seen, valued and supported by offering discounts, rewards, experiences or practical benefits through a growing national platform.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  className="btn btn-gold btn-lg"
                  onClick={() => onNavigate('offer-a-discount')}
                  style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800 }}
                >
                  Offer a discount <IArrow s={14} />
                </button>
                <button
                  onClick={() => onNavigate('advertise')}
                  style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.90)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                >
                  Featured &amp; Sponsorship
                </button>
              </div>
              {/* Trust line */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                {[
                  { icon: CheckCircle2, text: 'Free to join' },
                  { icon: Clock, text: 'Live in minutes' },
                  { icon: HeartHandshake, text: 'Real community impact' },
                ].map(({ icon: I, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                    <I size={14} color="rgba(255,255,255,0.50)" /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock card */}
            <HeroMockCard />

          </div>
        </div>
      </section>

      {/* ── 2. Why join ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Why join</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: 0 }}>
              Real impact for carers. Real value for your business.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { Icon: HandHeart,   color: '#E11D48', bg: 'rgba(225,29,72,0.09)',   title: 'Support carers meaningfully', desc: 'Join a national movement. Your gesture of support matters to carers and care workers in a tangible, everyday way.' },
              { Icon: Users,       color: '#2563EB', bg: 'rgba(37,99,235,0.09)',   title: 'Reach a trusted community', desc: 'Inspiring Carers members are engaged, loyal and values-led. They notice and remember businesses who show they care.' },
              { Icon: Megaphone,   color: '#D97706', bg: 'rgba(217,119,6,0.09)',   title: 'Build your local reputation', desc: 'Be discovered by carers, care workers, charities and employers in your area through a dedicated partner directory.' },
              { Icon: Gift,        color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)', title: 'Start free, grow later', desc: 'Every partner starts on a free tier. Featured placements, county sponsorships and campaign promotions launch soon.' },
            ].map(({ Icon, color, bg, title, desc }) => (
              <div key={title} style={{ padding: '24px 22px', borderRadius: 20, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 8px rgba(26,39,68,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <IconBadge Icon={Icon} color={color} bg={bg} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{title}</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How it works ── */}
      <section id="how-it-works" style={{ paddingTop: 72, paddingBottom: 72, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: 0 }}>
              Three simple steps to becoming a partner
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0, position: 'relative' }}>
            {[
              { step: '1', Icon: Store, color: '#2563EB', bg: 'rgba(37,99,235,0.09)', title: 'Submit your business', desc: 'Add your organisation details and tell us why you want to support carers. Takes less than five minutes.' },
              { step: '2', Icon: Gift, color: '#D97706', bg: 'rgba(217,119,6,0.09)', title: 'Add an offer or benefit', desc: 'Share a discount, perk, reward, event, service, or any practical support you can offer to carers.' },
              { step: '3', Icon: BadgeCheck, color: '#16A34A', bg: 'rgba(22,163,74,0.09)', title: 'Get discovered', desc: 'Once approved, your business appears across Inspiring Carers member benefit areas and the partner directory.' },
            ].map(({ step, Icon, color, bg, title, desc }, i, arr) => (
              <div key={step} style={{ position: 'relative', padding: '32px 28px', borderRadius: 20, background: '#F7F9FC', border: '1px solid #E8EEF8', marginRight: i < arr.length - 1 ? 0 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 999, background: color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>{step}</span>
                  </div>
                  <IconBadge Icon={Icon} color={color} bg={bg} size={44} iconSize={20} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{title}</div>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.60)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                {i < arr.length - 1 && (
                  <div style={{ position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'none' }}>
                    <ChevronRight size={20} color="rgba(26,39,68,0.25)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Partner types ── */}
      <section style={{ paddingTop: 64, paddingBottom: 64, background: '#F0F4FF' }}>
        <div className="container">
          <div style={{ marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Who can partner</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
              We welcome all types of local and national businesses
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', maxWidth: 560, margin: 0 }}>
              From independent cafés to national charities — if you want to support carers, there is a place for you on Inspiring Carers.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { Icon: Coffee,        color: '#D97706', bg: 'rgba(217,119,6,0.09)',   label: 'Cafés & restaurants' },
              { Icon: Sparkles,      color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)', label: 'Attractions & activities' },
              { Icon: Leaf,          color: '#16A34A', bg: 'rgba(22,163,74,0.09)',   label: 'Wellbeing providers' },
              { Icon: Store,         color: '#E11D48', bg: 'rgba(225,29,72,0.09)',   label: 'Shops & high street' },
              { Icon: Dumbbell,      color: '#2563EB', bg: 'rgba(37,99,235,0.09)',   label: 'Gyms & leisure venues' },
              { Icon: Plane,         color: '#0D9488', bg: 'rgba(13,148,136,0.09)', label: 'Travel & accommodation' },
              { Icon: GraduationCap, color: '#D97706', bg: 'rgba(217,119,6,0.09)',   label: 'Training providers' },
              { Icon: Users,         color: '#475569', bg: 'rgba(71,85,105,0.09)',   label: 'Community organisations' },
            ].map(({ Icon, color, bg, label }) => (
              <div key={label} style={{ padding: '18px 16px', borderRadius: 14, background: '#FFFFFF', border: '1px solid #E8EEF8', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, cursor: 'default' }}>
                <IconBadge Icon={Icon} color={color} bg={bg} size={44} iconSize={20} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Free vs Featured ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Partnership tiers</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: NAVY, margin: 0 }}>
              Start free. Grow your visibility when you're ready.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 860, margin: '0 auto' }}>

            {/* Free tier */}
            <div style={{ padding: '32px 28px', borderRadius: 22, border: '2px solid #E8EEF8', background: '#FAFBFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <IconBadge Icon={BadgeCheck} color="#16A34A" bg="rgba(22,163,74,0.09)" size={44} iconSize={20} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Free Partner</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>Always free</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Basic business profile',
                  'Submit one offer or perk',
                  'Carer-support statement',
                  'Category listing',
                  'Standard discovery',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={16} color="#16A34A" strokeWidth={2} style={{ flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-navy"
                onClick={scrollToForm}
                style={{ marginTop: 24, width: '100%', justifyContent: 'center', fontWeight: 800 }}
              >
                Join for free <IArrow s={13} />
              </button>
            </div>

            {/* Featured tier */}
            <div style={{ padding: '32px 28px', borderRadius: 22, border: `2px solid ${GOLD}55`, background: 'linear-gradient(160deg, #FFFDF5 0%, #FFFBF0 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', color: GOLD, border: '1px solid rgba(245,166,35,0.30)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Coming soon
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <IconBadge Icon={Crown} color={GOLD} bg="rgba(245,166,35,0.12)" size={44} iconSize={20} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Featured Partner</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>Paid tier · launching soon</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Everything in Free',
                  'Enhanced business profile',
                  'Featured placement in directory',
                  'Homepage & category highlights',
                  'Campaign inclusion',
                  'County-level sponsorship opportunities',
                  'Analytics and reporting dashboard',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={16} color={GOLD} strokeWidth={2} style={{ flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <button disabled style={{ marginTop: 24, width: '100%', padding: '11px 20px', borderRadius: 12, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.30)', color: GOLD, fontWeight: 800, fontSize: 14, cursor: 'default' }}>
                Registration opening soon
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. County sponsorship ── */}
      <section style={{ paddingTop: 64, paddingBottom: 64, background: 'linear-gradient(160deg, #0C1A35 0%, #162C52 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                <Crown size={11} color="#FFD580" /> County Sponsorship
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px', lineHeight: 1.2 }}>
                Become the exclusive partner for your county
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 480 }}>
                Inspiring Carers will offer one exclusive county-level partner slot per region — giving organisations a unique opportunity to be the recognised supporter of carers across an entire area.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: '0 0 28px' }}>
                County sponsorships are in development. Register early interest below.
              </p>
              <button
                onClick={scrollToForm}
                className="btn btn-gold"
                style={{ fontSize: 14, padding: '12px 24px', fontWeight: 800 }}
              >
                Register early interest <IArrow s={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { Icon: MapPin,      color: '#FFD580', title: 'Exclusive county visibility', desc: 'The only sponsor featured for your region.' },
                { Icon: HeartHandshake, color: '#67E8F9', title: 'Community impact alignment', desc: 'Your brand associated with local carer wellbeing.' },
                { Icon: BarChart3,  color: '#A5B4FC', title: 'Analytics & reporting', desc: 'Understand your reach and community impact.' },
                { Icon: Megaphone,  color: '#FCA5A5', title: 'Campaign partnership', desc: 'Co-branded campaigns and seasonal promotions.' },
              ].map(({ Icon, color, title, desc }) => (
                <div key={title} style={{ padding: '18px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <Icon size={20} color={color} strokeWidth={1.75} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', marginBottom: 5 }}>{title}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. CTA Section ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Get started today</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: NAVY, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              Ready to support carers?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.60)', lineHeight: 1.7, margin: '0 0 32px' }}>
              Start by submitting a discount or benefit — free, reviewed personally, and shared with carers in your area. Featured placement and sponsorship are available once you're in.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-gold btn-lg" onClick={() => onNavigate('offer-a-discount')} style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800 }}>
                Offer a discount <IArrow s={14} />
              </button>
              <button
                onClick={() => onNavigate('advertise')}
                style={{ padding: '14px 24px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #D8E4F0', color: NAVY, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'box-shadow .14s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,39,68,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                Featured &amp; Sponsorship
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Partner interest form ── */}
      <section id="partner-form" style={{ paddingTop: 64, paddingBottom: 80, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Partner registration</div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
                Express your interest
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', margin: 0 }}>
                Tell us about your business and what you'd like to offer. We'll be in touch when partner registration opens.
              </p>
            </div>

            {/* Static form — registration opening soon */}
            <div style={{ padding: '32px 28px', borderRadius: 20, border: '1px solid #E8EEF8', background: '#FAFBFF' }}>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  { label: 'Business name', placeholder: 'Your business or organisation name', type: 'text' },
                  { label: 'Contact name', placeholder: 'Your full name', type: 'text' },
                  { label: 'Email address', placeholder: 'email@yourbusiness.com', type: 'email' },
                  { label: 'Website', placeholder: 'https://yourbusiness.com (optional)', type: 'url' },
                  { label: 'County or area', placeholder: 'e.g. Cornwall, Devon, Bristol', type: 'text' },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      disabled
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#F5F7FB', fontSize: 13.5, color: 'rgba(26,39,68,0.40)', fontFamily: 'Inter, sans-serif', cursor: 'not-allowed' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Type of business</label>
                  <select disabled style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#F5F7FB', fontSize: 13.5, color: 'rgba(26,39,68,0.40)', fontFamily: 'Inter, sans-serif', cursor: 'not-allowed' }}>
                    <option>Select your business type</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>What would you like to offer carers?</label>
                  <textarea disabled placeholder="e.g. 10% discount on all products, free class for carers…" rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#F5F7FB', fontSize: 13.5, color: 'rgba(26,39,68,0.40)', fontFamily: 'Inter, sans-serif', cursor: 'not-allowed', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Why do you want to support carers?</label>
                  <textarea disabled placeholder="Tell us a bit about why this matters to your business or community…" rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#F5F7FB', fontSize: 13.5, color: 'rgba(26,39,68,0.40)', fontFamily: 'Inter, sans-serif', cursor: 'not-allowed', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.22)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Clock size={16} color={GOLD} strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>Partner registration is opening soon. Submit your details to be notified first.</div>
              </div>

              <button
                disabled
                style={{ width: '100%', padding: '12px 20px', borderRadius: 12, background: 'rgba(26,39,68,0.08)', border: '1px solid rgba(26,39,68,0.12)', color: 'rgba(26,39,68,0.40)', fontWeight: 700, fontSize: 14, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                Registration opening soon <Clock size={14} />
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.38)', marginTop: 14 }}>
              In the meantime, use the "Get in touch" button to contact the Inspiring Carers team directly.
            </p>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default BusinessPageComponent;
