import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { lookupByMcNumber } from '../lib/fmcsaApi'
import type { FmcsaCarrier } from '../lib/fmcsaApi'
import { sanitizeMcNumber, isValidMcNumber, isValidEmail, isValidPassword, getPasswordErrors, sanitizeText, sanitizeForDb } from '../lib/sanitize'
import LoadiraLogo from '../components/LoadiraLogo'

type Step = 'mc' | 'account' | 'confirm'

function Signup() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [step, setStep] = useState<Step>('mc')
  const [mcNumber, setMcNumber] = useState(sanitizeMcNumber(searchParams.get('mc') || ''))
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [fmcsaResult, setFmcsaResult] = useState<FmcsaCarrier | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [confirmedAge, setConfirmedAge] = useState(false)

  // Auto-lookup if MC number came from landing page
  useEffect(() => {
    if (searchParams.get('mc')) {
      handleMcLookup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMcLookup = async () => {
    const cleaned = sanitizeMcNumber(mcNumber)
    if (!cleaned) return

    if (!isValidMcNumber(cleaned)) {
      setLookupError('MC number must be 1-7 digits.')
      return
    }

    setIsLookingUp(true)
    setLookupError('')

    try {
      const data = await lookupByMcNumber(cleaned)
      setFmcsaResult(data)
      setStep('account')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Carrier not found.'
      setLookupError(message.includes('Rate limit') ? message : 'Carrier not found. Please check your MC number and try again.')
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms || !confirmedAge || !fmcsaResult) return

    // Validate inputs
    const cleanName = sanitizeText(fullName, 100)
    const cleanEmail = email.trim()

    if (!cleanName) {
      setSignupError('Please enter your full name.')
      return
    }
    if (!isValidEmail(cleanEmail)) {
      setSignupError('Please enter a valid email address.')
      return
    }
    if (!isValidPassword(password)) {
      const errors = getPasswordErrors(password)
      setSignupError('Password requirements: ' + errors.join(', ') + '.')
      return
    }

    setIsSubmitting(true)
    setSignupError('')

    // 1. Create the auth account
    const { error, userId, hasSession } = await signUp(cleanEmail, password, cleanName)

    if (error) {
      setSignupError(error)
      setIsSubmitting(false)
      return
    }

    // 2. If we have a session (email confirm disabled), create the carrier row
    if (userId && hasSession) {
      const slug = fmcsaResult.legalName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Sanitize all FMCSA data before DB insert
      const fmcsaRaw = sanitizeForDb({
        dbaName: fmcsaResult.dbaName,
        entityType: fmcsaResult.entityType,
        operatingStatus: fmcsaResult.operatingStatus,
        phone: fmcsaResult.phone,
        physicalAddress: fmcsaResult.physicalAddress,
        safetyRating: fmcsaResult.safetyRating,
        drivers: fmcsaResult.drivers,
        powerUnits: fmcsaResult.powerUnits,
        cargoCarried: fmcsaResult.cargoCarried,
        insuranceData: fmcsaResult.insuranceData,
        boc3OnFile: fmcsaResult.boc3OnFile,
        basicsScores: fmcsaResult.basicsScores,
      } as Record<string, unknown>)

      const { error: carrierError } = await supabase
        .from('carriers')
        .insert({
          user_id: userId,
          mc_number: sanitizeMcNumber(mcNumber),
          dot_number: fmcsaResult.dotNumber.replace(/\D/g, ''),
          legal_name: sanitizeText(fmcsaResult.legalName, 200),
          website_slug: slug,
          fmcsa_raw: fmcsaRaw,
          terms_accepted_at: new Date().toISOString(),
          age_confirmed: true,
        })

      if (carrierError) {
        console.error('Carrier insert error:', carrierError.message)
        setSignupError('Failed to create your carrier profile. Please try again or contact support.')
        setIsSubmitting(false)
        return
      }
    } else if (userId && !hasSession) {
      // Email confirmation required - user needs to check email
      // We'll create the carrier row after they confirm and log in
    }

    setIsSubmitting(false)
    setStep('confirm')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LoadiraLogo size="md" />
          </Link>
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <StepIndicator number={1} label="MC Number" active={step === 'mc'} completed={step !== 'mc'} />
            <div className={`w-12 h-px ${step === 'mc' ? 'bg-gray-700' : 'bg-orange-500'}`} />
            <StepIndicator
              number={2}
              label="Account"
              active={step === 'account'}
              completed={step === 'confirm'}
            />
            <div className={`w-12 h-px ${step === 'confirm' ? 'bg-orange-500' : 'bg-gray-700'}`} />
            <StepIndicator number={3} label="Confirm" active={step === 'confirm'} completed={false} />
          </div>

          {/* Step 1: MC Number Lookup */}
          {step === 'mc' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
              <h1 className="text-2xl font-bold mb-2">Let's find your carrier</h1>
              <p className="text-gray-400 mb-8">
                Enter your MC number and we'll pull your FMCSA data automatically.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="mc-number" className="block text-sm font-medium text-gray-300 mb-2">
                    MC Number
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="mc-number"
                      type="text"
                      inputMode="numeric"
                      maxLength={7}
                      value={mcNumber}
                      onChange={(e) => {
                        setMcNumber(sanitizeMcNumber(e.target.value))
                        setLookupError('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleMcLookup()}
                      placeholder="e.g. 123456"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {lookupError && <p className="text-red-400 text-sm mt-2">{lookupError}</p>}
                </div>

                <button
                  onClick={handleMcLookup}
                  disabled={!mcNumber.trim() || isLookingUp}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  {isLookingUp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Looking up carrier...
                    </>
                  ) : (
                    <>
                      Look Up My Carrier
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-6 text-center">
                We use the FMCSA SAFER system to verify your authority and pull your carrier details.
              </p>
            </div>
          )}

          {/* Step 2: Account Creation */}
          {step === 'account' && (
            <div>
              {/* Carrier Preview Card */}
              {fmcsaResult && (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-orange-400 font-medium uppercase tracking-wider mb-1">
                        Carrier Found
                      </p>
                      <h2 className="text-xl font-bold">{fmcsaResult.legalName}</h2>
                      {fmcsaResult.dbaName && (
                        <p className="text-gray-400 text-sm">DBA: {fmcsaResult.dbaName}</p>
                      )}
                    </div>
                    <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-orange-500/10">
                    <div>
                      <p className="text-xs text-gray-500">MC Number</p>
                      <p className="font-medium">{mcNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">DOT Number</p>
                      <p className="font-medium">{fmcsaResult.dotNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Power Units</p>
                      <p className="font-medium">{fmcsaResult.powerUnits}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStep('mc')
                      setFmcsaResult(null)
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300 mt-3 cursor-pointer"
                  >
                    Not your carrier? Go back
                  </button>
                </div>
              )}

              {/* Account Form */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                <p className="text-gray-400 mb-8">Set up your login to manage your carrier site.</p>

                {signupError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleCreateAccount} className="space-y-5">
                  <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(sanitizeText(e.target.value, 100))}
                      placeholder="John Smith"
                      required
                      maxLength={100}
                      className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@yourcompany.com"
                      required
                      className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    {email && !isValidEmail(email) && (
                      <p className="text-yellow-400 text-xs mt-1">Please enter a valid email address.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        required
                        minLength={8}
                        className="w-full px-4 pr-12 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {password && !isValidPassword(password) && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Needs: {getPasswordErrors(password).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 accent-orange-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      I have read and agree to the{' '}
                      <a href="/terms" target="_blank" className="text-orange-500 hover:text-orange-400 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-orange-500 hover:text-orange-400 underline">
                        Privacy Policy
                      </a>
                      , including the FMCSA data accuracy disclaimer and limitation of liability.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="age-confirm"
                      type="checkbox"
                      checked={confirmedAge}
                      onChange={(e) => setConfirmedAge(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 accent-orange-500"
                    />
                    <label htmlFor="age-confirm" className="text-sm text-gray-400">
                      I confirm that I am at least 18 years old and have the legal authority to represent this carrier.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!fullName || !email || !password || !agreedToTerms || !confirmedAge || isSubmitting || !isValidEmail(email) || !isValidPassword(password)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create Account & Build My Site
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
              <p className="text-gray-400 mb-8">
                Your carrier website is ready. Head to your dashboard to see everything.
              </p>

              {fmcsaResult && (
                <div className="bg-gray-800/50 rounded-xl p-5 mb-8 text-left">
                  <h3 className="font-semibold mb-3">What's been set up:</h3>
                  <ul className="space-y-2.5">
                    <ConfirmItem text={`Professional website for ${fmcsaResult.legalName}`} />
                    <ConfirmItem text="Carrier profile with your FMCSA data" />
                    <ConfirmItem text="Downloadable broker packet PDF" />
                    <ConfirmItem text="Shareable public profile link" />
                  </ul>
                </div>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Go to My Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
          active
            ? 'bg-orange-500 text-white'
            : completed
              ? 'bg-orange-500/20 text-orange-500'
              : 'bg-gray-800 text-gray-500'
        }`}
      >
        {completed ? <CheckCircle className="w-4 h-4" /> : number}
      </div>
      <span className={`text-xs ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}

function ConfirmItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
      <span className="text-sm text-gray-300">{text}</span>
    </li>
  )
}

export default Signup
