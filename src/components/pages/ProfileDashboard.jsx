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

const ProfileDashboard = ({ onNavigate, session }) => {
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

  const [activeProfileId, setActiveProfileId] = React.useState('');
  const [profileDraft, setProfileDraft] = React.useState(emptyProfile);
  const [resourceSlugMap, setResourceSlugMap] = React.useState({});
  const [eventDraft, setEventDraft] = React.useState(emptyEvent);
  const [analyticsWindow, setAnalyticsWindow] = React.useState('30d');

  const userEmail = `${session?.user?.email || ''}`.trim().toLowerCase();

  const loadData = React.useCallback(async () => {
    if (!session || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setAnalyticsNotice('');

    try {
      const [byOwnerEmail, byCreatedBy, claimsResult, fallbackClaimsResult] = await Promise.all([
        supabase.from('organisation_profiles').select('*').eq('owner_email', userEmail),
        supabase.from('organisation_profiles').select('*').eq('created_by', session.user.id),
        supabase.from('listing_claims').select('*').eq('email', userEmail).order('created_at', { ascending: false }),
        // Also load fallback claims that landed in resource_update_submissions
        supabase.from('resource_update_submissions').select('id, organisation_name, status, created_at, update_type, resource_id')
          .eq('submitter_email', userEmail).eq('update_type', 'claim_request').order('created_at', { ascending: false }),
      ]);

      const mergedProfiles = [...(byOwnerEmail.data || []), ...(byCreatedBy.data || [])];
      const uniqueProfiles = Array.from(new Map(mergedProfiles.map((item) => [item.id, item])).values());
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
        owner_email: userEmail,
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
        <Nav activePage="profile" onNavigate={onNavigate} session={session} />
        <section style={{ minHeight: '60vh', paddingTop: 54, paddingBottom: 64 }}>
          <div className="container">
            <div className="card" style={{ padding: 28, borderRadius: 20 }}>
              <h1 style={{ fontSize: 34, marginBottom: 10 }}>Sign in to access your profile dashboard</h1>
              <p style={{ color: 'rgba(26,39,68,0.7)' }}>Use your account to manage organisation profile details and live events.</p>
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => onNavigate('login')}>Go to login</button>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Nav activePage="profile" onNavigate={onNavigate} />
      <section style={{ paddingTop: 40, paddingBottom: 74, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ display: 'grid', gap: 18 }}>
          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800 }}>Organisation Profile Dashboard</h1>
            <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Signed in as {session.user.email}. Profile ownership is linked by owner email and created profile records.</p>
            {error ? <div style={{ marginTop: 10, color: '#A03A2D', fontWeight: 600 }}>{error}</div> : null}
            {toast ? <div style={{ marginTop: 10, color: '#2D6B1F', fontWeight: 600 }}>{toast}</div> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              ['Profiles', dashboardKpis.profiles],
              ['Events', dashboardKpis.events],
              ['Upcoming', dashboardKpis.upcoming],
              ['Completed', dashboardKpis.completed],
              ['Claims pending', dashboardKpis.pendingClaims],
              ['Claims approved', dashboardKpis.approvedClaims],
            ].map(([label, value]) => (
              <div key={label} className="card" style={{ padding: 14, borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div className="card" style={{ gridColumn: '1 / -1', padding: 16, borderRadius: 16, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>Analytics window</div>
                  <div style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(26,39,68,0.68)' }}>Views and enquiries use historical activity. Active events use the matching forward-looking window.</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ANALYTICS_WINDOWS.map((windowOption) => (
                    <button
                      key={windowOption.key}
                      className="btn btn-ghost btn-sm"
                      onClick={() => setAnalyticsWindow(windowOption.key)}
                      style={{ borderColor: analyticsWindow === windowOption.key ? '#1A2744' : undefined, fontWeight: analyticsWindow === windowOption.key ? 700 : 600 }}
                    >
                      {windowOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {hasAnalyticsAccess ? analyticsCards.map(([label, value]) => (
              <div key={label} className="card" style={{ padding: 16, borderRadius: 16, background: '#FFFFFF' }}>
                <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: '#1A2744' }}>{value}{label.includes('%') ? '%' : ''}</div>
                <div style={{ marginTop: 6, fontSize: 12.5, color: 'rgba(26,39,68,0.58)' }}>
                  {label === 'Profile views' ? 'Directory interest recorded from resource view events.' : null}
                  {label === 'Event enquiries' ? 'Live demand captured from organiser enquiry records.' : null}
                  {label === 'Active events' ? 'Scheduled events currently available to book or contact.' : null}
                  {label === 'Profile completion %' ? 'Readiness score for conversion and premium upgrades.' : null}
                </div>
              </div>
            )) : (
              <div className="card" style={{ gridColumn: '1 / -1', padding: 18, borderRadius: 16, background: '#FFFFFF' }}>
                <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>Analytics locked</div>
                <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800, color: '#1A2744' }}>Analytics are disabled for this entitlement</div>
                <div style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.65 }}>Profile views, enquiry totals and time-window reporting become visible when `analytics_enabled` is switched on by admin.</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 14 }}>
            <div className="card" style={{ padding: 22, borderRadius: 20, background: 'linear-gradient(145deg, rgba(26,39,68,0.98) 0%, rgba(34,70,110,0.96) 100%)', color: '#FFFFFF' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.7)' }}>Owner onboarding</div>
              <h2 style={{ marginTop: 10, fontSize: 28, fontWeight: 800 }}>Dashboard access is live while your claim is reviewed</h2>
              <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                {dashboardKpis.pendingClaims
                  ? 'You can complete onboarding now so your listing is ready to convert as soon as the admin team approves it.'
                  : dashboardKpis.approvedClaims
                    ? 'Your claim has been approved. Finish onboarding and prepare featured upgrades to turn directory traffic into enquiries.'
                    : 'Create an organisation profile now, then connect it to a claim or new listing as your commercial onboarding base.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>Claim status</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{titleCase(profileStatus.claimStatus)}</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>Verification</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{titleCase(profileStatus.verificationStatus)}</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>Completion score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{onboardingChecklist.score}%</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>Featured access</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{hasFeaturedAccess ? 'Enabled' : 'Locked'}</div>
                </div>
              </div>
              {latestClaim ? (
                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>Latest claim</div>
                  <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700 }}>{latestClaim.listing_title || latestClaim.org_name || 'Claim request'}</div>
                  <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(255,255,255,0.74)' }}>Current review state: {titleCase(latestClaim.status || 'pending')}.</div>
                </div>
              ) : null}
            </div>

            <div className="card" style={{ padding: 22, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Onboarding checklist</div>
                  <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>Complete your profile to unlock enquiries</h2>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2744' }}>{onboardingChecklist.score}%</div>
              </div>
              <div style={{ marginTop: 14, height: 10, borderRadius: 999, background: '#E9EEF5', overflow: 'hidden' }}>
                <div style={{ width: `${onboardingChecklist.score}%`, height: '100%', background: 'linear-gradient(90deg, #2D9CDB 0%, #10B981 100%)' }} />
              </div>
              <div style={{ marginTop: 14, display: 'grid', gap: 9 }}>
                {onboardingChecklist.checks.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: item.done ? 'rgba(16,185,129,0.08)' : '#FAFBFF', border: `1px solid ${item.done ? 'rgba(16,185,129,0.18)' : '#E9EEF5'}` }}>
                    <div style={{ fontSize: 13.5, color: '#1A2744', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.done ? '#0D7A55' : 'rgba(26,39,68,0.52)' }}>{item.done ? 'Done' : 'Next'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 22, borderRadius: 20, border: '1px solid #E7D8B9', background: 'linear-gradient(180deg, #FFF9ED 0%, #FFFFFF 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Premium placeholders</div>
                <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>Commercial upgrades ready for activation</h2>
                <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65, maxWidth: 760 }}>These are intentionally placeholder offers for monetisation design. They keep the commercial path visible without changing billing or fulfilment logic yet.</p>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 999, background: hasFeaturedAccess ? 'rgba(16,185,129,0.12)' : 'rgba(245,166,35,0.14)', color: hasFeaturedAccess ? '#0D7A55' : '#9A5A00', fontSize: 12, fontWeight: 700 }}>{hasFeaturedAccess ? 'Featured enabled' : `${titleCase(entitlementState.status)} entitlement`}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginTop: 14 }}>
              {[
                ['Featured listing boost', `You have ${filteredProfileViewEvents.length} profile views in the selected window to benchmark uplift against.`],
                ['Enquiry capture pack', `You have ${filteredProfileEnquiries.length} event enquiries in the selected window moving through the live pipeline.`],
                ['Event promotion add-on', `You currently have ${filteredActiveEvents.length} active events in the selected window to amplify.`],
                ['Conversion proof pack', `Your profile completion score is ${onboardingChecklist.score}% before any paid upsell.`],
              ].map(([title, description]) => (
                <div key={title} style={{ border: '1px solid #F0E3C5', borderRadius: 16, padding: 14, background: '#FFFFFF' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{title}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(26,39,68,0.64)', lineHeight: 1.6 }}>{description}</div>
                  <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: hasFeaturedAccess || title !== 'Featured listing boost' ? '#9A5A00' : '#A03A2D' }}>
                    {title === 'Featured listing boost' ? (hasFeaturedAccess ? 'Ready to use' : 'Locked until featured_enabled = true') : 'Placeholder only'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Premium entitlement</div>
                <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>Current package state</h2>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)' }}>Manual provisioning ready before checkout</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, marginTop: 14 }}>
              {[
                ['Package', entitlementState.packageName],
                ['Status', titleCase(entitlementState.status)],
                ['Start date', entitlementState.startDate || 'Not set'],
                ['End date', entitlementState.endDate || 'Not set'],
              ].map(([label, value]) => (
                <div key={label} style={{ border: '1px solid #E9EEF5', borderRadius: 14, padding: 14, background: '#FAFBFF' }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>{label}</div>
                  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: '#1A2744' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, marginTop: 12 }}>
              {[
                ['Featured enabled', entitlementState.featuredEnabled ? 'Yes' : 'No'],
                ['Event quota', `${entitlementState.eventQuota}`],
                ['Enquiry tools', entitlementState.enquiryToolsEnabled ? 'Enabled' : 'Disabled'],
                ['Analytics', entitlementState.analyticsEnabled ? 'Enabled' : 'Disabled'],
              ].map(([label, value]) => (
                <div key={label} style={{ border: '1px solid #E9EEF5', borderRadius: 14, padding: 14, background: '#FFFFFF' }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>{label}</div>
                  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: '#1A2744' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.46)' }}>Enquiry pipeline</div>
                <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>Track response value before monetisation</h2>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.56)' }}>{activeProfileEnquiries.length} enquiries on this profile</div>
            </div>
            {hasEnquiryToolsAccess ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
                {[
                  ['new', enquiryPipeline.new],
                  ['contacted', enquiryPipeline.contacted],
                  ['resolved', enquiryPipeline.resolved],
                ].map(([state, rows]) => (
                  <div key={state} style={{ border: '1px solid #E9EEF5', borderRadius: 16, padding: 14, background: '#FAFBFF' }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,39,68,0.52)', fontWeight: 800 }}>{state}</div>
                    <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: '#1A2744' }}>{rows.length}</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {rows.length ? rows.slice(0, 4).map((entry) => (
                        <div key={entry.id} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid #E3EAF4', background: '#FFFFFF' }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1A2744' }}>{entry.full_name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(26,39,68,0.6)' }}>{entry.email}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(26,39,68,0.56)' }}>{entry.spaces_requested ? `${entry.spaces_requested} spaces requested` : 'No space count supplied'}</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                            {['new', 'contacted', 'resolved'].map((nextState) => (
                              <button
                                key={nextState}
                                className="btn btn-ghost btn-sm"
                                disabled={saving || nextState === state}
                                onClick={() => updateEnquiryStatus(entry.id, nextState)}
                              >
                                Mark {nextState}
                              </button>
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
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: '#1A2744' }}>This organisation cannot manage enquiry pipeline states yet</div>
                <div style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.62)', lineHeight: 1.65 }}>Switch `enquiry_tools_enabled` on in admin to unlock pipeline management and response tracking.</div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="card" style={{ padding: 20 }}>Loading profile data...</div>
          ) : (
            <>
              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your organisation profiles</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {activeProfile && resourceSlugMap[activeProfile.resource_id] && (
                      <a
                        href={`/find-help/${resourceSlugMap[activeProfile.resource_id]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        View live listing ↗
                      </a>
                    )}
                    <select value={activeProfileId} onChange={(event) => setActiveProfileId(event.target.value)} style={inputStyle}>
                      <option value="">Select profile</option>
                      {profiles.map((profile) => <option key={profile.id} value={profile.id}>{getProfileDisplayName(profile) || 'Organisation profile'}</option>)}
                    </select>
                    <button className="btn btn-ghost" onClick={() => { setActiveProfileId(''); setProfileDraft({ ...emptyProfile, contact_email: userEmail }); }}>New profile</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 14 }}>
                  <input value={profileDraft.organisation_name || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, organisation_name: event.target.value }))} placeholder="Organisation name *" style={inputStyle} />
                  <input value={profileDraft.slug || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" style={inputStyle} />
                  <input value={profileDraft.logo_url || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, logo_url: event.target.value }))} placeholder="Logo URL (https://…)" style={inputStyle} />
                  <input value={profileDraft.banner_url || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, banner_url: event.target.value }))} placeholder="Cover / banner image URL (https://…)" style={inputStyle} />
                  <input value={profileDraft.contact_email || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, contact_email: event.target.value }))} placeholder="Contact email" style={inputStyle} />
                  <input value={profileDraft.contact_phone || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, contact_phone: event.target.value }))} placeholder="Contact phone" style={inputStyle} />
                  <input value={profileDraft.website_url || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, website_url: event.target.value }))} placeholder="Website URL" style={inputStyle} />
                  <input value={profileDraft.resource_id || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, resource_id: event.target.value }))} placeholder="Linked resource id (set by admin)" style={{ ...inputStyle, color: 'rgba(26,39,68,0.5)' }} readOnly />
                </div>
                <textarea value={profileDraft.short_bio || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, short_bio: event.target.value }))} placeholder="Short description (shown on public listing)" rows={2} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                <textarea value={profileDraft.full_bio || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, full_bio: event.target.value }))} placeholder="Full description (shown on profile detail)" rows={3} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <input value={profileDraft.service_categories_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, service_categories_text: event.target.value }))} placeholder="Service categories (comma-separated)" style={inputStyle} />
                  <input value={profileDraft.areas_covered_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, areas_covered_text: event.target.value }))} placeholder="Areas covered (comma-separated)" style={inputStyle} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(26,39,68,0.45)', marginBottom: 8 }}>Social media</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PD_SOCIAL_COLUMNS.map((col) => (
                      <input key={col} value={profileDraft[col] || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, [col]: event.target.value }))} placeholder={`${PD_SOCIAL_LABELS[col]}: ${PD_SOCIAL_PLACEHOLDERS[col]}`} style={inputStyle} />
                    ))}
                  </div>
                </div>
                <label style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={Boolean(profileDraft.is_active)} onChange={(event) => setProfileDraft((prev) => ({ ...prev, is_active: event.target.checked }))} />
                  Active profile
                </label>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-gold" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save profile'}</button>
                </div>
              </div>

              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Events for selected profile</h2>
                {!activeProfileId ? <div style={{ marginTop: 8, color: 'rgba(26,39,68,0.65)' }}>Select or create a profile to manage events.</div> : null}
                {activeProfileId ? (
                  <>
                    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, border: '1px solid #E9EEF5', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13.5, color: '#1A2744', fontWeight: 700 }}>Event quota used: {eventQuotaUsed} / {entitlementState.eventQuota}</div>
                      <div style={{ fontSize: 12.5, color: remainingEventQuota > 0 ? '#0D7A55' : '#A03A2D' }}>{remainingEventQuota > 0 ? `${remainingEventQuota} remaining` : 'Quota reached'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
                      <input value={eventDraft.title} onChange={(event) => setEventDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Event title" style={inputStyle} />
                      <input value={eventDraft.slug} onChange={(event) => setEventDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Event slug" style={inputStyle} />
                      <input value={eventDraft.event_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, event_type: event.target.value }))} placeholder="Event type" style={inputStyle} />
                      <input value={eventDraft.location} onChange={(event) => setEventDraft((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" style={inputStyle} />
                      <input type="datetime-local" value={eventDraft.starts_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, starts_at: event.target.value }))} style={inputStyle} />
                      <input type="datetime-local" value={eventDraft.ends_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, ends_at: event.target.value }))} style={inputStyle} />
                      <select value={eventDraft.cta_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, cta_type: event.target.value }))} style={inputStyle}>
                        <option value="contact">Contact</option>
                        <option value="book">Book</option>
                      </select>
                      <select value={eventDraft.status} onChange={(event) => setEventDraft((prev) => ({ ...prev, status: event.target.value }))} style={inputStyle}>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input value={eventDraft.booking_url} onChange={(event) => setEventDraft((prev) => ({ ...prev, booking_url: event.target.value }))} placeholder="Booking URL" style={inputStyle} />
                      <input value={eventDraft.contact_email} onChange={(event) => setEventDraft((prev) => ({ ...prev, contact_email: event.target.value }))} placeholder="Contact email" style={inputStyle} />
                    </div>
                    <textarea value={eventDraft.description} onChange={(event) => setEventDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <button className="btn btn-gold" disabled={saving || eventQuotaReached} onClick={saveEvent}>{saving ? 'Saving...' : (eventDraft.id ? 'Update event' : 'Create event')}</button>
                      {eventDraft.id ? <button className="btn btn-ghost" onClick={() => setEventDraft(emptyEvent)}>Cancel edit</button> : null}
                    </div>
                    {eventQuotaReached ? <div style={{ marginTop: 8, fontSize: 12.5, color: '#A03A2D' }}>Event creation is disabled because this entitlement has reached its quota.</div> : null}

                    <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                      {activeEvents.length ? activeEvents.map((eventRow) => (
                        <div key={eventRow.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 12, background: '#FFFFFF' }}>
                          <div style={{ fontWeight: 700 }}>{eventRow.title}</div>
                          <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>{eventRow.starts_at ? new Date(eventRow.starts_at).toLocaleString('en-GB') : 'No start date'} · {eventRow.status}</div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => editEvent(eventRow)}>Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => deleteEvent(eventRow.id)}>Delete</button>
                          </div>
                        </div>
                      )) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No events for this profile yet.</div>}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your listing claims</h2>
                <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                  {claims.length ? claims.map((claim) => {
                    const st = (claim.status || 'pending').toLowerCase();
                    const statusColor = st === 'approved' ? '#0D7A55' : st === 'rejected' ? '#A03A2D' : st === 'in_review' ? '#1c78b5' : '#8a5a0b';
                    const statusBg = st === 'approved' ? 'rgba(16,185,129,0.10)' : st === 'rejected' ? 'rgba(244,97,58,0.10)' : st === 'in_review' ? 'rgba(45,156,219,0.10)' : 'rgba(245,166,35,0.12)';
                    return (
                      <div key={claim.id} style={{ border: `1px solid ${statusColor}28`, borderRadius: 14, padding: 14, background: '#FAFBFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2744' }}>{claim.listing_title || claim.org_name || 'Claim request'}</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 999, background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700 }}>{titleCase(claim.status || 'pending')}</span>
                            {claim._source === 'resource_update_submissions' && (
                              <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(245,166,35,0.10)', color: '#8a5a0b', fontSize: 11, fontWeight: 700 }}>Fallback queue</span>
                            )}
                          </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.62)', lineHeight: 1.55 }}>
                          {st === 'approved'
                            ? 'Claim approved. Finish your organisation profile and publish your first event to start converting directory traffic.'
                            : st === 'rejected'
                            ? 'This claim was not approved. Contact the admin team if you believe this is an error.'
                            : st === 'in_review'
                            ? 'Your claim is being reviewed. Complete your profile now so approval converts immediately.'
                            : 'Awaiting admin review. Complete your profile onboarding in the meantime.'}
                        </div>
                      </div>
                    );
                  }) : <div style={{ color: 'rgba(26,39,68,0.65)', fontSize: 13.5 }}>No listing claims found for your email yet. Submit a claim from any listing in the Find Help directory.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ProfileDashboard;
