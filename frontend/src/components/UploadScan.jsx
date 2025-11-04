import { api } from "../util";

export default function UploadScan({ onDone }) {
  const onChange = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    await api("/results/upload", { method: "POST", body: fd, isForm: true });
    onDone?.();
  };
  return <input type="file" accept="image/*" onChange={onChange} />;
}

