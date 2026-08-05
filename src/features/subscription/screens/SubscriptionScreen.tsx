import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Crown, RefreshCw } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { LearnerStackParamList } from '../../../app/navigation/LearnerNavigator';
import { useLearnerPreferences } from '../../onboarding/preferences';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<LearnerStackParamList, 'Subscription'>;

export function SubscriptionScreen({ navigation }: Props) {
  const { locale } = useLearnerPreferences();
  const fr = locale === 'fr';
  const benefits = fr ? ['Temps d’apprentissage illimité', 'Pratique orale IA', 'Retour personnalisé', 'Exercices adaptés au niveau'] : ['Unlimited learning time', 'AI speaking practice', 'Personalized feedback', 'Level-matched exercises'];
  return <SafeAreaView style={styles.safeArea}>
    <View style={styles.header}><Pressable accessibilityLabel={fr ? 'Retour' : 'Back'} accessibilityRole="button" hitSlop={12} onPress={navigation.goBack}><ArrowLeft color={colors.text} size={26} /></Pressable><Text style={styles.headerTitle}>{fr ? 'Abonnement' : 'Subscription'}</Text></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}><View style={styles.crown}><Crown color={colors.premium} fill={colors.premium} size={44} /></View><Text style={styles.eyebrow}>GRAMAPP PREMIUM</Text><Text style={styles.title}>{fr ? 'Apprenez sans limite' : 'Learn without limits'}</Text><Text style={styles.price}>$20 <Text style={styles.interval}>{fr ? '/ mois' : '/ month'}</Text></Text></View>
      <View style={styles.card}>{benefits.map((benefit) => <View key={benefit} style={styles.benefit}><View style={styles.check}><Check color={colors.onPrimary} size={15} /></View><Text style={styles.benefitText}>{benefit}</Text></View>)}</View>
      <View style={styles.notice}><RefreshCw color={colors.primaryDark} size={22} /><Text style={styles.noticeText}>{fr ? 'L’activation des paiements sera disponible prochainement. Si votre abonnement a déjà été activé, retournez à la page précédente et actualisez votre statut.' : 'Payment activation is coming soon. If your subscription has already been activated, return to the previous page and refresh your status.'}</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, header: { alignItems: 'center', borderBottomColor: colors.outline, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.lg, minHeight: 72, paddingHorizontal: spacing.lg }, headerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 }, content: { gap: spacing.xl, padding: spacing.xl }, hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }, crown: { alignItems: 'center', backgroundColor: '#FFF6D6', borderRadius: radius.pill, height: 96, justifyContent: 'center', width: 96 }, eyebrow: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 31, textAlign: 'center' }, price: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 40 }, interval: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 16 }, card: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.xl, borderWidth: 1, gap: spacing.lg, padding: spacing.xl }, benefit: { alignItems: 'center', flexDirection: 'row', gap: spacing.md }, check: { alignItems: 'center', backgroundColor: colors.success, borderRadius: radius.pill, height: 26, justifyContent: 'center', width: 26 }, benefitText: { color: colors.text, flex: 1, fontFamily: fonts.medium, fontSize: 15 }, notice: { alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.md, padding: spacing.lg }, noticeText: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
});
