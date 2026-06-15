import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { api } from "../../../../util";

const S = {
  page:      { display: "flex", flexDirection: "column", gap: 24 },
  pageHead:  { display: "flex", flexDirection: "column", gap: 4 },
  h1:        { fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 },
  sub:       { fontSize: 13, color: "var(--ns-text-2)", margin: 0 },
  grid2:     { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 },
  grid3:     { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 },
  grid32:    { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 },
  card:      { background: "var(--ns-surface)", borderRadius: 14, border: "1px solid var(--ns-border)", padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  statLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-2)", marginBottom: 10 },
  statNum:   { fontSize: 38, fontWeight: 800, color: "var(--ns-text)", lineHeight: 1 },
  statBadge: { display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, marginTop: 10 },
  accentBar: { width: 3, height: 20, borderRadius: 2, flexShrink: 0 },
  logDot:    { width: 8, height: 8, borderRadius: "50%", background: "#2dd4bf", flexShrink: 0, marginTop: 5 },
  btn:       { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", transition: "opacity 0.15s" },
  ghost:     { background: "transparent", border: "1px solid var(--ns-border)", color: "var(--ns-text-2)", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer" },
};

function Skeleton({ w = "100%", h = 20, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,var(--ns-surface-2) 25%,var(--ns-border) 50%,var(--ns-surface-2) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

const TUMOR_COLORS = {
  "Glioma":      { bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444" },
  "Meningioma":  { bg: "#eff6ff", text: "#1d4ed8", bar: "#3b82f6" },
  "Pituitary":   { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" },
  "No Tumor":    { bg: "#f0fdfa", text: "#0d9488", bar: "#2dd4bf" },
};

const SCAN_BADGE = {
  "No Scan":  { bg: "#f1f5f9", text: "#64748b" },
  "Pending":  { bg: "#fef9ee", text: "#92400e" },
  "Confirmed":{ bg: "#f0fdf4", text: "#15803d" },
};
const PLAN_BADGE = {
  "No Plan":   { bg: "#f1f5f9", text: "#64748b" },
  "Active":    { bg: "#eff6ff", text: "#1d4ed8" },
  "Completed": { bg: "#f0fdf4", text: "#15803d" },
  "Cancelled": { bg: "#fef2f2", text: "#b91c1c" },
};
const ADM_BADGE = {
  "Not Admitted": { bg: "#f1f5f9", text: "#64748b" },
  "Active":       { bg: "#fef9ee", text: "#92400e" },
  "Discharged":   { bg: "#f0fdf4", text: "#15803d" },
};

function StatusBadge({ label, map }) {
  const col = map[label] || { bg: "#f1f5f9", text: "#64748b" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: col.bg, color: col.text, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const TH = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ns-text-3)", padding: "0 12px 10px", whiteSpace: "nowrap", textAlign: "left" };
const TH_C = { ...TH, textAlign: "center" };
const TD = { fontSize: 13, padding: "11px 12px", borderTop: "1px solid var(--ns-border)", verticalAlign: "middle" };
const TD_C = { ...TD, textAlign: "center" };

function EmergencyCell({ count }) {
  if (!count) return <span style={{ fontSize: 11, color: "var(--ns-text-3)" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#fef2f2", color: "#b91c1c", whiteSpace: "nowrap" }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      {count}
    </span>
  );
}

function WorklistPanel({ worklist, loading, alertCounts, navigate }) {
  return (
    <div style={{ ...S.card, padding: "24px 0 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px 16px" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)" }}>My Worklist</div>
          <div style={{ fontSize: 12, color: "var(--ns-text-3)", marginTop: 2 }}>Recent patients — scan · plan · admission</div>
        </div>
        <button className="teal-btn" style={{ ...S.btn, background: "#0d9488", color: "#fff" }} onClick={() => navigate("/patients")}>
          All Patients
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...TH, paddingLeft: 28 }}>Patient</th>
              <th style={TH}>Tumour</th>
              <th style={TH_C}>Scan</th>
              <th style={TH_C}>Plan</th>
              <th style={TH_C}>Admission</th>
              <th style={{ ...TH_C, padding: "0 28px 10px 12px", color: "#dc2626" }}>Emergency</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3,4,5].map(i => (
                <tr key={i}>
                  {[140, 90, 80, 70, 80, 50].map((w, j) => (
                    <td key={j} style={{ ...TD, padding: j === 0 ? "11px 12px 11px 28px" : j === 5 ? "11px 28px 11px 12px" : "11px 12px" }}>
                      <Skeleton h={14} w={w} r={4} />
                    </td>
                  ))}
                </tr>
              ))
            ) : worklist.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...TD, textAlign: "center", padding: "32px 0", color: "var(--ns-text-3)", fontSize: 13 }}>
                  No patients yet
                </td>
              </tr>
            ) : (
              worklist.map(row => {
                const alertCount = alertCounts[String(row.patient_id)] || 0;
                return (
                  <tr
                    key={row.patient_id}
                    className="log-item"
                    style={{ cursor: "pointer", background: alertCount > 0 ? "#fff9f9" : undefined }}
                    onClick={() => navigate(`/patients/${row.patient_id}`, { state: { mode: "edit" } })}
                  >
                    <td style={{ ...TD, paddingLeft: 28 }}>
                      <div style={{ fontWeight: 600, color: "var(--ns-text)", fontSize: 13 }}>{row.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ns-text-3)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{row.hospital_id}</div>
                    </td>
                    <td style={TD}>
                      <span style={{ fontSize: 12, color: "var(--ns-text-2)" }}>{row.tumour_type}</span>
                    </td>
                    <td style={TD_C}><StatusBadge label={row.scan_status} map={SCAN_BADGE} /></td>
                    <td style={TD_C}><StatusBadge label={row.plan_status} map={PLAN_BADGE} /></td>
                    <td style={TD_C}><StatusBadge label={row.admission_status} map={ADM_BADGE} /></td>
                    <td style={{ ...TD_C, padding: "11px 28px 11px 12px" }}><EmergencyCell count={alertCount} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [summary, setSummary]     = useState(null);
  const [logs, setLogs]           = useState([]);
  const [worklist, setWorklist]   = useState([]);
  const [alertCounts, setAlertCounts] = useState({});
  const [loading, setLoading]     = useState(true);

  const role     = user?.role || "";
  const isAdmin  = ["Super Admin", "Admin"].includes(role);
  const isSuperAdmin = role === "Super Admin";
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = (() => {
    const raw = user?.name?.trim() || "";
    const withoutSalutation = raw.replace(/^(mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?)\s+/i, "").trim();
    return withoutSalutation.split(" ")[0] || "there";
  })();

  useEffect(() => {
    let live = true;
    setLoading(true);
    const fetches = isAdmin
      ? [api("/dashboard/summary").catch(() => null), api("/dashboard/audit-logs").catch(() => []), Promise.resolve([]), api("/dashboard/patient-alerts?limit=100").catch(() => [])]
      : [api("/dashboard/summary").catch(() => null), Promise.resolve([]), api("/dashboard/worklist").catch(() => []), api("/dashboard/patient-alerts?limit=100").catch(() => [])];
    Promise.all(fetches).then(([s, l, w, alerts]) => {
      if (!live) return;
      setSummary(s);
      setLogs(Array.isArray(l) ? l.slice(0, 6) : []);
      setWorklist(Array.isArray(w) ? w : []);
      if (Array.isArray(alerts)) {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const counts = {};
        alerts.forEach(a => {
          if (!a.created_at || new Date(a.created_at).getTime() < cutoff) return;
          const pid = String(a.patient_id);
          counts[pid] = (counts[pid] || 0) + 1;
        });
        setAlertCounts(counts);
      }
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [isAdmin]);

  const recentUploads = summary?.uploads_24h ?? 0;
  const totalScans    = summary?.total_scans   ?? 0;
  const tumorEntries  = summary?.tumour_breakdown ? Object.entries(summary.tumour_breakdown) : [];
  const totalStaff    = summary?.total_staff   ?? "—";
  const activeStaff   = summary?.active_staff  ?? "—";

  return (
    <div style={S.page}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important; transition: all 0.2s; }
        .tool-btn:hover  { background: var(--ns-surface-2) !important; }
        .teal-btn:hover  { opacity: 0.88; }
        .log-item:hover  { background: var(--ns-bg); }
      `}</style>

      {/* Page header */}
      <div style={S.pageHead}>
        <h1 style={S.h1}>{greeting}, {name}</h1>
        <p style={S.sub}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {role}
        </p>
      </div>

      {/* KPI row */}
      <div style={S.grid3}>
        {[
          {
            label: "Total Patients",
            value: summary?.total_patients ?? "—",
            badge: "Registered",
            badgeBg: "#f0fdfa", badgeText: "#0d9488",
            accent: "#2dd4bf",
          },
          {
            label: "Active In-Hospital",
            value: summary?.active_patients ?? "—",
            badge: "Pending Discharge",
            badgeBg: "#fef9ee", badgeText: "#92400e",
            accent: "#f59e0b",
          },
          isAdmin ? {
            label: "Total Staff",
            value: totalStaff,
            badge: "All roles",
            badgeBg: "#f0fdf4", badgeText: "#15803d",
            accent: "#22c55e",
          } : {
            label: "Total Scans Analysed",
            value: totalScans || "—",
            badge: "Predictions complete",
            badgeBg: "#f0fdf4", badgeText: "#15803d",
            accent: "#22c55e",
          },
          isAdmin ? {
            label: "Active Staff",
            value: activeStaff,
            badge: "Currently active",
            badgeBg: "#eff6ff", badgeText: "#1d4ed8",
            accent: "#3b82f6",
          } : {
            label: "Uploads (Last 24 h)",
            value: recentUploads,
            badge: "MRI files",
            badgeBg: "#eff6ff", badgeText: "#1d4ed8",
            accent: "#3b82f6",
          },
        ].map(({ label, value, badge, badgeBg, badgeText, accent }) => (
          <div key={label} className="stat-card" style={{ ...S.card, borderTop: `3px solid ${accent}` }}>
            {loading ? (
              <>
                <Skeleton h={11} w={100} r={4} />
                <div style={{ marginTop: 12 }}><Skeleton h={38} w={80} r={6} /></div>
                <div style={{ marginTop: 10 }}><Skeleton h={22} w={110} r={11} /></div>
              </>
            ) : (
              <>
                <div style={S.statLabel}>{label}</div>
                <div style={S.statNum}>{value}</div>
                <span style={{ ...S.statBadge, background: badgeBg, color: badgeText }}>{badge}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main content row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Audit log (admin) / My Worklist (clinical) */}
        {isAdmin ? (
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)" }}>Recent Activity</div>
                <div style={{ fontSize: 12, color: "var(--ns-text-3)", marginTop: 2 }}>System audit trail</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ghost" style={S.ghost} onClick={() => {
                  setLoading(true);
                  api("/dashboard/audit-logs").then(d => setLogs(Array.isArray(d) ? d.slice(0, 6) : [])).finally(() => setLoading(false));
                }}>Refresh</button>
                <button className="teal-btn" style={{ ...S.btn, background: "#0d9488", color: "#fff" }} onClick={() => navigate("/system/audit-logs")}>View All</button>
              </div>
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><Skeleton w={8} h={8} r={4} /><div style={{ flex: 1 }}><Skeleton h={13} w="70%" r={4} /><div style={{ marginTop: 5 }}><Skeleton h={11} w="40%" r={4} /></div></div></div>)}
              </div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ns-text-3)", fontSize: 13 }}>No recent activity</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {logs.map((l, i) => (
                  <div key={i} className="log-item" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: i < logs.length - 1 ? "1px solid var(--ns-border)" : "none", borderRadius: 6 }}>
                    <div style={S.logDot} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--ns-text-2)", fontWeight: 500, lineHeight: 1.4 }}>{l.message || l.action}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                        {l.timestamp ? new Date(l.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                        {l.user_name ? ` · ${l.user_name}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <WorklistPanel worklist={worklist} loading={loading} alertCounts={alertCounts} navigate={navigate} />
        )}

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tumour breakdown — clinical roles only */}
          {!isAdmin && <div style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)", marginBottom: 4 }}>AI Diagnostic Labels</div>
            <div style={{ fontSize: 12, color: "var(--ns-text-3)", marginBottom: 16 }}>Tumour classification breakdown</div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} h={32} r={6} />)}
              </div>
            ) : tumorEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ns-text-3)", fontSize: 12 }}>No diagnostic data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tumorEntries.map(([label, count]) => {
                  const col = TUMOR_COLORS[label] || { bg: "#f8fafc", text: "#475569", bar: "#94a3b8" };
                  const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
                  return (
                    <div key={label} style={{ background: col.bg, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: col.text }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col.text, fontFamily: "'DM Mono', monospace" }}>{count} <span style={{ fontWeight: 400, fontSize: 11 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(0,0,0,0.06)" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: col.bar, borderRadius: 2, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>}

          {/* Quick actions */}
          <div style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)", marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Upload MRI Scan",   path: "/image/upload",         show: role !== "Admin" },
                { label: "Add New Patient",   path: "/patients/new",          show: role !== "Admin" },
                { label: "View Patients",     path: "/patients",              show: true },
                { label: "Manage Staff",      path: "/staff",                 show: isAdmin },
                { label: "Audit Logs",        path: "/system/audit-logs",     show: isAdmin },
              ].filter(x => x.show).map(({ label, path }) => (
                <button key={path} className="tool-btn" onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--ns-bg)", border: "1px solid var(--ns-border)", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--ns-text-2)", textAlign: "left" }}>
                  {label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          </div>

          {/* User breakdown — admin only */}
          {isAdmin && (
            <div style={S.card}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)", marginBottom: 16 }}>Staff Breakdown</div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3].map(i => <Skeleton key={i} h={28} r={6} />)}
                </div>
              ) : summary?.total_users ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(summary.total_users).map(([role, count]) => (
                    <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--ns-bg)", borderRadius: 8, border: "1px solid var(--ns-border)" }}>
                      <span style={{ fontSize: 12, color: "var(--ns-text-2)", fontWeight: 500 }}>{role}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ns-text)", fontFamily: "'DM Mono', monospace" }}>{count}</span>
                    </div>
                  ))}
                  <button className="teal-btn" style={{ ...S.btn, background: "#0d9488", color: "#fff", marginTop: 8, justifyContent: "center", width: "100%" }} onClick={() => navigate("/staff")}>Manage Staff</button>
                </div>
              ) : (
                <div style={{ color: "var(--ns-text-3)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>No user data</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
