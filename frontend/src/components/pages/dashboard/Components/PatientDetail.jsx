import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api, getCurrentUser } from "../../../../util";

// ── Medication structured input ───────────────────────────────────────────────
const EMPTY_MED = { name: '', dosage: '', morning: true, night: false, food: 'after' };

function parseMeds(value) {
  if (!value) return [{ ...EMPTY_MED }];
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length) return p.map(m => ({
      name:    m.name    || '',
      dosage:  m.dosage  || '',
      morning: m.times?.includes('08:00') ?? true,
      night:   m.times?.includes('21:00') ?? false,
      food:    m.food    || 'after',
    }));
  } catch {}
  return [{ ...EMPTY_MED }];
}

function MedicationBuilder({ value, onChange }) {
  const [meds, setMeds] = useState(() => parseMeds(value));
  const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#64748b', marginBottom:5 };
  const inp = { width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 11px', fontSize:13, outline:'none', boxSizing:'border-box' };

  const commit = (list) => {
    setMeds(list);
    const out = list.filter(m => m.name.trim()).map(m => ({
      name:   m.name.trim(),
      dosage: m.dosage.trim(),
      times:  [...(m.morning ? ['08:00'] : []), ...(m.night ? ['21:00'] : [])],
      food:   m.food,
    }));
    onChange(JSON.stringify(out));
  };

  const setField  = (i, key, val) => commit(meds.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  const addRow    = () => commit([...meds, { ...EMPTY_MED }]);
  const removeRow = (i) => commit(meds.filter((_, idx) => idx !== i));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {meds.map((med, i) => (
        <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'11px 13px' }}>
          <div style={{ display:'flex', gap:8, marginBottom:9 }}>
            <div style={{ flex:2 }}>
              <label style={lbl}>Drug Name</label>
              <input value={med.name} onChange={e => setField(i,'name',e.target.value)} placeholder="e.g. Panadol" style={inp} />
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>Dosage</label>
              <input value={med.dosage} onChange={e => setField(i,'dosage',e.target.value)} placeholder="e.g. 500mg" style={inp} />
            </div>
            {meds.length > 1 && (
              <button type="button" onClick={() => removeRow(i)}
                style={{ alignSelf:'flex-end', marginBottom:1, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'6px 8px', cursor:'pointer', color:'#dc2626', display:'flex', alignItems:'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', alignItems:'flex-start' }}>
            <div>
              <label style={lbl}>Reminder Time</label>
              <div style={{ display:'flex', gap:12 }}>
                {[['morning','Morning (8 AM)'],['night','Night (9 PM)']].map(([key,label]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#374151', fontWeight:500, cursor:'pointer' }}>
                    <input type="checkbox" checked={med[key]} onChange={e => setField(i,key,e.target.checked)} style={{ accentColor:'#0d9488', width:13, height:13 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>With Food</label>
              <div style={{ display:'flex', gap:6 }}>
                {['before','after'].map(f => (
                  <button key={f} type="button" onClick={() => setField(i,'food',f)} style={{
                    padding:'4px 11px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
                    border:      med.food === f ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                    background:  med.food === f ? '#f0fdfa' : '#fff',
                    color:       med.food === f ? '#0d9488' : '#64748b',
                  }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow}
        style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:'1.5px dashed #cbd5e1', background:'#f8fafc', color:'#64748b', fontSize:12, fontWeight:600, cursor:'pointer', width:'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add another medication
      </button>
    </div>
  );
}

function ExamSection({ label, hint, fieldName, canEdit, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563eb', marginBottom: 4 }}>{label}</div>
      <textarea
        name={fieldName} rows={3}
        disabled={!canEdit}
        onChange={onChange}
        style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: canEdit ? '1px solid #bfdbfe' : '1px dashed #e2e8f0', borderRadius: 8, background: canEdit ? '#fff' : '#f8fafc', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', color: canEdit ? '#334155' : '#94a3b8', fontStyle: value ? 'normal' : 'italic', cursor: canEdit ? 'text' : 'not-allowed' }}
        value={value}
        placeholder={hint}
      />
    </div>
  );
}

function mapPatient(p) {
  return {
    ...p,
    hospitalId:           p.hospital_id,
    joinedDate:           p.current_joined_date ?? p.joined_date,
    dischargeDate:        p.current_discharge_date ?? p.discharge_date,
    tumourType:           p.tumour_type,
    riskScore:            p.risk_score,
    doctorNotes:          p.doctor_notes,
    scanReport:           p.scan_report,
    assignedDoctor:       p.assigned_doctor,
    presentingComplaint:  p.presenting_complaint,
    symptomAnalysis:      p.symptom_analysis,
    differentialAnalysis: p.differential_analysis,
    complications:        p.complications,
    riskFactor:           p.risk_factor,
    systemicReview:       p.systemic_review,
    pastMedicalHistory:   p.past_medical_history,
    familyHistory:        p.family_history,
    socialHistory:        p.social_history,
    allergyHistory:       p.allergy_history,
    examinationFindings:  p.examination_findings,
    musclePower:          p.muscle_power,
    reflex:               p.reflex,
    fromLocation:         p.from_location,
    occupation:           p.occupation,
  };
}

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser() || { role: "Attendant", name: "Staff Member" };
  const isAdmin = currentUser.role === "Admin";
  const isClinical = ['Doctor', 'Clinician', 'Super Admin'].includes(currentUser.role);

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMode, setPageMode] = useState(location.state?.mode || 'view');
  const [editData, setEditData] = useState({});
  const [patientAdmissions, setPatientAdmissions] = useState([]);
  const [admissionLoading, setAdmissionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'admissions');
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [dischargingAdmissionId, setDischargingAdmissionId] = useState(null);
  const [dischargeDate, setDischargeDate] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [chainInfoId, setChainInfoId] = useState(null);
  const [expandedCheckin, setExpandedCheckin] = useState(null);
  const [calWeeksBack, setCalWeeksBack] = useState(0);
  const [monitoringSubTab, setMonitoringSubTab] = useState('checkin');
  const [monitoringCheckins, setMonitoringCheckins] = useState([]);
  const [planSaving, setPlanSaving] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [monitoringAlerts, setMonitoringAlerts] = useState([]);
  const [symptomReports, setSymptomReports] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [caretakerEdits, setCaretakerEdits] = useState({});
  const [caretakerUpdateSaving, setCaretakerUpdateSaving] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);
  const [medAdherence, setMedAdherence] = useState({ medications: [], logs: [], days: 30, since: '' });
  const [medOffsets, setMedOffsets] = useState({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [newCaretaker, setNewCaretaker] = useState({ name: '', phone: '', relation: '' });
  const [caretakerSaving, setCaretakerSaving] = useState(false);
  const [editingNextVisit, setEditingNextVisit] = useState(false);
  const [nextVisitInput, setNextVisitInput] = useState('');
  const [newPlanForm, setNewPlanForm] = useState({
    plan_date: new Date().toISOString().slice(0, 10),
    plan_type: 'Medication', title: '', medications: '',
    therapy_schedule: '', surgery_details: '', notes: '',
  });

  useEffect(() => { fetchPatient(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const data = await api(`/patients/${id}`);
      const mapped = mapPatient(data);
      setPatient(mapped);
      setEditData({ ...mapped, discharge_date: mapped.dischargeDate, documents: [] });

      const [docs, admissions, plans, ctakers] = await Promise.all([
        api(`/documents/patient/${id}`),
        api(`/admissions/patient/${id}`).catch(() => []),
        api(`/treatment-plans/patient/${id}`).catch(() => []),
        api(`/patients/${id}/caretakers`).catch(() => []),
      ]);
      // fetch patient-specific checkins for monitoring tab
      try {
        const ck = await api(`/patients/${id}/checkins`).catch(() => []);
        setMonitoringCheckins(Array.isArray(ck) ? ck : []);
      } catch (e) {
        setMonitoringCheckins([]);
      }
      // fetch patient-specific emergency alerts and filter to this patient
      try {
        const rawAlerts = await api(`/dashboard/patient-alerts?limit=100`).catch(() => []);
        const filteredAlerts = Array.isArray(rawAlerts)
          ? rawAlerts.filter(alert => String(alert.patient_id) === String(id))
          : [];
        setMonitoringAlerts(filteredAlerts);
      } catch (e) {
        setMonitoringAlerts([]);
      }
      // fetch non-emergency symptom reports submitted via the mobile Report Symptom page
      try {
        const reports = await api(`/dashboard/symptom-reports/${id}`).catch(() => []);
        setSymptomReports(Array.isArray(reports) ? reports : []);
      } catch (e) {
        setSymptomReports([]);
      }
      // fetch medication adherence data for the monitoring tab
      try {
        const adh = await api(`/dashboard/medication-adherence/${id}`).catch(() => null);
        if (adh && Array.isArray(adh.medications)) setMedAdherence(adh);
      } catch (e) {
        // leave default empty state
      }
      setEditData(prev => ({ ...prev, documents: docs }));
      setPatientAdmissions(admissions);
      setTreatmentPlans(Array.isArray(plans) ? plans : []);
      const ctList = Array.isArray(ctakers) ? ctakers : [];
      setCaretakers(ctList);
      setCaretakerEdits(Object.fromEntries(ctList.map(ct => [ct.id, { name: ct.name, phone: ct.phone, relation: ct.relation || '' }])));

      api(`/enrollment/${id}/status`).then(s => setEnrollmentStatus(s)).catch(() => {});
    } catch (err) {
      console.error("Failed to fetch patient", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    try {
      const payload = {
        name:                  editData.name,
        age:                   String(editData.age),
        gender:                editData.gender,
        phone:                 editData.phone,
        email:                 editData.email,
        address:               editData.address,
        from_location:         editData.fromLocation,
        occupation:            editData.occupation,
        symptoms:              editData.symptoms,
        presenting_complaint:  editData.presentingComplaint,
        symptom_analysis:      editData.symptomAnalysis,
        differential_analysis: editData.differentialAnalysis,
        complications:         editData.complications,
        risk_factor:           editData.riskFactor,
        systemic_review:       editData.systemicReview,
        past_medical_history:  editData.pastMedicalHistory,
        family_history:        editData.familyHistory,
        social_history:        editData.socialHistory,
        allergy_history:       editData.allergyHistory,
        doctor_notes:          editData.doctorNotes,
        examination_findings:  editData.examinationFindings,
        muscle_power:          editData.musclePower,
        reflex:                editData.reflex,
      };
      await api(`/patients/${patient.id}`, { method: "PUT", body: payload });
      alert("Patient updated successfully!");
      fetchPatient();
      setPageMode('view');
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update patient details.");
    }
  };

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveNextVisitDate = async () => {
    try {
      await api(`/patients/${patient.id}`, { method: 'PUT', body: { next_visit_date: nextVisitInput || null } });
      setPatient(prev => ({ ...prev, next_visit_date: nextVisitInput || null }));
      setEditingNextVisit(false);
    } catch (e) {
      console.error('Failed to save next visit date', e);
    }
  };

  const handleNewAdmission = async () => {
    if (!patient) return;
    if (!window.confirm(`Create a new admission for ${patient.name}? This will start Admission #${(patientAdmissions.length || 0) + 1}.`)) return;
    setAdmissionLoading(true);
    try {
      const newAdmission = await api("/admissions/", {
        method: "POST",
        body: { patient_id: patient.id },
      });
      setPatientAdmissions(prev => [newAdmission, ...prev]);
      alert(`Admission #${newAdmission.episode_number} created — ${newAdmission.admission_date}`);
    } catch {
      alert("Failed to create admission.");
    } finally {
      setAdmissionLoading(false);
    }
  };

  const handleDischargeAdmission = async (admission) => {
    try {
      const updated = await api(`/admissions/${admission.id}/discharge`, {
        method: 'PATCH',
        body: { discharge_date: dischargeDate || null },
      });
      setPatientAdmissions(prev => prev.map(a => a.id === admission.id ? updated : a));
      setDischargingAdmissionId(null);
      setDischargeDate('');
    } catch {
      alert('Failed to discharge admission.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !patient) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patient.id);
    formData.append("doc_type", "Clinical Report");
    try {
      const savedDoc = await api("/documents/upload", { method: "POST", body: formData, isForm: true });
      setEditData(prev => ({ ...prev, documents: [savedDoc, ...(prev.documents || [])] }));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Remove this document from the vault?")) return;
    try {
      await api(`/documents/${docId}`, { method: "DELETE" });
      setEditData(prev => ({ ...prev, documents: (prev.documents || []).filter(d => d.id !== docId) }));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleUploadClick = () => navigate('/image/upload', { state: { patient } });
  const handlePrintCard = () => {
    const p = patient;
    const w = window.open('', '_blank', 'width=600,height=400');
    w.document.write(`<html><body style="font-family:sans-serif;padding:40px;text-align:center"><div style="border:2px solid #0f172a;padding:20px;border-radius:10px"><h2>NEUROSIGHT AI</h2><h1>${p.name}</h1><p>ID: ${p.hospital_id}</p><p>Consultant: ${p.assigned_doctor}</p></div></body></html>`);
    w.document.close(); w.print();
  };
  const handleSendReport = () => {
    setSendLoading(true);
    setTimeout(() => { alert(`Report sent to: ${patient.email}`); setSendLoading(false); }, 1500);
  };

  const openCreatePlan = (plan = null) => {
    setEditingPlan(plan);
    setNewPlanForm(plan ? {
      plan_date: plan.plan_date || new Date().toISOString().slice(0, 10),
      plan_type: plan.plan_type || 'Medication',
      title: plan.title || '',
      medications: plan.medications || '',
      therapy_schedule: plan.therapy_schedule || '',
      surgery_details: plan.surgery_details || '',
      notes: plan.notes || '',
    } : {
      plan_date: new Date().toISOString().slice(0, 10),
      plan_type: 'Medication', title: '', medications: '',
      therapy_schedule: '', surgery_details: '', notes: '',
    });
    setShowCreatePlan(true);
  };

  const handleInlineDeletePlan = async (planId) => {
    if (!window.confirm('Delete this treatment plan? This cannot be undone.')) return;
    try {
      await api(`/treatment-plans/${planId}`, { method: 'DELETE' });
      setTreatmentPlans(prev => prev.filter(p => p.id !== planId));
    } catch {
      alert('Failed to delete treatment plan.');
    }
  };

  const handlePrintPlan = (plan) => {
    const w = window.open('', '_blank', 'width=700,height=600');
    w.document.write(`<html><body style="font-family:sans-serif;padding:32px;max-width:600px">
      <h2 style="margin:0 0 4px">Treatment Plan</h2>
      <p style="color:#64748b;margin:0 0 20px">${patient?.name} · ${patient?.hospital_id}</p>
      <hr/>
      <h3 style="margin:16px 0 4px">${plan.title}</h3>
      <p style="margin:0 0 8px;color:#475569">${plan.plan_type} &nbsp;·&nbsp; ${plan.plan_date} &nbsp;·&nbsp; ${plan.created_by_name || 'Clinician'} &nbsp;·&nbsp; <strong>${plan.status}</strong></p>
      ${plan.medications ? `<p><strong>Medications:</strong><br/>${plan.medications}</p>` : ''}
      ${plan.therapy_schedule ? `<p><strong>Therapy Schedule:</strong><br/>${plan.therapy_schedule}</p>` : ''}
      ${plan.surgery_details ? `<p><strong>Surgery Details:</strong><br/>${plan.surgery_details}</p>` : ''}
      ${plan.notes ? `<p><strong>Clinical Notes:</strong><br/>${plan.notes}</p>` : ''}
    </body></html>`);
    w.document.close(); w.print();
  };

  const handleInlinePlanStatus = async (plan, newStatus) => {
    try {
      const updated = await api(`/treatment-plans/${plan.id}`, {
        method: 'PUT',
        body: { ...plan, status: newStatus },
      });
      setTreatmentPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
    } catch {
      alert('Failed to update plan status.');
    }
  };

  const handleInlineCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) { alert('Plan title is required.'); return; }
    setPlanSaving(true);
    try {
      if (editingPlan) {
        const updated = await api(`/treatment-plans/${editingPlan.id}`, {
          method: 'PUT',
          body: { ...editingPlan, ...newPlanForm },
        });
        setTreatmentPlans(prev => prev.map(p => p.id === editingPlan.id ? updated : p));
      } else {
        const created = await api('/treatment-plans', {
          method: 'POST',
          body: { ...newPlanForm, patient_id: patient.id, status: 'Active' },
        });
        setTreatmentPlans(prev => [created, ...prev]);
      }
      setShowCreatePlan(false);
      setEditingPlan(null);
    } catch {
      alert('Failed to save treatment plan.');
    } finally {
      setPlanSaving(false);
    }
  };

  const buildInvestigationGroups = () => {
    if (!patient?.results) return [];
    const results = [...patient.results];
    if (patientAdmissions.length === 0) return [{ admission: null, results: results.reverse() }];
    const groups = patientAdmissions.map(adm => ({
      admission: adm,
      results: results.filter(r => r.admission_id === adm.id),
    }));
    const linked = new Set(results.filter(r => r.admission_id).map(r => r.id));
    const orphans = results.filter(r => !linked.has(r.id));
    if (orphans.length > 0) groups.push({ admission: null, results: orphans });
    return groups;
  };

  // ── Tab renderers ──────────────────────────────────────────────────────────

  const SectionTitle = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 2 }}>
      <div style={{ width: 3, height: 14, background: '#b45309', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );

  const hTa = (fieldName, placeholder, rows = 3) => {
    const canEdit = isClinical && pageMode === 'edit';
    return (
      <textarea
        name={fieldName} rows={rows}
        disabled={!canEdit}
        onChange={handleEditChange}
        style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: canEdit ? '1px solid #fcd34d' : '1px solid #fde68a', borderRadius: 8, background: canEdit ? '#fff' : '#fffbeb', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', color: '#334155', cursor: canEdit ? 'text' : 'not-allowed' }}
        value={pageMode === 'edit' ? (editData[fieldName] || '') : (patient?.[fieldName] || '')}
        placeholder={placeholder}
      />
    );
  };

  const renderHistoryTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {patient?.history_ipfs_cid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>⛓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d' }}>Clinical History Anchored to Blockchain</div>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginTop: 2 }}>CID: {patient.history_ipfs_cid}</div>
            {patient.history_tx_hash && (
              <div style={{ marginTop: 2 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all' }}>TX: {patient.history_tx_hash}</div>
                <a href={`https://sepolia.etherscan.io/tx/${patient.history_tx_hash}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                  View on Sepolia →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      <SectionTitle label="Presenting Complaint" />
      {hTa('presentingComplaint', "Doctor's formal description of the chief complaint — onset, character, duration, associated features…", 4)}
      <SectionTitle label="History of Presenting Complaint" />
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', marginBottom: 2 }}>Symptom Analysis</div>
      {hTa('symptomAnalysis', 'Onset, severity, character, radiation, aggravating/relieving factors')}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', marginBottom: 2 }}>Differential Diagnosis</div>
      {hTa('differentialAnalysis', 'Possible differential diagnoses based on presentation')}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', marginBottom: 2 }}>Complications</div>
      {hTa('complications', 'Current or anticipated complications related to the presenting complaint')}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', marginBottom: 2 }}>Risk Factor</div>
      {hTa('riskFactor', 'Identified risk factors — age, comorbidities, lifestyle, exposure')}
      <SectionTitle label="Systemic Review" />
      {hTa('systemicReview', 'Review of systems — cardiovascular, respiratory, neurological, GI, GU, musculoskeletal…')}
      <SectionTitle label="Past Medical History" />
      {hTa('pastMedicalHistory', 'Previous diagnoses, current medications (past → present), surgical history')}
      <SectionTitle label="Family History" />
      {hTa('familyHistory', 'Hereditary conditions, genetic background, relevant family illness')}
      <SectionTitle label="Social History" />
      {hTa('socialHistory', 'Occupation, financial situation, home conditions, lifestyle, smoking, alcohol')}
      <SectionTitle label="Allergy / Drug / Diet History" />
      {hTa('allergyHistory', 'Known drug allergies, adverse reactions, dietary restrictions')}
    </div>
  );

  const renderExaminationTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {patient?.exam_ipfs_cid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>⛓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d' }}>Examination Findings Anchored to Blockchain</div>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginTop: 2 }}>CID: {patient.exam_ipfs_cid}</div>
            {patient.exam_tx_hash && (
              <div style={{ marginTop: 2 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all' }}>TX: {patient.exam_tx_hash}</div>
                <a href={`https://sepolia.etherscan.io/tx/${patient.exam_tx_hash}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                  View on Sepolia →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      <ExamSection label="Examination Findings" hint="General appearance, vital signs, HEENT, chest, abdomen, CNS findings…" fieldName="examinationFindings" canEdit={isClinical && pageMode === 'edit'} value={editData.examinationFindings || ''} onChange={handleEditChange} />
      <ExamSection label="Muscle Power" hint="Upper / lower limb grading (MRC scale 0–5) — proximal & distal groups" fieldName="musclePower" canEdit={isClinical && pageMode === 'edit'} value={editData.musclePower || ''} onChange={handleEditChange} />
      <ExamSection label="Reflex" hint="Deep tendon reflexes (biceps, triceps, knee, ankle) — graded 0–4+; plantar response" fieldName="reflex" canEdit={isClinical && pageMode === 'edit'} value={editData.reflex || ''} onChange={handleEditChange} />
    </div>
  );

  const renderInvestigationTab = () => {
    const groups = buildInvestigationGroups();
    const isEmpty = groups.length === 0 || groups.every(g => g.results.length === 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0d9488' }}>MRI Diagnostic History</div>
          {patientAdmissions.length > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{patientAdmissions.length} admission{patientAdmissions.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isEmpty ? (
            <div style={{ padding: 24, background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0', textAlign: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.6 }}><ellipse cx="12" cy="6" rx="4" ry="3"/><path d="M8 6c0 4-3 6-3 9a3 3 0 0 0 6 0c0 1.5 1 2 2 2s2-.5 2-2a3 3 0 0 0 6 0c0-3-3-5-3-9"/><path d="M12 9v6"/></svg>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', fontWeight: 600 }}>No MRI Scans Analyzed</p>
              <button disabled={pageMode === 'view'} onClick={handleUploadClick} style={{ marginTop: 8, fontSize: 10, color: pageMode === 'view' ? '#94a3b8' : '#0d9488', fontWeight: 700, background: 'none', border: 'none', cursor: pageMode === 'view' ? 'not-allowed' : 'pointer', textDecoration: 'underline', opacity: pageMode === 'view' ? 0.5 : 1 }}>Analyze MRI Now</button>
            </div>
          ) : groups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.admission ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: group.admission.status === 'Active' ? '#f0fdf4' : '#f8fafc', borderRadius: 8, marginBottom: 6, border: `1px solid ${group.admission.status === 'Active' ? '#bbf7d0' : '#e2e8f0'}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: group.admission.status === 'Active' ? '#15803d' : '#475569' }}>Admission #{group.admission.episode_number}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>—</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono',monospace" }}>{group.admission.admission_date}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 12, background: group.admission.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: group.admission.status === 'Active' ? '#15803d' : '#6b7280' }}>{group.admission.status}</span>
                </div>
              ) : group.results.length > 0 && (
                <div style={{ fontSize: 10, color: '#94a3b8', padding: '4px 10px', marginBottom: 4 }}>Pre-admission scans</div>
              )}
              {group.results.length === 0 ? (
                <div style={{ padding: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center', background: '#f8fafc', borderRadius: 8 }}>No scans for this admission</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: group.admission ? 10 : 0 }}>
                  {group.results.map((res, idx) => (
                    <div key={idx} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>MRI #{group.results.length - idx}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 20 }}>
                          {res.created_at ? new Date(res.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <div style={{ padding: '10px 12px', display: 'flex', gap: 12 }}>
                        <img src={`http://127.0.0.1:8000/uploaded_mris/${res.filename}`} alt="MRI" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f5f9', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>AI Classification</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{res.predicted_label}</div>
                          {res.confirmed_label && (
                            <div style={{ marginTop: 3 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, background: '#f0fdf4', color: '#15803d', padding: '2px 7px', borderRadius: 10 }}>
                                Confirmed: {res.confirmed_label}{res.pathology_grade && ` Gr.${res.pathology_grade}`}
                                {res.ipfs_cid && (
                                  <span onClick={e => { e.stopPropagation(); setChainInfoId(chainInfoId === `result-${res.id}` ? null : `result-${res.id}`); }} title="View blockchain record" style={{ cursor: 'pointer', marginLeft: 2, fontSize: 10 }}>⛓</span>
                                )}
                              </span>
                              {chainInfoId === `result-${res.id}` && res.ipfs_cid && (
                                <div style={{ marginTop: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px' }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>Blockchain Record</div>
                                  <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>CID: {res.ipfs_cid}</div>
                                  {res.tx_hash && (
                                    <>
                                      <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 4 }}>TX: {res.tx_hash}</div>
                                      <a href={`https://sepolia.etherscan.io/tx/${res.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>View on Sepolia →</a>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <div style={{ marginTop: 6 }}>
                            <button onClick={() => navigate('/image/results', { state: { patient, analysisResult: res } })}
                              style={{ fontSize: 9, background: '#4f46e5', color: '#fff', padding: '4px 10px', borderRadius: 6, fontWeight: 800, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                              View Analysis →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button disabled={pageMode === 'view'} onClick={handleUploadClick}
          style={{ width: '100%', padding: '11px 0', border: `2px dashed ${pageMode === 'view' ? '#e2e8f0' : '#ccfbf1'}`, borderRadius: 12, color: pageMode === 'view' ? '#94a3b8' : '#0d9488', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'transparent', cursor: pageMode === 'view' ? 'not-allowed' : 'pointer', opacity: pageMode === 'view' ? 0.6 : 1 }}>
          + Upload New MRI Scan
        </button>
      </div>
    );
  };

  const renderTreatmentTab = () => {
    const canManage = currentUser.role === 'Clinician' || currentUser.role === 'Super Admin';
    const showActions = pageMode === 'edit';
    const activeCount    = treatmentPlans.filter(p => p.status === 'Active').length;
    const completedCount = treatmentPlans.filter(p => p.status === 'Completed').length;
    const total          = treatmentPlans.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1e40af' }}>Management Upto Now</div>
          {showActions && (
            <button onClick={() => openCreatePlan()} disabled={!canManage}
              style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 7, background: !canManage ? '#e2e8f0' : '#0d9488', color: !canManage ? '#94a3b8' : '#fff', border: 'none', cursor: !canManage ? 'not-allowed' : 'pointer', opacity: !canManage ? 0.6 : 1 }}>
              + New Plan
            </button>
          )}
        </div>

        {total > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Active',    value: activeCount,    bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
              { label: 'Completed', value: completedCount, bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
              { label: 'Total',     value: total,          bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, padding: '8px 10px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: s.color, opacity: 0.75 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {treatmentPlans.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.6 }}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', fontWeight: 600 }}>No treatment plans yet</p>
            <button onClick={() => openCreatePlan()} disabled={!canManage || !showActions} style={{ marginTop: 8, fontSize: 10, color: (!canManage || !showActions) ? '#94a3b8' : '#0d9488', fontWeight: 700, background: 'none', border: 'none', cursor: (!canManage || !showActions) ? 'not-allowed' : 'pointer', textDecoration: !showActions ? 'none' : 'underline', opacity: (!canManage || !showActions) ? 0.5 : 1 }}>Create First Plan</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {treatmentPlans.map(plan => {
              const sm = {
                Active:    { bg: '#eff6ff', border: '#bfdbfe', badge: '#1e40af' },
                Completed: { bg: '#f0fdf4', border: '#bbf7d0', badge: '#15803d' },
                Cancelled: { bg: '#fef2f2', border: '#fecaca', badge: '#b91c1c' },
              }[plan.status] || { bg: '#f8fafc', border: '#e2e8f0', badge: '#94a3b8' };

              return (
                <div key={plan.id} style={{ borderRadius: 12, border: `1px solid ${sm.border}`, background: sm.bg, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{plan.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: sm.badge, color: '#fff', flexShrink: 0 }}>{plan.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{plan.plan_type} · {plan.plan_date} · {plan.created_by_name || 'Clinician'}</div>
                    {plan.medications     && <div style={{ fontSize: 11, color: '#1e40af', marginTop: 3 }}>Rx: {plan.medications}</div>}
                    {plan.therapy_schedule && <div style={{ fontSize: 11, color: '#6d28d9', marginTop: 3 }}>Schedule: {plan.therapy_schedule}</div>}
                    {plan.surgery_details  && <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 3 }}>Surgery: {plan.surgery_details}</div>}
                    {plan.notes           && <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, fontStyle: 'italic' }}>{plan.notes}</div>}
                    {plan.ipfs_cid && (
                      <div style={{ marginTop: 6 }}>
                        <span onClick={() => setChainInfoId(chainInfoId === `plan-${plan.id}` ? null : `plan-${plan.id}`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 10, cursor: 'pointer' }}>
                          ⛓ Anchored to Blockchain
                        </span>
                        {chainInfoId === `plan-${plan.id}` && (
                          <div style={{ marginTop: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>Blockchain Record</div>
                            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>CID: {plan.ipfs_cid}</div>
                            {plan.tx_hash && (
                              <>
                                <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 4 }}>TX: {plan.tx_hash}</div>
                                <a href={`https://sepolia.etherscan.io/tx/${plan.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>View on Sepolia →</a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {showActions && (
                    <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: `1px solid ${sm.border}`, background: 'rgba(255,255,255,0.65)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => openCreatePlan(plan)} disabled={!canManage || plan.status === 'Completed' || plan.status === 'Cancelled'}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: (!canManage || plan.status !== 'Active') ? '#f1f5f9' : '#f0fdfa', color: (!canManage || plan.status !== 'Active') ? '#94a3b8' : '#0d9488', border: (!canManage || plan.status !== 'Active') ? '1px solid #e2e8f0' : '1px solid #99f6e4', cursor: (!canManage || plan.status !== 'Active') ? 'not-allowed' : 'pointer', opacity: (!canManage || plan.status !== 'Active') ? 0.6 : 1 }}>
                        ✎ Edit
                      </button>
                      <button onClick={() => handlePrintPlan(plan)}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                        ⎙ Print
                      </button>
                      {plan.status === 'Active' && (
                        <>
                          <button onClick={() => handleInlinePlanStatus(plan, 'Completed')} disabled={!canManage}
                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', cursor: !canManage ? 'not-allowed' : 'pointer', opacity: !canManage ? 0.5 : 1 }}>
                            ✓ Mark as Done
                          </button>
                          <button onClick={() => handleInlinePlanStatus(plan, 'Cancelled')} disabled={!canManage}
                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', cursor: !canManage ? 'not-allowed' : 'pointer', opacity: !canManage ? 0.5 : 1 }}>
                            ✕ Deactivate
                          </button>
                        </>
                      )}
                      {(plan.status === 'Completed' || plan.status === 'Cancelled') && (
                        <button onClick={() => handleInlinePlanStatus(plan, 'Active')} disabled={!canManage}
                          style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', cursor: !canManage ? 'not-allowed' : 'pointer', opacity: !canManage ? 0.5 : 1 }}>
                          ↺ Reactivate
                        </button>
                      )}
                      <button onClick={() => handleInlineDeletePlan(plan.id)} disabled={!canManage}
                        style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: !canManage ? 'not-allowed' : 'pointer', marginLeft: 'auto', opacity: !canManage ? 0.5 : 1 }}>
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1e40af' }}>Doctor's Observations</div>
            {!['Doctor', 'Clinician', 'Super Admin'].includes(currentUser.role) && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#f87171' }}>Locked (Doctor Only)</span>
            )}
          </div>
          <textarea name="doctorNotes" rows={5}
            disabled={pageMode === 'view' || !['Doctor', 'Clinician', 'Super Admin'].includes(currentUser.role)}
            onChange={handleEditChange}
            style={{ width: '100%', padding: 12, fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif",
              background: pageMode === 'edit' && ['Doctor', 'Clinician', 'Super Admin'].includes(currentUser.role) ? '#fff' : '#f8fafc',
              color: '#475569', boxSizing: 'border-box' }}
            value={pageMode === 'edit' ? (editData.doctorNotes || '') : (patient?.doctorNotes || '')}
            placeholder="Clinical findings, differential diagnosis, clinical judgment (Doctor / Clinician only)…"
          />
        </div>
      </div>
    );
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollResult(null);
    try {
      const res = await api(`/enrollment/${id}`, { method: 'POST' });
      setEnrollResult(res);
      setEnrollmentStatus({ enrolled: true, status: 'sent' });
    } catch (err) {
      setEnrollResult({ success: false, error: err.message });
    } finally {
      setEnrolling(false);
    }
  };

  const renderMonitoringTab = () => {
    const checkins = (monitoringCheckins || []).map(c => {
      // transform backend shape to what the UI expects
      const dt = c.created_at ? new Date(c.created_at) : null;
      const date = dt ? dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const time = dt ? dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
      return {
        id: c.id,
        date,
        time,
        _dt: dt,
        _dateKey: dt ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}` : null,
        score: c.score,
        level: c.level || (c.emergency ? 'CRITICAL' : 'GREEN'),
        headache: c.headache,
        seizure: c.seizure,
        energy: c.energy,
        nausea: c.nausea,
        medication: c.medication,
        overall: c.overall,
        note: c.note || '',
      };
    });
    const stats = checkins.reduce((acc, c) => {
      acc.total += 1;
      const level = (c.level || '').toUpperCase();
      if (level === 'GREEN') acc.green += 1;
      else if (level === 'AMBER') acc.amber += 1;
      else if (level === 'RED' || level === 'CRITICAL') acc.red += 1;
      else if (typeof c.score === 'number') {
        if (c.score >= 12) acc.red += 1;
        else if (c.score >= 6) acc.amber += 1;
        else acc.green += 1;
      }
      return acc;
    }, { total: 0, green: 0, amber: 0, red: 0 });
    const latestCheckin = checkins[0] || null;
    const daysWithCheckins = new Set(checkins.map(c => c.date)).size;
    const lastActive = latestCheckin ? `${latestCheckin.date}${latestCheckin.time ? ` · ${latestCheckin.time}` : ''}` : 'No recent activity';
    const alerts = (monitoringAlerts || []).map(alert => ({
      type: alert.emergency ? 'EMERGENCY' : 'ALERT',
      time: alert.created_at ? new Date(alert.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
      symptom: alert.message || 'Emergency submission',
      detail: alert.reply || 'Sent from mobile app',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
    }));
    const levelMeta = l => ({ CRITICAL: { bg: '#4c0519', text: '#fff', label: 'CRITICAL' }, RED: { bg: '#dc2626', text: '#fff', label: 'RED' }, AMBER: { bg: '#f59e0b', text: '#fff', label: 'AMBER' }, GREEN: { bg: '#16a34a', text: '#fff', label: 'GREEN' } }[l] || { bg: '#94a3b8', text: '#fff', label: l });

    const _fmtKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const _byDateKey = {};
    checkins.forEach(c => { if (c._dateKey) { (_byDateKey[c._dateKey] = _byDateKey[c._dateKey] || []).push(c); } });
    const _levelOrder = ['GREEN','AMBER','RED','CRITICAL'];
    const _worstLevel = cks => { let w = -1; cks.forEach(c => { const idx = _levelOrder.indexOf((c.level||'').toUpperCase()); if (idx > w) w = idx; }); return w >= 0 ? _levelOrder[w] : 'GREEN'; };
    const _enrollDt = enrollmentStatus?.enrolled_at ? new Date(enrollmentStatus.enrolled_at) : null;
    const _firstCkDt = checkins.length > 0 && checkins[checkins.length-1]?._dt ? checkins[checkins.length-1]._dt : null;
    const _trackStart = _enrollDt || _firstCkDt;
    const _todayMid = new Date(); _todayMid.setHours(0, 0, 0, 0);
    const _todayDow = _todayMid.getDay();
    const _thisWeekSun = new Date(_todayMid);
    _thisWeekSun.setDate(_todayMid.getDate() + (_todayDow === 0 ? 0 : 7 - _todayDow));
    const _calEnd = new Date(_thisWeekSun);
    _calEnd.setDate(_thisWeekSun.getDate() - calWeeksBack * 7);
    const _calStart = new Date(_calEnd);
    _calStart.setDate(_calEnd.getDate() - 27);
    const _canGoForward = calWeeksBack > 0;
    const _calCells = (() => {
      const cells = [];
      const cur = new Date(_calStart);
      for (let i = 0; i < 28; i++) {
        const k = _fmtKey(cur);
        const dayCks = _byDateKey[k] || [];
        let st = 'outside';
        if (cur > _todayMid) {
          st = 'future';
        } else if (_trackStart) {
          const tsm = new Date(_trackStart); tsm.setHours(0, 0, 0, 0);
          if (cur >= tsm) st = dayCks.length > 0 ? _worstLevel(dayCks) : 'MISSED';
        } else if (dayCks.length > 0) {
          st = _worstLevel(dayCks);
        }
        cells.push({ d: new Date(cur), key: k, dayCks, status: st });
        cur.setDate(cur.getDate() + 1);
      }
      return cells;
    })();
    const _missedCount = _calCells.filter(c => c.status === 'MISSED').length;
    const _fullLog = (() => {
      const missed = [];
      if (_trackStart) {
        const tsm = new Date(_trackStart); tsm.setHours(0, 0, 0, 0);
        const yest = new Date(_todayMid); yest.setDate(_todayMid.getDate() - 1);
        const cur = new Date(yest);
        while (cur >= tsm) {
          const k = _fmtKey(cur);
          if (!_byDateKey[k]) missed.push({ _type: 'missed', _dateKey: k, date: cur.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) });
          cur.setDate(cur.getDate() - 1);
        }
      }
      return [...checkins.map(c => ({ ...c, _type: 'checkin' })), ...missed]
        .sort((a, b) => {
          if (!a._dateKey || !b._dateKey) return 0;
          if (b._dateKey !== a._dateKey) return b._dateKey.localeCompare(a._dateKey);
          if (a._type === 'missed') return 1;
          if (b._type === 'missed') return -1;
          return ((b._dt || 0) - (a._dt || 0));
        });
    })();

    const MON_TABS = [
      { key: 'checkin',        label: 'Check-in history' },
      { key: 'emergency',      label: 'Emergency' },
      { key: 'symptom_report', label: 'Symptom report' },
      { key: 'medication',     label: 'Medication' },
      { key: 'chat',           label: 'Chat history' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Enrolled banner */}
        <div style={{ borderRadius: 12, border: '1px solid #bfdbfe', background: '#eff6ff', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>{patient?.name || 'Patient'} — Monitoring</div>
                <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>Code: <strong style={{ fontFamily: "'DM Mono',monospace" }}>{patient?.hospitalId || patient?.hospital_id || '—'}</strong> · Live check-ins · {enrollmentStatus?.reminder_time ? `Reminder ${(() => { const [h, m] = (enrollmentStatus.reminder_time).split(':').map(Number); const p = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${p}`; })()}` : 'Reminder not set'}</div>
                <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 1 }}>Last active: {enrollmentStatus?.last_active_at ? new Date(enrollmentStatus.last_active_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : lastActive} · Check-ins: {daysWithCheckins} day{daysWithCheckins === 1 ? '' : 's'}</div>
              </div>
            </div>
            {/* Enroll / status button — Doctor, Clinician, Super Admin, Assistant */}
            {['Doctor', 'Clinician', 'Super Admin', 'Assistant'].includes(currentUser.role) && (() => {
              const st = enrollmentStatus?.status;
              if (st === 'active') {
                return <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: '#16a34a', color: '#fff' }}>Active</span>;
              }
              if (st === 'sent') {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: '#f59e0b', color: '#fff' }}>Link Sent</span>
                    <button onClick={handleEnroll} disabled={enrolling}
                      onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(29,78,216,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = 'none'; }}
                      style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                      Resend
                    </button>
                  </div>
                );
              }
              return (
                <button onClick={handleEnroll} disabled={enrolling}
                  style={{ fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 8, background: enrolling ? '#94a3b8' : '#0d9488', color: '#fff', border: 'none', cursor: enrolling ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                  {enrolling ? 'Enrolling…' : 'Enroll'}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Enroll result banner */}
        {enrollResult && (
          <div style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${enrollResult.success ? '#bbf7d0' : '#fecaca'}`, background: enrollResult.success ? '#f0fdf4' : '#fef2f2', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: enrollResult.success ? '#15803d' : '#b91c1c' }}>
              {enrollResult.success ? 'Patient enrolled successfully' : 'Enrollment failed'}
            </div>
            {enrollResult.success && (
              <>
                {enrollResult.email_sent && <div style={{ fontSize: 10, color: '#15803d' }}>Email sent to patient</div>}
                {enrollResult.sms_sent && <div style={{ fontSize: 10, color: '#15803d' }}>SMS sent to patient</div>}
                {!enrollResult.email_sent && !enrollResult.sms_sent && (
                  <div style={{ fontSize: 10, color: '#92400e' }}>No email/SMS configured — share this link manually:</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <input readOnly value={enrollResult.link} style={{ flex: 1, fontSize: 10, padding: '4px 8px', border: '1px solid #bbf7d0', borderRadius: 6, background: '#fff', fontFamily: "'DM Mono',monospace", color: '#0f172a' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <button onClick={() => { navigator.clipboard.writeText(enrollResult.link); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                      onMouseEnter={e => { if (!linkCopied) { e.currentTarget.style.background = '#0f766e'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(13,148,136,0.35)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = linkCopied ? '#15803d' : '#0d9488'; e.currentTarget.style.boxShadow = 'none'; }}
                      style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: linkCopied ? '#15803d' : '#0d9488', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s', minWidth: 52, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', width: '100%' }}>
                      {linkCopied
                        ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                        : 'Copy'}
                    </button>
                    <button onClick={() => setEnrollResult(null)}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.textDecoration = 'none'; }}
                      style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', letterSpacing: '0.02em' }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Next visit + App usage */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(() => {
            const activeAdm = patientAdmissions.find(a => a.status === 'Active');
            return (
              <div style={{ borderRadius: 10, border: `1px solid ${activeAdm ? '#bbf7d0' : '#e2e8f0'}`, background: activeAdm ? '#f0fdf4' : '#fff', padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: activeAdm ? '#15803d' : '#64748b', fontWeight: 500 }}>{activeAdm ? 'In hospital' : 'Next visit'}</span>
                  {activeAdm ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', fontFamily: "'DM Mono',monospace" }}>
                      since {activeAdm.admission_date || '—'}
                    </span>
                  ) : editingNextVisit ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        type="date"
                        value={nextVisitInput}
                        onChange={e => setNextVisitInput(e.target.value)}
                        style={{ fontSize: 10, border: '1px solid #cbd5e1', borderRadius: 6, padding: '2px 6px', outline: 'none' }}
                      />
                      <button onClick={saveNextVisitDate} style={{ fontSize: 10, padding: '2px 8px', border: 'none', borderRadius: 6, background: '#0d9488', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                      <button onClick={() => setEditingNextVisit(false)} style={{ fontSize: 10, padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', cursor: 'pointer' }}>×</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: patient?.next_visit_date ? '#0f172a' : '#94a3b8', fontFamily: "'DM Mono',monospace" }}>
                        {patient?.next_visit_date || '—'}
                      </span>
                      {['Doctor', 'Clinician', 'Super Admin', 'Assistant'].includes(currentUser.role) && (
                        <button onClick={() => { setNextVisitInput(patient?.next_visit_date || ''); setEditingNextVisit(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 8 }}>App Usage</div>
            {[
              { label: 'Language',   value: ({ en: 'English', si: 'Sinhala', ta: 'Tamil' }[enrollmentStatus?.preferred_language]) || '—' },
              { label: 'User type',  value: 'Patient' },
              { label: 'Last active',value: enrollmentStatus?.last_active_at ? new Date(enrollmentStatus.last_active_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : lastActive },
              { label: 'Check-ins',  value: `${daysWithCheckins} day${daysWithCheckins === 1 ? '' : 's'} recorded` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5, marginBottom: 5, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>{row.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#334155' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0' }}>
          {MON_TABS.map(t => {
            const active = monitoringSubTab === t.key;
            return (
              <button key={t.key} onClick={() => setMonitoringSubTab(t.key)}
                style={{ padding: '8px 16px', fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#0d9488' : '#64748b', background: 'none', border: 'none', borderBottom: active ? '2px solid #0d9488' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Check-in history */}
        {monitoringSubTab === 'checkin' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Total Check-ins', value: stats.total, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
                { label: 'GREEN', value: stats.green, bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                { label: 'AMBER', value: stats.amber, bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
                { label: 'RED / Critical', value: stats.red, bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 8px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 4-week calendar heatmap */}
            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>4-Week Overview</span>
                  {_missedCount > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{_missedCount} missed</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono',monospace" }}>
                    {_calStart.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} – {_calCells[_calCells.length-1]?.d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <button onClick={() => setCalWeeksBack(w => w + 4)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}>‹</button>
                  <button onClick={() => setCalWeeksBack(w => Math.max(0, w - 4))} disabled={!_canGoForward} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: _canGoForward ? '#f8fafc' : '#fafafa', color: _canGoForward ? '#475569' : '#cbd5e1', cursor: _canGoForward ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}>›</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <div key={d} style={{ fontSize: 8, fontWeight: 700, color: '#cbd5e1', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {_calCells.map((cell, i) => {
                  const bg = { GREEN: '#16a34a', AMBER: '#f59e0b', RED: '#dc2626', CRITICAL: '#7f1d1d', MISSED: '#e2e8f0', outside: '#f1f5f9', future: '#f1f5f9' }[cell.status] || '#e2e8f0';
                  const isToday = cell.key === _fmtKey(_todayMid);
                  const isActive = ['GREEN','AMBER','RED','CRITICAL','MISSED'].includes(cell.status);
                  const textColor = ['GREEN','AMBER','RED','CRITICAL'].includes(cell.status) ? '#fff' : cell.status === 'MISSED' ? '#64748b' : '#64748b';
                  const tipLabel = cell.status === 'MISSED' ? 'Missed' : cell.status === 'outside' ? 'Before tracking' : cell.status === 'future' ? 'Upcoming' : cell.status;
                  return (
                    <div key={i}
                      title={`${cell.d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} — ${tipLabel}`}
                      style={{ height: 22, borderRadius: 4, background: bg, border: isToday ? '2px solid #0d9488' : `1px solid ${isActive ? 'transparent' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 7, fontWeight: 600, color: textColor, userSelect: 'none' }}>{cell.d.getDate()}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {[{ bg: '#16a34a', label: 'Green' }, { bg: '#f59e0b', label: 'Amber' }, { bg: '#dc2626', label: 'Red / Critical' }, { bg: '#e2e8f0', label: 'Missed' }].map(({ bg, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: bg }} />
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily log */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: 8 }}>Daily Check-in Log</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {_fullLog.length > 0 ? _fullLog.map((entry, i) => {
                  if (entry._type === 'missed') {
                    return (
                      <div key={`missed-${entry._dateKey}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 6, background: '#e2e8f0', color: '#94a3b8', flexShrink: 0, letterSpacing: '0.04em' }}>MISSED</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{entry.date}</span>
                        <span style={{ fontSize: 9, color: '#cbd5e1', marginLeft: 'auto', fontStyle: 'italic' }}>No check-in recorded</span>
                      </div>
                    );
                  }
                  const lm = levelMeta(entry.level);
                  const isOpen = expandedCheckin === i;
                  return (
                    <div key={`ck-${entry.id || i}`} style={{ borderRadius: 8, border: '1px solid #f1f5f9', borderLeft: `3px solid ${lm.bg}`, background: '#fff', overflow: 'hidden' }}>
                      <div onClick={() => setExpandedCheckin(isOpen ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}>
                        <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 6, background: lm.bg, color: lm.text, flexShrink: 0 }}>{lm.label}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{entry.date}</div>
                          <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono',monospace" }}>{entry.time} · Score: {entry.score}</div>
                        </div>
                        {entry.note && <span style={{ fontSize: 9, color: '#64748b', fontStyle: 'italic', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.note}</span>}
                        <span style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 4 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '0 12px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', borderTop: '1px solid #f8fafc' }}>
                          {[{ q: 'Headache', a: entry.headache }, { q: 'Seizure', a: entry.seizure }, { q: 'Energy', a: entry.energy }, { q: 'Nausea', a: entry.nausea }, { q: 'Medication', a: entry.medication }, { q: 'Overall', a: entry.overall }].map(({ q, a }) => (
                            <div key={q} style={{ paddingTop: 6 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{q}</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{a}</div>
                            </div>
                          ))}
                          {entry.note && (
                            <div style={{ gridColumn: '1 / -1', paddingTop: 6 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Patient Note</div>
                              <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>{entry.note}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ padding: 16, borderRadius: 10, border: '1px dashed #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
                    No check-ins found for this patient.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Emergency alerts */}
        {monitoringSubTab === 'emergency' && (() => {
          const detectSource = (msg) => {
            const m = msg || '';
            if (m.startsWith('Symptom report from')) return { label: 'Symptom Report', bg: '#fdf4ff', text: '#7e22ce' };
            if (/Daily Check.in/i.test(m))             return { label: 'Daily Check-in',  bg: '#eff6ff', text: '#1d4ed8' };
            if (/Emergency alert from.*GPS/i.test(m)) return { label: 'GPS Emergency',   bg: '#fff7ed', text: '#c2410c' };
            if (/Emergency alert from/i.test(m))      return { label: 'Emergency Alert', bg: '#fff7ed', text: '#c2410c' };
            return                                           { label: 'Chat Message',     bg: '#f1f5f9', text: '#475569' };
          };

          const parseEmergencyMsg = (raw) => {
            const parts = (raw || '').split(' | ');
            const fields = {};
            let title = '';
            parts.forEach((p, idx) => {
              if (idx === 0) { title = p; return; }
              const sep = p.indexOf(':');
              if (sep > -1) {
                const k = p.slice(0, sep).trim();
                const v = p.slice(sep + 1).trim().replace(/\.$/, '');
                if (k && v) fields[k] = v;
              }
            });
            const isFreeText = parts.length === 1;
            return { title, fields, isFreeText };
          };

          const fieldOrder = ['Type', 'Symptom', 'Severity', 'Started', 'Location', 'Ambulance requested', 'Note'];
          const severityColor = (s) => {
            const sl = (s || '').toLowerCase();
            if (sl === 'severe' || sl === 'critical') return { bg: '#4c0519', text: '#fff' };
            if (sl === 'moderate') return { bg: '#b45309', text: '#fff' };
            if (sl === 'mild') return { bg: '#f59e0b', text: '#1c1917' };
            return { bg: '#64748b', text: '#fff' };
          };

          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#dc2626' }}>Emergency Alerts</span>
                <span style={{ background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>{alerts.length}</span>
                <button
                  onClick={() => navigate('/patient-alerts')}
                  style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 7, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Respond
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.length > 0 ? (monitoringAlerts || []).map((raw, i) => {
                  const { title, fields, isFreeText } = parseEmergencyMsg(raw.message);
                  const dt = raw.created_at ? new Date(raw.created_at) : null;
                  const dateStr = dt ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  const timeStr = dt ? dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
                  const alertType = raw.emergency ? 'EMERGENCY' : 'ALERT';
                  const source = detectSource(raw.message);
                  const sev = fields['Severity'];
                  const sevStyle = sev ? severityColor(sev) : null;
                  const orderedFields = fieldOrder.filter(k => fields[k] !== undefined);
                  const otherFields = Object.keys(fields).filter(k => !fieldOrder.includes(k) && k !== 'Please review immediately in the web dashboard');

                  return (
                    <div key={i} style={{ borderRadius: 14, border: '1px solid #fecaca', background: '#fff', overflow: 'hidden' }}>
                      {/* Card header */}
                      <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 8, background: '#dc2626', color: '#fff' }}>{alertType}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: source.bg, color: source.text }}>{source.label}</span>
                          {sev && (
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 8, background: sevStyle.bg, color: sevStyle.text }}>{sev}</span>
                          )}
                          {fields['Ambulance requested'] === 'Yes' && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#7f1d1d', color: '#fef2f2' }}>Ambulance</span>
                          )}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
                          {dateStr}{timeStr ? ` · ${timeStr}` : ''}
                        </span>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Title row */}
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#7f1d1d' }}>{title}</div>

                        {/* Structured fields */}
                        {!isFreeText && (orderedFields.length > 0 || otherFields.length > 0) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {[...orderedFields, ...otherFields].filter(k => k !== 'Severity' && !(k === 'Ambulance requested' && fields[k] === 'Yes')).map(k => (
                              <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', minWidth: 80, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                                <span style={{ fontSize: 11, color: '#1e293b', fontWeight: 500 }}>{fields[k]}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => navigate('/patient-alerts')}
                          style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: 10, fontWeight: 700, padding: '5px 13px', borderRadius: 7, border: 'none', background: raw.acknowledged_at ? '#f0fdf4' : '#dc2626', color: raw.acknowledged_at ? '#059669' : '#fff', cursor: 'pointer' }}
                        >
                          {raw.acknowledged_at ? 'Responded' : 'Respond to Alert'}
                        </button>

                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '14px 12px', borderRadius: 10, border: '1px dashed #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12 }}>
                    No emergency alerts for this patient.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Symptom reports — non-emergency new symptoms submitted from mobile */}
        {monitoringSubTab === 'symptom_report' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0d9488', marginBottom: 4 }}>
              Patient-Reported Symptoms
              <span style={{ background: '#0d9488', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10, marginLeft: 6 }}>{symptomReports.length}</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
              Irregular symptoms the patient has flagged outside of daily check-in or emergency.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {symptomReports.length > 0 ? symptomReports.map((r, i) => {
                const dt = r.created_at ? new Date(r.created_at) : null;
                const dateStr = dt ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                const timeStr = dt ? dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

                // Parse "New symptom: X, Y | Details: Z" into structured parts
                const parts = (r.message || '').split(' | ');
                const symptomLine = parts.find(p => p.startsWith('New symptom:'));
                const detailLine  = parts.find(p => p.startsWith('Details:'));
                const symptoms    = symptomLine ? symptomLine.replace('New symptom:', '').trim().split(',').map(s => s.trim()).filter(Boolean) : [];
                const details     = detailLine  ? detailLine.replace('Details:', '').trim() : '';

                return (
                  <div key={i} style={{ borderRadius: 14, border: '1px solid #ccfbf1', background: '#fff', overflow: 'hidden' }}>
                    {/* Coloured header bar */}
                    <div style={{ background: '#f0fdfa', borderBottom: '1px solid #ccfbf1', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                        </svg>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f766e' }}>Symptom Report</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#5eead4', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
                        {dateStr}{timeStr ? ` · ${timeStr}` : ''}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Symptom chips */}
                      {symptoms.length > 0 && (
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 6 }}>Reported Symptoms</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {symptoms.map((s, si) => (
                              <span key={si} style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', background: '#ccfbf1', border: '1px solid #99f6e4', borderRadius: 20, padding: '3px 10px' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient description */}
                      {details && (
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 4 }}>Patient's Description</div>
                          <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>"{details}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '16px 12px', borderRadius: 10, border: '1px dashed #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
                  No symptom reports submitted by this patient yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat history */}
        {monitoringSubTab === 'chat' && (() => {
          if (!chatHistory.length && !chatLoading) {
            api(`/patients/${patient.id}/chat`).then(data => {
              setChatHistory(Array.isArray(data) ? data : []);
              setChatLoading(false);
            }).catch(() => setChatLoading(false));
            setChatLoading(true);
          }

          const emergencyCount = chatHistory.filter(m => m.emergency && !/^Emergency alert from/i.test(m.user_message || '')).length;

          const TOPIC_CONFIG = {
            emergency: { label: 'Emergency', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
            diagnosis: { label: 'Diagnosis', bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
            treatment: { label: 'Treatment', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
            nutrition: { label: 'Nutrition', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
            symptom:   { label: 'Symptoms',  bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
            general:   { label: 'General',   bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
          };

          const fmtTime = dt => dt ? new Date(dt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
          const fmtDate = dt => dt ? new Date(dt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '';

          const groupByDate = (msgs) => {
            const groups = [];
            let lastKey = null;
            msgs.forEach(msg => {
              const key = msg.created_at ? new Date(msg.created_at).toDateString() : 'Unknown';
              if (key !== lastKey) { groups.push({ dateLabel: fmtDate(msg.created_at), items: [] }); lastKey = key; }
              groups[groups.length - 1].items.push(msg);
            });
            return groups;
          };

          const groups = groupByDate(chatHistory);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Total',     value: chatHistory.length,                     bg: '#f8fafc', color: '#0f172a',  border: '#e2e8f0' },
                  { label: 'Emergency', value: emergencyCount,                         bg: emergencyCount > 0 ? '#fef2f2' : '#f8fafc', color: emergencyCount > 0 ? '#dc2626' : '#94a3b8', border: emergencyCount > 0 ? '#fecaca' : '#e2e8f0' },
                  { label: 'Normal',    value: chatHistory.filter(m => !m.emergency).length, bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px 12px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: s.color, opacity: 0.75, marginTop: 4, letterSpacing: '0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Emergency banner */}
              {emergencyCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{emergencyCount} emergency message{emergencyCount !== 1 ? 's' : ''} flagged in this conversation</div>
                    <div style={{ fontSize: 10, color: '#ef4444', marginTop: 1 }}>Patient reported urgent symptoms. Please review the highlighted messages below.</div>
                  </div>
                </div>
              )}

              {/* Chat window */}
              {chatLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <div style={{ width: 22, height: 22, border: '2px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'chatSpin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Loading conversation…</div>
                  <style>{`@keyframes chatSpin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : chatHistory.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 14, border: '1px dashed #e2e8f0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>No messages yet</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>When this patient uses the care assistant on their mobile app, the conversation will appear here.</div>
                </div>
              ) : (
                <div style={{ background: '#eef2f7', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

                  {/* Chat header bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 2px rgba(13,148,136,0.18)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>NeuroSight Care Assistant</div>
                      <div style={{ fontSize: 10, color: '#0d9488', marginTop: 1 }}>Conversation with {patient.name}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: 20, border: '1px solid #e2e8f0', flexShrink: 0 }}>{chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Message scroll area */}
                  <div style={{ maxHeight: 500, overflowY: 'auto', padding: '16px 14px 10px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {groups.map((group, gi) => (
                      <div key={gi}>
                        {/* Date divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: gi === 0 ? '0 0 16px' : '8px 0 16px' }}>
                          <div style={{ flex: 1, height: 1, background: '#d1d5db' }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', background: '#dce3ec', padding: '3px 11px', borderRadius: 20, whiteSpace: 'nowrap' }}>{group.dateLabel}</span>
                          <div style={{ flex: 1, height: 1, background: '#d1d5db' }} />
                        </div>

                        {group.items.map(msg => {
                          const tc = TOPIC_CONFIG[msg.topic] || TOPIC_CONFIG.general;
                          const isEmergency = msg.emergency;
                          return (
                            <div key={msg.id} style={{ marginBottom: 20 }}>

                              {/* Emergency strip */}
                              {isEmergency && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '5px 11px', background: '#dc2626', borderRadius: 8 }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency Message</span>
                                </div>
                              )}

                              {/* Topic + timestamp row */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 9px', borderRadius: 20, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, letterSpacing: '0.06em' }}>{tc.label}</span>
                                <span style={{ fontSize: 10, color: '#6b7280', fontFamily: "'DM Mono',monospace" }}>{fmtTime(msg.created_at)}</span>
                              </div>

                              {/* Patient bubble — right-aligned */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                                <div style={{ maxWidth: '84%' }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: isEmergency ? '#dc2626' : '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', marginBottom: 4 }}>{patient.name}</div>
                                  <div style={{ background: isEmergency ? '#dc2626' : '#0d9488', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '11px 15px', fontSize: 13, lineHeight: 1.6, boxShadow: isEmergency ? '0 2px 8px rgba(220,38,38,0.22)' : '0 2px 8px rgba(13,148,136,0.18)', wordBreak: 'break-word' }}>
                                    {msg.user_message}
                                  </div>
                                </div>
                              </div>

                              {/* Bot reply — left-aligned */}
                              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: isEmergency ? '#dc2626' : 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.14)' }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5"/></svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: isEmergency ? '#dc2626' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Care Assistant</div>
                                  <div style={{ background: isEmergency ? '#fff5f5' : '#fff', color: isEmergency ? '#7f1d1d' : '#334155', borderRadius: 10, padding: '11px 15px', fontSize: 13, lineHeight: 1.65, border: `1px solid ${isEmergency ? '#fecaca' : '#e2e8f0'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', wordBreak: 'break-word' }}>
                                    {msg.bot_reply}
                                  </div>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Footer note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Read-only view of the patient's conversations with the NeuroSight care assistant.</span>
                  </div>

                </div>
              )}
            </div>
          );
        })()}

        {/* Medication adherence */}
        {monitoringSubTab === 'medication' && (() => {
          const { medications: meds, logs } = medAdherence;
          const todayStr = new Date().toISOString().slice(0, 10);
          const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          const slotName = s => ({ '08:00':'Morning','12:00':'Noon','13:00':'Afternoon','18:00':'Evening','21:00':'Night' }[s] || s);
          const takenSet = new Set((logs || []).map(l => `${l.plan_id}-${l.med_index}-${l.slot}-${l.taken_date}`));
          const buildWindow = (daysBack) => {
            const arr = [];
            for (let i = daysBack + 13; i >= daysBack; i--) {
              const d = new Date(); d.setDate(d.getDate() - i);
              arr.push(d.toISOString().slice(0, 10));
            }
            return arr;
          };
          const fmtRange = (dates) => {
            const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
          };

          if (!meds || meds.length === 0) {
            return (
              <div style={{ padding: '28px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>No medication data available</div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6 }}>Add medications to this patient's treatment plan in the Management tab.</div>
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#64748b', alignItems: 'center', flexWrap: 'wrap', padding: '6px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {[['#16a34a', null, 'Taken'], ['#fca5a5', '#f87171', 'Missed'], ['#fef08a', '#fbbf24', 'Today (pending)'], ['#f1f5f9', '#e2e8f0', 'Upcoming']].map(([bg, border, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1px solid ${border || bg}`, display: 'inline-block', flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
                <span style={{ marginLeft: 'auto', color: '#94a3b8', fontStyle: 'italic' }}>Last 14 days</span>
              </div>

              {meds.map((med, mi) => {
                const daysBack = medOffsets[mi] || 0;
                const window14 = buildWindow(daysBack);
                let totalSlots = 0, takenCount = 0;
                window14.forEach(d => {
                  (med.slots || []).forEach(slot => {
                    const key = `${med.plan_id}-${med.med_index}-${slot}-${d}`;
                    if (d <= todayStr) { totalSlots++; if (takenSet.has(key)) takenCount++; }
                  });
                });
                const pct = totalSlots > 0 ? Math.round((takenCount / totalSlots) * 100) : null;
                const pctColor = pct === null ? '#94a3b8' : pct >= 80 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#dc2626';
                const atPresent = daysBack === 0;
                const navBtn = (disabled, onClick, dir) => (
                  <button onClick={onClick} disabled={disabled} style={{
                    width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0',
                    background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#cbd5e1' : '#475569',
                    cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {dir === 'left' ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                    </svg>
                  </button>
                );

                return (
                  <div key={mi} style={{ borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '14px 16px', overflow: 'hidden' }}>
                    {/* Med header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{med.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          {med.dosage && <span style={{ fontSize: 11, color: '#64748b' }}>{med.dosage}</span>}
                          {med.food && (
                            <span style={{ fontSize: 9, fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '1px 7px', color: '#16a34a' }}>
                              {med.food === 'before' ? 'Before food' : med.food === 'after' ? 'After food' : med.food}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3 }}>Plan: {med.plan_title}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {pct !== null && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: pctColor, lineHeight: 1 }}>{pct}%</div>
                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>adherence</div>
                            <div style={{ fontSize: 9, color: '#cbd5e1' }}>{takenCount}/{totalSlots} doses</div>
                          </div>
                        )}
                        {/* Navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {navBtn(false, () => setMedOffsets(p => ({ ...p, [mi]: daysBack + 14 })), 'left')}
                          <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', minWidth: 110, textAlign: 'center' }}>
                            {fmtRange(window14)}
                          </span>
                          {navBtn(atPresent, () => setMedOffsets(p => ({ ...p, [mi]: Math.max(0, daysBack - 14) })), 'right')}
                        </div>
                      </div>
                    </div>

                    {(med.slots || []).length === 0 ? (
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>No reminder times set for this medication.</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        {/* Day-of-week + date header */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 8, paddingLeft: 86 }}>
                          {window14.map((d, di) => {
                            const dt = new Date(d + 'T12:00:00');
                            const isToday = d === todayStr;
                            const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
                            return (
                              <div key={di} style={{ width: 32, flexShrink: 0, textAlign: 'center', marginRight: di === 6 ? 10 : 3 }}>
                                <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', color: isToday ? '#0d9488' : isWeekend ? '#94a3b8' : '#cbd5e1' }}>
                                  {DOW[dt.getDay()].slice(0, 2)}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? '#0d9488' : '#64748b', lineHeight: 1.2 }}>
                                  {dt.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Slot rows */}
                        {(med.slots || []).map((slot, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', marginTop: si > 0 ? 8 : 0 }}>
                            {/* Slot label */}
                            <div style={{ width: 86, flexShrink: 0, paddingRight: 10 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{slotName(slot)}</div>
                              <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{slot}</div>
                            </div>

                            {/* Cells */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {window14.map((d, di) => {
                                const key = `${med.plan_id}-${med.med_index}-${slot}-${d}`;
                                const isTaken = takenSet.has(key);
                                const isPast  = d < todayStr;
                                const isToday = d === todayStr;
                                let bg, border;
                                if (isTaken)       { bg = '#16a34a'; border = '#15803d'; }
                                else if (isToday)  { bg = '#fef08a'; border = '#fbbf24'; }
                                else if (isPast)   { bg = '#fca5a5'; border = '#f87171'; }
                                else               { bg = '#f1f5f9'; border = '#e2e8f0'; }
                                const status = isTaken ? 'Taken' : isToday ? 'Pending' : isPast ? 'Missed' : 'Upcoming';
                                return (
                                  <div key={di} title={`${d}: ${status}`} style={{
                                    width: 32, height: 30, borderRadius: 7, flexShrink: 0,
                                    background: bg, border: `1px solid ${border}`,
                                    marginRight: di === 6 ? 10 : 3,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {isTaken && (
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    )}
                                    {isPast && !isTaken && (
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                      </svg>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', paddingTop: 2 }}>
                Recorded when the patient marks doses as taken in the NeuroSight mobile app.
              </div>
            </div>
          );
        })()}

      </div>
    );
  };

  const renderTimelineTab = () => {
    const sorted = [...patientAdmissions].sort((a, b) => b.episode_number - a.episode_number);
    const canEditSymptoms = pageMode === 'edit';

    const plansForAdm = (adm) => treatmentPlans.filter(plan => {
      if (plan.admission_id != null) return plan.admission_id === adm.id;
      if (!plan.plan_date || !adm.admission_date) return false;
      if (plan.plan_date < adm.admission_date) return false;
      if (adm.discharge_date && adm.discharge_date !== 'Pending' && plan.plan_date > adm.discharge_date) return false;
      return true;
    });

    const scansForAdm = (adm) => (patient?.results || []).filter(r => r.admission_id === adm.id);

    const duration = (d1, d2) => {
      if (!d1 || !d2 || d2 === 'Pending') return null;
      const days = Math.round((new Date(d2) - new Date(d1)) / 86400000);
      return `${days} day${days !== 1 ? 's' : ''}`;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#92400e' }}>Registered Symptoms</div>
            <span style={{ fontSize: 9, color: '#92400e', fontWeight: 600, background: '#fef3c7', padding: '2px 8px', borderRadius: 10, border: '1px solid #fde68a' }}>Captured at Registration</span>
          </div>
          <textarea name="symptoms" rows={3} disabled={!canEditSymptoms} onChange={handleEditChange}
            style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: canEditSymptoms ? '1px solid #fcd34d' : '1px solid #fde68a', borderRadius: 8, background: canEditSymptoms ? '#fff' : '#fffbeb', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', color: '#334155', cursor: canEditSymptoms ? 'text' : 'default' }}
            value={canEditSymptoms ? (editData.symptoms || '') : (patient?.symptoms || '')}
            placeholder="No symptoms recorded at registration." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed' }}>
            {sorted.length} Admission{sorted.length !== 1 ? 's' : ''} on Record
          </div>
          <button onClick={handleNewAdmission} disabled={admissionLoading || patientAdmissions.some(a => a.status === 'Active')}
            title={patientAdmissions.some(a => a.status === 'Active') ? 'Discharge the current active admission before creating a new one' : ''}
            style={{ fontSize: 10, fontWeight: 700, padding: '5px 11px', borderRadius: 7, background: patientAdmissions.some(a => a.status === 'Active') ? '#f1f5f9' : '#f5f3ff', color: patientAdmissions.some(a => a.status === 'Active') ? '#94a3b8' : '#7c3aed', border: `1px solid ${patientAdmissions.some(a => a.status === 'Active') ? '#e2e8f0' : '#ddd6fe'}`, cursor: patientAdmissions.some(a => a.status === 'Active') ? 'not-allowed' : 'pointer', opacity: patientAdmissions.some(a => a.status === 'Active') ? 0.6 : 1 }}>
            {admissionLoading ? 'Creating…' : '+ New Admission'}
          </button>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600 }}>No admissions recorded yet</p>
            <p style={{ fontSize: 11, color: '#cbd5e1', margin: '4px 0 0' }}>Click "+ New Admission" to begin tracking this patient's episode history.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingRight: 4 }}>
            {sorted.map(adm => {
              const isActive = adm.status === 'Active';
              const plans = plansForAdm(adm);
              const scans = scansForAdm(adm);
              const dur = duration(adm.admission_date, adm.discharge_date);
              const isDischarging = dischargingAdmissionId === adm.id;

              return (
                <div key={adm.id} style={{ borderRadius: 16, border: `2px solid ${isActive ? '#c4b5fd' : '#e2e8f0'}`, background: isActive ? '#faf5ff' : '#fafbfc', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: isActive ? '0 6px 24px rgba(124,58,237,0.12)' : '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: isActive ? '#ede9fe' : '#f1f5f9', borderBottom: `2px solid ${isActive ? '#c4b5fd' : '#e2e8f0'}`, flexShrink: 0, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: isActive ? '#6d28d9' : '#475569' }}>Admission #{adm.episode_number}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: isActive ? '#7c3aed' : '#94a3b8', color: '#fff', letterSpacing: '0.04em' }}>{adm.status}</span>
                      {adm.ipfs_cid && (
                        <span onClick={() => setChainInfoId(chainInfoId === `adm-${adm.id}` ? null : `adm-${adm.id}`)} title="View blockchain record" style={{ fontSize: 11, cursor: 'pointer' }}>⛓</span>
                      )}
                    </div>
                    {chainInfoId === `adm-${adm.id}` && adm.ipfs_cid && (
                      <div style={{ position: 'absolute', zIndex: 10, top: 52, left: 18, right: 18, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>Admission — Blockchain Record</div>
                        <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>CID: {adm.ipfs_cid}</div>
                        {adm.tx_hash && (
                          <>
                            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 4 }}>TX: {adm.tx_hash}</div>
                            <a href={`https://sepolia.etherscan.io/tx/${adm.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>View on Sepolia →</a>
                          </>
                        )}
                      </div>
                    )}
                    {isActive && isClinical && (
                      <button onClick={() => { setDischargingAdmissionId(isDischarging ? null : adm.id); setDischargeDate(''); }}
                        style={{ fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 7, background: '#fff', color: '#b91c1c', border: '1px solid #fecaca', cursor: 'pointer' }}>
                        {isDischarging ? 'Cancel' : 'Discharge Patient'}
                      </button>
                    )}
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    <div style={{ display: 'flex', gap: 32, padding: '14px 18px 12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 4 }}>Admitted</div>
                        <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: '#334155' }}>{adm.admission_date || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 4 }}>Discharged</div>
                        <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: isActive ? '#92400e' : '#334155' }}>{adm.discharge_date || 'Pending'}</div>
                      </div>
                      {dur && (
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 4 }}>Duration</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{dur}</div>
                        </div>
                      )}
                    </div>

                    {isDischarging && (
                      <div style={{ margin: '0 18px 12px', padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <input type="date" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)}
                          style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none', fontFamily: "'DM Mono',monospace" }} />
                        <button onClick={() => handleDischargeAdmission(adm)}
                          style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 6, background: '#b91c1c', color: '#fff', border: 'none', cursor: 'pointer' }}>
                          Confirm Discharge
                        </button>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>Leave date blank to use today</span>
                      </div>
                    )}

                    <div style={{ padding: '12px 18px 14px', borderTop: '1px solid #ede9fe' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.1em', marginBottom: 10 }}>MRI Scans ({scans.length})</div>
                      {scans.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic' }}>No scans for this admission</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {scans.map(res => (
                            <div key={res.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                              <img src={`http://127.0.0.1:8000/uploaded_mris/${res.filename}`} alt="MRI" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f5f9', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{res.predicted_label}</div>
                                <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
                                  {res.created_at ? new Date(res.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                  {res.confidence ? ` · ${(res.confidence * 100).toFixed(0)}% conf.` : ''}
                                </div>
                                {res.confirmed_label && (
                                  <div style={{ marginTop: 2 }}>
                                    <span style={{ fontSize: 9, color: '#15803d', fontWeight: 700 }}>Confirmed: {res.confirmed_label}{res.pathology_grade ? ` Gr.${res.pathology_grade}` : ''}</span>
                                    {res.ipfs_cid && (
                                      <span onClick={e => { e.stopPropagation(); setChainInfoId(chainInfoId === `result-${res.id}` ? null : `result-${res.id}`); }} title="View blockchain record" style={{ cursor: 'pointer', marginLeft: 4, fontSize: 10 }}>⛓</span>
                                    )}
                                    {chainInfoId === `result-${res.id}` && res.ipfs_cid && (
                                      <div style={{ marginTop: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px' }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>Blockchain Record</div>
                                        <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>CID: {res.ipfs_cid}</div>
                                        {res.tx_hash && (
                                          <>
                                            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 4 }}>TX: {res.tx_hash}</div>
                                            <a href={`https://sepolia.etherscan.io/tx/${res.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>View on Sepolia →</a>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button onClick={() => navigate('/image/results', { state: { patient, analysisResult: res } })}
                                style={{ fontSize: 10, background: '#4f46e5', color: '#fff', padding: '5px 11px', borderRadius: 6, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                                View →
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '12px 18px 16px', borderTop: '1px solid #ede9fe' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.1em', marginBottom: 10 }}>Treatment Plans ({plans.length})</div>
                      {plans.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic' }}>No treatment plans for this admission</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {plans.map(plan => (
                            <div key={plan.id} style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${plan.status === 'Active' ? '#bfdbfe' : '#e2e8f0'}`, background: plan.status === 'Active' ? '#eff6ff' : '#f8fafc' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{plan.title}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 10, background: plan.status === 'Active' ? '#1e40af' : '#94a3b8', color: '#fff' }}>{plan.status}</span>
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{plan.plan_type} · {plan.plan_date} · {plan.created_by_name || 'Clinician'}</div>
                              {plan.medications && <div style={{ fontSize: 11, color: '#1e40af', marginTop: 3, fontWeight: 500 }}>Rx: {plan.medications}</div>}
                              {plan.therapy_schedule && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Schedule: {plan.therapy_schedule}</div>}
                              {plan.surgery_details && <div style={{ fontSize: 10, color: '#7c3aed', marginTop: 2 }}>Surgery: {plan.surgery_details}</div>}
                              {plan.notes && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>{plan.notes}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const TABS = [
    { key: 'admissions',    label: 'Admissions',    color: '#7c3aed' },
    { key: 'history',       label: 'History',       color: '#b45309' },
    { key: 'examination',   label: 'Examination',   color: '#2563eb' },
    { key: 'investigation', label: 'Investigation', color: '#0d9488' },
    { key: 'management',    label: 'Management',    color: '#1e40af' },
    { key: 'monitoring',    label: 'Monitoring',    color: '#475569' },
  ];

  const fieldStyle = { width: '100%', padding: '4px 0', fontSize: 12, fontWeight: 500, background: 'transparent', border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif", color: '#334155' };

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#94a3b8", fontSize: 14 }}>
      Loading patient record…
    </div>
  );

  if (!patient) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
      <div style={{ fontSize: 14, color: "#94a3b8" }}>Patient not found.</div>
      <button onClick={() => navigate('/patients')} style={{ fontSize: 13, color: "#0d9488", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Back to Patients</button>
    </div>
  );

  const initials = (patient.name || 'P').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, fontFamily: "'DM Sans', sans-serif", height: "calc(100vh - 116px)" }}>
      <style>{`.ns-tab-detail:hover{color:#334155!important}`}</style>

      {/* Top bar: breadcrumb + mode toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => navigate('/patients')}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#64748b", background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
          ← Patients
        </button>
        <span style={{ color: "#cbd5e1", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ns-text)" }}>{patient.name}</span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{patient.hospital_id}</span>

        {!isAdmin && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={() => setPageMode('view')}
              style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 7, background: pageMode === 'view' ? "#eff6ff" : "var(--ns-surface)", color: pageMode === 'view' ? "#1d4ed8" : "#64748b", border: `1px solid ${pageMode === 'view' ? "#bfdbfe" : "var(--ns-border)"}`, cursor: "pointer" }}>
              View
            </button>
            <button onClick={() => setPageMode('edit')}
              style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 7, background: pageMode === 'edit' ? "#0d9488" : "var(--ns-surface)", color: pageMode === 'edit' ? "#fff" : "#64748b", border: `1px solid ${pageMode === 'edit' ? "#0d9488" : "var(--ns-border)"}`, cursor: "pointer" }}>
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Patient header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "var(--ns-surface)", border: "1px solid var(--ns-border)", borderRadius: "14px 14px 0 0", borderBottom: "none", flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: "#e0f2f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 16, color: "#0d9488", letterSpacing: "-0.02em" }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ns-text)" }}>{patient.name}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, fontFamily: "'DM Mono',monospace" }}>
            {patient.hospital_id} · {patient.age} · {patient.gender} · {patient.assigned_doctor || "Unassigned"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handlePrintCard} style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", cursor: "pointer" }}>Print Card</button>
          {!isAdmin && <button onClick={handleUploadClick} style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, background: "#f0fdfa", color: "#0d9488", border: "1px solid #ccfbf1", cursor: "pointer" }}>Upload MRI</button>}
          <button onClick={handleNewAdmission} disabled={admissionLoading || patientAdmissions.some(a => a.status === 'Active')}
            title={patientAdmissions.some(a => a.status === 'Active') ? 'Discharge the active admission before creating a new one' : ''}
            style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, background: patientAdmissions.some(a => a.status === 'Active') ? "#f1f5f9" : "#f0fdf4", color: patientAdmissions.some(a => a.status === 'Active') ? "#94a3b8" : "#0d9488", border: `1px solid ${patientAdmissions.some(a => a.status === 'Active') ? "#e2e8f0" : "#bbf7d0"}`, cursor: patientAdmissions.some(a => a.status === 'Active') ? "not-allowed" : "pointer", opacity: admissionLoading ? 0.6 : 1 }}>
            {admissionLoading ? 'Creating…' : '+ New Admission'}
          </button>
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "3fr 2fr", overflow: "hidden", background: "#fafbfc", border: "1px solid var(--ns-border)", borderRadius: "0 0 14px 14px", minHeight: 0 }}>

        {/* LEFT — clinical tabs */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0, overflowX: "auto" }}>
            {TABS.map(tab => (
              <button key={tab.key} className="ns-tab-detail"
                onClick={() => setActiveTab(tab.key)}
                style={{ flex: 1, padding: "12px 6px", fontSize: 11, fontWeight: 700, border: "none", borderBottom: `3px solid ${activeTab === tab.key ? tab.color : 'transparent'}`, cursor: "pointer", background: activeTab === tab.key ? `${tab.color}12` : "transparent", color: activeTab === tab.key ? tab.color : '#64748b', transition: 'all 0.15s', letterSpacing: '0.02em', whiteSpace: "nowrap" }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            {activeTab === 'admissions'    && renderTimelineTab()}
            {activeTab === 'history'       && renderHistoryTab()}
            {activeTab === 'examination'   && renderExaminationTab()}
            {activeTab === 'investigation' && renderInvestigationTab()}
            {activeTab === 'management'    && renderTreatmentTab()}
            {activeTab === 'monitoring'    && renderMonitoringTab()}
          </div>
        </div>

        {/* RIGHT — identity + document vault */}
        <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 18px", gap: 20 }}>

          {/* Patient identity fields */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0d9488", borderBottom: "1px solid #e2e8f0", paddingBottom: 7, marginBottom: 14 }}>Introduction</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Full Name</label>
                <input name="name" disabled={pageMode === 'view'} onChange={handleEditChange} style={{ ...fieldStyle, fontWeight: 600 }} value={editData.name || ""} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Hospital ID</label>
                  <input disabled style={{ ...fieldStyle, color: '#0d9488', fontFamily: "'DM Mono',monospace", fontSize: 11 }} value={patient.hospital_id} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Age</label>
                  <input name="age" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.age || ""} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Gender</label>
                  <input name="gender" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.gender || ""} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Phone</label>
                  <input name="phone" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.phone || ""} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Email</label>
                <input name="email" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.email || ""} />
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Address</label>
                <input name="address" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.address || ""} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>From (City / Region)</label>
                  <input name="fromLocation" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.fromLocation || ""} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "block", marginBottom: 3 }}>Occupation</label>
                  <input name="occupation" disabled={pageMode === 'view'} onChange={handleEditChange} style={fieldStyle} value={editData.occupation || ""} />
                </div>
              </div>
              {(() => {
                const activeAdm = patientAdmissions.find(a => a.status === 'Active');
                const latestAdm = [...patientAdmissions].sort((a, b) => b.episode_number - a.episode_number)[0];
                const displayAdm = activeAdm || latestAdm;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#f0fdf4", padding: "8px 10px", borderRadius: 8 }}>
                      <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#15803d", display: "block", marginBottom: 3 }}>Admitted</label>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#334155" }}>
                        {displayAdm?.admission_date || patient.joined_date || '—'}
                      </div>
                    </div>
                    <div style={{ background: "#fffbeb", padding: "8px 10px", borderRadius: 8 }}>
                      <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#92400e", display: "block", marginBottom: 3 }}>Discharge</label>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#334155" }}>
                        {activeAdm ? 'In Hospital' : (displayAdm?.discharge_date || '—')}
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div style={{ background: "#fef2f2", padding: "8px 10px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#b91c1c" }}>AI Risk Score</label>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#b91c1c", fontFamily: "'DM Mono',monospace" }}>{patient.risk_score}</div>
              </div>
            </div>
          </div>

          {/* Caretakers */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7c3aed", borderBottom: "1px solid #e2e8f0", paddingBottom: 7, marginBottom: 12 }}>Caretakers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {caretakers.length === 0 ? (
                <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No caretaker registered.</p>
              ) : caretakers.map(ct => {
                const draft = caretakerEdits[ct.id] || { name: ct.name, phone: ct.phone, relation: ct.relation || '' };
                const isSaving = caretakerUpdateSaving === ct.id;
                const canSave = draft.name.trim() && draft.phone.trim();
                return pageMode === 'edit' ? (
                  <div key={ct.id} style={{ border: "1px solid #ede9fe", borderRadius: 9, padding: "10px 12px", background: "#faf5ff", display: "flex", flexDirection: "column", gap: 6 }}>
                    <input
                      value={draft.name}
                      onChange={e => setCaretakerEdits(p => ({ ...p, [ct.id]: { ...p[ct.id], name: e.target.value } }))}
                      placeholder="Full name *"
                      style={{ fontSize: 12, fontWeight: 600, padding: "4px 8px", border: "1px solid #ddd6fe", borderRadius: 6, outline: "none", fontFamily: "'DM Sans',sans-serif", color: "#3b0764" }}
                    />
                    <input
                      value={draft.phone}
                      onChange={e => setCaretakerEdits(p => ({ ...p, [ct.id]: { ...p[ct.id], phone: e.target.value } }))}
                      placeholder="Phone *"
                      style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #ddd6fe", borderRadius: 6, outline: "none", fontFamily: "'DM Mono',monospace", color: "#7c3aed" }}
                    />
                    <input
                      value={draft.relation}
                      onChange={e => setCaretakerEdits(p => ({ ...p, [ct.id]: { ...p[ct.id], relation: e.target.value } }))}
                      placeholder="Relation (e.g. Spouse, Parent)"
                      style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #ddd6fe", borderRadius: 6, outline: "none", fontFamily: "'DM Sans',sans-serif", color: "#94a3b8" }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        disabled={isSaving || !canSave}
                        onClick={async () => {
                          setCaretakerUpdateSaving(ct.id);
                          try {
                            const updated = await api(`/patients/${id}/caretakers/${ct.id}`, { method: 'PATCH', body: draft });
                            setCaretakers(prev => prev.map(c => c.id === ct.id ? updated : c));
                          } finally {
                            setCaretakerUpdateSaving(null);
                          }
                        }}
                        style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "5px 0", borderRadius: 6, background: canSave ? "#7c3aed" : "#e5e7eb", color: canSave ? "#fff" : "#9ca3af", border: "none", cursor: canSave ? "pointer" : "not-allowed" }}>
                        {isSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Remove ${ct.name} as caretaker?`)) return;
                          await api(`/patients/${id}/caretakers/${ct.id}`, { method: 'DELETE' });
                          setCaretakers(prev => prev.filter(c => c.id !== ct.id));
                        }}
                        style={{ fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", border: "none", cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={ct.id} style={{ padding: "8px 10px", border: "1px solid #ede9fe", borderRadius: 9, background: "#faf5ff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#3b0764" }}>{ct.name}</div>
                    <div style={{ fontSize: 11, color: "#7c3aed", fontFamily: "'DM Mono',monospace" }}>{ct.phone}</div>
                    {ct.relation && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{ct.relation}</div>}
                  </div>
                );
              })}

              {pageMode === 'edit' && (
                <div style={{ border: "1px dashed #c4b5fd", borderRadius: 9, padding: "10px 12px", background: "#fdf4ff", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.08em" }}>Add Caretaker</div>
                  <input
                    placeholder="Full name *"
                    value={newCaretaker.name}
                    onChange={e => setNewCaretaker(p => ({ ...p, name: e.target.value }))}
                    style={{ fontSize: 12, padding: "5px 8px", border: "1px solid #ddd6fe", borderRadius: 7, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
                  />
                  <input
                    placeholder="Phone number *"
                    value={newCaretaker.phone}
                    onChange={e => setNewCaretaker(p => ({ ...p, phone: e.target.value }))}
                    style={{ fontSize: 12, padding: "5px 8px", border: "1px solid #ddd6fe", borderRadius: 7, outline: "none", fontFamily: "'DM Mono',monospace" }}
                  />
                  <input
                    placeholder="Relation (e.g. Spouse, Parent)"
                    value={newCaretaker.relation}
                    onChange={e => setNewCaretaker(p => ({ ...p, relation: e.target.value }))}
                    style={{ fontSize: 12, padding: "5px 8px", border: "1px solid #ddd6fe", borderRadius: 7, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
                  />
                  <button
                    disabled={caretakerSaving || !newCaretaker.name.trim() || !newCaretaker.phone.trim()}
                    onClick={async () => {
                      setCaretakerSaving(true);
                      try {
                        const saved = await api(`/patients/${id}/caretakers`, {
                          method: 'POST',
                          body: newCaretaker,
                        });
                        setCaretakers(prev => [...prev, saved]);
                        setNewCaretaker({ name: '', phone: '', relation: '' });
                      } finally {
                        setCaretakerSaving(false);
                      }
                    }}
                    style={{ fontSize: 12, fontWeight: 700, padding: "6px 0", borderRadius: 7, background: newCaretaker.name.trim() && newCaretaker.phone.trim() ? "#7c3aed" : "#e5e7eb", color: newCaretaker.name.trim() && newCaretaker.phone.trim() ? "#fff" : "#9ca3af", border: "none", cursor: newCaretaker.name.trim() && newCaretaker.phone.trim() ? "pointer" : "not-allowed" }}>
                    {caretakerSaving ? "Saving…" : "+ Add Caretaker"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Document Vault */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 7, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0d9488" }}>Document Vault</div>
              {pageMode === "edit" && (
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 7, background: "#dcfce7", color: "#15803d", border: "none", cursor: "pointer" }}>+ Add</button>
                  <input type="file" onChange={handleFileUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(editData.documents || []).length === 0 ? (
                <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "12px 0", fontStyle: "italic", margin: 0 }}>No documents uploaded yet.</p>
              ) : [...editData.documents].sort((a, b) => (a.upload_date || '').localeCompare(b.upload_date || '')).map(doc => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", border: "1px solid #f1f5f9", borderRadius: 9, background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: doc.doc_type === "Registration" ? "#fef9ee" : "#eff6ff", flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={doc.doc_type === "Registration" ? "#92400e" : "#1d4ed8"} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }} title={doc.original_name}>{doc.original_name}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{doc.upload_date} · {doc.doc_type}</div>
                      {doc.ipfs_cid && (
                        <div style={{ marginTop: 3 }}>
                          <span onClick={() => setChainInfoId(chainInfoId === `doc-${doc.id}` ? null : `doc-${doc.id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, background: '#f0fdf4', color: '#15803d', padding: '1px 6px', borderRadius: 8, cursor: 'pointer' }}>
                            ⛓ Anchored
                          </span>
                          {chainInfoId === `doc-${doc.id}` && (
                            <div style={{ marginTop: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 9px' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 3 }}>Blockchain Record</div>
                              <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>CID: {doc.ipfs_cid}</div>
                              {doc.tx_hash && (
                                <>
                                  <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#374151', wordBreak: 'break-all', marginBottom: 3 }}>TX: {doc.tx_hash}</div>
                                  <a href={`https://sepolia.etherscan.io/tx/${doc.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>View on Sepolia →</a>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <a href={`http://127.0.0.1:8000/uploaded_docs/${doc.saved_name}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", textDecoration: "none" }}>View</a>
                    {pageMode === "edit" && (
                      <button onClick={() => handleDeleteDocument(doc.id)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", cursor: "pointer" }}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          {(pageMode === "edit" || isClinical) && (
            <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <button onClick={() => navigate('/patients')} style={{ flex: 1, padding: 10, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveEdits} style={{ flex: 1, padding: 10, border: "none", borderRadius: 10, background: "#0d9488", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save Record</button>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Plan creation modal */}
      {showCreatePlan && patient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #ccfbf1', background: '#f0fdfa', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{editingPlan ? 'Edit Treatment Plan' : 'New Treatment Plan'}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Patient: <span style={{ fontWeight: 600, color: '#0d9488' }}>{patient.name}</span></div>
              </div>
              <button onClick={() => { setShowCreatePlan(false); setEditingPlan(null); }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleInlineCreatePlan} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Plan Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {['Medication', 'Therapy', 'Surgery', 'Follow-up'].map(t => {
                    const colors = { Medication: ['#1d4ed8','#eff6ff','#bfdbfe'], Therapy: ['#6d28d9','#f5f3ff','#ddd6fe'], Surgery: ['#b91c1c','#fef2f2','#fecaca'], 'Follow-up': ['#0f766e','#f0fdfa','#99f6e4'] };
                    const [c, bg, border] = colors[t];
                    const active = newPlanForm.plan_type === t;
                    return (
                      <button key={t} type="button" onClick={() => setNewPlanForm(f => ({ ...f, plan_type: t }))}
                        style={{ padding: '9px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: active ? `1.5px solid ${border}` : '1px solid #e2e8f0', background: active ? bg : '#fff', color: active ? c : '#64748b', transition: 'all 0.15s' }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Plan Date</label>
                  <input type="date" value={newPlanForm.plan_date} onChange={e => setNewPlanForm(f => ({ ...f, plan_date: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Title / Summary *</label>
                  <input value={newPlanForm.title} onChange={e => setNewPlanForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Week 1 Temozolomide course"
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              {newPlanForm.plan_type === 'Medication' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Medications</label>
                  <MedicationBuilder
                    value={newPlanForm.medications}
                    onChange={val => setNewPlanForm(f => ({ ...f, medications: val }))}
                  />
                </div>
              )}
              {newPlanForm.plan_type === 'Therapy' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Therapy Schedule</label>
                  <textarea rows={3} value={newPlanForm.therapy_schedule} onChange={e => setNewPlanForm(f => ({ ...f, therapy_schedule: e.target.value }))}
                    placeholder="Therapy type · Sessions · Frequency"
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                </div>
              )}
              {newPlanForm.plan_type === 'Surgery' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Surgery Details</label>
                  <textarea rows={3} value={newPlanForm.surgery_details} onChange={e => setNewPlanForm(f => ({ ...f, surgery_details: e.target.value }))}
                    placeholder="Procedure · Surgeon · Scheduled date"
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Clinical Notes</label>
                <textarea rows={3} value={newPlanForm.notes} onChange={e => setNewPlanForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observations, contraindications, follow-up instructions…"
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                <button type="button" onClick={() => { setShowCreatePlan(false); setEditingPlan(null); }}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={planSaving}
                  style={{ flex: 2, padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, color: '#fff', background: planSaving ? '#94a3b8' : '#0d9488', cursor: planSaving ? 'not-allowed' : 'pointer' }}>
                  {planSaving ? 'Saving…' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
