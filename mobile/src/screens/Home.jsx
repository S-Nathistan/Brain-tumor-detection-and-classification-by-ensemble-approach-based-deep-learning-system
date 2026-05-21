import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('home.morning')
  if (h < 17) return t('home.afternoon')
  return t('home.evening')
}

function tumourColor(type) {
  if (!type || type === 'Not Classified') return { bg: '#f1f5f9', text: '#475569' }
  if (type === 'No Tumour')              return { bg: '#d1fae5', text: '#065f46' }
  return { bg: '#fef2f2', text: '#b91c1c' }
}

export default function Home() {
  const navigate  = useNavigate()
  const { t }    = useTranslation()
  const patient   = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const caretaker = JSON.parse(localStorage.getItem('mobile_caretaker') || '{}')
  const role      = localStorage.getItem('mobile_role') || 'patient'
  const isCaretaker = role === 'caretaker'
  const tc       = tumourColor(patient.tumour_type)

  function signOut() {
    localStorage.removeItem('mobile_token')
    localStorage.removeItem('mobile_patient')
    localStorage.removeItem('mobile_role')
    localStorage.removeItem('mobile_caretaker')
    navigate('/login')
  }

  const actions = [
    { key: 'report',    icon: ReportIcon,    route: '/report',    color: '#eff6ff', iconColor: '#1d4ed8', border: '#dbeafe' },
    { key: 'checkin',   icon: CheckinIcon,   route: '/checkin',   color: '#f0fdf4', iconColor: '#16a34a', border: '#bbf7d0' },
    { key: 'chat',      icon: ChatIcon,      route: '/chat',      color: '#fdf4ff', iconColor: '#9333ea', border: '#f3e8ff' },
    { key: 'emergency', icon: EmergencyIcon, route: '/emergency', color: '#fff1f2', iconColor: '#e11d48', border: '#fecdd3' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .action-card:active { transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        padding: '48px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-20, left:-20, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        {/* Top row: greeting + sign out */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>{getGreeting(t)}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>
              {isCaretaker ? (caretaker.name || '—') : (patient.name || '—')}
            </div>
            {isCaretaker && (
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', marginTop:4 }}>
                {t('home.caretakerViewing')} <span style={{ fontWeight:700 }}>{patient.name || '—'}</span>
              </div>
            )}
          </div>
          <button onClick={signOut} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, color:'rgba(255,255,255,0.85)', padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {t('home.signOut')}
          </button>
        </div>

        {/* Patient info pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', animation:'fadeUp 0.4s ease 0.1s both' }}>
          <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#fff', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ opacity:0.7 }}>{t('home.hospitalId')}:</span>
            <span style={{ fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{patient.hospital_id || '—'}</span>
          </div>
          <div style={{ background: tc.bg, borderRadius:20, padding:'5px 12px', fontSize:12, color: tc.text, fontWeight:700 }}>
            {patient.tumour_type || t('home.notClassified')}
          </div>
          {patient.risk_score && patient.risk_score !== '0%' && (
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#fff', fontWeight:700 }}>
              {t('home.riskScore')}: {patient.risk_score}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, padding:'24px 20px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Quick actions */}
        <div style={{ animation:'fadeUp 0.4s ease 0.2s both' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8', marginBottom:12 }}>
            {t('home.quickActions')}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {actions.map(({ key, icon: Icon, route, color, iconColor, border }) => (
              <button
                key={key}
                className="action-card"
                onClick={() => navigate(route)}
                style={{
                  background: color, border: `1px solid ${border}`,
                  borderRadius:16, padding:'18px 16px',
                  display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10,
                  cursor:'pointer', textAlign:'left',
                  transition:'transform 0.15s ease',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
                  <Icon color={iconColor} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:2 }}>{t(`home.${key}`)}</div>
                  <div style={{ fontSize:11, color:'#64748b', lineHeight:1.4 }}>{t(`home.${key}Sub`)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Doctor card */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, animation:'fadeUp 0.4s ease 0.3s both', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:3 }}>{t('home.yourDoctor')}</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{patient.assigned_doctor || t('home.noDoctor')}</div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── inline SVG icons ──────────────────────────────────────────────────────────

function ReportIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function CheckinIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function ChatIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function EmergencyIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
