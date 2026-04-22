import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

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
    resource_name: event.profile?.display_name || event.title || 'Event enquiry',
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

const EventsPage = ({ onNavigate }) => {
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
          supabase.from('organisation_events').select('*').in('status', ['scheduled', 'completed']).order('starts_at', { ascending: true }),
          supabase.from('organisation_profiles').select('id,resource_id,slug,display_name,verified_status,featured,is_active,email').eq('is_active', true),
          supabase.from('resources').select('id,slug,town,email,website').eq('is_archived', false),
        ]);
        if (cancelled) return;
        if (eventsResult.error) throw eventsResult.error;
        const profiles = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
        const resources = new Map((resourcesResult.data || []).map((resource) => [resource.id, resource]));
        const merged = (eventsResult.data || []).map((event) => {
          const profile = profiles.get(event.organisation_profile_id) || null;
          const resource = profile?.resource_id ? resources.get(profile.resource_id) : null;
          return {
            ...event,
            profile,
            resource,
            contact_email: event.contact_email || profile?.email || resource?.email || null,
            publicSlug: resource?.slug || profile?.slug || '',
          };
        });
        setEvents(merged);
      } catch (loadError) {
        setEvents([]);
        setError(loadError.message || 'Unable to load events right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((event) => `${event.title} ${event.location || ''} ${event.profile?.display_name || ''}`.toLowerCase().includes(needle));
  }, [events, query]);

  return (
    <>
      <Nav activePage="events" onNavigate={onNavigate} />
      <section style={{ paddingTop: 46, paddingBottom: 32, background: 'linear-gradient(180deg, #EAF5FF 0%, #FAFBFF 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(26,39,68,0.5)', fontSize: 13, marginBottom: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ color: 'inherit' }}>Home</button>
            <IChevron s={12} />
            <span style={{ color: '#1A2744', fontWeight: 600 }}>Events</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: 28, alignItems: 'end' }}>
            <div>
              <div className="eyebrow" style={{ color: '#2D9CDB' }}>Community activity</div>
              <h1 style={{ marginTop: 10, fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.03em', fontWeight: 800 }}>Events, groups, walks, and wellbeing sessions.</h1>
              <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(26,39,68,0.7)', maxWidth: 680 }}>Discover upcoming sessions from local organisations and send a booking or contact request in one step.</p>
            </div>
            <div className="card" style={{ padding: 18, borderRadius: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderRadius: 14, background: '#FAFBFF', border: '1px solid #EFF1F7' }}>
                <ISearch s={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events or organisers" style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2744' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 28, paddingBottom: 80, background: '#FAFBFF' }}>
        <div className="container">
          {loading ? (
            <div className="card" style={{ padding: 28 }}>Loading events...</div>
          ) : error ? (
            <div className="card" style={{ padding: 28 }}>{error}</div>
          ) : !filteredEvents.length ? (
            <div className="card" style={{ padding: 28 }}>No events found right now.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {filteredEvents.map((event) => (
                <div key={event.id} className="card" style={{ padding: 22, borderRadius: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                    <div>
                      <div className="eyebrow" style={{ color: '#2D9CDB' }}>{event.event_type || 'Community event'}</div>
                      <h2 style={{ marginTop: 8, fontSize: 21, fontWeight: 700 }}>{event.title}</h2>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(45,156,219,0.1)', color: '#2D9CDB', display: 'grid', placeItems: 'center' }}>
                      <IEvent s={22} />
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13.5, color: 'rgba(26,39,68,0.72)', lineHeight: 1.65 }}>{event.description || 'Hosted by a local organisation in Cornwall.'}</div>
                  <div style={{ display: 'grid', gap: 7, marginTop: 14, fontSize: 13.5, color: '#1A2744' }}>
                    <div><strong>When:</strong> {formatDateTime(event.starts_at)}</div>
                    <div><strong>Where:</strong> {event.location || 'Location shared by organiser'}</div>
                    <div><strong>By:</strong> {event.profile?.display_name || 'Community organisation'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                    <button className="btn btn-gold btn-sm" onClick={() => setActiveEvent(event)}>{event.cta_type === 'book' ? 'Book your place' : 'Contact provider'}</button>
                    {event.publicSlug ? <button className="btn btn-ghost btn-sm" onClick={() => { window.history.pushState({ page: 'find-help', slug: event.publicSlug }, '', `/find-help/${event.publicSlug}`); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo({ top: 0, behavior: 'instant' }); }}>View organisation <IArrow s={14} /></button> : null}
                  </div>
                </div>
              ))}
            </div>
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
