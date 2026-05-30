import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [role, setRole] = useState('patient')   // 'patient' | 'caretaker'
  const [patientId, setPatientId] = useState('')
  const [enrolledName, setEnrolledName] = useState('')

  useEffect(() => {
    const prefill = localStorage.getItem('enrollment_prefill')
    if (prefill) {
      setPatientId(prefill)
      setEnrolledName(localStorage.getItem('enrollment_name') || '')
      localStorage.removeItem('enrollment_prefill')
      localStorage.removeItem('enrollment_name')
    }
  }, [])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const tk = t(`login.${role}`, { returnObjects: true })

  function clearForm() {
    setPatientId('')
    setPhone('')
    setError('')
  }

  function switchRole(r) {
    setRole(r)
    clearForm()
  }

  const canSubmit = role === 'patient'
    ? patientId.trim().length > 0
    : patientId.trim().length > 0 && phone.trim().length > 0

  async function handleLogin() {
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      const endpoint = role === 'patient' ? '/mobile/login' : '/mobile/caretaker-login'
      const body = role === 'patient'
        ? { hospital_id: patientId.trim().toUpperCase(), language: localStorage.getItem('language') || 'en' }
        : { hospital_id: patientId.trim().toUpperCase(), phone: phone.trim() }

      const res = await fetch(
        `${API_BASE}${endpoint}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' }, body: JSON.stringify(body) }
      )
      if (!res.ok) {
        let message = tk.error
        try {
          const data = await res.json()
          message = data.detail || message
        } catch {}
        throw new Error(message)
      }
      const data = await res.json()
      localStorage.setItem('mobile_token', data.token)
      localStorage.setItem('mobile_patient', JSON.stringify(data.patient))
      localStorage.setItem('mobile_role', role)
      localStorage.removeItem('mobile_latest_checkin')
      if (data.caretaker) {
        localStorage.setItem('mobile_caretaker', JSON.stringify(data.caretaker))
      } else {
        localStorage.removeItem('mobile_caretaker')
      }
      navigate(localStorage.getItem(`setup_done_${data.patient.hospital_id}`) ? '/home' : '/setup', { replace: true })
    } catch {
      setError(tk.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .login-btn:active { transform: scale(0.98); }
        .login-input:focus { outline: none; }
        .role-tab { transition: background 0.2s, color 0.2s; }
      `}</style>

      {/* Teal header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        padding: '48px 28px 68px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-20, left:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

        {/* Back */}
        <button onClick={() => navigate('/language')} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, color:'#fff', padding:'6px 12px', fontSize:13, cursor:'pointer', marginBottom:24, display:'inline-flex', alignItems:'center', gap:4 }}>
          {t('login.back')}
        </button>

        {/* Role toggle */}
        <div style={{ display:'flex', background:'rgba(0,0,0,0.2)', borderRadius:12, padding:4, marginBottom:20, gap:4 }}>
          {['patient', 'caretaker'].map(r => (
            <button
              key={r}
              className="role-tab"
              onClick={() => switchRole(r)}
              style={{
                flex:1, padding:'9px 0', border:'none', borderRadius:9, cursor:'pointer',
                fontSize:13, fontWeight:700,
                background: role === r ? '#ffffff' : 'transparent',
                color: role === r ? '#0d9488' : 'rgba(255,255,255,0.75)',
              }}>
              {t(`login.role${r.charAt(0).toUpperCase() + r.slice(1)}`)}
            </button>
          ))}
        </div>

        <div style={{ animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, marginLeft:'auto', marginRight:'auto' }}>
            {role === 'patient' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            )}
          </div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 4px', textAlign:'center' }}>{tk.title}</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', margin:0, textAlign:'center' }}>{tk.sub}</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex:1, background:'#fff', borderRadius:'24px 24px 0 0', marginTop:-24, padding:'28px 24px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)', animation:'fadeUp 0.4s ease 0.1s both' }}>

        {/* Enrollment welcome banner */}
        {enrolledName ? (
          <div style={{ background:'#f0fdfa', border:'1px solid #99f6e4', borderRadius:12, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0f766e' }}>{t('login.enrolledWelcome', { name: enrolledName })}</div>
              <div style={{ fontSize:11, color:'#0d9488', marginTop:1 }}>{t('login.enrolledHint')}</div>
            </div>
          </div>
        ) : null}

        {/* Patient ID field */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#6b7280', marginBottom:7 }}>
            {tk.idLabel || 'Hospital ID / Patient ID'}
          </label>
          <div style={{
            display:'flex', alignItems:'center',
            border:`2px solid ${focusedField==='id' ? '#0d9488' : error ? '#ef4444' : '#e5e7eb'}`,
            borderRadius:12, background:'#fff', padding:'0 14px',
            transition:'border-color 0.2s',
            animation: error && focusedField !== 'phone' ? 'shake 0.35s ease' : 'none',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={focusedField==='id' ? '#0d9488' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, transition:'stroke 0.2s' }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              className="login-input"
              type="text"
              value={patientId}
              onChange={e => { setPatientId(e.target.value); setError('') }}
              onFocus={() => setFocusedField('id')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder={tk.idPlaceholder}
              autoCapitalize="characters"
              style={{ flex:1, border:'none', padding:'13px 10px', fontSize:14, fontWeight:600, color:'#111827', background:'transparent', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}
            />
          </div>
          <p style={{ fontSize:11, color:'#9ca3af', marginTop:5, marginBottom:0 }}>{tk.idHint || 'Enter the hospital ID from the patient record (or numeric patient ID if provided).'}</p>
        </div>

        {/* Phone field — caretaker only */}
        {role === 'caretaker' && (
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#6b7280', marginBottom:7 }}>
              {tk.phoneLabel}
            </label>
            <div style={{
              display:'flex', alignItems:'center',
              border:`2px solid ${focusedField==='phone' ? '#0d9488' : error ? '#ef4444' : '#e5e7eb'}`,
              borderRadius:12, background:'#fff', padding:'0 14px',
              transition:'border-color 0.2s',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={focusedField==='phone' ? '#0d9488' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, transition:'stroke 0.2s' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
              </svg>
              <input
                className="login-input"
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder={tk.phonePlaceholder}
                style={{ flex:1, border:'none', padding:'13px 10px', fontSize:14, fontWeight:500, color:'#111827', background:'transparent', fontFamily:"'DM Sans',sans-serif" }}
              />
            </div>
            <p style={{ fontSize:11, color:'#9ca3af', marginTop:5, marginBottom:0 }}>{tk.phoneHint}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ fontSize:12, color:'#ef4444', marginBottom:14, marginTop:-4 }}>{error}</p>
        )}

        {/* Sign in button */}
        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading || !canSubmit}
          style={{
            width:'100%', padding:15,
            background: canSubmit ? '#0d9488' : '#d1d5db',
            color:'#fff', border:'none', borderRadius:12,
            fontSize:15, fontWeight:700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition:'background 0.2s, transform 0.15s',
            boxShadow: canSubmit ? '0 4px 16px rgba(13,148,136,0.35)' : 'none',
          }}>
          {loading ? tk.loading : tk.btn}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0' }}>
          <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
          <span style={{ fontSize:11, color:'#cbd5e1', fontWeight:600 }}>OR</span>
          <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
        </div>

        {/* Info note */}
        <div style={{ background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:12, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <div style={{ width:26, height:26, borderRadius:7, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={{ fontSize:12, color:'#0f766e', margin:0, lineHeight:1.5 }}>{tk.newNote}</p>
        </div>

      </div>
    </div>
  )
}
