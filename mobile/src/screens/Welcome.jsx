import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Brain Icon */}
      <div style={{
        width: 90, height: 90, borderRadius: 24,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
        </svg>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>
          NEUROSIGHT
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
          Your Personal<br />Care Companion
        </div>
      </div>

      {/* Tagline */}
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginBottom: 60, maxWidth: 260, lineHeight: 1.6 }}>
        Stay connected with your medical team from anywhere
      </div>

      {/* Button */}
      <button
        onClick={() => navigate('/language')}
        style={{
          width: '100%', maxWidth: 320,
          padding: '16px 0',
          background: '#ffffff',
          color: '#0d9488',
          border: 'none',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.02em',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
        GET STARTED →
      </button>

      {/* Bottom note */}
      <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        NeuroSight Care · Powered by NeuroSight AI
      </div>

    </div>
  )
}
