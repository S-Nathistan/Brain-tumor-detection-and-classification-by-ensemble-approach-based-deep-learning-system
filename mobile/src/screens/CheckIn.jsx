import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import BackButton from './BackButton'

// value = stored English string (backend payload, comparisons, scoring)
// labelKey = translation key for display only
const BRAIN_QUESTIONS = [
  {
    key: 'headache',
    titleKey: 'checkin.brainQ1',
    options: [
      { value: 'No headache',        labelKey: 'checkin.optHeadache0', points: 0 },
      { value: 'Mild (a little)',     labelKey: 'checkin.optHeadache1', points: 1 },
      { value: 'Moderate (painful)', labelKey: 'checkin.optHeadache2', points: 2 },
      { value: 'Severe (very bad)',   labelKey: 'checkin.optHeadache3', points: 3 },
    ],
  },
  {
    key: 'seizure',
    titleKey: 'checkin.brainQ2',
    warningKey: 'checkin.q2Warning',
    options: [
      { value: 'No',         labelKey: 'checkin.optSeizure0', points: 0 },
      { value: 'Yes (brief)', labelKey: 'checkin.optSeizure1', points: 5 },
      { value: 'Yes (long)',  labelKey: 'checkin.optSeizure2', points: 5 },
    ],
  },
  {
    key: 'energy',
    titleKey: 'checkin.brainQ3',
    options: [
      { value: 'Normal',       labelKey: 'checkin.optEnergy0', points: 0 },
      { value: 'A bit tired',  labelKey: 'checkin.optEnergy1', points: 1 },
      { value: 'Very tired',   labelKey: 'checkin.optEnergy2', points: 2 },
      { value: 'Cannot get up', labelKey: 'checkin.optEnergy3', points: 3 },
    ],
  },
  {
    key: 'nausea',
    titleKey: 'checkin.brainQ4',
    options: [
      { value: 'None',               labelKey: 'checkin.optNausea0', points: 0 },
      { value: 'Feeling sick',        labelKey: 'checkin.optNausea1', points: 1 },
      { value: 'Vomited once',        labelKey: 'checkin.optNausea2', points: 2 },
      { value: 'Vomited many times',  labelKey: 'checkin.optNausea3', points: 3 },
    ],
  },
  {
    key: 'medication',
    titleKey: 'checkin.brainQ5',
    options: [
      { value: 'Yes (all doses)',    labelKey: 'checkin.optMed0', points: 0 },
      { value: 'Missed one dose',    labelKey: 'checkin.optMed1', points: 1 },
      { value: 'Missed all doses',   labelKey: 'checkin.optMed2', points: 2 },
      { value: 'No medication today', labelKey: 'checkin.optMed3', points: 0 },
    ],
  },
  {
    key: 'overall',
    titleKey: 'checkin.brainQ6',
    options: [
      { value: 'Good',                labelKey: 'checkin.optOverall0', points: 0 },
      { value: 'Same as usual',       labelKey: 'checkin.optOverall1', points: 1 },
      { value: 'Worse than yesterday', labelKey: 'checkin.optOverall2', points: 2 },
      { value: 'Much worse',           labelKey: 'checkin.optOverall3', points: 3 },
    ],
  },
  {
    key: 'sleep',
    titleKey: 'checkin.brainQ7',
    options: [
      { value: 'Well',       labelKey: 'checkin.optSleep0', points: 0 },
      { value: 'Okay',       labelKey: 'checkin.optSleep1', points: 1 },
      { value: 'Poor',       labelKey: 'checkin.optSleep2', points: 2 },
      { value: 'Very little', labelKey: 'checkin.optSleep3', points: 3 },
    ],
  },
  {
    key: 'appetite',
    titleKey: 'checkin.brainQ8',
    options: [
      { value: 'Normal',       labelKey: 'checkin.optAppetite0', points: 0 },
      { value: 'Slightly low', labelKey: 'checkin.optAppetite1', points: 1 },
      { value: 'Very low',     labelKey: 'checkin.optAppetite2', points: 2 },
      { value: 'Could not eat', labelKey: 'checkin.optAppetite3', points: 3 },
    ],
  },
]

const NORMAL_QUESTIONS = [
  {
    key: 'headache',
    titleKey: 'checkin.normalQ1',
    options: [
      { value: 'No headache',        labelKey: 'checkin.optHeadache0', points: 0 },
      { value: 'Mild (a little)',     labelKey: 'checkin.optHeadache1', points: 1 },
      { value: 'Moderate (painful)', labelKey: 'checkin.optHeadache2', points: 2 },
      { value: 'Severe (very bad)',   labelKey: 'checkin.optHeadache3', points: 3 },
    ],
  },
  {
    key: 'seizure',
    titleKey: 'checkin.normalQ2',
    warningKey: 'checkin.q2Warning',
    options: [
      { value: 'No',          labelKey: 'checkin.optSeizure0', points: 0 },
      { value: 'Yes (brief)', labelKey: 'checkin.optSeizure1', points: 5 },
      { value: 'Yes (long)',  labelKey: 'checkin.optSeizure2', points: 5 },
    ],
  },
  {
    key: 'energy',
    titleKey: 'checkin.normalQ3',
    options: [
      { value: 'Normal',        labelKey: 'checkin.optEnergy0', points: 0 },
      { value: 'A bit tired',   labelKey: 'checkin.optEnergy1', points: 1 },
      { value: 'Very tired',    labelKey: 'checkin.optEnergy2', points: 2 },
      { value: 'Cannot get up', labelKey: 'checkin.optEnergy3', points: 3 },
    ],
  },
  {
    key: 'medication',
    titleKey: 'checkin.normalQ4',
    options: [
      { value: 'Yes (all doses)',    labelKey: 'checkin.optMed0', points: 0 },
      { value: 'Missed one dose',    labelKey: 'checkin.optMed1', points: 1 },
      { value: 'Missed all doses',   labelKey: 'checkin.optMed2', points: 2 },
      { value: 'No medication today', labelKey: 'checkin.optMed3', points: 0 },
    ],
  },
  {
    key: 'overall',
    titleKey: 'checkin.normalQ5',
    options: [
      { value: 'Good',                labelKey: 'checkin.optOverall0', points: 0 },
      { value: 'Same as usual',       labelKey: 'checkin.optOverall1', points: 1 },
      { value: 'Worse than yesterday', labelKey: 'checkin.optOverall2', points: 2 },
      { value: 'Much worse',           labelKey: 'checkin.optOverall3', points: 3 },
    ],
  },
  {
    key: 'sleep',
    titleKey: 'checkin.normalQ6',
    options: [
      { value: 'Well',        labelKey: 'checkin.optSleep0', points: 0 },
      { value: 'Okay',        labelKey: 'checkin.optSleep1', points: 1 },
      { value: 'Poor',        labelKey: 'checkin.optSleep2', points: 2 },
      { value: 'Very little', labelKey: 'checkin.optSleep3', points: 3 },
    ],
  },
  {
    key: 'appetite',
    titleKey: 'checkin.normalQ7',
    options: [
      { value: 'Normal',        labelKey: 'checkin.optAppetite0', points: 0 },
      { value: 'Slightly low',  labelKey: 'checkin.optAppetite1', points: 1 },
      { value: 'Very low',      labelKey: 'checkin.optAppetite2', points: 2 },
      { value: 'Could not eat', labelKey: 'checkin.optAppetite3', points: 3 },
    ],
  },
]

const URGENT_FOLLOW_UPS = {
  headache: {
    key: 'headache_followup',
    titleKey: 'checkin.fuHeadacheTitle',
    warningKey: 'checkin.fuHeadacheWarn',
    options: [
      { value: 'Yes, already informed', labelKey: 'checkin.fuHeadacheOpt0', points: 0 },
      { value: 'Not yet',               labelKey: 'checkin.fuHeadacheOpt1', points: 0 },
    ],
  },
  seizure: {
    key: 'seizure_followup',
    titleKey: 'checkin.fuSeizureTitle',
    warningKey: 'checkin.fuSeizureWarn',
    options: [
      { value: 'Yes, already contacted', labelKey: 'checkin.fuSeizureOpt0', points: 0 },
      { value: 'Not yet',                labelKey: 'checkin.fuSeizureOpt1', points: 0 },
    ],
  },
  nausea: {
    key: 'vomit_followup',
    titleKey: 'checkin.fuVomitTitle',
    warningKey: 'checkin.fuVomitWarn',
    options: [
      { value: 'Yes', labelKey: 'checkin.fuVomitOpt0', points: 0 },
      { value: 'No',  labelKey: 'checkin.fuVomitOpt1', points: 0 },
    ],
  },
}

function monitoringPlan(tumourType) {
  const value = (tumourType || '').toLowerCase()
  if (!value || value === 'not classified') return { label: 'Reminder not configured', color: '#64748b' }
  if (value.includes('no tumor') || value.includes('no tumour')) return { label: 'No reminder', color: '#64748b' }
  if (value.includes('grade i') || value.includes('grade ii')) return { label: 'Weekly reminder', color: '#0f766e' }
  if (value.includes('grade iii') || value.includes('grade iv')) return { label: 'Daily reminder', color: '#0d9488' }
  return { label: 'Reminder not configured', color: '#64748b' }
}

function scoreAnswer(questionKey, value) {
  const all = [...BRAIN_QUESTIONS, ...NORMAL_QUESTIONS]
  const question = all.find(q => q.key === questionKey)
  return question?.options.find(option => option.value === value)?.points ?? 0
}

function resolveUserType(patient, storedUserType) {
  if (storedUserType === 'normal_user' || storedUserType === 'brain_tumor_patient') return storedUserType
  const tumourType = (patient?.tumour_type || '').toLowerCase()
  if (tumourType.includes('no tumor') || tumourType.includes('no tumour')) return 'normal_user'
  return 'brain_tumor_patient'
}

function draftStorageKey(patient, userType) {
  return `checkin_saved_${patient.hospital_id || patient.id || 'anon'}_${userType}`
}

function buildQuestionFlow(userType, answers) {
  const base = userType === 'normal_user' ? NORMAL_QUESTIONS : BRAIN_QUESTIONS
  const flow = []
  for (const question of base) {
    flow.push(question)
    if (question.key === 'headache' && answers.headache === 'Severe (very bad)') flow.push(URGENT_FOLLOW_UPS.headache)
    if (question.key === 'seizure' && answers.seizure && answers.seizure !== 'No') flow.push(URGENT_FOLLOW_UPS.seizure)
    if (question.key === 'nausea' && answers.nausea === 'Vomited many times') flow.push(URGENT_FOLLOW_UPS.nausea)
  }
  return flow
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const patient = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const location = useLocation()
  const forcedUserType = location?.state?.forceUserType
  const userType = forcedUserType || resolveUserType(patient, localStorage.getItem('mobile_user_type'))
  const [showForcedBanner, setShowForcedBanner] = useState(false)
  const tumourGrade = localStorage.getItem('mobile_tumour_grade') || patient.tumour_type || ''
  const reminder = useMemo(() => monitoringPlan(patient.tumour_type), [patient.tumour_type])
  const draftKey = draftStorageKey(patient, userType)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ headache: '', headache_followup: '', seizure: '', seizure_followup: '', energy: '', nausea: '', vomit_followup: '', medication: '', overall: '', sleep: '', appetite: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifyResult, setNotifyResult] = useState('')
  const [latest, setLatest] = useState(null)
  const QUESTIONS = useMemo(() => buildQuestionFlow(userType, answers), [userType, answers])

  useEffect(() => {
    if (!patient.id) { navigate('/login', { replace: true }); return }
    let mounted = true
    api('/mobile/checkins/latest').then(data => { if (mounted) setLatest(data || null) }).catch(() => { if (mounted) setLatest(null) })
    return () => { mounted = false }
  }, [navigate, patient.id])

  useEffect(() => {
    if (forcedUserType) {
      setShowForcedBanner(true)
      const timer = setTimeout(() => setShowForcedBanner(false), 900)
      return () => clearTimeout(timer)
    }
  }, [forcedUserType])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.answers) setAnswers(prev => ({ ...prev, ...parsed.answers }))
        if (typeof parsed.primaryStep === 'number') setStep(parsed.primaryStep)
      }
    } catch {}
  }, [draftKey])

  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify({ primaryStep: step, answers, userType, tumourGrade })) } catch {}
  }, [answers, step, userType, tumourGrade, draftKey])

  useEffect(() => {
    if (step >= QUESTIONS.length) setStep(Math.max(0, QUESTIONS.length - 1))
  }, [QUESTIONS.length, step])

  const safeStep   = Math.min(step, Math.max(0, QUESTIONS.length - 1))
  const current    = QUESTIONS[safeStep]
  const isLast     = safeStep === QUESTIONS.length - 1
  const canProceed = !!answers[current?.key]

  const totalScore = useMemo(() => QUESTIONS.reduce((sum, q) => sum + scoreAnswer(q.key, answers[q.key]), 0), [answers, QUESTIONS])

  const seizureSelected         = answers.seizure && answers.seizure !== 'No'
  const severeHeadacheSelected  = answers.headache === 'Severe (very bad)'
  const repeatedVomitingSelected = answers.nausea === 'Vomited many times'

  const emergencyActionStyle   = { minHeight:46, padding:'10px 12px', borderRadius:10, fontSize:14, background:'#0f766e', color:'#fff', fontWeight:800, border:'none', cursor:'pointer', lineHeight:1.15, boxSizing:'border-box' }
  const emergencyOutlineStyle  = { ...emergencyActionStyle, background:'#fff', color:'#b91c1c', border:'1px solid #fecaca' }
  const emergencyDialStyle     = { ...emergencyActionStyle, background:'#ef4444' }
  const emergencyNotifyStyle   = { ...emergencyActionStyle, background:'#f97316' }
  const emergencySubmitStyle   = { ...emergencyActionStyle, background:'#0f766e' }
  const emergencyComboStyle    = { ...emergencyActionStyle, background:'#b91c1c' }

  function choose(optionValue, key = current.key) {
    setError('')
    setAnswers(prev => ({ ...prev, [key]: optionValue }))
  }

  function next() { if (canProceed && !isLast) setStep(prev => prev + 1) }
  function back() { if (step > 0) setStep(prev => prev - 1) }

  async function submit() {
    if (!canProceed || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const branchNotes = [
        severeHeadacheSelected    ? `Severe headache follow-up: ${answers.headache_followup || 'not answered'}` : null,
        seizureSelected           ? `Seizure follow-up: ${answers.seizure_followup || 'not answered'}` : null,
        repeatedVomitingSelected  ? `Vomiting follow-up: ${answers.vomit_followup || 'not answered'}` : null,
      ].filter(Boolean)

      let note = [answers.note, ...branchNotes].filter(Boolean).join(' | ') || null
      if (note && note.length > 140) note = note.slice(0, 137).trim() + '…'

      const payload = {
        headache: answers.headache, seizure: answers.seizure, energy: answers.energy,
        nausea: answers.nausea, medication: answers.medication, overall: answers.overall,
        sleep: answers.sleep || null, appetite: answers.appetite || null,
        note, trigger_source: 'Patient taps "Daily Check-in"',
      }
      const saved = await api('/mobile/checkins', { method: 'POST', body: payload })
      localStorage.setItem('mobile_latest_checkin', JSON.stringify(saved))
      navigate('/result', { state: saved })
    } catch (err) {
      if (err && (err.status === 401 || (err.message || '').toLowerCase().includes('token') || (err.message || '').toLowerCase().includes('unauthorized'))) {
        localStorage.removeItem('mobile_token')
        setError(t('checkin.authError'))
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || t('checkin.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ci-card:active { transform: scale(0.99); }
        .ci-option:active { transform: scale(0.99); }
      `}</style>

      <div style={{ background:'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', padding:'48px 20px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-34, right:-28, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <BackButton variant="glass" to="/home" />
        <div style={{ animation:'fadeUp 0.35s ease both', marginTop:14 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.72)', marginBottom:8 }}>{t('checkin.header')}</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{patient.name || '—'}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.74)', marginTop:6 }}>{t('checkin.subheader')}</div>
        </div>
      </div>

      <div style={{ flex:1, background:'#fff', borderRadius:'24px 24px 0 0', marginTop:6, padding:'16px 20px 82px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
        {showForcedBanner && (
          <div style={{ marginBottom:10, padding:'10px 12px', borderRadius:12, background:'#ecfeff', border:'1px solid #bbf7d0', color:'#064e3b', fontWeight:700 }}>{t('checkin.openingBrain')}</div>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8' }}>{t('checkin.healthCheckin')}</div>
          <div style={{ fontSize:12, color:'#0f766e', fontWeight:700 }}>{safeStep + 1} {t('checkin.of')} {QUESTIONS.length}</div>
        </div>

        <div style={{ height:10, borderRadius:999, background:'#e2e8f0', overflow:'hidden', marginBottom:14 }}>
          <div style={{ width:`${((safeStep + 1) / QUESTIONS.length) * 100}%`, height:'100%', background:'linear-gradient(90deg, #0d9488, #2dd4bf)', borderRadius:999 }} />
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:8 }}>{t(current.titleKey)}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {current.options.map(option => {
              const active = answers[current.key] === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  className="ci-option"
                  onClick={() => choose(option.value)}
                  style={{
                    textAlign:'left', border:'1px solid', borderColor: active ? '#0d9488' : '#e2e8f0',
                    background: active ? '#f0fdfa' : '#fff', borderRadius:14, padding:'12px 14px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
                  }}
                >
                  <span style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>○ {t(option.labelKey)}</span>
                  <span style={{ fontSize:12, fontWeight:800, color: active ? '#0f766e' : '#94a3b8' }}>[{option.points} pts]</span>
                </button>
              )
            })}
          </div>

          {current.warningKey && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:12, background:'#fff7ed', border:'1px solid #fed7aa', color:'#9a3412', fontSize:12, fontWeight:700 }}>
              ⚠ {t(current.warningKey)}
            </div>
          )}

          {current.key === 'headache_followup' && severeHeadacheSelected && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:12, fontWeight:700 }}>
              {t('checkin.followupHeadacheNote')}
            </div>
          )}
          {current.key === 'seizure_followup' && seizureSelected && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:12, fontWeight:700 }}>
              {t('checkin.followupSeizureNote')}
            </div>
          )}
          {current.key === 'vomit_followup' && repeatedVomitingSelected && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:12, fontWeight:700 }}>
              {t('checkin.followupVomitNote')}
            </div>
          )}
        </div>

        {isLast && (
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748b', marginBottom:6 }}>{t('checkin.noteLabel')}</label>
            <textarea
              value={answers.note}
              onChange={e => setAnswers(prev => ({ ...prev, note: e.target.value }))}
              placeholder={t('checkin.notePlaceholder')}
              rows={4}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:14, padding:'12px 14px', fontSize:14, color:'#0f172a', resize:'vertical', outline:'none', fontFamily:"'DM Sans', sans-serif" }}
            />
          </div>
        )}

        {seizureSelected && (
          <div style={{ marginBottom:14, padding:'12px 14px', borderRadius:14, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:13, fontWeight:700 }}>
            {t('checkin.seizureCritical')}
          </div>
        )}

        {(seizureSelected || severeHeadacheSelected || repeatedVomitingSelected) && (
          <div style={{ marginBottom:14, padding:14, borderRadius:12, background:'#fff1f2', border:'1px solid #fecaca' }}>
            <div style={{ fontSize:15, fontWeight:900, color:'#7f1d1d', marginBottom:8 }}>{t('checkin.emergencyTitle')}</div>
            <div style={{ fontSize:13, color:'#7f1d1d', marginBottom:10 }}>{t('checkin.emergencyDesc')}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:8, marginBottom:6 }}>
              <a href="tel:1990" onClick={() => { try { window.location.href = 'tel:1990' } catch {} }} style={{ ...emergencyDialStyle, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', textDecoration:'none' }}>{t('checkin.callEmergency')}</a>
              <button disabled={notifyLoading} onClick={async () => {
                setNotifyLoading(true); setNotifyResult('')
                try {
                  await api('/mobile/notify', { method: 'POST', body: { message: `Urgent: ${patient.name || patient.hospital_id || 'patient'} reports red-flag symptoms via Daily Check-in.` } })
                  setNotifyResult(t('checkin.clinicianNotified'))
                } catch {
                  setNotifyResult(t('checkin.notifyFailed'))
                } finally { setNotifyLoading(false) }
              }} style={emergencyNotifyStyle}>{notifyLoading ? t('checkin.notifying') : t('checkin.notifyClinician')}</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:8 }}>
              <button onClick={() => navigate('/emergency')} style={emergencyOutlineStyle}>{t('checkin.openSOS')}</button>
              <button disabled={submitting} onClick={async () => { try { await submit() } catch {} }} style={emergencySubmitStyle}>{t('checkin.submitCheckinBtn')}</button>
              <button disabled={notifyLoading || submitting} onClick={async () => {
                setNotifyLoading(true); setNotifyResult('')
                try {
                  await api('/mobile/notify', { method: 'POST', body: { message: `Urgent: ${patient.name || patient.hospital_id || 'patient'} reports red-flag symptoms via Daily Check-in.` } })
                  await submit()
                } catch {
                  setNotifyResult(t('checkin.notifySubmitFailed'))
                } finally { setNotifyLoading(false) }
              }} style={{ ...emergencyComboStyle, gridColumn:'1 / -1' }}>{t('checkin.notifyAndSubmit')}</button>
            </div>
            {notifyResult && <div style={{ marginTop:10, fontSize:13, color:'#334155' }}>{notifyResult}</div>}
          </div>
        )}

        {error && <div style={{ marginBottom:14, padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:13 }}>{error}</div>}

        <div style={{ display:'flex', gap:10, marginTop:6 }}>
          <button onClick={back} disabled={step === 0 || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'1px solid #e2e8f0', background: step === 0 ? '#f8fafc' : '#fff', color:'#334155', fontWeight:700, cursor: step === 0 ? 'not-allowed' : 'pointer' }}>{t('checkin.back')}</button>
          {!isLast ? (
            <button onClick={next} disabled={!canProceed || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'none', background: canProceed ? '#0d9488' : '#d1d5db', color:'#fff', fontWeight:800, cursor: canProceed ? 'pointer' : 'not-allowed' }}>{t('checkin.next')} →</button>
          ) : (
            <button onClick={submit} disabled={!canProceed || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'none', background: canProceed ? '#0d9488' : '#d1d5db', color:'#fff', fontWeight:800, cursor: canProceed ? 'pointer' : 'not-allowed' }}>{submitting ? t('checkin.submitting') : t('checkin.submit')}</button>
          )}
        </div>

        {latest && (
          <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#f0fdfa', border:'1px solid #ccfbf1' }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0f766e', marginBottom:6 }}>{t('checkin.lastSubmitted')}</div>
            <div style={{ fontSize:13, color:'#0f766e', lineHeight:1.7 }}>
              Score {latest.score} · {latest.level} · {latest.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
