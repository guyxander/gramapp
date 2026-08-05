import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';

import { env } from '../../config/env';
import { WelcomeScreen } from '../../features/auth/screens/WelcomeScreen';
import { AdminDashboardScreen } from '../../features/admin/screens/AdminDashboardScreen';
import { TutorDashboardScreen } from '../../features/tutors/screens/TutorDashboardScreen';
import { LearnerOnboardingScreen } from '../../features/onboarding/screens/LearnerOnboardingScreen';
import { LearnerPreferencesProvider, type LearnerPreferences } from '../../features/onboarding/preferences';
import { LearnerNavigator } from './LearnerNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme/tokens';

type RootStackParamList = { Welcome: undefined; LearnerApp: undefined; TutorApp: undefined; AdminApp: undefined; SuperAdminApp: undefined };
type AppRole = 'learner' | 'tutor' | 'super_admin' | 'content_admin' | 'support_admin' | 'finance_admin' | 'moderator';
const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary },
};

export function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!env.isSupabaseConfigured);
  const [role, setRole] = useState<AppRole>('learner');
  const [preferences, setPreferences] = useState<LearnerPreferences>({ locale: 'fr', level: 'A2' });
  const [onboardingComplete, setOnboardingComplete] = useState(!env.isSupabaseConfigured);
  const [roleReady, setRoleReady] = useState(!env.isSupabaseConfigured);

  useEffect(() => {
    if (!env.isSupabaseConfigured) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole('learner'); setRoleReady(true); return; }
    setRoleReady(false);
    let active = true;
    void supabase.from('profiles').select('role,locale,level,onboarding_completed_at').eq('id', session.user.id).single().then(({ data }) => {
      if (active) {
        if (data?.role) setRole(data.role as AppRole);
        if (data?.locale && data?.level) setPreferences({ locale: data.locale as LearnerPreferences['locale'], level: data.level as LearnerPreferences['level'] });
        setOnboardingComplete(Boolean(data?.onboarding_completed_at));
        setRoleReady(true);
      }
    });
    return () => { active = false; };
  }, [session]);

  const completeOnboarding = async (nextPreferences: LearnerPreferences) => {
    if (!session) return;
    const { error } = await supabase.from('profiles').update({ ...nextPreferences, onboarding_completed_at: new Date().toISOString() }).eq('id', session.user.id);
    if (error) throw error;
    setPreferences(nextPreferences);
    setOnboardingComplete(true);
  };

  if (!ready || (session && !roleReady)) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && role === 'super_admin' ? (
          <Stack.Screen component={SuperAdminNavigator} name="SuperAdminApp" />
        ) : session && role === 'tutor' ? (
          <Stack.Screen component={TutorDashboardScreen} name="TutorApp" />
        ) : session && role !== 'learner' ? (
          <Stack.Screen component={AdminDashboardScreen} name="AdminApp" />
        ) : session && !onboardingComplete ? (
          <Stack.Screen name="LearnerApp">
            {() => <LearnerOnboardingScreen onComplete={completeOnboarding} />}
          </Stack.Screen>
        ) : session ? (
          <Stack.Screen name="LearnerApp">
            {() => <LearnerPreferencesProvider value={preferences}><LearnerNavigator /></LearnerPreferencesProvider>}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Welcome">
            {() => <WelcomeScreen onSignedIn={() => undefined} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({ loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' } });
