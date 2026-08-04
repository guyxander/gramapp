import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpenCheck, Crown, ShieldAlert, UsersRound } from 'lucide-react-native';

import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Flag = { key: string; enabled: boolean };
type Moderation = { id: string; risk: string; reason_code: string; confidence: number };

export function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [moderation, setModeration] = useState<Moderation[]>([]);
  const [counts, setCounts] = useState({ lessons: 0, subscriptions: 0, moderation: 0 });

  useEffect(() => {
    void Promise.all([
      supabase.from('feature_flags').select('key,enabled').order('key'),
      supabase.from('moderation_flags').select('id,risk,reason_code,confidence').eq('status', 'open').order('created_at', { ascending: false }).limit(20),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]).then(([flagResult, moderationResult, lessonResult, subscriptionResult]) => {
      setFlags((flagResult.data ?? []) as Flag[]); setModeration((moderationResult.data ?? []) as Moderation[]);
      setCounts({ lessons: lessonResult.count ?? 0, subscriptions: subscriptionResult.count ?? 0, moderation: moderationResult.data?.length ?? 0 });
    });
  }, []);

  const toggleFlag = async (flag: Flag) => {
    const enabled = !flag.enabled;
    const { error } = await supabase.from('feature_flags').update({ enabled }).eq('key', flag.key);
    if (!error) setFlags((current) => current.map((item) => item.key === flag.key ? { ...item, enabled } : item));
  };

  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={[styles.content, width > 900 && styles.contentWide]}>
      <Text style={styles.eyebrow}>ADMIN SYSTEM</Text><Text style={styles.title}>Vue d’ensemble</Text>
      <View style={styles.metrics}><Metric icon={<BookOpenCheck color={colors.discovery} size={25} />} label="Leçons" value={counts.lessons} /><Metric icon={<Crown color={colors.premium} size={25} />} label="Premium" value={counts.subscriptions} /><Metric icon={<ShieldAlert color={colors.error} size={25} />} label="À modérer" value={counts.moderation} /><Metric icon={<UsersRound color={colors.primary} size={25} />} label="Rôles" value={7} /></View>
      <View style={styles.columns}>
        <View style={styles.panel}><Text style={styles.panelTitle}>Modération contact hors plateforme</Text>{moderation.length ? moderation.map((item) => <View key={item.id} style={styles.moderationRow}><View style={styles.risk}><Text style={styles.riskText}>{item.risk.toUpperCase()}</Text></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.reason_code}</Text><Text style={styles.rowBody}>Confiance {Math.round(item.confidence * 100)}%</Text></View></View>) : <Text style={styles.empty}>La file est vide.</Text>}</View>
        <View style={styles.panel}><Text style={styles.panelTitle}>Feature flags</Text>{flags.map((flag) => <View key={flag.key} style={styles.flagRow}><Text style={styles.flagText}>{flag.key}</Text><Switch onValueChange={() => void toggleFlag(flag)} value={flag.enabled} /></View>)}</View>
      </View>
    </ScrollView></SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) { return <View style={styles.metric}>{icon}<Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({ safeArea: { backgroundColor: colors.background, flex: 1 }, content: { alignSelf: 'center', gap: spacing.xl, maxWidth: 1180, padding: spacing.xl, width: '100%' }, contentWide: { padding: spacing.section }, eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 34 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, metric: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexGrow: 1, gap: spacing.xs, minWidth: 170, padding: spacing.lg }, metricValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 28 }, metricLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12 }, columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }, panel: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexGrow: 1, gap: spacing.md, minWidth: 300, padding: spacing.lg }, panelTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 }, moderationRow: { alignItems: 'center', borderTopColor: colors.outline, borderTopWidth: 1, flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md }, risk: { backgroundColor: '#FFF1F0', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }, riskText: { color: colors.error, fontFamily: fonts.bold, fontSize: 10 }, rowCopy: { flex: 1 }, rowTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 }, rowBody: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 }, flagRow: { alignItems: 'center', borderTopColor: colors.outline, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm }, flagText: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 }, empty: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14 } });
