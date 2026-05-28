import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'

function planTone(level) {
  if (level === 'GREEN') return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', title: 'Calm day', subtitle: 'GREEN' }
  if (level === 'AMBER') return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', title: 'Small changes noticed', subtitle: 'AMBER' }
  if (level === 'RED') return { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', title: 'Care team should know', subtitle: 'RED' }
  return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', title: 'Urgent help needed', subtitle: 'CRITICAL' }
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const patient = JSON.parse(localStorage.getItem('mobile_patient') || '{}')
  const [checkin, setCheckin] = useState(location.state || null)

  useEffect(() => {
    if (checkin) return
    const cached = localStorage.getItem('mobile_latest_checkin')
    if (cached) {
      try {
        setCheckin(JSON.parse(cached))
        return
      } catch {}
    }
    api('/mobile/checkins/latest').then(data => setCheckin(data || null)).catch(() => setCheckin(null))
  }, [checkin])

  const tone = useMemo(() => planTone(checkin?.level), [checkin?.level])

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', padding:'36px 24px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-34, right:-28, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.72)', marginBottom:8 }}>Your Check-in Summary</div>
        <div style={{ fontSize:24, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{patient.name || '—'}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.74)', marginTop:6 }}>Here’s a simple snapshot of how today looks.</div>

        
      </div>

      <div style={{ display:'flex', justifyContent:'center' }}>
        <div style={{ width:'92%', maxWidth:640, marginTop:0, background:'#fff', borderRadius:12, padding:'12px 14px', boxShadow:'0 6px 20px rgba(2,6,23,0.08)' }}>
          <div style={{ display:'flex', gap:1, alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ flex:1, minWidth:100 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Hospital ID</div>
              <div style={{ fontSize:14, fontWeight:800, fontFamily:"'DM Mono', monospace", marginTop:6 }}>{patient.hospital_id || '—'}</div>
            </div>

            <div style={{ width:1, height:36, background:'rgb(65, 68, 73)', margin:'0 8px' }} />

            <div style={{ flex:1, minWidth:120 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Plan</div>
              <div style={{ fontSize:14, fontWeight:800, marginTop:6, fontFamily:"'DM Mono', monospace"}}>{(patient.tumour_type || '').toLowerCase().includes('no') ? 'No reminder' : (patient.tumour_type || '') ? patient.tumour_type : 'Plan not set'}</div>
            </div>

            <div style={{ width:1, height:36, background:'rgb(65, 68, 73)', margin:'0 8px' }} />

            <div style={{ flex:1, minWidth:100 }}>
              <div style={{ fontSize:13, color:'#64748b' }}>Role</div>
              <div style={{ fontSize:14, fontWeight:800, marginTop:6, fontFamily:"'DM Mono', monospace"}}>{localStorage.getItem('mobile_role') === 'caretaker' ? 'Caretaker' : 'Patient'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, background:'#fff', borderRadius:'24px 24px 0 0', marginTop:6, padding:'16px 20px 24px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)' }}>
        {!checkin ? (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'#64748b' }}>Loading your latest check-in…</div>
        ) : (
          <>
            <div style={{ borderRadius:18, border:`1px solid ${tone.border}`, background:tone.bg, padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:tone.text, marginBottom:6 }}>{tone.subtitle}</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:6 }}>{tone.title}</div>
              <div style={{ fontSize:14, color:'#334155', lineHeight:1.7 }}>Score today: {checkin.score}</div>
              <div style={{ marginTop:8, fontSize:14, color:'#334155', lineHeight:1.7 }}>{checkin.message}</div>
            </div>

            <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94a3b8', marginBottom:8 }}>What you shared</div>
              {[
                ['Headache', checkin.headache],
                ['Seizure', checkin.seizure],
                ['Energy', checkin.energy],
                ['Nausea', checkin.nausea],
                ['Medication', checkin.medication],
                ['Overall', checkin.overall],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'7px 0', borderBottom:'1px solid #e2e8f0' }}>
                  <span style={{ fontSize:13, color:'#64748b' }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', textAlign:'right' }}>{value}</span>
                </div>
              ))}
              {checkin.note ? (
                <div style={{ paddingTop:10 }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>Note for your care team</div>
                  <div style={{ fontSize:13, color:'#334155', lineHeight:1.7 }}>{checkin.note}</div>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#eff6ff', border:'1px solid #bfdbfe' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#1d4ed8', marginBottom:6 }}>Saved safely</div>
              <div style={{ fontSize:13, color:'#1e3a8a', lineHeight:1.7 }}>
                Started by: {checkin.trigger_source === 'Patient taps "Daily Check-in"' ? 'You opened Daily Check-in' : 'A reminder from the app'}<br />
                Saved at: {checkin.created_at ? new Date(checkin.created_at).toLocaleString() : 'Just now'}
              </div>
            </div>

            {/* AMBER: score 4-7 - show report symptom CTA */}
            {Number(checkin.score) >= 4 && Number(checkin.score) <= 7 && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fff7ed', border:'1px solid #fde68a', color:'#92400e' }}>
                <div style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>⚠ Thank you for checking in.</div>
                <div style={{ fontSize:13, marginBottom:8 }}>Your symptoms need attention. Your medical team has been notified.</div>
                <div style={{ fontSize:13, marginBottom:12 }}>If you feel worse use:</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => navigate('/report', { state: { checkin } })} style={{ flex:1, padding:'12px 14px', borderRadius:10, border:'none', background:'#f97316', color:'#fff', fontWeight:800, cursor:'pointer' }}>REPORT SYMPTOM</button>
                  <button onClick={() => navigate('/home')} style={{ flex:1, padding:'12px 14px', borderRadius:10, border:'1px solid #e6edf0', background:'#fff', color:'#0f172a', fontWeight:700, cursor:'pointer' }}>← BACK TO HOME</button>
                </div>
              </div>
            )}

            {/* RED: score 8+ - show urgent doctor/call CTA */}
            {Number(checkin.score) >= 8 && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fff7ed', border:'1px solid #fed7aa', color:'#c2410c' }}>
                <div style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>Your doctor has been alerted.</div>
                <div style={{ fontSize:13, marginBottom:6 }}>Your symptoms are concerning. Dr. Perera has been notified.</div>
                <div style={{ fontSize:13, marginBottom:12 }}>Please rest and stay calm. If emergency — call 1990.</div>
                <div style={{ display:'flex', gap:10 }}>
                  <a href="tel:1990" style={{ flex:1, display:'inline-block', textAlign:'center', padding:'12px 14px', borderRadius:10, border:'none', background:'#dc2626', color:'#fff', fontWeight:800, textDecoration:'none' }}>CALL 1990</a>
                  <button onClick={() => navigate('/home')} style={{ flex:1, padding:'12px 14px', borderRadius:10, border:'1px solid #e6edf0', background:'#fff', color:'#0f172a', fontWeight:700, cursor:'pointer' }}>← BACK TO HOME</button>
                </div>
              </div>
            )}

            {checkin.level === 'CRITICAL' && (
              <div style={{ marginTop:16, padding:'14px 16px', borderRadius:16, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c' }}>
                <div style={{ fontSize:12, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Need help now</div>
                <div style={{ fontSize:13, lineHeight:1.7 }}>Please contact your care team or go to the hospital right away.</div>
              </div>
            )}

            <button onClick={() => navigate('/home')} style={{ width:'100%', marginTop:18, padding:'14px 16px', border:'none', borderRadius:12, background:'#0d9488', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer' }}> Back to Home</button>
          </>
        )}
      </div>
    </div>
  )
}