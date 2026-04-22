import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const resolveRuntimeConfig = () => {
  const runtimeRaw = typeof window !== 'undefined' ? (window.__IC_ENV__ || window.__ENV__ || {}) : {};
  if (typeof runtimeRaw === 'string') {
    try {
      return JSON.parse(runtimeRaw);
    } catch {
      return {};
    }
  }
  return runtimeRaw && typeof runtimeRaw === 'object' ? runtimeRaw : {};
};

const pickEnv = (...values) => {
  for (const value of values) {
    const text = `${value || ''}`.trim();
    if (!text) continue;
    if (['undefined', 'null', 'false'].includes(text.toLowerCase())) continue;
    return text;
  }
  return '';
};

const resolveSupabaseConfig = () => {
  const runtimeConfig = resolveRuntimeConfig();
  const supabaseUrl = pickEnv(
    env.VITE_SUPABASE_URL,
    env.VITE_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_URL,
    runtimeConfig.VITE_SUPABASE_URL,
    runtimeConfig.VITE_PUBLIC_SUPABASE_URL,
    runtimeConfig.NEXT_PUBLIC_SUPABASE_URL,
    runtimeConfig.SUPABASE_URL,
    runtimeConfig.PUBLIC_SUPABASE_URL,
  );

  const supabaseAnonKey = pickEnv(
    env.VITE_SUPABASE_ANON_KEY,
    env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    env.SUPABASE_ANON_KEY,
    runtimeConfig.VITE_SUPABASE_ANON_KEY,
    runtimeConfig.VITE_PUBLIC_SUPABASE_ANON_KEY,
    runtimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    runtimeConfig.SUPABASE_ANON_KEY,
    runtimeConfig.PUBLIC_SUPABASE_ANON_KEY,
  );

  return { supabaseUrl, supabaseAnonKey };
};

let supabase = null;
let cachedUrl = '';
let cachedAnonKey = '';

const ensureSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    supabase = null;
    cachedUrl = '';
    cachedAnonKey = '';
    return null;
  }

  if (supabase && cachedUrl === supabaseUrl && cachedAnonKey === supabaseAnonKey) {
    return supabase;
  }

  cachedUrl = supabaseUrl;
  cachedAnonKey = supabaseAnonKey;
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
};

export const isSupabaseConfigured = () => Boolean(ensureSupabaseClient());

ensureSupabaseClient();

export { supabase };
export { supabase as default };
