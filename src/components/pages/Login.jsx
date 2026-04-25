// Admin login page for Supabase auth
// Routes to this page before accessing /admin

import React from 'react';
import Icons from '../Icons.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

const { IHub, IArrow } = Icons;

const ADMIN_EMAIL_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [resetting, setResetting] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);

  // Password reset completion
  const [recoveryMode, setRecoveryMode] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  const waitForSession = async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const { data } = await supabase.auth.getSession();
      if (data?.session) return data.session;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured. Contact your administrator.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (data?.session) {
        const hydratedSession = await waitForSession();
        const sessionToUse = hydratedSession || data.session;
        const signedInEmail = (sessionToUse.user.email || '').toLowerCase();
        let nextRoute = 'profile';

        if (ADMIN_EMAIL_ALLOWLIST.includes(signedInEmail)) nextRoute = 'admin';

        setSuccessMsg(`Login successful. Redirecting to ${nextRoute === 'admin' ? 'admin dashboard' : 'profile dashboard'}...`);
        onNavigate(nextRoute);
      }
    } catch (signInError) {
      setError(signInError?.message || 'Login failed due to a network or server error.');
    } finally {
      setLoading(false);
    }
  };

  // Detect recovery session from Supabase reset link.
  // Check hash on mount (Supabase may have already processed it) and listen
  // for PASSWORD_RECOVERY event for any subsequent auth state changes.
  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    if (window.location.hash.includes('type=recovery')) setRecoveryMode(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword) { setPasswordError('Please enter a new password.'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (!supabase) { setPasswordError('Supabase is not configured.'); return; }
    setPasswordLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err?.message || 'Could not update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured. Contact your administrator.');
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address above, then click Forgotten password.');
      return;
    }
    setResetting(true);
    setError('');
    setResetSent(false);
    try {
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
    } finally {
      // Always show the same message — never confirm whether an email exists.
      setResetSent(true);
      setResetting(false);
    }
  };

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="card" style={{ width: '100%', maxWidth: 480, padding: 40, borderRadius: 32 }}>
          {/* ── Password reset completion ─────────────────────────── */}
          {recoveryMode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16,185,129,0.12)', display: 'grid', placeItems: 'center', color: '#10B981' }}>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div className="eyebrow" style={{ color: '#10B981' }}>Secure reset</div>
                  <h1 style={{ marginTop: 6, fontSize: 26, fontWeight: 800 }}>Set a new password</h1>
                </div>
              </div>

              {passwordSuccess ? (
                <>
                  <div style={{ borderRadius: 14, border: '1px solid rgba(16,185,129,0.28)', background: 'rgba(16,185,129,0.06)', padding: 18, marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, color: '#0D7A55', fontSize: 15, marginBottom: 4 }}>Password updated</div>
                    <div style={{ color: 'rgba(26,39,68,0.72)', fontSize: 14, lineHeight: 1.6 }}>Your password has been updated. You can now sign in with your new password.</div>
                  </div>
                  <button
                    onClick={() => { setRecoveryMode(false); setPasswordSuccess(false); }}
                    className="btn btn-gold btn-lg"
                    style={{ width: '100%' }}
                  >
                    Sign in now
                  </button>
                </>
              ) : (
                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      disabled={passwordLoading}
                      style={{ width: '100%', borderRadius: 16, border: '1px solid #E9EEF5', padding: '13px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      disabled={passwordLoading}
                      style={{ width: '100%', borderRadius: 16, border: '1px solid #E9EEF5', padding: '13px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  {passwordError && (
                    <div style={{ borderRadius: 14, border: '1px solid rgba(244,97,58,0.28)', background: 'rgba(244,97,58,0.05)', padding: 14, color: '#A03A2D', fontSize: 14, fontWeight: 600 }}>
                      {passwordError}
                    </div>
                  )}
                  <button type="submit" disabled={passwordLoading} className="btn btn-gold btn-lg" style={{ marginTop: 4 }}>
                    {passwordLoading ? 'Saving…' : 'Save new password'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── Normal login form ─────────────────────────────────── */}
          {!recoveryMode && <>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(45,156,219,0.12)',
              display: 'grid', placeItems: 'center',
              color: '#2D9CDB',
            }}>
              <IHub s={32} />
            </div>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Professional access</div>
              <h1 style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>Claim or manage your organisation profile</h1>
            </div>
          </div>

          <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.7, marginBottom: 28 }}>
            For approved organisations, charities, businesses and profile owners. Public visitors can browse the directory freely — no account needed.
          </p>

          {!isSupabaseConfigured() ? (
            <div style={{
              borderRadius: 18,
              border: '1px solid rgba(244,97,58,0.28)',
              background: 'rgba(244,97,58,0.05)',
              padding: 18,
              marginBottom: 24,
            }}>
              <div style={{ fontWeight: 700, color: '#A03A2D', marginBottom: 8 }}>Supabase not configured</div>
              <div style={{ color: 'rgba(26,39,68,0.7)', fontSize: 14 }}>
                Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@yourorganisation.org"
                required
                disabled={loading || !isSupabaseConfigured()}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: '1px solid #E9EEF5',
                  padding: '13px 14px',
                  fontSize: 14,
                  color: '#1A2744',
                  background: '#FAFBFF',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#1A2744' }}>Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting || !isSupabaseConfigured()}
                  style={{ fontSize: 13, color: '#2D9CDB', fontWeight: 600, background: 'none', border: 'none', cursor: resetting ? 'wait' : 'pointer', padding: 0 }}
                >
                  {resetting ? 'Sending…' : 'Forgotten password?'}
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || !isSupabaseConfigured()}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: '1px solid #E9EEF5',
                  padding: '13px 14px',
                  fontSize: 14,
                  color: '#1A2744',
                  background: '#FAFBFF',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {error ? (
              <div style={{
                borderRadius: 14,
                border: '1px solid rgba(244,97,58,0.28)',
                background: 'rgba(244,97,58,0.05)',
                padding: 14,
                color: '#A03A2D',
                fontSize: 14,
                fontWeight: 600,
              }}>
                {error}
              </div>
            ) : null}

            {successMsg ? (
              <div style={{
                borderRadius: 14,
                border: '1px solid rgba(91,201,74,0.28)',
                background: 'rgba(91,201,74,0.05)',
                padding: 14,
                color: '#2D6B1F',
                fontSize: 14,
                fontWeight: 600,
              }}>
                {successMsg}
              </div>
            ) : null}

            {resetSent && (
              <div style={{ borderRadius: 14, border: '1px solid rgba(45,156,219,0.28)', background: 'rgba(45,156,219,0.06)', padding: 14, color: '#1c78b5', fontSize: 14, fontWeight: 600 }}>
                If this email is linked to an account, a password reset link has been sent. Check your inbox.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured()}
              className="btn btn-gold btn-lg"
              style={{ marginTop: 8 }}
            >
              {loading ? 'Signing in...' : 'Sign in securely'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#EFF1F7' }} />
            <span style={{ color: 'rgba(26,39,68,0.6)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#EFF1F7' }} />
          </div>

          <button
            onClick={() => onNavigate('home')}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '13px 14px',
              borderRadius: 16,
              border: '1px solid #EFF1F7',
              background: '#FAFBFF',
              color: '#1A2744',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EFF1F7'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FAFBFF'}
          >
            Back to home
            <IArrow s={14} />
          </button>

          </>}{/* end !recoveryMode */}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
