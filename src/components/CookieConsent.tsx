import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

type ConsentStatus = 'pending' | 'accepted' | 'rejected'
const CONSENT_KEY = 'loadira_cookie_consent'

export function getCookieConsent(): ConsentStatus {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) || 'pending'
  } catch {
    return 'pending'
  }
}

export default function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>('accepted') // don't flash on load

  useEffect(() => {
    setStatus(getCookieConsent())
  }, [])

  if (status !== 'pending') return null

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setStatus('accepted')
  }

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected')
    setStatus('rejected')
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 border-t border-gray-800 shadow-2xl shadow-black/50"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-300 leading-relaxed">
            We use essential cookies for authentication and site functionality. We do not use tracking, analytics, or advertising cookies.{' '}
            <Link to="/cookie-policy" className="text-amber-400 hover:text-amber-300 underline">Cookie Policy</Link>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            By clicking "Accept," you consent to essential cookie usage. Under GDPR, ePrivacy Directive, UK PECR, and PIPEDA, you may reject non-essential cookies at any time.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleReject}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Reject non-essential cookies"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="text-sm bg-amber-500 text-gray-950 font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            aria-label="Accept cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
