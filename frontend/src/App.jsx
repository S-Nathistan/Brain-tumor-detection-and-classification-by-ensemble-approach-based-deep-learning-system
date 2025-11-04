import { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import ResultViewer from "./components/ResultViewer";
import { getToken } from "./util";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [viewId, setViewId] = useState(null);

  if (!authed) return <LoginForm onLogin={()=>setAuthed(true)} />;
  return viewId
    ? <ResultViewer id={viewId} onBack={()=>setViewId(null)} />
    : <Dashboard onSelect={setViewId} />;
}
