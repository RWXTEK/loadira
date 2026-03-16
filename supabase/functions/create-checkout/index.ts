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

    const { priceId, successUrl, cancelUrl } = await req.json()

    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: carrier } = await adminClient
      .from('carriers')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = carrier?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id, carrier_id: carrier?.id || '' },
      })
      customerId = customer.id

      if (carrier?.id) {
        await adminClient.from('carriers').update({ stripe_customer_id: customerId }).eq('id', carrier.id)
      }
    }

    // Validate redirect URLs — must be same origin
    const validOrigin = ALLOWED_ORIGIN
    const safeSuccessUrl = successUrl?.startsWith(validOrigin) ? successUrl : `${validOrigin}/dashboard?checkout=success`
    const safeCancelUrl = cancelUrl?.startsWith(validOrigin) ? cancelUrl : `${validOrigin}/pricing`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: user.id, carrier_id: carrier?.id || '' },
      },
      success_url: safeSuccessUrl,
      cancel_url: safeCancelUrl,
      metadata: { supabase_user_id: user.id, carrier_id: carrier?.id || '' },
    })

    // Audit log
    await adminClient.from('audit_log').insert({
      user_id: user.id,
      carrier_id: carrier?.id,
      action: 'checkout.started',
      table_name: 'subscriptions',
      new_values: { price_id: priceId, session_id: session.id },
    }).then(() => {})

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500, headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
