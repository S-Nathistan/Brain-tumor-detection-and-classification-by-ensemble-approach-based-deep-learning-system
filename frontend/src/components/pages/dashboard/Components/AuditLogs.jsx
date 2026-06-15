import { useState, useMemo, useEffect } from 'react';
import { api } from '../../../../util';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api(`/dashboard/audit-logs?limit=50&status=${statusFilter}`);
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, logs]);

  const statusStyle = (s) => {
    if (s === "Success") return { bg: "#dcfce7", text: "#15803d" };
    if (s === "Failed")  return { bg: "#fef2f2", text: "#b91c1c" };
    if (s === "Warning") return { bg: "#fef9ee", text: "#92400e" };
    return { bg: "#f1f5f9", text: "#475569" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`.log-row:hover{background:var(--ns-bg)!important} .fil-btn:hover{background:var(--ns-bg)!important}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>System Audit Logs</h1>
        <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>Track and monitor all system activities and security events.</p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 400 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ns-text-3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search logs by action, user, or details…"
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid var(--ns-border)", borderRadius: 8, fontSize: 13, color: "var(--ns-text)", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", background: "var(--ns-bg)" }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Success", "Warning", "Failed"].map(s => (
            <button key={s} className="fil-btn" onClick={() => setStatusFilter(s)}
              style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", cursor: "pointer", border: `1px solid ${statusFilter === s ? "#0d9488" : "var(--ns-border)"}`, background: statusFilter === s ? "#0d9488" : "var(--ns-surface)", color: statusFilter === s ? "#fff" : "var(--ns-text-2)", transition: "all 0.15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--ns-bg)", borderBottom: "1px solid var(--ns-border)" }}>
                {["Timestamp", "User", "Action", "IP Address", "Status", "Details"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map((log, i) => {
                const ss = statusStyle(log.status);
                return (
                  <tr key={log.id} className="log-row" style={{ borderBottom: i < filteredLogs.length - 1 ? "1px solid var(--ns-border)" : "none" }}>
                    <td style={{ padding: "13px 16px", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--ns-text-3)", whiteSpace: "nowrap" }}>{new Date(log.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{log.user}</div>
                      <div style={{ fontSize: 11, color: "var(--ns-text-3)" }}>{log.role}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 500, color: "var(--ns-text-2)" }}>{log.action}</td>
                    <td style={{ padding: "13px 16px", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--ns-text-3)" }}>{log.ip}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: ss.bg, color: ss.text, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>{log.status}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ns-text-2)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.details}>{log.details}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: "48px 0", textAlign: "center", color: "var(--ns-text-3)", fontSize: 13 }}>No logs found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--ns-border)", background: "var(--ns-bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--ns-text-3)" }}>Showing {filteredLogs.length} of {logs.length} results</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button disabled style={{ padding: "5px 12px", border: "1px solid var(--ns-border)", borderRadius: 6, background: "var(--ns-surface)", fontSize: 12, color: "var(--ns-border-2)", cursor: "not-allowed" }}>Previous</button>
            <button style={{ padding: "5px 12px", border: "1px solid var(--ns-border)", borderRadius: 6, background: "var(--ns-surface)", fontSize: 12, color: "var(--ns-text-2)", cursor: "pointer" }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
