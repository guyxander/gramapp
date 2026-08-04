import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';

export type ProductionSubmission = {
  attemptId?: string;
  lessonId: string;
  response: string;
};

export type ProductionEvaluation = {
  status: 'queued' | 'completed';
  message: string;
};

/**
 * AI evaluation must be implemented in a Supabase Edge Function so the
 * OpenRouter key, prompt, model fallback, and moderation logic stay server-side.
 */
export async function queueProductionEvaluation(
  submission: ProductionSubmission,
): Promise<ProductionEvaluation> {
  if (!submission.lessonId || !submission.response.trim()) {
    throw new Error('A lesson and response are required.');
  }

  if (!env.isSupabaseConfigured) {
    return { status: 'queued', message: 'Votre production est enregistrée. Connectez Supabase pour activer le retour IA.' };
  }

  const { data, error } = await supabase.functions.invoke('ai-evaluate', { body: submission });
  if (error) throw error;
  const encouragement = data?.feedback?.encouragement;
  return {
    status: 'completed',
    message: typeof encouragement === 'string' ? encouragement : 'Votre retour IA est prêt.',
  };
}
