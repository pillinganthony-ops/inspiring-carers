// OfferADiscountPage — /offer-a-discount
// Primary business acquisition funnel: invite businesses to offer discounts/benefits to carers.
// Writes to partner_enquiries table — feeds directly into Admin Discount Leads pipeline.

import React from 'react';
import { ArrowRight, CheckCircle2, Users, HandHeart, Gift, Sparkles, ChevronDown, X } from 'lucide-react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

const NAVY = '#1A2744';
const GOLD = '#F5A623';

// ── UK counties / regions — clean canonical values for admin filtering ─────────
const UK_COUNTIES = [
  // — England —
  'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire',
  'Cheshire', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset', 'Durham',
  'East Riding of Yorkshire', 'East Sussex', 'Essex', 'Gloucestershire',
  'Greater London', 'Greater Manchester', 'Hampshire', 'Herefordshire',
  'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire', 'Leicestershire',
  'Lincolnshire', 'Merseyside', 'Norfolk', 'North Yorkshire', 'Northamptonshire',
  'Northumberland', 'Nottinghamshire', 'Oxfordshire', 'Rutland', 'Shropshire',
  'Somerset', 'South Yorkshire', 'Staffordshire', 'Suffolk', 'Surrey',
  'Tyne and Wear', 'Warwickshire', 'West Midlands', 'West Sussex',
  'West Yorkshire', 'Wiltshire', 'Worcestershire',
  // — Scotland —
  'Aberdeen City', 'Aberdeenshire', 'Angus', 'Argyll and Bute',
  'Clackmannanshire', 'Dumfries and Galloway', 'Dundee City', 'East Ayrshire',
  'East Dunbartonshire', 'East Lothian', 'East Renfrewshire', 'Edinburgh',
  'Falkirk', 'Fife', 'Glasgow City', 'Highland', 'Inverclyde', 'Midlothian',
  'Moray', 'North Ayrshire', 'North Lanarkshire', 'Orkney Islands',
  'Perth and Kinross', 'Renfrewshire', 'Scottish Borders', 'Shetland Islands',
  'South Ayrshire', 'South Lanarkshire', 'Stirling', 'West Dunbartonshire',
  'West Lothian', 'Western Isles',
  // — Wales —
  'Blaenau Gwent', 'Bridgend', 'Caerphilly', 'Cardiff', 'Carmarthenshire',
  'Ceredigion', 'Conwy', 'Denbighshire', 'Flintshire', 'Gwynedd',
  'Isle of Anglesey', 'Merthyr Tydfil', 'Monmouthshire', 'Neath Port Talbot',
  'Newport', 'Pembrokeshire', 'Powys', 'Rhondda Cynon Taf', 'Swansea',
  'Torfaen', 'Vale of Glamorgan', 'Wrexham',
  // — Northern Ireland —
  'Antrim', 'Armagh', 'Belfast', 'Down', 'Fermanagh', 'Londonderry / Derry', 'Tyrone',
  // — National —
  'UK-wide / National',
];

// ── CountySelect — premium searchable dropdown ────────────────────────────────
const CountySelect = ({ value, onChange, fldStyle }) => {
  const [open,   setOpen]   = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef(null);
  const searchRef    = React.useRef(null);

  const filtered = React.useMemo(() =>
    UK_COUNTIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  // Close on outside click / focusout
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Auto-focus search field when dropdown opens
  React.useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 10);
  }, [open]);

  const select = (county) => { onChange(county); setOpen(false); setSearch(''); };
  const clear  = (e)      => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(o => !o)}
        style={{
          ...fldStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          cursor: 'pointer', userSelect: 'none',
          borderColor: open ? GOLD : '#E0E7F0',
          boxShadow: open ? '0 0 0 3px rgba(245,166,35,0.10)' : 'none',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value ? NAVY : 'rgba(26,39,68,0.38)', fontSize: 13.5 }}>
          {value || 'Type or select a county…'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {value && (
            <span
              onClick={clear}
              style={{ display: 'grid', placeItems: 'center', width: 18, height: 18, borderRadius: 999, background: 'rgba(26,39,68,0.10)', cursor: 'pointer' }}
            >
              <X size={10} color="rgba(26,39,68,0.55)" strokeWidth={2.5} />
            </span>
          )}
          <ChevronDown
            size={16}
            color="rgba(26,39,68,0.40)"
            strokeWidth={2}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .18s' }}
          />
        </span>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 300,
            background: 'white', borderRadius: 14, border: '1px solid #E0E7F0',
            boxShadow: '0 12px 40px rgba(26,39,68,0.16)',
            overflow: 'hidden',
          }}
        >
          {/* Search */}
          <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid #EEF1F7' }}>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search counties…"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '8px 11px',
                borderRadius: 8, border: '1px solid #E0E7F0', background: '#F8FAFD',
                fontSize: 13.5, color: NAVY, outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.10)'; }}
              onBlur={e  => { e.target.style.borderColor = '#E0E7F0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: 224, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 16px', fontSize: 13.5, color: 'rgba(26,39,68,0.44)', fontStyle: 'italic' }}>
                No matches for "{search}"
              </div>
            ) : filtered.map(county => {
              const isSelected = county === value;
              return (
                <button
                  key={county}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(county)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 14px',
                    fontSize: 13.5, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? GOLD : NAVY,
                    background: isSelected ? 'rgba(245,166,35,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F5F8FF'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {county}
                  {isSelected && <CheckCircle2 size={14} color={GOLD} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // 2-col grid that stacks below ~400px
  const twoCol = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 };

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
          <div style={{ textAlign: 'center', maxWidth: 560 }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'rgba(22,163,74,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: '#16A34A' }}>
              <CheckCircle2 size={36} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: GOLD, marginBottom: 12 }}>Received</div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 14 }}>
              Thank you — your offer has been received.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, marginBottom: 32 }}>
              We'll review it shortly and contact you if we need anything else.
            </p>

            {/* Secondary upsell CTA */}
            <div style={{ padding: '20px 24px', borderRadius: 16, background: 'white', border: '1px solid #EEF1F7', boxShadow: '0 2px 16px rgba(26,39,68,0.07)', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(245,166,35,0.10)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Sparkles size={18} color={GOLD} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
                    Interested in featured placement?
                  </div>
                  <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.6, marginBottom: 12 }}>
                    Get your offer seen by carers across your area with a featured listing, county sponsorship, or national partnership.
                  </div>
                  <button
                    onClick={() => onNavigate('advertise')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: NAVY, color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
                  >
                    See placement options <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('home')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, background: 'rgba(26,39,68,0.07)', color: NAVY, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
            >
              Back to home
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
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <button
              onClick={scrollToForm}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 34px', borderRadius: 12, background: 'linear-gradient(135deg, #F5A623, #D4AF37)', color: '#0F172A', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 14px 34px rgba(245,166,35,0.32)' }}
            >
              Submit a discount offer <ArrowRight size={18} />
            </button>
            {/* Microcopy under CTA */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', fontWeight: 500, letterSpacing: '0.01em' }}>
              Free to submit &nbsp;•&nbsp; No obligation &nbsp;•&nbsp; We review every offer personally
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Free to submit', 'We review every offer', 'Shared with carers in your area'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
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
              { Icon: Users,     color: '#2563EB', bg: 'rgba(37,99,235,0.08)', title: '7.5 million carers in the UK',       body: 'One in eight people is a carer. Your offer reaches a community that is everywhere.' },
              { Icon: HandHeart, color: '#D97706', bg: 'rgba(217,119,6,0.08)', title: 'Real people, real gratitude',        body: 'Carers remember the businesses that showed up for them. Loyalty follows kindness.' },
              { Icon: Gift,      color: '#16A34A', bg: 'rgba(22,163,74,0.08)', title: 'Free to offer, priceless to receive', body: 'You choose the offer. We handle the reach. There is no cost to submit.' },
            ].map(({ Icon, color, bg, title, body }) => (
              <div key={title} style={{ padding: '24px 20px', borderRadius: 18, background: 'white', border: '1px solid #EEF1F7', boxShadow: '0 2px 12px rgba(26,39,68,0.05)' }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: bg, display: 'grid', placeItems: 'center', marginBottom: 16 }}>
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
                <div style={twoCol}>
                  <div>
                    <Label>Organisation name *</Label>
                    <input value={form.orgName} onChange={set('orgName')} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Harbour Spa" style={fld} />
                  </div>
                  <div>
                    <Label>Contact name *</Label>
                    <input value={form.contactName} onChange={set('contactName')} onFocus={onFocus} onBlur={onBlur} placeholder="Your full name" style={fld} />
                  </div>
                </div>
                <div style={twoCol}>
                  <div>
                    <Label>Email address *</Label>
                    <input value={form.email} onChange={set('email')} onFocus={onFocus} onBlur={onBlur} type="email" placeholder="you@example.com" style={fld} />
                  </div>
                  <div>
                    <Label optional>Phone</Label>
                    <input value={form.phone} onChange={set('phone')} onFocus={onFocus} onBlur={onBlur} placeholder="01234 567890" style={fld} />
                  </div>
                </div>
                <div style={twoCol}>
                  <div>
                    <Label>County / area *</Label>
                    <CountySelect
                      value={form.county}
                      onChange={val => setForm(f => ({ ...f, county: val }))}
                      fldStyle={fld}
                    />
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
                <div style={twoCol}>
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
                <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.56)', marginBottom: 12, lineHeight: 1.6, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,166,35,0.06)', borderLeft: `3px solid ${GOLD}` }}>
                  Carers give so much to others. Tell us why your business wants to give something back.
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

              {/* Microcopy under submit */}
              <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12.5, color: 'rgba(26,39,68,0.40)', lineHeight: 1.6 }}>
                {isValid
                  ? 'Free to submit • No obligation • We review every offer personally'
                  : 'Please complete all required fields marked *'}
              </div>
            </form>
          </div>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(26,39,68,0.36)', lineHeight: 1.6, padding: '0 8px' }}>
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
