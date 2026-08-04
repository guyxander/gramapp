import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { confirmation } = await req.json() as { confirmation?: string }
    if (confirmation !== 'DELETE') return Response.json({ error: 'confirmation required' }, { status: 400 })
    const userId = ctx.userClaims!.sub
    const { data: objects } = await ctx.supabaseAdmin.storage.from('speaking-audio').list(userId)
    if (objects?.length) await ctx.supabaseAdmin.storage.from('speaking-audio').remove(objects.map((item) => `${userId}/${item.name}`))
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return Response.json({ error: 'account deletion failed' }, { status: 500 })
    return Response.json({ deleted: true })
  }),
}
