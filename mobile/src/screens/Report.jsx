import { useEffect, useState } from 'react'
import { useNavigate }        from 'react-router-dom'
import { useTranslation }     from 'react-i18next'
import { api }                from '../api'
import { getProfileKey, PROFILES } from './educationContent'
import BackButton             from './BackButton'

/* ─────────────────────────────────────────────────────────────────────────────
   MULTILINGUAL STRINGS (inline — no extra JSON keys needed)
───────────────────────────────────────────────────────────────────────────── */
const STR = {
  pending: {
    en: {
      badge:        'UNDER REVIEW',
      title:        'Awaiting Doctor Confirmation',
      sub:          'Your MRI scan has been analysed by our AI system. Your doctor is currently reviewing the results and will confirm your diagnosis shortly.',
      aiSays:       'AI Detected',
      confidence:   'Confidence',
      scanDate:     'Scan Date',
      note:         'This is a preliminary AI result only. Your official diagnosis will be confirmed by your doctor.',
      whileWait:    'While You Wait',
      whileWaitSub: 'Your doctor has not confirmed yet, but you can start learning about what the AI detected:',
      learnBtn:     'Learn about this condition',
    },
    si: {
      badge:        'සමාලෝචනය කෙරෙමින්',
      title:        'වෛද්‍ය තහවුරු කිරීමක් බලාපොරොත්තුවෙනි',
      sub:          'ඔබේ MRI ස්කෑනය අපගේ AI පද්ධතිය විශ්ලේෂණය කර ඇත. ඔබේ වෛද්‍යවරයා ප්‍රතිඵල සමාලෝචනය කර ඔබේ රෝග විනිශ්චය ශීඝ්‍රයෙන් තහවුරු කරනු ඇත.',
      aiSays:       'AI හඳුනාගත්',
      confidence:   'විශ්වාසය',
      scanDate:     'ස්කෑන් දිනය',
      note:         'මෙය ප්‍රාථමික AI ප්‍රතිඵලයක් පමණි. ඔබේ නිල රෝග විනිශ්චය ඔබේ වෛද්‍යවරයා විසින් තහවුරු කරනු ඇත.',
      whileWait:    'බලාසිටින අතරතුර',
      whileWaitSub: 'ඔබේ වෛද්‍යවරයා තවම තහවුරු කර නැත, නමුත් AI හඳුනාගත් රෝගය ගැන දැනගත හැකිය:',
      learnBtn:     'මෙම රෝගය ගැන කියවන්න',
    },
    ta: {
      badge:        'மதிப்பாய்வில் உள்ளது',
      title:        'மருத்துவர் உறுதிப்படுத்தலுக்கு காத்திருக்கிறோம்',
      sub:          'உங்கள் MRI ஸ்கேன் எங்கள் AI அமைப்பால் பகுப்பாய்வு செய்யப்பட்டது. உங்கள் மருத்துவர் முடிவுகளை மதிப்பாய்வு செய்து விரைவில் உங்கள் நோயை உறுதிப்படுத்துவார்.',
      aiSays:       'AI கண்டறிந்தது',
      confidence:   'நம்பகத்தன்மை',
      scanDate:     'ஸ்கேன் தேதி',
      note:         'இது ஒரு ஆரம்ப AI முடிவு மட்டுமே. உங்கள் அதிகாரப்பூர்வ நோய் கண்டறிதல் உங்கள் மருத்துவரால் உறுதிப்படுத்தப்படும்.',
      whileWait:    'காத்திருக்கும்போது',
      whileWaitSub: 'உங்கள் மருத்துவர் இன்னும் உறுதிப்படுத்தவில்லை, ஆனால் AI கண்டறிந்ததை பற்றி அறிந்துகொள்ளலாம்:',
      learnBtn:     'இந்த நிலை பற்றி படிங்கள்',
    },
  },
  confirmed: {
    en: {
      badge:        'DOCTOR CONFIRMED',
      confirmedBy:  'Confirmed by',
      scanDate:     'Scan Date',
      grade:        'Pathology Grade',
      confidence:   'AI Confidence',
      doctor:       'Your Doctor',
      diagnosis:    'Your Diagnosis',
      learnMore:    'Learn About Your Condition',
      footerNote:   'This report is prepared by your medical team. Discuss any questions with your doctor or nurse.',
    },
    si: {
      badge:        'වෛද්‍යවරයා තහවුරු කළා',
      confirmedBy:  'තහවුරු කළේ',
      scanDate:     'ස්කෑන් දිනය',
      grade:        'ව්‍යාධිවේද ශ්‍රේණිය',
      confidence:   'AI විශ්වාසය',
      doctor:       'ඔබේ වෛද්‍යවරයා',
      diagnosis:    'ඔබේ රෝග විනිශ්චය',
      learnMore:    'ඔබේ රෝගය ගැන දැනගන්න',
      footerNote:   'මෙම වාර්තාව ඔබේ වෛද්‍ය කණ්ඩායම විසින් සකස් කරනු ලැබේ. ඕනෑම ප්‍රශ්නයක් ඔබේ වෛද්‍යවරයා සමඟ සාකච්ඡා කරන්න.',
    },
    ta: {
      badge:        'மருத்துவர் உறுதிப்படுத்தினார்',
      confirmedBy:  'உறுதிப்படுத்தியவர்',
      scanDate:     'ஸ்கேன் தேதி',
      grade:        'நோய்க்குறி தரம்',
      confidence:   'AI நம்பகத்தன்மை',
      doctor:       'உங்கள் மருத்துவர்',
      diagnosis:    'உங்கள் நோய் கண்டறிதல்',
      learnMore:    'உங்கள் நிலை பற்றி அறிந்துகொள்ளுங்கள்',
      footerNote:   'இந்த அறிக்கை உங்கள் மருத்துவக் குழுவால் தயாரிக்கப்படுகிறது. எந்த கேள்வியையும் உங்கள் மருத்துவர் அல்லது நர்சிடம் கேளுங்கள்.',
    },
  },
  plans: {
    en: { title: 'Your Care Plan', empty: 'No care plan recorded yet', medications: 'Your Medicines', surgery: 'Surgery', nextDate: 'Next Appointment', by: 'Doctor' },
    si: { title: 'ඔබේ සත්කාර සැලැස්ම', empty: 'සත්කාර සැලැස්මක් ලියාපදිංචි නොවේ', medications: 'ඔබේ ඖෂධ', surgery: 'ශල්‍ය කර්මය', nextDate: 'ඊළඟ හමුවීම', by: 'වෛද්‍යවරයා' },
    ta: { title: 'உங்கள் சிகிச்சை திட்டம்', empty: 'சிகிச்சை திட்டம் பதிவு செய்யவில்லை', medications: 'உங்கள் மருந்துகள்', surgery: 'அறுவை சிகிச்சை', nextDate: 'அடுத்த சந்திப்பு', by: 'மருத்துவர்' },
  },
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONDITION THEME  (same accent colours as Education screen)
───────────────────────────────────────────────────────────────────────────── */
function getTheme(finalLabel) {
  const key     = getProfileKey(finalLabel)
  const profile = PROFILES[key]
  return {
    accent:   profile?.meta?.accent   || '#0d9488',
    accentBg: profile?.meta?.accentBg || '#f0fdfa',
    icon:     profile?.meta?.icon     || '—',
    name:     {
      en: profile?.meta?.name?.en || finalLabel || '—',
      si: profile?.meta?.name?.si || finalLabel || '—',
      ta: profile?.meta?.name?.ta || finalLabel || '—',
    },
  }
}

function statusStyle(status) {
  if (status === 'Active')    return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' }
  if (status === 'Completed') return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }
  return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' }
}

// Translate plan status labels into the patient's language
const STATUS_LABEL = {
  en: { Active: 'Active',    Completed: 'Completed', Planned: 'Planned',    Pending: 'Pending'    },
  si: { Active: 'සක්‍රිය', Completed: 'සම්පූර්ණ', Planned: 'සැලසුම්',  Pending: 'අපේක්ෂිත'  },
  ta: { Active: 'செயலில்',  Completed: 'முடிந்தது', Planned: 'திட்டமிட்டது', Pending: 'நிலுவையில்' },
}
function statusLabel(status, lang) {
  return STATUS_LABEL[lang]?.[status] ?? STATUS_LABEL.en[status] ?? status
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────────────────────────── */
export default function Report() {
  const navigate        = useNavigate()
  const { t, i18n }    = useTranslation()
  const lang            = (i18n.language || 'en').split('-')[0]
  const patient         = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api('/mobile/report')
      .then(d => {
        setData(d)
        // Cache for Home page notification
        localStorage.setItem('mobile_report', JSON.stringify(d))
        // If confirmed → mark home notification as seen (user opened the report)
        if (d?.scan?.doctor_confirmed) {
          localStorage.setItem(`report_notif_seen_${patient.hospital_id}`, 'true')
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const scan   = data?.scan
  const plans  = data?.treatment_plans || []
  const theme  = scan ? getTheme(scan.final_label) : null

  // Helper to pull from correct language + state
  const stateKey = scan?.doctor_confirmed ? 'confirmed' : 'pending'
  const s  = (k) => (STR[stateKey]?.[lang]  || STR[stateKey]?.en)?.[k]  || ''
  const sp = (k) => (STR.plans?.[lang]       || STR.plans?.en)?.[k]      || ''
  const conditionName = theme?.name?.[lang] || scan?.final_label || '—'

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes growBar { from { width:0 } to { width:var(--bar-w) } }
      `}</style>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        padding: '48px 20px 22px', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />

        <BackButton variant="glass" to="/home" />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 5, marginTop: 14 }}>
          {t('report.title')}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{patient.name || '—'}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{patient.hospital_id || '—'}</div>

        {/* Status chip — shown once data is loaded */}
        {!loading && scan && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10,
            background: scan.doctor_confirmed ? 'rgba(34,197,94,0.22)' : 'rgba(251,191,36,0.22)',
            border:    `1px solid ${scan.doctor_confirmed ? 'rgba(34,197,94,0.4)' : 'rgba(251,191,36,0.4)'}`,
            borderRadius: 20, padding: '4px 11px',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: scan.doctor_confirmed ? '#22c55e' : '#fbbf24',
              animation: scan.doctor_confirmed ? 'none' : 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: scan.doctor_confirmed ? '#d1fae5' : '#fef3c7' }}>
              {s('badge')}
            </span>
          </div>
        )}
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, padding: '16px 16px 82px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <LoadingState t={t} />
        ) : !scan ? (
          <NoScanState t={t} />
        ) : scan.doctor_confirmed ? (
          <ConfirmedReport
            scan={scan} plans={plans} theme={theme}
            conditionName={conditionName} lang={lang}
            patient={patient} s={s} sp={sp} navigate={navigate}
          />
        ) : (
          <PendingReport
            scan={scan} plans={plans} theme={theme}
            conditionName={conditionName} lang={lang}
            s={s} sp={sp} navigate={navigate}
          />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOADING STATE
───────────────────────────────────────────────────────────────────────────── */
function LoadingState({ t }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 13 }}>
      {t('report.loading')}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   NO SCAN STATE
───────────────────────────────────────────────────────────────────────────── */
function NoScanState({ t }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '36px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 9h6M9 12h4M9 15h3"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{t('report.noScan')}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>{t('report.noScanSub')}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   PENDING REPORT  — doctor hasn't confirmed yet
───────────────────────────────────────────────────────────────────────────── */
function PendingReport({ scan, plans, theme, conditionName, lang, s, sp, navigate }) {
  return (
    <>
      {/* ─ Under-review card ─ */}
      <div style={{ background: '#fff', border: '1.5px solid #fde68a', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease both', boxShadow: '0 2px 8px rgba(217,119,6,0.08)' }}>
        {/* amber top stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
        <div style={{ padding: '16px' }}>

          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#d97706' }}>{s('badge')}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e', marginTop: 1 }}>{s('title')}</div>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: '#78716c', lineHeight: 1.7, margin: '0 0 14px' }}>{s('sub')}</p>

          {/* AI preliminary result block */}
          <div style={{ background: '#fafaf9', border: '1px solid #e7e5e4', borderRadius: 10, padding: '13px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a8a29e', marginBottom: 10 }}>{s('aiSays')}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: theme?.accentBg || '#f0fdfa', border: `1px solid ${(theme?.accent || '#0d9488') + '33'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: theme?.accent || '#0d9488', flexShrink: 0 }}>
                {theme?.icon || '?'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#44403c', lineHeight: 1.2 }}>{conditionName}</div>
              </div>
            </div>

            {/* Confidence bar — muted colours (not official) */}
            {scan.confidence != null && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: '#a8a29e' }}>{s('confidence')}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#78716c' }}>{scan.confidence}%</span>
                </div>
                <div style={{ height: 5, background: '#e7e5e4', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scan.confidence}%`, background: '#c4b5a5', borderRadius: 3 }} />
                </div>
              </div>
            )}

            {scan.scanned_at && (
              <div style={{ fontSize: 10, color: '#a8a29e', marginTop: 4 }}>
                {s('scanDate')}: {new Date(scan.scanned_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, padding: '9px 11px', marginTop: 12, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span style={{ fontSize: 11, color: '#9a3412', lineHeight: 1.6 }}>{s('note')}</span>
          </div>
        </div>
      </div>

      {/* ─ While you wait — education teaser ─ */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', animation: 'fadeUp 0.4s ease 0.1s both', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: 10 }}>
          {s('whileWait')}
        </div>
        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65, margin: '0 0 12px' }}>{s('whileWaitSub')}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px', background: theme?.accentBg || '#f0fdfa', border: `1.5px solid ${(theme?.accent || '#0d9488') + '33'}`, borderRadius: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: theme?.accent || '#0d9488', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            {theme?.icon || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conditionName}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s('learnBtn')}</div>
          </div>
          <button
            onClick={() => navigate('/education')}
            style={{ background: theme?.accent || '#0d9488', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Learn →
          </button>
        </div>
      </div>

      {/* ─ Treatment plans (if any already assigned) ─ */}
      {plans.length > 0 && <TreatmentPlans plans={plans} lang={lang} sp={sp} />}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIRMED REPORT  — full professional view
───────────────────────────────────────────────────────────────────────────── */
function ConfirmedReport({ scan, plans, theme, conditionName, lang, patient, s, sp, navigate }) {
  const accent   = theme?.accent   || '#0d9488'
  const accentBg = theme?.accentBg || '#f0fdfa'

  return (
    <>
      {/* ─ Main diagnosis card ─ */}
      <div style={{ background: '#fff', border: `1.5px solid ${accent}33`, borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease both', boxShadow: `0 4px 20px ${accent}14` }}>
        {/* Condition-coloured accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }} />
        <div style={{ padding: '18px' }}>

          {/* Condition name + icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: accentBg, border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: accent, flexShrink: 0 }}>
              {theme?.icon || '?'}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 3 }}>
                {s('diagnosis')}
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{conditionName}</div>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 13, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {patient.assigned_doctor && (
              <DetailRow label={s('doctor')} value={patient.assigned_doctor} accent={accent} />
            )}
            {scan.scanned_at && (
              <DetailRow label={s('scanDate')} value={new Date(scan.scanned_at).toLocaleDateString()} />
            )}
          </div>

          {/* AI confidence bar */}
          {scan.confidence != null && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s('confidence')}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{scan.confidence}%</span>
              </div>
              <div style={{ height: 8, background: `${accent}18`, borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    '--bar-w': `${scan.confidence}%`,
                    height: '100%',
                    width: `${scan.confidence}%`,
                    background: `linear-gradient(90deg, ${accent}88, ${accent})`,
                    borderRadius: 4,
                    animation: 'growBar 0.8s ease 0.3s both',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─ Learn more button ─ */}
      <button
        onClick={() => navigate('/education')}
        style={{
          width: '100%', padding: '13px', background: accentBg,
          border: `1.5px solid ${accent}33`, borderRadius: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          cursor: 'pointer', animation: 'fadeUp 0.4s ease 0.1s both',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{s('learnMore')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* ─ Treatment plans ─ */}
      <TreatmentPlans plans={plans} lang={lang} sp={sp} showConfirmedNote />

      {/* ─ Footer note ─ */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start', animation: 'fadeUp 0.4s ease 0.2s both' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <p style={{ fontSize: 11, color: '#1e40af', margin: 0, lineHeight: 1.65 }}>{s('footerNote')}</p>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TREATMENT PLANS  (shared by both states)
───────────────────────────────────────────────────────────────────────────── */
function TreatmentPlans({ plans, lang, sp }) {
  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#94a3b8', marginBottom: 10 }}>
        {sp('title')}
      </div>
      {plans.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
          {sp('empty')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plans.map(plan => {
            const sc     = statusStyle(plan.status)
            const label  = statusLabel(plan.status, lang)
            // Patient-relevant fields only — medicines and surgery
            const fields = [
              plan.medications     && [sp('medications'), plan.medications],
              plan.surgery_details && [sp('surgery'),     plan.surgery_details],
            ].filter(Boolean)
            return (
              <div key={plan.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                {/* ─ Plan header ─ */}
                <div style={{ padding: '13px 14px', borderBottom: (fields.length || plan.plan_date || plan.created_by_name) ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', flex: 1, lineHeight: 1.3 }}>{plan.title}</div>
                    {/* Status badge — translated */}
                    <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '2px 9px', fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* ─ Doctor + date row ─ */}
                {(plan.created_by_name || plan.plan_date) && (
                  <div style={{ padding: '10px 14px', display: 'flex', gap: 14, flexWrap: 'wrap', borderBottom: fields.length ? '1px solid #f1f5f9' : 'none' }}>
                    {plan.created_by_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 600 }}>{plan.created_by_name}</span>
                      </div>
                    )}
                    {plan.plan_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {/* Label translated, date localized, space between them */}
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{sp('nextDate')}:</span>
                        <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 700 }}>
                          {new Date(plan.plan_date).toLocaleDateString(
                            lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-GB',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ─ Medicines / surgery ─ */}
                {fields.map(([fieldLabel, value], i) => (
                  <div key={i} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{fieldLabel}</div>
                    <div style={{ fontSize: 12.5, color: '#1e293b', lineHeight: 1.7, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAIL ROW  helper
───────────────────────────────────────────────────────────────────────────── */
function DetailRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: accent || '#1e293b', textAlign: 'right', maxWidth: '62%', lineHeight: 1.4 }}>{value}</span>
    </div>
  )
}
