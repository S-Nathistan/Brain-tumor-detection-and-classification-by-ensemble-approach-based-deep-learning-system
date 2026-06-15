import React, { useState } from "react";
import { api, getCurrentUser } from "../../../../util";
import { useNavigate } from "react-router-dom";

function parseApiError(err, fallback) {
    try {
        const parsed = JSON.parse(err?.message || "{}");
        const detail = parsed.detail;
        if (Array.isArray(detail)) {
            return detail.map(d => d.msg || String(d)).join("; ") || fallback;
        }
        return detail || fallback;
    } catch {
        return err?.message || fallback;
    }
}

const STEPS = [
    { label: "Personal Details",     sub: "Name & gender" },
    { label: "Professional Profile", sub: "Role & credentials" },
    { label: "Contact & Access",     sub: "Login details" },
    { label: "Review",               sub: "Confirm & save" },
];

const DEPARTMENTS = [
    "Neurology", "Neurosurgery", "Neuro-Oncology", "Radiology",
    "Pathology & Lab", "ICU / Critical Care", "Emergency",
    "Administration", "Research", "IT & Systems", "Other",
];

const ROLES = [
    { value: "Clinician",   label: "Clinician",         desc: "Diagnoses patients, reviews MRI & AI results",  color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
    { value: "Admin",       label: "Administrator",      desc: "Manages staff accounts & hospital records",     color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { value: "Assistant",   label: "Clinical Assistant", desc: "Supports clinical staff & documentation",       color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { value: "Super Admin", label: "Super Admin",        desc: "Full system access & security control",         color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const TEAL       = "#0d9488";
const TEAL_LIGHT = "#e6f7f5";
const TEAL_MID   = "#99f6e4";

/* ─── Icons ─────────────────────────────────────────────────────── */
const Ico = {
    user:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    briefcase:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    shield:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    mail:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    phone:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    clipboard:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
    arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowLeft:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    check:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    eye:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    info:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    errX:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const css = {
    wrap:              { background: "var(--ns-surface)", border: "2px solid #cbd5e1", borderRadius: 12, overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
    topBar:            { background: "#0a1628", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    badge:             { background: TEAL, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.06em", marginRight: 12 },
    topTitle:          { fontSize: 14, fontWeight: 600, color: "#f1f5f9" },
    topMeta:           { fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" },
    progressBar:       { background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", padding: "0 24px", display: "flex" },
    body:              { padding: "24px", background: "#f8fafc" },
    panelRow:          { display: "grid", gridTemplateColumns: "196px 1fr", border: "2px solid #94a3b8", borderRadius: 10, overflow: "hidden", marginBottom: 16 },
    panelLeft:         { background: "#e2e8f0", padding: "22px 18px", borderRight: "2px solid #94a3b8" },
    panelLeftIconWrap: { width: 38, height: 38, borderRadius: 8, background: TEAL_LIGHT, border: `1.5px solid ${TEAL_MID}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    panelLeftTitle:    { fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 5 },
    panelLeftDesc:     { fontSize: 11, color: "#475569", lineHeight: 1.6 },
    panelRight:        { background: "var(--ns-surface)", padding: "20px 22px" },
    label:             { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", marginBottom: 6 },
    input:             { width: "100%", border: "1.5px solid #94a3b8", borderRadius: 6, padding: "9px 12px", fontSize: 13, color: "var(--ns-text)", background: "var(--ns-surface)", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
    select:            { width: "100%", border: "1.5px solid #94a3b8", borderRadius: 6, padding: "9px 12px", fontSize: 13, color: "var(--ns-text)", background: "var(--ns-surface)", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", cursor: "pointer" },
    navRow:            { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "2px solid #cbd5e1" },
    btnBack:           { display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #94a3b8", color: "#64748b", padding: "9px 20px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    btnNext:           { display: "inline-flex", alignItems: "center", gap: 7, background: TEAL, color: "#fff", border: "none", padding: "9px 22px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    btnSubmit:         { display: "inline-flex", alignItems: "center", gap: 7, background: TEAL, color: "#fff", border: "none", padding: "10px 26px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
    revCard:           { border: "2px solid #94a3b8", borderRadius: 8, overflow: "hidden", marginBottom: 14 },
    revHead:           { background: "#e2e8f0", borderBottom: "2px solid #94a3b8", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#334155", display: "flex", alignItems: "center", gap: 8 },
    revRow:            { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 16px" },
    revKey:            { fontSize: 11, color: "#64748b", fontWeight: 600, flexShrink: 0 },
    revVal:            { fontSize: 13, color: "var(--ns-text)", textAlign: "right" },
};

/* ─── Sub-components ─────────────────────────────────────────────── */

function StepBar({ current }) {
    return (
        <div style={css.progressBar}>
            {STEPS.map((s, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <React.Fragment key={n}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "14px 0", borderBottom: `3px solid ${active ? TEAL : "transparent"}` }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: done ? TEAL_LIGHT : active ? TEAL : "#fff", color: done ? TEAL : active ? "#fff" : "#94a3b8", border: `2px solid ${done ? TEAL_MID : active ? TEAL : "#cbd5e1"}` }}>
                                {done
                                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    : n
                                }
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: active ? TEAL : done ? "#334155" : "#94a3b8" }}>{s.label}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.sub}</div>
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{ width: 1, background: "#cbd5e1", height: 24, alignSelf: "center", margin: "0 6px" }} />
                        )}
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

function Field({ label, children, style }) {
    return (
        <div style={{ marginBottom: 14, ...style }}>
            {label && <label style={css.label}>{label}</label>}
            {children}
        </div>
    );
}

const FieldDivider = () => <div style={{ borderTop: "1.5px solid #e2e8f0", margin: "14px 0" }} />;

function RevSection({ icon, title, rows }) {
    return (
        <div style={css.revCard}>
            <div style={css.revHead}>{icon} {title}</div>
            {rows.map(([k, v], i) => (
                <div key={k} style={{ ...css.revRow, borderBottom: i < rows.length - 1 ? "1.5px solid #e2e8f0" : "none", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <span style={css.revKey}>{k}</span>
                    <span style={css.revVal}>{v || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not provided</span>}</span>
                </div>
            ))}
        </div>
    );
}

function Nav({ step, onBack, onNext, loading }) {
    return (
        <div style={css.navRow}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Step {step} of 4</span>
            <div style={{ display: "flex", gap: 10 }}>
                {step > 1 && (
                    <button type="button" style={css.btnBack} onClick={onBack}>
                        {Ico.arrowLeft} Back
                    </button>
                )}
                {step < 4
                    ? <button type="button" style={css.btnNext} onClick={onNext}>Continue {Ico.arrowRight}</button>
                    : <button type="submit" style={{ ...css.btnSubmit, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>
                        {loading ? "Creating account…" : <>{Ico.check} Create Staff Account</>}
                      </button>
                }
            </div>
        </div>
    );
}

/* ═══ Main Component ═════════════════════════════════════════════════ */
export default function AddNewStaff() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        name: "",
        gender: "",
        role: "Clinician",
        department: "",
        qualification: "",
        license_number: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        status: true,
    });

    const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
    const handleChange = e => set(e.target.name, e.target.value);

    const advanceTo = (n) => {
        setError(null);
        if (n === 2 && !form.name.trim()) {
            setError("Full name is required.");
            return;
        }
        if (n === 4) {
            if (!form.email.trim())  { setError("Email address is required."); return; }
            if (!form.password)      { setError("Password is required."); return; }
            if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
        }
        setStep(n);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
        setLoading(true);
        setError(null);
        try {
            await api("/auth/register", {
                method: "POST",
                body: {
                    name:           [form.title, form.name].filter(Boolean).join(" "),
                    email:          form.email,
                    mobile:         form.mobile     || undefined,
                    role:           form.role,
                    password:       form.password,
                    status:         form.status,
                    department:     form.department     || undefined,
                    qualification:  form.qualification  || undefined,
                    license_number: form.license_number || undefined,
                    gender:         form.gender         || undefined,
                },
            });
            navigate("/staff");
        } catch (err) {
            setError(parseApiError(err, "Failed to create staff account."));
        } finally {
            setLoading(false);
        }
    };

    const currentUser  = getCurrentUser();
    const availableRoles = currentUser?.role === "Admin"
      ? ROLES.filter(r => r.value !== "Super Admin")
      : ROLES;
    const selectedRole = availableRoles.find(r => r.value === form.role);
    const pwMismatch = form.confirmPassword && form.password !== form.confirmPassword;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Add New Staff</h1>
                    <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>Register a new hospital staff account with role-based access</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/staff")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--ns-surface)", border: "1.5px solid var(--ns-border)", color: "var(--ns-text-2)", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
                >
                    {Ico.arrowLeft} All Staff Records
                </button>
            </div>

            <div style={css.wrap}>
                {/* Top bar */}
                <div style={css.topBar}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={css.badge}>NEW STAFF</span>
                        <span style={css.topTitle}>Staff Account Registration</span>
                    </div>
                    <span style={css.topMeta}>
                        {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                </div>

                <StepBar current={step} />

                <div style={css.body}>
                    {error && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#b91c1c", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            {Ico.errX} {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* ══ STEP 1 — Personal Details ══════════════════════════ */}
                        {step === 1 && (
                            <>
                                <Panel icon={Ico.user} title="Staff Identity" desc="Full name and personal information of the new staff member">
                                    <Field label="Full Name *">
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <select
                                                name="title" value={form.title} onChange={handleChange}
                                                style={{ ...css.select, width: 100, flexShrink: 0 }}
                                            >
                                                <option value="">Title</option>
                                                <option>Dr.</option>
                                                <option>Prof.</option>
                                                <option>Mr.</option>
                                                <option>Mrs.</option>
                                                <option>Ms.</option>
                                                <option>Miss</option>
                                            </select>
                                            <input
                                                name="name" type="text" value={form.name}
                                                onChange={handleChange}
                                                placeholder="First and last name"
                                                style={{ ...css.input, flex: 1 }}
                                            />
                                        </div>
                                    </Field>
                                    <FieldDivider />
                                    <Field label="Gender" style={{ marginBottom: 0 }}>
                                        <div style={{ display: "flex", border: "1.5px solid #94a3b8", borderRadius: 6, overflow: "hidden" }}>
                                            {["Male", "Female", "Other"].map((g, i) => {
                                                const active = form.gender === g;
                                                return (
                                                    <label key={g} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 6px", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400, background: active ? TEAL : "var(--ns-surface)", color: active ? "#fff" : "#475569", borderRight: i < 2 ? "1.5px solid #94a3b8" : "none", transition: "background 0.15s, color 0.15s", userSelect: "none" }}>
                                                        <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} style={{ display: "none" }} />
                                                        {g}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                </Panel>
                                <Nav step={1} onNext={() => advanceTo(2)} />
                            </>
                        )}

                        {/* ══ STEP 2 — Professional Profile ══════════════════════ */}
                        {step === 2 && (
                            <>
                                <Panel icon={Ico.shield} title="Role Assignment" desc="Select the system role that determines the staff member's access permissions">
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        {availableRoles.map(r => {
                                            const active = form.role === r.value;
                                            return (
                                                <button
                                                    key={r.value}
                                                    type="button"
                                                    onClick={() => set("role", r.value)}
                                                    style={{ padding: "14px 16px", borderRadius: 8, border: `2px solid ${active ? r.color : "#e2e8f0"}`, background: active ? r.color : r.bg, textAlign: "left", cursor: "pointer", transition: "all 0.15s", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                                                >
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : r.color, marginBottom: 4 }}>{r.label}</div>
                                                    <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.8)" : "#64748b", lineHeight: 1.5 }}>{r.desc}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Panel>

                                <Panel icon={Ico.briefcase} title="Department & Credentials" desc="Professional affiliation and clinical qualifications">
                                    <Field label="Department">
                                        <select name="department" value={form.department} onChange={handleChange} style={css.select}>
                                            <option value="">— Select department —</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                    <FieldDivider />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <Field label="Qualification" style={{ marginBottom: 0 }}>
                                            <input
                                                name="qualification" value={form.qualification}
                                                onChange={handleChange}
                                                placeholder="e.g. MBBS, MD Neurology"
                                                style={css.input}
                                            />
                                        </Field>
                                        <Field label="License / Reg. No." style={{ marginBottom: 0 }}>
                                            <input
                                                name="license_number" value={form.license_number}
                                                onChange={handleChange}
                                                placeholder="e.g. SLMC-12345"
                                                style={css.input}
                                            />
                                        </Field>
                                    </div>
                                </Panel>

                                <Nav step={2} onBack={() => setStep(1)} onNext={() => advanceTo(3)} />
                            </>
                        )}

                        {/* ══ STEP 3 — Contact & Access ═══════════════════════════ */}
                        {step === 3 && (
                            <>
                                <Panel icon={Ico.mail} title="Contact Information" desc="Email is used for system login and will receive the account activation link">
                                    <Field label="Email Address *">
                                        <input
                                            name="email" type="email" value={form.email}
                                            onChange={handleChange}
                                            placeholder="staff@hospital.org"
                                            style={css.input}
                                        />
                                    </Field>
                                    <FieldDivider />
                                    <Field label="Mobile Number" style={{ marginBottom: 0 }}>
                                        <input
                                            name="mobile" type="tel" value={form.mobile}
                                            onChange={handleChange}
                                            placeholder="+94 XX XXX XXXX"
                                            style={css.input}
                                        />
                                    </Field>
                                </Panel>

                                <Panel icon={Ico.lock} title="Account Security" desc="Set a temporary password. Staff will receive an activation email to set their own.">
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <Field label="Temporary Password *">
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    name="password" type={showPassword ? "text" : "password"}
                                                    value={form.password} onChange={handleChange}
                                                    placeholder="Minimum 8 characters"
                                                    style={{ ...css.input, paddingRight: 40 }}
                                                />
                                                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                                                    {showPassword ? Ico.eyeOff : Ico.eye}
                                                </button>
                                            </div>
                                        </Field>
                                        <Field label="Confirm Password *">
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    name="confirmPassword" type={showConfirm ? "text" : "password"}
                                                    value={form.confirmPassword} onChange={handleChange}
                                                    placeholder="Repeat password"
                                                    style={{ ...css.input, paddingRight: 40, borderColor: pwMismatch ? "#ef4444" : undefined }}
                                                />
                                                <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                                                    {showConfirm ? Ico.eyeOff : Ico.eye}
                                                </button>
                                            </div>
                                            {pwMismatch && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>Passwords do not match</div>}
                                        </Field>
                                    </div>
                                    <FieldDivider />
                                    <Field label="Account Status" style={{ marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--ns-bg)", border: "1.5px solid #94a3b8", borderRadius: 6 }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{form.status ? "Active" : "Inactive"}</div>
                                                <div style={{ fontSize: 11, color: "#64748b" }}>{form.status ? "Staff can log in immediately after setup" : "Account disabled on creation"}</div>
                                            </div>
                                            <div
                                                style={{ width: 44, height: 24, borderRadius: 12, background: form.status ? TEAL : "#cbd5e1", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                                                onClick={() => set("status", !form.status)}
                                            >
                                                <div style={{ position: "absolute", top: 3, left: form.status ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                            </div>
                                        </div>
                                    </Field>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 6 }}>
                                        {Ico.info}
                                        <p style={{ margin: 0, fontSize: 12, color: "#0f766e", lineHeight: 1.5 }}>
                                            An activation email will be sent to <strong>{form.email || "the staff member"}</strong> with a one-time link to set their permanent password.
                                        </p>
                                    </div>
                                </Panel>

                                <Nav step={3} onBack={() => setStep(2)} onNext={() => advanceTo(4)} />
                            </>
                        )}

                        {/* ══ STEP 4 — Review & Confirm ══════════════════════════ */}
                        {step === 4 && (
                            <>
                                <RevSection icon={Ico.user} title="Personal & Role" rows={[
                                    ["Full Name", [form.title, form.name].filter(Boolean).join(" ")],
                                    ["Gender",    form.gender],
                                    ["Role",      selectedRole?.label || form.role],
                                ]} />
                                <RevSection icon={Ico.briefcase} title="Professional Details" rows={[
                                    ["Department",    form.department],
                                    ["Qualification", form.qualification],
                                    ["License No.",   form.license_number],
                                ]} />
                                <RevSection icon={Ico.mail} title="Contact & Access" rows={[
                                    ["Email",          form.email],
                                    ["Mobile",         form.mobile],
                                    ["Account Status", form.status ? "Active" : "Inactive"],
                                    ["Password",       "••••••••"],
                                ]} />
                                <Nav step={4} onBack={() => setStep(3)} loading={loading} />
                            </>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}
