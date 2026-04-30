// AdvertisePage — /advertise
// High-converting commercial advertising and sponsorship landing page.
// Interest form writes to partner_enquiries table in Supabase.

import React from 'react';
import {
  Crown, Megaphone, BadgeCheck, MapPin, Sparkles,
  HandHeart, BarChart3, Users as UsersIcon, Target,
  CheckCircle2, Clock, Coffee, Waves, HeartPulse,
  Zap, Globe, TrendingUp, ShieldCheck, Star, Upload,
} from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import Icons from '../Icons.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

const { IArrow } = Icons;

const NAVY  = '#1A2744';
const GOLD  = '#F5A623';

// ── Shared components ─────────────────────────────────────────────────────────

const IconBadge = ({ Icon, color, bg, size = 52, iconSize = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: 14, flexShrink: 0,
    background: bg, border: `1px solid ${color}28`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon size={iconSize} color={color} strokeWidth={1.75} />
  </div>
);

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
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Active offer</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{offer}</div>
      </div>
      {note && <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.40)', fontStyle: 'italic' }}>{note}</div>}
    </div>
  </div>
);

// ── Page component ────────────────────────────────────────────────────────────

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
  const [form,        setForm]       = React.useState(EMPTY_FORM);
  const [submitting,  setSubmitting] = React.useState(false);
  const [submitted,   setSubmitted]  = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);

  const fieldStyle  = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid #E0E7F0', background: '#FFFFFF', fontSize: 13.5, color: NAVY, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color .15s' };
  const selectStyle = { ...fieldStyle, cursor: 'pointer', appearance: 'auto' };
  const onFocusField = e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.10)'; };
  const onBlurField  = e => { e.target.style.borderColor = '#E0E7F0'; e.target.style.boxShadow = 'none'; };
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  // ── URL normalisation ─────────────────────────────────────────────────────
  // Converts bare domains (www.example.com) to https:// before storage.
  // Browser type="url" validation rejects bare domains — so we use type="text"
  // and normalise on submit.
  const normalizeUrl = (value) => {
    if (!value) return null;
    const v = `${value}`.trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  // ── Step state ────────────────────────────────────────────────────────────
  const TOTAL_STEPS = 4;
  const [step, setStep] = React.useState(1);
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const stepValid = (s) => {
    if (s === 1) return Boolean(form.orgName && form.contactName && form.email);
    if (s === 2) return Boolean(form.promotionType);
    if (s === 3) return Boolean(form.preferredPlacement);
    return true;
  };
  const handleContinue = () => { if (step < TOTAL_STEPS && stepValid(step)) setStep(step + 1); };

  const stepHint = (s) => {
    if (s === 1) {
      if (!form.orgName)     return 'Organisation name is required';
      if (!form.contactName) return 'Contact name is required';
      if (!form.email)       return 'Email address is required';
    }
    if (s === 2 && !form.promotionType)     return 'Please select a promotion type';
    if (s === 3 && !form.preferredPlacement) return 'Please select your preferred placement';
    return null;
  };

  // ── Asset upload ──────────────────────────────────────────────────────────
  // Requires a Supabase Storage bucket named 'partner-assets' (public, anon INSERT).
  // Falls back gracefully if bucket is not configured yet.
  const [uploadingLogo,  setUploadingLogo]  = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadError,    setUploadError]    = React.useState(null);

  const uploadAsset = async (file, fieldKey) => {
    const setUploading = fieldKey === 'logoUrl' ? setUploadingLogo : setUploadingImage;
    setUploading(true);
    setUploadError(null);
    try {
      if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase not configured');
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `enquiries/${fieldKey}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('partner-assets')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('partner-assets').getPublicUrl(data.path);
      setForm(f => ({ ...f, [fieldKey]: urlData.publicUrl }));
    } catch (err) {
      setUploadError(
        `Upload unavailable — ${err.message || 'storage bucket not configured'}. Paste a URL instead.`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (step !== TOTAL_STEPS) return;
    if (!form.orgName || !form.contactName || !form.email || !form.promotionType || !form.preferredPlacement) return;
    setSubmitting(true); setSubmitError(null);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: dbErr } = await supabase.from('partner_enquiries').insert({
          organisation_name:    form.orgName,
          contact_name:         form.contactName,
          email:                form.email,
          phone:                form.phone             || null,
          website:              normalizeUrl(form.website),
          business_type:        form.businessType       || null,
          promotion_type:       form.promotionType      || null,
          advertising_interest: form.promotionType      || null,
          preferred_placement:  form.preferredPlacement || null,
          offer_title:          form.offerTitle         || null,
          offer_description:    form.offerDescription   || null,
          offer_category:       form.offerCategory      || null,
          target_county:        form.targetCounty       || null,
          county:               form.targetCounty       || null,
          target_area:          form.targetArea          || null,
          call_to_action:       form.callToAction        || null,
          logo_url:             normalizeUrl(form.logoUrl),
          image_url:            normalizeUrl(form.imageUrl),
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

      {/* ── 1. Hero ────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #080F24 0%, #0F1A3A 45%, #141D48 100%)',
        paddingTop: 72, paddingBottom: 80,
      }}>
        {/* Background atmosphere */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '10%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,92,245,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'center' }}>

            {/* Left — headline */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.28)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 24 }}>
                <Megaphone size={11} color="#FFD580" /> Advertising &amp; Sponsorship
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 0 22px', textWrap: 'balance' }}>
                Advertise to the<br />
                <span style={{ background: 'linear-gradient(90deg, #F5A623 0%, #FFD580 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>People Who Care</span><br />
                for Everyone Else.
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.60)', lineHeight: 1.78, margin: '0 0 36px', maxWidth: 480 }}>
                Reach carers, NHS staff, support workers and families through the UK's new lifestyle and support platform.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  onClick={() => scrollTo('interest-form')}
                  className="btn btn-gold btn-lg"
                  style={{ fontSize: 15, padding: '14px 30px', fontWeight: 800 }}
                >
                  Claim your spot <IArrow s={14} />
                </button>
                <button
                  onClick={() => scrollTo('pricing')}
                  style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                >
                  See pricing
                </button>
              </div>
              {/* Trust strip */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.09)' }}>
                {[
                  { icon: ShieldCheck, text: 'Values-led audience' },
                  { icon: MapPin,      text: '6 counties launching' },
                  { icon: Zap,         text: 'Founding rates open now' },
                ].map(({ icon: I, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                    <I size={14} color="rgba(255,255,255,0.38)" strokeWidth={2} /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — platform snapshot */}
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(14px)', borderRadius: 24, padding: '28px 26px', border: '1px solid rgba(255,255,255,0.11)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', marginBottom: 20 }}>
                Platform at a glance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                {[
                  { n: '1 in 8',  l: 'UK workers is an unpaid carer',    color: '#FFD580' },
                  { n: '6',       l: 'Counties in the first wave',         color: '#67E8F9' },
                  { n: '333+',    l: 'Mapped walk routes live',            color: '#86EFAC' },
                  { n: 'Free',    l: 'For carers — always',               color: '#C4B5FD' },
                ].map(({ n, l, color }) => (
                  <div key={l} style={{ padding: '14px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 5 }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.44)', lineHeight: 1.45 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.24)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 6 }}>Founding partner offer</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3, marginBottom: 6 }}>Lock in launch rates before they close.</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>Limited county sponsor slots at introductory pricing. Cornwall is open now.</div>
              </div>
              <button
                onClick={() => scrollTo('interest-form')}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #F5A623, #D4AF37)', border: 'none', color: '#0F172A', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'opacity .14s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Register early interest <IArrow s={13} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Bridge — discount-first businesses ─────────────────────── */}
      <div style={{ background: 'rgba(245,166,35,0.07)', borderBottom: '1px solid rgba(245,166,35,0.14)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: '#92400E', lineHeight: 1.5, flex: 1 }}>
            <strong>Already offering a discount?</strong> Featured placement and sponsorship can help your offer reach more carers.
          </span>
          <button
            onClick={() => onNavigate('offer-a-discount')}
            style={{ fontSize: 12.5, fontWeight: 700, padding: '6px 14px', borderRadius: 8, background: 'rgba(245,166,35,0.16)', border: '1px solid rgba(245,166,35,0.30)', color: '#92400E', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Submit a discount offer instead →
          </button>
        </div>
      </div>

      {/* ── 2. Scarcity bar ────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(90deg, #1A1000 0%, #2A1A00 50%, #1A1000 100%)', padding: '18px 0', borderBottom: '1px solid rgba(245,166,35,0.20)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Crown size={14} color={GOLD} strokeWidth={2} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFD580' }}>One county sponsor per county.</span>
            <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)' }}>Cornwall is</span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#86EFAC' }}>now open.</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'inline-block', margin: '0 4px' }} />
            <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)' }}>Founding rates are limited.</span>
            <button
              onClick={() => scrollTo('interest-form')}
              style={{ fontSize: 12.5, fontWeight: 800, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.35)', color: GOLD, cursor: 'pointer', marginLeft: 6, transition: 'background .13s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.18)'; }}
            >
              Claim now →
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Why it works ────────────────────────────────────────── */}
      <section style={{ paddingTop: 80, paddingBottom: 80, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Why it works</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: NAVY, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              An audience that actually acts on recommendations
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.55)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Carers and care workers are loyal, engaged and deeply community-oriented. They trust the platforms that support them.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { Icon: ShieldCheck, color: '#0D9488', bg: 'rgba(13,148,136,0.09)', title: 'A trust audience',        desc: 'Carers seek reliable recommendations. A brand that appears here carries implicit community endorsement — not paid interruption.' },
              { Icon: HandHeart,   color: '#E11D48', bg: 'rgba(225,29,72,0.09)',  title: 'Community goodwill',      desc: 'Supporting carers is visible, positive brand action. Every placement signals values alignment — ideal for B2C and employer brands.' },
              { Icon: Target,      color: '#7B5CF5', bg: 'rgba(123,92,245,0.09)', title: 'Values-led users',        desc: 'Inspiring Carers attracts people motivated by care, wellness and community. They actively search for quality local services.' },
              { Icon: TrendingUp,  color: GOLD,      bg: 'rgba(245,166,35,0.10)', title: 'Local spend influence',   desc: 'Carers make household and personal spending decisions. Reaching them at the point of local discovery drives real-world footfall and revenue.' },
              { Icon: Zap,         color: '#2563EB', bg: 'rgba(37,99,235,0.09)',  title: 'Repeat visibility',      desc: 'This is not a one-time ad click. Featured partners appear across activity pages, map views and benefit feeds — sustained exposure for the same spend.' },
            ].map(({ Icon, color, bg, title, desc }) => (
              <div key={title} style={{ padding: '24px 22px', borderRadius: 20, background: '#FAFBFF', border: '1px solid #E8EEF8', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <IconBadge Icon={Icon} color={color} bg={bg} size={48} iconSize={22} />
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: NAVY, marginBottom: 7 }}>{title}</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.68, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ paddingTop: 80, paddingBottom: 80, background: '#F7F9FC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: NAVY, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Simple packages. Meaningful reach.
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.10)', border: '1px solid rgba(245,166,35,0.25)', fontSize: 12, fontWeight: 700, color: '#92400E', marginTop: 8 }}>
              <Clock size={13} color="#92400E" strokeWidth={2} /> Founding rates — held for early partners only
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, maxWidth: 1060, margin: '0 auto' }}>

            {/* Local Spotlight */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: '2px solid #E8EEF8', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.50)', marginBottom: 8 }}>Local Spotlight</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em' }}>£49</span>
                  <span style={{ fontSize: 14, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, margin: '8px 0 0' }}>
                  Perfect for local businesses, cafés, attractions and wellbeing providers wanting visible local reach.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {['Featured listing on discovery pages', 'Enhanced category visibility', 'Activity map inclusion', 'Offer card in For You section', 'Monthly reporting summary'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color="#16A34A" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} className="btn btn-navy" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                Register interest <IArrow s={13} />
              </button>
            </div>

            {/* County Sponsor — featured */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: `2px solid ${GOLD}66`, background: 'linear-gradient(160deg, #FFFDF5 0%, #FFFBF0 100%)', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', color: GOLD, border: '1px solid rgba(245,166,35,0.32)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Most popular
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.50)', marginBottom: 8 }}>County Sponsor</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em' }}>£199</span>
                  <span style={{ fontSize: 14, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, margin: '8px 0 0' }}>
                  Exclusive regional positioning. One sponsor per county — Cornwall founding slot available now.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {['Everything in Local Spotlight', 'Exclusive county-level branding', 'Top placement across all county pages', 'Co-branded county recognition', 'Priority campaign inclusion', 'Quarterly strategy call'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} className="btn btn-gold" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                Claim county slot <IArrow s={13} />
              </button>
            </div>

            {/* National Partner */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: '2px solid rgba(123,92,245,0.35)', background: 'linear-gradient(160deg, #F9F5FF 0%, #F2EEFF 100%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.50)', marginBottom: 8 }}>National Partner</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em' }}>£499</span>
                  <span style={{ fontSize: 14, color: 'rgba(26,39,68,0.50)', fontWeight: 600 }}>+/mo</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, margin: '8px 0 0' }}>
                  Multi-county visibility and national campaign presence. For employers, charities and national brands.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {['Featured across all active counties', 'National campaign placement', 'Priority discovery positioning', 'Bespoke co-branded campaigns', 'Direct analytics access', 'Dedicated account contact'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <CheckCircle2 size={15} color="#7B5CF5" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} style={{ marginTop: 'auto', width: '100%', padding: '11px 20px', borderRadius: 12, background: 'rgba(123,92,245,0.12)', border: '1px solid rgba(123,92,245,0.28)', color: '#7B5CF5', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Enquire now <IArrow s={13} />
              </button>
            </div>

            {/* Founding Partner */}
            <div style={{ padding: '28px 24px', borderRadius: 22, border: '2px solid rgba(14,165,233,0.30)', background: 'linear-gradient(160deg, #F0F9FF 0%, #E8F5FF 100%)', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(14,165,233,0.12)', color: '#0E7490', border: '1px solid rgba(14,165,233,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Limited
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.50)', marginBottom: 8 }}>Founding Partner</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', marginBottom: 4 }}>By invitation</div>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, margin: '8px 0 0' }}>
                  Shape the platform from the ground up. Founding partners lock in permanent discounted rates and gain early-access influence.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {['Locked founding rate — never increases', 'Input into platform direction', 'Co-founding partner status', 'All National Partner features', 'Logo on About page', '12-month minimum commitment'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>
                    <Star size={15} color="#0E7490" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />  {item}
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('interest-form')} style={{ marginTop: 'auto', width: '100%', padding: '11px 20px', borderRadius: 12, background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.28)', color: '#0E7490', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Express interest <IArrow s={13} />
              </button>
            </div>

          </div>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.38)', marginTop: 24 }}>
            All prices are indicative launch rates. Inventory not yet live — register now to be first.
          </p>
        </div>
      </section>

      {/* ── 5. Audience stats ──────────────────────────────────────── */}
      <section style={{ paddingTop: 72, paddingBottom: 72, background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10, color: 'rgba(255,255,255,0.50)' }}>The audience</div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px', lineHeight: 1.15 }}>
                7.5 million unpaid carers in the UK. Every one of them is a consumer.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, margin: '0 0 28px' }}>
                Carers are underserved, under-marketed to, and deeply loyal to brands that show they understand what caring actually costs.
              </p>
              <button
                onClick={() => scrollTo('interest-form')}
                className="btn btn-gold"
                style={{ fontSize: 14, padding: '12px 24px', fontWeight: 800 }}
              >
                Reach them first <IArrow s={13} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { n: '7.5m',  l: 'unpaid carers in the UK',        color: '#FFD580' },
                { n: '1 in 8', l: 'UK workers has caring responsibilities', color: '#67E8F9' },
                { n: '£132bn', l: 'value of unpaid care annually',  color: '#86EFAC' },
                { n: '600K',  l: 'carers leave work each year',     color: '#FCA5A5' },
              ].map(({ n, l, color }) => (
                <div key={l} style={{ padding: '20px 18px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.02em', marginBottom: 6 }}>{n}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.52)', lineHeight: 1.55, margin: 0 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Example placements ──────────────────────────────────── */}
      <section style={{ paddingTop: 80, paddingBottom: 80, background: '#F0F4FF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>How you appear</div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Your brand in front of carers every day
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(26,39,68,0.55)', maxWidth: 500, margin: 0 }}>
                These are illustrative previews. Your placement would look like this — reviewed and approved before going live.
              </p>
            </div>
            <button
              onClick={() => scrollTo('interest-form')}
              className="btn btn-navy"
              style={{ whiteSpace: 'nowrap', fontWeight: 800 }}
            >
              Get featured <IArrow s={13} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
            <PlacementCard name="Harbour Wellness Studio" category="Wellness &amp; relaxation" offer="25% off all treatments for Inspiring Carers members" note={null} color="#0D9488" bg="rgba(13,148,136,0.09)" Icon={HeartPulse} />
            <PlacementCard name="Meadow Family Days" category="Family days out" offer="Carer goes free with any full-price adult ticket" note={null} color="#7B5CF5" bg="rgba(123,92,245,0.09)" Icon={Waves} />
            <PlacementCard name="Bloom Café Collective" category="Food &amp; drink" offer="Free drink upgrade with your Inspiring Carers card" note={null} color="#D97706" bg="rgba(217,119,6,0.09)" Icon={Coffee} />
            <PlacementCard name="County sponsor space" category="County sponsorship — 1 slot" offer="Exclusive county-wide presence for your organisation" note="Cornwall founding slot open" color={GOLD} bg="rgba(245,166,35,0.09)" Icon={Crown} />
          </div>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(26,39,68,0.04)', border: '1px solid #DDE5F0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <BadgeCheck size={16} color="rgba(26,39,68,0.38)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.50)', margin: 0, lineHeight: 1.65 }}>
              Demo placements using fictional organisations. All partnerships reviewed before going live. No placement is published without admin approval.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Interest form ───────────────────────────────────────── */}
      <section id="interest-form" style={{ paddingTop: 72, paddingBottom: 88, background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ maxWidth: 640, margin: '0 auto' }}>

            <div style={{ marginBottom: 36 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Register interest</div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Claim your space on the platform
              </h2>
              <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.55)', margin: 0, lineHeight: 1.7 }}>
                Four quick steps. Founding rates guaranteed for early registrations.
              </p>
            </div>

            {submitted ? (
              <div style={{ padding: '52px 36px', borderRadius: 24, background: 'linear-gradient(160deg, #FFFDF5 0%, #FFFBF0 100%)', border: '1.5px solid rgba(245,166,35,0.25)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(245,166,35,0.12)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={30} color={GOLD} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 10 }}>
                  Thanks — we have received your advertising enquiry.
                </div>
                <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.75, margin: '0 0 28px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
                  We will review your details and may use them to prepare a draft profile, offer card or featured placement — before anything goes live.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setStep(1); }}
                  style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', color: '#92400E', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={e => e.preventDefault()} style={{ borderRadius: 24, border: '1px solid #E8EEF8', background: '#FFFFFF', overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,39,68,0.06)' }}>

                {/* Step progress bar */}
                <div style={{ padding: '22px 28px 20px', background: '#FAFBFF', borderBottom: '1px solid #EEF1F7' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {[['Organisation', 1], ['Offer', 2], ['Placement', 3], ['Assets', 4]].map(([label, sn], i, arr) => (
                      <React.Fragment key={sn}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 60 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 999, background: step > sn ? GOLD : step === sn ? NAVY : '#EEF1F7', display: 'grid', placeItems: 'center', border: step === sn ? `2px solid ${GOLD}` : 'none', transition: 'all .25s' }}>
                            {step > sn
                              ? <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
                              : <span style={{ fontSize: 12.5, fontWeight: 800, color: step === sn ? GOLD : 'rgba(26,39,68,0.35)' }}>{sn}</span>
                            }
                          </div>
                          <span style={{ fontSize: 11, fontWeight: step === sn ? 700 : 500, color: step === sn ? NAVY : step > sn ? 'rgba(26,39,68,0.55)' : 'rgba(26,39,68,0.35)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: step > sn ? GOLD : '#E8EEF8', marginTop: 15, transition: 'background .3s' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px 28px', background: 'rgba(245,166,35,0.05)', borderBottom: '1px solid rgba(245,166,35,0.12)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <BadgeCheck size={16} color={GOLD} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    This information helps us turn your enquiry into a profile, offer card or featured placement — everything is reviewed before anything goes live.
                  </p>
                </div>

                <div style={{ padding: '26px 28px 28px' }}>

                  {/* ── Step 1: Organisation ── */}
                  {step === 1 && (
                    <div style={{ display: 'grid', gap: 14 }}>
                      {[
                        { key: 'orgName',     label: 'Organisation name', placeholder: 'Your business or organisation name', type: 'text',  req: true  },
                        { key: 'contactName', label: 'Contact name',      placeholder: 'Your full name',                    type: 'text',  req: true  },
                        { key: 'email',       label: 'Email address',     placeholder: 'email@yourorganisation.com',        type: 'email', req: true  },
                        { key: 'phone',       label: 'Phone number',      placeholder: 'Optional',                          type: 'tel',   req: false },
                        { key: 'website',     label: 'Website',           placeholder: 'www.yourorganisation.com',          type: 'text',  req: false },
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
                  )}

                  {/* ── Step 2: Offer / promotion ── */}
                  {step === 2 && (
                    <div style={{ display: 'grid', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                          Promotion type<span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>
                        </label>
                        <select value={form.promotionType} onChange={set('promotionType')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle} required>
                          <option value="">Select promotion type</option>
                          {['Featured listing', 'Carer discount / offer', 'Activity promotion', 'County sponsorship', 'Campaign promotion', 'National partner', 'Founding partner', 'General partnership'].map(o => <option key={o} value={o}>{o}</option>)}
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
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Offer / advert description</label>
                        <textarea placeholder="Tell us what you would like carers to see, book, claim or know about." rows={4} value={form.offerDescription} onChange={set('offerDescription')} onFocus={onFocusField} onBlur={onBlurField} style={{ ...fieldStyle, resize: 'vertical' }} />
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Placement ── */}
                  {step === 3 && (
                    <div style={{ display: 'grid', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                          Preferred placement<span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>
                        </label>
                        <select value={form.preferredPlacement} onChange={set('preferredPlacement')} onFocus={onFocusField} onBlur={onBlurField} style={selectStyle} required>
                          <option value="">Select placement</option>
                          {['Things to Do page', 'For You / discounts page', 'County sponsor area', 'Featured partner panel', 'Business profile', 'National — all pages', 'Not sure yet'].map(o => <option key={o} value={o}>{o}</option>)}
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
                  )}

                  {/* ── Step 4: Assets & notes ── */}
                  {step === 4 && (
                    <div style={{ display: 'grid', gap: 18 }}>
                      <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', margin: 0, lineHeight: 1.6 }}>
                        Optional — upload a file or paste a URL. Helps us prepare your card faster.
                      </p>

                      {/* Logo field */}
                      {[
                        { fieldKey: 'logoUrl', label: 'Logo', placeholder: 'www.yoursite.com/logo.png', isUploading: uploadingLogo, previewW: 44, previewH: 44 },
                        { fieldKey: 'imageUrl', label: 'Profile / ad image', placeholder: 'www.yoursite.com/image.jpg', isUploading: uploadingImage, previewW: 80, previewH: 44 },
                      ].map(({ fieldKey, label, placeholder, isUploading, previewW, previewH }) => (
                        <div key={fieldKey}>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{label}</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder={placeholder}
                              value={form[fieldKey]}
                              onChange={set(fieldKey)}
                              onFocus={onFocusField}
                              onBlur={onBlurField}
                              style={{ ...fieldStyle, flex: 1 }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '11px 14px', borderRadius: 10, border: '1px solid #DDE5F0', background: '#F8FAFD', fontSize: 13, fontWeight: 600, color: 'rgba(26,39,68,0.58)', cursor: isUploading ? 'wait' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background .13s' }}
                              onMouseEnter={e => { if (!isUploading) e.currentTarget.style.background = '#EEF3FA'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFD'; }}
                            >
                              {isUploading ? <Clock size={14} color="rgba(26,39,68,0.48)" /> : <Upload size={14} color="rgba(26,39,68,0.48)" />}
                              {isUploading ? 'Uploading…' : 'Upload'}
                              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading}
                                onChange={e => { if (e.target.files?.[0]) uploadAsset(e.target.files[0], fieldKey); }}
                              />
                            </label>
                          </div>
                          {form[fieldKey] && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                              <img
                                src={normalizeUrl(form[fieldKey]) || ''}
                                alt={`${label} preview`}
                                style={{ width: previewW, height: previewH, objectFit: 'cover', borderRadius: 8, border: '1px solid #E0E7F0', background: '#FAFBFF' }}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span style={{ fontSize: 12, color: 'rgba(26,39,68,0.45)' }}>Preview</span>
                              <button type="button" onClick={() => setForm(f => ({ ...f, [fieldKey]: '' }))} style={{ fontSize: 12, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {uploadError && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.22)', fontSize: 13, color: '#92400E' }}>
                          {uploadError}
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Additional notes</label>
                        <textarea placeholder="Anything else we should know about your organisation, audience or goals." rows={4} value={form.description} onChange={set('description')} onFocus={onFocusField} onBlur={onBlurField} style={{ ...fieldStyle, resize: 'vertical' }} />
                      </div>
                    </div>
                  )}

                  {/* Submit error */}
                  {submitError && (
                    <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.20)', fontSize: 13, color: '#B91C1C' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    {step > 1 && (
                      <button type="button" onClick={prevStep} style={{ padding: '13px 20px', borderRadius: 11, background: '#F5F7FB', border: '1px solid #E0E7F0', color: NAVY, fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0, transition: 'background .13s' }} onMouseEnter={e => { e.currentTarget.style.background = '#EEF1F7'; }} onMouseLeave={e => { e.currentTarget.style.background = '#F5F7FB'; }}>
                        ← Back
                      </button>
                    )}
                    {step < TOTAL_STEPS ? (
                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!stepValid(step)}
                        style={{ flex: 1, padding: '13px 20px', borderRadius: 11, background: stepValid(step) ? 'linear-gradient(135deg, #F5A623, #D4AF37)' : 'rgba(26,39,68,0.07)', border: 'none', color: stepValid(step) ? '#0F172A' : 'rgba(26,39,68,0.32)', fontWeight: 800, fontSize: 15, cursor: stepValid(step) ? 'pointer' : 'not-allowed' }}
                        onMouseEnter={e => { if (stepValid(step)) e.currentTarget.style.opacity = '0.90'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        Continue →
                      </button>
                    ) : (
                      <button type="button" onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: '13px 20px', borderRadius: 11, background: submitting ? 'rgba(245,166,35,0.40)' : 'linear-gradient(135deg, #F5A623, #D4AF37)', border: 'none', color: '#0F172A', fontWeight: 800, fontSize: 15, cursor: submitting ? 'wait' : 'pointer', transition: 'opacity .14s' }} onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.90'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                        {submitting ? 'Sending…' : 'Submit enquiry'}
                      </button>
                    )}
                  </div>

                  {step < TOTAL_STEPS && !stepValid(step) && (
                    <p style={{ textAlign: 'center', fontSize: 12.5, color: '#B91C1C', marginTop: 8, marginBottom: 0 }}>
                      {stepHint(step)}
                    </p>
                  )}
                  {step === TOTAL_STEPS && (
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(26,39,68,0.38)', marginTop: 10, marginBottom: 0 }}>
                      Nothing is published automatically — everything is reviewed first.
                    </p>
                  )}


                </div>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.36)', marginTop: 18 }}>
              Prefer to make direct contact?{' '}
              <button onClick={() => onNavigate('business')} style={{ fontSize: 12.5, color: NAVY, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Use the business partner page
              </button>.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. Final CTA ───────────────────────────────────────────── */}
      <section style={{ paddingTop: 80, paddingBottom: 88, background: 'linear-gradient(150deg, #080F24 0%, #0F1A3A 55%, #141D48 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '10%', bottom: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.28)', fontSize: 11, fontWeight: 800, color: '#FFD580', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 20 }}>
              <Zap size={11} color="#FFD580" /> Limited founding slots
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
              Ready to reach the people who care for everyone else?
            </h2>
            <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, margin: '0 0 36px' }}>
              Cornwall is open now. Founding rates are limited. Be visible to a values-led audience before anyone else.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-gold btn-lg"
                onClick={() => scrollTo('interest-form')}
                style={{ fontSize: 15, padding: '15px 32px', fontWeight: 800 }}
              >
                Claim your space <IArrow s={14} />
              </button>
              <button
                onClick={() => onNavigate('business')}
                style={{ padding: '15px 26px', borderRadius: 12, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.88)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .14s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
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
