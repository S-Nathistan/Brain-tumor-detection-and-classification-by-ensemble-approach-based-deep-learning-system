import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'

// Parse medications field — supports JSON array (new format) and plain text (legacy)
function parseMedications(raw) {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length) return { type: 'structured', items: parsed }
  } catch {}
  return { type: 'text', text: raw.trim() }
}

const SLOT_LABEL = { '08:00': 'Morning', '21:00': 'Night' }
const SLOT_TIME  = { '08:00': '8:00 AM', '21:00': '9:00 PM' }

// Per-slot taken key: med_taken_<hospitalId>_<planId>_<medIdx>_<slot>_<date>
function takenKey(hospitalId, planId, medIdx, slot, date) {
  return `med_taken_${hospitalId}_${planId}_${medIdx}_${slot}_${date}`
}

export default function MedicationReminder() {
  const navigate    = useNavigate()
  const { t, i18n } = useTranslation()
  const lang        = (i18n.language || 'en').split('-')[0]
  const patient     = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const hospitalId  = patient.hospital_id || 'guest'
  const today       = new Date().toISOString().slice(0, 10)

  const [plans,      setPlans]      = useState([])
  const [totalPlans, setTotalPlans] = useState(null)  // null = not yet loaded
  const [loading,    setLoading]    = useState(true)
  const [taken,      setTaken]      = useState({})    // { key: true }

  function initPlans(data) {
    const raw      = data.treatment_plans || []
    const allPlans = raw
      .map(p => ({ ...p, _meds: parseMedications(p.medications) }))
      .filter(p => p._meds !== null)
    setTotalPlans(raw.length)
    setPlans(allPlans)

    // Hydrate taken state from localStorage
    const t_ = {}
    allPlans.forEach(plan => {
      if (plan._meds.type === 'structured') {
        plan._meds.items.forEach((med, i) => {
          (med.times || []).forEach(slot => {
            const k = takenKey(hospitalId, plan.id, i, slot, today)
            if (localStorage.getItem(k)) t_[k] = true
          })
        })
      }
    })
    setTaken(t_)
  }

  useEffect(() => {
    const cached = localStorage.getItem('mobile_report')
    if (cached) {
      try { initPlans(JSON.parse(cached)); setLoading(false) } catch {}
    }
    api('/mobile/report')
      .then(data => {
        initPlans(data)
        localStorage.setItem('mobile_report', JSON.stringify(data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  function markSlot(planId, medIdx, slot) {
    const k = takenKey(hospitalId, planId, medIdx, slot, today)
    localStorage.setItem(k, '1')
    setTaken(prev => ({ ...prev, [k]: true }))
    // Sync to backend (best-effort, non-blocking)
    api('/mobile/medication-log', {
      method: 'POST',
      body: { plan_id: planId, med_index: medIdx, slot, taken_date: today },
    }).catch(() => {})
  }

  function fmtDate() {
    return new Date().toLocaleDateString(
      lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long' }
    )
  }

  // Compute plan-level status from its slots
  function planStatus(plan) {
    if (plan._meds.type !== 'structured') return 'text'
    const now = new Date()
    let total = 0, done = 0, pastDue = 0
    plan._meds.items.forEach((med, i) => {
      (med.times || []).forEach(slot => {
        total++
        const k = takenKey(hospitalId, plan.id, i, slot, today)
        if (taken[k]) { done++; return }
        const [h, m] = slot.split(':').map(Number)
        const slotTime = new Date(); slotTime.setHours(h, m, 0, 0)
        if (now >= slotTime) pastDue++
      })
    })
    if (total === 0)   return 'none'
    if (done === total) return 'allDone'
    if (pastDue > 0)   return 'overdue'
    return 'upcoming'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f5f3ff 0%,#faf9ff 40%,#f8fafc 100%)', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-7px) rotate(5deg)} }
        @keyframes cardPop   { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .slot-btn { transition: all 0.18s ease; cursor: pointer; }
        .slot-btn:active { transform: scale(0.95); }
        .back-btn { transition: opacity 0.15s; }
        .back-btn:active { opacity: 0.65; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#4c1d95 0%,#6d28d9 55%,#7c3aed 100%)', padding: '76px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -28, left: -28, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: 70, width: 55, height: 55, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'floatSlow 6s ease-in-out infinite 1s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, right: 16, opacity: 0.07, pointerEvents: 'none' }}>
          <svg width="86" height="86" viewBox="0 0 24 24" fill="white">
            <rect x="3" y="8" width="18" height="8" rx="4" ry="4" />
            <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <button className="back-btn" onClick={() => navigate('/home')}
          style={{ position: 'absolute', top: 14, left: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 10, color: '#fff', padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          {t('medReminder.back')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="8" rx="4" ry="4" /><line x1="12" y1="8" x2="12" y2="16" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {t('medReminder.title')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{fmtDate()}</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 13 }}>
            {t('medReminder.loading')}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState t={t} totalPlans={totalPlans} />
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', paddingLeft: 2 }}>
              {t('medReminder.yourMeds')}
            </div>

            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                status={planStatus(plan)}
                taken={taken}
                onMark={markSlot}
                hospitalId={hospitalId}
                today={today}
                t={t}
                animDelay={i * 0.07}
              />
            ))}

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 13, padding: '12px 14px', display: 'flex', gap: 9, alignItems: 'flex-start', animation: 'fadeUp 0.4s ease 0.5s both' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.65 }}>{t('medReminder.footNote')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ t, totalPlans }) {
  const hint = totalPlans === 0
    ? t('medReminder.noPlansHint')   // "No care plans are on record for your account yet"
    : totalPlans > 0
      ? t('medReminder.noMedInPlans') // "You have care plans but none include medication details yet"
      : null

  return (
    <div style={{ background: '#fff', border: '1.5px solid #ede9fe', borderRadius: 18, padding: '40px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="8" rx="4" ry="4" /><line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95', marginBottom: 6 }}>{t('medReminder.noMeds')}</div>
      <div style={{ fontSize: 12, color: '#7c3aed', opacity: 0.7, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
        {hint || t('medReminder.noMedsSub')}
      </div>
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  allDone:  { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#22c55e', pulse: false },
  overdue:  { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', dot: '#f97316', pulse: true  },
  upcoming: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6', pulse: false },
  none:     { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', dot: '#94a3b8', pulse: false },
  text:     { bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe', dot: '#7c3aed', pulse: false },
}

function PlanCard({ plan, status, taken, onMark, hospitalId, today, t, animDelay }) {
  const sc    = STATUS_CFG[status] || STATUS_CFG.none
  const meds  = plan._meds

  function chipLabel() {
    if (status === 'allDone')  return t('medReminder.allDone')
    if (status === 'overdue')  return t('medReminder.overdue')
    if (status === 'upcoming') return t('medReminder.upcoming')
    return t('medReminder.fromPlan')
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #ede9fe', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(109,40,217,0.08)',
      animation: `cardPop 0.4s cubic-bezier(.34,1.56,.64,1) ${animDelay}s both`,
    }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#6d28d9,#a855f7)' }} />

      {/* Plan header */}
      <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {t('medReminder.fromPlan')}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', lineHeight: 1.3 }}>{plan.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '4px 10px', flexShrink: 0, marginTop: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, animation: sc.pulse ? 'pulse 1.8s infinite' : 'none' }} />
          <span style={{ fontSize: 9.5, fontWeight: 700, color: sc.text, whiteSpace: 'nowrap' }}>{chipLabel()}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#f3f0ff', margin: '0 14px' }} />

      {/* Medications */}
      <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meds.type === 'structured' ? (
          meds.items.map((med, i) => (
            <MedRow
              key={i}
              med={med}
              medIdx={i}
              planId={plan.id}
              taken={taken}
              onMark={onMark}
              hospitalId={hospitalId}
              today={today}
              t={t}
            />
          ))
        ) : (
          // Legacy plain-text fallback
          <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '11px 12px' }}>
            <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {meds.text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Medication row (one drug) ──────────────────────────────────────────────────

function MedRow({ med, medIdx, planId, taken, onMark, hospitalId, today, t }) {
  const slots = med.times || []

  return (
    <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '11px 12px' }}>
      {/* Drug name + dosage */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{med.name}</span>
        {med.dosage && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: '#ede9fe', borderRadius: 6, padding: '1px 7px' }}>
            {med.dosage}
          </span>
        )}
      </div>

      {/* Food instruction */}
      {med.food && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          {t(`medReminder.food_${med.food}`)}
        </div>
      )}

      {/* Time slots */}
      {slots.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {slots.map(slot => {
            const k      = takenKey(hospitalId, planId, medIdx, slot, today)
            const isDone = !!taken[k]

            // Is this slot overdue?
            const now = new Date()
            const [h, m_] = slot.split(':').map(Number)
            const slotTime = new Date(); slotTime.setHours(h, m_, 0, 0)
            const isOverdue = !isDone && now >= slotTime

            return (
              <button
                key={slot}
                className="slot-btn"
                onClick={() => !isDone && onMark(planId, medIdx, slot)}
                disabled={isDone}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                  border: isDone
                    ? '1.5px solid #bbf7d0'
                    : isOverdue
                      ? '1.5px solid #fed7aa'
                      : '1.5px solid #c4b5fd',
                  background: isDone
                    ? '#f0fdf4'
                    : isOverdue
                      ? '#fff7ed'
                      : '#fff',
                  color: isDone
                    ? '#166534'
                    : isOverdue
                      ? '#9a3412'
                      : '#4c1d95',
                  cursor: isDone ? 'default' : 'pointer',
                  transition: 'all 0.18s ease',
                }}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? '#f97316' : '#7c3aed'} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
                {SLOT_LABEL[slot] || slot} · {SLOT_TIME[slot] || slot}
              </button>
            )
          })}
        </div>
      )}

      {/* No times set */}
      {slots.length === 0 && (
        <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>{t('medReminder.noTimesSet')}</div>
      )}
    </div>
  )
}
