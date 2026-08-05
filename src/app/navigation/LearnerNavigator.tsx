import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookOpenCheck, Mic2, UserRound, UsersRound } from 'lucide-react-native';

import { LearnerDashboardScreen } from '../../features/dashboard/screens/LearnerDashboardScreen';
import { LessonDiscoveryScreen } from '../../features/lessons/screens/LessonDiscoveryScreen';
import { LearnerProfileScreen } from '../../features/profile/screens/LearnerProfileScreen';
import { AdminDashboardScreen } from '../../features/admin/screens/AdminDashboardScreen';
import { TutorDashboardScreen } from '../../features/tutors/screens/TutorDashboardScreen';
import { SpeakingPracticeScreen } from '../../features/speaking/screens/SpeakingPracticeScreen';
import { TutorDiscoveryScreen } from '../../features/tutors/screens/TutorDiscoveryScreen';
import { SubscriptionScreen } from '../../features/subscription/screens/SubscriptionScreen';
import { useLearnerPreferences } from '../../features/onboarding/preferences';
import { colors, fonts } from '../../theme/tokens';

export type LearnerStackParamList = { LearnerTabs: undefined; LessonDiscovery: { dayIndex: number }; Subscription: undefined; AdminDashboard: undefined; TutorDashboard: undefined };
export type LearnerTabParamList = { Learn: undefined; Practice: undefined; Tutors: undefined; Profile: undefined };

const Stack = createNativeStackNavigator<LearnerStackParamList>();
const Tabs = createBottomTabNavigator<LearnerTabParamList>();

type StaffAccess = { canAccessAdmin: boolean; canAccessTutor: boolean };

function LearnerTabs({ canAccessAdmin, canAccessTutor }: StaffAccess) {
  const { locale } = useLearnerPreferences();
  const labels = locale === 'fr'
    ? { learn: 'Apprendre', practice: 'Pratique', tutors: 'Tuteurs', profile: 'Profil' }
    : { learn: 'Learn', practice: 'Practice', tutors: 'Tutors', profile: 'Profile' };
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: colors.successSoft,
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: { borderRadius: 24, marginVertical: 8 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surfaceMuted, borderTopWidth: 0, height: 76, paddingHorizontal: 8 },
      }}
    >
      <Tabs.Screen
        component={LearnerDashboardScreen}
        name="Learn"
        options={{ tabBarIcon: ({ color, size }) => <BookOpenCheck color={color} size={size} />, title: labels.learn }}
      />
      <Tabs.Screen
        component={SpeakingPracticeScreen}
        name="Practice"
        options={{ tabBarIcon: ({ color, size }) => <Mic2 color={color} size={size} />, title: labels.practice }}
      />
      <Tabs.Screen
        component={TutorDiscoveryScreen}
        name="Tutors"
        options={{ tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />, title: labels.tutors }}
      />
      <Tabs.Screen
        name="Profile"
        options={{ tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />, title: labels.profile }}
      >
        {() => <LearnerProfileScreen canAccessAdmin={canAccessAdmin} canAccessTutor={canAccessTutor} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export function LearnerNavigator({ canAccessAdmin, canAccessTutor }: StaffAccess) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnerTabs">{() => <LearnerTabs canAccessAdmin={canAccessAdmin} canAccessTutor={canAccessTutor} />}</Stack.Screen>
      <Stack.Screen component={LessonDiscoveryScreen} name="LessonDiscovery" />
      <Stack.Screen component={SubscriptionScreen} name="Subscription" />
      {canAccessAdmin ? <Stack.Screen component={AdminDashboardScreen} name="AdminDashboard" options={{ headerShown: true, title: 'Admin dashboard' }} /> : null}
      {canAccessTutor ? <Stack.Screen component={TutorDashboardScreen} name="TutorDashboard" options={{ headerShown: true, title: 'Tutor dashboard' }} /> : null}
    </Stack.Navigator>
  );
}
