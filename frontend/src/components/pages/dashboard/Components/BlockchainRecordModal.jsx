import React, { useState } from "react";
import { api } from "../../../../util";

const STATUS = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function BlockchainRecordModal({ patient, onClose }) {
  const [historyText, setHistoryText] = useState(
    buildDefaultText(patient)
  );
  const [status, setStatus]   = useState(STATUS.IDLE);
  const [result, setResult]   = useState(null);
  const [errMsg, setErrMsg]   = useState("");

  async function handleSubmit() {
    if (!historyText.trim()) return;
    setStatus(STATUS.LOADING);
    setErrMsg("");
    try {
      const data = await api(`/patients/${patient.id}/blockchain-record`, {
        method: "POST",
        body: { history_text: historyText },
      });
      setResult(data);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setErrMsg(err?.detail || err?.message || "Blockchain write failed.");
      setStatus(STATUS.ERROR);
    }
  }

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  };
  const modal = {
    background: "var(--ns-surface, #fff)", borderRadius: 16,
    padding: "28px 28px 24px", width: "100%", maxWidth: 520,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif",
  };
  const label = { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 };
  const mono  = { fontFamily: "'DM Mono', monospace", fontSize: 11, wordBreak: "break-all" };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ns-text, #0f172a)" }}>
              Save to Blockchain
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {patient.name} · {patient.hospital_id}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>✕</button>
        </div>

        {status !== STATUS.SUCCESS ? (
          <>
            {/* Text area */}
            <label style={label}>Medical History Entry</label>
            <textarea
              value={historyText}
              onChange={e => setHistoryText(e.target.value)}
              rows={7}
              style={{
                width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "10px 12px", fontSize: 13,
                resize: "vertical", outline: "none", lineHeight: 1.6,
                background: "#f8fafc",
              }}
              disabled={status === STATUS.LOADING}
            />

            {status === STATUS.ERROR && (
              <div style={{ marginTop: 10, padding: "9px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
                {errMsg}
              </div>
            )}

            {/* Info note */}
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: 8, fontSize: 11, color: "#0d9488" }}>
              This entry will be encrypted, pinned to IPFS via Pinata, and anchored
              immutably on the Ethereum testnet. The plaintext is never stored on-chain.
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={onClose} disabled={status === STATUS.LOADING}
                style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "var(--ns-surface, #f8fafc)", color: "#64748b", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!historyText.trim() || status === STATUS.LOADING}
                style={{
                  fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 8,
                  background: status === STATUS.LOADING ? "#a7f3d0" : "#0d9488",
                  color: "#fff", border: "none", cursor: status === STATUS.LOADING ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                {status === STATUS.LOADING ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Writing to chain...
                  </>
                ) : "Save to Blockchain"}
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⛓</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0d9488" }}>Record anchored on-chain</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Immutable proof written to Ethereum testnet</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                <span style={label}>Transaction Hash</span>
                <span style={{ ...mono, color: "#1d4ed8" }}>{result?.tx_hash}</span>
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                <span style={label}>IPFS CID</span>
                <span style={{ ...mono, color: "#0d9488" }}>{result?.ipfs_hash}</span>
              </div>
            </div>

            <button onClick={onClose}
              style={{ marginTop: 20, width: "100%", fontSize: 13, fontWeight: 700, padding: "10px", borderRadius: 9, background: "#0d9488", color: "#fff", border: "none", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function buildDefaultText(patient) {
  const lines = [
    `Patient: ${patient.name}`,
    `ID: ${patient.hospital_id}`,
    `Age: ${patient.age || "N/A"} | Gender: ${patient.gender || "N/A"}`,
    `Assigned Doctor: ${patient.assigned_doctor || "Unassigned"}`,
    patient.symptoms_notes ? `Symptoms: ${patient.symptoms_notes}` : null,
    patient.past_medical_history ? `Past Medical History: ${patient.past_medical_history}` : null,
    patient.doctor_notes ? `Doctor Notes: ${patient.doctor_notes}` : null,
    `Recorded: ${new Date().toISOString()}`,
  ];
  return lines.filter(Boolean).join("\n");
}
