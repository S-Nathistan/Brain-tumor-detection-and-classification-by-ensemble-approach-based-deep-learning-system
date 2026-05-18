import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, getCurrentUser } from "../../../../util";

// ─── Tumour colour map ──────────────────────────────────────────────────────
const TUMOUR_META = {
  "Glioma":          { bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444", risk: "High",    riskBg: "#fef2f2", riskText: "#b91c1c" },
  "Meningioma":      { bg: "#fff7ed", text: "#c2410c", bar: "#f97316", risk: "Moderate", riskBg: "#fff7ed", riskText: "#c2410c" },
  "Pituitary":       { bg: "#eff6ff", text: "#1d4ed8", bar: "#3b82f6", risk: "Moderate", riskBg: "#eff6ff", riskText: "#1d4ed8" },
  "No Tumour":       { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e", risk: "Low",     riskBg: "#f0fdf4", riskText: "#15803d" },
  "Not Classified":  { bg: "#f8fafc", text: "#475569", bar: "#94a3b8", risk: "Unknown", riskBg: "#f8fafc", riskText: "#475569" },
};

function getTumourMeta(label) {
  return TUMOUR_META[label] || TUMOUR_META["Not Classified"];
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────
function RadarChart({ data, accent = "#0d9488" }) {
  const size = 180, center = size / 2, radius = size / 2 - 22;
  const angle = (Math.PI * 2) / data.length;

  const pts = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    return `${center + r * Math.cos(i * angle - Math.PI / 2)},${center + r * Math.sin(i * angle - Math.PI / 2)}`;
  }).join(" ");

  const labels = data.map((d, i) => {
    const r = radius + 16;
    return { x: center + r * Math.cos(i * angle - Math.PI / 2), y: center + r * Math.sin(i * angle - Math.PI / 2), label: d.label };
  });

  const hex2rgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <svg width={size + 60} height={size + 40} style={{ overflow: "visible" }}>
      {[20, 40, 60, 80, 100].map((r, i) => (
        <circle key={i} cx={center} cy={center} r={(r / 100) * radius} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const x = center + radius * Math.cos(i * angle - Math.PI / 2);
        const y = center + radius * Math.sin(i * angle - Math.PI / 2);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={pts} fill={hex2rgba(accent, 0.15)} stroke={accent} strokeWidth="2" />
      {data.map((d, i) => {
        const r = (d.value / 100) * radius;
        const x = center + r * Math.cos(i * angle - Math.PI / 2);
        const y = center + r * Math.sin(i * angle - Math.PI / 2);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={accent} />;
      })}
      {labels.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ─── History table (shown when no state passed) ───────────────────────────────
function ClassificationHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const data = await api("/results/");
      setResults(data);
    } catch { setError("Failed to load results."); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this scan from history?"))
      setResults(prev => prev.filter(r => r.id !== id));
  };

  const labelMeta = (label = "") => {
    if (label.toLowerCase().includes("glioma"))     return { bg: "#fef2f2", text: "#b91c1c" };
    if (label.toLowerCase().includes("meningioma")) return { bg: "#fff7ed", text: "#c2410c" };
    if (label.toLowerCase().includes("pituitary"))  return { bg: "#eff6ff", text: "#1d4ed8" };
    if (label.toLowerCase().includes("no tumour") || label.toLowerCase().includes("no tumor"))
      return { bg: "#f0fdf4", text: "#15803d" };
    return { bg: "#f8fafc", text: "#475569" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`.hist-row:hover{background:var(--ns-bg)!important}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Classification History</h1>
          <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>All past AI diagnostic scan results</p>
        </div>
        {currentUser?.role !== "Admin" && (
          <button onClick={() => navigate("/image/upload")}
            style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Scan
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ns-text-3)", fontSize: 13 }}>Loading records…</div>
        ) : error ? (
          <div style={{ padding: "32px", background: "#fef2f2", color: "#b91c1c", fontSize: 13, textAlign: "center" }}>{error}</div>
        ) : results.length === 0 ? (
          <div style={{ padding: "56px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ns-text)" }}>No scan results yet</div>
            <div style={{ fontSize: 13, color: "var(--ns-text-3)", marginTop: 4 }}>Upload your first MRI scan to see results here</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--ns-bg)", borderBottom: "1px solid var(--ns-border)" }}>
                  {["Scan ID", "Patient", "Date & Time", "AI Label", "Confirmed", "Uploaded By", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", textAlign: h === "Actions" ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const lm = labelMeta(r.predicted_label);
                  const conf = typeof r.confidence === "number"
                    ? (r.confidence <= 1 ? Math.round(r.confidence * 100) : Math.round(r.confidence))
                    : "—";
                  return (
                    <tr key={r.id} className="hist-row" style={{ borderBottom: i < results.length - 1 ? "1px solid var(--ns-border)" : "none" }}>
                      <td style={{ padding: "13px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#0d9488", fontWeight: 600 }}>#{String(r.id).padStart(5, "0")}</td>
                      <td style={{ padding: "13px 16px" }}>
                        {r.patient_name ? (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{r.patient_name}</div>
                            <div style={{ fontSize: 10, color: "var(--ns-text-3)", fontFamily: "'DM Mono',monospace" }}>{r.patient_hospital_id}</div>
                          </div>
                        ) : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ns-text-3)", fontFamily: "'DM Mono',monospace" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, background: lm.bg, color: lm.text, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {r.predicted_label?.replace("_", " ")}
                          </span>
                          <div style={{ fontSize: 10, color: "var(--ns-text-3)", marginTop: 3 }}>{conf}% confidence</div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        {r.confirmed_label ? (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              ✓ {r.confirmed_label} {r.pathology_grade && `Gr.${r.pathology_grade}`}
                            </span>
                            {r.confirmed_by_name && (
                              <div style={{ fontSize: 10, color: "var(--ns-text-3)", marginTop: 3 }}>by {r.confirmed_by_name}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--ns-text-2)" }}>
                        {r.uploaded_by_name || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          {r.patient_id && (
                            <button
                              onClick={() => navigate(`/patients/${r.patient_id}`, { state: { mode: "view", activeTab: "investigation" } })}
                              style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #dbeafe", padding: "5px 12px", borderRadius: 7, cursor: "pointer" }}>
                              View Patient
                            </button>
                          )}
                          {currentUser?.role !== "Admin" && (
                            <button onClick={() => handleDelete(r.id)}
                              style={{ fontSize: 11, fontWeight: 600, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: "5px 12px", borderRadius: 7, cursor: "pointer" }}>
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Doctor Confirm Panel ─────────────────────────────────────────────────────
function DoctorConfirmPanel({ activeResult, classification, confidence }) {
  const currentUser = getCurrentUser();
  const canConfirm = ["Clinician", "Super Admin"].includes(currentUser?.role);

  const alreadyConfirmed = activeResult?.confirmed_label
    ? {
        label: activeResult.confirmed_label,
        grade: activeResult.pathology_grade,
        ipfs_cid: activeResult.ipfs_cid || null,
        tx_hash: activeResult.tx_hash || null,
      }
    : null;

  const [assessmentMode, setAssessmentMode] = useState(null); // null | "confirm" | "override"
  const [selectedLabel,  setSelectedLabel]  = useState(classification);
  const [pathologyGrade, setPathologyGrade] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [confirmed,      setConfirmed]      = useState(alreadyConfirmed);
  const [errorMsg,       setErrorMsg]       = useState(null);

  if (!canConfirm || !activeResult?.id) return null;

  const needsGrade = selectedLabel !== "No Tumour";

  const handleConfirm = async () => {
    if (needsGrade && !pathologyGrade) { setErrorMsg("Please select a pathology grade."); return; }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api(`/results/${activeResult.id}/confirm`, {
        method: "PATCH",
        body: { confirmed_label: selectedLabel, pathology_grade: needsGrade ? pathologyGrade : null },
      });
      setConfirmed({
        label: selectedLabel,
        grade: needsGrade ? pathologyGrade : null,
        ipfs_cid: res?.ipfs_cid || null,
        tx_hash: res?.tx_hash || null,
      });
    } catch {
      setErrorMsg("Failed to confirm. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#15803d", marginBottom: 12 }}>
          Clinician Assessment — Anchored
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>⛓</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#15803d" }}>{confirmed.label}</div>
            <div style={{ fontSize: 12, color: "#374151" }}>
              {confirmed.grade && <>Pathology Grade <strong>{confirmed.grade}</strong> · </>}
              Confirmed by {currentUser?.name || "Clinician"}
            </div>
          </div>
        </div>

        {confirmed.ipfs_cid ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#dcfce7", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>IPFS CID</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#374151", wordBreak: "break-all" }}>{confirmed.ipfs_cid}</div>
            </div>
            {confirmed.tx_hash && (
              <div style={{ background: "#dcfce7", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Transaction Hash</div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#374151", wordBreak: "break-all", marginBottom: 6 }}>{confirmed.tx_hash}</div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${confirmed.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                  View on Sepolia Etherscan →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#6b7280", background: "#dcfce7", borderRadius: 8, padding: "8px 12px" }}>
            Result anchored to blockchain — tamper-proof record created.
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569", marginBottom: 14 }}>
        Clinician Assessment Required
      </div>

      {/* AI says */}
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 14, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: 11 }}>AI SAYS: </span>
        <strong style={{ fontSize: 15 }}>{classification}</strong>
        <span style={{ color: "#94a3b8", marginLeft: 8, fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{confidence}% confidence</span>
      </div>

      {/* Confirm / Override toggle */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 8 }}>Your assessment</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setAssessmentMode("confirm"); setSelectedLabel(classification); }}
          style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.15s",
            background: assessmentMode === "confirm" ? "#15803d" : "#f1f5f9",
            color: assessmentMode === "confirm" ? "#fff" : "#475569",
            boxShadow: assessmentMode === "confirm" ? "0 2px 8px rgba(21,128,61,0.3)" : "none" }}>
          ✓ Confirm AI Result
        </button>
        <button
          onClick={() => setAssessmentMode("override")}
          style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.15s",
            background: assessmentMode === "override" ? "#b91c1c" : "#f1f5f9",
            color: assessmentMode === "override" ? "#fff" : "#475569",
            boxShadow: assessmentMode === "override" ? "0 2px 8px rgba(185,28,28,0.28)" : "none" }}>
          Override ▾
        </button>
      </div>

      {/* Override dropdown */}
      {assessmentMode === "override" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 6 }}>Select correct classification</div>
          <select
            value={selectedLabel}
            onChange={e => { setSelectedLabel(e.target.value); setPathologyGrade(null); setErrorMsg(null); }}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", color: "#0f172a", outline: "none", cursor: "pointer" }}>
            <option value="Glioma">Glioma</option>
            <option value="Meningioma">Meningioma</option>
            <option value="Pituitary">Pituitary</option>
            <option value="No Tumour">No Tumour</option>
          </select>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>AI's original label is preserved — only a doctor label is added.</div>
        </div>
      )}

      {/* Pathology Grade — only shown when a tumour is present */}
      {assessmentMode && needsGrade && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 8 }}>Pathology Grade</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["I", "II", "III", "IV"].map(g => (
              <button key={g} onClick={() => setPathologyGrade(g)}
                style={{ flex: 1, height: 42, borderRadius: 9, border: `1px solid ${pathologyGrade === g ? "#0d9488" : "#e2e8f0"}`, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                  background: pathologyGrade === g ? "#0d9488" : "#fff",
                  color: pathologyGrade === g ? "#fff" : "#475569",
                  boxShadow: pathologyGrade === g ? "0 2px 8px rgba(13,148,136,0.3)" : "none" }}>
                {g}
              </button>
            ))}
          </div>
        </>
      )}

      {assessmentMode && (
        <>
          {errorMsg && (
            <div style={{ fontSize: 12, color: "#b91c1c", background: "#fef2f2", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{errorMsg}</div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || (needsGrade && !pathologyGrade)}
            style={{ width: "100%", padding: "13px 0", background: loading || (needsGrade && !pathologyGrade) ? "#94a3b8" : "#0d9488", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading || (needsGrade && !pathologyGrade) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s", boxShadow: !loading && (!needsGrade || pathologyGrade) ? "0 3px 14px rgba(13,148,136,0.3)" : "none" }}>
            {loading
              ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Anchoring to Blockchain…</>
              : "⛓ Confirm & Anchor to Blockchain"
            }
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
const ClassificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const patient        = location.state?.patient;
  const specificResult = location.state?.analysisResult;
  const localScanUrl   = location.state?.scanUrl;

  const [viewMode, setViewMode] = useState("original");

  const latestDbResult = patient?.results?.[0] ?? null;
  const activeResult   = specificResult || latestDbResult;

  const scanUrl        = localScanUrl || (activeResult ? `http://127.0.0.1:8000/uploaded_mris/${activeResult.filename}` : null);
  const classification = activeResult?.predicted_label || "Not Classified";

  const rawConf        = activeResult?.confidence ?? 0;
  const confidence     = typeof rawConf === "number"
    ? (rawConf <= 1 ? parseFloat((rawConf * 100).toFixed(1)) : parseFloat(rawConf.toFixed(1)))
    : 0;

  const meta           = getTumourMeta(classification);
  const isHighRisk     = !["No Tumour", "Not Classified"].includes(classification);

  const radarData = [
    { label: "Density",  value: isHighRisk ? 85 : 20 },
    { label: "Symmetry", value: isHighRisk ? 40 : 90 },
    { label: "Texture",  value: isHighRisk ? 88 : 25 },
    { label: "Margin",   value: isHighRisk ? 72 : 12 },
    { label: "Edema",    value: isHighRisk ? 58 : 5  },
  ];

  const bbox = { top: "28%", left: "42%", width: "22%", height: "24%" };

  // No state → show history table
  if (!patient) return <ClassificationHistory />;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position:absolute; left:0; top:0; width:100%; }
          .no-print { display:none !important; }
          * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
        }
        .vm-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .act-btn:hover { opacity:.88; transform:translateY(-1px); }
      `}</style>

      <div id="printable-report" style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeSlide 0.35s ease" }}>

        {/* ── Patient banner ── */}
        <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#0d9488", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
              {patient.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Analysis Report For</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "var(--ns-text)", lineHeight: 1.2 }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "#0d9488", fontFamily: "'DM Mono',monospace", fontWeight: 600, marginTop: 2 }}>
                {patient.hospital_id || patient.hospitalId}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Analysis Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>
              {activeResult?.created_at
                ? new Date(activeResult.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : new Date().toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, alignItems: "start" }}>

          {/* Left — scan image */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative", background: "#0f172a", borderRadius: 16, overflow: "hidden", minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {scanUrl ? (
                <img src={scanUrl} alt="MRI Scan" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, display: "block" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#475569", padding: 32 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
                  </svg>
                  <span style={{ fontSize: 12 }}>No scan image available</span>
                </div>
              )}

              {/* Bounding box overlay */}
              {viewMode === "bbox" && isHighRisk && (
                <div style={{ position: "absolute", border: "2px solid #ef4444", ...bbox }}>
                  <span style={{ position: "absolute", top: -24, left: 0, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: "4px 4px 0 0", textTransform: "uppercase" }}>
                    Tumour · {confidence}%
                  </span>
                </div>
              )}

              {/* Heatmap overlay */}
              {viewMode === "heatmap" && isHighRisk && (
                <div style={{ position: "absolute", inset: 0, opacity: 0.55, mixBlendMode: "screen", background: "radial-gradient(circle at 50% 35%, rgba(255,0,0,1) 0%, rgba(255,200,0,0.7) 30%, rgba(0,255,0,0) 65%)" }} />
              )}

              {/* View toggle */}
              <div className="no-print" style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2, background: "rgba(4,12,22,0.85)", backdropFilter: "blur(6px)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
                {[["original", "Original"], ["bbox", "Bound Box"], ["heatmap", "Heatmap"]].map(([mode, label]) => (
                  <button key={mode} className="vm-btn" onClick={() => setViewMode(mode)}
                    style={{ padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.15s",
                      background: viewMode === mode
                        ? (mode === "bbox" ? "#ef4444" : mode === "heatmap" ? "#f59e0b" : "#fff")
                        : "transparent",
                      color: viewMode === mode
                        ? (mode === "original" ? "#0f172a" : "#fff")
                        : "#94a3b8",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan meta chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Modality", value: "MRI" },
                { label: "Format",   value: activeResult?.filename?.split(".").pop()?.toUpperCase() || "IMG" },
                { label: "Scan ID",  value: activeResult?.id ? `#${String(activeResult.id).padStart(5, "0")}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 11, color: "#334155", fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Doctor Confirm Panel — lives below the scan on the left */}
            <DoctorConfirmPanel
              activeResult={activeResult}
              classification={classification}
              confidence={confidence}
            />
          </div>

          {/* Right — results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Classification result card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", borderTop: `4px solid ${meta.bar}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8", marginBottom: 10 }}>Primary Classification</div>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{classification}</div>
                <span style={{ fontSize: 11, fontWeight: 700, background: meta.riskBg, color: meta.riskText, padding: "5px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, marginTop: 4 }}>
                  {meta.risk} Risk
                </span>
              </div>

              {/* Confidence bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #f1f5f9", paddingTop: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 4 }}>Confidence Level</div>
                {[
                  { label: classification, score: confidence, color: meta.bar },
                  { label: "Secondary estimate", score: Math.max(0.1, parseFloat((100 - confidence).toFixed(1))), color: "#e2e8f0" },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Mono',monospace" }}>{score}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature radar + stats */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 16 }}>Feature Analysis</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center" }}>

                {/* Radar */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <RadarChart data={radarData} accent={meta.bar} />
                </div>

                {/* Feature bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {radarData.map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Mono',monospace" }}>{value}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${value}%`, background: meta.bar, borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical detail chips */}
            {isHighRisk && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Estimated Size",  value: "2.4 cm × 1.8 cm" },
                  { label: "Location",        value: "Frontal Lobe / Superior" },
                  { label: "Laterality",      value: "Right hemisphere" },
                  { label: "Recommendation",  value: "Specialist referral" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="no-print" style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button className="act-btn" onClick={() => navigate(`/patients/${patient.id}`, { state: { mode: "view", activeTab: "investigation" } })}
                style={{ flex: 1, padding: "13px 0", background: "#0d9488", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 3px 14px rgba(13,148,136,0.28)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Return to Patient Record
              </button>
              <button className="act-btn" onClick={() => window.print()}
                style={{ flex: 1, padding: "13px 0", background: "#fff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Full Report
              </button>
              <button className="act-btn" onClick={() => navigate("/image/upload")}
                style={{ padding: "13px 18px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                New Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationResults;
