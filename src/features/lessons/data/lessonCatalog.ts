import type { AppLocale, CefrLevel } from '../../onboarding/preferences';

export type LessonStep = 'experience' | 'notice' | 'discover' | 'practice' | 'produce' | 'review';

export type LessonContent = {
  id: string;
  level: CefrLevel;
  title: string;
  summary: string;
  context: string;
  sceneTitle: string;
  prompt: string;
  examples: readonly { subject: string; action: string; detail: string }[];
  noticeQuestion: string;
  noticeOptions: readonly { id: string; label: string }[];
  correctNoticeId: string;
  discovery: string;
  formula: readonly [string, string];
  practice: { prompt: string; options: readonly { id: string; label: string }[]; correctOptionId: string; explanation: string };
  production: { prompt: string; placeholder: string; minimumCharacters: number };
  rewards: { completionXp: number; perfectPracticeBonusXp: number };
};

const lessons: Record<CefrLevel, Record<AppLocale, LessonContent>> = {
  A2: {
    en: {
      id: 'present-continuous-park', level: 'A2', title: 'The present continuous', summary: 'Observe actions in progress and discover the pattern.', context: 'A morning in the park', sceneTitle: 'Everyone is moving.', prompt: 'Look at the park. What is happening right now?',
      examples: [{ subject: 'The woman', action: 'is jogging', detail: 'near the lake.' }, { subject: 'The dog', action: 'is chasing', detail: 'a red ball.' }, { subject: 'Two children', action: 'are playing', detail: 'under the trees.' }],
      noticeQuestion: 'What repeats in these actions happening now?', noticeOptions: [{ id: 'past', label: 'The verb always ends in -ed.' }, { id: 'progressive', label: 'We see am/is/are, then a verb ending in -ing.' }, { id: 'future', label: 'The sentence always starts with will.' }], correctNoticeId: 'progressive', discovery: 'To describe an action in progress, use am, is or are before a verb ending in -ing.', formula: ['am / is / are', 'verb-ing'],
      practice: { prompt: 'Complete: “My friends ___ football right now.”', options: [{ id: 'play', label: 'play' }, { id: 'are-playing', label: 'are playing' }, { id: 'played', label: 'played' }], correctOptionId: 'are-playing', explanation: '“My friends” is plural, so the pattern leads to “are playing”.' },
      production: { prompt: 'Write two English sentences describing what is happening now in a busy street.', placeholder: 'A woman is…\nTwo people are…', minimumCharacters: 24 }, rewards: { completionXp: 15, perfectPracticeBonusXp: 5 },
    },
    fr: {
      id: 'present-continuous-park', level: 'A2', title: 'Le présent continu', summary: 'Observez des actions en cours et découvrez le motif.', context: 'Une matinée au parc', sceneTitle: 'Tout le monde est en mouvement.', prompt: 'Look at the park. What is happening right now?',
      examples: [{ subject: 'The woman', action: 'is jogging', detail: 'near the lake.' }, { subject: 'The dog', action: 'is chasing', detail: 'a red ball.' }, { subject: 'Two children', action: 'are playing', detail: 'under the trees.' }],
      noticeQuestion: 'Qu’est-ce qui revient dans ces actions en cours ?', noticeOptions: [{ id: 'past', label: 'Le verbe se termine toujours par -ed.' }, { id: 'progressive', label: 'On voit am/is/are, puis un verbe en -ing.' }, { id: 'future', label: 'La phrase commence toujours par will.' }], correctNoticeId: 'progressive', discovery: 'Pour parler d’une action en cours, utilisez am, is ou are devant un verbe terminé par -ing.', formula: ['am / is / are', 'verbe-ing'],
      practice: { prompt: 'Complétez : « My friends ___ football right now. »', options: [{ id: 'play', label: 'play' }, { id: 'are-playing', label: 'are playing' }, { id: 'played', label: 'played' }], correctOptionId: 'are-playing', explanation: '« My friends » est pluriel : le motif conduit à « are playing ».' },
      production: { prompt: 'Écrivez deux phrases en anglais pour décrire ce qui se passe maintenant dans une rue animée.', placeholder: 'A woman is…\nTwo people are…', minimumCharacters: 24 }, rewards: { completionXp: 15, perfectPracticeBonusXp: 5 },
    },
  },
  B1: {
    en: {
      id: 'past-narrative-city', level: 'B1', title: 'Telling a story in the past', summary: 'Connect events using the past simple and past continuous.', context: 'An unexpected journey', sceneTitle: 'One event interrupts another.', prompt: 'Read the scene and notice how the background action and main event connect.',
      examples: [{ subject: 'I', action: 'was walking', detail: 'home when the rain started.' }, { subject: 'They', action: 'were waiting', detail: 'when the bus finally arrived.' }, { subject: 'Maya', action: 'was calling', detail: 'a taxi when she found her keys.' }],
      noticeQuestion: 'Which form describes the longer background action?', noticeOptions: [{ id: 'simple', label: 'The past simple in both clauses.' }, { id: 'continuous', label: 'was/were + verb-ing for the background action.' }, { id: 'present', label: 'The present continuous.' }], correctNoticeId: 'continuous', discovery: 'Use the past continuous for an action already in progress and the past simple for the event that interrupts it.', formula: ['was / were + verb-ing', 'past simple'],
      practice: { prompt: 'Complete: “We ___ dinner when the lights went out.”', options: [{ id: 'ate', label: 'ate' }, { id: 'were-eating', label: 'were eating' }, { id: 'are-eating', label: 'are eating' }], correctOptionId: 'were-eating', explanation: 'Dinner was already in progress when the lights went out.' },
      production: { prompt: 'Write two sentences about an unexpected event using when or while.', placeholder: 'I was… when…\nWhile we were…, …', minimumCharacters: 38 }, rewards: { completionXp: 20, perfectPracticeBonusXp: 5 },
    },
    fr: {
      id: 'past-narrative-city', level: 'B1', title: 'Raconter au passé', summary: 'Reliez des événements avec le prétérit simple et continu.', context: 'Un trajet inattendu', sceneTitle: 'Un événement en interrompt un autre.', prompt: 'Observez comment l’action de fond et l’événement principal se relient.',
      examples: [{ subject: 'I', action: 'was walking', detail: 'home when the rain started.' }, { subject: 'They', action: 'were waiting', detail: 'when the bus finally arrived.' }, { subject: 'Maya', action: 'was calling', detail: 'a taxi when she found her keys.' }],
      noticeQuestion: 'Quelle forme décrit l’action de fond la plus longue ?', noticeOptions: [{ id: 'simple', label: 'Le prétérit simple dans les deux propositions.' }, { id: 'continuous', label: 'was/were + verbe-ing pour l’action de fond.' }, { id: 'present', label: 'Le présent continu.' }], correctNoticeId: 'continuous', discovery: 'Utilisez le prétérit continu pour l’action déjà en cours et le prétérit simple pour l’événement qui l’interrompt.', formula: ['was / were + verbe-ing', 'prétérit simple'],
      practice: { prompt: 'Complétez : « We ___ dinner when the lights went out. »', options: [{ id: 'ate', label: 'ate' }, { id: 'were-eating', label: 'were eating' }, { id: 'are-eating', label: 'are eating' }], correctOptionId: 'were-eating', explanation: 'Le dîner était déjà en cours lorsque les lumières se sont éteintes.' },
      production: { prompt: 'Écrivez deux phrases sur un événement inattendu avec when ou while.', placeholder: 'I was… when…\nWhile we were…, …', minimumCharacters: 38 }, rewards: { completionXp: 20, perfectPracticeBonusXp: 5 },
    },
  },
  B2: {
    en: {
      id: 'conditionals-debate', level: 'B2', title: 'Nuance with conditionals', summary: 'Compare real and hypothetical outcomes in a discussion.', context: 'A city policy debate', sceneTitle: 'The speakers weigh possible outcomes.', prompt: 'Compare the real possibility with the imagined alternative.',
      examples: [{ subject: 'If the city invests now,', action: 'traffic will improve', detail: 'over time.' }, { subject: 'If public transport were cheaper,', action: 'more people would use it', detail: 'every day.' }, { subject: 'If officials had acted earlier,', action: 'the problem would have been smaller', detail: 'today.' }],
      noticeQuestion: 'Which sentence describes an unreal present situation?', noticeOptions: [{ id: 'first', label: 'If + present, will + verb.' }, { id: 'second', label: 'If + past, would + verb.' }, { id: 'third', label: 'If + past perfect, would have + participle.' }], correctNoticeId: 'second', discovery: 'The second conditional presents an imagined or unlikely present situation and its possible result.', formula: ['if + past', 'would + verb'],
      practice: { prompt: 'Complete: “If I ___ more time, I would join the committee.”', options: [{ id: 'have', label: 'have' }, { id: 'had', label: 'had' }, { id: 'will-have', label: 'will have' }], correctOptionId: 'had', explanation: 'The imagined present situation uses if + past, followed by would + verb.' },
      production: { prompt: 'Write a short opinion using two different conditional structures.', placeholder: 'If the city…, it will…\nIf I were responsible, I would…', minimumCharacters: 55 }, rewards: { completionXp: 25, perfectPracticeBonusXp: 10 },
    },
    fr: {
      id: 'conditionals-debate', level: 'B2', title: 'Nuancer avec les conditionnels', summary: 'Comparez des conséquences réelles et hypothétiques.', context: 'Un débat sur la ville', sceneTitle: 'Les intervenants évaluent plusieurs conséquences.', prompt: 'Comparez la possibilité réelle et l’alternative imaginaire.',
      examples: [{ subject: 'If the city invests now,', action: 'traffic will improve', detail: 'over time.' }, { subject: 'If public transport were cheaper,', action: 'more people would use it', detail: 'every day.' }, { subject: 'If officials had acted earlier,', action: 'the problem would have been smaller', detail: 'today.' }],
      noticeQuestion: 'Quelle phrase décrit une situation présente irréelle ?', noticeOptions: [{ id: 'first', label: 'If + présent, will + verbe.' }, { id: 'second', label: 'If + passé, would + verbe.' }, { id: 'third', label: 'If + past perfect, would have + participe.' }], correctNoticeId: 'second', discovery: 'Le deuxième conditionnel présente une situation actuelle imaginaire ou peu probable et son résultat possible.', formula: ['if + passé', 'would + verbe'],
      practice: { prompt: 'Complétez : « If I ___ more time, I would join the committee. »', options: [{ id: 'have', label: 'have' }, { id: 'had', label: 'had' }, { id: 'will-have', label: 'will have' }], correctOptionId: 'had', explanation: 'La situation présente imaginaire utilise if + passé, puis would + verbe.' },
      production: { prompt: 'Rédigez une courte opinion avec deux structures conditionnelles différentes.', placeholder: 'If the city…, it will…\nIf I were responsible, I would…', minimumCharacters: 55 }, rewards: { completionXp: 25, perfectPracticeBonusXp: 10 },
    },
  },
};

export function getLesson(level: CefrLevel, locale: AppLocale) {
  return lessons[level][locale];
}
