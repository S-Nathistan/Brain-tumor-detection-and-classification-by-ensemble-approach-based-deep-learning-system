import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const QUICK = [
  'What is Glioma?',
  'Side effects of chemo?',
  'When to go to hospital?',
  'What should I eat?',
]

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
    messages.push({
      id: `user-${row.id}`,
      who: 'me',
      text: row.user_message,
      time: row.created_at,
    })
    messages.push({
      id: `bot-${row.id}`,
      who: 'bot',
      text: row.bot_reply,
      time: row.created_at,
      emergency: Boolean(row.emergency),
      topic: row.topic,
    })
  })
  return messages
}

export default function Chat() {
  const navigate = useNavigate()
  const patient = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [typing, setTyping] = useState(false)
  const [notice, setNotice] = useState(null)
  const listRef = useRef()

  const systemPrompt = useMemo(() => buildSystemPrompt(patient), [patient])

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      try {
        const history = await api('/mobile/chat/history')
        if (cancelled) return
        if (Array.isArray(history) && history.length) {
          setMessages(flattenHistory(history))
          setLoadingHistory(false)
          return
        }
      } catch {
        // fall through to local cache or welcome message
      }

      if (cancelled) return
      const cached = localStorage.getItem(HISTORY_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(parsed)
            setLoadingHistory(false)
            return
          }
        } catch {}
      }

      setMessages([
        {
          id: 'bot-welcome',
          who: 'bot',
          text: `Hello ${patient.name || 'there'}! Ask me about your condition, treatment, symptoms, or what to do next.`,
          time: new Date().toISOString(),
          topic: 'welcome',
        },
      ])
      setLoadingHistory(false)
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [patient.name])

  useEffect(() => {
    if (!loadingHistory) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
    }
  }, [messages, loadingHistory])

  useEffect(() => {
    try {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } catch {}
  }, [messages, typing])

  async function sendMessage(text) {
    const messageText = text.trim()
    if (!messageText || sending) return

    setNotice(null)
    setSending(true)
    setTyping(true)
    setInput('')

    const userMessage = {
      id: `me-${Date.now()}`,
      who: 'me',
      text: messageText,
      time: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await api('/mobile/chat', {
        method: 'POST',
        body: {
          patient_id: patient.id || patient.patient_id || patient.user_id || null,
          message: messageText,
          system_prompt: systemPrompt,
        },
      })

      const botMessage = {
        id: `bot-${response?.id || Date.now()}`,
        who: 'bot',
        text: response?.reply || 'I have your record, but I could not form a reply right now.',
        time: response?.created_at || new Date().toISOString(),
        emergency: Boolean(response?.emergency),
        topic: response?.topic,
      }

      setMessages(prev => [...prev, botMessage])
      if (response?.emergency) {
        setNotice('Urgent advice is shown below.')
      }
    } catch {
      setNotice('I could not generate a reply right now. Please try again.')
    } finally {
      setSending(false)
      setTyping(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(160deg, #0f766e 0%, #0d9488 48%, #115e59 100%)', padding:'18px 14px 18px', position:'relative', overflow:'hidden', boxShadow:'inset 0 -1px 0 rgba(255,255,255,0.08)' }}>
        <div style={{ position:'absolute', inset:'auto -28px -34px auto', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.08)', filter:'blur(2px)' }} />
        <div style={{ position:'absolute', inset:'-32px auto auto -36px', width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, position:'relative', zIndex:1 }}>
          <button onClick={() => navigate('/home')} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', borderRadius:12, padding:'8px 11px', backdropFilter:'blur(10px)' }}> ← </button>
          <div style={{ textAlign:'right' }} />
        </div>

        <div style={{ marginTop:14, padding:'12px 14px', borderRadius:18, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(6px)', position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:16, fontWeight:900, color:'#fff' }}>Care Assistant</div>
        </div>
      </div>

      <div style={{ flex:1, padding:14, display:'flex', flexDirection:'column', gap:12, minHeight:0 }}>
        <div style={{ background:'#fff', border:'1px solid #e6eef0', borderRadius:16, padding:12, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#0f172a' }}>Quick questions</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b' }}>{patient.name ? `Chatting as ${patient.name}` : 'Patient chat'}</div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => sendMessage(q)} disabled={sending} style={{ padding:'9px 11px', borderRadius:999, border:'1px solid #cbd5e1', background:'#f8fafc', cursor:'pointer', fontSize:13, color:'#0f172a', fontWeight:600 }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:'2px 2px 8px', display:'flex', flexDirection:'column', gap:12 }}>
          {loadingHistory ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:13 }}>Loading chat…</div>
          ) : (
            messages.map((m, index) => {
              const previous = messages[index - 1]
              const showTime = !previous || previous.who !== m.who
              return (
                <div key={m.id} style={{ display:'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:8 }}>
                  {m.who === 'bot' && (
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'#e6fffb', border:'1px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:14, color:'#0d9488', fontWeight:900 }}>B</span>
                    </div>
                  )}
                  <div style={{ maxWidth:'78%', display:'flex', flexDirection:'column', alignItems: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ background: m.who === 'me' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#fff', color: m.who === 'me' ? '#fff' : '#0f172a', padding:'11px 12px', borderRadius:m.who === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', boxShadow:'0 1px 3px rgba(2,6,23,0.06)', fontSize:14, lineHeight:1.5, border:m.who === 'me' ? 'none' : '1px solid #e2e8f0' }}>
                      {m.text}
                    </div>
                    {showTime && (
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:4, padding:'0 2px' }}>{nowLabel(m.time)}</div>
                    )}
                    {m.topic && m.who === 'bot' && (
                      <div style={{ fontSize:11, color:'#0f766e', marginTop:4, padding:'0 2px', fontWeight:700 }}>Saved answer</div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {typing && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'#e6fffb', border:'1px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:14, color:'#0d9488', fontWeight:900 }}>B</span>
              </div>
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', padding:'10px 12px', borderRadius:'14px 14px 14px 4px', color:'#64748b', fontSize:13 }}>
                Typing…
              </div>
            </div>
          )}

          <div ref={listRef} />
        </div>

        {messages.some(m => m.who === 'bot' && m.emergency) && (
          <div style={{ display:'grid', gap:10, marginTop:2 }}>
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', borderRadius:14, padding:12, fontSize:13, lineHeight:1.6 }}>
              This looks urgent. If symptoms are getting worse or you feel unsafe, call 1990 now.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <a href="tel:1990" style={{ flex:1, textAlign:'center', padding:'12px 14px', borderRadius:12, background:'#dc2626', color:'#fff', fontWeight:800, textDecoration:'none' }}>CALL 1990</a>
              <button onClick={() => navigate('/report')} style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#0f172a', fontWeight:700, cursor:'pointer' }}>REPORT THIS SYMPTOM</button>
            </div>
          </div>
        )}

        {notice && <div style={{ color:'#0f172a', fontSize:13, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'10px 12px' }}>{notice}</div>}

        <div style={{ display:'flex', gap:10, alignItems:'center', background:'#fff', border:'1px solid #e2e8f0', borderRadius:18, padding:10, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') sendMessage(input)
            }}
            placeholder="Type your question..."
            style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid #e6edf0', fontSize:14, outline:'none', background:'#f8fafc' }}
          />
          <button onClick={() => sendMessage(input)} disabled={sending || !input.trim()} style={{ padding:'12px 14px', borderRadius:12, border:'none', background:sending || !input.trim() ? '#94a3b8' : '#0d9488', color:'#fff', fontWeight:800, cursor:sending || !input.trim() ? 'default' : 'pointer', minWidth:74 }}>
            {sending ? '...' : 'SEND'}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, fontSize:11, color:'#64748b' }}>
          <span>Answers use the data already stored in your record.</span>
          <button onClick={() => {
            localStorage.removeItem(HISTORY_KEY)
            setMessages([
              {
                id: 'bot-welcome',
                who: 'bot',
                text: `Hello ${patient.name || 'there'}! Ask me about your condition, treatment, symptoms, or what to do next.`,
                time: new Date().toISOString(),
                topic: 'welcome',
              },
            ])
          }} style={{ border:'none', background:'transparent', color:'#0d9488', fontWeight:700, cursor:'pointer', padding:0 }}>Clear chat</button>
        </div>
        <div style={{ marginTop:12 }}>
          <button onClick={() => navigate('/home')} style={{ width:'100%', marginTop:18, padding:'14px 16px', border:'none', borderRadius:12, background:'#0d9488', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer' }}> Back to Home</button>
        </div>
      </div>
    </div>
  )
}
