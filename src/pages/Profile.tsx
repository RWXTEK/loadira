import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  MapPin,
  Truck,
  Users,
  ShieldCheck,
  FileText,
  Package,
  CheckCircle,
  ArrowRight,
  Globe,
  AlertTriangle,
  Calendar,
  Loader2,
  Lock,
  Eye,
} from 'lucide-react'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { sanitizeText, isValidEmail, sanitizeForDb } from '../lib/sanitize'
import { mockCarrier, buildCarrierDisplay, getSafetyRatingColor } from '../lib/mockFmcsa'
import type { Carrier } from '../hooks/useAuth'
import LoadiraLogo from '../components/LoadiraLogo'
import { FmcsaBanner } from '../components/FmcsaDisclaimer'
import type { CarrierData } from '../lib/mockFmcsa'

type AccessTier = 'public' | 'broker'

function Profile({ subdomainSlug, customDomain }: { subdomainSlug?: string; customDomain?: string } = {}) {
  const { slug: routeSlug } = useParams<{ slug: string }>()
  const effectiveSlug = subdomainSlug || routeSlug
  const [carrier, setCarrier] = useState<CarrierData & { carrierId: string }>({ ...mockCarrier, carrierId: '' })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accessTier, setAccessTier] = useState<AccessTier>('public')

  // Broker verification state
  const [brokerMc, setBrokerMc] = useState('')
  const [brokerVerifying, setBrokerVerifying] = useState(false)
  const [brokerError, setBrokerError] = useState('')

  useEffect(() => {
    async function fetchCarrier() {
      let carrierRow = null

      if (effectiveSlug) {
        const { data } = await supabase
          .from('carriers')
          .select('*')
          .eq('website_slug', effectiveSlug)
          .single()
        carrierRow = data
      } else if (customDomain) {
        const { data } = await supabase
          .from('carriers')
          .select('*')
          .eq('custom_domain', customDomain)
          .single()
        carrierRow = data
      }

      if (carrierRow) {
        const display = buildCarrierDisplay(carrierRow as Carrier)
        setCarrier({ ...display, carrierId: carrierRow.id })

        // Log public view
        await supabase.from('access_log').insert({
          carrier_id: carrierRow.id,
          access_tier: 'public',
        }).then(() => {})
      } else if (effectiveSlug || customDomain) {
        setNotFound(true)
      }
      setLoading(false)
    }

    fetchCarrier()
  }, [effectiveSlug, customDomain])

  // Broker MC verification
  const handleBrokerVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setBrokerError('')
    const cleanMc = brokerMc.replace(/\D/g, '')
    if (!cleanMc || cleanMc.length > 7) {
      setBrokerError('Please enter a valid MC number (digits only, up to 7).')
      return
    }

    setBrokerVerifying(true)

    // Log the broker access
    await supabase.from('access_log').insert({
      carrier_id: carrier.carrierId,
      viewer_mc_number: cleanMc,
      access_tier: 'broker',
    }).then(() => {})

    setAccessTier('broker')
    setBrokerVerifying(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Carrier Not Found</h1>
          <p className="text-gray-400 mb-6">This carrier profile doesn't exist or has been removed.</p>
          <a href="https://loadira.com" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">Go to Loadira</a>
        </div>
      </div>
    )
  }

  const rating = getSafetyRatingColor(carrier.safetyRating)
  const isBroker = accessTier === 'broker'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* noindex for privacy */}
      {typeof document !== 'undefined' && (() => {
        const existing = document.querySelector('meta[name="robots"]')
        if (!existing) {
          const meta = document.createElement('meta')
          meta.name = 'robots'
          meta.content = 'noindex, nofollow'
          document.head.appendChild(meta)
        }
        return null
      })()}

      {/* Nav */}
      <nav className="border-b border-gray-800/50" role="navigation" aria-label="Carrier profile navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LoadiraLogo size="sm" />
            <span className="text-gray-600 mx-1">|</span>
            <span className="text-xl font-bold tracking-tight">{carrier.dbaName || carrier.legalName}</span>
          </div>
          <a href="#request-quote" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Request a Quote
          </a>
        </div>
      </nav>

      <FmcsaBanner />

      {/* Access tier indicator */}
      {isBroker && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 text-xs text-emerald-400">
            <Eye className="w-3.5 h-3.5" />
            <span>Verified broker view — additional carrier details are visible</span>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-500/5 to-gray-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${rating.bg} ${rating.text}`}>
                  {rating.label}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  Active Authority
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{carrier.legalName}</h1>
              {carrier.dbaName && (
                <p className="text-xl text-gray-400">DBA: {carrier.dbaName}</p>
              )}
              {/* Location only (no phone/email in Tier 1) */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                {carrier.address.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {carrier.address.city}, {carrier.address.state}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 text-sm text-gray-400">
              <span className="font-mono">{carrier.mcNumber}</span>
              <span className="font-mono">DOT {carrier.dotNumber}</span>
              <span>{carrier.operatingStatus}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* About */}
        {carrier.companyDescription && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-400 leading-relaxed max-w-3xl">{carrier.companyDescription}</p>
          </section>
        )}

        {/* TIER 1: Public Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <ProfileStat icon={<Truck className="w-5 h-5" />} label="Power Units" value={String(carrier.totalPowerUnits)} />
          <ProfileStat icon={<Users className="w-5 h-5" />} label="Drivers" value={String(carrier.totalDrivers)} />
          <ProfileStat icon={<ShieldCheck className="w-5 h-5" />} label="Safety Rating" value={carrier.safetyRating} />
          <ProfileStat icon={<Calendar className="w-5 h-5" />} label="Rating Date" value={carrier.safetyRatingDate || 'N/A'} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            {/* TIER 1: Equipment (types only, public) */}
            {Object.values(carrier.equipment).some(v => v > 0) && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  Equipment
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {Object.entries(carrier.equipment)
                    .filter(([, count]) => count > 0)
                    .map(([type, count]) => (
                      <div key={type} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <p className="text-2xl font-bold text-orange-500">{count}</p>
                        <p className="text-sm text-gray-400 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* TIER 1: Service Lanes (public) */}
            {carrier.serviceLanes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                  Service Lanes
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {carrier.serviceLanes.map((lane) => (
                    <div key={lane} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm">{lane}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TIER 2: Broker-only sections */}
            {isBroker ? (
              <>
                {/* Cargo Types (broker view) */}
                {carrier.cargoCarried.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      Cargo Types
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {carrier.cargoCarried.map((cargo) => (
                        <span key={cargo} className="text-sm bg-gray-900 border border-gray-800 text-gray-300 px-3 py-1.5 rounded-lg">{cargo}</span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Inspection History (broker view) */}
                <section>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Inspection & Safety Record
                  </h2>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="grid sm:grid-cols-3 gap-6">
                      <InspectionStat label="Vehicle Inspections" total={carrier.inspections.vehicleTotal} oos={carrier.inspections.vehicleOos} rate={carrier.inspections.vehicleOosRate} />
                      <InspectionStat label="Driver Inspections" total={carrier.inspections.driverTotal} oos={carrier.inspections.driverOos} rate={carrier.inspections.driverOosRate} />
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Crash Summary</p>
                        <p className="text-3xl font-bold">{carrier.crashes.total}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {carrier.crashes.fatal} fatal &middot; {carrier.crashes.injury} injury &middot; {carrier.crashes.towaway} towaway
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact info (broker view) */}
                <section>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Contact & Location
                  </h2>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Physical Address</p>
                        <p className="text-gray-300">{carrier.address.street}</p>
                        <p className="text-gray-300">{carrier.address.city}, {carrier.address.state} {carrier.address.zip}</p>
                      </div>
                      {carrier.mailingAddress.street && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mailing Address</p>
                          <p className="text-gray-300">{carrier.mailingAddress.street}</p>
                          <p className="text-gray-300">{carrier.mailingAddress.city}, {carrier.mailingAddress.state} {carrier.mailingAddress.zip}</p>
                        </div>
                      )}
                    </div>
                    {(carrier.phone || carrier.email) && (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-6 text-sm text-gray-400">
                        {carrier.phone && <span>{carrier.phone}</span>}
                        {carrier.email && <span>{carrier.email}</span>}
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              /* Broker verification gate */
              <section>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                  <Lock className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Broker Verification Required</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                    Enter your MC number to view contact information, full inspection history, crash records, and cargo types.
                  </p>
                  <form onSubmit={handleBrokerVerify} className="max-w-sm mx-auto">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={7}
                        value={brokerMc}
                        onChange={(e) => { setBrokerMc(e.target.value.replace(/\D/g, '')); setBrokerError('') }}
                        placeholder="Your MC number"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        aria-label="Enter your MC number for verification"
                      />
                      <button type="submit" disabled={brokerVerifying || !brokerMc} className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed text-sm">
                        {brokerVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                    {brokerError && <p className="text-red-400 text-xs mt-2">{brokerError}</p>}
                  </form>
                </div>
              </section>
            )}

            {/* TIER 3: Insurance — NEVER shown on web. Always show notice. */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Insurance
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center">
                <Lock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-300 font-medium mb-1">Insurance certificates available upon request</p>
                <p className="text-xs text-gray-500">
                  Contact the carrier directly for COI, BIPD coverage details, cargo insurance limits, and policy numbers. Insurance data is not displayed publicly for security purposes.
                </p>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Request Quote Form */}
            <div id="request-quote" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Request a Quote</h3>
              <QuoteForm carrierId={carrier.carrierId} />
            </div>

            {/* Quick Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="MC Number" value={carrier.mcNumber} />
                <InfoRow label="DOT Number" value={carrier.dotNumber} />
                <InfoRow label="Entity Type" value={carrier.entityType} />
                <InfoRow label="Status" value={carrier.operatingStatus} />
                {carrier.carrierOperation.length > 0 && (
                  <InfoRow label="Operations" value={carrier.carrierOperation.join(', ')} />
                )}
              </div>
            </div>

            {/* Broker Packet — no download, contact carrier */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Broker Packet</h3>
              <p className="text-sm text-gray-400 mb-3">
                Request a complete broker packet including authority, insurance certificates, and safety documentation.
              </p>
              <a href="#request-quote" className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm">
                Request Packet
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Powered By */}
      <div className="border-t border-gray-800/50 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Powered by</span>
          <LoadiraLogo size="sm" />
        </div>
      </div>

      <Footer />
    </div>
  )
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-center">
      <div className="flex justify-center text-orange-500 mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InspectionStat({ label, total, oos, rate }: { label: string; total: number; oos: number; rate: number }) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold">{total}</p>
      <p className="text-xs text-gray-500 mt-1">{oos} out-of-service ({rate}%)</p>
      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${rate < 10 ? 'bg-emerald-500' : rate < 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(rate * 3, 100)}%` }} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 text-right">{value}</span>
    </div>
  )
}

function QuoteForm({ carrierId }: { carrierId: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const cleanName = sanitizeText(name, 100)
    const cleanEmail = email.trim()
    const cleanDetails = sanitizeText(details, 2000)

    if (!cleanName) { setFormError('Please enter your name.'); return }
    if (!isValidEmail(cleanEmail)) { setFormError('Please enter a valid email.'); return }
    if (!cleanDetails) { setFormError('Please enter shipment details.'); return }

    setIsLoading(true)

    if (carrierId) {
      const sanitizedData = sanitizeForDb({
        carrier_id: carrierId,
        name: cleanName,
        email: cleanEmail,
        details: cleanDetails,
      } as Record<string, unknown>)
      await supabase.from('quote_requests').insert(sanitizedData)
    }

    setIsLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <p className="font-semibold mb-1">Quote Request Sent!</p>
        <p className="text-sm text-gray-400">We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-400 text-sm">{formError}</p>}
      <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(sanitizeText(e.target.value, 100))} required maxLength={100} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
      <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
      <textarea placeholder="Shipment details (origin, destination, freight type...)" value={details} onChange={(e) => setDetails(sanitizeText(e.target.value, 2000))} rows={4} required maxLength={2000} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none" />
      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Quote Request <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  )
}

export default Profile
