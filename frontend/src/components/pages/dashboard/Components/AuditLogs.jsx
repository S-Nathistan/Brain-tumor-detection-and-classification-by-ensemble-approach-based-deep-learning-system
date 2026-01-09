import { useState, useMemo } from 'react';

// Mock Data
const MOCK_LOGS = [
  { id: 1, action: "User Login", user: "Dr. Sarah Miller", role: "Clinician", ip: "192.168.1.45", status: "Success", timestamp: "2026-01-09T08:30:00", details: "Successful login via web portal" },
  { id: 2, action: "MRI Upload", user: "Dr. Sarah Miller", role: "Clinician", ip: "192.168.1.45", status: "Success", timestamp: "2026-01-09T08:45:12", details: "Uploaded scan_patient_4022.dcm" },
  { id: 3, action: "Model Inference", user: "System", role: "AI Engine", ip: "localhost", status: "Success", timestamp: "2026-01-09T08:45:15", details: "Classification: Glioma (98% confidence)" },
  { id: 4, action: "Patient Record Created", user: "Admin User", role: "Admin", ip: "192.168.1.10", status: "Success", timestamp: "2026-01-09T09:12:00", details: "Created record for ID: PT-2024-089" },
  { id: 5, action: "Failed Login Attempt", user: "unknown", role: "Unknown", ip: "45.2.10.99", status: "Failed", timestamp: "2026-01-09T09:20:05", details: "Invalid password for user: admin" },
  { id: 6, action: "User Role Update", user: "Admin User", role: "Admin", ip: "192.168.1.10", status: "Warning", timestamp: "2026-01-09T10:00:00", details: "Elevated permissions for user: j.doe" },
  { id: 7, action: "System Backup", user: "System", role: "System", ip: "localhost", status: "Success", timestamp: "2026-01-09T12:00:00", details: "Daily database backup completed (450MB)" },
  { id: 8, action: "Report Download", user: "Dr. John Smith", role: "Neurologist", ip: "192.168.1.50", status: "Success", timestamp: "2026-01-09T13:15:30", details: "Downloaded report_PT-2024-055.pdf" },
  { id: 9, action: "API Error", user: "System", role: "System", ip: "localhost", status: "Failed", timestamp: "2026-01-09T14:10:22", details: "Timeout connecting to notification service" },
  { id: 10, action: "Logout", user: "Dr. Sarah Miller", role: "Clinician", ip: "192.168.1.45", status: "Success", timestamp: "2026-01-09T17:00:00", details: "User session terminated" },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All" || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Success": return "bg-green-100 text-green-700 border-green-200";
      case "Failed": return "bg-red-100 text-red-700 border-red-200";
      case "Warning": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Track and monitor all system activities and security events.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search logs by action, user, or details..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {["All", "Success", "Warning", "Failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${statusFilter === status
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap font-mono text-slate-500 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{log.user}</div>
                      <div className="text-xs text-slate-400">{log.role}</div>
                    </td>
                    <td className="p-4 font-medium">{log.action}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{log.ip}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>No logs found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Static for now) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Showing {filteredLogs.length} of {MOCK_LOGS.length} results</span>
          <div className="flex gap-1">
            <button disabled className="px-3 py-1 border rounded bg-white text-slate-300 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border rounded bg-white hover:bg-slate-50 text-slate-600 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
