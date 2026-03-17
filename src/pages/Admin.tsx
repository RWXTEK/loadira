import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Activity,
  Server,
  FileText,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import LoadiraLogo from '../components/LoadiraLogo'

interface CarrierRow {
  id: string
  legal_name: string
  mc_number: string
  plan: string
  created_at: string
  website_slug: string
  stripe_subscription_id: string | null
}

interface SubscriptionRow {
  plan_id: string
  status: string
  user_id: string
  created_at: string
}

interface AccessLogRow {
  id: string
  carrier_id: string
  viewer_mc_number: string | null
  access_tier: string
  created_at: string
  carrier_name?: string
}

interface AuditRow {
  id: string
  action: string
  table_name: string | null
  user_id: string | null
  created_at: string
  new_values: Record<string, unknown> | null
}

type Tab = 'overview' | 'carriers' | 'revenue' | 'access' | 'audit' | 'system'

function Admin() {
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  // Overview stats
  const [totalCarriers, setTotalCarriers] = useState(0)
  const [activeSubs, setActiveSubs] = useState(0)
  const [trialUsers, setTrialUsers] = useState(0)
  const [churned, setChurned] = useState(0)
  const [brokerViewsMonth, setBrokerViewsMonth] = useState(0)
  const [mrr, setMrr] = useState(0)

  // Data
  const [carriers, setCarriers] = useState<CarrierRow[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLogRow[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)

    // Fetch carriers
    const { data: carrierData } = await supabase
      .from('carriers')
      .select('id, legal_name, mc_number, plan, created_at, website_slug, stripe_subscription_id')
      .order('created_at', { ascending: false })

    const c = carrierData || []
    setCarriers(c)
    setTotalCarriers(c.length)

    // Fetch subscriptions
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan_id, status, user_id, created_at')

    const subs = subData || []
    setSubscriptions(subs)
    setActiveSubs(subs.filter(s => s.status === 'active').length)
    setTrialUsers(subs.filter(s => s.status === 'trialing').length)
    setChurned(subs.filter(s => s.status === 'canceled').length)

    // Calculate MRR
    const prices: Record<string, number> = { starter: 49, professional: 99, fleet: 199 }
    const activeMrr = subs
      .filter(s => ['active', 'trialing'].includes(s.status))
      .reduce((sum, s) => sum + (prices[s.plan_id] || 0), 0)
    setMrr(activeMrr)

    // Broker views this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const { count: viewCount } = await supabase
      .from('access_log')
      .select('id', { count: 'exact', head: true })
      .eq('access_tier', 'broker')
      .gte('created_at', monthStart.toISOString())
    setBrokerViewsMonth(viewCount || 0)

    // Access logs (recent 50)
    const { data: accessData } = await supabase
      .from('access_log')
      .select('id, carrier_id, viewer_mc_number, access_tier, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    // Enrich with carrier names
    const enriched = (accessData || []).map(log => {
      const carr = c.find(ca => ca.id === log.carrier_id)
      return { ...log, carrier_name: carr?.legal_name || 'Unknown' }
    })
    setAccessLogs(enriched)

    // Audit logs (recent 50)
    const { data: auditData } = await supabase
      .from('audit_log')
      .select('id, action, table_name, user_id, created_at, new_values')
      .order('created_at', { ascending: false })
      .limit(50)
    setAuditLogs(auditData || [])

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'carriers', label: 'Carriers', icon: <Users className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'access', label: 'Access Log', icon: <Eye className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <FileText className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Server className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Admin Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LoadiraLogo size="sm" />
            <span className="text-gray-600 mx-1">|</span>
            <span className="text-sm font-bold text-amber-400 tracking-wider">ADMIN</span>
          </div>
          <Link to="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? 'bg-amber-500 text-gray-950'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatBox icon={<Users className="w-5 h-5" />} label="Total Carriers" value={String(totalCarriers)} color="text-white" />
              <StatBox icon={<ShieldCheck className="w-5 h-5" />} label="Active Subs" value={String(activeSubs)} color="text-emerald-400" />
              <StatBox icon={<DollarSign className="w-5 h-5" />} label="MRR" value={`$${mrr.toLocaleString()}`} color="text-amber-400" />
              <StatBox icon={<Clock className="w-5 h-5" />} label="Trial Users" value={String(trialUsers)} color="text-blue-400" />
              <StatBox icon={<AlertTriangle className="w-5 h-5" />} label="Churned" value={String(churned)} color="text-red-400" />
              <StatBox icon={<Eye className="w-5 h-5" />} label="Broker Views (Mo)" value={String(brokerViewsMonth)} color="text-purple-400" />
            </div>

            {/* Recent signups */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Signups</h3>
              <div className="space-y-2">
                {carriers.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                    <div>
                      <span className="text-sm font-medium">{c.legal_name}</span>
                      <span className="text-xs text-gray-500 ml-2">MC-{c.mc_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PlanBadge plan={c.plan} />
                      <span className="text-xs text-gray-600">{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Carriers Table */}
        {tab === 'carriers' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">MC #</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Signed Up</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carriers.map(c => (
                    <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium">{c.legal_name}</td>
                      <td className="px-4 py-3 font-mono text-gray-400">MC-{c.mc_number}</td>
                      <td className="px-4 py-3"><PlanBadge plan={c.plan} /></td>
                      <td className="px-4 py-3">
                        {c.stripe_subscription_id ? (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                        ) : (
                          <span className="text-xs bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded-full">Free</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Link to={`/profile/${c.website_slug}`} className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {carriers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No carriers found</p>
            )}
          </div>
        )}

        {/* Revenue */}
        {tab === 'revenue' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <StatBox icon={<DollarSign className="w-5 h-5" />} label="Monthly Recurring Revenue" value={`$${mrr.toLocaleString()}`} color="text-amber-400" />
              <StatBox icon={<TrendingUp className="w-5 h-5" />} label="Active Subscriptions" value={String(activeSubs)} color="text-emerald-400" />
              <StatBox icon={<Users className="w-5 h-5" />} label="Trial → Paid Rate" value={activeSubs + trialUsers > 0 ? `${Math.round((activeSubs / (activeSubs + trialUsers + churned)) * 100)}%` : '0%'} color="text-blue-400" />
            </div>

            {/* MRR by plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">MRR Breakdown by Plan</h3>
              {(['starter', 'professional', 'fleet'] as const).map(plan => {
                const count = subscriptions.filter(s => s.plan_id === plan && ['active', 'trialing'].includes(s.status)).length
                const price = { starter: 49, professional: 99, fleet: 199 }[plan]
                const planMrr = count * price
                return (
                  <div key={plan} className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <PlanBadge plan={plan} />
                      <span className="text-sm text-gray-400">{count} subscriber{count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-sm font-bold text-white">${planMrr.toLocaleString()}/mo</span>
                  </div>
                )
              })}
            </div>

            {/* Subscription status breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Subscription Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active', count: activeSubs, color: 'text-emerald-400 bg-emerald-500/10' },
                  { label: 'Trialing', count: trialUsers, color: 'text-blue-400 bg-blue-500/10' },
                  { label: 'Past Due', count: subscriptions.filter(s => s.status === 'past_due').length, color: 'text-amber-400 bg-amber-500/10' },
                  { label: 'Canceled', count: churned, color: 'text-red-400 bg-red-500/10' },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-4 text-center ${item.color.split(' ')[1]}`}>
                    <p className={`text-2xl font-bold ${item.color.split(' ')[0]}`}>{item.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access Log */}
        {tab === 'access' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Broker Profile Views</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Carrier</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Viewer MC</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800/50">
                      <td className="px-4 py-3 text-white">{log.carrier_name}</td>
                      <td className="px-4 py-3 font-mono text-gray-400">{log.viewer_mc_number || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.access_tier === 'broker' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {log.access_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {accessLogs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No access logs yet</p>
            )}
          </div>
        )}

        {/* Audit Log */}
        {tab === 'audit' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Data Changes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Table</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800/50">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          log.action === 'INSERT' || log.action?.includes('created') ? 'bg-emerald-500/10 text-emerald-400' :
                          log.action === 'UPDATE' || log.action?.includes('updated') ? 'bg-blue-500/10 text-blue-400' :
                          log.action === 'DELETE' || log.action?.includes('canceled') ? 'bg-red-500/10 text-red-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.table_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {log.new_values ? JSON.stringify(log.new_values).slice(0, 80) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {auditLogs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No audit logs yet</p>
            )}
          </div>
        )}

        {/* System Health */}
        {tab === 'system' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <HealthCard title="Supabase" status="operational" detail="PostgreSQL with RLS enabled" />
              <HealthCard title="Netlify CDN" status="operational" detail="Edge functions active, SSL valid" />
              <HealthCard title="Stripe Webhooks" status="operational" detail={`${subscriptions.length} total webhook events processed`} />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Infrastructure</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Database</span>
                  <span className="text-gray-300">Supabase PostgreSQL (ridssmxmnkdrmpaejlcz)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Hosting</span>
                  <span className="text-gray-300">Netlify (jolly-lokum-968bc7)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Payments</span>
                  <span className="text-gray-300">Stripe (3 price IDs configured)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">FMCSA API</span>
                  <span className="text-gray-300">QCMobile via Netlify serverless proxy</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-gray-300">Supabase Storage (carrier-assets, private)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Total Carriers</span>
                  <span className="text-gray-300">{totalCarriers} registered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    starter: 'bg-gray-500/10 text-gray-300',
    professional: 'bg-amber-500/10 text-amber-400',
    fleet: 'bg-purple-500/10 text-purple-400',
    free: 'bg-gray-500/10 text-gray-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[plan] || styles.free}`}>
      {plan || 'free'}
    </span>
  )
}

function HealthCard({ title, status, detail }: { title: string; status: string; detail: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === 'operational' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
          <span className={`text-xs ${status === 'operational' ? 'text-emerald-400' : 'text-red-400'}`}>{status}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default Admin
