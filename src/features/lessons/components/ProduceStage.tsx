import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageSquareText, ShieldCheck } from 'lucide-react-native';

import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { presentContinuousLesson as lesson } from '../data/presentContinuousLesson';

type Props = { onChange: (value: string) => void; value: string };

export function ProduceStage({ onChange, value }: Props) {
  const remaining = Math.max(0, lesson.production.minimumCharacters - value.trim().length);

  return (
    <View style={styles.stage}>
      <View style={styles.heading}>
        <View style={styles.icon}><MessageSquareText color={colors.primary} size={25} /></View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>CRÉEZ VOS PROPRES PHRASES</Text>
          <Text style={styles.title}>À vous de produire</Text>
        </View>
      </View>

      <Text style={styles.prompt}>{lesson.production.prompt}</Text>
      <TextInput
        accessibilityLabel="Votre réponse en anglais"
        autoCapitalize="sentences"
        multiline
        onChangeText={onChange}
        placeholder={lesson.production.placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={value}
      />
      <Text accessibilityLiveRegion="polite" style={styles.counter}>
        {remaining > 0 ? `Encore ${remaining} caractères minimum` : 'Réponse prête à envoyer'}
      </Text>

      <View style={styles.privacyNote}>
        <ShieldCheck color={colors.success} size={21} />
        <Text style={styles.privacyText}>L’évaluation IA sera effectuée côté serveur. Aucune clé ni logique de modèle n’est exposée dans l’application.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { gap: spacing.xl },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  icon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  headingCopy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
  prompt: { color: colors.text, fontFamily: fonts.medium, fontSize: 18, lineHeight: 28 },
  input: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 17, lineHeight: 27, minHeight: 180, padding: spacing.lg },
  counter: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12, textAlign: 'right' },
  privacyNote: { alignItems: 'flex-start', backgroundColor: colors.successSoft, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  privacyText: { color: colors.textMuted, flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
});
