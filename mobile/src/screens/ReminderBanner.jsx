import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BOTTOM_NAV_HEIGHT } from './BottomNav'

const NAV_ROUTES = new Set(['/home', '/checkin', '/chat', '/education', '/report'])

// ── helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Is wall-clock now within [slot, slot+60min)?
function inWindow(slotHHMM) {
  const [h, m] = slotHHMM.split(':').map(Number)
  const now = new Date()
  const slotMin = h * 60 + m
  const nowMin  = now.getHours() * 60 + now.getMinutes()
  return nowMin >= slotMin && nowMin < slotMin + 60
}

function parseMedItems(raw) {
  try {
    const p = JSON.parse(raw || '')
    return Array.isArray(p) && p.length ? p : null
  } catch { return null }
}

function dismissKey(id)    { return `reminder_dismissed_${id}_${todayStr()}` }
function isDismissed(id)   { return !!localStorage.getItem(dismissKey(id)) }
function persistDismiss(id){ localStorage.setItem(dismissKey(id), '1') }

function checkinDoneToday() {
  try {
    const raw = localStorage.getItem('mobile_latest_checkin')
    if (!raw) return false
    const obj = JSON.parse(raw)
    return (obj.created_at || '').slice(0, 10) === todayStr()
  } catch { return false }
}

function buildReminders(pathname) {
  if (!localStorage.getItem('mobile_token')) return []

  const patient    = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const hospitalId = patient.hospital_id || ''
  const result     = []

  // ── 1. Daily check-in ────────────────────────────────────────────────────
  if (pathname !== '/checkin') {
    const slot = localStorage.getItem('reminder_time') || '20:00'
    const id   = `checkin-${slot}`
    if (inWindow(slot) && !checkinDoneToday() && !isDismissed(id)) {
      result.push({ id, type: 'checkin', slot, route: '/checkin' })
    }
  }

  // ── 2. Medication slots ───────────────────────────────────────────────────
  if (pathname !== '/medication-reminder') {
    const report = JSON.parse(localStorage.getItem('mobile_report') || '{}')
    const plans  = report.treatment_plans || []
    plans.forEach(plan => {
      const items = parseMedItems(plan.medications)
      if (!items) return
      items.forEach((med, idx) => {
        (med.times || []).forEach(slot => {
          const id       = `med-${plan.id}-${idx}-${slot}`
          const takenKey = `med_taken_${hospitalId}_${plan.id}_${idx}_${slot}_${todayStr()}`
          if (inWindow(slot) && !localStorage.getItem(takenKey) && !isDismissed(id)) {
            result.push({
              id, type: 'medication', slot, route: '/medication-reminder',
              name: med.name || 'Medication', dosage: med.dosage || '',
            })
          }
        })
      })
    })
  }

  return result
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ReminderBanner() {
  const navigate          = useNavigate()
  const { pathname }      = useLocation()
  const { t }             = useTranslation()
  const showNav           = NAV_ROUTES.has(pathname)
  const [reminders, setReminders] = useState([])

  const refresh = useCallback(() => {
    setReminders(buildReminders(pathname))
  }, [pathname])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  // also refresh immediately when tab regains focus (patient switches back)
  useEffect(() => {
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [refresh])

  if (reminders.length === 0) return null

  function handleAction(r) {
    navigate(r.route)
    setReminders(prev => prev.filter(x => x.id !== r.id))
  }

  function handleDismiss(r) {
    persistDismiss(r.id)
    setReminders(prev => prev.filter(x => x.id !== r.id))
  }

  const bottomPx = showNav ? BOTTOM_NAV_HEIGHT + 10 : 16

  return (
    <>
      <style>{`
        @keyframes reminderSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position:        'absolute',
        bottom:          bottomPx,
        left:            12,
        right:           12,
        zIndex:          9999,
        display:         'flex',
        flexDirection:   'column',
        gap:             8,
        pointerEvents:   'none',
      }}>
        {reminders.map(r => {
          const isCheckin = r.type === 'checkin'
          const accent    = isCheckin ? '#0d9488' : '#7c3aed'
          const bg        = isCheckin ? '#f0fdfa' : '#f5f3ff'
          const iconBg    = isCheckin ? '#ccfbf1' : '#ede9fe'
          const slotLabel = r.slot === '08:00' ? t('medReminder.morning') : r.slot === '21:00' ? t('medReminder.night') : r.slot
          const title     = isCheckin ? t('home.checkin') : `${slotLabel} — ${t('home.medication')}`
          const body      = isCheckin
            ? t('home.checkinSub')
            : `${r.name}${r.dosage ? ' · ' + r.dosage : ''}`

          return (
            <div key={r.id} style={{
              pointerEvents:   'auto',
              background:      bg,
              border:          `1.5px solid ${accent}50`,
              borderRadius:    18,
              padding:         '12px 14px',
              boxShadow:       '0 6px 24px rgba(0,0,0,0.13)',
              animation:       'reminderSlideUp 0.28s ease',
              display:         'flex',
              alignItems:      'center',
              gap:             12,
            }}>

              {/* Icon */}
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isCheckin ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="8" rx="4" ry="4"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                  </svg>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 2, letterSpacing: '-0.01em' }}>
                  {title}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {body}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
                <button
                  onClick={() => handleAction(r)}
                  style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '7px 13px', borderRadius: 10,
                    background: accent, color: '#fff',
                    border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                  {isCheckin ? t('medReminder.fillInNow') : t('medReminder.takeNow')}
                </button>
                <button
                  onClick={() => handleDismiss(r)}
                  title="Dismiss"
                  style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: 'rgba(0,0,0,0.06)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

            </div>
          )
        })}
      </div>
    </>
  )
}
