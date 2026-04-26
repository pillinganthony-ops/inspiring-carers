// AdvertisePage — /advertise
// Commercial advertising and sponsorship landing page.
// Interest form writes to partner_enquiries table in Supabase.

import React from 'react';
import {
  Crown, Megaphone, BadgeCheck, MapPin, Sparkles,
  HandHeart, BarChart3, Users as UsersIcon, Target,
  CheckCircle2, Clock, Coffee, Waves, HeartPulse,
} from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

const { IArrow } = Icons;

const NAVY = '#1A2744';
const GOLD = '#F5A623';

const IconBadge = ({ Icon, color, bg, size = 52, iconSize = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: 14, flexShrink: 0,
    background: bg, border: `1px solid ${color}28`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon size={iconSize} color={color} strokeWidth={1.75} />
  </div>
);

// Demo placement preview — illustrates what a featured partner card looks like
const PlacementCard = ({ name, category, offer, note, color, bg, Icon }) => (
  <div style={{
    borderRadius: 18, background: '#FFFFFF',
    border: `1px solid ${color}22`,
    boxShadow: '0 2px 12px rgba(26,39,68,0.06)',
    overflow: 'hidden',
  }}>
    <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
    <div style={{ padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.45)', fontWeight: 600 }}>{category}</div>
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: bg, color, letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>Featured</span>
      </div>
      <div style={{ padding: '10px 12px', borderRadius: 10, background: bg, border: `1px solid ${color}18` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Offer preview</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{offer}</div>
      </div>
      {note && <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.40)', fontStyle: 'italic' }}>{note}</div>}
    </div>
  </div>
);

const AdvertisePage = ({ onNavigate, session }) => {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const EMPTY_FORM = {
    orgName: '', contactName: '', email: '', phone: '', website: '',
    businessType: '', promotionType: '', preferredPlacement: '',
    offerTitle: '', offerDescription: '', offerCategory: '',
    targetCounty: '', targetArea: '',
    callToAction: '', logoUrl: '', imageUrl: '',
    description: '',
  };
  const [form,         setForm]         = React.useState(EMPTY_FORM);
  const [submitting,   setSubmitting]   = React.useState(false);
  const [submitted,    setSubmitted]    = React.useState(false);
  const [submitError,  setSubmitError]  = React.useState(null);

  const fieldStyle   = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#FFFFFF', fontSize: 13.5, color: NAVY, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color .15s' };
  const selectStyle  = { ...fieldStyle, cursor: 'pointer', appearance: 'auto' };
  const onFocusField = e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.10)'; };
  const onBlurField  = e => { e.target.style.borderColor = '#E0E7F0'; e.target.style.boxShadow = 'none'; };
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orgName || !form.contactName || !form.email || !form.promotionType || !form.preferredPlacement) return;
    setSubmitting(true); setSubmitError(null);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: dbErr } = await supabase.from('partner_enquiries').insert({
          organisation_name:    form.orgName,
          contact_name:         form.contactName,
          email:                form.email,
          phone:                form.phone             || null,
          website:              form.website            || null,
          business_type:        form.businessType       || null,
          promotion_type:       form.promotionType      || null,
          advertising_interest: form.promotionType      || null,   // backward compat
          preferred_placement:  form.preferredPlacement || null,
          offer_title:          form.offerTitle         || null,
          offer_description:    form.offerDescription   || null,
          offer_category:       form.offerCategory      || null,
          target_county:        form.targetCounty       || null,
          county:               form.targetCounty       || null,   // backward compat
          target_area:          form.targetArea          || null,
          call_to_action:       form.callToAction        || null,
          logo_url:             form.logoUrl             || null,
          image_url:            form.imageUrl            || null,
          description:          form.description         || null,
          source_page:          'advertise',
          admin_status:         'new',
          public_profile_ready: false,
        });
        if (dbErr) throw dbErr;
      }
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong — please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Nav activePage="advertise" onNavigate={onNavigate} session={session} />

      {/* ── 1. Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #0C1A35 0%, #16204A 52%, #1C1E58 100%)',
        paddingTop: 64, paddingBottom: 72,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.30)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 20 }}>
              <Megaphone size={11} color="#FFD580" /> Advertising &amp; Sponsorship
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.04, margin: '0 0 20px', textWrap: 'balance' }}>
              Advertise with<br />Inspiring Carers
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 540 }}>
              Reach carers, care professionals and community-minded audiences through featured placements, local offers, activity promotion and county sponsorship opportunities.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                onClick={() => scrollTo('interest-form')}
                className="btn btn-gold btn-lg"
                style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800 }}
              >
                Register interest <IArrow s={14} />
              </button>
              <button
                onClick={() => scrollTo('ad-options')}
                style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.90)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              >
                View options
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
              <Clock size={14} color="rgba(255,255,255,0.38)" strokeWidth={2} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.46)', fontWeight: 500 }}>
                Early partner opportunities are opening as the platform grows.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Advertising options ── */}
      <section id="ad-options" style={{ paddingTop: 72, paddingBottom: 72, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>What we offer</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
              Advertising and sponsorship options
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.55)', maxWidth: 500, margin: '0 auto' }}>
              Choose the format that fits your organisation, audience and goals.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                Icon: Crown, color: GOLD, bg: 'rgba(245,166,35,0.10)',
                title: 'Featured Listing',
                desc: 'For venues, services, offers and activities that want stronger visibility in the discovery experience.',
                includes: ['Featured placement on discovery pages', 'Enhanced category visibility', 'Premium card treatment', 'Activity map inclusion'],
                audience: 'Cafés, attractions, wellbeing providers, shops and local services',
              },
              {
                Icon: MapPin, color: '#7B5CF5', bg: 'rgba(123,92,245,0.10)',
                title: 'County Sponsorship',
                desc: 'For organisations that want high-profile regional association across an entire county area.',
                includes: ['One exclusive sponsor per county', 'Visibility across county discovery areas', 'Association with carer support and wellbeing', 'Co-branded awareness opportunities'],
                audience: 'Larger employers, councils, local sponsors and regional brands',
              },
              {
                Icon: Megaphone, color: '#E11D48', bg: 'rgba(225,29,72,0.10)',
                title: 'Campaign Promotion',
                desc: 'For seasonal offers, awareness campaigns, community events or wellbeing initiatives with a clear timeframe.',
                includes: ['Short-term campaign placement', 'Activity and event promotion', 'Discount and offer visibility', 'Seasonal awareness tie-ins'],
                audience: 'Launches, community campaigns and awareness weeks',
              },
            ].map(({ Icon, color, bg, title, desc, includes, audience }) => (
              <div key={title} style={{ padding: '28px 24px', borderRadius: 22, background: '#FFFFFF', border: '1px solid #E8EEF8', boxShadow: '0 2px 10px rgba(26,39,68,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <IconBadge Icon={Icon} color={color} bg={bg} size={48} iconSize={22} />
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: bg, color, border: `1px solid ${color}28`, whiteSpace: 'nowrap' }}>Coming soon</span>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{title}</div>
                  <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {includes.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                      <CheckCircle2 size={15} color={color} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #EEF1F7' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(26,39,68,0.42)' }}>Best for</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 3 }}>{audience}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Why advertise here ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Why Inspiring Carers</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: NAVY, margin: 0 }}>
              A values-led audience actively seeking local support
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { Icon: HandHeart,  color: '#E11D48', bg: 'rgba(225,29,72,0.09)',   title: 'Values-led audience',          desc: 'Members are motivated by care, community and wellbeing. They respond to brands that genuinely align with those values.' },
              { Icon: BadgeCheck, color: '#0D9488', bg: 'rgba(13,148,136,0.09)', title: 'High trust environment',       desc: 'The platform exists to support people in caring roles. Advertising here carries positive association rather than intrusion.' },
              { Icon: Target,     color: '#2563EB', bg: 'rgba(37,99,235,0.09)',   title: 'Active discovery behaviour',   desc: 'Users come to find activities, services and support — they are in an active exploration mindset, not passive browsing.' },
              { Icon: Sparkles,   color: GOLD,      bg: 'rgba(245,166,35,0.10)',  title: 'Positive brand association',   desc: 'Partner with a platform that exists for community good. Every impression carries the brand equity of carer support.' },
              { Icon: MapPin,     color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)', title: 'County-level targeting',       desc: 'County sponsorships will offer exclusive regional positioning — one partner per area, high visibility and low competition.' },
              { Icon: UsersIcon,  color: '#16A34A', bg: 'rgba(22,163,74,0.09)',   title: 'Community impact signal',      desc: 'Demonstrate real commitment to carers — valuable for employer brand, CSR reporting and community-facing organisations.' },
            ].map(({ Icon, color, bg, title, desc }) => (
              <div key={title} style={{ padding: '22px 20px', borderRadius: 20, background: '#FAFBFF', border: '1px solid #E8EEF8', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <IconBadge Icon={Icon} color={color} bg={bg} size={46} iconSize={21} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{title}</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Example placements ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#F0F4FF' }}>
        <div className="container">
          <div style={{ marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Example placements</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
              How featured partners appear on the platform
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', maxWidth: 540, margin: 0 }}>
              Illustrative previews using fictional organisations — showing the placement format partners will use.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
            <PlacementCard name="Harbour Wellness Studio" category="Wellness &amp; relaxation" offer="25% off all treatments for Inspiring Carers members" note={null} color="#0D9488" bg="rgba(13,148,136,0.09)" Icon={HeartPulse} />
            <PlacementCard name="Meadow Family Days" category="Family days out" offer="Carer goes free with any full-price adult ticket" note={null} color="#7B5CF5" bg="rgba(123,92,245,0.09)" Icon={Waves} />
            <PlacementCard name="Bloom Café Collective" category="Food &amp; drink" offer="Free drink upgrade with your Inspiring Carers card" note={null} color="#D97706" bg="rgba(217,119,6,0.09)" Icon={Coffee} />
            <PlacementCard name="County sponsor space" category="County sponsorship" offer="Your organisation featured across the full county" note="Exclusive sponsor slot — one per county" color={GOLD} bg="rgba(245,166,35,0.09)" Icon={Crown} />
          </div>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(26,39,68,0.04)', border: '1px solid #DDE5F0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <BadgeCheck size={16} color="rgba(26,39,68,0.38)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.50)', margin: 0, lineHeight: 1.65 }}>
              Example placements shown for preview only. These are fictional demonstration examples. Live advertising inventory will open as partner onboarding expands. No current live partnerships are implied.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Indicative future packages ── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Future pricing</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
              Indicative packages — for planning purposes
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.10)', border: '1px solid rgba(245,166,35,0.25)', fontSize: 12, fontWeight: 700, color: '#92400E' }}>
              <Clock size={13} color="#92400E" strokeWidth={2} /> Indicative future pricing for planning only — not currently live
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20, maxWidth: 920, margin: '0 auto' }}>

            {/* Starter */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: '2px solid #E8EEF8', background: '#FAFBFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <IconBadge Icon={Sparkles} color="#2563EB" bg="rgba(37,99,235,0.09)" size={44} iconSize={20} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Starter Visibility</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>Indicative: from £49/month</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Featured listing', 'Category placement', 'Basic campaign visibility', 'Standard discovery placement'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color="#2563EB" strokeWidth={2} style={{ flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} className="btn btn-navy" style={{ marginTop: 22, width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                Register interest <IArrow s={13} />
              </button>
            </div>

            {/* Local Growth */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: `2px solid ${GOLD}55`, background: 'linear-gradient(160deg, #FFFDF5 0%, #FFFBF0 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', color: GOLD, border: '1px solid rgba(245,166,35,0.30)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Popular
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <IconBadge Icon={BarChart3} color={GOLD} bg="rgba(245,166,35,0.12)" size={44} iconSize={20} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Local Growth</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>Indicative: from £149/month</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Featured listing', 'Activity and offer spotlight', 'Monthly campaign placement', 'Analytics dashboard'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color={GOLD} strokeWidth={2} style={{ flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} className="btn btn-gold" style={{ marginTop: 22, width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                Register interest <IArrow s={13} />
              </button>
            </div>

            {/* County Sponsor */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: '2px solid rgba(123,92,245,0.35)', background: 'linear-gradient(160deg, #F8F5FF 0%, #F2EEFF 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <IconBadge Icon={Crown} color="#7B5CF5" bg="rgba(123,92,245,0.12)" size={44} iconSize={20} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>County Sponsor</div>
                  <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>Indicative: from £500+/month</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Exclusive regional visibility', 'County-level sponsor positioning', 'Priority campaign visibility', 'Bespoke package and reporting'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color="#7B5CF5" strokeWidth={2} style={{ flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} style={{ marginTop: 22, width: '100%', padding: '11px 20px', borderRadius: 12, background: 'rgba(123,92,245,0.12)', border: '1px solid rgba(123,92,245,0.28)', color: '#7B5CF5', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Register interest <IArrow s={13} />
              </button>
            </div>

          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.36)', marginTop: 18 }}>
            All pricing is indicative and for forward planning only. Advertising inventory is not yet live.
          </p>
        </div>
      </section>

      {/* ── 6. Interest form — profile-ready advertising intake ── */}
      <section id="interest-form" style={{ paddingTop: 64, paddingBottom: 80, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Register interest</div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, margin: '0 0 8px' }}>
                Express your interest early
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', margin: 0 }}>
                Tell us about your organisation and what you would like to promote. We will be in touch when advertising inventory opens.
              </p>
            </div>

            {submitted ? (
              <div style={{ padding: '44px 32px', borderRadius: 22, background: 'linear-gradient(160deg, #FFFDF5 0%, #FFFBF0 100%)', border: '1.5px solid rgba(245,166,35,0.25)', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 999, background: 'rgba(245,166,35,0.12)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
                  <CheckCircle2 size={28} color={GOLD} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 10 }}>
                  Thanks — we have received your advertising enquiry.
                </div>
                <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.58)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                  We will review your details and may use them to prepare a draft profile, offer card or featured placement — before anything goes live.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }}
                  style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', color: '#92400E', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ borderRadius: 22, border: '1px solid #E8EEF8', background: '#FFFFFF', overflow: 'hidden' }}>

                {/* Helper banner */}
                <div style={{ padding: '16px 28px', background: 'rgba(245,166,35,0.06)', borderBottom: '1px solid rgba(245,166,35,0.14)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <BadgeCheck size={16} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    This information helps us turn your enquiry into a draft profile, offer card or featured placement — everything is reviewed before anything goes live.
                  </p>
                </div>

                <div style={{ padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* ── Section 1: Organisation details ── */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: GOLD, marginBottom: 18 }}>
                      1 — Organisation details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      {[
                        { key: 'orgName',     label: 'Organisation name', placeholder: 'Your business or organisation name', type: 'text',  req: true },
                        { key: 'contactName', label: 'Contact name',      placeholder: 'Your full name',                    type: 'text',  req: true },
                        { key: 'email',       label: 'Email address',     placeholder: 'email@yourorganisation.com',        type: 'email', req: true },
                        { key: 'phone',       label: 'Phone number',      placeholder: 'Optional',                          type: 'tel',   req: false },
                        { key: 'website',     label: 'Website',           placeholder: 'https://yourorganisation.com',      type: 'url',   req: false },
                      ].map(({ key, label, placeholder, type, req }) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                            {label}{req && <span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>}
                          </label>
                          <input type={type} placeholder={placeholder} required={req} value={form[key]} onChange={set(key)} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Business / organisation type</label>
                        <select value={form.businessType} onChange={set('businessType')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle}>
                          <option value="">Select type</option>
                          {['Local business', 'National business', 'Café / restaurant', 'Attraction / days out', 'Wellbeing provider', 'Shop / retail', 'Gym / leisure', 'Training provider', 'Charity / community organisation', 'Employer / sponsor', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Offer / promotion details ── */}
                  <div style={{ paddingTop: 24, borderTop: '1px solid #EEF1F7', marginBottom: 28 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: GOLD, marginBottom: 18 }}>
                      2 — Offer / promotion details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                          Promotion type<span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>
                        </label>
                        <select value={form.promotionType} onChange={set('promotionType')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle} required>
                          <option value="">Select promotion type</option>
                          {['Featured listing', 'Carer discount / offer', 'Activity promotion', 'County sponsorship', 'Campaign promotion', 'General partnership'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Offer category</label>
                        <select value={form.offerCategory} onChange={set('offerCategory')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle}>
                          <option value="">Select category</option>
                          {['Food & drink', 'Wellbeing', 'Activities', 'Retail', 'Travel', 'Training', 'Community support', 'Professional services', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Offer title</label>
                        <input type="text" placeholder="e.g. 20% off for carers" value={form.offerTitle} onChange={set('offerTitle')} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Call to action</label>
                        <select value={form.callToAction} onChange={set('callToAction')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle}>
                          <option value="">Select CTA</option>
                          {['Visit website', 'Claim offer', 'Book now', 'Contact us', 'Learn more', 'Register interest'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Offer / advert description</label>
                      <textarea placeholder="Tell us what you would like carers to see, book, claim or know about." rows={3} value={form.offerDescription} onChange={set('offerDescription')} onFocus={onFocusField} onBlur={onBlurField} style={{ ...fieldStyle, resize: 'vertical' }} />
                    </div>
                  </div>

                  {/* ── Section 3: Placement preferences ── */}
                  <div style={{ paddingTop: 24, borderTop: '1px solid #EEF1F7', marginBottom: 28 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: GOLD, marginBottom: 18 }}>
                      3 — Placement preferences
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                          Preferred placement<span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>
                        </label>
                        <select value={form.preferredPlacement} onChange={set('preferredPlacement')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle} required>
                          <option value="">Select placement</option>
                          {['Activities page', 'For You / discounts page', 'County sponsor area', 'Featured partner panel', 'Business profile', 'Not sure yet'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Target county</label>
                        <input type="text" placeholder="e.g. Cornwall, Devon, Bristol, national" value={form.targetCounty} onChange={set('targetCounty')} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Target town / area</label>
                        <input type="text" placeholder="e.g. St Austell, Truro, Plymouth" value={form.targetArea} onChange={set('targetArea')} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                      </div>
                    </div>
                  </div>

                  {/* ── Section 4: Admin-ready assets ── */}
                  <div style={{ paddingTop: 24, borderTop: '1px solid #EEF1F7', marginBottom: 24 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: GOLD, marginBottom: 4 }}>
                      4 — Assets &amp; additional notes
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.44)', marginBottom: 18 }}>Optional — helps us prepare a profile or card faster after review.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Logo URL</label>
                        <input type="url" placeholder="https://yoursite.com/logo.png" value={form.logoUrl} onChange={set('logoUrl')} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Profile / ad image URL</label>
                        <input type="url" placeholder="https://yoursite.com/image.jpg" value={form.imageUrl} onChange={set('imageUrl')} onFocus={onFocusField} onBlur={onBlurField} style={fieldStyle} />
                      </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Additional notes</label>
                      <textarea placeholder="Anything else we should know about your organisation, audience or goals." rows={3} value={form.description} onChange={set('description')} onFocus={onFocusField} onBlur={onBlurField} style={{ ...fieldStyle, resize: 'vertical' }} />
                    </div>
                  </div>

                  {submitError && (
                    <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.20)', fontSize: 13, color: '#B91C1C' }}>
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: '100%', padding: '14px 20px', borderRadius: 12, background: submitting ? 'rgba(245,166,35,0.40)' : 'linear-gradient(135deg, #F5A623, #D4AF37)', border: 'none', color: '#0F172A', fontWeight: 800, fontSize: 15, cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'opacity .14s' }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.90'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {submitting ? 'Sending…' : 'Submit advertising enquiry'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(26,39,68,0.38)', marginTop: 10, marginBottom: 0 }}>
                    Fields marked <span style={{ color: '#E11D48' }}>*</span> are required. Nothing is published automatically.
                  </p>

                </div>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.36)', marginTop: 16 }}>
              Prefer to make direct contact?{' '}
              <button onClick={() => onNavigate('business')} style={{ fontSize: 12.5, color: NAVY, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Use the business partner page
              </button>.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ── */}
      <section style={{ paddingTop: 72, paddingBottom: 80, background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Ready to reach the care community?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, margin: '0 0 32px' }}>
              Join a growing national platform connecting carers, families and professionals with the services, activities and support they need.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-gold btn-lg"
                onClick={() => scrollTo('interest-form')}
                style={{ fontSize: 15, padding: '14px 28px', fontWeight: 800 }}
              >
                Register interest <IArrow s={14} />
              </button>
              <button
                onClick={() => onNavigate('business')}
                style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
              >
                Become a partner
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default AdvertisePage;
