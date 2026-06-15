import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../util";

const IcSpin = () => (
  <svg style={{ animation: "sp 0.7s linear infinite", flexShrink: 0 }}
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
);

export default function SetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState("");
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    if (!token) setErr("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  const handleSubmit = async () => {
    if (!password || !confirm) { setErr("Please fill in both fields."); return; }
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    setErr(""); setLoading(true);
    try {
      await api("/auth/set-password", { method: "POST", body: { token, new_password: password } });
      setDone(true);
    } catch (e) {
      setErr(e?.detail || "This link is invalid or has expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f8fafc", padding: 20,
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 36px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}>
        {/* Logo strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(145deg, #14b8a6, #0f766e)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>
            NEURO<span style={{ color: "#0d9488" }}>SIGHT</span>
          </span>
        </div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Password set successfully</h2>
            <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%", padding: "11px",
                background: "#0d9488", color: "#fff",
                border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Set new password</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              Choose a strong password for your account.
            </p>

            {err && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: "#b91c1c", marginBottom: 16, lineHeight: 1.5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{err}</span>
              </div>
            )}

            <label style={{
              display: "block", fontSize: 10, fontWeight: 600,
              color: "#64748b", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              New password
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={!token}
                style={{
                  width: "100%", padding: "10px 40px 10px 14px",
                  border: "1px solid #d1d5db", borderRadius: 8,
                  fontSize: 13.5, color: "#0f172a",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", color: "#94a3b8", padding: 0,
                }}
              >
                {showPass ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <label style={{
              display: "block", fontSize: 10, fontWeight: 600,
              color: "#64748b", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Confirm password
            </label>
            <input
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Re-enter password"
              disabled={!token}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #d1d5db", borderRadius: 8,
                fontSize: 13.5, color: "#0f172a",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none", marginBottom: 24, boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !token}
              style={{
                width: "100%", padding: "11px",
                background: loading || !token ? "#99f6e4" : "#0d9488",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: loading || !token ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              {loading ? <><IcSpin/> Saving…</> : "Set password"}
            </button>

            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  background: "none", border: "none",
                  fontSize: 12.5, color: "#94a3b8", cursor: "pointer",
                }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
