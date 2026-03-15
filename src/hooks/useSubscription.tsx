import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  isActive: boolean
  isTrial: boolean
  isPastDue: boolean
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: [],
  starter: [
    'carrierWebsite',
    'fmcsaData',
    'brokerPacket',
    'publicProfile',
  ],
  professional: [
    'carrierWebsite',
    'fmcsaData',
    'brokerPacket',
    'publicProfile',
    'customDescription',
    'logoUpload',
    'serviceLanes',
    'quoteForm',
    'documentUploads',
    'fmcsaAutoRefresh',
  ],
  fleet: [
    'carrierWebsite',
    'fmcsaData',
    'brokerPacket',
    'publicProfile',
    'customDescription',
    'logoUpload',
    'serviceLanes',
    'quoteForm',
    'documentUploads',
    'fmcsaAutoRefresh',
    'customDomain',
    'multipleUsers',
    'prioritySupport',
    'analytics',
    'apiAccess',
    'whiteLabel',
  ],
}

export function useSubscription() {
  const { user, carrier } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      const now = new Date()
      const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null
      const trialEnd = data.trial_end ? new Date(data.trial_end) : null

      setSubscription({
        id: data.id,
        plan: data.plan,
        status: data.status,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        trialEnd: data.trial_end,
        isActive: ['active', 'trialing'].includes(data.status) && (!periodEnd || periodEnd > now),
        isTrial: data.status === 'trialing' && (!trialEnd || trialEnd > now),
        isPastDue: data.status === 'past_due',
      })
    } else {
      // Fall back to carrier.plan if no subscription row
      const plan = carrier?.plan || 'free'
      setSubscription({
        id: '',
        plan,
        status: plan === 'free' ? 'none' : 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        isActive: plan !== 'free',
        isTrial: false,
        isPastDue: false,
      })
    }

    setLoading(false)
  }, [user, carrier])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const hasFeature = useCallback((feature: string): boolean => {
    if (!subscription) return false
    const plan = subscription.plan || 'free'
    const features = PLAN_FEATURES[plan] || []
    return features.includes(feature)
  }, [subscription])

  const startCheckout = useCallback(async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing`,
      },
    })

    if (error) throw new Error(error.message)
    if (data?.url) {
      window.location.href = data.url
    }
    return data
  }, [])

  const openPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke('create-portal', {
      body: { returnUrl: window.location.href },
    })

    if (error) throw new Error(error.message)
    if (data?.url) {
      window.location.href = data.url
    }
    return data
  }, [])

  return { subscription, loading, hasFeature, startCheckout, openPortal, refetch: fetchSubscription }
}

// FeatureGate component — renders children only if user has the feature
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasFeature, loading } = useSubscription()

  if (loading) return null
  if (!hasFeature(feature)) return <>{fallback}</>
  return <>{children}</>
}
