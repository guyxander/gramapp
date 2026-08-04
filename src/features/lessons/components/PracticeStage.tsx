import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Dumbbell } from 'lucide-react-native';

import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { presentContinuousLesson as lesson } from '../data/presentContinuousLesson';

type Props = {
  answer: string | null;
  checked: boolean;
  onAnswer: (id: string) => void;
};

export function PracticeStage({ answer, checked, onAnswer }: Props) {
  const isCorrect = answer === lesson.practice.correctOptionId;

  return (
    <View style={styles.stage}>
      <View style={styles.heading}>
        <View style={styles.icon}><Dumbbell color={colors.success} size={25} /></View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>METTEZ LE MOTIF EN ACTION</Text>
          <Text style={styles.title}>{lesson.practice.prompt}</Text>
        </View>
      </View>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {lesson.practice.options.map((option) => {
          const selected = answer === option.id;
          const correct = checked && option.id === lesson.practice.correctOptionId;
          const incorrect = checked && selected && !correct;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              disabled={checked}
              key={option.id}
              onPress={() => onAnswer(option.id)}
              style={[styles.option, selected && styles.selected, correct && styles.correct, incorrect && styles.incorrect]}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              {correct ? <CheckCircle2 color={colors.success} size={22} /> : null}
            </Pressable>
          );
        })}
      </View>

      {checked ? (
        <View accessibilityLiveRegion="polite" style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={styles.feedbackTitle}>{isCorrect ? 'Bien observé !' : 'Presque.'}</Text>
          <Text style={styles.feedbackText}>{lesson.practice.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { gap: spacing.xxl },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  icon: { alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  headingCopy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.success, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 25, lineHeight: 34 },
  options: { gap: spacing.md },
  option: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 68, paddingHorizontal: spacing.xl },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success, borderWidth: 2 },
  incorrect: { backgroundColor: '#FFF1F0', borderColor: colors.error, borderWidth: 2 },
  optionText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 17 },
  feedback: { borderRadius: radius.lg, gap: spacing.xs, padding: spacing.lg },
  feedbackCorrect: { backgroundColor: colors.successSoft },
  feedbackIncorrect: { backgroundColor: '#FFF1F0' },
  feedbackTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  feedbackText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
});
