// import { useState } from "react";
// import { api, fetchCurrentUser, setToken } from "../../../util";

// export default function LoginForm({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     setLoading(true);
//     try {
//       const { access_token } = await api("/auth/login", {
//         method: "POST",
//         timeoutMs: 15000,
//         body: { email, password },
//       });
//       setToken(access_token);
//       let user = null;
//       try {
//         user = await fetchCurrentUser(5000);
//       } catch {
//         // Login succeeded; continue and let app bootstrap fetch profile later.
//       }
//       onLogin?.(user);
//     } catch (e) {
//       setErr("Invalid email or password. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
//       <form
//         onSubmit={submit}
//         className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4 animate-fadeIn"
//       >
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
//           Brain Tumor Detection
//         </h2>
//         <p className="text-center text-gray-500 mb-6">Login to access dashboard</p>

//         <div className="space-y-2">
//           <label className="text-gray-700 text-sm font-medium">Email</label>
//           <input
//             type="email"
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-gray-700 text-sm font-medium">Password</label>
//           <input
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//             required
//           />
//         </div>

//         {err && <p className="text-sm text-red-600 text-center">{err}</p>}

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-2 text-white font-semibold rounded-lg transition ${
//             loading
//               ? "bg-indigo-300 cursor-not-allowed"
//               : "bg-indigo-600 hover:bg-indigo-700"
//           }`}
//         >
//           {loading ? "Logging in..." : "Log In"}
//         </button>

//         <p className="text-center text-sm text-gray-500 mt-4">
//           Need access? Contact a system administrator to create your account.
//         </p>
//       </form>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { api, fetchCurrentUser, setToken } from "../../../util";

// // ── Inject Google Fonts + keyframes once ──────
// function useStyles() {
//   useEffect(() => {
//     if (document.getElementById("ns-font")) return;

//     // Font — must be a <link> tag, @import in dynamic <style> doesn't work
//     const link = document.createElement("link");
//     link.id = "ns-font";
//     link.rel = "stylesheet";
//     link.href =
//       "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@500&family=Inter:wght@400;500;600&display=swap";
//     document.head.prepend(link);

//     const style = document.createElement("style");
//     style.id = "ns-keyframes";
//     style.textContent = `
//       @keyframes ns-spin  { to { transform: rotate(360deg); } }
//       @keyframes ns-scan  { 0%{top:0;opacity:0} 6%{opacity:1} 94%{opacity:1} 100%{top:100%;opacity:0} }
//       @keyframes ns-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
//       .ns-inp:focus { border-color:#14b8a6!important; box-shadow:0 0 0 3px rgba(20,184,166,0.12)!important; }
//       .ns-card:hover { background:rgba(255,255,255,0.06)!important; border-color:rgba(20,184,166,0.25)!important; }
//       .ns-sbtn:hover:not(:disabled) { background:#0f766e!important; }
//       .ns-sbtn:active:not(:disabled) { transform:scale(0.99)!important; }
//       .ns-fgt:hover { color:#0f766e!important; text-decoration:underline; }
//     `;
//     document.head.appendChild(style);
//   }, []);
// }

// // ── Icons ─────────────────────────────────────
// const IcBrain = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
//     <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
//   </svg>
// );
// const IcUsers = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
//     <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
//   </svg>
// );
// const IcActivity = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
//   </svg>
// );
// const IcChain = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//     <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//   </svg>
// );
// const IcLock = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//   </svg>
// );
// const IcMail = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
//   </svg>
// );
// const IcEyeOn = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
//   </svg>
// );
// const IcEyeOff = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
//     <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
//     <line x1="1" y1="1" x2="23" y2="23"/>
//   </svg>
// );
// const IcShield = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" style={{ flexShrink: 0 }}>
//     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
//   </svg>
// );
// const IcAlert = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
//     <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
//   </svg>
// );
// const IcSpin = () => (
//   <svg style={{ animation: "ns-spin 0.75s linear infinite", flexShrink: 0 }}
//     width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//     <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
//   </svg>
// );

// // ── Feature card data ──────────────────────────
// const FEATURES = [
//   { Icon: IcBrain,    title: "AI Diagnostic Assistant", sub: "Real-time MRI tumour classification" },
//   { Icon: IcUsers,    title: "Patient Management",      sub: "Records, history & treatment plans"  },
//   { Icon: IcActivity, title: "Care Monitoring",         sub: "Post-diagnosis vitals & follow-up"   },
//   { Icon: IcChain,    title: "Blockchain Archiving",    sub: "Immutable treatment record ledger"   },
// ];

// // ── Font stacks — used inline so browser sees them immediately,
// //    no class-name dependency, guaranteed render even before fonts load
// const SYNE  = "'Syne', Georgia, 'Times New Roman', serif";
// const MONO  = "'DM Mono', 'Courier New', monospace";
// const INTER = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// // ─── Input base style ────────────────────────
// const inputBase = {
//   width: "100%",
//   border: "1px solid #e2e8f0",
//   borderRadius: 7,
//   fontSize: 13.5,
//   color: "#0f172a",
//   background: "#fff",
//   outline: "none",
//   transition: "border-color 0.15s, box-shadow 0.15s",
//   WebkitAppearance: "none",
// };

// // ══════════════════════════════════════════════
// export default function LoginForm({ onLogin }) {
//   useStyles();

//   const [email,    setEmail]    = useState("");
//   const [password, setPassword] = useState("");
//   const [err,      setErr]      = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const [showPass, setShowPass] = useState(false);

//   const handleSubmit = async () => {
//     if (!email || !password) { setErr("Please fill in all fields."); return; }
//     setErr(""); setLoading(true);
//     try {
//       const { access_token } = await api("/auth/login", {
//         method: "POST", timeoutMs: 15000,
//         body: { email, password },
//       });
//       setToken(access_token);
//       let user = null;
//       try { user = await fetchCurrentUser(5000); } catch {}
//       onLogin?.(user);
//     } catch {
//       setErr("Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onKey = (e, nextId) => {
//     if (e.key !== "Enter") return;
//     nextId ? document.getElementById(nextId)?.focus() : handleSubmit();
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: INTER, overflow: "hidden" }}>

//       {/* ══════════ LEFT DARK PANEL ══════════ */}
//       <div style={{
//         width: "48%", background: "#040c16",
//         position: "relative", display: "flex", flexDirection: "column",
//         padding: "38px 40px", overflow: "hidden", flexShrink: 0,
//       }}>

//         {/* Dot grid texture */}
//         <div style={{
//           position: "absolute", inset: 0, pointerEvents: "none",
//           backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.17) 1px, transparent 1px)",
//           backgroundSize: "28px 28px",
//           maskImage: "radial-gradient(ellipse 85% 85% at 50% 40%, black 30%, transparent 100%)",
//           WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 40%, black 30%, transparent 100%)",
//         }}/>

//         {/* Ambient glows */}
//         <div style={{ position:"absolute", top:-90, right:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(20,184,166,0.13) 0%,transparent 65%)", pointerEvents:"none" }}/>
//         <div style={{ position:"absolute", bottom:-70, left:-50, width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(13,148,136,0.08) 0%,transparent 65%)", pointerEvents:"none" }}/>

//         {/* Animated scan line */}
//         <div style={{
//           position: "absolute", left: 0, right: 0, height: 1, pointerEvents: "none",
//           background: "linear-gradient(90deg,transparent,rgba(45,212,191,0.55),transparent)",
//           animation: "ns-scan 6s ease-in-out infinite",
//         }}/>

//         {/* ─── Inner layout ─── */}
//         <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

//           {/* Logo */}
//           <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
//             <div style={{
//               width: 36, height: 36, borderRadius: 8, flexShrink: 0,
//               background: "linear-gradient(145deg,#14b8a6,#0f766e)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               boxShadow: "0 0 0 1px rgba(20,184,166,0.35), 0 0 18px rgba(20,184,166,0.18)",
//             }}>
//               <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
//                 <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
//                 <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
//               </svg>
//             </div>
//             <div>
//               {/* fontFamily applied inline — renders correctly before font loads */}
//               <div style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 15, color: "#f1f5f9", letterSpacing: "1.2px", lineHeight: 1 }}>
//                 NEURO<span style={{ color: "#2dd4bf" }}>SIGHT</span>
//               </div>
//               <div style={{ fontFamily: MONO, fontSize: 8, color: "#1e3448", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>
//                 AI Diagnostic Platform
//               </div>
//             </div>
//           </div>

//           {/* Divider */}
//           <div style={{ height: "0.5px", background: "rgba(255,255,255,0.05)", margin: "22px 0" }}/>

//           {/* Pill badge */}
//           <div style={{
//             display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start",
//             background: "rgba(20,184,166,0.08)", border: "0.5px solid rgba(20,184,166,0.22)",
//             borderRadius: 4, padding: "4px 11px", marginBottom: 16,
//           }}>
//             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2dd4bf", animation: "ns-blink 2.5s ease-in-out infinite" }}/>
//             <span style={{ fontFamily: MONO, fontSize: 9, color: "#2dd4bf", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
//               Clinical Decision Support
//             </span>
//           </div>

//           {/* Main heading */}
//           <h1 style={{
//             fontFamily: SYNE,
//             fontSize: 26, fontWeight: 800, color: "#f1f5f9",
//             lineHeight: 1.2, letterSpacing: "-0.5px", margin: "0 0 10px",
//           }}>
//             Precision Brain<br/>
//             Tumour{" "}
//             <span style={{
//               background: "linear-gradient(90deg,#2dd4bf,#67e8f9)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
//             }}>
//               Detection
//             </span>
//           </h1>

//           {/* Description — strictly 2 lines */}
//           <p style={{
//             fontSize: 12, color: "#3d5166", lineHeight: 1.7, margin: "0 0 20px",
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//           }}>
//             AI-assisted MRI classification with patient management, care monitoring and blockchain record archiving.
//           </p>

//           {/* Glass feature cards */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//             {FEATURES.map(({ Icon, title, sub }, i) => (
//               <div key={i} className="ns-card" style={{
//                 display: "flex", alignItems: "center", gap: 12,
//                 padding: "11px 13px", borderRadius: 10,
//                 background: "rgba(255,255,255,0.03)",
//                 border: "0.5px solid rgba(255,255,255,0.07)",
//                 backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
//                 cursor: "default", transition: "background 0.18s, border-color 0.18s",
//               }}>
//                 <div style={{
//                   width: 32, height: 32, borderRadius: 7, flexShrink: 0,
//                   background: "rgba(20,184,166,0.1)", border: "0.5px solid rgba(20,184,166,0.18)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <Icon/>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 12.5, fontWeight: 500, color: "#cbd5e1", lineHeight: 1 }}>{title}</div>
//                   <div style={{ fontSize: 10.5, color: "#3d5a6e", marginTop: 3 }}>{sub}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Push footer to bottom */}
//           <div style={{ flex: 1 }}/>

//           {/* Footer — single line, no wrap */}
//           <div style={{
//             paddingTop: 14,
//             borderTop: "0.5px solid rgba(255,255,255,0.05)",
//             display: "flex", alignItems: "center", gap: 7,
//           }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2a3f52" strokeWidth="2" style={{ flexShrink: 0 }}>
//               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
//             </svg>
//             <span style={{ fontSize: 10, color: "#2a3f52", whiteSpace: "nowrap" }}>
//               Authorised access only — all activity is monitored and logged.
//             </span>
//           </div>

//         </div>
//       </div>

//       {/* ══════════ RIGHT SIGN-IN PANEL ══════════ */}
//       <div style={{
//         flex: 1, background: "#f8fafc",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         padding: "40px 36px", position: "relative",
//       }}>
//         {/* Teal top accent bar */}
//         <div style={{
//           position: "absolute", top: 0, left: 0, right: 0, height: 3,
//           background: "linear-gradient(90deg,#0d9488,#2dd4bf,#0d9488)", opacity: 0.5,
//         }}/>

//         <div style={{ width: "100%", maxWidth: 320 }}>

//           <div style={{ fontFamily: SYNE, fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 5, letterSpacing: "-0.4px" }}>
//             Sign in to your account
//           </div>
//           <div style={{ fontSize: 13, color: "#64748b", marginBottom: 26 }}>
//             Enter your credentials to access the dashboard
//           </div>

//           {/* Error banner */}
//           {err && (
//             <div style={{
//               display: "flex", alignItems: "center", gap: 8,
//               background: "#fef2f2", border: "0.5px solid #fecaca",
//               borderRadius: 7, padding: "9px 12px",
//               fontSize: 12, color: "#b91c1c", marginBottom: 14,
//             }}>
//               <IcAlert/><span>{err}</span>
//             </div>
//           )}

//           {/* Email */}
//           <div style={{ marginBottom: 14 }}>
//             <label htmlFor="ns-email" style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
//               Email address
//             </label>
//             <div style={{ position: "relative" }}>
//               <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
//                 <IcMail/>
//               </span>
//               <input
//                 id="ns-email"
//                 className="ns-inp"
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 onKeyDown={e => onKey(e, "ns-pass")}
//                 placeholder="admin@neurosight.ai"
//                 autoComplete="email"
//                 required
//                 style={{ ...inputBase, padding: "10px 13px 10px 35px", fontFamily: INTER }}
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div style={{ marginBottom: 6 }}>
//             <label htmlFor="ns-pass" style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
//               Password
//             </label>
//             <div style={{ position: "relative" }}>
//               <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
//                 <IcLock/>
//               </span>
//               <input
//                 id="ns-pass"
//                 className="ns-inp"
//                 type={showPass ? "text" : "password"}
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 onKeyDown={e => onKey(e, null)}
//                 placeholder="••••••••••••"
//                 autoComplete="current-password"
//                 required
//                 style={{ ...inputBase, padding: "10px 40px 10px 35px", fontFamily: INTER }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(v => !v)}
//                 aria-label="Toggle password visibility"
//                 style={{
//                   position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
//                   background: "none", border: "none", cursor: "pointer",
//                   color: "#94a3b8", display: "flex", padding: 0,
//                 }}
//               >
//                 {showPass ? <IcEyeOff/> : <IcEyeOn/>}
//               </button>
//             </div>
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
//               <button type="button" className="ns-fgt" style={{ background: "none", border: "none", fontSize: 12, color: "#14b8a6", cursor: "pointer", fontFamily: INTER, padding: 0 }}>
//                 Forgot password?
//               </button>
//             </div>
//           </div>

//           {/* Sign In button */}
//           <button
//             type="button"
//             className="ns-sbtn"
//             onClick={handleSubmit}
//             disabled={loading}
//             style={{
//               width: "100%", marginTop: 18, padding: "11px",
//               background: loading ? "#99f6e4" : "#0d9488",
//               color: "#fff", border: "none", borderRadius: 7,
//               fontSize: 13.5, fontWeight: 600, fontFamily: INTER,
//               cursor: loading ? "not-allowed" : "pointer",
//               display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//               transition: "background 0.15s, transform 0.1s",
//               letterSpacing: "0.01em",
//             }}
//           >
//             {loading ? <><IcSpin/> Signing in…</> : "Sign In"}
//           </button>

//           {/* OR divider */}
//           <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 14px" }}>
//             <div style={{ flex: 1, height: "0.5px", background: "#e2e8f0" }}/>
//             <span style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.07em" }}>OR</span>
//             <div style={{ flex: 1, height: "0.5px", background: "#e2e8f0" }}/>
//           </div>

//           {/* Need access */}
//           <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
//             Need account?{" "}
//             <button type="button" style={{ background: "none", border: "none", fontSize: 12, color: "#14b8a6", cursor: "pointer", fontFamily: INTER, padding: 0 }}>
//               Contact your system administrator
//             </button>
//           </div>

//           {/* JWT trust row */}
//           <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
//             <IcShield/>
//             <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
//               Secured with JWT — role-based access control enforced
//             </span>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { api, fetchCurrentUser, setToken } from "../../../util";

// // ─── Icons ────────────────────────────────────
// const IcBrain = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
//     <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
//   </svg>
// );
// const IcUsers = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
//     <circle cx="9" cy="7" r="4"/>
//     <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
//     <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
//   </svg>
// );
// const IcActivity = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
//   </svg>
// );
// const IcChain = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//     <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//   </svg>
// );
// const IcMail = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <rect x="2" y="4" width="20" height="16" rx="2"/>
//     <path d="m22 7-10 7L2 7"/>
//   </svg>
// );
// const IcLock = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <rect x="3" y="11" width="18" height="11" rx="2"/>
//     <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//   </svg>
// );
// const IcEyeOn = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//     <circle cx="12" cy="12" r="3"/>
//   </svg>
// );
// const IcEyeOff = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
//     <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
//     <line x1="1" y1="1" x2="23" y2="23"/>
//   </svg>
// );
// const IcShield = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" style={{ flexShrink: 0 }}>
//     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
//     <polyline points="9 12 11 14 15 10"/>
//   </svg>
// );
// const IcAlert = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
//     <circle cx="12" cy="12" r="10"/>
//     <line x1="12" y1="8" x2="12" y2="12"/>
//     <line x1="12" y1="16" x2="12.01" y2="16"/>
//   </svg>
// );
// const IcSpin = () => (
//   <svg style={{ animation: "ns-spin 0.7s linear infinite", flexShrink: 0 }}
//     width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//     <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
//   </svg>
// );

// const FEATURES = [
//   { Icon: IcBrain,    title: "AI Diagnostic Assistant", sub: "Real-time MRI tumour classification" },
//   { Icon: IcUsers,    title: "Patient Management",      sub: "Records, history & treatment plans"  },
//   { Icon: IcActivity, title: "Care Monitoring",         sub: "Post-diagnosis vitals & follow-up"   },
//   { Icon: IcChain,    title: "Blockchain Archiving",    sub: "Immutable treatment record ledger"   },
// ];

// // ─── One-time keyframe injection ──────────────
// let _injected = false;
// function injectOnce() {
//   if (_injected || typeof document === "undefined") return;
//   _injected = true;
//   const s = document.createElement("style");
//   s.textContent = `
//     @keyframes ns-spin  { to { transform: rotate(360deg); } }
//     @keyframes ns-scan  { 0%{top:0;opacity:0}6%{opacity:1}94%{opacity:1}100%{top:100%;opacity:0} }
//     @keyframes ns-blink { 0%,100%{opacity:1}50%{opacity:0.18} }
//     .ns-lf-inp:focus    { border-color:#0d9488 !important; box-shadow:0 0 0 3px rgba(13,148,136,0.12) !important; }
//     .ns-lf-card:hover   { background:rgba(255,255,255,0.055) !important; border-color:rgba(20,184,166,0.28) !important; }
//     .ns-lf-btn:hover:not(:disabled) { background:#0f766e !important; }
//     .ns-lf-btn:active:not(:disabled){ transform:scale(0.985) !important; }
//     .ns-lf-fgt:hover    { color:#0f766e !important; text-decoration:underline; }
//     .ns-lf-need:hover   { color:#0f766e !important; text-decoration:underline; }
//   `;
//   document.head.appendChild(s);
// }

// // ══════════════════════════════════════════════
// export default function LoginForm({ onLogin }) {
//   injectOnce();

//   const [email,    setEmail]    = useState("");
//   const [password, setPassword] = useState("");
//   const [err,      setErr]      = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const [showPass, setShowPass] = useState(false);

//   const handleSubmit = async () => {
//     if (!email || !password) { setErr("Please fill in all fields."); return; }
//     setErr(""); setLoading(true);
//     try {
//       const { access_token } = await api("/auth/login", {
//         method: "POST", timeoutMs: 15000,
//         body: { email, password },
//       });
//       setToken(access_token);
//       let user = null;
//       try { user = await fetchCurrentUser(5000); } catch {}
//       onLogin?.(user);
//     } catch {
//       setErr("Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onKey = (e, nextId) => {
//     if (e.key !== "Enter") return;
//     nextId ? document.getElementById(nextId)?.focus() : handleSubmit();
//   };

//   return (
//     <div style={{
//       display: "grid",
//       gridTemplateColumns: "1fr 1fr",
//       minHeight: "100vh",
//       // Uses the same font the rest of the app uses — DM Sans from index.css
//       fontFamily: "'DM Sans', -apple-system, sans-serif",
//     }}>

//       {/* ══════════════ LEFT DARK PANEL ══════════════ */}
//       <div style={{
//         background: "#0f172a",   /* --ns-sidebar from index.css */
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//         padding: "44px 48px",
//         overflow: "hidden",
//       }}>

//         {/* Dot grid texture */}
//         <div style={{
//           position: "absolute", inset: 0, pointerEvents: "none",
//           backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.15) 1px, transparent 1px)",
//           backgroundSize: "30px 30px",
//           maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 25%, transparent 100%)",
//           WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 25%, transparent 100%)",
//         }}/>

//         {/* Teal glow — top right */}
//         <div style={{
//           position: "absolute", top: -80, right: -80,
//           width: 280, height: 280, borderRadius: "50%", pointerEvents: "none",
//           background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 65%)",
//         }}/>

//         {/* Teal glow — bottom left */}
//         <div style={{
//           position: "absolute", bottom: -60, left: -60,
//           width: 220, height: 220, borderRadius: "50%", pointerEvents: "none",
//           background: "radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 65%)",
//         }}/>

//         {/* Scan line */}
//         <div style={{
//           position: "absolute", left: 0, right: 0, height: "1px", pointerEvents: "none",
//           background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)",
//           animation: "ns-scan 7s ease-in-out infinite",
//         }}/>

//         {/* ── Content ── */}
//         <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

//           {/* Logo — uses DM Sans (already loaded by index.css) */}
//           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
//             <div style={{
//               width: 38, height: 38, borderRadius: 10, flexShrink: 0,
//               background: "linear-gradient(145deg, #14b8a6, #0f766e)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               boxShadow: "0 0 0 1px rgba(20,184,166,0.3), 0 0 16px rgba(20,184,166,0.18)",
//             }}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
//                 <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
//                 <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
//               </svg>
//             </div>
//             <div>
//               {/*
//                 fontWeight 700, letter-spacing — DM Sans renders this
//                 boldly and cleanly, no compression issue
//               */}
//               <div style={{
//                 fontSize: 17, fontWeight: 700, color: "#e2e8f0",
//                 letterSpacing: "0.4px", lineHeight: 1,
//               }}>
//                 NEURO<span style={{ color: "#14b8a6" }}>SIGHT</span>
//               </div>
//               <div style={{
//                 fontFamily: "'DM Mono', monospace",
//                 fontSize: 9, color: "#334155",
//                 letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4,
//               }}>
//                 AI Diagnostic Platform
//               </div>
//             </div>
//           </div>

//           {/* Pill badge */}
//           <div style={{
//             display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start",
//             background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)",
//             borderRadius: 5, padding: "4px 12px", marginBottom: 18,
//           }}>
//             <div style={{
//               width: 5, height: 5, borderRadius: "50%", background: "#2dd4bf",
//               animation: "ns-blink 2.5s ease-in-out infinite",
//             }}/>
//             <span style={{
//               fontFamily: "'DM Mono', monospace",
//               fontSize: 9, fontWeight: 500, color: "#2dd4bf",
//               letterSpacing: "0.1em", textTransform: "uppercase",
//             }}>
//               Clinical Decision Support
//             </span>
//           </div>

//           {/* Headline — DM Sans 700, no Syne needed */}
//           <h1 style={{
//             fontSize: 28, fontWeight: 700,
//             color: "#f1f5f9", lineHeight: 1.22,
//             letterSpacing: "-0.3px", margin: "0 0 12px",
//           }}>
//             Precision Brain<br/>
//             Tumour{" "}
//             <span style={{
//               background: "linear-gradient(90deg, #2dd4bf, #67e8f9)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               backgroundClip: "text",
//             }}>
//               Detection
//             </span>
//           </h1>

//           {/* Description — max 2 lines */}
//           <p style={{
//             fontSize: 13, color: "#475569", lineHeight: 1.65,
//             margin: "0 0 28px", maxWidth: "100%",
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//           }}>
//             AI-assisted MRI classification with patient management, care monitoring and blockchain record archiving.
//           </p>

//           {/* Glass feature cards */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {FEATURES.map(({ Icon, title, sub }, i) => (
//               <div key={i} className="ns-lf-card" style={{
//                 display: "flex", alignItems: "center", gap: 13,
//                 padding: "12px 14px", borderRadius: 10,
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.06)",
//                 backdropFilter: "blur(8px)",
//                 WebkitBackdropFilter: "blur(8px)",
//                 cursor: "default",
//                 transition: "background 0.18s, border-color 0.18s",
//               }}>
//                 <div style={{
//                   width: 34, height: 34, borderRadius: 8, flexShrink: 0,
//                   background: "rgba(20,184,166,0.1)",
//                   border: "1px solid rgba(20,184,166,0.16)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <Icon/>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 13, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.2 }}>{title}</div>
//                   <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Spacer */}
//           <div style={{ flex: 1 }}/>

//           {/* Footer — single line guaranteed */}
//           <div style={{
//             paddingTop: 20,
//             borderTop: "1px solid rgba(255,255,255,0.05)",
//             display: "flex", alignItems: "center", gap: 8,
//           }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" style={{ flexShrink: 0 }}>
//               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
//             </svg>
//             <span style={{
//               fontFamily: "'DM Mono', monospace",
//               fontSize: 10, color: "#334155",
//               letterSpacing: "0.04em",
//               whiteSpace: "nowrap",
//             }}>
//               Authorised access only — all activity is monitored and logged.
//             </span>
//           </div>

//         </div>
//       </div>

//       {/* ══════════════ RIGHT SIGN-IN PANEL ══════════════ */}
//       <div style={{
//         background: "#ffffff",
//         display: "flex", flexDirection: "column",
//         alignItems: "center", justifyContent: "center",
//         padding: "60px 48px",
//         position: "relative",
//       }}>

//         {/* Top teal accent */}
//         <div style={{
//           position: "absolute", top: 0, left: 0, right: 0, height: 3,
//           background: "linear-gradient(90deg, #0d9488, #2dd4bf, #0d9488)",
//           opacity: 0.55,
//         }}/>

//         <div style={{ width: "100%", maxWidth: 340 }}>

//           {/* Form heading */}
//           <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 5, letterSpacing: "-0.3px" }}>
//             Sign in to your account
//           </div>
//           <div style={{ fontSize: 13.5, color: "#64748b", marginBottom: 28 }}>
//             Enter your credentials to access the dashboard
//           </div>

//           {/* Error */}
//           {err && (
//             <div style={{
//               display: "flex", alignItems: "center", gap: 8,
//               background: "#fef2f2", border: "1px solid #fecaca",
//               borderRadius: 8, padding: "10px 14px",
//               fontSize: 13, color: "#b91c1c", marginBottom: 16,
//             }}>
//               <IcAlert/><span>{err}</span>
//             </div>
//           )}

//           {/* Email */}
//           <div style={{ marginBottom: 16 }}>
//             <label htmlFor="ns-email" style={{
//               display: "block", fontSize: 10, fontWeight: 600,
//               color: "#64748b", letterSpacing: "0.1em",
//               textTransform: "uppercase", marginBottom: 6,
//             }}>
//               Email address
//             </label>
//             <div style={{ position: "relative" }}>
//               <span style={{
//                 position: "absolute", left: 12, top: "50%",
//                 transform: "translateY(-50%)", color: "#94a3b8",
//                 display: "flex", pointerEvents: "none",
//               }}>
//                 <IcMail/>
//               </span>
//               <input
//                 id="ns-email"
//                 className="ns-lf-inp"
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 onKeyDown={e => onKey(e, "ns-pass")}
//                 placeholder="admin@neurosight.ai"
//                 autoComplete="email"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "10px 14px 10px 36px",
//                   border: "1px solid #e2e8f0",
//                   borderRadius: 8, fontSize: 13.5,
//                   color: "#0f172a", background: "#fff",
//                   fontFamily: "'DM Sans', sans-serif",
//                   outline: "none",
//                   transition: "border-color 0.15s, box-shadow 0.15s",
//                 }}
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div style={{ marginBottom: 8 }}>
//             <label htmlFor="ns-pass" style={{
//               display: "block", fontSize: 10, fontWeight: 600,
//               color: "#64748b", letterSpacing: "0.1em",
//               textTransform: "uppercase", marginBottom: 6,
//             }}>
//               Password
//             </label>
//             <div style={{ position: "relative" }}>
//               <span style={{
//                 position: "absolute", left: 12, top: "50%",
//                 transform: "translateY(-50%)", color: "#94a3b8",
//                 display: "flex", pointerEvents: "none",
//               }}>
//                 <IcLock/>
//               </span>
//               <input
//                 id="ns-pass"
//                 className="ns-lf-inp"
//                 type={showPass ? "text" : "password"}
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 onKeyDown={e => onKey(e, null)}
//                 placeholder="••••••••••••"
//                 autoComplete="current-password"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: "10px 40px 10px 36px",
//                   border: "1px solid #e2e8f0",
//                   borderRadius: 8, fontSize: 13.5,
//                   color: "#0f172a", background: "#fff",
//                   fontFamily: "'DM Sans', sans-serif",
//                   outline: "none",
//                   transition: "border-color 0.15s, box-shadow 0.15s",
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(v => !v)}
//                 aria-label="Toggle password"
//                 style={{
//                   position: "absolute", right: 12, top: "50%",
//                   transform: "translateY(-50%)",
//                   background: "none", border: "none",
//                   cursor: "pointer", color: "#94a3b8",
//                   display: "flex", padding: 0,
//                   transition: "color 0.15s",
//                 }}
//               >
//                 {showPass ? <IcEyeOff/> : <IcEyeOn/>}
//               </button>
//             </div>

//             {/* Forgot password */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
//               <button
//                 type="button"
//                 className="ns-lf-fgt"
//                 style={{
//                   background: "none", border: "none",
//                   fontSize: 12.5, color: "#0d9488",
//                   cursor: "pointer",
//                   fontFamily: "'DM Sans', sans-serif",
//                   padding: 0, transition: "color 0.15s",
//                 }}
//               >
//                 Forgot password?
//               </button>
//             </div>
//           </div>

//           {/* Sign In button */}
//           <button
//             type="button"
//             className="ns-lf-btn"
//             onClick={handleSubmit}
//             disabled={loading}
//             style={{
//               width: "100%", marginTop: 10, padding: "11px",
//               background: loading ? "#99f6e4" : "#0d9488",
//               color: "#fff", border: "none", borderRadius: 8,
//               fontSize: 14, fontWeight: 600,
//               fontFamily: "'DM Sans', sans-serif",
//               cursor: loading ? "not-allowed" : "pointer",
//               display: "flex", alignItems: "center",
//               justifyContent: "center", gap: 8,
//               transition: "background 0.15s, transform 0.12s",
//               letterSpacing: "0.01em",
//             }}
//           >
//             {loading ? <><IcSpin/> Signing in…</> : "Sign In"}
//           </button>

//           {/* Divider */}
//           <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
//             <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}/>
//             <span style={{
//               fontSize: 10, color: "#94a3b8",
//               letterSpacing: "0.1em", textTransform: "uppercase",
//               fontFamily: "'DM Mono', monospace",
//             }}>
//               Institutional Access
//             </span>
//             <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}/>
//           </div>

//           {/* Need account */}
//           <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
//             Need account?{" "}
//             <button
//               type="button"
//               className="ns-lf-need"
//               style={{
//                 background: "none", border: "none",
//                 fontSize: 13, color: "#0d9488",
//                 cursor: "pointer",
//                 fontFamily: "'DM Sans', sans-serif",
//                 padding: 0, transition: "color 0.15s",
//               }}
//             >
//               Contact your system administrator
//             </button>
//           </div>

//           {/* JWT trust */}
//           <div style={{
//             display: "flex", alignItems: "center",
//             justifyContent: "center", gap: 7,
//           }}>
//             <IcShield/>
//             <span style={{ fontSize: 12, color: "#94a3b8" }}>
//               Secured with JWT — role-based access control enforced
//             </span>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { api, fetchCurrentUser, setToken } from "../../../util";

// ─── Icons ────────────────────────────────────
const IcBrain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
  </svg>
);
const IcUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcActivity = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IcChain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IcMail = ({ valid }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={valid ? "#0d9488" : "currentColor"} strokeWidth="1.8" strokeLinecap="round"
    style={{ transition: "stroke 0.2s" }}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-10 7L2 7"/>
  </svg>
);
const IcLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IcEyeOn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IcShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IcAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IcSpin = () => (
  <svg style={{ animation: "ns-spin 0.7s linear infinite", flexShrink: 0 }}
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
);

const FEATURES = [
  { Icon: IcBrain,    title: "AI Diagnostic Assistant", sub: "Real-time MRI tumour classification" },
  { Icon: IcUsers,    title: "Patient Management",      sub: "Records, history & treatment plans"  },
  { Icon: IcActivity, title: "Care Monitoring",         sub: "Post-diagnosis vitals & follow-up"   },
  { Icon: IcChain,    title: "Blockchain Archiving",    sub: "Immutable treatment record ledger"   },
];

const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

// ─── One-time style injection ──────────────────
let _injected = false;
function injectOnce() {
  if (_injected || typeof document === "undefined") return;
  _injected = true;
  const s = document.createElement("style");
  s.textContent = `
    @keyframes ns-spin    { to { transform: rotate(360deg); } }
    @keyframes ns-scan    { 0%{top:0;opacity:0}6%{opacity:1}94%{opacity:1}100%{top:100%;opacity:0} }
    @keyframes ns-blink   { 0%,100%{opacity:1}50%{opacity:0.18} }
    @keyframes ns-card-in { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
    .ns-lf-inp:focus    { border-color:#0d9488 !important; box-shadow:0 0 0 3px rgba(13,148,136,0.12) !important; }
    .ns-lf-card:hover   { background:rgba(255,255,255,0.055) !important; border-color:rgba(20,184,166,0.28) !important; }
    .ns-lf-btn          { overflow:hidden; position:relative; }
    .ns-lf-btn::after   { content:''; position:absolute; inset:0; background:radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%); opacity:0; transition:opacity 0.3s; }
    .ns-lf-btn:active:not(:disabled)::after { opacity:1; transition:none; }
    .ns-lf-btn:hover:not(:disabled) { background:#0f766e !important; }
    .ns-lf-btn:active:not(:disabled){ transform:scale(0.985) !important; }
    .ns-lf-fgt:hover    { color:#0f766e !important; text-decoration:underline; }
    .ns-lf-need:hover   { color:#0f766e !important; text-decoration:underline; }
  `;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════
export default function LoginForm({ onLogin }) {
  injectOnce();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [err,        setErr]        = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  // Forgot password modal
  const [fgtOpen,    setFgtOpen]    = useState(false);
  const [fgtEmail,   setFgtEmail]   = useState("");
  const [fgtLoading, setFgtLoading] = useState(false);
  const [fgtDone,    setFgtDone]    = useState(false);
  const [fgtErr,     setFgtErr]     = useState("");

  // Contact admin tooltip
  const [showContact, setShowContact] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setErr("Please fill in all fields."); return; }
    setErr(""); setLoading(true);
    try {
      const { access_token } = await api("/auth/login", {
        method: "POST", timeoutMs: 15000,
        body: { email, password },
      });
      setToken(access_token);
      let user = null;
      try { user = await fetchCurrentUser(5000); } catch {}
      onLogin?.(user);
    } catch {
      setErr("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e, nextId) => {
    if (e.key !== "Enter") return;
    nextId ? document.getElementById(nextId)?.focus() : handleSubmit();
  };

  const openForgot = () => {
    setFgtEmail(email);
    setFgtDone(false);
    setFgtErr("");
    setFgtOpen(true);
  };

  const handleForgotSubmit = async () => {
    if (!fgtEmail) { setFgtErr("Please enter your email address."); return; }
    setFgtErr(""); setFgtLoading(true);
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email: fgtEmail } });
      setFgtDone(true);
    } catch {
      setFgtErr("Something went wrong. Please try again.");
    } finally {
      setFgtLoading(false);
    }
  };

  return (
    <>
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>

      {/* ══════════════ LEFT DARK PANEL ══════════════ */}
      <div style={{
        background: "#040c16",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "44px 48px",
        overflow: "hidden",
      }}>

        {/* Grain texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: GRAIN_URI,
          backgroundRepeat: "repeat",
          opacity: 0.045,
          zIndex: 0,
        }}/>

        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.17) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 25%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 25%, transparent 100%)",
        }}/>

        {/* Glow — top right */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 280, height: 280, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(20,184,166,0.13) 0%, transparent 65%)",
        }}/>

        {/* Glow — bottom left */}
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 220, height: 220, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%)",
        }}/>

        {/* Scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "1px", pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.55), transparent)",
          animation: "ns-scan 7s ease-in-out infinite",
        }}/>

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(145deg, #14b8a6, #0f766e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(20,184,166,0.3), 0 0 16px rgba(20,184,166,0.18)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
              </svg>
            </div>
            <div>
              {/* Wordmark — larger, tracked */}
              <div style={{
                fontSize: 19, fontWeight: 700, color: "#e2e8f0",
                letterSpacing: "1.2px", lineHeight: 1,
              }}>
                NEURO<span style={{ color: "#2dd4bf" }}>SIGHT</span>
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9, color: "#3d5a72",
                letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 5,
              }}>
                AI Diagnostic Platform
              </div>
            </div>
          </div>

          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start",
            background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.22)",
            borderRadius: 5, padding: "4px 12px", marginBottom: 18,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", background: "#2dd4bf",
              animation: "ns-blink 2.5s ease-in-out infinite",
            }}/>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, fontWeight: 500, color: "#2dd4bf",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Clinical Decision Support
            </span>
          </div>

          {/* Headline — Syne display font */}
          <h1 style={{
            fontFamily: "'Syne', 'DM Sans', sans-serif",
            fontSize: 30, fontWeight: 800,
            color: "#f1f5f9", lineHeight: 1.18,
            letterSpacing: "-0.5px", margin: "0 0 14px",
          }}>
            Precision Brain<br/>
            Tumour{" "}
            <span style={{
              background: "linear-gradient(90deg, #2dd4bf, #67e8f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Detection
            </span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 13, color: "#4a6d8c", lineHeight: 1.7,
            margin: "0 0 28px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
              An integrated diagnostic platform supporting clinical teams with AI-assisted brain tumour classification and patient management.

          </p>

          {/* Glass feature cards — staggered */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FEATURES.map(({ Icon, title, sub }, i) => (
              <div key={i} className="ns-lf-card" style={{
                display: "flex", alignItems: "center", gap: 13,
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                cursor: "default",
                transition: "background 0.18s, border-color 0.18s",
                animation: "ns-card-in 0.4s ease both",
                animationDelay: `${i * 70}ms`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: "rgba(20,184,166,0.1)",
                  border: "1px solid rgba(20,184,166,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon/>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#cbd5e1", lineHeight: 1.2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: "#4a7090", marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }}/>

          {/* Footer */}
          <div style={{
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, color: "#475569",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
              Authorised access only — all activity is monitored and logged.
            </span>
          </div>

        </div>
      </div>

      {/* ══════════════ RIGHT SIGN-IN PANEL ══════════════ */}
      <div style={{
        background: "#f8fafc",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
        position: "relative",
      }}>

        {/* Top teal accent — full opacity, intentional */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #0d9488, #2dd4bf, #0d9488)",
        }}/>

        <div style={{ width: "100%", maxWidth: 360 }}>

          {/* Form heading — semantic h2 */}
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: "#0f172a",
            marginBottom: 6, letterSpacing: "-0.3px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Sign in to your account
          </h2>
          <p style={{
            fontSize: 13.5, color: "#64748b", marginBottom: 28,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            For authorised clinical staff only
          </p>

          {/* Error banner */}
          {err && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#b91c1c", marginBottom: 16,
            }}>
              <IcAlert/><span>{err}</span>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="ns-email" style={{
              display: "block", fontSize: 10, fontWeight: 600,
              color: "#64748b", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8",
                display: "flex", pointerEvents: "none",
              }}>
                <IcMail valid={emailValid}/>
              </span>
              <input
                id="ns-email"
                className="ns-lf-inp"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
                }}
                onKeyDown={e => onKey(e, "ns-pass")}
                placeholder="admin@neurosight.ai"
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 36px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8, fontSize: 13.5,
                  color: "#0f172a", background: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="ns-pass" style={{
              display: "block", fontSize: 10, fontWeight: 600,
              color: "#64748b", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8",
                display: "flex", pointerEvents: "none",
              }}>
                <IcLock/>
              </span>
              <input
                id="ns-pass"
                className="ns-lf-inp"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => onKey(e, null)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 36px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8, fontSize: 13.5,
                  color: "#0f172a", background: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label="Toggle password"
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", color: "#94a3b8",
                  display: "flex", padding: 0,
                  transition: "color 0.15s",
                }}
              >
                {showPass ? <IcEyeOff/> : <IcEyeOn/>}
              </button>
            </div>

            {/* Forgot password */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                className="ns-lf-fgt"
                onClick={openForgot}
                style={{
                  background: "none", border: "none",
                  fontSize: 12, color: "#0d9488",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  padding: 0, transition: "color 0.15s",
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="button"
            className="ns-lf-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", marginTop: 10, padding: "11px",
              background: loading ? "#99f6e4" : "#0d9488",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              transition: "background 0.15s, transform 0.12s",
              letterSpacing: "0.01em",
            }}
          >
            {loading ? <><IcSpin/> Signing in…</> : "Sign In"}
          </button>

          {/* Thin divider */}
          <div style={{ height: "1px", background: "#e2e8f0", margin: "24px 0 20px" }}/>

          {/* Need an account */}
          <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
            Need an account?{" "}
            <button
              type="button"
              className="ns-lf-need"
              onClick={() => setShowContact(v => !v)}
              style={{
                background: "none", border: "none",
                fontSize: 13, color: "#0d9488",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                padding: 0, transition: "color 0.15s",
              }}
            >
              Contact your system administrator
            </button>
            {showContact && (
              <div style={{
                marginTop: 10, padding: "10px 14px",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, fontSize: 12.5, color: "#166534",
                lineHeight: 1.6, textAlign: "left",
              }}>
                Please ask your system administrator to create an account for you. They can add new staff accounts from the dashboard under <strong>Staff Management</strong>.
              </div>
            )}
          </div>

          {/* JWT trust */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 7, marginBottom: 28,
          }}>
            <IcShield/>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              Secured with JWT — role-based access control enforced
            </span>
          </div>

          {/* Copyright */}
          <div style={{
            textAlign: "center",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, color: "#cbd5e1",
            letterSpacing: "0.04em",
          }}>
            © 2026 NeuroSight · All rights reserved
          </div>

        </div>
      </div>
    </div>

    {/* ── Forgot password modal ── */}
    {fgtOpen && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }} onClick={e => { if (e.target === e.currentTarget) setFgtOpen(false); }}>
        <div style={{
          background: "#fff", borderRadius: 14, padding: "32px 28px",
          width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {fgtDone ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Check your inbox</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                  If <strong>{fgtEmail}</strong> is registered, you will receive a password reset link shortly.
                </p>
              </div>
              <button
                onClick={() => setFgtOpen(false)}
                style={{
                  width: "100%", padding: "10px", background: "#0d9488",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Reset your password</h3>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                Enter your registered email address and we will send you a reset link.
              </p>

              {fgtErr && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 8, padding: "9px 12px",
                  fontSize: 12.5, color: "#b91c1c", marginBottom: 14,
                }}>
                  <IcAlert/><span>{fgtErr}</span>
                </div>
              )}

              <label style={{
                display: "block", fontSize: 10, fontWeight: 600,
                color: "#64748b", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 6,
              }}>
                Email address
              </label>
              <input
                type="email"
                value={fgtEmail}
                onChange={e => setFgtEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleForgotSubmit()}
                placeholder="you@neurosight.ai"
                autoFocus
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #d1d5db", borderRadius: 8,
                  fontSize: 13.5, color: "#0f172a",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none", marginBottom: 18, boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setFgtOpen(false)}
                  style={{
                    flex: 1, padding: "10px", background: "#f1f5f9",
                    color: "#475569", border: "none", borderRadius: 8,
                    fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotSubmit}
                  disabled={fgtLoading}
                  style={{
                    flex: 1, padding: "10px",
                    background: fgtLoading ? "#99f6e4" : "#0d9488",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontSize: 13.5, fontWeight: 600,
                    cursor: fgtLoading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {fgtLoading ? <><IcSpin/> Sending…</> : "Send reset link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}