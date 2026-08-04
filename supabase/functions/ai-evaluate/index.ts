import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

type Payload = { attemptId?: string; lessonId: string; response: string }

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const payload = await req.json() as Payload
    if (!payload.lessonId || payload.response.trim().length < 12 || payload.response.length > 4000) {
      return Response.json({ error: 'invalid production response' }, { status: 400 })
    }

    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!apiKey) return Response.json({ error: 'AI service is not configured' }, { status: 503 })

    const { data: model } = await ctx.supabaseAdmin.from('ai_models').select('model_id')
      .eq('purpose', 'production_evaluation').eq('enabled', true).eq('free_only', true)
      .order('priority').limit(1).maybeSingle()

    const modelId = model?.model_id ?? 'openrouter/free'
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('OFFICIAL_SITE_URL') ?? 'https://example.invalid',
        'X-Title': 'Grammar Discovery',
      },
      body: JSON.stringify({
        model: modelId,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Evaluate an A2-B2 English learner response. Return JSON with strengths (array), corrections (array), encouragement (string), and score (0-100). Be concise, English-first, with optional short French clarification. Do not invent personal facts.' },
          { role: 'user', content: payload.response },
        ],
      }),
    })

    if (!aiResponse.ok) return Response.json({ error: 'AI provider unavailable' }, { status: 502 })
    const result = await aiResponse.json()
    const content = result.choices?.[0]?.message?.content
    let feedback: unknown
    try { feedback = JSON.parse(content) } catch { feedback = { encouragement: String(content ?? '') } }

    if (payload.attemptId) {
      await ctx.supabaseAdmin.from('lesson_attempts').update({ ai_feedback: feedback })
        .eq('id', payload.attemptId).eq('user_id', ctx.userClaims!.sub)
    }
    return Response.json({ feedback, model: result.model })
  }),
}
