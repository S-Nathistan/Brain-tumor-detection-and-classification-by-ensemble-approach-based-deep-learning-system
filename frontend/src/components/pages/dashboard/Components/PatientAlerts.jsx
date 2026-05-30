import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../util";

function timeLabel(value) {
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function PatientAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "acknowledged"
  const [ackingId, setAckingId] = useState(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api("/dashboard/patient-alerts?limit=100")
      .then(data => {
        if (!live) return;
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (!live) return;
        setError(err?.message || "Failed to load patient alerts.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => { live = false; };
  }, []);

  async function handleAcknowledge(alertId) {
    setAckingId(alertId);
    try {
      const result = await api(`/dashboard/patient-alerts/${alertId}/acknowledge`, { method: "PATCH" });
      setAlerts(prev => prev.map(a =>
        a.id === alertId
          ? { ...a, acknowledged_by_name: result.acknowledged_by_name, acknowledged_at: result.acknowledged_at }
          : a
      ));
    } catch (err) {
      alert(err?.message || "Failed to acknowledge alert.");
    } finally {
      setAckingId(null);
    }
  }

  const pendingCount = useMemo(() => alerts.filter(a => !a.acknowledged_at).length, [alerts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter(alert => {
      if (filter === "pending" && alert.acknowledged_at) return false;
      if (filter === "acknowledged" && !alert.acknowledged_at) return false;
      if (!q) return true;
      const haystack = [alert.patient_name, alert.hospital_id, alert.message, alert.reply, alert.doctor_name, alert.acknowledged_by_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [alerts, search, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans',sans-serif" }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Emergency Alerts</h1>
          <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>Emergency SOS reports and red-flag check-ins from the mobile app.</p>
        </div>
        <button onClick={() => navigate("/patients")} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          View Patients
        </button>
      </div>

      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient, hospital ID, doctor, or message…"
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: "1px solid var(--ns-border)", borderRadius: 8, background: "var(--ns-bg)", color: "var(--ns-text)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "All"], ["pending", "Pending"], ["acknowledged", "Acknowledged"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: filter === val ? "none" : "1px solid var(--ns-border)",
                background: filter === val ? (val === "pending" ? "#dc2626" : val === "acknowledged" ? "#059669" : "#0d9488") : "var(--ns-bg)",
                color: filter === val ? "#fff" : "var(--ns-text-2)",
              }}
            >
              {label}{val === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--ns-text-3)", whiteSpace: "nowrap" }}>{filtered.length} alerts</div>
      </div>

      {loading ? (
        <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "40px 0", textAlign: "center", color: "var(--ns-text-3)" }}>Loading alerts…</div>
      ) : error ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 12, padding: "16px 18px" }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "46px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🛎️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)" }}>No emergency alerts</div>
          <div style={{ fontSize: 13, color: "var(--ns-text-3)", marginTop: 4 }}>Critical submissions will appear here when patients notify clinicians.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {filtered.map(alert => {
            const isAcked = !!alert.acknowledged_at;
            return (
              <div key={alert.id} className="alert-card" style={{
                background: "var(--ns-surface)",
                border: isAcked ? "1px solid #bbf7d0" : "1px solid #fecaca",
                borderLeft: isAcked ? "4px solid #059669" : "4px solid #dc2626",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                opacity: isAcked ? 0.8 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isAcked ? "#059669" : "#b91c1c", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {isAcked ? "Acknowledged" : "Emergency Alert"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ns-text)", marginTop: 4 }}>{alert.patient_name || "Unknown patient"}</div>
                    <div style={{ fontSize: 11, color: "var(--ns-text-3)", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>{alert.hospital_id || "—"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ns-text-3)", textAlign: "right", whiteSpace: "nowrap" }}>{timeLabel(alert.created_at)}</div>
                </div>

                <div style={{ fontSize: 13, color: "var(--ns-text)", lineHeight: 1.6, marginBottom: 12 }}>
                  {alert.message}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {!isAcked && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#b91c1c", padding: "3px 10px", borderRadius: 20 }}>CRITICAL</span>
                  )}
                  {alert.doctor_name && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: 20 }}>{alert.doctor_name}</span>
                  )}
                  {isAcked && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#059669", padding: "3px 10px", borderRadius: 20 }}>
                      Responded by {alert.acknowledged_by_name} · {timeLabel(alert.acknowledged_at)}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/patients/${alert.patient_id}`, { state: { mode: "view" } })} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid #dbeafe", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Open Patient
                  </button>
                  {!isAcked ? (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={ackingId === alert.id}
                        style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", background: "#059669", color: "#fff", fontSize: 12, fontWeight: 700, cursor: ackingId === alert.id ? "not-allowed" : "pointer", opacity: ackingId === alert.id ? 0.7 : 1 }}
                      >
                        {ackingId === alert.id ? "Saving…" : "Mark Responded"}
                      </button>
                      <a href="tel:1990" style={{ flex: 1, textAlign: "center", padding: "9px 12px", borderRadius: 9, background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                        Call Emergency
                      </a>
                    </>
                  ) : (
                    <a href="tel:1990" style={{ flex: 1, textAlign: "center", padding: "9px 12px", borderRadius: 9, background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      Call Emergency
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
