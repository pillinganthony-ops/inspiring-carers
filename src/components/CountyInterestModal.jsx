// CountyInterestModal — county launch interest capture.
// Renders a "Register interest" button + modal form.
// Inserts into resource_update_submissions with update_type='county_interest'.
// No SQL required: public insert RLS on resource_update_submissions allows anon + authenticated.

import React from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const ROLE_OPTIONS = [
  { value: '',                             label: 'Select role (optional)' },
  { value: 'Carer',                        label: 'Carer' },
  { value: 'Health & social care worker',  label: 'Health & social care worker' },
  { value: 'Organisation',                 label: 'Organisation' },
  { value: 'Business',                     label: 'Business' },
  { value: 'Family member',                label: 'Family member' },
  { value: 'Other',                        label: 'Other' },
];

const inp = {
  width: '100%', minWidth: 0, borderRadius: 12, border: '1px solid #E9EEF5',
  padding: '11px 14px', fontSize: 14, color: '#1A2744',
  background: '#FAFBFF', boxSizing: 'border-box', fontFamily: 'inherit',
};

const CountyInterestModal = ({ county, label, sourcePage }) => {
  const [open,    setOpen]    = React.useState(false);
  const [email,   setEmail]   = React.useState('');
  const [name,    setName]    = React.useState('');
  const [role,    setRole]    = React.useState('');
  const [message, setMessage] = React.useState('');
  const [busy,    setBusy]    = React.useState(false);
  const [done,    setDone]    = React.useState(false);
  const [error,   setError]   = React.useState('');

  const reset = () => {
    setEmail(''); setName(''); setRole(''); setMessage('');
    setError(''); setBusy(false); setDone(false);
  };
  const handleOpen  = () => { reset(); setOpen(true); };
  const handleClose = () => { setOpen(false); reset(); };

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isSupabaseConfigured() || !supabase) {
      setError('Connection unavailable — please try again later.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('resource_update_submissions').insert({
        update_type:     'county_interest',
        description:     message.trim() || `County interest registration: ${label}`,
        submitter_name:  name.trim()    || null,
        submitter_email: email.trim(),
        status:          'pending',
        payload: { county, source_page: sourcePage, role: role || null },
      });
      if (dbErr) throw dbErr;
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong — please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={handleOpen}
        style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: '#1A2744', color: 'white', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', transition: 'opacity .13s' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Register interest
      </button>
      <p style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.48)', margin: '6px 0 0', lineHeight: 1.4, fontStyle: 'italic' }}>
        Be first to access support, events and local resources when we launch.
      </p>

      {/* Modal */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ background: 'white', borderRadius: 22, padding: '28px 26px', width: 'min(92vw, 460px)', boxSizing: 'border-box', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.22)', position: 'relative' }}>

            {/* Close */}
            <button
              onClick={handleClose}
              style={{ position: 'absolute', right: 16, top: 16, width: 32, height: 32, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18"/>
              </svg>
            </button>

            {done ? (
              /* Success */
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(16,185,129,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#10B981' }}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="m5 12 5 5L20 7"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>You're registered</h3>
                <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.62)', lineHeight: 1.6 }}>
                  Thanks — we'll let you know when {label} opens.
                </p>
                <button
                  onClick={handleClose}
                  style={{ marginTop: 18, padding: '10px 24px', borderRadius: 12, background: '#1A2744', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.42)', marginBottom: 5 }}>County launch interest</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 5 }}>Register for {label}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.58)', lineHeight: 1.55, marginBottom: 18 }}>
                  We'll let you know when support, events and local resources become available in {label}.
                </p>

                <div style={{ display: 'grid', gap: 10 }}>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address *" style={inp} />
                  <input value={name}  onChange={e => setName(e.target.value)}  placeholder="Your name (optional)"      style={inp} />
                  <select
                    value={role} onChange={e => setRole(e.target.value)}
                    style={{ ...inp, color: role ? '#1A2744' : 'rgba(26,39,68,0.42)', cursor: 'pointer' }}
                  >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Anything specific you're looking for? (optional)"
                    rows={3}
                    style={{ ...inp, resize: 'vertical' }}
                  />

                  {error && (
                    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13 }}>{error}</div>
                  )}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                    <button
                      type="button" onClick={handleSubmit} disabled={busy}
                      style={{ flex: 1, padding: '12px 18px', borderRadius: 12, background: '#1A2744', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.72 : 1 }}
                    >
                      {busy ? 'Registering…' : 'Register interest'}
                    </button>
                    <button
                      type="button" onClick={handleClose}
                      style={{ padding: '12px 16px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontSize: 14, fontWeight: 600, border: '1px solid #E9EEF5', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>

                  <p style={{ fontSize: 11, color: 'rgba(26,39,68,0.34)', margin: 0, textAlign: 'center' }}>
                    County: <strong>{label}</strong> · From: {sourcePage}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CountyInterestModal;
