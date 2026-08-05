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

export const CURRICULUM_LENGTH_DAYS = 180;

const contexts: Record<CefrLevel, readonly string[]> = {
  A2: ['at the park', 'at home', 'in a classroom', 'at a market', 'on a bus', 'at a sports centre'],
  B1: ['during a journey', 'at work', 'at a celebration', 'during a storm', 'in a new city', 'on a school trip'],
  B2: ['in a city debate', 'at a planning meeting', 'in an editorial', 'during an interview', 'in a policy proposal', 'in a community forum'],
};

const phases = {
  en: ['guided discovery', 'meaning check', 'form focus', 'contrast practice', 'real-life application', 'mastery review'],
  fr: ['découverte guidée', 'vérification du sens', 'étude de la forme', 'pratique contrastive', 'application réelle', 'révision de maîtrise'],
} as const;

type GrammarFocus = {
  title: Record<AppLocale, string>;
  formula: string;
  samples: readonly [string, string, string];
  practice: string;
  options: readonly [string, string, string];
  correct: string;
};

const focuses: Record<CefrLevel, readonly GrammarFocus[]> = {
  A2: [
    { title: { en: 'Present actions', fr: 'Actions au présent' }, formula: 'am/is/are + verb-ing', samples: ['Mina is reading near the window.', 'The children are drawing a map.', 'I am waiting for the bus.'], practice: 'My brother ___ dinner now.', options: ['cooks', 'is cooking', 'cooked'], correct: 'is cooking' },
    { title: { en: 'Everyday routines', fr: 'Habitudes quotidiennes' }, formula: 'subject + present simple', samples: ['Mina reads every evening.', 'The shop opens at nine.', 'We walk to school on Mondays.'], practice: 'My brother ___ dinner every Sunday.', options: ['cooks', 'is cooking', 'cooked'], correct: 'cooks' },
    { title: { en: 'Past events', fr: 'Événements passés' }, formula: 'subject + past simple', samples: ['Mina visited Abuja yesterday.', 'The shop opened late.', 'We walked home after class.'], practice: 'My brother ___ dinner yesterday.', options: ['cooks', 'is cooking', 'cooked'], correct: 'cooked' },
    { title: { en: 'Plans with going to', fr: 'Projets avec going to' }, formula: 'am/is/are + going to + verb', samples: ['Mina is going to study tonight.', 'They are going to buy fruit.', 'I am going to call my aunt.'], practice: 'We ___ visit the museum tomorrow.', options: ['are going to', 'went to', 'going'], correct: 'are going to' },
    { title: { en: 'Comparing things', fr: 'Comparer des choses' }, formula: 'comparative + than', samples: ['This road is quieter than that one.', 'A train is faster than a bus.', 'Today is hotter than yesterday.'], practice: 'This bag is ___ than mine.', options: ['heavy', 'heavier', 'heaviest'], correct: 'heavier' },
    { title: { en: 'Countable quantities', fr: 'Quantités dénombrables' }, formula: 'many/few + plural noun', samples: ['There are many books here.', 'We have a few questions.', 'How many apples do you need?'], practice: 'How ___ chairs are in the room?', options: ['much', 'many', 'any'], correct: 'many' },
  ],
  B1: [
    { title: { en: 'Past actions in progress', fr: 'Actions passées en cours' }, formula: 'was/were + verb-ing + when', samples: ['I was walking when it rained.', 'They were eating when I called.', 'Maya was sleeping when we arrived.'], practice: 'We ___ dinner when the lights went out.', options: ['ate', 'were eating', 'are eating'], correct: 'were eating' },
    { title: { en: 'Present perfect experience', fr: 'Expérience au present perfect' }, formula: 'have/has + past participle', samples: ['I have visited Accra twice.', 'She has never tried sushi.', 'They have already finished.'], practice: 'She ___ that film before.', options: ['has seen', 'saw', 'sees'], correct: 'has seen' },
    { title: { en: 'First conditional', fr: 'Premier conditionnel' }, formula: 'if + present, will + verb', samples: ['If it rains, we will stay home.', 'If you call, I will answer.', 'They will win if they practise.'], practice: 'If I finish early, I ___ you.', options: ['called', 'will call', 'would call'], correct: 'will call' },
    { title: { en: 'Defining relative clauses', fr: 'Propositions relatives' }, formula: 'noun + who/which/that + clause', samples: ['The woman who teaches us is kind.', 'The book that I bought is useful.', 'This is the bus which goes downtown.'], practice: 'The man ___ lives next door is a doctor.', options: ['who', 'where', 'whose'], correct: 'who' },
    { title: { en: 'Present passive', fr: 'Passif au présent' }, formula: 'am/is/are + past participle', samples: ['Coffee is grown here.', 'The rooms are cleaned daily.', 'English is spoken worldwide.'], practice: 'These phones ___ in Korea.', options: ['make', 'are made', 'made'], correct: 'are made' },
    { title: { en: 'Modals of deduction', fr: 'Modaux de déduction' }, formula: 'must/might/can’t + verb', samples: ['She must be tired.', 'They might know the answer.', 'That cannot be the right train.'], practice: 'The lights are off; they ___ be asleep.', options: ['must', 'should to', 'are'], correct: 'must' },
  ],
  B2: [
    { title: { en: 'Mixed conditionals', fr: 'Conditionnels mixtes' }, formula: 'if + past perfect, would + verb', samples: ['If I had studied law, I would be a lawyer now.', 'If she had left earlier, she would be here.', 'We would know if we had listened.'], practice: 'If I had accepted the job, I ___ abroad now.', options: ['work', 'would be working', 'will work'], correct: 'would be working' },
    { title: { en: 'Inversion for emphasis', fr: 'Inversion emphatique' }, formula: 'negative adverb + auxiliary + subject', samples: ['Never have I seen such rain.', 'Rarely do they arrive late.', 'Only then did she understand.'], practice: 'Rarely ___ such a clear argument.', options: ['we hear', 'do we hear', 'we heard'], correct: 'do we hear' },
    { title: { en: 'Cleft sentences', fr: 'Phrases clivées' }, formula: 'it is/was + focus + that/who', samples: ['It was Maya who solved it.', 'It is patience that matters.', 'What I need is more time.'], practice: 'It was the final example ___ convinced me.', options: ['that', 'what', 'where'], correct: 'that' },
    { title: { en: 'Participle clauses', fr: 'Propositions participiales' }, formula: 'verb-ing/past participle + main clause', samples: ['Knowing the risks, she agreed.', 'Built in 1920, the house is protected.', 'Having finished, they left.'], practice: '___ the report, he sent it to the team.', options: ['Having completed', 'He completed', 'Completes'], correct: 'Having completed' },
    { title: { en: 'Past modal deduction', fr: 'Déduction modale au passé' }, formula: 'must/might/can’t have + participle', samples: ['She must have forgotten.', 'They might have missed the train.', 'He cannot have seen us.'], practice: 'The door is open; someone ___ left early.', options: ['must have', 'must', 'has must'], correct: 'must have' },
    { title: { en: 'Reporting verbs', fr: 'Verbes de discours rapporté' }, formula: 'reporting verb + to-infinitive/verb-ing/that', samples: ['She admitted taking the file.', 'He advised us to wait.', 'They insisted that we stay.'], practice: 'The guide advised us ___ water.', options: ['bring', 'to bring', 'bringing us'], correct: 'to bring' },
  ],
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

export function getLesson(level: CefrLevel, locale: AppLocale, dayIndex = 0): LessonContent {
  const normalizedIndex = Math.max(0, Math.min(CURRICULUM_LENGTH_DAYS - 1, Math.floor(dayIndex)));
  const source = lessons[level][locale];
  const focus = focuses[level][normalizedIndex % focuses[level].length];
  const cycle = Math.floor(normalizedIndex / contexts[level].length) + 1;
  const context = contexts[level][normalizedIndex % contexts[level].length];
  const phase = phases[locale][normalizedIndex % phases[locale].length];
  const day = normalizedIndex + 1;
  return {
    ...source,
    id: `${source.id}-day-${day}`,
    title: `${focus.title[locale]} · ${locale === 'fr' ? 'Jour' : 'Day'} ${day}`,
    summary: `${source.summary} ${locale === 'fr' ? 'Parcours' : 'Focus'}: ${phase}.`,
    context: `${source.context} · ${context}`,
    sceneTitle: `${source.sceneTitle} ${locale === 'fr' ? 'Cycle' : 'Cycle'} ${cycle}`,
    examples: focus.samples.map((sample) => ({ subject: '', action: sample, detail: '' })),
    noticeQuestion: locale === 'fr' ? 'Quelle structure grammaticale relie ces exemples ?' : 'Which grammar pattern connects these examples?',
    noticeOptions: [{ id: 'target', label: focus.formula }, { id: 'decoy-one', label: 'subject + infinitive only' }, { id: 'decoy-two', label: 'will + past participle' }],
    correctNoticeId: 'target',
    discovery: locale === 'fr' ? `Le motif découvert est : ${focus.formula}. Observez le sens avant d’appliquer la forme.` : `The discovered pattern is: ${focus.formula}. Notice the meaning before applying the form.`,
    formula: [focus.formula, locale === 'fr' ? 'sens + contexte' : 'meaning + context'],
    practice: { prompt: focus.practice, options: focus.options.map((label, optionIndex) => ({ id: `option-${optionIndex}`, label })), correctOptionId: `option-${focus.options.indexOf(focus.correct)}`, explanation: locale === 'fr' ? `La réponse correcte suit le motif ${focus.formula}.` : `The correct answer follows the ${focus.formula} pattern.` },
    production: { ...source.production, prompt: locale === 'fr' ? `Écrivez deux phrases originales avec le motif « ${focus.formula} ».` : `Write two original sentences using the “${focus.formula}” pattern.` },
  };
}
