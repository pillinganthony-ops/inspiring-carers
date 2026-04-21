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

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        <div className="card" style={{ width: '100%', maxWidth: 480, padding: 40, borderRadius: 32 }}>
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
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Secure access</div>
              <h1 style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>Admin login</h1>
            </div>
          </div>

          <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.7, marginBottom: 28 }}>
            Sign in with your approved Supabase admin account to access the Cornwall Resource Finder dashboard.
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
                placeholder="admin@inspiring-carers.org"
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
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1A2744' }}>
                Password
              </label>
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
        </div>
      </div>
    </>
  );
};

export default LoginPage;
