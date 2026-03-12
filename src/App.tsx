import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<div>Signup</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/profile/:slug" element={<div>Profile</div>} />
    </Routes>
  )
}

export default App
