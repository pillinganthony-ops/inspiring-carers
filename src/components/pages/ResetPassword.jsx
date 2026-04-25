// Isolated password reset completion page.
// Rendered at /reset-password — completely separate from Login.
// Has no dependency on app-wide session state.

import React from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

const fld = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #E9EEF5',
  padding: '13px 14px',
  fontSize: 14,
  color: '#1A2744',
  background: '#FAFBFF',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

const ResetPassword = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!isSupabaseConfigured() || !supabase) { setError('Supabase is not configured.'); return; }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setNewPassword('');
      setConfirmPassword('');

      // Clear the recovery session — user must re-authenticate with their new password.
      await supabase.auth.signOut();

      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 40, borderRadius: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16,185,129,0.12)', display: 'grid', placeItems: 'center', color: '#10B981', flexShrink: 0 }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981', marginBottom: 4 }}>Secure reset</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A2744', margin: 0 }}>Set a new password</h1>
          </div>
        </div>

        {success ? (
          /* ── Success state ── */
          <>
            <div style={{ borderRadius: 16, border: '1px solid rgba(16,185,129,0.28)', background: 'rgba(16,185,129,0.06)', padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: '#0D7A55', fontSize: 15, marginBottom: 6 }}>Password updated</div>
              <div style={{ color: 'rgba(26,39,68,0.72)', fontSize: 14, lineHeight: 1.6 }}>
                Your password has been updated. You can now sign in with your new password.
              </div>
            </div>
            <button
              onClick={() => onNavigate('login')}
              style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg, #F5A623 0%, #D4A017 100%)', color: '#0F172A', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,166,35,0.3)' }}
            >
              Sign in now
            </button>
          </>
        ) : (
          /* ── Password form ── */
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                disabled={loading}
                style={fld}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                disabled={loading}
                style={fld}
              />
            </div>

            {error && (
              <div style={{ borderRadius: 14, border: '1px solid rgba(244,97,58,0.28)', background: 'rgba(244,97,58,0.05)', padding: 14, color: '#A03A2D', fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '14px', borderRadius: 16, background: loading ? '#E9EEF5' : 'linear-gradient(135deg, #F5A623 0%, #D4A017 100%)', color: loading ? 'rgba(26,39,68,0.4)' : '#0F172A', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'wait' : 'pointer', marginTop: 4, boxShadow: loading ? 'none' : '0 8px 24px rgba(245,166,35,0.3)', transition: 'all .15s' }}
            >
              {loading ? 'Saving…' : 'Save new password'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#EFF1F7' }} />
              <span style={{ color: 'rgba(26,39,68,0.6)', fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#EFF1F7' }} />
            </div>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{ padding: '13px 14px', borderRadius: 16, border: '1px solid #EFF1F7', background: '#FAFBFF', color: '#1A2744', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFBFF'; }}
            >
              Back to sign in
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
