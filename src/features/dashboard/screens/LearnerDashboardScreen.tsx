import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Flame, Menu, Mic2, Search, Star, UserRoundSearch } from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { LearnerStackParamList, LearnerTabParamList } from '../../../app/navigation/LearnerNavigator';
import { BrandMark } from '../../../components/BrandMark';
import { useLearnerPreferences } from '../../onboarding/preferences';
import { getLesson } from '../../lessons/data/lessonCatalog';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { StatCard } from '../components/StatCard';

type Props = CompositeScreenProps<BottomTabScreenProps<LearnerTabParamList, 'Learn'>, NativeStackScreenProps<LearnerStackParamList>>;

export function LearnerDashboardScreen({ navigation }: Props) {
  const { level, locale } = useLearnerPreferences();
  const lesson = getLesson(level, locale);
  const copy = locale === 'fr' ? {
    greeting: 'Bonjour, Apprenant !', subtitle: 'Prêt pour votre découverte quotidienne ?', streak: 'SÉRIE ACTIVE', days: '5 jours', xp: 'XP TOTAL', grammar: 'GRAMMAIRE', start: 'Commencer la découverte', mastery: 'Aperçu de votre maîtrise', seeAll: 'Voir tout', strengthen: 'À renforcer', mastered: 'Maîtrisé', speaking: 'Pratique orale IA', tutor: 'Trouver un tuteur',
  } : {
    greeting: 'Hello, Learner!', subtitle: 'Ready for your daily discovery?', streak: 'ACTIVE STREAK', days: '5 days', xp: 'TOTAL XP', grammar: 'GRAMMAR', start: 'Start discovery', mastery: 'Your mastery overview', seeAll: 'See all', strengthen: 'Needs work', mastered: 'Mastered', speaking: 'AI speaking practice', tutor: 'Find a tutor',
  };

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityLabel={locale === 'fr' ? 'Ouvrir le profil' : 'Open profile'} accessibilityRole="button" hitSlop={10} onPress={() => navigation.navigate('Profile')}><Menu color={colors.text} size={26} /></Pressable><BrandMark compact /><View style={styles.timePill}><Text style={styles.timeText}>10:00</Text></View></View>
    <View style={styles.greeting}><Text style={styles.title}>{copy.greeting}</Text><Text style={styles.subtitle}>{copy.subtitle}</Text></View>
    <View style={styles.statsRow}><StatCard icon={<Flame color={colors.streak} size={30} />} label={copy.streak} tint="#FFF5F1" value={copy.days} /><StatCard icon={<Star color={colors.xp} fill={colors.xp} size={29} />} label={copy.xp} value="1 250" /></View>
    <View style={styles.lessonCard}>
      <View style={styles.lessonTopRow}><View style={styles.tag}><Text style={styles.tagText}>{copy.grammar} · {level}</Text></View><Pressable accessibilityLabel={locale === 'fr' ? 'Ouvrir la leçon' : 'Open lesson'} accessibilityRole="button" onPress={() => navigation.navigate('LessonDiscovery')} style={styles.searchBadge}><Search color={colors.primaryDark} size={22} /></Pressable></View>
      <Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonDescription}>{lesson.summary}</Text><View style={styles.progressTrack}><View style={styles.progressFill} /></View>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LessonDiscovery')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{copy.start}</Text><ChevronRight color={colors.onPrimary} size={21} /></Pressable>
    </View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{copy.mastery}</Text><Pressable accessibilityRole="button" hitSlop={10} onPress={() => navigation.navigate('Profile')}><Text style={styles.link}>{copy.seeAll}</Text></Pressable></View>
    <View style={styles.heatmapCard}><View style={styles.heatmapGrid}>{[4, 4, 3, 1, 0, 3, 3, 1, 0, 0].map((value, index) => <View key={index} style={[styles.heatmapCell, { backgroundColor: colors.heatmap[value] }]} />)}</View><View style={styles.legend}><Text style={styles.legendText}>{copy.strengthen}</Text><Text style={styles.legendText}>{copy.mastered}</Text></View></View>
    <View style={styles.quickActions}><Pressable accessibilityRole="button" onPress={() => navigation.navigate('Practice')} style={styles.quickCard}><View style={[styles.quickIcon, { backgroundColor: colors.successSoft }]}><Mic2 color={colors.success} size={25} /></View><Text style={styles.quickLabel}>{copy.speaking}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => navigation.navigate('Tutors')} style={styles.quickCard}><View style={[styles.quickIcon, { backgroundColor: '#F2EAFB' }]}><UserRoundSearch color={colors.discovery} size={25} /></View><Text style={styles.quickLabel}>{copy.tutor}</Text></Pressable></View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, content: { gap: spacing.xxl, paddingBottom: 116, paddingHorizontal: spacing.lg, paddingTop: spacing.md }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, timePill: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }, timeText: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 }, greeting: { gap: spacing.xs, paddingTop: spacing.sm }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 31, letterSpacing: -0.8 }, subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 16 }, statsRow: { flexDirection: 'row', gap: spacing.md }, lessonCard: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, elevation: 2, gap: spacing.md, padding: spacing.xl, shadowColor: '#102A43', shadowOpacity: 0.07, shadowRadius: 10 }, lessonTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, tag: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 }, tagText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8 }, searchBadge: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 43, justifyContent: 'center', width: 43 }, lessonTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.5 }, lessonDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 }, progressTrack: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, height: 8, overflow: 'hidden' }, progressFill: { backgroundColor: colors.primary, borderRadius: radius.pill, height: '100%', width: '45%' }, primaryButton: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.pill, flexDirection: 'row', justifyContent: 'center', minHeight: 54, paddingHorizontal: spacing.lg }, primaryButtonText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 15 }, sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, sectionTitle: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.4 }, link: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 14 }, heatmapCard: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.xl }, heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, heatmapCell: { aspectRatio: 1, borderRadius: radius.sm, width: '17.6%' }, legend: { flexDirection: 'row', justifyContent: 'space-between' }, legendText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12 }, quickActions: { flexDirection: 'row', gap: spacing.md }, quickCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: spacing.md, minHeight: 132, padding: spacing.lg }, quickIcon: { alignItems: 'center', borderRadius: radius.pill, height: 54, justifyContent: 'center', width: 54 }, quickLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14, textAlign: 'center' },
});
