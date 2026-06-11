import React, { useState, useEffect } from "react";
import { api } from "../../../../util";

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export default function BlockchainRecordsTab({ patientId, onAddNote }) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api(`/patients/${patientId}/blockchain-records`)
      .then(data => { if (!cancelled) setRecords(data); })
      .catch(err  => { if (!cancelled) setError(parseErr(err)); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [patientId]);

  const badge = (color) => ({
    display: "inline-block", fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 20,
    background: `${color}18`, color,
  });

  if (loading) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
      Fetching records from chain…
    </div>
  );

  if (error) return (
    <div style={{ margin: "18px 0", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#dc2626" }}>
      {error}
    </div>
  );

  return (
    <div style={{ padding: "18px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ns-text, #0f172a)" }}>
            On-Chain Record History
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Immutable entries anchored on Ethereum testnet · encrypted blobs pinned on IPFS
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={badge("#1d4ed8")}>
            {records.count} {records.count === 1 ? "record" : "records"}
          </span>
          {onAddNote && (
            <button onClick={onAddNote}
              style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 7, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", cursor: "pointer" }}>
              + Add Note
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 11, color: "#15803d" }}>
        Records are written automatically when a doctor confirms an MRI diagnosis. Use "+ Add Note" for manual entries.
      </div>

      {records.count === 0 ? (
        <div style={{ background: "var(--ns-surface,#fff)", border: "1px solid #e2e8f0", borderRadius: 12, padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          No blockchain records yet. Records appear here after a doctor confirms an MRI result.
        </div>
      ) : (
        records.cids.map((cid, idx) => (
          <RecordRow
            key={cid}
            index={idx + 1}
            cid={cid}
            total={records.count}
            patientId={patientId}
          />
        ))
      )}
    </div>
  );
}

// ── Single record card ────────────────────────────────────────────────────────

function RecordRow({ index, cid, total, patientId }) {
  const [decryptState, setDecryptState] = useState("idle"); // idle | loading | done | error
  const [plaintext, setPlaintext]       = useState("");
  const [decryptErr, setDecryptErr]     = useState("");
  const [expanded, setExpanded]         = useState(false);

  const lbl  = { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 3 };
  const mono = { fontFamily: "'DM Mono', monospace", fontSize: 11, wordBreak: "break-all", color: "#334155" };

  async function handleDecrypt() {
    setDecryptState("loading");
    setDecryptErr("");
    try {
      const data = await api(`/patients/${patientId}/blockchain-records/${cid}/decrypt`);
      setPlaintext(data.plaintext);
      setDecryptState("done");
      setExpanded(true);
    } catch (err) {
      setDecryptErr(parseErr(err));
      setDecryptState("error");
    }
  }

  return (
    <div style={{ background: "var(--ns-surface,#fff)", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Record #{index}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>of {total}</span>
      </div>

      {/* CID row */}
      <div>
        <span style={lbl}>IPFS CID</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={mono}>{cid}</span>
          <button
            onClick={() => navigator.clipboard.writeText(cid)}
            style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", cursor: "pointer", flexShrink: 0 }}>
            Copy
          </button>
        </div>
      </div>

      {/* IPFS gateway link */}
      <div>
        <span style={lbl}>Encrypted blob (IPFS)</span>
        <a href={`${IPFS_GATEWAY}${cid}`} target="_blank" rel="noreferrer"
          style={{ ...mono, color: "#0d9488" }}>
          {IPFS_GATEWAY}{cid}
        </a>
      </div>

      {/* Decrypt section */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
        {decryptState === "idle" && (
          <button onClick={handleDecrypt}
            style={{ fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 8, background: "#0d9488", color: "#fff", border: "none", cursor: "pointer" }}>
            Decrypt & View
          </button>
        )}

        {decryptState === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
            <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid #0d9488", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Fetching from IPFS and decrypting…
          </div>
        )}

        {decryptState === "error" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, color: "#dc2626" }}>{decryptErr}</div>
            <button onClick={handleDecrypt}
              style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 7, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {decryptState === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={lbl}>Decrypted Content</span>
              <button onClick={() => setExpanded(v => !v)}
                style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                {expanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {expanded && (
              <div style={{ position: "relative" }}>
                <pre style={{ margin: 0, padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#1e293b", maxHeight: 320, overflowY: "auto" }}>
                  {plaintext}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(plaintext)}
                  style={{ position: "absolute", top: 8, right: 8, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#fff", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                  Copy text
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function parseErr(err) {
  try {
    const parsed = JSON.parse(err.message);
    return parsed?.detail || err.message;
  } catch {
    return err.message || "Failed.";
  }
}
