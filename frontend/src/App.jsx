import { Routes, Route, Navigate } from 'react-router-dom'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import MyReportsPage from './pages/MyReportsPage'
import DisasterGuidePage from './pages/DisasterGuidePage'
import StatsPage from './pages/StatsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/my-reports" element={<MyReportsPage />} />
      <Route path="/guide" element={<DisasterGuidePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
