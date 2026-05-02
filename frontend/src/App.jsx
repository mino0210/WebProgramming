import { Routes, Route, Navigate } from 'react-router-dom'
import MapPage    from './pages/MapPage'
import LoginPage  from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  return (
    <Routes>
      <Route path="/"       element={<MapPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="*"       element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
