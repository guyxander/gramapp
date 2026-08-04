export type LessonStep = 'experience' | 'notice' | 'discover' | 'practice' | 'produce' | 'review';

export const presentContinuousLesson = {
  id: 'present-continuous-park',
  title: 'Le présent continu',
  context: 'Une matinée au parc',
  prompt: 'Look at the park. What is happening right now?',
  examples: [
    { subject: 'The woman', action: 'is jogging', detail: 'near the lake.' },
    { subject: 'The dog', action: 'is chasing', detail: 'a red ball.' },
    { subject: 'Two children', action: 'are playing', detail: 'under the trees.' },
  ],
  noticeQuestion: 'Qu’est-ce qui revient dans ces actions en cours ?',
  noticeOptions: [
    { id: 'past', label: 'Le verbe se termine toujours par -ed.' },
    { id: 'progressive', label: 'On voit am/is/are, puis un verbe en -ing.' },
    { id: 'future', label: 'La phrase commence toujours par will.' },
  ],
  correctNoticeId: 'progressive',
  discovery: 'Pour parler d’une action en cours, les exemples utilisent am, is ou are devant un verbe terminé par -ing.',
  practice: {
    prompt: 'Complétez la phrase : “My friends ___ football right now.”',
    options: [
      { id: 'play', label: 'play' },
      { id: 'are-playing', label: 'are playing' },
      { id: 'played', label: 'played' },
    ],
    correctOptionId: 'are-playing',
    explanation: '“My friends” est pluriel : les exemples conduisent à “are playing”.',
  },
  production: {
    prompt: 'Imaginez que vous regardez une rue animée. Écrivez deux phrases en anglais pour décrire ce qui se passe maintenant.',
    placeholder: 'A woman is…\nTwo people are…',
    minimumCharacters: 24,
  },
  rewards: { completionXp: 15, perfectPracticeBonusXp: 5 },
} as const;
