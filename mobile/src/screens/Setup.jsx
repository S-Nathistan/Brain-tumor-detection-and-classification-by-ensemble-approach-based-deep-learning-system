import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function fmt24to12(t) {
  const [h, m] = t.split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${p}`
}

export default function Setup() {
  const navigate    = useNavigate()
  const { t }       = useTranslation()
  const patient     = JSON.parse(localStorage.getItem('mobile_patient')   || '{}')
  const caretaker   = JSON.parse(localStorage.getItem('mobile_caretaker') || '{}')
  const role        = localStorage.getItem('mobile_role') || 'patient'
  const isCaretaker = role === 'caretaker'
  const displayName = isCaretaker ? (caretaker.name || patient.name) : patient.name

  const [reminderTime, setReminderTime] = useState('20:00')
  const [showPicker,   setShowPicker]   = useState(false)
  const [notifStatus,  setNotifStatus]  = useState(null)

  async function requestNotifications() {
    if (!('Notification' in window)) { setNotifStatus('denied'); return }
    const r = await Notification.requestPermission()
    setNotifStatus(r === 'granted' ? 'granted' : 'denied')
  }

  function goHome() {
    localStorage.setItem(`setup_done_${patient.hospital_id}`, '1')
    localStorage.setItem('reminder_time', reminderTime)
    navigate('/home')
  }

  return (
    <div style={{
      height: '100%',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .go-btn:active { opacity: 0.88; transform: scale(0.98); }
        .time-btn:active { background: #e8f5f3 !important; }
        .notif-btn:active { opacity: 0.85; }
      `}</style>

      {/* ── Teal header strip ── */}
      <div style={{
        background: 'linear-gradient(150deg, #0d9488 0%, #0a7068 100%)',
        padding: '44px 26px 28px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

        {/* Top-left logo badge */}
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:24, animation:'fadeUp 0.3s ease both' }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:'rgba(255,255,255,0.15)',
            border:'1px solid rgba(255,255,255,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.16em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', lineHeight:1 }}>Account Ready</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', fontWeight:500, marginTop:3 }}>NeuroSight Care</div>
          </div>
        </div>

        {/* Centered welcome content */}
        <div style={{ textAlign:'center', animation:'fadeUp 0.35s ease 0.06s both' }}>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:'0 0 4px', fontWeight:500 }}>
            {t('setup.welcome')},
          </p>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#fff', margin:'0 0 16px', letterSpacing:'-0.3px', lineHeight:1.2 }}>
            {displayName || '—'}
          </h1>

          {patient.assigned_doctor && (
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              borderTop:'1px solid rgba(255,255,255,0.2)',
              paddingTop:12,
            }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                {t('setup.connectedTo')}
              </span>
              <span style={{ fontSize:14, color:'#fff', fontWeight:700 }}>
                {patient.assigned_doctor}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex:1, padding:'20px 20px 24px', display:'flex', flexDirection:'column', gap:12, animation:'fadeUp 0.35s ease 0.12s both', overflow:'hidden' }}>

        {/* Reminder card */}
        <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#e6faf8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1 }}>Daily Reminder</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>{t('setup.reminderQuestion')}</div>
            </div>
          </div>

          {showPicker ? (
            <input
              type="time" value={reminderTime} autoFocus
              onChange={e => { setReminderTime(e.target.value); setShowPicker(false) }}
              style={{ width:'100%', padding:'10px 14px', fontSize:15, fontWeight:700, color:'#0d9488', border:'2px solid #0d9488', borderRadius:10, background:'#fff', fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }}
            />
          ) : (
            <button
              className="time-btn"
              onClick={() => setShowPicker(true)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', cursor:'pointer', transition:'background 0.15s' }}>
              <span style={{ fontSize:17, fontWeight:800, color:'#0d9488', fontFamily:"'DM Mono',monospace", letterSpacing:'0.03em' }}>
                {fmt24to12(reminderTime)}
              </span>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:500 }}>{t('setup.tapToChange')}</span>
            </button>
          )}
        </div>

        {/* Notifications card */}
        <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1 }}>{t('setup.notifQuestion')}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>{t('setup.notifSub')}</div>
            </div>
          </div>

          {notifStatus === null && (
            <button className="notif-btn" onClick={requestNotifications}
              style={{ width:'100%', padding:'10px 0', background:'transparent', color:'#0d9488', border:'2px solid #0d9488', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', transition:'opacity 0.15s' }}>
              {t('setup.allowBtn')}
            </button>
          )}
          {notifStatus === 'granted' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'9px 13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:12, color:'#15803d', fontWeight:600 }}>{t('setup.notifGranted')}</span>
            </div>
          )}
          {notifStatus === 'denied' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style={{ fontSize:12, color:'#dc2626', fontWeight:600 }}>{t('setup.notifDenied')}</span>
            </div>
          )}
        </div>

        {/* Hint */}
        <div style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'0 2px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize:11, color:'#94a3b8', margin:0, lineHeight:1.6 }}>
            You can update these preferences anytime in Settings.
          </p>
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* CTA */}
        <button
          className="go-btn"
          onClick={goHome}
          style={{
            width:'100%', padding:'14px 0',
            background:'linear-gradient(135deg, #0d9488, #0a7068)',
            color:'#fff', border:'none', borderRadius:12,
            fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 4px 18px rgba(13,148,136,0.32)',
            letterSpacing:'0.01em', transition:'opacity 0.15s, transform 0.15s',
          }}>
          {t('setup.goHome')}
        </button>

      </div>
    </div>
  )
}
