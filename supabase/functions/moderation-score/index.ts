import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

const phonePattern = /(?:\+?\d[\s().-]*){8,}/
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const handlePattern = /(?:@|instagram|whatsapp|telegram|snapchat|tiktok)\s*[\w.-]{3,}/i
const linkPattern = /https?:\/\/|www\./i
const paymentPattern = /(?:pay|send|transfer).{0,25}(?:money|cash|naira|₦|bank)/i

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { messageId, body } = await req.json() as { messageId?: number; body: string }
    if (!body || body.length > 4000) return Response.json({ error: 'invalid message' }, { status: 400 })

    const reasons = [
      phonePattern.test(body) ? 'phone' : null,
      emailPattern.test(body) ? 'email' : null,
      handlePattern.test(body) ? 'social_handle' : null,
      linkPattern.test(body) ? 'link' : null,
      paymentPattern.test(body) ? 'payment_request' : null,
    ].filter(Boolean)
    const confidence = Math.min(0.99, reasons.length * 0.3)
    const risk = confidence >= 0.75 ? 'high' : confidence >= 0.4 ? 'medium' : 'low'

    if (messageId && reasons.length > 0) {
      await ctx.supabaseAdmin.from('moderation_flags').insert({
        message_id: messageId, risk, confidence, reason_code: reasons.join(','), evidence: { matches: reasons },
      })
    }
    return Response.json({ flagged: reasons.length > 0, risk, confidence, reasons })
  }),
}
