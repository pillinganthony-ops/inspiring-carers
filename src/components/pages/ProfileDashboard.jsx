import React from 'react';
import Icons from '../Icons.jsx';
import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js';

const { IHub, IArrow, IEvent, IStar, IAdvice, IClose, ICheck } = Icons;

const emptyEventDraft = {
  id: null,
  title: '',
  slug: '',
  event_type: 'community meetup',
  description: '',
  location: '',
  starts_at: '',
  ends_at: '',
  capacity: '',
  spaces_note: '',
  cta_type: 'contact',
  contact_email: '',
  contact_phone: '',
  booking_url: '',
  status: 'scheduled',
  notes: '',
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

const slugify = (value) => `${value || ''}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Not set';
const escapeCsv = (value) => `"${`${value ?? ''}`.replace(/"/g, '""')}"`;

const Toast = ({ message, onClose }) => {
  React.useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 240, background: '#12203D', color: 'white', borderRadius: 18, padding: '14px 18px', boxShadow: '0 20px 48px rgba(18,32,61,0.35)' }}>
      <div style={{ fontSize: 11.5, opacity: 0.72, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved</div>
      <div style={{ marginTop: 4, fontWeight: 600 }}>{message}</div>
    </div>
  );
};

const FeedbackModal = ({ enquiry, profileId, events, onClose, onSaved }) => {
  const [form, setForm] = React.useState({ satisfaction: 5, usefulness: 5, wouldRecommend: true, repeatInterest: true, outcomes: '', comments: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const linkedEvent = events.find((item) => item.id === enquiry.organisation_event_id);
      const { error: insertError } = await supabase.from('organisation_event_feedback').insert({
        organisation_event_id: enquiry.organisation_event_id,
        enquiry_id: enquiry.id,
        organisation_profile_id: profileId,
        satisfaction_score: Number(form.satisfaction),
        usefulness_score: Number(form.usefulness),
        would_recommend: Boolean(form.wouldRecommend),
        repeat_interest: Boolean(form.repeatInterest),
        outcomes: form.outcomes.trim() || null,
        comments: form.comments.trim() || null,
      });
      if (insertError) throw insertError;
      onSaved(`Feedback recorded for ${linkedEvent?.title || enquiry.full_name}.`);
    } catch (feedbackError) {
      setError(feedbackError.message || 'Unable to save feedback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 240, background: 'rgba(15,23,42,0.45)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(overlayEvent) => { if (overlayEvent.target === overlayEvent.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 540, padding: 26, borderRadius: 24, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, width: 36, height: 36, borderRadius: 999, border: '1px solid #E9EEF5', background: '#FAFBFF', display: 'grid', placeItems: 'center' }}><IClose s={16} /></button>
        <div className="eyebrow" style={{ color: '#2D9CDB' }}>Feedback capture</div>
        <h3 style={{ marginTop: 10, fontSize: 24, fontWeight: 800 }}>Record attendance feedback</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={form.satisfaction} onChange={(event) => setForm((prev) => ({ ...prev, satisfaction: event.target.value }))} style={fieldStyle}>{[5,4,3,2,1].map((score) => <option key={score} value={score}>Satisfaction {score}/5</option>)}</select>
            <select value={form.usefulness} onChange={(event) => setForm((prev) => ({ ...prev, usefulness: event.target.value }))} style={fieldStyle}>{[5,4,3,2,1].map((score) => <option key={score} value={score}>Usefulness {score}/5</option>)}</select>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.wouldRecommend} onChange={(event) => setForm((prev) => ({ ...prev, wouldRecommend: event.target.checked }))} /> Would recommend</label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.repeatInterest} onChange={(event) => setForm((prev) => ({ ...prev, repeatInterest: event.target.checked }))} /> Interested in attending again</label>
          </div>
          <textarea value={form.outcomes} onChange={(event) => setForm((prev) => ({ ...prev, outcomes: event.target.value }))} rows={3} placeholder="Outcomes / usefulness" style={{ ...fieldStyle, resize: 'vertical' }} />
          <textarea value={form.comments} onChange={(event) => setForm((prev) => ({ ...prev, comments: event.target.value }))} rows={3} placeholder="Comments" style={{ ...fieldStyle, resize: 'vertical' }} />
          {error ? <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(244,97,58,0.08)', color: '#A03A2D', fontSize: 13, fontWeight: 600 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" type="submit" disabled={busy} style={{ flex: 1 }}>{busy ? 'Saving...' : 'Save feedback'}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfileDashboard = ({ onNavigate, session }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [memberships, setMemberships] = React.useState([]);
  const [activeProfileId, setActiveProfileId] = React.useState('');
  const [profileDraft, setProfileDraft] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [enquiries, setEnquiries] = React.useState([]);
  const [feedback, setFeedback] = React.useState([]);
  const [eventDraft, setEventDraft] = React.useState(emptyEventDraft);
  const [feedbackTarget, setFeedbackTarget] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState('');

  const loadProfileData = React.useCallback(async () => {
    if (!session || !supabase || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userEmail = session.user.email || '';
      const [membersByUser, membersByEmail] = await Promise.all([
        supabase.from('organisation_profile_members').select('*').eq('user_id', session.user.id),
        supabase.from('organisation_profile_members').select('*').eq('owner_email', userEmail),
      ]);
      if (membersByUser.error && membersByEmail.error) throw (membersByUser.error || membersByEmail.error);
      const mergedMembers = [...(membersByUser.data || []), ...(membersByEmail.data || [])];
      const uniqueMembers = Array.from(new Map(mergedMembers.map((item) => [item.id, item])).values());
      if (!uniqueMembers.length) {
        setMemberships([]);
        setActiveProfileId('');
        setProfileDraft(null);
        setEvents([]);
        setEnquiries([]);
        setFeedback([]);
        setLoading(false);
        return;
      }
      const profileIds = uniqueMembers.map((item) => item.organisation_profile_id);
      const [profilesResult, eventsResult, enquiriesResult, feedbackResult] = await Promise.all([
        supabase.from('organisation_profiles').select('*').in('id', profileIds),
        supabase.from('organisation_events').select('*').in('organisation_profile_id', profileIds).order('starts_at', { ascending: true }),
        supabase.from('organisation_event_enquiries').select('*').in('organisation_profile_id', profileIds).order('created_at', { ascending: false }),
        supabase.from('organisation_event_feedback').select('*').in('organisation_profile_id', profileIds).order('submitted_at', { ascending: false }),
      ]);
      if (profilesResult.error) throw profilesResult.error;
      const profiles = profilesResult.data || [];
      const decoratedMemberships = uniqueMembers.map((member) => ({ ...member, profile: profiles.find((profile) => profile.id === member.organisation_profile_id) || null }));
      const firstProfileId = decoratedMemberships[0]?.organisation_profile_id || '';
      setMemberships(decoratedMemberships);
      setActiveProfileId((current) => current || firstProfileId);
      const selectedProfile = profiles.find((profile) => profile.id === (activeProfileId || firstProfileId)) || profiles[0] || null;
      setProfileDraft(selectedProfile ? {
        ...selectedProfile,
        service_categories_text: (selectedProfile.service_categories || []).join(', '),
        areas_covered_text: (selectedProfile.areas_covered || []).join(', '),
      } : null);
      setEvents(eventsResult.data || []);
      setEnquiries(enquiriesResult.data || []);
      setFeedback(feedbackResult.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load organisation profile tools yet.');
    } finally {
      setLoading(false);
    }
  }, [session, activeProfileId]);

  React.useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  React.useEffect(() => {
    const selected = memberships.find((item) => item.organisation_profile_id === activeProfileId)?.profile || null;
    if (selected) {
      setProfileDraft({
        ...selected,
        service_categories_text: (selected.service_categories || []).join(', '),
        areas_covered_text: (selected.areas_covered || []).join(', '),
      });
    }
  }, [activeProfileId, memberships]);

  const activeProfile = memberships.find((item) => item.organisation_profile_id === activeProfileId)?.profile || null;
  const activeEvents = React.useMemo(() => events.filter((event) => event.organisation_profile_id === activeProfileId), [events, activeProfileId]);
  const activeEnquiries = React.useMemo(() => enquiries.filter((enquiry) => enquiry.organisation_profile_id === activeProfileId), [enquiries, activeProfileId]);
  const activeFeedback = React.useMemo(() => feedback.filter((item) => item.organisation_profile_id === activeProfileId), [feedback, activeProfileId]);

  const kpis = React.useMemo(() => {
    const totalEvents = activeEvents.length;
    const bookings = activeEnquiries.filter((entry) => entry.cta_type === 'book').length;
    const attendance = activeEnquiries.filter((entry) => entry.attendance_status === 'attended').length;
    const noShows = activeEnquiries.filter((entry) => entry.attendance_status === 'no_show').length;
    const repeatAttendees = Math.max(0, activeEnquiries.length - new Set(activeEnquiries.map((entry) => entry.email)).size);
    const capacity = activeEvents.reduce((sum, entry) => sum + (Number(entry.capacity) || 0), 0);
    const fillRate = capacity > 0 ? Math.round((bookings / capacity) * 100) : 0;
    const enquiryConversion = activeEnquiries.length ? Math.round((bookings / activeEnquiries.length) * 100) : 0;
    const avgFeedback = activeFeedback.length ? (activeFeedback.reduce((sum, item) => sum + (Number(item.satisfaction_score) || 0), 0) / activeFeedback.length).toFixed(1) : '0.0';
    return { totalEvents, bookings, attendance, noShows, repeatAttendees, fillRate, enquiryConversion, avgFeedback };
  }, [activeEvents, activeEnquiries, activeFeedback]);

  const monthlyTrends = React.useMemo(() => {
    const buckets = new Map();
    activeEnquiries.forEach((entry) => {
      const date = new Date(entry.created_at || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = buckets.get(key) || { month: key, enquiries: 0, bookings: 0, attended: 0 };
      current.enquiries += 1;
      if (entry.cta_type === 'book') current.bookings += 1;
      if (entry.attendance_status === 'attended') current.attended += 1;
      buckets.set(key, current);
    });
    return Array.from(buckets.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [activeEnquiries]);

  const handleSaveProfile = async () => {
    if (!profileDraft || !supabase) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        display_name: profileDraft.display_name?.trim() || activeProfile?.display_name,
        bio: profileDraft.bio?.trim() || null,
        logo_url: profileDraft.logo_url?.trim() || null,
        cover_image_url: profileDraft.cover_image_url?.trim() || null,
        website: profileDraft.website?.trim() || null,
        phone: profileDraft.phone?.trim() || null,
        email: profileDraft.email?.trim() || null,
        service_categories: (profileDraft.service_categories_text || '').split(',').map((item) => item.trim()).filter(Boolean),
        areas_covered: (profileDraft.areas_covered_text || '').split(',').map((item) => item.trim()).filter(Boolean),
        updated_by: session.user.id,
      };
      const { error: saveError } = await supabase.from('organisation_profiles').update(payload).eq('id', profileDraft.id);
      if (saveError) throw saveError;
      setToast('Organisation profile updated.');
      await loadProfileData();
    } catch (saveProfileError) {
      setError(saveProfileError.message || 'Unable to save profile.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!activeProfileId || !supabase) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        organisation_profile_id: activeProfileId,
        title: eventDraft.title.trim(),
        slug: (eventDraft.slug || slugify(eventDraft.title)).trim(),
        event_type: eventDraft.event_type,
        description: eventDraft.description.trim() || null,
        location: eventDraft.location.trim() || null,
        starts_at: eventDraft.starts_at,
        ends_at: eventDraft.ends_at || null,
        capacity: eventDraft.capacity ? Number(eventDraft.capacity) : null,
        spaces_note: eventDraft.spaces_note.trim() || null,
        cta_type: eventDraft.cta_type,
        contact_email: eventDraft.contact_email.trim() || null,
        contact_phone: eventDraft.contact_phone.trim() || null,
        booking_url: eventDraft.booking_url.trim() || null,
        status: eventDraft.status,
        notes: eventDraft.notes.trim() || null,
        updated_by: session.user.id,
      };
      if (!payload.title || !payload.starts_at) throw new Error('Event title and start date are required.');
      const result = eventDraft.id
        ? await supabase.from('organisation_events').update(payload).eq('id', eventDraft.id)
        : await supabase.from('organisation_events').insert({ ...payload, created_by: session.user.id });
      if (result.error) throw result.error;
      setEventDraft(emptyEventDraft);
      setToast(eventDraft.id ? 'Event updated.' : 'Event created.');
      await loadProfileData();
    } catch (saveEventError) {
      setError(saveEventError.message || 'Unable to save event.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateEnquiry = async (enquiryId, updates) => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { error: updateError } = await supabase.from('organisation_event_enquiries').update(updates).eq('id', enquiryId);
      if (updateError) throw updateError;
      setToast('Enquiry updated.');
      await loadProfileData();
    } catch (updateEnquiryError) {
      setError(updateEnquiryError.message || 'Unable to update enquiry.');
    } finally {
      setBusy(false);
    }
  };

  const handleExportContacts = () => {
    const rows = activeEnquiries.map((entry) => [entry.full_name, entry.email, entry.phone || '', entry.status, entry.attendance_status].join(','));
    const csv = ['Full name,Email,Phone,Status,Attendance', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(activeProfile?.display_name || 'organisation')}-contacts.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReportingCsv = () => {
    const profileName = activeProfile?.display_name || 'Organisation';
    const summaryRows = [
      ['Organisation', profileName],
      ['Events', kpis.totalEvents],
      ['Bookings', kpis.bookings],
      ['Attendance', kpis.attendance],
      ['No-shows', kpis.noShows],
      ['Repeat attendees', kpis.repeatAttendees],
      ['Fill rate', `${kpis.fillRate}%`],
      ['Enquiry conversion', `${kpis.enquiryConversion}%`],
      ['Average satisfaction', kpis.avgFeedback],
    ].map((row) => row.map(escapeCsv).join(','));
    const trendRows = monthlyTrends.map((item) => [item.month, item.enquiries, item.bookings, item.attended].map(escapeCsv).join(','));
    const feedbackRows = activeFeedback.map((item) => [
      formatDate(item.submitted_at),
      item.satisfaction_score,
      item.usefulness_score,
      item.would_recommend ? 'Yes' : 'No',
      item.repeat_interest ? 'Yes' : 'No',
      item.outcomes || '',
      item.comments || '',
    ].map(escapeCsv).join(','));
    const csv = [
      'Summary metric,Value',
      ...summaryRows,
      '',
      'Month,Enquiries,Bookings,Attended',
      ...trendRows,
      '',
      'Submitted,Satisfaction,Usefulness,Would recommend,Repeat interest,Outcomes,Comments',
      ...feedbackRows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(profileName)}-impact-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast('Impact report CSV exported.');
  };

  const handleExportReportPdf = () => {
    const reportWindow = window.open('', '_blank', 'width=980,height=720');
    if (!reportWindow) {
      setError('Allow pop-ups to export the PDF report.');
      return;
    }
    const profileName = activeProfile?.display_name || 'Organisation';
    const trendMarkup = monthlyTrends.length
      ? monthlyTrends.map((item) => `<tr><td>${item.month}</td><td>${item.enquiries}</td><td>${item.bookings}</td><td>${item.attended}</td></tr>`).join('')
      : '<tr><td colspan="4">No monthly trend data yet.</td></tr>';
    const feedbackMarkup = activeFeedback.length
      ? activeFeedback.map((item) => `<tr><td>${formatDate(item.submitted_at)}</td><td>${item.satisfaction_score}/5</td><td>${item.usefulness_score}/5</td><td>${item.comments || item.outcomes || 'No comment recorded'}</td></tr>`).join('')
      : '<tr><td colspan="4">No feedback recorded yet.</td></tr>';
    reportWindow.document.write(`<!doctype html><html><head><title>${profileName} impact report</title><style>
      body { font-family: Georgia, "Times New Roman", serif; padding: 32px; color: #1A2744; }
      h1 { margin: 0 0 8px; font-size: 30px; }
      h2 { margin: 26px 0 10px; font-size: 18px; }
      p { line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #D9E2F1; padding: 10px; text-align: left; font-size: 13px; vertical-align: top; }
      th { background: #F2F8FF; }
      .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
      .metric { border: 1px solid #D9E2F1; border-radius: 14px; padding: 14px; }
      .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #5A6782; }
      .metric-value { font-size: 24px; font-weight: 700; margin-top: 8px; }
    </style></head><body>
      <h1>${profileName} impact report</h1>
      <p>Generated ${formatDate(new Date().toISOString())}. This report summarises recent event delivery, conversion, attendance, and participant feedback for commissioner and partnership reporting.</p>
      <div class="summary">
        <div class="metric"><div class="metric-label">Events</div><div class="metric-value">${kpis.totalEvents}</div></div>
        <div class="metric"><div class="metric-label">Bookings</div><div class="metric-value">${kpis.bookings}</div></div>
        <div class="metric"><div class="metric-label">Attendance</div><div class="metric-value">${kpis.attendance}</div></div>
        <div class="metric"><div class="metric-label">No-shows</div><div class="metric-value">${kpis.noShows}</div></div>
        <div class="metric"><div class="metric-label">Fill rate</div><div class="metric-value">${kpis.fillRate}%</div></div>
        <div class="metric"><div class="metric-label">Average satisfaction</div><div class="metric-value">${kpis.avgFeedback}</div></div>
      </div>
      <h2>Commissioner summary</h2>
      <p>${profileName} delivered ${kpis.totalEvents} events, generated ${kpis.bookings} bookings, recorded ${kpis.attendance} attendances, and achieved an average satisfaction score of ${kpis.avgFeedback}. Current enquiry conversion is ${kpis.enquiryConversion}% with a fill rate of ${kpis.fillRate}%.</p>
      <h2>Monthly trend</h2>
      <table><thead><tr><th>Month</th><th>Enquiries</th><th>Bookings</th><th>Attended</th></tr></thead><tbody>${trendMarkup}</tbody></table>
      <h2>Feedback log</h2>
      <table><thead><tr><th>Submitted</th><th>Satisfaction</th><th>Usefulness</th><th>Comment</th></tr></thead><tbody>${feedbackMarkup}</tbody></table>
    </body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    setToast('PDF report opened for print/export.');
  };

  if (!session) {
    return (
      <>
        <Nav activePage="profile" onNavigate={onNavigate} />
        <section style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', background: '#FAFBFF' }}>
          <div className="card" style={{ padding: 28, borderRadius: 24, maxWidth: 540, textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: '#2D9CDB' }}>Profile access</div>
            <h1 style={{ marginTop: 10, fontSize: 34, fontWeight: 800 }}>Sign in to manage your organisation profile</h1>
            <p style={{ marginTop: 12, color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>Use the email connected to your approved claim to manage events, enquiries, and reporting.</p>
            <button className="btn btn-gold" style={{ marginTop: 18 }} onClick={() => onNavigate('login')}>Go to sign in <IArrow s={16} /></button>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Nav activePage="profile" onNavigate={onNavigate} />
      <section style={{ paddingTop: 40, paddingBottom: 34, background: 'linear-gradient(180deg, #F2F8FF 0%, #FAFBFF 100%)' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#2D9CDB' }}>Profile owner dashboard</div>
          <h1 style={{ marginTop: 10, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Manage your organisation profile, events, and impact data.</h1>
          <p style={{ marginTop: 12, maxWidth: 720, color: 'rgba(26,39,68,0.72)', lineHeight: 1.7 }}>Keep your public listing accurate, create events, respond to bookings, track attendance, and prepare evidence for commissioners.</p>
        </div>
      </section>

      <section style={{ paddingTop: 28, paddingBottom: 80, background: '#FAFBFF' }}>
        <div className="container">
          {loading ? <div className="card" style={{ padding: 24 }}>Loading your profile tools...</div> : null}
          {error ? <div className="card" style={{ padding: 18, borderColor: 'rgba(244,97,58,0.2)', marginBottom: 16 }}>{error}</div> : null}
          {!loading && !memberships.length ? (
            <div className="card" style={{ padding: 24, borderRadius: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>No active organisation profile access yet</div>
              <p style={{ marginTop: 10, color: 'rgba(26,39,68,0.7)', lineHeight: 1.7 }}>Once your claim is approved, your organisation profile will appear here and you can manage events, enquiries, and reports.</p>
            </div>
          ) : null}

          {memberships.length ? (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                {memberships.map((membership) => (
                  <button key={membership.id} onClick={() => setActiveProfileId(membership.organisation_profile_id)} style={{ padding: '10px 16px', borderRadius: 999, border: `1px solid ${activeProfileId === membership.organisation_profile_id ? '#1A2744' : '#EFF1F7'}`, background: activeProfileId === membership.organisation_profile_id ? '#1A2744' : 'white', color: activeProfileId === membership.organisation_profile_id ? 'white' : '#1A2744', fontWeight: 700, fontSize: 13.5 }}>{membership.profile?.display_name || membership.owner_email}</button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 }}>
                <KpiCard label="Events" value={kpis.totalEvents} tone="sky" icon={<IEvent s={20} />} />
                <KpiCard label="Bookings" value={kpis.bookings} tone="gold" icon={<IStar s={20} />} />
                <KpiCard label="Attendance" value={kpis.attendance} tone="lime" icon={<ICheck s={20} />} />
                <KpiCard label="No-shows" value={kpis.noShows} tone="coral" icon={<IClose s={20} />} />
                <KpiCard label="Fill rate" value={`${kpis.fillRate}%`} tone="navy" icon={<IHub s={20} />} />
                <KpiCard label="Feedback" value={kpis.avgFeedback} tone="sky" icon={<IAdvice s={20} />} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 0.9fr)', gap: 20, alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#2D9CDB' }}>Organisation profile</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Public profile details</div>
                    {profileDraft ? (
                      <div style={{ display: 'grid', gap: 12 }}>
                        <input value={profileDraft.display_name || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, display_name: event.target.value }))} placeholder="Organisation name" style={fieldStyle} />
                        <textarea value={profileDraft.bio || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Organisation bio" rows={5} style={{ ...fieldStyle, resize: 'vertical' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <input value={profileDraft.logo_url || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, logo_url: event.target.value }))} placeholder="Logo URL" style={fieldStyle} />
                          <input value={profileDraft.cover_image_url || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, cover_image_url: event.target.value }))} placeholder="Cover image URL" style={fieldStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                          <input value={profileDraft.website || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, website: event.target.value }))} placeholder="Website" style={fieldStyle} />
                          <input value={profileDraft.phone || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone" style={fieldStyle} />
                          <input value={profileDraft.email || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" style={fieldStyle} />
                        </div>
                        <input value={profileDraft.service_categories_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, service_categories_text: event.target.value }))} placeholder="Service categories (comma separated)" style={fieldStyle} />
                        <input value={profileDraft.areas_covered_text || ''} onChange={(event) => setProfileDraft((prev) => ({ ...prev, areas_covered_text: event.target.value }))} placeholder="Areas covered (comma separated)" style={fieldStyle} />
                        <button className="btn btn-gold" onClick={handleSaveProfile} disabled={busy}>Save profile</button>
                      </div>
                    ) : null}
                  </div>

                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#5BC94A' }}>Event manager</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 16 }}>Create or edit events</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <input value={eventDraft.title} onChange={(event) => setEventDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Event title" style={fieldStyle} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input value={eventDraft.slug} onChange={(event) => setEventDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Event slug" style={fieldStyle} />
                        <input value={eventDraft.event_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, event_type: event.target.value }))} placeholder="Event type" style={fieldStyle} />
                      </div>
                      <textarea value={eventDraft.description} onChange={(event) => setEventDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Short description" rows={4} style={{ ...fieldStyle, resize: 'vertical' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <input value={eventDraft.location} onChange={(event) => setEventDraft((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" style={fieldStyle} />
                        <input value={eventDraft.starts_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, starts_at: event.target.value }))} type="datetime-local" style={fieldStyle} />
                        <input value={eventDraft.ends_at} onChange={(event) => setEventDraft((prev) => ({ ...prev, ends_at: event.target.value }))} type="datetime-local" style={fieldStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <input value={eventDraft.capacity} onChange={(event) => setEventDraft((prev) => ({ ...prev, capacity: event.target.value }))} placeholder="Capacity" type="number" style={fieldStyle} />
                        <select value={eventDraft.cta_type} onChange={(event) => setEventDraft((prev) => ({ ...prev, cta_type: event.target.value }))} style={fieldStyle}><option value="contact">Contact Provider</option><option value="book">Book Your Place</option></select>
                        <select value={eventDraft.status} onChange={(event) => setEventDraft((prev) => ({ ...prev, status: event.target.value }))} style={fieldStyle}><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <input value={eventDraft.contact_email} onChange={(event) => setEventDraft((prev) => ({ ...prev, contact_email: event.target.value }))} placeholder="Contact email" style={fieldStyle} />
                        <input value={eventDraft.contact_phone} onChange={(event) => setEventDraft((prev) => ({ ...prev, contact_phone: event.target.value }))} placeholder="Contact phone" style={fieldStyle} />
                        <input value={eventDraft.booking_url} onChange={(event) => setEventDraft((prev) => ({ ...prev, booking_url: event.target.value }))} placeholder="Booking URL" style={fieldStyle} />
                      </div>
                      <textarea value={eventDraft.notes} onChange={(event) => setEventDraft((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Internal event notes" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-gold" onClick={handleSaveEvent} disabled={busy}>{eventDraft.id ? 'Update event' : 'Create event'}</button>
                        {eventDraft.id ? <button className="btn btn-ghost" onClick={() => setEventDraft(emptyEventDraft)}>Cancel edit</button> : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#F5A623' }}>Live events</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Upcoming and archived events</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {activeEvents.map((event) => (
                        <button key={event.id} onClick={() => setEventDraft({ ...event, capacity: event.capacity || '', starts_at: event.starts_at ? event.starts_at.slice(0, 16) : '', ends_at: event.ends_at ? event.ends_at.slice(0, 16) : '' })} style={{ textAlign: 'left', borderRadius: 16, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                          <div style={{ fontWeight: 700 }}>{event.title}</div>
                          <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{formatDate(event.starts_at)} · {event.status}</div>
                        </button>
                      ))}
                      {!activeEvents.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No events yet for this profile.</div> : null}
                    </div>
                  </div>

                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#7B5CF5' }}>Bookings & enquiries</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Respond and mark attendance</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {activeEnquiries.map((entry) => (
                        <div key={entry.id} style={{ borderRadius: 16, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                          <div style={{ fontWeight: 700 }}>{entry.full_name}</div>
                          <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>{entry.email} · {entry.cta_type}</div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateEnquiry(entry.id, { status: 'confirmed' })}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateEnquiry(entry.id, { attendance_status: 'attended' })}>Attended</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateEnquiry(entry.id, { attendance_status: 'no_show' })}>No-show</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setFeedbackTarget(entry)}>Capture feedback</button>
                          </div>
                        </div>
                      ))}
                      {!activeEnquiries.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No event bookings or enquiries yet.</div> : null}
                    </div>
                    <button className="btn btn-sky btn-sm" style={{ marginTop: 14 }} onClick={handleExportContacts}>Export contacts</button>
                  </div>

                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#2D9CDB' }}>Commissioner summary</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Reporting-ready snapshot</div>
                    <div style={{ color: 'rgba(26,39,68,0.74)', lineHeight: 1.7, fontSize: 14 }}>
                      {activeProfile?.display_name || 'This organisation'} delivered <strong>{kpis.totalEvents}</strong> events, generated <strong>{kpis.bookings}</strong> bookings, recorded <strong>{kpis.attendance}</strong> attendances, and achieved an average satisfaction score of <strong>{kpis.avgFeedback}</strong>. Current enquiry conversion is <strong>{kpis.enquiryConversion}%</strong> with a fill rate of <strong>{kpis.fillRate}%</strong>.
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                      <button className="btn btn-sky btn-sm" onClick={handleExportReportingCsv}>Export CSV report</button>
                      <button className="btn btn-ghost btn-sm" onClick={handleExportReportPdf}>Export PDF report</button>
                    </div>
                    <div style={{ marginTop: 14, fontSize: 12.5, color: 'rgba(26,39,68,0.58)' }}>Use this block for funding bids, commissioner updates, and partnership evidence packs.</div>
                  </div>

                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#5BC94A' }}>Monthly trends</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Recent engagement trend</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {monthlyTrends.map((item) => (
                        <div key={item.month} style={{ display: 'grid', gridTemplateColumns: '100px repeat(3, 1fr)', gap: 10, fontSize: 13.5, color: '#1A2744', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{item.month}</div>
                          <div>Enquiries {item.enquiries}</div>
                          <div>Bookings {item.bookings}</div>
                          <div>Attended {item.attended}</div>
                        </div>
                      ))}
                      {!monthlyTrends.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>Monthly trend data will appear as enquiries are captured.</div> : null}
                    </div>
                  </div>

                  <div className="card" style={{ padding: 22, borderRadius: 24 }}>
                    <div className="eyebrow" style={{ color: '#F5A623' }}>Feedback records</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 12 }}>Participant feedback log</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {activeFeedback.map((item) => (
                        <div key={item.id} style={{ borderRadius: 16, border: '1px solid #EFF1F7', padding: 14, background: '#FAFBFF' }}>
                          <div style={{ fontWeight: 700 }}>Satisfaction {item.satisfaction_score}/5 · Usefulness {item.usefulness_score}/5</div>
                          <div style={{ marginTop: 4, fontSize: 12.5, color: 'rgba(26,39,68,0.62)' }}>Submitted {formatDate(item.submitted_at)}</div>
                          {item.comments ? <div style={{ marginTop: 8, fontSize: 13.5, color: 'rgba(26,39,68,0.74)', lineHeight: 1.6 }}>{item.comments}</div> : null}
                        </div>
                      ))}
                      {!activeFeedback.length ? <div style={{ color: 'rgba(26,39,68,0.68)' }}>No feedback recorded yet.</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
      {feedbackTarget ? <FeedbackModal enquiry={feedbackTarget} profileId={activeProfileId} events={events} onClose={() => setFeedbackTarget(null)} onSaved={(message) => { setFeedbackTarget(null); setToast(message); loadProfileData(); }} /> : null}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
};

const KpiCard = ({ label, value, tone, icon }) => (
  <div className="card" style={{ padding: 18, borderRadius: 22 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.52)' }}>{label}</div>
        <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{value}</div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center', background: tone === 'gold' ? 'rgba(245,166,35,0.14)' : tone === 'lime' ? 'rgba(91,201,74,0.14)' : tone === 'coral' ? 'rgba(244,97,58,0.14)' : tone === 'navy' ? 'rgba(26,39,68,0.08)' : 'rgba(45,156,219,0.14)', color: tone === 'gold' ? '#F5A623' : tone === 'lime' ? '#5BC94A' : tone === 'coral' ? '#F4613A' : tone === 'navy' ? '#1A2744' : '#2D9CDB' }}>
        {icon}
      </div>
    </div>
  </div>
);

export default ProfileDashboard;
