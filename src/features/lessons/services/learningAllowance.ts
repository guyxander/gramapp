import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';

export type LearningAllowance = { allowed: boolean; usedSeconds: number; availableSeconds: number; premium: boolean };

export async function consumeLearningSeconds(seconds: number): Promise<LearningAllowance> {
  if (!env.isSupabaseConfigured) return { allowed: true, usedSeconds: 0, availableSeconds: 600, premium: false };
  const { data, error } = await supabase.rpc('consume_learning_seconds', { seconds_to_add: Math.max(0, Math.floor(seconds)) }).single();
  if (error) throw error;
  const result = data as { allowed: boolean; used_seconds: number; available_seconds: number };
  return {
    allowed: result.allowed,
    usedSeconds: result.used_seconds,
    availableSeconds: result.available_seconds,
    premium: result.available_seconds > 86_400,
  };
}
