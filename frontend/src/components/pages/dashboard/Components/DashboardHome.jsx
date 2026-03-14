import React, { useEffect, useState } from 'react';
import { api } from '../../../../util';

export default function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const s = await api('/dashboard/summary');
        const l = await api('/dashboard/audit-logs');
        if (!mounted) return;
        setSummary(s);
        setLogs(l);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="text-[13px] text-gray-500 mb-5 font-light">Total Users Breakdown</div>
            {loading ? (
              <div className="text-3xl font-extrabold text-[#5644ea]">—</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {summary?.total_users && Object.entries(summary.total_users).map(([role, count]) => (
                  <div key={role} className="bg-[#f3f5fd] py-5 px-4 rounded-xl text-center">
                    <div className="text-[22px] font-bold text-[#523bea]">{count}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mt-1">{role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-8">
            <button className="bg-[#5644ea] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#4233cc] transition" onClick={() => window.location.href = '/staff'}>Manage Users</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-gray-500">Active Sessions</div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {loading ? (
              <div className="text-3xl font-extrabold text-gray-900">—</div>
            ) : (
              <div>
                <div className="text-3xl font-extrabold text-gray-900">
                  {summary?.active_sessions ? Object.values(summary.active_sessions).reduce((sum, count) => sum + count, 0) : 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Currently logged-in users</div>
              </div>
            )}
          </div>
          <div className="mt-6">
            <button className="w-full bg-[#2563eb] text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition" onClick={() => window.location.href = '/system/audit-logs'}>View Details</button>
          </div>
        </div>
      </div>

      {/* CLINICAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-indigo-100">
          <div className="text-sm text-indigo-500 mb-2 font-black uppercase tracking-widest">Total Patients</div>
          {loading ? <div className="text-3xl font-extrabold text-indigo-700">—</div> : (
            <div className="flex items-end gap-3">
              <div className="text-4xl font-extrabold text-slate-800">{summary?.total_patients || 0}</div>
              <div className="text-xs text-slate-400 font-bold mb-1">Registered</div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-amber-100 relative overflow-hidden">
          <div className="text-sm text-amber-500 mb-2 font-black uppercase tracking-widest relative z-10">Active In-Hospital</div>
          {loading ? <div className="text-3xl font-extrabold text-amber-700">—</div> : (
            <div className="flex items-end gap-3 relative z-10">
              <div className="text-4xl font-extrabold text-slate-800">{summary?.active_patients || 0}</div>
              <div className="text-xs text-amber-600 font-bold mb-1 bg-amber-50 px-2 py-0.5 rounded">Pending Discharge</div>
            </div>
          )}
          <div className="absolute -bottom-4 -right-4 text-[80px] opacity-5">🏥</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-emerald-100">
          <div className="text-sm text-emerald-500 mb-2 font-black uppercase tracking-widest">Total Scans Analyzed</div>
          {loading ? <div className="text-3xl font-extrabold text-emerald-700">—</div> : (
            <div className="flex items-end gap-3">
              <div className="text-4xl font-extrabold text-slate-800">{summary?.total_scans || 0}</div>
              <div className="text-xs text-emerald-600 font-bold mb-1 bg-emerald-50 px-2 py-0.5 rounded">Predictions Complete</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Recent Audit Logs</h3>
            <button className="text-sm text-indigo-600" onClick={() => { setLoading(true); api('/dashboard/audit-logs').then(d => setLogs(d)).catch(() => { }).finally(() => setLoading(false)); }}>Refresh</button>
          </div>
          <ul className="mt-4 space-y-3">
            {loading ? (
              <li className="text-gray-400">Loading logs…</li>
            ) : logs.length === 0 ? (
              <li className="text-gray-400">No recent logs</li>
            ) : (
              logs.map((l, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">●</div>
                  <div>
                    <div className="text-sm text-gray-700">{l.message}</div>
                    <div className="text-xs text-gray-400">{new Date(l.timestamp).toLocaleString()}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="text-center mt-4">
            <button className="text-sm text-indigo-600">View All Logs</button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
            <h4 className="font-semibold text-gray-700 uppercase tracking-widest text-sm mb-4">Admin Tools</h4>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="p-3 rounded-md border hover:shadow text-left text-sm text-gray-700 hover:bg-gray-50 transition font-bold" onClick={() => window.location.href = '/staff'}>Manage Users</button>
              <button className="p-3 rounded-md border hover:shadow text-left text-sm text-gray-700 hover:bg-gray-50 transition font-bold" onClick={() => window.location.href = '/system/user-roles'}>User Roles</button>
              <button className="p-3 rounded-md border hover:shadow text-left text-sm text-gray-700 hover:bg-gray-50 transition font-bold" onClick={() => window.location.href = '/reports/history'}>Report History</button>
              <button className="p-3 rounded-md border hover:shadow text-left text-sm text-gray-700 hover:bg-gray-50 transition font-bold" onClick={() => window.location.href = '/system/audit-logs'}>Monitor Logs</button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 text-white flex-1 relative overflow-hidden">
            <h4 className="font-black text-blue-400 uppercase tracking-widest text-sm mb-4 relative z-10">AI Diagnostic Labels</h4>
            {loading ? <div className="text-sm font-bold opacity-50 relative z-10">Loading classifications...</div> : (
              <div className="space-y-3 relative z-10">
                {summary?.tumour_breakdown && Object.keys(summary.tumour_breakdown).length > 0 ? (
                  Object.entries(summary.tumour_breakdown).map(([label, count]) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="font-bold tracking-tight text-slate-300">{label}</span>
                      <span className="bg-slate-800 px-3 py-1 rounded text-white font-mono font-bold border border-slate-700">{count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm font-bold italic">No diagnostics recorded yet.</div>
                )}
              </div>
            )}
            <div className="absolute -bottom-8 -right-8 text-[120px] opacity-10">🧠</div>
          </div>
        </div>
      </div>
    </div>
  );
}
