import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'secret' }, async (_req, ctx) => {
    const month = new Date()
    month.setUTCMonth(month.getUTCMonth() - 1, 1)
    const reportMonth = month.toISOString().slice(0, 10)
    const { data: learners, error } = await ctx.supabaseAdmin.from('profiles').select('id,xp,streak_days').eq('role', 'learner')
    if (error) return Response.json({ error: error.message }, { status: 500 })

    let generated = 0
    for (const learner of learners ?? []) {
      const [attempts, mastery] = await Promise.all([
        ctx.supabaseAdmin.from('lesson_attempts').select('id,xp_awarded,completed_at').eq('user_id', learner.id).eq('status', 'completed').gte('completed_at', `${reportMonth}T00:00:00Z`),
        ctx.supabaseAdmin.from('grammar_mastery').select('topic,mastery_score').eq('user_id', learner.id),
      ])
      const summary = { completedLessons: attempts.data?.length ?? 0, xpEarned: attempts.data?.reduce((sum, row) => sum + row.xp_awarded, 0) ?? 0, streakDays: learner.streak_days, mastery: mastery.data ?? [] }
      await ctx.supabaseAdmin.from('monthly_reports').upsert({ user_id: learner.id, report_month: reportMonth, summary }, { onConflict: 'user_id,report_month' })
      await ctx.supabaseAdmin.from('in_app_notifications').insert({ user_id: learner.id, title: 'Votre rapport mensuel est prêt', body: 'Consultez vos progrès et vos prochaines découvertes.', kind: 'monthly_report' })
      generated += 1
    }
    return Response.json({ generated, reportMonth })
  }),
}
