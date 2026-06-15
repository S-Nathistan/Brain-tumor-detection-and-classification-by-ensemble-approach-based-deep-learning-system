import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const STYLES = {
  glass: {
    background: 'rgba(255,255,255,0.12)',
    border:     '1px solid rgba(255,255,255,0.18)',
    color:      '#ffffff',
  },
  solid: {
    background: '#f1f5f9',
    border:     '1px solid #e2e8f0',
    color:      '#374151',
  },
}

export default function BackButton({ variant = 'glass', to, onClick }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  function handleClick() {
    if (onClick) { onClick(); return }
    if (to)      { navigate(to); return }
    navigate(-1)
  }

  const s = STYLES[variant] || STYLES.glass

  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      style={{
        position:                'absolute',
        top:                     14,
        left:                    16,
        zIndex:                  2,
        display:                 'inline-flex',
        alignItems:              'center',
        gap:                     6,
        padding:                 '8px 14px',
        borderRadius:            999,
        border:                  s.border,
        background:              s.background,
        color:                   s.color,
        fontSize:                13,
        fontWeight:              800,
        cursor:                  'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition:              'opacity 0.12s',
      }}
    >
      ← {t('common.back')}
    </button>
  )
}
