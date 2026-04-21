import React from 'react';
import Icons from './Icons.jsx';

const { IShield, IAlert, ICheck, IDownload, IClose } = Icons;

/**
 * Mandatory Disclaimer Component
 * Displayed whenever risk assessments are viewed or downloaded
 */
export const RiskAssessmentDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div style={{ 
        fontSize: 11, 
        color: 'rgba(26,39,68,0.7)', 
        fontStyle: 'italic',
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(160,58,45,0.06)',
        border: '1px solid rgba(160,58,45,0.12)',
        lineHeight: 1.5,
      }}>
        Risk assessments are community resources intended as a helpful guide only. Conditions and hazards change. You must undertake your own dynamic risk assessment before use.
      </div>
    );
  }

  return (
    <div style={{
      padding: 20,
      borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(160,58,45,0.06) 0%, rgba(244,97,58,0.04) 100%)',
      border: '1px solid rgba(244,97,58,0.2)',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ marginTop: 2, color: '#A03A2D', flexShrink: 0 }}>
          <IAlert s={18} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#A03A2D', fontSize: 14, marginBottom: 8 }}>
            Important: Risk Assessment Disclaimer
          </div>
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.75)', lineHeight: 1.75 }}>
            Risk assessments on this platform are pooled community and professional resources intended as a helpful guide only. Environmental conditions, hazards and site access can change at any time without notice.
            <br />
            <br />
            <strong>Inspiring Carers accepts no responsibility for omissions, inaccuracies, or risks not highlighted.</strong>
            <br />
            <br />
            Users, professionals and organisations must undertake their own comprehensive dynamic risk assessment before use. Always verify current conditions before activities.
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Risk Assessment Summary Display
 * Shows key hazards and accessibility notes for a walk
 */
export const WalkRiskSummary = ({ assessment, walk }) => {
  if (!assessment) {
    return (
      <div style={{
        padding: 16,
        borderRadius: 14,
        background: 'rgba(91,201,74,0.06)',
        border: '1px dashed rgba(91,201,74,0.2)',
        color: 'rgba(26,39,68,0.65)',
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ marginTop: 2, flexShrink: 0}}>
            <ICheck s={16} />
          </div>
          <div>
            <strong>No specific risk assessment published yet.</strong> Community members and professionals are welcome to <strong>submit one</strong> to help support this route.
          </div>
        </div>
      </div>
    );
  }

  const hazards = Array.isArray(assessment.hazards_json) ? assessment.hazards_json : [];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Key Hazards */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1A2744', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Known Hazards
        </div>
        {hazards.length > 0 ? (
          <div style={{ display: 'grid', gap: 6 }}>
            {hazards.map((hazard, i) => (
              <div key={i} style={{
                fontSize: 13,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(244,97,58,0.08)',
                border: '1px solid rgba(244,97,58,0.15)',
                color: 'rgba(26,39,68,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: 999, background: '#F4613A', flexShrink: 0 }} />
                {typeof hazard === 'string' ? hazard : (hazard?.name || 'Hazard')}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(26,39,68,0.65)' }}>No specific hazards documented. See accessibility notes below.</div>
        )}
      </div>

      {/* Accessibility Notes */}
      {assessment.accessibility_notes && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1A2744', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Accessibility
          </div>
          <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.8)', lineHeight: 1.7 }}>{assessment.accessibility_notes}</p>
        </div>
      )}

      {/* Weather Notes */}
      {assessment.weather_notes && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1A2744', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Weather Exposure
          </div>
          <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.8)', lineHeight: 1.7 }}>{assessment.weather_notes}</p>
        </div>
      )}

      {/* Emergency Notes */}
      {assessment.emergency_notes && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1A2744', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Emergency Access
          </div>
          <p style={{ fontSize: 13, color: 'rgba(26,39,68,0.8)', lineHeight: 1.7 }}>{assessment.emergency_notes}</p>
        </div>
      )}

      {/* Last Verified */}
      <div style={{
        fontSize: 12, 
        color: 'rgba(26,39,68,0.6)', 
        paddingTop: 10, 
        borderTop: '1px solid rgba(26,39,68,0.1)',
      }}>
        Last verified: <strong>{new Date(assessment.last_verified_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
      </div>
    </div>
  );
};

/**
 * Submit Risk Update Modal
 * Allows professionals to submit risk assessment updates
 */
export const SubmitRiskUpdateModal = ({ walk, onClose, supabase, onSuccess }) => {
  const [form, setForm] = React.useState({
    updateType: 'hazard_update',
    description: '',
    submittedBy: '',
    email: '', 
    phone: '',
    organisation: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.email.trim() || !form.submittedBy.trim()) {
      setError('Please fill in description, email, and name.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      if (!supabase) throw new Error('Database not available');

      const { error: dbError } = await supabase.from('walk_risk_updates').insert({
        walk_id: walk.id,
        walk_name: walk.name,
        update_type: form.updateType,
        description: form.description,
        submitted_by: form.submittedBy,
        submitted_email: form.email,
        submitted_phone: form.phone || null,
        organisation: form.organisation || null,
        status: 'pending',
      });

      if (dbError) throw dbError;

      setSuccess('Thank you! Your update has been submitted for review.');
      setForm({ updateType: 'hazard_update', description: '', submittedBy: '', email: '', phone: '', organisation: '' });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.5)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 28, padding: 32, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,23,42,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: 20, top: 20, width: 36, height: 36, borderRadius: 999, border: '1px solid #EFF1F7', background: '#FAFBFF', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <IClose s={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(123,92,245,0.12)', display: 'grid', placeItems: 'center', color: '#7B5CF5' }}>
            <IShield s={18} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,39,68,0.5)' }}>Submit Update</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A2744', marginTop: 2 }}>Risk Assessment Update</div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: 'rgba(26,39,68,0.7)', lineHeight: 1.65, marginBottom: 20 }}>
          Help improve safety for this walk by submitting new hazard information, accessibility updates, or other risk-related changes.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Update Type *</label>
            <select value={form.updateType} onChange={(e) => setForm(p => ({ ...p, updateType: e.target.value }))} style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }}>
              <option value="hazard_update">New Hazard Identified</option>
              <option value="accessibility_note">Accessibility Information</option>
              <option value="weather_warning">Weather/Seasonal Info</option>
              <option value="general_update">General Update</option>
              <option value="new_assessment">Complete Assessment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Description *</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the change or update" rows={5} style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF', fontFamily: 'Inter, sans-serif', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Your Name *</label>
            <input type="text" value={form.submittedBy} onChange={(e) => setForm(p => ({ ...p, submittedBy: e.target.value }))} placeholder="Full name" style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(optional)" style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(26,39,68,0.55)', display: 'block', marginBottom: 5 }}>Organisation</label>
              <input type="text" value={form.organisation} onChange={(e) => setForm(p => ({ ...p, organisation: e.target.value }))} placeholder="(optional)" style={{ width: '100%', borderRadius: 12, border: '1px solid #E9EEF5', padding: '12px 14px', fontSize: 14, background: '#FAFBFF' }} />
            </div>
          </div>

          {error && <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(160,58,45,0.1)', color: '#A03A2D', fontSize: 13 }}>{error}</div>}
          {success && <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(91,201,74,0.1)', color: '#2D7B4A', fontSize: 13 }}>{success}</div>}

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button type="submit" className="btn btn-sky btn-sm" disabled={busy} style={{ flex: 1 }}>{busy ? 'Submitting...' : 'Submit Update'}</button>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" disabled={busy}>Cancel</button>
          </div>
        </form>

        <RiskAssessmentDisclaimer compact />
      </div>
    </div>
  );
};

/**
 * Download Risk Assessment PDF Mock
 * In production, this would generate a PDF
 */
export const downloadRiskAssessmentPDF = (assessment, walk) => {
  // Generate a text version that can be exported
  const content = [
    `RISK ASSESSMENT: ${walk.name}`,
    `Area: ${walk.area}`,
    `Assessment Date: ${new Date(assessment.last_verified_date).toLocaleDateString()}`,
    '',
    'KNOWN HAZARDS:',
    (Array.isArray(assessment.hazards_json) ? assessment.hazards_json : []).map(h => `• ${typeof h === 'string' ? h : h.name}`).join('\n') || '• None specifically documented',
    '',
    'ACCESSIBILITY:',
    assessment.accessibility_notes || 'See main walk page for accessibility details',
    '',
    'WEATHER & EXPOSURE:',
    assessment.weather_notes || 'Check current conditions before visiting',
    '',
    'EMERGENCY ACCESS:',
    assessment.emergency_notes || 'Emergency services access available',
    '',
    'DISCLAIMER:',
    'Risk assessments are community resources for guidance only. Conditions change. Users must undertake their own risk assessment before use.',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${walk.name.replace(/\s+/g, '-')}-risk-assessment.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default { RiskAssessmentDisclaimer, WalkRiskSummary, SubmitRiskUpdateModal, downloadRiskAssessmentPDF };
