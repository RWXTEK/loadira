import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BrokerPacket from './pages/BrokerPacket'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile/:slug" element={<Profile />} />
      <Route path="/broker-packet" element={<BrokerPacket />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
