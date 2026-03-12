import { useState } from 'react'
import {
  Shield,
  MapPin,
  Phone,
  Mail,
  Truck,
  Users,
  ShieldCheck,
  FileText,
  Package,
  CheckCircle,
  ArrowRight,
  Download,
  Globe,
  AlertTriangle,
  Calendar,
  Loader2,
} from 'lucide-react'
import Footer from '../components/Footer'
import { mockCarrier, getSafetyRatingColor, formatCurrency } from '../lib/mockFmcsa'

function Profile() {
  const carrier = mockCarrier
  const rating = getSafetyRatingColor(carrier.safetyRating)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Public Nav */}
      <nav className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold tracking-tight">{carrier.dbaName || carrier.legalName}</span>
          </div>
          <a
            href="#request-quote"
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Request a Quote
          </a>
        </div>
      </nav>

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
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {carrier.address.city}, {carrier.address.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {carrier.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {carrier.email}
                </span>
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
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-400 leading-relaxed max-w-3xl">{carrier.companyDescription}</p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <ProfileStat icon={<Truck className="w-5 h-5" />} label="Power Units" value={String(carrier.totalPowerUnits)} />
          <ProfileStat icon={<Users className="w-5 h-5" />} label="Drivers" value={String(carrier.totalDrivers)} />
          <ProfileStat icon={<ShieldCheck className="w-5 h-5" />} label="Safety Rating" value={carrier.safetyRating} />
          <ProfileStat icon={<Calendar className="w-5 h-5" />} label="Rating Date" value={carrier.safetyRatingDate} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Equipment */}
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
                      <p className="text-sm text-gray-400 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </section>

            {/* Cargo Types */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Cargo Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {carrier.cargoCarried.map((cargo) => (
                  <span
                    key={cargo}
                    className="text-sm bg-gray-900 border border-gray-800 text-gray-300 px-3 py-1.5 rounded-lg"
                  >
                    {cargo}
                  </span>
                ))}
              </div>
            </section>

            {/* Service Lanes */}
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

            {/* Insurance */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Insurance
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InsuranceCard
                  label="BIPD (Liability)"
                  required={carrier.insurance.bipdRequired}
                  onFile={carrier.insurance.bipdOnFile}
                  insurer={carrier.insurance.bipdInsurer}
                />
                <InsuranceCard
                  label="Cargo"
                  required={carrier.insurance.cargoRequired}
                  onFile={carrier.insurance.cargoOnFile}
                  insurer={carrier.insurance.cargoInsurer}
                />
              </div>
            </section>

            {/* Inspection History */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Inspection & Safety Record
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="grid sm:grid-cols-3 gap-6">
                  <InspectionStat
                    label="Vehicle Inspections"
                    total={carrier.inspections.vehicleTotal}
                    oos={carrier.inspections.vehicleOos}
                    rate={carrier.inspections.vehicleOosRate}
                  />
                  <InspectionStat
                    label="Driver Inspections"
                    total={carrier.inspections.driverTotal}
                    oos={carrier.inspections.driverOos}
                    rate={carrier.inspections.driverOosRate}
                  />
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

            {/* Address */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Location
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Physical Address</p>
                    <p className="text-gray-300">{carrier.address.street}</p>
                    <p className="text-gray-300">
                      {carrier.address.city}, {carrier.address.state} {carrier.address.zip}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mailing Address</p>
                    <p className="text-gray-300">{carrier.mailingAddress.street}</p>
                    <p className="text-gray-300">
                      {carrier.mailingAddress.city}, {carrier.mailingAddress.state} {carrier.mailingAddress.zip}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" /> {carrier.phone}
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" /> {carrier.email}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Broker Packet Download */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Broker Packet</h3>
              <p className="text-sm text-gray-400 mb-4">
                Download our complete broker packet with authority, insurance, and safety information.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer">
                <Download className="w-4 h-4" />
                Download Broker Packet
              </button>
            </div>

            {/* Request Quote Form */}
            <div id="request-quote" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Request a Quote</h3>
              <QuoteForm />
            </div>

            {/* Quick Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Entity Type" value={carrier.entityType} />
                <InfoRow label="Operating Status" value="Active" />
                <InfoRow label="MC Number" value={carrier.mcNumber} />
                <InfoRow label="DOT Number" value={carrier.dotNumber} />
                <InfoRow label="Operations" value={carrier.carrierOperation.join(', ')} />
                <InfoRow label="Classification" value={carrier.operationClassification.join(', ')} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Powered By Footer */}
      <div className="border-t border-gray-800/50 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Powered by</span>
          <Shield className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-400">CarrierShield</span>
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

function InsuranceCard({
  label,
  required,
  onFile,
  insurer,
}: {
  label: string
  required: number
  onFile: number
  insurer: string
}) {
  const covered = onFile >= required
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${covered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {covered ? 'Active' : 'Insufficient'}
        </span>
      </div>
      <p className="text-2xl font-bold">{formatCurrency(onFile)}</p>
      <p className="text-xs text-gray-500 mt-1">Required: {formatCurrency(required)}</p>
      <p className="text-xs text-gray-500 mt-2">{insurer}</p>
    </div>
  )
}

function InspectionStat({
  label,
  total,
  oos,
  rate,
}: {
  label: string
  total: number
  oos: number
  rate: number
}) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold">{total}</p>
      <p className="text-xs text-gray-500 mt-1">
        {oos} out-of-service ({rate}%)
      </p>
      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rate < 10 ? 'bg-emerald-500' : rate < 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(rate * 3, 100)}%` }}
        />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 text-right">{value}</span>
    </div>
  )
}

function QuoteForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
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
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
      />
      <textarea
        placeholder="Shipment details (origin, destination, freight type...)"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={4}
        required
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Send Quote Request
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}

export default Profile
