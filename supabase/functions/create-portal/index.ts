import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://loadira.com'

function corsHeaders(origin: string | null) {
  const allowed = origin === ALLOWED_ORIGIN || origin?.startsWith('http://localhost')
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const { returnUrl } = await req.json()

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: carrier } = await adminClient
      .from('carriers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!carrier?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No billing account found' }), {
        status: 404, headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    // Validate return URL
    const safeReturnUrl = returnUrl?.startsWith(ALLOWED_ORIGIN) ? returnUrl : `${ALLOWED_ORIGIN}/dashboard`

    const session = await stripe.billingPortal.sessions.create({
      customer: carrier.stripe_customer_id,
      return_url: safeReturnUrl,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to open billing portal' }), {
      status: 500, headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
