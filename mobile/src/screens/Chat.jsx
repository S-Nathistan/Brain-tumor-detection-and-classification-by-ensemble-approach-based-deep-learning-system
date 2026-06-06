import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import BackButton from './BackButton'

const HISTORY_KEY = 'mobile_chat_history'

function nowLabel(value) {
  try {
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function buildSystemPrompt(patient) {
  return [
    `Patient name: ${patient.name || 'unknown'}`,
    `Hospital ID: ${patient.hospital_id || 'unknown'}`,
    `Tumour type: ${patient.tumour_type || 'Not Classified'}`,
    `Grade: ${patient.grade || patient.tumour_grade || 'unknown'}`,
    `Treatment summary: ${patient.treatment_plan || patient.plan_summary || 'not available'}`,
    'Rules: only answer health questions, always say consult your doctor, never give drug doses, keep replies under 3 sentences, and mention emergency help if danger words appear.',
  ].join(' | ')
}

function flattenHistory(rows) {
  const messages = []
  rows.forEach(row => {
    messages.push({ id: `user-${row.id}`, who: 'me',  text: row.user_message, time: row.created_at })
    messages.push({ id: `bot-${row.id}`,  who: 'bot', text: row.bot_reply,    time: row.created_at, emergency: Boolean(row.emergency), topic: row.topic })
  })
  return messages
}

function BotAvatar({ emergency }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 11, flexShrink: 0,
      background: emergency
        ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
        : 'linear-gradient(135deg,#0d9488,#0f766e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: emergency
        ? '0 2px 8px rgba(220,38,38,0.25)'
        : '0 2px 8px rgba(13,148,136,0.22)',
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
      </svg>
    </div>
  )
}

export default function Chat() {
  const navigate   = useNavigate()
  const { t }      = useTranslation()
  const patient    = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [sending, setSending]           = useState(false)
  const [loadingHistory, setLoading]    = useState(true)
  const [typing, setTyping]             = useState(false)
  const [notice, setNotice]             = useState(null)
  const listRef  = useRef()
  const inputRef = useRef()

  const systemPrompt = useMemo(() => buildSystemPrompt(patient), [patient])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const history = await api('/mobile/chat/history')
        if (cancelled) return
        if (Array.isArray(history) && history.length) {
          setMessages(flattenHistory(history))
          setLoading(false)
          return
        }
      } catch {}

      if (cancelled) return
      const cached = localStorage.getItem(HISTORY_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length) { setMessages(parsed); setLoading(false); return }
        } catch {}
      }

      setMessages([{
        id: 'bot-welcome', who: 'bot', topic: 'welcome',
        time: new Date().toISOString(),
        text: t('chat.welcome', { name: patient.name || 'there' }),
      }])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [patient.name])

  useEffect(() => {
    if (!loadingHistory) localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
  }, [messages, loadingHistory])

  useEffect(() => {
    try { listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) } catch {}
  }, [messages, typing])

  async function sendMessage(text) {
    const msg = text.trim()
    if (!msg || sending) return
    setNotice(null)
    setSending(true)
    setTyping(true)
    setInput('')
    setMessages(prev => [...prev, { id: `me-${Date.now()}`, who: 'me', text: msg, time: new Date().toISOString() }])
    try {
      const res = await api('/mobile/chat', {
        method: 'POST',
        body: { patient_id: patient.id || patient.patient_id || null, message: msg, system_prompt: systemPrompt },
      })
      setMessages(prev => [...prev, {
        id: `bot-${res?.id || Date.now()}`, who: 'bot',
        text: res?.reply || 'I have your record, but could not form a reply right now.',
        time: res?.created_at || new Date().toISOString(),
        emergency: Boolean(res?.emergency),
        topic: res?.topic,
      }])
      if (res?.emergency) setNotice(t('chat.urgentNotice'))
    } catch {
      setNotice(t('chat.errorSend'))
    } finally {
      setSending(false)
      setTyping(false)
    }
  }

  return (
    <div style={{ height:'100%', background:'#f1f5f9', fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', overflow:'hidden' }}>

      <style>{`
        @keyframes dotBounce {
          0%,60%,100% { opacity:0.3; transform:translateY(0); }
          30% { opacity:1; transform:translateY(-4px); }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .msg-list { scrollbar-width:none; -ms-overflow-style:none; }
        .msg-list::-webkit-scrollbar { display:none; }
        .quick-scroll { scrollbar-width:none; -ms-overflow-style:none; }
        .quick-scroll::-webkit-scrollbar { display:none; }
        .quick-btn { transition:transform 0.12s, background 0.12s, box-shadow 0.12s !important; }
        .quick-btn:active { transform:scale(0.95) !important; }
        .quick-btn:hover { background:#f0fdfa !important; border-color:#99f6e4 !important; color:#0f766e !important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0d9488 0%,#0f766e 100%)', padding:'48px 20px 20px', position:'relative', overflow:'hidden', flexShrink:0 }}>
        <div style={{ position:'absolute', top:-20, right:-20, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-28, left:-28, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        <BackButton variant="glass" to="/home" />

        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
          {/* Bot icon */}
          <div style={{ width:44, height:44, borderRadius:13, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(8px)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
            </svg>
          </div>

          {/* Title */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{t('chat.title')}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:2 }}>{t('chat.subtitle')}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:1 }}>{t('chat.tagline')}</div>
          </div>

          {/* Clear */}
          <button onClick={() => {
            localStorage.removeItem(HISTORY_KEY)
            setMessages([{ id:'bot-welcome', who:'bot', topic:'welcome', time:new Date().toISOString(),
              text: t('chat.clearWelcome', { name: patient.name || 'there' }) }])
          }} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)', color:'rgba(255,255,255,0.85)', fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:9, padding:'5px 11px', flexShrink:0 }}>
            {t('chat.clear')}
          </button>
        </div>
      </div>

      {/* ── Quick questions ─────────────────────────────────── */}
      <div style={{ padding:'10px 16px 8px', background:'#fff', borderBottom:'1px solid #e8edf2', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'#b0bacb', marginBottom:7 }}>{t('chat.quickTitle')}</div>
        <div className="quick-scroll" style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:2 }}>
          {['chat.quick1','chat.quick2','chat.quick3','chat.quick4'].map(key => (
            <button key={key} className="quick-btn" onClick={() => sendMessage(t(key))} disabled={sending}
              style={{ padding:'7px 13px', borderRadius:20, border:'1.5px solid #e2e8f0', background:'#f8fafc', cursor:sending?'not-allowed':'pointer', fontSize:12, color:'#475569', fontWeight:600, whiteSpace:'nowrap', flexShrink:0, opacity:sending?0.45:1, fontFamily:"'DM Sans',sans-serif" }}>
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────── */}
      <div className="msg-list" style={{ flex:1, overflowY:'auto', padding:'18px 16px 10px', display:'flex', flexDirection:'column', gap:18 }}>

        {loadingHistory ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ display:'flex', gap:7, justifyContent:'center', marginBottom:12 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:'#0d9488', animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
              <div style={{ fontSize:13, color:'#94a3b8' }}>{t('chat.loading')}</div>
            </div>
          </div>
        ) : (
          messages.map(m => {
            const isEmergency = m.who === 'bot' && m.emergency
            const topicLabel  = m.who === 'bot' && m.topic && m.topic !== 'welcome'
              ? t(`chat.topics.${m.topic}`, { defaultValue: null })
              : null

            if (m.who === 'me') {
              return (
                <div key={m.id} style={{ display:'flex', justifyContent:'flex-end', animation:'fadeUp 0.22s ease both' }}>
                  <div style={{ maxWidth:'80%' }}>
                    <div style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', color:'#fff', padding:'13px 17px', borderRadius:'18px 18px 5px 18px', fontSize:15, lineHeight:1.6, fontWeight:500, boxShadow:'0 2px 10px rgba(13,148,136,0.22)', wordBreak:'break-word', textAlign:'left' }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8', marginTop:4, textAlign:'right', paddingRight:4 }}>{nowLabel(m.time)}</div>
                  </div>
                </div>
              )
            }

            return (
              <div key={m.id} style={{ display:'flex', justifyContent:'flex-start', gap:10, alignItems:'flex-start', animation:'fadeUp 0.22s ease both' }}>
                <BotAvatar emergency={isEmergency} />
                <div style={{ maxWidth:'78%' }}>

                  {/* Speaker label */}
                  <div style={{ fontSize:11, fontWeight:700, marginBottom:5, letterSpacing:'0.01em', color: isEmergency ? '#dc2626' : '#0d9488' }}>
                    {isEmergency ? t('chat.urgentLabel') : t('chat.botLabel')}
                  </div>

                  {/* Message bubble */}
                  <div style={{
                    background:   isEmergency ? '#fff5f5' : '#fff',
                    color:        isEmergency ? '#7f1d1d' : '#1e293b',
                    padding:      '13px 17px',
                    borderRadius: 14,
                    fontSize:     15,
                    lineHeight:   1.7,
                    textAlign:    'left',
                    border:       `1.5px solid ${isEmergency ? '#fecaca' : '#e8edf2'}`,
                    boxShadow:    isEmergency ? '0 2px 12px rgba(220,38,38,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
                    wordBreak:    'break-word',
                    whiteSpace:   'pre-line',
                  }}>
                    {m.text}
                  </div>

                  {/* Time + topic */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5, paddingLeft:2 }}>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{nowLabel(m.time)}</div>
                    {topicLabel && (
                      <>
                        <span style={{ fontSize:10, color:'#cbd5e1' }}>·</span>
                        <span style={{ fontSize:11, fontWeight:600, color: isEmergency ? '#dc2626' : '#64748b' }}>{topicLabel}</span>
                      </>
                    )}
                  </div>

                  {/* Emergency call button inline */}
                  {isEmergency && (
                    <a href="tel:1990" style={{ display:'block', marginTop:10, textAlign:'center', padding:'11px 0', borderRadius:12, background:'#dc2626', color:'#fff', fontWeight:800, textDecoration:'none', fontSize:14, boxShadow:'0 2px 10px rgba(220,38,38,0.28)' }}>
                      {t('chat.callBtn')}
                    </a>
                  )}

                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <BotAvatar emergency={false} />
            <div style={{ background:'#fff', border:'1.5px solid #e8edf2', padding:'13px 18px', borderRadius:14, display:'flex', gap:6, alignItems:'center', boxShadow:'0 1px 5px rgba(0,0,0,0.05)' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#94a3b8', animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={listRef} />
      </div>

      {/* ── Notice banner ───────────────────────────────────── */}
      {notice && (
        <div style={{ margin:'0 16px 8px', padding:'10px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, fontSize:13, color:'#1d4ed8', fontWeight:500, flexShrink:0 }}>
          {notice}
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────── */}
      <div style={{ padding:'10px 16px 28px', background:'#fff', borderTop:'1px solid #e2e8f0', flexShrink:0 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ flex:1, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:16, padding:'0 16px', display:'flex', alignItems:'center', minHeight:50 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 300))}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder={t('chat.placeholder')}
              maxLength={300}
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:15, color:'#1e293b', fontFamily:"'DM Sans',sans-serif", padding:'0' }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            style={{
              width:50, height:50, borderRadius:14, border:'none', flexShrink:0,
              background: sending || !input.trim() ? '#e2e8f0' : '#0d9488',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              transition:'background 0.15s',
              boxShadow: !sending && input.trim() ? '0 2px 10px rgba(13,148,136,0.3)' : 'none',
            }}>
            {sending ? (
              <div style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? 'white' : '#94a3b8'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:10, lineHeight:1.5 }}>
          {t('chat.disclaimer')}
        </div>
      </div>

    </div>
  )
}
