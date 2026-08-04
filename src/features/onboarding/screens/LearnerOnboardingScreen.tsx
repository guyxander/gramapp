import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Languages, SignalHigh } from 'lucide-react-native';

import type { AppLocale, CefrLevel, LearnerPreferences } from '../preferences';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Props = { onComplete: (preferences: LearnerPreferences) => Promise<void> };

const languages: { id: AppLocale; label: string; detail: string }[] = [
  { id: 'en', label: 'English', detail: 'Use the app in English' },
  { id: 'fr', label: 'Français', detail: 'Utiliser l’application en français' },
];

const levels: { id: CefrLevel; label: string; detail: string }[] = [
  { id: 'A2', label: 'A2 · Elementary', detail: 'Everyday situations and essential grammar' },
  { id: 'B1', label: 'B1 · Intermediate', detail: 'Connected speech and more complex structures' },
  { id: 'B2', label: 'B2 · Upper intermediate', detail: 'Nuance, argument and confident expression' },
];

export function LearnerOnboardingScreen({ onComplete }: Props) {
  const [locale, setLocale] = useState<AppLocale | null>(null);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!locale || !level || saving) return;
    try {
      setSaving(true);
      setError('');
      await onComplete({ locale, level });
    } catch {
      setError(locale === 'fr' ? 'Impossible d’enregistrer vos choix. Réessayez.' : 'We could not save your choices. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const french = locale === 'fr';
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>GRAMAPP</Text>
          <Text style={styles.title}>{french ? 'Personnalisez votre parcours' : 'Personalize your learning path'}</Text>
          <Text style={styles.subtitle}>{french ? 'Ces choix déterminent la langue de l’application et les leçons proposées.' : 'These choices determine the app language and the lessons you receive.'}</Text>
        </View>

        <ChoiceSection icon={<Languages color={colors.primary} size={23} />} title={french ? 'Langue de l’application' : 'App language'}>
          {languages.map((item) => <ChoiceCard detail={item.detail} key={item.id} label={item.label} onPress={() => setLocale(item.id)} selected={locale === item.id} />)}
        </ChoiceSection>

        <ChoiceSection icon={<SignalHigh color={colors.discovery} size={23} />} title={french ? 'Votre niveau CECR' : 'Your CEFR level'}>
          {levels.map((item) => <ChoiceCard detail={item.detail} key={item.id} label={item.label} onPress={() => setLevel(item.id)} selected={level === item.id} />)}
        </ChoiceSection>

        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" disabled={!locale || !level || saving} onPress={() => void save()} style={[styles.button, (!locale || !level || saving) && styles.buttonDisabled]}>
          {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>{french ? 'Commencer à apprendre' : 'Start learning'}</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ChoiceSection({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return <View style={styles.section}><View style={styles.sectionHeading}>{icon}<Text style={styles.sectionTitle}>{title}</Text></View><View style={styles.choices}>{children}</View></View>;
}

function ChoiceCard({ detail, label, onPress, selected }: { detail: string; label: string; onPress: () => void; selected: boolean }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><View style={styles.choiceCopy}><Text style={styles.choiceLabel}>{label}</Text><Text style={styles.choiceDetail}>{detail}</Text></View><View style={[styles.check, selected && styles.checkSelected]}>{selected ? <Check color={colors.onPrimary} size={15} /> : null}</View></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, container: { flex: 1, gap: spacing.xl, padding: spacing.xl }, hero: { gap: spacing.sm }, eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 31, letterSpacing: -0.7 }, subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 }, section: { gap: spacing.md }, sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 }, choices: { gap: spacing.sm }, choice: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', minHeight: 68, padding: spacing.md }, choiceSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 2 }, choiceCopy: { flex: 1, gap: 3 }, choiceLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 }, choiceDetail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 }, check: { alignItems: 'center', borderColor: colors.outline, borderRadius: radius.pill, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 }, checkSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, error: { color: colors.error, fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' }, button: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.pill, justifyContent: 'center', minHeight: 56, marginTop: 'auto' }, buttonDisabled: { backgroundColor: colors.surfaceStrong }, buttonText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 16 },
});
