import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: March 16, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. What Are Cookies">
            <p>
              Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work efficiently and provide information to site owners.
            </p>
          </Section>

          <Section title="2. Cookies We Use">
            <p>Loadira uses <strong className="text-white">only essential cookies</strong> required for the Service to function:</p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Cookie</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Purpose</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50">
                    <td className="px-4 py-2 font-mono text-xs text-amber-400">sb-*-auth-token</td>
                    <td className="px-4 py-2">Supabase authentication session</td>
                    <td className="px-4 py-2">1 hour (refreshed)</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="px-4 py-2 font-mono text-xs text-amber-400">loadira_cookie_consent</td>
                    <td className="px-4 py-2">Stores your cookie consent preference</td>
                    <td className="px-4 py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. Cookies We Do NOT Use">
            <p>Loadira does not use:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Analytics or tracking cookies (no Google Analytics, no Mixpanel, no Hotjar)</li>
              <li>Advertising or retargeting cookies</li>
              <li>Third-party social media cookies</li>
              <li>Cross-site tracking cookies</li>
              <li>Fingerprinting or device identification technologies</li>
            </ul>
          </Section>

          <Section title="4. Your Rights">
            <p><strong className="text-white">GDPR (EU/EEA):</strong> Under the General Data Protection Regulation, you have the right to accept or reject non-essential cookies before they are placed on your device. Since Loadira uses only essential cookies, they are exempt from consent requirements under Article 5(3) of the ePrivacy Directive. We still provide the consent banner as a best practice.</p>
            <p><strong className="text-white">UK PECR:</strong> Under the UK Privacy and Electronic Communications Regulations, the same essential-cookie exemption applies.</p>
            <p><strong className="text-white">CCPA (California):</strong> Loadira does not sell personal information. No opt-out is required for essential cookies under CCPA.</p>
            <p><strong className="text-white">PIPEDA (Canada):</strong> Under the Personal Information Protection and Electronic Documents Act, we obtain meaningful consent for any non-essential data collection. Essential cookies for authentication are permitted.</p>
          </Section>

          <Section title="5. Managing Cookies">
            <p>
              You can delete cookies through your browser settings at any time. Note that disabling essential cookies may prevent you from logging in or using the Service. To reset your consent preference, clear your browser's local storage for loadira.com.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about our cookie practices: <span className="text-amber-400">customertek@rwxtek.com</span>
            </p>
            <p className="mt-3 text-gray-500">
              See also: <Link to="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link> | <Link to="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</Link>
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default CookiePolicy
