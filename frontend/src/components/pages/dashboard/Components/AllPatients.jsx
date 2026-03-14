// import React from 'react';

// export default function AllPatients() {
//   return (
//     <div className="p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold text-gray-700">All Patients</h2>
//       <div className="mt-4 text-gray-600">hi</div>
//     </div>
//   );
// }


//============================================================================================

import React, { useState, useEffect } from 'react';
import { api } from "../../../../util";

const AllPatients = () => {
  const navigate = useNavigate();
  
  // FIXED ROLE: Locked to Attendant until Login Page is built
  const [currentUser] = useState({ role: "Attendant", name: "Staff Member" });

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await api("/patients/");
      // Map backend fields to frontend format
      const mapped = data.map(p => ({
        ...p,
        hospitalId: p.hospital_id,
        joinedDate: p.joined_date,
        dischargeDate: p.discharge_date,
        tumourType: p.tumour_type,
        riskScore: p.risk_score,
        doctorNotes: p.doctor_notes,
        scanReport: p.scan_report
      }));
      setPatients(mapped);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  // Filters & Modal State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [filterJoinedDate, setFilterJoinedDate] = useState('');
  const [filterDischargeDate, setFilterDischargeDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState('view'); 
  const [editData, setEditData] = useState({}); 

  // 2. READ: Fetch all patients from backend
  const fetchPatients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/patients/");
      if (response.ok) {
        const data = await response.json();
        setPatients(data);

        // --- UPDATE SELECTED PATIENT IF MODAL IS OPEN ---
        if (isModalOpen && selectedPatient) {
          const freshData = data.find(p => p.id === selectedPatient.id);
          if (freshData) setSelectedPatient(freshData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // 3. DELETE PATIENT
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient record?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/patients/${id}`, { method: "DELETE" });
      if (response.ok) {
        setPatients(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      alert("Failed to delete patient.");
    }
  };

  // 4. UPDATE PATIENT (Personal Details)
  const handleSaveEdits = async () => {
    try {
      const payload = {
        name: editData.name,
        age: String(editData.age),
        gender: editData.gender,
        phone: editData.phone,
        email: editData.email,
        address: editData.address,
        discharge_date: editData.discharge_date,
        symptoms: editData.symptoms,
      };

      const response = await fetch(`http://127.0.0.1:8000/patients/${selectedPatient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Patient updated successfully!");
        setIsModalOpen(false);
        fetchPatients(); 
      } else {
        alert("Failed to update patient details.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // --- REAL BACKEND DOCUMENT VAULT LOGIC ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedPatient) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", selectedPatient.id);
    formData.append("doc_type", "Clinical Report");

    try {
      const response = await fetch("http://127.0.0.1:8000/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const savedDoc = await response.json();
        setEditData(prev => ({
          ...prev,
          documents: [savedDoc, ...(prev.documents || [])]
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if(!window.confirm("Remove this document from the vault?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/${docId}`, { method: "DELETE" });
      if (response.ok) {
        setEditData(prev => ({
          ...prev,
          documents: (prev.documents || []).filter(d => d.id !== docId)
        }));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openModal = async (patient, mode) => {
    setSelectedPatient(patient);
    setModalMode(mode);
    setIsModalOpen(true);
    
    // Initialize with data we have
    setEditData({ ...patient, documents: [] }); 

    // Fetch real documents for this patient from backend
    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/patient/${patient.id}`);
      if (response.ok) {
        const docs = await response.json();
        setEditData(prev => ({ ...prev, documents: docs }));
      }
    } catch (error) {
      console.error("Docs fetch error:", error);
    }
  };

  const handleUploadClick = (patient) => {
    navigate('/image/upload', { state: { patient } });
  };

  const handlePrintCard = (p) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write(`<html><body style="font-family:sans-serif; padding:40px; text-align:center;"><div style="border:2px solid #0f172a; padding:20px; border-radius:10px;"><h2>NEUROSIGHT AI</h2><h1>${p.name}</h1><p>ID: ${p.hospital_id}</p><p>Consultant: ${p.assigned_doctor}</p></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const [sendLoading, setSendLoading] = useState(false);
  const handleSendReport = (patient) => {
    setSendLoading(true);
    setTimeout(() => {
      alert(`Report sent to: ${patient.email}`);
      setSendLoading(false);
    }, 1500);
  };

  // --- FILTER LOGIC ---
  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.hospital_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || p.tumour_type === typeFilter;
    const matchesJoined = !filterJoinedDate || p.joined_date === filterJoinedDate;
    const matchesDischarge = !filterDischargeDate || p.discharge_date === filterDischargeDate;
    return matchesSearch && matchesType && matchesJoined && matchesDischarge;
  });

  if (isLoading) return <div className="p-6 text-center text-slate-500 font-bold">Loading Patient Directory...</div>;

  return (
    <div className="space-y-4 font-sans">
      
      {/* FILTER OPTION BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Patient</label>
          <input
            type="text"
            placeholder="ID or Name..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Joined Date</label>
          <input type="date" className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs" value={filterJoinedDate} onChange={(e) => setFilterJoinedDate(e.target.value)} />
        </div>
        <div className="w-40">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Discharge Date</label>
          <input type="date" className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs" value={filterDischargeDate} onChange={(e) => setFilterDischargeDate(e.target.value)} />
        </div>
        <div className="w-40">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Tumour Type</label>
          <select 
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Glioma">Glioma</option>
            <option value="Meningioma">Meningioma</option>
            <option value="Pituitary">Pituitary</option>
            <option value="Not Classified">Not Classified</option>
            <option value="No Tumour">No Tumour</option>
          </select>
        </div>
        <button onClick={() => { setSearchTerm(''); setTypeFilter('All'); setFilterJoinedDate(''); setFilterDischargeDate(''); }} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold">Clear</button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100 font-bold">
                <th className="p-4">Patient ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Consultant</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Discharge Date</th>
                <th className="p-4 text-center">Risk Score</th>
                <th className="p-4">Tumour Type</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium">
              {filteredPatients.length === 0 && (
                 <tr><td colSpan="8" className="p-6 text-center text-slate-400 italic">No matching patients found.</td></tr>
              )}
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-blue-600 font-bold">{p.hospital_id}</td>
                  <td className="p-4 text-slate-800">{p.name}</td>
                  <td className="p-4 text-xs font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{p.assigned_doctor || "Unassigned"}</span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{p.joined_date}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">
                    {p.discharge_date === 'Pending' ? <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-black text-[10px] uppercase tracking-tighter">Pending</span> : p.discharge_date}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-700">{p.risk_score}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${p.tumour_type === 'No Tumour' ? 'bg-green-100 text-green-700' : p.tumour_type === 'Not Classified' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                      {p.tumour_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => openModal(p, 'view')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[11px] font-bold border border-blue-100">
                        <span>👁️</span> View
                      </button>
                      <button onClick={() => openModal(p, 'edit')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-[11px] font-bold border border-slate-200">
                        <span>✏️</span> Edit
                      </button>
                      <button onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this patient?')) {
                          try {
                            await api(`/patients/${p.id}`, { method: 'DELETE' });
                            fetchPatients();
                          } catch (e) { alert('Failed to delete'); }
                        }
                      }} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold border border-red-100">
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW/EDIT MODAL */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">{modalMode === 'view' ? 'Patient Medical File' : 'Update Patient Information'}</h2>
                {modalMode === 'view' && (
                  <div className="flex gap-2">
                    <button onClick={() => handlePrintCard(selectedPatient)} className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded hover:bg-black uppercase">🖨️ Print Card</button>
                    <button onClick={() => handleSendReport(selectedPatient)} disabled={sendLoading} className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded hover:bg-blue-700 uppercase">{sendLoading ? "Sending..." : "📧 Send Report"}</button>
                  </div>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/30">
              
              {/* Left Column: Identity & AI */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b pb-1">Patient Identity & Contact</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Consultant</label>
                    <input disabled className="w-full border-b py-1 outline-none font-bold text-indigo-700 bg-indigo-50/30 px-2 rounded" value={selectedPatient.assigned_doctor || ""} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input name="name" disabled={modalMode === 'view'} onChange={handleEditChange} className="w-full border-b py-1 outline-none focus:border-blue-500 disabled:bg-transparent font-semibold" value={editData.name || ""} />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital ID</label>
                    <input disabled className="w-full border-b py-1 bg-transparent text-slate-500 font-mono" value={selectedPatient.hospital_id} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-600 uppercase">Joined Date (System)</label>
                    <input
                      disabled={modalMode === 'view'}
                      type={modalMode === 'edit' ? 'date' : 'text'}
                      className="w-full border-b py-1 bg-indigo-50/20 text-slate-500 font-mono"
                      defaultValue={selectedPatient.joinedDate}
                    />
                  </div>

                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <label className="text-[10px] font-bold text-indigo-600 uppercase">Joined Date</label>
                    <input disabled type="text" className="w-full border-b border-indigo-200 py-1 bg-transparent text-slate-500 font-mono text-xs" value={selectedPatient.joined_date} />
                  </div>
                  <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Discharge Date</label>
                    <div className="relative">
                      <input
                        disabled={modalMode === 'view'}
                        id="dischargeInput"
                        type={modalMode === 'edit' ? 'date' : 'text'}
                        className="w-full border-b py-1 outline-none focus:border-blue-500 disabled:bg-transparent"
                        defaultValue={selectedPatient.dischargeDate === 'Pending' && modalMode === 'view' ? 'Still In Hospital' : (selectedPatient.dischargeDate === 'Pending' ? '' : selectedPatient.dischargeDate)}
                      />
                      {modalMode === 'edit' && (
                        <button
                          type="button"
                          onClick={() => { document.getElementById('dischargeInput').value = '' }}
                          className="text-[9px] font-black text-amber-600 uppercase mt-1 block hover:underline"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>

                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label><input name="gender" disabled={modalMode === 'view'} onChange={handleEditChange} className="w-full border-b py-1 outline-none disabled:bg-transparent" value={editData.gender || ""} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label><input name="phone" disabled={modalMode === 'view'} onChange={handleEditChange} className="w-full border-b py-1 outline-none disabled:bg-transparent" value={editData.phone || ""} /></div>
                  
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Email</label><input name="email" disabled={modalMode === 'view'} onChange={handleEditChange} className="w-full border-b py-1 outline-none disabled:bg-transparent" value={editData.email || ""} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Address</label><input name="address" disabled={modalMode === 'view'} onChange={handleEditChange} className="w-full border-b py-1 outline-none disabled:bg-transparent" value={editData.address || ""} /></div>
                  
                  <div className="col-span-2"><label className="text-[10px] font-bold text-red-600 uppercase">AI Risk Score</label><input disabled className="w-full border-b py-1 bg-transparent font-black text-red-600" value={selectedPatient.risk_score} /></div>
                </div>

                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b pb-1 mt-6">Symptoms & Patient History</h3>
                <textarea
                  rows="4"
                  disabled={modalMode === 'view'}
                  onChange={handleEditChange}
                  className="w-full p-3 text-sm border border-amber-100 rounded-xl bg-amber-50/20 outline-none focus:ring-2 focus:ring-amber-300 disabled:text-slate-700"
                  value={modalMode === 'edit' ? (editData.symptoms || "") : (selectedPatient.symptoms || "")}
                  placeholder="Patient intake symptoms appear here..."
                />

                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mt-6 border-b pb-1">Datewise AI Diagnostic History</h3>
                {/* --- DATEWISE TIMELINE SECTION --- */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedPatient.results && selectedPatient.results.length > 0 ? (
                        [...selectedPatient.results].reverse().map((res, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Analysis #{selectedPatient.results.length - idx}</span>
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{res.created_at || 'Recent'}</span>
                                </div>
                                <div className="p-3 flex gap-4">
                                    <img 
                                        src={`http://127.0.0.1:8000/uploaded_mris/${res.filename}`} 
                                        alt="MRI Scan" 
                                        className="w-16 h-16 rounded-lg object-cover border border-slate-100" 
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Classification</p>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{res.predicted_label}</p>
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => navigate('/image/results', { state: { patient: selectedPatient, analysisResult: res } })} 
                                                className="text-[9px] bg-indigo-600 text-white px-3 py-1 rounded font-black uppercase hover:bg-indigo-700"
                                            >
                                                View Analysis Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
                            <span className="text-2xl opacity-30">🧠</span>
                            <p className="text-xs text-slate-500 font-bold mt-2">No MRI Scan Analyzed</p>
                            <button onClick={() => handleUploadClick(selectedPatient)} className="mt-2 text-[10px] text-blue-600 font-bold underline">Analyze MRI Now</button>
                        </div>
                    )}
                </div>
                {/* Always show "New Analysis" option for tracking progression */}
                <button 
                    onClick={() => handleUploadClick(selectedPatient)} 
                    className="w-full mt-2 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                    <span>➕</span> Upload New MRI Progression Scan
                </button>
              </div>

              {/* Right Column: Documents & Observations */}
              <div className="space-y-6 flex flex-col h-full">
                
                {/* MEDICAL DOCUMENT VAULT */}
                <div className="flex justify-between items-end border-b pb-1">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Medical Document Vault</h3>
                  {modalMode === 'edit' && (
                    <div className="relative overflow-hidden">
                      <button className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 uppercase flex items-center gap-1">
                        <span>➕</span> Add Document
                      </button>
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>

                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-6 border-b pb-1">Doctor's Observations</h3>
                <textarea
                  rows="10"
                  id="doctorNotesInput"
                  disabled={modalMode === 'view' || currentUser.role !== 'Doctor'}
                  className={`w-full p-3 text-sm border rounded-xl outline-none transition-all ${modalMode === 'edit' && currentUser.role === 'Doctor'
                      ? 'focus:ring-2 focus:ring-emerald-500 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 italic'
                    }`}
                  defaultValue={selectedPatient.doctorNotes}
                  placeholder={currentUser.role !== 'Doctor' ? "Editing restricted to medical staff only" : "Enter clinical findings..."}
                />

                {modalMode === 'edit' && (
                  <div className="pt-4 flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl border font-bold text-slate-500 text-sm hover:bg-slate-50">Cancel</button>
                    <button onClick={async () => {
                      try {
                        const updatedData = { ...selectedPatient };

                        // Pick values from doc
                        updatedData.doctor_notes = document.getElementById('doctorNotesInput').value;
                        const ddl = document.getElementById('dischargeInput').value;
                        if (ddl) updatedData.discharge_date = ddl;

                        await api(`/patients/${selectedPatient.id}`, {
                          method: 'PUT',
                          body: JSON.stringify(updatedData)
                        });
                        alert('Updated securely.');
                        setIsModalOpen(false);
                        fetchPatients();
                      } catch (e) {
                        alert('Update failed');
                      }
                    }} className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-black uppercase tracking-widest">Save Record</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPatients;

//========================================================================================================