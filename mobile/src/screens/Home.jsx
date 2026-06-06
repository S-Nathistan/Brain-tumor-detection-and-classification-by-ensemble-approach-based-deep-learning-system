import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import i18n from '../i18n'

const LANG_CYCLE = ['en', 'si', 'ta']
const LANG_LABEL = { en: 'EN', si: 'සිං', ta: 'தமிழ்' }

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('home.morning')
  if (h < 17) return t('home.afternoon')
  return t('home.evening')
}

function tumourPill(type) {
  const lo = (type || '').toLowerCase()
  if (!type || type === 'Not Classified') return { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.8)' }
  if (lo.includes('no tumor') || lo.includes('no tumour')) return { bg: 'rgba(16,185,129,0.22)', text: '#d1fae5' }
  return { bg: 'rgba(239,68,68,0.2)', text: '#fecaca' }
}

function levelStyle(level) {
  if (level === 'GREEN')    return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' }
  if (level === 'AMBER')    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' }
  if (level === 'RED')      return { color: '#dc2626', bg: '#fff7ed', border: '#fed7aa', dot: '#ef4444' }
  if (level === 'CRITICAL') return { color: '#9f1239', bg: '#fff1f2', border: '#fecdd3', dot: '#e11d48' }
  return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8' }
}

export default function Home() {
  const navigate    = useNavigate()
  const { t }       = useTranslation()
  const patient     = JSON.parse(localStorage.getItem('mobile_patient')   || '{}')
  const caretaker   = JSON.parse(localStorage.getItem('mobile_caretaker') || '{}')
  const role        = localStorage.getItem('mobile_role') || 'patient'
  const isCaretaker = role === 'caretaker'
  const tc          = tumourPill(patient.tumour_type)
  const setupDone    = !!localStorage.getItem(`setup_done_${patient.hospital_id}`)
  const setupSkipped = !!localStorage.getItem(`setup_skipped_${patient.hospital_id}`)
  const reminderTime = localStorage.getItem('reminder_time') || '20:00'
  const currentLang  = localStorage.getItem('language') || 'en'

  function fmtTime(time) {
    const [h, m] = time.split(':').map(Number)
    const p = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${p}`
  }

  const [checkin, setCheckin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mobile_latest_checkin') || 'null') } catch { return null }
  })

  const [reportData, setReportData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mobile_report') || 'null') } catch { return null }
  })
  const notifKey = `report_notif_seen_${patient.hospital_id}`
  const [notifDismissed, setNotifDismissed] = useState(
    () => localStorage.getItem(notifKey) === 'true'
  )
  const diagnosisConfirmed = reportData?.scan?.doctor_confirmed === true
  const showNotif          = diagnosisConfirmed && !notifDismissed

  function dismissNotif() {
    localStorage.setItem(notifKey, 'true')
    setNotifDismissed(true)
  }

  useEffect(() => {
    api('/mobile/checkins/latest')
      .then(d => {
        setCheckin(d || null)
        if (d) localStorage.setItem('mobile_latest_checkin', JSON.stringify(d))
        else localStorage.removeItem('mobile_latest_checkin')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api('/mobile/report')
      .then(d => {
        setReportData(d)
        localStorage.setItem('mobile_report', JSON.stringify(d))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api('/mobile/language', { method: 'POST', body: { language: currentLang, reminder_time: localStorage.getItem('reminder_time') || '20:00' } })
      .catch(() => {})
  }, [currentLang])

  function cycleLang() {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(currentLang) + 1) % LANG_CYCLE.length]
    localStorage.setItem('language', next)
    i18n.changeLanguage(next)
  }

  function signOut() {
    localStorage.removeItem('mobile_token')
    localStorage.removeItem('mobile_patient')
    localStorage.removeItem('mobile_role')
    localStorage.removeItem('mobile_caretaker')
    localStorage.removeItem('mobile_latest_checkin')
    navigate('/login')
  }

  const actions = [
    { key: 'report',    icon: ReportIcon,    route: '/report',    cardBg: '#eff6ff', iconGrad: 'linear-gradient(135deg,#60a5fa,#1d4ed8)', border: '#bfdbfe', shadow: '#1d4ed833' },
    { key: 'checkin',   icon: CheckinIcon,   route: '/checkin',   cardBg: '#f0fdf4', iconGrad: 'linear-gradient(135deg,#4ade80,#16a34a)', border: '#bbf7d0', shadow: '#16a34a33' },
    { key: 'chat',      icon: ChatIcon,      route: '/chat',      cardBg: '#fdf4ff', iconGrad: 'linear-gradient(135deg,#c084fc,#9333ea)', border: '#f3e8ff', shadow: '#9333ea33' },
    { key: 'education', icon: EducationIcon, route: '/education', cardBg: '#fff7ed', iconGrad: 'linear-gradient(135deg,#fb923c,#ea580c)', border: '#fed7aa', shadow: '#ea580c33' },
    { key: 'symptom',   icon: SymptomIcon,   route: '/symptom',   cardBg: '#fef2f2', iconGrad: 'linear-gradient(135deg,#f472b6,#be185d)', border: '#fecdd3', shadow: '#be185d33' },
    { key: 'emergency', icon: EmergencyIcon, route: '/emergency', cardBg: '#fff1f2', iconGrad: 'linear-gradient(135deg,#fb7185,#e11d48)', border: '#fecdd3', shadow: '#e11d4833' },
  ]

  const ls = checkin ? levelStyle(checkin.level) : null
  const displayName = isCaretaker ? (caretaker.name || '') : (patient.name || '')
  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0fdfa 0%,#f8fafc 35%)', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardPop   { from{opacity:0;transform:scale(0.93) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(6deg)} }
        @keyframes pulseRing { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .action-card {
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
          cursor: pointer;
        }
        .action-card:hover  { transform: translateY(-3px) !important; }
        .action-card:active { transform: scale(0.93) !important; box-shadow: none !important; }
        .lang-btn { transition: opacity 0.15s, background 0.15s; }
        .lang-btn:active { opacity: 0.65; }
        .med-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
        .med-card:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(109,40,217,0.45) !important; }
        .med-card:active { transform: scale(0.97); }
        .sign-out-btn { transition: color 0.15s; }
        .sign-out-btn:hover { color: #ef4444 !important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0d9488 0%,#0f766e 52%,#134e4a 100%)', padding: '52px 20px 28px', position: 'relative', overflow: 'hidden' }}>

        {/* Animated orbs */}
        <div style={{ position:'absolute', top:-45, right:-45, width:170, height:170, borderRadius:'50%', background:'rgba(255,255,255,0.07)', animation:'float 7s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-32, left:-28, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)', animation:'float 9s ease-in-out infinite 2.5s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:55, right:55, width:65, height:65, borderRadius:'50%', background:'rgba(255,255,255,0.06)', animation:'floatSlow 5.5s ease-in-out infinite 1s', pointerEvents:'none' }} />

        {/* Subtle brain watermark */}
        <div style={{ position:'absolute', bottom:8, right:16, opacity:0.06, pointerEvents:'none' }}>
          <svg width="86" height="86" viewBox="0 0 24 24" fill="white">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.16zm5 0a2.5 2.5 0 0 1 1.44 4.16 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 19.5v-15A2.5 2.5 0 0 1 14.5 2z"/>
          </svg>
        </div>

        {/* Brand logo row */}
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:18, animation:'fadeUp 0.35s ease both' }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(10px)', boxShadow:'0 2px 10px rgba(0,0,0,0.12)' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <span style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.88)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
            NeuroSight
          </span>
        </div>

        {/* Top row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>

          {/* Avatar + name */}
          <div style={{ display:'flex', alignItems:'center', gap:12, animation:'fadeUp 0.4s ease both' }}>
            <div style={{ width:46, height:46, borderRadius:15, background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.32)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(8px)' }}>
              <span style={{ fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.62)', marginBottom:2, letterSpacing:'0.01em' }}>{getGreeting(t)}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1.15, letterSpacing:'-0.02em' }}>
                {displayName || '—'}
              </div>
              {isCaretaker && (
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.58)', marginTop:3 }}>
                  {t('home.caretakerViewing')} <span style={{ fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{patient.name || '—'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button className="lang-btn" onClick={cycleLang} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:10, color:'rgba(255,255,255,0.92)', padding:'6px 10px', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5, letterSpacing:'0.04em', backdropFilter:'blur(8px)' }}>
              <GlobeIcon />
              {LANG_LABEL[currentLang]}
            </button>
            <button className="lang-btn" onClick={() => navigate('/setup')} title="Settings" style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:10, color:'rgba(255,255,255,0.92)', padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
              <GearIcon />
            </button>
          </div>
        </div>

        {/* Pills row */}
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', animation:'fadeUp 0.4s ease 0.1s both' }}>
          <div style={{ background:tc.bg, borderRadius:20, padding:'4px 12px', fontSize:11, color:tc.text, fontWeight:700 }}>
            {patient.tumour_type || t('home.notClassified')}
          </div>
          {patient.risk_score && patient.risk_score !== '0%' && (
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'4px 12px', fontSize:11, color:'#fff', fontWeight:700 }}>
              {t('home.riskScore')}: {patient.risk_score}
            </div>
          )}
          {patient.hospital_id && (
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:20, padding:'4px 12px', fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:600 }}>
              {patient.hospital_id}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div style={{ flex:1, padding:'14px 14px 90px', display:'flex', flexDirection:'column', gap:13 }}>

        {/* Diagnosis confirmed notification */}
        {showNotif && (
          <DiagnosisNotifBanner
            reportData={reportData}
            lang={currentLang}
            navigate={navigate}
            onDismiss={dismissNotif}
            onOpen={() => { dismissNotif(); navigate('/report') }}
          />
        )}

        {/* Setup banner */}
        {!setupDone && (
          <div style={{ background:setupSkipped ? '#fff7ed' : '#fffbeb', border:`1.5px solid ${setupSkipped ? '#fed7aa' : '#fde68a'}`, borderRadius:16, padding:'13px 14px', display:'flex', alignItems:'center', gap:11, animation:'cardPop 0.4s ease both', boxShadow:`0 3px 12px ${setupSkipped ? '#f97316' : '#f59e0b'}22` }}>
            <div style={{ width:34, height:34, borderRadius:10, background:setupSkipped ? '#ffedd5' : '#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={setupSkipped ? '#ea580c' : '#d97706'} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              {setupSkipped ? (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:'#9a3412', marginBottom:1 }}>{t('home.setupSkipped')}</div>
                  <div style={{ fontSize:11, color:'#c2410c', lineHeight:1.4 }}>{t('home.setupSkippedSub', { time:fmtTime(reminderTime) })}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:1 }}>{t('home.setupBanner')}</div>
                  <div style={{ fontSize:11, color:'#b45309', lineHeight:1.4 }}>{t('home.setupBannerSub')}</div>
                </>
              )}
            </div>
            <button onClick={() => navigate('/setup')} style={{ background:setupSkipped ? '#ea580c' : '#d97706', color:'#fff', border:'none', borderRadius:9, padding:'7px 11px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
              {setupSkipped ? t('home.setupBtn') : t('home.setupBannerBtn')}
            </button>
          </div>
        )}

        {/* Last check-in card */}
        <div style={{ background: ls ? `linear-gradient(150deg,#fff 55%,${ls.bg} 100%)` : '#fff', border:`1.5px solid ${ls ? ls.border : '#e2e8f0'}`, borderRadius:18, padding:'14px 14px', animation:'cardPop 0.45s cubic-bezier(.34,1.56,.64,1) 0.06s both', boxShadow:`0 4px 20px ${ls ? ls.dot + '28' : 'rgba(0,0,0,0.06)'}` }}>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent: checkin ? 'space-between' : 'center', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8' }}>
              {t('home.lastCheckin')}
            </div>
            {checkin?.created_at && (
              <div style={{ fontSize:10, color:'#cbd5e1', fontWeight:500 }}>
                {new Date(checkin.created_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {checkin ? (
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {/* Solid level badge */}
              <div style={{ background:ls.color, borderRadius:14, padding:'10px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:2, flexShrink:0, minWidth:88, boxShadow:`0 4px 14px ${ls.dot}55` }}>
                <span style={{ fontSize:14, fontWeight:900, color:'#fff', letterSpacing:'0.02em' }}>{checkin.level}</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.78)', fontWeight:600 }}>{t('home.checkinScore')} {checkin.score}</span>
              </div>

              {/* Hint + CTA */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11.5, color:'#475569', lineHeight:1.55, marginBottom:10 }}>
                  {{ CRITICAL: t('home.checkinHintCritical'), RED: t('home.checkinHintRed'), AMBER: t('home.checkinHintAmber'), GREEN: t('home.checkinHintGreen') }[checkin.level] || ''}
                </div>
                <button
                  onClick={() => navigate('/result', { state:checkin })}
                  style={{ background:ls.color, border:'none', color:'#fff', borderRadius:9, padding:'8px 14px', fontSize:11, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, boxShadow:`0 3px 10px ${ls.dot}44` }}>
                  {t('home.viewDetails')}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.5, padding:'4px 0', textAlign:'center' }}>{t('home.noCheckin')}</div>
          )}
        </div>

        {/* Quick actions grid */}
        <div style={{ animation:'fadeUp 0.4s ease 0.12s both' }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8', marginBottom:10, paddingLeft:2 }}>
            {t('home.quickActions')}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {actions.map(({ key, icon:Icon, route, cardBg, iconGrad, border, shadow }, i) => (
              <button
                key={key}
                className="action-card"
                onClick={() => navigate(route)}
                style={{
                  background: cardBg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 16,
                  padding: '15px 13px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                  textAlign: 'left',
                  boxShadow: `0 2px 8px ${shadow}`,
                  position: 'relative',
                  animation: `cardPop 0.4s cubic-bezier(.34,1.56,.64,1) ${0.08 + i * 0.04}s both`,
                }}>
                {key === 'report' && showNotif && (
                  <div style={{ position:'absolute', top:10, right:10, width:9, height:9, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 0 2px #fff' }} />
                )}
                <div style={{ width:38, height:38, borderRadius:11, background:iconGrad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 3px 10px ${shadow}` }}>
                  <Icon color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', marginBottom:2 }}>{t(`home.${key}`)}</div>
                  <div style={{ fontSize:10.5, color:'#64748b', lineHeight:1.4 }}>{t(`home.${key}Sub`)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Medication Reminder - Coming Soon */}
        <button
          className="med-card"
          onClick={() => navigate('/medication-reminder')}
          style={{
            background: 'linear-gradient(135deg,#4c1d95 0%,#6d28d9 55%,#7c3aed 100%)',
            border: 'none',
            borderRadius: 18,
            padding: '16px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            textAlign: 'left',
            boxShadow: '0 5px 22px rgba(109,40,217,0.38)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeUp 0.4s ease 0.33s both',
          }}>
          {/* Decorative orbs */}
          <div style={{ position:'absolute', top:-22, right:-22, width:95, height:95, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-14, right:56, width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:16, right:80, width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

          {/* Pill icon container */}
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(8px)' }}>
            <PillIcon />
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>{t('home.medication')}</span>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.72)', lineHeight:1.5 }}>{t('home.medicationSub')}</div>
          </div>

          <div style={{ flexShrink:0, opacity:0.55 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </button>

        {/* Doctor card */}
        {(() => {
          const nextVisit = reportData?.patient?.next_visit_date || patient.next_visit_date
          return (
            <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:16, padding:'13px 14px', display:'flex', alignItems:'center', gap:12, animation:'fadeUp 0.4s ease 0.38s both', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border:'1.5px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:2 }}>
                  {t('home.yourDoctor')}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{patient.assigned_doctor || t('home.noDoctor')}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={nextVisit ? '#0d9488' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span style={{ fontSize:11, color: nextVisit ? '#0d9488' : '#94a3b8', fontWeight: nextVisit ? 600 : 400 }}>
                    {nextVisit ? `${t('home.nextVisit')}: ${nextVisit}` : t('home.noNextVisit')}
                  </span>
                </div>
              </div>
              {patient.monitoring_frequency && !['No reminder', 'Reminder not configured'].includes(patient.monitoring_frequency) && (
                <div style={{ background:'#f0fdfa', border:'1px solid #99f6e4', borderRadius:9, padding:'4px 9px', flexShrink:0 }}>
                  <div style={{ fontSize:10, color:'#0d9488', fontWeight:600 }}>{patient.monitoring_frequency}</div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Sign out */}
        <div style={{ textAlign:'center', paddingTop:2 }}>
          <button className="sign-out-btn" onClick={signOut} style={{ background:'none', border:'none', color:'#cbd5e1', fontSize:11, cursor:'pointer', padding:'4px 8px' }}>
            {t('home.signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Diagnosis Confirmed Notification Banner ───────────────────────────────────

const NOTIF_STR = {
  en: {
    badge: 'NEW · DIAGNOSIS CONFIRMED',
    title: 'Your diagnosis has been confirmed',
    sub:   'Your doctor has reviewed your MRI and confirmed your diagnosis. Tap to view your full medical report.',
    btn:   'View Report',
  },
  si: {
    badge: 'නව · රෝග විනිශ්චය තහවුරු විය',
    title: 'ඔබේ රෝග විනිශ්චය තහවුරු කර ඇත',
    sub:   'ඔබේ වෛද්‍යවරයා ඔබේ MRI සමාලෝචනය කර රෝග විනිශ්චය තහවුරු කළේය. සම්පූර්ණ වෛද්‍ය වාර්තාව බැලීමට ස්පර්ශ කරන්න.',
    btn:   'වාර්තාව බලන්න',
  },
  ta: {
    badge: 'புதிய · நோய் கண்டறிதல் உறுதி',
    title: 'உங்கள் நோய் கண்டறிதல் உறுதிப்படுத்தப்பட்டது',
    sub:   'உங்கள் மருத்துவர் உங்கள் MRI ஐ மதிப்பாய்வு செய்து நோயை உறுதிப்படுத்தினார். முழு மருத்துவ அறிக்கையை பார்க்க தட்டுங்கள்.',
    btn:   'அறிக்கை பாருங்கள்',
  },
}

function DiagnosisNotifBanner({ reportData, lang, navigate, onDismiss, onOpen }) {
  const n     = NOTIF_STR[lang] || NOTIF_STR.en
  const scan  = reportData?.scan
  const label = scan?.final_label || ''

  const ACCENT_MAP = {
    glioma:     '#2563eb',
    meningioma: '#9333ea',
    pituitary:  '#ea580c',
    no_tumor:   '#16a34a',
  }
  let accent = '#0d9488'
  const lo = label.toLowerCase()
  if (lo.includes('glioma') || lo.includes('gbm'))             accent = ACCENT_MAP.glioma
  else if (lo.includes('meningioma'))                          accent = ACCENT_MAP.meningioma
  else if (lo.includes('pituitary') || lo.includes('adenoma')) accent = ACCENT_MAP.pituitary
  else if (lo.includes('no tumor') || lo.includes('no tumour')) accent = ACCENT_MAP.no_tumor

  return (
    <div
      onClick={onOpen}
      style={{
        background:   `linear-gradient(135deg,${accent}f0,${accent}cc)`,
        borderRadius: 18,
        padding:      '14px 14px',
        cursor:       'pointer',
        animation:    'fadeUp 0.4s ease both',
        position:     'relative',
        overflow:     'hidden',
        boxShadow:    `0 5px 20px ${accent}44`,
      }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:26, height:26, borderRadius:8, background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>
            {n.badge}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDismiss() }}
          style={{ background:'rgba(255,255,255,0.18)', border:'none', borderRadius:6, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:13, lineHeight:1, flexShrink:0 }}>
          ×
        </button>
      </div>

      <div style={{ fontSize:14, fontWeight:800, color:'#fff', lineHeight:1.3, marginBottom:5 }}>{n.title}</div>
      <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.88)', lineHeight:1.6, marginBottom:12 }}>{n.sub}</div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <div style={{ background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.35)', borderRadius:9, padding:'7px 14px', display:'inline-flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{n.btn}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function ReportIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function CheckinIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function ChatIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function EducationIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function SymptomIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>
    </svg>
  )
}

function EmergencyIcon({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function PillIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4" ry="4"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
    </svg>
  )
}
