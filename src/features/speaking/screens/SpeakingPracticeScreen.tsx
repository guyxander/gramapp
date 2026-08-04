import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Square, Waves } from 'lucide-react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import { colors, fonts, radius, spacing } from '../../../theme/tokens';

export function SpeakingPracticeScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const status = useAudioRecorderState(recorder, 250);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const start = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone requis', 'Autorisez le microphone pour pratiquer votre expression orale.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecordingUri(null);
  };

  const stop = async () => {
    await recorder.stop();
    setRecordingUri(recorder.uri);
    await setAudioModeAsync({ allowsRecording: false });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>PRATIQUE ORALE IA</Text>
        <Text style={styles.title}>Décrivez la scène</Text>
        <View style={styles.promptCard}>
          <Text style={styles.prompt}>Imagine a busy café. Describe what two people are doing right now.</Text>
          <Text style={styles.hint}>Utilisez le motif découvert : am / is / are + verbe-ing.</Text>
        </View>

        <View style={[styles.wave, status.isRecording && styles.waveActive]}><Waves color={status.isRecording ? colors.onPrimary : colors.primary} size={70} /></View>
        <Text accessibilityLiveRegion="polite" style={styles.stateText}>
          {status.isRecording ? `Enregistrement • ${Math.floor(status.durationMillis / 1000)} s` : recordingUri ? 'Enregistrement prêt pour l’évaluation' : 'Appuyez pour commencer'}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void (status.isRecording ? stop() : start())} style={[styles.recordButton, status.isRecording && styles.stopButton]}>
          {status.isRecording ? <Square color={colors.onPrimary} fill={colors.onPrimary} size={28} /> : <Mic color={colors.onPrimary} size={32} />}
        </Pressable>
        {recordingUri ? <Text style={styles.saved}>Audio enregistré localement. L’envoi et la transcription utiliseront la fonction IA sécurisée.</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { alignItems: 'center', flex: 1, gap: spacing.xl, padding: spacing.xxl },
  eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 31 },
  promptCard: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.xl, borderWidth: 1, gap: spacing.md, padding: spacing.xl, width: '100%' },
  prompt: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, lineHeight: 30 },
  hint: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  wave: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 160, justifyContent: 'center', marginTop: spacing.lg, width: 160 },
  waveActive: { backgroundColor: colors.primary },
  stateText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 15 },
  recordButton: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.pill, height: 76, justifyContent: 'center', width: 76 },
  stopButton: { backgroundColor: colors.error },
  saved: { color: colors.success, fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
