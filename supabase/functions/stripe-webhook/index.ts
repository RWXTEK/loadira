import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const userId = session.metadata?.supabase_user_id
        const carrierId = session.metadata?.carrier_id

        if (!userId || !subscriptionId) break

        // Fetch subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const planMetadata = subscription.items.data[0]?.price.metadata
        const plan = planMetadata?.plan_id || 'starter'

        // Upsert subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          carrier_id: carrierId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        }, { onConflict: 'stripe_subscription_id' })

        // Update carrier plan
        if (carrierId) {
          await supabase.from('carriers').update({
            plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          }).eq('id', carrierId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const plan = subscription.items.data[0]?.price.metadata?.plan_id || 'starter'

        await supabase.from('subscriptions').update({
          plan,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        }).eq('stripe_subscription_id', subscription.id)

        // Sync plan to carriers table
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('carrier_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub?.carrier_id) {
          await supabase.from('carriers').update({ plan }).eq('id', sub.carrier_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase.from('subscriptions').update({
          status: 'canceled',
          cancel_at_period_end: false,
        }).eq('stripe_subscription_id', subscription.id)

        // Downgrade carrier to free
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('carrier_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub?.carrier_id) {
          await supabase.from('carriers').update({
            plan: 'free',
            stripe_subscription_id: null,
          }).eq('id', sub.carrier_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
