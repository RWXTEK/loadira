import { Link } from 'react-router-dom'
import LoadiraLogo from './LoadiraLogo'

function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-950" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Loadira home">
              <LoadiraLogo size="sm" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Professional online presence for trucking companies. Powered by FMCSA data.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5" role="list">
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/signup">Get Started</FooterLink>
              <FooterLink to="/login">Log In</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5" role="list">
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
              <FooterLink to="/data-request">Do Not Sell My Info</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Your Rights</h4>
            <ul className="space-y-2.5" role="list">
              <FooterLink to="/data-request">Data Deletion Request</FooterLink>
              <FooterLink to="/data-request">Export My Data</FooterLink>
              <FooterLink to="/data-request">CCPA Opt-Out</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Loadira - A RWX-TEK INC Company. All rights reserved.
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
