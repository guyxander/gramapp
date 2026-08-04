import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import type { LessonStep } from '../data/presentContinuousLesson';

const steps: { key: LessonStep; label: string }[] = [
  { key: 'experience', label: 'EXPÉRIENCE' },
  { key: 'notice', label: 'OBSERVER' },
  { key: 'discover', label: 'DÉCOUVRIR' },
  { key: 'practice', label: 'PRATIQUER' },
  { key: 'produce', label: 'PRODUIRE' },
  { key: 'review', label: 'BILAN' },
];

export function LessonProgress({ current }: { current: LessonStep }) {
  const currentIndex = steps.findIndex((step) => step.key === current);

  return (
    <View style={styles.container} accessibilityLabel={`Étape ${currentIndex + 1} sur ${steps.length}`}>
      {steps.map((step, index) => {
        const active = index <= currentIndex;
        return (
          <View key={step.key} style={styles.step}>
            <View style={[styles.track, active && styles.trackActive]} />
            <Text style={[styles.label, active && styles.labelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm },
  step: { flex: 1, gap: spacing.xs },
  track: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, height: 5 },
  trackActive: { backgroundColor: colors.primary },
  label: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 0.55 },
  labelActive: { color: colors.primaryDark },
});
