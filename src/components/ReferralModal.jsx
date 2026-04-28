// ReferralModal — premium referral submission form.
// Shown only when the linked organisation has entitlement_status='active'
// AND referrals_enabled=true. Submits to listing_referrals table via RLS INSERT.
// Rendered via createPortal so parent card layout never clips the modal.

import React from 'react';
import { createPortal } from 'react-dom';
import supabase, { isSupabaseConfigured } from '../lib/supabaseClient.js';

const REFERRAL_TYPES = [
  { value: 'self',         label: 'Referring myself'  },
  { value: 'carer',        label: 'Carer / family'    },
  { value: 'professional', label: 'Professional'       },
  { value: 'other',        label: 'Other'              },
];

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 700,
  color: 'rgba(26,39,68,0.58)',
  marginBottom: 5,
};

const inputStyle = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid #E9EEF5',
  padding: '9px 12px',
  fontSize: 13.5,
  color: '#1A2744',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#FAFBFF',
};

const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={labelStyle}>{label}{required && ' *'}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ''}
      style={inputStyle}
    />
  </div>
);

const SectionLabel = ({ text }) => (
  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.36)', marginBottom: 10, marginTop: 4 }}>
    {text}
  </div>
);

const ReferralModal = ({ resourceId, orgProfileId, orgName, onClose }) => {
  const [referralType,    setReferralType]    = React.useState('');
  const [personName,      setPersonName]      = React.useState('');
  const [personEmail,     setPersonEmail]     = React.useState('');
  const [personPhone,     setPersonPhone]     = React.useState('');
  const [referredByName,  setReferredByName]  = React.useState('');
  const [referredByEmail, setReferredByEmail] = React.useState('');
  const [referredByPhone, setReferredByPhone] = React.useState('');
  const [relationship,    setRelationship]    = React.useState('');
  const [reason,          setReason]          = React.useState('');
  const [contactMethod,   setContactMethod]   = React.useState('');
  const [consent,         setConsent]         = React.useState(false);
  const [submitting,      setSubmitting]      = React.useState(false);
  const [submitted,       setSubmitted]       = React.useState(false);
  const [error,           setError]           = React.useState('');

  // Scroll lock
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isSelf = referralType === 'self';

  const handleSubmit = async () => {
    setError('');
    if (!referralType)          { setError('Please select a referral type.');         return; }
    if (!personName.trim())     { setError("Please enter the person's name.");         return; }
    if (!reason.trim())         { setError('Please provide a reason for referral.');  return; }
    if (!consent)               { setError('Please confirm consent before submitting.'); return; }

    setSubmitting(true);
    try {
      if (!isSupabaseConfigured() || !supabase) throw new Error('Service unavailable.');

      const { error: dbErr } = await supabase.from('listing_referrals').insert({
        resource_id:              resourceId    || null,
        organisation_profile_id:  orgProfileId  || null,
        referral_type:            referralType,
        person_name:              personName.trim(),
        person_email:             personEmail.trim()     || null,
        person_phone:             personPhone.trim()     || null,
        referred_by_name:         isSelf ? null : (referredByName.trim()  || null),
        referred_by_email:        isSelf ? null : (referredByEmail.trim() || null),
        referred_by_phone:        isSelf ? null : (referredByPhone.trim() || null),
        relationship_to_person:   isSelf ? null : (relationship.trim()    || null),
        reason_for_referral:      reason.trim(),
        preferred_contact_method: contactMethod.trim() || null,
        consent_confirmed:        true,
      });

      if (dbErr) throw dbErr;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not submit referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const markup = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(15,23,42,0.55)', display: 'grid', placeItems: 'center', padding: 16 }}
    >
      <div style={{ background: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.22)', position: 'relative' }}>
        {/* Accent header strip */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #2D9CDB, #7B5CF5)', borderRadius: '24px 24px 0 0', flexShrink: 0 }} />

        <div style={{ padding: '22px 26px 26px' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#2D9CDB', marginBottom: 4 }}>
                Make a referral
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', margin: 0, lineHeight: 1.2 }}>
                {orgName || 'This service'}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginLeft: 12 }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* Emergency warning */}
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 12.5, color: '#B91C1C', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
            Do not use this form in an emergency. Call 999 or 111.
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(16,185,129,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2744', marginBottom: 10 }}>Referral submitted</div>
              <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.60)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 24px' }}>
                The organisation will review and respond if appropriate. Thank you for using this service responsibly.
              </p>
              <button
                onClick={onClose}
                style={{ padding: '11px 32px', borderRadius: 12, background: '#1A2744', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              {/* Referral type */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Referral type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {REFERRAL_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setReferralType(value)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: referralType === value ? '2px solid #2D9CDB' : '1px solid #E9EEF5', background: referralType === value ? 'rgba(45,156,219,0.08)' : '#FAFBFF', color: '#1A2744', fontWeight: referralType === value ? 700 : 500, fontSize: 13.5, cursor: 'pointer', transition: 'all .12s' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Person section */}
              {referralType && (
                <>
                  <SectionLabel text={isSelf ? 'Your details' : 'About the person'} />
                  <Field label="Full name" value={personName} onChange={setPersonName} placeholder={isSelf ? 'Your name' : "Person's full name"} required />
                  <Field label="Email" value={personEmail} onChange={setPersonEmail} type="email" placeholder="Optional" />
                  <Field label="Phone" value={personPhone} onChange={setPersonPhone} placeholder="Optional" />

                  {/* Referred-by section — hidden for self */}
                  {!isSelf && (
                    <>
                      <SectionLabel text="About you (referrer)" />
                      <Field label="Your name" value={referredByName} onChange={setReferredByName} placeholder="Optional" />
                      <Field label="Your email" value={referredByEmail} onChange={setReferredByEmail} type="email" placeholder="Optional" />
                      <Field label="Your phone" value={referredByPhone} onChange={setReferredByPhone} placeholder="Optional" />
                      <Field label="Your relationship to the person" value={relationship} onChange={setRelationship} placeholder="e.g. Carer, social worker, GP" />
                    </>
                  )}

                  {/* Reason */}
                  <SectionLabel text="Details" />
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Reason for referral *</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Briefly describe why this referral is being made..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <Field label="Preferred contact method" value={contactMethod} onChange={setContactMethod} placeholder="e.g. Phone, email, letter — optional" />

                  {/* Consent */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 18, marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: '#2D9CDB' }}
                    />
                    <span style={{ fontSize: 13, color: 'rgba(26,39,68,0.68)', lineHeight: 1.55 }}>
                      I confirm I have permission to share this information, or I am referring myself.
                    </span>
                  </label>

                  {error && (
                    <div style={{ fontSize: 13, color: '#B91C1C', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', padding: '10px 14px', borderRadius: 10, marginBottom: 14, lineHeight: 1.5 }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 9 }}>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: '#1A2744', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity .14s' }}
                    >
                      {submitting ? 'Submitting…' : 'Submit referral'}
                    </button>
                    <button
                      onClick={onClose}
                      style={{ padding: '12px 20px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontWeight: 600, fontSize: 14, border: '1px solid #E9EEF5', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(markup, document.body);
};

export default ReferralModal;
