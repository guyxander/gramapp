import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Props = { icon: ReactNode; value: string; label: string; tint?: string };

export function StatCard({ icon, value, label, tint = colors.surface }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: tint }]}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: spacing.sm, minHeight: 156, padding: spacing.xl },
  value: { color: colors.text, fontFamily: fonts.bold, fontSize: 29 },
  label: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.7 },
});
