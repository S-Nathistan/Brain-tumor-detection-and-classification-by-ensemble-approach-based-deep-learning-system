import React, { useState } from 'react';
import { api, getToken } from "../../../../util";
import { useNavigate } from "react-router-dom";

export default function UploadMRI() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/results/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);
      // alert("Scan uploaded and analyzed successfully!");
      // navigate("/image/results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 p-4 text-white rounded-t-xl border-b-4 border-blue-600">
        <h2 className="text-lg font-bold uppercase tracking-widest text-white">Upload MRI Scan</h2>
        <p className="text-[10px] text-blue-400 font-black tracking-tighter uppercase">AI Classification Engine</p>
      </div>

      <div className="p-6 bg-white rounded-b-xl shadow border border-slate-200 space-y-6">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 mb-4 mx-auto"
          />
          {file && <p className="text-xs font-bold text-slate-600">Selected: {file.name}</p>}
        </div>

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors uppercase tracking-widest"
        >
          {loading ? "Analyzing Scan..." : "Upload & Analyze"}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Analysis Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Predicted Classification</p>
                <p className={`text-xl font-black ${result.predicted_label.toLowerCase().includes('tumor') ? 'text-red-600' : 'text-green-600'} uppercase`}>
                  {result.predicted_label.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">AI Confidence</p>
                <p className="text-xl font-black text-slate-800">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            <button onClick={() => navigate("/image/results")} className="mt-6 text-xs text-blue-600 font-bold underline hover:text-blue-800">
              View All Past Results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMRI;