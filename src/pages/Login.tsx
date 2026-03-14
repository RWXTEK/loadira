import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../lib/sanitize'
import LoadiraLogo from '../components/LoadiraLogo'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
      setIsLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')

    if (!isValidEmail(resetEmail)) {
      setResetError('Please enter a valid email address.')
      return
    }

    setResetLoading(true)

    const { error } = await resetPassword(resetEmail)
    if (error) {
      setResetError(error)
      setResetLoading(false)
    } else {
      setResetSent(true)
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LoadiraLogo size="md" />
          </Link>
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {showForgotPassword ? (
            /* Forgot Password View */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
                <p className="text-gray-400">Enter your email and we'll send you a reset link.</p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                {resetSent ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">Check your email</h2>
                    <p className="text-sm text-gray-400 mb-6">
                      We sent a password reset link to <span className="text-white font-medium">{resetEmail}</span>. Click the link in the email to set a new password.
                    </p>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetSent(false)
                        setResetEmail('')
                        setResetError('')
                      }}
                      className="text-sm text-orange-500 hover:text-orange-400 font-medium cursor-pointer"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    {resetError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
                        {resetError}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="john@yourcompany.com"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!resetEmail || resetLoading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending reset link...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setShowForgotPassword(false)
                          setResetError('')
                        }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Login View */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                <p className="text-gray-400">Log in to manage your carrier site.</p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true)
                          setResetEmail(email)
                          setError('')
                        }}
                        className="text-xs text-orange-500 hover:text-orange-400 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
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
                  </div>

                  <button
                    type="submit"
                    disabled={!email || !password || isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Log In
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-center text-sm text-gray-500">
                    By logging in, you agree to our{' '}
                    <a href="#" className="text-orange-500 hover:text-orange-400">Terms</a> and{' '}
                    <a href="#" className="text-orange-500 hover:text-orange-400">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
