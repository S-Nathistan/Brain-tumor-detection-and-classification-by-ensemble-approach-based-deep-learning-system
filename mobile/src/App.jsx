import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { api } from './api'
import BottomNav  from './screens/BottomNav'
import BackButton from './screens/BackButton'

const hideScrollbar = `
  .phone-content::-webkit-scrollbar { display: none; }
`
import Welcome from './screens/Welcome'
import LanguageSelect from './screens/LanguageSelect'
import Login from './screens/Login'
import Home from './screens/Home'
import Setup from './screens/Setup'
import CheckIn from './screens/CheckIn'
import Result from './screens/Result'
import Chat from './screens/Chat'
import Report from './screens/Report'
import Education from './screens/Education'
import Emergency from './screens/Emergency'
import ReportSymptom from './screens/ReportSymptom'
import MedicationReminder from './screens/MedicationReminder'
import ReminderBanner from './screens/ReminderBanner'

/* Routes that show the bottom navigation bar */
const NAV_ROUTES = new Set(['/home', '/checkin', '/chat', '/education', '/report'])

/* Redirect already-logged-in users away from auth screens — only on device, not localhost demo */
function AuthRedirect({ element }) {
  if (localStorage.getItem('mobile_token') && window.location.hostname !== 'localhost') {
    return <Navigate to="/home" replace />
  }
  return element
}

function ComingSoon({ title }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', padding:'36px 20px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <BackButton variant="glass" to="/home" />
        <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'14px 0 0' }}>{title}</h1>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:32 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:'#f0fdfa', border:'2px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:0 }}>Coming Soon</p>
        <p style={{ fontSize:13, color:'#64748b', margin:0, textAlign:'center', lineHeight:1.6 }}>
          This feature is being built.<br/>Check back shortly.
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   EnrollmentHandler — reads ?token= on first load, verifies it,
   stores hospital_id for Login to pre-fill, then redirects.
───────────────────────────────────────────────────────────── */
function EnrollmentHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) return

    // Remove token from URL without triggering a re-render
    window.history.replaceState({}, '', window.location.pathname)

    api(`/enrollment/verify?token=${encodeURIComponent(token)}`)
      .then(data => {
        if (data.valid) {
          localStorage.setItem('enrollment_prefill', data.hospital_id)
          localStorage.setItem('enrollment_name', data.patient_name || '')
          navigate('/language', { replace: true })
        }
      })
      .catch(() => {
        // Invalid/expired token — let the app load normally
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

/* ─────────────────────────────────────────────────────────────
   AppShell — flex column that sits inside the phone frame.
   On main routes: scrollable content area + BottomNav bar.
   On auth / transient routes: full-height content only.
───────────────────────────────────────────────────────────── */
function AppShell() {
  const { pathname } = useLocation()
  const showNav      = NAV_ROUTES.has(pathname)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}>

      {/* ── Scrollable content area ── */}
      <div
        className="phone-content"
        style={{
          flex:             1,
          minHeight:        0,        /* critical — lets flex child shrink below content size */
          overflowY:        'auto',
          overflowX:        'hidden',
          scrollbarWidth:   'none',
          msOverflowStyle:  'none',
        }}
      >
        <EnrollmentHandler />
        <Routes>
          <Route path="/"          element={<AuthRedirect element={<Welcome />} />} />
          <Route path="/language"  element={<AuthRedirect element={<LanguageSelect />} />} />
          <Route path="/login"     element={<AuthRedirect element={<Login />} />} />
          <Route path="/setup"     element={<Setup />} />
          <Route path="/home"      element={<Home />} />
          <Route path="/report"    element={<Report />} />
          <Route path="/education" element={<Education />} />
          <Route path="/checkin"   element={<CheckIn />} />
          <Route path="/result"    element={<Result />} />
          <Route path="/chat"      element={<Chat />} />
          <Route path="/symptom"   element={<ReportSymptom />} />
          <Route path="/emergency"             element={<Emergency />} />
          <Route path="/medication-reminder"  element={<MedicationReminder />} />
        </Routes>
      </div>

      {/* ── Bottom nav bar (main screens only) ── */}
      {showNav && <BottomNav />}

      {/* ── In-app reminder banners (check-in + medication) ── */}
      <ReminderBanner />

    </div>
  )
}

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768

export default function App() {
  if (isMobile) {
    return (
      <BrowserRouter>
        <style>{hideScrollbar}</style>
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <AppShell />
        </div>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <style>{hideScrollbar}</style>
      <div style={{
        minHeight:       '100vh',
        background:      'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '20px',
      }}>
        {/* Phone frame — desktop preview only */}
        <div style={{
          width:           '390px',
          height:          '844px',
          backgroundColor: '#ffffff',
          borderRadius:    '50px',
          overflow:        'hidden',
          position:        'relative',
          boxShadow:       '0 30px 80px rgba(0,0,0,0.4)',
          border:          '8px solid #1a1a1a',
          display:         'flex',
          flexDirection:   'column',
        }}>
          {/* Phone notch */}
          <div style={{
            position:        'absolute',
            top:             0, left: '50%',
            transform:       'translateX(-50%)',
            width:           '120px', height: '30px',
            backgroundColor: '#1a1a1a',
            borderRadius:    '0 0 20px 20px',
            zIndex:          999,
          }}/>
          <AppShell />
        </div>
      </div>
    </BrowserRouter>
  )
}
