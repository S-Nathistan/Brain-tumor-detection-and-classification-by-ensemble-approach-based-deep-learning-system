import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../util";

const STAFF_ROLES = ["Super Admin", "Admin", "Clinician", "Assistant"];

const ROLE_COLORS = {
  "Super Admin": { bg: "#ede9fe", text: "#6d28d9" },
  "Admin":       { bg: "#dbeafe", text: "#1d4ed8" },
  "Clinician":   { bg: "#d1fae5", text: "#065f46" },
  "Assistant":   { bg: "#fef3c7", text: "#92400e" },
};

function parseApiError(err, fallback) {
  try {
    const parsed = JSON.parse(err?.message || "{}");
    const detail = parsed.detail;
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg || String(d)).join("; ") || fallback;
    }
    return detail || fallback;
  } catch {
    return err?.message || fallback;
  }
}

const inp = {
  border: "1px solid var(--ns-border)", borderRadius: 8, padding: "8px 12px",
  fontSize: 13, color: "var(--ns-text)", fontFamily: "'DM Sans', sans-serif",
  outline: "none", background: "var(--ns-surface)",
};
const sel = { ...inp, cursor: "pointer" };

export default function AllStaffs() {
  const navigate = useNavigate();
  const [staffs, setStaffs]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editUser, setEditUser]     = useState(null);
  const [viewUser, setViewUser]     = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterRole, setFilterRole]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { fetchStaffs(); }, []);

  const fetchStaffs = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api("/auth/users");
      setStaffs(data);
    } catch (err) {
      setError(parseApiError(err, "Failed to load staff."));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    setTogglingId(staff.id);
    try {
      const saved = await api(`/auth/users/${staff.id}`, {
        method: "PUT",
        body: { status: !staff.status },
      });
      setStaffs(prev => prev.map(s => s.id === staff.id ? saved : s));
    } catch (err) {
      alert(parseApiError(err, "Failed to update status."));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api(`/auth/users/${staffId}`, { method: "DELETE" });
      setStaffs(staffs.filter(s => s.id !== staffId));
    } catch (err) {
      alert(parseApiError(err, "Failed to delete user."));
    }
  };

  const filteredStaffs = useMemo(() => staffs.filter(staff => {
    const matchesName   = (staff.name  || "").toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesEmail  = (staff.email || "").toLowerCase().includes(searchEmail.trim().toLowerCase());
    const matchesRole   = filterRole   === "all" || staff.role === filterRole;
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? !!staff.status : !staff.status);
    return matchesName && matchesEmail && matchesRole && matchesStatus;
  }), [staffs, searchName, searchEmail, filterRole, filterStatus]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>
      Loading staff directory…
    </div>
  );
  if (error) return (
    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "16px 20px", color: "#b91c1c", fontSize: 13 }}>
      {error}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`.row-hover:hover { background: var(--ns-bg) !important; } .act-btn:hover { opacity: 0.8; }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ns-text)", margin: 0 }}>Staff Directory</h1>
          <p style={{ fontSize: 13, color: "var(--ns-text-2)", margin: "4px 0 0" }}>{staffs.length} registered staff member{staffs.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={fetchStaffs} style={{ ...inp, cursor: "pointer", padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            Refresh
          </button>
          <button onClick={() => navigate("/staff/new")} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Add New Staff
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Name</label>
          <input style={{ ...inp, width: "100%", boxSizing: "border-box" }} placeholder="Search by name…" value={searchName} onChange={e => setSearchName(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Email</label>
          <input style={{ ...inp, width: "100%", boxSizing: "border-box" }} placeholder="Search by email…" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Role</label>
          <select style={sel} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", marginBottom: 5 }}>Status</label>
          <select style={sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button onClick={() => { setSearchName(""); setSearchEmail(""); setFilterRole("all"); setFilterStatus("all"); }}
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
                {["Staff ID", "Name", "Mobile", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", textAlign: h === "Actions" ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px 0", textAlign: "center", color: "var(--ns-text-3)", fontSize: 13 }}>No staff members found.</td>
                </tr>
              ) : filteredStaffs.map((staff, i) => {
                const rc = ROLE_COLORS[staff.role] || { bg: "#f1f5f9", text: "#475569" };
                return (
                  <tr key={staff.id} className="row-hover" style={{ borderBottom: i < filteredStaffs.length - 1 ? "1px solid var(--ns-border)" : "none" }}>
                    <td style={{ padding: "13px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#0d9488", fontWeight: 600 }}>#{staff.id}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{staff.name || "N/A"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--ns-text-2)", fontFamily: "'DM Mono', monospace" }}>{staff.mobile || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--ns-text-2)" }}>{staff.email}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.text, padding: "3px 10px", borderRadius: 20 }}>{staff.role}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: staff.status ? "#dcfce7" : "#f1f5f9", color: staff.status ? "#15803d" : "#94a3b8", padding: "3px 10px", borderRadius: 20 }}>
                        {staff.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <button className="act-btn" onClick={() => setViewUser(staff)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4", cursor: "pointer" }}>
                          View
                        </button>
                        <button className="act-btn" onClick={() => setEditUser(staff)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #dbeafe", cursor: "pointer" }}>
                          Edit
                        </button>
                        <button
                          className="act-btn"
                          onClick={() => handleToggleStatus(staff)}
                          disabled={togglingId === staff.id}
                          style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, cursor: togglingId === staff.id ? "not-allowed" : "pointer", opacity: togglingId === staff.id ? 0.6 : 1, background: staff.status ? "#fffbeb" : "#f0fdfa", color: staff.status ? "#b45309" : "#0d9488", border: `1px solid ${staff.status ? "#fde68a" : "#99f6e4"}` }}>
                          {togglingId === staff.id ? "…" : staff.status ? "Deactivate" : "Activate"}
                        </button>
                        <button className="act-btn" onClick={() => handleDelete(staff.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />}

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={async (updatedData) => {
          try {
            const saved = await api(`/auth/users/${updatedData.id}`, {
              method: "PUT",
              body: { name: updatedData.name, mobile: updatedData.mobile, role: updatedData.role, status: updatedData.status },
            });
            setStaffs(staffs.map(s => s.id === updatedData.id ? saved : s));
            setEditUser(null);
          } catch (err) {
            alert(parseApiError(err, "Failed to update user."));
          }
        }} />
      )}
    </div>
  );
}

function ViewUserModal({ user, onClose }) {
  const rc = ROLE_COLORS[user.role] || { bg: "#f1f5f9", text: "#475569" };

  const sectionHead = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ns-text-3)", padding: "8px 16px", background: "var(--ns-bg)", borderBottom: "1px solid var(--ns-border)", borderTop: "1px solid var(--ns-border)" };
  const row = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 16px", borderBottom: "1px solid var(--ns-border)" };
  const key = { fontSize: 12, color: "var(--ns-text-3)", fontWeight: 600, flexShrink: 0 };
  const val = { fontSize: 13, color: "var(--ns-text)", fontWeight: 500, textAlign: "right", marginLeft: 12 };
  const na  = { fontSize: 13, color: "#cbd5e1", fontStyle: "italic", textAlign: "right" };

  const V = ({ v, mono }) => v
    ? <span style={{ ...val, fontFamily: mono ? "'DM Mono', monospace" : undefined }}>{v}</span>
    : <span style={na}>—</span>;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--ns-surface)", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--ns-border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--ns-surface)", zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ns-text)" }}>Staff Profile</div>
            <div style={{ fontSize: 12, color: "var(--ns-text-3)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>#{user.id}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--ns-text-3)", lineHeight: 1 }}>×</button>
        </div>

        {/* Personal & Identity */}
        <div style={sectionHead}>Personal &amp; Identity</div>
        <div style={row}><span style={key}>Full Name</span><V v={user.name} /></div>
        <div style={row}><span style={key}>Gender</span><V v={user.gender} /></div>

        {/* Professional Details */}
        <div style={sectionHead}>Professional Details</div>
        <div style={row}>
          <span style={key}>Role</span>
          <span style={{ fontSize: 12, fontWeight: 600, background: rc.bg, color: rc.text, padding: "3px 10px", borderRadius: 20 }}>{user.role}</span>
        </div>
        <div style={row}><span style={key}>Department</span><V v={user.department} /></div>
        <div style={row}><span style={key}>Qualification</span><V v={user.qualification} /></div>
        <div style={row}><span style={key}>License / Reg. No.</span><V v={user.license_number} mono /></div>

        {/* Contact & Access */}
        <div style={sectionHead}>Contact &amp; Access</div>
        <div style={row}><span style={key}>Email</span><V v={user.email} /></div>
        <div style={row}><span style={key}>Mobile</span><V v={user.mobile} mono /></div>
        <div style={{ ...row, borderBottom: "none" }}>
          <span style={key}>Account Status</span>
          <span style={{ fontSize: 12, fontWeight: 600, background: user.status ? "#dcfce7" : "#f1f5f9", color: user.status ? "#15803d" : "#94a3b8", padding: "3px 10px", borderRadius: 20 }}>
            {user.status ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--ns-border)" }}>
          <button onClick={onClose}
            style={{ width: "100%", padding: "10px", border: "1px solid var(--ns-border)", borderRadius: 8, background: "var(--ns-surface)", color: "var(--ns-text-2)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: user.id, name: user.name || "", email: user.email,
    mobile: user.mobile || "", role: user.role, status: user.status ?? true,
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const fieldStyle = { border: "1px solid var(--ns-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "var(--ns-text)", background: "var(--ns-surface)" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--ns-text-2)", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--ns-surface)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--ns-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ns-text)" }}>Edit Staff Member</div>
            <div style={{ fontSize: 12, color: "var(--ns-text-3)", marginTop: 2 }}>{user.email}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--ns-text-3)", lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(formData); }} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Staff ID</label>
            <input style={{ ...fieldStyle, background: "#f8fafc", color: "#94a3b8" }} value={formData.id} disabled />
          </div>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input name="name" style={fieldStyle} value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={{ ...fieldStyle, background: "#f8fafc", color: "#94a3b8" }} value={formData.email} disabled />
          </div>
          <div>
            <label style={labelStyle}>Mobile</label>
            <input name="mobile" style={fieldStyle} value={formData.mobile} onChange={handleChange} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select name="role" style={{ ...fieldStyle, cursor: "pointer" }} value={formData.role} onChange={handleChange}>
              {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--ns-bg)", borderRadius: 8, border: "1px solid var(--ns-border)" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>Account Status</label>
            <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} id="status-toggle" />
              <div style={{
                width: 40, height: 22, borderRadius: 11,
                background: formData.status ? "#0d9488" : "#cbd5e1",
                position: "relative", transition: "background 0.2s", cursor: "pointer",
              }} onClick={() => setFormData(p => ({ ...p, status: !p.status }))}>
                <div style={{
                  position: "absolute", top: 3, left: formData.status ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: formData.status ? "#0d9488" : "#94a3b8" }}>
                {formData.status ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px", border: "1px solid var(--ns-border)", borderRadius: 8, background: "var(--ns-surface)", color: "var(--ns-text-2)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit"
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#0d9488", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
