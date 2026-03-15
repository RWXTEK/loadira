import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Zap, Shield, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'

interface PlanFeature {
  text: string
  starter: boolean
  professional: boolean
  fleet: boolean
}

const features: PlanFeature[] = [
  { text: 'Professional carrier website', starter: true, professional: true, fleet: true },
  { text: 'FMCSA data auto-populated', starter: true, professional: true, fleet: true },
  { text: 'Broker packet PDF', starter: true, professional: true, fleet: true },
  { text: 'Public carrier profile', starter: true, professional: true, fleet: true },
  { text: 'Mobile-responsive design', starter: true, professional: true, fleet: true },
  { text: 'SSL certificate', starter: true, professional: true, fleet: true },
  { text: 'Custom company description', starter: false, professional: true, fleet: true },
  { text: 'Logo upload & branding', starter: false, professional: true, fleet: true },
  { text: 'Service lane customization', starter: false, professional: true, fleet: true },
  { text: 'Request a Quote form', starter: false, professional: true, fleet: true },
  { text: 'Document uploads', starter: false, professional: true, fleet: true },
  { text: 'FMCSA data auto-refresh', starter: false, professional: true, fleet: true },
  { text: 'Custom domain', starter: false, professional: false, fleet: true },
  { text: 'Multiple user accounts', starter: false, professional: false, fleet: true },
  { text: 'Priority support', starter: false, professional: false, fleet: true },
  { text: 'Analytics dashboard', starter: false, professional: false, fleet: true },
  { text: 'API access', starter: false, professional: false, fleet: true },
  { text: 'White-label branding', starter: false, professional: false, fleet: true },
]

const PRICE_IDS = {
  starter: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL || '',
  },
  professional: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL || '',
  },
  fleet: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_FLEET || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_FLEET_ANNUAL || '',
  },
}

const PRICES = {
  starter: { monthly: 49, yearly: 470 },
  professional: { monthly: 99, yearly: 950 },
  fleet: { monthly: 199, yearly: 1990 },
}

function Pricing() {
  const [annual, setAnnual] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400 font-medium">14-day free trial on all plans</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plans that scale with your <span className="text-orange-500">fleet</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start with a free trial. Upgrade when you need more. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`text-sm font-medium px-5 py-2 rounded-full transition-all cursor-pointer ${
                  !annual ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`text-sm font-medium px-5 py-2 rounded-full transition-all cursor-pointer ${
                  annual ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-1.5 text-[11px] text-emerald-400 font-semibold">Save 20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              monthlyPrice={PRICES.starter.monthly}
              yearlyPrice={PRICES.starter.yearly}
              annual={annual}
              description="Essential online presence for owner-operators"
              features={['Professional carrier website', 'FMCSA data auto-populated', 'Broker packet PDF', 'Public carrier profile', 'Mobile-responsive design', 'SSL certificate']}
              priceId={annual ? PRICE_IDS.starter.yearly : PRICE_IDS.starter.monthly}
              isLoggedIn={!!user}
            />
            <PricingCard
              name="Professional"
              monthlyPrice={PRICES.professional.monthly}
              yearlyPrice={PRICES.professional.yearly}
              annual={annual}
              description="Full customization for growing carriers"
              features={['Everything in Starter, plus:', 'Custom company description', 'Logo upload & branding', 'Service lane customization', 'Request a Quote form', 'Document uploads', 'FMCSA data auto-refresh']}
              priceId={annual ? PRICE_IDS.professional.yearly : PRICE_IDS.professional.monthly}
              isLoggedIn={!!user}
              popular
            />
            <PricingCard
              name="Fleet"
              monthlyPrice={PRICES.fleet.monthly}
              yearlyPrice={PRICES.fleet.yearly}
              annual={annual}
              description="Enterprise features for established fleets"
              features={['Everything in Professional, plus:', 'Custom domain', 'Multiple user accounts', 'Priority support', 'Analytics dashboard', 'API access', 'White-label branding']}
              priceId={annual ? PRICE_IDS.fleet.yearly : PRICE_IDS.fleet.monthly}
              isLoggedIn={!!user}
            />
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="border-t border-gray-800/50">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-900 border-b border-gray-800">
                  <div className="text-sm font-medium text-gray-400">Feature</div>
                  <div className="text-sm font-medium text-center">Starter</div>
                  <div className="text-sm font-medium text-center text-orange-500">Professional</div>
                  <div className="text-sm font-medium text-center">Fleet</div>
                </div>
                {/* Rows */}
                {features.map((feature, i) => (
                  <div
                    key={feature.text}
                    className={`grid grid-cols-4 gap-4 px-6 py-3 ${i !== features.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                  >
                    <div className="text-sm text-gray-300">{feature.text}</div>
                    <FeatureCheck included={feature.starter} />
                    <FeatureCheck included={feature.professional} />
                    <FeatureCheck included={feature.fleet} />
                  </div>
                ))}
                {/* Pricing Row */}
                <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-900 border-t border-gray-800">
                  <div className="text-sm font-medium text-gray-400">Monthly Price</div>
                  <div className="text-center font-bold">${PRICES.starter.monthly}</div>
                  <div className="text-center font-bold text-orange-500">${PRICES.professional.monthly}</div>
                  <div className="text-center font-bold">${PRICES.fleet.monthly}</div>
                </div>
              </div>
            </div>

            {/* Mobile: just show CTA */}
            <div className="md:hidden text-center">
              <p className="text-gray-400 mb-6">View feature comparison on a wider screen, or choose a plan to get started.</p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-gray-800/50">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <FaqItem
                question="Can I try it before paying?"
                answer="Yes! All plans include a 14-day free trial. Enter your MC number, create your account, and choose a plan — your card won't be charged until the trial ends."
              />
              <FaqItem
                question="Can I upgrade or downgrade anytime?"
                answer="Absolutely. You can change your plan at any time from the billing portal. Upgrades take effect immediately, and downgrades apply at the next billing cycle."
              />
              <FaqItem
                question="How often is the FMCSA data updated?"
                answer="Professional and Fleet plans include automatic FMCSA data refresh. Starter plans can manually trigger a refresh from the dashboard."
              />
              <FaqItem
                question="Do I need technical skills?"
                answer="Not at all. Just enter your MC number and we handle everything — website, broker packet, and carrier profile are all generated automatically."
              />
              <FaqItem
                question="Can I cancel anytime?"
                answer="Yes, there are no long-term contracts. Cancel anytime from your billing portal and your subscription will end at the close of the current billing period."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function PricingCard({
  name,
  monthlyPrice,
  yearlyPrice,
  annual,
  description,
  features,
  priceId,
  isLoggedIn,
  popular = false,
}: {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  annual: boolean
  description: string
  features: string[]
  priceId: string
  isLoggedIn: boolean
  popular?: boolean
}) {
  const { startCheckout } = useSubscription()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')

  const displayPrice = annual ? Math.round(yearlyPrice / 12) : monthlyPrice

  const handleClick = async () => {
    if (!isLoggedIn || !priceId) return

    setCheckoutLoading(true)
    setError('')
    try {
      await startCheckout(priceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.')
      setCheckoutLoading(false)
    }
  }

  return (
    <div
      className={`relative bg-gray-900/50 border rounded-2xl p-8 flex flex-col ${
        popular ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-gray-800'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-5xl font-bold">${displayPrice}</span>
        <span className="text-gray-400 ml-1">/mo</span>
        {annual && (
          <p className="text-xs text-emerald-400 mt-1">
            ${yearlyPrice}/year — save ${monthlyPrice * 12 - yearlyPrice}
          </p>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            {feature.includes('Everything in') ? (
              <Shield className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            )}
            <span className={`text-sm ${feature.includes('Everything in') ? 'text-orange-400 font-medium' : 'text-gray-300'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {isLoggedIn && priceId ? (
        <button
          onClick={handleClick}
          disabled={checkoutLoading}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all cursor-pointer ${
            popular
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
          }`}
        >
          {checkoutLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Start Free Trial'
          )}
        </button>
      ) : (
        <Link
          to="/signup"
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all ${
            popular
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
          }`}
        >
          Get Started
        </Link>
      )}
    </div>
  )
}

function FeatureCheck({ included }: { included: boolean }) {
  return (
    <div className="flex justify-center">
      {included ? (
        <Check className="w-5 h-5 text-orange-500" />
      ) : (
        <X className="w-5 h-5 text-gray-700" />
      )}
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{answer}</p>
    </div>
  )
}

export default Pricing
