import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LanguageSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('en')

  const languages = [
    { code: 'en', label: 'English', sub: 'Default System Language', icon: 'A' },
    { code: 'si', label: 'සිංහල', sub: 'Native Sri Lankan Script', icon: 'ස' },
    { code: 'ta', label: 'தமிழ்', sub: 'Regional Dravidian Script', icon: 'த' },
  ]

  function handleContinue() {
    localStorage.setItem('language', selected)
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: '40px 24px',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: '#0d9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px',
        }}>
          Choose Your Language
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: 0,
        }}>
          Select your preferred language to continue
        </p>
      </div>

      {/* Language options */}
      <div style={{ flex: 1 }}>
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '12px',
              border: selected === lang.code
                ? '2px solid #0d9488'
                : '1.5px solid #e5e7eb',
              backgroundColor: selected === lang.code ? '#f0fdfa' : '#ffffff',
              marginBottom: '12px',
              cursor: 'pointer',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: selected === lang.code ? '#0d9488' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: selected === lang.code ? '#ffffff' : '#374151',
              marginRight: '14px',
              flexShrink: 0,
            }}>
              {lang.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 2px',
              }}>
                {lang.label}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
              }}>
                {lang.sub}
              </p>
            </div>

            {/* Selected indicator */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: selected === lang.code ? 'none' : '2px solid #d1d5db',
              backgroundColor: selected === lang.code ? '#0d9488' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '12px',
            }}>
              {selected === lang.code ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div>
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          Continue →
        </button>
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          margin: 0,
        }}>
          You can change this anytime in your profile settings.
        </p>
      </div>

    </div>
  )
}