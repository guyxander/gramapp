import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Square, Waves } from 'lucide-react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';
import { useLearnerPreferences } from '../../onboarding/preferences';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

export function SpeakingPracticeScreen() {
  const { level, locale } = useLearnerPreferences();
  const prompt = level === 'A2' ? 'Describe what two people are doing right now in a busy café.' : level === 'B1' ? 'Tell a short story about something unexpected that happened while you were travelling.' : 'Explain how your city would change if public transport were free.';
  const copy = locale === 'fr' ? { eyebrow: 'PRATIQUE ORALE IA', title: 'Exprimez-vous', hint: 'Utilisez le motif de votre leçon actuelle.', recording: 'Enregistrement', ready: 'Enregistrement prêt', start: 'Appuyez pour commencer', evaluate: 'Évaluer mon expression', evaluating: 'Évaluation…', feedback: 'Retour IA', permissionTitle: 'Microphone requis', permissionBody: 'Autorisez le microphone pour pratiquer votre expression orale.', unavailable: 'Évaluation indisponible', retry: 'Veuillez réessayer.' } : { eyebrow: 'AI SPEAKING PRACTICE', title: 'Express yourself', hint: 'Use the pattern from your current lesson.', recording: 'Recording', ready: 'Recording ready', start: 'Tap to begin', evaluate: 'Evaluate my speaking', evaluating: 'Evaluating…', feedback: 'AI feedback', permissionTitle: 'Microphone required', permissionBody: 'Allow microphone access to practise speaking.', unavailable: 'Evaluation unavailable', retry: 'Please try again.' };
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const status = useAudioRecorderState(recorder, 250);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, unknown> | null>(null);

  const start = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return Alert.alert(copy.permissionTitle, copy.permissionBody);
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecordingUri(null);
    setFeedback(null);
  };

  const stop = async () => {
    setDurationMs(status.durationMillis);
    await recorder.stop();
    setRecordingUri(recorder.uri);
    await setAudioModeAsync({ allowsRecording: false });
  };

  const evaluate = async () => {
    if (!recordingUri || !env.isSupabaseConfigured) return;
    try {
      setEvaluating(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('Session expirée.');
      const path = `${auth.user.id}/${crypto.randomUUID()}.m4a`;
      const blob = await (await fetch(recordingUri)).blob();
      const { error: uploadError } = await supabase.storage.from('speaking-audio').upload(path, blob, { contentType: 'audio/m4a' });
      if (uploadError) throw uploadError;
      const { data: attempt, error: attemptError } = await supabase.from('speaking_attempts').insert({ user_id: auth.user.id, prompt, storage_path: path, duration_ms: Math.max(500, durationMs) }).select('id').single();
      if (attemptError) throw attemptError;
      const { data, error } = await supabase.functions.invoke('speaking-evaluate', { body: { attemptId: attempt.id } });
      if (error) throw error;
      setFeedback(data.feedback as Record<string, unknown>);
    } catch (error) {
      Alert.alert(copy.unavailable, error instanceof Error ? error.message : copy.retry);
    } finally { setEvaluating(false); }
  };

  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <Text style={styles.eyebrow}>{copy.eyebrow}</Text><Text style={styles.title}>{copy.title}</Text>
    <View style={styles.promptCard}><Text style={styles.prompt}>{prompt}</Text><Text style={styles.hint}>{copy.hint}</Text></View>
    <View style={[styles.wave, status.isRecording && styles.waveActive]}><Waves color={status.isRecording ? colors.onPrimary : colors.primary} size={70} /></View>
    <Text accessibilityLiveRegion="polite" style={styles.stateText}>{status.isRecording ? `${copy.recording} • ${Math.floor(status.durationMillis / 1000)} s` : recordingUri ? copy.ready : copy.start}</Text>
    <Pressable accessibilityRole="button" onPress={() => void (status.isRecording ? stop() : start())} style={[styles.recordButton, status.isRecording && styles.stopButton]}>{status.isRecording ? <Square color={colors.onPrimary} fill={colors.onPrimary} size={28} /> : <Mic color={colors.onPrimary} size={32} />}</Pressable>
    {recordingUri ? <Pressable accessibilityRole="button" disabled={evaluating || !env.isSupabaseConfigured} onPress={() => void evaluate()} style={styles.evaluateButton}><Text style={styles.evaluateText}>{evaluating ? copy.evaluating : copy.evaluate}</Text></Pressable> : null}
    {feedback ? <View style={styles.feedback}><Text style={styles.feedbackTitle}>{copy.feedback} • {String(feedback.score ?? '—')}/100</Text><Text style={styles.feedbackText}>{String(feedback.encouragement ?? feedback.grammar ?? '')}</Text></View> : null}
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, container: { alignItems: 'center', flex: 1, gap: spacing.lg, padding: spacing.xl }, eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 31 }, promptCard: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.xl, borderWidth: 1, gap: spacing.md, padding: spacing.xl, width: '100%' }, prompt: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, lineHeight: 30 }, hint: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 }, wave: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 130, justifyContent: 'center', width: 130 }, waveActive: { backgroundColor: colors.primary }, stateText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 15 }, recordButton: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.pill, height: 70, justifyContent: 'center', width: 70 }, stopButton: { backgroundColor: colors.error }, evaluateButton: { backgroundColor: colors.primary, borderRadius: radius.pill, minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.xl }, evaluateText: { color: colors.onPrimary, fontFamily: fonts.semibold }, feedback: { backgroundColor: colors.successSoft, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg, width: '100%' }, feedbackTitle: { color: colors.success, fontFamily: fonts.bold, fontSize: 17 }, feedbackText: { color: colors.text, fontFamily: fonts.regular, lineHeight: 21 },
});
