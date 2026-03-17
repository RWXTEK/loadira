import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: March 15, 2026</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using Loadira ("Service"), operated by RWX-TEK INC ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and RWX-TEK INC.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Changes become effective upon posting. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Loadira provides web-based tools for motor carriers to create professional websites, generate broker packets, and display FMCSA (Federal Motor Carrier Safety Administration) data. The Service retrieves publicly available data from the FMCSA QCMobile API and displays it alongside user-provided information.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              To use certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
            <p>
              You must be at least 18 years old and have the legal authority to bind yourself or your company to these Terms.
            </p>
          </Section>

          <Section title="4. FMCSA Data Accuracy Disclaimer">
            <p className="font-semibold text-white">
              THE FMCSA DATA DISPLAYED ON THIS SERVICE IS SOURCED FROM THE FEDERAL MOTOR CARRIER SAFETY ADMINISTRATION'S QCMOBILE PUBLIC API. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, TIMELINESS, OR RELIABILITY OF THIS DATA.
            </p>
            <p>
              FMCSA data may be outdated, incomplete, or contain errors introduced by the government source, API transmission, or our parsing systems. The Service does not independently verify FMCSA data and presents it on an "as-retrieved" basis. Users should verify all critical information (including but not limited to authority status, insurance coverage, safety ratings, and inspection records) directly with the FMCSA at <span className="text-amber-400">safer.fmcsa.dot.gov</span> before making any business, financial, lending, or compliance decisions.
            </p>
            <p>
              Loadira is not affiliated with, endorsed by, or sponsored by the U.S. Department of Transportation, the Federal Motor Carrier Safety Administration, or any government agency.
            </p>
          </Section>

          <Section title="5. Carrier Data Responsibility">
            <p>
              You are solely responsible for the accuracy, legality, and completeness of any information you provide to the Service, including but not limited to: company descriptions, contact information, insurance details, policy numbers, equipment counts, inspection data, crash history, service lanes, uploaded documents (W-9 forms, certificates of insurance, carrier agreements), and logo images.
            </p>
            <p>
              You represent and warrant that: (a) you have the legal right to provide all data submitted; (b) no submitted content infringes any third party's intellectual property, privacy, or other rights; (c) all insurance and authority information you provide is accurate and current; (d) you have the authority to act on behalf of the carrier whose MC/DOT number you register.
            </p>
            <p>
              We reserve the right to remove or disable any content or account that we believe, in our sole discretion, violates these Terms or applicable law.
            </p>
          </Section>

          <Section title="6. Subscriptions and Billing">
            <p>
              Paid features require a subscription. By subscribing, you authorize us to charge the payment method on file on a recurring basis (monthly or annually). All fees are in U.S. dollars and are non-refundable except as required by law.
            </p>
            <p>
              Free trials, if offered, automatically convert to paid subscriptions unless canceled before the trial ends. You may cancel at any time through the billing portal; cancellation takes effect at the end of the current billing period.
            </p>
            <p>
              We reserve the right to change pricing with 30 days' advance notice. Price changes do not affect the current billing period.
            </p>
          </Section>

          <Section title="7. Prohibited Uses and Fraud Policy">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation</li>
              <li>Register an MC/DOT number that does not belong to you or your authorized organization</li>
              <li>Impersonate another carrier, broker, or entity</li>
              <li>Upload fraudulent, forged, or misleading documents (including falsified insurance certificates or W-9 forms)</li>
              <li>Misrepresent your carrier's safety record, authority status, insurance coverage, or operating status</li>
              <li>Scrape, harvest, or systematically access FMCSA data through the Service for purposes of building a competing product or database</li>
              <li>Attempt to gain unauthorized access to any accounts, systems, or networks connected to the Service</li>
              <li>Use the Service to distribute malware, spam, or phishing content</li>
              <li>Interfere with or disrupt the Service's infrastructure or other users' access</li>
              <li>Circumvent rate limits, security measures, or access controls</li>
            </ul>
            <p>
              Violation of this section may result in immediate account termination without refund, and we may report fraudulent activity to relevant authorities including the FMCSA, FBI, and state attorneys general.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The Service, including its design, code, logos, and trademarks, is the property of RWX-TEK INC and is protected by copyright, trademark, and other intellectual property laws. You retain ownership of content you upload but grant us a non-exclusive, worldwide license to display, reproduce, and distribute your content solely for the purpose of operating the Service.
            </p>
          </Section>

          <Section title="9. DMCA Policy">
            <p>
              We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). If you believe content on the Service infringes your copyright, send a written notice to our designated agent at <span className="text-amber-400">customertek@rwxtek.com</span> containing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material claimed to be infringing, with sufficient detail to locate it</li>
              <li>Your contact information (name, address, telephone, email)</li>
              <li>A statement that you have a good faith belief the use is not authorized by the copyright owner</li>
              <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on the owner's behalf</li>
              <li>Your physical or electronic signature</li>
            </ul>
            <p>
              Upon receiving a valid DMCA notice, we will promptly remove or disable access to the allegedly infringing content and notify the account holder. Repeat infringers will have their accounts terminated.
            </p>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <p className="font-semibold text-white">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR AVAILABILITY.
            </p>
            <p>
              We do not warrant that: (a) the Service will be uninterrupted, secure, or error-free; (b) FMCSA data will be accurate, current, or complete; (c) any defects will be corrected; (d) the Service will meet your specific requirements; (e) the Service is suitable for use in regulatory compliance, lending decisions, or legal proceedings.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p className="font-semibold text-white">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RWX-TEK INC AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS, REVENUE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="font-semibold text-white">
              IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE EXCEED THE TOTAL AMOUNT YOU HAVE PAID TO US IN SUBSCRIPTION FEES DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p>
              This limitation applies regardless of the theory of liability (contract, tort, strict liability, or otherwise) and even if we have been advised of the possibility of such damages.
            </p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless RWX-TEK INC, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; (d) any content you submit through the Service; (e) any misrepresentation of your carrier's data.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>
              We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately. Sections that by their nature should survive termination (including Disclaimers, Limitation of Liability, Indemnification, and Governing Law) will survive.
            </p>
          </Section>

          <Section title="14. Governing Law and Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of laws principles.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively in the state or federal courts located in Los Angeles County, California. You consent to the personal jurisdiction and venue of such courts and waive any objection based on inconvenient forum.
            </p>
          </Section>

          <Section title="15. Miscellaneous">
            <p>
              <strong>Entire Agreement:</strong> These Terms, together with our <Link to="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link>, constitute the entire agreement between you and RWX-TEK INC regarding the Service.
            </p>
            <p>
              <strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force and effect.
            </p>
            <p>
              <strong>Waiver:</strong> Our failure to enforce any right or provision does not constitute a waiver of that right or provision.
            </p>
            <p>
              <strong>Assignment:</strong> You may not assign or transfer these Terms. We may assign our rights without restriction.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>
              For questions about these Terms, contact us at:
            </p>
            <p className="text-white">
              RWX-TEK INC<br />
              Email: <span className="text-amber-400">customertek@rwxtek.com</span>
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

export default Terms
