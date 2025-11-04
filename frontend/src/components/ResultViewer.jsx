import { useEffect, useState } from "react";
import { api } from "../util";

export default function ResultViewer({ id, onBack }) {
  const [r, setR] = useState(null);
  useEffect(()=>{ api(`/results/${id}`).then(setR); }, [id]);
  if (!r) return "Loading...";
  return (
    <div style={{display:"grid", gap:8}}>
      <button onClick={onBack}>← Back</button>
      <h3>Result #{r.id}</h3>
      <p><b>Label:</b> {r.predicted_label}</p>
      <p><b>Confidence:</b> {(r.confidence*100).toFixed(1)}%</p>
    </div>
  );
}
