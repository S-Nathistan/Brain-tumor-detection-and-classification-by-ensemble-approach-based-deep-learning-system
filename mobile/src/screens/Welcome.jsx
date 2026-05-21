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
      overflow: 'hidden',
      position: 'relative',
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.4; }
          100% { transform: scale(1.6);  opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes bgMove {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        .welcome-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        animation: 'pulse-ring 4s ease-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        animation: 'pulse-ring 5s ease-out infinite 1s',
      }} />

      {/* Brain Icon — floating */}
      <div style={{
        width: 90, height: 90, borderRadius: 24,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        animation: 'float 3.5s ease-in-out infinite',
        position: 'relative', zIndex: 1,
      }}>
        {/* Pulse ring behind icon */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: 32,
          border: '2px solid rgba(255,255,255,0.2)',
          animation: 'pulse-ring 2.5s ease-out infinite',
        }} />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
        </svg>
      </div>

      {/* Title — fade up with delay */}
      <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative', zIndex: 1, animation: 'fadeUp 0.7s ease 0.2s both' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>
          NEUROSIGHT
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
          Your Personal<br />Care Companion
        </div>
      </div>

      {/* Tagline — fade up with more delay */}
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center',
        marginBottom: 60, maxWidth: 260, lineHeight: 1.6,
        position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.7s ease 0.4s both',
      }}>
        Stay connected with your medical team from anywhere
      </div>

      {/* Button — fade up last */}
      <button
        className="welcome-btn"
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
          position: 'relative', zIndex: 1,
          animation: 'fadeUp 0.7s ease 0.6s both',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
        GET STARTED →
      </button>

      {/* Bottom note */}
      <div style={{
        marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center',
        position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.7s ease 0.8s both',
      }}>
        NeuroSight Care · Powered by NeuroSight AI
      </div>

    </div>
  )
}
