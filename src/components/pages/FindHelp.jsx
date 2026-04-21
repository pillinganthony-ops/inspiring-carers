import React from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import supabase, { isSupabaseConfigured } from '../../lib/supabaseClient.js';

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
    locationKey: `${area}`.trim() || 'Cornwall',
    searchText: `${title} ${venue} ${area} ${categoryLabel} ${summary}`.toLowerCase(),
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

const Toast = ({ toast, onClose }) => {
  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 2800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 80, background: '#12203D', color: 'white', borderRadius: 16, padding: '14px 16px', minWidth: 300, boxShadow: '0 20px 50px rgba(18,32,61,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: 999, background: 'rgba(91,201,74,0.22)', color: '#7EE76D', display: 'grid', placeItems: 'center' }}>
          <ICheck s={14} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.72, fontWeight: 600 }}>Shared with confidence</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{toast}</div>
        </div>
      </div>
    </div>
  );
};

const ShareTray = ({ listing, onAction, onClose }) => {
  const actions = [
    { id: 'copy', label: 'Copy Link' },
    { id: 'email', label: 'Email' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'open', label: 'Open Resource' },
  ];

  return (
    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #E8EDF8', borderRadius: 14, minWidth: 196, boxShadow: '0 22px 44px rgba(20,39,69,0.16)', padding: 8, zIndex: 12 }}>
      {actions.map((action) => (
        <button key={action.id} onClick={() => { onAction(action.id, listing); onClose(); }} style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#1A2744' }}>
          {action.label}
        </button>
      ))}
    </div>
  );
};

const DetailRow = ({ label, value, isLink = false, href = '', external = false }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '126px 1fr', gap: 8, alignItems: 'baseline' }}>
    <div style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,39,68,0.5)', fontWeight: 700 }}>{label}</div>
    {isLink ? (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} style={{ fontSize: 14.5, color: '#1A2744', textDecoration: 'underline' }}>{value}</a>
    ) : (
      <div style={{ fontSize: 14.5, color: '#1A2744' }}>{value}</div>
    )}
  </div>
);

const ResourceDetail = ({ listing, onBack, onShareAction }) => {
  if (!listing) {
    return <StateCard title="This resource is no longer available." subtitle="Try returning to the full directory results." />;
  }

  return (
    <section style={{ paddingTop: 26, paddingBottom: 80, background: '#FAFBFF' }}>
      <div className="container">
        <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>
          <IChevron s={12} dir="left" /> Back to results
        </button>

        <div className="card" style={{ padding: 28, borderRadius: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 26 }}>
            <div>
              <div className="eyebrow" style={{ color: toneMapColor(listing.tone).fg }}>{listing.categoryLabel}</div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em', marginTop: 10 }}>{listing.title}</h1>
              <p style={{ marginTop: 12, color: 'rgba(26,39,68,0.72)', lineHeight: 1.65 }}>{listing.desc}</p>

              <div style={{ marginTop: 20, display: 'grid', gap: 10, color: '#1A2744' }}>
                <DetailRow label="Provider" value={listing.venue} />
                <DetailRow label="Town" value={listing.area} />
                <DetailRow label="Availability" value={listing.when} />
                <DetailRow label="Address" value={listing.address || listing.postcode || 'Please contact provider for full address'} />
                <DetailRow label="Phone" value={listing.phone || 'Not listed'} isLink={Boolean(listing.phone)} href={`tel:${listing.phone || ''}`} />
                <DetailRow label="Email" value={listing.email || 'Not listed'} isLink={Boolean(listing.email)} href={`mailto:${listing.email || ''}`} />
                <DetailRow label="Website" value={listing.website || 'Not listed'} isLink={Boolean(listing.website)} href={listing.website || ''} external />
              </div>
            </div>

            <aside style={{ background: 'linear-gradient(180deg, #F7FAFF 0%, #F2F7FF 100%)', borderRadius: 18, padding: 18, border: '1px solid #E6EDF8', height: 'fit-content' }}>
              <div style={{ fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>Share with client</div>
              <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(26,39,68,0.66)' }}>Send this support option in one click. Designed for trusted worker-client sharing.</p>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <button className="btn btn-sky btn-sm" onClick={() => onShareAction('copy', listing)}>Copy Link</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onShareAction('email', listing)}>Email</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onShareAction('whatsapp', listing)}>WhatsApp</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onShareAction('open', listing)}>Open Resource</button>
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #DFE8F7' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2744' }}>Trust signals</div>
                <div style={{ marginTop: 6, display: 'grid', gap: 5, fontSize: 12.5, color: 'rgba(26,39,68,0.72)' }}>
                  <div>• Listed in verified local directory</div>
                  <div>• Shareable direct link</div>
                  <div>• Up-to-date contact fields</div>
                </div>
              </div>

              {(listing.lat !== null && listing.lng !== null) && (
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <a href={getMapsOpenUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open in Google Maps</a>
                  <a href={getMapsDirectionsUrl(listing)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Get Directions</a>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

const ListingCard = ({ listing, saved, onToggleSave, onOpenResource, onShareAction, shareOpen, setShareOpen, selected, onSelect }) => (
  <div className="card" onClick={() => onSelect(listing.id)} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, border: selected ? `1px solid ${toneMapColor(listing.tone).fg}` : '1px solid #EFF1F7', boxShadow: selected ? `0 12px 28px ${toneMapColor(listing.tone).fg}26` : 'var(--shadow-sm)', cursor: 'pointer' }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
      <IconTile tone={listing.tone} size={52} radius={14}>{listing.icon}</IconTile>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="eyebrow" style={{ color: toneMapColor(listing.tone).fg }}>{listing.categoryLabel}</div>
          <button onClick={(event) => { event.stopPropagation(); onToggleSave(); }} style={{ width: 34, height: 34, borderRadius: 999, background: saved ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)', color: saved ? '#F4613A' : '#1A2744', display: 'grid', placeItems: 'center' }}>
            <IHeart s={16} />
          </button>
        </div>
        <button onClick={(event) => { event.stopPropagation(); onOpenResource(listing); }} style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: '-0.01em', color: '#1A2744', textAlign: 'left' }}>
          {listing.title}
        </button>
        <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginTop: 4 }}>{listing.venue} · {listing.area}</div>
      </div>
    </div>

    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)', lineHeight: 1.52 }}>{listing.desc}</p>

    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {listing.tags.map((tag) => <span key={tag} className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>{tag}</span>)}
      {listing.website && <a href={listing.website} target="_blank" rel="noreferrer" className="chip" onClick={(event) => event.stopPropagation()} style={{ padding: '4px 10px', fontSize: 11 }}>Website</a>}
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #EFF1F7' }}>
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>{listing.when}</span>
        <span style={{ color: 'rgba(26,39,68,0.5)' }}> · {listing.distance}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
        <button className="btn btn-ghost btn-sm" onClick={(event) => { event.stopPropagation(); onOpenResource(listing); }}>Open <IArrow s={14} /></button>
        <button className="btn btn-sky btn-sm" onClick={(event) => { event.stopPropagation(); setShareOpen(shareOpen ? '' : listing.id); }}>Share</button>
        {shareOpen && <ShareTray listing={listing} onAction={onShareAction} onClose={() => setShareOpen('')} />}
      </div>
    </div>
  </div>
);

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

const LoadingGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="card" style={{ padding: 22, minHeight: 220, background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,255,0.96))' }}>
        <div style={{ width: 120, height: 12, borderRadius: 999, background: '#EEF2FA' }} />
        <div style={{ width: '72%', height: 18, borderRadius: 999, background: '#E4EAF5', marginTop: 18 }} />
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

      const [categoriesResult, resourcesResult] = await Promise.all([
        supabase.from('categories').select('name, slug, active, sort_order').eq('active', true).order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('resources').select('*').eq('active', true).order('name', { ascending: true }),
      ]);

      if (cancelled) return;

      if (categoriesResult.error || resourcesResult.error) {
        setCategories([]);
        setResources([]);
        setError('We are having trouble loading local support right now.');
        setLoading(false);
        return;
      }

      const loadedResources = (resourcesResult.data || []).map(normalizeResource);
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

  const filtered = React.useMemo(() => {
    const searchNeedle = keyword.trim().toLowerCase();

    return resources.filter((resource) => {
      if (activeCat !== 'all' && resource.cat !== activeCat) return false;
      if (areaFilter !== 'all' && resource.locationKey !== areaFilter) return false;
      if (searchNeedle && !resource.searchText.includes(searchNeedle)) return false;
      return true;
    });
  }, [resources, activeCat, areaFilter, keyword]);

  const selectedResource = React.useMemo(() => (detailSlug ? resources.find((item) => item.slug === detailSlug) || null : null), [resources, detailSlug]);

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
      await navigator.clipboard.writeText(resourceUrl);
      setToast('Direct resource link copied.');
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

                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                      <IPin s={18} />
                      <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744', fontFamily: 'Inter, sans-serif' }}>
                        <option value="all">All towns and areas</option>
                        {areaOptions.map((area) => <option key={area} value={area}>{area}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-sky btn-sm" onClick={clearFilters}><IClose s={14} /> Clear</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {detailSlug ? (
        <ResourceDetail listing={selectedResource} onBack={closeResource} onShareAction={handleShareAction} />
      ) : (
        <>
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
