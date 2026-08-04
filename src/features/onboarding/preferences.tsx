import { createContext, useContext } from 'react';

export type AppLocale = 'en' | 'fr';
export type CefrLevel = 'A2' | 'B1' | 'B2';

export type LearnerPreferences = {
  locale: AppLocale;
  level: CefrLevel;
};

const LearnerPreferencesContext = createContext<LearnerPreferences | null>(null);

export const LearnerPreferencesProvider = LearnerPreferencesContext.Provider;

export function useLearnerPreferences() {
  const preferences = useContext(LearnerPreferencesContext);
  if (!preferences) throw new Error('Learner preferences are unavailable.');
  return preferences;
}
