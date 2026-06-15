import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getCurrentUser } from "../../../../util";

const AllPatients = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || { role: "Attendant", name: "Staff Member" };
  const isAdmin = currentUser.role === "Admin";

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [filterJoinedDate, setFilterJoinedDate] = useState('');
  const [filterDischargeDate, setFilterDischargeDate] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await api("/patients/");
      const mapped = data.map(p => ({
        ...p,
        hospitalId:    p.hospital_id,
        joinedDate:    p.current_joined_date ?? p.joined_date,
        dischargeDate: p.current_discharge_date ?? p.discharge_date,
        tumourType:    p.tumour_type,
        riskScore:     p.risk_score,
        assignedDoctor: p.assigned_doctor,
      }));
      setPatients(mapped);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient record?")) return;
    try {
      await api(`/patients/${id}`, { method: "DELETE" });
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete patient.");
    }
  };

  const handleUploadClick = (patient) => navigate('/image/upload', { state: { patient } });

  const filteredPatients = patients.filter(p => {
    const term          = searchTerm.toLowerCase();
    const matchesSearch = (p.hospitalId  || '').toLowerCase().includes(term)
                       || (p.name        || '').toLowerCase().includes(term)
                       || (p.tumourType  || '').toLowerCase().includes(term);
    const matchesType   = typeFilter === 'All' || (p.tumourType || '').toLowerCase() === typeFilter.toLowerCase();
    const matchesJoined    = !filterJoinedDate    || p.joinedDate    === filterJoinedDate;
    const matchesDischarge = !filterDischargeDate || p.dischargeDate === filterDischargeDate;
    return matchesSearch && matchesType && matchesJoined && matchesDischarge;
  });

  const inp = { border: "1px solid var(--ns-border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--ns-text)", fontFamily: "'DM Sans',sans-serif", outline: "none", background: "var(--ns-surface)" };
  const tumourBadge = (type) => {
    if (type === "No Tumour")      return { bg: "#d1fae5", text: "#065f46" };
    if (type === "Not Classified") return { bg: "#f1f5f9", text: "#475569" };
    return { bg: "#fef2f2", text: "#b91c1c" };
  };

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>
      Loading patient directory…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`.pat-row:hover{background:var(--ns-bg)!important} .act-btn:hover{opacity:.8}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Patient Directory</h1>
          <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>{patients.length} registered patient{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => navigate("/patients/new")} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Add New Patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Search Patient</label>
          <input type="text" placeholder="ID or Name…" style={{ ...inp, width: "100%", boxSizing: "border-box" }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Joined Date</label>
          <input type="date" style={{ ...inp, fontSize: 12 }} value={filterJoinedDate} onChange={e => setFilterJoinedDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Discharge Date</label>
          <input type="date" style={{ ...inp, fontSize: 12 }} value={filterDischargeDate} onChange={e => setFilterDischargeDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Tumour Type</label>
          <select style={{ ...inp, cursor: "pointer" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Glioma">Glioma</option>
            <option value="Meningioma">Meningioma</option>
            <option value="Pituitary">Pituitary</option>
            <option value="Not Classified">Not Classified</option>
            <option value="No Tumour">No Tumour</option>
          </select>
        </div>
        <button onClick={() => { setSearchTerm(""); setTypeFilter("All"); setFilterJoinedDate(""); setFilterDischargeDate(""); }}
          style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: "var(--ns-text-2)", background: "var(--ns-bg)", border: "1px solid var(--ns-border)", borderRadius: 8, cursor: "pointer" }}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--ns-bg)", borderBottom: "1px solid var(--ns-border)" }}>
                {["Patient ID", "Name", "Consultant", "Joined", "Discharge", "Risk", "Tumour Type", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", textAlign: h === "Actions" || h === "Risk" ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: "40px 0", textAlign: "center", color: "var(--ns-text-3)", fontSize: 13 }}>No matching patients found.</td></tr>
              ) : filteredPatients.map((p, i) => {
                const tb = tumourBadge(p.tumourType);
                return (
                  <tr key={p.id} className="pat-row" style={{ borderBottom: i < filteredPatients.length - 1 ? "1px solid var(--ns-border)" : "none" }}>
                    <td style={{ padding: "13px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#0d9488", fontWeight: 600 }}>{p.hospitalId}</td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{p.name}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: "var(--ns-surface-2)", color: "var(--ns-text-2)", padding: "3px 9px", borderRadius: 6, border: "1px solid var(--ns-border)" }}>{p.assignedDoctor || "Unassigned"}</span>
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--ns-text-3)", fontFamily: "'DM Mono',monospace" }}>{p.joinedDate}</td>
                    <td style={{ padding: "13px 14px" }}>
                      {p.dischargeDate === "Pending"
                        ? <span style={{ fontSize: 11, fontWeight: 600, background: "#fef9ee", color: "#92400e", padding: "3px 9px", borderRadius: 6 }}>Pending</span>
                        : <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{p.dischargeDate}</span>}
                    </td>
                    <td style={{ padding: "13px 14px", textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: "var(--ns-text)" }}>{p.riskScore}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: tb.bg, color: tb.text, padding: "3px 9px", borderRadius: 6 }}>{p.tumourType || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {!isAdmin && <button className="act-btn" onClick={() => handleUploadClick(p)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 7, background: "#f0fdfa", color: "#0d9488", border: "1px solid #ccfbf1", cursor: "pointer" }}>MRI</button>}
                        <button className="act-btn" onClick={() => navigate(`/patients/${p.id}`, { state: { mode: 'view' } })} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 7, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #dbeafe", cursor: "pointer" }}>View</button>
                        {!isAdmin && <button className="act-btn" onClick={() => navigate(`/patients/${p.id}`, { state: { mode: 'edit' } })} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 7, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer" }}>Edit</button>}
                        {!isAdmin && <button className="act-btn" onClick={() => handleDelete(p.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 7, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", cursor: "pointer" }}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllPatients;
