import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: March 16, 2026</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Introduction">
            <p>
              RWX-TEK INC ("Company," "we," "us," or "our") operates Loadira ("Service"). This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our Service. By using Loadira, you agree to the collection and use of information in accordance with this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="text-white font-medium mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Carrier information:</strong> MC number, DOT number, company name, phone, email, physical and mailing addresses, company description</li>
              <li><strong>Insurance details:</strong> Insurer names, policy numbers, coverage amounts</li>
              <li><strong>Operational data:</strong> Equipment counts, service lanes, inspection records, crash history</li>
              <li><strong>Uploaded documents:</strong> W-9 forms, certificates of insurance, carrier agreements, company logos</li>
              <li><strong>Billing information:</strong> Payment details are processed by Stripe and are not stored on our servers</li>
            </ul>

            <h3 className="text-white font-medium mt-4 mb-2">2.2 Information from Third Parties</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>FMCSA data:</strong> We retrieve publicly available carrier data from the FMCSA QCMobile API, including authority status, safety ratings, insurance filings, inspection records, and crash data</li>
            </ul>

            <h3 className="text-white font-medium mt-4 mb-2">2.3 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Usage data:</strong> Pages visited, features used, timestamps</li>
              <li><strong>Device data:</strong> Browser type, operating system, screen resolution</li>
              <li><strong>Network data:</strong> IP address (used for rate limiting and security, not tracked for marketing)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, maintain, and improve the Service</li>
              <li>Create and display your carrier website and broker packet</li>
              <li>Process subscription payments via Stripe</li>
              <li>Verify your carrier identity through FMCSA data</li>
              <li>Send transactional emails (account confirmation, password resets, billing notifications)</li>
              <li>Detect and prevent fraud, abuse, and security threats</li>
              <li>Comply with legal obligations</li>
              <li>Respond to support requests</li>
            </ul>
            <p>
              We do not sell your personal information to third parties. We do not use your data for targeted advertising.
            </p>
          </Section>

          <Section title="4. Public Information">
            <p>
              By creating a carrier profile on Loadira, you acknowledge that certain information will be publicly accessible on your profile page, including: company name, DBA name, MC/DOT numbers, operating status, safety rating, equipment summary, cargo types, service lanes, contact information (phone, email), physical address, insurance coverage amounts, and inspection/crash statistics.
            </p>
            <p>
              You control what additional information is displayed through the Settings page. Your account email, password, Stripe billing details, and uploaded documents (W-9, COI) are never publicly displayed.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>We share your data only with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase:</strong> Database hosting and authentication (data stored in their infrastructure)</li>
              <li><strong>Stripe:</strong> Payment processing (receives only billing-related data)</li>
              <li><strong>Netlify:</strong> Website hosting and serverless function execution</li>
              <li><strong>FMCSA:</strong> We send your MC/DOT number to the FMCSA API to retrieve your carrier data</li>
            </ul>
            <p>
              We may also disclose information if required by law, court order, or government request, or if necessary to protect the rights, property, or safety of RWX-TEK INC, our users, or the public.
            </p>
          </Section>

          <Section title="6. Data Storage and Security">
            <p>
              Your data is stored in Supabase (PostgreSQL database with row-level security). Uploaded files are stored in Supabase Storage with folder-scoped access controls. All data is transmitted over HTTPS/TLS encryption.
            </p>
            <p>
              We implement security measures including: row-level security policies, input sanitization, file magic byte validation, server-side rate limiting, CORS restrictions, Content Security Policy headers, and audit logging of sensitive actions.
            </p>
            <p>
              Despite these measures, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes (such as resolving disputes or enforcing our Terms).
            </p>
            <p>
              Audit logs are retained for 12 months for security and compliance purposes.
            </p>
            <p>
              FMCSA data retrieved from the public API is cached in your carrier record and updated when you perform a new lookup.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
              <li><strong>Export:</strong> Request a portable copy of your data</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <span className="text-amber-400">customertek@rwxtek.com</span>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. California Privacy Rights (CCPA)">
            <p>
              If you are a California resident, you have the right to: (a) know what personal information we collect and how it is used; (b) request deletion of your personal information; (c) opt out of the sale of personal information (we do not sell personal information); (d) non-discrimination for exercising your privacy rights.
            </p>
            <p>
              To submit a CCPA request, email <span className="text-amber-400">customertek@rwxtek.com</span> with the subject line "CCPA Request."
            </p>
          </Section>

          <Section title="10. Cookies">
            <p>
              Loadira uses essential cookies and local storage for authentication (session tokens managed by Supabase Auth). We do not use tracking cookies, analytics cookies, or third-party advertising cookies.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will promptly delete it.
            </p>
          </Section>

          <Section title="12. Canadian Privacy (PIPEDA)">
            <p>
              If you are a Canadian resident, the Personal Information Protection and Electronic Documents Act (PIPEDA) governs our collection, use, and disclosure of your personal information. Under PIPEDA, you have the right to: (a) access your personal information held by us; (b) challenge the accuracy and completeness of your information and have it amended; (c) withdraw consent for certain uses of your data; (d) file a complaint with the Office of the Privacy Commissioner of Canada.
            </p>
            <p>
              We collect, use, and disclose personal information only for purposes that a reasonable person would consider appropriate. To exercise your PIPEDA rights, email <span className="text-amber-400">customertek@rwxtek.com</span> or use our <Link to="/data-request" className="text-amber-400 hover:text-amber-300">Data Request Form</Link>.
            </p>
          </Section>

          <Section title="13. International Users (GDPR / UK GDPR)">
            <p>
              If you are located in the European Economic Area (EEA) or United Kingdom, the General Data Protection Regulation (GDPR) or UK GDPR applies. Our legal basis for processing your data is: (a) contract performance (providing the Service); (b) legitimate interest (security, fraud prevention); (c) consent (where explicitly given).
            </p>
            <p>
              Your additional rights under GDPR include: right to restriction of processing (Art. 18), right to data portability (Art. 20), right to object to processing (Art. 21), and the right to lodge a complaint with your local Data Protection Authority.
            </p>
            <p>
              Data is transferred to and processed in the United States. By using the Service, you consent to this transfer. We rely on Standard Contractual Clauses (SCCs) where applicable.
            </p>
          </Section>

          <Section title="14. Age-Appropriate Design (California AB 2273)">
            <p>
              Loadira is designed for adults (18+) operating motor carrier businesses. We do not knowingly collect data from users under 18. We do not profile minors, use dark patterns to encourage data sharing, or use personal information in ways that are detrimental to children or teens. Users under 13 are strictly prohibited from using this Service under COPPA.
            </p>
          </Section>

          <Section title="15. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes become effective upon posting. We will notify you of material changes via email or a prominent notice on the Service. Your continued use after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>
              For questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <p className="text-white">
              RWX-TEK INC<br />
              Email: <span className="text-amber-400">customertek@rwxtek.com</span>
            </p>
          </Section>

          <div className="pt-6 border-t border-gray-800 space-y-2">
            <p className="text-gray-500">
              See also: <Link to="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</Link> | <Link to="/cookie-policy" className="text-amber-400 hover:text-amber-300">Cookie Policy</Link> | <Link to="/data-request" className="text-amber-400 hover:text-amber-300">Data Rights Request</Link>
            </p>
          </div>
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

export default Privacy
