// import React from 'react';

// export default function AddNewPatient() {
//   return (
//     <div className="p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold text-gray-700">Add New Patient</h2>
//       <div className="mt-4 text-gray-600">hi</div>
//     </div>
//   );
// }

//==============================================================================================

import React, { useState, useEffect } from 'react';

const AddNewPatient = ({ onPatientAdded, lastPatientId = "NS-00000" }) => {
  // MOCK DOCTORS LIST
  const doctorsList = [
    { id: "DOC-001", name: "Dr. S. Perera" },
    { id: "DOC-002", name: "Dr. A. Silva" },
    { id: "DOC-003", name: "Dr. M. Fernando" }
  ];

  const [patientData, setPatientData] = useState({
    name: '',
    hospitalId: '',
    age: '',
    years: 'Years',
    gender: '',
    email: '',
    phone: '',
    address: '',
    symptomsNotes: '',
    assignedDoctor: '', // <--- NEW FIELD
  });

  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // 1. Logic for Auto-generating the Next ID (The "Watchman")
  useEffect(() => {
    const prefix = "NS-";
    const lastNum = parseInt(lastPatientId.replace(prefix, ""), 10);
    const nextNum = (lastNum + 1).toString().padStart(5, '0');
    
    setPatientData(prev => ({
      ...prev,
      hospitalId: `${prefix}${nextNum}`
    }));
  }, [lastPatientId]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  // 2. FIXED OCR Logic: It now keeps the current hospitalId!
  const runOCR = () => {
    setIsOcrLoading(true);
    setTimeout(() => {
      setPatientData(prev => ({
        ...prev, // Keep everything we already have (like the Hospital ID)
        name: 'Ava Patel',
        age: '52',
        gender: 'Female',
        email: 'ava.patel@email.com',
        phone: '+1 555-0123',
        address: '123 Medical Lane, Health City',
        symptomsNotes: 'Patient reports persistent pressure in the frontal lobe and blurred vision for 3 weeks.',
        assignedDoctor: 'Dr. S. Perera' // <--- OCR detects doctor
      }));
      setIsOcrLoading(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalData = {
      ...patientData,
      joinedDate: new Date().toISOString().split('T')[0], // Automatic Date
      dischargeDate: 'Pending',
      tumourType: 'Not Classified'
    };

    if(onPatientAdded) onPatientAdded(finalData);
    
    // Reset form but the ID will regenerate via the useEffect
    setPatientData({ 
      name: '', hospitalId: '', age: '', years: 'Years', gender: '',
      email: '', phone: '', address: '', symptomsNotes: '', assignedDoctor: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans sticky top-20">
      {/* HEADER */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b-4 border-blue-600">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-white">New Registration</h2>
          <p className="text-[10px] text-blue-400 font-black tracking-tighter uppercase">ID Status: Active</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-black">Today's Date</p>
          <p className="text-xs font-bold text-white">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* THE DROP BOX (OCR) */}
        <div className="group relative">
          <div className="p-6 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📄</span>
            <p className="text-[11px] font-black text-blue-900 uppercase">Medical Report Drop-Box</p>
            <p className="text-[9px] text-blue-400 mb-3 font-bold italic">Drag & Drop Scanned Report</p>
            
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            
            <button 
              type="button"
              onClick={runOCR}
              className="relative z-10 bg-blue-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 transition shadow-md active:scale-95"
            >
              {isOcrLoading ? "AI Processing..." : "Start OCR Extraction"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: IDENTITY */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-2">
               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Patient Identity & Care</h3>
            </div>

            {/* --- NEW: DOCTOR ASSIGNMENT BLOCK --- */}
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mx-2">
              <label className="text-[10px] font-black text-indigo-600 uppercase mb-1 block">Assign Consulting Doctor</label>
              <select
                name="assignedDoctor"
                value={patientData.assignedDoctor}
                onChange={handleInput}
                className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select Specialist --</option>
                {doctorsList.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            </div>
            {/* ------------------------------------ */}

            <div className="grid grid-cols-2 gap-4 px-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input name="name" value={patientData.name} onChange={handleInput} placeholder="Type name here..." className="w-full border-b-2 border-slate-100 py-1 outline-none font-semibold text-slate-800 focus:border-blue-600 transition-colors" required />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital ID (Fixed)</label>
                <input value={patientData.hospitalId} readOnly className="w-full border-b-2 border-blue-50 py-1 font-mono text-blue-600 font-bold outline-none bg-blue-50/20" />
              </div>

              <div className="flex gap-2">
                <input name="age" type="number" value={patientData.age} onChange={handleInput} placeholder="Age" className="w-1/2 border-b-2 border-slate-100 py-1" required />
                <select name="years" value={patientData.years} onChange={handleInput} className="w-1/2 border-b-2 border-slate-100 text-[10px] font-bold text-slate-500 bg-transparent">
                  <option>Years</option>
                  <option>Months</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Gender</label>
                <div className="flex gap-4 p-2 bg-slate-50 rounded-xl justify-around border border-slate-100">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label key={g} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-bold">
                      <input type="radio" name="gender" value={g} checked={patientData.gender === g} onChange={handleInput} className="accent-blue-600" required /> {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACTS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-2">
               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Contact Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 px-2 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-emerald-700/60 uppercase">Delivery Email</label>
                <input name="email" type="email" value={patientData.email} onChange={handleInput} placeholder="patient@mail.com" className="w-full bg-transparent border-b border-emerald-200 py-1 text-xs outline-none focus:border-emerald-500" required />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-emerald-700/60 uppercase">Phone Number</label>
                <input name="phone" type="tel" value={patientData.phone} onChange={handleInput} placeholder="+94..." className="w-full bg-transparent border-b border-emerald-200 py-1 text-xs outline-none focus:border-emerald-500" required />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-emerald-700/60 uppercase">Home Address</label>
                <input name="address" value={patientData.address} onChange={handleInput} placeholder="Street, City, State" className="w-full bg-transparent border-b border-emerald-200 py-1 text-xs outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTES */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-l-4 border-amber-400 pl-2">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Symptoms & Clinical Notes</h3>
            </div>
            <textarea 
              name="symptomsNotes" 
              value={patientData.symptomsNotes} 
              onChange={handleInput} 
              rows="3" 
              placeholder="Clinical observations..." 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95 border-b-4 border-slate-700">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewPatient;
