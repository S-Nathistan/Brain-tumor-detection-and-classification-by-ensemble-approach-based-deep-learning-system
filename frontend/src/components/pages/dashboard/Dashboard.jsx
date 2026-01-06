// import { useState } from "react";
// import { NavLink, Outlet } from "react-router-dom";

// function TopNav({ onToggleSidebar }) {
//   return (
//     <div className="flex items-center justify-between py-3 px-4 border-b bg-white">
//       <div className="flex items-center gap-4">
//         <button className="md:hidden text-gray-600" onClick={onToggleSidebar}>
//           ☰
//         </button>
//         <div className="text-xl font-bold text-indigo-700 tracking-tight">NeuroSight</div>
//       </div>
//       <div className="flex items-center gap-4">
//         <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 shadow-sm">
//           <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
//             <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           <input
//             className="bg-transparent outline-none text-sm text-gray-600 w-72"
//             placeholder="Search patients or reports..."
//           />
//         </div>
//         <button className="text-gray-600 hover:text-indigo-600 transition">🔔</button>
//         <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-200">A</div>
//       </div>
//     </div>
//   );
// }

// function Sidebar({ collapsed }) {
//   const LinkItem = ({ to, label, indent = false }) => (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"} ${indent ? "ml-4" : ""}`
//       }
//     >
//       {label}
//     </NavLink>
//   );

//   return (
//     <aside className={`bg-white w-72 border-r p-5 ${collapsed ? "hidden md:block" : "block"}`}>
//       <nav className="space-y-3 text-sm">
//         <LinkItem to="/" label="Dashboard" />
//         <div className="text-gray-600 mt-2">Patient Records</div>
//         <LinkItem to="/patients" label="All Patients" indent />
//         <LinkItem to="/patients/new" label="Add New Patient" indent />
//         <div className="text-gray-600 mt-2">Image Analysis</div>
//         <LinkItem to="/image/upload" label="Upload MRI" indent />
//         <LinkItem to="/image/results" label="Classification Results" indent />
//         <div className="text-gray-600 mt-2">Report Management</div>
//         <LinkItem to="/reports/upload" label="Upload Report" indent />
//         <LinkItem to="/reports/history" label="Report History" indent />
//         <div className="text-gray-600 mt-2">System Management</div>
//         <LinkItem to="/system/audit-logs" label="Audit Logs" indent />
//         <LinkItem to="/system/user-roles" label="User Roles" indent />
//         <div className="mt-6">
//           <button className="w-full text-left text-red-600 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-50 transition">Logout</button>
//         </div>
//       </nav>
//     </aside>
//   );
// }

// export default function Dashboard() {
//   const [role, setRole] = useState("Admin");
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <TopNav onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
//       <div className="flex">
//         <Sidebar collapsed={sidebarCollapsed} />
//         <main className="flex-1 p-8">
//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-800">Role-Based Dashboard</h1>
//               <p className="text-sm text-gray-500 mt-1">Administrative overview and system activity</p>
//             </div>
//             {/* <div className="flex items-center gap-2">
//               {['Admin', 'Clinician', 'Attendant'].map((r) => (
//                 <button
//                   key={r}
//                   onClick={() => setRole(r)}
//                   className={`px-3 py-1.5 rounded-md text-sm ${role === r ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
//                   {r}
//                 </button>
//               ))}
//             </div> */}
//           </div>

//           <div className="mt-6">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

//==================================================================================================================================================================

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

// Standardized Corporate SVG Icons
const Icons = {
  Overview: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  Records: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Add: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  AI: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Staff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  System: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Notification: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

function Sidebar({ collapsed, role, onLogout }) {
  const NavItem = ({ to, label, Icon }) => (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm mb-1 ${isActive ? "bg-slate-800 text-white shadow-md font-medium" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
      <Icon />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <aside className={`bg-[#f8fafc] border-r min-h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="p-6 mb-4">
        <h1 className={`font-black text-slate-900 tracking-tighter text-xl ${collapsed ? "hidden" : "block"}`}>NEUROSIGHT <span className="text-blue-600">AI</span></h1>
      </div>
      
      <nav className="px-3 space-y-6">
        {/* DASHBOARD OVERVIEW */}
        <div>
          <NavItem to="/" label="Dashboard Overview" Icon={Icons.Overview} />
        </div>

        {/* CLINICAL DATA SECTION */}
        <div>
          <div className={`mb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${collapsed ? 'hidden' : 'block'}`}>Clinical Data</div>
          <NavItem to="/patients" label="All Patients" Icon={Icons.Records} />
          <NavItem to="/patients/new" label="Add New Patient" Icon={Icons.Add} />
        </div>

        {/* IMAGE ANALYSIS SECTION */}
        <div>
          <div className={`mb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${collapsed ? 'hidden' : 'block'}`}>Image Analysis</div>
          <NavItem to="/image/upload" label="Upload MRI" Icon={Icons.AI} />
          <NavItem to="/image/results" label="Classification Results" Icon={Icons.AI} />
        </div>

        {/* STAFF MANAGEMENT: Admin Only */}
        {role === "Admin" && (
          <div>
            <div className={`mb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${collapsed ? 'hidden' : 'block'}`}>Staff Management</div>
            <NavItem to="/staff" label="Staff Records" Icon={Icons.Staff} />
            <NavItem to="/staff/new" label="Add New Staff" Icon={Icons.Add} />
          </div>
        )}

        {/* SYSTEM MANAGEMENT: Admin Only */}
        {role === "Admin" && (
          <div>
            <div className={`mb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${collapsed ? 'hidden' : 'block'}`}>System Management</div>
            <NavItem to="/system/audit-logs" label="Audit Logs" Icon={Icons.System} />
          </div>
        )}

        {/* COMMUNICATIONS & SETTINGS */}
        <div>
          <div className={`mb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${collapsed ? 'hidden' : 'block'}`}>User Preferences</div>
          <NavItem to="/settings" label="Personalized Settings" Icon={Icons.Settings} />
          <NavItem to="/notifications" label="Notifications" Icon={Icons.Notification} />
          
          {/* LOGOUT BUTTON */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-lg transition-all text-sm text-red-600 hover:bg-red-50 font-medium"
          >
            <Icons.Logout />
            {!collapsed && <span>Logout Session</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  // Change "role" to "Admin", "Doctor", or "Attendant" to test the UI logic
  const [currentUser] = useState({ role: "Admin", name: "Super Admin" }); 

  const handleLogout = () => {
    // Add logout logic here (e.g., clear tokens)
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar collapsed={collapsed} role={currentUser.role} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        {/* Professional Top Header */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-white sticky top-0 z-40">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-6">
            {/* Global Search Bar */}
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="bg-transparent border-none outline-none text-xs w-64" placeholder="Search Hospital ID or Staff Name..." />
            </div>

            {/* Notification Badge */}
            <div className="relative cursor-pointer text-slate-400 hover:text-slate-900 transition-all">
               <Icons.Notification />
               <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{currentUser.name}</span>
                <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">{currentUser.role}</span>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-slate-200 border-2 border-white">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto bg-slate-50/20 flex-1">
          <Outlet context={{ currentUser }} />
        </main>
      </div>
    </div>
  );
}