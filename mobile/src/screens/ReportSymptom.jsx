import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import BackButton from './BackButton'

/* ── Icons ─────────────────────────────────────────────────────────────────── */

const icons = {
  headache: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
      <path d="M9 17v1a3 3 0 0 0 6 0v-1" opacity=".5" />
    </svg>
  ),
  dizziness: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64" />
      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64" />
      <path d="M18 6l3-3-3-3M6 21l-3 3 3 3" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  nausea: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-7 7c0 4 3 6 3 9h8c0-3 3-5 3-9a7 7 0 0 0-7-7z" />
      <path d="M9 18v2a3 3 0 0 0 6 0v-2" opacity=".5" />
    </svg>
  ),
  vision: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" strokeWidth="1.6" opacity=".5" />
    </svg>
  ),
  fatigue: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" strokeWidth="2.5" />
      <path d="M8 6l-2-2M16 6l2-2" opacity=".4" />
    </svg>
  ),
  memory: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 4A5.5 5.5 0 0 0 4 9.5c0 2.5 1.3 4.7 3.3 5.9V18h9v-2.6A6.5 6.5 0 0 0 19 10a6.5 6.5 0 0 0-6.5-6.5" />
      <path d="M7.3 15.4A5.5 5.5 0 0 0 9.5 4" opacity=".4" />
      <path d="M10 18v3M14 18v3" opacity=".5" />
    </svg>
  ),
  speech: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" />
    </svg>
  ),
  tingling: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5v4M12 3v6M16 5v4" />
      <rect x="5" y="9" width="14" height="10" rx="3" />
      <path d="M8 19v2M12 19v2M16 19v2" opacity=".5" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r=".8" fill="currentColor" />
    </svg>
  ),
}

const SYMPTOM_TYPES = ['headache','dizziness','nausea','vision','fatigue','memory','speech','tingling','other']

// English labels sent to the backend (display uses t() for translations)
const SYMPTOM_EN_LABELS = {
  headache:  'Headache',
  dizziness: 'Dizziness',
  nausea:    'Nausea',
  vision:    'Vision changes',
  fatigue:   'Fatigue',
  memory:    'Memory / Confusion',
  speech:    'Speech difficulty',
  tingling:  'Tingling / Numbness',
  other:     'Other',
}

const MAX_CHARS = 300

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function ReportSymptom() {
  const navigate = useNavigate()
  const { t }    = useTranslation()
  const patient  = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('mobile_patient') || '{}') } catch { return {} }
  }, [])

  const [selectedTypes, setSelectedTypes] = useState([])
  const [description,   setDescription]  = useState('')
  const [loading,       setLoading]      = useState(false)
  const [error,         setError]        = useState('')
  const [sent,          setSent]         = useState(false)
  const [focusDesc,     setFocusDesc]    = useState(false)

  useEffect(() => {
    if (!patient.id) navigate('/login', { replace: true })
  }, [navigate, patient.id])

  function toggleType(key) {
    setSelectedTypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const canSubmit = selectedTypes.length > 0

  async function submit() {
    if (!canSubmit || loading) return
    setError('')
    setLoading(true)
    try {
      const typeLabel = selectedTypes.map(k => SYMPTOM_EN_LABELS[k]).join(', ')
      await api('/mobile/symptom-report', {
        method: 'POST',
        body: { symptom_type: typeLabel, description: description.trim() || null },
      })
      setSent(true)
    } catch {
      setError(t('symptom.errorSend'))
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ───────────────────────────────────────────────────────── */
  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0fdfa 0%,#e6fffa 40%,#fff 100%)', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <style>{`@keyframes popIn{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}} @keyframes fadeSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1) both', width: 90, height: 90, borderRadius: 28, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(13,148,136,.35)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div style={{ animation: 'fadeSlide .5s .25s ease both', textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f766e', letterSpacing: '-.3px' }}>{t('symptom.successTitle')}</div>
          <div style={{ marginTop: 10, fontSize: 14, color: '#475569', lineHeight: 1.7, maxWidth: 300 }}>{t('symptom.successMsg')}</div>
        </div>
        {selectedTypes.length > 0 && (
          <div style={{ animation: 'fadeSlide .5s .4s ease both', marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {selectedTypes.map(k => (
              <span key={k} style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', background: '#ccfbf1', border: '1px solid #99f6e4', borderRadius: 20, padding: '4px 12px' }}>
                {t(`symptom.types.${k}`)}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/home')}
          style={{ animation: 'fadeSlide .5s .55s ease both', marginTop: 32, padding: '14px 40px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(13,148,136,.3)', letterSpacing: '.2px' }}
        >
          {t('symptom.backHome')}
        </button>
      </div>
    )
  }

  /* ── Main form ────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .sym-tile { transition: all .18s ease; -webkit-tap-highlight-color: transparent; }
        .sym-tile:active { transform: scale(.94); }
        .desc-area:focus { border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,.12) !important; }
        .submit-btn:not(:disabled):hover { filter: brightness(1.06); }
        .submit-btn:not(:disabled):active { transform: scale(.98); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div style={{ background: 'linear-gradient(150deg,#0d9488 0%,#0f766e 60%,#115e59 100%)', padding: '46px 20px 36px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />

        <BackButton variant="glass" to="/home" />

        <div style={{ animation: 'fadeUp .4s ease both', marginTop: 18, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Medical icon */}
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 5 }}>NeuroSight · Symptom Log</div>
            <div style={{ fontSize: 21, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-.2px' }}>{t('symptom.title')}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.5 }}>{t('symptom.subtitle')}</div>
          </div>
        </div>

        {/* Patient badge */}
        {patient.name && (
          <div style={{ animation: 'fadeUp .4s .1s ease both', marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 24, padding: '5px 12px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{patient.name}</span>
            {patient.hospital_id && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', fontFamily: "'DM Mono',monospace" }}>· {patient.hospital_id}</span>}
          </div>
        )}
      </div>

      {/* ═══ BODY ══════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, padding: '20px 16px 100px' }}>

        {/* ── Guidance strip ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,.06)' }}>
          <div style={{ padding: '10px 14px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', marginBottom: 1 }}>{t('symptom.hintUrgentLabel')}</div>
              <div style={{ fontSize: 11, color: '#92400e' }}>{t('symptom.hintEmergency')}</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', marginBottom: 1 }}>{t('symptom.hintDailyLabel')}</div>
              <div style={{ fontSize: 11, color: '#1e40af' }}>{t('symptom.hintCheckin')}</div>
            </div>
          </div>
        </div>

        {/* ── Symptom selector ─────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(15,23,42,.06)', padding: '18px 14px', marginBottom: 14 }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: '#0d9488' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{t('symptom.selectType')}</div>
                <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{t('symptom.selectAllThat')}</div>
              </div>
            </div>
            {selectedTypes.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{selectedTypes.length}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0f766e' }}>{t('symptom.selectedCount')}</span>
              </div>
            ) : (
              <span style={{ fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic' }}>{t('symptom.noneYet')}</span>
            )}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {SYMPTOM_TYPES.map(key => {
              const active = selectedTypes.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  className="sym-tile"
                  onClick={() => toggleType(key)}
                  style={{
                    position: 'relative',
                    minHeight: 88,
                    borderRadius: 14,
                    border: active ? '1.5px solid #0d9488' : '1.5px solid #e2e8f0',
                    background: active ? 'linear-gradient(145deg,#0d9488,#0f766e)' : '#f8fafc',
                    padding: '12px 6px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: active ? '0 6px 18px rgba(13,148,136,.28)' : 'none',
                  }}
                >
                  {/* Check badge */}
                  {active && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  {/* Icon */}
                  <div style={{ color: active ? '#fff' : '#64748b' }}>
                    {icons[key]}
                  </div>
                  {/* Label */}
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: active ? '#fff' : '#334155', textAlign: 'center', lineHeight: 1.3, letterSpacing: '-.1px' }}>
                    {t(`symptom.types.${key}`)}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected pills row */}
          {selectedTypes.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedTypes.map(k => (
                <button key={k} onClick={() => toggleType(k)} type="button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 20, padding: '4px 10px', cursor: 'pointer' }}>
                  {t(`symptom.types.${k}`)}
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 2l8 8M10 2l-8 8" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Description ───────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(15,23,42,.06)', padding: '18px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: '#64748b' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{t('symptom.describeLabel')}</div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{t('symptom.describeHint')}</div>
            </div>
          </div>
          <textarea
            className="desc-area"
            value={description}
            onChange={e => { if (e.target.value.length <= MAX_CHARS) setDescription(e.target.value) }}
            onFocus={() => setFocusDesc(true)}
            onBlur={() => setFocusDesc(false)}
            placeholder={t('symptom.describePlaceholder')}
            rows={4}
            style={{
              width: '100%', border: `1.5px solid ${focusDesc ? '#0d9488' : '#e2e8f0'}`, borderRadius: 12, padding: '12px 14px',
              fontSize: 13.5, color: '#0f172a', resize: 'none', outline: 'none', fontFamily: "'DM Sans',sans-serif",
              boxSizing: 'border-box', lineHeight: 1.65, background: '#f8fafc',
              boxShadow: focusDesc ? '0 0 0 3px rgba(13,148,136,.1)' : 'none', transition: 'border-color .15s, box-shadow .15s',
            }}
          />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10.5, color: description.length > MAX_CHARS * 0.85 ? '#f59e0b' : '#94a3b8', fontFamily: "'DM Mono',monospace" }}>
              {description.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 14, padding: '11px 14px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12.5, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <button
          className="submit-btn"
          onClick={submit}
          disabled={!canSubmit || loading}
          style={{
            width: '100%', padding: '16px 12px', borderRadius: 16, border: 'none',
            background: canSubmit
              ? 'linear-gradient(135deg,#0d9488 0%,#0f766e 100%)'
              : '#e2e8f0',
            color: canSubmit ? '#fff' : '#94a3b8',
            fontWeight: 800, fontSize: 15, cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? '0 8px 24px rgba(13,148,136,.3)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background .2s, box-shadow .2s',
            letterSpacing: '.2px',
          }}
        >
          {loading ? (
            <>
              <svg style={{ animation: 'spin .8s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {t('symptom.submitting')}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {t('symptom.submit')}
            </>
          )}
        </button>

        {!canSubmit && (
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11.5, color: '#94a3b8' }}>
            {t('symptom.selectAtLeastOne')}
          </div>
        )}
      </div>
    </div>
  )
}
