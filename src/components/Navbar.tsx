import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, tenant, signOut } = useAuth()

  const authenticated = !!user
  const profileSlug = tenant?.slug || 'my-carrier'

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={authenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <img src="/loadira-logo.png" alt="Loadira" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">Loadira</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {authenticated ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to={`/profile/${profileSlug}`} active={location.pathname.startsWith('/profile/')}>My Profile</NavLink>
              <NavLink to="/broker-packet" active={isActive('/broker-packet')}>Broker Packet</NavLink>
              <NavLink to="/settings" active={isActive('/settings')}>Settings</NavLink>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/pricing" active={isActive('/pricing')}>Pricing</NavLink>
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800/50 px-6 py-4 space-y-3 bg-gray-950">
          {authenticated ? (
            <>
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to={`/profile/${profileSlug}`} onClick={() => setMobileOpen(false)}>My Profile</MobileLink>
              <MobileLink to="/broker-packet" onClick={() => setMobileOpen(false)}>Broker Packet</MobileLink>
              <MobileLink to="/settings" onClick={() => setMobileOpen(false)}>Settings</MobileLink>
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="block text-gray-300 hover:text-white py-2 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <MobileLink to="/pricing" onClick={() => setMobileOpen(false)}>Pricing</MobileLink>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)}>Log In</MobileLink>
              <MobileLink to="/signup" onClick={() => setMobileOpen(false)}>Get Started</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        active ? 'text-orange-500' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block text-gray-300 hover:text-white py-2 transition-colors"
    >
      {children}
    </Link>
  )
}

export default Navbar
