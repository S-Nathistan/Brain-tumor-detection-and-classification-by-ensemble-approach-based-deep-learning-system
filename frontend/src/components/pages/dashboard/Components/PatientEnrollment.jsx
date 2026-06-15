import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../util';

const STATUS_META = {
  active:  { bg: '#f0fdf4', border: '#bbf7d0', badge: '#16a34a', label: 'Active' },
  sent:    { bg: '#fffbeb', border: '#fde68a', badge: '#d97706', label: 'Link Sent' },
  pending: { bg: '#f8fafc', border: '#e2e8f0', badge: '#94a3b8', label: 'Pending' },
};

const METHOD_ICON = { email: '✉', sms: '💬', both: '✉ + 💬', none: '—' };

export default function PatientEnrollment() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/enrollment/');
      setEnrollments(Array.isArray(data) ? data : []);
    } catch {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.patient_name?.toLowerCase().includes(q) || e.hospital_id?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = { all: enrollments.length, active: 0, sent: 0, pending: 0 };
  enrollments.forEach(e => { if (counts[e.status] !== undefined) counts[e.status]++; });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Patient Enrollment</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Track which patients have been enrolled on the NeuroSight mobile app</div>
        </div>
        <button onClick={() => navigate('/patients')}
          style={{ fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 8, background: '#0d9488', color: '#fff', border: 'none', cursor: 'pointer' }}>
          + Enroll Patient
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { key: 'all',     label: 'Total',      bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
          { key: 'active',  label: 'Active',      bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
          { key: 'sent',    label: 'Link Sent',   bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
          { key: 'pending', label: 'Pending',     bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
        ].map(s => (
          <div key={s.key} onClick={() => setFilter(s.key)}
            style={{ padding: '12px 14px', background: s.bg, border: `1.5px solid ${filter === s.key ? s.color : s.border}`, borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{counts[s.key]}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: s.color, opacity: 0.75, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or hospital ID…"
          style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" }} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading enrollments…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', background: '#f8fafc', borderRadius: 14, border: '1px dashed #e2e8f0' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.7 }}>
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 10, fontWeight: 600 }}>
            {enrollments.length === 0 ? 'No patients enrolled yet' : 'No results for this filter'}
          </div>
          {enrollments.length === 0 && (
            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
              Go to a patient's Monitoring tab and click "Enroll" to get started.
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1.4fr 1.4fr', padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['Patient', 'Hospital ID', 'Status', 'Method', 'Enrolled', 'First Login'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>{h}</div>
            ))}
          </div>

          {filtered.map((e, i) => {
            const sm = STATUS_META[e.status] || STATUS_META.pending;
            return (
              <div key={e.id}
                onClick={() => navigate(`/patients/${e.patient_id}`, { state: { activeTab: 'monitoring' } })}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1.4fr 1.4fr', padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', background: '#fff', transition: 'background 0.1s' }}
                onMouseEnter={ev => ev.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={ev => ev.currentTarget.style.background = '#fff'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{e.patient_name}</div>
                  {e.email && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{e.email}</div>}
                </div>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#0d9488', fontWeight: 600, alignSelf: 'center' }}>{e.hospital_id}</div>
                <div style={{ alignSelf: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: sm.badge, color: '#fff' }}>{sm.label}</span>
                </div>
                <div style={{ fontSize: 12, alignSelf: 'center', color: '#64748b' }}>{METHOD_ICON[e.send_method] || '—'}</div>
                <div style={{ fontSize: 11, color: '#64748b', alignSelf: 'center', fontFamily: "'DM Mono',monospace" }}>{fmtDate(e.enrolled_at)}</div>
                <div style={{ fontSize: 11, color: e.first_login_at ? '#16a34a' : '#94a3b8', alignSelf: 'center', fontFamily: "'DM Mono',monospace", fontWeight: e.first_login_at ? 600 : 400 }}>
                  {e.first_login_at ? fmtDate(e.first_login_at) : 'Not yet'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Click a row to open the patient's Monitoring tab
      </div>
    </div>
  );
}
