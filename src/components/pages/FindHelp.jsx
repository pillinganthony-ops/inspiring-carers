import React from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import CountyBanner from '../CountyBanner.jsx';
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
const ILinkedIn  = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const IInstagram = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
const IYouTube   = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const ITikTok    = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
const IThreads   = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068V12c.001-8.044 5.294-12 10.686-12h.007c3.35.024 5.97 1.047 7.787 3.042 1.667 1.832 2.527 4.383 2.527 7.58l-.002.12c-.037 2.65-.74 4.74-2.085 6.203-1.44 1.567-3.49 2.394-6.09 2.46-.13.003-.258.005-.384.005-.785 0-1.554-.096-2.273-.283.258-1.064.387-1.597.387-1.597s.65.106 1.27.121c.086.002.17.003.255.003 1.76-.04 3.107-.556 4.1-1.575.923-.944 1.419-2.339 1.45-4.153l.002-.09c0-2.51-.677-4.446-2.01-5.757C16.31 4.85 14.664 4.26 12.594 4.26c-4.083 0-8.083 3.196-8.083 7.74v.075c0 2.96.654 5.218 1.944 6.714 1.17 1.357 2.978 2.068 5.374 2.083h.007c.26 0 .517-.012.77-.035.68-.063 1.32-.24 1.893-.52-1.17-1.156-1.84-2.7-1.84-4.393 0-3.372 2.617-6.11 5.836-6.11.293 0 .583.021.867.063.78.117 1.495.41 2.11.847.068.048.135.097.2.148v-1.38c0-2.48-.696-4.41-2.07-5.74C17.12 2.12 15.29 1.44 12.93 1.44h-.007c-4.29.022-8.437 3.185-8.437 7.74v.07c0 2.58.62 4.73 1.845 6.384.96 1.299 2.36 2.21 4.09 2.668.23.063.46.116.695.16-.04.13-.08.264-.118.4z"/></svg>;
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
    update_type: 'event_enquiry',
    resource_id: listing.id || null,
    resource_name: listing.title || listing.venue || null,
    organisation_name: listing.profile?.organisation_name || listing.venue || listing.title || null,
    submitter_name: fullName.trim(),
    submitter_email: email.trim(),
    submitter_phone: phone.trim() || null,
    reason: moderationDescription,
    status: 'pending',
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
  'activities-things-to-do': 'Activities',
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
  'activities & things to do': 'activities-things-to-do',
  'activities and things to do': 'activities-things-to-do',
  'things to do': 'activities-things-to-do',
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


const getListingUrl = (listing) => {
    const base = county ? `/${county}/find-help` : '/find-help';
    return `${window.location.origin}${base}/${listing.slug}`;
  };

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
    pickField(row?.profile || {}, ['organisation_name', 'display_name', 'name']),
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
  const profileDisplayName = pickField(row?.profile || {}, ['organisation_name', 'display_name', 'name']);
  const profileBio = pickField(row?.profile || {}, ['short_bio', 'full_bio', 'bio']);
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
    website: pickField(row, ['website', 'url', 'link']) || pickField(row?.profile || {}, ['website_url', 'website']),
    phone: pickField(row, ['phone', 'telephone']),
    email: pickField(row, ['email']),
    address: pickField(row, ['address', 'address_line_1', 'address_line1']),
    postcode,
    lat,
    lng,
    tags: toTags(row),
    featured: Boolean(row?.featured || row?.profile?.featured),
    logoUrl: pickField(row?.profile || {}, ['logo_url']) || pickField(row?.metadata?.brand || {}, ['logo_url']),
    coverImageUrl: pickField(row?.profile || {}, ['banner_url', 'cover_image_url']),
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
    listing?.profile?.organisation_name,
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
  const [logoError, setLogoError] = React.useState(false);
  const [faviconError, setFaviconError] = React.useState(false);
  const logoUrl = isSafeImageUrl(listing.logoUrl) ? listing.logoUrl : '';
  const faviconUrl = !logoUrl || logoError ? getFaviconUrl(listing.website, 128) : null;

  if (logoUrl && !logoError) {
    return (
      <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', border: '3px solid white', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
        <img src={logoUrl} alt={listing.title} onError={() => setLogoError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  if (faviconUrl && !faviconError) {
    const iconSize = Math.round(size * 0.52);
    return (
      <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: 'white', boxShadow: '0 4px 16px rgba(26,39,68,0.10)', border: '2px solid #EEF2FA', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
        <img src={faviconUrl} alt={listing.title} onError={() => setFaviconError(true)} style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
      </div>
    );
  }

  return <DefaultBrandMark size={size} />;
};

/* ─── TrustBadges ────────────────────────────────────────── */
const TrustBadges = ({ listing }) => {
  const badges = [];
  if (listing.featured) badges.push({ key: 'featured', label: 'Featured listing', color: '#B45309', bg: 'rgba(245,166,35,0.14)' });
  if (listing.tags.includes('Verified') || listing.profile?.verified_status === 'verified') badges.push({ key: 'verified', label: 'Verified listing', color: '#10B981', bg: 'rgba(16,185,129,0.1)' });
  if (listing.profile?.claim_status === 'claimed') badges.push({ key: 'claimed', label: 'Claimed by owner', color: '#7B5CF5', bg: 'rgba(123,92,245,0.1)' });
  if (['carer-support', 'carers'].includes(listing.cat)) badges.push({ key: 'carers', label: 'Supports carers', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' });
  if (['community-groups-social-connection', 'mental-health-wellbeing', 'activities-things-to-do'].includes(listing.cat)) badges.push({ key: 'community', label: 'Community resource', color: '#7B5CF5', bg: 'rgba(123,92,245,0.1)' });
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

/* ─── Profile social links ───────────────────────────────── */
// Live schema stores individual URL columns; legacy rows may have a socials JSONB.
// Priority: flat columns first, JSONB fallback only when no flat links found.
const PROFILE_SOCIAL_FLAT = [
  { col: 'facebook_url',  label: 'Facebook',  color: '#1877F2', Icon: IFacebook  },
  { col: 'instagram_url', label: 'Instagram', color: '#E1306C', Icon: IInstagram },
  { col: 'linkedin_url',  label: 'LinkedIn',  color: '#0A66C2', Icon: ILinkedIn  },
  { col: 'youtube_url',   label: 'YouTube',   color: '#FF0000', Icon: IYouTube   },
  { col: 'tiktok_url',    label: 'TikTok',    color: '#000000', Icon: ITikTok    },
  { col: 'x_url',         label: 'X',         color: '#000000', Icon: ITwitterX  },
  { col: 'threads_url',   label: 'Threads',   color: '#000000', Icon: IThreads   },
  { col: 'whatsapp_url',  label: 'WhatsApp',  color: '#25D366', Icon: IWhatsApp  },
];
const JSONB_SOCIAL_META = {
  facebook:  { label: 'Facebook',  color: '#1877F2' },
  instagram: { label: 'Instagram', color: '#E1306C' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0' },
  x:         { label: 'X',         color: '#000000' },
  youtube:   { label: 'YouTube',   color: '#FF0000' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2' },
  whatsapp:  { label: 'WhatsApp',  color: '#25D366' },
  threads:   { label: 'Threads',   color: '#000000' },
  snapchat:  { label: 'Snapchat',  color: '#FFFC00' },
};
const ensureSocialHttps = (v) => {
  const s = `${v || ''}`.trim();
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};
const getProfileSocialLinks = (profile) => {
  if (!profile) return [];
  const links = [];
  // 1. Flat columns (live schema)
  for (const { col, label, color, Icon } of PROFILE_SOCIAL_FLAT) {
    const url = ensureSocialHttps(profile[col]);
    if (url) links.push({ key: col, label, color, Icon, url });
  }
  // 2. JSONB fallback for legacy rows that pre-date the schema migration
  if (!links.length && profile.socials && typeof profile.socials === 'object' && !Array.isArray(profile.socials)) {
    for (const [key, raw] of Object.entries(profile.socials)) {
      const url = ensureSocialHttps(raw);
      if (!url) continue;
      const flat = PROFILE_SOCIAL_FLAT.find((f) => f.col === `${key}_url`);
      const meta = JSONB_SOCIAL_META[key] || { label: key, color: '#1A2744' };
      links.push({ key, label: meta.label, color: meta.color, Icon: flat?.Icon || null, url });
    }
  }
  return links;
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

const ClaimModal = ({ listing, onClose, onSuccess, onError, session }) => {
  const [form, setForm] = React.useState({
    fullName: '',
    orgName: deriveClaimOrgName(listing),
    jobTitle: '',
    email: '',
    phone: '',
    relationship: '',
    reason: '',
    supportingLink: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const normalizeUrlInput = (value) => {
    const v = `${value || ''}`.trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    if (/^www\./i.test(v)) return `https://${v}`;
    return v;
  };

  const isValidHttpUrl = (value) => {
    const v = `${value || ''}`.trim();
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const buildAdminReason = (fields) => {
    const {
      message,
      relationship,
      jobTitle,
      supportingUrl,
    } = fields;

    const contextLines = [
      `Directory listing: ${listing?.title || 'Unknown listing'}`,
      listing?.slug ? `Public slug: ${listing.slug}` : null,
      listing?.id ? `Resource ID: ${listing.id}` : null,
      listing?.categoryLabel ? `Category: ${listing.categoryLabel}` : null,
      listing?.locationLabel ? `Location: ${listing.locationLabel}` : null,
      listing?.profile?.id ? `Organisation profile ID: ${listing.profile.id}` : null,
      listing?.profile?.display_name ? `Profile display name: ${listing.profile.display_name}` : null,
      listing?.profile?.claim_status ? `Current claim status: ${listing.profile.claim_status}` : null,
    ].filter(Boolean);

    const requestLines = [
      `Claimant relationship: ${relationship}`,
      `Job title: ${jobTitle}`,
      supportingUrl ? `Supporting link: ${supportingUrl}` : null,
    ].filter(Boolean);

    return [
      '--- Claim request (auto-formatted) ---',
      'Listing context:',
      ...contextLines.map((line) => `- ${line}`),
      '',
      'Request details:',
      ...requestLines.map((line) => `- ${line}`),
      '',
      'Supporting message from claimant:',
      message,
    ].join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const email = form.email.trim();
    if (!form.fullName.trim() || !email || !form.jobTitle.trim() || !form.relationship.trim() || !form.reason.trim() || !form.orgName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const supportingUrl = normalizeUrlInput(form.supportingLink);
    if (supportingUrl && !isValidHttpUrl(supportingUrl)) {
      setError('Please enter a valid supporting link (https://…). You can also leave it blank.');
      return;
    }
    const phone = form.phone.replace(/[^\d+()\s-]/g, '').trim();
    if (form.phone.trim() && phone.length < 6) {
      setError('Please enter a valid phone number, or leave phone blank.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (!supabase) throw new Error('Database not available.');
      const jobTitle = form.jobTitle.trim();
      const relationship = form.relationship.trim();
      const message = form.reason.trim();
      const reason = buildAdminReason({
        message,
        relationship,
        jobTitle,
        supportingUrl,
      });
      const claimPayload = {
        listing_id: listing.id,
        listing_slug: listing.slug,
        listing_title: listing.title,
        full_name: form.fullName.trim(),
        org_name: form.orgName.trim(),
        role: jobTitle,
        email,
        phone: form.phone.trim() || null,
        relationship,
        reason,
        status: 'pending',
        // Capture auth user id so claim approval can set created_by on the profile
        submitted_by_user_id: session?.user?.id || null,
      };

      let { error: dbError } = await supabase.from('listing_claims').insert(claimPayload);
      if (dbError) {
        // listing_claims unavailable (RLS or missing) — fall back to the moderation queue
        const fallback = {
          organisation_name: `[CLAIM] ${claimPayload.listing_title}`,
          submitter_name: claimPayload.full_name,
          submitter_email: claimPayload.email,
          submitter_phone: claimPayload.phone || null,
          relationship_to_organisation: claimPayload.relationship,
          reason: claimPayload.reason,
          status: 'pending',
          update_type: 'claim_request',
          // resource_id is required so applyApprovedClaimOwnership can link
          // the approved profile back to the correct resources row.
          resource_id: claimPayload.listing_id || null,
          resource_name: claimPayload.listing_title || null,
        };
        const { error: fallbackError } = await supabase.from('resource_update_submissions').insert(fallback);
        if (fallbackError) throw dbError; // surface original error if both fail
        dbError = null; // fallback succeeded
      }
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
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.50)', display: 'grid', placeItems: 'center', padding: 20 }}
      onClick={(e) => { if (!busy && e.target === e.currentTarget) onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 28, padding: '32px 30px', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.25)', position: 'relative' }}
      >
        <button onClick={onClose} type="button" disabled={busy} style={{ position: 'absolute', right: 20, top: 20, width: 36, height: 36, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>
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
        {listing?.locationLabel && (
          <div style={{ marginTop: 6, fontSize: 12.5, color: 'rgba(26,39,68,0.6)', lineHeight: 1.5 }}>
            <IPin s={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {listing.locationLabel}
          </div>
        )}

        <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.66)', lineHeight: 1.65, marginBottom: 12 }}>
          This form helps us verify you represent the right organisation. Your submission is reviewed by the community team, and the public directory listing does not change until a claim is approved.
        </p>
        <div style={{ display: 'grid', gap: 8, marginBottom: 18, padding: '10px 12px', borderRadius: 12, background: 'rgba(26,39,68,0.04)', border: '1px solid #E8EEF8' }}>
          {[
            'We may email you to confirm details before approval.',
            'You can start onboarding in your dashboard, but access stays pending until approved.',
            'For fastest review, add a link that helps verify your relationship (optional).',
          ].map((line) => (
            <div key={line} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.55 }}>
              <ICheck s={14} style={{ color: '#10B981', marginTop: 2, flexShrink: 0 }} />
              <span>{line}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Full name *</label>
            <input value={form.fullName} onChange={set('fullName')} required placeholder="Your full name" style={fieldSt} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Organisation or listing name being claimed *</label>
            <input value={form.orgName} onChange={set('orgName')} required placeholder="Organisation name" style={fieldSt} />
            <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(26,39,68,0.58)' }}>This should match the organisation behind this listing.</div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Your role / job title *</label>
            <input value={form.jobTitle} onChange={set('jobTitle')} required placeholder="e.g. Operations Director, Practice Manager" style={fieldSt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" style={fieldSt} autoComplete="email" inputMode="email" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Optional" style={fieldSt} autoComplete="tel" inputMode="tel" />
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
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Supporting message *</label>
            <textarea value={form.reason} onChange={set('reason')} required rows={4} placeholder="What should the admin team know to verify your claim? Include anything helpful (e.g. official email domain, your responsibilities, and how to reach you on organiser channels)." style={{ ...fieldSt, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Optional supporting link</label>
            <input
              value={form.supportingLink}
              onChange={set('supportingLink')}
              placeholder="https:// (company site, registered charity page, LinkedIn, etc.)"
              style={fieldSt}
            />
            <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(26,39,68,0.58)' }}>
              Not required, but it speeds up verification when it clearly ties you to the organisation.
            </div>
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,97,58,0.1)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={busy} className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
              {busy ? 'Submitting…' : 'Submit claim request'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
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
        update_type: 'new_organisation',
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

/* ─── ListingContactModal ────────────────────────────────── */
const ListingContactModal = ({ listing, type, onClose, onSuccess }) => {
  const isCallback = type === 'callback';
  const fld = { width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '11px 14px', fontSize: 14, color: '#1A2744', background: '#FAFBFF', boxSizing: 'border-box', fontFamily: 'inherit' };
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const orgName = listing.profile?.organisation_name || listing.title || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Please enter your name and email.'); return; }
    if (isCallback && !form.phone.trim()) { setError('Please enter a phone number for the callback.'); return; }
    if (!isSupabaseConfigured() || !supabase) { setError('Database unavailable. Please try again later.'); return; }
    setBusy(true);
    setError('');
    try {
      const { error: dbErr } = await supabase.from('resource_update_submissions').insert({
        organisation_name: orgName,
        submitter_name: form.name.trim(),
        submitter_email: form.email.trim(),
        submitter_phone: form.phone.trim() || null,
        reason: form.message.trim() || (isCallback ? 'Callback request.' : 'Message via listing page.'),
        status: 'pending',
        update_type: isCallback ? 'callback_request' : 'organisation_message',
        resource_id: listing.id || null,
        resource_name: listing.title || null,
      });
      if (dbErr) throw dbErr;
      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 310, background: 'rgba(15,23,42,0.52)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '28px 26px', width: '100%', maxWidth: 440, boxShadow: '0 40px 80px rgba(15,23,42,0.22)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 34, height: 34, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2D9CDB', marginBottom: 6 }}>
          {isCallback ? 'Request callback' : 'Send message'}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2744', marginBottom: 6 }}>
          {isCallback ? 'Request a callback' : 'Message this organisation'}
        </h3>
        <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.6)', lineHeight: 1.55, marginBottom: 18 }}>
          {isCallback
            ? `Leave your number and ${orgName || 'the team'} will call you back.`
            : `Your message will reach the community team and ${orgName || 'this organisation'}.`}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input value={form.name} onChange={set('name')} required placeholder="Your name *" style={fld} />
          <input value={form.email} onChange={set('email')} type="email" required placeholder="Email address *" style={fld} />
          {isCallback && <input value={form.phone} onChange={set('phone')} type="tel" required placeholder="Phone number *" style={fld} />}
          <textarea value={form.message} onChange={set('message')} rows={3} placeholder={isCallback ? 'Best time to call (optional)' : 'Your message (optional)'} style={{ ...fld, resize: 'vertical' }} />
          {error && <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '12px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#1A2744,#2D3E6B)', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.75 : 1 }}>
              {busy ? 'Sending…' : (isCallback ? 'Request callback' : 'Send message')}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: 12, background: '#F5F7FB', color: '#1A2744', fontSize: 14, fontWeight: 600, border: '1px solid #E9EEF5', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── ResourceDetail ─────────────────────────────────────── */
const ResourceDetail = ({ listing, onBack, onShareAction, allResources, savedIds, onToggleSave, onOpenResource, onNotify, onNavigate, session }) => {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [mobileShareOpen, setMobileShareOpen] = React.useState(false);
  const [claimOpen, setClaimOpen] = React.useState(false);
  const [contactModal, setContactModal] = React.useState(null); // null | 'message' | 'callback'
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
  const profileBio = listing.profile?.short_bio || listing.profile?.full_bio || listing.profile?.bio || listing.desc;
  const organisationDisplayName = [
    listing.profile?.organisation_name,
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

  const hasCoverImage = isSafeImageUrl(listing.coverImageUrl);

  return (
    <section style={{ paddingBottom: isMobile ? 100 : 80, background: '#FAFBFF' }}>
      {/* Hero banner */}
      <div style={{ borderBottom: `1px solid ${heroBg}22`, paddingTop: 20, paddingBottom: 36, position: 'relative', overflow: 'hidden' }}>
        {/* Cover image layer */}
        {hasCoverImage && (
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, backgroundImage: `url(${listing.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center 35%', opacity: 0.14, zIndex: 0 }}
          />
        )}
        {/* Gradient overlay */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${heroBg}18 0%, ${heroBg}28 40%, ${heroBg}08 100%)`, zIndex: 1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: '#1A2744', background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 999, padding: '7px 14px', backdropFilter: 'blur(8px)', marginBottom: 28 }}>
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

              {/* Social media links — reads flat _url columns (live schema) with JSONB fallback */}
              {(() => {
                const links = getProfileSocialLinks(listing.profile);
                if (!links.length) return null;
                return (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #EFF1F7' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.42)', marginBottom: 10 }}>Connect</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {links.map(({ key, label, color, Icon: SocialIcon, url }) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          title={`${label} page`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 13px',
                            borderRadius: 10,
                            background: `${color}10`,
                            color,
                            fontSize: 12.5,
                            fontWeight: 700,
                            border: `1.5px solid ${color}20`,
                            textDecoration: 'none',
                            transition: 'background 0.15s, border-color 0.15s, transform 0.12s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          {SocialIcon && <SocialIcon s={16} />}
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

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

            {/* Contact actions — prominent, above claim */}
            <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A2744 100%)', borderRadius: 22, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>Get in touch</div>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55, marginBottom: 14 }}>
                Send a direct message or request a callback from this organisation.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                <button onClick={() => setContactModal('message')} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg,#F5A623,#D4AF37)', color: '#0F172A', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(245,166,35,0.3)' }}>
                  <IMail s={16} /> Message this organisation
                </button>
                <button onClick={() => setContactModal('callback')} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: 14, border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <IPhone s={16} /> Request callback
                </button>
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
            ) : listing.profile?.claim_status === 'claimed' && !claimSuccess ? (
              <div style={{ background: 'rgba(123,92,245,0.06)', borderRadius: 22, padding: 18, border: '1px solid rgba(123,92,245,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(123,92,245,0.12)', color: '#7B5CF5', display: 'grid', placeItems: 'center' }}>
                    <IBuilding s={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1A2744' }}>This listing is managed by its owner</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', marginTop: 1 }}>The organisation has already claimed and verified this listing.</div>
                  </div>
                </div>
                {listing.website ? (
                  <a href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                    Visit their website
                  </a>
                ) : null}
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
                <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(26,39,68,0.66)' }}>
                  Claims are reviewed for ownership. Nothing on the public listing changes until an admin approves your request.
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
                <button
                  onClick={() => setClaimOpen(true)}
                  className="btn btn-gold btn-sm"
                  style={{ width: '100%', marginTop: 14, justifyContent: 'center', gap: 8, boxShadow: '0 10px 24px rgba(245,166,35,0.25)' }}
                >
                  <IFlag s={14} /> Start a verified claim
                </button>
                <div style={{ marginTop: 10, fontSize: 11.5, color: 'rgba(26,39,68,0.48)' }}>This opens a short secure form. Featured listings, enquiry tracking and paid upgrades can be added after approval.</div>
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

      {/* Contact / callback modal */}
      {contactModal && (
        <ListingContactModal
          listing={listing}
          type={contactModal}
          onClose={() => setContactModal(null)}
          onSuccess={() => {
            setContactModal(null);
            onNotify?.(contactModal === 'callback'
              ? 'Callback request sent — the team will follow up shortly.'
              : 'Message sent — the team will pass it on to the organisation.');
          }}
        />
      )}

      {/* Claim modal */}
      {SUPPORTS_CLAIMS && claimOpen && (
        <ClaimModal
          key={listing?.id || 'claim'}
          listing={listing}
          session={session}
          onClose={() => setClaimOpen(false)}
          onSuccess={(payload) => {
            setClaimOpen(false);
            setClaimSuccess(payload || { listingName: listing?.title || 'this listing' });
            const listingName = payload?.listingName || listing?.title || 'this listing';
            const organisationName = payload?.organisationName || listingName;
            onNotify?.(`Claim request received for “${listingName}” · ${organisationName}. We will email you if we need more detail.`);
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
  const isVerified = Boolean(
    listing.tags?.includes('Verified') ||
    listing.profile?.verified_status === 'verified',
  );
  const isClaimed = Boolean(
    listing.profile &&
    ['claimed', 'pending'].includes(`${listing.profile?.claim_status || ''}`.toLowerCase()),
  );
  const isPremium = Boolean(
    listing.profile &&
    (
      listing.profile?.featured ||
      ['trial', 'active'].includes(`${listing.profile?.entitlement_status || ''}`.toLowerCase())
    ),
  );
  const hasEvents = Boolean(Array.isArray(listing.events) && listing.events.length);
  const isWideArea = ['county_wide', 'multi_location'].includes(`${listing.serviceFootprintModel || ''}`.toLowerCase());
  const summaryText = `${listing.desc || ''}`.trim();
  const locationMeta = [listing.town, listing.county].filter(Boolean).join(' · ') || listing.locationLabel;
  const websiteUrl = listing.website
    ? (listing.website.startsWith('http') ? listing.website : `https://${listing.website}`)
    : '';

  const cardBorder = selected
    ? `1.5px solid ${color}`
    : isPremium || listing.featured
    ? '1.5px solid rgba(245,166,35,0.30)'
    : '1px solid #E9EEF8';
  const cardShadow = selected
    ? `0 16px 36px ${color}24`
    : isPremium || listing.featured
    ? '0 10px 26px rgba(245,166,35,0.12)'
    : '0 10px 26px rgba(26,39,68,0.07)';
  const cardBg = isPremium || listing.featured
    ? 'linear-gradient(180deg, rgba(245,166,35,0.04) 0%, #ffffff 60%)'
    : 'white';

  return (
    <div
      className="card"
      onClick={() => { onSelect(listing.id); onOpenResource(listing); }}
      onMouseEnter={(event) => {
        if (selected) return;
        event.currentTarget.style.transform = 'translateY(-2px)';
        event.currentTarget.style.boxShadow = isPremium || listing.featured ? '0 18px 38px rgba(245,166,35,0.18)' : '0 16px 34px rgba(26,39,68,0.11)';
      }}
      onMouseLeave={(event) => {
        if (selected) return;
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.boxShadow = cardShadow;
      }}
      style={{ position: 'relative', padding: 20, display: 'flex', flexDirection: 'column', gap: 0, background: cardBg, border: cardBorder, boxShadow: cardShadow, cursor: 'pointer', transition: 'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease' }}
    >
      {listing.featured && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #F5A623 0%, #D4A820 55%, transparent 100%)', borderRadius: '16px 16px 0 0', pointerEvents: 'none' }} />
      )}
      {/* Card header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
        <div style={{ flexShrink: 0, padding: 3, borderRadius: 16, background: 'linear-gradient(180deg, #FFFFFF, #F5F9FF)', border: '1px solid #EAF0FB' }}>
          <OrgAvatar listing={listing} size={58} />
        </div>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {isVerified && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#0f766e', fontSize: 10.5, fontWeight: 700 }}>Verified</span>}
            {isClaimed && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(45,156,219,0.14)', color: '#1c78b5', fontSize: 10.5, fontWeight: 700 }}>Claimed profile</span>}
            {listing.featured ? <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(245,166,35,0.18)', color: '#7A4B00', fontSize: 10.5, fontWeight: 800 }}>★ Featured</span> : isPremium ? <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', color: '#8a5a0b', fontSize: 10.5, fontWeight: 700 }}>Premium</span> : null}
            {hasEvents && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(123,92,245,0.13)', color: '#5f3dc4', fontSize: 10.5, fontWeight: 700 }}>Events available</span>}
          </div>
          <div
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 19, marginTop: 8, letterSpacing: '-0.015em', color: '#1A2744', textAlign: 'left', lineHeight: 1.22, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {listing.title}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.62)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <IBuilding s={12} />
            <span>{listing.venue}</span>
          </div>
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12, color: 'rgba(26,39,68,0.62)' }}>
            <IPin s={12} />
            <span style={{ fontWeight: 600, color: 'rgba(26,39,68,0.72)' }}>{locationMeta}</span>
            {isWideArea && <span style={{ padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: '#2D9CDB', background: 'rgba(45,156,219,0.12)' }}>Serving wider area</span>}
            {listing.footprintBadge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: listing.footprintBadge.color, background: listing.footprintBadge.bg }}>{listing.footprintBadge.label}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.62, marginTop: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {summaryText}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {listing.tags.slice(0, 2).map((tag) => <span key={tag} className="chip" style={{ padding: '3px 9px', fontSize: 11 }}>{tag}</span>)}
        {listing.website && (
          <a href={websiteUrl} target="_blank" rel="noreferrer"
            className="chip chip-sky" onClick={(e) => e.stopPropagation()} style={{ padding: '3px 9px', fontSize: 11 }}>
            <IGlobe s={11} /> Website
          </a>
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 14, borderTop: '1px solid #EDF2FA', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, flex: '1 1 auto' }}>
          <span style={{ fontWeight: 700, color: '#1A2744' }}>{listing.when}</span>
          <span style={{ color: 'rgba(26,39,68,0.45)', marginLeft: 5 }}>· {listing.distance}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {listing.phone ? (
            <a className="btn btn-ghost btn-sm" href={`tel:${listing.phone}`} onClick={(e) => e.stopPropagation()} style={{ gap: 6 }}>
              <IPhone s={13} />
            </a>
          ) : null}
          {websiteUrl ? (
            <a className="btn btn-ghost btn-sm" href={websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ gap: 6 }}>
              <IGlobe s={13} />
            </a>
          ) : null}
          {listing.lat !== null && listing.lng !== null ? (
            <a className="btn btn-ghost btn-sm" href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ gap: 6 }}>
              <IDirections s={13} />
            </a>
          ) : null}
          <span className="btn btn-ghost btn-sm" style={{ gap: 6, pointerEvents: 'none' }}>
            View <IArrow s={14} />
          </span>
          <button className="btn btn-sky btn-sm" onClick={(e) => { e.stopPropagation(); setShareOpen(shareOpen ? '' : listing.id); }} style={{ gap: 6, boxShadow: '0 6px 16px rgba(45,156,219,0.25)' }}>
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
  // mapReady is React state (not just a ref) so the marker effect re-runs
  // when onLoad fires — a ref change alone never re-triggers effects.
  const [mapReady, setMapReady] = React.useState(false);

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
  // mapReady is React state so this effect re-fires when onLoad completes,
  // guaranteeing markers are created even when isLoaded was already true
  // before DirectoryMap mounted (e.g. switching from list to map view).
  React.useEffect(() => {
    if (!isLoaded || !mapReady || !mapRef.current || !window.google?.maps) return undefined;
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
  }, [fitToPoints, isLoaded, mapReady, onSelect, points]);

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
              onLoad={(map) => {
                mapRef.current = map;
                // Settle layout first so map has correct container dimensions
                // before the fit-bounds effect runs.
                setTimeout(() => {
                  if (window.google?.maps?.event) window.google.maps.event.trigger(map, 'resize');
                  setMapReady(true);
                }, 100);
              }}
              onUnmount={() => { mapRef.current = null; setMapReady(false); }}
              onDragStart={() => { shouldAutoFitRef.current = false; }}
              onZoomChanged={() => { shouldAutoFitRef.current = false; }}
              options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'greedy', styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }, { featureType: 'transit', stylers: [{ visibility: 'off' }] }] }}
            >
              {selected && (() => {
                const popAccent = toneMapColor(selected.tone).fg;
                const popDomain = getDomain(selected.website);
                const popFeatured = Boolean(selected.profile?.featured);
                const popClaimed = Boolean(selected.profile && ['claimed','pending'].includes(`${selected.profile?.claim_status||''}`.toLowerCase()));
                const popDesc = selected.desc || '';
                const popShowDirections = (!selected.serviceFootprintModel || selected.serviceFootprintModel === 'physical_venue' || selected.serviceFootprintModel === 'hq_only') && selected.lat !== null;
                return (
                  <InfoWindowF position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => onSelect('')} options={{ maxWidth: 360, disableAutoPan: false }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', width: 320, paddingRight: 20, paddingTop: 2 }}>

                      {/* Accent stripe — full bleed to the close button edge */}
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${popAccent} 0%, ${popAccent}66 100%)`, borderRadius: 2, marginBottom: 11, marginRight: -20 }} />

                      {/* Badge row: small avatar inline + solid-colour category pill + trust chip */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
                        <div style={{ flexShrink: 0, lineHeight: 0 }}>
                          {Boolean(selected.profile)
                            ? <OrgAvatar listing={selected} size={30} />
                            : <IconTile tone={selected.tone} size={28} radius={7}>{selected.icon}</IconTile>}
                        </div>
                        <span style={{ padding: '3px 10px', borderRadius: 999, background: popAccent, color: '#fff', fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>{selected.categoryLabel}</span>
                        {popFeatured && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(245,166,35,0.15)', color: '#7a4d08', fontSize: 10.5, fontWeight: 800 }}>★ Featured</span>}
                        {popClaimed && !popFeatured && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(123,92,245,0.1)', color: '#5B35C5', fontSize: 10.5, fontWeight: 700 }}>✓ Claimed</span>}
                      </div>

                      {/* Title — full width, 2-line clamp */}
                      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 15, color: '#1A2744', lineHeight: 1.22, marginBottom: 7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {selected.title}
                      </div>

                      {/* Location */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(26,39,68,0.56)', marginBottom: popDomain ? 3 : 10 }}>
                        <IPin s={11} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.locationLabel}</span>
                        {selected.footprintBadge && (
                          <span style={{ flexShrink: 0, padding: '1px 6px', borderRadius: 999, background: selected.footprintBadge.bg, color: selected.footprintBadge.color, fontSize: 9.5, fontWeight: 700 }}>{selected.footprintBadge.label}</span>
                        )}
                      </div>

                      {/* Domain */}
                      {popDomain && (
                        <div style={{ fontSize: 11.5, color: '#2D9CDB', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}>
                          {popDomain}
                        </div>
                      )}

                      {/* Description — 2-line clamp, only when meaningful */}
                      {popDesc && (
                        <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.65)', lineHeight: 1.6, paddingTop: 9, borderTop: '1px solid #EEF2FA', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {popDesc}
                        </div>
                      )}

                      {/* Primary CTA — dark navy, full width, hover */}
                      <button
                        onClick={() => onOpenResource(selected)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#1A2744,#2D3E6B)', color: '#fff', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 16px rgba(26,39,68,0.22)', marginBottom: popShowDirections ? 7 : 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#263659,#1A2744)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1A2744,#2D3E6B)'; }}
                      >
                        View full profile <IArrow s={13} />
                      </button>

                      {/* Directions secondary — labelled text, not icon-only */}
                      {popShowDirections && (
                        <a
                          href={getMapsDirectionsUrl(selected)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: '1.5px solid #E0E8F5', background: '#FAFBFF', color: 'rgba(26,39,68,0.62)', fontWeight: 700, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', boxSizing: 'border-box' }}
                        >
                          <IDirections s={13} /> Get directions
                        </a>
                      )}

                    </div>
                  </InfoWindowF>
                );
              })()}
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

/* ─── County Entrance ─────────────────────────────────────── */
const COMING_SOON_COUNTIES = [
  'Bedfordshire','Berkshire','Bristol','Buckinghamshire','Cambridgeshire',
  'Cheshire','City of London','County Durham','Cumbria','Derbyshire',
  'Devon','Dorset','East Riding of Yorkshire','East Sussex','Essex',
  'Gloucestershire','Greater London','Greater Manchester','Hampshire',
  'Herefordshire','Hertfordshire','Isle of Wight','Kent','Lancashire',
  'Leicestershire','Lincolnshire','Merseyside','Norfolk','North Yorkshire',
  'Northamptonshire','Northumberland','Nottinghamshire','Oxfordshire',
  'Rutland','Shropshire','Somerset','South Yorkshire','Staffordshire',
  'Suffolk','Surrey','Tyne and Wear','Warwickshire','West Midlands',
  'West Sussex','West Yorkshire','Wiltshire','Worcestershire',
];

const CountyEntrance = ({ onSelectCounty, onNavigate, session }) => {
  const isMobile = useIsMobile();
  const [countySearch, setCountySearch] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  const COMPACT_LIMIT = 16;
  const filtered = countySearch.trim()
    ? COMING_SOON_COUNTIES.filter(c => c.toLowerCase().includes(countySearch.toLowerCase()))
    : COMING_SOON_COUNTIES;
  const visible = showAll || countySearch.trim() ? filtered : filtered.slice(0, COMPACT_LIMIT);
  const hasMore = !countySearch.trim() && !showAll && filtered.length > COMPACT_LIMIT;

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} session={session} />

      {/* Hero */}
      <section style={{ paddingTop: 56, paddingBottom: 52, background: 'linear-gradient(180deg, #E7F3FB 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 20 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>Find help near you</span>
          </div>
          <div className="eyebrow" style={{ color: '#2D9CDB', marginBottom: 10 }}>Local support directory</div>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance', marginBottom: 14 }}>
            Find trusted local support<br />near you.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 560 }}>
            Select your county to browse verified organisations, groups, and services for carers and the people they support.
          </p>
        </div>
      </section>

      {/* Cornwall live hero card */}
      <section style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A2744', marginBottom: 6 }}>Choose your county</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.55)', marginBottom: 24 }}>Cornwall is live now. Other counties are being prepared — register your interest below.</p>

          <button
            onClick={() => onSelectCounty('cornwall')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 22,
              padding: isMobile ? '20px 20px' : '26px 32px',
              borderRadius: 22, border: '2px solid rgba(45,156,219,0.3)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(224,241,251,0.55) 100%)',
              cursor: 'pointer', textAlign: 'left', marginBottom: 32,
              boxShadow: '0 4px 24px rgba(45,156,219,0.12)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(45,156,219,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(45,156,219,0.12)'; }}
          >
            <div style={{ width: 58, height: 58, borderRadius: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2D9CDB 0%, #1A7FC0 100%)', color: '#fff', boxShadow: '0 6px 18px rgba(45,156,219,0.38)', fontSize: 26 }}>
              🌊
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: isMobile ? 20 : 24, color: '#1A2744' }}>Cornwall</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(91,201,74,0.13)', color: '#1E6B10', borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5BC94A', display: 'inline-block', boxShadow: '0 0 0 2px rgba(91,201,74,0.3)' }} />
                  LIVE NOW
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(26,39,68,0.65)', lineHeight: 1.5 }}>Browse verified local organisations, community groups, and specialist services across Cornwall.</p>
            </div>
            <div style={{ color: '#2D9CDB', flexShrink: 0 }}><IArrow s={22} /></div>
          </button>
        </div>
      </section>

      {/* Coming soon counties */}
      <section style={{ paddingBottom: 64 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2744' }}>Coming soon across England</div>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ISearch style={{ position: 'absolute', left: 10, pointerEvents: 'none', color: 'rgba(26,39,68,0.4)' }} s={13} />
              <input
                type="text"
                placeholder="Search counties…"
                value={countySearch}
                onChange={e => { setCountySearch(e.target.value); setShowAll(true); }}
                style={{ paddingLeft: 30, paddingRight: 12, height: 34, borderRadius: 10, border: '1.5px solid #E0E8F5', fontSize: 13, color: '#1A2744', background: '#FAFBFF', outline: 'none', width: isMobile ? 150 : 190 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
            {visible.map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, border: '1.5px solid #EEF1F8', background: 'rgba(248,250,254,0.9)', opacity: 0.72 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', fontWeight: 500, lineHeight: 1.3 }}>{name}</span>
              </div>
            ))}
            {visible.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px 0', color: 'rgba(26,39,68,0.45)', fontSize: 13 }}>No counties matched "{countySearch}".</div>
            )}
          </div>

          {hasMore && (
            <button onClick={() => setShowAll(true)} style={{ marginTop: 14, fontSize: 13, color: '#2D9CDB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              + Show all {filtered.length - COMPACT_LIMIT} more counties
            </button>
          )}

          {/* Interest CTA */}
          <div style={{ marginTop: 40, padding: isMobile ? '22px 20px' : '28px 32px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(26,39,68,0.04) 0%, rgba(45,156,219,0.06) 100%)', border: '1.5px solid rgba(45,156,219,0.15)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A2744', marginBottom: 5 }}>Want your county added sooner?</div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(26,39,68,0.6)', lineHeight: 1.55 }}>We're expanding to new counties soon. Register your interest and we'll let you know when your area goes live.</p>
            </div>
            <a
              href="mailto:hello@inspiringcarers.co.uk?subject=County%20interest%20registration&body=Please%20add%20me%20to%20the%20waiting%20list%20for%20my%20county."
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #2D9CDB 0%, #1A7FC0 100%)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,156,219,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Register interest <IArrow s={15} />
            </a>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

const FindHelpV2 = ({ onNavigate, session, county, venueSlug }) => {
  // detailSlug is now driven entirely by the router via venueSlug prop.
  // No internal pushState, no popstate listener — history is owned by main.jsx.

  // SEO — update title/meta/canonical whenever county changes, restore on unmount
  React.useEffect(() => {
    const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : '';
    const label = cap(county || '');
    const prevTitle = document.title;
    document.title = county
      ? `Trusted Local Support in ${label} | Inspiring Carers`
      : 'Find Help Near You | Inspiring Carers';

    let metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    if (createdDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    const prevDesc = metaDesc.content;
    metaDesc.content = county
      ? `Verified carer-friendly organisations and community services across ${label}.`
      : 'Find trusted local carer support near you.';

    let canonical = document.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (createdCanonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    const prevCanonical = canonical.href;
    canonical.href = county
      ? `${window.location.origin}/${county}/find-help`
      : `${window.location.origin}/find-help`;

    return () => {
      document.title = prevTitle;
      if (createdDesc) metaDesc.remove(); else metaDesc.content = prevDesc;
      if (createdCanonical) canonical.remove(); else canonical.href = prevCanonical;
    };
  }, [county]);

  const isMobile = useIsMobile();
  const [selectedCounty, setSelectedCounty] = React.useState(county || 'cornwall');
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
  const detailSlug = venueSlug || '';
  const [newOrganisationOpen, setNewOrganisationOpen] = React.useState(false);


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
          (() => {
            // For explicit non-Cornwall county routes, filter server-side.
            // /find-help and /cornwall/find-help load all data (Cornwall is the default dataset).
            const rq = supabase.from('resources').select('*').eq('is_archived', false);
            const isExplicitForeignCounty = county && county !== 'cornwall';
            return isExplicitForeignCounty
              ? rq.eq('county', county.charAt(0).toUpperCase() + county.slice(1)).order('name', { ascending: true })
              : rq.order('name', { ascending: true });
          })(),
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
      return items.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
    }

    return items.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
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
    setShareOpenId('');
    onNavigate('find-help', county || null, listing.slug);
  };

  const closeResource = () => {
    onNavigate('find-help', county || null);
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
      const shortUrl = resourceUrl.replace(/^https?:\/\/[^/]+/, '');
      setToast(`Link copied · ${shortUrl}`);
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

  if (selectedCounty === null) {
    return <CountyEntrance onSelectCounty={setSelectedCounty} onNavigate={onNavigate} session={session} />;
  }

  // County opening-soon: explicit non-Cornwall county with no listings yet
  if (!loading && !error && resources.length === 0 && county && county !== 'cornwall') {
    const countyLabel = county.charAt(0).toUpperCase() + county.slice(1);
    return (
      <>
        <Nav activePage="find-help" onNavigate={onNavigate} session={session} />
        <CountyBanner county={county} isFallback={false} onChangeCounty={(c) => onNavigate('find-help', c)} />
        <section style={{ paddingTop: 80, paddingBottom: 80, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
          <div className="container" style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(45,156,219,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 22px', color: '#2D9CDB' }}>
              <IPin s={28} />
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, color: '#1A2744', marginBottom: 14, letterSpacing: '-0.02em' }}>
              {countyLabel} is opening soon
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65, marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
              We are preparing local support listings for {countyLabel}. Organisations can submit a listing or offer a discount to carers while this county is being built.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('profile')}
                className="btn btn-gold"
                style={{ fontWeight: 800, fontSize: 15, padding: '13px 24px' }}
              >
                Submit organisation
              </button>
              <button
                onClick={() => onNavigate('offer-a-discount')}
                className="btn"
                style={{ fontWeight: 700, fontSize: 15, padding: '13px 24px', background: '#1A2744', color: 'white', border: 'none' }}
              >
                Offer a discount
              </button>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} session={session} />
      <CountyBanner
        county={county}
        isFallback={!county}
        onChangeCounty={(c) => onNavigate('find-help', c)}
      />

      <section style={{ paddingTop: 40, paddingBottom: 36, background: 'linear-gradient(180deg, #E7F3FB 0%, #FAFBFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <button onClick={() => setSelectedCounty(null)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Find help near you</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>{detailSlug ? (selectedResource?.title || 'Resource detail') : (county ? county.charAt(0).toUpperCase() + county.slice(1) : 'Cornwall')}</span>
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
          session={session}
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
          <section style={{ paddingTop: 10, paddingBottom: 10, background: '#FAFBFF', position: 'sticky', top: 78, zIndex: 80, borderBottom: '1px solid rgba(26,39,68,0.06)', boxShadow: '0 2px 10px rgba(26,39,68,0.05)' }}>
            <div className="container">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.97)', borderRadius: 18, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)' }}>
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
                <div style={{ display: 'grid', gap: 12 }}>
                  <StateCard
                    title={
                      keyword.trim() || activeCat !== 'all' || areaFilter !== 'all' || countyFilter !== 'all' || showMappableOnly
                        ? 'No results match your current filters.'
                        : 'No support listings found yet.'
                    }
                    subtitle={
                      keyword.trim() || activeCat !== 'all' || areaFilter !== 'all' || countyFilter !== 'all' || showMappableOnly
                        ? 'Try broadening your search — or clear all filters to see everything available.'
                        : 'Check back soon — more listings are being added by the community team.'
                    }
                  />
                  {(keyword.trim() || activeCat !== 'all' || areaFilter !== 'all' || countyFilter !== 'all' || showMappableOnly) && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setKeyword(''); setActiveCat('all'); setAreaFilter('all'); setCountyFilter('all'); setShowMappableOnly(false); }}>
                        Clear all filters
                      </button>
                      {activeCat !== 'all' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveCat('all')}>
                          Show all categories
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
