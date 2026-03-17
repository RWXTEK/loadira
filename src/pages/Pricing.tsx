import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FmcsaBanner } from '../components/FmcsaDisclaimer'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    description: 'Get your carrier online fast',
    highlight: false,
    features: [
      '1 carrier website',
      'FMCSA QCMobile verification',
      'Professional DOT/MC display',
      'SSL + hosting included',
      'Basic contact form',
      'Mobile responsive',
    ],
    cta: 'Get Started',
    badge: null,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL,
    description: 'Built for SBA loan applications & broker onboarding',
    highlight: true,
    features: [
      'Everything in Starter',
      'SBA-ready compliance page',
      'Safety score display (CSA)',
      'Insurance certificate upload',
      'Broker portal integration',
      'Custom domain support',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    badge: 'Most Popular',
  },
  {
    id: 'fleet',
    name: 'Fleet',
    price: 199,
    priceId: import.meta.env.VITE_STRIPE_PRICE_FLEET,
    description: 'Multi-carrier management for dispatchers & fleets',
    highlight: false,
    features: [
      'Everything in Professional',
      'Up to 10 carrier websites',
      'Bulk FMCSA verification',
      'White-label branding',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    badge: null,
  },
]

function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [annual, setAnnual] = useState(false)

  const getPrice = (base: number) =>
    annual ? Math.round(base * 12 * 0.8) : base

  const handleCheckout = async (plan: (typeof PLANS)[0]) => {
    if (plan.id === 'fleet') {
      window.location.href = 'mailto:customertek@rwxtek.com?subject=Loadira Fleet Inquiry'
      return
    }

    setLoading(plan.id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login?redirect=/pricing'
        return
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan.priceId,
          planId: plan.id,
          annual,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing`,
        },
      })

      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong. Please try again or contact customertek@rwxtek.com')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <FmcsaBanner />
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm font-medium tracking-wide">
              FMCSA Verified Carrier Websites
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tight mb-4">
            ONE PRICE.
            <br />
            <span className="text-amber-400">BROKER-READY</span> IN 24 HOURS.
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Professional carrier websites with live FMCSA verification. Built to
            impress brokers, pass SBA reviews, and win more freight.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-900 rounded-xl p-1.5 border border-gray-800">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                !annual
                  ? 'bg-amber-500 text-gray-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                annual
                  ? 'bg-amber-500 text-gray-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-gray-900'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-gray-950 text-xs font-bold px-4 py-1 rounded-full tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold tracking-wide text-gray-300 uppercase mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black">
                      ${annual ? getPrice(plan.price).toLocaleString() : plan.price}
                    </span>
                    <span className="text-gray-500 text-sm">
                      /{annual ? 'yr' : 'mo'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all mb-8 cursor-pointer ${
                    plan.highlight
                      ? 'bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-95'
                      : 'border border-gray-700 text-white hover:border-gray-500 hover:bg-gray-800 active:scale-95'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <svg
                        className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'FMCSA Verified', icon: 'shield' },
              { label: '14-Day Free Trial', icon: 'clock' },
              { label: 'Cancel Anytime', icon: 'check' },
              { label: 'SSL Included', icon: 'lock' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
              >
                <TrustIcon type={item.icon} />
                <span className="text-sm text-gray-400 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        {/* Legal Disclaimer */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            A Loadira subscription provides website hosting and FMCSA data display tools only. A subscription does not guarantee broker acceptance, freight load availability, SBA loan approval, or any specific business outcome. All carrier data is provided "as-is" from FMCSA government sources and may not be current. Carriers are solely responsible for the accuracy of all information displayed on their profiles. See our{' '}
            <a href="/terms" className="text-amber-500 hover:text-amber-400 underline">Terms of Service</a> for full details.
          </p>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function TrustIcon({ type }: { type: string }) {
  const cls = "w-5 h-5 text-amber-400"
  switch (type) {
    case 'shield':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'check':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'lock':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    default:
      return null
  }
}

export default Pricing
