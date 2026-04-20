import React from 'react';
import Papa from 'papaparse';
import Icons from '../Icons.jsx';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js';

const { IconTile, IArrow, IClose, ISearch, IHub, IAdvice, IWellbeing, IStar } = Icons;

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
  source_ref: '',
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

const normalizeResourceDraft = (resource) => ({
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
  source_ref: resource?.source_ref ?? '',
  metadataText: JSON.stringify(resource?.metadata ?? {}, null, 2),
});

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

  const [importPreview, setImportPreview] = React.useState(null);
  const [importBusy, setImportBusy] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const [importSuccess, setImportSuccess] = React.useState('');

  const supabaseReady = isSupabaseConfigured();

  const loadDashboardData = React.useCallback(async () => {
    if (!supabase || !adminProfile) return;
    setLoadingData(true);
    setDashboardError('');
    try {
      const [resourcesResult, categoriesResult, submissionsResult, viewsResult] = await Promise.all([
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

      // Verify email is authorized for admin access
      if (session.user.email !== 'pillinganthony@gmail.com') {
        setDashboardError('Your email address is not authorized for admin access. Contact your administrator for approval.');
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
        source_ref: resourceDraft.source_ref.trim() || null,
        metadata,
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
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
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
                  {['Name', 'Category', 'Town', 'Verified', 'Featured', 'Updated', 'Status'].map((heading) => (
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
                    <td style={tableCellStyle}><StatusPill tone={resource.verified ? 'lime' : 'navy'} label={resource.verified ? 'Verified' : 'Needs review'} /></td>
                    <td style={tableCellStyle}><StatusPill tone={resource.featured ? 'gold' : 'sky'} label={resource.featured ? 'Featured' : 'Standard'} /></td>
                    <td style={tableCellStyle}>{formatDate(resource.updated_at)}</td>
                    <td style={tableCellStyle}><StatusPill tone={resource.is_archived ? 'coral' : 'lime'} label={resource.is_archived ? 'Archived' : 'Active'} /></td>
                  </tr>
                ))}
                {!filteredResources.length ? (
                  <tr>
                    <td style={{ ...tableCellStyle, textAlign: 'center', color: 'rgba(26,39,68,0.68)' }} colSpan={7}>
                      {loadingData ? 'Loading resources...' : 'No resources match the current filters.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
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
          </div>
        </div>
      </div>

      {editorOpen ? (
        <ResourceEditorModal
          categories={categories}
          draft={resourceDraft}
          onChange={setResourceDraft}
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
        Add your Supabase environment variables, run the schema in supabase/schema.sql, and create at least one active row in admin_users tied to a Supabase auth account.
      </p>
      <div style={{ marginTop: 18, padding: 18, borderRadius: 18, background: '#FAFBFF', border: '1px solid #EFF1F7', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
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

const ResourceEditorModal = ({ categories, draft, onChange, onClose, onSave, onDelete, onArchiveToggle, busy, error }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 160, background: 'rgba(15,23,42,0.42)', display: 'grid', placeItems: 'center', padding: 22 }}>
    <div className="card" style={{ width: '100%', maxWidth: 980, maxHeight: '92vh', overflowY: 'auto', padding: 28, borderRadius: 30, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', right: 22, top: 22, width: 42, height: 42, borderRadius: 999, border: '1px solid #E9EEF5', background: '#FFF', display: 'grid', placeItems: 'center' }}>
        <IClose s={18} />
      </button>
      <div className="eyebrow" style={{ color: '#2D9CDB' }}>{draft.id ? 'Edit resource' : 'Create resource'}</div>
      <h2 style={{ marginTop: 10, fontSize: 32, fontWeight: 800 }}>Resource record</h2>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <input value={draft.name} onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))} placeholder="Resource name" style={fieldStyle} />
        <input value={draft.slug} onChange={(event) => onChange((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" style={fieldStyle} />
        <select value={draft.category_id} onChange={(event) => onChange((prev) => ({ ...prev, category_id: event.target.value }))} style={fieldStyle}>
          <option value="">Choose category</option>
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
        <input value={draft.postcode} onChange={(event) => onChange((prev) => ({ ...prev, postcode: event.target.value }))} placeholder="Postcode" style={fieldStyle} />
      </div>

      <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        <input value={draft.address} onChange={(event) => onChange((prev) => ({ ...prev, address: event.target.value }))} placeholder="Address" style={fieldStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <input value={draft.latitude} onChange={(event) => onChange((prev) => ({ ...prev, latitude: event.target.value }))} placeholder="Latitude" style={fieldStyle} />
          <input value={draft.longitude} onChange={(event) => onChange((prev) => ({ ...prev, longitude: event.target.value }))} placeholder="Longitude" style={fieldStyle} />
          <select value={draft.source_type} onChange={(event) => onChange((prev) => ({ ...prev, source_type: event.target.value }))} style={fieldStyle}>
            {['manual', 'kml', 'csv', 'json', 'community'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <input value={draft.source_ref} onChange={(event) => onChange((prev) => ({ ...prev, source_ref: event.target.value }))} placeholder="Source reference" style={fieldStyle} />
        </div>
        <textarea value={draft.metadataText} onChange={(event) => onChange((prev) => ({ ...prev, metadataText: event.target.value }))} placeholder="Metadata JSON" rows={6} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'monospace' }} />
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 16 }}>
        <label style={checkboxLabelStyle}><input type="checkbox" checked={draft.verified} onChange={(event) => onChange((prev) => ({ ...prev, verified: event.target.checked }))} /> Verified</label>
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
