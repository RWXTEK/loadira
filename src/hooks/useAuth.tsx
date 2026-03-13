import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Matches the carriers table in the database
export interface Carrier {
  id: string
  user_id: string
  mc_number: string
  dot_number: string
  legal_name: string
  dba_name: string | null
  entity_type: string | null
  operating_status: string | null
  phone: string | null
  email: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  mailing_street: string | null
  mailing_city: string | null
  mailing_state: string | null
  mailing_zip: string | null
  safety_rating: string | null
  safety_rating_date: string | null
  total_drivers: number | null
  total_power_units: number | null
  operation_classification: string[] | null
  carrier_operation: string[] | null
  cargo_carried: string[] | null
  bipd_required: number | null
  bipd_on_file: number | null
  bipd_insurer: string | null
  bipd_policy_number: string | null
  cargo_required: number | null
  cargo_on_file: number | null
  cargo_insurer: string | null
  cargo_policy_number: string | null
  bond_required: number | null
  bond_on_file: number | null
  vehicle_inspections_total: number | null
  vehicle_inspections_oos: number | null
  driver_inspections_total: number | null
  driver_inspections_oos: number | null
  hazmat_inspections_total: number | null
  hazmat_inspections_oos: number | null
  crashes_fatal: number | null
  crashes_injury: number | null
  crashes_towaway: number | null
  equipment: Record<string, unknown> | null
  service_lanes: string[] | null
  company_description: string | null
  logo_url: string | null
  brand_color: string
  website_slug: string
  plan: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  fmcsa_raw: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  carrier: Carrier | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; userId: string | null; hasSession: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshCarrier: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [carrier, setCarrier] = useState<Carrier | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCarrierData = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('carriers')
      .select('*')
      .eq('user_id', userId)
      .single()

    setCarrier((data as Carrier) ?? null)
  }, [])

  const refreshCarrier = useCallback(async () => {
    if (user) {
      await fetchCarrierData(user.id)
    }
  }, [user, fetchCarrierData])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCarrierData(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCarrierData(session.user.id)
      } else {
        setCarrier(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchCarrierData])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) {
        const msg = error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please check your internet connection and verify the Supabase project URL is correct in .env.local.'
          : error.message
        return { error: msg, userId: null, hasSession: false }
      }
      return {
        error: null,
        userId: data?.user?.id ?? null,
        hasSession: !!data?.session,
      }
    } catch (err) {
      return {
        error: err instanceof Error && err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Check your Supabase URL and network connection.'
          : 'An unexpected error occurred. Please try again.',
        userId: null,
        hasSession: false,
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please check your internet connection and verify the Supabase project URL is correct in .env.local.'
          : error.message
        return { error: msg }
      }
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error && err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Check your Supabase URL and network connection.'
          : 'An unexpected error occurred. Please try again.',
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setCarrier(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, session, carrier, loading, signUp, signIn, signOut, refreshCarrier }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
