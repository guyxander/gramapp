import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';

export type AttemptHandle = { attemptId: string; lessonId: string } | null;

export async function startLessonAttempt(slug: string): Promise<AttemptHandle> {
  if (!env.isSupabaseConfigured) return null;
  const { data: lesson, error: lessonError } = await supabase.from('lessons').select('id').eq('slug', slug).single();
  if (lessonError) throw lessonError;
  const { data, error } = await supabase.rpc('start_lesson_attempt', { lesson_id_value: lesson.id }).single();
  if (error) throw error;
  const attempt = data as { id: string };
  return { attemptId: attempt.id, lessonId: lesson.id };
}

export async function completeLessonAttempt(handle: AttemptHandle, practiceCorrect: boolean, response: string) {
  if (!handle) return null;
  const { data, error } = await supabase.rpc('complete_lesson_attempt', {
    attempt_id: handle.attemptId,
    practice_score_value: practiceCorrect ? 1 : 0,
    practice_total_value: 1,
    production_response_value: response,
  }).single();
  if (error) throw error;
  return data;
}
