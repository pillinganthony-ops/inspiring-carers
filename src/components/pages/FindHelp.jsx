import React from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import LogoLockup from '../Logo.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

const BloomMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const colors = ['#F5A623', '#5BC94A', '#2D9CDB', '#F4613A', '#7B5CF5', '#F5A623'];
      return (
        <g key={i} transform={`rotate(${deg} 32 32)`}>
          <ellipse cx="32" cy="17" rx="7" ry="11" fill={colors[i]} opacity="0.92" />
        </g>
      );
    })}
    <circle cx="32" cy="32" r="6" fill="#1A2744" />
    <circle cx="32" cy="32" r="2.5" fill="#FAFBFF" />
  </svg>
);

/* ─── Inline share-channel icons ──────────────────────────── */
const g = (size = 24) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' });
const IPhone    = ({ s = 18 }) => <svg {...g(s)}><path d="M6.5 2h11A1.5 1.5 0 0 1 19 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-17A1.5 1.5 0 0 1 6.5 2Z"/><path d="M12 18.5h.01"/></svg>;
const IMail     = ({ s = 18 }) => <svg {...g(s)}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
const IGlobe    = ({ s = 18 }) => <svg {...g(s)}><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.2 15.2 0 0 1 4 10 15.2 15.2 0 0 1-4 10A15.2 15.2 0 0 1 8 12a15.2 15.2 0 0 1 4-10Z"/></svg>;
const IShare    = ({ s = 18 }) => <svg {...g(s)}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49"/></svg>;
const IClipboard= ({ s = 18 }) => <svg {...g(s)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
const IDirections=({ s = 18 }) => <svg {...g(s)}><path d="M3 12h18M12 3v18"/><path d="m9 6 3-3 3 3M9 18l3 3 3-3"/></svg>;
const IWhatsApp = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>;
const IFacebook = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const ITwitterX = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const ILinkedIn = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const IFlag     = ({ s = 16 }) => <svg {...g(s)}><path d="M4 15V3l16 6-16 6"/></svg>;
const IBadge    = ({ s = 16 }) => <svg {...g(s)}><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>;
const IBuilding = ({ s = 18 }) => <svg {...g(s)}><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M9 22V10h6v12M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/></svg>;

const {
  ISparkle,
  IGroups,
  IWalks,
  IEvent,
  IHub,
  ILibrary,
  IMind,
  IFamily,
  IAdvice,
  IFinance,
  ITransport,
  IShield,
  ICoffee,
  IPin,
  ISearch,
  IHeart,
  IChevron,
  IArrow,
  IClose,
  ICheck,
  ISave,
  IconTile,
} = Icons;

const DEFAULT_CATEGORY_SLUG = 'community-groups-social-connection';
const FEATURED_CATEGORY_LABELS = ['Mental Health', 'Carers', 'Advice', 'Community', 'Crisis', 'Food'];
const MAP_LIBRARIES = ['places'];
const SUPPORTS_ORGANISATION_FEATURES = true;
const SUPPORTS_CLAIMS = true;

const insertEventEnquiry = async ({ listing, event, fullName, email, phone, message, spacesRequested }) => {
  if (!isSupabaseConfigured() || !supabase) return;

  const enquiryPayload = {
    organisation_event_id: event.id,
    organisation_profile_id: event.organisation_profile_id,
    cta_type: event.cta_type || 'contact',
    full_name: fullName.trim(),
    email: email.trim(),
    phone: phone.trim() || null,
    message: message.trim() || null,
    spaces_requested: Number(spacesRequested) || 1,
    status: 'new',
  };

  if (event.id && event.organisation_profile_id) {
    const { error } = await supabase.from('organisation_event_enquiries').insert(enquiryPayload);
    if (!error) return;
  }

  const moderationDescription = [
    `Event enquiry for: ${event.title}`,
    `Type: ${event.cta_type === 'book' ? 'booking' : 'contact'}`,
    `Spaces requested: ${Number(spacesRequested) || 1}`,
    '',
    message.trim() || 'No message provided.',
  ].join('\n');

  const { error: queueError } = await supabase.from('resource_update_submissions').insert({
    resource_id: listing.id || null,
    resource_name: listing.title || listing.venue || 'Event enquiry',
    resource_category: 'events',
    update_type: 'event_enquiry',
    description: moderationDescription,
    submitter_name: fullName.trim(),
    submitter_email: email.trim(),
    consent_review: true,
    status: 'pending',
    payload: {
      event_id: event.id,
      organisation_profile_id: event.organisation_profile_id,
      cta_type: event.cta_type,
      phone: phone.trim() || null,
      spaces_requested: Number(spacesRequested) || 1,
      destination_email: event.contact_email || listing.email || null,
    },
  });
  if (queueError) throw queueError;
};

const CATEGORY_META = [
  { tone: 'sky', icon: <IGroups s={16} />, cardIcon: <IGroups s={22} />, matches: ['group', 'social', 'community'] },
  { tone: 'lime', icon: <IWalks s={16} />, cardIcon: <IWalks s={22} />, matches: ['walk', 'outdoor'] },
  { tone: 'violet', icon: <IEvent s={16} />, cardIcon: <IEvent s={22} />, matches: ['event', 'activity', 'arts'] },
  { tone: 'sky', icon: <IHub s={16} />, cardIcon: <IHub s={22} />, matches: ['hub', 'centre', 'center', 'service'] },
  { tone: 'gold', icon: <ILibrary s={16} />, cardIcon: <ILibrary s={22} />, matches: ['library', 'book'] },
  { tone: 'violet', icon: <IMind s={16} />, cardIcon: <IMind s={22} />, matches: ['mind', 'mental', 'wellbeing', 'wellness'] },
  { tone: 'lime', icon: <IFamily s={16} />, cardIcon: <IFamily s={22} />, matches: ['family', 'children', 'young'] },
  { tone: 'sky', icon: <IAdvice s={16} />, cardIcon: <IAdvice s={22} />, matches: ['advice', 'advocacy', 'guidance', 'support'] },
  { tone: 'lime', icon: <IFinance s={16} />, cardIcon: <IFinance s={22} />, matches: ['finance', 'benefit', 'money', 'cost', 'foodbank'] },
  { tone: 'coral', icon: <ITransport s={16} />, cardIcon: <ITransport s={22} />, matches: ['transport', 'travel', 'mobility'] },
  { tone: 'gold', icon: <IShield s={16} />, cardIcon: <IShield s={22} />, matches: ['safe', 'safeguard', 'refuge'] },
];

const CATEGORY_DISPLAY_LABELS = {
  'mental-health-wellbeing': 'Mental Health',
  'carer-support': 'Carers',
  carers: 'Carers',
  'health-medical-support': 'Health',
  'advice-guidance': 'Advice',
  'housing-homelessness': 'Housing',
  'food-essentials': 'Food',
  'family-children': 'Families',
  'older-people-support': 'Older People',
  'community-groups-social-connection': 'Community',
  'faith-spiritual-support': 'Faith',
  'employment-skills': 'Work & Skills',
  'crisis-safety-support': 'Crisis',
  'disability-accessibility': 'Accessibility',
  'transport-access': 'Transport',
  'nature-activity-outdoors': 'Outdoors',
};

const CATEGORY_SLUG_ALIASES = {
  'mental health & wellbeing': 'mental-health-wellbeing',
  'mental health and wellbeing': 'mental-health-wellbeing',
  'carer support': 'carer-support',
  'carers': 'carer-support',
  'carers support': 'carer-support',
  'health & medical support': 'health-medical-support',
  'advice & guidance': 'advice-guidance',
  'housing & homelessness': 'housing-homelessness',
  'food & essentials': 'food-essentials',
  'family & children': 'family-children',
  'older people support': 'older-people-support',
  'community groups & social connection': 'community-groups-social-connection',
  'faith & spiritual support': 'faith-spiritual-support',
  'employment & skills': 'employment-skills',
  'crisis & safety support': 'crisis-safety-support',
  'disability & accessibility': 'disability-accessibility',
  'transport & access': 'transport-access',
  'nature, activity & outdoors': 'nature-activity-outdoors',
};

const pickField = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== '') return value;
  }
  return '';
};

const normalizeForSearch = (text) =>
  `${text || ''}`.toLowerCase().replace(/[''`']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const DEFAULT_COUNTY_LABEL = 'Unknown';

const cleanPlaceLabel = (value) => `${value || ''}`
  .replace(/\s+/g, ' ')
  .replace(/^,+|,+$/g, '')
  .trim();

const escapeRegExp = (value) => `${value || ''}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeCountyLabel = (value) => {
  const cleaned = cleanPlaceLabel(value);
  if (!cleaned) return DEFAULT_COUNTY_LABEL;
  return /^cornwall$/i.test(cleaned) ? DEFAULT_COUNTY_LABEL : cleaned;
};

const buildKnownTownIndex = (rows) => {
  const explicitTowns = new Map();

  (rows || []).forEach((row) => {
    const rawTown = pickField(row, ['town', 'area', 'location', 'city']);
    const cleanedTown = cleanPlaceLabel(rawTown);
    if (!cleanedTown) return;
    if (/^cornwall$/i.test(cleanedTown)) return;
    if (/^[A-Z]{1,2}\d/i.test(cleanedTown)) return;

    const key = normalizeForSearch(cleanedTown);
    if (!key) return;
    if (!explicitTowns.has(key) || cleanedTown.length > explicitTowns.get(key).length) {
      explicitTowns.set(key, cleanedTown);
    }
  });

  return Array.from(explicitTowns.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => b.label.length - a.label.length);
};

const deriveTownFromRow = (row, knownTowns) => {
  const haystack = normalizeForSearch([
    pickField(row, ['name', 'title']),
    pickField(row, ['organisation_name']),
    pickField(row, ['provider_name']),
    pickField(row, ['address', 'address_line_1', 'address_line1']),
    pickField(row, ['summary', 'description', 'short_description']),
  ].filter(Boolean).join(' '));

  if (!haystack) return '';

  for (const town of knownTowns || []) {
    const pattern = new RegExp(`(^| )${escapeRegExp(town.key)}( |$)`);
    if (pattern.test(haystack)) return town.label;
  }

  return '';
};

const toSlug = (value) =>
  `${value || ''}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toTitleCase = (value) =>
  `${value || ''}`
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getCategoryLabelFromSlug = (slug) => CATEGORY_DISPLAY_LABELS[slug] || toTitleCase(slug);

const normalizeCategorySlug = (categoryValue) => {
  const normalizedName = `${categoryValue || ''}`.trim().toLowerCase();
  if (!normalizedName) return DEFAULT_CATEGORY_SLUG;
  if (CATEGORY_SLUG_ALIASES[normalizedName]) return CATEGORY_SLUG_ALIASES[normalizedName];

  const slug = toSlug(normalizedName);
  if (!slug) return DEFAULT_CATEGORY_SLUG;
  if (slug === 'mental-health') return 'mental-health-wellbeing';
  if (slug === 'advice') return 'advice-guidance';
  if (slug === 'community') return 'community-groups-social-connection';
  if (slug === 'crisis') return 'crisis-safety-support';
  if (slug === 'food') return 'food-essentials';

  return slug;
};

const getCategoryMeta = (value) => {
  const raw = `${value || 'support'}`.toLowerCase();
  const matched = CATEGORY_META.find((category) => category.matches.some((match) => raw.includes(match)));
  if (matched) return matched;
  return { tone: 'navy', icon: <ISparkle s={16} />, cardIcon: <ICoffee s={22} /> };
};

const getSearchScore = (resource, needle) => {
  if (!needle) return resource.featured ? 5 : 0;

  const title = normalizeForSearch(resource.title);
  const venue = normalizeForSearch(resource.venue);
  const category = normalizeForSearch(resource.categoryLabel);
  const desc = normalizeForSearch(resource.desc);
  const words = needle.split(/\s+/).filter(Boolean);
  const isMulti = words.length > 1;

  let score = 0;
  if (title.startsWith(needle)) score += 120;
  else if (title.includes(needle)) score += 90;
  else if (isMulti && words.every((w) => title.includes(w))) score += 70;
  if (venue.includes(needle)) score += 45;
  else if (isMulti && words.every((w) => venue.includes(w))) score += 30;
  if (category.includes(needle)) score += 35;
  if (desc.includes(needle)) score += 20;
  else if (isMulti && words.every((w) => desc.includes(w))) score += 12;
  if (resource.featured) score += 5;
  return score;
};

const toTags = (row) => {
  const rawTags = pickField(row, ['tags', 'tag_list', 'labels']);
  let tags = [];

  if (Array.isArray(rawTags)) tags = rawTags;
  else if (typeof rawTags === 'string') tags = rawTags.split(',');

  tags = tags.map((tag) => `${tag}`.trim()).filter(Boolean);

  if (row?.verified) tags.unshift('Verified');
  if (row?.featured) tags.push('Featured');
  if (!tags.length) tags = ['Local support'];

  return Array.from(new Set(tags)).slice(0, 4);
};

const parseCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isCoordinatePairSane = (lat, lng) => {
  if (typeof lat !== 'number' || !Number.isFinite(lat)) return false;
  if (typeof lng !== 'number' || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // UK-focused sanity bounds for this directory product.
  if (lat < 49.5 || lat > 61.5 || lng < -8.8 || lng > 2.2) return false;
  return true;
};

const getDetailSlugFromPath = () => {
  const match = window.location.pathname.match(/^\/find-help\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : '';
};

const getListingUrl = (listing) => `${window.location.origin}/find-help/${listing.slug}`;

const getMapsOpenUrl = (listing) => {
  if (listing.lat !== null && listing.lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`;
  }
  const query = encodeURIComponent([listing.title, listing.address, listing.postcode, listing.area].filter(Boolean).join(', '));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const getMapsDirectionsUrl = (listing) => {
  if (listing.lat !== null && listing.lng !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`;
  }
  const destination = encodeURIComponent([listing.title, listing.address, listing.postcode, listing.area].filter(Boolean).join(', '));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

const isGenericOrganisationValue = (value) => {
  const normalized = `${value || ''}`.trim().toLowerCase();
  if (!normalized) return true;
  return new Set(['community support', 'support service', 'local support', 'organisation', 'organization']).has(normalized);
};

const deriveOrganisationNameFromContact = (row) => {
  const merged = { ...(row || {}), ...(row?.profile || {}) };
  const email = `${pickField(merged, ['email']) || ''}`.trim().toLowerCase();
  const website = `${pickField(merged, ['website']) || ''}`.trim().toLowerCase();

  let domain = '';
  if (website) {
    try {
      const normalizedWebsite = website.startsWith('http') ? website : `https://${website}`;
      domain = new URL(normalizedWebsite).hostname.toLowerCase();
    } catch {
      domain = website;
    }
  }
  if (!domain && email.includes('@')) domain = email.split('@')[1];
  domain = domain.replace(/^www\./, '').split('/')[0];
  if (!domain) return '';

  let label = domain.split('.')[0] || '';
  label = label
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(mind|care|carers|support|trust|foundation|services|centre|center|wellbeing|health|community)$/i, '$1 $2')
    .trim();

  if (!label) return '';
  return label.replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ─── Isles of Scilly detection ─────────────────────────── */
const IOS_LAT_MIN = 49.82;
const IOS_LAT_MAX = 49.98;
const IOS_LNG_MIN = -6.50;
const IOS_LNG_MAX = -6.14;
const IOS_POSTCODE_RE = /^TR2[1-5]/i;

const isIosCoord = (lat, lng) =>
  typeof lat === 'number' && Number.isFinite(lat) &&
  typeof lng === 'number' && Number.isFinite(lng) &&
  lat >= IOS_LAT_MIN && lat <= IOS_LAT_MAX &&
  lng >= IOS_LNG_MIN && lng <= IOS_LNG_MAX;

const detectIosTown = (row, title, rawLat, rawLng) => {
  const nameAddress = `${title || ''} ${row?.address || ''}`.trim();

  // Bryher and Tresco: unique island names — match on name alone
  if (/\bBryher\b/i.test(nameAddress)) return 'Bryher';
  if (/\bTresco\b/i.test(nameAddress)) return 'Tresco';

  // Confirm IoS by coordinates or postcode before matching ambiguous names
  const inIos = isIosCoord(rawLat, rawLng) || IOS_POSTCODE_RE.test(`${row?.postcode || ''}`.trim());
  if (inIos) {
    if (/\bSt\.?\s*Martin'?s\b/i.test(nameAddress)) return "St Martin's";
    if (/\bSt\.?\s*Mary'?s\b/i.test(nameAddress)) return "St Mary's";
    if (/\bSt\.?\s*Agnes\b/i.test(nameAddress)) return 'St Agnes';
    return 'Isles of Scilly';
  }

  // Text-only fallback: "Isles of Scilly" in the listing title, but NOT alongside
  // "Cornwall" — avoids matching county-wide org names like "NHS Cornwall and Isles of Scilly"
  const titleStr = `${title || ''}`;
  if (/\bIsles?\s+of\s+Scilly\b/i.test(titleStr) && !/\bCornwall\b/i.test(titleStr)) {
    return 'Isles of Scilly';
  }

  return '';
};

const normalizeResource = (row, index, options = {}) => {
  const knownTowns = Array.isArray(options.knownTowns) ? options.knownTowns : [];
  const rawCategory = pickField(row, ['category_name', 'category', 'category_label', 'resource_type', 'type']) || 'Support';
  // If a resolved category slug was injected (from category_id FK lookup), use it directly
  const cat = row.category_slug ? normalizeCategorySlug(row.category_slug) : normalizeCategorySlug(rawCategory);
  const categoryLabel = getCategoryLabelFromSlug(cat);
  const categoryMeta = getCategoryMeta(rawCategory);

  const title = pickField(row, ['name', 'title']) || `Support listing ${index + 1}`;
  const orgCandidates = [
    pickField(row?.profile || {}, ['display_name']),
    pickField(row?.profile || {}, ['name']),
    pickField(row, ['organisation_name']),
    pickField(row, ['provider_name']),
    title,
    deriveOrganisationNameFromContact(row),
  ];
  const organisationName = orgCandidates.find((candidate) => !isGenericOrganisationValue(candidate)) || '';
  const venue = organisationName || 'Community support';
  const serviceFootprintModel = `${row?.service_footprint_model || ''}`.trim().toLowerCase() || null;
  const rawCoverageAreaLabel = `${row?.coverage_area_label || ''}`.trim() || null;

  const explicitTown = cleanPlaceLabel(pickField(row, ['town', 'area', 'location', 'city']));
  // rawLat/rawLng must be computed before derivedTown so detectIosTown can use them
  const rawLatValue = pickField(row, ['lat', 'latitude']);
  const rawLngValue = pickField(row, ['lng', 'longitude']);
  const rawLat = parseCoordinate(rawLatValue);
  const rawLng = parseCoordinate(rawLngValue);
  const postcode = cleanPlaceLabel(pickField(row, ['postcode']));
  const county = normalizeCountyLabel(pickField(row, ['county', 'region', 'admin_county']));

  // Isles of Scilly: all IoS rows have blank town fields; detect from coords/name
  const iosTown = !explicitTown ? detectIosTown(row, title, rawLat, rawLng) : '';
  const derivedTown = explicitTown || iosTown || deriveTownFromRow(row, knownTowns);

  const hasCoverageModel = serviceFootprintModel !== null;
  const isPhysicalVenue = serviceFootprintModel === 'physical_venue';
  const isCountyWide = serviceFootprintModel === 'county_wide';
  const isMultiLocation = serviceFootprintModel === 'multi_location';
  const isHqOnly = serviceFootprintModel === 'hq_only';

  // Location display: use coverage_area_label for non-physical services
  let area, locationLabel;
  if (!hasCoverageModel || isPhysicalVenue) {
    area = derivedTown || county;
    locationLabel = derivedTown ? `${derivedTown}, ${county}` : county;
  } else {
    const displayLabel = rawCoverageAreaLabel || county;
    area = displayLabel;
    locationLabel = displayLabel;
  }

  // Precise map pin: physical_venue and legacy null keep coords as-is
  // county_wide and multi_location: suppress pin (null out coords)
  // hq_only: keep coords (optional HQ pin)
  const suppressPin = isCountyWide || isMultiLocation;
  const hasCoordinateInput = `${rawLatValue || ''}`.trim() !== '' || `${rawLngValue || ''}`.trim() !== '';
  const hasInvalidCoordinates = hasCoordinateInput && !isCoordinatePairSane(rawLat, rawLng);
  const lat = (suppressPin || hasInvalidCoordinates) ? null : rawLat;
  const lng = (suppressPin || hasInvalidCoordinates) ? null : rawLng;

  const footprintBadge = isCountyWide
    ? { label: 'County-wide', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' }
    : isMultiLocation
    ? { label: 'Multiple locations', color: '#7B5CF5', bg: 'rgba(123,92,245,0.1)' }
    : isHqOnly
    ? { label: 'HQ', color: '#F5A623', bg: 'rgba(245,166,35,0.1)' }
    : null;

  const availability = pickField(row, ['opening_hours', 'availability', 'service_hours', 'contact_hours']) || 'Contact for details';
  const summary = pickField(row, ['summary', 'description', 'short_description']) || 'Local support for carers and the people they support.';
  const resourceOrganisationName = pickField(row, ['organisation_name']);
  const providerName = pickField(row, ['provider_name']);
  const profileDisplayName = pickField(row?.profile || {}, ['display_name', 'name']);
  const profileBio = pickField(row?.profile || {}, ['bio']);
  const profileServiceCategories = Array.isArray(row?.profile?.service_categories) ? row.profile.service_categories.join(' ') : '';
  const profileAreasCovered = Array.isArray(row?.profile?.areas_covered) ? row.profile.areas_covered.join(' ') : '';
  const searchText = normalizeForSearch([
    title,
    organisationName,
    resourceOrganisationName,
    providerName,
    venue,
    categoryLabel,
    summary,
    pickField(row, ['description', 'short_description']),
    derivedTown,
    area,
    locationLabel,
    county,
    rawCoverageAreaLabel || '',
    pickField(row, ['address', 'address_line_1', 'address_line1']),
    postcode,
    profileDisplayName,
    profileBio,
    profileServiceCategories,
    profileAreasCovered,
  ].filter(Boolean).join(' '));

  return {
    id: row?.id ?? `resource-${index + 1}`,
    categoryId: row?.category_id ?? null,
    slug: pickField(row, ['slug']) || toSlug(title) || `resource-${index + 1}`,
    cat,
    categoryLabel,
    tone: categoryMeta.tone,
    icon: categoryMeta.cardIcon,
    title,
    organisationName,
    resourceOrganisationName,
    providerName,
    venue,
    town: derivedTown,
    area,
    locationLabel,
    when: availability,
    distance: postcode || locationLabel,
    desc: summary,
    website: pickField(row, ['website', 'url', 'link']),
    phone: pickField(row, ['phone', 'telephone']),
    email: pickField(row, ['email']),
    address: pickField(row, ['address', 'address_line_1', 'address_line1']),
    postcode,
    lat,
    lng,
    tags: toTags(row),
    featured: Boolean(row?.featured || row?.profile?.featured),
    logoUrl: pickField(row?.profile || {}, ['logo_url']) || pickField(row?.metadata?.brand || {}, ['logo_url']),
    coverImageUrl: pickField(row?.profile || {}, ['cover_image_url']),
    profile: row?.profile || null,
    events: Array.isArray(row?.events) ? row.events : [],
    serviceCategories: Array.isArray(row?.profile?.service_categories) ? row.profile.service_categories : [],
    areasCovered: Array.isArray(row?.profile?.areas_covered) ? row.profile.areas_covered : [],
    county,
    serviceFootprintModel,
    coverageAreaLabel: rawCoverageAreaLabel,
    footprintBadge,
    isTownInferred: Boolean(!explicitTown && derivedTown),
    isCountyMissing: county === DEFAULT_COUNTY_LABEL,
    hasInvalidCoordinates,
    townKey: normalizeForSearch(derivedTown),
    locationKey: normalizeForSearch(locationLabel),
    countyKey: normalizeForSearch(county) || 'unknown',
    searchText,
  };
};

const GENERIC_ORG_NAMES = new Set(['community support', 'support service', 'local support', 'organisation', 'organization']);
const deriveClaimOrgName = (listing) => {
  const candidates = [
    listing?.organisationName,
    listing?.profile?.display_name,
    listing?.venue,
    listing?.title,
    listing?.name,
    listing?.listing_title,
  ];

  for (const value of candidates) {
    const normalized = `${value || ''}`.trim();
    if (!normalized) continue;
    if (GENERIC_ORG_NAMES.has(normalized.toLowerCase())) continue;
    return normalized;
  }

  return 'Organisation';
};

const toneMapColor = (tone) => ({
  navy: { fg: '#1A2744' },
  gold: { fg: '#F5A623' },
  lime: { fg: '#5BC94A' },
  sky: { fg: '#2D9CDB' },
  coral: { fg: '#F4613A' },
  violet: { fg: '#7B5CF5' },
}[tone] || { fg: '#1A2744' });

/* ─── Helpers ────────────────────────────────────────────── */
const getDomain = (website) => {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const getFaviconUrl = (website, sz = 128) => {
  const domain = getDomain(website);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=${sz}` : null;
};

const isSafeImageUrl = (value) => /^https?:\/\//i.test(`${value || ''}`.trim());

const DefaultBrandMark = ({ size = 80 }) => (
  <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: 'linear-gradient(135deg, rgba(26,39,68,0.06), rgba(45,156,219,0.10))', border: '1px solid rgba(26,39,68,0.08)', display: 'grid', placeItems: 'center', overflow: 'hidden', boxShadow: '0 4px 18px rgba(26,39,68,0.08)', flexShrink: 0 }}>
    <BloomMark size={Math.round(size * 0.62)} />
  </div>
);

/* ─── useIsMobile hook ────────────────────────────────────── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 720);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

/* ─── Toast ──────────────────────────────────────────────── */
/* ─── Toast ──────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 88, zIndex: 200, background: '#12203D', color: 'white', borderRadius: 20, padding: '16px 20px', minWidth: 320, maxWidth: 440, boxShadow: '0 24px 60px rgba(18,32,61,0.40)', border: '1px solid rgba(255,255,255,0.10)', animation: 'slideInToast 0.3s ease' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: 'rgba(91,201,74,0.20)', color: '#7EE76D', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <ICheck s={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Done</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>{toast}</div>
        </div>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)', padding: 4 }}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>
    </div>
  );
};

/* ─── OrgAvatar ──────────────────────────────────────────── */
const OrgAvatar = ({ listing, size = 80 }) => {
  const [imgError, setImgError] = React.useState(false);
  const logoUrl = isSafeImageUrl(listing.logoUrl) ? listing.logoUrl : '';

  if (logoUrl && !imgError) {
    return (
      <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', border: '3px solid white', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={logoUrl}
          alt={listing.title}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return <DefaultBrandMark size={size} />;
};

/* ─── TrustBadges ────────────────────────────────────────── */
const TrustBadges = ({ listing }) => {
  const badges = [];
  if (listing.tags.includes('Verified') || listing.website) badges.push({ key: 'verified', label: 'Verified listing', color: '#10B981', bg: 'rgba(16,185,129,0.1)' });
  if (['carer-support', 'carers'].includes(listing.cat)) badges.push({ key: 'carers', label: 'Supports carers', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' });
  if (['community-groups-social-connection', 'mental-health-wellbeing'].includes(listing.cat)) badges.push({ key: 'community', label: 'Community resource', color: '#7B5CF5', bg: 'rgba(123,92,245,0.1)' });
  badges.push({ key: 'cornwall', label: 'Cornwall directory', color: '#F5A623', bg: 'rgba(245,166,35,0.1)' });

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {badges.map((badge) => (
        <span key={badge.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 11.5, fontWeight: 700 }}>
          <IBadge s={11} />
          {badge.label}
        </span>
      ))}
    </div>
  );
};

/* ─── ShareTray (card-level dropdown) ───────────────────── */
const SHARE_CHANNELS = [
  { id: 'copy',      label: 'Copy link',   Icon: IClipboard },
  { id: 'email',     label: 'Email',       Icon: IMail },
  { id: 'whatsapp',  label: 'WhatsApp',    Icon: IWhatsApp,  color: '#25D366' },
  { id: 'facebook',  label: 'Facebook',    Icon: IFacebook,  color: '#1877F2' },
  { id: 'twitter',   label: 'Post on X',   Icon: ITwitterX,  color: '#000' },
  { id: 'linkedin',  label: 'LinkedIn',    Icon: ILinkedIn,  color: '#0A66C2' },
];

const ShareTray = ({ listing, onAction, onClose }) => (
  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #E8EDF8', borderRadius: 18, minWidth: 210, boxShadow: '0 22px 52px rgba(20,39,69,0.18)', padding: 8, zIndex: 12 }}>
    {SHARE_CHANNELS.map((ch) => (
      <button key={ch.id} onClick={() => { onAction(ch.id, listing); onClose(); }}
        style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: '#1A2744', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: ch.color || '#1A2744', display: 'flex' }}><ch.Icon s={16} /></span>
        {ch.label}
      </button>
    ))}
  </div>
);

/* ─── ClaimModal ─────────────────────────────────────────── */
const RELATIONSHIP_OPTIONS = ['Owner / Director', 'Senior Staff Member', 'Volunteer Lead', 'Partnership Organisation', 'Trustee / Board Member', 'Other'];

const ClaimModal = ({ listing, onClose, onSuccess, onError }) => {
  const [form, setForm] = React.useState({ fullName: '', orgName: deriveClaimOrgName(listing), email: '', phone: '', relationship: '', reason: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!form.fullName.trim() || !email || !form.relationship.trim() || !form.reason.trim() || !form.orgName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (!supabase) throw new Error('Database not available.');
      const claimPayload = {
        listing_id: listing.id,
        listing_slug: listing.slug,
        listing_title: listing.title,
        full_name: form.fullName.trim(),
        org_name: form.orgName.trim(),
        role: form.relationship.trim(),
        email,
        phone: form.phone.trim() || null,
        relationship: form.relationship.trim(),
        reason: form.reason.trim(),
        status: 'pending',
      };

      const { error: dbError } = await supabase.from('listing_claims').insert(claimPayload);
      if (dbError) throw dbError;
      onSuccess({
        listingName: listing?.title || deriveClaimOrgName(listing),
        organisationName: claimPayload.org_name,
      });
    } catch (err) {
      const rawMessage = err?.message || '';
      const message =
        rawMessage.includes('listing_claims') && (rawMessage.includes('schema cache') || rawMessage.includes('does not exist'))
          ? 'Claim submissions are temporarily unavailable while the claims table is being synced. Please try again shortly.'
          : (rawMessage || 'Failed to submit claim. Please try again.');
      setError(message);
      onError?.(message);
    } finally {
      setBusy(false);
    }
  };

  const fieldSt = { width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.50)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 28, padding: '32px 30px', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 20, top: 20, width: 36, height: 36, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <DefaultBrandMark size={50} />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.5)' }}>Claim this listing</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A2744', marginTop: 2 }}>{listing?.title}</div>
          </div>
        </div>
        <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(45,156,219,0.07)', border: '1px solid rgba(45,156,219,0.15)', fontSize: 13, color: 'rgba(26,39,68,0.75)', marginBottom: 4 }}>
          Claiming: <strong style={{ color: '#1A2744' }}>{listing?.title}</strong>
        </div>

        <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.66)', lineHeight: 1.65, marginBottom: 22 }}>
          Are you a representative of this organisation? Submit your details and our team will review your claim and be in touch.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Full name *</label>
            <input value={form.fullName} onChange={set('fullName')} required placeholder="Your full name" style={fieldSt} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Organisation or listing name being claimed *</label>
            <input value={form.orgName} onChange={set('orgName')} required placeholder="Organisation name" style={fieldSt} />
            <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(26,39,68,0.58)' }}>This should match the organisation behind this listing.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" style={fieldSt} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Optional" style={fieldSt} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Relationship to organisation *</label>
            <select value={form.relationship} onChange={set('relationship')} required style={fieldSt}>
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Proof / reason for claim *</label>
            <textarea value={form.reason} onChange={set('reason')} required rows={4} placeholder="Please describe your role and how you can verify your relationship to this organisation..." style={{ ...fieldSt, resize: 'vertical' }} />
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,97,58,0.1)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={busy} className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
              {busy ? 'Submitting…' : 'Submit claim request'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewOrganisationModal = ({ onClose, onSuccess, onError }) => {
  const [form, setForm] = React.useState({
    organisationName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    town: '',
    category: '',
    summary: '',
    reason: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!form.organisationName.trim() || !form.contactName.trim() || !email || !form.summary.trim() || !form.reason.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      if (!supabase) throw new Error('Database not available.');

      const reason = [
        'Find Help new organisation submission',
        `Summary: ${form.summary.trim()}`,
        `Why this should be listed: ${form.reason.trim()}`,
        `Category: ${form.category.trim() || 'Not provided'}`,
        `Town: ${form.town.trim() || 'Not provided'}`,
        `Website: ${form.website.trim() || 'Not provided'}`,
      ].join('\n');

      const payload = {
        organisation_name: form.organisationName.trim(),
        submitter_name: form.contactName.trim(),
        submitter_email: email,
        submitter_phone: form.phone.trim() || null,
        relationship_to_organisation: `New organisation submission${form.category.trim() ? ` · ${form.category.trim()}` : ''}`,
        reason,
        status: 'pending',
      };

      const { error: dbError } = await supabase.from('resource_update_submissions').insert(payload);
      if (dbError) throw dbError;
      onSuccess?.(form.organisationName.trim());
    } catch (submitError) {
      const message = submitError?.message || 'Unable to submit organisation right now.';
      setError(message);
      onError?.(message);
    } finally {
      setBusy(false);
    }
  };

  const fieldSt = { width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.50)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 28, padding: '32px 30px', width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 20, top: 20, width: 36, height: 36, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <DefaultBrandMark size={50} />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.5)' }}>Submit a new organisation</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A2744', marginTop: 2 }}>Send a listing for admin review</div>
          </div>
        </div>
        <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(245,166,35,0.09)', border: '1px solid rgba(245,166,35,0.18)', fontSize: 13, color: 'rgba(26,39,68,0.75)', marginBottom: 10 }}>
          New organisations are never published directly. Every submission goes into admin moderation first.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Organisation name *</label>
            <input value={form.organisationName} onChange={set('organisationName')} required placeholder="Organisation name" style={fieldSt} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Your name *</label>
              <input value={form.contactName} onChange={set('contactName')} required placeholder="Contact name" style={fieldSt} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Email *</label>
              <input value={form.email} onChange={set('email')} required type="email" placeholder="you@example.org" style={fieldSt} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="Phone number" style={fieldSt} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Website</label>
              <input value={form.website} onChange={set('website')} placeholder="https://..." style={fieldSt} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Town or area</label>
              <input value={form.town} onChange={set('town')} placeholder="Town or area" style={fieldSt} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Category</label>
              <input value={form.category} onChange={set('category')} placeholder="e.g. Carers, Mental Health" style={fieldSt} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Short summary *</label>
            <textarea value={form.summary} onChange={set('summary')} required rows={3} placeholder="What support does this organisation offer?" style={{ ...fieldSt, resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Why should it be added? *</label>
            <textarea value={form.reason} onChange={set('reason')} required rows={4} placeholder="Tell the admin team why this is useful and should be reviewed for listing." style={{ ...fieldSt, resize: 'vertical' }} />
          </div>
          {error ? <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" type="submit" disabled={busy} style={{ flex: 1 }}>{busy ? 'Submitting...' : 'Submit for admin review'}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── StickyMobileBar ────────────────────────────────────── */
const StickyMobileBar = ({ listing, onShareQuick, onOpenShareMenu, onOpenDirections }) => (
  <div className="sticky-mobile-bar">
    {listing.phone && (
      <a href={`tel:${listing.phone}`} className="sticky-bar-btn sticky-bar-btn--primary">
        <IPhone s={18} /> Call
      </a>
    )}
    {listing.website && (
      <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} target="_blank" rel="noreferrer" className="sticky-bar-btn">
        <IGlobe s={18} /> Website
      </a>
    )}
    <button onClick={onOpenDirections} className="sticky-bar-btn">
      <IPin s={18} /> Directions
    </button>
    <button onClick={onShareQuick} className="sticky-bar-btn sticky-bar-btn--share" title="Quick share">
      <IShare s={18} /> Share
    </button>
    <button onClick={onOpenShareMenu} className="sticky-bar-btn" title="More share options">
      <IArrow s={16} /> More
    </button>
  </div>
);

const MobileShareSheet = ({ listing, onAction, onClose }) => {
  if (!listing) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 240, background: 'rgba(15,23,42,0.45)', display: 'grid', alignItems: 'end' }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '22px 22px 0 0', borderTop: '1px solid #E8EDF8', padding: '16px 16px 22px', boxShadow: '0 -20px 50px rgba(15,23,42,0.2)' }}>
        <div style={{ width: 44, height: 5, borderRadius: 999, background: '#DCE5F3', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A2744' }}>Share listing</div>
        <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.62)', marginTop: 4, marginBottom: 12 }}>{listing.title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SHARE_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => { onAction(ch.id, listing); onClose(); }}
              style={{ border: '1px solid #E5ECF8', borderRadius: 14, background: '#FBFDFF', minHeight: 48, padding: '0 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: 9, fontSize: 13, fontWeight: 600, color: '#1A2744' }}
            >
              <span style={{ color: ch.color || '#1A2744', display: 'flex' }}><ch.Icon s={16} /></span>
              {ch.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
};

/* ─── RelatedListings ────────────────────────────────────── */
const RelatedListings = ({ current, allResources, onOpen }) => {
  const related = React.useMemo(
    () => allResources.filter((r) => r.id !== current.id && r.cat === current.cat).slice(0, 3),
    [current, allResources],
  );

  if (!related.length) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22 }}>Similar services nearby</h2>
        <span style={{ fontSize: 13, color: 'rgba(26,39,68,0.5)' }}>in {current.categoryLabel}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {related.map((r) => {
          const color = toneMapColor(r.tone).fg;
          return (
            <div key={r.id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
              onClick={() => onOpen(r)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                <IconTile tone={r.tone} size={44} radius={12}>{r.icon}</IconTile>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>{r.categoryLabel}</div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15.5, marginTop: 3, color: '#1A2744', lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 3 }}>{r.venue} · {r.locationLabel}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EFF1F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)' }}>{r.when}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 4 }}>Open <IArrow s={12} /></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── DetailSection wrapper ──────────────────────────────── */
const DetailSection = ({ title, icon, children }) => (
  <div style={{ borderTop: '1px solid #EFF1F7', paddingTop: 22, marginTop: 22 }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {icon && <span style={{ color: 'rgba(26,39,68,0.45)' }}>{icon}</span>}
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(26,39,68,0.45)' }}>{title}</div>
      </div>
    )}
    {children}
  </div>
);

/* ─── ContactItem ────────────────────────────────────────── */
const ContactItem = ({ icon, label, value, href, external = false }) => {
  if (!value) return null;
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 14, background: '#F7FAFF', border: '1px solid #EEF2FA', transition: 'background 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF5FF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F7FAFF'; }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(26,39,68,0.06)', display: 'grid', placeItems: 'center', color: '#1A2744', flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,39,68,0.45)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1A2744', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} style={{ display: 'block', textDecoration: 'none' }}>{content}</a>;
  return content;
};

const formatEventDateTime = (value) => {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
};

const EventActionModal = ({ listing, event, onClose, onSuccess, onFailure }) => {
  const [form, setForm] = React.useState({ fullName: '', email: '', phone: '', message: '', spacesRequested: 1 });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const updateField = (key) => (formEvent) => setForm((prev) => ({ ...prev, [key]: formEvent.target.value }));

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await insertEventEnquiry({
        listing,
        event,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        spacesRequested: form.spacesRequested,
      });

      if (event.cta_type === 'book' && event.booking_url) {
        window.open(event.booking_url, '_blank', 'noopener,noreferrer');
        onSuccess(`Booking opened for ${event.title}. Enquiry added to the organiser pipeline.`);
      } else {
        const destinationEmail = event.contact_email || listing.email;
        if (destinationEmail) {
          const subject = encodeURIComponent(`Enquiry: ${event.title}`);
          const body = encodeURIComponent([
            `Name: ${form.fullName.trim()}`,
            `Email: ${form.email.trim()}`,
            `Phone: ${form.phone.trim() || 'Not provided'}`,
            `Spaces requested: ${Number(form.spacesRequested) || 1}`,
            '',
            form.message.trim() || 'No message provided.',
          ].join('\n'));
          window.location.href = `mailto:${destinationEmail}?subject=${subject}&body=${body}`;
          onSuccess(`Contact email prepared for ${listing.venue}. Enquiry added to the organiser pipeline.`);
        } else {
          onSuccess('Enquiry added to the organiser pipeline. No direct contact email is available yet.');
        }
      }
    } catch (submitError) {
      const message = submitError.message || 'Unable to send your request right now.';
      setError(message);
      onFailure?.(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(15,23,42,0.48)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(overlayEvent) => { if (overlayEvent.target === overlayEvent.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 26, borderRadius: 26, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 38, height: 38, borderRadius: 999, border: '1px solid #E8EDF8', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}><IClose s={16} /></button>
        <div className="eyebrow" style={{ color: '#2D9CDB' }}>{event.cta_type === 'book' ? 'Book your place' : 'Contact provider'}</div>
        <h3 style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{event.title}</h3>
        <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65 }}>{formatEventDateTime(event.starts_at)} · {event.location || listing.locationLabel}</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <input value={form.fullName} onChange={updateField('fullName')} placeholder="Full name" style={{ width: '100%', borderRadius: 14, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
          <input value={form.email} onChange={updateField('email')} type="email" placeholder="Email" style={{ width: '100%', borderRadius: 14, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
            <input value={form.phone} onChange={updateField('phone')} type="tel" placeholder="Phone" style={{ width: '100%', borderRadius: 14, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
            <input value={form.spacesRequested} onChange={updateField('spacesRequested')} type="number" min="1" placeholder="Spaces" style={{ width: '100%', borderRadius: 14, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
          </div>
          <textarea value={form.message} onChange={updateField('message')} rows={4} placeholder="Message" style={{ width: '100%', borderRadius: 14, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF', resize: 'vertical' }} />
          {error ? <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" type="submit" disabled={busy} style={{ flex: 1 }}>{busy ? 'Sending...' : (event.cta_type === 'book' ? 'Book your place' : 'Contact provider')}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── ResourceDetail ─────────────────────────────────────── */
const ResourceDetail = ({ listing, onBack, onShareAction, allResources, savedIds, onToggleSave, onOpenResource, onNotify, onNavigate }) => {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [mobileShareOpen, setMobileShareOpen] = React.useState(false);
  const [claimOpen, setClaimOpen] = React.useState(false);
  const [claimSuccess, setClaimSuccess] = React.useState(null);
  const [activeEvent, setActiveEvent] = React.useState(null);
  const isMobile = useIsMobile();
  const heroBg = toneMapColor(listing?.tone || 'navy').fg;
  const shareTrayRef = React.useRef(null);

  React.useEffect(() => {
    const onPointerDown = (event) => {
      if (!shareOpen) return;
      if (shareTrayRef.current && !shareTrayRef.current.contains(event.target)) setShareOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setShareOpen(false);
        setMobileShareOpen(false);
      }
    };
    const onScroll = () => {
      setShareOpen(false);
      setMobileShareOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
      window.removeEventListener('scroll', onScroll);
    };
  }, [shareOpen]);

  if (!listing) {
    return (
      <section style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <StateCard title="This resource is no longer available." subtitle="Try returning to the full directory results." />
        </div>
      </section>
    );
  }

  const saved = savedIds?.has(listing.id);
  const websiteUrl = listing.website ? (listing.website.startsWith('http') ? listing.website : `https://${listing.website}`) : null;
  const domain = getDomain(listing.website);
  const profileBio = listing.profile?.bio || listing.desc;
  const organisationDisplayName = [
    listing.profile?.display_name,
    listing.profile?.name,
    listing.resourceOrganisationName,
    listing.providerName,
    listing.title,
    deriveOrganisationNameFromContact({ email: listing.email, website: listing.website }),
  ].find((value) => !isGenericOrganisationValue(value)) || 'Community support';

  const handleMobileQuickShare = async () => {
    const resourceUrl = getListingUrl(listing);
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text: `${listing.title} • ${listing.categoryLabel}`, url: resourceUrl });
        return;
      } catch {
        // User cancelled native share; fall through to opening the sheet.
      }
    }
    setMobileShareOpen(true);
  };

  return (
    <section style={{ paddingBottom: isMobile ? 100 : 80, background: '#FAFBFF' }}>
      {/* Hero banner */}
      <div style={{ background: `linear-gradient(135deg, ${heroBg}18 0%, ${heroBg}30 40%, ${heroBg}10 100%)`, borderBottom: `1px solid ${heroBg}22`, paddingTop: 20, paddingBottom: 36, position: 'relative' }}>
        <div className="container">
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: '#1A2744', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 999, padding: '7px 14px', backdropFilter: 'blur(6px)', marginBottom: 28 }}>
            <IChevron s={12} dir="left" /> Back to results
          </button>

          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <OrgAvatar listing={listing} size={isMobile ? 72 : 90} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: heroBg }}>{listing.categoryLabel}</span>
                {listing.tags.includes('Verified') && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 999 }}>
                    <IBadge s={10} /> Verified
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.025em', lineHeight: 1.15, color: '#1A2744', marginBottom: 8 }}>{listing.title}</h1>
              <div style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.65)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <IBuilding s={14} />
                <span style={{ fontWeight: 600 }}>{listing.venue}</span>
                {listing.locationLabel && <><span style={{ opacity: 0.4 }}>·</span><span>{listing.locationLabel}</span></>}
                {listing.postcode && <><span style={{ opacity: 0.4 }}>·</span><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{listing.postcode}</span></>}
                {listing.footprintBadge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: listing.footprintBadge.color, background: listing.footprintBadge.bg }}>{listing.footprintBadge.label}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 30 }}>
        {/* Trust badges */}
        <div style={{ marginBottom: 22 }}>
          <TrustBadges listing={listing} />
        </div>

        {/* Primary action buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="btn btn-navy btn-sm" style={{ gap: 8 }}>
                <IGlobe s={16} /> Visit Website
              </a>
            )}
            {listing.phone && (
              <a href={`tel:${listing.phone}`} className="btn btn-ghost btn-sm" style={{ gap: 8 }}>
                <IPhone s={16} /> Call
              </a>
            )}
            {listing.email && (
              <a href={`mailto:${listing.email}`} className="btn btn-ghost btn-sm" style={{ gap: 8 }}>
                <IMail s={16} /> Email
              </a>
            )}
            <a href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 8 }}>
              <IDirections s={16} /> Directions
            </a>
            <div style={{ position: 'relative' }} ref={shareTrayRef}>
              <button onClick={() => setShareOpen((o) => !o)} className="btn btn-sky btn-sm" style={{ gap: 8 }}>
                <IShare s={16} /> Share
              </button>
              {shareOpen && (
                <ShareTray
                  listing={listing}
                  onAction={(action, lst) => { setShareOpen(false); onShareAction(action, lst); }}
                  onClose={() => setShareOpen(false)}
                />
              )}
            </div>
            <button
              onClick={() => onToggleSave && onToggleSave(listing.id)}
              className="btn btn-ghost btn-sm"
              style={{ gap: 8, color: saved ? '#F4613A' : '#1A2744' }}
            >
              <IHeart s={16} /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1fr', gap: isMobile ? 24 : 28, alignItems: 'start' }}>
          {/* LEFT: Content */}
          <div>
            {/* About */}
            <div style={{ background: 'white', borderRadius: 22, padding: 24, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>About this service</h2>
              <p style={{ fontSize: 15.5, color: 'rgba(26,39,68,0.78)', lineHeight: 1.7 }}>{profileBio}</p>

              {/* Service tags */}
              {listing.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
                  {listing.tags.map((tag) => (
                    <span key={tag} className="chip" style={{ fontSize: 12, padding: '4px 10px' }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Availability section */}
              <DetailSection title="Availability & hours" icon={<IShield s={14} />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(91,201,74,0.07)', border: '1px solid rgba(91,201,74,0.18)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: '#5BC94A', flexShrink: 0 }} />
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1A2744' }}>{listing.when}</div>
                </div>
              </DetailSection>

              {/* Who this is for */}
              <DetailSection title="Who this is for" icon={<IGroups s={14} />}>
                <p style={{ fontSize: 14.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.65 }}>
                  {['carer-support', 'carers'].includes(listing.cat)
                    ? 'This service is designed to support unpaid carers, family carers, and the people they care for.'
                    : ['mental-health-wellbeing'].includes(listing.cat)
                    ? 'This service supports people experiencing mental health challenges, stress, anxiety, or low wellbeing.'
                    : ['crisis-safety-support'].includes(listing.cat)
                    ? 'This service is for people in crisis or those who need emergency emotional support.'
                    : `This service is open to people in ${listing.locationLabel || DEFAULT_COUNTY_LABEL} who need support related to ${listing.categoryLabel.toLowerCase()}.`}
                </p>
              </DetailSection>

              {SUPPORTS_ORGANISATION_FEATURES && (listing.serviceCategories.length || listing.areasCovered.length) ? (
                <DetailSection title="Organisation profile" icon={<IHub s={14} />}>
                  {listing.serviceCategories.length ? <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginBottom: 10 }}><strong style={{ color: '#1A2744' }}>Services:</strong> {listing.serviceCategories.join(', ')}</div> : null}
                  {listing.areasCovered.length ? <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)' }}><strong style={{ color: '#1A2744' }}>Areas covered:</strong> {listing.areasCovered.join(', ')}</div> : null}
                </DetailSection>
              ) : null}

              <DetailSection title="Events by this organisation" icon={<IEvent s={14} />}>
                {!SUPPORTS_ORGANISATION_FEATURES ? (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(45,156,219,0.06)', border: '1px dashed rgba(45,156,219,0.2)', color: 'rgba(26,39,68,0.6)', fontSize: 14, lineHeight: 1.6 }}>
                    Organisation events and booking requests are currently unavailable on the live legacy data model.
                  </div>
                ) : !listing.events.length ? (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(45,156,219,0.06)', border: '1px dashed rgba(45,156,219,0.2)', color: 'rgba(26,39,68,0.6)', fontSize: 14, lineHeight: 1.6 }}>
                    No upcoming events listed right now. Check back soon, or contact this organisation directly to find out about sessions, groups, and activities they run.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {listing.events.map((event) => (
                      <div key={event.id} style={{ borderRadius: 16, border: '1px solid #EFF1F7', padding: 16, background: '#FAFBFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{event.title}</div>
                            <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{formatEventDateTime(event.starts_at)} · {event.location || listing.locationLabel}</div>
                          </div>
                          <div style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(45,156,219,0.12)', color: '#165a85', fontSize: 11.5, fontWeight: 700 }}>{event.event_type || 'Event'}</div>
                        </div>
                        <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.72)', fontSize: 13.5, lineHeight: 1.6 }}>{event.description || 'Local session hosted by this organisation.'}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                          <button className="btn btn-gold btn-sm" onClick={() => setActiveEvent(event)}>{event.cta_type === 'book' ? 'Book your place' : 'Contact provider'}</button>
                          {event.capacity ? <span className="chip chip-sky">Capacity {event.capacity}</span> : null}
                          {event.spaces_note ? <span className="chip">{event.spaces_note}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DetailSection>

              {/* Location */}
              <DetailSection title="Location" icon={<IPin s={14} />}>
                <div style={{ display: 'grid', gap: 8 }}>
                  {listing.footprintBadge && (
                    <div style={{ padding: '8px 12px', borderRadius: 10, background: listing.footprintBadge.bg, border: `1px solid ${listing.footprintBadge.color}28`, fontSize: 13, color: '#1A2744', fontWeight: 500 }}>
                      <span style={{ fontWeight: 700, color: listing.footprintBadge.color }}>{listing.footprintBadge.label}:</span>{' '}
                      {listing.serviceFootprintModel === 'county_wide'
                        ? 'This service operates county-wide rather than from a single fixed venue.'
                        : listing.serviceFootprintModel === 'multi_location'
                        ? 'This service operates from multiple locations across the area.'
                        : 'Organisation headquarters — contact for local service details.'}
                    </div>
                  )}
                  {listing.address && (
                    <div style={{ fontSize: 14.5, color: '#1A2744', fontWeight: 500 }}>{listing.address}</div>
                  )}
                  {listing.postcode && (
                    <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.6)', fontFamily: 'monospace' }}>{listing.postcode}</div>
                  )}
                  {listing.locationLabel && (
                    <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.6)' }}>{listing.locationLabel}</div>
                  )}
                  {(!listing.serviceFootprintModel || listing.serviceFootprintModel === 'physical_venue' || listing.serviceFootprintModel === 'hq_only') && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <a href={getMapsOpenUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                        <IPin s={14} /> View on map
                      </a>
                      <a href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                        <IDirections s={14} /> Get directions
                      </a>
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>

            {/* Contact details */}
            <div style={{ background: 'white', borderRadius: 22, padding: 24, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Contact details</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <ContactItem icon={<IBuilding s={16} />} label="Organisation" value={organisationDisplayName} />
                <ContactItem icon={<IPhone s={16} />} label="Phone" value={listing.phone} href={listing.phone ? `tel:${listing.phone}` : null} />
                <ContactItem icon={<IMail s={16} />} label="Email" value={listing.email} href={listing.email ? `mailto:${listing.email}` : null} />
                <ContactItem icon={<IGlobe s={16} />} label="Website" value={domain || listing.website || null} href={websiteUrl} external />
              </div>

              {/* Last checked label */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #EFF1F7', display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(26,39,68,0.45)', fontSize: 12, fontWeight: 600 }}>
                <IShield s={12} />
                Listing maintained by Cornwall community team · Last reviewed {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Share panel */}
            <div style={{ background: 'linear-gradient(180deg, #F0F7FF 0%, #EAF3FF 100%)', borderRadius: 22, padding: 22, border: '1px solid #D8EAF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <IShare s={16} />
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16 }}>Share with a client</div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)', marginBottom: 16, lineHeight: 1.6 }}>
                Send this listing directly via link, email, WhatsApp or social. Designed for trusted worker–client sharing.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {SHARE_CHANNELS.map((ch) => (
                  <button key={ch.id} onClick={() => onShareAction(ch.id, listing)}
                    style={{ width: '100%', textAlign: 'left', padding: '11px 14px', borderRadius: 14, fontSize: 14, fontWeight: 600, color: '#1A2744', display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #E2EDF7', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F9FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}>
                    <span style={{ color: ch.color || '#1A2744', display: 'flex', flexShrink: 0 }}><ch.Icon s={17} /></span>
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Trust signals */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #D8EAF9' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(26,39,68,0.45)', marginBottom: 10 }}>Trust signals</div>
                {[
                  'Listed in verified Cornwall directory',
                  'Shareable direct link',
                  'Contact details verified',
                  'Community team reviewed',
                ].map((signal) => (
                  <div key={signal} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(26,39,68,0.72)', marginBottom: 7 }}>
                    <IBadge s={12} style={{ color: '#10B981' }} />
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            {/* Save panel */}
            <div style={{ background: 'white', borderRadius: 22, padding: 18, border: '1px solid #EFF1F7', display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => onToggleSave && onToggleSave(listing.id)} style={{ width: 48, height: 48, borderRadius: 14, background: saved ? 'rgba(244,97,58,0.12)' : 'rgba(26,39,68,0.06)', color: saved ? '#F4613A' : '#1A2744', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background 0.2s ease, color 0.2s ease' }}>
                <IHeart s={20} />
              </button>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{saved ? 'Saved to your list' : 'Save this listing'}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.55)', marginTop: 2 }}>Saved listings stay available in this session</div>
              </div>
            </div>

            {/* Claim listing */}
            {!SUPPORTS_CLAIMS ? (
              <div style={{ background: 'white', borderRadius: 22, padding: 18, border: '1px solid #EFF1F7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(26,39,68,0.07)', color: '#1A2744', display: 'grid', placeItems: 'center' }}>
                    <IBuilding s={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Claim workflow unavailable</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)', marginTop: 1 }}>Listing claims are disabled on the current live schema.</div>
                  </div>
                </div>
              </div>
            ) : !claimSuccess ? (
              <div style={{ background: 'white', borderRadius: 22, padding: 18, border: '1px solid #EFF1F7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(245,166,35,0.1)', color: '#F5A623', display: 'grid', placeItems: 'center' }}>
                    <IBuilding s={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Own this listing and unlock your dashboard</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)', marginTop: 1 }}>Claim it to manage details, publish events and prepare premium upgrades</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'grid', gap: 7 }}>
                  {[
                    'Update your logo, description and support categories',
                    'Add your first live event before approval completes',
                    'Preview featured placement and enquiry capture upgrades',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(26,39,68,0.72)' }}>
                      <ICheck s={14} style={{ color: '#10B981' }} />
                      {item}
                    </div>
                  ))}
                </div>
                <button onClick={() => setClaimOpen(true)} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 14, justifyContent: 'center', gap: 8 }}>
                  <IFlag s={14} /> Claim listing and start onboarding
                </button>
                <div style={{ marginTop: 10, fontSize: 11.5, color: 'rgba(26,39,68,0.48)' }}>Featured listings, enquiry tracking and paid upgrades can be added after approval.</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 22, padding: 18, border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ICheck s={18} style={{ color: '#10B981' }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A2744' }}>Claim submitted for review</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.66)', marginTop: 3 }}>We have received {claimSuccess.organisationName || claimSuccess.listingName || 'your organisation'} and opened your onboarding path.</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                  {[
                    'Step 1: sign in to your organisation dashboard',
                    'Step 2: add your logo, description and categories',
                    'Step 3: publish your first event to improve visibility',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(26,39,68,0.72)' }}>
                      <IBadge s={13} style={{ color: '#10B981' }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  <button className="btn btn-gold btn-sm" onClick={() => onNavigate?.('profile')}>Open owner dashboard</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setClaimSuccess(null)}>Close success state</button>
                </div>
                <div style={{ marginTop: 10, fontSize: 11.5, color: 'rgba(26,39,68,0.48)' }}>Your claim stays pending until an admin approves it, but you can complete onboarding now.</div>
              </div>
            )}
          </div>
        </div>

        {/* Related listings */}
        <RelatedListings current={listing} allResources={allResources} onOpen={onOpenResource} />
      </div>

      {/* Mobile sticky bar */}
      {isMobile && (
        <StickyMobileBar
          listing={listing}
          onShareQuick={handleMobileQuickShare}
          onOpenShareMenu={() => setMobileShareOpen(true)}
          onOpenDirections={() => window.open(getMapsDirectionsUrl(listing), '_blank', 'noopener,noreferrer')}
        />
      )}

      {mobileShareOpen && <MobileShareSheet listing={listing} onAction={onShareAction} onClose={() => setMobileShareOpen(false)} />}

      {/* Claim modal */}
      {SUPPORTS_CLAIMS && claimOpen && (
        <ClaimModal
          listing={listing}
          onClose={() => setClaimOpen(false)}
          onSuccess={(payload) => {
            setClaimOpen(false);
            setClaimSuccess(payload || { listingName: listing?.title || 'this listing' });
            const listingName = payload?.listingName || listing?.title || 'this listing';
            const organisationName = payload?.organisationName || listingName;
            onNotify?.(`Claim request submitted for ${listingName} (${organisationName}).`);
          }}
          onError={(message) => onNotify?.(message)}
        />
      )}
      {SUPPORTS_ORGANISATION_FEATURES && activeEvent ? <EventActionModal listing={listing} event={activeEvent} onClose={() => setActiveEvent(null)} onSuccess={(message) => { setActiveEvent(null); onNotify?.(message); }} onFailure={(message) => onNotify?.(message)} /> : null}
    </section>
  );
};

/* ─── ListingCard ────────────────────────────────────────── */
const ListingCard = ({ listing, saved, onToggleSave, onOpenResource, onShareAction, shareOpen, setShareOpen, selected, onSelect }) => {
  const color = toneMapColor(listing.tone).fg;

  return (
    <div
      className="card"
      onClick={() => onSelect(listing.id)}
      style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 0, border: selected ? `1.5px solid ${color}` : '1px solid #EFF1F7', boxShadow: selected ? `0 12px 32px ${color}20` : 'var(--shadow-sm)', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
        <OrgAvatar listing={listing} size={54} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{listing.categoryLabel}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
              style={{ width: 32, height: 32, borderRadius: 999, background: saved ? 'rgba(244,97,58,0.12)' : 'rgba(26,39,68,0.05)', color: saved ? '#F4613A' : 'rgba(26,39,68,0.45)', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background 0.18s, color 0.18s' }}
              title={saved ? 'Unsave' : 'Save listing'}
            >
              <IHeart s={15} />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenResource(listing); }}
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, marginTop: 3, letterSpacing: '-0.01em', color: '#1A2744', textAlign: 'left', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {listing.title}
          </button>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.6)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <IBuilding s={12} />
            <span>{listing.venue} · {listing.locationLabel}</span>
            {listing.footprintBadge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: listing.footprintBadge.color, background: listing.footprintBadge.bg }}>{listing.footprintBadge.label}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.7)', lineHeight: 1.55, marginTop: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.desc}</p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {listing.tags.slice(0, 3).map((tag) => <span key={tag} className="chip" style={{ padding: '3px 9px', fontSize: 11 }}>{tag}</span>)}
        {listing.website && (
          <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} target="_blank" rel="noreferrer"
            className="chip chip-sky" onClick={(e) => e.stopPropagation()} style={{ padding: '3px 9px', fontSize: 11 }}>
            <IGlobe s={11} /> Website
          </a>
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 14, borderTop: '1px solid #F0F2FA' }}>
        <div style={{ fontSize: 12.5 }}>
          <span style={{ fontWeight: 700, color: '#1A2744' }}>{listing.when}</span>
          <span style={{ color: 'rgba(26,39,68,0.45)', marginLeft: 5 }}>· {listing.distance}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpenResource(listing); }} style={{ gap: 6 }}>
            View <IArrow s={14} />
          </button>
          <button className="btn btn-sky btn-sm" onClick={(e) => { e.stopPropagation(); setShareOpen(shareOpen ? '' : listing.id); }} style={{ gap: 6 }}>
            <IShare s={14} /> Share
          </button>
          {shareOpen && <ShareTray listing={listing} onAction={onShareAction} onClose={() => setShareOpen('')} />}
        </div>
      </div>
    </div>
  );
};

/* ─── Premium map SVG marker templates ──────────────────── */
const _SVG_PIN_STANDARD = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 2C9 2 3 8 3 15c0 8.5 13 23 13 23s13-14.5 13-23C29 8 23 2 16 2z" fill="#2D9CDB"/><circle cx="16" cy="14" r="6" fill="white"/></svg>`;
const _SVG_PIN_PREMIUM = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 2C9 2 3 8 3 15c0 8.5 13 23 13 23s13-14.5 13-23C29 8 23 2 16 2z" fill="#F5A623"/><circle cx="16" cy="14" r="6" fill="white"/><text x="16" y="18" text-anchor="middle" fill="#F5A623" font-size="8" font-weight="bold" font-family="sans-serif">&#9733;</text></svg>`;
const _SVG_PIN_SELECTED = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path d="M20 2C11 2 3.5 9.5 3.5 19c0 10.5 16.5 29 16.5 29s16.5-18.5 16.5-29C36.5 9.5 29 2 20 2z" fill="#1A2744"/><circle cx="20" cy="19" r="8" fill="white"/></svg>`;

const _makeClusterSvg = (count, s) => {
  const half = s / 2;
  const text = count > 99 ? '99+' : String(count);
  const fs = count > 9 ? 13 : 15;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${half}" cy="${half}" r="${half}" fill="#1A2744" opacity="0.18"/><circle cx="${half}" cy="${half}" r="${half - 4}" fill="#1A2744"/><circle cx="${half}" cy="${half}" r="${half - 8}" fill="#2D9CDB"/><text x="${half}" y="${half + 4.5}" text-anchor="middle" fill="white" font-size="${fs}" font-weight="800" font-family="Inter,sans-serif">${text}</text></svg>`;
};

const DirectoryMap = ({ listings, selectedId, onSelect, onOpenResource, isMobile }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({ id: 'ic-google-map', googleMapsApiKey: googleMapsApiKey || '', libraries: MAP_LIBRARIES });

  const [mapCat, setMapCat] = React.useState('all');
  const [mapPremiumOnly, setMapPremiumOnly] = React.useState(false);
  const [mapHasEvents, setMapHasEvents] = React.useState(false);
  const [mapArea, setMapArea] = React.useState('all');

  const mapRef = React.useRef(null);
  const clusterRef = React.useRef(null);
  const markerMapRef = React.useRef(new Map());
  const shouldAutoFitRef = React.useRef(true);
  const panelRef = React.useRef(null);
  const iconsRef = React.useRef(null);

  React.useEffect(() => {
    if (!selectedId || !panelRef.current) return;
    const el = panelRef.current.querySelector(`[data-lid="${selectedId}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const allPoints = React.useMemo(
    () => listings.filter((item) => item.lat !== null && item.lng !== null && isCoordinatePairSane(item.lat, item.lng)),
    [listings],
  );

  const mapCatOptions = React.useMemo(() => {
    const seen = new Set();
    const result = [{ id: 'all', label: 'All categories' }];
    allPoints.forEach((item) => {
      if (!seen.has(item.cat)) { seen.add(item.cat); result.push({ id: item.cat, label: item.categoryLabel }); }
    });
    return [result[0], ...result.slice(1).sort((a, b) => a.label.localeCompare(b.label))];
  }, [allPoints]);

  const getMapAreaLabel = React.useCallback((item) => {
    const town = cleanPlaceLabel(item?.town);
    if (town) return town;
    const area = cleanPlaceLabel(item?.area);
    if (area) return area;
    return cleanPlaceLabel(item?.locationLabel);
  }, []);

  const mapAreaOptions = React.useMemo(() => {
    const set = new Set();
    allPoints.forEach((item) => {
      const label = getMapAreaLabel(item);
      if (label) set.add(label);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allPoints, getMapAreaLabel]);

  const points = React.useMemo(() => allPoints.filter((item) => {
    if (mapCat !== 'all' && item.cat !== mapCat) return false;
    if (mapPremiumOnly && !item.profile) return false;
    if (mapHasEvents && (!item.events || !item.events.length)) return false;
    if (mapArea !== 'all' && getMapAreaLabel(item) !== mapArea) return false;
    return true;
  }), [allPoints, mapCat, mapPremiumOnly, mapHasEvents, mapArea, getMapAreaLabel]);

  const selected = selectedId ? (allPoints.find((item) => item.id === selectedId) || null) : null;

  const fitToPoints = React.useCallback(() => {
    if (!mapRef.current || !points.length || !window.google?.maps) return;
    if (points.length === 1) { mapRef.current.panTo({ lat: points[0].lat, lng: points[0].lng }); mapRef.current.setZoom(13); return; }
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((pt) => bounds.extend({ lat: pt.lat, lng: pt.lng }));
    mapRef.current.fitBounds(bounds, isMobile ? 48 : 72);
  }, [isMobile, points]);

  React.useEffect(() => { shouldAutoFitRef.current = true; }, [listings]);

  // Stable initial center — never recreated, so the library's setCenter effect
  // only fires once (on map init) and never on deselection.
  const mapInitialCenter = React.useMemo(() => ({ lat: 50.266, lng: -5.05 }), []);

  // Imperatively pan to a newly selected pin.
  // Guard: only when selectedId is non-empty, so clearing selection never pans.
  React.useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const pt = allPoints.find((p) => p.id === selectedId);
    if (pt) mapRef.current.panTo({ lat: pt.lat, lng: pt.lng });
  }, [selectedId, allPoints]);

  // Single effect owns icon creation, marker creation, and clustering.
  // Icons are created inline so there is no cross-effect dependency that
  // can cause the guard to fire before icons exist.
  React.useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps) return undefined;
    const { Size, Point, Marker } = window.google.maps;

    // Build icons here — no separate effect, no race condition
    const mkI = (svg, w, h, ax, ay) => ({
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      scaledSize: new Size(w, h),
      anchor: new Point(ax, ay),
    });
    const icons = {
      standard: mkI(_SVG_PIN_STANDARD, 32, 40, 16, 40),
      premium:  mkI(_SVG_PIN_PREMIUM,  32, 40, 16, 40),
      selected: mkI(_SVG_PIN_SELECTED, 40, 50, 20, 50),
    };
    iconsRef.current = icons; // share with selected-icon effect

    // Proper teardown of previous clusterer — setMap(null) removes the idle
    // listener; clearMarkers() does not, leaving a zombie that can race.
    if (clusterRef.current) { clusterRef.current.setMap(null); clusterRef.current = null; }
    markerMapRef.current.forEach((m) => m.setMap(null));
    markerMapRef.current.clear();

    const newMarkers = points.map((listing) => {
      const isPremium = Boolean(listing.profile);
      const marker = new Marker({
        position: { lat: listing.lat, lng: listing.lng },
        title: listing.title,
        icon: isPremium ? icons.premium : icons.standard,
        zIndex: isPremium ? 2 : 1,
      });
      marker.addListener('click', () => onSelect(listing.id));
      markerMapRef.current.set(listing.id, marker);
      return marker;
    });

    // Use the library's DefaultRenderer — it handles legacy Marker correctly
    // when the map has no mapId (our case). Custom cluster SVG renderer is
    // re-added once basic pin rendering is confirmed working on live.
    clusterRef.current = new MarkerClusterer({ map: mapRef.current, markers: newMarkers });

    if (shouldAutoFitRef.current) { fitToPoints(); shouldAutoFitRef.current = false; }

    return () => {
      if (clusterRef.current) { clusterRef.current.setMap(null); clusterRef.current = null; }
      markerMapRef.current.forEach((m) => m.setMap(null));
      markerMapRef.current.clear();
    };
  }, [fitToPoints, isLoaded, onSelect, points]);

  // Selected-marker icon swap — runs only when selection changes, no full
  // marker recreation needed. iconsRef is always populated by the effect above
  // (same flush, defined first), so the guard is safe here.
  React.useEffect(() => {
    if (!isLoaded || !window.google?.maps || !iconsRef.current) return;
    const icons = iconsRef.current;
    const MAX_Z = (Number(window.google.maps.Marker.MAX_ZINDEX) || 1000000);
    markerMapRef.current.forEach((marker, id) => {
      const listing = points.find((p) => p.id === id);
      if (!listing) return;
      const isPremium = Boolean(listing.profile);
      if (id === selectedId) { marker.setIcon(icons.selected); marker.setZIndex(MAX_Z); }
      else { marker.setIcon(isPremium ? icons.premium : icons.standard); marker.setZIndex(isPremium ? 2 : 1); }
    });
  }, [isLoaded, selectedId, points]);

  React.useEffect(() => {
    if (mapArea !== 'all' && mapAreaOptions.length > 0 && !mapAreaOptions.includes(mapArea)) {
      setMapArea('all');
    }
  }, [mapArea, mapAreaOptions]);

  const hasMapFilter = mapCat !== 'all' || mapPremiumOnly || mapHasEvents || mapArea !== 'all';
  const resetMapFilter = () => {
    setMapCat('all');
    setMapPremiumOnly(false);
    setMapHasEvents(false);
    setMapArea('all');
  };

  const chipActive = { background: '#1A2744', color: 'white', border: '1px solid #1A2744' };
  const chipBase = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: '1px solid #E0E8F5', background: 'white', color: '#1A2744', whiteSpace: 'nowrap' };

  if (!googleMapsApiKey) {
    return <StateCard title="Google Maps key is missing" subtitle="Add VITE_GOOGLE_MAPS_API_KEY to enable full interactive map pins and routing." />;
  }

  if (!allPoints.length) {
    return <StateCard title="No mappable coordinates in this result set" subtitle="Switch category or list view to explore all resources." />;
  }

  return (
    <div>
      {/* Dedicated map filter toolbar */}
      <div style={{ position: 'sticky', top: 10, zIndex: 6, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 18, border: '1px solid #E6EDF9', background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 24px rgba(26,39,68,0.08)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, flex: '1 1 520px', minWidth: 0 }}>
            <select
              value={mapCat}
              onChange={(e) => setMapCat(e.target.value)}
              style={{ minHeight: 36, padding: '0 12px', borderRadius: 999, border: '1px solid #E0E8F5', background: mapCat !== 'all' ? '#1A2744' : 'white', color: mapCat !== 'all' ? 'white' : '#1A2744', fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer' }}
            >
              {mapCatOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <button style={{ ...chipBase, minHeight: 36, transition: 'all 0.18s ease', ...(mapPremiumOnly ? chipActive : {}) }} onClick={() => setMapPremiumOnly((v) => !v)}>
              <span style={{ color: '#F5A623' }}>★</span> Premium
            </button>
            <button style={{ ...chipBase, minHeight: 36, transition: 'all 0.18s ease', ...(mapHasEvents ? chipActive : {}) }} onClick={() => setMapHasEvents((v) => !v)}>
              <IEvent s={13} /> Has events
            </button>
            <select
              value={mapArea}
              onChange={(e) => setMapArea(e.target.value)}
              style={{ minHeight: 36, padding: '0 12px', borderRadius: 999, border: '1px solid #E0E8F5', background: mapArea !== 'all' ? '#1A2744' : 'white', color: mapArea !== 'all' ? 'white' : '#1A2744', fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer', maxWidth: isMobile ? '100%' : 220 }}
            >
              <option value="all">All towns / areas</option>
              {mapAreaOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'rgba(26,39,68,0.55)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <strong style={{ color: '#1A2744' }}>{points.length}</strong> on map
            {points.length !== allPoints.length && <span>· {allPoints.length} total</span>}
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }} onClick={fitToPoints}><IPin s={13} /> Fit map</button>
            <button
              style={{ ...chipBase, minHeight: 36, background: hasMapFilter ? 'rgba(244,97,58,0.08)' : 'white', color: hasMapFilter ? '#F4613A' : 'rgba(26,39,68,0.5)', border: hasMapFilter ? '1px solid rgba(244,97,58,0.2)' : '1px solid #E0E8F5', transition: 'all 0.18s ease' }}
              onClick={resetMapFilter}
              disabled={!hasMapFilter}
            >
              <IClose s={12} /> Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Map + panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: 16, minHeight: isMobile ? 'auto' : 640 }}>

        {/* Side panel */}
        <div ref={panelRef} style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: isMobile ? 'none' : 640, overflowY: 'auto', paddingRight: isMobile ? 0 : 4, order: isMobile ? 2 : 1 }}>
          {points.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'rgba(26,39,68,0.55)', fontSize: 13 }}>No listings match the current map filter.</div>
          )}
          {points.map((listing) => {
            const active = listing.id === selectedId;
            const isPremium = Boolean(listing.profile);
            const accentColor = toneMapColor(listing.tone).fg;
            return (
              <div
                key={listing.id}
                data-lid={listing.id}
                className="card"
                onClick={() => onSelect(listing.id)}
                style={{ padding: '12px 14px', display: 'flex', gap: 11, alignItems: 'flex-start', border: active ? `1.5px solid ${accentColor}` : '1px solid #EFF1F7', boxShadow: active ? `0 8px 20px ${accentColor}22` : 'var(--shadow-sm)', cursor: 'pointer', borderRadius: 16, transition: 'box-shadow 0.15s, border-color 0.15s' }}
              >
                <div style={{ flexShrink: 0 }}>
                  {isPremium
                    ? <OrgAvatar listing={listing} size={44} />
                    : <IconTile tone={listing.tone} size={42} radius={10}>{listing.icon}</IconTile>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isPremium && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 999, background: 'rgba(245,166,35,0.12)', color: '#8a5a0b', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                      ★ Premium
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3, color: '#1A2744' }}>{listing.title}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(26,39,68,0.55)', marginTop: 2 }}>{listing.locationLabel}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 5, padding: '2px 7px', borderRadius: 999, background: `${accentColor}12`, color: accentColor, fontSize: 10.5, fontWeight: 600 }}>{listing.categoryLabel}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }} onClick={(e) => { e.stopPropagation(); onOpenResource(listing); }}>View profile</button>
                    {listing.lat !== null && listing.lng !== null && (
                      <a className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }} href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Directions</a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map pane */}
        <div style={{ padding: 0, overflow: 'hidden', borderRadius: 22, minHeight: isMobile ? 420 : 640, order: isMobile ? 1 : 2, boxShadow: '0 8px 32px rgba(26,39,68,0.13)', border: '1px solid #E8EEF8' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: isMobile ? '420px' : '640px', borderRadius: 22 }}
              center={mapInitialCenter}
              zoom={11}
              onLoad={(map) => { mapRef.current = map; }}
              onDragStart={() => { shouldAutoFitRef.current = false; }}
              onZoomChanged={() => { shouldAutoFitRef.current = false; }}
              options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'greedy', styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }, { featureType: 'transit', stylers: [{ visibility: 'off' }] }] }}
            >
              {selected && (
                <InfoWindowF position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => onSelect('')}>
                  <div style={{ fontFamily: 'Inter, sans-serif', width: 252, padding: '2px 0 0' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flexShrink: 0 }}>
                        {Boolean(selected.profile) ? <OrgAvatar listing={selected} size={46} /> : <IconTile tone={selected.tone} size={44} radius={11}>{selected.icon}</IconTile>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {Boolean(selected.profile) && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 999, background: 'rgba(245,166,35,0.13)', color: '#8a5a0b', fontSize: 9.5, fontWeight: 700, marginBottom: 4 }}>★ Premium</div>
                        )}
                        <div style={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.3, color: '#1A2744' }}>{selected.title}</div>
                        <div style={{ fontSize: 11, color: '#2D9CDB', marginTop: 2, fontWeight: 600 }}>{selected.categoryLabel}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'rgba(26,39,68,0.6)', marginBottom: selected.desc ? 8 : 12 }}>
                      <IPin s={11} />
                      <span>{selected.locationLabel}</span>
                      {selected.footprintBadge && (
                        <span style={{ marginLeft: 3, padding: '1px 5px', borderRadius: 999, background: selected.footprintBadge.bg, color: selected.footprintBadge.color, fontSize: 9.5, fontWeight: 700 }}>{selected.footprintBadge.label}</span>
                      )}
                    </div>
                    {selected.desc && (
                      <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.7)', lineHeight: 1.55, marginBottom: 12 }}>
                        {selected.desc.length > 110 ? `${selected.desc.slice(0, 107)}…` : selected.desc}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sky btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => onOpenResource(selected)}>View profile</button>
                      {(!selected.serviceFootprintModel || selected.serviceFootprintModel === 'physical_venue' || selected.serviceFootprintModel === 'hq_only') && selected.lat !== null && (
                        <a className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} href={getMapsDirectionsUrl(selected)} target="_blank" rel="noreferrer"><IDirections s={13} /></a>
                      )}
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: isMobile ? 420 : 640, color: 'rgba(26,39,68,0.65)', fontSize: 14 }}>Loading interactive map…</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── LoadingGrid ────────────────────────────────────────── */
const SkeletonBlock = ({ w = '100%', h = 14, mt = 0 }) => (
  <div style={{ width: w, height: h, borderRadius: 999, background: 'linear-gradient(90deg, #EEF2FA 25%, #E0E8F5 50%, #EEF2FA 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s ease infinite', marginTop: mt }} />
);

const LoadingGrid = ({ isMobile }) => (
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(90deg, #EEF2FA 25%, #E0E8F5 50%, #EEF2FA 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s ease infinite', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock w="45%" h={10} />
            <SkeletonBlock w="75%" h={16} mt={10} />
            <SkeletonBlock w="55%" h={10} mt={8} />
          </div>
        </div>
        <SkeletonBlock w="100%" h={12} mt={18} />
        <SkeletonBlock w="85%" h={12} mt={8} />
        <SkeletonBlock w="65%" h={10} mt={16} />
      </div>
    ))}
  </div>
);

const StateCard = ({ title, subtitle = 'Try another category or area filter, or check back once more listings are published.' }) => (
  <div className="card" style={{ padding: 30, textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,255,0.98))' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 18, background: 'rgba(45,156,219,0.12)', color: '#2D9CDB' }}><ISparkle s={24} /></div>
    <div style={{ marginTop: 16, fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#1A2744' }}>{title}</div>
    <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.65)', fontSize: 14 }}>{subtitle}</p>
  </div>
);

const FindHelpV2 = ({ onNavigate }) => {
  const isMobile = useIsMobile();
  const [view, setView] = React.useState('list');
  const [activeCat, setActiveCat] = React.useState('all');
  const [savedIds, setSavedIds] = React.useState(new Set());
  const [keyword, setKeyword] = React.useState('');
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [countyFilter, setCountyFilter] = React.useState('all');
  const [showMappableOnly, setShowMappableOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('relevance');
  const [pageSize, setPageSize] = React.useState(24);
  const [visibleCount, setVisibleCount] = React.useState(24);
  const [resources, setResources] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  const [shareOpenId, setShareOpenId] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('');
  const [detailSlug, setDetailSlug] = React.useState(() => getDetailSlugFromPath());
  const [newOrganisationOpen, setNewOrganisationOpen] = React.useState(false);

  React.useEffect(() => {
    const onPop = () => setDetailSlug(getDetailSlugFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (!cancelled) {
          setCategories([]);
          setResources([]);
          setError('We are having trouble loading local support right now.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [categoriesResult, resourcesResult, profilesResult, eventsResult] = await Promise.all([
          supabase
            .from('categories')
            .select('id, name, slug, active, sort_order')
            .eq('active', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true }),
          supabase
            .from('resources')
            .select('*')
            .eq('is_archived', false)
            .order('name', { ascending: true }),
          supabase
            .from('organisation_profiles')
            .select('*'),
          supabase
            .from('organisation_events')
            .select('*')
            .in('status', ['scheduled', 'completed']),
        ]);

        if (resourcesResult.error) throw resourcesResult.error;

        const categoriesData = categoriesResult.error ? [] : (categoriesResult.data || []);
        const profiles = profilesResult.error ? [] : (profilesResult.data || []);
        const events = eventsResult.error ? [] : (eventsResult.data || []);

        const knownTowns = buildKnownTownIndex(resourcesResult.data || []);

        // Build category lookup so category_id (bigint FK) resolves to a name
        const categoryById = new Map(categoriesData.map((cat) => [String(cat.id), cat]));

        const profileByResourceId = new Map(
          profiles
            .filter((profile) => profile.resource_id !== null && profile.resource_id !== undefined)
            .map((profile) => [String(profile.resource_id), profile]),
        );
        const profileBySlug = new Map(
          profiles
            .filter((profile) => profile.slug)
            .map((profile) => [`${profile.slug}`.trim().toLowerCase(), profile]),
        );
        const eventsByProfileId = new Map();
        events.forEach((eventRow) => {
          if (!eventRow.organisation_profile_id) return;
          const existing = eventsByProfileId.get(String(eventRow.organisation_profile_id)) || [];
          existing.push(eventRow);
          eventsByProfileId.set(String(eventRow.organisation_profile_id), existing);
        });

        if (cancelled) return;
        const loadedResources = (resourcesResult.data || []).map((row, index) => {
          const rowIdKey = row?.id !== null && row?.id !== undefined ? String(row.id) : '';
          const rowSlugKey = `${row?.slug || ''}`.trim().toLowerCase();
          const profile = profileByResourceId.get(rowIdKey) || profileBySlug.get(rowSlugKey) || null;
          const profileEvents = profile?.id ? (eventsByProfileId.get(String(profile.id)) || []) : [];
          // Resolve category_id → category name; inject as category_name so normalizeResource picks it up
          const resolvedCat = row.category_id ? (categoryById.get(String(row.category_id)) || null) : null;
          const injectedRow = resolvedCat
            ? { ...row, category_name: resolvedCat.name, category_slug: resolvedCat.slug, profile, events: profileEvents }
            : { ...row, profile, events: profileEvents };
          return normalizeResource(injectedRow, index, { knownTowns });
        });
        if (import.meta.env.DEV) {
          const inferredTownsCount = loadedResources.filter((resource) => resource.isTownInferred).length;
          const missingCountiesCount = loadedResources.filter((resource) => resource.isCountyMissing).length;
          const invalidCoordinatesCount = loadedResources.filter((resource) => resource.hasInvalidCoordinates).length;
          const nonMappableCount = loadedResources.filter((resource) => resource.lat === null || resource.lng === null).length;
          console.info(
            '[FindHelp][Location diagnostics]',
            {
              inferredTownsCount,
              missingCountiesCount,
              invalidCoordinatesCount,
              nonMappableCount,
              totalListings: loadedResources.length,
            },
          );
        }
        const discoveredCategoryMap = new Map();

        categoriesData.forEach((cat) => {
          const normalizedSlug = normalizeCategorySlug(cat.slug || cat.name);
          const meta = getCategoryMeta(cat.name);
          discoveredCategoryMap.set(normalizedSlug, {
            id: normalizedSlug,
            label: cat.name,
            displayLabel: getCategoryLabelFromSlug(normalizedSlug),
            tone: meta.tone,
            icon: meta.icon,
          });
        });

        loadedResources.forEach((resource) => {
          if (!discoveredCategoryMap.has(resource.cat)) {
            const meta = getCategoryMeta(resource.categoryLabel);
            discoveredCategoryMap.set(resource.cat, {
              id: resource.cat,
              label: resource.categoryLabel,
              displayLabel: getCategoryLabelFromSlug(resource.cat),
              tone: meta.tone,
              icon: meta.icon,
            });
          }
        });

        setCategories(Array.from(discoveredCategoryMap.values()).sort((a, b) => a.displayLabel.localeCompare(b.displayLabel)));
        setResources(loadedResources);
        setLoading(false);
      } catch (loadError) {
        console.error('[FindHelp] loadData error:', loadError);
        if (!cancelled) {
          setCategories([]);
          setResources([]);
          setError('We are having trouble loading local support right now.');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const townOptions = React.useMemo(() => Array.from(new Set(resources.map((resource) => resource.town).filter(Boolean))).sort(), [resources]);
  const countyOptions = React.useMemo(() => Array.from(new Set(resources.map((resource) => resource.county).filter(Boolean))).sort(), [resources]);

  React.useEffect(() => {
    if (areaFilter !== 'all' && townOptions.length > 0 && !townOptions.includes(areaFilter)) {
      setAreaFilter('all');
    }
  }, [townOptions, areaFilter]);

  React.useEffect(() => {
    if (countyFilter !== 'all' && countyOptions.length > 0 && !countyOptions.includes(countyFilter)) {
      setCountyFilter('all');
    }
  }, [countyOptions, countyFilter]);

  React.useEffect(() => {
    const nextPageSize = isMobile ? 12 : 24;
    setPageSize(nextPageSize);
    setVisibleCount(nextPageSize);
  }, [isMobile]);

  const filtered = React.useMemo(() => {
    const searchNeedle = normalizeForSearch(keyword);
    const searchWords = searchNeedle ? searchNeedle.split(/\s+/).filter(Boolean) : [];

    return resources.filter((resource) => {
      if (activeCat !== 'all' && resource.cat !== activeCat) return false;
      if (areaFilter !== 'all' && resource.town !== areaFilter) return false;
      if (countyFilter !== 'all' && resource.county !== countyFilter) return false;
      if (showMappableOnly && (resource.lat === null || resource.lng === null)) return false;
      if (searchWords.length > 0 && !searchWords.every((word) => resource.searchText.includes(word))) return false;
      return true;
    });
  }, [resources, activeCat, areaFilter, countyFilter, keyword, showMappableOnly]);

  const sortedFiltered = React.useMemo(() => {
    const searchNeedle = normalizeForSearch(keyword);
    const items = [...filtered];

    if (sortBy === 'az') {
      return items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items.sort((a, b) => {
      const scoreDiff = getSearchScore(b, searchNeedle) - getSearchScore(a, searchNeedle);
      if (scoreDiff !== 0) return scoreDiff;
      return a.title.localeCompare(b.title);
    });
  }, [filtered, keyword, sortBy]);

  React.useEffect(() => {
    setVisibleCount(pageSize);
  }, [activeCat, areaFilter, countyFilter, keyword, pageSize, showMappableOnly, sortBy, view]);

  React.useEffect(() => {
    if (selectedId && !sortedFiltered.some((resource) => resource.id === selectedId)) {
      setSelectedId('');
    }
  }, [selectedId, sortedFiltered]);

  const visibleListings = React.useMemo(() => sortedFiltered.slice(0, visibleCount), [sortedFiltered, visibleCount]);
  const hasMore = visibleCount < sortedFiltered.length;
  const mappableCount = React.useMemo(() => sortedFiltered.filter((resource) => resource.lat !== null && resource.lng !== null).length, [sortedFiltered]);

  const selectedResource = React.useMemo(() => (detailSlug ? resources.find((item) => item.slug === detailSlug) || null : null), [resources, detailSlug]);
  const featuredListings = React.useMemo(() => resources.filter((item) => item.featured).slice(0, 3), [resources]);

  const categoryOptions = React.useMemo(() => [{ id: 'all', label: 'All', displayLabel: 'All', tone: 'navy', icon: <ISparkle s={16} /> }, ...categories], [categories]);

  const featuredCategoryOptions = React.useMemo(() => {
    const baseCategories = categoryOptions.filter((category) => category.id !== 'all');
    const featured = FEATURED_CATEGORY_LABELS.map((label) => baseCategories.find((category) => category.displayLabel === label)).filter(Boolean);
    return [categoryOptions[0], ...featured].slice(0, 7);
  }, [categoryOptions]);

  const overflowCategoryOptions = React.useMemo(() => {
    const featuredIds = new Set(featuredCategoryOptions.map((category) => category.id));
    return categoryOptions.filter((category) => !featuredIds.has(category.id));
  }, [categoryOptions, featuredCategoryOptions]);

  const hiddenCategoryValue = overflowCategoryOptions.some((category) => category.id === activeCat) ? activeCat : '';

  const toggleSave = (id) => {
    setSavedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setKeyword('');
    setAreaFilter('all');
    setCountyFilter('all');
    setActiveCat('all');
    setShowMappableOnly(false);
    setSortBy('relevance');
  };

  const openResource = (listing) => {
    setDetailSlug(listing.slug);
    setShareOpenId('');
    window.history.pushState({ page: 'find-help', slug: listing.slug }, '', `/find-help/${listing.slug}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeResource = () => {
    setDetailSlug('');
    window.history.pushState({ page: 'find-help' }, '', '/find-help');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleShareAction = async (action, listing) => {
    const resourceUrl = getListingUrl(listing);
    const line = `${listing.title} | ${listing.categoryLabel} | ${listing.locationLabel}`;

    if (action === 'copy') {
      try {
        await navigator.clipboard.writeText(resourceUrl);
      } catch {
        const temp = document.createElement('textarea');
        temp.value = resourceUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setToast('Link copied to clipboard.');
      return;
    }

    if (action === 'email') {
      const subject = encodeURIComponent(`Support resource: ${listing.title}`);
      const body = encodeURIComponent(`${line}\n\n${resourceUrl}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
      setToast('Email draft opened.');
      return;
    }

    if (action === 'whatsapp') {
      const text = encodeURIComponent(`${line}\n${resourceUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
      setToast('WhatsApp share opened.');
      return;
    }

    if (action === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resourceUrl)}`, '_blank', 'noopener,noreferrer');
      setToast('Facebook share opened.');
      return;
    }

    if (action === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(line)}&url=${encodeURIComponent(resourceUrl)}`, '_blank', 'noopener,noreferrer');
      setToast('X share opened.');
      return;
    }

    if (action === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resourceUrl)}`, '_blank', 'noopener,noreferrer');
      setToast('LinkedIn share opened.');
      return;
    }

    if (action === 'open') {
      openResource(listing);
      setToast('Resource opened for review.');
    }
  };

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} />

      <section style={{ paddingTop: 40, paddingBottom: 36, background: 'linear-gradient(180deg, #E7F3FB 0%, #FAFBFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>{detailSlug ? 'Resource detail' : 'Find help near you'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? 20 : 40, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>For the people you support</div>
              <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginTop: 10, letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance' }}>Trusted local support, ready to share.</h1>
              <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 600 }}>Search, filter, open a dedicated detail page, and share polished links with clients in one flow.</p>
            </div>
          </div>
        </div>
      </section>

      {detailSlug ? (
        <ResourceDetail
          listing={selectedResource}
          onBack={closeResource}
          onShareAction={handleShareAction}
          allResources={resources}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          onOpenResource={openResource}
          onNotify={setToast}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          <section style={{ paddingTop: 22, paddingBottom: 0, background: '#FAFBFF' }}>
            <div className="container">
              <div className="card" style={{ borderRadius: 30, padding: '24px 24px 20px', background: 'linear-gradient(140deg, rgba(26,39,68,0.98) 0%, rgba(31,58,94,0.96) 38%, rgba(45,156,219,0.92) 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 28px 60px rgba(26,39,68,0.22)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
                  <div style={{ maxWidth: 660 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.74)' }}>Featured support spotlight</div>
                    <div style={{ marginTop: 8, fontFamily: 'Sora, sans-serif', fontSize: 'clamp(22px, 3.2vw, 32px)', fontWeight: 700, lineHeight: 1.22 }}>Trusted, verified and carer-friendly organisations across Cornwall</div>
                    <div style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)' }}>Discover featured local support, claim your organisation listing, and browse new services added by the community team.</div>
                  </div>
                  <div style={{ display: 'grid', gap: 8, minWidth: 180 }}>
                    <div style={{ borderRadius: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)' }}>
                      <div style={{ fontSize: 11, opacity: 0.82 }}>Verified listings</div>
                      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{resources.filter((r) => r.tags.includes('Verified')).length}</div>
                    </div>
                    <div style={{ borderRadius: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)' }}>
                      <div style={{ fontSize: 11, opacity: 0.82 }}>Featured this week</div>
                      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{featuredListings.length}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
                  {[
                    'Claim your organisation listing',
                    'New services added this month',
                    'Community support spotlight',
                    'Upcoming events and seasonal help',
                  ].map((item) => (
                    <div key={item} style={{ borderRadius: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)', fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.94)' }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={{ paddingTop: 22, paddingBottom: 0, background: '#FAFBFF' }}>
            <div className="container">
              <div className="card" style={{ padding: 22, borderRadius: 28, background: '#FFFFFF', border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.8fr) minmax(240px, 0.9fr)', gap: 14, alignItems: 'stretch' }}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <div className="eyebrow" style={{ color: '#2D9CDB' }}>Search the directory</div>
                      <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800, color: '#1A2744' }}>Find help, then choose the right acquisition path</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                      <ISearch s={18} />
                      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search support, services or keywords" style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                        <IPin s={18} />
                        <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif' }}>
                          <option value="all">All towns</option>
                          {townOptions.map((town) => <option key={town} value={town}>{town}</option>)}
                        </select>
                      </div>
                      <select value={countyFilter} onChange={(event) => setCountyFilter(event.target.value)} style={{ flex: '1 1 140px', padding: '10px 12px', borderRadius: 12, border: '1px solid #EFF1F7', background: '#FAFBFF', fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                        <option value="all">All counties</option>
                        {countyOptions.map((county) => <option key={county} value={county}>{county}</option>)}
                      </select>
                      <button className="btn btn-sky btn-sm" onClick={clearFilters}><IClose s={14} /> Clear</button>
                    </div>
                  </div>

                  <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(180deg, rgba(245,166,35,0.08), rgba(45,156,219,0.08))', border: '1px solid rgba(45,156,219,0.15)', display: 'grid', alignContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(45,156,219,0.12)', color: '#1A2744', fontSize: 12, fontWeight: 700 }}><IBuilding s={14} /> Submit a new organisation</div>
                      <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800, color: '#1A2744' }}>Know a service that is missing?</div>
                      <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.65, color: 'rgba(26,39,68,0.66)' }}>Send it to the admin team for moderation. This is separate from claiming an existing listing and does not publish anything automatically.</div>
                    </div>
                    <div>
                      <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={() => setNewOrganisationOpen(true)}>
                        <IBuilding s={16} /> Submit a new organisation
                      </button>
                      <div style={{ marginTop: 8, fontSize: 11.5, color: 'rgba(26,39,68,0.5)' }}>All submissions go to admin approval first.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {featuredListings.length ? (
            <section style={{ paddingTop: 26, paddingBottom: 0, background: '#FAFBFF' }}>
              <div className="container">
                <div className="card" style={{ padding: 22, borderRadius: 28, background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(45,156,219,0.08))', border: '1px solid rgba(245,166,35,0.18)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                    <div>
                      <div className="eyebrow" style={{ color: '#F5A623' }}>Featured listings</div>
                      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Trusted organisations we recommend highlighting right now</div>
                    </div>
                    <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.62)', maxWidth: 320 }}>Featured by the community team for quality, usefulness, and trusted local support.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    {featuredListings.map((listing) => (
                      <div key={listing.id} className="card" style={{ padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.94)' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                          <OrgAvatar listing={listing} size={58} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 999, background: 'rgba(245,166,35,0.12)', color: '#8a5a0b', fontSize: 11.5, fontWeight: 700 }}>Featured</div>
                            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, marginTop: 8, lineHeight: 1.3 }}>{listing.title}</div>
                            <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{listing.venue} · {listing.locationLabel}</div>
                          </div>
                        </div>
                        <p style={{ marginTop: 12, color: 'rgba(26,39,68,0.72)', fontSize: 13.5, lineHeight: 1.6 }}>{listing.desc}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                          <button className="btn btn-gold btn-sm" onClick={() => openResource(listing)}>View profile</button>
                          {listing.website ? <a className="btn btn-ghost btn-sm" href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} target="_blank" rel="noreferrer">Visit website</a> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}


      {newOrganisationOpen ? (
        <NewOrganisationModal
          onClose={() => setNewOrganisationOpen(false)}
          onSuccess={(organisationName) => {
            setNewOrganisationOpen(false);
            setToast(`${organisationName} submitted for admin review.`);
          }}
          onError={(message) => setToast(message)}
        />
      ) : null}
          <section style={{ paddingTop: 24, paddingBottom: 0, background: '#FAFBFF' }}>
            <div className="container">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 22, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: '1 1 520px', minWidth: 0, padding: '2px 2px 4px' }}>
                  {featuredCategoryOptions.map((category) => {
                    const active = activeCat === category.id;
                    const tone = toneMapColor(category.tone);
                    return (
                      <button key={category.id} onClick={() => setActiveCat(category.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: '0 0 auto', minHeight: 42, padding: '0 16px', borderRadius: 999, background: active ? tone.fg : 'white', color: active ? (category.tone === 'gold' || category.tone === 'lime' ? '#1A2744' : 'white') : '#1A2744', border: `1px solid ${active ? tone.fg : '#EFF1F7'}`, fontSize: 13.5, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap', boxShadow: active ? `0 4px 12px ${tone.fg}55` : 'none' }}>
                        {category.icon} {category.displayLabel || category.label}
                      </button>
                    );
                  })}
                </div>

                {overflowCategoryOptions.length > 0 && (
                  <div style={{ position: 'relative', flex: '0 0 220px', minWidth: 180 }}>
                    <select value={hiddenCategoryValue} onChange={(event) => { if (event.target.value) setActiveCat(event.target.value); }} style={{ width: '100%', minHeight: 44, appearance: 'none', borderRadius: 999, border: `1px solid ${hiddenCategoryValue ? '#1A2744' : '#EFF1F7'}`, background: hiddenCategoryValue ? '#1A2744' : 'white', color: hiddenCategoryValue ? 'white' : '#1A2744', padding: '0 42px 0 16px', fontSize: 13.5, fontWeight: 600 }}>
                      <option value="">More categories</option>
                      {overflowCategoryOptions.map((category) => <option key={category.id} value={category.id}>{category.displayLabel || category.label}</option>)}
                    </select>
                    <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: hiddenCategoryValue ? 'white' : 'rgba(26,39,68,0.6)', display: 'grid', placeItems: 'center' }}><IChevron s={12} /></div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section style={{ paddingTop: 32, paddingBottom: 80, background: '#FAFBFF' }}>
            <div className="container">
              <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}>
                    <strong style={{ color: '#1A2744' }}>{sortedFiltered.length} results</strong>
                    {view === 'list' && visibleListings.length < sortedFiltered.length && (
                      <span style={{ marginLeft: 6 }}>· showing {visibleListings.length}</span>
                    )}
                    <span style={{ marginLeft: 6 }}>· {mappableCount} mappable</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, padding: 4, background: 'white', borderRadius: 999, border: '1px solid #EFF1F7' }}>
                  {['list', 'map'].map((mode) => (
                    <button key={mode} onClick={() => setView(mode)} style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: view === mode ? '#1A2744' : 'transparent', color: view === mode ? 'white' : '#1A2744', textTransform: 'capitalize' }}>{mode}</button>
                  ))}
                </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.92)', borderRadius: 18, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 170 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ flex: 1, minHeight: 40, borderRadius: 12, border: '1px solid #E5ECF8', background: '#FAFBFF', padding: '0 12px', fontSize: 13.5, fontWeight: 600, color: '#1A2744' }}>
                      <option value="relevance">Relevance</option>
                      <option value="az">A-Z</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 170 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Page size</span>
                    <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} style={{ flex: 1, minHeight: 40, borderRadius: 12, border: '1px solid #E5ECF8', background: '#FAFBFF', padding: '0 12px', fontSize: 13.5, fontWeight: 600, color: '#1A2744' }}>
                      {(isMobile ? [12, 24, 36] : [24, 48, 72]).map((size) => <option key={size} value={size}>{size} per page</option>)}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowMappableOnly((prev) => !prev)}
                    style={{ minHeight: 40, borderRadius: 999, padding: '0 14px', border: `1px solid ${showMappableOnly ? '#2D9CDB' : '#E5ECF8'}`, background: showMappableOnly ? 'rgba(45,156,219,0.12)' : '#FAFBFF', color: '#1A2744', fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <IPin s={14} /> Mapped pins only
                  </button>
                </div>
              </div>

              {loading ? (
                <LoadingGrid isMobile={isMobile} />
              ) : error ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <StateCard title="We are having trouble loading local support right now." subtitle="Please retry. If this persists, check your Supabase environment and listings schema." />
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-sky btn-sm" onClick={() => setReloadKey((prev) => prev + 1)}>Retry loading listings</button>
                  </div>
                </div>
              ) : !filtered.length ? (
                <StateCard
                  title={
                    keyword.trim() || activeCat !== 'all' || areaFilter !== 'all' || countyFilter !== 'all' || showMappableOnly
                      ? 'No results match your current filters.'
                      : 'No support listings found yet.'
                  }
                  subtitle={
                    keyword.trim() || activeCat !== 'all' || areaFilter !== 'all' || countyFilter !== 'all' || showMappableOnly
                      ? 'Try adjusting or clearing your search filters to see more results.'
                      : 'Check back soon — more listings are being added by the community team.'
                  }
                />
              ) : view === 'list' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  {visibleListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      saved={savedIds.has(listing.id)}
                      selected={selectedId === listing.id}
                      onSelect={setSelectedId}
                      onToggleSave={() => toggleSave(listing.id)}
                      onOpenResource={openResource}
                      onShareAction={handleShareAction}
                      shareOpen={shareOpenId === listing.id}
                      setShareOpen={(value) => setShareOpenId(value)}
                    />
                  ))}
                  </div>
                  {hasMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
                      <button className="btn btn-navy" onClick={() => setVisibleCount((prev) => prev + pageSize)}>
                        Load more results <span style={{ opacity: 0.7 }}>({Math.min(pageSize, sortedFiltered.length - visibleCount)} more)</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <DirectoryMap listings={sortedFiltered} selectedId={selectedId} onSelect={setSelectedId} onOpenResource={openResource} isMobile={isMobile} />
              )}
            </div>
          </section>
        </>
      )}

      <Footer onNavigate={onNavigate} />
      <Toast toast={toast} onClose={() => setToast('')} />
    </>
  );
};

export default FindHelpV2;
