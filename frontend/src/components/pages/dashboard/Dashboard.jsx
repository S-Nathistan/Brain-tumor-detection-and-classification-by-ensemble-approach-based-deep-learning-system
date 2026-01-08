import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { removeToken, api } from "../../../util";

function TopNav({ onToggleSidebar }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-600" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="text-xl font-bold text-indigo-700 tracking-tight">NeuroSight</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 shadow-sm">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            className="bg-transparent outline-none text-sm text-gray-600 w-72"
            placeholder="Search patients or reports..."
          />
        </div>
        <button className="text-gray-600 hover:text-indigo-600 transition">🔔</button>
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-200">A</div>
      </div>
    </div>
  );
}

function Sidebar({ collapsed, user }) {
  const LinkItem = ({ to, label, indent = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"} ${indent ? "ml-4" : ""}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <aside className={`bg-white w-72 border-r p-5 ${collapsed ? "hidden md:block" : "block"}`}>
      <nav className="space-y-3 text-sm">
        {user?.role === "Admin" && <LinkItem to="/" label="Dashboard" />}
        <div className="text-gray-600 mt-2">Patient Records</div>
        <LinkItem to="/patients" label="All Patients" indent />
        <LinkItem to="/patients/new" label="Add New Patient" indent />
        <div className="text-gray-600 mt-2">Image Analysis</div>
        <LinkItem to="/image/upload" label="Upload MRI" indent />
        <LinkItem to="/image/results" label="Classification Results" indent />
        <div className="text-gray-600 mt-2">Report Management</div>
        <LinkItem to="/reports/upload" label="Upload Report" indent />
        <LinkItem to="/reports/history" label="Report History" indent />
        <div className="text-gray-600 mt-2">System Management</div>
        <LinkItem to="/system/audit-logs" label="Audit Logs" indent />
        <LinkItem to="/system/user-roles" label="User Roles" indent />
        <div className="text-gray-600 mt-2">Staff Management</div>
        <LinkItem to="/staff" label="All Staffs" indent />
        <LinkItem to="/staff/new" label="Add New Staff" indent />

        <div className="mt-6">
          <button
            onClick={() => {
              removeToken();
              window.location.href = "/";
            }}
            className="w-full text-left text-red-600 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api("/auth/me").then(setUser).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} user={user} />
        <main className="flex-1 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Role-Based Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Administrative overview and system activity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white font-medium">
                  {user ? user.role : "Loading..."}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
