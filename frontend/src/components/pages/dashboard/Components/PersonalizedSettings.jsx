import { useState, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { api, setCurrentUser, API_BASE } from "../../../../util";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Ic = {
  User:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Lock:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Bell:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Cog:     () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Alert:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Scan:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Clip:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  Cal:     () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Brain:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 3a4 4 0 00-4 4c0 1.1.45 2.1 1.17 2.83C4.47 10.53 3 12.6 3 15a5 5 0 005 5h1v-3H8a3 3 0 01-3-3c0-1.46.83-2.73 2.05-3.35A4 4 0 009 3z"/><path d="M15 3a4 4 0 014 4c0 1.1-.45 2.1-1.17 2.83C19.53 10.53 21 12.6 21 15a5 5 0 01-5 5h-1v-3h1a3 3 0 003-3c0-1.46-.83-2.73-2.05-3.35A4 4 0 0015 3z"/><line x1="12" y1="3" x2="12" y2="20"/></svg>,
  Shield:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Stethoscope: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6 6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3"/><path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  Camera:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Wrench:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  Sun:     () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Palette: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
};

// ── Role sections data ────────────────────────────────────────────────────────
const ROLE_SECTIONS = {
  Admin: [
    {
      id: "system", label: "System", navIcon: Ic.Cog,
      title: "System Preferences", desc: "Global platform behaviour and security policies",
      fields: [
        { key: "session_timeout",          label: "Session timeout",          desc: "Automatically log out idle users after this period",       type: "select", options: ["15 minutes", "30 minutes", "1 hour", "2 hours", "Never"] },
        { key: "audit_retention",          label: "Audit log retention",      desc: "How long system audit records are kept on the server",    type: "select", options: ["30 days", "60 days", "90 days", "1 year", "Indefinite"] },
        { key: "force_2fa",                label: "Enforce two-factor authentication", desc: "Require all users to set up 2FA on next login",   type: "toggle" },
        { key: "allow_concurrent_sessions",label: "Concurrent sessions",      desc: "Allow the same account to be logged in on multiple devices", type: "toggle" },
        { key: "maintenance_banner",       label: "Maintenance banner",       desc: "Display a banner to all users announcing downtime",       type: "toggle" },
      ],
    },
    {
      id: "alerts", label: "Alerts", navIcon: Ic.Alert,
      title: "Admin Alerts", desc: "Configure which security and operational events trigger notifications",
      fields: [
        { key: "alert_new_user",     label: "New user registration",       desc: "Notify when a new staff account is created",                type: "toggle" },
        { key: "alert_failed_login", label: "Brute-force detection",       desc: "Notify after 5 consecutive failed login attempts on any account", type: "toggle" },
        { key: "alert_deactivation", label: "Account deactivation",        desc: "Notify when a staff account is suspended or removed",      type: "toggle" },
        { key: "alert_scan_anomaly", label: "Scan volume anomaly",         desc: "Notify when MRI upload rate exceeds normal thresholds",    type: "toggle" },
        { key: "alert_email",        label: "Alert delivery address",      desc: "All admin alerts are forwarded to this email",             type: "text",   placeholder: "admin@hospital.org" },
      ],
    },
  ],
  Clinician: [
    {
      id: "workflow", label: "Workflow", navIcon: Ic.Stethoscope,
      title: "Clinical Workflow", desc: "Adjust how patient records, reports and diagnoses behave",
      fields: [
        { key: "default_patient_sort",       label: "Default patient sort order",  desc: "How the patient list is ordered when you open it",        type: "select", options: ["Most recent", "Alphabetical", "Severity", "Admission date"] },
        { key: "autosave_interval",          label: "Report auto-save interval",   desc: "How often draft reports are automatically saved",         type: "select", options: ["30 seconds", "1 minute", "2 minutes", "5 minutes", "Disabled"] },
        { key: "show_confidence",            label: "Show AI confidence scores",   desc: "Display the model's confidence percentage on results",    type: "toggle" },
        { key: "confirm_before_submit",      label: "Confirm before submitting",   desc: "Show a confirmation dialog before finalising a diagnosis", type: "toggle" },
        { key: "default_diagnosis_template", label: "Default diagnosis template",  desc: "Pre-fill new reports with this template",                 type: "select", options: ["Brain Tumor Protocol", "Glioma Pathway", "Meningioma Review", "Pituitary Adenoma", "Custom"] },
      ],
    },
    {
      id: "diagnostics", label: "Diagnostics", navIcon: Ic.Brain,
      title: "Diagnostic Preferences", desc: "Control AI thresholds and scan viewing behaviour",
      fields: [
        { key: "confidence_threshold",  label: "Minimum confidence threshold", desc: "Results below this level are flagged for review",          type: "select", options: ["50%", "60%", "70%", "80%", "90%"] },
        { key: "highlight_critical",    label: "Highlight critical findings",  desc: "Auto-flag findings that meet critical severity criteria",   type: "toggle" },
        { key: "second_opinion_prompt", label: "Second-opinion prompt",        desc: "Prompt for peer review on low-confidence or ambiguous cases", type: "toggle" },
        { key: "preferred_scan_view",   label: "Preferred MRI plane",         desc: "Default slice orientation shown on the scan viewer",       type: "select", options: ["Axial", "Coronal", "Sagittal", "All views"] },
        { key: "priority_tags",         label: "Default case priority",        desc: "New cases are tagged with this priority by default",       type: "select", options: ["Routine", "Urgent", "Emergency", "Follow-up"] },
      ],
    },
  ],
  Assistant: [
    {
      id: "scheduling", label: "Scheduling", navIcon: Ic.Cal,
      title: "Scheduling Preferences", desc: "Configure appointment reminders and calendar defaults",
      fields: [
        { key: "reminder_advance",    label: "Reminder lead time",          desc: "How far in advance to send appointment reminders",         type: "select", options: ["15 minutes", "30 minutes", "1 hour", "2 hours", "1 day"] },
        { key: "calendar_view",       label: "Default calendar view",       desc: "View shown when opening the scheduling calendar",          type: "select", options: ["Day", "Week", "Month"] },
        { key: "show_cancelled",      label: "Show cancelled appointments", desc: "Include cancelled entries in the appointment list",        type: "toggle" },
        { key: "auto_confirm",        label: "Auto-confirm routine visits", desc: "Automatically confirm appointments flagged as routine",    type: "toggle" },
        { key: "working_hours_start", label: "Start of working hours",      desc: "The earliest slot available when booking appointments",   type: "select", options: ["06:00", "07:00", "08:00", "09:00"] },
      ],
    },
    {
      id: "documents", label: "Documents", navIcon: Ic.Clip,
      title: "Document & Records", desc: "Control how patient records are displayed and exported",
      fields: [
        { key: "doc_format",          label: "Export format",               desc: "Default file format when exporting patient documents",     type: "select", options: ["PDF", "DOCX", "CSV", "JSON"] },
        { key: "patient_name_format", label: "Patient name display",        desc: "How patient names appear throughout the application",     type: "select", options: ["First Last", "Last, First", "Last F.", "Full name"] },
        { key: "auto_archive",        label: "Auto-archive on discharge",   desc: "Move discharged patient records to archive automatically", type: "toggle" },
        { key: "show_patient_photo",  label: "Show patient photo",          desc: "Display photo in patient records when available",         type: "toggle" },
        { key: "records_per_page",    label: "Records per page",            desc: "Number of rows shown in patient list tables",             type: "select", options: ["10", "20", "50", "100"] },
      ],
    },
  ],
};
ROLE_SECTIONS["Super Admin"] = ROLE_SECTIONS.Admin;

const ROLE_LABELS = {
  "Super Admin": "Super Administrator",
  Admin:         "System Administrator",
  Clinician:     "Clinical Specialist",
  Assistant:     "Clinical Assistant",
};

const ROLE_GROUP_LABELS = {
  "Super Admin": "Administration",
  Admin:         "Administration",
  Clinician:     "Clinical",
  Assistant:     "Operations",
};

const DEFAULT_PREFS = {
  email_digest: false, browser_notifications: true,
  sound_alerts: false, notify_scan_complete: true,
  notify_report_ready: true, notify_system: false,
};

// ── Primitives ────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{ width: 40, height: 22, borderRadius: 11, background: on ? "#0d9488" : "#cbd5e1", border: "none", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0, padding: 0, outline: "none" }}>
      <span style={{ display: "block", position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Field({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--ns-border)", gap: 32 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ns-text)", margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "var(--ns-text-3)", margin: "3px 0 0", lineHeight: 1.5 }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginTop: 2 }}>{children}</div>
    </div>
  );
}

const selectStyle = { fontSize: 13, border: "1px solid var(--ns-border)", borderRadius: 8, padding: "7px 10px", background: "var(--ns-surface)", outline: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", color: "var(--ns-text)", minWidth: 180 };
const inputStyle  = { fontSize: 13, border: "1px solid var(--ns-border)", borderRadius: 8, padding: "8px 12px", background: "var(--ns-surface)", outline: "none", fontFamily: "'DM Sans',sans-serif", color: "var(--ns-text)", width: 220, boxSizing: "border-box" };
const lblStyle    = { display: "block", fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" };

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, desc, badge, children, action }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>{title}</h2>
            {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4", textTransform: "uppercase", letterSpacing: "0.06em" }}>{badge}</span>}
          </div>
          {desc && <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: 0, lineHeight: 1.6 }}>{desc}</p>}
        </div>
        {action}
      </div>
      <div style={{ borderTop: "1px solid var(--ns-border)" }}>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PersonalizedSettings() {
  const { user, onUserUpdate } = useOutletContext();
  const rawRole    = user?.role || "Clinician";
  const sections   = ROLE_SECTIONS[rawRole] || ROLE_SECTIONS.Clinician;
  const roleLabel  = ROLE_LABELS[rawRole]   || rawRole;
  const roleGroup  = ROLE_GROUP_LABELS[rawRole] || "Role";
  const PREFS_KEY  = `prefs_${user?.id}`;

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile]     = useState({ name: user?.name || "", mobile: user?.mobile || "" });
  const [pwdForm, setPwdForm]     = useState({ current: "", next: "", confirm: "" });
  const [prefs, setPrefs]         = useState(() => {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; }
    catch { return { ...DEFAULT_PREFS }; }
  });
  const [rolePrefs, setRolePrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${PREFS_KEY}_role`) || "{}"); }
    catch { return {}; }
  });
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [pwdVisible, setPwdVisible] = useState({ current: false, next: false, confirm: false });
  const [theme, setTheme]       = useState(() => localStorage.getItem("ns-theme") || "light");
  const [density, setDensity]   = useState(() => localStorage.getItem("ns-density") || "comfortable");

  const applyTheme = (pref) => {
    const DARK  = { "--ns-bg":"#080f1a","--ns-surface":"#0f172a","--ns-surface-2":"#1e293b","--ns-text":"#f1f5f9","--ns-text-2":"#94a3b8","--ns-text-3":"#475569","--ns-border":"#1e293b","--ns-border-2":"#334155" };
    const LIGHT = { "--ns-bg":"#f8fafc","--ns-surface":"#ffffff","--ns-surface-2":"#f1f5f9","--ns-text":"#0f172a","--ns-text-2":"#475569","--ns-text-3":"#94a3b8","--ns-border":"#e2e8f0","--ns-border-2":"#cbd5e1" };
    const dark  = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const vars  = dark ? DARK : LIGHT;
    const root  = document.documentElement;
    root.setAttribute("data-theme", dark ? "dark" : "light");
    // Write directly onto :root so all var() references update immediately,
    // including inline styles that use var(--ns-*) tokens
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem("ns-theme", pref);
    setTheme(pref);
    showToast(`Theme changed to ${pref}`);
  };

  const applyDensity = (d) => {
    document.documentElement.setAttribute("data-density", d);
    localStorage.setItem("ns-density", d);
    setDensity(d);
    showToast("Density updated");
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const savePrefs = useCallback((updated) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    setPrefs(updated);
    showToast("Preferences saved");
  }, [PREFS_KEY]);

  const saveRolePrefs = useCallback((updated) => {
    localStorage.setItem(`${PREFS_KEY}_role`, JSON.stringify(updated));
    setRolePrefs(updated);
    showToast("Settings saved");
  }, [PREFS_KEY]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api("/auth/me", { method: "PUT", body: { name: profile.name, mobile: profile.mobile } });
      setCurrentUser(updated);
      showToast("Profile updated");
    } catch { showToast("Failed to update profile", "error"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwdForm.next !== pwdForm.confirm) return showToast("New passwords do not match", "error");
    if (pwdForm.next.length < 8)          return showToast("Password must be at least 8 characters", "error");
    setSaving(true);
    try {
      await api("/auth/me", { method: "PUT", body: { current_password: pwdForm.current, new_password: pwdForm.next } });
      setPwdForm({ current: "", next: "", confirm: "" });
      showToast("Password updated");
    } catch { showToast("Incorrect current password", "error"); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return showToast("Only JPEG, PNG or WebP images allowed", "error");
    if (file.size > 5 * 1024 * 1024)  return showToast("Image must be under 5 MB", "error");
    setAvatarLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const updated = await api("/auth/me/avatar", { method: "POST", body: form, isForm: true });
      setCurrentUser(updated);
      onUserUpdate?.(updated);
      showToast("Profile picture updated");
    } catch { showToast("Failed to upload image", "error"); }
    finally { setAvatarLoading(false); e.target.value = ""; }
  };

  const initials = (user?.name || user?.email || "?")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarSrc = user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null;

  // ── Nav structure ──────────────────────────────────────────────────────────
  const navGroups = [
    {
      label: "Account",
      items: [
        { id: "profile",  label: "Profile",  Icon: Ic.User },
        { id: "security", label: "Security", Icon: Ic.Lock },
      ],
    },
    {
      label: "Preferences",
      items: [
        { id: "notifications", label: "Notifications", Icon: Ic.Bell },
        { id: "appearance",    label: "Appearance",    Icon: Ic.Palette },
      ],
    },
    {
      label: roleGroup,
      items: sections.map((s) => ({ id: s.id, label: s.label, Icon: s.navIcon })),
    },
  ];

  // ── Render role section fields ─────────────────────────────────────────────
  const renderFields = (fields) =>
    fields.map((f) => (
      <Field key={f.key} label={f.label} desc={f.desc}>
        {f.type === "toggle" ? (
          <Toggle on={!!rolePrefs[f.key]} onChange={(v) => saveRolePrefs({ ...rolePrefs, [f.key]: v })} />
        ) : f.type === "select" ? (
          <select style={selectStyle} value={rolePrefs[f.key] || f.options[0]}
            onChange={(e) => saveRolePrefs({ ...rolePrefs, [f.key]: e.target.value })}>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input style={inputStyle} value={rolePrefs[f.key] || ""} placeholder={f.placeholder}
            onChange={(e) => setRolePrefs((r) => ({ ...r, [f.key]: e.target.value }))}
            onBlur={() => saveRolePrefs(rolePrefs)} />
        )}
      </Field>
    ));

  const activeSection = sections.find((s) => s.id === activeTab);

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingBottom: 60, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        .ps-nav:hover { background: var(--ns-surface-2) !important; color: var(--ns-text) !important; }
        .ps-inp:focus { border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.1) !important; outline: none; }
        .ps-inp { transition: border-color 0.15s; }
        .ps-eye:hover { color: var(--ns-text) !important; }
        select option { background: var(--ns-surface); color: var(--ns-text); }
        div:hover > .avatar-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.15)", fontSize: 13, fontWeight: 600, background: toast.type === "error" ? "#dc2626" : "#0d9488", color: "#fff" }}>
          <span style={{ fontSize: 15 }}>{toast.type === "error" ? "⚠" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ns-text)", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: 0 }}>Manage your account, preferences and role-specific options</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "208px 1fr", gap: 32, alignItems: "start" }}>

        {/* ── Sidebar ── */}
        <div style={{ position: "sticky", top: 16 }}>
          {/* User card */}
          <div style={{ background: "#040c16", borderRadius: 12, padding: "16px", marginBottom: 20, border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 13, fontWeight: 800, color: "#2dd4bf" }}>{initials}</span>
                }
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "—"}</p>
                <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Nav groups */}
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px 8px" }}>{group.label}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {group.items.map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button key={id} className={active ? "" : "ps-nav"}
                      onClick={() => setActiveTab(id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#0d9488" : "var(--ns-text-2)", background: active ? "#f0fdfa" : "transparent", transition: "all 0.12s", width: "100%" }}>
                      <span style={{ color: active ? "#0d9488" : "#94a3b8", display: "flex", flexShrink: 0 }}><Icon /></span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div style={{ background: "var(--ns-surface)", borderRadius: 14, border: "1px solid var(--ns-border)", padding: "28px 32px", minHeight: 400 }}>

          {/* ══ Profile ══ */}
          {activeTab === "profile" && (
            <Section title="Profile" desc="Your name and contact details as they appear across the platform.">
              {/* Avatar row */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderBottom: "1px solid var(--ns-border)" }}>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarUpload} />
                <div
                  onClick={() => !avatarLoading && fileInputRef.current?.click()}
                  title="Click to change profile picture"
                  style={{ position: "relative", width: 72, height: 72, borderRadius: 18, flexShrink: 0, cursor: avatarLoading ? "wait" : "pointer", overflow: "hidden", border: "2px solid var(--ns-border)" }}
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white" }}>
                        {initials}
                      </div>
                    )
                  }
                  {/* Hover overlay */}
                  <div className="avatar-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, opacity: 0, transition: "opacity 0.15s" }}>
                    {avatarLoading
                      ? <div style={{ width: 18, height: 18, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      : <>
                          <Ic.Camera />
                          <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", lineHeight: 1 }}>Change</span>
                        </>
                    }
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ns-text)", margin: 0 }}>{user?.name || "—"}</p>
                  <p style={{ fontSize: 12, color: "var(--ns-text-3)", margin: "3px 0 0" }}>{user?.email}</p>
                  <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4" }}>{rawRole}</span>
                  <p style={{ fontSize: 11, color: "var(--ns-text-3)", margin: "6px 0 0" }}>Click the photo to upload a new one · JPEG, PNG or WebP · max 5 MB</p>
                </div>
              </div>

              {/* Fields */}
              <Field label="Full name" desc="Your display name shown to colleagues and in reports">
                <input className="ps-inp" style={{ ...inputStyle, width: 260 }} value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
              </Field>
              <Field label="Mobile number" desc="Used for urgent contact and optional SMS alerts">
                <input className="ps-inp" style={{ ...inputStyle, width: 220 }} value={profile.mobile}
                  onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Email address" desc="Login email — contact your administrator to change this">
                <div style={{ position: "relative" }}>
                  <input style={{ ...inputStyle, width: 260, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} value={user?.email || ""} readOnly />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#cbd5e1" }}>
                    <Ic.Lock />
                  </span>
                </div>
              </Field>

              <div style={{ paddingTop: 20 }}>
                <button onClick={saveProfile} disabled={saving}
                  style={{ padding: "9px 20px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, color: "#fff", background: saving ? "#94a3b8" : "#0d9488", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 1px 8px rgba(13,148,136,0.25)" }}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </Section>
          )}

          {/* ══ Security ══ */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              <Section title="Change password" desc="Choose a strong password you don't use elsewhere.">
                {[
                  { key: "current", label: "Current password",    placeholder: "Enter current password" },
                  { key: "next",    label: "New password",         placeholder: "At least 8 characters" },
                  { key: "confirm", label: "Confirm new password", placeholder: "Repeat new password" },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <div style={{ position: "relative" }}>
                      <input type={pwdVisible[key] ? "text" : "password"} className="ps-inp"
                        style={{ ...inputStyle, width: 280, paddingRight: 36 }}
                        value={pwdForm[key]}
                        onChange={(e) => setPwdForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} />
                      <button type="button" className="ps-eye" onClick={() => setPwdVisible(v => ({ ...v, [key]: !v[key] }))}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 12, padding: 0 }}>
                        {pwdVisible[key] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>
                ))}
                <div style={{ paddingTop: 20 }}>
                  <button onClick={changePassword}
                    disabled={saving || !pwdForm.current || !pwdForm.next || !pwdForm.confirm}
                    style={{ padding: "9px 20px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, color: "#fff", background: (saving || !pwdForm.current || !pwdForm.next || !pwdForm.confirm) ? "#94a3b8" : "#0d9488", cursor: (saving || !pwdForm.current) ? "not-allowed" : "pointer" }}>
                    {saving ? "Updating…" : "Update password"}
                  </button>
                </div>
              </Section>

              <Section title="Session & access" desc="Current session details and access-level information.">
                <Field label="Account status">
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Active</span>
                  </div>
                </Field>
                <Field label="Assigned role">
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4" }}>{rawRole}</span>
                </Field>
                <Field label="Authentication">
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Password + JWT</span>
                </Field>
                <Field label="Password requirements">
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {["Min. 8 characters", "Letters and numbers", "No reuse of previous passwords"].map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#f0fdfa", border: "1px solid #99f6e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#0d9488", flexShrink: 0 }}>✓</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </Field>
              </Section>
            </div>
          )}

          {/* ══ Notifications ══ */}
          {activeTab === "notifications" && (
            <Section title="Notifications" desc="Choose which events trigger alerts and how they are delivered to you.">
              {[
                { key: "email_digest",          label: "Daily email digest",            desc: "Morning summary of all platform activity sent to your inbox" },
                { key: "browser_notifications", label: "Browser notifications",         desc: "Desktop push alerts while the application is open" },
                { key: "sound_alerts",          label: "Sound alerts",                  desc: "Audio cue played when a high-priority notification arrives" },
                { key: "notify_scan_complete",  label: "Scan classification complete",  desc: "Notified when the AI finishes analysing an uploaded MRI" },
                { key: "notify_report_ready",   label: "Report ready for review",       desc: "Notified when a clinician submits a finalised report" },
                { key: "notify_system",         label: "System & maintenance",          desc: "Platform downtime notices and scheduled maintenance windows" },
              ].map(({ key, label, desc }) => (
                <Field key={key} label={label} desc={desc}>
                  <Toggle on={!!prefs[key]} onChange={(v) => savePrefs({ ...prefs, [key]: v })} />
                </Field>
              ))}
            </Section>
          )}

          {/* ══ Appearance ══ */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <Section title="Theme" desc="Choose how NeuroSight AI looks. Dark mode uses your system's CSS variable overrides.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, paddingTop: 20 }}>
                  {[
                    {
                      id: "light", label: "Light", desc: "Standard light interface",
                      preview: (
                        <svg viewBox="0 0 120 72" width="100%" style={{ display: "block", borderRadius: 6, overflow: "hidden" }}>
                          <rect width="120" height="72" fill="#f8fafc"/>
                          <rect width="26" height="72" fill="#040c16"/>
                          <rect x="6" y="12" width="14" height="3" rx="1.5" fill="#2dd4bf" opacity="0.8"/>
                          <rect x="6" y="20" width="12" height="2" rx="1" fill="#334155" opacity="0.5"/>
                          <rect x="6" y="25" width="12" height="2" rx="1" fill="#334155" opacity="0.3"/>
                          <rect x="6" y="30" width="12" height="2" rx="1" fill="#334155" opacity="0.3"/>
                          <rect x="34" y="10" width="78" height="52" rx="4" fill="#fff"/>
                          <rect x="40" y="16" width="40" height="4" rx="2" fill="#0f172a" opacity="0.7"/>
                          <rect x="40" y="24" width="66" height="3" rx="1.5" fill="#e2e8f0"/>
                          <rect x="40" y="30" width="50" height="3" rx="1.5" fill="#e2e8f0"/>
                          <rect x="40" y="42" width="24" height="8" rx="3" fill="#0d9488"/>
                        </svg>
                      ),
                    },
                    {
                      id: "dark", label: "Dark", desc: "Easier on the eyes in low light",
                      preview: (
                        <svg viewBox="0 0 120 72" width="100%" style={{ display: "block", borderRadius: 6, overflow: "hidden" }}>
                          <rect width="120" height="72" fill="#080f1a"/>
                          <rect width="26" height="72" fill="#040c16"/>
                          <rect x="6" y="12" width="14" height="3" rx="1.5" fill="#2dd4bf" opacity="0.9"/>
                          <rect x="6" y="20" width="12" height="2" rx="1" fill="#2dd4bf" opacity="0.2"/>
                          <rect x="6" y="25" width="12" height="2" rx="1" fill="#334155" opacity="0.5"/>
                          <rect x="6" y="30" width="12" height="2" rx="1" fill="#334155" opacity="0.3"/>
                          <rect x="34" y="10" width="78" height="52" rx="4" fill="#0f172a"/>
                          <rect x="40" y="16" width="40" height="4" rx="2" fill="#f1f5f9" opacity="0.8"/>
                          <rect x="40" y="24" width="66" height="3" rx="1.5" fill="#1e293b"/>
                          <rect x="40" y="30" width="50" height="3" rx="1.5" fill="#1e293b"/>
                          <rect x="40" y="42" width="24" height="8" rx="3" fill="#0d9488"/>
                        </svg>
                      ),
                    },
                    {
                      id: "system", label: "System", desc: "Follows your OS preference automatically",
                      preview: (
                        <svg viewBox="0 0 120 72" width="100%" style={{ display: "block", borderRadius: 6, overflow: "hidden" }}>
                          <rect width="60" height="72" fill="#f8fafc"/>
                          <rect width="13" height="72" fill="#040c16"/>
                          <rect x="3" y="12" width="7" height="2" rx="1" fill="#2dd4bf" opacity="0.8"/>
                          <rect x="17" y="10" width="39" height="52" rx="4" fill="#fff"/>
                          <rect x="20" y="16" width="20" height="3" rx="1.5" fill="#0f172a" opacity="0.7"/>
                          <rect x="20" y="23" width="32" height="2" rx="1" fill="#e2e8f0"/>
                          <rect x="20" y="28" width="26" height="2" rx="1" fill="#e2e8f0"/>
                          <rect x="60" width="60" height="72" fill="#080f1a"/>
                          <rect x="60" width="13" height="72" fill="#040c16"/>
                          <rect x="63" y="12" width="7" height="2" rx="1" fill="#2dd4bf" opacity="0.9"/>
                          <rect x="77" y="10" width="39" height="52" rx="4" fill="#0f172a"/>
                          <rect x="80" y="16" width="20" height="3" rx="1.5" fill="#f1f5f9" opacity="0.7"/>
                          <rect x="80" y="23" width="32" height="2" rx="1" fill="#1e293b"/>
                          <rect x="80" y="28" width="26" height="2" rx="1" fill="#1e293b"/>
                        </svg>
                      ),
                    },
                  ].map(({ id, label, desc, preview }) => {
                    const active = theme === id;
                    return (
                      <button key={id} onClick={() => applyTheme(id)}
                        style={{ background: "none", border: `2px solid ${active ? "#0d9488" : "#e2e8f0"}`, borderRadius: 12, padding: 0, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s", overflow: "hidden" }}>
                        <div style={{ background: active ? "#f0fdfa" : "#f8fafc", padding: "2px 2px 0" }}>
                          {preview}
                        </div>
                        <div style={{ padding: "10px 14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#0d9488" : "#0f172a" }}>{label}</span>
                            {active && (
                              <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Interface density" desc="Controls spacing and padding throughout the application. Compact is better for high-density data workflows.">
                <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { id: "comfortable", label: "Comfortable", desc: "Standard spacing — recommended for most workflows" },
                    { id: "compact",     label: "Compact",     desc: "Tighter rows and reduced padding for data-heavy screens" },
                  ].map(({ id, label, desc }) => {
                    const active = density === id;
                    return (
                      <label key={id} onClick={() => applyDensity(id)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 10, border: `1px solid ${active ? "#99f6e4" : "#f1f5f9"}`, background: active ? "#f0fdfa" : "#fff", cursor: "pointer", transition: "all 0.15s", marginBottom: 2 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? "#0d9488" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d9488" }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "#0d9488" : "#0f172a", margin: 0 }}>{label}</p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Section>
            </div>
          )}

          {/* ══ Role-specific sections ══ */}
          {activeSection && (
            <Section title={activeSection.title} desc={activeSection.desc} badge={`${rawRole} only`}>
              {renderFields(activeSection.fields)}
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}
