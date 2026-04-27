import React from 'react';
import Icons from './Icons.jsx';
const { BloomMark } = Icons;

const Footer = ({ onNavigate = () => {} }) => {
  const ColLink = ({ label, navKey }) => (
    <button
      onClick={() => onNavigate(navKey)}
      style={{ textAlign: 'left', color: 'rgba(255,255,255,0.60)', fontSize: 14, padding: 0, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .13s', lineHeight: 1.5 }}
      onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
    >
      {label}
    </button>
  );

  const Col = ({ title, children }) => (
    <div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 12, marginBottom: 20, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {children}
      </div>
    </div>
  );

  return (
    <footer style={{ background: '#1A2744', color: 'white', paddingTop: 68, paddingBottom: 40, marginTop: 40 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, alignItems: 'start' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <BloomMark size={36} showRing={false} />
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, color: '#FFFFFF' }}>
                inspiring carers
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13.5, maxWidth: 270, lineHeight: 1.65, margin: '0 0 22px' }}>
              Everything carers need. Smart tools for organisations. One platform, built with purpose.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['F', 'I', 'X', 'in'].map(s => (
                <div key={s} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, cursor: 'pointer', color: 'rgba(255,255,255,0.60)', transition: 'background .13s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* For carers — verified live routes only, Groups hidden until data exists */}
          <Col title="For carers">
            <ColLink label="Find help near me"   navKey="find-help" />
            <ColLink label="Benefits & offers"   navKey="benefits" />
            <ColLink label="Activities"          navKey="activities" />
            <ColLink label="Events near you"     navKey="events" />
            <ColLink label="Walks & outdoors"    navKey="walks" />
            <ColLink label="Wellbeing support"   navKey="wellbeing" />
            <ColLink label="Places to visit"     navKey="places-to-visit" />
            <ColLink label="Training"            navKey="training" />
          </Col>

          {/* For organisations — all live routes */}
          <Col title="For organisations">
            <ColLink label="Offer a discount"       navKey="offer-a-discount" />
            <ColLink label="Featured & Sponsorship" navKey="advertise" />
            <ColLink label="For businesses"         navKey="business" />
            <ColLink label="Team benefits"          navKey="business" />
            <ColLink label="Recognition"            navKey="recognition" />
          </Col>

          {/* Platform — live routes only, no placeholders */}
          <Col title="Platform">
            <ColLink label="About Inspiring Carers" navKey="business" />
            <ColLink label="Carer of the month"     navKey="recognition" />
            <ColLink label="Training hub"           navKey="training" />
            <ColLink label="Sign in"                navKey="profile" />
            <ColLink label="Create account"         navKey="profile" />
          </Col>

        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 56, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
          <div>© 2026 Inspiring Carers · Community Bloom Ltd</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>Built for carers everywhere</span>
            <span>·</span>
            <span>Free to use, always</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

window.Footer = Footer;

export default Footer;
