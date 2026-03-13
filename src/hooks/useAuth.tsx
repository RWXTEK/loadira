import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Row types matching the new schema
export interface Tenant {
  id: string
  user_id: string
  mc_number: string | null
  dot_number: string | null
  legal_name: string | null
  dba_name: string | null
  slug: string | null
  custom_domain: string | null
  stripe_customer_id: string | null
  plan: string | null
  subscription_status: string | null
  created_at: string
}

export interface FmcsaDataRow {
  id: string
  tenant_id: string
  operating_status: string | null
  safety_rating: string | null
  operation_type: string | null
  physical_address: { street?: string; city?: string; state?: string; zip?: string } | null
  phone: string | null
  power_units: number | null
  drivers: number | null
  insurance_data: Record<string, unknown> | null
  boc3_on_file: boolean | null
  cargo_carried: string[] | null
  basics_scores: Record<string, number> | null
  last_fmcsa_sync: string | null
  raw_response: Record<string, unknown> | null
}

export interface WebsiteSettingsRow {
  id: string
  tenant_id: string
  primary_color: string | null
  logo_url: string | null
  hero_text: string | null
  theme: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  tenant: Tenant | null
  fmcsaData: FmcsaDataRow | null
  settings: WebsiteSettingsRow | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; userId: string | null; hasSession: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshTenant: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [fmcsaData, setFmcsaData] = useState<FmcsaDataRow | null>(null)
  const [settings, setSettings] = useState<WebsiteSettingsRow | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTenantData = useCallback(async (userId: string) => {
    // Fetch tenant
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (tenantData) {
      setTenant(tenantData as Tenant)

      // Fetch fmcsa_data and website_settings in parallel
      const [fmcsaResult, settingsResult] = await Promise.all([
        supabase.from('fmcsa_data').select('*').eq('tenant_id', tenantData.id).single(),
        supabase.from('website_settings').select('*').eq('tenant_id', tenantData.id).single(),
      ])

      setFmcsaData((fmcsaResult.data as FmcsaDataRow) ?? null)
      setSettings((settingsResult.data as WebsiteSettingsRow) ?? null)
    } else {
      setTenant(null)
      setFmcsaData(null)
      setSettings(null)
    }
  }, [])

  const refreshTenant = useCallback(async () => {
    if (user) {
      await fetchTenantData(user.id)
    }
  }, [user, fetchTenantData])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTenantData(session.user.id).then(() => setLoading(false))
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
        fetchTenantData(session.user.id)
      } else {
        setTenant(null)
        setFmcsaData(null)
        setSettings(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchTenantData])

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
    setTenant(null)
    setFmcsaData(null)
    setSettings(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, session, tenant, fmcsaData, settings, loading, signUp, signIn, signOut, refreshTenant }}
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
