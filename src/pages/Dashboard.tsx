import { Link } from 'react-router-dom'
import {
  Globe,
  FileText,
  User,
  Settings,
  ExternalLink,
  Download,
  ShieldCheck,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Eye,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { mockCarrier, getSafetyRatingColor, formatCurrency } from '../lib/mockFmcsa'

function Dashboard() {
  const carrier = mockCarrier
  const rating = getSafetyRatingColor(carrier.safetyRating)

  const safetyScore = Math.round(
    100 -
      (carrier.inspections.vehicleOosRate + carrier.inspections.driverOosRate) / 2 -
      carrier.crashes.total * 2
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar authenticated />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{carrier.legalName}</h1>
            <p className="text-gray-400 mt-1">
              {carrier.mcNumber} &middot; DOT {carrier.dotNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${carrier.websiteSlug}`}
              className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Public Site
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Site
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Safety Rating"
            value={carrier.safetyRating}
            valueClass={rating.text}
            subtext={`Rated ${carrier.safetyRatingDate}`}
          />
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="Power Units"
            value={String(carrier.totalPowerUnits)}
            subtext={`${carrier.equipment.tractorTrailers} tractors, ${carrier.equipment.straightTrucks} straight`}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Drivers"
            value={String(carrier.totalDrivers)}
            subtext="Active drivers on file"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Safety Score"
            value={`${safetyScore}/100`}
            valueClass={safetyScore >= 80 ? 'text-emerald-400' : safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'}
            subtext="Based on inspections & crashes"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Insurance Status */}
          <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              Insurance Status
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InsuranceRow
                label="BIPD (Liability)"
                required={carrier.insurance.bipdRequired}
                onFile={carrier.insurance.bipdOnFile}
                insurer={carrier.insurance.bipdInsurer}
                policy={carrier.insurance.bipdPolicyNumber}
              />
              <InsuranceRow
                label="Cargo"
                required={carrier.insurance.cargoRequired}
                onFile={carrier.insurance.cargoOnFile}
                insurer={carrier.insurance.cargoInsurer}
                policy={carrier.insurance.cargoPolicyNumber}
              />
            </div>
          </div>

          {/* Safety Score Widget */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Inspection Summary
            </h2>
            <div className="space-y-4">
              <InspectionRow
                label="Vehicle"
                total={carrier.inspections.vehicleTotal}
                oos={carrier.inspections.vehicleOos}
                rate={carrier.inspections.vehicleOosRate}
              />
              <InspectionRow
                label="Driver"
                total={carrier.inspections.driverTotal}
                oos={carrier.inspections.driverOos}
                rate={carrier.inspections.driverOosRate}
              />
              <div className="pt-3 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Crash History</span>
                  <span className="text-white">{carrier.crashes.total} total</span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>Fatal: {carrier.crashes.fatal}</span>
                  <span>Injury: {carrier.crashes.injury}</span>
                  <span>Towaway: {carrier.crashes.towaway}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionCard
            to={`/profile/${carrier.websiteSlug}`}
            icon={<Globe className="w-6 h-6" />}
            title="Carrier Website"
            description="View your public-facing carrier website"
            badge="Live"
          />
          <ActionCard
            to="/broker-packet"
            icon={<FileText className="w-6 h-6" />}
            title="Broker Packet"
            description="Preview and download your broker packet PDF"
          />
          <ActionCard
            to={`/profile/${carrier.websiteSlug}`}
            icon={<User className="w-6 h-6" />}
            title="Carrier Profile"
            description="View your full carrier profile with FMCSA data"
          />
          <ActionCard
            to="/settings"
            icon={<Settings className="w-6 h-6" />}
            title="Site Settings"
            description="Update logo, colors, and company info"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            <ActivityItem
              icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
              text="Carrier website published"
              time="2 hours ago"
            />
            <ActivityItem
              icon={<Download className="w-4 h-4 text-blue-400" />}
              text="Broker packet downloaded by dispatch@lonestarfreight.com"
              time="5 hours ago"
            />
            <ActivityItem
              icon={<ExternalLink className="w-4 h-4 text-orange-400" />}
              text="Profile viewed 12 times this week"
              time="1 day ago"
            />
            <ActivityItem
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
              text="FMCSA data refreshed — no changes detected"
              time="3 days ago"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  valueClass = 'text-white',
  subtext,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
  subtext: string
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-gray-400 mb-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
  )
}

function InsuranceRow({
  label,
  required,
  onFile,
  insurer,
  policy,
}: {
  label: string
  required: number
  onFile: number
  insurer: string
  policy: string
}) {
  const isCovered = onFile >= required
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isCovered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isCovered ? 'Covered' : 'Insufficient'}
        </span>
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>Required</span>
          <span className="text-gray-300">{formatCurrency(required)}</span>
        </div>
        <div className="flex justify-between">
          <span>On File</span>
          <span className="text-white font-medium">{formatCurrency(onFile)}</span>
        </div>
        <div className="pt-2 border-t border-gray-700 mt-2">
          <p className="text-gray-500 truncate">{insurer}</p>
          <p className="text-gray-600 text-[11px]">{policy}</p>
        </div>
      </div>
    </div>
  )
}

function InspectionRow({
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
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label} Inspections</span>
        <span className="text-white">{total} total</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${rate < 10 ? 'bg-emerald-500' : rate < 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(rate * 2, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-20 text-right">
          {oos} OOS ({rate}%)
        </span>
      </div>
    </div>
  )
}

function ActionCard({
  to,
  icon,
  title,
  description,
  badge,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}) {
  return (
    <Link
      to={to}
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-orange-500/30 transition-colors group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-colors">
          {icon}
        </div>
        {badge && (
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}

function ActivityItem({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {icon}
      <span className="text-sm text-gray-300 flex-1">{text}</span>
      <span className="text-xs text-gray-600">{time}</span>
    </div>
  )
}

export default Dashboard
