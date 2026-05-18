import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './screens/Welcome'
import LanguageSelect from './screens/LanguageSelect'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/language" element={<LanguageSelect />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/setup" element={<div>Setup</div>} />
        <Route path="/home" element={<div>Home</div>} />
        <Route path="/report" element={<div>Report</div>} />
        <Route path="/education" element={<div>Education</div>} />
        <Route path="/checkin" element={<div>Checkin</div>} />
        <Route path="/result" element={<div>Result</div>} />
        <Route path="/chat" element={<div>Chat</div>} />
        <Route path="/symptom" element={<div>Symptom</div>} />
        <Route path="/emergency" element={<div>Emergency</div>} />
      </Routes>
    </BrowserRouter>
  )
}