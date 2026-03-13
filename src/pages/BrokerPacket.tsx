import {
  Download,
  Printer,
  Share2,
  ShieldCheck,
  Truck,
  Users,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Package,
  Globe,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { buildCarrierDisplay, formatCurrency } from '../lib/mockFmcsa'

function BrokerPacket() {
  const { carrier: carrierRow } = useAuth()
  const carrier = buildCarrierDisplay(carrierRow)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              Broker Packet
            </h1>
            <p className="text-gray-400 mt-1">Preview and download your broker packet PDF.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Packet Header */}
          <div className="bg-gray-900 text-white px-10 py-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{carrier.legalName}</h2>
                </div>
                {carrier.dbaName && (
                  <p className="text-gray-400 ml-11">DBA: {carrier.dbaName}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="font-mono text-orange-400">{carrier.mcNumber}</p>
                <p className="font-mono text-gray-400">DOT {carrier.dotNumber}</p>
              </div>
            </div>
          </div>

          <div className="px-10 py-8 space-y-8">
            {/* Company Information */}
            <PacketSection title="Company Information">
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                <PacketField label="Legal Name" value={carrier.legalName} />
                <PacketField label="DBA Name" value={carrier.dbaName} />
                <PacketField label="MC Number" value={carrier.mcNumber} />
                <PacketField label="DOT Number" value={carrier.dotNumber} />
                <PacketField label="Entity Type" value={carrier.entityType} />
                <PacketField label="Operating Status" value={carrier.operatingStatus} />
                <PacketField
                  label="Physical Address"
                  value={`${carrier.address.street}, ${carrier.address.city}, ${carrier.address.state} ${carrier.address.zip}`}
                />
                <PacketField
                  label="Mailing Address"
                  value={`${carrier.mailingAddress.street}, ${carrier.mailingAddress.city}, ${carrier.mailingAddress.state} ${carrier.mailingAddress.zip}`}
                />
                <PacketField label="Phone" value={carrier.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                <PacketField label="Email" value={carrier.email} icon={<Mail className="w-3.5 h-3.5" />} />
              </div>
            </PacketSection>

            {/* Safety & Compliance */}
            <PacketSection title="Safety & Compliance">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs text-gray-500 mb-1">Safety Rating</p>
                  <p className={`text-lg font-bold ${
                    carrier.safetyRating === 'Satisfactory' ? 'text-emerald-600' :
                    carrier.safetyRating === 'Conditional' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{carrier.safetyRating}</p>
                  <p className="text-[11px] text-gray-400">as of {carrier.safetyRatingDate}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs text-gray-500 mb-1">Power Units</p>
                  <p className="text-lg font-bold">{carrier.totalPowerUnits}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs text-gray-500 mb-1">Drivers</p>
                  <p className="text-lg font-bold">{carrier.totalDrivers}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <InspectionBlock
                  label="Vehicle Inspections"
                  total={carrier.inspections.vehicleTotal}
                  oos={carrier.inspections.vehicleOos}
                  rate={carrier.inspections.vehicleOosRate}
                />
                <InspectionBlock
                  label="Driver Inspections"
                  total={carrier.inspections.driverTotal}
                  oos={carrier.inspections.driverOos}
                  rate={carrier.inspections.driverOosRate}
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Crash History</p>
                  <p className="text-sm">
                    <span className="font-semibold">{carrier.crashes.total}</span> total crashes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fatal: {carrier.crashes.fatal} | Injury: {carrier.crashes.injury} | Towaway: {carrier.crashes.towaway}
                  </p>
                </div>
              </div>
            </PacketSection>

            {/* Insurance */}
            <PacketSection title="Insurance Information">
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">BIPD (Liability)</h4>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required</span>
                      <span>{formatCurrency(carrier.insurance.bipdRequired)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">On File</span>
                      <span className="font-semibold">{formatCurrency(carrier.insurance.bipdOnFile)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Policy #</span>
                      <span className="font-mono text-xs">{carrier.insurance.bipdPolicyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Insurer</span>
                      <span className="text-xs">{carrier.insurance.bipdInsurer}</span>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Cargo</h4>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required</span>
                      <span>{formatCurrency(carrier.insurance.cargoRequired)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">On File</span>
                      <span className="font-semibold">{formatCurrency(carrier.insurance.cargoOnFile)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Policy #</span>
                      <span className="font-mono text-xs">{carrier.insurance.cargoPolicyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Insurer</span>
                      <span className="text-xs">{carrier.insurance.cargoInsurer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </PacketSection>

            {/* Equipment & Cargo */}
            <PacketSection title="Equipment & Cargo">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Fleet Breakdown
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(carrier.equipment)
                      .filter(([, count]) => count > 0)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-500 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Cargo Types
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {carrier.cargoCarried.map((cargo) => (
                      <span key={cargo} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {cargo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </PacketSection>

            {/* Service Lanes */}
            <PacketSection title="Service Lanes & Operations">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Service Lanes
                  </h4>
                  <div className="space-y-2">
                    {carrier.serviceLanes.map((lane) => (
                      <div key={lane} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {lane}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Operations</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {carrier.carrierOperation.map((op) => (
                      <div key={op} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {op}
                      </div>
                    ))}
                    {carrier.operationClassification.map((cls) => (
                      <div key={cls} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {cls}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PacketSection>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span>Generated by Loadira &middot; loadira.com</span>
              </div>
              <span>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PacketSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h3>
      {children}
    </section>
  )
}

function PacketField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1.5">
        {icon}
        {value}
      </p>
    </div>
  )
}

function InspectionBlock({
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
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-sm">
        <span className="font-semibold">{total}</span> total &middot;{' '}
        <span className={rate < 10 ? 'text-emerald-600' : rate < 20 ? 'text-yellow-600' : 'text-red-600'}>
          {oos} OOS ({rate}%)
        </span>
      </p>
    </div>
  )
}

export default BrokerPacket
