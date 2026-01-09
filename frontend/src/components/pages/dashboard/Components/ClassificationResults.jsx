// import React from 'react';

// export default function ClassificationResults() {
//   return (
//     <div className="p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold text-gray-700">Classification Results</h2>
//       <div className="mt-4 text-gray-600">hi</div>
//     </div>
//   );
// }

//========================================================================================

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- HELPER COMPONENT: RADAR CHART ---
const RadarChart = ({ data }) => {
  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 20;
  const angleSlice = (Math.PI * 2) / data.length;

  // Calculate points for the polygon
  const points = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
    const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
    return `${x},${y}`;
  }).join(" ");

  // Calculate points for the labels
  const labelPoints = data.map((d, i) => {
    const r = radius + 15;
    const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
    const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
    return { x, y, label: d.label };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size + 60} height={size + 40} className="overflow-visible">
        {/* Background Grids (Concentric Circles) */}
        {[20, 40, 60, 80, 100].map((r, i) => (
          <circle key={i} cx={center} cy={center} r={(r / 100) * radius} fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}
        
        {/* Axis Lines */}
        {data.map((_, i) => {
          const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}

        {/* Data Polygon */}
        <polygon points={points} fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" strokeWidth="2" />
        
        {/* Data Points */}
        {data.map((d, i) => {
          const r = (d.value / 100) * radius;
          const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#2563eb" />;
        })}

        {/* Labels */}
        {labelPoints.map((p, i) => (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dy="0.35em" className="text-[9px] font-bold fill-slate-500 uppercase">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ClassificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const patient = location.state?.patient;
  const scanUrl = location.state?.scanUrl || patient?.mriImage || "https://via.placeholder.com/400x400?text=MRI+Scan";
  const [viewMode, setViewMode] = useState('original'); 

  // MOCK AI DATA
  const aiResult = {
    classification: "Meningioma",
    confidence: 94.2,
    riskScore: "High",
    tumorSize: "2.4cm x 1.8cm",
    location: "Frontal Lobe / Superior",
    bbox: { top: '28%', left: '42%', width: '22%', height: '24%' },
    differential: [
      { type: "Meningioma", score: 94.2, color: "bg-blue-600" },
      { type: "Glioma", score: 4.1, color: "bg-slate-300" },
      { type: "Pituitary Tumor", score: 1.7, color: "bg-slate-300" }
    ],
    // DATA FOR THE RADAR GRAPH
    features: [
      { label: "Density", value: 85 },
      { label: "Symmetry", value: 40 }, // Tumors often lack symmetry
      { label: "Texture", value: 90 },
      { label: "Margin", value: 75 },
      { label: "Edema", value: 60 }
    ]
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <p>No analysis data found.</p>
      <button onClick={() => navigate('/patients')} className="text-blue-600 underline">Return to Records</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER CARD */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Analysis Report For</p>
            <h1 className="text-2xl font-black text-slate-800">{patient.name}</h1>
            <p className="text-xs text-slate-500 font-mono font-bold">{patient.hospitalId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis ID</p>
          <p className="text-sm font-mono font-bold text-slate-800">#AI-{Math.floor(Math.random()*10000)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE IMAGE VIEWER */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 h-[450px] group">
            <img src={scanUrl} alt="MRI Scan" className="w-full h-full object-cover opacity-90" />
            
            {viewMode === 'bbox' && (
              <div 
                className="absolute border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"
                style={{ top: aiResult.bbox.top, left: aiResult.bbox.left, width: aiResult.bbox.width, height: aiResult.bbox.height }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500"></div>
                <span className="absolute -top-7 left-0 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">Tumor {aiResult.confidence}%</span>
              </div>
            )}

            {viewMode === 'heatmap' && (
              <div className="absolute inset-0 opacity-50 mix-blend-screen" style={{background: `radial-gradient(circle at 50% 35%, rgba(255,0,0,0.8) 0%, rgba(255,255,0,0.6) 20%, rgba(0,255,0,0) 60%)`}}></div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl flex gap-1 shadow-xl border border-slate-700">
              <button onClick={() => setViewMode('original')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'original' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>Original</button>
              <button onClick={() => setViewMode('bbox')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'bbox' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Bound Box</button>
              <button onClick={() => setViewMode('heatmap')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'heatmap' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}>Heatmap</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Processing Time</p>
              <p className="text-sm font-black text-slate-800">0.84s</p>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Model</p>
              <p className="text-sm font-black text-emerald-600">ResNet-50</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED REPORT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Classification Result */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 rounded-full ${aiResult.riskScore === 'High' ? 'bg-red-600' : 'bg-green-500'}`}></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Classification</p>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{aiResult.classification}</h2>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-4 py-2 rounded-xl font-bold text-sm uppercase ${aiResult.riskScore === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    Risk: {aiResult.riskScore}
                  </span>
                </div>
              </div>

              {/* NEW: SPLIT VIEW FOR DIAGNOSIS & RADAR CHART */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-100 pt-6">
                
                {/* 1. Probability Bars */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Differential Diagnosis</p>
                  {aiResult.differential.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{item.type}</span>
                        <span className="text-slate-900">{item.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Feature Radar Chart */}
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Morphometric Features</p>
                  <RadarChart data={aiResult.features} />
                </div>

              </div>
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📍</span>
                <p className="text-[10px] font-black text-slate-400 uppercase">Affected Region</p>
              </div>
              <p className="text-lg font-bold text-slate-700">{aiResult.location}</p>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📏</span>
                <p className="text-[10px] font-black text-slate-400 uppercase">Est. Tumor Size</p>
              </div>
              <p className="text-lg font-bold text-slate-700">{aiResult.tumorSize}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <span>📥</span> Save to Patient Record
            </button>
            <button className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
              <span>🖨️</span> Print Full Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClassificationResults;
