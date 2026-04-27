// OfferADiscountPage — /offer-a-discount
// Primary business acquisition funnel: invite businesses to offer discounts/benefits to carers.
// Writes to partner_enquiries table — feeds directly into Admin Discount Leads pipeline.

import React from 'react';
import { ArrowRight, CheckCircle2, Users, HandHeart, Gift } from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

const NAVY = '#1A2744';
const GOLD = '#F5A623';

const normalizeUrl = (value) => {
  if (!value) return null;
  const v = `${value}`.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

const OfferADiscountPage = ({ onNavigate, session }) => {
  const formRef = React.useRef(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const EMPTY = {
    orgName: '', contactName: '', email: '', phone: '',
    website: '', county: '', offerTitle: '', offerDescription: '',
    whySupportCarers: '', offerCategory: '', logoUrl: '',
  };
  const [form,       setForm]       = React.useState(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted,  setSubmitted]  = React.useState(false);
  const [error,      setError]      = React.useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fld = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10,
    border: '1px solid #E0E7F0', background: '#FFFFFF', fontSize: 13.5, color: NAVY,
    fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color .15s',
  };
  const onFocus = e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.10)'; };
  const onBlur  = e => { e.target.style.borderColor = '#E0E7F0'; e.target.style.boxShadow = 'none'; };

  const Label = ({ children, optional }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', marginBottom: 5 }}>
      {children}{optional && <span style={{ fontWeight: 500, opacity: 0.65 }}> (optional)</span>}
    </label>
  );

  const isValid = Boolean(
    form.orgName && form.contactName && form.email &&
    form.county && form.offerTitle && form.offerDescription && form.whySupportCarers
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: dbErr } = await supabase.from('partner_enquiries').insert({
          organisation_name:    form.orgName.trim(),
          contact_name:         form.contactName.trim(),
          email:                form.email.trim(),
          phone:                form.phone.trim()              || null,
          website:              normalizeUrl(form.website),
          target_county:        form.county.trim()             || null,
          target_area:          form.county.trim()             || null,
          offer_title:          form.offerTitle.trim()         || null,
          offer_description:    form.offerDescription.trim()   || null,
          offer_category:       form.offerCategory.trim()      || null,
          logo_url:             normalizeUrl(form.logoUrl),
          description:          form.whySupportCarers.trim()   || null,
          promotion_type:       'discount_offer',
          preferred_placement:  'discount_lead',
          source_page:          'offer-a-discount',
          admin_status:         'new',
          public_profile_ready: false,
        });
        if (dbErr) throw dbErr;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Something went wrong — please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Nav activePage="offer-a-discount" onNavigate={onNavigate} session={session} />
        <section style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)', padding: '60px 16px' }}>
          <div style={{ textAlign: 'center', maxWidth: 540 }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'rgba(22,163,74,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: '#16A34A' }}>
              <CheckCircle2 size={36} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 12 }}>Received</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 16 }}>Thank you for supporting carers</h1>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65 }}>
              Your discount offer has been received. We will review it and contact you if we need anything else.
            </p>
            <button
              onClick={() => onNavigate('home')}
              style={{ marginTop: 30, display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 26px', borderRadius: 12, background: NAVY, color: 'white', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer' }}
            >
              Back to home <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  // ── Main page ────────────────────────────────────────────────────────────────
  return (
    <>
      <Nav activePage="offer-a-discount" onNavigate={onNavigate} session={session} />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #1A2744 0%, #243158 100%)', color: 'white', paddingTop: 88, paddingBottom: 96 }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', display: 'grid', gap: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>
            For businesses &amp; organisations
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 62px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#FFFFFF', margin: 0, textWrap: 'balance' }}>
            Offer a Discount<br />to Carers
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto', textWrap: 'balance' }}>
            Support the people who care for everyone else by sharing a discount, offer or benefit with carers and care staff.
          </p>
          <div>
            <button
              onClick={scrollToForm}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 34px', borderRadius: 12, background: 'linear-gradient(135deg, #F5A623, #D4AF37)', color: '#0F172A', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 14px 34px rgba(245,166,35,0.32)' }}
            >
              Submit a discount offer <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Free to submit', 'We review every offer', 'Shared with carers in your area'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.58)', fontWeight: 600 }}>
                <CheckCircle2 size={13} color={GOLD} strokeWidth={2.5} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Emotional trust ──────────────────────────────────── */}
      <section style={{ paddingTop: 80, paddingBottom: 80, background: '#FAFBFF' }}>
        <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 14 }}>Why it matters</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.02em', textWrap: 'balance', margin: '0 auto', maxWidth: 600 }}>
              Businesses who support carers stand for something bigger.
            </h2>
            <p style={{ marginTop: 18, fontSize: 16.5, color: 'rgba(26,39,68,0.65)', lineHeight: 1.7, maxWidth: 560, margin: '18px auto 0', textWrap: 'balance' }}>
              Every discount tells carers they are seen, valued and appreciated. This is about community, gratitude and real social value — not just promotion.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { Icon: Users,      color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  title: '7.5 million carers in the UK',   body: 'One in eight people is a carer. Your offer reaches a community that is everywhere.' },
              { Icon: HandHeart,  color: '#D97706', bg: 'rgba(217,119,6,0.08)',  title: 'Real people, real gratitude',    body: 'Carers remember the businesses that showed up for them. Loyalty follows kindness.' },
              { Icon: Gift,       color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  title: 'Free to offer, priceless to receive', body: 'You choose the offer. We handle the reach. There is no cost to submit.' },
            ].map(({ Icon, color, bg, title, body }) => (
              <div key={title} style={{ padding: '24px 20px', borderRadius: 18, background: 'white', border: '1px solid #EEF1F7', boxShadow: '0 2px 12px rgba(26,39,68,0.05)' }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: bg, display: 'grid', placeItems: 'center', marginBottom: 16, flexShrink: 0 }}>
                  <Icon size={22} color={color} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.60)', lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Form ─────────────────────────────────────────────── */}
      <section ref={formRef} style={{ paddingTop: 80, paddingBottom: 110, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 42 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 12 }}>Submit your offer</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>Tell us about your discount</h2>
            <p style={{ marginTop: 10, fontSize: 14.5, color: 'rgba(26,39,68,0.56)', lineHeight: 1.6 }}>Takes about 3 minutes. We review every submission.</p>
          </div>

          <div style={{ background: 'white', borderRadius: 24, padding: '36px 32px', boxShadow: '0 8px 40px rgba(26,39,68,0.09)', border: '1px solid #EEF1F7' }}>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gap: 0 }}>

              {/* Section A: Organisation */}
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>About your organisation</div>
              <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label>Organisation name *</Label>
                    <input value={form.orgName} onChange={set('orgName')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Harbour Spa" style={fld} />
                  </div>
                  <div>
                    <Label>Contact name *</Label>
                    <input value={form.contactName} onChange={set('contactName')} onFocus={onFocus} onBlur={onBlur} placeholder="Your full name" style={fld} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label>Email address *</Label>
                    <input value={form.email} onChange={set('email')} onFocus={onFocus} onBlur={onBlur} type="email" placeholder="you@example.com" style={fld} />
                  </div>
                  <div>
                    <Label optional>Phone</Label>
                    <input value={form.phone} onChange={set('phone')} onFocus={onFocus} onBlur={onBlur} placeholder="01234 567890" style={fld} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label>County / area *</Label>
                    <input value={form.county} onChange={set('county')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Cornwall" style={fld} />
                  </div>
                  <div>
                    <Label optional>Website</Label>
                    <input value={form.website} onChange={set('website')} onFocus={onFocus} onBlur={onBlur} placeholder="www.example.com" style={fld} />
                  </div>
                </div>
              </div>

              {/* Section B: Offer */}
              <div style={{ height: 1, background: '#EEF1F7', marginBottom: 24 }} />
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>Your offer for carers</div>
              <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                <div>
                  <Label>Offer title *</Label>
                  <input value={form.offerTitle} onChange={set('offerTitle')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. 20% off all treatments for carers" style={fld} />
                </div>
                <div>
                  <Label>Offer description *</Label>
                  <textarea value={form.offerDescription} onChange={set('offerDescription')} onFocus={onFocus} onBlur={onBlur} rows={3} placeholder="Tell us what the offer includes, any terms, and how carers can claim it." style={{ ...fld, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label optional>Offer category</Label>
                    <select value={form.offerCategory} onChange={set('offerCategory')} onFocus={onFocus} onBlur={onBlur} style={{ ...fld, cursor: 'pointer' }}>
                      <option value="">Select a category…</option>
                      <option>Wellbeing &amp; health</option>
                      <option>Food &amp; drink</option>
                      <option>Leisure &amp; activities</option>
                      <option>Retail &amp; shopping</option>
                      <option>Services &amp; trades</option>
                      <option>Training &amp; education</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <Label optional>Logo URL</Label>
                    <input value={form.logoUrl} onChange={set('logoUrl')} onFocus={onFocus} onBlur={onBlur} placeholder="www.example.com/logo.png" style={fld} />
                  </div>
                </div>
              </div>

              {/* Section C: Why support carers */}
              <div style={{ height: 1, background: '#EEF1F7', marginBottom: 24 }} />
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 6 }}>
                  Why do you want to support carers? *
                </div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.54)', marginBottom: 10, lineHeight: 1.55 }}>
                  Tell us the story, values or personal reason behind your offer.
                </div>
                <textarea
                  value={form.whySupportCarers}
                  onChange={set('whySupportCarers')}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  rows={5}
                  placeholder="Tell us the story, values or personal reason behind your offer."
                  style={{ ...fld, resize: 'vertical' }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom: 16, padding: '11px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.07)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                style={{
                  width: '100%', padding: '15px 24px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none',
                  background: isValid && !submitting ? 'linear-gradient(135deg, #1A2744, #2D3E6B)' : 'rgba(26,39,68,0.10)',
                  color: isValid && !submitting ? 'white' : 'rgba(26,39,68,0.30)',
                  cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit discount offer'}
                {!submitting && isValid && <ArrowRight size={18} />}
              </button>

              {!isValid && (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.38)' }}>
                  Please complete all required fields marked *
                </div>
              )}
            </form>
          </div>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.40)', lineHeight: 1.6 }}>
            By submitting you agree to us contacting you about your offer. We will never share your details without your permission.
          </p>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

window.OfferADiscountPage = OfferADiscountPage;
export default OfferADiscountPage;
