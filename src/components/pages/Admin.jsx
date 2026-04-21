import React from 'react';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Icons from '../Icons.jsx';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js';

const { IconTile, IArrow, IClose, ISearch, IHub, IAdvice, IWellbeing, IStar } = Icons;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ADMIN_EMAIL_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const CORNWALL_CENTER = [50.266, -5.052];

const emptyResourceDraft = {
  id: null,
  name: '',
  slug: '',
  category_id: '',
  town: '',
  summary: '',
  description: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  postcode: '',
  latitude: '',
  longitude: '',
  verified: false,
  featured: false,
  is_archived: false,
  source_type: 'manual',
  source_reference: '',
  subcategory: '',
  raw_folder: '',
  needs_review: false,
  last_reviewed_at: '',
  metadataText: '{}',
};

const emptyCategoryDraft = {
  id: null,
  name: '',
  slug: '',
  description: '',
  color: '#2D9CDB',
  sort_order: 0,
  is_active: true,
};

const updatedDateOptions = [
  { value: 'all', label: 'Any update date' },
  { value: '7', label: 'Updated in last 7 days' },
  { value: '30', label: 'Updated in last 30 days' },
  { value: '90', label: 'Updated in last 90 days' },
];

const submissionStatuses = ['pending', 'in_review', 'approved', 'rejected'];

const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const formatMonthLabel = (value) => {
  const [year, month] = `${value || ''}`.split('-');
  if (!year || !month) return value || 'Unknown';
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, 1));
};

const normalizeUkPostcode = (value) => value.toUpperCase().replace(/\s+/g, '').trim();

const formatUkPostcode = (value) => {
  const normalized = normalizeUkPostcode(value);
  if (normalized.length <= 3) return normalized;
  return `${normalized.slice(0, normalized.length - 3)} ${normalized.slice(-3)}`;
};

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getResourceCompleteness = (resource) => {
  const checks = [
    Boolean(resource?.name?.trim()),
    Boolean(resource?.category_id || resource?.resource_categories?.id),
    Boolean(resource?.address?.trim()),
    Boolean(resource?.town?.trim()),
    Boolean(resource?.postcode?.trim()),
    Boolean(resource?.description?.trim()),
    Boolean(resource?.phone?.trim()),
    Boolean(resource?.website?.trim()),
    Number.isFinite(Number(resource?.latitude)) && Number.isFinite(Number(resource?.longitude)),
  ];
  const filled = checks.filter(Boolean).length;
  const score = Math.round((filled / checks.length) * 100);
  const tone = score >= 85 ? 'lime' : score >= 60 ? 'gold' : 'coral';
  return { filled, total: checks.length, score, tone };
};

const normalizeResourceDraft = (resource) => {
  const importReady = resource?.metadata?.import_ready ?? {};
  return {
    id: resource?.id ?? null,
    name: resource?.name ?? '',
    slug: resource?.slug ?? '',
    category_id: resource?.category_id ?? resource?.resource_categories?.id ?? '',
    town: resource?.town ?? '',
    summary: resource?.summary ?? '',
    description: resource?.description ?? '',
    website: resource?.website ?? '',
    phone: resource?.phone ?? '',
    email: resource?.email ?? '',
    address: resource?.address ?? '',
    postcode: resource?.postcode ?? '',
    latitude: resource?.latitude ?? '',
    longitude: resource?.longitude ?? '',
    verified: Boolean(resource?.verified),
    featured: Boolean(resource?.featured),
    is_archived: Boolean(resource?.is_archived),
    source_type: resource?.source_type ?? 'manual',
    source_reference: resource?.source_ref ?? importReady.source_reference ?? '',
    subcategory: importReady.subcategory ?? '',
    raw_folder: importReady.raw_folder ?? '',
    needs_review: Boolean(importReady.needs_review),
    last_reviewed_at: importReady.last_reviewed_at ?? '',
    metadataText: JSON.stringify(resource?.metadata ?? {}, null, 2),
  };
};

const normalizeCategoryDraft = (category) => ({
  id: category?.id ?? null,
  name: category?.name ?? '',
  slug: category?.slug ?? '',
  description: category?.description ?? '',
  color: category?.color ?? '#2D9CDB',
  sort_order: category?.sort_order ?? 0,
  is_active: category?.is_active ?? true,
});

const AdminPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [session, setSession] = React.useState(null);
  const [adminProfile, setAdminProfile] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [dashboardError, setDashboardError] = React.useState('');
  const [loadingData, setLoadingData] = React.useState(false);

  const [resources, setResources] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [submissions, setSubmissions] = React.useState([]);
  const [claims, setClaims] = React.useState([]);
  const [profiles, setProfiles] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [eventEnquiries, setEventEnquiries] = React.useState([]);
  const [eventFeedback, setEventFeedback] = React.useState([]);
  const [eventKpis, setEventKpis] = React.useState([]);
  const [categoryViews, setCategoryViews] = React.useState([]);

  const [filters, setFilters] = React.useState({
    search: '',
    category: 'all',
    town: 'all',
    verified: 'all',
    featured: 'all',
    updatedWithin: 'all',
  });

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [resourceDraft, setResourceDraft] = React.useState(emptyResourceDraft);
  const [resourceBusy, setResourceBusy] = React.useState(false);
  const [resourceError, setResourceError] = React.useState('');

  const [categoryDraft, setCategoryDraft] = React.useState(emptyCategoryDraft);
  const [categoryBusy, setCategoryBusy] = React.useState(false);
  const [categoryError, setCategoryError] = React.useState('');

  const [submissionNotes, setSubmissionNotes] = React.useState({});
  const [submissionBusyId, setSubmissionBusyId] = React.useState('');
  const [claimNotes, setClaimNotes] = React.useState({});
  const [claimBusyId, setClaimBusyId] = React.useState('');

  const [importPreview, setImportPreview] = React.useState(null);
  const [importBusy, setImportBusy] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const [importSuccess, setImportSuccess] = React.useState('');
  const [postcodeBusy, setPostcodeBusy] = React.useState(false);
  const [postcodeError, setPostcodeError] = React.useState('');
  const [postcodeCandidates, setPostcodeCandidates] = React.useState([]);

  const supabaseReady = isSupabaseConfigured();

  const categoryOptions = React.useMemo(
    () => [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' })),
    [categories],
  );

  const loadDashboardData = React.useCallback(async () => {
    if (!supabase || !adminProfile) return;
    setLoadingData(true);
    setDashboardError('');
    try {
      const [resourcesResult, categoriesResult, submissionsResult, claimsResult, profilesResult, eventsResult, enquiriesResult, feedbackResult, kpisResult, viewsResult] = await Promise.all([
        supabase
          .from('resources')
          .select('id,name,slug,town,summary,description,website,phone,email,address,postcode,latitude,longitude,verified,featured,is_archived,source_type,source_ref,metadata,category_id,updated_at,created_at,resource_categories(id,name,slug,color)')
          .order('updated_at', { ascending: false }),
        supabase
          .from('resource_categories')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true }),
        supabase
          .from('resource_update_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('listing_claims')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('organisation_profiles')
          .select('*')
          .order('updated_at', { ascending: false }),
        supabase
          .from('organisation_events')
          .select('*')
          .order('starts_at', { ascending: true }),
        supabase
          .from('organisation_event_enquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('organisation_event_feedback')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(200),
        supabase
          .from('organisation_event_kpis')
          .select('*')
          .limit(20),
        supabase
          .from('resource_category_view_stats')
          .select('*')
          .limit(5),
      ]);

      if (resourcesResult.error) throw resourcesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setResources(resourcesResult.data ?? []);
      setCategories(categoriesResult.data ?? []);
      setSubmissions(submissionsResult.data ?? []);
      const fallbackClaims = (submissionsResult.data ?? [])
        .filter((submission) => submission.update_type === 'claim_request')
        .map((submission) => ({
          id: submission.id,
          listing_id: submission.resource_id,
          listing_slug: submission.payload?.listing_slug || '',
          listing_title: submission.resource_name,
          full_name: submission.submitter_name,
          org_name: submission.payload?.org_name || '',
          role: submission.payload?.role || '',
          email: submission.submitter_email,
          phone: submission.payload?.phone || '',
          relationship: submission.payload?.relationship || 'Claim request',
          reason: submission.description,
          status: submission.status,
          admin_notes: submission.admin_notes,
          created_at: submission.created_at,
          source: 'fallback_submission',
        }));

      setClaims(claimsResult.error ? fallbackClaims : (claimsResult.data ?? []));
      setProfiles(profilesResult.error ? [] : (profilesResult.data ?? []));
      setEvents(eventsResult.error ? [] : (eventsResult.data ?? []));
      setEventEnquiries(enquiriesResult.error ? [] : (enquiriesResult.data ?? []));
      setEventFeedback(feedbackResult.error ? [] : (feedbackResult.data ?? []));
      setEventKpis(kpisResult.error ? [] : (kpisResult.data ?? []));
      setCategoryViews(viewsResult.error ? [] : (viewsResult.data ?? []));
    } catch (error) {
      setDashboardError(error.message || 'Unable to load dashboard data. Check that Supabase schema has been applied.');
    } finally {
      setLoadingData(false);
    }
  }, [adminProfile]);

  React.useEffect(() => {
    if (!supabaseReady || !supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setLoginError(error.message);
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setAdminProfile(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabaseReady]);

  React.useEffect(() => {
    if (!session || !supabase) return;

    let cancelled = false;

    const loadAdminProfile = async () => {
      setLoadingData(true);
      setDashboardError('');

      if (!ADMIN_EMAIL_ALLOWLIST.includes((session.user.email || '').toLowerCase())) {
        setDashboardError('Your account is authenticated but not approved for admin access.');
        setAdminProfile(null);
        setLoadingData(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('id,user_id,display_name,role,is_active')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        const message = error.message || '';
        const missingAdminTable = message.includes('admin_users')
          && (message.includes('schema cache') || message.includes('does not exist'));

        if (missingAdminTable) {
          setAdminProfile({
            id: 'allowlist-fallback',
            user_id: session.user.id,
            display_name: session.user.email,
            role: 'admin',
            is_active: true,
          });
          setDashboardError('Admin allowlist mode is active because admin_users is missing. Run the SQL migration to enable full role management.');
          setLoadingData(false);
          return;
        }

        setDashboardError(error.message || 'Unable to validate admin access.');
        setAdminProfile(null);
        setLoadingData(false);
        return;
      }

      if (!data || !data.is_active) {
        setDashboardError('Your account is authenticated but not approved for the admin dashboard yet.');
        setAdminProfile(null);
        setLoadingData(false);
        return;
      }

      setAdminProfile(data);
      setLoadingData(false);
    };

    loadAdminProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  React.useEffect(() => {
    if (adminProfile) {
      loadDashboardData();
    }
  }, [adminProfile, loadDashboardData]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setLoginBusy(true);
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message || 'Login failed. Please check your credentials.');
      setLoginBusy(false);
      return;
    }
    // Session should be available for auth listener to pick up
    // Wait briefly for listener to update state
    if (data?.session) {
      // Auth listener will handle session update
      setLoginBusy(false);
    } else {
      setLoginError('Login succeeded but session could not be established.');
      setLoginBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setAdminProfile(null);
    setResources([]);
    setCategories([]);
    setSubmissions([]);
    setClaims([]);
    setProfiles([]);
    setEvents([]);
    setEventEnquiries([]);
    setEventFeedback([]);
    setEventKpis([]);
  };

  const filteredResources = React.useMemo(() => {
    const now = Date.now();
    return resources.filter((resource) => {
      const text = `${resource.name} ${resource.town ?? ''} ${resource.summary ?? ''}`.toLowerCase();
      if (filters.search.trim() && !text.includes(filters.search.trim().toLowerCase())) return false;
      if (filters.category !== 'all' && resource.category_id !== filters.category) return false;
      if (filters.town !== 'all' && (resource.town ?? '') !== filters.town) return false;
      if (filters.verified === 'verified' && !resource.verified) return false;
      if (filters.verified === 'unverified' && resource.verified) return false;
      if (filters.featured === 'featured' && !resource.featured) return false;
      if (filters.featured === 'standard' && resource.featured) return false;
      if (filters.updatedWithin !== 'all') {
        const updatedAt = new Date(resource.updated_at).getTime();
        const maxAgeDays = Number(filters.updatedWithin);
        if (Number.isNaN(updatedAt) || now - updatedAt > maxAgeDays * 86400000) return false;
      }
      return true;
    });
  }, [resources, filters]);

  const towns = React.useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.town).filter(Boolean))).sort(),
    [resources],
  );

  const stats = React.useMemo(() => {
    const activeResources = resources.filter((resource) => !resource.is_archived);
    return {
      total: activeResources.length,
      unverified: activeResources.filter((resource) => !resource.verified).length,
      pendingUpdates: submissions.filter((submission) => submission.status === 'pending').length,
    };
  }, [resources, submissions]);

  const adminEventSummary = React.useMemo(() => {
    const totalEvents = events.length;
    const totalEnquiries = eventEnquiries.length;
    const bookings = eventEnquiries.filter((entry) => entry.cta_type === 'book').length;
    const attended = eventEnquiries.filter((entry) => entry.attendance_status === 'attended').length;
    const noShows = eventEnquiries.filter((entry) => entry.attendance_status === 'no_show').length;
    const avgSatisfaction = eventFeedback.length
      ? (eventFeedback.reduce((sum, item) => sum + (Number(item.satisfaction_score) || 0), 0) / eventFeedback.length).toFixed(1)
      : '0.0';
    const enquiryConversion = totalEnquiries ? Math.round((bookings / totalEnquiries) * 100) : 0;
    return { totalEvents, totalEnquiries, bookings, attended, noShows, avgSatisfaction, enquiryConversion };
  }, [events, eventEnquiries, eventFeedback]);

  const adminMonthlyTrends = React.useMemo(() => {
    const buckets = new Map();
    eventEnquiries.forEach((entry) => {
      const date = new Date(entry.created_at || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = buckets.get(key) || { month: key, enquiries: 0, bookings: 0, attended: 0 };
      current.enquiries += 1;
      if (entry.cta_type === 'book') current.bookings += 1;
      if (entry.attendance_status === 'attended') current.attended += 1;
      buckets.set(key, current);
    });
    return Array.from(buckets.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [eventEnquiries]);

  const adminRecentFeedback = React.useMemo(() => {
    const profileNames = new Map(profiles.map((profile) => [profile.id, profile.display_name]));
    return eventFeedback.slice(0, 6).map((item) => ({
      ...item,
      profileName: profileNames.get(item.organisation_profile_id) || 'Organisation profile',
    }));
  }, [eventFeedback, profiles]);

  const escapeCsv = (value) => `"${`${value ?? ''}`.replace(/"/g, '""')}"`;

  const handleAdminExportCsv = () => {
    const summaryRows = [
      ['Events', adminEventSummary.totalEvents],
      ['Enquiries', adminEventSummary.totalEnquiries],
      ['Bookings', adminEventSummary.bookings],
      ['Attendance', adminEventSummary.attended],
      ['No-shows', adminEventSummary.noShows],
      ['Enquiry conversion', `${adminEventSummary.enquiryConversion}%`],
      ['Average satisfaction', adminEventSummary.avgSatisfaction],
    ].map((row) => row.map(escapeCsv).join(','));
    const kpiRows = eventKpis.map((item) => [
      item.display_name, item.total_events, item.total_bookings, item.attended, item.no_shows, item.total_enquiries, item.avg_satisfaction,
    ].map(escapeCsv).join(','));
    const trendRows = adminMonthlyTrends.map((item) => [item.month, item.enquiries, item.bookings, item.attended].map(escapeCsv).join(','));
    const feedbackRows = adminRecentFeedback.map((item) => [
      item.profileName, formatDate(item.submitted_at), item.satisfaction_score, item.usefulness_score, item.comments || item.outcomes || '',
    ].map(escapeCsv).join(','));
    const csv = [
      'Network metric,Value', ...summaryRows,
      '', 'Organisation,Events,Bookings,Attended,No-shows,Enquiries,Avg satisfaction', ...kpiRows,
      '', 'Month,Enquiries,Bookings,Attended', ...trendRows,
      '', 'Organisation,Submitted,Satisfaction,Usefulness,Comment', ...feedbackRows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspiring-carers-network-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminExportPdf = () => {
    const reportWindow = window.open('', '_blank', 'width=1040,height=760');
    if (!reportWindow) return;
    const kpiMarkup = eventKpis.length
      ? eventKpis.map((item) => `<tr><td>${item.display_name}</td><td>${item.total_events}</td><td>${item.total_bookings}</td><td>${item.attended}</td><td>${item.no_shows}</td><td>${item.avg_satisfaction}</td></tr>`).join('')
      : '<tr><td colspan="6">No KPI data yet.</td></tr>';
    const trendMarkup = adminMonthlyTrends.length
      ? adminMonthlyTrends.map((item) => `<tr><td>${formatMonthLabel(item.month)}</td><td>${item.enquiries}</td><td>${item.bookings}</td><td>${item.attended}</td></tr>`).join('')
      : '<tr><td colspan="4">No trend data yet.</td></tr>';
    const feedbackMarkup = adminRecentFeedback.length
      ? adminRecentFeedback.map((item) => `<tr><td>${item.profileName}</td><td>${formatDate(item.submitted_at)}</td><td>${item.satisfaction_score}/5</td><td>${item.usefulness_score}/5</td><td>${item.comments || item.outcomes || '—'}</td></tr>`).join('')
      : '<tr><td colspan="5">No feedback yet.</td></tr>';
    reportWindow.document.write(`<!doctype html><html><head><title>Inspiring Carers network report</title><style>
      body { font-family: Georgia, serif; padding: 36px; color: #1A2744; }
      h1 { margin: 0 0 6px; font-size: 28px; }
      h2 { margin: 24px 0 10px; font-size: 18px; }
      p { line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
      th, td { border: 1px solid #D9E2F1; padding: 9px; text-align: left; vertical-align: top; }
      th { background: #F2F8FF; }
      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 18px; }
      .metric { border: 1px solid #D9E2F1; border-radius: 12px; padding: 12px; }
      .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #5A6782; }
      .metric-value { font-size: 22px; font-weight: 700; margin-top: 6px; }
    </style></head><body>
      <h1>Inspiring Carers network report</h1>
      <p>Generated ${formatDate(new Date().toISOString())}. Summarises network-wide event delivery, conversion, attendance, and satisfaction across all managed organisation profiles.</p>
      <div class="summary">
        <div class="metric"><div class="metric-label">Events</div><div class="metric-value">${adminEventSummary.totalEvents}</div></div>
        <div class="metric"><div class="metric-label">Bookings</div><div class="metric-value">${adminEventSummary.bookings}</div></div>
        <div class="metric"><div class="metric-label">Attendance</div><div class="metric-value">${adminEventSummary.attended}</div></div>
        <div class="metric"><div class="metric-label">Avg satisfaction</div><div class="metric-value">${adminEventSummary.avgSatisfaction}</div></div>
      </div>
      <h2>Organisation KPIs</h2>
      <table><thead><tr><th>Organisation</th><th>Events</th><th>Bookings</th><th>Attended</th><th>No-shows</th><th>Avg satisfaction</th></tr></thead><tbody>${kpiMarkup}</tbody></table>
      <h2>Monthly network trend</h2>
      <table><thead><tr><th>Month</th><th>Enquiries</th><th>Bookings</th><th>Attended</th></tr></thead><tbody>${trendMarkup}</tbody></table>
      <h2>Recent feedback</h2>
      <table><thead><tr><th>Organisation</th><th>Submitted</th><th>Satisfaction</th><th>Usefulness</th><th>Comment</th></tr></thead><tbody>${feedbackMarkup}</tbody></table>
    </body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  const openNewResource = () => {
    setResourceDraft(emptyResourceDraft);
    setResourceError('');
    setEditorOpen(true);
  };

  const openExistingResource = (resource) => {
    setResourceDraft(normalizeResourceDraft(resource));
    setResourceError('');
    setEditorOpen(true);
  };

  const handleSaveResource = async () => {
    if (!supabase || !session) return;
    setResourceBusy(true);
    setResourceError('');
    try {
      const metadata = resourceDraft.metadataText.trim() ? JSON.parse(resourceDraft.metadataText) : {};
      const importReadyMetadata = {
        ...(metadata.import_ready ?? {}),
        raw_folder: resourceDraft.raw_folder.trim() || null,
        subcategory: resourceDraft.subcategory.trim() || null,
        source_reference: resourceDraft.source_reference.trim() || null,
        needs_review: Boolean(resourceDraft.needs_review),
        last_reviewed_at: resourceDraft.last_reviewed_at || null,
      };

      const payload = {
        name: resourceDraft.name.trim(),
        slug: (resourceDraft.slug || slugify(resourceDraft.name)).trim(),
        category_id: resourceDraft.category_id || null,
        town: resourceDraft.town.trim() || null,
        summary: resourceDraft.summary.trim() || null,
        description: resourceDraft.description.trim() || null,
        website: resourceDraft.website.trim() || null,
        phone: resourceDraft.phone.trim() || null,
        email: resourceDraft.email.trim() || null,
        address: resourceDraft.address.trim() || null,
        postcode: resourceDraft.postcode.trim() || null,
        latitude: resourceDraft.latitude === '' ? null : Number(resourceDraft.latitude),
        longitude: resourceDraft.longitude === '' ? null : Number(resourceDraft.longitude),
        verified: resourceDraft.verified,
        featured: resourceDraft.featured,
        is_archived: resourceDraft.is_archived,
        source_type: resourceDraft.source_type,
        source_ref: resourceDraft.source_reference.trim() || null,
        metadata: {
          ...metadata,
          import_ready: importReadyMetadata,
        },
        updated_by: session.user.id,
      };

      if (!payload.name) throw new Error('Resource name is required.');
      if (!payload.slug) throw new Error('Resource slug is required.');

      let result;
      if (resourceDraft.id) {
        result = await supabase.from('resources').update(payload).eq('id', resourceDraft.id);
      } else {
        result = await supabase.from('resources').insert({ ...payload, created_by: session.user.id });
      }

      if (result.error) throw result.error;

      setEditorOpen(false);
      await loadDashboardData();
    } catch (error) {
      setResourceError(error.message || 'Unable to save resource.');
    } finally {
      setResourceBusy(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!supabase || !resourceDraft.id) return;
    if (!window.confirm('Delete this resource permanently?')) return;
    setResourceBusy(true);
    setResourceError('');
    const { error } = await supabase.from('resources').delete().eq('id', resourceDraft.id);
    if (error) {
      setResourceError(error.message || 'Unable to delete resource.');
      setResourceBusy(false);
      return;
    }
    setEditorOpen(false);
    setResourceBusy(false);
    await loadDashboardData();
  };

  const handleArchiveToggle = async () => {
    if (!supabase || !resourceDraft.id) return;
    setResourceBusy(true);
    setResourceError('');
    const { error } = await supabase
      .from('resources')
      .update({ is_archived: !resourceDraft.is_archived, updated_by: session?.user.id ?? null })
      .eq('id', resourceDraft.id);

    if (error) {
      setResourceError(error.message || 'Unable to archive resource.');
      setResourceBusy(false);
      return;
    }
    setEditorOpen(false);
    setResourceBusy(false);
    await loadDashboardData();
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setCategoryBusy(true);
    setCategoryError('');
    const payload = {
      name: categoryDraft.name.trim(),
      slug: (categoryDraft.slug || slugify(categoryDraft.name)).trim(),
      description: categoryDraft.description.trim() || null,
      color: categoryDraft.color.trim() || '#2D9CDB',
      sort_order: Number(categoryDraft.sort_order) || 0,
      is_active: categoryDraft.is_active,
    };

    if (!payload.name) {
      setCategoryError('Category name is required.');
      setCategoryBusy(false);
      return;
    }

    const result = categoryDraft.id
      ? await supabase.from('resource_categories').update(payload).eq('id', categoryDraft.id)
      : await supabase.from('resource_categories').insert(payload);

    if (result.error) {
      setCategoryError(result.error.message || 'Unable to save category.');
      setCategoryBusy(false);
      return;
    }

    setCategoryDraft(emptyCategoryDraft);
    setCategoryBusy(false);
    await loadDashboardData();
  };

  const handleSubmissionReview = async (submission, status) => {
    if (!supabase || !session) return;
    setSubmissionBusyId(submission.id);
    const { error } = await supabase
      .from('resource_update_submissions')
      .update({
        status,
        admin_notes: submissionNotes[submission.id] || null,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission.id);

    setSubmissionBusyId('');
    if (error) {
      setDashboardError(error.message || 'Unable to update submission status.');
      return;
    }
    await loadDashboardData();
  };

  const handleClaimReview = async (claim, status) => {
    if (!supabase || !session) return;
    setClaimBusyId(claim.id);
    if (claim.source === 'fallback_submission') {
      const { error } = await supabase
        .from('resource_update_submissions')
        .update({
          status,
          admin_notes: claimNotes[claim.id] || null,
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claim.id);

      setClaimBusyId('');
      if (error) {
        setDashboardError(error.message || 'Unable to update claim status.');
        return;
      }
      await loadDashboardData();
      return;
    }

    const { error } = await supabase
      .from('listing_claims')
      .update({
        status,
        admin_notes: claimNotes[claim.id] || null,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', claim.id);

    setClaimBusyId('');
    if (error) {
      setDashboardError(error.message || 'Unable to update claim status.');
      return;
    }
    await loadDashboardData();
  };

  const handleMergeDuplicateClaims = async (claim) => {
    if (!supabase || !session || claim.source === 'fallback_submission') return;
    setClaimBusyId(claim.id);
    const { error } = await supabase
      .from('listing_claims')
      .update({
        status: 'rejected',
        duplicate_of_claim_id: claim.id,
        admin_notes: `Merged into claim ${claim.id}`,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('listing_slug', claim.listing_slug)
      .neq('id', claim.id)
      .in('status', ['pending', 'in_review']);

    setClaimBusyId('');
    if (error) {
      setDashboardError(error.message || 'Unable to merge duplicate claims.');
      return;
    }
    await loadDashboardData();
  };

  const handleConvertClaimToProfile = async (claim) => {
    if (!supabase || !session) return;
    setClaimBusyId(claim.id);
    try {
      const resource = resources.find((item) => item.id === claim.listing_id || item.slug === claim.listing_slug);
      if (!resource) throw new Error('Linked listing could not be found.');

      const existingProfile = profiles.find((profile) => profile.resource_id === resource.id);
      const payload = {
        resource_id: resource.id,
        slug: resource.slug,
        display_name: resource.name,
        bio: resource.description || resource.summary || null,
        website: resource.website || null,
        phone: resource.phone || null,
        email: resource.email || claim.email || null,
        service_categories: [resource.resource_categories?.name || resource.subcategory].filter(Boolean),
        areas_covered: [resource.town].filter(Boolean),
        verified_status: claim.status === 'approved' ? 'claimed' : 'community',
        claim_status: 'claimed',
        featured: Boolean(resource.featured),
        is_active: true,
        updated_by: session.user.id,
      };

      const profileResult = existingProfile
        ? await supabase.from('organisation_profiles').update(payload).eq('id', existingProfile.id).select('*').single()
        : await supabase.from('organisation_profiles').insert({ ...payload, created_by: session.user.id }).select('*').single();
      if (profileResult.error) throw profileResult.error;

      const profile = profileResult.data;
      const membershipResult = await supabase.from('organisation_profile_members').upsert({
        organisation_profile_id: profile.id,
        owner_email: claim.email,
        full_name: claim.full_name,
        role_label: claim.role || 'owner',
        status: 'active',
        created_by: session.user.id,
      }, { onConflict: 'organisation_profile_id,owner_email' });
      if (membershipResult.error) throw membershipResult.error;

      await supabase.from('listing_claims').update({
        status: 'approved',
        admin_notes: claimNotes[claim.id] || 'Converted to managed organisation profile.',
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', claim.id);

      setClaimBusyId('');
      await loadDashboardData();
    } catch (conversionError) {
      setClaimBusyId('');
      setDashboardError(conversionError.message || 'Unable to convert claim into organisation profile.');
    }
  };

  const handleProfileToggle = async (profile, updates) => {
    if (!supabase || !session) return;
    const { error } = await supabase.from('organisation_profiles').update({ ...updates, updated_by: session.user.id }).eq('id', profile.id);
    if (error) {
      setDashboardError(error.message || 'Unable to update organisation profile.');
      return;
    }
    await loadDashboardData();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess('');

    try {
      const fileText = await file.text();
      let rows = [];
      let columns = [];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
        const parsed = JSON.parse(fileText);
        if (!Array.isArray(parsed)) throw new Error('JSON import files must contain an array of objects.');
        rows = parsed;
        columns = Object.keys(parsed[0] || {});
      } else if (extension === 'csv') {
        const parsed = Papa.parse(fileText, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) throw new Error(parsed.errors[0].message);
        rows = parsed.data;
        columns = parsed.meta.fields ?? [];
      } else {
        throw new Error('Only CSV or JSON files are supported in the import prep panel.');
      }

      setImportPreview({
        filename: file.name,
        format: extension,
        rowCount: rows.length,
        columns,
        sampleRows: rows.slice(0, 5),
      });
    } catch (error) {
      setImportPreview(null);
      setImportError(error.message || 'Unable to parse import file.');
    }
  };

  const handleSaveImportDraft = async () => {
    if (!supabase || !session || !importPreview) return;
    setImportBusy(true);
    setImportError('');
    const { error } = await supabase.from('resource_import_jobs').insert({
      filename: importPreview.filename,
      import_format: importPreview.format,
      row_count: importPreview.rowCount,
      field_mapping: { detectedColumns: importPreview.columns },
      preview_payload: importPreview.sampleRows,
      created_by: session.user.id,
      status: 'validated',
    });

    setImportBusy(false);
    if (error) {
      setImportError(error.message || 'Unable to save import draft.');
      return;
    }
    setImportSuccess('Import draft saved to Supabase for future ingestion workflow.');
  };

  const handleLookupPostcode = async () => {
    const postcode = formatUkPostcode(resourceDraft.postcode || '');
    if (!postcode) {
      setPostcodeError('Enter a postcode to find addresses.');
      return;
    }

    setPostcodeBusy(true);
    setPostcodeError('');
    setPostcodeCandidates([]);

    try {
      const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      const postcodePayload = postcodeResponse.ok ? await postcodeResponse.json() : null;
      const postcodeResult = postcodePayload?.status === 200 ? postcodePayload.result : null;

      const fallbackTown = postcodeResult?.admin_district || postcodeResult?.parish || postcodeResult?.admin_ward || '';
      const formattedPostcode = formatUkPostcode(postcodeResult?.postcode || postcode);

      const nominatimQuery = `${formattedPostcode} Cornwall United Kingdom`;
      const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=gb&limit=8&q=${encodeURIComponent(nominatimQuery)}`);
      const nominatimRows = nominatimResponse.ok ? await nominatimResponse.json() : [];

      const candidates = (Array.isArray(nominatimRows) ? nominatimRows : []).map((row, index) => {
        const lat = asNumber(row.lat);
        const lng = asNumber(row.lon);
        const label = row.display_name?.split(',').slice(0, 3).join(', ').trim() || row.display_name || `Address option ${index + 1}`;
        const displayTown = row.address?.town || row.address?.city || row.address?.village || row.address?.county || fallbackTown;

        return {
          id: `${row.place_id || index}`,
          label,
          address: row.display_name || label,
          town: displayTown || '',
          postcode: formattedPostcode,
          latitude: lat,
          longitude: lng,
        };
      });

      if (!candidates.length && postcodeResult) {
        candidates.push({
          id: 'postcode-fallback',
          label: `${formattedPostcode} (${fallbackTown || 'postcode centre'})`,
          address: formattedPostcode,
          town: fallbackTown,
          postcode: formattedPostcode,
          latitude: asNumber(postcodeResult.latitude),
          longitude: asNumber(postcodeResult.longitude),
        });
      }

      if (!candidates.length) {
        setPostcodeError('No addresses found for that postcode. You can still enter details manually.');
        setPostcodeBusy(false);
        return;
      }

      setPostcodeCandidates(candidates);
      setResourceDraft((prev) => ({ ...prev, postcode: formattedPostcode }));
    } catch {
      setPostcodeError('Postcode lookup is temporarily unavailable. You can still enter details manually.');
    } finally {
      setPostcodeBusy(false);
    }
  };

  const handleSelectPostcodeCandidate = (candidateId) => {
    const selected = postcodeCandidates.find((candidate) => candidate.id === candidateId);
    if (!selected) return;

    setResourceDraft((prev) => ({
      ...prev,
      address: selected.address || prev.address,
      town: selected.town || prev.town,
      postcode: selected.postcode || prev.postcode,
      latitude: Number.isFinite(selected.latitude) ? String(selected.latitude) : prev.latitude,
      longitude: Number.isFinite(selected.longitude) ? String(selected.longitude) : prev.longitude,
    }));
  };

  const mapResources = React.useMemo(
    () => filteredResources.filter((resource) => Number.isFinite(Number(resource.latitude)) && Number.isFinite(Number(resource.longitude))),
    [filteredResources],
  );

  if (!supabaseReady) {
    return <AdminSetupState />;
  }

  if (authLoading) {
    return <AdminStatusState title="Checking secure admin session" description="Connecting to Supabase auth and validating your access." />;
  }

  if (!session) {
    return (
      <AdminAuthLayout>
        <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32, borderRadius: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <IconTile tone="navy" size={56} radius={18}><IHub s={26} /></IconTile>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Admin access</div>
              <h1 style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>Cornwall Resource Finder dashboard</h1>
            </div>
          </div>
          <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.7, marginBottom: 24 }}>
            Sign in with your approved Supabase admin account to manage Cornwall resources, categories, and community update submissions.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" type="email" style={fieldStyle} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" style={fieldStyle} />
            {loginError ? <div style={errorTextStyle}>{loginError}</div> : null}
            <button className="btn btn-gold btn-lg" type="submit" disabled={loginBusy}>{loginBusy ? 'Signing in...' : 'Sign in securely'}</button>
          </form>
        </div>
      </AdminAuthLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 52 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ color: '#2D9CDB' }}>Supabase admin</div>
            <h1 style={{ marginTop: 10, fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em' }}>
              Cornwall Resource Finder dashboard
            </h1>
            <p style={{ marginTop: 10, maxWidth: 760, color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>
              Search, verify, feature, import, and govern the Cornwall resource directory from one production-ready admin workspace.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(91,201,74,0.12)', color: '#1A2744', fontWeight: 700, fontSize: 14 }}>
              {adminProfile?.display_name || session.user.email} · {adminProfile?.role || 'admin'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        {dashboardError ? (
          <div className="card" style={{ marginBottom: 22, padding: 18, borderRadius: 22, borderColor: 'rgba(244,97,58,0.28)' }}>
            <div style={{ fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>Admin setup note</div>
            <div style={{ color: 'rgba(26,39,68,0.74)' }}>{dashboardError}</div>
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total resources" value={stats.total} tone="sky" icon={<IHub s={22} />} />
          <StatCard label="Unverified" value={stats.unverified} tone="gold" icon={<IAdvice s={22} />} />
          <StatCard label="Pending updates" value={stats.pendingUpdates} tone="coral" icon={<IWellbeing s={22} />} />
          <StatCard label="Claim requests" value={claims.filter((claim) => claim.status === 'pending').length} tone="navy" icon={<IStar s={22} />} />
          <TopViewedCard items={categoryViews} />
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 26, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="eyebrow" style={{ color: '#5BC94A' }}>Resource management</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Search, verify, and curate live listings</div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={openNewResource}>Create resource</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(26,39,68,0.5)', pointerEvents: 'none' }}>
                <ISearch s={16} />
              </div>
              <input
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search resource name"
                style={{ ...fieldStyle, paddingLeft: 40 }}
              />
            </div>
            <select value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))} style={fieldStyle}>
              <option value="all">All categories</option>
              {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select value={filters.town} onChange={(event) => setFilters((prev) => ({ ...prev, town: event.target.value }))} style={fieldStyle}>
              <option value="all">All towns</option>
              {towns.map((town) => <option key={town} value={town}>{town}</option>)}
            </select>
            <select value={filters.verified} onChange={(event) => setFilters((prev) => ({ ...prev, verified: event.target.value }))} style={fieldStyle}>
              <option value="all">All verification states</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>
            <select value={filters.featured} onChange={(event) => setFilters((prev) => ({ ...prev, featured: event.target.value }))} style={fieldStyle}>
              <option value="all">All feature states</option>
              <option value="featured">Featured only</option>
              <option value="standard">Standard only</option>
            </select>
            <select value={filters.updatedWithin} onChange={(event) => setFilters((prev) => ({ ...prev, updatedWithin: event.target.value }))} style={fieldStyle}>
              {updatedDateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 22, border: '1px solid #EFF1F7' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead style={{ background: '#FAFBFF' }}>
                <tr>
                  {['Name', 'Category', 'Town', 'Complete', 'Verified', 'Featured', 'Updated', 'Status'].map((heading) => (
                    <th key={heading} style={tableHeaderStyle}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id} style={{ borderTop: '1px solid #EFF1F7', cursor: 'pointer' }} onClick={() => openExistingResource(resource)}>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: 700 }}>{resource.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.62)' }}>{resource.slug}</div>
                    </td>
                    <td style={tableCellStyle}>{resource.resource_categories?.name || 'Unassigned'}</td>
                    <td style={tableCellStyle}>{resource.town || 'Not set'}</td>
                    <td style={tableCellStyle}><StatusPill tone={getResourceCompleteness(resource).tone} label={`${getResourceCompleteness(resource).score}%`} /></td>
                    <td style={tableCellStyle}><StatusPill tone={resource.verified ? 'lime' : 'navy'} label={resource.verified ? 'Verified' : 'Needs review'} /></td>
                    <td style={tableCellStyle}><StatusPill tone={resource.featured ? 'gold' : 'sky'} label={resource.featured ? 'Featured' : 'Standard'} /></td>
                    <td style={tableCellStyle}>{formatDate(resource.updated_at)}</td>
                    <td style={tableCellStyle}><StatusPill tone={resource.is_archived ? 'coral' : 'lime'} label={resource.is_archived ? 'Archived' : 'Active'} /></td>
                  </tr>
                ))}
                {!filteredResources.length ? (
                  <tr>
                    <td style={{ ...tableCellStyle, textAlign: 'center', color: 'rgba(26,39,68,0.68)' }} colSpan={8}>
                      {loadingData ? 'Loading resources...' : 'No resources match the current filters.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 26, marginBottom: 24 }}>
          <div className="eyebrow" style={{ color: '#2D9CDB' }}>Location QA</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Resource map overview</div>
          <p style={{ color: 'rgba(26,39,68,0.72)', lineHeight: 1.65, marginBottom: 14 }}>
            Pins show resources with coordinates so you can quickly spot location gaps, clusters, and bad imports.
          </p>
          <AdminResourceMap resources={mapResources} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)', gap: 24, alignItems: 'start' }}>
          <div className="card" style={{ padding: 20, borderRadius: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div className="eyebrow" style={{ color: '#F5A623' }}>Community queue</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>Submitted changes awaiting review</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {submissions.map((submission) => (
                <div key={submission.id} style={{ borderRadius: 20, border: '1px solid #EFF1F7', padding: 16, background: '#FCFDFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{submission.resource_name || 'Unlinked resource update'}</div>
                      <div style={{ marginTop: 4, color: 'rgba(26,39,68,0.66)', fontSize: 13 }}>{submission.update_type} · {formatDate(submission.created_at)}</div>
                    </div>
                    <StatusPill tone={submission.status === 'approved' ? 'lime' : submission.status === 'rejected' ? 'coral' : submission.status === 'in_review' ? 'gold' : 'navy'} label={submission.status.replace('_', ' ')} />
                  </div>
                  <div style={{ color: 'rgba(26,39,68,0.82)', lineHeight: 1.65 }}>{submission.description}</div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(26,39,68,0.66)' }}>
                    {submission.submitter_name || 'Anonymous'}{submission.submitter_email ? ` · ${submission.submitter_email}` : ''}
                  </div>
                  <textarea
                    rows={3}
                    value={submissionNotes[submission.id] ?? submission.admin_notes ?? ''}
                    onChange={(event) => setSubmissionNotes((prev) => ({ ...prev, [submission.id]: event.target.value }))}
                    placeholder="Admin notes"
                    style={{ ...fieldStyle, marginTop: 12, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    {submissionStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={status === 'approved' ? 'btn btn-lime btn-sm' : status === 'rejected' ? 'btn btn-ghost btn-sm' : 'btn btn-sky btn-sm'}
                        disabled={submissionBusyId === submission.id}
                        onClick={() => handleSubmissionReview(submission, status)}
                      >
                        {submissionBusyId === submission.id ? 'Saving...' : status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!submissions.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No submitted changes are waiting in the review queue.</div> : null}
            </div>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #EFF1F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div className="eyebrow" style={{ color: '#7B5CF5' }}>Ownership claims</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>Listing claim requests</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {claims.map((claim) => (
                  <div key={claim.id} style={{ borderRadius: 20, border: '1px solid #EFF1F7', padding: 16, background: '#FCFDFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{claim.listing_title || 'Unlinked listing claim'}</div>
                        <div style={{ marginTop: 4, color: 'rgba(26,39,68,0.66)', fontSize: 13 }}>{claim.relationship || 'Claim'} · {formatDate(claim.created_at)}</div>
                      </div>
                      <StatusPill tone={claim.status === 'approved' ? 'lime' : claim.status === 'rejected' ? 'coral' : claim.status === 'in_review' ? 'gold' : 'navy'} label={claim.status.replace('_', ' ')} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Full name:</strong> {claim.full_name || 'Not provided'}</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Organisation:</strong> {claim.org_name || 'Not provided'}</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Role:</strong> {claim.role || 'Not provided'}</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Email:</strong> {claim.email || 'Not provided'}</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Phone:</strong> {claim.phone || 'Not provided'}</div>
                      <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.82)' }}><strong>Listing slug:</strong> {claim.listing_slug || 'Not linked'}</div>
                    </div>

                    <div style={{ color: 'rgba(26,39,68,0.82)', lineHeight: 1.65, fontSize: 13.5, marginBottom: 10 }}>
                      <strong>Reason / proof:</strong> {claim.reason || 'No details submitted.'}
                    </div>

                    <textarea
                      rows={3}
                      value={claimNotes[claim.id] ?? claim.admin_notes ?? ''}
                      onChange={(event) => setClaimNotes((prev) => ({ ...prev, [claim.id]: event.target.value }))}
                      placeholder="Admin notes for this claim"
                      style={{ ...fieldStyle, marginTop: 12, resize: 'vertical' }}
                    />

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                      {submissionStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={status === 'approved' ? 'btn btn-lime btn-sm' : status === 'rejected' ? 'btn btn-ghost btn-sm' : 'btn btn-sky btn-sm'}
                          disabled={claimBusyId === claim.id}
                          onClick={() => handleClaimReview(claim, status)}
                        >
                          {claimBusyId === claim.id ? 'Saving...' : status.replace('_', ' ')}
                        </button>
                      ))}
                      {claim.source !== 'fallback_submission' ? <button type="button" className="btn btn-ghost btn-sm" disabled={claimBusyId === claim.id} onClick={() => handleMergeDuplicateClaims(claim)}>Merge duplicates</button> : null}
                      <button type="button" className="btn btn-gold btn-sm" disabled={claimBusyId === claim.id} onClick={() => handleConvertClaimToProfile(claim)}>Convert to profile</button>
                    </div>
                  </div>
                ))}
                {!claims.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No listing claims are waiting in the queue.</div> : null}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 24 }}>
            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Categories</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Manage category structure</div>
              <form onSubmit={handleSaveCategory} style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <input value={categoryDraft.name} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Category name" style={fieldStyle} />
                <input value={categoryDraft.slug} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug (optional)" style={fieldStyle} />
                <textarea value={categoryDraft.description} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12 }}>
                  <input value={categoryDraft.color} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, color: event.target.value }))} placeholder="#2D9CDB" style={fieldStyle} />
                  <input value={categoryDraft.sort_order} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, sort_order: event.target.value }))} placeholder="Order" type="number" style={fieldStyle} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1A2744' }}>
                    <input type="checkbox" checked={categoryDraft.is_active} onChange={(event) => setCategoryDraft((prev) => ({ ...prev, is_active: event.target.checked }))} />
                    Active
                  </label>
                </div>
                {categoryError ? <div style={errorTextStyle}>{categoryError}</div> : null}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-gold btn-sm" type="submit" disabled={categoryBusy}>{categoryBusy ? 'Saving...' : (categoryDraft.id ? 'Update category' : 'Create category')}</button>
                  {categoryDraft.id ? <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCategoryDraft(emptyCategoryDraft)}>Cancel edit</button> : null}
                </div>
              </form>

              <div style={{ display: 'grid', gap: 10 }}>
                {categories.map((category) => (
                  <button key={category.id} type="button" onClick={() => setCategoryDraft(normalizeCategoryDraft(category))} style={{ textAlign: 'left', borderRadius: 16, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{category.name}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(26,39,68,0.62)' }}>{category.slug}</div>
                      </div>
                      <span style={{ width: 14, height: 14, borderRadius: 999, background: category.color || '#2D9CDB', display: 'inline-block' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#5BC94A' }}>Import prep</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Validate CSV / JSON before ingest</div>
              <p style={{ color: 'rgba(26,39,68,0.7)', lineHeight: 1.65, marginBottom: 14 }}>
                This panel validates local import files and can save a draft import job in Supabase, ready for a future edge-function ingestion pipeline.
              </p>
              <input type="file" accept=".csv,.json,application/json,text/csv" onChange={handleImportFile} style={{ marginBottom: 14 }} />
              {importError ? <div style={errorTextStyle}>{importError}</div> : null}
              {importPreview ? (
                <div style={{ borderRadius: 18, border: '1px solid #EFF1F7', background: '#FAFBFF', padding: 14 }}>
                  <div style={{ fontWeight: 700 }}>{importPreview.filename}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(26,39,68,0.66)' }}>{importPreview.rowCount} rows · {importPreview.format.toUpperCase()}</div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(26,39,68,0.72)' }}>Columns: {importPreview.columns.join(', ') || 'No columns detected'}</div>
                  <div style={{ marginTop: 12, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
                      <thead>
                        <tr>
                          {importPreview.columns.slice(0, 6).map((column) => <th key={column} style={tableHeaderStyle}>{column}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.sampleRows.map((row, index) => (
                          <tr key={`import-row-${index}`} style={{ borderTop: '1px solid #EFF1F7' }}>
                            {importPreview.columns.slice(0, 6).map((column) => <td key={column} style={tableCellStyle}>{String(row[column] ?? '')}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                    <button className="btn btn-sky btn-sm" type="button" onClick={handleSaveImportDraft} disabled={importBusy}>{importBusy ? 'Saving...' : 'Save import draft'}</button>
                    {importSuccess ? <div style={{ alignSelf: 'center', color: '#1A2744', fontSize: 13 }}>{importSuccess}</div> : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#7B5CF5' }}>Organisation profiles</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Approve, feature, or suspend managed providers</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {profiles.map((profile) => (
                  <div key={profile.id} style={{ borderRadius: 18, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{profile.display_name}</div>
                        <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{profile.slug} · {profile.claim_status} · {profile.verified_status}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleProfileToggle(profile, { featured: !profile.featured })}>{profile.featured ? 'Unfeature' : 'Mark featured'}</button>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleProfileToggle(profile, { is_active: !profile.is_active, claim_status: profile.is_active ? 'suspended' : 'claimed' })}>{profile.is_active ? 'Suspend' : 'Restore'}</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!profiles.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No organisation profiles created yet.</div> : null}
              </div>
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Commissioner summary</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Network-wide engagement snapshot</div>
              <div style={{ color: 'rgba(26,39,68,0.74)', lineHeight: 1.7, fontSize: 14 }}>
                Managed organisations have delivered <strong>{adminEventSummary.totalEvents}</strong> events, generated <strong>{adminEventSummary.bookings}</strong> bookings from <strong>{adminEventSummary.totalEnquiries}</strong> enquiries, recorded <strong>{adminEventSummary.attended}</strong> attendances, and logged an average satisfaction score of <strong>{adminEventSummary.avgSatisfaction}</strong>. Current network enquiry conversion is <strong>{adminEventSummary.enquiryConversion}%</strong>.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <button className="btn btn-sky btn-sm" type="button" onClick={handleAdminExportCsv}>Export network CSV</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={handleAdminExportPdf}>Export network PDF</button>
              </div>
              <div style={{ marginTop: 14, fontSize: 12.5, color: 'rgba(26,39,68,0.58)' }}>Use this as the headline paragraph for stakeholder updates, commissioner decks, and funding summaries.</div>
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#5BC94A' }}>Monthly trend</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Recent network engagement</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {adminMonthlyTrends.map((item) => (
                  <div key={item.month} style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: 10, fontSize: 13.5, color: '#1A2744', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{formatMonthLabel(item.month)}</div>
                    <div>Enquiries {item.enquiries}</div>
                    <div>Bookings {item.bookings}</div>
                    <div>Attended {item.attended}</div>
                  </div>
                ))}
                {!adminMonthlyTrends.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>Monthly trend data will appear once organisations start receiving enquiries.</div> : null}
              </div>
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#F5A623' }}>Recent feedback</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Latest participant sentiment</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {adminRecentFeedback.map((item) => (
                  <div key={item.id} style={{ borderRadius: 18, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                    <div style={{ fontWeight: 700 }}>{item.profileName}</div>
                    <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{formatDate(item.submitted_at)} · Satisfaction {item.satisfaction_score}/5 · Usefulness {item.usefulness_score}/5</div>
                    {item.comments ? <div style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.74)', lineHeight: 1.6 }}>{item.comments}</div> : null}
                  </div>
                ))}
                {!adminRecentFeedback.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>Feedback highlights will appear once organisations record responses.</div> : null}
              </div>
            </div>

            <div className="card" style={{ padding: 20, borderRadius: 26 }}>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Event performance</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Commissioner-ready KPI snapshot</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {eventKpis.map((item) => (
                  <div key={item.organisation_profile_id} style={{ borderRadius: 18, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                    <div style={{ fontWeight: 700 }}>{item.display_name}</div>
                    <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, fontSize: 12.5, color: 'rgba(26,39,68,0.72)' }}>
                      <div>Events: {item.total_events}</div>
                      <div>Bookings: {item.total_bookings}</div>
                      <div>Attendance: {item.attended}</div>
                      <div>No-shows: {item.no_shows}</div>
                      <div>Enquiries: {item.total_enquiries}</div>
                      <div>Feedback: {item.avg_satisfaction}</div>
                    </div>
                  </div>
                ))}
                {!eventKpis.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>KPI reporting will appear once organisation events and responses are recorded.</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editorOpen ? (
        <ResourceEditorModal
          categories={categoryOptions}
          draft={resourceDraft}
          onChange={setResourceDraft}
          onPostcodeLookup={handleLookupPostcode}
          onPostcodeCandidateSelect={handleSelectPostcodeCandidate}
          postcodeCandidates={postcodeCandidates}
          postcodeBusy={postcodeBusy}
          postcodeError={postcodeError}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveResource}
          onDelete={handleDeleteResource}
          onArchiveToggle={handleArchiveToggle}
          busy={resourceBusy}
          error={resourceError}
        />
      ) : null}
    </div>
  );
};

const AdminAuthLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(180deg, #F7FBFF 0%, #FFFFFF 100%)' }}>
    {children}
  </div>
);

const AdminSetupState = () => (
  <AdminAuthLayout>
    <div className="card" style={{ width: '100%', maxWidth: 720, padding: 32, borderRadius: 28 }}>
      <div className="eyebrow" style={{ color: '#2D9CDB' }}>Supabase required</div>
      <h1 style={{ marginTop: 10, fontSize: 34, fontWeight: 800 }}>Admin dashboard is ready for connection</h1>
      <p style={{ marginTop: 14, color: 'rgba(26,39,68,0.74)', lineHeight: 1.7 }}>
        Add your Supabase environment variables and run the schema in supabase/schema.sql. You can immediately gate access with an email allowlist, then enable full role management with admin_users.
      </p>
      <div style={{ marginTop: 18, padding: 18, borderRadius: 18, background: '#FAFBFF', border: '1px solid #EFF1F7', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_EMAIL_ALLOWLIST=pillinganthony@gmail.com
      </div>
    </div>
  </AdminAuthLayout>
);

const AdminStatusState = ({ title, description }) => (
  <AdminAuthLayout>
    <div className="card" style={{ width: '100%', maxWidth: 520, padding: 28, borderRadius: 28, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{title}</div>
      <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.7)', lineHeight: 1.7 }}>{description}</p>
    </div>
  </AdminAuthLayout>
);

const StatCard = ({ label, value, tone, icon }) => (
  <div className="card" style={{ padding: 20, borderRadius: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.62)' }}>{label}</div>
        <div style={{ marginTop: 8, fontSize: 34, fontWeight: 800 }}>{value}</div>
      </div>
      <IconTile tone={tone} size={52} radius={18}>{icon}</IconTile>
    </div>
  </div>
);

const TopViewedCard = ({ items }) => (
  <div className="card" style={{ padding: 20, borderRadius: 24 }}>
    <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.62)' }}>Top viewed categories</div>
    <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
      {items.length ? items.map((item) => (
        <div key={item.category_id || item.category_name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>{item.category_name}</div>
          <div style={{ color: 'rgba(26,39,68,0.68)', fontSize: 13 }}>{item.view_count} views</div>
        </div>
      )) : <div style={{ color: 'rgba(26,39,68,0.68)', lineHeight: 1.6 }}>No view data yet. Once view tracking is live, this card will surface the busiest categories.</div>}
    </div>
  </div>
);

const ResourceEditorModal = ({
  categories,
  draft,
  onChange,
  onPostcodeLookup,
  onPostcodeCandidateSelect,
  postcodeCandidates,
  postcodeBusy,
  postcodeError,
  onClose,
  onSave,
  onDelete,
  onArchiveToggle,
  busy,
  error,
}) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 160, background: 'rgba(15,23,42,0.42)', display: 'grid', placeItems: 'center', padding: 22 }}>
    <div className="card" style={{ width: '100%', maxWidth: 980, maxHeight: '92vh', overflowY: 'auto', padding: 28, borderRadius: 30, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', right: 22, top: 22, width: 42, height: 42, borderRadius: 999, border: '1px solid #E9EEF5', background: '#FFF', display: 'grid', placeItems: 'center' }}>
        <IClose s={18} />
      </button>
      <div className="eyebrow" style={{ color: '#2D9CDB' }}>{draft.id ? 'Edit resource' : 'Create resource'}</div>
      <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 800 }}>Resource record</h2>
      <div style={{ marginTop: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.62)' }}>Record completeness</div>
          <div style={{ fontWeight: 700, color: '#1A2744' }}>{getResourceCompleteness(draft).score}% ({getResourceCompleteness(draft).filled}/{getResourceCompleteness(draft).total})</div>
        </div>
        <div style={{ width: '100%', height: 10, borderRadius: 999, background: '#EEF2FA', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${getResourceCompleteness(draft).score}%`,
              borderRadius: 999,
              background: getResourceCompleteness(draft).tone === 'lime' ? '#5BC94A' : getResourceCompleteness(draft).tone === 'gold' ? '#F5A623' : '#F4613A',
              transition: 'width 160ms ease',
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <input value={draft.name} onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))} placeholder="Resource name" style={fieldStyle} />
        <input value={draft.slug} onChange={(event) => onChange((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" style={fieldStyle} />
        <select value={draft.category_id} onChange={(event) => onChange((prev) => ({ ...prev, category_id: event.target.value }))} style={fieldStyle}>
          <option value="">{categories.length ? 'Choose category' : 'No categories yet - create one first'}</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input value={draft.town} onChange={(event) => onChange((prev) => ({ ...prev, town: event.target.value }))} placeholder="Town" style={fieldStyle} />
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        <input value={draft.summary} onChange={(event) => onChange((prev) => ({ ...prev, summary: event.target.value }))} placeholder="Summary" style={fieldStyle} />
        <textarea value={draft.description} onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))} placeholder="Full description" rows={6} style={{ ...fieldStyle, resize: 'vertical' }} />
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <input value={draft.website} onChange={(event) => onChange((prev) => ({ ...prev, website: event.target.value }))} placeholder="Website" style={fieldStyle} />
        <input value={draft.phone} onChange={(event) => onChange((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone" style={fieldStyle} />
        <input value={draft.email} onChange={(event) => onChange((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" style={fieldStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
          <input value={draft.postcode} onChange={(event) => onChange((prev) => ({ ...prev, postcode: event.target.value }))} placeholder="Postcode" style={fieldStyle} />
          <button className="btn btn-sky btn-sm" type="button" onClick={onPostcodeLookup} disabled={postcodeBusy}>
            {postcodeBusy ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
      </div>

      {postcodeError ? <div style={{ ...errorTextStyle, marginTop: 10 }}>{postcodeError}</div> : null}
      {postcodeCandidates.length ? (
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.68)' }}>Select an address candidate (manual edits are still allowed):</div>
          <select
            value=""
            onChange={(event) => onPostcodeCandidateSelect(event.target.value)}
            style={fieldStyle}
          >
            <option value="">Choose address candidate</option>
            {postcodeCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        <input value={draft.address} onChange={(event) => onChange((prev) => ({ ...prev, address: event.target.value }))} placeholder="Address" style={fieldStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <input value={draft.latitude} onChange={(event) => onChange((prev) => ({ ...prev, latitude: event.target.value }))} placeholder="Latitude" style={fieldStyle} />
          <input value={draft.longitude} onChange={(event) => onChange((prev) => ({ ...prev, longitude: event.target.value }))} placeholder="Longitude" style={fieldStyle} />
          <select value={draft.source_type} onChange={(event) => onChange((prev) => ({ ...prev, source_type: event.target.value }))} style={fieldStyle}>
            {['manual', 'kml', 'csv', 'json', 'community'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <input value={draft.source_reference} onChange={(event) => onChange((prev) => ({ ...prev, source_reference: event.target.value }))} placeholder="Source reference" style={fieldStyle} />
          <input value={draft.subcategory} onChange={(event) => onChange((prev) => ({ ...prev, subcategory: event.target.value }))} placeholder="Subcategory" style={fieldStyle} />
          <input value={draft.raw_folder} onChange={(event) => onChange((prev) => ({ ...prev, raw_folder: event.target.value }))} placeholder="Raw folder" style={fieldStyle} />
          <input value={draft.last_reviewed_at} onChange={(event) => onChange((prev) => ({ ...prev, last_reviewed_at: event.target.value }))} placeholder="Last reviewed at" type="date" style={fieldStyle} />
        </div>
        <textarea value={draft.metadataText} onChange={(event) => onChange((prev) => ({ ...prev, metadataText: event.target.value }))} placeholder="Metadata JSON" rows={6} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'monospace' }} />
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 16 }}>
        <label style={checkboxLabelStyle}><input type="checkbox" checked={draft.verified} onChange={(event) => onChange((prev) => ({ ...prev, verified: event.target.checked }))} /> Verified</label>
        <label style={checkboxLabelStyle}><input type="checkbox" checked={draft.needs_review} onChange={(event) => onChange((prev) => ({ ...prev, needs_review: event.target.checked }))} /> Needs review</label>
        <label style={checkboxLabelStyle}><input type="checkbox" checked={draft.featured} onChange={(event) => onChange((prev) => ({ ...prev, featured: event.target.checked }))} /> Featured</label>
        <label style={checkboxLabelStyle}><input type="checkbox" checked={draft.is_archived} onChange={(event) => onChange((prev) => ({ ...prev, is_archived: event.target.checked }))} /> Archived</label>
      </div>

      {error ? <div style={{ ...errorTextStyle, marginTop: 14 }}>{error}</div> : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-gold btn-sm" type="button" onClick={onSave} disabled={busy}>{busy ? 'Saving...' : 'Save resource'}</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
        {draft.id ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onArchiveToggle}>{draft.is_archived ? 'Restore' : 'Archive'}</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onDelete}>Delete</button>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

const AdminResourceMap = ({ resources }) => {
  const mapCenter = React.useMemo(() => {
    if (!resources.length) return CORNWALL_CENTER;

    const latSum = resources.reduce((sum, item) => sum + Number(item.latitude || 0), 0);
    const lngSum = resources.reduce((sum, item) => sum + Number(item.longitude || 0), 0);
    return [latSum / resources.length, lngSum / resources.length];
  }, [resources]);

  if (!resources.length) {
    return (
      <div style={{ borderRadius: 20, border: '1px dashed #D8E2F2', background: '#FAFBFF', padding: 20, color: 'rgba(26,39,68,0.68)' }}>
        No coordinates available in the current filtered results. Add postcode/lat-lng to display map pins.
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #E9EEF5' }}>
      <MapContainer center={mapCenter} zoom={10} style={{ height: 360, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {resources.map((resource) => (
          <Marker key={resource.id} position={[Number(resource.latitude), Number(resource.longitude)]}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700 }}>{resource.name}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#334155' }}>{resource.address || resource.town || 'No address set'}</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>Completeness: {getResourceCompleteness(resource).score}%</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const StatusPill = ({ label, tone }) => {
  const tones = {
    lime: 'rgba(91,201,74,0.16)',
    gold: 'rgba(245,166,35,0.16)',
    sky: 'rgba(45,156,219,0.16)',
    coral: 'rgba(244,97,58,0.16)',
    navy: 'rgba(26,39,68,0.08)',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: 999, background: tones[tone] || tones.navy, color: '#1A2744', fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
};

const fieldStyle = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #E9EEF5',
  padding: '13px 14px',
  fontSize: 14,
  color: '#1A2744',
  background: '#FAFBFF',
};

const errorTextStyle = {
  color: '#A03A2D',
  fontSize: 13,
  fontWeight: 600,
};

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(26,39,68,0.62)',
};

const tableCellStyle = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#1A2744',
  verticalAlign: 'top',
};

const checkboxLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: '#1A2744',
  fontWeight: 600,
};

export default AdminPage;
