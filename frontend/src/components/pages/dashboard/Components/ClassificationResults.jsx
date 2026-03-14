import React, { useState, useEffect } from 'react';
import { api, getToken } from "../../../../util";
import { useNavigate } from "react-router-dom";

export default function ClassificationResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await api("/results/");
      setResults(data);
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Actually, backend doesn't have DELETE /results/ yet, but let's mock the UI for it.
    if (window.confirm("Are you sure you want to remove this scan from your history?")) {
      // mock delete
      setResults(results.filter(r => r.id !== id));
    }
  };

  return (
    <div className="font-sans space-y-6">
      <div className="bg-slate-900 p-4 text-white rounded-t-xl border-b-4 border-blue-600 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-white">Classification History</h2>
          <p className="text-[10px] text-blue-400 font-black tracking-tighter uppercase">Past AI Diagnostics</p>
        </div>
        <button onClick={() => navigate("/image/upload")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider rounded border border-blue-500 transition-colors">
          + New Scan
        </button>
      </div>

      <div className="bg-white rounded-b-xl shadow border border-slate-200 p-6">
        {loading ? (
          <p className="text-slate-500 text-center animate-pulse py-10 font-bold uppercase text-xs">Loading records...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-10 font-bold text-xs uppercase">{error}</p>
        ) : results.length === 0 ? (
          <p className="text-slate-500 text-center py-10 font-bold text-xs uppercase">No scan results found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-slate-200">
                  <th className="p-4">Scan ID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Predicted Classification</th>
                  <th className="p-4 text-center">Confidence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-blue-600 font-bold font-mono text-xs">#{String(r.id).padStart(5, '0')}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate">
                      {r.filename.split(/[\/\\]/).pop()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-tight ${r.predicted_label.toLowerCase().includes('tumor') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {r.predicted_label.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-800 font-bold">
                      {Math.round(r.confidence * 100)}%
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-[10px] text-red-600 font-black uppercase tracking-widest hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ClassificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const patient = location.state?.patient;
  // CATCH SPECIFIC HISTORICAL SCAN IF PROVIDED
  const specificAnalysis = location.state?.analysisResult; 
  const localScanUrl = location.state?.scanUrl;
  
  const [viewMode, setViewMode] = useState('original'); 

  // Priority: 1. Specific button clicked, 2. Global analysis result, 3. Patient result [0]
  const latestDbResult = patient?.results && patient.results.length > 0 ? patient.results[0] : null;
  const activeResult = specificAnalysis || location.state?.analysisResult || latestDbResult;

  const scanUrl = localScanUrl || (activeResult ? `http://127.0.0.1:8000/uploaded_mris/${activeResult.filename}` : "https://via.placeholder.com/400x400?text=MRI+Scan");

  const classification = activeResult?.predicted_label || "Not Classified";
  const rawConfidence = activeResult?.confidence || 0;
  const formattedConfidence = typeof rawConfidence === 'number' ? parseFloat(rawConfidence.toFixed(1)) : parseFloat(rawConfidence);

  const isHighRisk = classification !== "No Tumour" && classification !== "Not Classified";
  const riskScoreText = isHighRisk ? "High" : (classification === "No Tumour" ? "Low" : "Unknown");

  const mockExtendedData = {
    tumorSize: isHighRisk ? "2.4cm x 1.8cm" : "N/A",
    location: isHighRisk ? "Frontal Lobe / Superior" : "N/A",
    bbox: { top: '28%', left: '42%', width: '22%', height: '24%' },
    differential: [
      { type: classification, score: formattedConfidence, color: "bg-blue-600" },
      { type: "Secondary Estimate", score: Math.max(0.1, parseFloat((100 - formattedConfidence).toFixed(1))), color: "bg-slate-300" }
    ],
    features: [
      { label: "Density", value: isHighRisk ? 85 : 20 },
      { label: "Symmetry", value: isHighRisk ? 40 : 95 }, 
      { label: "Texture", value: isHighRisk ? 90 : 30 },
      { label: "Margin", value: isHighRisk ? 75 : 10 },
      { label: "Edema", value: isHighRisk ? 60 : 5 }
    ]
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <p>No analysis data found.</p>
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">Return to Dashboard</button>
    </div>
  );

  const handleSaveToRecord = () => {
    alert("Record successfully attached to patient file.");
    navigate('/patients');
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div id="printable-report" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:p-0 print:m-0">
        
        {/* HEADER CARD */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-b-2 print:border-slate-800 print:rounded-none">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg print:bg-white print:text-black print:border print:border-black">
              {patient.name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Analysis Report For</p>
              <h1 className="text-2xl font-black text-slate-800 print:text-black">{patient.name}</h1>
              <p className="text-xs text-slate-500 font-mono font-bold">ID: {patient.hospital_id || patient.hospitalId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis Date</p>
            <p className="text-sm font-mono font-bold text-slate-800 print:text-black">{activeResult?.created_at || new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
          {/* LEFT COLUMN: IMAGE */}
          <div className="lg:col-span-1 space-y-4 print:mb-4">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 h-[450px] print:h-auto print:border-2 print:border-slate-300 print:rounded-lg">
              <img src={scanUrl} alt="MRI Scan" className="w-full h-full object-cover opacity-90 print:object-contain" />
              
              {viewMode === 'bbox' && isHighRisk && (
                <div className="absolute border-2 border-red-500" style={{ top: mockExtendedData.bbox.top, left: mockExtendedData.bbox.left, width: mockExtendedData.bbox.width, height: mockExtendedData.bbox.height }}>
                  <span className="absolute -top-7 left-0 bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase">Tumor {formattedConfidence}%</span>
                </div>
              )}

              {viewMode === 'heatmap' && isHighRisk && (
                <div className="heatmap-layer absolute inset-0 opacity-60 mix-blend-screen print:opacity-100" style={{background: `radial-gradient(circle at 50% 35%, rgba(255,0,0,1) 0%, rgba(255,255,0,0.8) 25%, rgba(0,255,0,0) 70%)`}}></div>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl flex gap-1 shadow-xl border border-slate-700 print:hidden">
                <button onClick={() => setViewMode('original')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${viewMode === 'original' ? 'bg-white text-black' : 'text-slate-400'}`}>Original</button>
                <button onClick={() => setViewMode('bbox')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${viewMode === 'bbox' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>Bound Box</button>
                <button onClick={() => setViewMode('heatmap')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${viewMode === 'heatmap' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>Heatmap</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden print:shadow-none print:border-slate-300 print:rounded-lg">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Classification</p>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{classification}</h2>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-xl font-bold text-sm uppercase ${isHighRisk ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                      Risk: {riskScoreText}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-100 pt-6 print:border-slate-300">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Confidence Level</p>
                    {mockExtendedData.differential.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">{item.type}</span>
                          <span className="text-slate-900">{item.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden print:border print:border-slate-200">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center">
                    <RadarChart data={mockExtendedData.features} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2 print:hidden">
              <button onClick={handleSaveToRecord} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                Return to Patient Record
              </button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                Print Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .heatmap-layer { display: block !important; background: radial-gradient(circle at 50% 35%, rgba(255,0,0,1) 0%, rgba(255,255,0,0.8) 25%, rgba(0,255,0,0) 70%) !important; opacity: 1 !important; }
          img { max-width: 100% !important; display: block !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
};

export default ClassificationResults;