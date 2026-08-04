import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

const toHex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!secret) return new Response('not configured', { status: 503 })
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature') ?? ''
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
    const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)))
    if (signature.length !== expected.length || signature !== expected) return new Response('invalid signature', { status: 401 })

    const event = JSON.parse(body)
    const paystackEventId = String(event.data?.id ?? `${event.event}:${event.data?.reference ?? crypto.randomUUID()}`)
    const { data: ledger } = await ctx.supabaseAdmin.from('payment_events').insert({
      paystack_event_id: paystackEventId, event_type: event.event, reference: event.data?.reference, payload: event,
    }).select('id').maybeSingle()
    if (!ledger) return Response.json({ received: true, duplicate: true })

    if (event.event === 'charge.success') {
      const userId = event.data?.metadata?.user_id
      const planId = event.data?.metadata?.plan_id
      if (userId && planId) {
        const { data: plan } = await ctx.supabaseAdmin.from('subscription_plans').select('interval').eq('id', planId).single()
        const end = new Date()
        if (plan?.interval === 'annual') end.setUTCFullYear(end.getUTCFullYear() + 1)
        else end.setUTCMonth(end.getUTCMonth() + 1)
        await ctx.supabaseAdmin.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('user_id', userId).eq('status', 'active')
        await ctx.supabaseAdmin.from('subscriptions').insert({
          user_id: userId, plan_id: planId, status: 'active', paystack_customer_code: event.data.customer?.customer_code,
          current_period_end: end.toISOString(), updated_at: new Date().toISOString(),
        })
        await ctx.supabaseAdmin.from('profiles').update({ premium_until: end.toISOString() }).eq('id', userId)
        await ctx.supabaseAdmin.from('in_app_notifications').insert({ user_id: userId, title: 'Premium activé', body: 'Votre accès Premium est maintenant actif.', kind: 'premium_activated' })
      }
    }
    await ctx.supabaseAdmin.from('payment_events').update({ processed_at: new Date().toISOString() }).eq('id', ledger.id)
    return Response.json({ received: true })
  }),
}
