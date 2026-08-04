import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  return btoa(binary)
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { attemptId } = await req.json() as { attemptId?: string }
    if (!attemptId) return Response.json({ error: 'attemptId required' }, { status: 400 })
    const { data: attempt } = await ctx.supabaseAdmin.from('speaking_attempts').select('*').eq('id', attemptId).eq('user_id', ctx.userClaims!.sub).single()
    if (!attempt) return Response.json({ error: 'attempt not found' }, { status: 404 })
    const { data: audio, error: downloadError } = await ctx.supabaseAdmin.storage.from('speaking-audio').download(attempt.storage_path)
    if (downloadError || !audio) return Response.json({ error: 'audio unavailable' }, { status: 404 })
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!apiKey) return Response.json({ error: 'AI service is not configured' }, { status: 503 })
    const { data: configured } = await ctx.supabaseAdmin.from('ai_models').select('model_id').eq('purpose', 'speaking_evaluation').eq('enabled', true).eq('free_only', true).order('priority').limit(1).maybeSingle()
    const provider = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': Deno.env.get('OFFICIAL_SITE_URL') ?? 'https://example.invalid', 'X-Title': 'GramApp' },
      body: JSON.stringify({ model: configured?.model_id ?? 'openrouter/free', response_format: { type: 'json_object' }, messages: [
        { role: 'system', content: 'Evaluate A2-B2 spoken English. Return JSON: transcript, score, pronunciation, grammar, strengths, improvements, encouragement. Keep French explanations short.' },
        { role: 'user', content: [{ type: 'text', text: attempt.prompt }, { type: 'input_audio', input_audio: { data: bytesToBase64(new Uint8Array(await audio.arrayBuffer())), format: 'm4a' } }] },
      ] }),
    })
    if (!provider.ok) {
      await ctx.supabaseAdmin.from('speaking_attempts').update({ status: 'failed' }).eq('id', attempt.id)
      return Response.json({ error: 'No configured free model accepted this audio.' }, { status: 502 })
    }
    const result = await provider.json()
    const content = result.choices?.[0]?.message?.content ?? '{}'
    let feedback: Record<string, unknown>
    try { feedback = JSON.parse(content) } catch { feedback = { encouragement: String(content) } }
    await ctx.supabaseAdmin.from('speaking_attempts').update({ status: 'evaluated', transcript: feedback.transcript ?? null, feedback }).eq('id', attempt.id)
    return Response.json({ feedback, model: result.model })
  }),
}
