import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../../util';

const PLAN_TYPES = ['Medication', 'Therapy', 'Surgery', 'Follow-up'];
const STATUSES   = ['Active', 'Completed', 'Cancelled'];

const TYPE_META = {
  Medication:  { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  Therapy:     { color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  Surgery:     { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  'Follow-up': { color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
};

const STATUS_META = {
  Active:    { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  Completed: { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", dot: "#f87171" },
};

function tm(t) { return TYPE_META[t] || TYPE_META['Follow-up']; }
function sm(s) { return STATUS_META[s] || STATUS_META['Active']; }

const Ico = {
  Med:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  Ther:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
  Surg:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 3 19 7.5 7.5 19H3v-4.5L14.5 3z"/><path d="m15 5 4 4"/></svg>,
  Fup:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  Chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  Plus:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>,
  Trash:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Print:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
  Back:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>,
  Search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Warn:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Stop:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Undo:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
};

const typeIco = (t) => ({ Medication: Ico.Med, Therapy: Ico.Ther, Surgery: Ico.Surg }[t] || Ico.Fup);

const inp = {
  border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 13px",
  fontSize: 13, color: "#0f172a", fontFamily: "'DM Sans',sans-serif",
  outline: "none", width: "100%", boxSizing: "border-box", background: "#fff",
};
const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, letterSpacing: "0.02em" };

const EMPTY_FORM = {
  plan_date: new Date().toISOString().slice(0, 10),
  plan_type: 'Medication', title: '', medications: '',
  therapy_schedule: '', surgery_details: '', notes: '', status: 'Active',
};

const EMPTY_MED = { name: '', dosage: '', morning: true, night: false, food: 'after' }

function parseMeds(value) {
  if (!value) return [{ ...EMPTY_MED }]
  try {
    const p = JSON.parse(value)
    if (Array.isArray(p) && p.length) return p.map(m => ({
      name:    m.name    || '',
      dosage:  m.dosage  || '',
      morning: m.times?.includes('08:00') ?? true,
      night:   m.times?.includes('21:00') ?? false,
      food:    m.food    || 'after',
    }))
  } catch {}
  return [{ ...EMPTY_MED }]
}

function MedicationBuilder({ value, onChange }) {
  const [meds, setMeds] = useState(() => parseMeds(value))

  const commit = (list) => {
    setMeds(list)
    const out = list
      .filter(m => m.name.trim())
      .map(m => ({
        name:   m.name.trim(),
        dosage: m.dosage.trim(),
        times:  [...(m.morning ? ['08:00'] : []), ...(m.night ? ['21:00'] : [])],
        food:   m.food,
      }))
    onChange(JSON.stringify(out))
  }

  const setField = (i, key, val) => commit(meds.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  const addRow   = () => commit([...meds, { ...EMPTY_MED }])
  const removeRow = (i) => commit(meds.filter((_, idx) => idx !== i))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {meds.map((med, i) => (
        <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px' }}>
          {/* Name + Dosage row */}
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <div style={{ flex:2 }}>
              <label style={lbl}>Drug Name</label>
              <input value={med.name} onChange={e => setField(i,'name',e.target.value)}
                placeholder="e.g. Panadol" style={inp} />
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>Dosage</label>
              <input value={med.dosage} onChange={e => setField(i,'dosage',e.target.value)}
                placeholder="e.g. 500mg" style={inp} />
            </div>
            {meds.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} style={{ alignSelf:'flex-end', marginBottom:1, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'7px 9px', cursor:'pointer', color:'#dc2626', display:'flex', alignItems:'center' }}>
                {Ico.Trash}
              </button>
            )}
          </div>

          {/* Timing + Food row */}
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
            <div>
              <label style={lbl}>Reminder Time</label>
              <div style={{ display:'flex', gap:12 }}>
                {[['morning','Morning (8 AM)'],['night','Night (9 PM)']].map(([key,label]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#374151', fontWeight:500, cursor:'pointer' }}>
                    <input type="checkbox" checked={med[key]} onChange={e => setField(i,key,e.target.checked)}
                      style={{ accentColor:'#0d9488', width:14, height:14 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>With Food</label>
              <div style={{ display:'flex', gap:6 }}>
                {['before','after'].map(f => (
                  <button key={f} type="button" onClick={() => setField(i,'food',f)} style={{
                    padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
                    border:   med.food === f ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                    background: med.food === f ? '#f0fdfa' : '#fff',
                    color:    med.food === f ? '#0d9488' : '#64748b',
                  }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addRow} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'1.5px dashed #cbd5e1', background:'#f8fafc', color:'#64748b', fontSize:12, fontWeight:600, cursor:'pointer', width:'fit-content' }}>
        {Ico.Plus} Add another medication
      </button>
    </div>
  )
}

function PlanForm({ patients, initial, onSave, onCancel, saving, preselectedPatient }) {
  const [form, setForm] = useState(
    initial ? { ...initial } : { ...EMPTY_FORM, patient_id: preselectedPatient?.id || '' }
  );
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patient_id) return setError('Please select a patient.');
    if (!form.title.trim()) return setError('Plan title is required.');
    setError('');
    onSave(form);
  };

  const ta = { ...inp, resize: "none" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          {Ico.Warn} {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lbl}>Patient</label>
          <select
            value={form.patient_id || ''}
            onChange={set('patient_id')}
            disabled={!!preselectedPatient}
            style={{ ...inp, cursor: preselectedPatient ? "default" : "pointer", background: preselectedPatient ? "#f8fafc" : "#fff" }}
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.hospital_id})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Plan Date</label>
          <input type="date" value={form.plan_date} onChange={set('plan_date')} style={inp} />
        </div>
      </div>

      <div>
        <label style={lbl}>Plan Type</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PLAN_TYPES.map((t) => {
            const m = tm(t);
            const active = form.plan_type === t;
            return (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, plan_type: t }))}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "11px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: active ? `1.5px solid ${m.border}` : "1px solid #e2e8f0", background: active ? m.bg : "#fff", color: active ? m.color : "#64748b" }}>
                <span style={{ color: active ? m.color : "#94a3b8", display: "flex" }}>{typeIco(t)}</span>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={lbl}>Title / Summary</label>
        <input value={form.title} onChange={set('title')} placeholder="e.g. Post-surgery Temozolomide course — Week 1" style={inp} />
      </div>

      {form.plan_type === 'Medication' && (
        <div>
          <label style={lbl}>Medications</label>
          <MedicationBuilder
            value={form.medications}
            onChange={val => setForm(f => ({ ...f, medications: val }))}
          />
        </div>
      )}
      {form.plan_type === 'Therapy' && (
        <div>
          <label style={lbl}>Therapy Schedule</label>
          <textarea value={form.therapy_schedule} onChange={set('therapy_schedule')} rows={3}
            placeholder={"Therapy type · Sessions · Frequency\ne.g. Radiotherapy 60 Gy · 30 fractions · 5× per week"} style={ta} />
        </div>
      )}
      {form.plan_type === 'Surgery' && (
        <div>
          <label style={lbl}>Surgery Details</label>
          <textarea value={form.surgery_details} onChange={set('surgery_details')} rows={3}
            placeholder="Procedure · Surgeon · Scheduled date · Pre-op instructions" style={ta} />
        </div>
      )}

      <div>
        <label style={lbl}>Clinical Notes</label>
        <textarea value={form.notes} onChange={set('notes')} rows={3}
          placeholder="Observations, contraindications, follow-up instructions…" style={ta} />
      </div>

      {initial && (
        <div>
          <label style={lbl}>Status</label>
          <div style={{ display: "flex", gap: 8 }}>
            {STATUSES.map((s) => {
              const m = sm(s);
              const active = form.status === s;
              return (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: active ? `1.5px solid ${m.border}` : "1px solid #e2e8f0", background: active ? m.bg : "#fff", color: active ? m.text : "#64748b" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? m.dot : "#cbd5e1", flexShrink: 0 }} />
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
        <button type="button" onClick={onCancel}
          style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#64748b", background: "#fff", cursor: "pointer" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving}
          style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, color: "#fff", background: saving ? "#94a3b8" : "#0d9488", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(13,148,136,0.25)" }}>
          {saving ? 'Saving…' : initial ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}

const DONE_LABEL = { Surgery: 'Surgery Done', Medication: 'Mark as Done', Therapy: 'Mark as Done', 'Follow-up': 'Mark as Done' };
const STOP_LABEL = { Surgery: 'Cancel Surgery', Medication: 'Stop Medication', Therapy: 'Stop Therapy', 'Follow-up': 'Deactivate' };

function PlanCard({ plan, onEdit, onDelete, onStatusChange, expanded, onToggle }) {
  const t = tm(plan.plan_type);
  const s = sm(plan.status);

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${expanded ? "#99f6e4" : "#e8edf2"}`, transition: "all 0.18s", boxShadow: expanded ? "0 4px 16px rgba(13,148,136,0.08)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", userSelect: "none" }} onClick={onToggle}>
        <div style={{ width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: t.bg, border: `1px solid ${t.border}`, color: t.color }}>
          {typeIco(plan.plan_type)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "0 0 4px" }}>{plan.title}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
              {plan.plan_type}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              {plan.status}
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{plan.plan_date}</span>
            {plan.created_by_name && <span style={{ fontSize: 11, color: "#94a3b8" }}>· {plan.created_by_name}</span>}
          </div>
        </div>
        <div style={{ color: "#94a3b8", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0, display: "flex" }}>
          {Ico.Chevron}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9" }}>
          {(plan.medications || plan.therapy_schedule || plan.surgery_details || plan.notes) && (
            <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {plan.medications && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: TYPE_META.Medication.color, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Medications</p>
                  <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", background: TYPE_META.Medication.bg, borderRadius: 8, padding: "11px 14px", border: `1px solid ${TYPE_META.Medication.border}`, margin: 0, lineHeight: 1.6 }}>{plan.medications}</p>
                </div>
              )}
              {plan.therapy_schedule && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: TYPE_META.Therapy.color, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Therapy Schedule</p>
                  <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", background: TYPE_META.Therapy.bg, borderRadius: 8, padding: "11px 14px", border: `1px solid ${TYPE_META.Therapy.border}`, margin: 0, lineHeight: 1.6 }}>{plan.therapy_schedule}</p>
                </div>
              )}
              {plan.surgery_details && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: TYPE_META.Surgery.color, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Surgery Details</p>
                  <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", background: TYPE_META.Surgery.bg, borderRadius: 8, padding: "11px 14px", border: `1px solid ${TYPE_META.Surgery.border}`, margin: 0, lineHeight: 1.6 }}>{plan.surgery_details}</p>
                </div>
              )}
              {plan.notes && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Clinical Notes</p>
                  <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", background: "#f8fafc", borderRadius: 8, padding: "11px 14px", border: "1px solid #e2e8f0", margin: 0, lineHeight: 1.6 }}>{plan.notes}</p>
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", flexWrap: "wrap" }}>
            <button
              onClick={() => onEdit(plan)}
              disabled={plan.status === 'Completed' || plan.status === 'Cancelled'}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: (plan.status === 'Completed' || plan.status === 'Cancelled') ? "not-allowed" : "pointer", background: (plan.status === 'Completed' || plan.status === 'Cancelled') ? "#f1f5f9" : "#f0fdfa", color: (plan.status === 'Completed' || plan.status === 'Cancelled') ? "#94a3b8" : "#0d9488", border: (plan.status === 'Completed' || plan.status === 'Cancelled') ? "1px solid #e2e8f0" : "1px solid #99f6e4", opacity: (plan.status === 'Completed' || plan.status === 'Cancelled') ? 0.6 : 1 }}>
              {Ico.Edit} Edit
            </button>
            <button onClick={() => window.print()}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }}>
              {Ico.Print} Print
            </button>

            {plan.status === 'Active' && (
              <>
                <button onClick={() => onStatusChange(plan, 'Completed')}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                  {Ico.Check} {DONE_LABEL[plan.plan_type] || 'Mark as Done'}
                </button>
                <button onClick={() => onStatusChange(plan, 'Cancelled')}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                  {Ico.Stop} {STOP_LABEL[plan.plan_type] || 'Stop'}
                </button>
              </>
            )}

            {(plan.status === 'Completed' || plan.status === 'Cancelled') && (
              <button onClick={() => onStatusChange(plan, 'Active')}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                {Ico.Undo} Reactivate
              </button>
            )}

            <button onClick={() => onDelete(plan.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", marginLeft: "auto" }}>
              {Ico.Trash} Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreatmentPlan() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [patients, setPatients]               = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [plans, setPlans]                     = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingPlans, setLoadingPlans]       = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [mode, setMode]                       = useState(null);
  const [editPlan, setEditPlan]               = useState(null);
  const [expandedId, setExpandedId]           = useState(null);
  const [deleteId, setDeleteId]               = useState(null);
  const [toast, setToast]                     = useState(null);
  const [search, setSearch]                   = useState('');
  const [filterType, setFilterType]           = useState('All');
  const [filterStatus, setFilterStatus]       = useState('All');
  const [patientSearch, setPatientSearch]     = useState('');

  const fromPatient = location.state?.patient ?? null;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = (patientId) => {
    setLoadingPlans(true);
    api(`/treatment-plans/patient/${patientId}`)
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    api('/patients').then((data) => {
      setPatients(data);
      if (location.state?.patient) {
        const p = data.find((pt) => pt.id === location.state.patient.id) || location.state.patient;
        setSelectedPatient(p);
        fetchPlans(p.id);
      }
    }).catch(console.error).finally(() => setLoadingPatients(false));
  }, []);

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setMode(null);
    setEditPlan(null);
    setExpandedId(null);
    setSearch('');
    setFilterType('All');
    setFilterStatus('All');
    fetchPlans(p.id);
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      const created = await api('/treatment-plans', { method: 'POST', body: { ...formData, patient_id: selectedPatient.id } });
      setPlans((prev) => [created, ...prev]);
      setMode(null);
      showToast('Treatment plan created successfully');
    } catch {
      showToast('Failed to create plan', 'error');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const updated = await api(`/treatment-plans/${editPlan.id}`, { method: 'PUT', body: formData });
      setPlans((prev) => prev.map((p) => p.id === editPlan.id ? updated : p));
      setMode(null);
      setEditPlan(null);
      showToast('Plan updated successfully');
    } catch {
      showToast('Failed to update plan', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api(`/treatment-plans/${id}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      showToast('Plan deleted');
    } catch {
      showToast('Failed to delete plan', 'error');
    }
  };

  const handleQuickStatus = async (plan, newStatus) => {
    try {
      const updated = await api(`/treatment-plans/${plan.id}`, { method: 'PUT', body: { ...plan, status: newStatus } });
      setPlans((prev) => prev.map((p) => p.id === plan.id ? updated : p));
      const label = newStatus === 'Completed' ? 'Marked as completed' : newStatus === 'Cancelled' ? 'Plan stopped/deactivated' : 'Plan reactivated';
      showToast(label);
    } catch {
      showToast('Failed to update plan status', 'error');
    }
  };

  const filtered = useMemo(() => plans.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.medications || '').toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q);
    return matchSearch && (filterType === 'All' || p.plan_type === filterType) && (filterStatus === 'All' || p.status === filterStatus);
  }), [plans, search, filterType, filterStatus]);

  const byDate = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      const key = p.plan_date || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const stats = useMemo(() => ({
    active:    plans.filter((p) => p.status === 'Active').length,
    completed: plans.filter((p) => p.status === 'Completed').length,
    total:     plans.length,
  }), [plans]);

  const filteredPatients = patients.filter((p) =>
    (p.name || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.hospital_id || '').toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 48, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`.tp-pat:hover{background:#f0fdfa!important} .tp-inp:focus{border-color:#0d9488!important;box-shadow:0 0 0 3px rgba(13,148,136,0.1)!important}`}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", fontSize: 13, fontWeight: 600, background: toast.type === 'error' ? "#dc2626" : "#0d9488", color: "#fff", minWidth: 220 }}>
          <span>{toast.type === 'error' ? '⚠' : '✓'}</span> {toast.msg}
        </div>
      )}

      {/* Breadcrumb — only when navigated from patient record */}
      {fromPatient && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <button onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#0d9488", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {Ico.Back} Back to Patients
          </button>
          <span style={{ color: "#cbd5e1", fontSize: 14 }}>/</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Viewing plans for <strong style={{ color: "#0f172a" }}>{fromPatient.name}</strong>
          </span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Treatment Plans</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Create, track and manage patient treatment protocols</p>
        </div>
        {selectedPatient && mode === null && (
          <button onClick={() => { setMode('create'); setEditPlan(null); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(13,148,136,0.3)" }}>
            {Ico.Plus} New Plan
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>

        {/* Patient Selector */}
        <div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", position: "sticky", top: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Patients</p>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", marginBottom: 8 }}>
                <span style={{ color: "#94a3b8", display: "flex" }}>{Ico.Search}</span>
                <input
                  className="tp-inp"
                  style={{ fontSize: 12, background: "transparent", border: "none", outline: "none", width: "100%", color: "#0f172a" }}
                  placeholder="Search patients…"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              {loadingPatients ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>Loading…</div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 1, maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
                  {filteredPatients.map((p) => {
                    const sel = selectedPatient?.id === p.id;
                    return (
                      <li key={p.id}>
                        <button onClick={() => handleSelectPatient(p)}
                          className={sel ? "" : "tp-pat"}
                          style={{ width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: sel ? "#0d9488" : "transparent", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: sel ? "rgba(255,255,255,0.2)" : "#f0fdfa", color: sel ? "#fff" : "#0d9488" }}>
                              {(p.name || '?')[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: sel ? "#fff" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                              <p style={{ fontSize: 10, margin: 0, color: sel ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{p.hospital_id}</p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <li style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 12 }}>No patients found</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {!selectedPatient && mode === null && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f0fdfa", border: "1px solid #ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#0d9488" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#334155", margin: "0 0 6px" }}>Select a Patient</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 280 }}>
                Choose a patient from the panel to view and manage their treatment plans.
              </p>
            </div>
          )}

          {mode !== null && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #99f6e4", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #ccfbf1", background: "#f0fdfa" }}>
                <div>
                  <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: 0 }}>
                    {mode === 'create' ? 'New Treatment Plan' : 'Edit Treatment Plan'}
                  </h2>
                  {selectedPatient && (
                    <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                      Patient: <span style={{ fontWeight: 600, color: "#0d9488" }}>{selectedPatient.name}</span>
                    </p>
                  )}
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <PlanForm
                  patients={patients}
                  initial={mode === 'edit' ? editPlan : null}
                  onSave={mode === 'create' ? handleCreate : handleUpdate}
                  onCancel={() => { setMode(null); setEditPlan(null); }}
                  saving={saving}
                  preselectedPatient={selectedPatient}
                />
              </div>
            </div>
          )}

          {selectedPatient && mode === null && (
            <>
              {/* Patient summary + stats */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, border: "1px solid #ccfbf1", flexShrink: 0 }}>
                  {(selectedPatient.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: "0 0 3px", letterSpacing: "-0.01em" }}>{selectedPatient.name}</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    {selectedPatient.hospital_id}
                    {selectedPatient.assigned_doctor ? ` · Dr. ${selectedPatient.assigned_doctor}` : ''}
                    {selectedPatient.tumour_type && selectedPatient.tumour_type !== 'Not Classified' ? ` · ${selectedPatient.tumour_type}` : ''}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {[
                    { label: "Active",    value: stats.active,    bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
                    { label: "Completed", value: stats.completed, bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" },
                    { label: "Total",     value: stats.total,     bg: "#f8fafc", text: "#334155", border: "#e2e8f0" },
                  ].map(({ label, value, bg, text, border }) => (
                    <div key={label} style={{ padding: "6px 14px", background: bg, color: text, borderRadius: 8, border: `1px solid ${border}`, textAlign: "center", minWidth: 52 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.75 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter bar */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ flex: 1, minWidth: 150, display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px" }}>
                  <span style={{ color: "#94a3b8", display: "flex" }}>{Ico.Search}</span>
                  <input style={{ fontSize: 13, background: "transparent", border: "none", outline: "none", width: "100%", color: "#0f172a" }}
                    placeholder="Search plans…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  {search && <button onClick={() => setSearch('')} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  style={{ ...inp, width: "auto", minWidth: 120, cursor: "pointer", fontSize: 12, padding: "7px 10px" }}>
                  <option value="All">All Types</option>
                  {PLAN_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ ...inp, width: "auto", minWidth: 120, cursor: "pointer", fontSize: 12, padding: "7px 10px" }}>
                  <option value="All">All Statuses</option>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {(search || filterType !== 'All' || filterStatus !== 'All') && (
                  <button onClick={() => { setSearch(''); setFilterType('All'); setFilterStatus('All'); }}
                    style={{ fontSize: 12, color: "#0d9488", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                    Clear
                  </button>
                )}
              </div>

              {/* Plans list */}
              {loadingPlans ? (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading plans…</p>
                </div>
              ) : byDate.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "#cbd5e1" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#334155", margin: "0 0 4px" }}>
                    {plans.length === 0 ? 'No treatment plans yet' : 'No matching plans'}
                  </h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    {plans.length === 0 ? 'Create the first treatment plan for this patient' : 'Adjust your filters to find plans'}
                  </p>
                  {plans.length === 0 && (
                    <button onClick={() => setMode('create')}
                      style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(13,148,136,0.25)" }}>
                      {Ico.Plus} Create Plan
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {byDate.map(([date, datePlans]) => (
                    <div key={date}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.04em" }}>{date}</span>
                        <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{datePlans.length} plan{datePlans.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {datePlans.map((plan) => (
                          <PlanCard
                            key={plan.id}
                            plan={plan}
                            expanded={expandedId === plan.id}
                            onToggle={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                            onEdit={(p) => { setEditPlan(p); setMode('edit'); }}
                            onDelete={(id) => setDeleteId(id)}
                            onStatusChange={handleQuickStatus}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 24px 48px rgba(0,0,0,0.2)", padding: "28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#dc2626" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: "0 0 6px" }}>Delete Treatment Plan?</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#64748b", background: "#fff", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, color: "#fff", background: "#dc2626", cursor: "pointer", boxShadow: "0 2px 8px rgba(220,38,38,0.25)" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
