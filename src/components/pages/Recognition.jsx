// Recognition page — /recognition
// National landing. No county routing. Nomination form is static (no backend).

import React from 'react';
import {
  HeartHandshake, Award, Sparkles, Users, BadgeCheck, Star,
  Heart, Quote, ChevronRight, Clock, CheckCircle2, ArrowRight,
  Building2, Trophy, Ribbon, HandHeart,
} from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';

const { IArrow } = Icons;

const NAVY = '#1A2744';
const GOLD = '#F5A623';
const ROSE = '#E11D48';

const IconBadge = ({ Icon, color, bg, size = 52, iconSize = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: 14, flexShrink: 0,
    background: bg, border: `1px solid ${color}28`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon size={iconSize} color={color} strokeWidth={1.75} />
  </div>
);

// ── Wall of Thanks cards ───────────────────────────────────────────────────

const THANKS_CARDS = [
  { name: 'Sarah T.',    role: 'Community nurse',           msg: 'Thank you Sarah — your warmth and patience during a really difficult time meant the world to our whole family. You went so far beyond your job.',       from: 'The Henderson family', color: '#E11D48', bg: 'rgba(225,29,72,0.07)' },
  { name: 'Mark B.',     role: 'Unpaid carer',              msg: 'To Mark, your quiet dedication to caring for your mum every single day without complaint is one of the bravest things I have ever witnessed.',         from: 'A grateful neighbour',  color: '#7B5CF5', bg: 'rgba(123,92,245,0.07)' },
  { name: 'Jen & team',  role: 'Respite support volunteers', msg: 'The respite sessions you organised gave me the first proper rest I had in three years. I cannot thank you enough for seeing what I needed.',            from: 'Anonymous carer',       color: '#0D9488', bg: 'rgba(13,148,136,0.07)' },
  { name: 'David R.',    role: 'Social worker',             msg: 'David listened when no one else did. He cut through the red tape, found us the right support, and never once made us feel like a case number.',       from: 'Kerry and family',      color: '#2563EB', bg: 'rgba(37,99,235,0.07)' },
  { name: 'The Sunrise Day Centre', role: 'Day care team',  msg: 'Every Friday, dad came home smiling. You gave him joy and gave me breathing space. That is priceless and we will never forget it.',                    from: 'A relieved daughter',   color: '#D97706', bg: 'rgba(217,119,6,0.07)' },
  { name: 'Lucy M.',     role: 'Night carer',               msg: 'Three years of night shifts to keep Mum comfortable at home. Lucy, you became part of our family. Thank you from the bottom of our hearts.',           from: 'The Whitmore family',   color: '#16A34A', bg: 'rgba(22,163,74,0.07)' },
];

const ThanksCard = ({ name, role, msg, from, color, bg }) => (
  <div style={{
    padding: '24px 22px', borderRadius: 20, background: '#FFFFFF',
    border: '1px solid #E8EEF8', boxShadow: '0 2px 12px rgba(26,39,68,0.05)',
    display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
  }}>
    <Quote size={22} color={color} strokeWidth={1.5} style={{ opacity: 0.55 }} />
    <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.80)', lineHeight: 1.75, margin: 0, fontStyle: 'italic', flexGrow: 1 }}>
      "{msg}"
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid #EEF1F7' }}>
      <div style={{ width: 38, height: 38, borderRadius: 999, background: bg, border: `1px solid ${color}28`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Heart size={16} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: NAVY }}>{name}</div>
        <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>{role}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'rgba(26,39,68,0.40)', fontStyle: 'italic', textAlign: 'right' }}>
        — {from}
      </div>
    </div>
  </div>
);

// ── Monthly spotlight cards ────────────────────────────────────────────────

const SPOTLIGHT = [
  {
    name: 'Patricia W.', location: 'Cornwall',
    title: 'Carer of the Month — April 2026',
    summary: 'Patricia has cared for her husband at home for seven years, navigating complex medical needs whilst raising two teenagers. Her resilience and selflessness inspire everyone who knows her.',
    category: 'Unpaid carer', color: ROSE, bg: 'rgba(225,29,72,0.09)',
    icon: Heart,
  },
  {
    name: 'Truro Community Night Nurses', location: 'Cornwall',
    title: 'Team of the Month — April 2026',
    summary: "This small NHS night nursing team quietly ensures that Cornwall's most vulnerable residents can remain at home with dignity. Their work often goes unseen — not this month.",
    category: 'NHS team', color: '#2563EB', bg: 'rgba(37,99,235,0.09)',
    icon: Users,
  },
];

// ── Categories ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { Icon: Heart,         color: ROSE,      bg: 'rgba(225,29,72,0.09)',    label: 'Unpaid carers',          desc: 'Family members and friends giving care every day.' },
  { Icon: HeartHandshake,color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)',   label: 'Care workers',           desc: 'Paid professionals supporting people in care.' },
  { Icon: BadgeCheck,    color: '#2563EB', bg: 'rgba(37,99,235,0.09)',    label: 'Nurses & NHS teams',     desc: 'Clinical staff going above and beyond.' },
  { Icon: Users,         color: '#D97706', bg: 'rgba(217,119,6,0.09)',    label: 'Support staff',          desc: 'Coordinators, admin and behind-the-scenes roles.' },
  { Icon: Sparkles,      color: '#16A34A', bg: 'rgba(22,163,74,0.09)',    label: 'Volunteers',             desc: 'People giving their time freely to help others.' },
  { Icon: Award,         color: '#0D9488', bg: 'rgba(13,148,136,0.09)',   label: 'Community heroes',       desc: 'Individuals making a difference in their area.' },
  { Icon: Trophy,        color: GOLD,      bg: 'rgba(245,166,35,0.12)',   label: 'Outstanding organisations', desc: 'Teams and organisations raising the bar for care.' },
];

// ── Page ───────────────────────────────────────────────────────────────────

const RecognitionPage = ({ onNavigate, session }) => {
  const [form, setForm] = React.useState({ yourName: '', honoureeName: '', role: '', reason: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.yourName || !form.honoureeName || !form.reason) return;
    setSubmitted(true);
  };

  return (
    <>
      <Nav activePage="recognition" onNavigate={onNavigate} session={session} />

      {/* ── 1. Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #1A0A1C 0%, #2D1235 45%, #3D1A4A 100%)',
        paddingTop: 64, paddingBottom: 72,
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: -100, right: -80, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '50%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 700 }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(225,29,72,0.20)', border: '1px solid rgba(225,29,72,0.35)', fontSize: 11, fontWeight: 800, color: '#FCA5A5', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 20 }}>
              <Heart size={11} color="#FCA5A5" /> Community Recognition
            </div>
            <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px', textWrap: 'balance' }}>
              Recognising the people<br />
              <span style={{ background: 'linear-gradient(90deg, #FCA5A5 0%, #F9A8D4 50%, #C4B5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>who care for others.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.66)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 560 }}>
              Behind every carer, care worker and volunteer is a story that deserves to be told. Celebrate the people in your life who give so much to support others — and make sure they know they are seen.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                className="btn btn-lg"
                onClick={() => scrollTo('nominate')}
                style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800, background: '#E11D48', border: 'none', color: '#FFFFFF', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Heart size={15} /> Nominate someone
              </button>
              <button
                onClick={() => scrollTo('wall-of-thanks')}
                style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.90)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              >
                <HeartHandshake size={15} /> View wall of thanks
              </button>
            </div>
            {/* Trust strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
              {[
                { icon: Star,      text: 'Monthly spotlights' },
                { icon: Sparkles,  text: 'Free to nominate' },
                { icon: Award,     text: 'Community awards coming soon' },
              ].map(({ icon: I, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.60)' }}>
                  <I size={14} color="rgba(255,255,255,0.45)" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Recognition categories ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Who can be recognised</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
              Every act of care deserves recognition
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.55)', maxWidth: 520, margin: '0 auto' }}>
              From unpaid family carers to entire NHS teams — nominate anyone who has made a meaningful difference.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {CATEGORIES.map(({ Icon, color, bg, label, desc }) => (
              <div
                key={label}
                style={{ padding: '22px 18px', borderRadius: 18, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 8px rgba(26,39,68,0.04)', display: 'flex', flexDirection: 'column', gap: 14, cursor: 'default' }}
              >
                <IconBadge Icon={Icon} color={color} bg={bg} size={48} iconSize={22} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{label}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Wall of Thanks ── */}
      <section id="wall-of-thanks" style={{ paddingTop: 72, paddingBottom: 80, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Wall of thanks</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
              Messages of gratitude
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.55)', maxWidth: 500, margin: '0 auto' }}>
              Real words of thanks from real families, carers and communities. (Demo cards shown — submit yours below.)
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {THANKS_CARDS.map(card => (
              <ThanksCard key={card.name} {...card} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              onClick={() => scrollTo('nominate')}
              className="btn btn-navy"
              style={{ fontSize: 14, padding: '12px 24px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Heart size={14} /> Add your message of thanks <IArrow s={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Monthly Spotlight ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: 'linear-gradient(160deg, #F9F5FF 0%, #FFF5F7 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: 0, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Monthly spotlight</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
              April 2026 — Featuring this month
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', maxWidth: 500, margin: 0 }}>
              Each month we shine a light on a carer, worker, volunteer or team who has made an outstanding contribution.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
            {SPOTLIGHT.map(({ name, location, title, summary, category, color, bg, icon: Icon }) => (
              <div
                key={name}
                style={{ padding: '28px 26px', borderRadius: 22, background: '#FFFFFF', border: `1.5px solid ${color}28`, boxShadow: '0 4px 24px rgba(26,39,68,0.07)', position: 'relative', overflow: 'hidden' }}
              >
                {/* Gold ribbon */}
                <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.28)', fontSize: 10.5, fontWeight: 800, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <Star size={10} color={GOLD} strokeWidth={2.5} /> Spotlight
                </div>
                {/* Avatar */}
                <div style={{ width: 60, height: 60, borderRadius: 999, background: bg, border: `2px solid ${color}35`, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <Icon size={26} color={color} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{category}</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: NAVY, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.45)', fontWeight: 600, marginBottom: 14 }}>{location}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 10, fontStyle: 'italic' }}>{title}</div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.68)', lineHeight: 1.7, margin: 0 }}>{summary}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: '18px 20px', borderRadius: 14, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.22)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 580 }}>
            <Trophy size={20} color={GOLD} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13.5, color: '#92400E', fontWeight: 600, margin: 0 }}>
              Monthly spotlights are selected from nominations. Nominate someone below and they could feature next month.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Nomination Form ── */}
      <section id="nominate" style={{ paddingTop: 72, paddingBottom: 80, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Nomination</div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
                Nominate someone who deserves recognition
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', margin: 0 }}>
                Nominations are reviewed monthly. The most touching stories are featured in our Wall of Thanks and monthly spotlight.
              </p>
            </div>

            {submitted ? (
              <div style={{ padding: '40px 32px', borderRadius: 22, background: 'linear-gradient(135deg, #FFF0F4 0%, #FFF7F0 100%)', border: '1.5px solid rgba(225,29,72,0.20)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(225,29,72,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
                  <Heart size={28} color={ROSE} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Thank you — your nomination has been received.</div>
                <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.60)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
                  We'll review it and may feature it in our Wall of Thanks or monthly spotlight. The person you nominated is lucky to have someone who cares enough to celebrate them.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ yourName: '', honoureeName: '', role: '', reason: '' }); }}
                  style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(225,29,72,0.10)', border: '1px solid rgba(225,29,72,0.22)', color: ROSE, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Nominate someone else
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ padding: '32px 28px', borderRadius: 22, border: '1px solid #E8EEF8', background: '#FAFBFF', display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                {[
                  { key: 'yourName',    label: 'Your name',                    placeholder: 'Your full name', type: 'text' },
                  { key: 'honoureeName', label: 'Who are you recognising?',    placeholder: "Their name or team's name", type: 'text' },
                  { key: 'role',        label: 'Their role',                   placeholder: 'e.g. Unpaid carer, community nurse, volunteer…', type: 'text' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{label} <span style={{ color: ROSE }}>*</span></label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      required={key !== 'role'}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: `1px solid ${form[key] ? '#CBD5E1' : '#E0E7F0'}`, background: '#FFFFFF', fontSize: 14, color: NAVY, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color .15s' }}
                      onFocus={e => { e.target.style.borderColor = '#E11D48'; e.target.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.10)'; }}
                      onBlur={e => { e.target.style.borderColor = form[key] ? '#CBD5E1' : '#E0E7F0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Why do they deserve recognition? <span style={{ color: ROSE }}>*</span></label>
                  <textarea
                    placeholder="Tell us what they do, what it means to you, and why the world should know about them. The more personal the better."
                    rows={5}
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: `1px solid ${form.reason ? '#CBD5E1' : '#E0E7F0'}`, background: '#FFFFFF', fontSize: 14, color: NAVY, fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', transition: 'border-color .15s' }}
                    onFocus={e => { e.target.style.borderColor = '#E11D48'; e.target.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.10)'; }}
                    onBlur={e => { e.target.style.borderColor = form.reason ? '#CBD5E1' : '#E0E7F0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.14)', fontSize: 12.5, color: 'rgba(26,39,68,0.60)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Heart size={14} color={ROSE} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  Nominations are reviewed by the Inspiring Carers team. We may feature them in our Wall of Thanks, monthly spotlight, or future community awards — always with your permission.
                </div>
                <button
                  type="submit"
                  style={{ padding: '13px 22px', borderRadius: 12, background: '#E11D48', border: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.90'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  <Heart size={15} /> Submit nomination
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. Employer / Organisations section ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#F0F4FF' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>For employers &amp; organisations</div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: NAVY, margin: '0 0 14px', lineHeight: 1.2 }}>
                Recognition builds the culture your people stay for
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.60)', lineHeight: 1.75, margin: '0 0 24px', maxWidth: 480 }}>
                Organisations using Inspiring Carers recognition tools can celebrate their care teams, reduce burnout and build a culture where every contribution is seen and valued.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { Icon: Trophy,        color: '#2563EB', text: 'Nominate your team for monthly and annual awards' },
                  { Icon: HeartHandshake,color: ROSE,      text: 'Show carers and care workers they are appreciated' },
                  { Icon: BadgeCheck,    color: '#16A34A', text: 'Demonstrate your commitment to carer wellbeing publicly' },
                  { Icon: Users,         color: '#7B5CF5', text: 'Build staff morale, loyalty and retention' },
                ].map(({ Icon, color, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #E8EEF8' }}>
                    <Icon size={18} color={color} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('business')}
                style={{ marginTop: 28, padding: '13px 24px', borderRadius: 12, background: NAVY, border: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <Building2 size={15} /> Partner with Inspiring Carers <IArrow s={13} />
              </button>
            </div>

            {/* Stats panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { value: '1 in 8', label: 'UK workers is an unpaid carer', color: ROSE,      bg: 'rgba(225,29,72,0.07)' },
                { value: '600K',   label: 'carers leave work annually due to lack of support', color: '#2563EB', bg: 'rgba(37,99,235,0.07)' },
                { value: '£5.3bn', label: 'annual cost of replacing carers who leave work', color: '#D97706', bg: 'rgba(217,119,6,0.07)' },
                { value: '89%',    label: 'of carers say feeling recognised reduces burnout', color: '#16A34A', bg: 'rgba(22,163,74,0.07)' },
              ].map(({ value, label, color, bg }) => (
                <div key={label} style={{ padding: '22px 18px', borderRadius: 18, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 8px rgba(26,39,68,0.04)' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.55, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Sponsor / Future awards ── */}
      <section style={{ paddingTop: 68, paddingBottom: 72, background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 55%, #1A3460 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 18 }}>
                <Award size={11} color="#FFD580" /> Sponsored Recognition
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px', lineHeight: 1.15 }}>
                Sponsor a monthly award or recognition campaign
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.64)', lineHeight: 1.75, margin: '0 0 14px', maxWidth: 480 }}>
                Monthly awards, community ceremonies, sponsored spotlight stories and regional campaigns — Inspiring Carers is building a national recognition programme and we're looking for organisations who want to lead it.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', fontStyle: 'italic', margin: '0 0 28px' }}>
                Sponsorship packages in development. Register early interest to shape the programme.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  onClick={() => onNavigate('business')}
                  className="btn btn-gold"
                  style={{ fontSize: 14, padding: '12px 24px', fontWeight: 800 }}
                >
                  Register early interest <IArrow s={13} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { Icon: Award,         color: '#FFD580', title: 'Monthly awards',           desc: 'Sponsor the Carer of the Month award. Your brand associated with community gratitude.' },
                { Icon: Sparkles,      color: '#FCA5A5', title: 'Spotlight campaigns',       desc: 'Co-branded spotlight stories shared across the platform and social channels.' },
                { Icon: Ribbon,        color: '#C4B5FD', title: 'Annual ceremony',           desc: 'Headline sponsor for a regional or national Carer Recognition Ceremony.' },
                { Icon: HeartHandshake,color: '#6EE7B7', title: 'Community campaigns',       desc: 'Seasonal or cause-led recognition drives tied to Carers Week and beyond.' },
              ].map(({ Icon, color, title, desc }) => (
                <div key={title} style={{ padding: '20px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <Icon size={20} color={color} strokeWidth={1.75} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', marginBottom: 5 }}>{title}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default RecognitionPage;
