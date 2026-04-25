// Claim This Listing modal — inserts into listing_claims (anon-safe table).
// venue_claims (from venues schema) requires auth.uid() — NOT used here.
// TODO: Admin claim review dashboard for listing_claims queue.

import React from 'react';
import supabase, { isSupabaseConfigured } from '../lib/supabaseClient.js';

const fld = {
  width: '100%', borderRadius: 10, border: '1px solid #E9EEF5',
  padding: '10px 13px', fontSize: 13.5, color: '#1A2744',
  background: '#FAFBFF', boxSizing: 'border-box', fontFamily: 'inherit',
};

const ClaimModal = ({ venue, onClose }) => {
  const [form, setForm] = React.useState({
    name: '', email: '', org: '', role: '', message: '', phone: '',
  });
  const [busy,  setBusy]  = React.useState(false);
  const [done,  setDone]  = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())    return 'Please enter your name.';
    if (!form.email.trim())   return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                              return 'Please enter a valid email address.';
    if (!form.org.trim())     return 'Please enter your organisation name.';
    if (!form.role.trim())    return 'Please describe your role or connection to this venue.';
    if (!form.message.trim()) return 'Please explain why you are claiming this listing.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validErr = validate();
    if (validErr) { setError(validErr); return; }

    if (!isSupabaseConfigured() || !supabase) {
      setError('Database not available. Please try again later.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('listing_claims').insert({
        listing_id:    null,                    // venues table ≠ resources table — no FK
        listing_slug:  venue.slug  || null,
        listing_title: venue.name  || null,
        full_name:     form.name.trim(),
        email:         form.email.trim(),
        org_name:      form.org.trim()   || null,
        role:          form.role.trim(),
        relationship:  form.role.trim(),        // NOT NULL column — same value as role
        reason:        form.message.trim(),
        phone:         form.phone.trim() || null,
        status:        'pending',
      });
      if (dbErr) throw dbErr;
      setDone(true);
    } catch (err) {
      setError(err.message || 'We couldn\'t submit your claim. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(15,23,42,0.55)', display: 'grid', placeItems: 'center', padding: 16 }}
    >
      <div style={{ background: 'white', borderRadius: 22, padding: '26px 24px', width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(15,23,42,0.22)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: 16, top: 16, width: 32, height: 32, borderRadius: 999, border: '1px solid #EEF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          aria-label="Close"
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>

        {done ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(13,148,136,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: '#0D9488' }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="m5 12 5 5L20 7"/></svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>Claim submitted</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.6, marginBottom: 18, maxWidth: 340, margin: '0 auto 18px' }}>
              We'll review it and contact you if we need more information.
            </p>
            <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, background: '#0D9488', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ) : (
          /* ── Claim form ── */
          <>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(26,39,68,0.40)', marginBottom: 4 }}>
              Venue claim
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1A2744', marginBottom: 4 }}>Claim this listing</h3>
            <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.55)', lineHeight: 1.6, marginBottom: 6 }}>
              <strong style={{ color: '#1A2744' }}>{venue.name}</strong>
              {venue.town ? <span style={{ color: 'rgba(26,39,68,0.45)' }}> · {venue.town}</span> : null}
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.50)', lineHeight: 1.55, marginBottom: 18, padding: '8px 12px', borderRadius: 8, background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.14)' }}>
              Claims are reviewed before any changes go live. Submitting a claim does not grant immediate access.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Your name *</label>
                  <input value={form.name} onChange={set('name')} required placeholder="Full name" style={fld} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Email address *</label>
                  <input value={form.email} onChange={set('email')} type="email" required placeholder="you@example.com" style={fld} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Organisation name *</label>
                <input value={form.org} onChange={set('org')} required placeholder="Organisation or business name" style={fld} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Your role *</label>
                <input value={form.role} onChange={set('role')} required placeholder="e.g. owner, manager, staff, trustee" style={fld} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Why are you claiming this listing? *</label>
                <textarea
                  value={form.message} onChange={set('message')} required rows={3}
                  placeholder="Briefly explain your connection to this venue and what you'd like to update."
                  style={{ ...fld, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.65)', display: 'block', marginBottom: 4 }}>Phone <span style={{ fontWeight: 400, color: 'rgba(26,39,68,0.38)' }}>(optional)</span></label>
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="Contact number" style={fld} />
              </div>

              {error && (
                <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
                <button
                  type="submit" disabled={busy}
                  style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: busy ? '#ccc' : '#0D9488', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: busy ? 'wait' : 'pointer' }}
                >
                  {busy ? 'Submitting…' : 'Submit claim'}
                </button>
                <button
                  type="button" onClick={onClose}
                  style={{ padding: '11px 16px', borderRadius: 10, background: '#F5F7FB', color: '#1A2744', fontSize: 14, fontWeight: 600, border: '1px solid #E9EEF5', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimModal;
