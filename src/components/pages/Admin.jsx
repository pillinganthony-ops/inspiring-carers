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

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getProfilePlaceholderLabel = (profileId) => {
  const value = `${profileId || ''}`.trim();
  if (!value) return 'Organisation profile';
  return `Selected profile (${value.slice(0, 8)})`;
};

const normalizeSelectValue = (value) => `${value ?? ''}`.trim();

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

const toSimpleEnquiryState = (value) => {
  const normalized = `${value || ''}`.trim().toLowerCase();
  if (normalized === 'contacted') return 'contacted';
  if (['confirmed', 'completed', 'cancelled', 'resolved'].includes(normalized)) return 'resolved';
  return 'new';
};

const buildAddressCandidate = ({ id, label, address, town, postcode, latitude, longitude }) => ({
  id: `${id}`,
  label: `${label || address || postcode || 'Address option'}`.trim(),
  address: `${address || ''}`.trim(),
  town: `${town || ''}`.trim(),
  postcode: `${postcode || ''}`.trim(),
  latitude: asNumber(latitude),
  longitude: asNumber(longitude),
});

const dedupeAddressCandidates = (candidates) => {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.address}|${candidate.postcode}|${candidate.latitude}|${candidate.longitude}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getProfileName = (profile, resources = []) => {
  if (!profile) return 'Organisation profile';
  const linkedResource = resources.find((resource) => `${resource.id}` === `${profile.resource_id}`) || null;
  return `${profile.organisation_name || profile.display_name || profile.name || linkedResource?.name || profile.slug || 'Organisation profile'}`.trim();
};

// Extract only the human-written section from the structured buildAdminReason output.
const extractClaimMessage = (reason) => {
  if (!reason) return '';
  const marker = 'Supporting message from claimant:';
  const idx = reason.indexOf(marker);
  if (idx !== -1) return reason.slice(idx + marker.length).trim();
  return reason.trim();
};

const isPendingStatus = (value) => {
  const status = `${value || ''}`.trim().toLowerCase();
  if (!status) return true;
  return ['pending', 'in_review', 'new', 'submitted'].includes(status);
};

const isExactPendingStatus = (value) => `${value || ''}`.trim().toLowerCase() === 'pending';
const isApprovedStatus = (value) => `${value || ''}`.trim().toLowerCase() === 'approved';
const isInReviewStatus = (value) => `${value || ''}`.trim().toLowerCase() === 'in_review';
const isRejectedStatus = (value) => `${value || ''}`.trim().toLowerCase() === 'rejected';
const isCreatedStatus = (value) => ['created', 'published'].includes(`${value || ''}`.trim().toLowerCase());

const formatAdminDate = (value) => {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getModerationStatusMeta = (value) => {
  const status = `${value || 'pending'}`.trim().toLowerCase();
  if (status === 'approved') return { label: 'Approved', color: '#1E5E3D', background: 'rgba(46, 164, 79, 0.10)', border: 'rgba(46, 164, 79, 0.18)' };
  if (status === 'in_review') return { label: 'In review', color: '#8A5A00', background: 'rgba(245, 166, 35, 0.12)', border: 'rgba(245, 166, 35, 0.22)' };
  if (status === 'rejected') return { label: 'Rejected', color: '#A03A2D', background: 'rgba(212, 80, 80, 0.10)', border: 'rgba(212, 80, 80, 0.18)' };
  if (isCreatedStatus(status)) return { label: status === 'published' ? 'Published' : 'Created', color: '#0B5CAD', background: 'rgba(18, 99, 214, 0.10)', border: 'rgba(18, 99, 214, 0.16)' };
  return { label: 'Pending', color: '#5B4B00', background: 'rgba(255, 210, 63, 0.16)', border: 'rgba(255, 210, 63, 0.26)' };
};

const normalizeAdminCategoryRows = (rows) => (
  (rows || [])
    .map((row) => ({
      id: row.id,
      name: `${row.name || ''}`.trim(),
      slug: `${row.slug || row.name || ''}`.trim() ? slugify(row.slug || row.name) : '',
      active: row.active !== false,
      sort_order: Number(row.sort_order) || 0,
      _derived: false, // explicitly real — rows from the categories DB table
    }))
    .filter((row) => row.id !== null && row.id !== undefined && row.name)
    .sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }))
);

const deriveAdminCategoryFallback = (resourcesRows) => {
  const byKey = new Map();
  (resourcesRows || []).forEach((row) => {
    const id = row?.category_id ?? null;
    const rawName = `${
      row?.category_name ||
      row?.category ||
      row?.category_label ||
      resolveAdminCatLabel(row?.category_slug) ||
      row?.resource_type ||
      row?.type ||
      ''
    }`.trim();
    const key = id !== null && id !== undefined ? `id:${id}` : '';
    if (!key || byKey.has(key)) return;
    byKey.set(key, {
      id,
      name: rawName || `Category ${id}`,
      slug: slugify(rawName || `category-${id}`),
      active: true,
      sort_order: 999,
      _derived: true,
    });
  });
  return Array.from(byKey.values()).sort((left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }));
};

const extractSubmissionResourceId = (row) => {
  if (row?.resource_id) return row.resource_id;
  const notes = `${row?.admin_notes || ''}`;
  const match = notes.match(/resource id:\s*([a-z0-9-]+)/i);
  return match ? match[1] : null;
};

const hasCreationConfirmation = (row) => {
  const notes = `${row?.admin_notes || ''}`.toLowerCase();
  return notes.includes('listing created') || notes.includes('live listing created') || notes.includes('resource id:');
};

const isCreatedSubmission = (row) => Boolean(extractSubmissionResourceId(row) || hasCreationConfirmation(row) || isCreatedStatus(row?.status));

const normalizeNameForMatch = (value) => `${value || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

const parseSubmissionReason = (reasonText) => {
  const details = { summary: '', category: '', town: '', website: '' };
  `${reasonText || ''}`.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('Summary:')) details.summary = trimmed.slice('Summary:'.length).trim();
    if (trimmed.startsWith('Category:')) details.category = trimmed.slice('Category:'.length).trim();
    if (trimmed.startsWith('Town:')) details.town = trimmed.slice('Town:'.length).trim();
    if (trimmed.startsWith('Website:')) details.website = trimmed.slice('Website:'.length).trim();
  });
  return details;
};

const findCategoryIdByLabel = (categories, label) => {
  const normalizedLabel = normalizeNameForMatch(label);
  if (!normalizedLabel) return '';
  return categories.find((category) => normalizeNameForMatch(category.name) === normalizedLabel)?.id || '';
};

// updated_by / created_by are NOT in the live legacy resources table.
// The expansion migration is additive and does not modify that table.
// Only send columns confirmed to exist in the live schema.
const buildResourcePayloadFromDraft = (draft) => ({
  name: draft.name.trim(),
  slug: slugify(draft.slug || draft.name),
  category_id: draft.category_id || null,
  town: draft.town?.trim() || null,
  summary: draft.summary?.trim() || null,
  description: draft.description?.trim() || null,
  website: draft.website?.trim() || null,
  phone: draft.phone?.trim() || null,
  email: draft.email?.trim() || null,
  address: draft.address?.trim() || null,
  postcode: draft.postcode?.trim() || null,
  latitude: draft.latitude === '' ? null : Number(draft.latitude),
  longitude: draft.longitude === '' ? null : Number(draft.longitude),
  verified: Boolean(draft.verified),
  featured: Boolean(draft.featured),
  is_archived: Boolean(draft.is_archived),
});

const buildLiveListingInsertPayload = (draft) => {
  const payload = {
    name: draft.name.trim(),
    slug: slugify(draft.slug || draft.name),
    is_archived: false,
  };

  const optionalFields = {
    email: draft.email?.trim() || null,
    phone: draft.phone?.trim() || null,
    website: draft.website?.trim() || null,
    summary: draft.summary?.trim() || null,
    description: draft.description?.trim() || null,
    town: draft.town?.trim() || null,
    address: draft.address?.trim() || null,
    postcode: draft.postcode?.trim() || null,
  };

  Object.entries(optionalFields).forEach(([key, value]) => {
    if (value) payload[key] = value;
  });

  if (draft.category_id) payload.category_id = draft.category_id;

  return payload;
};

const normalizeResourceUpdateRow = (row) => {
  const title = `${row.organisation_name || row.listing_name || row.listing_title || row.resource_name || row.resource_id || ''}`.trim();
  const submitter = `${row.submitter_name || row.submitted_by || row.submitter_email || row.email || ''}`.trim();
  const type = `${row.update_type || row.relationship_to_organisation || 'submission'}`.trim();
  const summary = `${row.description || row.reason || ''}`.trim();

  return {
    ...row,
    _queueTitle: title || 'Submission',
    _queueSubmitter: submitter || 'Unknown',
    _queueType: type || 'submission',
    _queueSummary: summary || 'Limited legacy row shape: no description available.',
    _usesFallbackShape: !row.update_type && !row.description,
  };
};

const findSubmissionDuplicateMatches = ({ submission, resources, profiles }) => {
  const organizationName = `${submission?.organisation_name || submission?._queueTitle || ''}`.trim();
  const normalizedTarget = normalizeNameForMatch(organizationName);
  const targetSlug = slugify(organizationName);
  if (!normalizedTarget) return [];

  const resourceMatches = resources
    .filter((resource) => {
      const resourceName = normalizeNameForMatch(resource.name);
      const resourceSlug = slugify(resource.slug || resource.name);
      return resourceName === normalizedTarget || resourceSlug === targetSlug || resourceName.includes(normalizedTarget) || normalizedTarget.includes(resourceName);
    })
    .map((resource) => ({
      key: `resource-${resource.id}`,
      type: 'resource',
      id: resource.id,
      label: resource.name || 'Existing resource',
      slug: resource.slug || '',
      secondary: resource.town || resource.email || 'Existing live listing',
    }));

  const profileMatches = profiles
    .filter((profile) => {
      const profileName = normalizeNameForMatch(getProfileName(profile, resources));
      return profileName && (profileName === normalizedTarget || profileName.includes(normalizedTarget) || normalizedTarget.includes(profileName));
    })
    .map((profile) => ({
      key: `profile-${profile.id}`,
      type: 'profile',
      id: profile.id,
      label: getProfileName(profile, resources),
      slug: profile.slug || '',
      resourceId: profile.resource_id || null,
      secondary: 'Existing organisation profile',
    }));

  return [...resourceMatches, ...profileMatches].filter((match, index, allMatches) => allMatches.findIndex((entry) => entry.key === match.key) === index);
};

const buildResourceDraftFromSubmission = ({ submission, categories }) => {
  const details = parseSubmissionReason(submission.reason || submission._queueSummary || '');
  const organizationName = `${submission.organisation_name || submission._queueTitle || ''}`.trim();
  return {
    ...emptyResource,
    name: organizationName,
    slug: slugify(organizationName),
    category_id: findCategoryIdByLabel(categories, details.category),
    town: details.town || '',
    summary: details.summary || (organizationName ? `Local support from ${organizationName}.` : ''),
    description: submission.reason || '',
    website: details.website || '',
    phone: submission.submitter_phone || '',
    email: submission.submitter_email || '',
  };
};

const CreateListingModal = ({ submission, draft, categories, duplicateMatches, allowDuplicateCreate, onToggleDuplicateCreate, onChangeDraft, onClose, onOpenExisting, onCreate, busy }) => {
  if (!submission || !draft) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(15,23,42,0.50)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '28px 26px', width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>×</button>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.55)' }}>Create live listing</div>
        <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: '#1A2744' }}>{submission.organisation_name || submission._queueTitle || 'New submission'}</h2>
        <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.68)', lineHeight: 1.6 }}>This creates a live `resources` listing only. It does not auto-create an organisation profile or claim ownership record.</p>

        {duplicateMatches.length ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 18, border: '1px solid rgba(245,166,35,0.28)', background: 'linear-gradient(180deg, rgba(255,248,230,0.96) 0%, rgba(255,252,244,1) 100%)', boxShadow: '0 18px 34px rgba(122,84,0,0.08)' }}>
            <div style={{ fontWeight: 800, color: '#7A5400' }}>Warning: similar listing already exists</div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(26,39,68,0.72)' }}>Review these matches before creating a second live listing.</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {duplicateMatches.map((match) => (
                <div key={match.key} style={{ border: '1px solid rgba(26,39,68,0.08)', borderRadius: 14, padding: 12, background: 'white', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2744' }}>{match.label}</div>
                    <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.6)' }}>{match.secondary}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onOpenExisting(match)}>Open existing</button>
                    {match.slug ? <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/find-help/${match.slug}`, '_blank', 'noopener,noreferrer')}>View listing</button> : null}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold btn-sm" onClick={() => onToggleDuplicateCreate(true)}>Continue anyway</button>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <input value={draft.name} onChange={(event) => onChangeDraft('name', event.target.value)} placeholder="Name" style={inputStyle} />
          <input value={draft.slug} onChange={(event) => onChangeDraft('slug', event.target.value)} placeholder="Slug" style={inputStyle} />
          <select value={draft.category_id} onChange={(event) => onChangeDraft('category_id', event.target.value)} style={inputStyle}>
            <option value="">{categories.length ? 'Category (optional)' : 'No categories available'}</option>
            {categories.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
          <input value={draft.town} onChange={(event) => onChangeDraft('town', event.target.value)} placeholder="Town" style={inputStyle} />
          <input value={draft.website} onChange={(event) => onChangeDraft('website', event.target.value)} placeholder="Website" style={inputStyle} />
          <input value={draft.phone} onChange={(event) => onChangeDraft('phone', event.target.value)} placeholder="Phone" style={inputStyle} />
          <input value={draft.email} onChange={(event) => onChangeDraft('email', event.target.value)} placeholder="Email" style={inputStyle} />
          <input value={draft.address} onChange={(event) => onChangeDraft('address', event.target.value)} placeholder="Address" style={inputStyle} />
          <input value={draft.postcode} onChange={(event) => onChangeDraft('postcode', event.target.value)} placeholder="Postcode" style={inputStyle} />
        </div>
        <textarea value={draft.summary} onChange={(event) => onChangeDraft('summary', event.target.value)} placeholder="Summary" rows={2} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
        <textarea value={draft.description} onChange={(event) => onChangeDraft('description', event.target.value)} placeholder="Description" rows={4} style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }} />
        {!categories.length ? <div style={{ marginTop: 8, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>No categories are available from the live table right now. You can still create the listing without one.</div> : null}
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label><input type="checkbox" checked={Boolean(draft.verified)} onChange={(event) => onChangeDraft('verified', event.target.checked)} /> Verified</label>
          <label><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => onChangeDraft('featured', event.target.checked)} /> Featured</label>
          <label><input type="checkbox" checked={Boolean(draft.is_archived)} onChange={(event) => onChangeDraft('is_archived', event.target.checked)} /> Archived</label>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={busy || (duplicateMatches.length > 0 && !allowDuplicateCreate)} onClick={onCreate}>{busy ? 'Creating...' : 'Create live listing'}</button>
        </div>
      </div>
    </div>
  );
};

// Live schema: organisation_name (NOT NULL), individual social URL columns.
// normalizeProfileRow handles both old and new column names for backwards
// compatibility when reading legacy rows that pre-date the schema migration.
const PROFILE_SOCIAL_COLUMNS = ['facebook_url','instagram_url','linkedin_url','youtube_url','tiktok_url','x_url','threads_url','whatsapp_url'];
const PROFILE_SOCIAL_LABELS = { facebook_url:'Facebook', instagram_url:'Instagram', linkedin_url:'LinkedIn', youtube_url:'YouTube', tiktok_url:'TikTok', x_url:'X / Twitter', threads_url:'Threads', whatsapp_url:'WhatsApp' };
const PROFILE_SOCIAL_PLACEHOLDERS = { facebook_url:'https://facebook.com/…', instagram_url:'https://instagram.com/…', linkedin_url:'https://linkedin.com/…', youtube_url:'https://youtube.com/@…', tiktok_url:'https://tiktok.com/@…', x_url:'https://x.com/…', threads_url:'https://threads.net/…', whatsapp_url:'+44 7700 000000 or wa.me/…' };

const normalizeProfileRow = (row) => {
  if (!row) return {};
  const base = {
    id: row.id,
    organisation_name: row.organisation_name || row.display_name || row.name || '',
    slug: row.slug || '',
    resource_id: row.resource_id || '',
    contact_email: row.contact_email || row.email || '',
    contact_phone: row.contact_phone || row.phone || '',
    website_url: row.website_url || row.website || '',
    short_bio: row.short_bio || row.bio || '',
    full_bio: row.full_bio || row.description || '',
    logo_url: row.logo_url || '',
    banner_url: row.banner_url || row.cover_image_url || '',
    package_name: row.package_name || '',
    entitlement_status: row.entitlement_status || 'inactive',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    featured_enabled: Boolean(row.featured_enabled),
    event_quota: Number(row.event_quota) || 0,
    enquiry_tools_enabled: Boolean(row.enquiry_tools_enabled),
    analytics_enabled: Boolean(row.analytics_enabled),
    is_active: row.is_active !== false,
  };
  PROFILE_SOCIAL_COLUMNS.forEach((col) => { base[col] = row[col] || ''; });
  return base;
};

// Minimal INSERT payload when creating a profile from a resource drawer.
const buildLiveProfileInsert = (resourceDraft) => {
  const orgName = `${resourceDraft.name || ''}`.trim();
  return {
    resource_id: resourceDraft.id,
    organisation_name: orgName,
    slug: `${slugify(orgName)}-${String(resourceDraft.id).slice(-6)}`,
    short_bio: resourceDraft.summary?.trim() || null,
    full_bio: resourceDraft.description?.trim() || null,
    contact_email: resourceDraft.email?.trim() || null,
    contact_phone: resourceDraft.phone?.trim() || null,
    website_url: resourceDraft.website?.trim() || null,
  };
};

// Full payload for profile CRUD tab save.
const buildLiveProfilePayload = (profileDraft) => {
  const payload = {
    organisation_name: `${profileDraft.organisation_name || ''}`.trim(),
    slug: slugify(profileDraft.slug || profileDraft.organisation_name),
    resource_id: profileDraft.resource_id || null,
    contact_email: profileDraft.contact_email?.trim() || null,
    contact_phone: profileDraft.contact_phone?.trim() || null,
    website_url: profileDraft.website_url?.trim() || null,
    short_bio: profileDraft.short_bio?.trim() || null,
    full_bio: profileDraft.full_bio?.trim() || null,
    package_name: profileDraft.package_name?.trim() || null,
    entitlement_status: profileDraft.entitlement_status || 'inactive',
    start_date: profileDraft.start_date || null,
    end_date: profileDraft.end_date || null,
    featured_enabled: Boolean(profileDraft.featured_enabled),
    event_quota: Math.max(0, Number(profileDraft.event_quota) || 0),
    enquiry_tools_enabled: Boolean(profileDraft.enquiry_tools_enabled),
    analytics_enabled: Boolean(profileDraft.analytics_enabled),
    is_active: Boolean(profileDraft.is_active),
  };
  PROFILE_SOCIAL_COLUMNS.forEach((col) => { payload[col] = profileDraft[col]?.trim() || null; });
  return payload;
};

/* ─── Category slug → label resolver ─────────────────────── */
const ADMIN_CAT_LABELS = {
  'mental-health-wellbeing': 'Mental Health',
  'carer-support': 'Carers',
  carers: 'Carers',
  'health-medical-support': 'Health & Medical',
  'advice-guidance': 'Advice',
  'housing-homelessness': 'Housing',
  'food-essentials': 'Food',
  'family-children': 'Families',
  'older-people-support': 'Older People',
  'community-groups-social-connection': 'Community',
  'faith-spiritual-support': 'Faith',
  'employment-skills': 'Employment & Skills',
  'crisis-safety-support': 'Crisis Support',
  'disability-accessibility': 'Disability',
  'transport-access': 'Transport',
  'nature-activity-outdoors': 'Outdoors',
  'activities-things-to-do': 'Activities',
};
const resolveAdminCatLabel = (slug) => {
  if (!slug) return '';
  const s = `${slug}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return ADMIN_CAT_LABELS[s] || '';
};

/* ─── organisation_profiles compatibility INSERT / UPDATE ─── */
// Retries the operation, stripping one unrecognised column per attempt.
// Column name cascade for the required name field:
//   organisation_name (live schema) → name (old schema fallback)
const _orgProfileColFallback = (missing, attempt) => {
  if (missing === 'organisation_name' && 'organisation_name' in attempt) {
    const next = { ...attempt, name: attempt.organisation_name };
    delete next.organisation_name;
    return { attempt: next, note: 'organisation_name→name' };
  }
  if (missing === 'display_name' && 'display_name' in attempt) {
    const next = { ...attempt, organisation_name: attempt.display_name };
    delete next.display_name;
    return { attempt: next, note: 'display_name→organisation_name' };
  }
  if (missing in attempt) {
    const { [missing]: _removed, ...rest } = attempt;
    return { attempt: rest, note: missing };
  }
  return null;
};

const insertOrgProfileCompat = async (supabaseClient, payload) => {
  let attempt = { ...payload };
  const stripped = [];
  for (let i = 0; i < 20; i++) {
    const result = await supabaseClient
      .from('organisation_profiles')
      .insert(attempt)
      .select('id')
      .single();
    if (!result.error) return { data: result.data, stripped };
    const msg = `${result.error?.message || result.error?.details || ''}`;
    const colMatch = msg.match(/find the ['"`]?(\w+)['"`]? column/i)
      || msg.match(/column ['"`]?(\w+)['"`]? of/i);
    if (!colMatch?.[1]) throw result.error;
    const fallback = _orgProfileColFallback(colMatch[1], attempt);
    if (!fallback) throw result.error;
    attempt = fallback.attempt;
    stripped.push(fallback.note);
  }
  throw new Error('Too many schema compatibility retries on organisation_profiles insert.');
};

const updateOrgProfileCompat = async (supabaseClient, id, payload, selectCols = 'id') => {
  let attempt = { ...payload };
  const stripped = [];
  for (let i = 0; i < 20; i++) {
    const result = await supabaseClient
      .from('organisation_profiles')
      .update(attempt)
      .eq('id', id)
      .select(selectCols);
    if (!result.error) {
      if (!result.data || result.data.length === 0) {
        throw new Error(
          `Organisation profile update matched 0 rows (profile id: ${id}). ` +
          `RLS is likely blocking the write. ` +
          `Fix: add a Supabase UPDATE policy on organisation_profiles — see deliverable SQL below.`,
        );
      }
      return { stripped, data: result.data };
    }
    const msg = `${result.error?.message || result.error?.details || ''}`;
    const colMatch = msg.match(/find the ['"`]?(\w+)['"`]? column/i)
      || msg.match(/column ['"`]?(\w+)['"`]? of/i);
    if (!colMatch?.[1]) throw result.error;
    const fallback = _orgProfileColFallback(colMatch[1], attempt);
    if (!fallback) throw result.error;
    attempt = fallback.attempt;
    stripped.push(fallback.note);
  }
  throw new Error('Too many schema compatibility retries on organisation_profiles update.');
};

const SOCIAL_SELECT_COLS = 'id, organisation_name, facebook_url, instagram_url, linkedin_url, youtube_url, tiktok_url, x_url, threads_url, whatsapp_url';

// Upsert an organisation_profile_members row so is_profile_owner() returns true.
// Called after every claim approval. organisation_profile_members.owner_email is a
// separate column on that join table — distinct from organisation_profiles ownership.
// Non-fatal — profile access via created_by still works if this fails.
const ensureProfileMemberAccess = async (supabaseClient, profileId, ownerEmail) => {
  if (!profileId || !ownerEmail) return;
  const { error } = await supabaseClient
    .from('organisation_profile_members')
    .upsert(
      {
        organisation_profile_id: profileId,
        owner_email: ownerEmail.toLowerCase(),
        role_label: 'owner',
        status: 'active',
      },
      { onConflict: 'organisation_profile_id,owner_email' },
    );
  if (error) {
    console.warn('[Admin] ensureProfileMemberAccess failed (non-fatal):', error.message);
  }
};

// Build flat social columns payload from a draft (null-ifies empty strings).
const buildSocialColumnsPayload = (draft) => {
  const payload = {};
  PROFILE_SOCIAL_COLUMNS.forEach((col) => {
    const v = `${draft[col] || ''}`.trim();
    payload[col] = v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null;
  });
  return payload;
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
  organisation_name: '',
  slug: '',
  resource_id: '',
  contact_email: '',
  contact_phone: '',
  website_url: '',
  short_bio: '',
  full_bio: '',
  package_name: '',
  entitlement_status: 'inactive',
  start_date: '',
  end_date: '',
  featured_enabled: false,
  event_quota: 0,
  enquiry_tools_enabled: false,
  analytics_enabled: false,
  is_active: true,
  ...Object.fromEntries(PROFILE_SOCIAL_COLUMNS.map((col) => [col, ''])),
};
const emptyEvent = {
  id: null,
  organisation_profile_id: '',
  title: '',
  slug: '',
  event_type: 'Support Group',
  description: '',
  starts_at: '',
  ends_at: '',
  location: '',
  cta_type: 'contact',
  booking_url: '',
  contact_email: '',
  status: 'scheduled',
};

const EVENT_TYPE_OPTIONS = [
  'Support Group',
  'Coffee Morning',
  'Peer Meetup',
  'Carers Drop-In',
  'Workshop',
  'Training Session',
  'Information Session',
  'Wellbeing Activity',
  'Walk / Outdoor Activity',
  'Exercise / Fitness',
  'Arts / Crafts',
  'Music / Creative Session',
  'Social Event',
  'Family Event',
  'Fundraiser',
  'Community Event',
  'Advice Clinic',
  'One-to-One Session',
  'Online Session',
  'Volunteer Opportunity',
  'Awareness Event',
  'Celebration / Awards',
  'Other',
];

const QueueCard = ({ title, rows, onUpdateStatus, formatRow, renderMeta, approveLabel = 'Approve', rejectLabel = 'Reject', reviewLabel = 'In review', emptyMessage = 'No items in this queue.', renderActions }) => (
  <div className="card" style={{ padding: 20, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,251,255,1) 100%)', boxShadow: '0 22px 42px rgba(26,39,68,0.08)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <h3 style={{ fontSize: 19, fontWeight: 800 }}>{title}</h3>
      <div style={{ minWidth: 34, height: 34, borderRadius: 999, padding: '0 12px', display: 'grid', placeItems: 'center', background: '#EEF4FF', color: '#1A2744', fontSize: 13, fontWeight: 800 }}>{rows.length}</div>
    </div>
    <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
      {rows.length ? rows.map((row) => {
        const statusMeta = getModerationStatusMeta(row.status);
        return (
          <div key={row.id} style={{ border: '1px solid rgba(233,238,245,0.95)', borderRadius: 16, padding: 14, background: '#FFF', boxShadow: '0 14px 28px rgba(26,39,68,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2744' }}>{formatRow(row)}</div>
                <div style={{ marginTop: 6, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>Submitted {formatAdminDate(row.created_at)}</div>
              </div>
              <div style={{ borderRadius: 999, border: `1px solid ${statusMeta.border}`, background: statusMeta.background, color: statusMeta.color, padding: '6px 10px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{statusMeta.label}</div>
            </div>
            {renderMeta ? <div style={{ marginTop: 10 }}>{renderMeta(row)}</div> : null}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {renderActions
                ? renderActions(row)
                : (
                  <>
                    <button className="btn btn-gold btn-sm" onClick={() => onUpdateStatus(row.id, 'approved')}>{approveLabel}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(row.id, 'rejected')}>{rejectLabel}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(row.id, 'in_review')}>{reviewLabel}</button>
                  </>
                )}
            </div>
          </div>
        );
      }) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>{emptyMessage}</div>}
    </div>
  </div>
);

const OwnerHandoffModal = ({ submission, resource, onClose, onCopyEmail, onMarkFollowUp, busy }) => {
  if (!submission || !resource) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 330, background: 'rgba(15,23,42,0.48)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, borderRadius: 24, background: 'white', padding: '28px 26px', boxShadow: '0 40px 80px rgba(15,23,42,0.24)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>×</button>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.56)' }}>Owner profile handoff</div>
        <h2 style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: '#1A2744' }}>{resource.name || submission.organisation_name || 'Live listing'}</h2>
        <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>This listing is now live. Owner invitation, claim handoff, and profile creation are not fully wired yet. Use this handoff step to capture follow-up cleanly without dropping into an unrelated admin screen.</p>
        <div style={{ marginTop: 16, display: 'grid', gap: 8, border: '1px solid #E9EEF5', borderRadius: 16, padding: 14, background: '#FAFBFF' }}>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.62)' }}>Owner contact email</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>{submission.submitter_email || resource.email || 'No email provided'}</div>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.62)' }}>Linked resource id: {resource.id}</div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-ghost" disabled={!submission.submitter_email && !resource.email} onClick={onCopyEmail}>Copy owner contact email</button>
          <button className="btn btn-gold" disabled={busy} onClick={onMarkFollowUp}>{busy ? 'Saving…' : 'Mark for owner follow-up'}</button>
        </div>
      </div>
    </div>
  );
};

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
  const [resourceViewEvents, setResourceViewEvents] = React.useState([]);
  const [eventEnquiries, setEventEnquiries] = React.useState([]);
  const [analyticsNotice, setAnalyticsNotice] = React.useState('');
  const [resourceUpdatesNotice, setResourceUpdatesNotice] = React.useState('');
  const [resourceUpdates, setResourceUpdates] = React.useState([]);
  const [listingCreationSubmission, setListingCreationSubmission] = React.useState(null);
  const [listingCreationDraft, setListingCreationDraft] = React.useState(null);
  const [listingDuplicateMatches, setListingDuplicateMatches] = React.useState([]);
  const [allowDuplicateCreate, setAllowDuplicateCreate] = React.useState(false);
  const [liveListingSuccess, setLiveListingSuccess] = React.useState(null);
  const [ownerHandoffContext, setOwnerHandoffContext] = React.useState(null);
  const [walkUpdates, setWalkUpdates] = React.useState([]);
  const [walkComments, setWalkComments] = React.useState([]);

  const [categoryDraft, setCategoryDraft] = React.useState(emptyCategory);
  const [resourceDraft, setResourceDraft] = React.useState(emptyResource);
  const [resourceEditorOpen, setResourceEditorOpen] = React.useState(false);
  const [resourceSearch, setResourceSearch] = React.useState('');
  const [profileDraft, setProfileDraft] = React.useState(emptyProfile);
  const [eventDraft, setEventDraft] = React.useState(emptyEvent);
  const [postcodeBusy, setPostcodeBusy] = React.useState(false);
  const [postcodeError, setPostcodeError] = React.useState('');
  const [postcodeCandidates, setPostcodeCandidates] = React.useState([]);
  const [selectedPostcodeCandidateId, setSelectedPostcodeCandidateId] = React.useState('');
  const [analyticsWindow, setAnalyticsWindow] = React.useState('30d');
  // Linked org-profile state — separate from the full profile CRUD tab
  const [linkedProfileDraft, setLinkedProfileDraft] = React.useState({});
  const [linkedProfileBusy, setLinkedProfileBusy] = React.useState(false);
  const [linkedProfileError, setLinkedProfileError] = React.useState('');

  const canAccessAdmin = React.useMemo(() => {
    const email = `${session?.user?.email || ''}`.trim().toLowerCase();
    return Boolean(email && ADMIN_EMAIL_ALLOWLIST.includes(email));
  }, [session]);

  const profileOptions = React.useMemo(() => {
    const options = new Map();

    (profiles || []).forEach((profile) => {
      if (!profile?.id) return;
      const profileId = normalizeSelectValue(profile.id);
      if (!profileId) return;
      options.set(profileId, {
        value: profileId,
        label: getProfileName(profile, resources),
      });
    });

    const selectedProfileId = normalizeSelectValue(eventDraft.organisation_profile_id);
    if (selectedProfileId && !options.has(selectedProfileId)) {
      options.set(selectedProfileId, {
        value: selectedProfileId,
        label: getProfilePlaceholderLabel(selectedProfileId),
      });
    }

    return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label, 'en', { sensitivity: 'base' }));
  }, [profiles, resources, eventDraft.organisation_profile_id]);

  const eventTypeOptions = React.useMemo(() => {
    const current = `${eventDraft.event_type || ''}`.trim();
    if (!current) return EVENT_TYPE_OPTIONS;
    const exists = EVENT_TYPE_OPTIONS.some((option) => option.toLowerCase() === current.toLowerCase());
    return exists ? EVENT_TYPE_OPTIONS : [current, ...EVENT_TYPE_OPTIONS];
  }, [eventDraft.event_type]);

  const loadData = React.useCallback(async () => {
    if (!session || !canAccessAdmin || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setAnalyticsNotice('');
    setResourceUpdatesNotice('');
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
        supabase.from('categories').select('id, name, slug, active, sort_order').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('resources').select('*').order('name', { ascending: true }),
        supabase.from('organisation_profiles').select('*'),
        supabase.from('organisation_events').select('*'),
        supabase.from('listing_claims').select('*').order('created_at', { ascending: false }),
        supabase.from('resource_update_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('walk_risk_updates').select('*').order('created_at', { ascending: false }),
        supabase.from('walk_comments').select('*').order('created_at', { ascending: false }),
      ]);

      if (resourcesResult.error) throw resourcesResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (resourceUpdatesResult.error) {
        setResourceUpdates([]);
        setResourceUpdatesNotice(`New organisation submissions unavailable (${resourceUpdatesResult.error.message}).`);
      }

      // categories is the live categories table.
      const categoriesRows = categoriesResult.error ? [] : (categoriesResult.data || []);
      const normalizedCategories = normalizeAdminCategoryRows(categoriesRows);
      const fallbackCategories = deriveAdminCategoryFallback(resourcesResult.data || []);
      const resolvedCategories = normalizedCategories.length ? normalizedCategories : fallbackCategories;

      if (categoriesResult.error) {
        setResourceUpdatesNotice(`Categories table read failed (${categoriesResult.error.message}). Using category hints from live resources.`);
      } else if (!normalizedCategories.length && fallbackCategories.length) {
        setResourceUpdatesNotice('Categories table is empty — using names derived from resource data. Run the categories population SQL to fix permanently.');
      }

      setCategories(resolvedCategories);
      setResources(resourcesResult.data || []);
      setProfiles((profilesResult.data || []).slice().sort((left, right) => getProfileName(left, resourcesResult.data || []).localeCompare(getProfileName(right, resourcesResult.data || []), 'en', { sensitivity: 'base' })));
      setEvents((eventsResult.data || []).slice().sort((left, right) => `${left.starts_at || ''}`.localeCompare(`${right.starts_at || ''}`)));
      // Always read both sources and merge so fallback claims are visible even
      // when listing_claims table is accessible but a specific submission used
      // the resource_update_submissions fallback path.
      const primaryClaims = (claimsResult.error ? [] : (claimsResult.data || []))
        .map((r) => ({ ...r, _source: 'listing_claims' }));
      const fallbackClaims = (resourceUpdatesResult.data || [])
        .filter((row) => `${row.update_type || ''}`.toLowerCase() === 'claim_request')
        .map((row) => ({
          id: row.id,
          listing_id: row.resource_id,
          listing_title: `${row.organisation_name || row.listing_title || 'Claim request'}`.replace(/^\[CLAIM\]\s*/i, ''),
          org_name: `${row.organisation_name || ''}`.replace(/^\[CLAIM\]\s*/i, ''),
          full_name: row.submitter_name || '',
          email: row.submitter_email || '',
          phone: row.submitter_phone || null,
          relationship: row.relationship_to_organisation || '',
          reason: row.reason || '',
          status: row.status || 'pending',
          created_at: row.created_at,
          _source: 'resource_update_submissions',
        }));
      const primaryIds = new Set(primaryClaims.map((r) => String(r.id)));
      const claimRows = [
        ...primaryClaims,
        ...fallbackClaims.filter((r) => !primaryIds.has(String(r.id))),
      ];

      setClaims(claimRows);
      setResourceUpdates(
        ((resourceUpdatesResult.error ? [] : (resourceUpdatesResult.data || [])))
          .filter((row) => `${row.update_type || ''}`.toLowerCase() !== 'claim_request')
          .map(normalizeResourceUpdateRow),
      );
      setWalkUpdates(walkUpdatesResult.data || []);
      setWalkComments(walkCommentsResult.data || []);

      const optionalIssues = [];
      const [viewEventsResult, eventEnquiriesResult] = await Promise.all([
        supabase.from('resource_view_events').select('*'),
        supabase.from('organisation_event_enquiries').select('*').order('created_at', { ascending: false }),
      ]);

      if (viewEventsResult.error) {
        setResourceViewEvents([]);
        optionalIssues.push(`profile views unavailable (${viewEventsResult.error.message})`);
      } else {
        setResourceViewEvents(viewEventsResult.data || []);
      }

      if (eventEnquiriesResult.error) {
        setEventEnquiries([]);
        optionalIssues.push(`event enquiries unavailable (${eventEnquiriesResult.error.message})`);
      } else {
        setEventEnquiries(eventEnquiriesResult.data || []);
      }

      if (optionalIssues.length) {
        setAnalyticsNotice(`Analytics limited: ${optionalIssues.join('; ')}.`);
      }
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

    const isEdit = Boolean(categoryDraft.id);
    const payload = {
      name: categoryDraft.name.trim(),
      slug: slugify(categoryDraft.slug || categoryDraft.name),
      sort_order: Number(categoryDraft.sort_order) || 0,
      active: Boolean(categoryDraft.active),
    };

    setBusy(true);
    setError('');
    try {
      const result = isEdit
        ? await supabase.from('categories').update(payload).eq('id', categoryDraft.id).select('id')
        : await supabase.from('categories').insert(payload).select('id');

      if (result.error) throw result.error;
      if (!result.data || result.data.length === 0) {
        throw new Error(
          isEdit
            ? `Category update matched 0 rows — check the UPDATE policy on the categories table.`
            : `Category insert returned 0 rows — check the INSERT policy on the categories table.`,
        );
      }

      setCategoryDraft(emptyCategory);
      setToast(isEdit ? 'Category updated.' : 'Category created.');
      await loadData();
    } catch (actionError) {
      setError(actionError?.message || 'Category save failed.');
    } finally {
      setBusy(false);
    }
  };

  const openResourceEditor = (row) => {
    setResourceDraft(row ? { ...emptyResource, ...row, category_id: row.category_id || '' } : { ...emptyResource });
    // Populate linked profile draft from existing profiles state
    if (row?.id) {
      const allLinked = profiles.filter((p) => String(p.resource_id) === String(row.id));
      if (allLinked.length > 1) {
        // Multiple profiles for the same resource — pick the active one, then newest by id
        console.warn(`[Admin] ${allLinked.length} profiles found for resource ${row.id}:`, allLinked.map((p) => p.id));
      }
      const linked = allLinked.find((p) => p.is_active !== false) ?? allLinked[0] ?? null;
      setLinkedProfileDraft(linked ? { _id: linked.id, ...normalizeProfileRow(linked) } : {});
    } else {
      setLinkedProfileDraft({});
    }
    setLinkedProfileError('');
    setLinkedProfileBusy(false);
    setPostcodeError('');
    setPostcodeCandidates([]);
    setSelectedPostcodeCandidateId('');
    setError('');
    setResourceEditorOpen(true);
  };

  const closeResourceEditor = () => {
    setResourceEditorOpen(false);
    setLinkedProfileDraft({});
    setLinkedProfileError('');
    setLinkedProfileBusy(false);
    setPostcodeError('');
    setPostcodeCandidates([]);
    setSelectedPostcodeCandidateId('');
  };

  const saveLinkedProfileSocials = async () => {
    const profId = linkedProfileDraft._id;
    if (!profId || !supabase) return;
    setLinkedProfileBusy(true);
    setLinkedProfileError('');
    try {
      const { stripped, data: updatedRows } = await updateOrgProfileCompat(
        supabase,
        profId,
        buildSocialColumnsPayload(linkedProfileDraft),
        SOCIAL_SELECT_COLS,
      );
      // The UPDATE's returned row is authoritative — patch local state immediately.
      // This prevents stale data if the user reopens the drawer before loadData() resolves.
      if (updatedRows?.[0]) {
        const saved = updatedRows[0];
        // Patch the draft so the open drawer inputs reflect what was actually committed
        setLinkedProfileDraft((prev) => ({
          ...prev,
          ...Object.fromEntries(PROFILE_SOCIAL_COLUMNS.map((col) => [col, saved[col] || ''])),
        }));
        // Patch the profiles array so reopening the drawer also reads correct data
        setProfiles((prev) => prev.map((p) => String(p.id) === String(saved.id) ? { ...p, ...saved } : p));
      }
      await loadData();
      if (stripped.length > 0) {
        setLinkedProfileError(
          `Schema mismatch — social columns not in live DB: ${stripped.join(', ')}. ` +
          `Add them to organisation_profiles in Supabase, then retry.`,
        );
      } else {
        setToast('Social links saved.');
      }
    } catch (err) {
      // Drawer intentionally stays open so the user can see the error and retry
      setLinkedProfileError(err?.message || 'Failed to save social links.');
    } finally {
      setLinkedProfileBusy(false);
    }
  };

  const createProfileForResource = async () => {
    if (!resourceDraft.id || !resourceDraft.name?.trim() || !supabase) return;
    setLinkedProfileBusy(true);
    setLinkedProfileError('');
    try {
      const { data: newProfile, stripped } = await insertOrgProfileCompat(
        supabase,
        buildLiveProfileInsert(resourceDraft),
      );
      const strippedNote = stripped.length ? ` (skipped: ${stripped.join(', ')})` : '';
      setToast(`Organisation profile created${strippedNote}.`);
      await loadData();
      setLinkedProfileDraft({ _id: newProfile.id, ...normalizeProfileRow(newProfile) });
    } catch (err) {
      setLinkedProfileError(err?.message || 'Failed to create organisation profile.');
    } finally {
      setLinkedProfileBusy(false);
    }
  };

  const saveResource = async () => {
    if (!resourceDraft.name.trim()) {
      setError('Resource name is required.');
      return;
    }
    const payload = buildResourcePayloadFromDraft(resourceDraft);
    const isEdit = Boolean(resourceDraft.id);
    let saved = false;
    await withBusy(async () => {
      if (isEdit) {
        // .select('id') lets us detect 0-row updates (RLS block or wrong id)
        const result = await supabase
          .from('resources')
          .update(payload)
          .eq('id', resourceDraft.id)
          .select('id, name');
        if (result.error) throw result.error;
        if (!result.data || result.data.length === 0) {
          throw new Error(
            `Database update returned 0 rows. The row may be blocked by a permission policy (RLS). ` +
            `To fix: run the admin_users SQL in the Supabase console to grant write access. ` +
            `Resource ID: ${resourceDraft.id}`,
          );
        }
      } else {
        const result = await supabase
          .from('resources')
          .insert(payload)
          .select('id, name')
          .single();
        if (result.error) throw result.error;
      }
      // Also persist social links to the linked org profile if one is open
      const profId = linkedProfileDraft._id;
      if (profId) {
        try {
          const { stripped: socialStripped } = await updateOrgProfileCompat(supabase, profId, buildSocialColumnsPayload(linkedProfileDraft));
          if (socialStripped.length > 0) {
            setLinkedProfileError(`Schema mismatch — social columns not in live DB: ${socialStripped.join(', ')}`);
          }
        } catch (socialsErr) {
          setLinkedProfileError(`Social links save failed: ${socialsErr?.message || 'unknown error'}`);
        }
      }
      saved = true;
    }, isEdit ? 'Resource updated.' : 'Resource created.');
    if (saved) {
      setResourceDraft(emptyResource);
      closeResourceEditor();
    }
  };

  const openCreateListingModal = (submission) => {
    const nextDraft = buildResourceDraftFromSubmission({ submission, categories });
    setListingCreationSubmission(submission);
    setListingCreationDraft(nextDraft);
    setListingDuplicateMatches(findSubmissionDuplicateMatches({ submission, resources, profiles }));
    setAllowDuplicateCreate(false);
  };

  const closeCreateListingModal = () => {
    setListingCreationSubmission(null);
    setListingCreationDraft(null);
    setListingDuplicateMatches([]);
    setAllowDuplicateCreate(false);
  };

  const updateListingCreationDraft = (key, value) => {
    setListingCreationDraft((current) => ({ ...current, [key]: value }));
  };

  const openExistingMatch = (match) => {
    if (match.type === 'resource') {
      const resource = resources.find((row) => `${row.id}` === `${match.id}`) || null;
      if (resource) {
        setTab('resources');
        openResourceEditor(resource);
      }
      closeCreateListingModal();
      return;
    }

    if (match.type === 'profile') {
      const profile = profiles.find((row) => `${row.id}` === `${match.id}`) || null;
      if (profile) {
        setTab('profiles');
        setProfileDraft({ ...emptyProfile, ...normalizeProfileRow(profile) });
      }
      closeCreateListingModal();
    }
  };

  const openResourceInAdmin = (resourceId) => {
    const resource = resources.find((row) => `${row.id}` === `${resourceId}`) || null;
    if (!resource) {
      setError('Linked resource could not be found in the current admin data set.');
      return;
    }
    setTab('resources');
    setResourceDraft({ ...emptyResource, ...resource, category_id: resource.category_id || '' });
  };

  const openLiveListing = (resourceId, fallbackSlug = '') => {
    const resource = resources.find((row) => `${row.id}` === `${resourceId}`) || null;
    const slug = resource?.slug || fallbackSlug;
    if (!slug) {
      setError('Live listing URL is not available for this record yet.');
      return;
    }
    window.open(`/find-help/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const prepareOwnerProfilePlaceholder = (resourceId) => {
    const resource = resources.find((row) => `${row.id}` === `${resourceId}`) || null;
    const submission = resourceUpdates.find((row) => `${extractSubmissionResourceId(row)}` === `${resourceId}`) || null;
    if (!resource || !submission) {
      setError('Owner handoff context could not be prepared for this listing.');
      return;
    }
    setOwnerHandoffContext({ submission, resource });
  };

  const copyOwnerContactEmail = async () => {
    if (!ownerHandoffContext) return;
    const email = ownerHandoffContext.submission.submitter_email || ownerHandoffContext.resource.email || '';
    if (!email) {
      setError('No owner contact email is available for this handoff.');
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      setToast('Owner contact email copied.');
    } catch {
      setError('Unable to copy email from this browser session.');
    }
  };

  const markOwnerFollowUp = async () => {
    if (!ownerHandoffContext) return;
    const { submission, resource } = ownerHandoffContext;
    const nextNotes = `${submission.admin_notes || ''}${submission.admin_notes ? ' | ' : ''}Owner follow-up marked ${new Date().toISOString()} for resource ${resource.id}`;
    await withBusy(async () => {
      const result = await supabase
        .from('resource_update_submissions')
        .update({ admin_notes: nextNotes })
        .eq('id', submission.id);
      if (result.error) throw result.error;
      setOwnerHandoffContext(null);
    }, 'Owner follow-up marked.');
  };

  const createListingFromSubmission = async () => {
    if (!listingCreationSubmission || !listingCreationDraft) return;
    if (!listingCreationDraft.name.trim()) {
      setError('Listing name is required.');
      return;
    }
    if (listingDuplicateMatches.length && !allowDuplicateCreate) {
      setError('Review the duplicate warning before creating a live listing.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = buildLiveListingInsertPayload(listingCreationDraft);

      let insertResult = await supabase
        .from('resources')
        .insert(payload)
        .select('id, name, slug')
        .single();

      if (insertResult.error && (`${insertResult.error.code || ''}` === '23505' || `${insertResult.error.message || ''}`.toLowerCase().includes('duplicate'))) {
        insertResult = await supabase
          .from('resources')
          .insert({ ...payload, slug: `${payload.slug}-${Date.now().toString().slice(-6)}` })
          .select('id, name, slug')
          .single();
      }

      if (insertResult.error) {
        throw new Error(`Live listing create failed at resources insert: ${insertResult.error.message}`);
      }

      const noteParts = [
        `Listing created ${new Date().toISOString()}`,
        `Resource id: ${insertResult.data.id}`,
      ];
      if (listingDuplicateMatches.length) noteParts.push('Duplicate warning reviewed before creation.');

      const updateResult = await supabase
        .from('resource_update_submissions')
        .update({
          resource_id: insertResult.data.id,
          status: 'created',
          admin_notes: noteParts.join(' | '),
        })
        .eq('id', listingCreationSubmission.id);

      closeCreateListingModal();
      setTab('moderation');
      setLiveListingSuccess({
        submissionId: listingCreationSubmission.id,
        resourceId: insertResult.data.id,
        resourceName: insertResult.data.name,
        resourceSlug: insertResult.data.slug,
      });

      if (updateResult.error) {
        setResourceUpdatesNotice(`Live listing created, but submission link-back failed (${updateResult.error.message}). Resource ${insertResult.data.name} was kept.`);
        setToast(`Live listing created: ${insertResult.data.name}.`);
        await loadData();
        return;
      }

      setToast('Live listing created from approved submission.');
      await loadData();
    } catch (actionError) {
      setError(actionError?.message || 'Live listing creation failed.');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!profileDraft.organisation_name.trim()) {
      setError('Organisation name is required.');
      return;
    }

    const payload = buildLiveProfilePayload(profileDraft);

    await withBusy(async () => {
      if (profileDraft.id) {
        await updateOrgProfileCompat(supabase, profileDraft.id, payload);
      } else {
        await insertOrgProfileCompat(supabase, payload);
      }
      setProfileDraft(emptyProfile);
    }, profileDraft.id ? 'Profile updated.' : 'Profile created.');
  };

  const saveEvent = async () => {
    const selectedProfileId = normalizeSelectValue(eventDraft.organisation_profile_id);
    if (!selectedProfileId || !eventDraft.title.trim() || !eventDraft.starts_at) {
      setError('Profile, title, and start date are required.');
      return;
    }

    const payload = {
      organisation_profile_id: selectedProfileId,
      title: eventDraft.title.trim(),
      slug: slugify(eventDraft.slug || eventDraft.title),
      event_type: eventDraft.event_type?.trim() || 'Support Group',
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

  const applyPostcodeCandidate = React.useCallback((candidate) => {
    if (!candidate) return;
    setResourceDraft((draft) => ({
      ...draft,
      address: candidate.address || draft.address,
      town: candidate.town || draft.town,
      postcode: candidate.postcode || draft.postcode,
      latitude: Number.isFinite(candidate.latitude) ? String(candidate.latitude) : draft.latitude,
      longitude: Number.isFinite(candidate.longitude) ? String(candidate.longitude) : draft.longitude,
    }));
  }, []);

  const handlePostcodeLookup = async () => {
    const rawPostcode = `${resourceDraft.postcode || ''}`.trim();
    if (!rawPostcode) {
      setPostcodeError('Enter a postcode first.');
      return;
    }

    const normalizedPostcode = rawPostcode.replace(/\s+/g, '').toUpperCase();
    // Last 3 chars = inward code, rest = outward code (UK standard).
    const canonicalPostcode = normalizedPostcode.length >= 5
      ? `${normalizedPostcode.slice(0, -3)} ${normalizedPostcode.slice(-3)}`
      : rawPostcode;

    setPostcodeBusy(true);
    setPostcodeError('');
    setPostcodeCandidates([]);
    setSelectedPostcodeCandidateId('');

    try {
      // Always fetch centroid first via postcodes.io for lat/lng and district name.
      const pcioResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`);
      const pcioPayload = pcioResponse.ok ? await pcioResponse.json() : null;
      if (!pcioPayload || pcioPayload.status !== 200 || !pcioPayload.result) {
        setPostcodeError('Postcode not found. Check the postcode and try again.');
        return;
      }

      const pcioResult = pcioPayload.result;
      const pcioFormatted = `${pcioResult.postcode || ''}`;
      const formattedPostcode = pcioFormatted.replace(/\s+/g, '').toUpperCase() === normalizedPostcode
        ? pcioFormatted
        : canonicalPostcode;
      const fallbackTown = pcioResult.admin_district || pcioResult.admin_ward || pcioResult.parish || pcioResult.region || '';
      const centroidLat = asNumber(pcioResult.latitude);
      const centroidLng = asNumber(pcioResult.longitude);
      const centroidCandidate = {
        id: 'postcode-centroid',
        label: `${formattedPostcode}${fallbackTown ? ` (${fallbackTown})` : ''}`,
        address: [fallbackTown, formattedPostcode].filter(Boolean).join(', '),
        town: fallbackTown,
        postcode: formattedPostcode,
        latitude: centroidLat,
        longitude: centroidLng,
      };

      // Apply centroid immediately so lat/lng is set even if address lookup fails.
      applyPostcodeCandidate(centroidCandidate);

      // Ideal Postcodes — building-level Royal Mail addresses with lat/lng.
      // Set VITE_IDEAL_POSTCODES_API_KEY in Vercel env vars.
      const idealKey = import.meta.env.VITE_IDEAL_POSTCODES_API_KEY || '';
      if (!idealKey) {
        setPostcodeError('Address lookup provider unavailable. Coordinates found; enter street manually.');
        setPostcodeCandidates([centroidCandidate]);
        setSelectedPostcodeCandidateId(centroidCandidate.id);
        return;
      }

      try {
        const ipResponse = await fetch(
          `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(canonicalPostcode)}?api_key=${idealKey}`,
        );

        if (!ipResponse.ok) {
          setPostcodeError(`Address lookup unavailable (${ipResponse.status}). Coordinates found; enter street manually.`);
          setPostcodeCandidates([centroidCandidate]);
          setSelectedPostcodeCandidateId(centroidCandidate.id);
          return;
        }

        const ipPayload = await ipResponse.json();
        const addresses = Array.isArray(ipPayload?.result) ? ipPayload.result : [];

        const candidates = addresses.map((addr, idx) => {
          const street = [addr.line_1, addr.line_2].filter(Boolean).join(', ');
          return buildAddressCandidate({
            id: `ip-${idx}`,
            label: street || `Address ${idx + 1}`,
            address: street,
            town: addr.post_town || fallbackTown,
            postcode: addr.postcode || formattedPostcode,
            latitude: addr.latitude,
            longitude: addr.longitude,
          });
        }).filter((c) => c.address && Number.isFinite(c.latitude) && Number.isFinite(c.longitude));

        if (!candidates.length) {
          setPostcodeError('No addresses found. Coordinates set; enter street manually.');
          setPostcodeCandidates([centroidCandidate]);
          setSelectedPostcodeCandidateId(centroidCandidate.id);
          return;
        }

        setPostcodeCandidates(candidates);
        if (candidates.length === 1) {
          setSelectedPostcodeCandidateId(candidates[0].id);
          applyPostcodeCandidate(candidates[0]);
        } else {
          setResourceDraft((draft) => ({
            ...draft,
            postcode: formattedPostcode,
            town: draft.town || fallbackTown,
          }));
        }
      } catch {
        setPostcodeError('Address lookup provider unavailable. Coordinates found; enter street manually.');
        setPostcodeCandidates([centroidCandidate]);
        setSelectedPostcodeCandidateId(centroidCandidate.id);
      }
    } catch {
      setPostcodeError('Postcode lookup failed. You can still enter the address manually.');
    } finally {
      setPostcodeBusy(false);
    }
  };

  const deleteRow = async (table, id, message) => {
    await withBusy(async () => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) throw deleteError;
    }, message);
  };

  const applyApprovedClaimOwnership = async (claim) => {
    if (!claim || !supabase) return;
    const contactEmail = `${claim.email || ''}`.trim().toLowerCase();
    if (!contactEmail) return;

    // submitted_by_user_id is populated when the claimant was authenticated.
    // If present, use it as created_by so the owner can access via RLS.
    const claimantUserId = claim.submitted_by_user_id || null;

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
        const updateFields = {
          organisation_name: displayName,
          contact_email: contactEmail,
          is_active: true,
        };
        // Only update created_by if claimant has a known user id
        if (claimantUserId) updateFields.created_by = claimantUserId;
        await updateOrgProfileCompat(supabase, existingProfile.id, updateFields);
        await ensureProfileMemberAccess(supabase, existingProfile.id, contactEmail);
        return;
      }

      const insertFields = {
        resource_id: claim.listing_id,
        organisation_name: displayName,
        slug: `${slugBase}-${`${claim.listing_id}`.slice(-6)}`,
        contact_email: contactEmail,
        is_active: true,
        created_by: claimantUserId,
      };
      const { data: createdProfile } = await insertOrgProfileCompat(supabase, insertFields);
      await ensureProfileMemberAccess(supabase, createdProfile.id, contactEmail);
      return;
    }

    const fallbackInsertFields = {
      organisation_name: displayName,
      slug: `${slugBase}-${Date.now()}`,
      contact_email: contactEmail,
      is_active: true,
      created_by: claimantUserId,
    };
    const { data: createdProfileFallback } = await insertOrgProfileCompat(supabase, fallbackInsertFields);
    await ensureProfileMemberAccess(supabase, createdProfileFallback.id, contactEmail);
  };

  const updateQueueStatus = async (table, id, status) => {
    await withBusy(async () => {
      const { error: updateError } = await supabase.from(table).update({ status }).eq('id', id);
      if (updateError) throw updateError;

      // Fire ownership provisioning only when the approved row is actually a claim
      const claimRow = claims.find((row) => `${row.id}` === `${id}`) || null;
      if (status === 'approved' && claimRow) {
        await applyApprovedClaimOwnership(claimRow);
      }
    }, claims.some((r) => `${r.id}` === `${id}`) && status === 'approved'
      ? 'Claim approved and owner access provisioned.'
      : 'Status updated.');
  };

  if (!session) {
    if (sessionLoading) {
      return (
        <>
          <Nav activePage="admin" onNavigate={onNavigate} session={session} />
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
  const createdResourceUpdates = resourceUpdates.filter((row) => isCreatedSubmission(row));
  const CONTACT_TYPES = ['upgrade_enquiry', 'general_enquiry', 'organisation_message', 'callback_request'];
  const contactLeads = resourceUpdates.filter((row) => CONTACT_TYPES.includes(row._queueType));
  const pendingResourceUpdates = resourceUpdates.filter((row) => isExactPendingStatus(row.status) && !isCreatedSubmission(row) && !CONTACT_TYPES.includes(row._queueType));
  const inReviewResourceUpdates = resourceUpdates.filter((row) => isInReviewStatus(row.status) && !isCreatedSubmission(row));
  const approvedResourceUpdatesReady = resourceUpdates.filter((row) => isApprovedStatus(row.status) && !isCreatedSubmission(row));
  const rejectedResourceUpdates = resourceUpdates.filter((row) => isRejectedStatus(row.status) && !isCreatedSubmission(row));
  const pendingWalkUpdates = walkUpdates.filter((row) => isPendingStatus(row.status));
  const pendingWalkComments = walkComments.filter((row) => isPendingStatus(row.status));
  const moderationWorkloadCount = pendingClaims.length + pendingResourceUpdates.length + inReviewResourceUpdates.length + approvedResourceUpdatesReady.length + pendingWalkUpdates.length + pendingWalkComments.length + contactLeads.length;
  const tabCounts = {
    overview: 0,
    moderation: moderationWorkloadCount,
    categories: categories.length,
    resources: resources.length,
    profiles: profiles.length,
    events: events.length,
  };
  const ownerPerformanceRows = profiles.map((profile) => {
    const profileEvents = events.filter((event) => `${event.organisation_profile_id}` === `${profile.id}`);
    const profileEnquiries = eventEnquiries.filter((enquiry) => `${enquiry.organisation_profile_id}` === `${profile.id}` && isWithinPastWindow(enquiry.created_at, analyticsWindow));
    const profileViews = resourceViewEvents.filter((entry) => `${entry.resource_id}` === `${profile.resource_id || ''}` && isWithinPastWindow(entry.created_at, analyticsWindow));
    return {
      id: profile.id,
      profile,
      views: profileViews.length,
      enquiries: profileEnquiries.length,
      activeEvents: profileEvents.filter((event) => (event.status || 'scheduled') === 'scheduled' && isWithinUpcomingWindow(event.starts_at, analyticsWindow)).length,
      totalScheduledEvents: profileEvents.filter((event) => (event.status || 'scheduled') === 'scheduled').length,
      newEnquiries: profileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'new').length,
      contactedEnquiries: profileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'contacted').length,
      resolvedEnquiries: profileEnquiries.filter((entry) => toSimpleEnquiryState(entry.status) === 'resolved').length,
      claimStatus: profile.claim_status || 'unclaimed',
      featured: Boolean(profile.featured),
      entitlementStatus: profile.entitlement_status || 'inactive',
      packageName: profile.package_name || 'none',
      featuredEnabled: Boolean(profile.featured_enabled),
      enquiryToolsEnabled: Boolean(profile.enquiry_tools_enabled),
      analyticsEnabled: Boolean(profile.analytics_enabled),
      eventQuota: Math.max(0, Number(profile.event_quota) || 0),
    };
  }).sort((left, right) => right.enquiries - left.enquiries || right.views - left.views);
  const ownerPerformanceSummary = {
    totalViews: ownerPerformanceRows.reduce((sum, row) => sum + row.views, 0),
    totalEnquiries: ownerPerformanceRows.reduce((sum, row) => sum + row.enquiries, 0),
    totalActiveEvents: ownerPerformanceRows.reduce((sum, row) => sum + row.activeEvents, 0),
    profilesWithDemand: ownerPerformanceRows.filter((row) => row.views > 0 || row.enquiries > 0).length,
  };

  return (
    <>
      <Nav activePage="admin" onNavigate={onNavigate} />
      <section style={{ paddingTop: 36, paddingBottom: 74, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ display: 'grid', gap: 14 }}>
          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Live schema mode: categories, resources, organisation_profiles, organisation_events, listing_claims, resource_update_submissions, walk_risk_updates, walk_comments.</p>
            {error ? <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div> : null}
            {toast ? <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', color: '#0D7A55', fontSize: 13, fontWeight: 600 }}>{toast}</div> : null}
            {(analyticsNotice || resourceUpdatesNotice) ? (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analyticsNotice ? <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.10)', color: '#8a5a0b', fontSize: 11.5, fontWeight: 600 }}>{analyticsNotice}</span> : null}
                {resourceUpdatesNotice ? <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(245,166,35,0.10)', color: '#8a5a0b', fontSize: 11.5, fontWeight: 600 }}>{resourceUpdatesNotice}</span> : null}
              </div>
            ) : null}
          </div>

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {[
                ['Categories', categories.length, null],
                ['Resources', resources.length, null],
                ['Profiles', profiles.length, null],
                ['Events', events.length, null],
                ['Pending claims', pendingClaims.length, pendingClaims.length > 0 ? '#F5A623' : null],
                ['Pending subs', pendingResourceUpdates.length, pendingResourceUpdates.length > 0 ? '#F5A623' : null],
                ['Contacts', contactLeads.length, contactLeads.length > 0 ? '#7B5CF5' : null, () => { setTab('moderation'); setTimeout(() => document.getElementById('admin-contacts-section')?.scrollIntoView({ behavior: 'smooth' }), 120); }],
                ['Profile views', ownerPerformanceSummary.totalViews, null],
                ['Enquiries', ownerPerformanceSummary.totalEnquiries, null],
              ].map(([label, value, accent, onClick]) => (
                <div key={label} className="card" onClick={onClick || undefined} style={{ padding: '12px 14px', borderRadius: 14, borderLeft: accent ? `3px solid ${accent}` : undefined, cursor: onClick ? 'pointer' : undefined, transition: onClick ? 'box-shadow 0.15s' : undefined }} onMouseEnter={onClick ? (e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,39,68,0.14)'; } : undefined} onMouseLeave={onClick ? (e) => { e.currentTarget.style.boxShadow = ''; } : undefined}>
                  <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.52)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ marginTop: 5, fontSize: 26, fontWeight: 800, color: accent || '#1A2744' }}>{value}</div>
                  {onClick && <div style={{ marginTop: 3, fontSize: 10, color: 'rgba(26,39,68,0.38)', fontWeight: 600 }}>Click to view →</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              ['overview', 'Overview'],
              ['moderation', 'Moderation'],
              ['categories', 'Categories'],
              ['resources', 'Resources'],
              ['profiles', 'Profiles'],
              ['events', 'Events'],
            ].map(([key, label]) => (
              <button
                key={key}
                className="btn btn-ghost btn-sm"
                onClick={() => setTab(key)}
                style={{
                  borderColor: tab === key ? '#1A2744' : 'rgba(26,39,68,0.12)',
                  background: tab === key ? '#1A2744' : 'rgba(255,255,255,0.76)',
                  color: tab === key ? 'white' : '#1A2744',
                  fontWeight: 700,
                  boxShadow: tab === key ? '0 16px 28px rgba(26,39,68,0.18)' : '0 8px 16px rgba(26,39,68,0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 999,
                  padding: '10px 14px',
                }}
              >
                <span>{label}</span>
                <span style={{ minWidth: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', background: tab === key ? 'rgba(255,255,255,0.16)' : '#EEF4FF', color: tab === key ? 'white' : '#1A2744', fontSize: 12, fontWeight: 800 }}>{tabCounts[key]}</span>
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={busy || loading} onClick={loadData}>Refresh</button>
          </div>

          {!loading && (tab === 'overview' || tab === 'profiles') ? (
            <div className="card" style={{ padding: 16, borderRadius: 16 }}>
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
          ) : null}

          {loading ? <div className="card" style={{ padding: 20 }}>Loading dashboard...</div> : null}

          {!loading && tab === 'overview' ? (
            <div className="card" style={{ padding: 18, borderRadius: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Owner performance visibility</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginTop: 12 }}>
                {[
                  ['Profiles with demand', ownerPerformanceSummary.profilesWithDemand],
                  ['Active owner events', ownerPerformanceSummary.totalActiveEvents],
                  ['Open owner enquiries', ownerPerformanceRows.reduce((sum, row) => sum + row.newEnquiries + row.contactedEnquiries, 0)],
                  ['Resolved enquiries', ownerPerformanceRows.reduce((sum, row) => sum + row.resolvedEnquiries, 0)],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid #E9EEF5', borderRadius: 14, padding: 14, background: '#FAFBFF' }}>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && tab === 'moderation' ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="card" style={{ padding: 20, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,1) 100%)', boxShadow: '0 24px 44px rgba(26,39,68,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.56)' }}>Moderation operations board</div>
                    <h2 style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: '#1A2744' }}>Queue-driven review and publishing</h2>
                    <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>Pending, in-review, ready-to-publish, processed, and rejected submissions are grouped here so moderation reads like a deliberate back-office system.</p>
                  </div>
                  <div style={{ minWidth: 80, borderRadius: 18, padding: '14px 16px', background: '#EEF4FF', color: '#1A2744' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(26,39,68,0.56)' }}>Workload</div>
                    <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{moderationWorkloadCount}</div>
                  </div>
                </div>
              </div>

              {liveListingSuccess ? (
                <div className="card" style={{ padding: 18, borderRadius: 20, border: '1px solid rgba(46, 164, 79, 0.18)', background: 'linear-gradient(180deg, rgba(236,255,244,0.98) 0%, rgba(247,255,250,1) 100%)', boxShadow: '0 18px 34px rgba(46, 164, 79, 0.10)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2D6B1F' }}>Live listing created</div>
                      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: '#14361D' }}>{liveListingSuccess.resourceName}</div>
                      <div style={{ marginTop: 8, color: 'rgba(20,54,29,0.78)', lineHeight: 1.6 }}>The item has moved into Live listings created. Stay in moderation to continue processing the board.</div>
                    </div>
                    <div style={{ borderRadius: 999, background: 'rgba(46, 164, 79, 0.12)', color: '#2D6B1F', padding: '8px 12px', fontWeight: 800, fontSize: 12 }}>Success</div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-gold btn-sm" onClick={() => openLiveListing(liveListingSuccess.resourceId, liveListingSuccess.resourceSlug)}>View listing</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openResourceInAdmin(liveListingSuccess.resourceId)}>Open in Resources</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => prepareOwnerProfilePlaceholder(liveListingSuccess.resourceId)}>Owner profile handoff</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setLiveListingSuccess(null)}>Dismiss</button>
                  </div>
                </div>
              ) : null}

              <div id="admin-contacts-section" className="card" style={{ padding: 22, borderRadius: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#5f3dc4' }}>CRM</div>
                    <h3 style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: '#1A2744' }}>Messages & Enquiries</h3>
                    <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.62)', lineHeight: 1.55 }}>All contact submissions — general enquiries, upgrade requests, org messages, and callback requests.</p>
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: 999, background: contactLeads.length > 0 ? 'rgba(123,92,245,0.1)' : 'rgba(26,39,68,0.06)', color: contactLeads.length > 0 ? '#5f3dc4' : 'rgba(26,39,68,0.5)', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>{contactLeads.length} contact{contactLeads.length !== 1 ? 's' : ''}</div>
                </div>
                {contactLeads.length === 0 ? (
                  <div style={{ padding: '20px 16px', borderRadius: 12, background: '#F8FAFE', border: '1px dashed #D8E4F0', textAlign: 'center', color: 'rgba(26,39,68,0.45)', fontSize: 13.5 }}>No messages or enquiries yet. They will appear here when visitors submit the contact form.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {contactLeads.map((lead) => {
                      const typeMap = {
                        upgrade_enquiry:     { label: 'Upgrade',     bg: 'rgba(123,92,245,0.1)',  color: '#5f3dc4' },
                        general_enquiry:     { label: 'General',     bg: 'rgba(45,156,219,0.1)',  color: '#1c78b5' },
                        organisation_message:{ label: 'Org message', bg: 'rgba(16,185,129,0.1)',  color: '#0D7A55' },
                        callback_request:    { label: 'Callback',    bg: 'rgba(245,166,35,0.12)', color: '#8a5a0b' },
                      };
                      const typeMeta = typeMap[lead._queueType] || { label: lead._queueType || 'Enquiry', bg: 'rgba(26,39,68,0.08)', color: '#1A2744' };
                      const statusMeta = { pending: { label: 'New', bg: 'rgba(245,166,35,0.12)', color: '#8a5a0b' }, contacted: { label: 'Contacted', bg: 'rgba(45,156,219,0.1)', color: '#1c78b5' }, closed: { label: 'Closed', bg: 'rgba(26,39,68,0.08)', color: 'rgba(26,39,68,0.5)' } };
                      const st = statusMeta[`${lead.status || 'pending'}`.toLowerCase()] || statusMeta.pending;
                      const reasonText = `${lead.reason || ''}`;
                      const [firstLine, ...restLines] = reasonText.split('\n\n');
                      const parsedTitle = firstLine.replace(/^(Upgrade enquiry:|Message via listing page\.|Callback request\.|General enquiry submitted via site\.)/i, '').trim();
                      const messageBody = restLines.join('\n\n').trim() || (parsedTitle !== reasonText ? parsedTitle : '');
                      return (
                        <div key={lead.id} style={{ padding: '14px 16px', borderRadius: 14, background: '#FAFBFF', border: '1px solid #E9EEF5' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A2744' }}>{lead.submitter_name || lead._queueSubmitter || 'Unknown'}</span>
                              {(lead.organisation_name || lead._queueTitle) && <span style={{ fontSize: 13, color: 'rgba(26,39,68,0.6)' }}>{lead.organisation_name || lead._queueTitle}</span>}
                              {lead.submitter_email && <a href={`mailto:${lead.submitter_email}`} style={{ fontSize: 13, color: '#2D9CDB', textDecoration: 'none', fontWeight: 600 }}>{lead.submitter_email}</a>}
                              {lead.submitter_phone && <span style={{ fontSize: 13, color: 'rgba(26,39,68,0.6)' }}>{lead.submitter_phone}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                              <span style={{ padding: '3px 9px', borderRadius: 8, background: typeMeta.bg, color: typeMeta.color, fontSize: 11.5, fontWeight: 700 }}>{typeMeta.label}</span>
                              <span style={{ padding: '3px 9px', borderRadius: 8, background: st.bg, color: st.color, fontSize: 11.5, fontWeight: 700 }}>{st.label}</span>
                              <span style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.4)', fontWeight: 600 }}>{formatAdminDate(lead.created_at)}</span>
                            </div>
                          </div>
                          {messageBody && <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(26,39,68,0.7)', lineHeight: 1.55, background: 'white', padding: '8px 10px', borderRadius: 8, border: '1px solid #EEF2FA' }}>{messageBody}</p>}
                          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                            {lead.status !== 'contacted' && <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', lead.id, 'contacted')}>Mark contacted</button>}
                            {lead.status !== 'closed' && <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', lead.id, 'closed')}>Close</button>}
                            {lead.status !== 'pending' && <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', lead.id, 'pending')}>Reopen</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <QueueCard
                title="Pending submissions"
                rows={pendingResourceUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('resource_update_submissions', id, status)}
                formatRow={(row) => `${row._queueTitle || 'Submission'} · ${row._queueSubmitter || 'Unknown'}`}
                renderMeta={(row) => (
                  <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'rgba(26,39,68,0.72)' }}>
                    <div>Organisation: {row.organisation_name || row._queueTitle || 'Submission'}</div>
                    <div>Submitter: {row.submitter_name || row._queueSubmitter || 'Unknown'}</div>
                    <div>Email: {row.submitter_email || row.email || 'Unknown'}</div>
                    <div>Phone: {row.submitter_phone || row.phone || 'Not provided'}</div>
                    <div>Relationship: {row.relationship_to_organisation || row._queueType || 'Not provided'}</div>
                    <div>Reason: {`${row.reason || row._queueSummary || 'No description provided.'}`.split('\n')[0]}</div>
                    <div>Status: {row.status || 'pending'}</div>
                    {row._usesFallbackShape ? <div>Legacy live row detected. Rendering minimal moderation card.</div> : null}
                    {!row.organisation_name && row._usesFallbackShape ? <div>Raw row id: {row.id}</div> : null}
                  </div>
                )}
                emptyMessage="No pending submissions."
              />
              <QueueCard
                title="In review submissions"
                rows={inReviewResourceUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('resource_update_submissions', id, status)}
                formatRow={(row) => `${row._queueTitle || 'Submission'} · ${row._queueSubmitter || 'Unknown'}`}
                renderMeta={(row) => (
                  <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'rgba(26,39,68,0.72)' }}>
                    <div>Organisation: {row.organisation_name || row._queueTitle || 'Submission'}</div>
                    <div>Submitter: {row.submitter_name || row._queueSubmitter || 'Unknown'}</div>
                    <div>Email: {row.submitter_email || row.email || 'Unknown'}</div>
                    <div>Phone: {row.submitter_phone || row.phone || 'Not provided'}</div>
                    <div>Relationship: {row.relationship_to_organisation || row._queueType || 'Not provided'}</div>
                    <div>Reason: {`${row.reason || row._queueSummary || 'No description provided.'}`.split('\n')[0]}</div>
                    {row._usesFallbackShape ? <div>Legacy live row detected. Rendering minimal moderation card.</div> : null}
                  </div>
                )}
                approveLabel="Approve"
                rejectLabel="Reject"
                reviewLabel="Keep in review"
                emptyMessage="No submissions currently in review."
              />
              <div className="card" style={{ padding: 20, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,251,255,1) 100%)', boxShadow: '0 22px 42px rgba(26,39,68,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800 }}>Approved ready to create</h3>
                  <div style={{ minWidth: 34, height: 34, borderRadius: 999, padding: '0 12px', display: 'grid', placeItems: 'center', background: '#EEF4FF', color: '#1A2744', fontSize: 13, fontWeight: 800 }}>{approvedResourceUpdatesReady.length}</div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {approvedResourceUpdatesReady.length ? approvedResourceUpdatesReady.map((row) => {
                    const duplicateMatches = findSubmissionDuplicateMatches({ submission: row, resources, profiles });
                    return (
                      <div key={row.id} style={{ border: '1px solid rgba(233,238,245,0.95)', borderRadius: 16, padding: 14, background: '#FFF', boxShadow: '0 14px 28px rgba(26,39,68,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>{row.organisation_name || row._queueTitle || 'Approved submission'}</div>
                            <div style={{ marginTop: 6, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>Approved submission • {formatAdminDate(row.created_at)}</div>
                          </div>
                          <div style={{ borderRadius: 999, border: '1px solid rgba(46, 164, 79, 0.18)', background: 'rgba(46, 164, 79, 0.10)', color: '#1E5E3D', padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>Approved</div>
                        </div>
                        <div style={{ marginTop: 6, display: 'grid', gap: 4, fontSize: 12, color: 'rgba(26,39,68,0.72)' }}>
                          <div>Submitter: {row.submitter_name || row._queueSubmitter || 'Unknown'}</div>
                          <div>Email: {row.submitter_email || 'Unknown'}</div>
                          <div>Phone: {row.submitter_phone || 'Not provided'}</div>
                          <div>Relationship: {row.relationship_to_organisation || 'Not provided'}</div>
                          <div>Reason: {`${row.reason || row._queueSummary || 'No description provided.'}`.split('\n')[0]}</div>
                          {duplicateMatches.length ? <div style={{ color: '#9A6700', fontWeight: 700 }}>Possible duplicate match found. Review before creating.</div> : null}
                          {row._usesFallbackShape ? <div>Legacy live row detected. Using minimal safe mapping.</div> : null}
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn btn-gold btn-sm" onClick={() => openCreateListingModal(row)}>Create live listing</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', row.id, 'in_review')}>Return to review</button>
                        </div>
                      </div>
                    );
                  }) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No approved submissions waiting for listing creation.</div>}
                </div>
              </div>
              <QueueCard
                title="Live listings created"
                rows={createdResourceUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('resource_update_submissions', id, status)}
                formatRow={(row) => `${row.organisation_name || row._queueTitle || 'Created listing'} · ${row.submitter_name || row._queueSubmitter || 'Unknown'}`}
                renderMeta={(row) => {
                  const linkedResourceId = extractSubmissionResourceId(row);
                  const linkedResource = resources.find((resource) => `${resource.id}` === `${linkedResourceId}`) || null;
                  return (
                    <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'rgba(26,39,68,0.72)' }}>
                      <div>Organisation: {row.organisation_name || row._queueTitle || 'Submission'}</div>
                      <div>Submitter: {row.submitter_name || row._queueSubmitter || 'Unknown'}</div>
                      <div>Created date: {formatAdminDate(row.created_at)}</div>
                      <div>Linked resource id: {linkedResourceId || 'Not linked in submission row'}</div>
                      {row.admin_notes ? <div>Admin notes: {row.admin_notes}</div> : null}
                      {!linkedResourceId ? <div>Listing was marked created but the resource id could not be resolved from the submission row.</div> : null}
                    </div>
                  );
                }}
                renderActions={(row) => {
                  const linkedResourceId = extractSubmissionResourceId(row);
                  const linkedResource = resources.find((resource) => `${resource.id}` === `${linkedResourceId}`) || null;
                  return (
                    <>
                      <button className="btn btn-gold btn-sm" disabled={!linkedResourceId && !linkedResource?.slug} onClick={() => openLiveListing(linkedResourceId, linkedResource?.slug || '')}>View live listing</button>
                      <button className="btn btn-ghost btn-sm" disabled={!linkedResourceId} onClick={() => openResourceInAdmin(linkedResourceId)}>Open resource in admin</button>
                    </>
                  );
                }}
                emptyMessage="No processed submissions yet."
              />
              <QueueCard
                title="Rejected"
                rows={rejectedResourceUpdates}
                onUpdateStatus={(id, status) => updateQueueStatus('resource_update_submissions', id, status)}
                formatRow={(row) => `${row.organisation_name || row._queueTitle || 'Rejected submission'} · ${row.submitter_name || row._queueSubmitter || 'Unknown'}`}
                renderMeta={(row) => (
                  <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'rgba(26,39,68,0.72)' }}>
                    <div>Organisation: {row.organisation_name || row._queueTitle || 'Submission'}</div>
                    <div>Submitter: {row.submitter_name || row._queueSubmitter || 'Unknown'}</div>
                    <div>Email: {row.submitter_email || row.email || 'Unknown'}</div>
                    <div>Reason: {`${row.reason || row._queueSummary || 'No description provided.'}`.split('\n')[0]}</div>
                  </div>
                )}
                renderActions={(row) => (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', row.id, 'in_review')}>Return to review</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQueueStatus('resource_update_submissions', row.id, 'approved')}>Approve later</button>
                  </>
                )}
                emptyMessage="No rejected submissions."
              />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                <QueueCard
                  title="Pending claims"
                  rows={pendingClaims}
                  onUpdateStatus={(id, status) => {
                    const claimRow = claims.find((r) => `${r.id}` === `${id}`);
                    updateQueueStatus(claimRow?._source || 'listing_claims', id, status);
                  }}
                  formatRow={(row) => `${row.listing_title || row.org_name || 'Claim'} · ${row.full_name || row.email || 'Unknown'}`}
                  renderMeta={(row) => {
                    const msg = extractClaimMessage(row.reason);
                    return (
                      <div style={{ display: 'grid', gap: 5, fontSize: 12, color: 'rgba(26,39,68,0.72)', marginTop: 4 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {row.org_name && <span><strong style={{ color: '#1A2744' }}>Org:</strong> {row.org_name}</span>}
                          {row.listing_title && row.listing_title !== row.org_name && <span><strong style={{ color: '#1A2744' }}>Listing:</strong> {row.listing_title}</span>}
                          {row.listing_id && <span style={{ fontFamily: 'monospace', fontSize: 11 }}>ID {row.listing_id}</span>}
                        </div>
                        {row.full_name && <div><strong style={{ color: '#1A2744' }}>Claimant:</strong> {row.full_name}</div>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {row.email && <span><strong style={{ color: '#1A2744' }}>Email:</strong> {row.email}</span>}
                          {row.phone && <span><strong style={{ color: '#1A2744' }}>Phone:</strong> {row.phone}</span>}
                        </div>
                        {(row.relationship || row.role) && <div><strong style={{ color: '#1A2744' }}>Role:</strong> {row.relationship || row.role}</div>}
                        {msg && (
                          <div style={{ marginTop: 4, padding: '7px 10px', borderRadius: 8, background: 'rgba(26,39,68,0.04)', border: '1px solid #EEF2FA', fontSize: 11.5, lineHeight: 1.55, color: '#1A2744' }}>
                            {msg.length > 260 ? `${msg.slice(0, 257)}…` : msg}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                          {row._source === 'resource_update_submissions'
                            ? <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(245,166,35,0.13)', color: '#8a5a0b', fontSize: 10.5, fontWeight: 700 }}>Fallback queue</span>
                            : <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(45,156,219,0.10)', color: '#1c78b5', fontSize: 10.5, fontWeight: 700 }}>Primary claims table</span>}
                          {row.created_at && <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(26,39,68,0.06)', color: 'rgba(26,39,68,0.65)', fontSize: 10.5, fontWeight: 600 }}>{formatAdminDate(row.created_at)}</span>}
                        </div>
                      </div>
                    );
                  }}
                  approveLabel="Approve and grant access"
                  rejectLabel="Reject claim"
                  reviewLabel="Hold for review"
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
            </div>
          ) : null}

          {!loading && tab === 'categories' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Category CRUD</h2>
              <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.66)' }}>
                {categories.some((c) => c._derived)
                  ? 'Categories table returned no rows — showing names derived from resource data. These are read-only hints; edits will fail until the categories table is accessible.'
                  : categories.length
                    ? `${categories.length} live categories loaded from categories table.`
                    : 'No categories found.'}
              </div>
              {categories.some((c) => c._derived) && (
                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(245,166,35,0.10)', color: '#8a5a0b', fontSize: 12.5, fontWeight: 600 }}>
                  Derived fallback active — the categories table may be empty or access may be blocked. Real categories cannot be saved until this is resolved.
                </div>
              )}
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
                    <div>{row.name} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.slug})</span>{row._derived ? <span style={{ marginLeft: 8, fontSize: 12, color: '#9A6700' }}>derived</span> : null}</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Resources <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(26,39,68,0.5)' }}>({resources.length})</span></h2>
                <button className="btn btn-gold" onClick={() => openResourceEditor(null)}>+ New resource</button>
              </div>
              <input
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="Search by name, town, email or category…"
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <div style={{ display: 'grid', gap: 6 }}>
                {resources
                  .filter((row) => {
                    if (!resourceSearch.trim()) return true;
                    const q = resourceSearch.toLowerCase();
                    const catName = (categories.find((c) => `${c.id}` === `${row.category_id}`)?.name || '').toLowerCase();
                    return (
                      (row.name || '').toLowerCase().includes(q) ||
                      (row.town || '').toLowerCase().includes(q) ||
                      (row.email || '').toLowerCase().includes(q) ||
                      catName.includes(q)
                    );
                  })
                  .map((row) => {
                    const catName = categories.find((c) => `${c.id}` === `${row.category_id}`)?.name || '';
                    return (
                      <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', background: row.is_archived ? 'rgba(244,97,58,0.03)' : 'white' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A2744' }}>{row.name}</span>
                            {row.verified && <span style={{ padding: '1px 7px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#0D7A55', fontSize: 10.5, fontWeight: 700 }}>Verified</span>}
                            {row.featured && <span style={{ padding: '1px 7px', borderRadius: 999, background: 'rgba(245,166,35,0.14)', color: '#8a5a0b', fontSize: 10.5, fontWeight: 700 }}>Featured</span>}
                            {row.is_archived && <span style={{ padding: '1px 7px', borderRadius: 999, background: 'rgba(244,97,58,0.12)', color: '#A03A2D', fontSize: 10.5, fontWeight: 700 }}>Archived</span>}
                          </div>
                          <div style={{ marginTop: 3, fontSize: 12, color: 'rgba(26,39,68,0.55)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {catName && <span>{catName}</span>}
                            {row.town && <span>{row.town}</span>}
                            {row.email && <span>{row.email}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openResourceEditor(row)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('resources', row.id, 'Resource deleted.')}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}

          {!loading && tab === 'profiles' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Organisation profile CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                <input value={profileDraft.organisation_name} onChange={(e) => setProfileDraft((p) => ({ ...p, organisation_name: e.target.value }))} placeholder="Organisation name *" style={inputStyle} />
                <input value={profileDraft.slug} onChange={(e) => setProfileDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={profileDraft.resource_id} onChange={(e) => setProfileDraft((p) => ({ ...p, resource_id: e.target.value }))} style={inputStyle}>
                  <option value="">Linked resource</option>
                  {resources.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                </select>
                <input value={profileDraft.contact_email} onChange={(e) => setProfileDraft((p) => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email (public)" style={inputStyle} />
                <input value={profileDraft.contact_phone} onChange={(e) => setProfileDraft((p) => ({ ...p, contact_phone: e.target.value }))} placeholder="Contact phone" style={inputStyle} />
                <input value={profileDraft.website_url} onChange={(e) => setProfileDraft((p) => ({ ...p, website_url: e.target.value }))} placeholder="Website URL" style={inputStyle} />
                <input value={profileDraft.package_name || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, package_name: e.target.value }))} placeholder="Package name" style={inputStyle} />
                <select value={profileDraft.entitlement_status || 'inactive'} onChange={(e) => setProfileDraft((p) => ({ ...p, entitlement_status: e.target.value }))} style={inputStyle}>
                  <option value="inactive">Inactive</option>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                </select>
                <input type="date" value={profileDraft.start_date || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, start_date: e.target.value }))} style={inputStyle} />
                <input type="date" value={profileDraft.end_date || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, end_date: e.target.value }))} style={inputStyle} />
                <input type="number" min="0" value={profileDraft.event_quota ?? 0} onChange={(e) => setProfileDraft((p) => ({ ...p, event_quota: e.target.value }))} placeholder="Event quota" style={inputStyle} />
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label><input type="checkbox" checked={Boolean(profileDraft.is_active)} onChange={(e) => setProfileDraft((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
                <label><input type="checkbox" checked={Boolean(profileDraft.featured_enabled)} onChange={(e) => setProfileDraft((p) => ({ ...p, featured_enabled: e.target.checked }))} /> Featured enabled</label>
                <label><input type="checkbox" checked={Boolean(profileDraft.enquiry_tools_enabled)} onChange={(e) => setProfileDraft((p) => ({ ...p, enquiry_tools_enabled: e.target.checked }))} /> Enquiry tools enabled</label>
                <label><input type="checkbox" checked={Boolean(profileDraft.analytics_enabled)} onChange={(e) => setProfileDraft((p) => ({ ...p, analytics_enabled: e.target.checked }))} /> Analytics enabled</label>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.44)', marginBottom: 8 }}>Social media</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                  {PROFILE_SOCIAL_COLUMNS.map((col) => (
                    <input key={col} value={profileDraft[col] || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, [col]: e.target.value }))} placeholder={`${PROFILE_SOCIAL_LABELS[col]}: ${PROFILE_SOCIAL_PLACEHOLDERS[col]}`} style={inputStyle} />
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button className="btn btn-gold" disabled={busy} onClick={saveProfile}>{profileDraft.id ? 'Update' : 'Create'} profile</button>
                {profileDraft.id ? <button className="btn btn-ghost" onClick={() => setProfileDraft(emptyProfile)}>Cancel</button> : null}
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {profiles.map((row) => (
                  <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>{getProfileName(row, resources)} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.contact_email || 'No contact email'})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setProfileDraft({ ...emptyProfile, ...normalizeProfileRow(row) })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('organisation_profiles', row.id, 'Profile deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, borderTop: '1px solid #E9EEF5', paddingTop: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Owner performance</h3>
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {ownerPerformanceRows.map((row) => (
                    <div key={row.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 12, background: '#FFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{getProfileName(row.profile, resources)}</div>
                          <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.6)' }}>Claim status: {row.claimStatus} · Featured: {row.featured ? 'yes' : 'no'} · Entitlement: {row.entitlementStatus}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{ padding: '8px 10px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #E9EEF5', fontSize: 12.5 }}>Views: <strong>{row.views}</strong></div>
                          <div style={{ padding: '8px 10px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #E9EEF5', fontSize: 12.5 }}>Enquiries: <strong>{row.enquiries}</strong></div>
                          <div style={{ padding: '8px 10px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #E9EEF5', fontSize: 12.5 }}>Active events: <strong>{row.activeEvents}</strong></div>
                          <div style={{ padding: '8px 10px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #E9EEF5', fontSize: 12.5 }}>Package: <strong>{row.packageName}</strong></div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'rgba(26,39,68,0.68)' }}>
                        <span>New: {row.newEnquiries}</span>
                        <span>Contacted: {row.contactedEnquiries}</span>
                        <span>Resolved: {row.resolvedEnquiries}</span>
                        <span>Featured access: {row.featuredEnabled ? 'on' : 'off'}</span>
                        <span>Enquiry tools: {row.enquiryToolsEnabled ? 'on' : 'off'}</span>
                        <span>Analytics: {row.analyticsEnabled ? 'on' : 'off'}</span>
                        <span>Quota: {row.totalScheduledEvents} / {row.eventQuota}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!loading && tab === 'events' ? (
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Event CRUD</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                <select value={normalizeSelectValue(eventDraft.organisation_profile_id)} onChange={(e) => setEventDraft((p) => ({ ...p, organisation_profile_id: normalizeSelectValue(e.target.value) }))} style={inputStyle}>
                  <option value="">Organisation profile</option>
                  {profileOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <input value={eventDraft.title} onChange={(e) => setEventDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
                <input value={eventDraft.slug} onChange={(e) => setEventDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={eventDraft.event_type} onChange={(e) => setEventDraft((p) => ({ ...p, event_type: e.target.value }))} style={inputStyle}>
                  {eventTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
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
                      <button className="btn btn-ghost btn-sm" onClick={() => setEventDraft({ ...emptyEvent, ...row, organisation_profile_id: normalizeSelectValue(row.organisation_profile_id), starts_at: row.starts_at ? row.starts_at.slice(0, 16) : '', ends_at: row.ends_at ? row.ends_at.slice(0, 16) : '' })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRow('organisation_events', row.id, 'Event deleted.')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <CreateListingModal
        submission={listingCreationSubmission}
        draft={listingCreationDraft}
        categories={categories}
        duplicateMatches={listingDuplicateMatches}
        allowDuplicateCreate={allowDuplicateCreate}
        onToggleDuplicateCreate={setAllowDuplicateCreate}
        onChangeDraft={updateListingCreationDraft}
        onClose={closeCreateListingModal}
        onOpenExisting={openExistingMatch}
        onCreate={createListingFromSubmission}
        busy={busy}
      />
      <OwnerHandoffModal
        submission={ownerHandoffContext?.submission || null}
        resource={ownerHandoffContext?.resource || null}
        onClose={() => setOwnerHandoffContext(null)}
        onCopyEmail={copyOwnerContactEmail}
        onMarkFollowUp={markOwnerFollowUp}
        busy={busy}
      />

      {/* Resource editor drawer */}
      {resourceEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 270, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.42)' }} onClick={closeResourceEditor} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 540, height: '100%', background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(15,23,42,0.18)' }}>
            {/* Drawer header */}
            <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid #E9EEF5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.48)' }}>{resourceDraft.id ? 'Edit resource' : 'New resource'}</div>
                <h2 style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: '#1A2744', lineHeight: 1.2 }}>{resourceDraft.name || 'Untitled resource'}</h2>
              </div>
              <button onClick={closeResourceEditor} disabled={busy} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            {/* Drawer body — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'grid', gap: 22 }}>
              {error && <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div>}

              {/* ── SECTION: Listing basics ─────────────────── */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 12 }}>Listing basics · public-facing</div>
                <div style={{ display: 'grid', gap: 12 }}>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>Organisation / listing name <span style={{ color: '#A03A2D' }}>*</span></div>
                    <input value={resourceDraft.name} onChange={(e) => setResourceDraft((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Carers Cornwall" style={inputStyle} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>URL slug</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>forms the public /find-help/{'{slug}'} link</span>
                    </div>
                    <input value={resourceDraft.slug} onChange={(e) => setResourceDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="e.g. carers-cornwall" style={inputStyle} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Category</span>
                      {categories.some((c) => c._derived) && <span style={{ fontSize: 11, color: '#8a5a0b', fontWeight: 600 }}>⚠ using derived fallback — categories table may be empty</span>}
                    </div>
                    {/* String-normalise both sides so integer IDs from legacy resources match string IDs from categories table */}
                    <select
                      value={String(resourceDraft.category_id || '')}
                      onChange={(e) => setResourceDraft((p) => ({ ...p, category_id: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">— Select category —</option>
                      {categories.map((row) => (
                        <option key={row.id} value={String(row.id)}>
                          {row.name}{row._derived ? ' (derived)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Town / area</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>shown in search results and map panel</span>
                    </div>
                    <input value={resourceDraft.town} onChange={(e) => setResourceDraft((p) => ({ ...p, town: e.target.value }))} placeholder="e.g. Truro" style={inputStyle} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Website</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>public link on listing card</span>
                    </div>
                    <input value={resourceDraft.website} onChange={(e) => setResourceDraft((p) => ({ ...p, website: e.target.value }))} placeholder="https://example.org" style={inputStyle} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>Phone</div>
                      <input value={resourceDraft.phone} onChange={(e) => setResourceDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="01872 000000" style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>Email</div>
                      <input value={resourceDraft.email} onChange={(e) => setResourceDraft((p) => ({ ...p, email: e.target.value }))} placeholder="contact@example.org" style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION: Service / public address ─────── */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 4 }}>Service address · public-facing</div>
                <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.55)', marginBottom: 12 }}>Where the public service is delivered. Used for the map pin. County-wide services should leave address/lat/lng blank and use the coverage model instead.</div>
                <div style={{ display: 'grid', gap: 12 }}>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>Street address</div>
                    <input value={resourceDraft.address} onChange={(e) => setResourceDraft((p) => ({ ...p, address: e.target.value }))} placeholder="e.g. 1 High Street, Truro" style={inputStyle} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Postcode</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>lookup fills address, town, postcode and map pin</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={resourceDraft.postcode} onChange={(e) => setResourceDraft((p) => ({ ...p, postcode: e.target.value }))} placeholder="TR1 1AB" style={{ ...inputStyle, flex: 1 }} />
                      <button type="button" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap', alignSelf: 'stretch', padding: '0 12px' }} disabled={!resourceDraft.postcode?.trim() || postcodeBusy} onClick={handlePostcodeLookup}>
                        {postcodeBusy ? 'Looking…' : 'Lookup →'}
                      </button>
                    </div>
                    {postcodeError ? <div style={{ color: '#A03A2D', fontSize: 12, marginTop: 4 }}>{postcodeError}</div> : null}
                    {postcodeCandidates.length ? (
                      <div style={{ marginTop: 6, display: 'grid', gap: 6 }}>
                        <select
                          value={selectedPostcodeCandidateId}
                          onChange={(e) => { setSelectedPostcodeCandidateId(e.target.value); applyPostcodeCandidate(postcodeCandidates.find((c) => c.id === e.target.value) || null); }}
                          style={inputStyle}
                        >
                          <option value="">— Choose address to populate fields —</option>
                          {postcodeCandidates.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.52)' }}>Selecting an address updates street address, town, postcode, latitude and longitude.</div>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Latitude</span>
                        <span style={{ fontSize: 10, color: 'rgba(26,39,68,0.4)', fontFamily: 'monospace' }}>internal</span>
                      </div>
                      <input value={resourceDraft.latitude} onChange={(e) => setResourceDraft((p) => ({ ...p, latitude: e.target.value }))} placeholder="50.2660" style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Longitude</span>
                        <span style={{ fontSize: 10, color: 'rgba(26,39,68,0.4)', fontFamily: 'monospace' }}>internal</span>
                      </div>
                      <input value={resourceDraft.longitude} onChange={(e) => setResourceDraft((p) => ({ ...p, longitude: e.target.value }))} placeholder="-5.0527" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(26,39,68,0.03)', border: '1px dashed #D8E2F0', fontSize: 12, color: 'rgba(26,39,68,0.5)', lineHeight: 1.55 }}>
                    <strong style={{ color: '#1A2744' }}>Head office / HQ fields</strong> (head_office_address, head_office_town, head_office_postcode) are not yet in the live schema. Run the migration SQL in the deliverable to enable them. The current address fields represent the public service delivery location only.
                  </div>
                </div>
              </div>

              {/* ── SECTION: Public content ───────────────── */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 12 }}>Public content · shown on listing pages</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Public summary</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>shown in search results and listing cards (keep under 160 chars)</span>
                    </div>
                    <textarea value={resourceDraft.summary} onChange={(e) => setResourceDraft((p) => ({ ...p, summary: e.target.value }))} placeholder="Short public description visible in search and cards" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Full description</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,39,68,0.5)' }}>shown on the detail page "About this service" section</span>
                    </div>
                    <textarea value={resourceDraft.description} onChange={(e) => setResourceDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Full public description for the listing detail page" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                    {resourceDraft.description && resourceDraft.description.includes('---') && (
                      <div style={{ marginTop: 5, fontSize: 11.5, color: '#8a5a0b', background: 'rgba(245,166,35,0.07)', padding: '5px 9px', borderRadius: 7 }}>
                        This field appears to contain raw import/submission data. Edit to keep only the public-facing description.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION: Flags ────────────────────────── */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 12 }}>Listing flags</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.verified)} onChange={(e) => setResourceDraft((p) => ({ ...p, verified: e.target.checked }))} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>Verified</div>
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)' }}>Shows "Verified listing" badge on the public card. Use when contact details are confirmed accurate.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.featured)} onChange={(e) => setResourceDraft((p) => ({ ...p, featured: e.target.checked }))} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>Featured</div>
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)' }}>Appears in the featured listings section on Find Help. Gold card treatment in results.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.is_archived)} onChange={(e) => setResourceDraft((p) => ({ ...p, is_archived: e.target.checked }))} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#A03A2D' }}>Archived</div>
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)' }}>Removes this listing from Find Help entirely. Data is kept but it is no longer public.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Organisation profile + social media */}
              {resourceDraft.id && (() => {
                const linkedProfile = profiles.find((p) => String(p.resource_id) === String(resourceDraft.id)) || null;
                const profId = linkedProfileDraft._id || linkedProfile?.id;
                const hasProfile = Boolean(linkedProfile || linkedProfileDraft._id);

                if (!hasProfile) {
                  return (
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Organisation profile</div>
                      <div style={{ padding: '14px 16px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #E9EEF5' }}>
                        <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', lineHeight: 1.55, marginBottom: 12 }}>
                          No organisation profile is linked to this resource. Creating one enables logo, cover image, events and social media on the public listing.
                        </div>
                        {linkedProfileError && <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 12 }}>{linkedProfileError}</div>}
                        <button className="btn btn-navy btn-sm" disabled={linkedProfileBusy} onClick={createProfileForResource}>
                          {linkedProfileBusy ? 'Creating…' : 'Create profile for this resource'}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Organisation profile</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {linkedProfile?.claim_status && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(45,156,219,0.10)', color: '#1c78b5', fontSize: 10.5, fontWeight: 700 }}>{linkedProfile.claim_status}</span>}
                      {linkedProfile?.verified_status && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(16,185,129,0.09)', color: '#0D7A55', fontSize: 10.5, fontWeight: 700 }}>{linkedProfile.verified_status}</span>}
                      {linkedProfile?.contact_email && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(26,39,68,0.06)', color: '#1A2744', fontSize: 10.5, fontWeight: 600 }}>{linkedProfile.contact_email}</span>}
                      {profId && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(26,39,68,0.04)', color: 'rgba(26,39,68,0.45)', fontSize: 10, fontFamily: 'monospace' }}>…{String(profId).slice(-8)}</span>}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 8 }}>Social media</div>
                    <div style={{ display: 'grid', gap: 7 }}>
                      {PROFILE_SOCIAL_COLUMNS.map((col) => (
                        <input key={col} value={linkedProfileDraft[col] || ''} onChange={(e) => setLinkedProfileDraft((p) => ({ ...p, [col]: e.target.value }))} placeholder={`${PROFILE_SOCIAL_LABELS[col]}: ${PROFILE_SOCIAL_PLACEHOLDERS[col]}`} style={{ ...inputStyle, fontSize: 12.5 }} />
                      ))}
                    </div>
                    {linkedProfileError && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 12 }}>{linkedProfileError}</div>}
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="btn btn-navy btn-sm" disabled={linkedProfileBusy || !profId} onClick={saveLinkedProfileSocials}>
                        {linkedProfileBusy ? 'Saving social links…' : 'Save social links'}
                      </button>
                      {profId && (
                        <button className="btn btn-ghost btn-sm" onClick={() => {
                          const prof = profiles.find((p) => String(p.id) === String(profId));
                          if (prof) setProfileDraft({ ...emptyProfile, ...normalizeProfileRow(prof) });
                          closeResourceEditor();
                          setTab('profiles');
                        }}>
                          Open full profile editor
                        </button>
                      )}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11.5, color: 'rgba(26,39,68,0.48)' }}>
                      Social links also save automatically when you click Save changes above.
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Drawer footer — sticky */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid #E9EEF5', display: 'flex', gap: 8, background: 'white', flexShrink: 0 }}>
              <button className="btn btn-gold" disabled={busy} onClick={saveResource} style={{ flex: 1, justifyContent: 'center' }}>
                {busy ? 'Saving…' : (resourceDraft.id ? 'Save changes' : 'Create resource')}
              </button>
              <button className="btn btn-ghost" disabled={busy} onClick={closeResourceEditor}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default AdminPage;
