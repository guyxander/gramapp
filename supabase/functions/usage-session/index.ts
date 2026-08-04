import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { seconds } = await req.json() as { seconds: number }
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 3600) {
      return Response.json({ error: 'seconds must be between 1 and 3600' }, { status: 400 })
    }
    const { data, error } = await ctx.supabase.rpc('consume_learning_seconds', { seconds_to_add: seconds }).single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data, { status: data.allowed ? 200 : 402 })
  }),
}
