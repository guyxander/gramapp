import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShieldCheck, UsersRound } from 'lucide-react-native';

import { AdminDashboardScreen } from '../../features/admin/screens/AdminDashboardScreen';
import { TutorDashboardScreen } from '../../features/tutors/screens/TutorDashboardScreen';
import { colors, fonts } from '../../theme/tokens';

type SuperAdminTabParamList = { Admin: undefined; Tutor: undefined };
const Tabs = createBottomTabNavigator<SuperAdminTabParamList>();

export function SuperAdminNavigator() {
  return <Tabs.Navigator screenOptions={{
    headerShown: false,
    tabBarActiveBackgroundColor: colors.primarySoft,
    tabBarActiveTintColor: colors.primaryDark,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarItemStyle: { borderRadius: 24, marginVertical: 8 },
    tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
    tabBarStyle: { backgroundColor: colors.surfaceMuted, borderTopWidth: 0, height: 76, paddingHorizontal: 12 },
  }}>
    <Tabs.Screen component={AdminDashboardScreen} name="Admin" options={{ tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} />, title: 'Admin' }} />
    <Tabs.Screen component={TutorDashboardScreen} name="Tutor" options={{ tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />, title: 'Tutor' }} />
  </Tabs.Navigator>;
}
