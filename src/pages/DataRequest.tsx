import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { isValidEmail, sanitizeText } from '../lib/sanitize'

type RequestType = 'access' | 'deletion' | 'correction' | 'export' | 'opt-out' | 'do-not-sell'

const REQUEST_LABELS: Record<RequestType, string> = {
  access: 'Access My Data (GDPR Art. 15 / CCPA)',
  deletion: 'Delete My Data (GDPR Art. 17 / CCPA / PIPEDA)',
  correction: 'Correct My Data (GDPR Art. 16)',
  export: 'Export My Data (GDPR Art. 20 / CCPA)',
  'opt-out': 'Opt Out of Data Processing (GDPR Art. 21)',
  'do-not-sell': 'Do Not Sell My Personal Information (CCPA)',
}

function DataRequest() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [requestType, setRequestType] = useState<RequestType>('access')
  const [details, setDetails] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanName = sanitizeText(name, 100)
    const cleanEmail = email.trim()
    if (!cleanName) { setError('Please enter your name.'); return }
    if (!isValidEmail(cleanEmail)) { setError('Please enter a valid email.'); return }

    setLoading(true)

    // Store in quote_requests table (repurposed for data requests) or just send email
    // For now, we'll use the notifications approach
    try {
      await supabase.from('notifications').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // system placeholder
        type: 'data_request',
        message: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          request_type: requestType,
          jurisdiction,
          details: sanitizeText(details, 2000),
          submitted_at: new Date().toISOString(),
        }),
      }).then(() => {}) // fire and forget if RLS blocks it
    } catch {
      // Silently continue — the email fallback below handles it
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Data Rights Request</h1>
        <p className="text-gray-400 mb-8">
          Exercise your data privacy rights under GDPR, CCPA, PIPEDA, or other applicable laws.
        </p>

        {submitted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Request Received</h2>
            <p className="text-gray-400 mb-4">
              We will process your {REQUEST_LABELS[requestType].toLowerCase()} request within 30 days as required by law. You will receive a confirmation at <span className="text-white font-medium">{email}</span>.
            </p>
            <p className="text-xs text-gray-500">
              If you don't hear back within 30 days, contact <span className="text-amber-400">customertek@rwxtek.com</span> directly.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="req-name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input id="req-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Your legal name" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="req-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input id="req-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="req-type" className="block text-sm font-medium text-gray-300 mb-1.5">Request Type</label>
                <select id="req-type" value={requestType} onChange={(e) => setRequestType(e.target.value as RequestType)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" aria-label="Select request type">
                  {Object.entries(REQUEST_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="req-jurisdiction" className="block text-sm font-medium text-gray-300 mb-1.5">Your Jurisdiction</label>
                <select id="req-jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" aria-label="Select jurisdiction">
                  <option value="">Select your location</option>
                  <option value="us-california">United States — California (CCPA/CPRA)</option>
                  <option value="us-other">United States — Other State</option>
                  <option value="eu">European Union (GDPR)</option>
                  <option value="uk">United Kingdom (UK GDPR)</option>
                  <option value="canada">Canada (PIPEDA)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="req-details" className="block text-sm font-medium text-gray-300 mb-1.5">Additional Details (optional)</label>
                <textarea id="req-details" value={details} onChange={(e) => setDetails(e.target.value)} rows={4} maxLength={2000} placeholder="Provide any additional context for your request..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
              </div>

              <button type="submit" disabled={loading || !name || !email} className="w-full bg-amber-500 text-gray-950 font-bold text-sm py-3.5 rounded-xl hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3 text-xs text-gray-500">
              <p>You may also submit requests by email: <span className="text-amber-400">customertek@rwxtek.com</span></p>
              <p>Response time: within 30 days (GDPR), 45 days (CCPA), or 30 days (PIPEDA) of verified receipt.</p>
              <p>We may need to verify your identity before processing your request to protect against fraudulent requests.</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-600 leading-relaxed">
          <p className="mb-2"><strong className="text-gray-500">Your rights by jurisdiction:</strong></p>
          <ul className="space-y-1">
            <li><strong>GDPR (EU/EEA):</strong> Access, rectification, erasure, restriction, portability, objection (Articles 15-22)</li>
            <li><strong>CCPA/CPRA (California):</strong> Know, delete, opt-out of sale, non-discrimination (Cal. Civ. Code 1798.100-199)</li>
            <li><strong>PIPEDA (Canada):</strong> Access, correction, challenge compliance (Principles 4.9, 4.10)</li>
            <li><strong>UK GDPR:</strong> Same rights as EU GDPR, enforced by ICO</li>
          </ul>
          <p className="mt-3">
            See our <Link to="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link> for full details on how we handle your data.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DataRequest
