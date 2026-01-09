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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AllPatients = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({ role: "Attendant", name: "Staff Member" });

  const [patients, setPatients] = useState([
    {
      hospitalId: "NS-20491",
      name: "Evelyn Harper",
      assignedDoctor: "Dr. S. Perera",
      joinedDate: "2025-01-02",
      dischargeDate: "2025-01-05",
      tumourType: "Meningioma",
      riskScore: "94.2%", 
      age: "52",
      gender: "Female",
      phone: "+1 555-0192",
      email: "evelyn@example.com",
      address: "123 Medical Lane, Health City",
      symptoms: "Persistent headaches localized in the frontal lobe, accompanied by nausea.", // Registered Symptoms
      doctorNotes: "Scheduled for follow-up biopsy.",
      
      hasScan: true,
      mriImage: "https://via.placeholder.com/300x300?text=MRI+Scan", 
      
      documents: [
        { id: 1, name: "Intake_Form_Scanned.pdf", type: "Registration", date: "2025-01-02" },
        { id: 2, name: "MRI_Analysis_Report.pdf", type: "AI Analysis", date: "2025-01-02" },
        { id: 3, name: "Blood_Work_Full.pdf", type: "Lab Report", date: "2025-01-03" }
      ]
    },
    {
      hospitalId: "NS-17382",
      name: "Rahul Singh",
      assignedDoctor: "Dr. A. Silva",
      joinedDate: "2025-01-03",
      dischargeDate: "Pending",
      tumourType: "No Tumour",
      riskScore: "0.2%", 
      age: "29",
      gender: "Male",
      phone: "+1 555-0188",
      email: "rahul@example.com",
      address: "45 Station Road, Colombo",
      symptoms: "General dizziness and occasional blurred vision after reading.", // Registered Symptoms
      doctorNotes: "No abnormalities found.",
      
      hasScan: false,
      mriImage: null,

      documents: [
        { id: 1, name: "Referral_Letter.jpg", type: "Registration", date: "2025-01-03" }
      ]
    },
    {
      hospitalId: "NS-23918",
      name: "Ava Patel",
      assignedDoctor: "Dr. S. Perera",
      joinedDate: "2025-01-01",
      dischargeDate: "2025-01-04",
      tumourType: "Glioma",
      riskScore: "88.7%", 
      age: "41", 
      gender: "Female",
      phone: "+1 555-0123",
      email: "ava@example.com",
      address: "88 Orchid Avenue, Kandy", 
      symptoms: "Blurred vision and sudden sharp pains in the temporal region.", // Registered Symptoms
      doctorNotes: "Urgent MRI review required.",
      
      hasScan: true, 
      mriImage: "https://via.placeholder.com/150", 

      documents: [
        { id: 1, name: "Intake_Form.pdf", type: "Registration", date: "2025-01-01" },
        { id: 2, name: "Previous_History.pdf", type: "External", date: "2025-01-01" }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [filterJoinedDate, setFilterJoinedDate] = useState('');
  const [filterDischargeDate, setFilterDischargeDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState('view'); 

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedPatient) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: "Clinical Report", 
        date: new Date().toISOString().split('T')[0]
      };

      const updatedPatient = { 
        ...selectedPatient, 
        documents: [newDoc, ...selectedPatient.documents] 
      };
      
      setSelectedPatient(updatedPatient);
      setPatients(prev => prev.map(p => p.hospitalId === selectedPatient.hospitalId ? updatedPatient : p));
    }
  };

  const handlePrintCard = (p) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write(`<html><body style="font-family:sans-serif; padding:40px; text-align:center;"><div style="border:2px solid #0f172a; padding:20px; border-radius:10px;"><h2>NEUROSIGHT AI</h2><h1>${p.name}</h1><p>ID: ${p.hospitalId}</p><p>Consultant: ${p.assignedDoctor}</p></div></body></html>`);
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

  const openModal = (patient, mode) => {
    setSelectedPatient(patient);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleUploadClick = (patient) => {
    navigate('/image/upload', { state: { patient } });
  };

  // --- UPDATED FILTER LOGIC: Includes Tumour Type ---
  const filteredPatients = patients.filter(p => {
    // 1. Search (ID or Name)
    const matchesSearch = p.hospitalId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Tumour Type Filter
    const matchesType = typeFilter === 'All' || p.tumourType === typeFilter;

    // 3. Date Filters
    const matchesJoined = !filterJoinedDate || p.joinedDate === filterJoinedDate;
    const matchesDischarge = !filterDischargeDate || p.dischargeDate === filterDischargeDate;

    return matchesSearch && matchesType && matchesJoined && matchesDischarge;
  });

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
          {/* UPDATED: Dropdown now drives the filter logic */}
          <select 
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Glioma">Glioma</option>
            <option value="Meningioma">Meningioma</option>
            <option value="Pituitary">Pituitary</option>
            <option value="No Tumour">No Tumour</option>
          </select>
        </div>
        <button onClick={() => {setSearchTerm(''); setTypeFilter('All'); setFilterJoinedDate(''); setFilterDischargeDate('');}} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold">Clear</button>
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
              {filteredPatients.map((p, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-blue-600 font-bold">{p.hospitalId}</td>
                  <td className="p-4 text-slate-800">{p.name}</td>
                  <td className="p-4 text-xs font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{p.assignedDoctor || "Unassigned"}</span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{p.joinedDate}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">
                    {p.dischargeDate === 'Pending' ? <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-black text-[10px] uppercase tracking-tighter">Pending</span> : p.dischargeDate}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-700">{p.riskScore}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${p.tumourType === 'No Tumour' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.tumourType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => handleUploadClick(p)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-bold border border-indigo-100"><span>📤</span> MRI</button>
                      <button onClick={() => openModal(p, 'view')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[11px] font-bold border border-blue-100"><span>👁️</span> View</button>
                      <button onClick={() => openModal(p, 'edit')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-[11px] font-bold border border-slate-200"><span>✏️</span> Edit</button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold border border-red-100"><span>🗑️</span> Del</button>
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
              
              {/* Left Column: Demographics & AI Results */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b pb-1">Patient Identity & Contact</h3>
                
                {/* --- ALIGNED GRID LAYOUT --- */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Row 1: Consultant & Name */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Consultant</label>
                    <input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none font-bold text-indigo-700 bg-indigo-50/30 px-2 rounded" defaultValue={selectedPatient.assignedDoctor} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none focus:border-blue-500 disabled:bg-transparent font-semibold" defaultValue={selectedPatient.name} />
                  </div>
                  
                  {/* Row 2: Hospital ID & Age */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital ID</label>
                    <input disabled className="w-full border-b py-1 bg-transparent text-slate-500 font-mono" defaultValue={selectedPatient.hospitalId} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                    <input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none disabled:bg-transparent" defaultValue={selectedPatient.age} />
                  </div>

                  {/* Row 3: JOINED DATE & DISCHARGE DATE (Aligned) */}
                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <label className="text-[10px] font-bold text-indigo-600 uppercase">Joined Date</label>
                    <input disabled={modalMode === 'view'} type={modalMode === 'edit' ? 'date' : 'text'} className="w-full border-b border-indigo-200 py-1 bg-transparent text-slate-500 font-mono text-xs" defaultValue={selectedPatient.joinedDate} />
                  </div>
                  <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Discharge Date</label>
                    <div className="relative">
                      <input 
                        disabled={modalMode === 'view'} 
                        id="dischargeInput"
                        type={modalMode === 'edit' ? 'date' : 'text'}
                        className="w-full border-b border-amber-200 py-1 outline-none disabled:bg-transparent text-xs" 
                        defaultValue={selectedPatient.dischargeDate === 'Pending' && modalMode === 'view' ? 'Still In Hospital' : (selectedPatient.dischargeDate === 'Pending' ? '' : selectedPatient.dischargeDate)} 
                      />
                      {modalMode === 'edit' && <button type="button" onClick={() => {document.getElementById('dischargeInput').value = ''}} className="text-[9px] font-black text-amber-600 uppercase mt-1 block hover:underline">Reset to Pending</button>}
                    </div>
                  </div>

                  {/* Row 4: Gender & Phone */}
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label><input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none disabled:bg-transparent" defaultValue={selectedPatient.gender} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label><input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none disabled:bg-transparent" defaultValue={selectedPatient.phone} /></div>
                  
                  {/* Row 5: Email & Address */}
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Email</label><input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none disabled:bg-transparent" defaultValue={selectedPatient.email} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Address</label><input disabled={modalMode === 'view'} className="w-full border-b py-1 outline-none disabled:bg-transparent" defaultValue={selectedPatient.address} /></div>
                  
                  {/* Row 6: Risk Score */}
                  <div className="col-span-2"><label className="text-[10px] font-bold text-red-600 uppercase">AI Risk Score</label><input disabled className="w-full border-b py-1 bg-transparent font-black text-red-600" defaultValue={selectedPatient.riskScore} /></div>
                </div>

                {/* --- SYMPTOMS SECTION (Explicitly added as requested) --- */}
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b pb-1 mt-6">Symptoms & Intake Notes</h3>
                <textarea 
                  rows="4"
                  disabled={modalMode === 'view'}
                  className="w-full p-3 text-sm border border-amber-100 rounded-xl bg-amber-50/20 outline-none focus:ring-2 focus:ring-amber-300 disabled:text-slate-700"
                  defaultValue={selectedPatient.symptoms} // BOUND TO DATA
                  placeholder="Patient intake symptoms appear here..."
                />

                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mt-6 border-b pb-1">AI Diagnostics & MRI</h3>
                {selectedPatient.hasScan ? (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="relative h-48 bg-black group">
                      <img src={selectedPatient.mriImage} alt="MRI" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-[10px] font-mono">
                        {selectedPatient.tumourType}
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center bg-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Classification</p>
                        <p className="text-sm font-black text-slate-800">{selectedPatient.tumourType}</p>
                      </div>
                      <button onClick={() => navigate('/image/results', { state: { patient: selectedPatient } })} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase hover:bg-indigo-700">
                        View Full Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
                    <span className="text-2xl opacity-30">🧠</span>
                    <p className="text-xs text-slate-500 font-bold mt-2">No MRI Scan Analyzed</p>
                    <button onClick={() => navigate('/image/upload', { state: { patient: selectedPatient } })} className="mt-2 text-[10px] text-blue-600 font-bold underline">Upload & Analyze Now</button>
                  </div>
                )}
              </div>

              {/* Right Column: Documents & Notes */}
              <div className="space-y-6">
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

                <div className="space-y-2 h-64 overflow-y-auto pr-2">
                  {selectedPatient.documents && selectedPatient.documents.length > 0 ? (
                    selectedPatient.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white hover:border-emerald-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${doc.type === 'Registration' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {doc.type === 'Registration' ? '📂' : '🧬'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 truncate w-40">{doc.name}</p>
                            <div className="flex gap-2">
                              <span className="text-[9px] text-slate-400 font-mono uppercase">{doc.date}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-300">• {doc.type}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-bold uppercase hover:bg-slate-200 cursor-pointer">View</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 italic">No documents found.</p>
                  )}
                </div>

                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-2 border-b pb-1">Doctor's Observations</h3>
                <textarea 
                  rows="8"
                  disabled={modalMode === 'view' || currentUser.role !== 'Doctor'}
                  className={`w-full p-3 text-sm border rounded-xl outline-none transition-all ${
                    modalMode === 'edit' && currentUser.role === 'Doctor' 
                    ? 'focus:ring-2 focus:ring-emerald-500 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 italic'
                  }`}
                  defaultValue={selectedPatient.doctorNotes}
                  placeholder="Clinical findings..."
                />
                
                {modalMode === 'edit' && (
                  <div className="pt-4 flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl border font-bold text-slate-500 text-sm hover:bg-slate-50">Cancel</button>
                    <button className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-black uppercase tracking-widest">Save Record</button>
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