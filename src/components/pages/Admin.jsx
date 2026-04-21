import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

const ADMIN_EMAIL_ALLOWLIST = (import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST || 'pillinganthony@gmail.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

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

const getProfileName = (profile, resources = []) => {
  if (!profile) return 'Organisation profile';
  const linkedResource = resources.find((resource) => `${resource.id}` === `${profile.resource_id}`) || null;
  return `${profile.name || linkedResource?.name || profile.slug || profile.owner_email || 'Organisation profile'}`.trim();
};

const isPendingStatus = (value) => {
  const status = `${value || ''}`.trim().toLowerCase();
  if (!status) return true;
  return ['pending', 'in_review', 'new', 'submitted'].includes(status);
};

const emptyCategory = { id: null, name: '', slug: '', sort_order: 0, active: true };
const emptyResource = {
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
};
const emptyProfile = {
  id: null,
  name: '',
  slug: '',
  resource_id: '',
  owner_email: '',
  email: '',
  website: '',
  is_active: true,
};
const emptyEvent = {
  id: null,
  organisation_profile_id: '',
  title: '',
  slug: '',
  event_type: 'community meetup',
  description: '',
  starts_at: '',
  ends_at: '',
  location: '',
  cta_type: 'contact',
  booking_url: '',
  contact_email: '',
  status: 'scheduled',
};

const QueueCard = ({ title, rows, onUpdateStatus, formatRow }) => (
  <div className="card" style={{ padding: 18, borderRadius: 18 }}>
    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
      {rows.length ? rows.map((row) => (
        <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 10, background: '#FFF' }}>
          <div style={{ fontSize: 14 }}>{formatRow(row)}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(26,39,68,0.65)' }}>Status: {row.status || 'pending'}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(row.id, 'approved')}>Approve</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(row.id, 'rejected')}>Reject</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(row.id, 'in_review')}>In review</button>
          </div>
        </div>
      )) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No pending items.</div>}
    </div>
  </div>
);

const AdminPage = ({ onNavigate, session, sessionLoading = false }) => {
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState('');

  const [tab, setTab] = React.useState('overview');

  const [categories, setCategories] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  const [profiles, setProfiles] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [claims, setClaims] = React.useState([]);
  const [resourceUpdates, setResourceUpdates] = React.useState([]);
  const [walkUpdates, setWalkUpdates] = React.useState([]);
  const [walkComments, setWalkComments] = React.useState([]);

  const [categoryDraft, setCategoryDraft] = React.useState(emptyCategory);
  const [resourceDraft, setResourceDraft] = React.useState(emptyResource);
  const [profileDraft, setProfileDraft] = React.useState(emptyProfile);
  const [eventDraft, setEventDraft] = React.useState(emptyEvent);

  const canAccessAdmin = React.useMemo(() => {
    const email = `${session?.user?.email || ''}`.trim().toLowerCase();
    return Boolean(email && ADMIN_EMAIL_ALLOWLIST.includes(email));
  }, [session]);

  const loadData = React.useCallback(async () => {
    if (!session || !canAccessAdmin || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [
        categoriesResult,
        resourcesResult,
        profilesResult,
        eventsResult,
        claimsResult,
        resourceUpdatesResult,
        walkUpdatesResult,
        walkCommentsResult,
      ] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('resources').select('*').order('name', { ascending: true }),
        supabase.from('organisation_profiles').select('*'),
        supabase.from('organisation_events').select('*'),
        supabase.from('listing_claims').select('*').order('created_at', { ascending: false }),
        supabase.from('resource_update_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('walk_risk_updates').select('*').order('created_at', { ascending: false }),
        supabase.from('walk_comments').select('*').order('created_at', { ascending: false }),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (resourcesResult.error) throw resourcesResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (eventsResult.error) throw eventsResult.error;

      setCategories(categoriesResult.data || []);
      setResources(resourcesResult.data || []);
  setProfiles((profilesResult.data || []).slice().sort((left, right) => getProfileName(left, resourcesResult.data || []).localeCompare(getProfileName(right, resourcesResult.data || []), 'en', { sensitivity: 'base' })));
      setEvents((eventsResult.data || []).slice().sort((left, right) => `${left.starts_at || ''}`.localeCompare(`${right.starts_at || ''}`)));
      const claimRows = claimsResult.error
        ? (resourceUpdatesResult.data || [])
          .filter((row) => `${row.update_type || ''}`.toLowerCase() === 'claim_request')
          .map((row) => ({
            id: row.id,
            listing_id: row.resource_id,
            listing_title: row.resource_name || row.listing_title || 'Claim request',
            org_name: row.payload?.org_name || '',
            full_name: row.submitter_name || row.payload?.full_name || '',
            email: row.submitter_email || row.payload?.email || '',
            status: row.status || 'pending',
            created_at: row.created_at,
            source: 'resource_update_submissions',
          }))
        : (claimsResult.data || []);

      setClaims(claimRows);
      setResourceUpdates((resourceUpdatesResult.data || []).filter((row) => `${row.update_type || ''}`.toLowerCase() !== 'claim_request'));
      setWalkUpdates(walkUpdatesResult.data || []);
      setWalkComments(walkCommentsResult.data || []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [session, canAccessAdmin]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const withBusy = async (action, successMessage) => {
    setBusy(true);
    setError('');
    try {
      await action();
      if (successMessage) setToast(successMessage);
      await loadData();
    } catch (actionError) {
      setError(actionError?.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const saveCategory = async () => {
    if (!categoryDraft.name.trim()) {
      setError('Category name is required.');
      return;
    }

    const payload = {
      name: categoryDraft.name.trim(),
      slug: slugify(categoryDraft.slug || categoryDraft.name),
      sort_order: Number(categoryDraft.sort_order) || 0,
      active: Boolean(categoryDraft.active),
    };

    await withBusy(async () => {
      const result = categoryDraft.id
        ? await supabase.from('categories').update(payload).eq('id', categoryDraft.id)
        : await supabase.from('categories').insert(payload);
      if (result.error) throw result.error;
      setCategoryDraft(emptyCategory);
    }, categoryDraft.id ? 'Category updated.' : 'Category created.');
  };

  const saveResource = async () => {
    if (!resourceDraft.name.trim()) {
      setError('Resource name is required.');
      return;
    }

    const payload = {
      name: resourceDraft.name.trim(),
      slug: slugify(resourceDraft.slug || resourceDraft.name),
      category_id: resourceDraft.category_id || null,
      town: resourceDraft.town?.trim() || null,
      summary: resourceDraft.summary?.trim() || null,
      description: resourceDraft.description?.trim() || null,
      website: resourceDraft.website?.trim() || null,
      phone: resourceDraft.phone?.trim() || null,
      email: resourceDraft.email?.trim() || null,
      address: resourceDraft.address?.trim() || null,
      postcode: resourceDraft.postcode?.trim() || null,
      latitude: resourceDraft.latitude === '' ? null : Number(resourceDraft.latitude),
      longitude: resourceDraft.longitude === '' ? null : Number(resourceDraft.longitude),
      verified: Boolean(resourceDraft.verified),
      featured: Boolean(resourceDraft.featured),
      is_archived: Boolean(resourceDraft.is_archived),
      updated_by: session?.user?.id || null,
    };

    await withBusy(async () => {
      const result = resourceDraft.id
        ? await supabase.from('resources').update(payload).eq('id', resourceDraft.id)
        : await supabase.from('resources').insert({ ...payload, created_by: session?.user?.id || null });
      if (result.error) throw result.error;
      setResourceDraft(emptyResource);
    }, resourceDraft.id ? 'Resource updated.' : 'Resource created.');
  };

  const saveProfile = async () => {
    if (!profileDraft.name.trim()) {
      setError('Profile name is required.');
      return;
    }

    const payload = {
      name: profileDraft.name.trim(),
      slug: slugify(profileDraft.slug || profileDraft.name),
      resource_id: profileDraft.resource_id || null,
      owner_email: profileDraft.owner_email?.trim() || null,
      email: profileDraft.email?.trim() || null,
      website: profileDraft.website?.trim() || null,
      is_active: Boolean(profileDraft.is_active),
      updated_by: session?.user?.id || null,
    };

    await withBusy(async () => {
      const result = profileDraft.id
        ? await supabase.from('organisation_profiles').update(payload).eq('id', profileDraft.id)
        : await supabase.from('organisation_profiles').insert({ ...payload, created_by: session?.user?.id || null });
      if (result.error) throw result.error;
      setProfileDraft(emptyProfile);
    }, profileDraft.id ? 'Profile updated.' : 'Profile created.');
  };

  const saveEvent = async () => {
    if (!eventDraft.organisation_profile_id || !eventDraft.title.trim() || !eventDraft.starts_at) {
      setError('Profile, title, and start date are required.');
      return;
    }

    const payload = {
      organisation_profile_id: eventDraft.organisation_profile_id,
      title: eventDraft.title.trim(),
      slug: slugify(eventDraft.slug || eventDraft.title),
      event_type: eventDraft.event_type?.trim() || 'community meetup',
      description: eventDraft.description?.trim() || null,
      starts_at: eventDraft.starts_at,
      ends_at: eventDraft.ends_at || null,
      location: eventDraft.location?.trim() || null,
      cta_type: eventDraft.cta_type,
      booking_url: eventDraft.booking_url?.trim() || null,
      contact_email: eventDraft.contact_email?.trim() || null,
      status: eventDraft.status,
      updated_by: session?.user?.id || null,
    };

    await withBusy(async () => {
      const result = eventDraft.id
        ? await supabase.from('organisation_events').update(payload).eq('id', eventDraft.id)
        : await supabase.from('organisation_events').insert({ ...payload, created_by: session?.user?.id || null });
      if (result.error) throw result.error;
      setEventDraft(emptyEvent);
    }, eventDraft.id ? 'Event updated.' : 'Event created.');
  };

  const deleteRow = async (table, id, message) => {
    await withBusy(async () => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) throw deleteError;
    }, message);
  };

  const applyApprovedClaimOwnership = async (claim) => {
    if (!claim || !supabase) return;
    const ownerEmail = `${claim.email || ''}`.trim().toLowerCase();
    if (!ownerEmail) return;

    const linkedResource = resources.find((resource) => `${resource.id}` === `${claim.listing_id}`) || null;
    const displayName = `${claim.org_name || claim.listing_title || linkedResource?.name || 'Claimed organisation'}`.trim();
    const slugBase = slugify(claim.listing_slug || displayName) || `claimed-${Date.now()}`;

    if (claim.listing_id) {
      const { data: existingProfile, error: profileLookupError } = await supabase
        .from('organisation_profiles')
        .select('id')
        .eq('resource_id', claim.listing_id)
        .maybeSingle();
      if (profileLookupError) throw profileLookupError;

      if (existingProfile?.id) {
        const { error: updateError } = await supabase
          .from('organisation_profiles')
          .update({
            owner_email: ownerEmail,
            email: ownerEmail,
            is_active: true,
            updated_by: session?.user?.id || null,
          })
          .eq('id', existingProfile.id);
        if (updateError) throw updateError;
        return;
      }

      const { error: insertError } = await supabase.from('organisation_profiles').insert({
        resource_id: claim.listing_id,
        name: displayName,
        slug: `${slugBase}-${`${claim.listing_id}`.slice(-6)}`,
        owner_email: ownerEmail,
        email: ownerEmail,
        is_active: true,
        created_by: session?.user?.id || null,
      });
      if (insertError) throw insertError;
      return;
    }

    const { error: fallbackInsertError } = await supabase.from('organisation_profiles').insert({
      name: displayName,
      slug: `${slugBase}-${Date.now()}`,
      owner_email: ownerEmail,
      email: ownerEmail,
      is_active: true,
      created_by: session?.user?.id || null,
    });
    if (fallbackInsertError) throw fallbackInsertError;
  };

  const updateQueueStatus = async (table, id, status) => {
    await withBusy(async () => {
      const { error: updateError } = await supabase.from(table).update({ status }).eq('id', id);
      if (updateError) throw updateError;

      if (table === 'listing_claims' && status === 'approved') {
        const claim = claims.find((row) => `${row.id}` === `${id}`) || null;
        await applyApprovedClaimOwnership(claim);
      }
    }, 'Status updated.');
  };

  if (!session) {
    if (sessionLoading) {
      return (
        <>
          <Nav activePage="admin" onNavigate={onNavigate} />
          <section style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
            <div className="card" style={{ padding: 24 }}>Checking session…</div>
          </section>
          <Footer onNavigate={onNavigate} />
        </>
      );
    }
    return (
      <>
        <Nav activePage="admin" onNavigate={onNavigate} />
        <section style={{ minHeight: '60vh', paddingTop: 46, paddingBottom: 60 }}>
          <div className="container">
            <div className="card" style={{ padding: 24 }}>
              <h1 style={{ fontSize: 34 }}>Sign in required</h1>
              <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Please sign in first to access the admin dashboard.</p>
              <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={() => onNavigate('login')}>Go to login</button>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  if (!canAccessAdmin) {
    return (
      <>
        <Nav activePage="admin" onNavigate={onNavigate} />
        <section style={{ minHeight: '60vh', paddingTop: 46, paddingBottom: 60 }}>
          <div className="container">
            <div className="card" style={{ padding: 24 }}>
              <h1 style={{ fontSize: 34 }}>Admin access denied</h1>
              <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Your account is signed in but not included in the admin allowlist.</p>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  const pendingClaims = claims.filter((row) => isPendingStatus(row.status));
  const pendingResourceUpdates = resourceUpdates.filter((row) => isPendingStatus(row.status));
  const pendingWalkUpdates = walkUpdates.filter((row) => isPendingStatus(row.status));
  const pendingWalkComments = walkComments.filter((row) => isPendingStatus(row.status));

  return (
    <>
      <Nav activePage="admin" onNavigate={onNavigate} />
      <section style={{ paddingTop: 36, paddingBottom: 74, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ display: 'grid', gap: 14 }}>
          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Live schema mode: categories, resources, organisation_profiles, organisation_events, listing_claims, resource_update_submissions, walk_risk_updates, walk_comments.</p>
            {error ? <div style={{ marginTop: 10, color: '#A03A2D', fontWeight: 700 }}>{error}</div> : null}
            {toast ? <div style={{ marginTop: 10, color: '#2D6B1F', fontWeight: 700 }}>{toast}</div> : null}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['overview', 'moderation', 'categories', 'resources', 'profiles', 'events'].map((key) => (
              <button key={key} className="btn btn-ghost btn-sm" onClick={() => setTab(key)} style={{ borderColor: tab === key ? '#1A2744' : undefined, fontWeight: tab === key ? 700 : 600 }}>{key}</button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={busy || loading} onClick={loadData}>Refresh</button>
          </div>

          {loading ? <div className="card" style={{ padding: 20 }}>Loading dashboard...</div> : null}

          {!loading && tab === 'overview' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
              {[
                ['Categories', categories.length],
                ['Resources', resources.length],
                ['Profiles', profiles.length],
                ['Events', events.length],
                ['Pending claims', pendingClaims.length],
                ['Pending updates', pendingResourceUpdates.length + pendingWalkUpdates.length + pendingWalkComments.length],
              ].map(([label, value]) => (
                <div key={label} className="card" style={{ padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ marginTop: 6, fontSize: 30, fontWeight: 800 }}>{value}</div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && tab === 'moderation' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <QueueCard
                title="Listing claims"
                rows={pendingClaims}
                onUpdateStatus={(id, status) => updateQueueStatus('listing_claims', id, status)}
                formatRow={(row) => `${row.listing_title || row.org_name || 'Claim'} · ${row.full_name || row.email || 'Unknown'}`}
              />
              <QueueCard
                title="Resource updates"
                rows={pendingResourceUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('resource_update_submissions', id, status)}
                formatRow={(row) => `${row.listing_title || row.resource_name || row.resource_id || 'Submission'} · ${row.submitter_name || row.submitted_by || row.submitter_email || row.email || 'Unknown'}`}
              />
              <QueueCard
                title="Walk risk updates"
                rows={pendingWalkUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('walk_risk_updates', id, status)}
                formatRow={(row) => `${row.walk_name || row.walk_id || 'Walk'} · ${row.update_type || 'update'}`}
              />
              <QueueCard
                title="Walk comments"
                rows={pendingWalkComments}
                onUpdateStatus={(id, status) => updateQueueStatus('walk_comments', id, status)}
                formatRow={(row) => `${row.walk_name || row.walk_id || 'Walk'} · ${row.commenter_name || 'Anonymous'}`}
              />
            </div>
          ) : null}

          {!loading && tab === 'categories' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Category CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                <input value={categoryDraft.name} onChange={(e) => setCategoryDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Name" style={inputStyle} />
                <input value={categoryDraft.slug} onChange={(e) => setCategoryDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <input type="number" value={categoryDraft.sort_order} onChange={(e) => setCategoryDraft((p) => ({ ...p, sort_order: e.target.value }))} placeholder="Sort" style={inputStyle} />
              </div>
              <label style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={Boolean(categoryDraft.active)} onChange={(e) => setCategoryDraft((p) => ({ ...p, active: e.target.checked }))} /> Active</label>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn btn-gold" disabled={busy} onClick={saveCategory}>{categoryDraft.id ? 'Update' : 'Create'} category</button>
                {categoryDraft.id ? <button className="btn btn-ghost" onClick={() => setCategoryDraft(emptyCategory)}>Cancel</button> : null}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {categories.map((row) => (
                  <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>{row.name} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.slug})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setCategoryDraft(row)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('categories', row.id, 'Category deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && tab === 'resources' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Resource CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                <input value={resourceDraft.name} onChange={(e) => setResourceDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Name" style={inputStyle} />
                <input value={resourceDraft.slug} onChange={(e) => setResourceDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={resourceDraft.category_id} onChange={(e) => setResourceDraft((p) => ({ ...p, category_id: e.target.value }))} style={inputStyle}>
                  <option value="">Category</option>
                  {categories.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                </select>
                <input value={resourceDraft.town} onChange={(e) => setResourceDraft((p) => ({ ...p, town: e.target.value }))} placeholder="Town" style={inputStyle} />
                <input value={resourceDraft.website} onChange={(e) => setResourceDraft((p) => ({ ...p, website: e.target.value }))} placeholder="Website" style={inputStyle} />
                <input value={resourceDraft.phone} onChange={(e) => setResourceDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" style={inputStyle} />
                <input value={resourceDraft.email} onChange={(e) => setResourceDraft((p) => ({ ...p, email: e.target.value }))} placeholder="Email" style={inputStyle} />
                <input value={resourceDraft.address} onChange={(e) => setResourceDraft((p) => ({ ...p, address: e.target.value }))} placeholder="Address" style={inputStyle} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={resourceDraft.postcode} onChange={(e) => setResourceDraft((p) => ({ ...p, postcode: e.target.value }))} placeholder="Postcode" style={{ ...inputStyle, flex: 1 }} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ whiteSpace: 'nowrap', alignSelf: 'stretch', padding: '0 10px' }}
                    disabled={!resourceDraft.postcode?.trim()}
                    onClick={async () => {
                      const pc = resourceDraft.postcode.trim().replace(/\s+/g, '');
                      try {
                        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
                        const json = await res.json();
                        if (json.status === 200 && json.result) {
                          const town = json.result.admin_district || json.result.admin_ward || json.result.parish || json.result.nuts || json.result.region || '';
                          const formattedPostcode = json.result.postcode || resourceDraft.postcode;
                          const addressFallback = [town, formattedPostcode].filter(Boolean).join(', ');
                          setResourceDraft((p) => ({
                            ...p,
                            postcode: formattedPostcode || p.postcode,
                            town: town || p.town,
                            address: `${p.address || ''}`.trim() ? p.address : addressFallback,
                            latitude: String(json.result.latitude),
                            longitude: String(json.result.longitude),
                          }));
                        } else {
                          alert('Postcode not found. Check the postcode and try again.');
                        }
                      } catch {
                        alert('Postcode lookup failed. Check your internet connection.');
                      }
                    }}
                  >
                    Lookup →
                  </button>
                </div>
                <input value={resourceDraft.latitude} onChange={(e) => setResourceDraft((p) => ({ ...p, latitude: e.target.value }))} placeholder="Latitude" style={inputStyle} />
                <input value={resourceDraft.longitude} onChange={(e) => setResourceDraft((p) => ({ ...p, longitude: e.target.value }))} placeholder="Longitude" style={inputStyle} />
              </div>
              <textarea value={resourceDraft.summary} onChange={(e) => setResourceDraft((p) => ({ ...p, summary: e.target.value }))} placeholder="Summary" rows={2} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
              <textarea value={resourceDraft.description} onChange={(e) => setResourceDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
              <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label><input type="checkbox" checked={Boolean(resourceDraft.verified)} onChange={(e) => setResourceDraft((p) => ({ ...p, verified: e.target.checked }))} /> Verified</label>
                <label><input type="checkbox" checked={Boolean(resourceDraft.featured)} onChange={(e) => setResourceDraft((p) => ({ ...p, featured: e.target.checked }))} /> Featured</label>
                <label><input type="checkbox" checked={Boolean(resourceDraft.is_archived)} onChange={(e) => setResourceDraft((p) => ({ ...p, is_archived: e.target.checked }))} /> Archived</label>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn btn-gold" disabled={busy} onClick={saveResource}>{resourceDraft.id ? 'Update' : 'Create'} resource</button>
                {resourceDraft.id ? <button className="btn btn-ghost" onClick={() => setResourceDraft(emptyResource)}>Cancel</button> : null}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {resources.map((row) => (
                  <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>{row.name} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.town || 'No town'})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setResourceDraft({ ...emptyResource, ...row, category_id: row.category_id || '' })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('resources', row.id, 'Resource deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && tab === 'profiles' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Organisation profile CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                <input value={profileDraft.name} onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Profile name" style={inputStyle} />
                <input value={profileDraft.slug} onChange={(e) => setProfileDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={profileDraft.resource_id} onChange={(e) => setProfileDraft((p) => ({ ...p, resource_id: e.target.value }))} style={inputStyle}>
                  <option value="">Linked resource</option>
                  {resources.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                </select>
                <input value={profileDraft.owner_email} onChange={(e) => setProfileDraft((p) => ({ ...p, owner_email: e.target.value }))} placeholder="Owner email" style={inputStyle} />
                <input value={profileDraft.email} onChange={(e) => setProfileDraft((p) => ({ ...p, email: e.target.value }))} placeholder="Profile email" style={inputStyle} />
                <input value={profileDraft.website} onChange={(e) => setProfileDraft((p) => ({ ...p, website: e.target.value }))} placeholder="Website" style={inputStyle} />
              </div>
              <label style={{ marginTop: 10, display: 'inline-flex', gap: 8 }}><input type="checkbox" checked={Boolean(profileDraft.is_active)} onChange={(e) => setProfileDraft((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn btn-gold" disabled={busy} onClick={saveProfile}>{profileDraft.id ? 'Update' : 'Create'} profile</button>
                {profileDraft.id ? <button className="btn btn-ghost" onClick={() => setProfileDraft(emptyProfile)}>Cancel</button> : null}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {profiles.map((row) => (
                  <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>{getProfileName(row, resources)} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.owner_email || 'No owner email'})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setProfileDraft({ ...emptyProfile, ...row, name: row.name || '', resource_id: row.resource_id || '' })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('organisation_profiles', row.id, 'Profile deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && tab === 'events' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Event CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                <select value={eventDraft.organisation_profile_id} onChange={(e) => setEventDraft((p) => ({ ...p, organisation_profile_id: e.target.value }))} style={inputStyle}>
                  <option value="">Organisation profile</option>
                  {profiles.map((row) => <option key={row.id} value={row.id}>{getProfileName(row, resources)}</option>)}
                </select>
                <input value={eventDraft.title} onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
                <input value={eventDraft.slug} onChange={(e) => setEventDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={eventDraft.event_type} onChange={(e) => setEventDraft((p) => ({ ...p, event_type: e.target.value }))} style={inputStyle}>
                  <option value="community meetup">Community meetup</option>
                  <option value="support group">Support group</option>
                  <option value="workshop">Workshop</option>
                  <option value="training">Training</option>
                  <option value="drop-in">Drop-in</option>
                  <option value="information session">Information session</option>
                </select>
                <input type="datetime-local" value={eventDraft.starts_at} onChange={(e) => setEventDraft((p) => ({ ...p, starts_at: e.target.value }))} style={inputStyle} />
                <input type="datetime-local" value={eventDraft.ends_at} onChange={(e) => setEventDraft((p) => ({ ...p, ends_at: e.target.value }))} style={inputStyle} />
                <input value={eventDraft.location} onChange={(e) => setEventDraft((p) => ({ ...p, location: e.target.value }))} placeholder="Location" style={inputStyle} />
                <select value={eventDraft.cta_type} onChange={(e) => setEventDraft((p) => ({ ...p, cta_type: e.target.value }))} style={inputStyle}>
                  <option value="contact">Contact</option>
                  <option value="book">Book</option>
                </select>
                <input value={eventDraft.contact_email} onChange={(e) => setEventDraft((p) => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email" style={inputStyle} />
                <input value={eventDraft.booking_url} onChange={(e) => setEventDraft((p) => ({ ...p, booking_url: e.target.value }))} placeholder="Booking URL" style={inputStyle} />
                <select value={eventDraft.status} onChange={(e) => setEventDraft((p) => ({ ...p, status: e.target.value }))} style={inputStyle}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <textarea value={eventDraft.description} onChange={(e) => setEventDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn btn-gold" disabled={busy} onClick={saveEvent}>{eventDraft.id ? 'Update' : 'Create'} event</button>
                {eventDraft.id ? <button className="btn btn-ghost" onClick={() => setEventDraft(emptyEvent)}>Cancel</button> : null}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {events.map((row) => (
                  <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>{row.title} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.status || 'scheduled'})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEventDraft({ ...emptyEvent, ...row, starts_at: row.starts_at ? row.starts_at.slice(0, 16) : '', ends_at: row.ends_at ? row.ends_at.slice(0, 16) : '' })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('organisation_events', row.id, 'Event deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default AdminPage;
