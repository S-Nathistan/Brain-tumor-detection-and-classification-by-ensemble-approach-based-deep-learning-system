import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import BackButton from './BackButton'

const ANSWER_KEY_MAP = {
  'No headache':        'checkin.optHeadache0',
  'Mild (a little)':    'checkin.optHeadache1',
  'Moderate (painful)': 'checkin.optHeadache2',
  'Severe (very bad)':  'checkin.optHeadache3',
  'No':                 'checkin.optSeizure0',
  'Yes (brief)':        'checkin.optSeizure1',
  'Yes (long)':         'checkin.optSeizure2',
  'Normal':             'checkin.optEnergy0',
  'A bit tired':        'checkin.optEnergy1',
  'Very tired':         'checkin.optEnergy2',
  'Cannot get up':      'checkin.optEnergy3',
  'None':               'checkin.optNausea0',
  'Feeling sick':       'checkin.optNausea1',
  'Vomited once':       'checkin.optNausea2',
  'Vomited many times': 'checkin.optNausea3',
  'Yes (all doses)':     'checkin.optMed0',
  'Missed one dose':     'checkin.optMed1',
  'Missed all doses':    'checkin.optMed2',
  'No medication today': 'checkin.optMed3',
  'Good':                 'checkin.optOverall0',
  'Same as usual':        'checkin.optOverall1',
  'Worse than yesterday': 'checkin.optOverall2',
  'Much worse':           'checkin.optOverall3',
  'Well':        'checkin.optSleep0',
  'Okay':        'checkin.optSleep1',
  'Poor':        'checkin.optSleep2',
  'Very little': 'checkin.optSleep3',
  'Slightly low':  'checkin.optAppetite1',
  'Very low':      'checkin.optAppetite2',
  'Could not eat': 'checkin.optAppetite3',
}

function planTone(level) {
  if (level === 'GREEN')    return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', subtitle: 'GREEN',    titleKey: 'toneGreenTitle' }
  if (level === 'AMBER')    return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', subtitle: 'AMBER',    titleKey: 'toneAmberTitle' }
  if (level === 'RED')      return { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', subtitle: 'RED',      titleKey: 'toneRedTitle' }
  return                           { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', subtitle: 'CRITICAL', titleKey: 'toneCriticalTitle' }
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const patient  = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const userType = localStorage.getItem('mobile_user_type') || 'brain_tumor_patient'
  const [checkin, setCheckin] = useState(location.state || null)

  useEffect(() => {
    if (checkin) return
    const cached = localStorage.getItem('mobile_latest_checkin')
    if (cached) {
      try { setCheckin(JSON.parse(cached)); return } catch {}
    }
    api('/mobile/checkins/latest').then(data => setCheckin(data || null)).catch(() => setCheckin(null))
  }, [checkin])

  const tone = useMemo(() => planTone(checkin?.level), [checkin?.level])

  const symptomRows = [
    ['symptomHeadache',   checkin?.headache],
    ['symptomSeizure',    checkin?.seizure],
    ['symptomEnergy',     checkin?.energy],
    ['symptomNausea',     checkin?.nausea],
    ['symptomMedication', checkin?.medication],
    ['symptomOverall',    checkin?.overall],
  ].filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', padding:'36px 20px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-34, right:-28, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <BackButton variant="glass" to="/checkin" />
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.72)', marginBottom:8, marginTop:14 }}>{t('result.header')}</div>
        <div style={{ fontSize:24, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{patient.name || '—'}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.74)', marginTop:6 }}>{t('result.subheader')}</div>
      </div>

      <div style={{ flex:1, background:'#fff', borderRadius:'24px 24px 0 0', marginTop:6, padding:'14px 18px 20px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
        {!checkin ? (
          <div style={{ textAlign:'center', padding:'40px 18px', color:'#64748b' }}>{t('result.loading')}</div>
        ) : (
          <>
            <div style={{ borderRadius:18, background:tone.bg, padding:'14px 14px', textAlign:'center', boxShadow:'inset 0 0 0 1px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:tone.text, marginBottom:4 }}>{tone.subtitle}</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{t(`result.${tone.titleKey}`)}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{t('result.score')}: {checkin.score}</div>
              <div style={{ marginTop:6, fontSize:14, color:'#334155', lineHeight:1.6 }}>
                {{ GREEN: t('result.messageGreen'), AMBER: t('result.messageAmber'), RED: t('result.messageRed'), CRITICAL: t('result.messageCritical') }[checkin.level] || checkin.message}
              </div>
            </div>

            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:14, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#0f766e', marginBottom:4 }}>{t('result.savedToday')}</div>
              {symptomRows.map(([key, value]) => (
                <div key={key} style={{ display:'flex', justifyContent:'space-between', gap:8, padding:'6px 0', borderBottom:'1px solid #e9eef6' }}>
                  <span style={{ fontSize:12, color:'#64748b' }}>{t(`result.${key}`)}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', textAlign:'right' }}>
                    {ANSWER_KEY_MAP[value] ? t(ANSWER_KEY_MAP[value]) : value}
                  </span>
                </div>
              ))}
              {checkin.note ? (
                <div style={{ paddingTop:10 }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>{t('result.noteLabel')}</div>
                  <div style={{ fontSize:13, color:'#334155', lineHeight:1.7 }}>{checkin.note}</div>
                </div>
              ) : null}
            </div>

            {Number(checkin.score) >= 4 && Number(checkin.score) <= 7 && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fff7ed', border:'1px solid #fde68a', color:'#92400e' }}>
                <div style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>⚠ {t('result.amberThankYou')}</div>
                <div style={{ fontSize:13, marginBottom:8 }}>{userType === 'normal_user' ? t('result.amberNormalUser') : t('result.amberTumorUser')}</div>
                <div style={{ fontSize:13, marginBottom:12 }}>{t('result.amberIfWorse')}</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => navigate('/symptom')} style={{ flex:1, padding:'12px 14px', borderRadius:10, border:'none', background:'#f97316', color:'#fff', fontWeight:800, cursor:'pointer' }}>{t('result.amberBtn')}</button>
                </div>
              </div>
            )}

            {Number(checkin.score) >= 8 && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fff7ed', border:'1px solid #fed7aa', color:'#c2410c' }}>
                <div style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>{t('result.redAlerted')}</div>
                <div style={{ fontSize:13, marginBottom:6 }}>{t('result.redConcerning', { doctor: patient.assigned_doctor || 'your doctor' })}</div>
                <div style={{ fontSize:13, marginBottom:12 }}>{t('result.redRest')}</div>
                <div style={{ display:'flex', justifyContent:'center' }}>
                  <a href="tel:1990" style={{ display:'inline-block', textAlign:'center', padding:'12px 20px', borderRadius:10, border:'none', background:'#dc2626', color:'#fff', fontWeight:800, textDecoration:'none', minWidth:180 }}>{t('result.redCallBtn')}</a>
                </div>
              </div>
            )}

            {checkin.level === 'CRITICAL' && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c' }}>
                <div style={{ fontSize:12, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{t('result.criticalTitle')}</div>
                <div style={{ fontSize:13, lineHeight:1.7 }}>{userType === 'normal_user' ? t('result.criticalNormalUser') : t('result.criticalTumorUser')}</div>
              </div>
            )}

            <div style={{ marginTop:14, textAlign:'center', fontSize:12, color:'#64748b' }}>
              {checkin.created_at
                ? t('result.savedAt', { datetime: new Date(checkin.created_at).toLocaleString() })
                : t('result.savedJustNow')}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
