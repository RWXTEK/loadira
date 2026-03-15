import { useState } from 'react'
import { CreditCard, ExternalLink, AlertTriangle, CheckCircle, Loader2, Calendar } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'

function BillingCard() {
  const { subscription, loading, openPortal } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  const handleManageBilling = async () => {
    setPortalLoading(true)
    setError('')
    try {
      await openPortal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal.')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading billing...</span>
        </div>
      </div>
    )
  }

  const plan = subscription?.plan || 'free'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const isActive = subscription?.isActive
  const isTrial = subscription?.isTrial
  const isPastDue = subscription?.isPastDue
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const trialEnd = subscription?.trialEnd
    ? new Date(subscription.trialEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-orange-500" />
        Billing & Plan
      </h2>

      {isPastDue && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Payment failed. Please update your billing information to restore access.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Current Plan</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{planLabel}</span>
            {isActive && !isPastDue && (
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
            {isTrial && (
              <span className="text-[11px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                Trial
              </span>
            )}
            {isPastDue && (
              <span className="text-[11px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                Past Due
              </span>
            )}
          </div>
        </div>

        {isTrial && trialEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Trial Ends
            </span>
            <span className="text-sm text-gray-300">{trialEnd}</span>
          </div>
        )}

        {periodEnd && !isTrial && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
            </span>
            <span className="text-sm text-gray-300">{periodEnd}</span>
          </div>
        )}

        {cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Your subscription will cancel at the end of the billing period.
          </div>
        )}
      </div>

      {plan === 'free' ? (
        <a
          href="/pricing"
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          Upgrade Plan
        </a>
      ) : (
        <button
          onClick={handleManageBilling}
          disabled={portalLoading}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm"
        >
          {portalLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Manage Billing
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default BillingCard
