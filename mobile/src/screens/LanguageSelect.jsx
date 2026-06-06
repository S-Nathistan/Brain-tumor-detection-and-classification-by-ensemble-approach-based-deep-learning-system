import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

const LANGUAGES = [
  { code: 'en', label: 'English',  sub: 'Default System Language',  icon: 'A' },
  { code: 'si', label: 'සිංහල',   sub: 'Native Sri Lankan Script', icon: 'ස' },
  { code: 'ta', label: 'தமிழ்',   sub: 'Regional Dravidian Script', icon: 'த' },
]

export default function LanguageSelect() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selected, setSelected] = useState(localStorage.getItem('language') || 'en')

  function handleSelect(code) {
    setSelected(code)
    i18n.changeLanguage(code)
  }

  function handleContinue() {
    localStorage.setItem('language', selected)
    navigate('/login', { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: '40px 24px',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          backgroundColor: '#0d9488',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>
          {t('language.title')}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          {t('language.sub')}
        </p>
      </div>

      {/* Language options */}
      <div style={{ marginBottom: 8 }}>
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: 16, borderRadius: 12,
              border: selected === lang.code ? '2px solid #0d9488' : '1.5px solid #e5e7eb',
              backgroundColor: selected === lang.code ? '#f0fdfa' : '#ffffff',
              marginBottom: 12, cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: selected === lang.code ? '#0d9488' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
              color: selected === lang.code ? '#ffffff' : '#374151',
              marginRight: 14, flexShrink: 0,
              transition: 'background-color 0.2s, color 0.2s',
            }}>
              {lang.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', margin: '0 0 2px' }}>{lang.label}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{lang.sub}</p>
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: selected === lang.code ? 'none' : '2px solid #d1d5db',
              backgroundColor: selected === lang.code ? '#0d9488' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: 12,
              transition: 'background-color 0.2s',
            }}>
              {selected === lang.code ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Continue */}
      <div>
        <button
          onClick={handleContinue}
          style={{
            width: '100%', padding: 14,
            backgroundColor: '#0d9488', color: '#ffffff',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            marginBottom: 12,
          }}>
          {t('language.continue')}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: 0 }}>
          {t('language.hint')}
        </p>
      </div>

    </div>
  )
}
