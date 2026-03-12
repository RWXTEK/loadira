import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-orange-500" />
              <span className="text-lg font-bold text-white">CarrierShield</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Professional online presence for trucking companies. Powered by FMCSA data.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/signup">Get Started</FooterLink>
              <FooterLink to="/login">Log In</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <FooterLink to="#">FMCSA Lookup</FooterLink>
              <FooterLink to="#">Broker Packet Guide</FooterLink>
              <FooterLink to="#">Safety Ratings</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              <FooterLink to="#">About</FooterLink>
              <FooterLink to="#">Terms of Service</FooterLink>
              <FooterLink to="#">Privacy Policy</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RWX-TEK INC. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            FMCSA data sourced from the QCMobile API. Not affiliated with the U.S. Department of Transportation.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        {children}
      </Link>
    </li>
  )
}

export default Footer
