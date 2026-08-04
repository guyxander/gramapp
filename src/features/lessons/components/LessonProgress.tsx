import { StyleSheet, Text, View } from 'react-native';
import type { AppLocale } from '../../onboarding/preferences';
import type { LessonStep } from '../data/lessonCatalog';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

const keys: LessonStep[] = ['experience', 'notice', 'discover', 'practice', 'produce', 'review'];

export function LessonProgress({ current, locale }: { current: LessonStep; locale: AppLocale }) {
  const labels = locale === 'fr' ? ['EXPÉRIENCE', 'OBSERVER', 'DÉCOUVRIR', 'PRATIQUER', 'PRODUIRE', 'BILAN'] : ['EXPERIENCE', 'NOTICE', 'DISCOVER', 'PRACTICE', 'PRODUCE', 'REVIEW'];
  const currentIndex = keys.indexOf(current);
  return <View accessibilityLabel={locale === 'fr' ? `Étape ${currentIndex + 1} sur ${keys.length}` : `Step ${currentIndex + 1} of ${keys.length}`} style={styles.container}>{keys.map((key, index) => { const active = index <= currentIndex; return <View key={key} style={styles.step}><View style={[styles.track, active && styles.trackActive]} /><Text style={[styles.label, active && styles.labelActive]}>{labels[index]}</Text></View>; })}</View>;
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', gap: spacing.sm }, step: { flex: 1, gap: spacing.xs }, track: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, height: 5 }, trackActive: { backgroundColor: colors.primary }, label: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 8, letterSpacing: 0.4 }, labelActive: { color: colors.primaryDark } });
