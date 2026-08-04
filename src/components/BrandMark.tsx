import { StyleSheet, Text, View } from 'react-native';
import { BookOpenCheck } from 'lucide-react-native';

import { colors, fonts, radius } from '../theme/tokens';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, compact && styles.iconCompact]}>
        <BookOpenCheck color={colors.onPrimary} size={compact ? 20 : 25} strokeWidth={2.4} />
      </View>
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>
        Gram<Text style={styles.wordmarkAccent}>App</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  iconCompact: { borderRadius: 10, height: 36, width: 36 },
  wordmark: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 23, letterSpacing: -0.7 },
  wordmarkAccent: { color: colors.success },
  wordmarkCompact: { fontSize: 19 },
});
