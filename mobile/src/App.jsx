import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'

const hideScrollbar = `
  .phone-content::-webkit-scrollbar { display: none; }
`
import Welcome from './screens/Welcome'
import LanguageSelect from './screens/LanguageSelect'
import Login from './screens/Login'
import Home from './screens/Home'
import Setup from './screens/Setup'

function ComingSoon({ title }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', padding:'48px 24px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <button onClick={() => navigate('/home')} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, color:'#fff', padding:'6px 12px', fontSize:13, cursor:'pointer', marginBottom:20, display:'inline-flex', alignItems:'center', gap:4 }}>
          ← Back
        </button>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:0 }}>{title}</h1>
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

export default function App() {
  return (
    <BrowserRouter>
      <style>{hideScrollbar}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        {/* Phone frame */}
        <div style={{
          width: '390px',
          height: '844px',
          backgroundColor: '#ffffff',
          borderRadius: '50px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          border: '8px solid #1a1a1a',
        }}>
          {/* Phone notch */}
          <div style={{
            position: 'absolute',
            top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '120px', height: '30px',
            backgroundColor: '#1a1a1a',
            borderRadius: '0 0 20px 20px',
            zIndex: 999,
          }}/>

          {/* App content */}
          <div className="phone-content" style={{ width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden', scrollbarWidth:'none', msOverflowStyle:'none' }}>
            <Routes>
              <Route path="/"          element={<Welcome />} />
              <Route path="/language"  element={<LanguageSelect />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/setup"     element={<Setup />} />
              <Route path="/home"      element={<Home />} />
              <Route path="/report"    element={<ComingSoon title="My Report" />} />
              <Route path="/education" element={<ComingSoon title="About My Condition" />} />
              <Route path="/checkin"   element={<ComingSoon title="Daily Check-in" />} />
              <Route path="/result"    element={<ComingSoon title="Check-in Result" />} />
              <Route path="/chat"      element={<ComingSoon title="Ask Questions" />} />
              <Route path="/symptom"   element={<ComingSoon title="Report Symptom" />} />
              <Route path="/emergency" element={<ComingSoon title="Emergency" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
