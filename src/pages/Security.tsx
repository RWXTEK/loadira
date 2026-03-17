import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, Eye, Globe, Server, FileText } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Security() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise-Grade <span className="text-amber-400">Security</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your carrier data is protected by the same infrastructure trusted by Fortune 500 companies. Here's exactly how we keep it safe.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 pb-24 space-y-12">
          <SecuritySection
            icon={<Eye className="w-6 h-6" />}
            title="3-Tier Data Access Model"
            description="Not everyone sees the same data. We built a layered privacy system so you control what's visible."
          >
            <div className="space-y-4">
              <TierCard tier="1" label="Public View" color="emerald" description="Anyone visiting your profile sees: company name, MC/DOT numbers, authority status, safety rating, equipment types, service lanes, and driver count. No contact details, no financial data." />
              <TierCard tier="2" label="Verified Broker" color="amber" description="Brokers must enter their own MC number to unlock contact information, inspection history, crash records, and cargo types. Every verification is logged with their MC number and timestamp." />
              <TierCard tier="3" label="Insurance Data" color="red" description="Insurance policy numbers, BIPD amounts, cargo coverage limits, and COI documents are NEVER displayed on any public URL. Carriers share insurance certificates directly via email on a case-by-case basis." />
            </div>
          </SecuritySection>

          <SecuritySection
            icon={<Lock className="w-6 h-6" />}
            title="Insurance Data Protection"
            description="Your insurance information never appears on your public profile."
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              Unlike other carrier directory sites, Loadira never displays insurance policy numbers, coverage amounts, or insurer names on your public profile. This data stays in your private dashboard only. When a broker needs your COI, you download it from your dashboard and send it directly. This prevents unauthorized parties from scraping your insurance data.
            </p>
          </SecuritySection>

          <SecuritySection
            icon={<FileText className="w-6 h-6" />}
            title="Access Logging & Audit Trail"
            description="Every profile view is recorded. You can see exactly who looked at your carrier data."
          >
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              When a broker enters their MC number to view your extended profile, we log:
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> The broker's MC number</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Exact date and time of access</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Which data tier they accessed</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> All changes to your carrier data (audit log)</li>
            </ul>
          </SecuritySection>

          <SecuritySection
            icon={<Globe className="w-6 h-6" />}
            title="GDPR & CCPA Compliance"
            description="We comply with international data privacy regulations."
          >
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-medium text-white mb-1">GDPR (EU/UK)</p>
                <p className="text-gray-500">Data access, correction, deletion, and portability rights. Standard Contractual Clauses for transatlantic data transfer.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-medium text-white mb-1">CCPA (California)</p>
                <p className="text-gray-500">Right to know, delete, and opt-out. We do not sell personal information to any third party.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-medium text-white mb-1">PIPEDA (Canada)</p>
                <p className="text-gray-500">Meaningful consent, purpose limitation, and access rights under Canadian privacy law.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-medium text-white mb-1">COPPA</p>
                <p className="text-gray-500">Users must be 18+ with legal authority to represent their carrier. No data from minors.</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Exercise your rights anytime: <Link to="/data-request" className="text-amber-400 hover:text-amber-300">Data Rights Request</Link>
            </p>
          </SecuritySection>

          <SecuritySection
            icon={<Server className="w-6 h-6" />}
            title="Infrastructure & Encryption"
            description="Built on enterprise infrastructure with encryption at every layer."
          >
            <div className="space-y-3 text-sm text-gray-400">
              <InfraRow label="Database" value="Supabase (PostgreSQL) with row-level security — users can only access their own data" />
              <InfraRow label="File Storage" value="Supabase Storage with folder-scoped access controls — documents isolated per carrier" />
              <InfraRow label="Hosting" value="Netlify CDN with global edge network, DDoS protection, and automatic failover" />
              <InfraRow label="Encryption in Transit" value="TLS 1.3 on all connections — HSTS enforced with 1-year max-age" />
              <InfraRow label="Encryption at Rest" value="AES-256 encryption on database and storage via Supabase/AWS infrastructure" />
              <InfraRow label="Authentication" value="Supabase Auth with bcrypt password hashing, JWT tokens, and session management" />
              <InfraRow label="API Security" value="Server-side rate limiting, CORS restricted to loadira.com, Content Security Policy headers" />
              <InfraRow label="Payments" value="Stripe processes all payments — card numbers never touch our servers (PCI DSS compliant)" />
              <InfraRow label="File Uploads" value="Magic byte validation, file type restrictions (no SVG/executables), 2MB logo / 10MB document limits" />
            </div>
          </SecuritySection>

          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-4">Questions about our security practices?</p>
            <a href="mailto:customertek@rwxtek.com" className="text-amber-400 hover:text-amber-300 font-medium">customertek@rwxtek.com</a>
            <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600">
              <Link to="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
              <Link to="/cookie-policy" className="hover:text-gray-400">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function SecuritySection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">{icon}</div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TierCard({ tier, label, color, description }: { tier: string; label: string; color: string; description: string }) {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    red: 'border-red-500/20 bg-red-500/5',
  }
  const textColors: Record<string, string> = { emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400' }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors[color]} ${textColors[color]}`}>TIER {tier}</span>
        <span className={`text-sm font-semibold ${textColors[color]}`}>{label}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function InfraRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-500 font-medium w-36 flex-shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default Security
