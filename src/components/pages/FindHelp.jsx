// Find Help Near You — the signposting engine with live Supabase data

import React from 'react';
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
  IconTile,
} = Icons;

const CATEGORY_META = [
  { id: 'groups', label: 'Groups', tone: 'sky', icon: <IGroups s={16} />, cardIcon: <IGroups s={22} />, matches: ['group', 'social', 'community'] },
  { id: 'walks', label: 'Walks', tone: 'lime', icon: <IWalks s={16} />, cardIcon: <IWalks s={22} />, matches: ['walk', 'outdoor'] },
  { id: 'events', label: 'Events', tone: 'violet', icon: <IEvent s={16} />, cardIcon: <IEvent s={22} />, matches: ['event', 'activity', 'arts'] },
  { id: 'hubs', label: 'Community hubs', tone: 'sky', icon: <IHub s={16} />, cardIcon: <IHub s={22} />, matches: ['hub', 'centre', 'center', 'service'] },
  { id: 'libs', label: 'Libraries', tone: 'gold', icon: <ILibrary s={16} />, cardIcon: <ILibrary s={22} />, matches: ['library', 'book'] },
  { id: 'mind', label: 'Mental wellbeing', tone: 'violet', icon: <IMind s={16} />, cardIcon: <IMind s={22} />, matches: ['mind', 'mental', 'wellbeing', 'wellness'] },
  { id: 'family', label: 'Family support', tone: 'lime', icon: <IFamily s={16} />, cardIcon: <IFamily s={22} />, matches: ['family', 'children', 'young'] },
  { id: 'advice', label: 'Advice', tone: 'sky', icon: <IAdvice s={16} />, cardIcon: <IAdvice s={22} />, matches: ['advice', 'advocacy', 'guidance', 'support'] },
  { id: 'money', label: 'Finance help', tone: 'lime', icon: <IFinance s={16} />, cardIcon: <IFinance s={22} />, matches: ['finance', 'benefit', 'money', 'cost', 'foodbank'] },
  { id: 'travel', label: 'Transport', tone: 'coral', icon: <ITransport s={16} />, cardIcon: <ITransport s={22} />, matches: ['transport', 'travel', 'mobility'] },
  { id: 'safe', label: 'Safe spaces', tone: 'gold', icon: <IShield s={16} />, cardIcon: <IShield s={22} />, matches: ['safe', 'safeguard', 'refuge'] },
];

const CATEGORY_DISPLAY_LABELS = {
  'mental-health-wellbeing': 'Mental Health',
  carers: 'Carers',
  'carers-support': 'Carers',
  'health-medical-support': 'Health',
  'advice-guidance': 'Advice',
  'housing-homelessness': 'Housing',
  'food-essentials': 'Food',
  'families-children-young-people': 'Families',
  'family-children-support': 'Families',
  'older-people-support': 'Older People',
  'community-groups-social-connection': 'Community',
  'faith-spiritual-support': 'Faith',
  'employment-skills': 'Work & Skills',
  'crisis-safety-support': 'Crisis',
  'disability-accessibility': 'Accessibility',
  'transport-access': 'Transport',
  'nature-activity-outdoors': 'Outdoors',
};

const CATEGORY_DISPLAY_LABEL_ALIASES = {
  'carers support': 'Carers',
  'health & medical support': 'Health',
  'advice & guidance': 'Advice',
  'housing & homelessness': 'Housing',
  'food & essentials': 'Food',
  'family, children & young people': 'Families',
  'family & children support': 'Families',
  'older people support': 'Older People',
  'community groups & social connection': 'Community',
  'faith & spiritual support': 'Faith',
  'employment & skills': 'Work & Skills',
  'crisis & safety support': 'Crisis',
  'disability & accessibility': 'Accessibility',
  'transport & access': 'Transport',
  'nature, activity & outdoors': 'Outdoors',
  'mental health & wellbeing': 'Mental Health',
};

const FEATURED_CATEGORY_LABELS = ['Mental Health', 'Carers', 'Health', 'Advice', 'Community'];

const pickField = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== '') return value;
  }
  return '';
};

const toTitleCase = (value) =>
  `${value || ''}`
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const toSlug = (value) =>
  `${value || ''}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getCategoryDisplayLabel = (name, slug) => {
  const normalizedName = `${name || ''}`.trim().toLowerCase();
  return CATEGORY_DISPLAY_LABELS[slug] || CATEGORY_DISPLAY_LABEL_ALIASES[normalizedName] || toTitleCase(name);
};

const getCategoryMeta = (value) => {
  const raw = `${value || 'support'}`.toLowerCase();
  const matched = CATEGORY_META.find((category) => category.matches.some((match) => raw.includes(match)));
  if (matched) return matched;
  return {
    id: toSlug(raw) || 'support',
    label: toTitleCase(raw) || 'Support',
    tone: 'navy',
    icon: <ISparkle s={16} />,
    cardIcon: <ICoffee s={22} />,
  };
};

const toTags = (row) => {
  const rawTags = pickField(row, ['tags', 'tag_list', 'labels']);
  let tags = [];

  if (Array.isArray(rawTags)) {
    tags = rawTags;
  } else if (typeof rawTags === 'string') {
    tags = rawTags.split(',');
  }

  tags = tags.map((tag) => `${tag}`.trim()).filter(Boolean);

  if (row?.verified) tags.unshift('Verified');
  if (row?.featured) tags.push('Featured');
  if (!tags.length) tags = ['Local support'];

  return Array.from(new Set(tags)).slice(0, 4);
};

const normalizeResource = (row, index) => {
  const categoryName = pickField(row, ['category', 'category_name', 'category_label', 'resource_type', 'type']) || 'Support';
  const category = getCategoryMeta(categoryName);
  const title = pickField(row, ['name', 'title']) || `Support listing ${index + 1}`;
  const venue = pickField(row, ['organisation', 'organization', 'provider', 'venue', 'location_name']) || 'Community support';
  const area = pickField(row, ['town', 'area', 'location', 'city']) || pickField(row, ['postcode']) || 'Cornwall';
  const availability = pickField(row, ['opening_hours', 'availability', 'service_hours', 'contact_hours']) || 'Contact for details';
  const summary = pickField(row, ['summary', 'description', 'short_description']) || 'Local support for carers and the people they support.';
  const website = pickField(row, ['website', 'url', 'link']);
  const phone = pickField(row, ['phone', 'telephone']);
  const email = pickField(row, ['email']);
  const address = pickField(row, ['address', 'address_line_1', 'address_line1']);
  const postcode = pickField(row, ['postcode']);
  const locationBits = [area, postcode].filter(Boolean);
  const shareText = [title, venue, locationBits.join(' · '), website || phone || email].filter(Boolean).join(' · ');

  return {
    id: row?.id ?? `${category.id}-${index}`,
    cat: category.id,
    categoryLabel: category.label,
    title,
    venue,
    area,
    when: availability,
    distance: postcode || area,
    tags: toTags(row),
    tone: category.tone,
    icon: category.cardIcon,
    desc: summary,
    website,
    phone,
    email,
    address,
    postcode,
    locationKey: `${area}`.trim() || 'Cornwall',
    searchText: `${title} ${venue} ${area} ${category.label} ${summary}`.toLowerCase(),
    shareText,
  };
};

const FindHelpPage = ({ onNavigate }) => {
  const [view, setView] = React.useState('list');
  const [activeCat, setActiveCat] = React.useState('all');
  const [savedIds, setSavedIds] = React.useState(new Set());
  const [keyword, setKeyword] = React.useState('');
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [resources, setResources] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Fetch categories directly from public.categories table
  React.useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (!cancelled) setCategories([]);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('id, name, slug, active, sort_order')
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });

        if (cancelled) return;

        if (fetchError) {
          console.warn('Failed to load categories:', fetchError);
          setCategories([]);
          return;
        }

        const mappedCategories = (data ?? []).map((cat) => {
          const meta = getCategoryMeta(cat.name);
          return {
            id: cat.slug,
            label: cat.name,
            displayLabel: getCategoryDisplayLabel(cat.name, cat.slug),
            tone: meta.tone,
            icon: meta.icon,
          };
        });

        setCategories(mappedCategories);
      } catch (err) {
        console.warn('Error loading categories:', err);
        setCategories([]);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadResources = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (!cancelled) {
          setResources([]);
          setError('We’re having trouble loading local support right now.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setResources([]);
        setError('We’re having trouble loading local support right now.');
        setLoading(false);
        return;
      }

      setResources((data ?? []).map(normalizeResource));
      setLoading(false);
    };

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const areaOptions = React.useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.locationKey).filter(Boolean))).sort(),
    [resources],
  );

  const filtered = React.useMemo(() => {
    const searchNeedle = keyword.trim().toLowerCase();

    return resources.filter((resource) => {
      if (activeCat !== 'all' && resource.cat !== activeCat) return false;
      if (areaFilter !== 'all' && resource.locationKey !== areaFilter) return false;
      if (searchNeedle && !resource.searchText.includes(searchNeedle)) return false;
      return true;
    });
  }, [resources, activeCat, areaFilter, keyword]);

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

  // Prepend "All" option to categories for rendering
  const categoryOptions = React.useMemo(
    () => [
      { id: 'all', label: 'All', displayLabel: 'All', tone: 'navy', icon: <ISparkle s={16} /> },
      ...categories,
    ],
    [categories],
  );

  const featuredCategoryOptions = React.useMemo(() => {
    const baseCategories = categoryOptions.filter((category) => category.id !== 'all');
    const featured = FEATURED_CATEGORY_LABELS
      .map((label) => baseCategories.find((category) => category.displayLabel === label))
      .filter(Boolean);

    const featuredIds = new Set(featured.map((category) => category.id));
    const remainder = baseCategories.filter((category) => !featuredIds.has(category.id));

    return [categoryOptions[0], ...featured, ...remainder.slice(0, Math.max(0, 5 - featured.length))];
  }, [categoryOptions]);

  const overflowCategoryOptions = React.useMemo(() => {
    const featuredIds = new Set(featuredCategoryOptions.map((category) => category.id));
    return categoryOptions.filter((category) => !featuredIds.has(category.id));
  }, [categoryOptions, featuredCategoryOptions]);

  const hiddenCategoryValue = overflowCategoryOptions.some((category) => category.id === activeCat) ? activeCat : '';

  return (
    <>
      <Nav activePage="find-help" onNavigate={onNavigate} />

      <section
        style={{
          paddingTop: 40,
          paddingBottom: 36,
          background: 'linear-gradient(180deg, #E7F3FB 0%, #FAFBFF 100%)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'rgba(26,39,68,0.5)',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>Find help near you</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>For the people you support</div>
              <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginTop: 10, letterSpacing: '-0.03em', fontWeight: 700, textWrap: 'balance' }}>
                Find help near you.
              </h1>
              <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 520 }}>
                Real groups, services, walks and support, now loading live from your support database.
              </p>
            </div>

            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 18,
                border: '1px solid #EFF1F7',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: '#FAFBFF',
                    border: '1px solid #EFF1F7',
                  }}
                >
                  <ISearch s={18} />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Search support, services or keywords"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#1A2744',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: '#FAFBFF',
                      border: '1px solid #EFF1F7',
                    }}
                  >
                    <IPin s={18} />
                    <select
                      value={areaFilter}
                      onChange={(event) => setAreaFilter(event.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1A2744',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <option value="all">All towns and areas</option>
                      {areaOptions.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-sky btn-sm" onClick={clearFilters}>
                    <IClose s={14} /> Clear
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {activeCat !== 'all' && (
                  <span className="chip" style={{ padding: '5px 10px', fontSize: 11 }}>
                    {categoryOptions.find((category) => category.id === activeCat)?.displayLabel || 'Category'}
                  </span>
                )}
                {areaFilter !== 'all' && (
                  <span className="chip" style={{ padding: '5px 10px', fontSize: 11 }}>{areaFilter}</span>
                )}
                {keyword.trim() && (
                  <span className="chip" style={{ padding: '5px 10px', fontSize: 11 }}>“{keyword.trim()}”</span>
                )}
                {!keyword.trim() && areaFilter === 'all' && activeCat === 'all' && (
                  <span style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', fontWeight: 600 }}>
                    Live listings sorted alphabetically.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24, paddingBottom: 0, background: '#FAFBFF' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 22,
              border: '1px solid #EFF1F7',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: 10,
                flex: '1 1 520px',
                minWidth: 0,
                overflowX: 'auto',
                padding: '2px 2px 6px',
                scrollSnapType: 'x proximity',
                WebkitOverflowScrolling: 'touch',
              }}
            >
            {featuredCategoryOptions.map((category) => {
              const active = activeCat === category.id;
              const tone = toneMapColor(category.tone);

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCat(category.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flex: '0 0 auto',
                    minHeight: 42,
                    padding: '0 16px',
                    borderRadius: 999,
                    background: active ? tone.fg : 'white',
                    color: active ? (category.tone === 'gold' || category.tone === 'lime' ? '#1A2744' : 'white') : '#1A2744',
                    border: `1px solid ${active ? tone.fg : '#EFF1F7'}`,
                    fontSize: 13.5,
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    transition: 'all .15s',
                    boxShadow: active ? `0 4px 12px ${tone.fg}55` : 'none',
                    scrollSnapAlign: 'start',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {category.icon} {category.displayLabel || category.label}
                </button>
              );
            })}
            </div>
            {overflowCategoryOptions.length > 0 && (
              <div
                style={{
                  position: 'relative',
                  flex: '0 0 210px',
                  minWidth: 180,
                }}
              >
                <select
                  value={hiddenCategoryValue}
                  onChange={(event) => {
                    if (event.target.value) setActiveCat(event.target.value);
                  }}
                  style={{
                    width: '100%',
                    minHeight: 44,
                    appearance: 'none',
                    borderRadius: 999,
                    border: `1px solid ${hiddenCategoryValue ? '#1A2744' : '#EFF1F7'}`,
                    background: hiddenCategoryValue ? '#1A2744' : 'white',
                    color: hiddenCategoryValue ? 'white' : '#1A2744',
                    padding: '0 42px 0 16px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    boxShadow: hiddenCategoryValue ? '0 4px 12px rgba(26,39,68,0.18)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">More categories</option>
                  {overflowCategoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayLabel || category.label}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: hiddenCategoryValue ? 'white' : 'rgba(26,39,68,0.6)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <IChevron s={12} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 32, paddingBottom: 80, background: '#FAFBFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.7)' }}>
              <strong style={{ color: '#1A2744' }}>{filtered.length} results</strong> from live support listings
            </div>
            <div style={{ display: 'flex', gap: 6, padding: 4, background: 'white', borderRadius: 999, border: '1px solid #EFF1F7' }}>
              {['list', 'map'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    background: view === mode ? '#1A2744' : 'transparent',
                    color: view === mode ? 'white' : '#1A2744',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <StateCard title="We’re having trouble loading local support right now." />
          ) : !filtered.length ? (
            <StateCard title="No support listings found yet." />
          ) : view === 'list' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  saved={savedIds.has(listing.id)}
                  onToggleSave={() => toggleSave(listing.id)}
                />
              ))}
            </div>
          ) : (
            <MapView listings={filtered} savedIds={savedIds} onToggleSave={toggleSave} />
          )}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
};

const toneMapColor = (tone) => ({
  navy: { fg: '#1A2744' },
  gold: { fg: '#F5A623' },
  lime: { fg: '#5BC94A' },
  sky:  { fg: '#2D9CDB' },
  coral:{ fg: '#F4613A' },
  violet:{ fg: '#7B5CF5' },
}[tone] || { fg: '#1A2744' });

const shareListing = async (listing) => {
  const shareText = listing.shareText || listing.title;

  if (navigator.share) {
    try {
      await navigator.share({ title: listing.title, text: shareText, url: listing.website || undefined });
      return;
    } catch {
      // Fall back to clipboard below.
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareText);
    window.alert('Listing copied so you can share it with a client.');
    return;
  }

  window.prompt('Copy this listing for your client:', shareText);
};

const ListingCard = ({ listing, saved, onToggleSave }) => (
  <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
      <IconTile tone={listing.tone} size={52} radius={14}>{listing.icon}</IconTile>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="eyebrow" style={{ color: toneMapColor(listing.tone).fg }}>{listing.categoryLabel}</div>
          <button onClick={onToggleSave} style={{
            width: 34, height: 34, borderRadius: 999,
            background: saved ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
            color: saved ? '#F4613A' : '#1A2744',
            display: 'grid', placeItems: 'center',
          }}>
            <IHeart s={16} />
          </button>
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: '-0.01em' }}>
          {listing.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', marginTop: 4 }}>
          {listing.venue} · {listing.area}
        </div>
      </div>
    </div>
    <p style={{ fontSize: 14, color: 'rgba(26,39,68,0.72)', lineHeight: 1.5 }}>
      {listing.desc}
    </p>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {listing.tags.map((tag) => <span key={tag} className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>{tag}</span>)}
      {listing.website && (
        <a href={listing.website} target="_blank" rel="noreferrer" className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>
          Website
        </a>
      )}
      {listing.phone && (
        <a href={`tel:${listing.phone}`} className="chip" style={{ padding: '4px 10px', fontSize: 11 }}>
          {listing.phone}
        </a>
      )}
    </div>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: 12, borderTop: '1px solid #EFF1F7',
    }}>
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>{listing.when}</span>
        <span style={{ color: 'rgba(26,39,68,0.5)' }}> · {listing.distance}</span>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => shareListing(listing)}>
        Share with client <IArrow s={14} />
      </button>
    </div>
  </div>
);

const MapView = ({ listings, savedIds, onToggleSave }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, minHeight: 640 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 640, overflowY: 'auto', paddingRight: 6 }}>
      {listings.map((listing) => (
        <div key={listing.id} className="card" style={{ padding: 14, display: 'flex', gap: 12 }}>
          <IconTile tone={listing.tone} size={42} radius={10}>{listing.icon}</IconTile>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{listing.title}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(26,39,68,0.6)', marginTop: 2 }}>{listing.when} · {listing.distance}</div>
          </div>
          <button onClick={() => onToggleSave(listing.id)} style={{
            width: 32, height: 32, borderRadius: 999,
            background: savedIds.has(listing.id) ? 'rgba(244,97,58,0.15)' : 'rgba(26,39,68,0.06)',
            color: savedIds.has(listing.id) ? '#F4613A' : '#1A2744',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <IHeart s={14} />
          </button>
        </div>
      ))}
    </div>

    {/* Stylized map */}
    <div style={{
      position: 'relative',
      borderRadius: 22,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #E7F3FB, #EEFBEB)',
      border: '1px solid #EFF1F7',
      minHeight: 640,
    }}>
      {/* subtle grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,39,68,0.06)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
        {/* winding road */}
        <path d="M -20 400 Q 150 350 280 410 T 520 380 T 720 420" fill="none" stroke="#FAFBFF" strokeWidth="14" strokeLinecap="round" />
        <path d="M -20 400 Q 150 350 280 410 T 520 380 T 720 420" fill="none" stroke="#E6E8F0" strokeWidth="2" strokeDasharray="6 6" />
        {/* river */}
        <path d="M 0 180 Q 180 230 340 170 T 700 180" fill="none" stroke="rgba(45,156,219,0.25)" strokeWidth="24" strokeLinecap="round" />
        {/* park */}
        <ellipse cx="180" cy="500" rx="120" ry="70" fill="rgba(91,201,74,0.22)" />
        <ellipse cx="540" cy="230" rx="90" ry="55" fill="rgba(91,201,74,0.20)" />
      </svg>

      {/* Pins */}
      {listings.slice(0, 7).map((listing, index) => {
        const positions = [
          { x: '28%', y: '40%' },
          { x: '52%', y: '30%' },
          { x: '68%', y: '55%' },
          { x: '38%', y: '65%' },
          { x: '75%', y: '35%' },
          { x: '20%', y: '70%' },
          { x: '58%', y: '78%' },
        ];
        const p = positions[index % positions.length];
        const color = toneMapColor(listing.tone).fg;
        return (
          <div key={listing.id} style={{
            position: 'absolute', left: p.x, top: p.y,
            transform: 'translate(-50%, -100%)',
          }}>
            <div style={{
              background: color, color: listing.tone === 'gold' || listing.tone === 'lime' ? '#1A2744' : 'white',
              width: 38, height: 38, borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 6px 14px rgba(26,39,68,0.25)',
              border: '3px solid white',
            }}>
              <div style={{ transform: 'rotate(45deg)' }}>{React.cloneElement(listing.icon, { s: 16 })}</div>
            </div>
          </div>
        );
      })}

      {/* "You are here" */}
      <div style={{ position: 'absolute', left: '45%', top: '48%', transform: 'translate(-50%, -50%)' }}>
        <div style={{
          width: 18, height: 18, borderRadius: 999,
          background: '#1A2744', border: '4px solid white',
          boxShadow: '0 4px 10px rgba(26,39,68,0.3)',
        }} />
        <div style={{
          position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#1A2744', color: 'white', padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 6,
        }}>You are here</div>
      </div>

      <div style={{
        position: 'absolute', top: 16, left: 16,
        background: 'white', padding: '8px 14px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, boxShadow: 'var(--shadow-sm)',
      }}>
        St Austell · 2 mile radius
      </div>
    </div>
  </div>
);

const LoadingGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="card" style={{ padding: 22, minHeight: 220, background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,249,255,0.96))' }}>
        <div style={{ width: 120, height: 12, borderRadius: 999, background: '#EEF2FA' }} />
        <div style={{ width: '72%', height: 18, borderRadius: 999, background: '#E4EAF5', marginTop: 18 }} />
        <div style={{ width: '55%', height: 12, borderRadius: 999, background: '#EEF2FA', marginTop: 10 }} />
        <div style={{ width: '100%', height: 12, borderRadius: 999, background: '#F2F5FB', marginTop: 30 }} />
        <div style={{ width: '88%', height: 12, borderRadius: 999, background: '#F2F5FB', marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <div style={{ width: 72, height: 28, borderRadius: 999, background: '#EEF2FA' }} />
          <div style={{ width: 88, height: 28, borderRadius: 999, background: '#EEF2FA' }} />
        </div>
      </div>
    ))}
  </div>
);

const StateCard = ({ title }) => (
  <div className="card" style={{ padding: 30, textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,255,0.98))' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 18, background: 'rgba(45,156,219,0.12)', color: '#2D9CDB' }}>
      <ISparkle s={24} />
    </div>
    <div style={{ marginTop: 16, fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#1A2744' }}>{title}</div>
    <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.65)', fontSize: 14 }}>
      Try another category or area filter, or check back once more listings are published.
    </p>
  </div>
);

window.FindHelpPage = FindHelpPage;

export default FindHelpPage;
