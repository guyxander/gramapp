import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'secret' }, async (req, ctx) => {
    const { userId } = await req.json() as { userId: string }
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

    const [userResult, attemptResult, referralResult] = await Promise.all([
      ctx.supabaseAdmin.auth.admin.getUserById(userId),
      ctx.supabaseAdmin.from('lesson_attempts').select('id').eq('user_id', userId).eq('status', 'completed').limit(1),
      ctx.supabaseAdmin.from('referrals').select('*').eq('referred_user_id', userId).is('qualified_at', null).maybeSingle(),
    ])
    if (!userResult.data.user?.email_confirmed_at || !attemptResult.data?.length || !referralResult.data) {
      return Response.json({ qualified: false })
    }

    const now = new Date()
    const expires = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    const { error } = await ctx.supabaseAdmin.from('referrals').update({
      qualified_at: now.toISOString(), expires_on: expires.toISOString().slice(0, 10),
    }).eq('id', referralResult.data.id).is('qualified_at', null)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    await ctx.supabaseAdmin.from('in_app_notifications').insert({
      user_id: referralResult.data.referrer_id,
      title: 'Parrainage validé',
      body: 'Vous gagnez 10 minutes supplémentaires par jour jusqu’à la fin du mois.',
      kind: 'referral_qualified',
    })
    return Response.json({ qualified: true, expiresOn: expires.toISOString().slice(0, 10) })
  }),
}
