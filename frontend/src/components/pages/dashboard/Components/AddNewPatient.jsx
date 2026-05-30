import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_BASE } from "../../../../util";


const SYMPTOM_TAGS = [
  "Headache", "Vision changes", "Seizures", "Memory loss",
  "Nausea", "Weakness", "Speech difficulty", "Balance issues", "Fatigue",
];

const STEPS = [
  { label: "Identity & Care", sub: "Personal info" },
  { label: "Contact",         sub: "Reach details" },
  { label: "Clinical Notes",  sub: "Symptoms" },
  { label: "Review",          sub: "Confirm & save" },
];

/* ─── Validation rules per step ───────────────────────────────────────── */
const validateStep = (step, data, selectedSymptoms) => {
  const errors = {};
  if (step === 1) {
    if (!data.assignedDoctor)  errors.assignedDoctor = "Please select a consulting doctor.";
    if (!data.name.trim())     errors.name           = "Full name is required.";
    if (!data.age)             errors.age            = "Age is required.";
    if (!data.gender)          errors.gender         = "Please select a gender.";
    if (!data.from.trim())     errors.from           = "Location / city is required.";
  }
  if (step === 2) {
    if (!data.email.trim())       errors.email        = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
    if (!data.patientPhone.trim()) errors.patientPhone = "Patient phone number is required.";
    // caretakerName & caretakerPhone are optional — no validation required
  }
  if (step === 3) {
    if (!selectedSymptoms.length && !data.symptomsNotes.trim())
      errors.symptoms = "Select at least one symptom or enter clinical notes.";
  }
  return errors;
};

/* ─── Inline SVG icons ────────────────────────────────────────────────── */
const TEAL       = "#0d9488";
const TEAL_LIGHT = "#e6f7f5";
const TEAL_MID   = "#99f6e4";

const Icons = {
  stethoscope: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  idBadge: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  addressBook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
      <circle cx="10" cy="10" r="2"/>
      <path d="M14 19c0-2.2-1.8-4-4-4s-4 1.8-4 4"/>
      <line x1="16" y1="8" x2="20" y2="8"/>
      <line x1="16" y1="12" x2="20" y2="12"/>
      <line x1="16" y1="16" x2="18" y2="16"/>
    </svg>
  ),
  activity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  clipboardList: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  fileScan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h3"/><path d="M17 4h3v3"/>
      <path d="M20 17v3h-3"/><path d="M7 20H4v-3"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  upload: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  arrowLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ns-text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  loader: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  alertCircle: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  mapPin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

/* ─── Style tokens ────────────────────────────────────────────────────── */
const css = {
  wrap: {
    background: "var(--ns-surface)",
    border: "2px solid #cbd5e1",
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
  },
  topBar: {
    background: "#0a1628",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    background: TEAL, color: "#fff",
    fontSize: 10, fontWeight: 700,
    padding: "3px 10px", borderRadius: 4,
    letterSpacing: "0.06em", marginRight: 12,
  },
  topTitle: { fontSize: 14, fontWeight: 600, color: "#f1f5f9" },
  topMeta:  { fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" },
  progressBar: {
    background: "#f1f5f9",
    borderBottom: "2px solid #cbd5e1",
    padding: "0 24px", display: "flex",
  },
  body: { padding: "24px", background: "#f8fafc" },
  panelRow: {
    display: "grid",
    gridTemplateColumns: "196px 1fr",
    border: "2px solid #94a3b8",
    borderRadius: 10, overflow: "hidden", marginBottom: 16,
  },
  panelLeft: {
    background: "#e2e8f0",
    padding: "22px 18px",
    borderRight: "2px solid #94a3b8",
  },
  panelLeftIconWrap: {
    width: 38, height: 38, borderRadius: 8,
    background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  panelLeftTitle: { fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 5 },
  panelLeftDesc:  { fontSize: 11, color: "#475569", lineHeight: 1.6 },
  panelRight: { background: "var(--ns-surface)", padding: "20px 22px" },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "#475569", marginBottom: 6,
  },
  input: (hasError) => ({
    width: "100%",
    border: `1.5px solid ${hasError ? "#dc2626" : "#94a3b8"}`,
    borderRadius: 6, padding: "9px 12px", fontSize: 13,
    color: "var(--ns-text)", background: "var(--ns-surface)",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s",
    background: hasError ? "#fff5f5" : "var(--ns-surface)",
  }),
  inputMono: {
    fontFamily: "'DM Mono', monospace", fontSize: 12,
    color: TEAL, background: "#f0fdfa", borderColor: TEAL_MID,
  },
  select: (hasError) => ({
    width: "100%",
    border: `1.5px solid ${hasError ? "#dc2626" : "#94a3b8"}`,
    borderRadius: 6, padding: "9px 12px", fontSize: 13,
    color: "var(--ns-text)", background: hasError ? "#fff5f5" : "var(--ns-surface)",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box", cursor: "pointer",
  }),
  errorMsg: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 11, color: "#dc2626", marginTop: 5, fontWeight: 500,
  },
  navRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 20, paddingTop: 16, borderTop: "2px solid #cbd5e1",
  },
  btnBack: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "#fff", border: "1.5px solid #94a3b8",
    color: "var(--ns-text-2)", padding: "9px 20px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnNext: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: TEAL, color: "#fff", border: "none",
    padding: "9px 22px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnSubmit: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: TEAL, color: "#fff", border: "none",
    padding: "10px 26px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  revCard: {
    border: "2px solid #94a3b8", borderRadius: 8,
    overflow: "hidden", marginBottom: 14,
  },
  revHead: {
    background: "#e2e8f0", borderBottom: "2px solid #94a3b8",
    padding: "10px 16px", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "#334155", display: "flex", alignItems: "center", gap: 8,
  },
  revRow: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "10px 16px",
  },
  revKey: { fontSize: 11, color: "#64748b", fontWeight: 600, flexShrink: 0 },
  revVal: { fontSize: 13, color: "var(--ns-text)", textAlign: "right" },
  ocrZone: (drag) => ({
    border: `2px dashed ${drag ? TEAL : "#94a3b8"}`,
    borderRadius: 10, padding: "14px 20px",
    background: drag ? "#f0fdfa" : "#fff",
    display: "flex", alignItems: "center", gap: 16,
    transition: "border-color 0.15s, background 0.15s", marginBottom: 16,
  }),
};

/* ─── Sub-components ──────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div style={css.progressBar}>
      {STEPS.map((s, i) => {
        const n = i + 1; const done = n < current; const active = n === current;
        return (
          <React.Fragment key={n}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "14px 0", borderBottom: `3px solid ${active ? TEAL : "transparent"}` }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: done ? TEAL_LIGHT : active ? TEAL : "#fff", color: done ? TEAL : active ? "#fff" : "#94a3b8", border: `2px solid ${done ? TEAL_MID : active ? TEAL : "#cbd5e1"}` }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : n}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? TEAL : done ? "#334155" : "#94a3b8" }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 1, background: "#cbd5e1", height: 24, alignSelf: "center", margin: "0 6px" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Panel({ icon, title, desc, children }) {
  return (
    <div style={css.panelRow}>
      <div style={css.panelLeft}>
        <div style={css.panelLeftIconWrap}>{icon}</div>
        <div style={css.panelLeftTitle}>{title}</div>
        <div style={css.panelLeftDesc}>{desc}</div>
      </div>
      <div style={css.panelRight}>{children}</div>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={css.label}>{label}</label>}
      {children}
      {error && (
        <div style={css.errorMsg}>
          {Icons.alertCircle} {error}
        </div>
      )}
    </div>
  );
}

const FieldDivider = () => (
  <div style={{ borderTop: "1.5px solid #e2e8f0", margin: "14px 0" }} />
);

function RevSection({ icon, title, rows }) {
  return (
    <div style={css.revCard}>
      <div style={css.revHead}>{icon}{title}</div>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ ...css.revRow, borderBottom: i < rows.length - 1 ? "1.5px solid #e2e8f0" : "none", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
          <span style={css.revKey}>{k}</span>
          <span style={{ ...css.revVal, fontFamily: k === "Hospital ID" ? "'DM Mono',monospace" : undefined, color: k === "Hospital ID" ? TEAL : undefined, fontSize: k === "Hospital ID" ? 12 : 13, fontWeight: k === "Hospital ID" ? 700 : 400 }}>
            {v || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not provided</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Nav({ step, onBack, onNext, onSubmit }) {
  return (
    <div style={css.navRow}>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Step {step} of 4</span>
      <div style={{ display: "flex", gap: 10 }}>
        {step > 1 && <button type="button" style={css.btnBack} onClick={onBack}>{Icons.arrowLeft} Back</button>}
        {step < 4
          ? <button type="button" style={css.btnNext} onClick={onNext}>Continue {Icons.arrowRight}</button>
          : <button type="submit" style={css.btnSubmit} onClick={onSubmit}>{Icons.check} Complete Registration</button>
        }
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════ */
const AddNewPatient = ({ onPatientAdded }) => {
  const navigate = useNavigate();
  const [step, setStep]                         = useState(1);
  const [errors, setErrors]                     = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isOcrLoading, setIsOcrLoading]         = useState(false);
  const [dragActive, setDragActive]             = useState(false);
  const [doctors, setDoctors]                   = useState([]);
  const [toast, setToast]                       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [data, setData] = useState({
    name: '', hospitalId: '', age: '', years: 'Years',
    gender: '', email: '', address: '',
    patientPhone: '', caretakerName: '', caretakerPhone: '', caretakerRelation: '',
    from: '', occupation: '',
    symptomsNotes: '', assignedDoctor: '',
  });

  /* ── Auto-generate next hospital ID ──────────────────────────────── */
  const fetchLatestId = async () => {
    try {
      const patients = await api("/patients/");
      let highestNum = 0;
      if (patients.length > 0) {
        const ids = patients.map(p =>
          p.hospital_id?.startsWith("NS-") ? parseInt(p.hospital_id.replace("NS-", ""), 10) : 0
        );
        highestNum = Math.max(...ids);
      }
      return `NS-${(highestNum + 1).toString().padStart(5, "0")}`;
    } catch { return "NS-00001"; }
  };

  useEffect(() => {
    fetchLatestId().then(id => setData(prev => ({ ...prev, hospitalId: id })));
    api("/auth/clinicians").then(setDoctors).catch(() => {});
  }, []);

  const handleInput = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    // Clear error for field as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /* ── Step navigation with validation ────────────────────────────── */
  const handleNext = () => {
    const errs = validateStep(step, data, selectedSymptoms);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  /* ── OCR drag & drop ─────────────────────────────────────────────── */
  const handleDrag = e => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = e => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processOcrFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = e => { if (e.target.files?.[0]) processOcrFile(e.target.files[0]); };
  const runOCR = () => document.getElementById("patient-ocr-file")?.click();

  const processOcrFile = async (file) => {
    setIsOcrLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/patients/ocr-extract`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Backend rejected the file.");
      const ext = await res.json();
      setData(prev => ({
        ...prev,
        name:             ext.name             || prev.name,
        age:              ext.age              || prev.age,
        gender:           ext.gender           || prev.gender,
        patientPhone:     ext.phone            || prev.patientPhone,
        email:            ext.email            || prev.email,
        from:             ext.from_location    || prev.from,
        occupation:       ext.occupation       || prev.occupation,
        address:          ext.address          || prev.address,
        assignedDoctor:   ext.assignedDoctor   || prev.assignedDoctor,
        symptomsNotes:    ext.symptomsNotes    || prev.symptomsNotes,
        caretakerName:    ext.caretakerName    || prev.caretakerName,
        caretakerPhone:   ext.caretakerPhone   || prev.caretakerPhone,
        caretakerRelation: ext.caretakerRelation || prev.caretakerRelation,
      }));
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Could not extract data. Make sure the backend is running and the file is valid.");
    } finally { setIsOcrLoading(false); }
  };

  /* ── Submit with final validation ────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation on all steps before submitting
    const step1Errs = validateStep(1, data, selectedSymptoms);
    const step2Errs = validateStep(2, data, selectedSymptoms);
    const step3Errs = validateStep(3, data, selectedSymptoms);
    const allErrs   = { ...step1Errs, ...step2Errs, ...step3Errs };

    if (Object.keys(allErrs).length > 0) {
      // Go back to the first step with errors
      if (Object.keys(step1Errs).length > 0) { setErrors(step1Errs); setStep(1); }
      else if (Object.keys(step2Errs).length > 0) { setErrors(step2Errs); setStep(2); }
      else { setErrors(step3Errs); setStep(3); }
      return;
    }

    const tagLine   = selectedSymptoms.join(", ");
    const fullNotes = [tagLine, data.symptomsNotes].filter(Boolean).join(" | ");

    const payload = {
      hospital_id:     data.hospitalId,
      name:            data.name,
      age:             data.age ? `${data.age} ${data.years}` : "",
      gender:          data.gender,
      email:            data.email         === "" ? null : data.email,
      phone:            data.patientPhone  === "" ? null : data.patientPhone,
      caretaker_name:     data.caretakerName     === "" ? null : data.caretakerName,
      caretaker_phone:    data.caretakerPhone    === "" ? null : data.caretakerPhone,
      caretaker_relation: data.caretakerRelation === "" ? null : data.caretakerRelation,
      address:          data.address,
      from_location:   data.from,
      occupation:      data.occupation,
      symptoms:        fullNotes,
      assigned_doctor_id: data.assignedDoctor ? parseInt(data.assignedDoctor) : null,
      joined_date:     new Date().toISOString().split("T")[0],
      discharge_date:  "Pending",
      tumour_type:     "Not Classified",
      risk_score:      "0%",
    };

    try {
      const saved = await api("/patients", { method: "POST", body: payload });
      if (onPatientAdded) onPatientAdded(saved);
      showToast('Patient successfully registered');
      setTimeout(() => navigate(`/patients/${saved.id}`), 1500);
    } catch (err) {
      console.error("Save Error:", err);
      showToast(err.message || 'Error saving patient. Please check your inputs.', 'error');
    }
  };

  const toggleSymptom = tag => {
    setSelectedSymptoms(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    if (errors.symptoms) setErrors(prev => ({ ...prev, symptoms: undefined }));
  };

  /* ─────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────── */
  return (
    <div style={css.wrap}>

      {/* Top bar */}
      <div style={css.topBar}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={css.badge}>NEW PATIENT</span>
          <span style={css.topTitle}>Patient Registration</span>
        </div>
        <span style={css.topMeta}>
          {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      <StepBar current={step} />

      <div style={css.body}>
        <form onSubmit={handleSubmit}>

          {/* ══ STEP 1 — Identity & Care ══════════════════════════════ */}
          {step === 1 && (
            <>
              {/* OCR zone */}
              <div style={{ position: "relative" }} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                <div style={css.ocrZone(dragActive)}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {Icons.fileScan}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Medical report auto-fill</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Upload an image or PDF — AI will populate fields below automatically</div>
                  </div>
                  <input id="patient-ocr-file" type="file" accept="image/*,application/pdf" onChange={handleFileInput} disabled={isOcrLoading} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 2 }} />
                  {isOcrLoading
                    ? <div style={{ ...css.btnNext, pointerEvents: "none", position: "relative", zIndex: 3 }}>{Icons.loader} Processing…</div>
                    : <button type="button" onClick={runOCR} style={{ ...css.btnNext, position: "relative", zIndex: 3 }}>{Icons.upload} Run OCR</button>
                  }
                </div>
              </div>

              {/* Consulting doctor */}
              <Panel icon={Icons.stethoscope} title="Consulting doctor" desc="Assign a specialist responsible for this patient's care">
                <Field label="Select specialist" error={errors.assignedDoctor} style={{ marginBottom: 0 }}>
                  <select name="assignedDoctor" value={data.assignedDoctor} onChange={handleInput} style={css.select(!!errors.assignedDoctor)}>
                    <option value="">— Select specialist —</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                  </select>
                </Field>
              </Panel>

              {/* Patient details */}
              <Panel icon={Icons.idBadge} title="Patient details" desc="Full name, assigned ID, age, biological sex, origin and occupation">
                <Field label="Full name" error={errors.name}>
                  <input name="name" type="text" value={data.name} onChange={handleInput} placeholder="Type patient full name here…" style={css.input(!!errors.name)} />
                </Field>

                <FieldDivider />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 0 }}>
                  <Field label="Hospital ID" style={{ marginBottom: 0 }}>
                    <div style={{ position: "relative" }}>
                      <input value={data.hospitalId} readOnly style={{ ...css.input(false), ...css.inputMono }} />
                      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: TEAL_LIGHT, color: TEAL, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.06em", border: `1px solid ${TEAL_MID}` }}>AUTO</span>
                    </div>
                  </Field>
                  <Field label="Age" error={errors.age} style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input name="age" type="number" value={data.age} onChange={handleInput} placeholder="e.g. 45" min="0" max="130" style={{ ...css.input(!!errors.age), flex: 1 }} />
                      <select name="years" value={data.years} onChange={handleInput} style={{ ...css.select(false), width: 90, flexShrink: 0 }}>
                        <option>Years</option>
                        <option>Months</option>
                      </select>
                    </div>
                  </Field>
                </div>

                <FieldDivider />

                <Field label="Gender" error={errors.gender} style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", border: `1.5px solid ${errors.gender ? "#dc2626" : "#94a3b8"}`, borderRadius: 6, overflow: "hidden" }}>
                    {["Male", "Female", "Other"].map((g, i) => {
                      const active = data.gender === g;
                      return (
                        <label key={g} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 6px", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400, background: active ? TEAL : "#fff", color: active ? "#fff" : "#475569", borderRight: i < 2 ? "1.5px solid #94a3b8" : "none", transition: "background 0.15s, color 0.15s", userSelect: "none" }}>
                          <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={handleInput} style={{ display: "none" }} />
                          {g}
                        </label>
                      );
                    })}
                  </div>
                </Field>

                <FieldDivider />

                {/* From & Occupation */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="From (City / Region)" error={errors.from} style={{ marginBottom: 0 }}>
                    <input name="from" type="text" value={data.from} onChange={handleInput} placeholder="e.g. Colombo" style={css.input(!!errors.from)} />
                  </Field>
                  <Field label="Occupation" style={{ marginBottom: 0 }}>
                    <input name="occupation" type="text" value={data.occupation} onChange={handleInput} placeholder="e.g. Teacher" style={css.input(false)} />
                  </Field>
                </div>
              </Panel>

              <Nav step={1} onNext={handleNext} />
            </>
          )}

          {/* ══ STEP 2 — Contact ══════════════════════════════════════ */}
          {step === 2 && (
            <>
              <Panel icon={Icons.addressBook} title="Contact details" desc="Email is used for report delivery. At least one phone number is required.">
                <Field label="Delivery email" error={errors.email}>
                  <input name="email" type="email" value={data.email} onChange={handleInput} placeholder="patient@mail.com" style={css.input(!!errors.email)} />
                </Field>

                <FieldDivider />

                {/* Patient phone */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 4, height: 16, background: TEAL, borderRadius: 2 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Patient contact</span>
                    <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 3, padding: "1px 7px", fontWeight: 600 }}>REQUIRED</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Patient phone number" error={errors.patientPhone} style={{ marginBottom: 0 }}>
                      <input name="patientPhone" type="tel" value={data.patientPhone} onChange={handleInput} placeholder="+94 XX XXX XXXX" style={css.input(!!errors.patientPhone)} />
                    </Field>
                    <Field label="Home address" style={{ marginBottom: 0 }}>
                      <input name="address" type="text" value={data.address} onChange={handleInput} placeholder="Street, City" style={css.input(false)} />
                    </Field>
                  </div>
                </div>

                <FieldDivider />

                {/* Caretaker section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 4, height: 16, background: "#94a3b8", borderRadius: 2 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Caretaker contact</span>
                    <span style={{ fontSize: 10, background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 3, padding: "1px 7px", fontWeight: 600 }}>OPTIONAL</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
                    Fill this section only if the patient has a caretaker or emergency contact.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <Field label="Caretaker full name" style={{ marginBottom: 0 }}>
                      <input name="caretakerName" type="text" value={data.caretakerName} onChange={handleInput} placeholder="e.g. Kamal Perera" style={css.input(false)} />
                    </Field>
                    <Field label="Caretaker phone number" style={{ marginBottom: 0 }}>
                      <input name="caretakerPhone" type="tel" value={data.caretakerPhone} onChange={handleInput} placeholder="+94 XX XXX XXXX" style={css.input(false)} />
                    </Field>
                    <Field label="Relation" style={{ marginBottom: 0 }}>
                      <input name="caretakerRelation" type="text" value={data.caretakerRelation} onChange={handleInput} placeholder="e.g. Spouse, Parent" style={css.input(false)} />
                    </Field>
                  </div>
                </div>
              </Panel>

              <Nav step={2} onBack={handleBack} onNext={handleNext} />
            </>
          )}

          {/* ══ STEP 3 — Clinical Notes ═══════════════════════════════ */}
          {step === 3 && (
            <>
              <Panel icon={Icons.activity} title="Presenting symptoms" desc="Select at least one symptom or enter clinical notes below">
                <Field label="Quick-select symptoms" error={errors.symptoms}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {SYMPTOM_TAGS.map(tag => {
                      const active = selectedSymptoms.includes(tag);
                      return (
                        <button key={tag} type="button" onClick={() => toggleSymptom(tag)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", border: `1.5px solid ${active ? TEAL : "#94a3b8"}`, background: active ? TEAL_LIGHT : "#fff", color: active ? TEAL : "#475569", transition: "all 0.15s" }}>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <FieldDivider />
                <Field label="Additional clinical observations" style={{ marginBottom: 0 }}>
                  <textarea name="symptomsNotes" value={data.symptomsNotes} onChange={handleInput} rows={4} placeholder="Record any additional clinical findings, patient history, or observations…" style={{ ...css.input(false), resize: "vertical", lineHeight: 1.6 }} />
                </Field>
              </Panel>

              <Nav step={3} onBack={handleBack} onNext={handleNext} />
            </>
          )}

          {/* ══ STEP 4 — Review & Confirm ═════════════════════════════ */}
          {step === 4 && (
            <>
              <RevSection icon={Icons.user} title="Identity & Care" rows={[
                ["Hospital ID",       data.hospitalId],
                ["Full name",         data.name],
                ["Age",               data.age ? `${data.age} ${data.years}` : ""],
                ["Gender",            data.gender],
                ["From",              data.from],
                ["Occupation",        data.occupation],
                ["Consulting doctor", data.assignedDoctor],
              ]} />
              <RevSection icon={Icons.phone} title="Contact information" rows={[
                ["Email",            data.email],
                ["Patient phone",    data.patientPhone],
                ["Address",          data.address],
                ["Caretaker name",     data.caretakerName     || "—"],
                ["Caretaker phone",    data.caretakerPhone    || "—"],
                ["Caretaker relation", data.caretakerRelation || "—"],
              ]} />
              <RevSection icon={Icons.clipboardList} title="Clinical notes" rows={[
                ["Symptoms", selectedSymptoms.length ? selectedSymptoms.join(", ") : "None selected"],
                ["Notes",    data.symptomsNotes],
              ]} />

              <Nav step={4} onBack={handleBack} onSubmit={handleSubmit} />
            </>
          )}

        </form>
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", fontSize: 13, fontWeight: 600, background: toast.type === 'error' ? "#dc2626" : "#0d9488", color: "#fff", minWidth: 240 }}>
          <span style={{ fontSize: 15 }}>{toast.type === 'error' ? '⚠' : '✓'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AddNewPatient;