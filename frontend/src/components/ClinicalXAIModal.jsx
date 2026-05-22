import { useState } from "react";
import { api } from "../util";

const CLASS_COLORS = {
  glioma:     "#e74c3c",
  meningioma: "#3498db",
  no_tumor:   "#2ecc71",
  pituitary:  "#f39c12",
};

const CLASS_LABELS = {
  glioma:     "Glioma",
  meningioma: "Meningioma",
  no_tumor:   "No Tumour",
  pituitary:  "Pituitary",
};

const TRUST_COLORS = {
  "HIGH TRUST": { bg: "#dcfce7", border: "#16a34a", text: "#15803d" },
  "MODERATE TRUST — clinical review recommended": { bg: "#fef9c3", border: "#ca8a04", text: "#92400e" },
  "LOW TRUST — manual review required": { bg: "#fee2e2", border: "#dc2626", text: "#991b1b" },
};

function Spinner({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid rgba(148,163,184,0.3)`,
      borderTopColor: "#94a3b8",
      animation: "spin 0.9s linear infinite",
      flexShrink: 0,
    }} />
  );
}

function Skeleton({ width = "100%", height = 14 }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: "var(--ns-border)",
      animation: "blink 1.5s ease-in-out infinite",
    }} />
  );
}

function TrustBadge({ verdict }) {
  const style = TRUST_COLORS[verdict] ?? TRUST_COLORS["MODERATE TRUST — clinical review recommended"];
  const short  = verdict.split("—")[0].trim();
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: style.bg, border: `1.5px solid ${style.border}`,
      color: style.text, borderRadius: 8,
      padding: "4px 12px", fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: style.border, flexShrink: 0 }} />
      {short}
    </span>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid var(--ns-border)" }}>
      <span style={{ fontSize: 11, color: "var(--ns-text-3)", fontWeight: 600, minWidth: 90, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--ns-text)", lineHeight: 1.4 }}>{value ?? "—"}</span>
    </div>
  );
}

function ProbBar({ label, pct, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "var(--ns-text-3)", minWidth: 90, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--ns-surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 40, textAlign: "right", fontFamily: "'DM Mono',monospace" }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

function ImgOrSkeleton({ src, alt, style: imgStyle }) {
  if (src) {
    return <img src={`data:image/png;base64,${src}`} alt={alt} style={imgStyle} />;
  }
  return (
    <div style={{
      ...imgStyle,
      background: "#1e293b",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Spinner size={24} />
    </div>
  );
}

export default function ClinicalXAIModal({ xaiData, isComplete = true, resultId, patient, onClose }) {
  const [activeImg,   setActiveImg]   = useState("gradcam_composite");
  const [confirming,  setConfirming]  = useState(false);
  const [confirmed,   setConfirmed]   = useState(false);
  const [confirmErr,  setConfirmErr]  = useState(null);

  if (!xaiData) return null;

  const { predicted_class, confidence_pct, probabilities, images, where, what, trust } = xaiData;

  const displayClass = CLASS_LABELS[predicted_class] ?? predicted_class;
  const classColor   = CLASS_COLORS[predicted_class] ?? "#64748b";

  const IMG_PANELS = [
    { key: "original",          label: "Original MRI"         },
    { key: "gradcam_effnet",    label: "EfficientNet GradCAM" },
    { key: "gradcam_densenet",  label: "DenseNet GradCAM"     },
    { key: "gradcam_composite", label: "Composite Overlay"    },
    { key: "integrated_grads",  label: "Saliency Map"         },
  ];

  const activeImgSrc = images?.[activeImg];

  const handleConfirm = async () => {
    if (!resultId) return;
    setConfirming(true);
    setConfirmErr(null);
    try {
      await api(`/results/${resultId}/confirm`, {
        method: "PATCH",
        body: { confirmed_label: displayClass },
      });
      setConfirmed(true);
    } catch (e) {
      setConfirmErr("Confirmation failed. Try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Clinical XAI Analysis Report"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,8,20,0.80)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "32px 16px", overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes xai-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .xai-modal { animation: xai-fadein 0.28s ease; }
        .img-thumb:hover { border-color: #2dd4bf !important; }
        .xai-close:hover { background: #ef4444 !important; color:#fff !important; }
        .xai-btn-confirm:hover:not(:disabled) { opacity:0.88; }
      `}</style>

      <div
        className="xai-modal"
        style={{
          background: "var(--ns-surface)",
          borderRadius: 18,
          width: "100%", maxWidth: 1100,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* ── Computing banner ── */}
        {!isComplete && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 28px",
            background: "#fffbeb", borderBottom: "1px solid #fde68a",
            borderRadius: "18px 18px 0 0",
          }}>
            <Spinner size={14} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
              Computing — saliency map &amp; uncertainty analysis still running. Results update automatically.
            </span>
          </div>
        )}

        {/* ── Close button ── */}
        <button
          className="xai-close"
          onClick={onClose}
          aria-label="Close XAI report"
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--ns-surface-2)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: "var(--ns-text-2)",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Header ── */}
        <div style={{
          padding: "22px 28px 18px",
          borderBottom: "1px solid var(--ns-border)",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
              Clinical XAI Report
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ns-text)" }}>
              {patient?.name ?? "Unknown Patient"}
            </div>
            <div style={{ fontSize: 12, color: "var(--ns-text-2)", marginTop: 2 }}>
              {patient?.hospital_id ?? patient?.hospitalId ?? ""}{patient && " · "}
              Scan analysed {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>

          {/* Prediction banner */}
          <div style={{
            background: `${classColor}14`,
            border: `1.5px solid ${classColor}55`,
            borderRadius: 12, padding: "12px 20px",
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
            minWidth: 220,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Prediction</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: classColor }}>{displayClass.toUpperCase()}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: classColor, fontFamily: "'DM Mono',monospace" }}>
                {confidence_pct != null ? `${confidence_pct.toFixed(1)}%` : "—"}
              </span>
            </div>
            {trust
              ? <TrustBadge verdict={trust.verdict} />
              : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
                  <Spinner size={10} /> Computing trust…
                </span>
              )
            }
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* BACKBONE AGREEMENT PANEL */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Backbone XAI Comparison — click thumbnail to inspect
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Main view */}
              <div style={{
                flex: "0 0 340px", background: "#0f172a",
                borderRadius: 12, overflow: "hidden",
                border: "2px solid var(--ns-border)",
              }}>
                <ImgOrSkeleton
                  src={activeImgSrc}
                  alt="Selected XAI view"
                  style={{ width: "100%", display: "block", objectFit: "contain", minHeight: 200 }}
                />
                <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {IMG_PANELS.find(p => p.key === activeImg)?.label}
                </div>
              </div>

              {/* Thumbnail strip */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {IMG_PANELS.map(({ key, label }) => {
                  const thumbSrc = images?.[key];
                  return (
                    <div
                      key={key}
                      className="img-thumb"
                      onClick={() => setActiveImg(key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        border: `2px solid ${activeImg === key ? "#0d9488" : "#e2e8f0"}`,
                        borderRadius: 10, overflow: "hidden", cursor: "pointer",
                        background: "var(--ns-surface-2)",
                        transition: "border-color 0.18s",
                      }}
                    >
                      <div style={{ width: 64, height: 64, flexShrink: 0, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {thumbSrc
                          ? <img src={`data:image/png;base64,${thumbSrc}`} alt={label} style={{ width: 64, height: 64, objectFit: "cover", display: "block" }} />
                          : <Spinner size={20} />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: activeImg === key ? "#0d9488" : "var(--ns-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                        {key === "gradcam_effnet"    && <div style={{ fontSize: 10, color: "var(--ns-text-3)" }}>EfficientNetV2 branch activation</div>}
                        {key === "gradcam_densenet"  && <div style={{ fontSize: 10, color: "var(--ns-text-3)" }}>DenseNet201 branch activation</div>}
                        {key === "gradcam_composite" && <div style={{ fontSize: 10, color: "var(--ns-text-3)" }}>Averaged dual-path attention</div>}
                        {key === "integrated_grads"  && <div style={{ fontSize: 10, color: thumbSrc ? "var(--ns-text-3)" : "#f59e0b" }}>{thumbSrc ? "Pixel-level WHY (gradient saliency)" : "Computing saliency map…"}</div>}
                        {key === "original"          && <div style={{ fontSize: 10, color: "var(--ns-text-3)" }}>Preprocessed input to model</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* WHERE + WHAT + PROBABILITIES + TRUST */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Left col: WHERE + WHAT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* WHERE */}
              <div style={{ background: "var(--ns-surface-2)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>WHERE — Anatomical Location</div>
                {where
                  ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)", lineHeight: 1.5 }}>{where}</div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "#0d9488", fontWeight: 500 }}>
                        {trust
                          ? <>Dual-path IoU: {trust.dual_path_iou}{trust.dual_path_iou >= 0.4 ? " — backbones agree on location ✓" : trust.dual_path_iou >= 0.2 ? " — partial backbone agreement" : " — backbones diverge, review manually"}</>
                          : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Spinner size={10} /> Computing IoU…</span>
                        }
                      </div>
                    </>
                  )
                  : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Skeleton height={14} />
                      <Skeleton width="70%" height={12} />
                    </div>
                  )
                }
              </div>

              {/* WHAT */}
              <div style={{ background: "var(--ns-surface-2)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>WHAT — Clinical Findings in Hotspot</div>
                {what
                  ? (
                    what.note
                      ? <div style={{ fontSize: 12, color: "#92400e" }}>{what.note}</div>
                      : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <MetaRow label="Intensity"  value={what.intensity}  />
                          <MetaRow label="Texture"    value={what.texture}    />
                          <MetaRow label="Margins"    value={what.margins}    />
                          <MetaRow label="Asymmetry"  value={what.asymmetry}  />
                          <MetaRow label="Size"       value={what.size}       />
                        </div>
                      )
                  )
                  : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[90, 70, 80, 65, 50].map((w, i) => <Skeleton key={i} width={`${w}%`} height={12} />)}
                    </div>
                  )
                }
              </div>
            </div>

            {/* Right col: PROBABILITIES + TRUST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Class probabilities */}
              <div style={{ background: "var(--ns-surface-2)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Class Probabilities (ensemble)</div>
                {probabilities
                  ? Object.entries(probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, pct]) => (
                        <ProbBar key={cls} label={CLASS_LABELS[cls] ?? cls} pct={pct} color={CLASS_COLORS[cls] ?? "#64748b"} />
                      ))
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3,4].map(i => <Skeleton key={i} height={8} />)}</div>
                }
              </div>

              {/* Trust components */}
              <div style={{
                background: "var(--ns-surface-2)",
                border: `2px solid ${trust ? (TRUST_COLORS[trust.verdict]?.border ?? "#64748b") + "44" : "#e2e8f0"}`,
                borderRadius: 12, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ns-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Trust Components</div>
                  {trust
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ns-text-3)", fontFamily: "'DM Mono',monospace" }}>{trust.score}</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}><Spinner size={10} /> computing…</span>
                  }
                </div>

                {trust
                  ? [
                      { label: "Tri-head Agreement", value: trust.ensemble_agreement ? "✓ Softmax / SVM / XGB agree" : "✗ Heads disagree", ok: trust.ensemble_agreement, sub: "softmax · svm · xgboost" },
                      { label: "Top-1 Margin",        value: `${trust.top1_margin}`,   ok: trust.top1_margin > 0.30,    sub: trust.top1_margin > 0.30 ? "clear winner" : trust.top1_margin > 0.15 ? "moderate gap" : "ambiguous" },
                      { label: "Dual-path IoU",       value: `${trust.dual_path_iou}`, ok: trust.dual_path_iou > 0.40,  sub: "EfficientNet vs DenseNet heatmap overlap" },
                      { label: "Ensemble Entropy",    value: `${trust.mc_entropy_normalized}`, ok: trust.mc_entropy_normalized < 0.25, sub: "lower = more certain (softmax/SVM/XGB probability spread)" },
                    ].map(({ label, value, ok, sub }) => (
                      <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: ok ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: ok ? "#15803d" : "#dc2626", marginTop: 1 }}>
                          {ok ? "✓" : "✗"}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ns-text)" }}>
                            {label} <span style={{ fontFamily: "'DM Mono',monospace", color: ok ? "#15803d" : "#dc2626" }}>{value}</span>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ns-text-3)" }}>{sub}</div>
                        </div>
                      </div>
                    ))
                  : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--ns-border)", flexShrink: 0 }} />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <Skeleton width="60%" height={12} />
                            <Skeleton width="40%" height={10} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          </div>

          {/* ── Doctor Actions ── */}
          <div style={{
            borderTop: "1px solid var(--ns-border)", paddingTop: 18,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            {confirmed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#dcfce7", border: "1px solid #16a34a", borderRadius: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Diagnosis Confirmed</span>
              </div>
            ) : (
              <button
                className="xai-btn-confirm"
                onClick={handleConfirm}
                disabled={confirming || !resultId || !isComplete}
                title={!isComplete ? "Wait for full analysis to complete before confirming" : undefined}
                style={{
                  padding: "11px 22px", background: !isComplete ? "#94a3b8" : "#0d9488", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: confirming || !resultId || !isComplete ? "not-allowed" : "pointer",
                  opacity: confirming ? 0.7 : 1, transition: "opacity 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {confirming ? (
                  <><Spinner size={14} />Confirming…</>
                ) : !isComplete ? (
                  <><Spinner size={14} />Analysis running…</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Confirm Diagnosis
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: "11px 22px", background: "var(--ns-surface-2)",
                color: "var(--ns-text-2)", border: "1px solid var(--ns-border)",
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {confirmErr && (
              <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>{confirmErr}</span>
            )}

            {!resultId && (
              <span style={{ fontSize: 11, color: "var(--ns-text-3)" }}>
                Confirmation unavailable — scan not linked to a patient record.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
