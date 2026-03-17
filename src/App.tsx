import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BrokerPacket from './pages/BrokerPacket'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'
import ResetPassword from './pages/ResetPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import CookiePolicy from './pages/CookiePolicy'
import DataRequest from './pages/DataRequest'
import Security from './pages/Security'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'
import { useDomainContext } from './hooks/useDomainContext'

function App() {
  const { mode, slug, carrierHostname } = useDomainContext()

  // Subdomain access: render carrier profile as the entire site
  if (mode === 'subdomain' && slug) {
    return (
      <ErrorBoundary>
        <Profile subdomainSlug={slug} />
        <CookieConsent />
      </ErrorBoundary>
    )
  }

  // Custom domain access: look up carrier by hostname
  if (mode === 'custom-domain' && carrierHostname) {
    return (
      <ErrorBoundary>
        <Profile customDomain={carrierHostname} />
        <CookieConsent />
      </ErrorBoundary>
    )
  }

  // Main domain: normal routing
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/data-request" element={<DataRequest />} />
        <Route path="/security" element={<Security />} />
        <Route path="/profile/:slug" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/broker-packet"
          element={
            <ProtectedRoute>
              <BrokerPacket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
      <CookieConsent />
    </ErrorBoundary>
  )
}

export default App
