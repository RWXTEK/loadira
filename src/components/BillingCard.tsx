import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Subscription {
  plan_id: string
  status: string
  current_period_end: string
  trial_end: string | null
  cancel_at_period_end: boolean
}

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  fleet: 'Fleet',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  trialing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  past_due: 'bg-red-500/10 text-red-400 border-red-500/20',
  canceled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export default function BillingCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setSubscription(data)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-portal', {
        body: { returnUrl: `${window.location.origin}/dashboard` },
      })

      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
      alert('Unable to open billing portal. Contact customertek@rwxtek.com')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-800 rounded w-40 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-32" />
      </div>
    )
  }

  if (!subscription || subscription.status === 'canceled') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-gray-500 text-sm mb-4">No active subscription</p>
        <a
          href="/pricing"
          className="inline-block bg-amber-500 text-gray-950 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
        >
          View Plans
        </a>
      </div>
    )
  }

  const periodEnd = new Date(subscription.current_period_end).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const isTrialing = subscription.status === 'trialing'
  const daysLeft = subscription.trial_end
    ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Plan</p>
          <h3 className="text-white text-2xl font-black">
            CarrierShield {PLAN_NAMES[subscription.plan_id] || subscription.plan_id}
          </h3>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${
            STATUS_STYLES[subscription.status] || STATUS_STYLES.canceled
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {isTrialing && daysLeft !== null && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
          <p className="text-blue-400 text-sm font-medium">
            Free trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </p>
          <p className="text-blue-400/60 text-xs mt-0.5">
            Trial ends {trialEnd}. No charge until then.
          </p>
        </div>
      )}

      {subscription.cancel_at_period_end && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
          <p className="text-red-400 text-sm font-medium">
            Cancels {periodEnd}
          </p>
          <p className="text-red-400/60 text-xs mt-0.5">
            Your carrier website will go offline after this date.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <span>
          {subscription.cancel_at_period_end ? 'Access until' : 'Renews'} {periodEnd}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="flex-1 border border-gray-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer"
        >
          {portalLoading ? 'Opening...' : 'Manage Billing'}
        </button>
        {!isTrialing && (
          <a
            href="/pricing"
            className="flex-1 text-center bg-amber-500 text-gray-950 font-bold text-sm py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
          >
            Upgrade Plan
          </a>
        )}
      </div>
    </div>
  )
}
