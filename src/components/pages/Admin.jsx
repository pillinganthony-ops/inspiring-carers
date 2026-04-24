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
  return `${profile.display_name || profile.name || linkedResource?.name || profile.slug || profile.owner_email || 'Organisation profile'}`.trim();
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
    }))
    .filter((row) => row.id !== null && row.id !== undefined && row.name)
    .sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }))
);

const deriveAdminCategoryFallback = (resourcesRows) => {
  const byKey = new Map();
  (resourcesRows || []).forEach((row) => {
    const id = row?.category_id ?? null;
    const rawName = `${row?.category_name || row?.category || ''}`.trim();
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

const buildCompatibleProfilePayload = (payload) => ({
  primary: payload,
  legacy: {
    ...payload,
    name: payload.display_name,
  },
});

/* ─── Social platform helpers ─────────────────────────────── */
const SOCIAL_KEYS = ['facebook','instagram','tiktok','x','youtube','linkedin','whatsapp','threads','snapchat'];
const SOCIAL_LABELS = { facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok', x:'X / Twitter', youtube:'YouTube', linkedin:'LinkedIn', whatsapp:'WhatsApp', threads:'Threads', snapchat:'Snapchat' };
const SOCIAL_PLACEHOLDERS = { facebook:'https://facebook.com/…', instagram:'https://instagram.com/…', tiktok:'https://tiktok.com/@…', x:'https://x.com/…', youtube:'https://youtube.com/@…', linkedin:'https://linkedin.com/…', whatsapp:'+44 7700 000000 or wa.me/…', threads:'https://threads.net/…', snapchat:'https://snapchat.com/…' };

const unpackSocials = (socials) => {
  const obj = (socials && typeof socials === 'object' && !Array.isArray(socials)) ? socials : {};
  return Object.fromEntries(SOCIAL_KEYS.map((k) => [`socials_${k}`, obj[k] || '']));
};
const packSocials = (draft) => {
  const out = {};
  SOCIAL_KEYS.forEach((k) => {
    const v = `${draft[`socials_${k}`] || ''}`.trim();
    if (!v) return;
    out[k] = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  });
  return out;
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
  display_name: '',
  slug: '',
  resource_id: '',
  owner_email: '',
  email: '',
  website: '',
  package_name: '',
  entitlement_status: 'inactive',
  start_date: '',
  end_date: '',
  featured_enabled: false,
  event_quota: 0,
  enquiry_tools_enabled: false,
  analytics_enabled: false,
  is_active: true,
  ...Object.fromEntries(SOCIAL_KEYS.map((k) => [`socials_${k}`, ''])),
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

      const normalizedCategories = categoriesResult.error ? [] : normalizeAdminCategoryRows(categoriesResult.data || []);
      const fallbackCategories = deriveAdminCategoryFallback(resourcesResult.data || []);
      const resolvedCategories = normalizedCategories.length ? normalizedCategories : fallbackCategories;

      if (categoriesResult.error) {
        setResourceUpdatesNotice(`Categories table read failed (${categoriesResult.error.message}). Using category hints from live resources where possible.`);
      } else if (!normalizedCategories.length && fallbackCategories.length) {
        setResourceUpdatesNotice('Standalone categories returned no rows, but live resources contain category assignments. Admin is using derived category hints until the categories table is populated consistently.');
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

  const openResourceEditor = (row) => {
    setResourceDraft(row ? { ...emptyResource, ...row, category_id: row.category_id || '' } : { ...emptyResource });
    // Populate linked profile draft from existing profiles state
    if (row?.id) {
      const linked = profiles.find((p) => String(p.resource_id) === String(row.id)) || null;
      setLinkedProfileDraft(linked ? { _id: linked.id, ...unpackSocials(linked.socials) } : {});
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
      const { error: updateError } = await supabase
        .from('organisation_profiles')
        .update({ socials: packSocials(linkedProfileDraft) })
        .eq('id', profId);
      if (updateError) throw updateError;
      setToast('Social links saved.');
      await loadData();
    } catch (err) {
      const msg = err?.message || '';
      setLinkedProfileError(
        msg.toLowerCase().includes('socials')
          ? 'The socials column is not yet in the live schema. Run: ALTER TABLE public.organisation_profiles ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT \'{}\'::jsonb;'
          : msg || 'Failed to save social links.',
      );
    } finally {
      setLinkedProfileBusy(false);
    }
  };

  const createProfileForResource = async () => {
    if (!resourceDraft.id || !resourceDraft.name?.trim() || !supabase) return;
    setLinkedProfileBusy(true);
    setLinkedProfileError('');
    try {
      const displayName = resourceDraft.name.trim();
      const profileSlug = `${slugify(displayName)}-${String(resourceDraft.id).slice(-6)}`;

      // Core payload uses ONLY confirmed-live columns — matches applyApprovedClaimOwnership.
      // bio / website / socials are intentionally absent: they may not exist in the live
      // organisation_profiles table if it pre-dates the expansion migration.
      const corePayload = {
        resource_id: resourceDraft.id,
        display_name: displayName,
        slug: profileSlug,
        email: resourceDraft.email?.trim() || null,
        is_active: true,
        claim_status: 'unclaimed',
        verified_status: 'community',
      };

      let result = await supabase
        .from('organisation_profiles')
        .insert(corePayload)
        .select('id')
        .single();

      // display_name / name compatibility fallback (same pattern as applyApprovedClaimOwnership)
      if (result.error?.message?.includes('display_name')) {
        const legacyPayload = { ...corePayload, name: displayName };
        delete legacyPayload.display_name;
        result = await supabase
          .from('organisation_profiles')
          .insert(legacyPayload)
          .select('id')
          .single();
      }

      if (result.error) throw result.error;

      const newProfileId = result.data.id;

      // Optional post-insert: add website and socials if those columns exist live.
      // If they don't exist the error is swallowed — it does not fail the create.
      const optionalFields = { socials: {} };
      if (resourceDraft.website?.trim()) optionalFields.website = resourceDraft.website.trim();
      const { error: optErr } = await supabase
        .from('organisation_profiles')
        .update(optionalFields)
        .eq('id', newProfileId);
      if (optErr) {
        const missing = optErr.message?.match(/column ['"]?(\w+)['"]?/)?.[1] || '';
        if (missing && !['website', 'socials'].includes(missing)) {
          // Unexpected column error — surface it as a warning but don't block
          setLinkedProfileError(`Profile created. Optional fields failed: ${optErr.message}`);
        }
        // website/socials missing from live schema is expected — stay silent
      }

      setToast('Organisation profile created.');
      await loadData();
      setLinkedProfileDraft({ _id: newProfileId, ...unpackSocials({}) });
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
        const { error: socialsErr } = await supabase
          .from('organisation_profiles')
          .update({ socials: packSocials(linkedProfileDraft) })
          .eq('id', profId);
        if (socialsErr) {
          const msg = socialsErr.message || '';
          setLinkedProfileError(
            msg.toLowerCase().includes('socials')
              ? 'Social links column not in live schema. Resource saved. To enable socials run: ALTER TABLE public.organisation_profiles ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT \'{}\'::jsonb;'
              : `Social links save failed: ${msg}`,
          );
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
        setProfileDraft({ ...emptyProfile, ...profile, display_name: profile.display_name || profile.name || '', resource_id: profile.resource_id || '', start_date: profile.start_date || '', end_date: profile.end_date || '' });
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
    if (!profileDraft.display_name.trim()) {
      setError('Profile name is required.');
      return;
    }

    const payload = {
      display_name: profileDraft.display_name.trim(),
      slug: slugify(profileDraft.slug || profileDraft.display_name),
      resource_id: profileDraft.resource_id || null,
      owner_email: profileDraft.owner_email?.trim() || null,
      email: profileDraft.email?.trim() || null,
      website: profileDraft.website?.trim() || null,
      package_name: profileDraft.package_name?.trim() || null,
      entitlement_status: profileDraft.entitlement_status || 'inactive',
      start_date: profileDraft.start_date || null,
      end_date: profileDraft.end_date || null,
      featured_enabled: Boolean(profileDraft.featured_enabled),
      event_quota: Math.max(0, Number(profileDraft.event_quota) || 0),
      enquiry_tools_enabled: Boolean(profileDraft.enquiry_tools_enabled),
      analytics_enabled: Boolean(profileDraft.analytics_enabled),
      is_active: Boolean(profileDraft.is_active),
      socials: packSocials(profileDraft),
      updated_by: session?.user?.id || null,
    };
    const compatiblePayload = buildCompatibleProfilePayload(payload);
    delete compatiblePayload.legacy.display_name;

    await withBusy(async () => {
      let result = profileDraft.id
        ? await supabase.from('organisation_profiles').update(compatiblePayload.primary).eq('id', profileDraft.id)
        : await supabase.from('organisation_profiles').insert({ ...compatiblePayload.primary, created_by: session?.user?.id || null });
      if (result.error?.message?.includes('display_name')) {
        result = profileDraft.id
          ? await supabase.from('organisation_profiles').update(compatiblePayload.legacy).eq('id', profileDraft.id)
          : await supabase.from('organisation_profiles').insert({ ...compatiblePayload.legacy, created_by: session?.user?.id || null });
      }
      if (result.error) throw result.error;
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
    setPostcodeBusy(true);
    setPostcodeError('');
    setPostcodeCandidates([]);
    setSelectedPostcodeCandidateId('');

    try {
      const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`);
      const postcodePayload = postcodeResponse.ok ? await postcodeResponse.json() : null;
      if (!postcodePayload || postcodePayload.status !== 200 || !postcodePayload.result) {
        setPostcodeError('Postcode not found. Check the postcode and try again.');
        return;
      }

      const postcodeResult = postcodePayload.result;
      const formattedPostcode = postcodeResult.postcode || rawPostcode;
      const fallbackTown = postcodeResult.admin_district || postcodeResult.admin_ward || postcodeResult.parish || postcodeResult.region || '';
      const fallbackCandidate = {
        id: 'postcode-centroid',
        label: `${formattedPostcode}${fallbackTown ? ` (${fallbackTown})` : ''}`,
        address: [fallbackTown, formattedPostcode].filter(Boolean).join(', '),
        town: fallbackTown,
        postcode: formattedPostcode,
        latitude: asNumber(postcodeResult.latitude),
        longitude: asNumber(postcodeResult.longitude),
      };

      applyPostcodeCandidate(fallbackCandidate);

      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=gb&limit=8&q=${encodeURIComponent(formattedPostcode)}`;
        const nominatimResponse = await fetch(nominatimUrl);
        const nominatimRows = nominatimResponse.ok ? await nominatimResponse.json() : [];

        let candidates = (Array.isArray(nominatimRows) ? nominatimRows : []).map((row, index) => buildAddressCandidate({
          id: row.place_id || index + 1,
          label: (row.display_name || '').split(',').slice(0, 3).join(', ').trim() || `Address option ${index + 1}`,
          address: row.display_name || '',
          town: row.address?.town || row.address?.city || row.address?.village || row.address?.county || fallbackTown,
          postcode: formattedPostcode,
          latitude: row.lat,
          longitude: row.lon,
        })).filter((candidate) => Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude));

        const postcodeOnlyResults = (Array.isArray(nominatimRows) ? nominatimRows : []).every((row) => `${row.type || ''}`.toLowerCase() === 'postcode');
        if (!candidates.length || postcodeOnlyResults) {
          const overpassQuery = `[out:json][timeout:12];(
            node(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["addr:housenumber"];
            way(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["addr:housenumber"];
            node(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["building"]["addr:street"];
            way(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["building"]["addr:street"];
            node(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["amenity"]["name"];
            way(around:250,${postcodeResult.latitude},${postcodeResult.longitude})["amenity"]["name"];
          );out center tags 30;`;

          const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: overpassQuery,
          });
          const overpassPayload = overpassResponse.ok ? await overpassResponse.json() : { elements: [] };
          const overpassCandidates = ((overpassPayload && Array.isArray(overpassPayload.elements)) ? overpassPayload.elements : []).map((element, index) => {
            const tags = element.tags || {};
            const latitude = asNumber(element.lat ?? element.center?.lat);
            const longitude = asNumber(element.lon ?? element.center?.lon);
            const town = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || fallbackTown;
            const road = tags['addr:street'] || tags.street || '';
            const houseNumber = tags['addr:housenumber'] || '';
            const name = tags.name || '';
            const label = name || [houseNumber, road].filter(Boolean).join(' ') || `Location option ${index + 1}`;
            const address = [name || null, [houseNumber, road].filter(Boolean).join(' ') || null, town || null, formattedPostcode || null].filter(Boolean).join(', ');
            return buildAddressCandidate({
              id: element.id || `overpass-${index + 1}`,
              label,
              address,
              town,
              postcode: formattedPostcode,
              latitude,
              longitude,
            });
          }).filter((candidate) => candidate.address && Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude));

          if (overpassCandidates.length) {
            candidates = overpassCandidates;
          }
        }

        candidates = dedupeAddressCandidates(candidates);

        if (!candidates.length) {
          setPostcodeCandidates([fallbackCandidate]);
          setSelectedPostcodeCandidateId(fallbackCandidate.id);
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
        setPostcodeCandidates([fallbackCandidate]);
        setSelectedPostcodeCandidateId(fallbackCandidate.id);
        setPostcodeError('We found postcode coordinates, but detailed address choices could not be loaded. You can still enter the address manually.');
      }
    } catch {
      setPostcodeError('Detailed address lookup is unavailable right now. You can still enter the address manually.');
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
            display_name: displayName,
            owner_email: ownerEmail,
            email: ownerEmail,
            claim_status: 'claimed',
            verified_status: 'claimed',
            is_active: true,
            updated_by: session?.user?.id || null,
          })
          .eq('id', existingProfile.id);
        if (updateError?.message?.includes('display_name')) {
          const { error: legacyUpdateError } = await supabase
            .from('organisation_profiles')
            .update({
              name: displayName,
              owner_email: ownerEmail,
              email: ownerEmail,
              claim_status: 'claimed',
              verified_status: 'claimed',
              is_active: true,
              updated_by: session?.user?.id || null,
            })
            .eq('id', existingProfile.id);
          if (legacyUpdateError) throw legacyUpdateError;
          return;
        }
        if (updateError) throw updateError;
        return;
      }

      let { error: insertError } = await supabase.from('organisation_profiles').insert({
        resource_id: claim.listing_id,
        display_name: displayName,
        slug: `${slugBase}-${`${claim.listing_id}`.slice(-6)}`,
        owner_email: ownerEmail,
        email: ownerEmail,
        claim_status: 'claimed',
        verified_status: 'claimed',
        is_active: true,
        created_by: session?.user?.id || null,
      });
      if (insertError?.message?.includes('display_name')) {
        const legacyInsert = await supabase.from('organisation_profiles').insert({
          resource_id: claim.listing_id,
          name: displayName,
          slug: `${slugBase}-${`${claim.listing_id}`.slice(-6)}`,
          owner_email: ownerEmail,
          email: ownerEmail,
          claim_status: 'claimed',
          verified_status: 'claimed',
          is_active: true,
          created_by: session?.user?.id || null,
        });
        insertError = legacyInsert.error;
      }
      if (insertError) throw insertError;
      return;
    }

    let { error: fallbackInsertError } = await supabase.from('organisation_profiles').insert({
      display_name: displayName,
      slug: `${slugBase}-${Date.now()}`,
      owner_email: ownerEmail,
      email: ownerEmail,
      claim_status: 'claimed',
      verified_status: 'claimed',
      is_active: true,
      created_by: session?.user?.id || null,
    });
    if (fallbackInsertError?.message?.includes('display_name')) {
      const legacyFallbackInsert = await supabase.from('organisation_profiles').insert({
        name: displayName,
        slug: `${slugBase}-${Date.now()}`,
        owner_email: ownerEmail,
        email: ownerEmail,
        claim_status: 'claimed',
        verified_status: 'claimed',
        is_active: true,
        created_by: session?.user?.id || null,
      });
      fallbackInsertError = legacyFallbackInsert.error;
    }
    if (fallbackInsertError) throw fallbackInsertError;
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
  const createdResourceUpdates = resourceUpdates.filter((row) => isCreatedSubmission(row));
  const pendingResourceUpdates = resourceUpdates.filter((row) => isExactPendingStatus(row.status) && !isCreatedSubmission(row));
  const inReviewResourceUpdates = resourceUpdates.filter((row) => isInReviewStatus(row.status) && !isCreatedSubmission(row));
  const approvedResourceUpdatesReady = resourceUpdates.filter((row) => isApprovedStatus(row.status) && !isCreatedSubmission(row));
  const rejectedResourceUpdates = resourceUpdates.filter((row) => isRejectedStatus(row.status) && !isCreatedSubmission(row));
  const pendingWalkUpdates = walkUpdates.filter((row) => isPendingStatus(row.status));
  const pendingWalkComments = walkComments.filter((row) => isPendingStatus(row.status));
  const moderationWorkloadCount = pendingClaims.length + pendingResourceUpdates.length + inReviewResourceUpdates.length + approvedResourceUpdatesReady.length + pendingWalkUpdates.length + pendingWalkComments.length;
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
                ['Profile views', ownerPerformanceSummary.totalViews, null],
                ['Enquiries', ownerPerformanceSummary.totalEnquiries, null],
              ].map(([label, value, accent]) => (
                <div key={label} className="card" style={{ padding: '12px 14px', borderRadius: 14, borderLeft: accent ? `3px solid ${accent}` : undefined }}>
                  <div style={{ fontSize: 11, color: 'rgba(26,39,68,0.52)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ marginTop: 5, fontSize: 26, fontWeight: 800, color: accent || '#1A2744' }}>{value}</div>
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
                {categories.length
                  ? 'Live categories are loaded into admin and reused by the create-listing flow.'
                  : 'No live categories are currently visible. If this is unexpected, inspect categories table access or population.'}
              </div>
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
                <input value={profileDraft.display_name} onChange={(e) => setProfileDraft((p) => ({ ...p, display_name: e.target.value }))} placeholder="Profile name" style={inputStyle} />
                <input value={profileDraft.slug} onChange={(e) => setProfileDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                <select value={profileDraft.resource_id} onChange={(e) => setProfileDraft((p) => ({ ...p, resource_id: e.target.value }))} style={inputStyle}>
                  <option value="">Linked resource</option>
                  {resources.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                </select>
                <input value={profileDraft.owner_email} onChange={(e) => setProfileDraft((p) => ({ ...p, owner_email: e.target.value }))} placeholder="Owner email" style={inputStyle} />
                <input value={profileDraft.email} onChange={(e) => setProfileDraft((p) => ({ ...p, email: e.target.value }))} placeholder="Profile email" style={inputStyle} />
                <input value={profileDraft.website} onChange={(e) => setProfileDraft((p) => ({ ...p, website: e.target.value }))} placeholder="Website" style={inputStyle} />
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
                  {SOCIAL_KEYS.map((k) => (
                    <input key={k} value={profileDraft[`socials_${k}`] || ''} onChange={(e) => setProfileDraft((p) => ({ ...p, [`socials_${k}`]: e.target.value }))} placeholder={`${SOCIAL_LABELS[k]}: ${SOCIAL_PLACEHOLDERS[k]}`} style={inputStyle} />
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
                    <div>{getProfileName(row, resources)} <span style={{ color: 'rgba(26,39,68,0.55)' }}>({row.owner_email || 'No owner email'})</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setProfileDraft({ ...emptyProfile, ...row, display_name: row.display_name || row.name || '', resource_id: row.resource_id || '', start_date: row.start_date || '', end_date: row.end_date || '', ...unpackSocials(row.socials) })}>Edit</button>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'grid', gap: 20 }}>
              {error && <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div>}

              {/* Primary */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Primary</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input value={resourceDraft.name} onChange={(e) => setResourceDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Name *" style={inputStyle} />
                  <input value={resourceDraft.slug} onChange={(e) => setResourceDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" style={inputStyle} />
                  <select value={resourceDraft.category_id} onChange={(e) => setResourceDraft((p) => ({ ...p, category_id: e.target.value }))} style={inputStyle}>
                    <option value="">Category</option>
                    {categories.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                  </select>
                  <input value={resourceDraft.town} onChange={(e) => setResourceDraft((p) => ({ ...p, town: e.target.value }))} placeholder="Town" style={inputStyle} />
                  <input value={resourceDraft.website} onChange={(e) => setResourceDraft((p) => ({ ...p, website: e.target.value }))} placeholder="Website" style={inputStyle} />
                  <input value={resourceDraft.phone} onChange={(e) => setResourceDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" style={inputStyle} />
                  <input value={resourceDraft.email} onChange={(e) => setResourceDraft((p) => ({ ...p, email: e.target.value }))} placeholder="Email" style={inputStyle} />
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Location</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input value={resourceDraft.address} onChange={(e) => setResourceDraft((p) => ({ ...p, address: e.target.value }))} placeholder="Address" style={inputStyle} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={resourceDraft.postcode} onChange={(e) => setResourceDraft((p) => ({ ...p, postcode: e.target.value }))} placeholder="Postcode" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap', alignSelf: 'stretch', padding: '0 12px' }} disabled={!resourceDraft.postcode?.trim() || postcodeBusy} onClick={handlePostcodeLookup}>
                      {postcodeBusy ? 'Looking…' : 'Lookup →'}
                    </button>
                  </div>
                  {postcodeError ? <div style={{ color: '#A03A2D', fontSize: 12 }}>{postcodeError}</div> : null}
                  {postcodeCandidates.length ? (
                    <>
                      <select
                        value={selectedPostcodeCandidateId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedPostcodeCandidateId(nextId);
                          applyPostcodeCandidate(postcodeCandidates.find((c) => c.id === nextId) || null);
                        }}
                        style={inputStyle}
                      >
                        <option value="">Select an address result</option>
                        {postcodeCandidates.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.58)' }}>Select to populate address, town, postcode and coordinates.</div>
                    </>
                  ) : null}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input value={resourceDraft.latitude} onChange={(e) => setResourceDraft((p) => ({ ...p, latitude: e.target.value }))} placeholder="Latitude" style={inputStyle} />
                    <input value={resourceDraft.longitude} onChange={(e) => setResourceDraft((p) => ({ ...p, longitude: e.target.value }))} placeholder="Longitude" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Content</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <textarea value={resourceDraft.summary} onChange={(e) => setResourceDraft((p) => ({ ...p, summary: e.target.value }))} placeholder="Short summary" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  <textarea value={resourceDraft.description} onChange={(e) => setResourceDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Full description" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>

              {/* Flags */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 10 }}>Flags</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.verified)} onChange={(e) => setResourceDraft((p) => ({ ...p, verified: e.target.checked }))} /> Verified
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.featured)} onChange={(e) => setResourceDraft((p) => ({ ...p, featured: e.target.checked }))} /> Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, color: '#A03A2D', cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(resourceDraft.is_archived)} onChange={(e) => setResourceDraft((p) => ({ ...p, is_archived: e.target.checked }))} /> Archived
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
                        <button className="btn btn-sky btn-sm" disabled={linkedProfileBusy} onClick={createProfileForResource}>
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
                      {linkedProfile?.owner_email && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(26,39,68,0.06)', color: '#1A2744', fontSize: 10.5, fontWeight: 600 }}>{linkedProfile.owner_email}</span>}
                      {profId && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(26,39,68,0.04)', color: 'rgba(26,39,68,0.45)', fontSize: 10, fontFamily: 'monospace' }}>…{String(profId).slice(-8)}</span>}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.44)', marginBottom: 8 }}>Social media</div>
                    <div style={{ display: 'grid', gap: 7 }}>
                      {SOCIAL_KEYS.map((k) => (
                        <input key={k} value={linkedProfileDraft[`socials_${k}`] || ''} onChange={(e) => setLinkedProfileDraft((p) => ({ ...p, [`socials_${k}`]: e.target.value }))} placeholder={`${SOCIAL_LABELS[k]}: ${SOCIAL_PLACEHOLDERS[k]}`} style={{ ...inputStyle, fontSize: 12.5 }} />
                      ))}
                    </div>
                    {linkedProfileError && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 12 }}>{linkedProfileError}</div>}
                    <button className="btn btn-sky btn-sm" style={{ marginTop: 10 }} disabled={linkedProfileBusy || !profId} onClick={saveLinkedProfileSocials}>
                      {linkedProfileBusy ? 'Saving social links…' : 'Save social links'}
                    </button>
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
