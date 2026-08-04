import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';

import { colors, fonts, radius, spacing } from '../theme/tokens';

type Props = { description: string; icon: LucideIcon; title: string };

export function ComingSoonScreen({ description, icon: Icon, title }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.icon}><Icon color={colors.primary} size={42} /></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { alignItems: 'center', flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.xxl },
  icon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 88, justifyContent: 'center', width: 88 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 28, textAlign: 'center' },
  description: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, maxWidth: 320, textAlign: 'center' },
});
