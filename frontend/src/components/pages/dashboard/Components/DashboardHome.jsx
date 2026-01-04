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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-gray-100">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-3xl font-extrabold text-indigo-700 mt-2">{loading ? '—' : summary?.total_users ?? 0}</div>
          <div className="text-xs text-gray-400 mt-3">Registered users across all roles</div>
          <div className="mt-6">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow">Manage Users</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-gray-100">
          <div className="text-sm text-gray-500">Active Sessions</div>
          <div className="text-3xl font-extrabold text-indigo-700 mt-2">{loading ? '—' : summary?.active_sessions ?? 0}</div>
          <div className="text-xs text-gray-400 mt-3">Currently logged-in users</div>
          <div className="mt-6">
            <button className="bg-white text-indigo-700 px-4 py-2 rounded-md border border-indigo-100 hover:bg-indigo-50">View Details</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 border border-gray-100">
          <div className="text-sm text-gray-500">Pending Approvals</div>
          <div className="text-3xl font-extrabold text-indigo-700 mt-2">{loading ? '—' : summary?.pending_approvals ?? 0}</div>
          <div className="text-xs text-gray-400 mt-3">Requests awaiting administrative review</div>
          <div className="mt-6">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">Review Approvals</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Recent Audit Logs</h3>
            <button className="text-sm text-indigo-600" onClick={() => { setLoading(true); api('/dashboard/audit-logs').then(d=>setLogs(d)).catch(()=>{}).finally(()=>setLoading(false)); }}>Refresh</button>
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-700">Admin Tools</h4>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="p-3 rounded-md border hover:shadow">Manage Users</button>
            <button className="p-3 rounded-md border hover:shadow">System Settings</button>
            <button className="p-3 rounded-md border hover:shadow">Generate Reports</button>
            <button className="p-3 rounded-md border hover:shadow">Monitor Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
}
