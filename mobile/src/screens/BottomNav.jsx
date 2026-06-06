import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/* ────────────────────────────────────────────────────────────
   BOTTOM NAVIGATION BAR
   5 tabs: Home · Check-In · Chat · Learn · Report
   Design: white bar, teal active pill indicator + icon colour
   Height: 62 px (fits within 844 px phone frame)
──────────────────────────────────────────────────────────── */

const TEAL   = '#0d9488';
const GRAY   = '#94a3b8';
const NAV_H  = 62;

/* Inline SVG helper */
const S = ({ size = 22, color, sw = 1.75, children }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
  >
    {children}
  </svg>
);

/* Nav icons — outline for inactive, bolder stroke for active */
const NavIcons = {
  home: (c, sw) => (
    <S color={c} sw={sw}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </S>
  ),
  checkin: (c, sw) => (
    <S color={c} sw={sw}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
      <polyline points="9 16 11 18 15 14" />
    </S>
  ),
  chat: (c, sw) => (
    <S color={c} sw={sw}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </S>
  ),
  learn: (c, sw) => (
    <S color={c} sw={sw}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </S>
  ),
  report: (c, sw) => (
    <S color={c} sw={sw}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9"  x2="10" y2="9"  />
    </S>
  ),
};

const NAV_ITEMS = [
  {
    path:   '/home',
    icon:   NavIcons.home,
    labels: { en: 'Home', si: 'ගෙදර',    ta: 'முகப்பு' },
  },
  {
    path:   '/checkin',
    icon:   NavIcons.checkin,
    labels: { en: 'Check-In', si: 'දෛනික', ta: 'தினசரி' },
  },
  {
    path:   '/chat',
    icon:   NavIcons.chat,
    labels: { en: 'Chat', si: 'සංවාදය', ta: 'அரட்டை' },
  },
  {
    path:   '/education',
    icon:   NavIcons.learn,
    labels: { en: 'Learn', si: 'දැනුම', ta: 'கல்வி' },
  },
  {
    path:   '/report',
    icon:   NavIcons.report,
    labels: { en: 'Report', si: 'වාර්තාව', ta: 'அறிக்கை' },
  },
];

export const BOTTOM_NAV_HEIGHT = NAV_H;

export default function BottomNav() {
  const navigate        = useNavigate();
  const { pathname }    = useLocation();
  const { i18n }        = useTranslation();
  const lang            = (i18n.language || 'en').split('-')[0];

  return (
    <div
      style={{
        height:          `${NAV_H}px`,
        backgroundColor: '#ffffff',
        borderTop:       '1px solid #e2e8f0',
        display:         'flex',
        alignItems:      'stretch',
        boxShadow:       '0 -4px 16px rgba(0,0,0,0.07)',
        flexShrink:      0,         /* never shrink in the flex column */
        zIndex:          100,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.path || pathname.startsWith(item.path + '/');
        const color  = active ? TEAL : GRAY;
        const sw     = active ? 2.1 : 1.65;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '3px',
              border:         'none',
              background:     'transparent',
              cursor:         'pointer',
              padding:        '4px 0 6px',
              position:       'relative',
              WebkitTapHighlightColor: 'transparent',
              transition:     'opacity 0.12s',
            }}
          >
            {/* Teal pill at top of active tab */}
            <div
              style={{
                position:        'absolute',
                top:             0,
                left:            '50%',
                transform:       'translateX(-50%)',
                width:           active ? '30px' : '0px',
                height:          '3px',
                backgroundColor: TEAL,
                borderRadius:    '0 0 4px 4px',
                transition:      'width 0.2s cubic-bezier(.4,0,.2,1)',
              }}
            />

            {/* Icon */}
            <div style={{ lineHeight: 0, opacity: active ? 1 : 0.7 }}>
              {item.icon(color, sw)}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize:   lang === 'en' ? '10px' : '9px',
                fontWeight: active ? 700 : 500,
                color,
                lineHeight: 1,
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
                letterSpacing: lang === 'en' ? '-0.1px' : '0',
              }}
            >
              {item.labels[lang] ?? item.labels.en}
            </span>
          </button>
        );
      })}
    </div>
  );
}
