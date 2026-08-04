import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check, Eye, Lightbulb, Trees } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { LearnerStackParamList } from '../../../app/navigation/LearnerNavigator';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { LessonProgress } from '../components/LessonProgress';
import { PracticeStage } from '../components/PracticeStage';
import { ProduceStage } from '../components/ProduceStage';
import { ReviewStage } from '../components/ReviewStage';
import { getLesson, type LessonContent, type LessonStep } from '../data/lessonCatalog';
import { useLearnerPreferences, type AppLocale } from '../../onboarding/preferences';
import { queueProductionEvaluation } from '../services/productionEvaluation';
import { completeLessonAttempt, startLessonAttempt, type AttemptHandle } from '../services/lessonProgress';

type Props = NativeStackScreenProps<LearnerStackParamList, 'LessonDiscovery'>;

const stepOrder: LessonStep[] = ['experience', 'notice', 'discover', 'practice', 'produce', 'review'];

export function LessonDiscoveryScreen({ navigation }: Props) {
  const { level, locale } = useLearnerPreferences();
  const lesson = getLesson(level, locale);
  const [step, setStep] = useState<LessonStep>('experience');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [production, setProduction] = useState('');
  const [evaluationMessage, setEvaluationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<AttemptHandle>(null);
  const currentIndex = stepOrder.indexOf(step);
  const canContinue =
    (step !== 'notice' || selectedOption === lesson.correctNoticeId) &&
    (step !== 'practice' || practiceAnswer !== null) &&
    (step !== 'produce' || production.trim().length >= lesson.production.minimumCharacters) &&
    !submitting;

  useEffect(() => {
    let active = true;
    void startLessonAttempt(lesson.id).then((handle) => {
      if (active) setAttempt(handle);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const advance = async () => {
    if (step === 'review') {
      navigation.goBack();
      return;
    }

    if (step === 'practice' && !practiceChecked) {
      setPracticeChecked(true);
      return;
    }

    if (step === 'produce') {
      try {
        setSubmitting(true);
        await completeLessonAttempt(attempt, practiceAnswer === lesson.practice.correctOptionId, production);
        const evaluation = await queueProductionEvaluation({ attemptId: attempt?.attemptId, lessonId: attempt?.lessonId ?? lesson.id, response: production });
        setEvaluationMessage(evaluation.message);
      } catch {
        setEvaluationMessage(locale === 'fr' ? 'Votre production a été enregistrée. L’évaluation IA reprendra dès que le service sera disponible.' : 'Your response was saved. AI evaluation will resume when the service is available.');
      } finally {
        setSubmitting(false);
      }
    }

    setStep(stepOrder[currentIndex + 1]);
  };

  const continueLabel =
    step === 'review'
      ? (locale === 'fr' ? 'Retour au tableau de bord' : 'Back to dashboard')
      : step === 'practice' && !practiceChecked
        ? (locale === 'fr' ? 'Vérifier ma réponse' : 'Check my answer')
        : step === 'produce'
          ? submitting ? (locale === 'fr' ? 'Envoi…' : 'Sending…') : (locale === 'fr' ? 'Envoyer ma production' : 'Submit my response')
          : (locale === 'fr' ? 'Continuer' : 'Continue');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel={locale === 'fr' ? 'Fermer la leçon' : 'Close lesson'} accessibilityRole="button" hitSlop={12} onPress={navigation.goBack}>
          <ArrowLeft color={colors.text} size={26} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerTime}>07:30 restantes</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LessonProgress current={step} locale={locale} />

        {step === 'experience' ? <ExperienceStage lesson={lesson} /> : null}
        {step === 'notice' ? (
          <NoticeStage lesson={lesson} locale={locale} onSelect={setSelectedOption} selectedOption={selectedOption} />
        ) : null}
        {step === 'discover' ? <DiscoverStage lesson={lesson} locale={locale} /> : null}
        {step === 'practice' ? <PracticeStage answer={practiceAnswer} checked={practiceChecked} lesson={lesson} locale={locale} onAnswer={setPracticeAnswer} /> : null}
        {step === 'produce' ? <ProduceStage lesson={lesson} locale={locale} onChange={setProduction} value={production} /> : null}
        {step === 'review' ? (
          <ReviewStage
            evaluationMessage={evaluationMessage}
            lesson={lesson}
            locale={locale}
            practiceCorrect={practiceAnswer === lesson.practice.correctOptionId}
            response={production}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'notice' && selectedOption && !canContinue ? (
          <Text accessibilityLiveRegion="polite" style={styles.tryAgain}>{locale === 'fr' ? 'Regardez encore les mots colorés dans les exemples.' : 'Look again at the highlighted words in the examples.'}</Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={!canContinue}
          onPress={() => void advance()}
          style={({ pressed }) => [styles.continueButton, !canContinue && styles.continueDisabled, pressed && canContinue && styles.continuePressed]}
        >
          <Text style={styles.continueText}>{continueLabel}</Text>
          {step === 'review' ? <Check color={colors.onPrimary} size={21} /> : <ArrowRight color={colors.onPrimary} size={21} />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ExperienceStage({ lesson }: { lesson: LessonContent }) {
  return (
    <View style={styles.stage}>
      <View style={styles.scene}>
        <View style={styles.sun} />
        <Trees color={colors.success} size={88} strokeWidth={1.4} />
        <View style={styles.sceneCopy}>
          <Text style={styles.sceneEyebrow}>{lesson.context}</Text>
          <Text style={styles.sceneTitle}>{lesson.sceneTitle}</Text>
        </View>
      </View>
      <View style={styles.guideCard}>
        <View style={styles.guideIcon}><Eye color={colors.primary} size={23} /></View>
        <Text style={styles.prompt}>{lesson.prompt}</Text>
      </View>
      <View style={styles.examples}>
        {lesson.examples.map((example) => (
          <Text key={example.subject} style={styles.exampleText}>
            <Text style={styles.exampleSubject}>{example.subject} </Text>
            <Text style={styles.exampleAction}>{example.action}</Text> {example.detail}
          </Text>
        ))}
      </View>
    </View>
  );
}

function NoticeStage({ lesson, locale, onSelect, selectedOption }: { lesson: LessonContent; locale: AppLocale; onSelect: (id: string) => void; selectedOption: string | null }) {
  return (
    <View style={styles.stage}>
      <View style={styles.stageHeading}>
        <View style={styles.stageIcon}><Eye color={colors.discovery} size={25} /></View>
        <View style={styles.stageHeadingCopy}>
          <Text style={styles.stageEyebrow}>{locale === 'fr' ? 'À VOUS D’OBSERVER' : 'YOUR TURN TO NOTICE'}</Text>
          <Text style={styles.stageTitle}>{lesson.noticeQuestion}</Text>
        </View>
      </View>
      <View style={styles.compactExamples}>
        {lesson.examples.map((example) => (
          <Text key={example.subject} style={styles.compactExample}>{example.subject} <Text style={styles.exampleAction}>{example.action}</Text></Text>
        ))}
      </View>
      <View style={styles.options}>
        {lesson.noticeOptions.map((option) => {
          const selected = selectedOption === option.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DiscoverStage({ lesson, locale }: { lesson: LessonContent; locale: AppLocale }) {
  return (
    <View style={styles.stage}>
      <View style={styles.discoveryHero}>
        <View style={styles.discoveryIcon}><Lightbulb color={colors.xp} fill={colors.xp} size={42} /></View>
        <Text style={styles.discoveryEyebrow}>{locale === 'fr' ? 'VOTRE DÉCOUVERTE' : 'YOUR DISCOVERY'}</Text>
        <Text style={styles.discoveryTitle}>{locale === 'fr' ? 'Vous avez trouvé le motif.' : 'You found the pattern.'}</Text>
      </View>
      <View style={styles.discoveryCard}>
        <Text style={styles.discoveryText}>{lesson.discovery}</Text>
        <View style={styles.formula}>
          <Text style={styles.formulaPart}>{lesson.formula[0]}</Text>
          <Text style={styles.formulaPlus}>+</Text>
          <Text style={styles.formulaPart}>{lesson.formula[1]}</Text>
        </View>
      </View>
      <Text style={styles.nextHint}>{locale === 'fr' ? 'Ensuite, vous pratiquerez ce motif dans de nouvelles situations.' : 'Next, you will practise this pattern in new situations.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: { alignItems: 'center', borderBottomColor: colors.outline, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.lg, minHeight: 72, paddingHorizontal: spacing.lg },
  headerCopy: { flex: 1 },
  headerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  headerTime: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: 12, marginTop: 2 },
  content: { gap: spacing.section, padding: spacing.lg, paddingBottom: 132 },
  stage: { gap: spacing.xxl },
  scene: { alignItems: 'center', backgroundColor: '#E5F4E9', borderRadius: radius.xl, gap: spacing.md, minHeight: 235, overflow: 'hidden', padding: spacing.xxl },
  sun: { backgroundColor: '#FFE49A', borderRadius: radius.pill, height: 64, position: 'absolute', right: 28, top: 24, width: 64 },
  sceneCopy: { alignItems: 'center', gap: spacing.xs },
  sceneEyebrow: { color: colors.success, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.7 },
  sceneTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, textAlign: 'center' },
  guideCard: { alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  guideIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
  prompt: { color: colors.text, flex: 1, fontFamily: fonts.medium, fontSize: 18, lineHeight: 27 },
  examples: { gap: spacing.md },
  exampleText: { color: colors.text, fontFamily: fonts.regular, fontSize: 18, lineHeight: 28 },
  exampleSubject: { fontFamily: fonts.semibold },
  exampleAction: { color: colors.discovery, fontFamily: fonts.bold },
  stageHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  stageIcon: { alignItems: 'center', backgroundColor: '#F2EAFB', borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  stageHeadingCopy: { flex: 1, gap: spacing.xs },
  stageEyebrow: { color: colors.discovery, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8 },
  stageTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, lineHeight: 33 },
  compactExamples: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  compactExample: { color: colors.text, fontFamily: fonts.medium, fontSize: 17 },
  options: { gap: spacing.md },
  option: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 72, padding: spacing.lg },
  optionSelected: { backgroundColor: '#F6F1FC', borderColor: colors.discovery, borderWidth: 2 },
  radio: { alignItems: 'center', borderColor: colors.outline, borderRadius: radius.pill, borderWidth: 2, height: 23, justifyContent: 'center', width: 23 },
  radioSelected: { borderColor: colors.discovery },
  radioDot: { backgroundColor: colors.discovery, borderRadius: radius.pill, height: 11, width: 11 },
  optionText: { color: colors.text, flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  discoveryHero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  discoveryIcon: { alignItems: 'center', backgroundColor: '#FFF6D6', borderRadius: radius.pill, height: 88, justifyContent: 'center', width: 88 },
  discoveryEyebrow: { color: colors.discovery, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 },
  discoveryTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 29, textAlign: 'center' },
  discoveryCard: { backgroundColor: colors.surface, borderColor: colors.discovery, borderRadius: radius.xl, borderWidth: 1, gap: spacing.xxl, padding: spacing.xxl },
  discoveryText: { color: colors.text, fontFamily: fonts.medium, fontSize: 18, lineHeight: 29, textAlign: 'center' },
  formula: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  formulaPart: { backgroundColor: '#F2EAFB', borderRadius: radius.sm, color: colors.discovery, fontFamily: fonts.bold, fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  formulaPlus: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 18 },
  nextHint: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  footer: { backgroundColor: colors.background, borderTopColor: colors.outline, borderTopWidth: 1, bottom: 0, gap: spacing.sm, left: 0, padding: spacing.lg, position: 'absolute', right: 0 },
  tryAgain: { color: colors.error, fontFamily: fonts.medium, fontSize: 12, textAlign: 'center' },
  continueButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 56 },
  continueDisabled: { backgroundColor: colors.surfaceStrong },
  continuePressed: { opacity: 0.8 },
  continueText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 16 },
});
