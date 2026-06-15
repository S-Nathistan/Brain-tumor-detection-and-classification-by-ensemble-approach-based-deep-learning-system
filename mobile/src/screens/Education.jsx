import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PROFILES, TAB_LABELS, getProfileKey } from './educationContent';
import BackButton from './BackButton';

/* ─────────────────────────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────────────────────────── */
const S = ({ size = 20, color = 'currentColor', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Icons = {
  back:    (p) => <S {...p}><polyline points="15 18 9 12 15 6"/></S>,
  what:    (p) => <S {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></S>,
  treat:   (p) => <S {...p}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></S>,
  warn:    (p) => <S {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></S>,
  ask:     (p) => <S {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></S>,
  effects: (p) => <S {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></S>,
  diet:    (p) => <S {...p}><path d="M3 2l1.5 9.5A5 5 0 009.5 16H12v4a2 2 0 004 0v-4h2.5a5 5 0 005-5V2"/><line x1="16" y1="2" x2="16" y2="8"/><line x1="12" y1="2" x2="12" y2="8"/></S>,
  mind:    (p) => <S {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></S>,
  check:   (p) => <S {...p}><polyline points="20 6 9 17 4 12"/></S>,
  cross:   (p) => <S {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></S>,
  next:    (p) => <S {...p}><polyline points="9 18 15 12 9 6"/></S>,
  prev:    (p) => <S {...p}><polyline points="15 18 9 12 15 6"/></S>,
  info:    (p) => <S {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></S>,
};
const TAB_ICON_FNS = [Icons.what, Icons.treat, Icons.warn, Icons.ask, Icons.effects, Icons.diet, Icons.mind];

/* ─────────────────────────────────────────────────────────────────────────────
   TEXT HELPERS
───────────────────────────────────────────────────────────────────────────── */
// Detect leading control-emoji type
function pfxOf(t) {
  if (/^✅/.test(t)) return 'ok';
  if (/^❌/.test(t)) return 'no';
  if (/^⚠/.test(t))  return 'warn';
  if (/^🔴/.test(t)) return 'red';
  if (/^🟡/.test(t)) return 'yellow';
  if (/^🟢/.test(t)) return 'green';
  // Any other leading emoji (face, object, etc.)
  if (/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t)) return 'emoji';
  return null;
}

// Strip all leading emoji characters
function noEmoji(s) {
  return s.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}️\s]+/u, '').trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTENT PRE-PROCESSOR
   Joins soft-wrapped short lines into full paragraphs so justify works.
   Sinhala/Tamil content was typed in a narrow chat — each "line" is only
   a few words. We collapse those back into flowing paragraphs.
───────────────────────────────────────────────────────────────────────────── */
function buildSegments(raw) {
  // A line is "structural" (kept separate) when it starts with a special prefix,
  // a bullet dash, or is clearly an ALL-CAPS standalone heading.
  const isStructural = (t) =>
    pfxOf(t) !== null ||
    /^[-•]/.test(t) ||
    (t.length > 4 && t === t.toUpperCase() && /[A-Z]/.test(t));

  const lines = raw.split('\n');
  const segments = []; // { type: 'para'|'blank'|'structural', text }
  let buf = [];

  const flush = () => {
    if (buf.length) {
      segments.push({ type: 'para', text: buf.join(' ') });
      buf = [];
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); segments.push({ type: 'blank' }); continue; }
    if (isStructural(t)) { flush(); segments.push({ type: 'structural', text: t }); }
    else {
      // If the last thing we pushed was a bullet, this is a continuation — join it.
      const last = segments.length ? segments[segments.length - 1] : null;
      if (buf.length === 0 && last && last.type === 'structural' && /^[-•]/.test(last.text)) {
        const trailingDash = /\s*[—–]\s*$/.test(last.text);
        last.text = last.text.replace(/\s*[—–]\s*$/, '').trimEnd() + (trailingDash ? ': ' : ' ') + t;
      } else {
        buf.push(t);
      }
    }
  }
  flush();

  // Remove trailing blanks
  while (segments.length && segments[segments.length - 1].type === 'blank') segments.pop();
  return segments;
}

/* ─────────────────────────────────────────────────────────────────────────────
   WARNING TAB PARSER
   Also joins multi-line warning titles (same narrow-chat wrapping problem).
───────────────────────────────────────────────────────────────────────────── */
const SEV = {
  red:    { accent: '#dc2626', bg: '#fef2f2', border: '#fecaca', pillBg: '#fee2e2', pillText: '#991b1b', label: 'EMERGENCY'   },
  yellow: { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', pillBg: '#fef3c7', pillText: '#92400e', label: 'CALL DOCTOR' },
  green:  { accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', pillBg: '#dcfce7', pillText: '#166534', label: 'MONITOR'     },
};

function parseWarnings(raw) {
  const lines = raw.split('\n').map(l => l.trimEnd());
  const groups = [];
  let cur = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const p = pfxOf(t);

    if (p === 'red' || p === 'yellow' || p === 'green') {
      cur = { type: p, titleParts: [noEmoji(t)], bullets: [] };
      groups.push(cur);
    } else if (!cur) {
      groups.push({ type: 'text', text: t });
    } else if (/^[-•]/.test(t)) {
      // Bullet item — also join any soft-wrapped continuations later
      cur.bullets.push(t.replace(/^[-•]\s*/, ''));
    } else if (cur.bullets.length === 0) {
      // Still in title (continuation line before bullets started)
      cur.titleParts.push(t.replace(/^[)\s:]+/, '')); // strip leading ): chars
    } else {
      // Continuation of the last bullet
      const last = cur.bullets[cur.bullets.length - 1];
      // Only join if it looks like a continuation (no dash, short)
      if (!pfxOf(t) && !/^[-•]/.test(t)) {
        cur.bullets[cur.bullets.length - 1] = last + ' ' + t;
      } else {
        cur.bullets.push(t);
      }
    }
  }
  return groups;
}

/* ─────────────────────────────────────────────────────────────────────────────
   WARNING TAB COMPONENT
───────────────────────────────────────────────────────────────────────────── */
function WarningTab({ text, lang = 'en' }) {
  const groups = parseWarnings(text);
  const ta = lang === 'en' ? 'justify' : 'left';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {groups.map((g, i) => {
        if (g.type === 'text') return (
          <p key={i} style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.75, textAlign: ta, wordBreak: 'break-word' }}>{g.text}</p>
        );
        const s = SEV[g.type];
        const title = g.titleParts.join(' ');
        return (
          <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${s.border}` }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', backgroundColor: s.bg, borderBottom: `1px solid ${s.border}` }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: s.accent, flexShrink: 0, boxShadow: `0 0 0 3px ${s.accent}22` }} />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', flex: 1, lineHeight: 1.45 }}>{title}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.7px', color: s.pillText, backgroundColor: s.pillBg, padding: '3px 8px', borderRadius: '20px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {/* Bullets */}
            {g.bullets.length > 0 && (
              <div style={{ padding: '10px 14px 12px', backgroundColor: '#fff' }}>
                {g.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: '10px', marginBottom: bi < g.bullets.length - 1 ? '7px' : 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.accent, marginTop: '8px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13.5px', color: '#374151', lineHeight: 1.65, textAlign: ta, wordBreak: 'break-word' }}>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTENT TAB COMPONENT
───────────────────────────────────────────────────────────────────────────── */
// justify works well for Latin script; left-align for Tamil/Sinhala to avoid
// huge inter-word gaps that make the text unreadable
const bodyStyle   = (lang) => ({ fontSize: '14px',   color: '#374151', lineHeight: lang === 'en' ? 1.8 : 1.9,  textAlign: lang === 'en' ? 'justify' : 'left', margin: '2px 0', wordBreak: 'break-word' });
const bulletStyle = (lang) => ({ fontSize: '13.5px', color: '#374151', lineHeight: lang === 'en' ? 1.7 : 1.85, textAlign: lang === 'en' ? 'justify' : 'left', wordBreak: 'break-word' });

function ContentTab({ text, accent, lang = 'en' }) {
  const segments = buildSegments(text);

  return (
    <div>
      {segments.map((seg, i) => {
        /* ── blank gap ── */
        if (seg.type === 'blank') return <div key={i} style={{ height: '10px' }} />;

        /* ── joined paragraph ── */
        if (seg.type === 'para') return (
          <p key={i} style={bodyStyle(lang)}>{seg.text}</p>
        );

        /* ── structural line ── */
        const t     = seg.text;
        const pfx   = pfxOf(t);
        const clean = noEmoji(t);
        const ta    = lang === 'en' ? 'justify' : 'left';

        // ✅ DO
        if (pfx === 'ok') return (
          <div key={i} style={{ display: 'flex', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '9px 12px', margin: '4px 0' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
              <Icons.check size={11} color="#fff" />
            </div>
            <span style={{ fontSize: '13.5px', color: '#15803d', fontWeight: 500, lineHeight: 1.65, textAlign: ta, wordBreak: 'break-word' }}>{clean}</span>
          </div>
        );

        // ❌ AVOID
        if (pfx === 'no') return (
          <div key={i} style={{ display: 'flex', gap: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '9px 12px', margin: '4px 0' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
              <Icons.cross size={11} color="#fff" />
            </div>
            <span style={{ fontSize: '13.5px', color: '#b91c1c', fontWeight: 500, lineHeight: 1.65, textAlign: ta, wordBreak: 'break-word' }}>{clean}</span>
          </div>
        );

        // ⚠️ note
        if (pfx === 'warn') return (
          <div key={i} style={{ display: 'flex', gap: '10px', backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '9px 12px', margin: '8px 0' }}>
            <Icons.warn size={15} color="#d97706" />
            <span style={{ fontSize: '13.5px', color: '#92400e', fontWeight: 600, lineHeight: 1.65, textAlign: ta, wordBreak: 'break-word' }}>{clean}</span>
          </div>
        );

        // Emoji-prefixed section heading (😴 TIREDNESS etc.) → strip emoji, show as heading
        if (pfx === 'emoji') return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', marginBottom: '5px' }}>
            <div style={{ width: '3px', height: '16px', backgroundColor: accent, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {clean}
            </span>
          </div>
        );

        // Bullet / dash line
        if (/^[-•]/.test(t)) return (
          <div key={i} style={{ display: 'flex', gap: '10px', margin: '4px 0 4px 2px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: `${accent}99`, marginTop: '9px', flexShrink: 0 }} />
            <span style={bulletStyle(lang)}>{t.replace(/^[-•]\s*/, '')}</span>
          </div>
        );

        // ALL-CAPS section label
        if (t.length > 4 && t === t.toUpperCase() && /[A-Z]/.test(t)) return (
          <p key={i} style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1.1px', textTransform: 'uppercase', margin: '18px 0 6px', paddingBottom: '5px', borderBottom: '1px solid #f1f5f9' }}>
            {t}
          </p>
        );

        // Fallback — body text
        return <p key={i} style={bodyStyle(lang)}>{t}</p>;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────────────────────────── */
export default function Education() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const tabBarRef  = useRef(null);
  const contentRef = useRef(null);

  const rawLang = (i18n.language || 'en').slice(0, 2);
  const lang = ['en', 'si', 'ta'].includes(rawLang) ? rawLang : 'en';

  let patient = null;
  try { patient = JSON.parse(localStorage.getItem('mobile_patient') || 'null'); } catch {}
  const tumourType = patient?.tumour_type || patient?.tumor_type || '';
  const noAnalysis = !tumourType || tumourType.toLowerCase() === 'not classified';
  const profileKey = noAnalysis ? null : getProfileKey(tumourType);
  const profile    = (profileKey && PROFILES[profileKey]) || PROFILES.no_tumor;
  const { meta }   = profile;
  const tabs        = TAB_LABELS[lang];
  const content     = profile[lang] || profile.en;

  const [activeTab, setActiveTab] = useState(0);
  const tabCount = tabs.length;

  useEffect(() => {
    tabBarRef.current
      ?.querySelector(`[data-tab="${activeTab}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  function goTab(n) {
    const next = Math.max(0, Math.min(tabCount - 1, n));
    setActiveTab(next);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const conditionName = noAnalysis ? '' : (meta.name[lang] || meta.name.en);
  const TabIconComp   = TAB_ICON_FNS[activeTab];

  const NO_ANALYSIS_TEXT = {
    en: { title: 'No MRI Analysis Yet', body: 'Your personalised education content will appear here once your MRI scan has been analysed and a diagnosis has been made. Please check back after your results are available.' },
    si: { title: 'MRI විශ්ලේෂණයක් නොමැත', body: 'ඔබේ MRI ස්කෑනය විශ්ලේෂණය කර රෝග විනිශ්චය ලැබීමෙන් පසු ඔබේ පුද්ගලිකෘත අධ්‍යාපන අන්තර්ගතය මෙහි දිස්වනු ඇත. ප්‍රතිඵල ලැබීමෙන් පසු නැවත පරීක්ෂා කරන්න.' },
    ta: { title: 'MRI பகுப்பாய்வு இல்லை', body: 'உங்கள் MRI ஸ்கேன் பகுப்பாய்வு செய்யப்பட்டு நோய் கண்டறியப்பட்ட பிறகு உங்கள் தனிப்பயனாக்கப்பட்ட கல்வி உள்ளடக்கம் இங்கே தோன்றும். உங்கள் முடிவுகள் கிடைத்த பிறகு மீண்டும் சரிபாருங்கள்.' },
  };

  if (noAnalysis) {
    const txt = NO_ANALYSIS_TEXT[lang] || NO_ANALYSIS_TEXT.en;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ flexShrink: 0, backgroundColor: '#fff', boxShadow: '0 1px 0 #e2e8f0', position: 'relative' }}>
          <BackButton variant="solid" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px 12px 100px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 2px' }}>Patient Education</p>
              <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{txt.title}</h1>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.info size={32} color="#94a3b8" />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 10px' }}>{txt.title}</h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{txt.body}</p>
          </div>
        </div>
      </div>
    );
  }

  const DISCLAIMER = {
    en: (name) => <>Information personalised to your diagnosis of <strong style={{ color: '#475569', fontWeight: 600 }}>{name}</strong>. Always follow your doctor's advice and attend all scheduled appointments.</>,
    si: (name) => <>මෙම තොරතුරු ඔබේ රෝග විනිශ්චය වන <strong style={{ color: '#475569', fontWeight: 600 }}>{name}</strong> සඳහා පෞද්ගලිකව සකස් කර ඇත. සෑම විටම ඔබේ වෛද්‍යවරයාගේ උපදෙස් අනුගමනය කර සැලසුම් කළ සියලු හමුවීම් වලට පැමිණෙන්න.</>,
    ta: (name) => <>இந்த தகவல் உங்கள் <strong style={{ color: '#475569', fontWeight: 600 }}>{name}</strong> என்ற நோய் கண்டறிதலுக்காக தனிப்பட்ட முறையில் தயாரிக்கப்பட்டுள்ளது. எப்போதும் உங்கள் மருத்துவரின் அறிவுரையை பின்பற்றுங்கள் மற்றும் திட்டமிட்ட அனைத்து சந்திப்புகளுக்கும் வாருங்கள்.</>,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>

      {/* ══════════════════════ HEADER ══════════════════════ */}
      <div style={{ flexShrink: 0, backgroundColor: '#fff', boxShadow: '0 1px 0 #e2e8f0', position: 'relative' }}>
        <BackButton variant="solid" />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px 12px 100px' }}>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 2px' }}>Patient Education</p>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conditionName}</h1>
          </div>

          <div style={{ padding: '5px 11px', borderRadius: 20, flexShrink: 0, backgroundColor: `${meta.accent}12`, border: `1.5px solid ${meta.accent}30`, color: meta.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.4px' }}>
            {meta.icon}
          </div>
        </div>

        {/* Tab bar */}
        <div ref={tabBarRef} style={{ display: 'flex', overflowX: 'auto', padding: '0 12px', gap: 2, scrollbarWidth: 'none', borderTop: '1px solid #f1f5f9' }}>
          {tabs.map((label, i) => {
            const active = i === activeTab;
            const Ic = TAB_ICON_FNS[i];
            return (
              <button key={i} data-tab={i} onClick={() => goTab(i)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0, minWidth: 64, color: active ? meta.accent : '#94a3b8', borderBottom: active ? `2.5px solid ${meta.accent}` : '2.5px solid transparent', transition: 'all 0.18s', outline: 'none' }}>
                <Ic size={18} color={active ? meta.accent : '#94a3b8'} />
                <span style={{ fontSize: '9.5px', fontWeight: active ? 700 : 500, marginTop: 5, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════ CONTENT ══════════════════════ */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>

        {/* Section banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px 11px', backgroundColor: meta.accentBg, borderBottom: `1px solid ${meta.accent}18` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TabIconComp size={17} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '9.5px', color: `${meta.accent}99`, fontWeight: 700, letterSpacing: '0.9px', textTransform: 'uppercase', margin: '0 0 1px' }}>Section {activeTab + 1} of {tabCount}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: meta.accent, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabs[activeTab]}</p>
          </div>
          {/* Progress pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            {tabs.map((_, i) => (
              <div key={i} onClick={() => goTab(i)} style={{ width: i === activeTab ? 18 : 5, height: 5, borderRadius: 3, cursor: 'pointer', backgroundColor: i === activeTab ? meta.accent : `${meta.accent}30`, transition: 'all 0.25s' }} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            {/* Thin accent rule */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${meta.accent},${meta.accent}30)`, borderRadius: 2, marginBottom: 18 }} />

            {activeTab === 2
              ? <WarningTab text={content[2] || ''} lang={lang} />
              : <ContentTab text={content[activeTab] || ''} accent={meta.accent} lang={lang} />
            }
          </div>
        </div>

        {/* Prev / Next */}
        <div style={{ display: 'flex', gap: 10, padding: '8px 16px' }}>
          <button onClick={() => goTab(activeTab - 1)} disabled={activeTab === 0}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: `1.5px solid ${activeTab === 0 ? '#e2e8f0' : '#e2e8f0'}`, background: activeTab === 0 ? '#f8fafc' : '#fff', color: activeTab === 0 ? '#cbd5e1' : '#475569', fontSize: '13.5px', fontWeight: 600, cursor: activeTab === 0 ? 'not-allowed' : 'pointer', boxShadow: activeTab === 0 ? 'none' : '0 1px 4px rgba(0,0,0,0.07)', transition: 'all 0.2s' }}>
            <Icons.prev size={15} color={activeTab === 0 ? '#cbd5e1' : '#475569'} /> Previous
          </button>

          <button onClick={() => goTab(activeTab + 1)} disabled={activeTab === tabCount - 1}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: `1.5px solid ${activeTab === tabCount - 1 ? '#e2e8f0' : meta.accent}`, background: activeTab === tabCount - 1 ? '#f8fafc' : meta.accent, color: activeTab === tabCount - 1 ? '#cbd5e1' : '#fff', fontSize: '13.5px', fontWeight: 700, cursor: activeTab === tabCount - 1 ? 'not-allowed' : 'pointer', boxShadow: activeTab === tabCount - 1 ? 'none' : `0 4px 12px ${meta.accent}40`, transition: 'all 0.2s' }}>
            Next <Icons.next size={15} color={activeTab === tabCount - 1 ? '#cbd5e1' : '#fff'} />
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 16px 28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
          <Icons.info size={15} color="#94a3b8" />
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6, textAlign: lang === 'en' ? 'justify' : 'left', wordBreak: 'break-word' }}>
            {(DISCLAIMER[lang] || DISCLAIMER.en)(conditionName)}
          </p>
        </div>
      </div>
    </div>
  );
}
