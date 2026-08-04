import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { planId } = await req.json() as { planId: string }
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!secret) return Response.json({ error: 'payments are not configured' }, { status: 503 })

    const { data: plan } = await ctx.supabaseAdmin.from('subscription_plans').select('*')
      .eq('id', planId).eq('active', true).single()
    if (!plan || !ctx.userClaims?.email) return Response.json({ error: 'invalid checkout request' }, { status: 400 })

    const reference = `gd-${crypto.randomUUID()}`
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ctx.userClaims.email,
        amount: plan.price_minor,
        currency: plan.currency,
        reference,
        plan: plan.paystack_plan_code || undefined,
        callback_url: `${Deno.env.get('OFFICIAL_SITE_URL') ?? 'https://example.invalid'}/payment/callback`,
        metadata: { user_id: ctx.userClaims.sub, plan_id: plan.id },
      }),
    })
    const result = await response.json()
    if (!response.ok || !result.status) return Response.json({ error: 'checkout initialization failed' }, { status: 502 })
    return Response.json({ authorizationUrl: result.data.authorization_url, accessCode: result.data.access_code, reference })
  }),
}
