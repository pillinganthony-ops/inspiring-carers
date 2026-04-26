// Training — static hub page at /training
// No county routing, no database, no auth.
// Future: add /county/training, live session listings, partner portal.

import React from 'react';
import {
  HeartHandshake, Brain, ShieldCheck, HeartPulse,
  Puzzle, Cross, GraduationCap, Users,
  Heart, Stethoscope, Building2, Handshake, Briefcase,
  Video, FileText, Award, BadgeCheck, CalendarDays, Bell,
} from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IArrow, ISparkle } = Icons;

const NAVY = '#1A2744';
const ACCENT = '#7B5CF5';

// ── Premium icon badge ─────────────────────────────────────────────────────
// Consistent rounded-square tile with brand-tinted background.

const IconBadge = ({ Icon, color, bg }) => (
  <div style={{
    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
    background: bg,
    border: `1px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon size={24} color={color} strokeWidth={1.75} />
  </div>
);

// ── Training category data ─────────────────────────────────────────────────

const CATEGORIES = [
  {
    Icon: HeartHandshake, color: '#16A34A', bg: 'rgba(22,163,74,0.09)',
    title: 'Carer wellbeing',
    desc: 'Practical strategies to manage stress, prevent burnout and build resilience as a carer.',
  },
  {
    Icon: Brain, color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)',
    title: 'Dementia awareness',
    desc: 'Understanding dementia, supporting communication, and creating a dementia-friendly environment.',
  },
  {
    Icon: ShieldCheck, color: '#2563EB', bg: 'rgba(37,99,235,0.09)',
    title: 'Safeguarding',
    desc: 'Recognising signs of abuse and neglect, knowing your responsibilities and how to act.',
  },
  {
    Icon: HeartPulse, color: '#E11D48', bg: 'rgba(225,29,72,0.09)',
    title: 'Mental health awareness',
    desc: 'Supporting mental health in yourself and those you care for — reducing stigma and knowing when to seek help.',
  },
  {
    Icon: Puzzle, color: '#4F46E5', bg: 'rgba(79,70,229,0.09)',
    title: 'Autism and learning disability',
    desc: 'Building understanding and practical skills to provide person-centred support.',
  },
  {
    Icon: Cross, color: '#DC2626', bg: 'rgba(220,38,38,0.09)',
    title: 'First aid and safety',
    desc: 'Confidence in emergency response, moving and handling, and everyday safety for carers.',
  },
  {
    Icon: GraduationCap, color: '#D97706', bg: 'rgba(217,119,6,0.09)',
    title: 'Professional development',
    desc: 'CPD opportunities, qualifications and career pathways for care workers and professionals.',
  },
  {
    Icon: Users, color: '#0D9488', bg: 'rgba(13,148,136,0.09)',
    title: 'Community workshops',
    desc: 'Local peer-led workshops, community education sessions and group learning opportunities.',
  },
];

// ── Audience data ──────────────────────────────────────────────────────────

const AUDIENCES = [
  {
    Icon: Heart, color: '#E11D48', bg: 'rgba(225,29,72,0.09)',
    title: 'Unpaid carers',
    desc: 'Family members, friends and neighbours who care for someone in need.',
  },
  {
    Icon: Stethoscope, color: '#2563EB', bg: 'rgba(37,99,235,0.09)',
    title: 'Care workers',
    desc: 'Paid care professionals working in home care, residential or supported living settings.',
  },
  {
    Icon: Building2, color: '#475569', bg: 'rgba(71,85,105,0.09)',
    title: 'Health & social care providers',
    desc: 'Organisations delivering regulated care who need to upskill their workforce.',
  },
  {
    Icon: Handshake, color: '#0D9488', bg: 'rgba(13,148,136,0.09)',
    title: 'Charities and community groups',
    desc: 'Voluntary organisations who support carers and want to improve their impact.',
  },
  {
    Icon: Briefcase, color: '#D97706', bg: 'rgba(217,119,6,0.09)',
    title: 'Employers and local partners',
    desc: 'Businesses and councils building carer-aware, inclusive workplaces and communities.',
  },
];

// ── Coming soon data ───────────────────────────────────────────────────────

const COMING_SOON = [
  { Icon: Video,        color: '#7B5CF5', bg: 'rgba(123,92,245,0.10)', label: 'Live and recorded sessions' },
  { Icon: FileText,     color: '#2563EB', bg: 'rgba(37,99,235,0.10)',  label: 'Downloadable resources and guides' },
  { Icon: Award,        color: '#D97706', bg: 'rgba(217,119,6,0.10)',  label: 'Partner-led and accredited workshops' },
  { Icon: BadgeCheck,   color: '#16A34A', bg: 'rgba(22,163,74,0.10)',  label: 'Certificates of completion' },
  { Icon: CalendarDays, color: '#475569', bg: 'rgba(71,85,105,0.10)',  label: 'Local training calendars by county' },
  { Icon: Bell,         color: '#7B5CF5', bg: 'rgba(123,92,245,0.10)', label: 'Notifications when new training is added' },
];

// ── Category card ──────────────────────────────────────────────────────────

const CategoryCard = ({ Icon, color, bg, title, desc }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '22px 20px', borderRadius: 18,
        border: `1px solid ${hov ? color + '40' : '#E8EEF8'}`,
        background: hov ? `${color}05` : '#FFFFFF',
        transition: 'border-color .16s, background .16s, transform .16s, box-shadow .16s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 12px 32px ${color}18` : '0 2px 8px rgba(26,39,68,0.04)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <IconBadge Icon={Icon} color={color} bg={bg} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
        <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────

const TrainingPage = ({ onNavigate, session }) => (
  <>
    <Nav activePage="training" onNavigate={onNavigate} session={session} />

    {/* ── Hero ── */}
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(150deg, #0E0A2A 0%, #1A1245 50%, #1F1652 100%)',
      paddingTop: 60, paddingBottom: 64,
    }}>
      <div style={{ position: 'absolute', top: -80, right: -60, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '20%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 13px', borderRadius: 999, background: 'rgba(123,92,245,0.18)', border: '1px solid rgba(123,92,245,0.32)', fontSize: 11, fontWeight: 800, color: '#C4B5FD', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 18 }}>
          <ISparkle s={11} /> Training & Development
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 18px', textWrap: 'balance', maxWidth: 760 }}>
          Training for carers, care teams and&nbsp;community organisations
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 600 }}>
          Inspiring Carers will bring together practical training, CPD programmes, awareness sessions, workshops and professional development — built around the real needs of carers, care workers and the communities that support them.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button
            className="btn btn-gold btn-lg"
            onClick={() => onNavigate('find-help')}
            style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800 }}
          >
            Register interest <IArrow s={14} />
          </button>
          <button
            onClick={() => onNavigate('find-help')}
            style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.90)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          >
            Explore support
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          {[
            { n: '8',     l: 'Training categories' },
            { n: 'Free',  l: 'To browse' },
            { n: 'CPD',   l: 'Accredited sessions coming' },
            { n: 'Local', l: 'County-based delivery' },
          ].map(({ n, l }, i) => (
            <div key={l} style={{ paddingRight: 24, paddingLeft: i > 0 ? 24 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Training categories ── */}
    <section style={{ paddingTop: 64, paddingBottom: 64, background: '#F7F9FC' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>What we cover</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: 0 }}>
            Training categories
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', marginTop: 8, maxWidth: 540 }}>
            Practical, evidence-based training across the topics that matter most to carers and care professionals.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {CATEGORIES.map((c) => <CategoryCard key={c.title} {...c} />)}
        </div>
      </div>
    </section>

    {/* ── Who it's for ── */}
    <section style={{ paddingTop: 64, paddingBottom: 64, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Who can access training</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: 0 }}>
            Built for everyone in the care system
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', marginTop: 8, maxWidth: 560 }}>
            Whether you are a family carer, a paid professional, or an organisation — training on Inspiring Carers is designed to support you.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {AUDIENCES.map(({ Icon, color, bg, title, desc }) => (
            <div key={title} style={{ padding: '22px 20px', borderRadius: 16, border: '1px solid #E8EEF8', background: '#FAFBFF', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <IconBadge Icon={Icon} color={color} bg={bg} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{title}</div>
                <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.58)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Coming soon ── */}
    <section style={{ paddingTop: 60, paddingBottom: 60, background: 'linear-gradient(180deg, #F0F4FF 0%, #F7F9FC 100%)' }}>
      <div className="container">
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: `${ACCENT}14`, border: `1px solid ${ACCENT}28`, fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              In development
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
              What's coming to the training hub
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              We're building a comprehensive training platform. Register your interest and be first to know when it launches.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {COMING_SOON.map(({ Icon, color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 8px rgba(26,39,68,0.04)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Provider / partner CTA ── */}
    <section style={{ paddingTop: 64, paddingBottom: 72, background: '#FFFFFF' }}>
      <div className="container">
        <div style={{ borderRadius: 28, background: 'linear-gradient(135deg, #1A1245 0%, #1F1652 100%)', padding: '52px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: -40, bottom: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', maxWidth: 600 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
              For training providers
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px', lineHeight: 1.2 }}>
              List your training and reach the people who need it most
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 520 }}>
              We're inviting training providers, charities, NHS partners, councils and community organisations to list their training opportunities on Inspiring Carers. Reach carers, care workers and employers across the UK.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {['Training providers', 'Charities', 'Councils', 'NHS partners', 'Community organisations'].map((t) => (
                <span key={t} style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-gold"
                onClick={() => onNavigate('login')}
                style={{ fontSize: 14, padding: '12px 24px', fontWeight: 800 }}
              >
                Express interest <IArrow s={13} />
              </button>
              <button
                onClick={() => onNavigate('find-help')}
                style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background .14s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer onNavigate={onNavigate} />
  </>
);

export default TrainingPage;
