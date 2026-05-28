import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../../util";

// ─── Icons ─────────────────────────────────────────────────────────────────
const Ic = {
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Patients:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  AddUser:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>,
  Upload:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Results:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Treatment: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Chain:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Mobile:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  Bell:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Staff:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  AuditLog:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Roles:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Settings:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Search:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Chevron:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Notif:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

const ROLE_COLORS = {
  "Super Admin": { bg: "#ede9fe", text: "#6d28d9" },
  "Admin":       { bg: "#dbeafe", text: "#1d4ed8" },
  "Clinician":   { bg: "#d1fae5", text: "#065f46" },
  "Assistant":   { bg: "#fef3c7", text: "#92400e" },
};

const ROUTE_LABELS = {
  "/":                   "Dashboard Overview",
  "/patients":           "All Patients",
  "/patients/new":       "Add New Patient",
  "/patients/:id":       "Patient Record",
  "/image/upload":       "Upload MRI",
  "/image/results":      "Classification Results",
  "/treatment-plans":    "Treatment Plans",
  "/blockchain":         "Blockchain Records",
  "/mobile-enrollment":  "Patient Enrollment",
  "/patient-alerts":     "Patient Alerts",
  "/staff":              "Staff Records",
  "/staff/new":          "Add New Staff",
  "/system/audit-logs":  "Audit Logs",
  "/system/user-roles":  "User Roles",
  "/settings":           "Personalized Settings",
};

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ user, size, borderRadius, fontSize, style = {} }) {
  const initials = (user?.name || user?.email || "?")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const src = user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null;
  const base = { width: size, height: size, borderRadius, flexShrink: 0, ...style };
  if (src) {
    return <img src={src} alt={user?.name || "avatar"} style={{ ...base, objectFit: "cover" }} />;
  }
  return (
    <div style={{ ...base, background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 700, color: "white" }}>
      {initials}
    </div>
  );
}

// ─── NavItem ───────────────────────────────────────────────────────────────
function NavItem({ to, label, Icon, end }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 8,
        fontSize: 13, fontWeight: isActive ? 500 : 400,
        color: isActive ? "#ccfbf1" : hovered ? "#e2e8f0" : "#94a3b8",
        background: isActive ? "rgba(13,148,136,0.18)" : hovered ? "rgba(255,255,255,0.05)" : "transparent",
        boxShadow: isActive ? "inset 3px 0 0 #2dd4bf" : "none",
        textDecoration: "none", marginBottom: 1,
        transition: "all 0.15s",
      })}
    >
      {Icon && <Icon />}
      <span>{label}</span>
    </NavLink>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────
function NavSection({ label }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 600, color: "#334155",
      textTransform: "uppercase", letterSpacing: "0.14em",
      padding: "16px 12px 5px",
      fontFamily: "'DM Mono', monospace",
    }}>
      {label}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function DashboardLayout({ user, onLogout, onUserUpdate }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const profileRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const role       = user?.role || "";
  const isAdmin    = ["Super Admin", "Admin"].includes(role);
  const isClinical = ["Super Admin", "Admin", "Clinician"].includes(role);

  const initials   = (user?.name || user?.email || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const today      = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const pageLabel  = ROUTE_LABELS[location.pathname] || "Dashboard";
  const roleStyle  = ROLE_COLORS[role] || { bg: "#f1f5f9", text: "#475569" };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ background: "var(--ns-bg)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ══════════ HEADER — fixed full width ══════════ */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: 60, background: "var(--ns-surface)",
          borderBottom: "1px solid var(--ns-border)",
          display: "flex", alignItems: "center",
          padding: "0 28px 0 20px", gap: 16,
          zIndex: 50,
        }}>

          {/* Brand in header (aligns with sidebar width) */}
          <div style={{ width: 248, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: "#040c16", height: 60, margin: "0 -20px 0 -20px", padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
              background: "linear-gradient(145deg, #14b8a6, #0f766e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(20,184,166,0.25)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.8px", lineHeight: 1 }}>
                NEURO<span style={{ color: "#2dd4bf" }}>SIGHT</span>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#334155", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 3 }}>
                AI Diagnostic Platform
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "var(--ns-border)", flexShrink: 0 }} />

          {/* Breadcrumb */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1 }}>
              NeuroSight AI
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ns-text)", marginTop: 2, lineHeight: 1 }}>
              {pageLabel}
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--ns-bg)", border: "1px solid var(--ns-border)",
            borderRadius: 8, padding: "7px 12px", width: 260,
          }}>
            <Ic.Search />
            <input
              style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--ns-text)", width: "100%", fontFamily: "'DM Sans', sans-serif" }}
              placeholder="Search patient, ID or staff…"
            />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--ns-border-2)", flexShrink: 0 }}>⌘K</span>
          </div>

          {/* Date */}
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--ns-text-3)", whiteSpace: "nowrap" }}>
            {today}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "var(--ns-border)", flexShrink: 0 }} />

          {/* Notification bell */}
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ns-text-3)", display: "flex", alignItems: "center", padding: 6, borderRadius: 7, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--ns-surface-2)"; e.currentTarget.style.color = "var(--ns-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ns-text-3)"; }}
          >
            <Ic.Notif />
          </button>

          {/* User chip + dropdown */}
          <div style={{ position: "relative" }} ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px 5px 5px",
                border: "1px solid var(--ns-border)", borderRadius: 8,
                background: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ns-border-2)"; e.currentTarget.style.background = "var(--ns-bg)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ns-border)"; e.currentTarget.style.background = "none"; }}
            >
              <Avatar user={user} size={28} borderRadius={6} fontSize={10} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ns-text)", lineHeight: 1 }}>{user?.name || "User"}</div>
                <div style={{ fontSize: 10, color: "#0d9488", marginTop: 2, lineHeight: 1 }}>{role}</div>
              </div>
              <div style={{ color: "var(--ns-text-3)", display: "flex", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                <Ic.Chevron />
              </div>
            </button>

            {profileOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: 240, background: "var(--ns-surface)",
                border: "1px solid var(--ns-border)", borderRadius: 12,
                boxShadow: "0 12px 32px rgba(0,0,0,0.22)", zIndex: 50, overflow: "hidden",
              }}>
                {/* Profile header */}
                <div style={{ padding: "16px", borderBottom: "1px solid var(--ns-border)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar user={user} size={40} borderRadius={10} fontSize={13} style={{ boxShadow: "0 0 0 2px rgba(13,148,136,0.25)" }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ns-text)", lineHeight: 1.2 }}>{user?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--ns-text-3)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.5)", display: "inline-block", flexShrink: 0 }} />
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        background: roleStyle.bg, color: roleStyle.text,
                        padding: "2px 7px", borderRadius: 4,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: "6px" }}>
                  <button
                    onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 10px", borderRadius: 7,
                      background: "none", border: "none",
                      color: "var(--ns-text-2)", cursor: "pointer",
                      fontSize: 12.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--ns-surface-2)"; e.currentTarget.style.color = "var(--ns-text)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ns-text-2)"; }}
                  >
                    <Ic.Settings />
                    Settings &amp; Preferences
                  </button>
                </div>

                <div style={{ height: 1, background: "var(--ns-border)", margin: "0 6px" }} />

                <div style={{ padding: "6px" }}>
                  <button
                    onClick={() => { setProfileOpen(false); onLogout?.(); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 10px", borderRadius: 7,
                      background: "none", border: "none",
                      color: "#ef4444", cursor: "pointer",
                      fontSize: 12.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    <Ic.Logout />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

      {/* ══════════ SIDEBAR — fixed ══════════ */}
      <aside style={{
        position: "fixed", top: 60, left: 0, bottom: 0,
        width: 248, background: "#040c16",
        display: "flex", flexDirection: "column",
        overflowY: "auto", zIndex: 40,
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px" }}>

          <NavSection label="Overview" />
          <NavItem to="/" end label="Dashboard" Icon={Ic.Dashboard} />

          <NavSection label="Clinical Data" />
          <NavItem to="/patients" label="All Patients" Icon={Ic.Patients} end />
          {role !== "Admin" && <NavItem to="/patients/new" label="Add New Patient" Icon={Ic.AddUser} end />}

          <NavSection label="Image Analysis" />
          {role !== "Admin" && <NavItem to="/image/upload" label="Upload MRI" Icon={Ic.Upload} />}
          <NavItem to="/image/results" label="Classification Results" Icon={Ic.Results} />

          {isAdmin && <>
            <NavSection label="Blockchain" />
            <NavItem to="/blockchain" label="Record History" Icon={Ic.Chain} />
          </>}

          {["Super Admin", "Clinician", "Assistant"].includes(role) && <>
            <NavSection label="Mobile Care" />
            <NavItem to="/mobile-enrollment" label="Patient Enrollment" Icon={Ic.Mobile} />
            <NavItem to="/patient-alerts"    label="Patient Alerts"     Icon={Ic.Bell} />
          </>}

          {isAdmin && <>
            <NavSection label="Staff Management" />
            <NavItem to="/staff"     label="Staff Records"  Icon={Ic.Staff}    end />
            <NavItem to="/staff/new" label="Add New Staff"  Icon={Ic.AddUser}  end />

            <NavSection label="System" />
            <NavItem to="/system/audit-logs" label="Audit Logs"  Icon={Ic.AuditLog} />
            <NavItem to="/system/user-roles" label="User Roles"  Icon={Ic.Roles} />
          </>}

          <NavSection label="Account" />
          <NavItem to="/settings" label="Settings" Icon={Ic.Settings} />

        </nav>

        {/* Sidebar footer — user card + sign out */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px" }}>

          {/* User card */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "10px 12px", marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar user={user} size={34} borderRadius={9} fontSize={11} style={{ boxShadow: "0 0 0 2px rgba(13,148,136,0.3)" }} />
                {/* Online dot */}
                <span style={{
                  position: "absolute", bottom: -1, right: -1,
                  width: 9, height: 9, borderRadius: "50%",
                  background: "#22c55e", border: "2px solid #040c16",
                  boxShadow: "0 0 5px rgba(34,197,94,0.5)",
                }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
                  {user?.name || user?.email || "User"}
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email || ""}
                </div>
                <span style={{
                  display: "inline-block", marginTop: 4,
                  fontSize: 8.5, fontWeight: 700,
                  background: roleStyle.bg, color: roleStyle.text,
                  padding: "1px 6px", borderRadius: 4,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={onLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.14)",
              color: "#f87171", cursor: "pointer",
              fontSize: 12.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.16)"; e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.14)"; }}
          >
            <Ic.Logout />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN + FOOTER — offset for fixed header & sidebar ══════════ */}
      <div style={{ marginLeft: 248, marginTop: 60, minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 32px", background: "var(--ns-bg)" }}>
          <Outlet context={{ user, onUserUpdate }} />
        </main>

        {/* Footer — relative, scrolls with content */}
        <footer style={{
          borderTop: "1px solid var(--ns-border)",
          background: "var(--ns-surface)",
          padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 44, gap: 24, flexShrink: 0,
        }}>
          {/* Left — brand + copyright */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "linear-gradient(145deg,#14b8a6,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--ns-text-2)", letterSpacing: "0.07em" }}>
              NEURO<span style={{ color: "#0d9488" }}>SIGHT</span>
            </span>
            <div style={{ width: 1, height: 12, background: "var(--ns-border)" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--ns-text-3)" }}>
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>

          {/* Centre — platform descriptors */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}>
            {["Encrypted Data Transfer", "Audit Trail", "Role-Based Access Control"].map((label, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--ns-text-3)" }}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ns-border-2)", display: "inline-block" }} />}
                {label}
              </span>
            ))}
          </div>

          {/* Right — status + version */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.45)" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--ns-text-3)" }}>All Systems Operational</span>
            </div>
            <div style={{ width: 1, height: 12, background: "var(--ns-border)" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--ns-text-3)" }}>v2.1.0</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
