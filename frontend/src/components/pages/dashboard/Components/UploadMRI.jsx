import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../../../util";

const STEPS = [
  "Initializing Neural Network",
  "Preprocessing & Noise Reduction",
  "Segmenting Tumour Boundaries",
  "Calculating Risk Probability",
  "Finalising Report",
];

const UploadMRI = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const patient     = location.state?.patient;

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [dragActive,   setDragActive]   = useState(false);
  const [done,         setDone]         = useState(false);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setProgress(0); setCurrentStep(0); setDone(false);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    if (!patient?.id) {
      alert("No patient selected. Please go to All Patients and click MRI next to the patient first.");
      return;
    }
    setIsAnalyzing(true);
    setProgress(0); setCurrentStep(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 0.7;
      if (p < 95) {
        setProgress(p);
        setCurrentStep(Math.min(STEPS.length - 2, Math.floor((p / 95) * (STEPS.length - 1))));
      }
    }, 100);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patient_id", patient.id);

      const data = await api("/results/upload", {
        method: "POST", body: formData, isForm: true, timeoutMs: 120000,
      });

      clearInterval(interval);
      setProgress(100);
      setCurrentStep(STEPS.length - 1);
      setDone(true);

      setTimeout(() => {
        navigate("/image/results", { state: { patient, scanUrl: preview, analysisResult: data } });
      }, 1400);
    } catch (error) {
      clearInterval(interval);
      setIsAnalyzing(false); setProgress(0); setCurrentStep(0);
      alert(`Analysis failed: ${error.message}`);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    setSelectedFile(null); setPreview(null);
    setProgress(0); setCurrentStep(0); setDone(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .dz:hover          { border-color: #0d9488 !important; background: #f0fdfa !important; }
        .dz:hover .dz-icon { background: #ccfbf1 !important; border-color: #2dd4bf !important; }
        .dz:hover .dz-icon svg { stroke: #0d9488 !important; }
        .rm-btn:hover      { background: rgba(220,38,38,0.9) !important; }
        .run-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(13,148,136,0.38) !important; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>System Online</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Upload MRI Scan</h1>
          <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>Upload a brain MRI image for AI-assisted tumour classification</p>
        </div>

        {patient ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animation: "fadeIn 0.3s ease" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "#0d9488", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
              {patient.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Scanning for</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ns-text)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "#0d9488", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{patient.hospitalId}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fef9ee", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>No patient selected — results won't be saved</span>
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* Left — drop zone or preview */}
        <div>
          {!preview ? (
            /* Drop zone */
            <div
              className="dz"
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ position: "relative", border: `2px dashed ${dragActive ? "#0d9488" : "#d1d5db"}`, borderRadius: 16, background: dragActive ? "#f0fdfa" : "#f9fafb", minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, cursor: "pointer", transition: "all 0.2s", padding: "48px 32px" }}
            >
              <input type="file" accept="image/*,.dcm" onChange={handleFileSelect}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 2 }} />

              {/* Icon */}
              <div className="dz-icon" style={{ width: 76, height: 76, borderRadius: "50%", background: "#f0fdfa", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, transition: "all 0.2s" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
                </svg>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  {dragActive ? "Release to upload scan" : "Drag & drop your MRI scan here"}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>or click anywhere in this area to browse files</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                {["PNG", "JPG", "JPEG", "DICOM"].map(fmt => (
                  <span key={fmt} style={{ fontSize: 11, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", padding: "3px 10px", borderRadius: 6, fontWeight: 500 }}>{fmt}</span>
                ))}
                <span style={{ fontSize: 11, color: "#94a3b8" }}>· Max 50 MB</span>
              </div>
            </div>
          ) : (
            /* Preview */
            <div style={{ position: "relative", background: "#0f172a", borderRadius: 16, overflow: "hidden", minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={preview} alt="MRI scan" style={{ maxHeight: 420, width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }} />

              {/* Analysing overlay */}
              {isAnalyzing && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(4,12,22,0.78)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid rgba(45,212,191,0.2)", borderTopColor: "#2dd4bf", animation: "spin 0.9s linear infinite" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{Math.round(progress)}%</div>
                    <div style={{ fontSize: 12, color: "#2dd4bf", fontWeight: 600, marginTop: 8, letterSpacing: "0.05em" }}>{STEPS[currentStep]}</div>
                  </div>
                </div>
              )}

              {/* Done overlay */}
              {done && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(4,12,22,0.82)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, animation: "fadeIn 0.3s ease" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Analysis Complete</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Redirecting to results…</div>
                </div>
              )}

              {/* Remove button */}
              {!isAnalyzing && !done && (
                <button className="rm-btn" onClick={removeFile}
                  style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(220,38,38,0.75)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 0.15s", zIndex: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* File info */}
          <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 14 }}>File Information</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "File Name", value: selectedFile?.name ?? "—" },
                { label: "File Size", value: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "—" },
                { label: "Format",    value: selectedFile ? selectedFile.name.split(".").pop().toUpperCase() : "—" },
                { label: "Status",    value: done ? "Complete" : isAnalyzing ? "Analysing…" : selectedFile ? "Ready to run" : "No file selected" },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--ns-border)" : "none" }}>
                  <span style={{ fontSize: 12, color: "var(--ns-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: value === "Ready to run" ? "#0d9488" : value === "Analysing…" ? "#f59e0b" : value === "Complete" ? "#22c55e" : "#334155", maxWidth: 150, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={value}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis steps */}
          <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 14 }}>Analysis Pipeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {STEPS.map((step, i) => {
                const isDone   = done || (isAnalyzing && i < currentStep);
                const isActive = isAnalyzing && !done && i === currentStep;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#0d9488" : isActive ? "#f0fdfa" : "#f8fafc", border: `2px solid ${isDone ? "#0d9488" : isActive ? "#2dd4bf" : "#e2e8f0"}`, transition: "all 0.35s" }}>
                      {isDone ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? "#0d9488" : "#d1d5db" }}>{i + 1}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isDone ? "#0d9488" : isActive ? "var(--ns-text)" : "var(--ns-text-3)", transition: "all 0.3s", flex: 1 }}>{step}</span>
                    {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf", flexShrink: 0, animation: "blink 1s infinite" }} />}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            {(isAnalyzing || done) && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--ns-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: "var(--ns-text-3)" }}>Overall Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", fontFamily: "'DM Mono',monospace" }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "var(--ns-surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #0d9488, #2dd4bf)", borderRadius: 4, transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}
          </div>

          {/* Run button */}
          <button
            className="run-btn"
            onClick={startAnalysis}
            disabled={!selectedFile || isAnalyzing || done}
            style={{
              width: "100%", padding: "15px 0",
              background: !selectedFile || done ? "#f1f5f9" : "#0d9488",
              color: !selectedFile || done ? "#94a3b8" : "#fff",
              border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              cursor: !selectedFile || isAnalyzing || done ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s",
              boxShadow: selectedFile && !done ? "0 4px 18px rgba(13,148,136,0.28)" : "none",
            }}
          >
            {isAnalyzing ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                Analysing scan…
              </>
            ) : done ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Redirecting to results…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                Run AI Analysis
              </>
            )}
          </button>

          {!patient && selectedFile && !isAnalyzing && (
            <div style={{ background: "#fef9ee", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", fontWeight: 500, lineHeight: 1.5 }}>
              No patient linked. Results won't be saved to a patient record. Go to <strong>All Patients → MRI</strong> to link a scan to a patient.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadMRI;
