import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import BackButton from './BackButton'

function EmergencyMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28" fill="none">
      <path d="M12 2.8 3.2 18.2A2 2 0 0 0 4.95 21h14.1a2 2 0 0 0 1.75-2.8L12 2.8Z" fill="currentColor" opacity="0.14" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none">
      <path d="M7.5 3.8c.4-.5 1-.7 1.7-.5l2.2.7c.7.2 1.2.9 1.1 1.6l-.2 1.8c0 .4.1.8.4 1.1l1.8 1.8c.3.3.7.4 1.1.4l1.8-.2c.7-.1 1.4.4 1.6 1.1l.7 2.2c.2.7 0 1.3-.5 1.7l-1.2.9c-.8.6-1.8.8-2.8.5-2.8-.9-5.3-2.7-7.4-4.8S4 9.2 3.1 6.4c-.3-1 .1-2 .9-2.8l1.2-.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none">
      <path d="M12 21s5.5-4.8 5.5-10a5.5 5.5 0 1 0-11 0c0 5.2 5.5 10 5.5 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M13.8 2.8 6.8 13h4.5L9.8 21.2 17.2 11H12.7l1.1-8.2Z" fill="currentColor" />
    </svg>
  )
}

function BrainPulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M9 4.5a3 3 0 0 0-3 3v1a3 3 0 0 0 1.1 2.3A3 3 0 0 0 9.5 15H10a2 2 0 0 1 2 2v1a2.5 2.5 0 0 0 2.5 2.5H15a3 3 0 0 0 3-3v-1.1a3 3 0 0 0 1.4-2.6V12a3 3 0 0 0-1.5-2.6A3 3 0 0 0 15 6h-.1A3 3 0 0 0 12 4.5h-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 10h2.2l1.1 2.2L11.7 9l1.2 2h3.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StomachIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M9 5.5c-1.7 0-3 1.3-3 3v3.2c0 1.6.8 3.1 2.2 3.9l1.5.9c.7.4 1.1 1.1 1.1 1.9V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 5.5c1.7 0 3 1.3 3 3v2.3c0 2.4-1.3 4.7-3.4 5.9l-1.1.6c-.6.3-1 .9-1 1.6V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M2.8 12s3.4-5.5 9.2-5.5S21.2 12 21.2 12s-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

function WarningPersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M12 2.8 3.4 18.2A1.8 1.8 0 0 0 5 21h14a1.8 1.8 0 0 0 1.6-2.8L12 2.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8.5v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.1" fill="currentColor" />
    </svg>
  )
}

function AmbulanceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none">
      <path d="M3.5 8.5h11v7h-11v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 11h3.1l2 2v2.5h-5.1V11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 18a1.4 1.4 0 1 0 0-.1V18Zm11 0a1.4 1.4 0 1 0 0-.1V18Z" fill="currentColor" opacity="0.25" />
      <path d="M6 11.2h2.6M7.3 9.9v2.6M16.2 13h2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// label/severity = English strings for backend alert messages
// labelKey/severityKey = i18n keys for UI display
const EMERGENCY_TYPES = [
  { key: 'seizure',  label: 'Seizure',               labelKey: 'emergency.typeSeizure',  icon: BoltIcon,          severity: 'Critical', severityKey: 'emergency.severityCritical' },
  { key: 'headache', label: 'Severe headache',        labelKey: 'emergency.typeHeadache', icon: BrainPulseIcon,    severity: 'High',     severityKey: 'emergency.severityHigh' },
  { key: 'vomiting', label: 'Repeated vomiting',      labelKey: 'emergency.typeVomiting', icon: StomachIcon,       severity: 'High',     severityKey: 'emergency.severityHigh' },
  { key: 'vision',   label: 'Blurred vision',          labelKey: 'emergency.typeVision',   icon: EyeIcon,           severity: 'High',     severityKey: 'emergency.severityHigh' },
  { key: 'collapse', label: 'Loss of consciousness',   labelKey: 'emergency.typeCollapse', icon: WarningPersonIcon, severity: 'Critical', severityKey: 'emergency.severityCritical' },
  { key: 'other',    label: 'Other urgent issue',      labelKey: 'emergency.typeOther',    icon: AmbulanceIcon,     severity: 'High',     severityKey: 'emergency.severityHigh' },
]

export default function Emergency() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const patient = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('mobile_patient') || '{}')
    } catch {
      return {}
    }
  }, [])
  const patientLabel = useMemo(() => {
    if (patient.name && patient.name !== 'Debug Patient') {
      return patient.name
    }
    return patient.hospital_id ? `ID ${patient.hospital_id}` : t('emergency.assignedPatient')
  }, [patient.hospital_id, patient.name])

  const [selected, setSelected] = useState('seizure')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [ambulance, setAmbulance] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const activeType = EMERGENCY_TYPES.find(item => item.key === selected)

  useEffect(() => {
    if (!patient.id) {
      navigate('/login', { replace: true })
    }
  }, [navigate, patient.id])

  useEffect(() => {
    if (!sent) return undefined
    const timer = setTimeout(() => navigate('/home', { replace: true }), 4000)
    return () => clearTimeout(timer)
  }, [sent, navigate])

  function useLiveLocation() {
    if (!navigator.geolocation) {
      setError(t('emergency.locationUnavailable'))
      return
    }
    setError('')
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords
        setLocation(`GPS ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`)
        setLocationLoading(false)
      },
      err => {
        setError(err?.code === 1 ? t('emergency.locationDenied') : t('emergency.locationError'))
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  async function submitEmergency() {
    const type = EMERGENCY_TYPES.find(item => item.key === selected)
    const finalDescription = description.trim()
    if (!finalDescription && selected === 'other') {
      setError(t('emergency.descRequired'))
      return
    }

    const messageParts = [
      `Emergency alert from ${patient.name || 'patient'} (${patient.hospital_id || 'unknown ID'})`,
      `Type: ${type?.label || selected}`,
      finalDescription ? `Symptoms: ${finalDescription}` : null,
      location ? `Location: ${location}` : null,
      ambulance ? 'Ambulance requested: Yes' : 'Ambulance requested: No',
      'Please review immediately in the web dashboard.',
    ].filter(Boolean)

    setLoading(true)
    setError('')
    try {
      await api('/mobile/notify', {
        method: 'POST',
        body: { message: messageParts.join(' | ') },
      })
      setSent(true)
    } catch {
      setError(t('emergency.sendError'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff5f5 0%, #fff 100%)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 28, padding: 28, textAlign: 'center', boxShadow: '0 20px 60px rgba(185,28,28,0.14)', border: '1px solid #fda4af' }}>
          <div style={{ width: 88, height: 88, borderRadius: 28, margin: '0 auto', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, color: '#b91c1c', border: '1px solid #fecaca' }}>✅</div>
          <div style={{ marginTop: 16, fontSize: 22, fontWeight: 900, color: '#7f1d1d' }}>{t('emergency.sentTitle')}</div>
          <div style={{ marginTop: 8, fontSize: 14, color: '#7f1d1d', lineHeight: 1.7 }}>{t('emergency.sentSub')}</div>
          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '8px 12px', background: '#fff1f2', color: '#b91c1c', fontSize: 12, fontWeight: 800, border: '1px solid #fecaca' }}>{t('emergency.sentReturning')}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff7f7 0%, #fff 28%, #fff 100%)', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 52%, #dc2626 100%)', padding: '52px 20px 24px', color: '#fff', position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, boxShadow: '0 18px 40px rgba(185,28,28,0.18)' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -45, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <BackButton variant="glass" to="/home" />
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '72px 1fr', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 62, height: 62, borderRadius: 22, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmergencyMarkIcon />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>{t('emergency.title')}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8, lineHeight: 1.6, maxWidth: 360 }}>{t('emergency.subheader')}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', padding: '8px 12px', fontSize: 12, fontWeight: 900 }}>{t('emergency.priority', { severity: t(activeType?.severityKey || 'emergency.severityHigh') })}</div>
            <div style={{ borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', padding: '8px 12px', fontSize: 12, fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('emergency.patient', { name: patientLabel })}</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 18, border: '1px solid #f3d1d1', boxShadow: '0 16px 36px rgba(185,28,28,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#b91c1c' }}>{t('emergency.typeLabel')}</div>
                <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4, lineHeight: 1.5 }}>{t('emergency.typeSub')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {EMERGENCY_TYPES.map(item => {
                const active = selected === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelected(item.key)}
                    style={{
                      minHeight: 92,
                      borderRadius: 20,
                      border: active ? '1px solid #b91c1c' : '1px solid #f3d1d1',
                      background: active ? '#fff1f2' : '#fff',
                      padding: '14px 14px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: active ? '0 8px 20px rgba(185,28,28,0.08)' : '0 1px 3px rgba(15,23,42,0.03)',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c', boxShadow: 'inset 0 0 0 1px rgba(185,28,28,0.12)', flexShrink: 0 }}>
                      <item.icon />
                    </div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#0f172a', lineHeight: 1.3 }}>{t(item.labelKey)}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{t(item.severityKey)}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#b91c1c', marginBottom: 6 }}>{t('emergency.symptomsLabel')}</label>
                <div style={{ marginBottom: 6, fontSize: 12, color: '#7f1d1d', lineHeight: 1.5 }}>{t('emergency.symptomsExample')}</div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('emergency.symptomsPlaceholder')}
                  rows={4}
                  style={{ width: '90%', borderRadius: 16, border: '1px solid #f3d1d1', background: '#fffdfd', color: '#7f1d1d', padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}
                />
              </div>

              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#b91c1c', marginBottom: 6 }}>{t('emergency.locationLabel')}</label>
                <div style={{ marginBottom: 6, fontSize: 12, color: '#7f1d1d', lineHeight: 1.5 }}>{t('emergency.locationSub')}</div>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder={t('emergency.locationPlaceholder')}
                  style={{ width: '90%', borderRadius: 16, border: '1px solid #f3d1d1', background: '#fffdfd', color: '#7f1d1d', padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button type="button" onClick={useLiveLocation} disabled={locationLoading} style={{ flex: 1, minHeight: 50, borderRadius: 14, border: '1px solid #f3d1d1', background: '#fff1f2', color: '#b91c1c', padding: '14px 14px', fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: locationLoading ? 0.8 : 1 }}>
                  {locationLoading ? t('emergency.gettingLocation') : t('emergency.useLiveLocation')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.location.href = 'tel:1990'
                    } catch {
                      window.open('tel:1990', '_self')
                    }
                  }}
                  style={{ flex: 1, minHeight: 50, borderRadius: 14, background: '#b91c1c', color: '#fff', padding: '14px 14px', fontSize: 13, fontWeight: 900, textAlign: 'center', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <PhoneIcon />
                  {t('emergency.call1990')}
                </button>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7f1d1d', fontSize: 13, fontWeight: 800 }}>
                <input type="checkbox" checked={ambulance} onChange={e => setAmbulance(e.target.checked)} />
                {t('emergency.ambulanceLabel')}
              </label>

              {error && (
                <div style={{ padding: '11px 12px', borderRadius: 14, background: '#fff1f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 700 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => navigate('/home')} style={{ flex: 1, minHeight: 50, borderRadius: 14, border: '1px solid #d1d5db', background: '#fff', color: '#7f1d1d', padding: '12px 12px', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>
                  {t('emergency.cancel')}
                </button>
                <button onClick={submitEmergency} disabled={loading} style={{ flex: 1, minHeight: 50, borderRadius: 14, border: 'none', background: '#b91c1c', color: '#fff', padding: '12px 12px', fontSize: 14, fontWeight: 900, cursor: 'pointer', opacity: loading ? 0.85 : 1 }}>
                  {loading ? t('emergency.sending') : t('emergency.sendSOS')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}