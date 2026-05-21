import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'

const QUESTIONS = [
  {
    key: 'headache',
    title: 'Q1: Do you have a headache today?',
    options: [
      { label: 'No headache', points: 0 },
      { label: 'Mild (a little)', points: 1 },
      { label: 'Moderate (painful)', points: 2 },
      { label: 'Severe (very bad)', points: 3 },
    ],
  },
  {
    key: 'seizure',
    title: 'Q2: Did you have a seizure today?',
    options: [
      { label: 'No', points: 0 },
      { label: 'Yes (brief)', points: 5 },
      { label: 'Yes (long)', points: 5 },
    ],
    warning: 'If YES, go to hospital now.',
  },
  {
    key: 'energy',
    title: 'Q3: How is your energy today?',
    options: [
      { label: 'Normal', points: 0 },
      { label: 'A bit tired', points: 1 },
      { label: 'Very tired', points: 2 },
      { label: 'Cannot get up', points: 3 },
    ],
  },
  {
    key: 'nausea',
    title: 'Q4: Any nausea or vomiting?',
    options: [
      { label: 'None', points: 0 },
      { label: 'Feeling sick', points: 1 },
      { label: 'Vomited once', points: 2 },
      { label: 'Vomited many times', points: 3 },
    ],
  },
  {
    key: 'medication',
    title: 'Q5: Did you take your medication?',
    options: [
      { label: 'Yes (all doses)', points: 0 },
      { label: 'Missed one dose', points: 1 },
      { label: 'Missed all doses', points: 2 },
      { label: 'No medication today', points: 0 },
    ],
  },
  {
    key: 'overall',
    title: 'Q6: How are you feeling overall?',
    options: [
      { label: 'Good', points: 0 },
      { label: 'Same as usual', points: 1 },
      { label: 'Worse than yesterday', points: 2 },
      { label: 'Much worse', points: 3 },
    ],
  },
]

function monitoringPlan(tumourType) {
  const value = (tumourType || '').toLowerCase()
  if (!value || value === 'not classified') return { label: 'Reminder not configured', color: '#64748b' }
  if (value.includes('no tumor') || value.includes('no tumour')) return { label: 'No reminder', color: '#64748b' }
  if (value.includes('grade i') || value.includes('grade ii')) return { label: 'Weekly reminder', color: '#0f766e' }
  if (value.includes('grade iii') || value.includes('grade iv')) return { label: 'Daily reminder', color: '#0d9488' }
  return { label: 'Reminder not configured', color: '#64748b' }
}

function scoreAnswer(questionKey, value) {
  const question = QUESTIONS.find(q => q.key === questionKey)
  return question?.options.find(option => option.label === value)?.points ?? 0
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const patient = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const role = localStorage.getItem('mobile_role') || 'patient'
  const reminder = useMemo(() => monitoringPlan(patient.tumour_type), [patient.tumour_type])

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ headache: '', seizure: '', energy: '', nausea: '', medication: '', overall: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [latest, setLatest] = useState(null)

  useEffect(() => {
    if (!patient.id) {
      navigate('/login', { replace: true })
      return
    }

    let mounted = true
    api('/mobile/checkins/latest').then(data => {
      if (mounted) setLatest(data || null)
    }).catch(() => {
      if (mounted) setLatest(null)
    })

    return () => { mounted = false }
  }, [navigate, patient.id])

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1
  const canProceed = !!answers[current?.key]

  const totalScore = useMemo(() => {
    return QUESTIONS.reduce((sum, question) => sum + scoreAnswer(question.key, answers[question.key]), 0)
  }, [answers])

  const seizureSelected = answers.seizure && answers.seizure !== 'No'

  function choose(optionLabel) {
    setError('')
    setAnswers(prev => ({ ...prev, [current.key]: optionLabel }))
  }

  function next() {
    if (!canProceed) return
    if (!isLast) setStep(prev => prev + 1)
  }

  function back() {
    if (step > 0) setStep(prev => prev - 1)
  }

  async function submit() {
    if (!canProceed || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        headache: answers.headache,
        seizure: answers.seizure,
        energy: answers.energy,
        nausea: answers.nausea,
        medication: answers.medication,
        overall: answers.overall,
        note: answers.note,
        trigger_source: 'Patient taps "Daily Check-in"',
      }
      const saved = await api('/mobile/checkins', { method: 'POST', body: payload })
      localStorage.setItem('mobile_latest_checkin', JSON.stringify(saved))
      navigate('/result', { state: saved })
    } catch (err) {
      setError(err.message || 'Unable to submit check-in')
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

      <div style={{ background:'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', padding:'36px 24px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-34, right:-28, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />

        <div style={{ animation:'fadeUp 0.35s ease both' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.72)', marginBottom:8 }}>Daily Check-in</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{patient.name || '—'}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.74)', marginTop:6 }}>Start anytime with Daily Check-in.</div>
        </div>

          
      </div>

      <div style={{ display:'flex', justifyContent:'center' }}>
        <div style={{ width:'92%', maxWidth:640, marginTop:0, background:'#fff', borderRadius:12, padding:'12px 14px', boxShadow:'0 6px 20px rgba(2,6,23,0.08)' }}>
          <div style={{ display:'flex', gap:1, alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ flex:1, minWidth:100 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Hospital ID</div>
              <div style={{ fontSize:14, fontWeight:800, fontFamily:"'DM Mono', monospace", marginTop:6 }}>{patient.hospital_id || '—'}</div>
            </div>

            <div style={{ width:1, height:36, background:'rgb(65, 68, 73)', margin:'0 8px' }} />

            <div style={{ flex:1, minWidth:120 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Plan</div>
              <div style={{ fontSize:14, fontWeight:800, marginTop:6, fontFamily:"'DM Mono', monospace"}}>{reminder.label === 'Reminder not configured' ? 'Plan not set' : reminder.label}</div>
            </div>

            <div style={{ width:1, height:36, background:'rgb(65, 68, 73)', margin:'0 8px' }} />

            <div style={{ flex:1, minWidth:100 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Role</div>
              <div style={{ fontSize:14, fontWeight:800, marginTop:6 , fontFamily:"'DM Mono', monospace" }}>{role === 'caretaker' ? 'Caretaker' : 'Patient'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, background:'#fff', borderRadius:'24px 24px 0 0', marginTop:6, padding:'16px 20px 24px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8' }}>Daily Health Check-in</div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>{new Date().toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
          </div>
          <div style={{ fontSize:12, color:'#0f766e', fontWeight:700 }}>{step + 1} of {QUESTIONS.length}</div>
        </div>

        <div style={{ height:10, borderRadius:999, background:'#e2e8f0', overflow:'hidden', marginBottom:18 }}>
          <div style={{ width:`${((step + 1) / QUESTIONS.length) * 100}%`, height:'100%', background:'linear-gradient(90deg, #0d9488, #2dd4bf)', borderRadius:999 }} />
        </div>

        <div style={{ border:'1px solid #dbeafe', background:'#eff6ff', borderRadius:16, padding:'14px 16px', marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#1d4ed8', marginBottom:8 }}>How it works</div>
          <div style={{ fontSize:13, color:'#1e3a8a', lineHeight:1.7 }}>
            You can complete this check in when the app reminds you or whenever you want to record how you are feeling today.
          </div>
          <div style={{ marginTop:12, borderRadius:12, background:'#fff', border:'1px solid #bfdbfe', padding:'10px 12px' }}>
            <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#1d4ed8', marginBottom:4 }}>What to expect</div>
            <div style={{ fontSize:13, color:'#1e3a8a', lineHeight:1.6 }}>
              Answer a few simple questions, send the form, and see a clear result right away.
            </div>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:8 }}>{current.title}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {current.options.map(option => {
              const active = answers[current.key] === option.label
              return (
                <button
                  key={option.label}
                  type="button"
                  className="ci-option"
                  onClick={() => choose(option.label)}
                  style={{
                    textAlign:'left', border:'1px solid', borderColor: active ? '#0d9488' : '#e2e8f0',
                    background: active ? '#f0fdfa' : '#fff', borderRadius:14, padding:'12px 14px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
                  }}
                >
                  <span style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>○ {option.label}</span>
                  <span style={{ fontSize:12, fontWeight:800, color: active ? '#0f766e' : '#94a3b8' }}>[{option.points} pts]</span>
                </button>
              )
            })}
          </div>
          {current.warning && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:12, background:'#fff7ed', border:'1px solid #fed7aa', color:'#9a3412', fontSize:12, fontWeight:700 }}>
              ⚠ {current.warning}
            </div>
          )}
        </div>

        {isLast && (
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748b', marginBottom:6 }}>Any note for your doctor?</label>
            <textarea
              value={answers.note}
              onChange={e => setAnswers(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Optional text box"
              rows={4}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:14, padding:'12px 14px', fontSize:14, color:'#0f172a', resize:'vertical', outline:'none', fontFamily:"'DM Sans', sans-serif" }}
            />
          </div>
        )}

        {seizureSelected && (
          <div style={{ marginBottom:14, padding:'12px 14px', borderRadius:14, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:13, fontWeight:700 }}>
            Seizure YES means this check-in is treated as CRITICAL.
          </div>
        )}

        {error && <div style={{ marginBottom:14, padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:13 }}>{error}</div>}

        <div style={{ display:'flex', gap:10, marginTop:6 }}>
          <button onClick={back} disabled={step === 0 || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'1px solid #e2e8f0', background: step === 0 ? '#f8fafc' : '#fff', color:'#334155', fontWeight:700, cursor: step === 0 ? 'not-allowed' : 'pointer' }}>Back</button>
          {!isLast ? (
            <button onClick={next} disabled={!canProceed || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'none', background: canProceed ? '#0d9488' : '#d1d5db', color:'#fff', fontWeight:800, cursor: canProceed ? 'pointer' : 'not-allowed' }}>NEXT →</button>
          ) : (
            <button onClick={submit} disabled={!canProceed || submitting} style={{ flex:1, padding:'14px 12px', borderRadius:12, border:'none', background: canProceed ? '#0d9488' : '#d1d5db', color:'#fff', fontWeight:800, cursor: canProceed ? 'pointer' : 'not-allowed' }}>{submitting ? 'Submitting…' : 'SUBMIT CHECK-IN'}</button>
          )}
        </div>

        <div style={{ marginTop:18, padding:'14px 16px', borderRadius:16, background:'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94a3b8', marginBottom:8 }}>How to read your result</div>
          <div style={{ display:'grid', gap:10 }}>
            <div style={{ padding:'10px 12px', borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#166534', marginBottom:2 }}>Green</div>
              <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>A calm day. Keep going with your usual routine.</div>
            </div>
            <div style={{ padding:'10px 12px', borderRadius:12, background:'#fffbeb', border:'1px solid #fde68a' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#92400e', marginBottom:2 }}>Amber</div>
              <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>Something feels a little different. Keep an eye on it.</div>
            </div>
            <div style={{ padding:'10px 12px', borderRadius:12, background:'#fff7ed', border:'1px solid #fed7aa' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#c2410c', marginBottom:2 }}>Red</div>
              <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>Your care team should hear from you soon.</div>
            </div>
            <div style={{ padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#b91c1c', marginBottom:2 }}>Critical</div>
              <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>Please get urgent medical help right away.</div>
            </div>
            <div style={{ padding:'10px 12px', borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#b91c1c', marginBottom:2 }}>Seizure reported</div>
              <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>This is always treated as Critical.</div>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:12, color:'#0f766e', fontWeight:700 }}>Today’s score: {totalScore}</div>
        </div>

        {latest && (
          <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#f0fdfa', border:'1px solid #ccfbf1' }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0f766e', marginBottom:6 }}>Last Submitted</div>
            <div style={{ fontSize:13, color:'#0f766e', lineHeight:1.7 }}>
              Score {latest.score} · {latest.level} · {latest.message}
            </div>
          </div>
        )}
        <button onClick={() => navigate('/home')} style={{ width:'100%', marginTop:18, padding:'14px 16px', border:'none', borderRadius:12, background:'#0d9488', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer' }}> Back to Home</button>
      </div>
    </div>
  )
}