import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Globe, ChevronRight, Star, Zap, Clock, Loader2, CheckCircle, Users, MapPin, ArrowRight, Shield, Truck } from 'lucide-react'
import { lookupByMcNumber } from '../lib/fmcsaApi'
import { sanitizeMcNumber } from '../lib/sanitize'
import LoadiraLogo from '../components/LoadiraLogo'
import type { FmcsaCarrier } from '../lib/fmcsaApi'

function Landing() {
  const [mcNumber, setMcNumber] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [carrier, setCarrier] = useState<FmcsaCarrier | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = sanitizeMcNumber(mcNumber)
    if (!cleaned) return

    // If we already have a carrier preview, go to signup
    if (carrier) {
      navigate(`/signup?mc=${encodeURIComponent(cleaned)}`)
      return
    }

    setIsLooking(true)
    setLookupError('')

    try {
      const data = await lookupByMcNumber(cleaned)
      setCarrier(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Carrier not found.'
      setLookupError(message.includes('Rate limit') ? message : 'Carrier not found. Please check your MC number and try again.')
    } finally {
      setIsLooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LoadiraLogo size="md" />
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Log In
            </a>
            <a
              href="/signup"
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="flex justify-center mb-8">
            <LoadiraLogo size="hero" />
          </div>

          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-400 font-medium">Powered by FMCSA Data</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Your Trucking Business Deserves a{' '}
            <span className="text-orange-500">Professional Online Presence</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Enter your MC number. We pull your FMCSA data. Your website builds itself in 60 seconds.
          </p>

          {/* MC Number Input */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  value={mcNumber}
                  onChange={(e) => {
                    setMcNumber(sanitizeMcNumber(e.target.value))
                    setLookupError('')
                    setCarrier(null)
                  }}
                  placeholder="Enter your MC number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!mcNumber.trim() || isLooking}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/25 cursor-pointer"
              >
                {isLooking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Looking up...
                  </>
                ) : carrier ? (
                  <>
                    Continue to Sign Up
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Build My Site Now
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            {lookupError && (
              <p className="text-red-400 text-sm mt-3">{lookupError}</p>
            )}
            {!lookupError && !carrier && (
              <p className="text-sm text-gray-500 mt-3">
                No credit card required to preview your site
              </p>
            )}
          </form>

          {/* Carrier Preview */}
          {carrier && (
            <div className="max-w-xl mx-auto mt-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 text-left">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-orange-400 font-medium uppercase tracking-wider mb-1">
                    Carrier Found
                  </p>
                  <h3 className="text-xl font-bold">{carrier.legalName}</h3>
                  {carrier.dbaName && (
                    <p className="text-gray-400 text-sm">DBA: {carrier.dbaName}</p>
                  )}
                </div>
                <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-orange-500/10">
                <div>
                  <p className="text-xs text-gray-500">MC Number</p>
                  <p className="font-medium">{carrier.mcNumber || mcNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DOT Number</p>
                  <p className="font-medium">{carrier.dotNumber}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Power Units</p>
                    <p className="font-medium">{carrier.powerUnits}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Drivers</p>
                    <p className="font-medium">{carrier.drivers}</p>
                  </div>
                </div>
              </div>
              {carrier.physicalAddress.city && (
                <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {carrier.physicalAddress.city}, {carrier.physicalAddress.state} {carrier.physicalAddress.zip}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to look <span className="text-orange-500">legit</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We pull your authority data and build your entire online presence automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Professional Website"
            description="A polished, mobile-ready website that showcases your fleet, services, and safety record. Ready to share with brokers instantly."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Broker Packet PDF"
            description="Auto-generated broker packet with your authority info, insurance details, and safety rating. Download and send in one click."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Carrier Profile"
            description="Your FMCSA data displayed professionally — authority status, insurance, inspections, and safety scores all in one place."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Live in <span className="text-orange-500">three steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              step="01"
              title="Enter Your MC Number"
              description="That's it. We handle everything else."
            />
            <StepCard
              step="02"
              title="We Fetch Your Data"
              description="FMCSA authority, insurance, safety scores — pulled automatically."
            />
            <StepCard
              step="03"
              title="Your Site Goes Live"
              description="Professional website + broker packet, ready to share."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-orange-500 fill-orange-500" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-200 mb-6 leading-relaxed">
            "I entered my MC number and had a professional website in under a minute. Brokers take me
            seriously now."
          </blockquote>
          <p className="text-gray-500">— Owner-Operator, Texas</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-orange-400 mb-4">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Takes less than 60 seconds</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to build your carrier website?
          </h2>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={7}
              value={mcNumber}
              onChange={(e) => setMcNumber(sanitizeMcNumber(e.target.value))}
              placeholder="MC number"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/25 cursor-pointer"
            >
              Get Started
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <LoadiraLogo size="sm" />
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Loadira - A RWX-TEK INC Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-orange-500/20 mb-4">{step}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

export default Landing
