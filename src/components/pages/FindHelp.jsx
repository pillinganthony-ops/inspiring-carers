import React from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
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

const normalizeResource = (row, index) => {
  const rawCategory = pickField(row, ['category', 'category_name', 'category_label', 'resource_type', 'type']) || 'Support';
  const cat = normalizeCategorySlug(rawCategory);
  const categoryLabel = getCategoryLabelFromSlug(cat);
  const categoryMeta = getCategoryMeta(rawCategory);

  const title = pickField(row, ['name', 'title']) || `Support listing ${index + 1}`;
  const venue = pickField(row, ['organisation', 'organization', 'provider', 'venue', 'location_name']) || 'Community support';
  const area = pickField(row, ['town', 'area', 'location', 'city']) || pickField(row, ['postcode']) || 'Cornwall';
  const county = pickField(row, ['county', 'region', 'admin_county']) || '';
  const availability = pickField(row, ['opening_hours', 'availability', 'service_hours', 'contact_hours']) || 'Contact for details';
  const summary = pickField(row, ['summary', 'description', 'short_description']) || 'Local support for carers and the people they support.';

  return {
    id: row?.id ?? `resource-${index + 1}`,
    slug: pickField(row, ['slug']) || toSlug(title) || `resource-${index + 1}`,
    cat,
    categoryLabel,
    tone: categoryMeta.tone,
    icon: categoryMeta.cardIcon,
    title,
    venue,
    area,
    when: availability,
    distance: pickField(row, ['postcode']) || area,
    desc: summary,
    website: pickField(row, ['website', 'url', 'link']),
    phone: pickField(row, ['phone', 'telephone']),
    email: pickField(row, ['email']),
    address: pickField(row, ['address', 'address_line_1', 'address_line1']),
    postcode: pickField(row, ['postcode']),
    lat: parseCoordinate(pickField(row, ['lat', 'latitude'])),
    lng: parseCoordinate(pickField(row, ['lng', 'longitude'])),
    tags: toTags(row),
    featured: Boolean(row?.featured || row?.profile?.featured),
    logoUrl: pickField(row?.profile || {}, ['logo_url']) || pickField(row?.metadata?.brand || {}, ['logo_url']),
    coverImageUrl: pickField(row?.profile || {}, ['cover_image_url']),
    profile: row?.profile || null,
    events: Array.isArray(row?.events) ? row.events : [],
    serviceCategories: Array.isArray(row?.profile?.service_categories) ? row.profile.service_categories : [],
    areasCovered: Array.isArray(row?.profile?.areas_covered) ? row.profile.areas_covered : [],
    county,
    locationKey: `${area}`.trim() || 'Cornwall',
    countyKey: `${county}`.trim().toLowerCase() || 'cornwall',
    searchText: `${title} ${venue} ${area} ${county} ${categoryLabel} ${summary}`.toLowerCase(),
  };
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
  const [form, setForm] = React.useState({ fullName: '', orgName: listing?.venue || listing?.title || '', email: '', phone: '', relationship: '', reason: '' });
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
        email,
        phone: form.phone.trim() || null,
        relationship: form.relationship.trim(),
        reason: form.reason.trim(),
        status: 'pending',
      };

      const { error: dbError } = await supabase.from('listing_claims').insert(claimPayload);
      if (dbError) {
        const message = dbError.message || '';
        const missingClaimsTable = message.includes('listing_claims') && (message.includes('schema cache') || message.includes('does not exist'));
        if (!missingClaimsTable) throw dbError;

        const { error: fallbackError } = await supabase.from('resource_update_submissions').insert({
          resource_id: listing.id,
          resource_name: listing.title,
          resource_category: listing.categoryLabel,
          update_type: 'claim_request',
          description: claimPayload.reason,
          submitter_name: claimPayload.full_name,
          submitter_email: claimPayload.email,
          status: 'pending',
          payload: claimPayload,
        });
        if (fallbackError) throw fallbackError;
      }
      onSuccess();
    } catch (err) {
      const message = err.message || 'Failed to submit claim. Please try again.';
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
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Organisation name *</label>
            <input value={form.orgName} onChange={set('orgName')} required placeholder="Organisation name" style={fieldSt} />
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
                  <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 3 }}>{r.venue} · {r.area}</div>
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
      if (!supabase) throw new Error('Database not available.');
      const { error: enquiryError } = await supabase.from('organisation_event_enquiries').insert({
        organisation_event_id: event.id,
        organisation_profile_id: event.organisation_profile_id,
        cta_type: event.cta_type,
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim() || null,
        spaces_requested: Number(form.spacesRequested) || null,
      });
      if (enquiryError) throw enquiryError;
      onSuccess(event.cta_type === 'book' ? `Booking request sent for ${event.title}.` : `Contact request sent to ${listing.venue}.`);
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
        <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.68)', lineHeight: 1.65 }}>{formatEventDateTime(event.starts_at)} · {event.location || listing.area}</p>
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
const ResourceDetail = ({ listing, onBack, onShareAction, allResources, savedIds, onToggleSave, onOpenResource, onNotify }) => {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [mobileShareOpen, setMobileShareOpen] = React.useState(false);
  const [claimOpen, setClaimOpen] = React.useState(false);
  const [claimSuccess, setClaimSuccess] = React.useState(false);
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
                {listing.area && <><span style={{ opacity: 0.4 }}>·</span><span>{listing.area}</span></>}
                {listing.postcode && <><span style={{ opacity: 0.4 }}>·</span><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{listing.postcode}</span></>}
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
                    : `This service is open to people in ${listing.area || 'Cornwall'} who need support related to ${listing.categoryLabel.toLowerCase()}.`}
                </p>
              </DetailSection>

              {(listing.serviceCategories.length || listing.areasCovered.length) ? (
                <DetailSection title="Organisation profile" icon={<IHub s={14} />}>
                  {listing.serviceCategories.length ? <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginBottom: 10 }}><strong style={{ color: '#1A2744' }}>Services:</strong> {listing.serviceCategories.join(', ')}</div> : null}
                  {listing.areasCovered.length ? <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)' }}><strong style={{ color: '#1A2744' }}>Areas covered:</strong> {listing.areasCovered.join(', ')}</div> : null}
                </DetailSection>
              ) : null}

              <DetailSection title="Events by this organisation" icon={<IEvent s={14} />}>
                {!listing.events.length ? (
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
                            <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{formatEventDateTime(event.starts_at)} · {event.location || listing.area}</div>
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
                  {listing.address && (
                    <div style={{ fontSize: 14.5, color: '#1A2744', fontWeight: 500 }}>{listing.address}</div>
                  )}
                  {listing.postcode && (
                    <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.6)', fontFamily: 'monospace' }}>{listing.postcode}</div>
                  )}
                  {listing.area && (
                    <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.6)' }}>{listing.area}, Cornwall</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <a href={getMapsOpenUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                      <IPin s={14} /> View on map
                    </a>
                    <a href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                      <IDirections s={14} /> Get directions
                    </a>
                  </div>
                </div>
              </DetailSection>
            </div>

            {/* Contact details */}
            <div style={{ background: 'white', borderRadius: 22, padding: 24, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Contact details</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <ContactItem icon={<IBuilding s={16} />} label="Organisation" value={listing.venue} />
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
            {!claimSuccess ? (
              <div style={{ background: 'white', borderRadius: 22, padding: 18, border: '1px solid #EFF1F7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(245,166,35,0.1)', color: '#F5A623', display: 'grid', placeItems: 'center' }}>
                    <IBuilding s={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Is this your organisation?</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.55)', marginTop: 1 }}>Manage and update this listing</div>
                  </div>
                </div>
                <button onClick={() => setClaimOpen(true)} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 14, justifyContent: 'center', gap: 8 }}>
                  <IFlag s={14} /> Claim this listing
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 22, padding: 18, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <ICheck s={18} style={{ color: '#10B981' }} />
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A2744' }}>Claim submitted — our team will review and be in touch.</div>
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
      {claimOpen && (
        <ClaimModal
          listing={listing}
          onClose={() => setClaimOpen(false)}
          onSuccess={() => { setClaimOpen(false); setClaimSuccess(true); onNotify?.('Claim request submitted successfully.'); }}
          onError={(message) => onNotify?.(message)}
        />
      )}
      {activeEvent ? <EventActionModal listing={listing} event={activeEvent} onClose={() => setActiveEvent(null)} onSuccess={(message) => { setActiveEvent(null); onNotify?.(message); }} onFailure={(message) => onNotify?.(message)} /> : null}
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
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, marginTop: 3, letterSpacing: '-0.01em', color: '#1A2744', textAlign: 'left', lineHeight: 1.25 }}
          >
            {listing.title}
          </button>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.6)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IBuilding s={12} />
            {listing.venue} · {listing.area}
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

const DirectoryMap = ({ listings, selectedId, onSelect, onOpenResource }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({ id: 'ic-google-map', googleMapsApiKey: googleMapsApiKey || '', libraries: MAP_LIBRARIES });

  const points = React.useMemo(() => listings.filter((item) => item.lat !== null && item.lng !== null), [listings]);
  const selected = points.find((item) => item.id === selectedId) || points[0] || null;

  if (!googleMapsApiKey) {
    return <StateCard title="Google Maps key is missing" subtitle="Add VITE_GOOGLE_MAPS_API_KEY to enable full interactive map pins and routing." />;
  }

  if (!points.length) {
    return <StateCard title="No mappable coordinates in this result set" subtitle="Switch category or list view to explore all resources." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, minHeight: 640 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 640, overflowY: 'auto', paddingRight: 6 }}>
        {listings.map((listing) => {
          const active = listing.id === selectedId;
          return (
            <div key={listing.id} className="card" onClick={() => onSelect(listing.id)} style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'start', border: active ? `1px solid ${toneMapColor(listing.tone).fg}` : '1px solid #EFF1F7', boxShadow: active ? `0 10px 22px ${toneMapColor(listing.tone).fg}24` : 'var(--shadow-sm)', cursor: 'pointer' }}>
              <IconTile tone={listing.tone} size={42} radius={10}>{listing.icon}</IconTile>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{listing.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 2 }}>{listing.area} · {listing.categoryLabel}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={(event) => { event.stopPropagation(); onOpenResource(listing); }}>Open</button>
                  <a className="btn btn-ghost btn-sm" href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Directions</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20, minHeight: 640 }}>
        {isLoaded ? (
          <GoogleMap mapContainerStyle={{ width: '100%', height: '640px' }} center={selected ? { lat: selected.lat, lng: selected.lng } : { lat: 50.266, lng: -5.05 }} zoom={11} options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'greedy' }}>
            {points.map((listing) => (
              <MarkerF key={listing.id} position={{ lat: listing.lat, lng: listing.lng }} onClick={() => onSelect(listing.id)} title={listing.title} />
            ))}

            {selected && (
              <InfoWindowF position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => onSelect('')}>
                <div style={{ maxWidth: 230 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.title}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.72)', marginTop: 3 }}>{selected.area} · {selected.categoryLabel}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onOpenResource(selected)}>Open</button>
                    <a className="btn btn-ghost btn-sm" href={getMapsDirectionsUrl(selected)} target="_blank" rel="noreferrer">Directions</a>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 640, color: 'rgba(26,39,68,0.65)' }}>Loading interactive map...</div>
        )}
      </div>
    </div>
  );
};

/* ─── LoadingGrid ────────────────────────────────────────── */
const SkeletonBlock = ({ w = '100%', h = 14, mt = 0 }) => (
  <div style={{ width: w, height: h, borderRadius: 999, background: 'linear-gradient(90deg, #EEF2FA 25%, #E0E8F5 50%, #EEF2FA 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s ease infinite', marginTop: mt }} />
);

const LoadingGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
  const [view, setView] = React.useState('list');
  const [activeCat, setActiveCat] = React.useState('all');
  const [savedIds, setSavedIds] = React.useState(new Set());
  const [keyword, setKeyword] = React.useState('');
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [countyFilter, setCountyFilter] = React.useState('all');
  const [resources, setResources] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [shareOpenId, setShareOpenId] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('');
  const [detailSlug, setDetailSlug] = React.useState(() => getDetailSlugFromPath());

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

      const [categoriesResult, resourcesResult, profilesResult, eventsResult] = await Promise.all([
        supabase.from('categories').select('name, slug, active, sort_order').eq('active', true).order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('resources').select('*').eq('active', true).order('name', { ascending: true }),
        supabase.from('organisation_profiles').select('*').eq('is_active', true),
        supabase.from('organisation_events').select('*').eq('status', 'scheduled').order('starts_at', { ascending: true }),
      ]);

      if (cancelled) return;

      if (categoriesResult.error || resourcesResult.error) {
        setCategories([]);
        setResources([]);
        setError('We are having trouble loading local support right now.');
        setLoading(false);
        return;
      }

      const profilesMap = new Map();
      const eventsByProfile = new Map();

      if (!profilesResult.error) {
        (profilesResult.data || []).forEach((profile) => {
          if (profile.resource_id) profilesMap.set(profile.resource_id, profile);
        });
      }

      if (!eventsResult.error) {
        (eventsResult.data || []).forEach((event) => {
          const current = eventsByProfile.get(event.organisation_profile_id) || [];
          current.push(event);
          eventsByProfile.set(event.organisation_profile_id, current);
        });
      }

      const loadedResources = (resourcesResult.data || []).map((row, index) => {
        const profile = profilesMap.get(row.id) || null;
        return normalizeResource({
          ...row,
          profile,
          events: profile ? (eventsByProfile.get(profile.id) || []) : [],
        }, index);
      });
      const discoveredCategoryMap = new Map();

      (categoriesResult.data || []).forEach((cat) => {
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
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const areaOptions = React.useMemo(() => Array.from(new Set(resources.map((resource) => resource.locationKey).filter(Boolean))).sort(), [resources]);
  const countyOptions = React.useMemo(() => Array.from(new Set(resources.map((resource) => resource.county).filter(Boolean))).sort(), [resources]);

  const filtered = React.useMemo(() => {
    const searchNeedle = keyword.trim().toLowerCase();

    return resources.filter((resource) => {
      if (activeCat !== 'all' && resource.cat !== activeCat) return false;
      if (areaFilter !== 'all' && resource.locationKey !== areaFilter) return false;
      if (countyFilter !== 'all' && resource.county !== countyFilter) return false;
      if (searchNeedle && !resource.searchText.includes(searchNeedle)) return false;
      return true;
    });
  }, [resources, activeCat, areaFilter, countyFilter, keyword]);

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
    const line = `${listing.title} | ${listing.categoryLabel} | ${listing.area}`;

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

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>For the people you support</div>
              <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginTop: 10, letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance' }}>Trusted local support, ready to share.</h1>
              <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 600 }}>Search, filter, open a dedicated detail page, and share polished links with clients in one flow.</p>
            </div>

            {!detailSlug && (
              <div style={{ background: 'white', borderRadius: 20, padding: 18, border: '1px solid #EFF1F7', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                    <ISearch s={18} />
                    <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search support, services or keywords" style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                      <IPin s={18} />
                      <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif' }}>
                        <option value="all">All towns and areas</option>
                        {areaOptions.map((area) => <option key={area} value={area}>{area}</option>)}
                      </select>
                    </div>
                    {countyOptions.length > 0 && (
                      <select value={countyFilter} onChange={(event) => setCountyFilter(event.target.value)} style={{ flex: '1 1 140px', padding: '10px 12px', borderRadius: 12, border: '1px solid #EFF1F7', background: '#FAFBFF', fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                        <option value="all">All counties</option>
                        {countyOptions.map((county) => <option key={county} value={county}>{county}</option>)}
                      </select>
                    )}
                    <button className="btn btn-sky btn-sm" onClick={clearFilters}><IClose s={14} /> Clear</button>
                  </div>
                </div>
              </div>
            )}
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
        />
      ) : (
        <>
          {/* Scroll banner */}
          <div style={{ background: 'linear-gradient(90deg, #1A2744 0%, #2D9CDB 100%)', overflowX: 'hidden', padding: '10px 0', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 48, animation: 'scrollBanner 28s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
              {[
                '🌟 Inspiring Carers — Cornwall\'s free carer support directory',
                '💙 Free listings for carer-friendly organisations',
                '📋 Claim your organisation\'s listing today',
                '🗺️ Services across all of Cornwall and the Isles of Scilly',
                '✅ Verified listings you can trust',
                '🌟 Inspiring Carers — Cornwall\'s free carer support directory',
                '💙 Free listings for carer-friendly organisations',
                '📋 Claim your organisation\'s listing today',
              ].map((text, i) => (
                <span key={i} style={{ color: 'white', fontSize: 13, fontWeight: 600, letterSpacing: 0.2, padding: '0 8px' }}>{text}</span>
              ))}
            </div>
            <style>{`@keyframes scrollBanner { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
          </div>

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
                            <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{listing.venue} · {listing.area}</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}><strong style={{ color: '#1A2744' }}>{filtered.length} results</strong> across All + category filters</div>
                <div style={{ display: 'flex', gap: 6, padding: 4, background: 'white', borderRadius: 999, border: '1px solid #EFF1F7' }}>
                  {['list', 'map'].map((mode) => (
                    <button key={mode} onClick={() => setView(mode)} style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: view === mode ? '#1A2744' : 'transparent', color: view === mode ? 'white' : '#1A2744', textTransform: 'capitalize' }}>{mode}</button>
                  ))}
                </div>
              </div>

              {loading ? (
                <LoadingGrid />
              ) : error ? (
                <StateCard title="We are having trouble loading local support right now." />
              ) : !filtered.length ? (
                <StateCard title="No support listings found yet." />
              ) : view === 'list' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {filtered.map((listing) => (
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
              ) : (
                <DirectoryMap listings={filtered} selectedId={selectedId} onSelect={setSelectedId} onOpenResource={openResource} />
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
