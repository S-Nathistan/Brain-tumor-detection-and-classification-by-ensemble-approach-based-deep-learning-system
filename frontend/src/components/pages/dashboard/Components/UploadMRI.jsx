// import React from 'react';

// export default function UploadMRI() {
//   return (
//     <div className="p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold text-gray-700">Upload MRI</h2>
//       <div className="mt-4 text-gray-600">hi</div>
//     </div>
//   );
// }

//============================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';

const UploadMRI = () => {
  const { themeColor } = useOutletContext(); // Fallback if context missing
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient; 

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("System Ready");
  const [dragActive, setDragActive] = useState(false);

  // DRAG & DROP HANDLERS
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisStep("Image Loaded");
  };

  const startAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisStep("Initializing Neural Network...");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2; // Slower, smoother progress
      setProgress(currentProgress);
      
      // SIMULATE AI STEPS
      if (currentProgress > 20 && currentProgress < 50) setAnalysisStep("Preprocessing & Noise Reduction...");
      if (currentProgress > 50 && currentProgress < 80) setAnalysisStep("Segmenting Tumor Boundaries...");
      if (currentProgress > 80) setAnalysisStep("Calculating Risk Probability...");

      if (currentProgress >= 100) {
        clearInterval(interval);
        setAnalysisStep("Analysis Complete");
        setTimeout(() => {
          navigate('/image/results', { 
            state: { patient: patient, scanUrl: preview } 
          }); 
        }, 800);
      }
    }, 60); 
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col animate-in fade-in zoom-in duration-300">
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status: Online</p>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">MRI Diagnostic Hub</h2>
        </div>
        
        {/* Patient Context Tag */}
        {patient ? (
          <div className="flex items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              {patient.name.charAt(0)}
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Target Patient</p>
              <p className="text-sm font-black text-slate-800 leading-none">{patient.name}</p>
              <p className="text-[10px] font-mono text-indigo-600 font-bold">{patient.hospitalId}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-amber-700 text-xs font-bold">
            ⚠ General Analysis Mode (No Patient Linked)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* --- LEFT: UPLOAD ZONE (2 Cols) --- */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div 
            className={`flex-1 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 relative transition-all duration-300 overflow-hidden bg-slate-50
              ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300'}
              ${preview ? 'border-none p-0 bg-black' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Hidden Input */}
            <input 
              type="file" 
              accept="image/*,.dcm" 
              onChange={handleFileSelect} 
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              disabled={isAnalyzing} 
            />
            
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {/* Medical Grid Overlay */}
                <div className="absolute inset-0 z-10 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(slate 1px, transparent 1px), linear-gradient(90deg, slate 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                <img src={preview} alt="Scan" className="max-h-[450px] w-auto object-contain relative z-0 shadow-2xl" />
                
                {/* SCANNING ANIMATION LAYER */}
                {isAnalyzing && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="absolute bottom-10 left-10 text-white">
                      <p className="text-6xl font-black">{Math.round(progress)}%</p>
                      <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">{analysisStep}</p>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                {!isAnalyzing && (
                  <button 
                    onClick={(e) => {e.preventDefault(); setSelectedFile(null); setPreview(null);}}
                    className="absolute top-4 right-4 z-30 bg-red-600/90 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    title="Remove Image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center pointer-events-none z-10 transition-transform duration-300">
                <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${dragActive ? 'scale-110 text-blue-600' : 'text-slate-400'}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700">Drag & Drop MRI Scan</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">Supported: DICOM, PNG, JPG (Max 50MB)</p>
                <div className="mt-8">
                  <span className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all">Browse Files</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: CONTROLS & INFO --- */}
        <div className="flex flex-col justify-between">
          
          {/* Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3 mb-4">Scan Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">File Name</span>
                <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">{selectedFile ? selectedFile.name : "--"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">File Size</span>
                <span className="text-xs font-black text-slate-800">{selectedFile ? (selectedFile.size/1024/1024).toFixed(2) + " MB" : "--"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Modality</span>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">MRI / T2-W</span>
              </div>
              
              {/* Progress Detail */}
              {isAnalyzing && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400">Analysis Progress</span>
                    <span className="text-[10px] font-bold text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={startAnalysis}
            disabled={!selectedFile || isAnalyzing}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group
              ${!selectedFile ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95'}
            `}
          >
            {/* Glossy Effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine transition-all"></div>
            
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <span>Run Diagnostics</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.5; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.5; }
        }
        @keyframes shine {
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default UploadMRI;
