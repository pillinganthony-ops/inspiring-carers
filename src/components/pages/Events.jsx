import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';
import CountyCategoryNav from '../CountyCategoryNav.jsx';
import SponsorStrip from '../shared/SponsorStrip.jsx';
import CardGrid from '../shared/CardGrid.jsx';

const { IEvent, IPin, IArrow, IClose, ISearch, IChevron, IHub } = Icons;

const formatDateTime = (value) => {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const insertEventEnquiry = async ({ event, fullName, email, phone, message, spacesRequested }) => {
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
    resource_id: event.resource?.id || null,
    resource_name: event.orgName || event.profile?.display_name || event.title || 'Event enquiry',
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
      destination_email: event.contact_email || event.profile?.email || null,
    },
  });
  if (queueError) throw queueError;
};

const EventEnquiryModal = ({ event, onClose, onSuccess }) => {
  const [form, setForm] = React.useState({ fullName: '', email: '', phone: '', message: '', spacesRequested: 1 });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const updateField = (key) => (entryEvent) => setForm((prev) => ({ ...prev, [key]: entryEvent.target.value }));

  const handleSubmit = async (entryEvent) => {
    entryEvent.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please complete your name and email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await insertEventEnquiry({
        event,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        spacesRequested: form.spacesRequested,
      });

      if (event.cta_type === 'book' && event.booking_url) {
        window.open(event.booking_url, '_blank', 'noopener,noreferrer');
        onSuccess('Booking opened and enquiry added to the organiser pipeline.');
      } else {
        const destinationEmail = event.contact_email || event.profile?.email;
        if (!destinationEmail) {
          onSuccess('Enquiry added to the organiser pipeline. No direct contact email is available yet.');
        } else {
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
          onSuccess('Contact email prepared and enquiry added to the organiser pipeline.');
        }
      }
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to send your request right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 240, background: 'rgba(15,23,42,0.48)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(eventItem) => { if (eventItem.target === eventItem.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 26, borderRadius: 26, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 38, height: 38, borderRadius: 999, border: '1px solid #E8EDF8', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}>
          <IClose s={16} />
        </button>
        <div className="eyebrow" style={{ color: '#2D9CDB' }}>{event.cta_type === 'book' ? 'Book your place' : 'Contact provider'}</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{event.title}</h2>
        <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.7)', lineHeight: 1.65 }}>{event.description || 'Send a quick request to the organiser and they will be in touch.'}</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <input value={form.fullName} onChange={updateField('fullName')} placeholder="Full name" style={fieldStyle} />
          <input value={form.email} onChange={updateField('email')} placeholder="Email" type="email" style={fieldStyle} />
          <input value={form.phone} onChange={updateField('phone')} placeholder="Phone" type="tel" style={fieldStyle} />
          <input value={form.spacesRequested} onChange={updateField('spacesRequested')} placeholder="Spaces" type="number" min="1" style={fieldStyle} />
          <textarea value={form.message} onChange={updateField('message')} placeholder="Message" rows={4} style={{ ...fieldStyle, resize: 'vertical' }} />
          {error ? <div style={errorStyle}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" type="submit" disabled={busy} style={{ flex: 1 }}>{busy ? 'Sending...' : (event.cta_type === 'book' ? 'Book your place' : 'Contact provider')}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
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

const errorStyle = {
  color: '#A03A2D',
  fontSize: 13,
  fontWeight: 600,
  background: 'rgba(244,97,58,0.08)',
  border: '1px solid rgba(244,97,58,0.16)',
  borderRadius: 12,
  padding: '10px 12px',
};

const Toast = ({ message, onClose }) => {
  React.useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2600);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 260, background: '#12203D', color: 'white', borderRadius: 18, padding: '14px 18px', boxShadow: '0 20px 48px rgba(18,32,61,0.35)' }}>
      <div style={{ fontSize: 13, opacity: 0.72, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confirmed</div>
      <div style={{ marginTop: 4, fontWeight: 600 }}>{message}</div>
    </div>
  );
};

const EventsPage = ({ onNavigate, session, county }) => {
  const [events, setEvents] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [activeEvent, setActiveEvent] = React.useState(null);
  const [toast, setToast] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setLoading(false);
        setError('Events are not connected yet.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [eventsResult, profilesResult, resourcesResult] = await Promise.all([
          supabase.from('organisation_events').select('*').in('status', ['scheduled', 'completed']),
          supabase.from('organisation_profiles').select('id,resource_id,slug,organisation_name,display_name,verified_status,featured,is_active,contact_email,email').eq('is_active', true),
          supabase.from('resources').select('id,slug,town,county,email,website').eq('is_archived', false),
        ]);
        if (cancelled) return;
        if (eventsResult.error) throw eventsResult.error;
        const profiles = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
        const resources = new Map((resourcesResult.data || []).map((resource) => [resource.id, resource]));

        // No-SQL stopgap: attach inferred county from the resources chain so we can
        // filter county pages correctly.  Replace this block once organisation_events
        // has its own county column (see audit 2026-04-28).
        // Chain: event.organisation_profile_id → profiles.resource_id → resources.county
        const merged = (eventsResult.data || []).map((event) => {
          const profile = profiles.get(event.organisation_profile_id) || null;
          const resource = profile?.resource_id ? resources.get(profile.resource_id) : null;
          return {
            ...event,
            profile,
            resource,
            // Normalised to lowercase so county prop comparisons are case-insensitive.
            // Empty string '' means no county attribution (profile has no linked resource).
            resourceCounty: (resource?.county || '').toLowerCase(),
            contact_email: event.contact_email || profile?.contact_email || profile?.email || resource?.email || null,
            orgName: profile?.organisation_name || profile?.display_name || null,
            publicSlug: resource?.slug || profile?.slug || '',
          };
        });

        // County filter — applied before setEvents so opening-soon fires correctly.
        // Cornwall: include events whose resource county is 'cornwall' OR has no
        //           county attribution (unlinked profiles default to Cornwall).
        // Others:   strict match only — Devon events must not show on Cornwall page.
        const countyFiltered = county
          ? merged.filter((ev) => {
              const rc = ev.resourceCounty;
              return county === 'cornwall' ? (!rc || rc === 'cornwall') : rc === county;
            })
          : merged;

        countyFiltered.sort((a,b)=> (a.starts_at||'').localeCompare(b.starts_at||''));
        setEvents(countyFiltered);
      } catch (loadError) {
        setEvents([]);
        setError(loadError.message || 'Unable to load events right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [county]);

  const filteredEvents = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((event) => `${event.title} ${event.location || ''} ${event.profile?.display_name || ''}`.toLowerCase().includes(needle));
  }, [events, query]);

  const countyLabel = county ? county.charAt(0).toUpperCase() + county.slice(1) : '';


  return (
    <>
      <Nav activePage="events" onNavigate={onNavigate} session={session} />

      {county ? (
        /* ── County view: matches the county page system ─────────────────── */
        <>
          <CountyCategoryNav county={county} activePage="events" onNavigate={onNavigate} />

          {/* Hero — aligned with Places to Visit / Things to Do standard */}
          <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0C1A35 0%, #162C52 50%, #1A3460 100%)', paddingTop: 48, paddingBottom: 48 }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,156,219,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,201,74,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

            <div className="container" style={{ position: 'relative' }}>
              {/* Breadcrumb — Home > County > Events */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 14 }}>
                <button onClick={() => onNavigate('home', county)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Home</button>
                {countyLabel && <><IChevron s={12} /><button onClick={() => onNavigate('home', county)} style={{ color: 'rgba(255,255,255,0.60)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>{countyLabel}</button></>}
                <IChevron s={12} />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Events</span>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(45,156,219,0.15)', border: '1px solid rgba(45,156,219,0.28)', fontSize: 11, fontWeight: 800, color: '#7DD3FC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Events · {countyLabel}
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 10px', textWrap: 'balance' }}>
                Events in {countyLabel}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 520 }}>
                Upcoming workshops, community sessions and local events for carers in {countyLabel}.
              </p>

              {/* Stats row — guarded by data, matches Places to Visit pattern */}
              {!loading && events.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 14, marginTop: 4 }}>
                  {[
                    { n: events.length, l: 'Events listed' },
                  ].map(({ n, l }, i) => (
                    <div key={l} style={{ paddingRight: 18, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', fontWeight: 600, marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Search strip — below hero, matches Activities filter bar position */}
          <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F7', padding: '12px 0' }}>
            <div className="container">
              <div style={{ maxWidth: 520, display: 'flex', borderRadius: 12, overflow: 'hidden', background: '#F8FAFD', border: '1px solid #EEF1F7' }}>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 14, color: 'rgba(26,39,68,0.40)', flexShrink: 0 }}>
                  <ISearch s={15} />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events or organisers…"
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 14, background: 'transparent', color: '#1A2744', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </section>

          {/* Sponsorship strip ── */}
          <SponsorStrip type="events" countyLabel={countyLabel} onNavigate={onNavigate} />
        </>
      ) : (
        /* ── National/hub view: existing design unchanged ─────────────────── */
        <section style={{ paddingTop: 46, paddingBottom: 32, background: 'linear-gradient(180deg, #EAF5FF 0%, #FAFBFF 100%)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
              <button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Home</button>
              <IChevron s={12} />
              <button onClick={() => onNavigate('events', null)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Events</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: 28, alignItems: 'end' }}>
              <div>
                <div className="eyebrow" style={{ color: '#2D9CDB' }}>Events</div>
                <h1 style={{ marginTop: 10, fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.03em', fontWeight: 800 }}>Events and community sessions</h1>
                <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 680 }}>Discover upcoming local events, workshops, meetups and support sessions from organisations in your area.</p>
              </div>
              <div className="card" style={{ padding: 18, borderRadius: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderRadius: 14, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                  <ISearch s={18} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events or organisers" style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Events content ─────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 28, paddingBottom: 56, background: '#FAFBFF' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(26,39,68,0.45)', fontSize: 14 }}>
              Loading events…
            </div>
          ) : error ? (
            <div className="card" style={{ padding: 24, color: 'rgba(26,39,68,0.65)', fontSize: 14 }}>{error}</div>
          ) : !filteredEvents.length ? (
            county ? (
              /* County-branded empty state */
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(45,156,219,0.10)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', color: '#2D9CDB' }}>
                  <IEvent s={26} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2744', marginBottom: 8 }}>
                  No events found in {countyLabel} right now
                </div>
                <div style={{ fontSize: 14, color: 'rgba(26,39,68,0.55)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 24px' }}>
                  Events will appear here once local organisers add them. If you run events in {countyLabel}, you can list them for free.
                </div>
                <button onClick={() => onNavigate('profile')} className="btn btn-gold" style={{ fontWeight: 700, fontSize: 14, padding: '10px 22px' }}>
                  List your events
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: 28 }}>No events found right now.</div>
            )
          ) : (
            <CardGrid>
              {filteredEvents.map((event) => (
                <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 22, border: '1px solid rgba(45,156,219,0.14)', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
                  {/* Accent top strip — matches Activity/Places/Wellbeing card pattern */}
                  <div style={{ height: 4, background: 'linear-gradient(90deg, #2D9CDB, #2D9CDB88)', flexShrink: 0 }} />
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2D9CDB', marginBottom: 4 }}>{event.event_type || 'Community event'}</div>
                        <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: '#1A2744', lineHeight: 1.28 }}>{event.title}</h2>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(45,156,219,0.10)', color: '#2D9CDB', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <IEvent s={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.65)', lineHeight: 1.65 }}>{event.description || 'Hosted by a local organisation.'}</div>
                    <div style={{ display: 'grid', gap: 5, fontSize: 13, color: '#1A2744' }}>
                      <div><strong>When:</strong> {formatDateTime(event.starts_at)}</div>
                      <div><strong>Where:</strong> {event.location || 'Location shared by organiser'}</div>
                      <div><strong>By:</strong> {event.orgName || 'Community organisation'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button className="btn btn-gold btn-sm" onClick={() => setActiveEvent(event)}>{event.cta_type === 'book' ? 'Book your place' : 'Contact provider'}</button>
                      {event.publicSlug ? <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('find-help', county, event.publicSlug)}>View organisation <IArrow s={14} /></button> : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
      {activeEvent ? <EventEnquiryModal event={activeEvent} onClose={() => setActiveEvent(null)} onSuccess={(message) => { setActiveEvent(null); setToast(message); }} /> : null}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
};

export default EventsPage;
