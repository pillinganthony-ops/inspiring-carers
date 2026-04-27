import React from 'react';
import Icons from './Icons.jsx';
const { BloomMark } = Icons;

const Footer = ({ onNavigate = () => {} }) => {
  const col = (title, items) => (
    <div>
      <div style={{
        fontFamily: 'Sora, sans-serif', fontWeight: 600,
        fontSize: 14, marginBottom: 18, color: '#1A2744',
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map(([label, key]) => (
          <button key={label} onClick={() => onNavigate(key)} style={{
            textAlign: 'left', color: 'rgba(26,39,68,0.70)',
            fontSize: 14, padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#1A2744'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(26,39,68,0.70)'}
          >{label}</button>
        ))}
      </div>
    </div>
  );

  return (
    <footer style={{
      background: '#1A2744',
      color: 'white',
      paddingTop: 72, paddingBottom: 36,
      marginTop: 40,
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BloomMark size={40} showRing={false} />
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18 }}>
                inspiring carers
              </div>
            </div>
            <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.66)', fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
              One place for carer benefits, support and local discovery. Made for the UK's carers, with love.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['F', 'I', 'X', 'in'].map(s => (
                <div key={s} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ color: 'white' }}>
            {col('For you', [
              ['Benefits & offers', 'benefits'],
              ['Team Benefits', 'card'],
              ['Rewards', 'benefits'],
              ['Recognition', 'recognition'],
              ['Carer perks', 'benefits'],
            ])}
          </div>
          <div style={{ color: 'white' }}>
            {col('For the people you support', [
              ['Find help near you', 'find-help'],
              ['Places to Visit', 'places-to-visit'],
              ['Wellbeing Support', 'wellbeing'],
              ['Groups & Social', 'groups'],
              ['Walks & outdoors', 'walks'],
              ['Advice & resources', 'find-help'],
            ])}
          </div>
          <div style={{ color: 'white' }}>
            {col('Platform', [
              ['Offer a discount', 'offer-a-discount'],
              ['About', 'about'],
              ['For businesses', 'business'],
              ['Advertise with us', 'advertise'],
              ['Training', 'training'],
              ['Carer of the month', 'recognition'],
            ])}
          </div>
          <div style={{ color: 'white' }}>
            {col('Help', [
              ['Contact us', 'about'],
              ['Support', 'about'],
              ['Accessibility', 'about'],
              ['Privacy', 'about'],
              ['Terms', 'about'],
            ])}
          </div>
        </div>

        <div style={{
          marginTop: 64, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: 'rgba(255,255,255,0.5)', fontSize: 13,
        }}>
          <div>© 2026 inspiring carers · Community Bloom</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <span>Made in Cornwall</span>
            <span>·</span>
            <span>For carers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

window.Footer = Footer;

export default Footer;
