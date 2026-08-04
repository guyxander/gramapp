import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Bell, Crown, Download, FileText, Flame, Gift, LogOut, Star, Trash2 } from 'lucide-react-native';

import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type ProfileData = { display_name: string | null; level: string; xp: number; streak_days: number; referral_code: string | null; premium_until: string | null };
type Mastery = { topic: string; mastery_score: number };
type Report = { id: string; report_month: string; summary: { completedLessons?: number; xpEarned?: number } };
type Notification = { id: number; title: string; body: string; read_at: string | null };

const previewProfile: ProfileData = { display_name: 'Apprenant', level: 'A2', xp: 1250, streak_days: 5, referral_code: 'DISCOVER10', premium_until: null };
const previewMastery: Mastery[] = [{ topic: 'Présent continu', mastery_score: 82 }, { topic: 'Passé', mastery_score: 58 }, { topic: 'Prépositions', mastery_score: 34 }];

export function LearnerProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>(previewProfile);
  const [mastery, setMastery] = useState<Mastery[]>(previewMastery);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referralInput, setReferralInput] = useState('');

  useEffect(() => {
    if (!env.isSupabaseConfigured) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const [profileResult, masteryResult, reportResult, notificationResult] = await Promise.all([
        supabase.from('profiles').select('display_name,level,xp,streak_days,referral_code,premium_until').eq('id', data.user.id).single(),
        supabase.from('grammar_mastery').select('topic,mastery_score').eq('user_id', data.user.id).order('mastery_score', { ascending: false }),
        supabase.from('monthly_reports').select('id,report_month,summary').eq('user_id', data.user.id).order('report_month', { ascending: false }).limit(6),
        supabase.from('in_app_notifications').select('id,title,body,read_at').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      if (profileResult.data) setProfile(profileResult.data as ProfileData);
      if (masteryResult.data?.length) setMastery(masteryResult.data as Mastery[]);
      if (reportResult.data) setReports(reportResult.data as Report[]);
      if (notificationResult.data) setNotifications(notificationResult.data as Notification[]);
      const { data: referralCode } = await supabase.rpc('ensure_referral_code');
      if (referralCode) setProfile((current) => ({ ...current, referral_code: String(referralCode) }));
    });
  }, []);

  const shareReferral = async () => {
    if (!env.officialSiteUrl) {
      Alert.alert('Lien indisponible', 'Le site officiel doit être configuré avant le partage.');
      return;
    }
    const base = env.officialSiteUrl;
    await Share.share({ message: `Découvrez Grammar Discovery avec moi : ${base}/r/${profile.referral_code ?? ''}` });
  };

  const startCheckout = async () => {
    if (!env.isSupabaseConfigured) return;
    const { data, error } = await supabase.functions.invoke('paystack-checkout', { body: { planId: 'premium-monthly' } });
    if (!error && data?.authorizationUrl) await Linking.openURL(data.authorizationUrl);
  };

  const checkUpdate = async () => {
    if (!env.isSupabaseConfigured) return;
    const versionCode = Constants.expoConfig?.android?.versionCode ?? 1;
    const { data, error } = await supabase.functions.invoke('app-version', { body: { versionCode } });
    if (!error && data?.updateAvailable && data.release?.apk_url) await Linking.openURL(data.release.apk_url);
  };

  const applyReferral = async () => {
    const { data, error } = await supabase.rpc('register_referral', { referral_code_value: referralInput.trim() });
    Alert.alert(data && !error ? 'Code appliqué' : 'Code invalide', data && !error ? 'Le bonus sera activé après votre première leçon terminée.' : 'Vérifiez le code ou votre éligibilité.');
    if (data) setReferralInput('');
  };

  const deleteAccount = () => Alert.alert('Supprimer définitivement le compte ?', 'Les progrès et enregistrements associés seront supprimés.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: () => void supabase.functions.invoke('delete-account', { body: { confirmation: 'DELETE' } }).then(() => supabase.auth.signOut()) },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(profile.display_name ?? 'A').slice(0, 1)}</Text></View>
          <Text style={styles.name}>{profile.display_name ?? 'Apprenant'}</Text>
          <Text style={styles.level}>Niveau {profile.level}</Text>
        </View>
        <View style={styles.stats}>
          <Metric icon={<Star color={colors.xp} fill={colors.xp} size={23} />} label="XP" value={profile.xp.toLocaleString('fr-FR')} />
          <Metric icon={<Flame color={colors.streak} size={23} />} label="JOURS" value={String(profile.streak_days)} />
          <Metric icon={<Crown color={colors.premium} size={23} />} label="OFFRE" value={profile.premium_until ? 'Premium' : 'Gratuite'} />
        </View>

        <SectionTitle title="Maîtrise grammaticale" />
        <View style={styles.card}>{mastery.map((item) => <View key={item.topic} style={styles.masteryRow}><Text style={styles.masteryTopic}>{item.topic}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, Number(item.mastery_score))}%` }]} /></View><Text style={styles.score}>{Math.round(Number(item.mastery_score))}%</Text></View>)}</View>

        <SectionTitle title="Rapports mensuels" />
        <View style={styles.card}>{reports.length ? reports.map((report) => <View key={report.id} style={styles.listRow}><FileText color={colors.primary} size={22} /><View style={styles.listCopy}><Text style={styles.listTitle}>{report.report_month}</Text><Text style={styles.listBody}>{report.summary.completedLessons ?? 0} leçons • {report.summary.xpEarned ?? 0} XP</Text></View></View>) : <Text style={styles.empty}>Votre premier rapport apparaîtra après un mois d’apprentissage.</Text>}</View>

        <SectionTitle title="Notifications" />
        <View style={styles.card}>{notifications.length ? notifications.map((item) => <View key={item.id} style={styles.listRow}><Bell color={item.read_at ? colors.textMuted : colors.primary} size={21} /><View style={styles.listCopy}><Text style={styles.listTitle}>{item.title}</Text><Text style={styles.listBody}>{item.body}</Text></View></View>) : <Text style={styles.empty}>Aucune nouvelle notification.</Text>}</View>

        <View style={styles.actions}>
          <View style={styles.referralBox}><Text style={styles.listTitle}>J’ai reçu un code de parrainage</Text><TextInput autoCapitalize="characters" onChangeText={setReferralInput} placeholder="CODE" style={styles.input} value={referralInput} /><Pressable accessibilityRole="button" onPress={() => void applyReferral()} style={styles.smallButton}><Text style={styles.smallButtonText}>Appliquer</Text></Pressable></View>
          <Action icon={<Gift color={colors.success} size={22} />} label="Partager mon lien de parrainage" onPress={() => void shareReferral()} />
          <Action icon={<Crown color={colors.premium} size={22} />} label="Passer à Premium avec Paystack" onPress={() => void startCheckout()} />
          <Action icon={<Download color={colors.primary} size={22} />} label="Vérifier les mises à jour APK" onPress={() => void checkUpdate()} />
          <Action icon={<LogOut color={colors.textMuted} size={22} />} label="Se déconnecter" onPress={() => void supabase.auth.signOut()} />
          <Action icon={<Trash2 color={colors.error} size={22} />} label="Supprimer mon compte" onPress={deleteAccount} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <View style={styles.metric}>{icon}<Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }
function Action({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>{icon}<Text style={styles.actionText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  identity: { alignItems: 'center', gap: spacing.xs }, avatar: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 82, justifyContent: 'center', width: 82 }, avatarText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 34 }, name: { color: colors.text, fontFamily: fonts.bold, fontSize: 27 }, level: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 14 },
  stats: { flexDirection: 'row', gap: spacing.sm }, metric: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: spacing.xs, padding: spacing.md }, metricValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 }, metricLabel: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 0.7 },
  sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 21, marginTop: spacing.sm }, card: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  masteryRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, masteryTopic: { color: colors.text, fontFamily: fonts.medium, fontSize: 12, width: 105 }, track: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, flex: 1, height: 9, overflow: 'hidden' }, fill: { backgroundColor: colors.primary, borderRadius: radius.pill, height: '100%' }, score: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, width: 34 },
  listRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md }, listCopy: { flex: 1, gap: 2 }, listTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 }, listBody: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 }, empty: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  actions: { gap: spacing.md }, action: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 58, paddingHorizontal: spacing.lg }, actionText: { color: colors.text, flex: 1, fontFamily: fonts.semibold, fontSize: 14 }, referralBox: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg }, input: { borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 46, paddingHorizontal: spacing.md }, smallButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, justifyContent: 'center', minHeight: 44 }, smallButtonText: { color: colors.onPrimary, fontFamily: fonts.semibold },
});
