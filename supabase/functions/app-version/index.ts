import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (req, ctx) => {
    const url = new URL(req.url)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const currentCode = Number(url.searchParams.get('versionCode') ?? body.versionCode ?? 0)
    const { data, error } = await ctx.supabaseAdmin.from('app_releases').select('*')
      .eq('active', true).order('version_code', { ascending: false }).limit(1).maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!data) return Response.json({ updateAvailable: false })
    const officialOrigin = 'https://gramapp-two.vercel.app'
    if (new URL(data.apk_url).origin !== officialOrigin) return Response.json({ error: 'invalid release origin' }, { status: 500 })
    return Response.json({
      updateAvailable: data.version_code > currentCode,
      required: currentCode < data.minimum_supported_code || data.kind === 'required',
      release: data,
    })
  }),
}
