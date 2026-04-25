import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

// Live DB uses individual _url columns, not a socials JSONB blob.
const PD_SOCIAL_COLUMNS = ['facebook_url','instagram_url','linkedin_url','youtube_url','tiktok_url','x_url','threads_url','whatsapp_url'];
const PD_SOCIAL_LABELS = { facebook_url:'Facebook', instagram_url:'Instagram', linkedin_url:'LinkedIn', youtube_url:'YouTube', tiktok_url:'TikTok', x_url:'X / Twitter', threads_url:'Threads', whatsapp_url:'WhatsApp' };
const PD_SOCIAL_PLACEHOLDERS = { facebook_url:'https://facebook.com/…', instagram_url:'https://instagram.com/…', linkedin_url:'https://linkedin.com/…', youtube_url:'https://youtube.com/@…', tiktok_url:'https://tiktok.com/@…', x_url:'https://x.com/…', threads_url:'https://threads.net/…', whatsapp_url:'+44 7700 000000 or wa.me/…' };

// Read a DB profile row into draft fields (handles both old and new column names).
const unpackProfileRow = (row) => {
  const base = {
    organisation_name: row?.organisation_name || row?.display_name || row?.name || '',
    short_bio: row?.short_bio || row?.bio || '',
    full_bio: row?.full_bio || '',
    contact_email: row?.contact_email || row?.email || '',
    contact_phone: row?.contact_phone || row?.phone || '',
    website_url: row?.website_url || row?.website || '',
    banner_url: row?.banner_url || row?.cover_image_url || '',
  };
  PD_SOCIAL_COLUMNS.forEach((col) => { base[col] = row?.[col] || ''; });
  return base;
};

// Build the flat social columns for the DB payload (null-ifies empty strings).
const buildPdSocialPayload = (draft) => {
  const out = {};
  PD_SOCIAL_COLUMNS.forEach((col) => {
    const v = `${draft[col] || ''}`.trim();
    out[col] = v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null;
  });
  return out;
};

const emptyProfile = {
  id: null,
  organisation_name: '',
  slug: '',
  short_bio: '',
  full_bio: '',
  logo_url: '',
  banner_url: '',
  contact_email: '',
  contact_phone: '',
  website_url: '',
  resource_id: '',
  service_categories_text: '',
  areas_covered_text: '',
  is_active: true,
  ...Object.fromEntries(PD_SOCIAL_COLUMNS.map((col) => [col, ''])),
};

const emptyEvent = {
  id: null,
  title: '',
  slug: '',
  event_type: 'community meetup',
  description: '',
  location: '',
  starts_at: '',
  ends_at: '',
  cta_type: 'contact',
  booking_url: '',
  contact_email: '',
  status: 'scheduled',
};

const inputStyle = {
  width: '100%',
  borderRadius: 12,
  border: '1px solid #E9EEF5',
  padding: '10px 12px',
  fontSize: 14,
  color: '#1A2744',
  background: '#FAFBFF',
};

const slugify = (value) => `${value || ''}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ANALYTICS_WINDOWS = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
];

const getAnalyticsWindowDays = (windowKey) => ANALYTICS_WINDOWS.find((windowOption) => windowOption.key === windowKey)?.days ?? null;

const isWithinPastWindow = (value, windowKey) => {
  if (windowKey === 'all') return true;
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (getAnalyticsWindowDays(windowKey) || 0));
  return parsed >= start && parsed <= now;
};

const isWithinUpcomingWindow = (value, windowKey) => {
  if (windowKey === 'all') return true;
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + (getAnalyticsWindowDays(windowKey) || 0));
  return parsed >= now && parsed <= end;
};

const titleCase = (value) => `${value || ''}`
  .split(/[_\s-]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const getProfileDisplayName = (profile) => `${profile?.organisation_name || profile?.display_name || profile?.name || ''}`.trim();

const toSimpleEnquiryState = (value) => {
  const normalized = `${value || ''}`.trim().toLowerCase();
  if (normalized === 'contacted') return 'contacted';
  if (['confirmed', 'completed', 'cancelled', 'resolved'].includes(normalized)) return 'resolved';
  return 'new';
};

const fromSimpleEnquiryState = (value) => {
  if (value === 'resolved') return 'completed';
  if (value === 'contacted') return 'contacted';
  return 'new';
};

const UpgradeEnquiryModal = ({ upgradeTitle, orgName, userEmail, onClose, onSuccess }) => {
  const fld = { width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '11px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', boxSizing: 'border-box', fontFamily: 'inherit' };
  const [form, setForm] = React.useState({ name: '', email: userEmail || '', org: orgName || '', message: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Please enter your name and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!supabase) { setError('Database unavailable. Please try again later.'); return; }
    setBusy(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('resource_update_submissions').insert({
        organisation_name: form.org.trim() || 'Not specified',
        submitter_name: form.name.trim(),
        submitter_email: form.email.trim(),
        reason: [`Upgrade enquiry: ${upgradeTitle}`, form.message.trim()].filter(Boolean).join('\n\n'),
        status: 'pending',
        update_type: 'upgrade_enquiry',
      });
      if (dbErr) throw dbErr;
      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.52)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '28px 26px', width: '100%', maxWidth: 460, boxShadow: '0 40px 80px rgba(15,23,42,0.22)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B45309', marginBottom: 6 }}>Upgrade enquiry</div>
        <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1A2744', margin: 0 }}>{upgradeTitle}</h3>
        <p style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.64)', lineHeight: 1.6, marginBottom: 18 }}>
          Leave your details and the team will follow up within 48 hours to discuss options and pricing.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input value={form.name} onChange={set('name')} required placeholder="Your name *" style={fld} />
          <input value={form.email} onChange={set('email')} type="email" required placeholder="Email address *" style={fld} />
          <input value={form.org} onChange={set('org')} placeholder="Organisation name" style={fld} />
          <textarea value={form.message} onChange={set('message')} rows={3} placeholder="Anything you'd like to add (optional)" style={{ ...fld, resize: 'vertical' }} />
          {error && <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '12px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#F5A623,#D4A017)', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.75 : 1 }}>
              {busy ? 'Sending…' : 'Send enquiry'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontSize: 14, fontWeight: 600, border: '1px solid #E9EEF5', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfileDashboard = ({ onNavigate, session, section = 'dashboard' }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState('');

  const [profiles, setProfiles] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [claims, setClaims] = React.useState([]);
  const [viewEvents, setViewEvents] = React.useState([]);
  const [eventEnquiries, setEventEnquiries] = React.useState([]);
  const [analyticsNotice, setAnalyticsNotice] = React.useState('');

  const [upgradeEnquiryTarget, setUpgradeEnquiryTarget] = React.useState(null);
  const [activeProfileId, setActiveProfileId] = React.useState('');
  const [profileDraft, setProfileDraft] = React.useState(emptyProfile);
  const [resourceSlugMap, setResourceSlugMap] = React.useState({});
  const [eventDraft, setEventDraft] = React.useState(emptyEvent);
  const [analyticsWindow, setAnalyticsWindow] = React.useState('30d');
  const SECTION_TO_TAB = { dashboard: 'overview', organisation: 'profile', posts: 'events', enquiries: 'enquiries', settings: 'settings' };
  const [activeTab, setActiveTab] = React.useState(() => SECTION_TO_TAB[section] || 'overview');

  const userEmail = `${session?.user?.email || ''}`.trim().toLowerCase();

  // Admin check — same allowlist as Nav and main.jsx
  const PD_ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = Boolean(userEmail && PD_ADMIN_EMAILS.includes(userEmail));

  // Section routing
  const activeNavPage = { dashboard: 'profile', organisation: 'profile-org', posts: 'profile-posts', enquiries: 'profile-enquiries', settings: 'profile-settings' }[section] || 'profile';
  const showAll = section === 'dashboard';
  const showOrg = showAll || section === 'organisation';
  const showPosts = showAll || section === 'posts';
  const showEnquiries = showAll || section === 'enquiries';

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    onNavigate('home');
  };

  const loadData = React.useCallback(async () => {
    if (!session || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setAnalyticsNotice('');

    try {
      const [profilesResult, membershipResult, claimsResult, fallbackClaimsResult] = await Promise.all([
        // Primary path: profiles where this user's auth ID is the owner
        supabase.from('organisation_profiles').select('*').eq('created_by', session.user.id),
        // Secondary path: profiles linked via claim approval (organisation_profile_members)
        supabase.from('organisation_profile_members')
          .select('organisation_profile_id')
          .eq('owner_email', userEmail)
          .eq('status', 'active'),
        supabase.from('listing_claims').select('*').eq('email', userEmail).order('created_at', { ascending: false }),
        // Also load fallback claims that landed in resource_update_submissions
        supabase.from('resource_update_submissions').select('id, organisation_name, status, created_at, update_type, resource_id')
          .eq('submitter_email', userEmail).eq('update_type', 'claim_request').order('created_at', { ascending: false }),
      ]);

      // Load profiles found via member access that are not already in the created_by result
      const memberProfileIds = (membershipResult.data || [])
        .map((r) => r.organisation_profile_id).filter(Boolean);
      let memberProfiles = [];
      if (memberProfileIds.length) {
        const { data: memberProfileData } = await supabase
          .from('organisation_profiles').select('*').in('id', memberProfileIds);
        memberProfiles = memberProfileData || [];
      }

      const ownedById = new Set((profilesResult.data || []).map((p) => p.id));
      const allOwnedProfiles = [
        ...(profilesResult.data || []),
        ...memberProfiles.filter((p) => !ownedById.has(p.id)),
      ];
      const uniqueProfiles = Array.from(
        new Map(allOwnedProfiles.map((item) => [item.id, item])).values(),
      );

      // Self-link created_by for profiles found via member access but not yet linked.
      // Enables RLS for any write that checks auth.uid() = created_by directly.
      const needsLink = uniqueProfiles.filter((p) => !p.created_by && memberProfileIds.includes(p.id));
      if (needsLink.length && session?.user?.id) {
        await Promise.all(
          needsLink.map((p) =>
            supabase.from('organisation_profiles').update({ created_by: session.user.id }).eq('id', p.id),
          ),
        );
        needsLink.forEach((p) => { p.created_by = session.user.id; });
        console.info('[ProfileDashboard] self-linked created_by for', needsLink.length, 'profile(s)');
      }
      const initialProfileId = uniqueProfiles[0]?.id || '';

      let eventRows = [];
      let viewRows = [];
      let enquiryRows = [];
      if (uniqueProfiles.length) {
        const profileIds = uniqueProfiles.map((profile) => profile.id);
        const resourceIds = uniqueProfiles.map((profile) => profile.resource_id).filter(Boolean);
        const [eventsResult, enquiriesResult] = await Promise.all([
          supabase
            .from('organisation_events')
            .select('*')
            .in('organisation_profile_id', profileIds)
            .order('starts_at', { ascending: true }),
          supabase
            .from('organisation_event_enquiries')
            .select('*')
            .in('organisation_profile_id', profileIds)
            .order('created_at', { ascending: false }),
        ]);
        if (eventsResult.error) throw eventsResult.error;
        if (enquiriesResult.error) throw enquiriesResult.error;
        eventRows = eventsResult.data || [];
        enquiryRows = enquiriesResult.data || [];

        if (resourceIds.length) {
          const viewEventsResult = await supabase.from('resource_view_events').select('*').in('resource_id', resourceIds);
          if (viewEventsResult.error) {
            setAnalyticsNotice(`Analytics limited: profile views unavailable (${viewEventsResult.error.message}).`);
          } else {
            viewRows = viewEventsResult.data || [];
          }
        }
      }

      // Merge primary claims with fallback queue entries
      const primaryClaims = claimsResult.data || [];
      const fallbackClaims = (fallbackClaimsResult.data || []).map((row) => ({
        id: row.id,
        listing_title: `${row.organisation_name || ''}`.replace(/^\[CLAIM\]\s*/i, ''),
        org_name: `${row.organisation_name || ''}`.replace(/^\[CLAIM\]\s*/i, ''),
        status: row.status || 'pending',
        created_at: row.created_at,
        listing_id: row.resource_id || null,
        _source: 'resource_update_submissions',
      }));
      const primaryIds = new Set(primaryClaims.map((r) => String(r.id)));
      const allClaims = [...primaryClaims, ...fallbackClaims.filter((r) => !primaryIds.has(String(r.id)))];

      // Fetch slugs for linked resources so "View live listing" links work
      const linkedResourceIds = uniqueProfiles.map((p) => p.resource_id).filter(Boolean);
      let slugMap = {};
      if (linkedResourceIds.length) {
        const { data: resourceRows } = await supabase
          .from('resources')
          .select('id, slug')
          .in('id', linkedResourceIds);
        (resourceRows || []).forEach((r) => { slugMap[r.id] = r.slug; });
      }

      setProfiles(uniqueProfiles);
      setEvents(eventRows);
      setClaims(allClaims);
      setEventEnquiries(enquiryRows);
      setViewEvents(viewRows);
      setResourceSlugMap(slugMap);
      setActiveProfileId((current) => current || initialProfileId);

      const seedProfile = uniqueProfiles.find((profile) => profile.id === (activeProfileId || initialProfileId)) || uniqueProfiles[0] || null;
      if (seedProfile) {
        setProfileDraft({
          ...emptyProfile,
          id: seedProfile.id,
          slug: seedProfile.slug || '',
          logo_url: seedProfile.logo_url || '',
          resource_id: seedProfile.resource_id || '',
          service_categories_text: (seedProfile.service_categories || []).join(', '),
          areas_covered_text: (seedProfile.areas_covered || []).join(', '),
          is_active: seedProfile.is_active !== false,
          ...unpackProfileRow(seedProfile),
        });
      } else {
        setProfileDraft({ ...emptyProfile, contact_email: userEmail });
      }
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load profile dashboard.');
    } finally {
      setLoading(false);
    }
  }, [session, userEmail, activeProfileId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    const selected = profiles.find((profile) => profile.id === activeProfileId);
    if (!selected) return;
    setProfileDraft({
      ...emptyProfile,
      id: selected.id,
      slug: selected.slug || '',
      logo_url: selected.logo_url || '',
      resource_id: selected.resource_id || '',
      service_categories_text: (selected.service_categories || []).join(', '),
      areas_covered_text: (selected.areas_covered || []).join(', '),
      is_active: selected.is_active !== false,
      ...unpackProfileRow(selected),
    });
  }, [activeProfileId, profiles]);

  const activeEvents = React.useMemo(() => events.filter((event) => event.organisation_profile_id === activeProfileId), [events, activeProfileId]);
  const activeProfile = React.useMemo(() => profiles.find((profile) => profile.id === activeProfileId) || profiles[0] || null, [profiles, activeProfileId]);
  const latestClaim = claims[0] || null;
  const activeProfileViewEvents = React.useMemo(() => viewEvents.filter((entry) => `${entry.resource_id}` === `${activeProfile?.resource_id || ''}`), [viewEvents, activeProfile]);
  const activeProfileEnquiries = React.useMemo(() => eventEnquiries.filter((entry) => `${entry.organisation_profile_id}` === `${activeProfileId || activeProfile?.id || ''}`), [eventEnquiries, activeProfileId, activeProfile]);
  const filteredProfileViewEvents = React.useMemo(() => activeProfileViewEvents.filter((entry) => isWithinPastWindow(entry.created_at, analyticsWindow)), [activeProfileViewEvents, analyticsWindow]);
  const filteredProfileEnquiries = React.useMemo(() => activeProfileEnquiries.filter((entry) => isWithinPastWindow(entry.created_at, analyticsWindow)), [activeProfileEnquiries, analyticsWindow]);
  const filteredActiveEvents = React.useMemo(() => activeEvents.filter((event) => (event.status || 'scheduled') === 'scheduled' && isWithinUpcomingWindow(event.starts_at, analyticsWindow)), [activeEvents, analyticsWindow]);
  const dashboardKpis = React.useMemo(() => {
    const nowIso = new Date().toISOString();
    const upcoming = events.filter((event) => event.starts_at && event.starts_at >= nowIso && (event.status || 'scheduled') === 'scheduled').length;
    const completed = events.filter((event) => (event.status || '') === 'completed').length;
    const pendingClaims = claims.filter((claim) => (claim.status || 'pending') === 'pending').length;
    const approvedClaims = claims.filter((claim) => (claim.status || '') === 'approved').length;
    const activeEventsCount = events.filter((event) => (event.status || 'scheduled') === 'scheduled').length;
    const profileViews = viewEvents.length;
    const enquiryCount = eventEnquiries.length;
    return {
      profiles: profiles.length,
      events: events.length,
      upcoming,
      completed,
      pendingClaims,
      approvedClaims,
      activeEvents: activeEventsCount,
      profileViews,
      enquiryCount,
    };
  }, [profiles, events, claims, viewEvents, eventEnquiries]);

  const onboardingChecklist = React.useMemo(() => {
    const profile = activeProfile;
    const serviceCategories = profile?.service_categories || [];
    const checks = [
      {
        id: 'logo',
        label: 'Upload a recognisable logo',
        done: Boolean(profile?.logo_url?.trim()),
      },
      {
        id: 'description',
        label: 'Write a strong organisation description',
        done: Boolean(((profile?.short_bio || profile?.bio || '')).trim().length >= 60),
      },
      {
        id: 'categories',
        label: 'Set support categories',
        done: serviceCategories.length > 0,
      },
      {
        id: 'contact',
        label: 'Add contact email and phone',
        done: Boolean(
          (profile?.contact_email || profile?.email || '').trim() &&
          (profile?.contact_phone || profile?.phone || '').trim(),
        ),
      },
      {
        id: 'website',
        label: 'Add a website link',
        done: Boolean((profile?.website_url || profile?.website || '').trim()),
      },
      {
        id: 'event',
        label: 'Publish your first event',
        done: activeEvents.length > 0,
      },
    ];
    const completed = checks.filter((item) => item.done).length;
    return {
      checks,
      completed,
      total: checks.length,
      score: Math.round((completed / checks.length) * 100),
    };
  }, [activeProfile, activeEvents]);

  const profileStatus = React.useMemo(() => {
    const claimStatus = activeProfile?.claim_status || (latestClaim?.status === 'approved' ? 'claimed' : latestClaim?.status === 'pending' ? 'pending' : 'unclaimed');
    const verificationStatus = activeProfile?.verified_status || (claimStatus === 'claimed' ? 'claimed' : 'community');
    return {
      claimStatus,
      verificationStatus,
      featured: Boolean(activeProfile?.featured),
    };
  }, [activeProfile, latestClaim]);

  const entitlementState = React.useMemo(() => {
    return {
      packageName: activeProfile?.package_name || 'No package assigned',
      status: activeProfile?.entitlement_status || 'inactive',
      startDate: activeProfile?.start_date || null,
      endDate: activeProfile?.end_date || null,
      featuredEnabled: Boolean(activeProfile?.featured_enabled),
      eventQuota: Number.isFinite(Number(activeProfile?.event_quota)) ? Number(activeProfile.event_quota) : 0,
      enquiryToolsEnabled: Boolean(activeProfile?.enquiry_tools_enabled),
      analyticsEnabled: Boolean(activeProfile?.analytics_enabled),
    };
  }, [activeProfile]);

  const eventQuotaUsed = activeEvents.filter((event) => (event.status || 'scheduled') === 'scheduled').length;
  const remainingEventQuota = Math.max(0, entitlementState.eventQuota - eventQuotaUsed);
  const hasAnalyticsAccess = entitlementState.analyticsEnabled;
  const hasEnquiryToolsAccess = entitlementState.enquiryToolsEnabled;
  const hasFeaturedAccess = entitlementState.featuredEnabled;
  const eventQuotaReached = !eventDraft.id && entitlementState.eventQuota >= 0 && remainingEventQuota <= 0;

  const analyticsCards = React.useMemo(() => {
    return [
      ['Profile views', filteredProfileViewEvents.length],
      ['Event enquiries', filteredProfileEnquiries.length],
      ['Active events', filteredActiveEvents.length],
      ['Profile completion %', onboardingChecklist.score],
    ];
  }, [filteredProfileViewEvents, filteredProfileEnquiries, filteredActiveEvents, onboardingChecklist.score]);

  const enquiryPipeline = React.useMemo(() => {
    return {
      new: activeProfileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'new'),
      contacted: activeProfileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'contacted'),
      resolved: activeProfileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'resolved'),
    };
  }, [activeProfileEnquiries]);

  const updateEnquiryStatus = async (enquiryId, nextState) => {
    if (!supabase || !session || !enquiryId) return;
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('organisation_event_enquiries')
        .update({ status: fromSimpleEnquiryState(nextState) })
        .eq('id', enquiryId);
      if (updateError) throw updateError;
      setToast(`Enquiry moved to ${titleCase(nextState)}.`);
      await loadData();
    } catch (updateErr) {
      setError(updateErr?.message || 'Unable to update enquiry status.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!supabase || !session) return;
    if (!profileDraft.organisation_name.trim()) {
      setError('Organisation name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Only send fields an owner is allowed to write.
      // Premium/entitlement fields (featured, featured_enabled, analytics_enabled,
      // enquiry_tools_enabled, event_quota, package_name, entitlement_status,
      // start_date, end_date) are deliberately excluded — the DB trigger also
      // enforces this silently even if a caller tried to send them.
      const payload = {
        organisation_name: profileDraft.organisation_name.trim(),
        slug: slugify(profileDraft.slug || profileDraft.organisation_name),
        short_bio: profileDraft.short_bio?.trim() || null,
        full_bio: profileDraft.full_bio?.trim() || null,
        logo_url: profileDraft.logo_url?.trim() || null,
        banner_url: profileDraft.banner_url?.trim() || null,
        contact_email: profileDraft.contact_email?.trim() || userEmail,
        contact_phone: profileDraft.contact_phone?.trim() || null,
        website_url: profileDraft.website_url?.trim() || null,
        resource_id: profileDraft.resource_id || null,
        service_categories: (profileDraft.service_categories_text || '').split(',').map((s) => s.trim()).filter(Boolean),
        areas_covered: (profileDraft.areas_covered_text || '').split(',').map((s) => s.trim()).filter(Boolean),
        is_active: Boolean(profileDraft.is_active),
        updated_by: session.user.id,
        ...buildPdSocialPayload(profileDraft),
      };

      const result = profileDraft.id
        ? await supabase.from('organisation_profiles').update(payload).eq('id', profileDraft.id).select('id').single()
        : await supabase.from('organisation_profiles').insert({ ...payload, created_by: session.user.id }).select('id').single();

      if (result.error) throw result.error;
      setToast(profileDraft.id ? 'Profile updated.' : 'Profile created.');
      if (!profileDraft.id && result.data?.id) setActiveProfileId(result.data.id);
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (!supabase || !session || !activeProfileId) return;
    if (!eventDraft.title.trim() || !eventDraft.starts_at) {
      setError('Event title and start date are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        organisation_profile_id: activeProfileId,
        title: eventDraft.title.trim(),
        slug: slugify(eventDraft.slug || eventDraft.title),
        event_type: eventDraft.event_type,
        description: eventDraft.description?.trim() || null,
        location: eventDraft.location?.trim() || null,
        starts_at: eventDraft.starts_at,
        ends_at: eventDraft.ends_at || null,
        cta_type: eventDraft.cta_type,
        booking_url: eventDraft.booking_url?.trim() || null,
        contact_email: eventDraft.contact_email?.trim() || null,
        status: eventDraft.status,
        updated_by: session.user.id,
      };

      const result = eventDraft.id
        ? await supabase.from('organisation_events').update(payload).eq('id', eventDraft.id)
        : await supabase.from('organisation_events').insert({ ...payload, created_by: session.user.id });

      if (result.error) throw result.error;
      setEventDraft(emptyEvent);
      setToast(eventDraft.id ? 'Event updated.' : 'Event created.');
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const editEvent = (eventRow) => {
    setEventDraft({
      id: eventRow.id,
      title: eventRow.title || '',
      slug: eventRow.slug || '',
      event_type: eventRow.event_type || 'community meetup',
      description: eventRow.description || '',
      location: eventRow.location || '',
      starts_at: eventRow.starts_at ? eventRow.starts_at.slice(0, 16) : '',
      ends_at: eventRow.ends_at ? eventRow.ends_at.slice(0, 16) : '',
      cta_type: eventRow.cta_type || 'contact',
      booking_url: eventRow.booking_url || '',
      contact_email: eventRow.contact_email || '',
      status: eventRow.status || 'scheduled',
    });
  };

  const deleteEvent = async (eventId) => {
    if (!supabase || !eventId) return;
    setSaving(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('organisation_events').delete().eq('id', eventId);
      if (deleteError) throw deleteError;
      setToast('Event deleted.');
      if (eventDraft.id === eventId) setEventDraft(emptyEvent);
      await loadData();
    } catch (deleteErr) {
      setError(deleteErr?.message || 'Unable to delete event.');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <>
        <Nav activePage={activeNavPage} onNavigate={onNavigate} session={session} />
        <section style={{ minHeight: '60vh', paddingTop: 54, paddingBottom: 64 }}>
          <div className="container">
            <div className="card" style={{ padding: 28, borderRadius: 20 }}>
              <h1 style={{ fontSize: 34, marginBottom: 10 }}>Sign in to manage your organisation</h1>
              <p style={{ color: 'rgba(26,39,68,0.7)', lineHeight: 1.6 }}>This area is for verified organisations, charities, service providers and approved administrators. Claim your listing from the Find Help directory to get started.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button className="btn btn-gold" onClick={() => onNavigate('login')}>Sign in</button>
                <button className="btn btn-ghost" onClick={() => onNavigate('find-help')}>Browse the directory</button>
              </div>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  const isClaimed = activeProfile?.claim_status === 'claimed' || profileStatus.claimStatus === 'claimed';

  return (
    <>
      <Nav activePage={activeNavPage} onNavigate={onNavigate} session={session} />
      <section style={{ paddingTop: 40, paddingBottom: 74, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ display: 'grid', gap: 16 }}>

          {/* ── Welcome header ─────────────────────────── */}
          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow" style={{ color: '#2D9CDB', marginBottom: 8 }}>Account Dashboard</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A2744', margin: 0 }}>
                  {activeProfile ? (getProfileDisplayName(activeProfile) || 'Your organisation') : 'Account Dashboard'}
                </h1>
                {isClaimed
                  ? <p style={{ marginTop: 6, color: '#0D7A55', fontSize: 14, fontWeight: 600, margin: '6px 0 0' }}>✓ Your organisation access is active. Complete your profile to improve visibility.</p>
                  : profiles.length > 0
                    ? <p style={{ marginTop: 6, color: 'rgba(26,39,68,0.65)', fontSize: 14, margin: '6px 0 0' }}>Signed in as {session.user.email}.</p>
                    : <p style={{ marginTop: 6, color: 'rgba(26,39,68,0.65)', fontSize: 14, margin: '6px 0 0' }}>Signed in as {session.user.email}. Claim a listing to get started.</p>}
              </div>
              {profiles.length > 1 && (
                <select value={activeProfileId} onChange={(e) => setActiveProfileId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                  {profiles.map((p) => <option key={p.id} value={p.id}>{getProfileDisplayName(p) || 'Organisation'}</option>)}
                </select>
              )}
            </div>
            {error ? <div style={{ marginTop: 10, color: '#A03A2D', fontWeight: 600, fontSize: 13.5 }}>{error}</div> : null}
            {toast ? <div style={{ marginTop: 10, color: '#2D6B1F', fontWeight: 600, fontSize: 13.5 }}>{toast}</div> : null}
          </div>

          {/* ── Primary action card ─────────────────────── */}
          {!loading && activeProfile && (
            <div className="card" style={{ padding: 22, borderRadius: 20, border: '1px solid rgba(45,156,219,0.2)', background: 'linear-gradient(145deg, rgba(45,156,219,0.04) 0%, #FAFBFF 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: isClaimed ? '#0D7A55' : '#8a5a0b', marginBottom: 6 }}>
                    {isClaimed ? '✓ Organisation access active' : titleCase(profileStatus.claimStatus)}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 10 }}>Complete your organisation profile</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#E9EEF5', overflow: 'hidden' }}>
                      <div style={{ width: `${onboardingChecklist.score}%`, height: '100%', background: 'linear-gradient(90deg, #2D9CDB 0%, #10B981 100%)', transition: 'width .3s' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A2744', whiteSpace: 'nowrap' }}>{onboardingChecklist.score}%</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.58)' }}>{onboardingChecklist.completed} of {onboardingChecklist.total} steps complete</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
                  <button className="btn btn-gold" onClick={() => setActiveTab('profile')}>Edit profile</button>
                  <button className="btn btn-ghost" onClick={() => setActiveTab('events')}>Add event</button>
                  {activeProfile.resource_id && resourceSlugMap[activeProfile.resource_id] && (
                    <a href={`/find-help/${resourceSlugMap[activeProfile.resource_id]}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>View listing ↗</a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Stats row ───────────────────────────────── */}
          {!loading && activeProfile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {[
                ['Profile views', dashboardKpis.profileViews, 'number'],
                ['Enquiries', dashboardKpis.enquiryCount, 'number'],
                ['Active events', dashboardKpis.activeEvents, 'number'],
                ['Claim status', titleCase(profileStatus.claimStatus), 'text'],
              ].map(([label, value, type]) => (
                <div key={label} className="card" style={{ padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ marginTop: 6, fontSize: type === 'number' ? 26 : 16, fontWeight: 800, color: '#1A2744' }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Internal tab bar ────────────────────────── */}
          <div style={{ display: 'flex', gap: 2, padding: 4, background: '#EFF2F8', borderRadius: 14, width: 'fit-content', flexWrap: 'wrap' }}>
            {[
              { key: 'overview',   label: 'Overview' },
              { key: 'profile',    label: 'Profile' },
              { key: 'events',     label: 'Events' },
              { key: 'enquiries',  label: 'Enquiries' },
              { key: 'plan',       label: 'Plan' },
              { key: 'settings',   label: 'Settings' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '7px 15px', borderRadius: 10, fontSize: 13.5, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .12s', fontWeight: activeTab === key ? 700 : 500, background: activeTab === key ? 'white' : 'transparent', color: activeTab === key ? '#1A2744' : 'rgba(26,39,68,0.58)', boxShadow: activeTab === key ? '0 1px 4px rgba(26,39,68,0.1)' : 'none' }}>
                {label}
              </button>
            ))}
          </div>

          {loading && <div className="card" style={{ padding: 20 }}>Loading account data…</div>}

          {/* ── OVERVIEW TAB ─────────────────────────────── */}
          {!loading && activeTab === 'overview' && (
            <>
              {profiles.length === 0 && (
                <div className="card" style={{ padding: 32, borderRadius: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🏢</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>No organisation connected yet</h2>
                  <p style={{ color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 16px' }}>Browse the Find Help directory and click "Claim this listing" on any listing that belongs to your organisation. Once approved, your organisation will appear here.</p>
                  {claims.length > 0 && (
                    <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 12, background: 'rgba(245,166,35,0.1)', color: '#8a5a0b', fontSize: 13.5, fontWeight: 700, display: 'inline-block' }}>
                      {claims.length} claim{claims.length !== 1 ? 's' : ''} submitted — awaiting admin review
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-gold" onClick={() => onNavigate('find-help')}>Browse the directory →</button>
                  </div>
                </div>
              )}
              {activeProfile && (
                <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Onboarding checklist</div>
                      <h2 style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>Complete your profile to unlock enquiries</h2>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2744' }}>{onboardingChecklist.score}%</div>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {onboardingChecklist.checks.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, background: item.done ? 'rgba(16,185,129,0.08)' : '#FAFBFF', border: `1px solid ${item.done ? 'rgba(16,185,129,0.18)' : '#E9EEF5'}` }}>
                        <div style={{ fontSize: 13.5, color: '#1A2744', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: item.done ? '#0D7A55' : 'rgba(26,39,68,0.4)' }}>{item.done ? '✓' : '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <button className="btn btn-gold btn-sm" onClick={() => setActiveTab('profile')}>Edit profile →</button>
                  </div>
                </div>
              )}
              {claims.length > 0 && (
                <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)', marginBottom: 12 }}>Your listing claims</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {claims.map((claim) => {
                      const st = (claim.status || 'pending').toLowerCase();
                      const statusColor = st === 'approved' ? '#0D7A55' : st === 'rejected' ? '#A03A2D' : st === 'in_review' ? '#1c78b5' : '#8a5a0b';
                      const statusBg = st === 'approved' ? 'rgba(16,185,129,0.10)' : st === 'rejected' ? 'rgba(244,97,58,0.10)' : st === 'in_review' ? 'rgba(45,156,219,0.10)' : 'rgba(245,166,35,0.12)';
                      return (
                        <div key={claim.id} style={{ border: `1px solid ${statusColor}28`, borderRadius: 12, padding: 12, background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2744' }}>{claim.listing_title || claim.org_name || 'Claim request'}</div>
                          <span style={{ padding: '3px 9px', borderRadius: 999, background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700 }}>{titleCase(claim.status || 'pending')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PROFILE TAB ──────────────────────────────── */}
          {!loading && activeTab === 'profile' && (
            <>
              {profiles.length === 0 && (
                <div className="card" style={{ padding: 28, borderRadius: 20, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(26,39,68,0.65)' }}>No organisation connected. Browse Find Help to claim your listing.</p>
                  <button className="btn btn-gold" style={{ marginTop: 12 }} onClick={() => onNavigate('find-help')}>Browse the directory</button>
                </div>
              )}
              {profiles.length > 0 && (
                <div id="pd-profile-section" className="card" style={{ padding: 22, borderRadius: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your organisation profile</h2>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {activeProfile && resourceSlugMap[activeProfile.resource_id] && (
                        <a href={`/find-help/${resourceSlugMap[activeProfile.resource_id]}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>View live listing ↗</a>
                      )}
                      <select value={activeProfileId} onChange={(e) => setActiveProfileId(e.target.value)} style={inputStyle}>
                        <option value="">Select profile</option>
                        {profiles.map((p) => <option key={p.id} value={p.id}>{getProfileDisplayName(p) || 'Organisation profile'}</option>)}
                      </select>
                      {!profiles.some((p) => p.claim_status === 'claimed') && (
                        <button className="btn btn-ghost" onClick={() => { setActiveProfileId(''); setProfileDraft({ ...emptyProfile, contact_email: userEmail }); }}>New profile</button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 14 }}>
                    <input value={profileDraft.organisation_name || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, organisation_name: e.target.value }))} placeholder="Organisation name *" style={inputStyle} />
                    <input value={profileDraft.slug || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                    <input value={profileDraft.logo_url || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, logo_url: e.target.value }))} placeholder="Logo URL (https://…)" style={inputStyle} />
                    <input value={profileDraft.banner_url || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, banner_url: e.target.value }))} placeholder="Cover / banner image URL (https://…)" style={inputStyle} />
                    <input value={profileDraft.contact_email || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email" style={inputStyle} />
                    <input value={profileDraft.contact_phone || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, contact_phone: e.target.value }))} placeholder="Contact phone" style={inputStyle} />
                    <input value={profileDraft.website_url || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, website_url: e.target.value }))} placeholder="Website URL" style={inputStyle} />
                    <input value={profileDraft.resource_id || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, resource_id: e.target.value }))} placeholder="Linked resource id (set by admin)" style={{ ...inputStyle, color: 'rgba(26,39,68,0.5)' }} readOnly />
                  </div>
                  <textarea value={profileDraft.short_bio || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, short_bio: e.target.value }))} placeholder="Short description (shown on public listing)" rows={2} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                  <textarea value={profileDraft.full_bio || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, full_bio: e.target.value }))} placeholder="Full description (shown on profile detail)" rows={3} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                    <input value={profileDraft.service_categories_text || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, service_categories_text: e.target.value }))} placeholder="Service categories (comma-separated)" style={inputStyle} />
                    <input value={profileDraft.areas_covered_text || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, areas_covered_text: e.target.value }))} placeholder="Areas covered (comma-separated)" style={inputStyle} />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(26,39,68,0.45)', marginBottom: 8 }}>Social media</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {PD_SOCIAL_COLUMNS.map((col) => (
                        <input key={col} value={profileDraft[col] || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, [col]: e.target.value }))} placeholder={`${PD_SOCIAL_LABELS[col]}: ${PD_SOCIAL_PLACEHOLDERS[col]}`} style={inputStyle} />
                      ))}
                    </div>
                  </div>
                  <label style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={Boolean(profileDraft.is_active)} onChange={(e) => setProfileDraft((p) => ({ ...p, is_active: e.target.checked }))} />
                    Active profile
                  </label>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-gold" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save profile'}</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── EVENTS TAB ───────────────────────────────── */}
          {!loading && activeTab === 'events' && (
            <div className="card" style={{ padding: 22, borderRadius: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Events</h2>
              {!activeProfileId ? <div style={{ marginTop: 8, color: 'rgba(26,39,68,0.65)' }}>Select a profile first to manage events.</div> : null}
              {activeProfileId ? (
                <>
                  <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, border: '1px solid #E9EEF5', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13.5, color: '#1A2744', fontWeight: 700 }}>Event quota used: {eventQuotaUsed} / {entitlementState.eventQuota}</div>
                    <div style={{ fontSize: 12.5, color: remainingEventQuota > 0 ? '#0D7A55' : '#A03A2D' }}>{remainingEventQuota > 0 ? `${remainingEventQuota} remaining` : 'Quota reached'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
                    <input value={eventDraft.title} onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Event title" style={inputStyle} />
                    <input value={eventDraft.slug} onChange={(e) => setEventDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Event slug" style={inputStyle} />
                    <input value={eventDraft.event_type} onChange={(e) => setEventDraft((p) => ({ ...p, event_type: e.target.value }))} placeholder="Event type" style={inputStyle} />
                    <input value={eventDraft.location} onChange={(e) => setEventDraft((p) => ({ ...p, location: e.target.value }))} placeholder="Location" style={inputStyle} />
                    <input type="datetime-local" value={eventDraft.starts_at} onChange={(e) => setEventDraft((p) => ({ ...p, starts_at: e.target.value }))} style={inputStyle} />
                    <input type="datetime-local" value={eventDraft.ends_at} onChange={(e) => setEventDraft((p) => ({ ...p, ends_at: e.target.value }))} style={inputStyle} />
                    <select value={eventDraft.cta_type} onChange={(e) => setEventDraft((p) => ({ ...p, cta_type: e.target.value }))} style={inputStyle}>
                      <option value="contact">Contact</option>
                      <option value="book">Book</option>
                    </select>
                    <select value={eventDraft.status} onChange={(e) => setEventDraft((p) => ({ ...p, status: e.target.value }))} style={inputStyle}>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <input value={eventDraft.booking_url} onChange={(e) => setEventDraft((p) => ({ ...p, booking_url: e.target.value }))} placeholder="Booking URL" style={inputStyle} />
                    <input value={eventDraft.contact_email} onChange={(e) => setEventDraft((p) => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email" style={inputStyle} />
                  </div>
                  <textarea value={eventDraft.description} onChange={(e) => setEventDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button className="btn btn-gold" disabled={saving || eventQuotaReached} onClick={saveEvent}>{saving ? 'Saving...' : (eventDraft.id ? 'Update event' : 'Create event')}</button>
                    {eventDraft.id ? <button className="btn btn-ghost" onClick={() => setEventDraft(emptyEvent)}>Cancel edit</button> : null}
                  </div>
                  {eventQuotaReached ? <div style={{ marginTop: 8, fontSize: 12.5, color: '#A03A2D' }}>Event creation is disabled because this entitlement has reached its quota.</div> : null}
                  <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                    {activeEvents.length ? activeEvents.map((ev) => (
                      <div key={ev.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 12, background: '#FFFFFF' }}>
                        <div style={{ fontWeight: 700 }}>{ev.title}</div>
                        <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>{ev.starts_at ? new Date(ev.starts_at).toLocaleString('en-GB') : 'No start date'} · {ev.status}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => editEvent(ev)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteEvent(ev.id)}>Delete</button>
                        </div>
                      </div>
                    )) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No events for this profile yet.</div>}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* ── ENQUIRIES TAB ────────────────────────────── */}
          {!loading && activeTab === 'enquiries' && (
            <div className="card" style={{ padding: 22, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Enquiry pipeline</div>
                  <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>Track response value before monetisation</h2>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)' }}>{activeProfileEnquiries.length} enquiries on this profile</div>
              </div>
              {hasEnquiryToolsAccess ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
                  {[['new', enquiryPipeline.new], ['contacted', enquiryPipeline.contacted], ['resolved', enquiryPipeline.resolved]].map(([state, rows]) => (
                    <div key={state} style={{ border: '1px solid #E9EEF5', borderRadius: 16, padding: 14, background: '#FAFBFF' }}>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>{state}</div>
                      <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: '#1A2744' }}>{rows.length}</div>
                      <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {rows.length ? rows.slice(0, 4).map((entry) => (
                          <div key={entry.id} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid #E3EAF4', background: '#FFFFFF' }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1A2744' }}>{entry.full_name}</div>
                            <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(26,39,68,0.6)' }}>{entry.email}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                              {['new', 'contacted', 'resolved'].map((nextState) => (
                                <button key={nextState} className="btn btn-ghost btn-sm" disabled={saving || nextState === state} onClick={() => updateEnquiryStatus(entry.id, nextState)}>Mark {nextState}</button>
                              ))}
                            </div>
                          </div>
                        )) : <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.56)' }}>No enquiries in this state.</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 14, border: '1px solid #E9EEF5', borderRadius: 16, padding: 18, background: '#FAFBFF' }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>Enquiry tools locked</div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: '#1A2744' }}>Enquiry pipeline is not yet enabled for this profile</div>
                  <div style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.65 }}>Contact the Inspiring Carers team to discuss enabling enquiry tools for your organisation.</div>
                </div>
              )}
            </div>
          )}

          {/* ── PLAN TAB ─────────────────────────────────── */}
          {!loading && activeTab === 'plan' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div className="card" style={{ gridColumn: '1 / -1', padding: 16, borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>Analytics window</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>Views and enquiries use historical activity.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ANALYTICS_WINDOWS.map((w) => (
                        <button key={w.key} className="btn btn-ghost btn-sm" onClick={() => setAnalyticsWindow(w.key)} style={{ borderColor: analyticsWindow === w.key ? '#1A2744' : undefined, fontWeight: analyticsWindow === w.key ? 700 : 600 }}>{w.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {hasAnalyticsAccess ? analyticsCards.map(([label, value]) => (
                  <div key={label} className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: '#1A2744' }}>{value}{label.includes('%') ? '%' : ''}</div>
                  </div>
                )) : (
                  <div className="card" style={{ gridColumn: '1 / -1', padding: 18 }}>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>Analytics locked</div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>Analytics are disabled for this entitlement</div>
                    <div style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.65 }}>Contact the team to enable analytics for your profile.</div>
                  </div>
                )}
              </div>
              <div className="card" style={{ padding: 22, borderRadius: 20, border: '1px solid #E7D8B9', background: 'linear-gradient(180deg, #FFF9ED 0%, #FFFFFF 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Grow your listing</div>
                    <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>Boost your reach and capture more enquiries</h2>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: 999, background: hasFeaturedAccess ? 'rgba(16,185,129,0.12)' : 'rgba(245,166,35,0.14)', color: hasFeaturedAccess ? '#0D7A55' : '#9A5A00', fontSize: 12, fontWeight: 700 }}>{hasFeaturedAccess ? 'Featured active' : 'Standard listing'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginTop: 14 }}>
                  {[['Featured listing', 'Appear at the top of relevant searches, highlighted in map results.', hasFeaturedAccess], ['Enquiry capture', 'Receive direct enquiries from your listing — managed in one place.', hasEnquiryToolsAccess], ['Event promotion', 'Promote your sessions, groups, and events to people searching for support.', false], ['Listing analytics', 'See how many people viewed and engaged with your listing.', hasAnalyticsAccess]].map(([title, description, active]) => (
                    <div key={title} style={{ border: active ? '1.5px solid rgba(16,185,129,0.3)' : '1px solid #F0E3C5', borderRadius: 16, padding: 14, background: active ? 'rgba(16,185,129,0.04)' : '#FFFFFF' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{title}</div>
                      <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(26,39,68,0.64)', lineHeight: 1.6 }}>{description}</div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: active ? '#0D7A55' : 'rgba(26,39,68,0.5)' }}>{active ? '✓ Active' : 'Not yet active'}</span>
                        {!active && <button onClick={() => setUpgradeEnquiryTarget(title)} style={{ fontSize: 11.5, fontWeight: 800, color: '#B45309', background: 'rgba(245,166,35,0.12)', padding: '3px 9px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.25)', cursor: 'pointer' }}>Enquire →</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)', marginBottom: 8 }}>Account plan</div>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Your current plan</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 14 }}>
                  {[['Package', entitlementState.packageName], ['Status', titleCase(entitlementState.status)], ['Start date', entitlementState.startDate || 'Not set'], ['End date', entitlementState.endDate || 'Not set'], ['Featured', entitlementState.featuredEnabled ? 'Yes' : 'No'], ['Event quota', `${entitlementState.eventQuota}`], ['Enquiry tools', entitlementState.enquiryToolsEnabled ? 'Enabled' : 'Disabled'], ['Analytics', entitlementState.analyticsEnabled ? 'Enabled' : 'Disabled']].map(([label, value]) => (
                    <div key={label} style={{ border: '1px solid #E9EEF5', borderRadius: 14, padding: 14, background: '#FAFBFF' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>{label}</div>
                      <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS TAB ─────────────────────────────── */}
          {!loading && activeTab === 'settings' && (
            <div className="card" style={{ padding: 28, borderRadius: 20 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)', marginBottom: 8 }}>Account Settings</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1A2744', marginBottom: 20 }}>Your account</h2>
              <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
                {[['Email address', userEmail || '—'], ['Account type', isAdmin ? 'Administrator' : profiles.length > 0 ? 'Organisation owner' : 'Account holder'], ['Organisations connected', String(profiles.length || 0)]].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: 14, border: '1px solid #E9EEF5', background: '#FAFBFF' }}>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.52)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1A2744' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 14, border: '1px dashed rgba(26,39,68,0.15)', background: '#FAFBFF', fontSize: 13.5, color: 'rgba(26,39,68,0.55)', lineHeight: 1.6, marginBottom: 22 }}>
                Advanced settings — notification preferences, password changes, and two-factor authentication — are coming in the next phase.
              </div>
              <button onClick={handleLogout} style={{ padding: '11px 24px', borderRadius: 12, background: 'rgba(160,58,45,0.07)', color: '#A03A2D', fontWeight: 700, fontSize: 14, border: '1px solid rgba(160,58,45,0.18)', cursor: 'pointer' }}>Sign out</button>
            </div>
          )}

        </div>
      </section>

          {upgradeEnquiryTarget && (
        <UpgradeEnquiryModal
          upgradeTitle={upgradeEnquiryTarget}
          orgName={activeProfile?.organisation_name || ''}
          userEmail={session?.user?.email || ''}
          onClose={() => setUpgradeEnquiryTarget(null)}
          onSuccess={() => {
            setUpgradeEnquiryTarget(null);
            setToast('Enquiry sent — the team will be in touch shortly.');
          }}
        />
      )}
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ProfileDashboard;
