// import { useEffect, useState } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import LoginForm from "./components/pages/login/LoginForm";
// import DashboardLayout from "./components/pages/dashboard/Dashboard";
// import DashboardHome from "./components/pages/dashboard/Components/DashboardHome";
// import AllPatients from "./components/pages/dashboard/Components/AllPatients";
// import AddNewPatient from "./components/pages/dashboard/Components/AddNewPatient";
// import UploadMRI from "./components/pages/dashboard/Components/UploadMRI";
// import ClassificationResults from "./components/pages/dashboard/Components/ClassificationResults";
// import AuditLogs from "./components/pages/dashboard/Components/AuditLogs";
// import UserRoles from "./components/pages/dashboard/Components/UserRoles";
// import AllStaffs from "./components/pages/dashboard/Components/AllStaffs";
// import AddNewStaff from "./components/pages/dashboard/Components/AddNewStaff";
// import PersonalizedSettings from "./components/pages/dashboard/Components/PersonalizedSettings";
// import TreatmentPlan from "./components/pages/dashboard/Components/TreatmentPlan";
// import ResultViewer from "./components/ResultViewer";
// import { clearAuth, fetchCurrentUser, getCurrentUser, getToken } from "./util";

// function RoleGuard({ user, allowedRoles, children }) {
//   if (!user) return <Navigate to="/login" replace />;
//   if (!allowedRoles.includes(user.role)) return <Navigate to="/forbidden" replace />;
//   return children;
// }

// function Forbidden() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
//       <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
//         <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
//         <p className="mt-3 text-slate-600">Your role does not have permission to access this page.</p>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   const [authed, setAuthed] = useState(!!getToken());
//   const [user, setUser] = useState(getCurrentUser());
//   const [sessionReady, setSessionReady] = useState(false);

//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       setAuthed(false);
//       setUser(null);
//       setSessionReady(true);
//       return;
//     }

//     fetchCurrentUser()
//       .then((me) => {
//         setAuthed(true);
//         setUser(me);
//       })
//       .catch(() => {
//         clearAuth();
//         setAuthed(false);
//         setUser(null);
//       })
//       .finally(() => setSessionReady(true));
//   }, []);

//   const handleLogin = (loggedInUser) => {
//     setAuthed(true);
//     setUser(loggedInUser || getCurrentUser());
//   };

//   const handleLogout = () => {
//     clearAuth();
//     setAuthed(false);
//     setUser(null);
//   };

//   if (!sessionReady) {
//     return <div className="min-h-screen grid place-items-center text-slate-600">Loading session...</div>;
//   }

//   return (
//     <BrowserRouter>
//       <Routes>
//         {authed ? (
//           <>
//             <Route path="/" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
//               <Route index element={<DashboardHome />} />
//               <Route path="patients">
//                 <Route index element={<AllPatients />} />
//                 <Route path="new" element={<AddNewPatient />} />
//               </Route>
//               <Route path="image">
//                 <Route path="upload" element={<UploadMRI />} />
//                 <Route path="results" element={<ClassificationResults />} />
//               </Route>
//               <Route path="system">
//                 <Route
//                   path="audit-logs"
//                   element={
//                     <RoleGuard user={user} allowedRoles={["Super Admin", "Admin"]}>
//                       <AuditLogs />
//                     </RoleGuard>
//                   }
//                 />
//                 <Route
//                   path="user-roles"
//                   element={
//                     <RoleGuard user={user} allowedRoles={["Super Admin", "Admin"]}>
//                       <UserRoles />
//                     </RoleGuard>
//                   }
//                 />
//               </Route>
//               <Route path="staff">
//                 <Route
//                   index
//                   element={
//                     <RoleGuard user={user} allowedRoles={["Super Admin", "Admin"]}>
//                       <AllStaffs />
//                     </RoleGuard>
//                   }
//                 />
//                 <Route
//                   path="new"
//                   element={
//                     <RoleGuard user={user} allowedRoles={["Super Admin", "Admin"]}>
//                       <AddNewStaff />
//                     </RoleGuard>
//                   }
//                 />
//               </Route>
//               <Route path="results/:id" element={<ResultViewer />} />
//               <Route path="settings" element={<PersonalizedSettings />} />
//               <Route path="treatment-plans" element={<TreatmentPlan />} />
//             </Route>
//             <Route path="/forbidden" element={<Forbidden />} />
//             <Route path="/login" element={<Navigate to="/" replace />} />
//             <Route path="/signup" element={<Navigate to="/" replace />} />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </>
//         ) : (
//           <>
//             <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
//             <Route path="/forbidden" element={<Navigate to="/login" replace />} />
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </>
//         )}
//       </Routes>
//     </BrowserRouter>
//   );
// }


import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Apply saved theme + density before first render
;(function () {
  const pref = localStorage.getItem("ns-theme") || "light";
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-density", localStorage.getItem("ns-density") || "comfortable");
  if (dark) {
    const DARK = { "--ns-bg":"#080f1a","--ns-surface":"#0f172a","--ns-surface-2":"#1e293b","--ns-text":"#f1f5f9","--ns-text-2":"#94a3b8","--ns-text-3":"#475569","--ns-border":"#1e293b","--ns-border-2":"#334155" };
    Object.entries(DARK).forEach(([k, v]) => root.style.setProperty(k, v));
  }
}());

import LoginForm from "./components/pages/login/LoginForm";
import SetPassword from "./components/pages/SetPassword";
import DashboardLayout from "./components/layout/Dashboard";
import DashboardHome from "./components/pages/dashboard/Components/DashboardHome";
import AllPatients from "./components/pages/dashboard/Components/AllPatients";
import PatientDetail from "./components/pages/dashboard/Components/PatientDetail";
import AddNewPatient from "./components/pages/dashboard/Components/AddNewPatient";
import UploadMRI from "./components/pages/dashboard/Components/UploadMRI";
import ClassificationResults from "./components/pages/dashboard/Components/ClassificationResults";
import AuditLogs from "./components/pages/dashboard/Components/AuditLogs";
import AllStaffs from "./components/pages/dashboard/Components/AllStaffs";
import AddNewStaff from "./components/pages/dashboard/Components/AddNewStaff";
import PersonalizedSettings from "./components/pages/dashboard/Components/PersonalizedSettings";
// import TreatmentPlan from "./components/pages/dashboard/Components/TreatmentPlan"; // hidden — integrated into patient records
import ResultViewer from "./components/ResultViewer";
import { clearAuth, fetchCurrentUser, getCurrentUser, getToken } from "./util";

function RoleGuard({ user, allowedRoles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return children;
}

function Forbidden() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
      <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:14, padding:"48px 40px", textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"#0f172a", fontSize:20, fontWeight:700, marginBottom:8 }}>Access Denied</h2>
        <p style={{ color:"#64748b", fontSize:14 }}>Your role does not have permission to access this page.</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#040c16", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:22, fontWeight:700, color:"#e2e8f0" }}>
        NEURO<span style={{ color:"#2dd4bf" }}>SIGHT</span>
      </div>
      <div style={{ width:28, height:28, border:"2px solid #2dd4bf", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function UserRoles() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">User Roles</h1>
      <p className="text-slate-500 text-sm mb-6">Role definitions and access level reference</p>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col gap-3">
          {[
            { role:"Super Admin", desc:"Full system access — all features, settings, staff management, and audit logs", color:"#ede9fe", text:"#5b21b6" },
            { role:"Admin",       desc:"Manage staff accounts, view audit logs, configure system settings", color:"#dbeafe", text:"#1e40af" },
            { role:"Clinician",   desc:"View and manage patient records, upload MRI scans, create treatment plans", color:"#d1fae5", text:"#065f46" },
            { role:"Assistant",   desc:"Register new patients, view patient records, manage appointments", color:"#fef3c7", text:"#92400e" },
          ].map(item => (
            <div key={item.role} style={{ borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 18px", background:item.color }}>
                <div style={{ fontWeight:700, fontSize:13, color:item.text, minWidth:120 }}>{item.role}</div>
                <div style={{ fontSize:13, color:"#475569" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder for pages not yet added
function ComingSoon({ name }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">{name}</h2>
      <p className="text-slate-400 text-sm">This page is being set up. Add the component file to enable it.</p>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [user, setUser] = useState(getCurrentUser());
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthed(false); setUser(null); setSessionReady(true); return; }
    fetchCurrentUser()
      .then(me => { setAuthed(true); setUser(me); })
      .catch(() => { clearAuth(); setAuthed(false); setUser(null); })
      .finally(() => setSessionReady(true));
  }, []);

  const handleLogin = (u) => { setAuthed(true); setUser(u || getCurrentUser()); };
  const handleLogout = () => { clearAuth(); setAuthed(false); setUser(null); };

  if (!sessionReady) return <LoadingScreen/>;

  return (
    <BrowserRouter>
      <Routes>
        {authed ? (
          <>
            <Route path="/" element={<DashboardLayout user={user} onLogout={handleLogout} onUserUpdate={setUser}/>}>
              <Route index element={<DashboardHome/>}/>

              <Route path="patients">
                <Route index element={<AllPatients/>}/>
                <Route path=":id" element={<PatientDetail/>}/>
                <Route path="new" element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Clinician","Assistant"]}>
                    <AddNewPatient/>
                  </RoleGuard>
                }/>
              </Route>

              <Route path="image">
                <Route path="upload" element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Clinician","Assistant"]}>
                    <UploadMRI/>
                  </RoleGuard>
                }/>
                <Route path="results" element={<ClassificationResults/>}/>
              </Route>

              {/* <Route path="treatment-plans" element={<TreatmentPlan/>}/> */}{/* hidden — integrated into patient records */}

              <Route path="blockchain" element={<ComingSoon name="Blockchain Records"/>}/>
              <Route path="mobile-enrollment" element={
                <RoleGuard user={user} allowedRoles={["Super Admin","Clinician","Assistant"]}>
                  <ComingSoon name="Patient Mobile Enrollment"/>
                </RoleGuard>
              }/>
              <Route path="patient-alerts" element={
                <RoleGuard user={user} allowedRoles={["Super Admin","Clinician","Assistant"]}>
                  <ComingSoon name="Patient Alerts"/>
                </RoleGuard>
              }/>

              <Route path="system">
                <Route path="audit-logs" element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Admin"]}>
                    <AuditLogs/>
                  </RoleGuard>
                }/>
                <Route path="user-roles" element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Admin"]}>
                    <UserRoles/>
                  </RoleGuard>
                }/>
              </Route>

              <Route path="staff">
                <Route index element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Admin"]}>
                    <AllStaffs/>
                  </RoleGuard>
                }/>
                <Route path="new" element={
                  <RoleGuard user={user} allowedRoles={["Super Admin","Admin"]}>
                    <AddNewStaff/>
                  </RoleGuard>
                }/>
              </Route>

              <Route path="results/:id" element={<ResultViewer/>}/>
              <Route path="settings" element={<PersonalizedSettings/>}/>
            </Route>

            <Route path="/forbidden" element={<Forbidden/>}/>
            <Route path="/set-password" element={<SetPassword/>}/>
            <Route path="/login" element={<Navigate to="/" replace/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginForm onLogin={handleLogin}/>}/>
            <Route path="/set-password" element={<SetPassword/>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}