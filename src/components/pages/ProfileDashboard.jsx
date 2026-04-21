import React from 'react';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

const emptyProfile = {
  id: null,
  display_name: '',
  slug: '',
  bio: '',
  email: '',
  phone: '',
  website: '',
  resource_id: '',
  service_categories_text: '',
  areas_covered_text: '',
  is_active: true,
};

const emptyEvent = {
  id: null,
  title: '',
  slug: '',
  event_type: 'community meetup',
  description: '',
  location: '',
  starts_at: '',
  ends_at: '',
  cta_type: 'contact',
  booking_url: '',
  contact_email: '',
  status: 'scheduled',
};

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

const ProfileDashboard = ({ onNavigate, session }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState('');

  const [profiles, setProfiles] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [claims, setClaims] = React.useState([]);

  const [activeProfileId, setActiveProfileId] = React.useState('');
  const [profileDraft, setProfileDraft] = React.useState(emptyProfile);
  const [eventDraft, setEventDraft] = React.useState(emptyEvent);

  const userEmail = `${session?.user?.email || ''}`.trim().toLowerCase();

  const loadData = React.useCallback(async () => {
    if (!session || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [byOwnerEmail, byCreatedBy, claimsResult] = await Promise.all([
        supabase.from('organisation_profiles').select('*').eq('owner_email', userEmail),
        supabase.from('organisation_profiles').select('*').eq('created_by', session.user.id),
        supabase.from('listing_claims').select('*').eq('email', userEmail).order('created_at', { ascending: false }),
      ]);

      const mergedProfiles = [...(byOwnerEmail.data || []), ...(byCreatedBy.data || [])];
      const uniqueProfiles = Array.from(new Map(mergedProfiles.map((item) => [item.id, item])).values());
      const initialProfileId = uniqueProfiles[0]?.id || '';

      let eventRows = [];
      if (uniqueProfiles.length) {
        const profileIds = uniqueProfiles.map((profile) => profile.id);
        const eventsResult = await supabase
          .from('organisation_events')
          .select('*')
          .in('organisation_profile_id', profileIds)
          .order('starts_at', { ascending: true });
        if (eventsResult.error) throw eventsResult.error;
        eventRows = eventsResult.data || [];
      }

      setProfiles(uniqueProfiles);
      setEvents(eventRows);
      setClaims(claimsResult.data || []);
      setActiveProfileId((current) => current || initialProfileId);

      const seedProfile = uniqueProfiles.find((profile) => profile.id === (activeProfileId || initialProfileId)) || uniqueProfiles[0] || null;
      if (seedProfile) {
        setProfileDraft({
          ...seedProfile,
          service_categories_text: (seedProfile.service_categories || []).join(', '),
          areas_covered_text: (seedProfile.areas_covered || []).join(', '),
        });
      } else {
        setProfileDraft({ ...emptyProfile, email: userEmail });
      }
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load profile dashboard.');
    } finally {
      setLoading(false);
    }
  }, [session, userEmail, activeProfileId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    const selected = profiles.find((profile) => profile.id === activeProfileId);
    if (!selected) return;
    setProfileDraft({
      ...selected,
      service_categories_text: (selected.service_categories || []).join(', '),
      areas_covered_text: (selected.areas_covered || []).join(', '),
    });
  }, [activeProfileId, profiles]);

  const activeEvents = React.useMemo(() => events.filter((event) => event.organisation_profile_id === activeProfileId), [events, activeProfileId]);
  const dashboardKpis = React.useMemo(() => {
    const nowIso = new Date().toISOString();
    const upcoming = events.filter((event) => event.starts_at && event.starts_at >= nowIso && (event.status || 'scheduled') === 'scheduled').length;
    const completed = events.filter((event) => (event.status || '') === 'completed').length;
    const pendingClaims = claims.filter((claim) => (claim.status || 'pending') === 'pending').length;
    const approvedClaims = claims.filter((claim) => (claim.status || '') === 'approved').length;
    return {
      profiles: profiles.length,
      events: events.length,
      upcoming,
      completed,
      pendingClaims,
      approvedClaims,
    };
  }, [profiles, events, claims]);

  const saveProfile = async () => {
    if (!supabase || !session) return;
    if (!profileDraft.display_name.trim()) {
      setError('Organisation display name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        display_name: profileDraft.display_name.trim(),
        slug: slugify(profileDraft.slug || profileDraft.display_name),
        bio: profileDraft.bio?.trim() || null,
        email: profileDraft.email?.trim() || userEmail,
        phone: profileDraft.phone?.trim() || null,
        website: profileDraft.website?.trim() || null,
        resource_id: profileDraft.resource_id || null,
        service_categories: (profileDraft.service_categories_text || '').split(',').map((item) => item.trim()).filter(Boolean),
        areas_covered: (profileDraft.areas_covered_text || '').split(',').map((item) => item.trim()).filter(Boolean),
        owner_email: userEmail,
        is_active: Boolean(profileDraft.is_active),
        updated_by: session.user.id,
      };

      const result = profileDraft.id
        ? await supabase.from('organisation_profiles').update(payload).eq('id', profileDraft.id)
        : await supabase.from('organisation_profiles').insert({ ...payload, created_by: session.user.id }).select('*').single();

      if (result.error) throw result.error;
      setToast(profileDraft.id ? 'Profile updated.' : 'Profile created.');
      if (!profileDraft.id && result.data?.id) setActiveProfileId(result.data.id);
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (!supabase || !session || !activeProfileId) return;
    if (!eventDraft.title.trim() || !eventDraft.starts_at) {
      setError('Event title and start date are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        organisation_profile_id: activeProfileId,
        title: eventDraft.title.trim(),
        slug: slugify(eventDraft.slug || eventDraft.title),
        event_type: eventDraft.event_type,
        description: eventDraft.description?.trim() || null,
        location: eventDraft.location?.trim() || null,
        starts_at: eventDraft.starts_at,
        ends_at: eventDraft.ends_at || null,
        cta_type: eventDraft.cta_type,
        booking_url: eventDraft.booking_url?.trim() || null,
        contact_email: eventDraft.contact_email?.trim() || null,
        status: eventDraft.status,
        updated_by: session.user.id,
      };

      const result = eventDraft.id
        ? await supabase.from('organisation_events').update(payload).eq('id', eventDraft.id)
        : await supabase.from('organisation_events').insert({ ...payload, created_by: session.user.id });

      if (result.error) throw result.error;
      setEventDraft(emptyEvent);
      setToast(eventDraft.id ? 'Event updated.' : 'Event created.');
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const editEvent = (eventRow) => {
    setEventDraft({
      id: eventRow.id,
      title: eventRow.title || '',
      slug: eventRow.slug || '',
      event_type: eventRow.event_type || 'community meetup',
      description: eventRow.description || '',
      location: eventRow.location || '',
      starts_at: eventRow.starts_at ? eventRow.starts_at.slice(0, 16) : '',
      ends_at: eventRow.ends_at ? eventRow.ends_at.slice(0, 16) : '',
      cta_type: eventRow.cta_type || 'contact',
      booking_url: eventRow.booking_url || '',
      contact_email: eventRow.contact_email || '',
      status: eventRow.status || 'scheduled',
    });
  };

  const deleteEvent = async (eventId) => {
    if (!supabase || !eventId) return;
    setSaving(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('organisation_events').delete().eq('id', eventId);
      if (deleteError) throw deleteError;
      setToast('Event deleted.');
      if (eventDraft.id === eventId) setEventDraft(emptyEvent);
      await loadData();
    } catch (deleteErr) {
      setError(deleteErr?.message || 'Unable to delete event.');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <>
        <Nav activePage="profile" onNavigate={onNavigate} />
        <section style={{ minHeight: '60vh', paddingTop: 54, paddingBottom: 64 }}>
          <div className="container">
            <div className="card" style={{ padding: 28, borderRadius: 20 }}>
              <h1 style={{ fontSize: 34, marginBottom: 10 }}>Sign in to access your profile dashboard</h1>
              <p style={{ color: 'rgba(26,39,68,0.7)' }}>Use your account to manage organisation profile details and live events.</p>
              <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => onNavigate('login')}>Go to login</button>
            </div>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Nav activePage="profile" onNavigate={onNavigate} />
      <section style={{ paddingTop: 40, paddingBottom: 74, background: 'linear-gradient(180deg, #EEF7FF 0%, #FAFBFF 100%)' }}>
        <div className="container" style={{ display: 'grid', gap: 18 }}>
          <div className="card" style={{ padding: 22, borderRadius: 20 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800 }}>Organisation Profile Dashboard</h1>
            <p style={{ marginTop: 8, color: 'rgba(26,39,68,0.7)' }}>Signed in as {session.user.email}. Profile ownership is linked by owner email and created profile records.</p>
            {error ? <div style={{ marginTop: 10, color: '#A03A2D', fontWeight: 600 }}>{error}</div> : null}
            {toast ? <div style={{ marginTop: 10, color: '#2D6B1F', fontWeight: 600 }}>{toast}</div> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              ['Profiles', dashboardKpis.profiles],
              ['Events', dashboardKpis.events],
              ['Upcoming', dashboardKpis.upcoming],
              ['Completed', dashboardKpis.completed],
              ['Claims pending', dashboardKpis.pendingClaims],
              ['Claims approved', dashboardKpis.approvedClaims],
            ].map(([label, value]) => (
              <div key={label} className="card" style={{ padding: 14, borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: 'rgba(26,39,68,0.6)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="card" style={{ padding: 20 }}>Loading profile data...</div>
          ) : (
            <>
              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your organisation profiles</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={activeProfileId} onChange={(event) => setActiveProfileId(event.target.value)} style={inputStyle}>
                      <option value="">Select profile</option>
                      {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.display_name}</option>)}
                    </select>
                    <button className="btn btn-ghost" onClick={() => { setActiveProfileId(''); setProfileDraft({ ...emptyProfile, email: userEmail }); }}>New profile</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 14 }}>
                  <input value={profileDraft.display_name || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, display_name: event.target.value }))} placeholder="Organisation name" style={inputStyle} />
                  <input value={profileDraft.slug || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" style={inputStyle} />
                  <input value={profileDraft.email || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))} placeholder="Contact email" style={inputStyle} />
                  <input value={profileDraft.phone || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone" style={inputStyle} />
                  <input value={profileDraft.website || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, website: event.target.value }))} placeholder="Website" style={inputStyle} />
                  <input value={profileDraft.resource_id || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, resource_id: event.target.value }))} placeholder="Linked resource id" style={inputStyle} />
                </div>
                <textarea value={profileDraft.bio || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Bio" rows={3} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <input value={profileDraft.service_categories_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, service_categories_text: event.target.value }))} placeholder="Service categories (comma-separated)" style={inputStyle} />
                  <input value={profileDraft.areas_covered_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, areas_covered_text: event.target.value }))} placeholder="Areas covered (comma-separated)" style={inputStyle} />
                </div>
                <label style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={Boolean(profileDraft.is_active)} onChange={(event) => setProfileDraft((prev) => ({ ...prev, is_active: event.target.checked }))} />
                  Active profile
                </label>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-gold" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save profile'}</button>
                </div>
              </div>

              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Events for selected profile</h2>
                {!activeProfileId ? <div style={{ marginTop: 8, color: 'rgba(26,39,68,0.65)' }}>Select or create a profile to manage events.</div> : null}
                {activeProfileId ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
                      <input value={eventDraft.title} onChange={(event) => setEventDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Event title" style={inputStyle} />
                      <input value={eventDraft.slug} onChange={(event) => setEventDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Event slug" style={inputStyle} />
                      <input value={eventDraft.event_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, event_type: event.target.value }))} placeholder="Event type" style={inputStyle} />
                      <input value={eventDraft.location} onChange={(event) => setEventDraft((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" style={inputStyle} />
                      <input type="datetime-local" value={eventDraft.starts_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, starts_at: event.target.value }))} style={inputStyle} />
                      <input type="datetime-local" value={eventDraft.ends_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, ends_at: event.target.value }))} style={inputStyle} />
                      <select value={eventDraft.cta_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, cta_type: event.target.value }))} style={inputStyle}>
                        <option value="contact">Contact</option>
                        <option value="book">Book</option>
                      </select>
                      <select value={eventDraft.status} onChange={(event) => setEventDraft((prev) => ({ ...prev, status: event.target.value }))} style={inputStyle}>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input value={eventDraft.booking_url} onChange={(event) => setEventDraft((prev) => ({ ...prev, booking_url: event.target.value }))} placeholder="Booking URL" style={inputStyle} />
                      <input value={eventDraft.contact_email} onChange={(event) => setEventDraft((prev) => ({ ...prev, contact_email: event.target.value }))} placeholder="Contact email" style={inputStyle} />
                    </div>
                    <textarea value={eventDraft.description} onChange={(event) => setEventDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <button className="btn btn-gold" disabled={saving} onClick={saveEvent}>{saving ? 'Saving...' : (eventDraft.id ? 'Update event' : 'Create event')}</button>
                      {eventDraft.id ? <button className="btn btn-ghost" onClick={() => setEventDraft(emptyEvent)}>Cancel edit</button> : null}
                    </div>

                    <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                      {activeEvents.length ? activeEvents.map((eventRow) => (
                        <div key={eventRow.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 12, background: '#FFFFFF' }}>
                          <div style={{ fontWeight: 700 }}>{eventRow.title}</div>
                          <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>{eventRow.starts_at ? new Date(eventRow.starts_at).toLocaleString('en-GB') : 'No start date'} · {eventRow.status}</div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => editEvent(eventRow)}>Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => deleteEvent(eventRow.id)}>Delete</button>
                          </div>
                        </div>
                      )) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No events for this profile yet.</div>}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="card" style={{ padding: 22, borderRadius: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your listing claims</h2>
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {claims.length ? claims.map((claim) => (
                    <div key={claim.id} style={{ border: '1px solid #E9EEF5', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{claim.listing_title || claim.org_name || 'Claim request'}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>Status: {claim.status || 'pending'}</div>
                    </div>
                  )) : <div style={{ color: 'rgba(26,39,68,0.65)' }}>No listing claims found for your email yet.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default ProfileDashboard;
