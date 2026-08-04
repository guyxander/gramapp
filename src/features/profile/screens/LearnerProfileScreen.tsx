import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Bell, Crown, Download, FileText, Flame, Gift, LogOut, Star, Trash2 } from 'lucide-react-native';

import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { useLearnerPreferences } from '../../onboarding/preferences';

type ProfileData = { display_name: string | null; xp: number; streak_days: number; referral_code: string | null; premium_until: string | null };
type Mastery = { topic: string; mastery_score: number };
type Report = { id: string; report_month: string; summary: { completedLessons?: number; xpEarned?: number } };
type Notification = { id: number; title: string; body: string; read_at: string | null };

const emptyProfile: ProfileData = { display_name: null, xp: 0, streak_days: 0, referral_code: null, premium_until: null };

export function LearnerProfileScreen() {
  const { level, locale } = useLearnerPreferences();
  const fr = locale === 'fr';
  const copy = fr ? {
    learner: 'Apprenant', level: 'Niveau', days: 'JOURS', plan: 'OFFRE', free: 'Gratuite', mastery: 'Maîtrise grammaticale', noMastery: 'Votre progression apparaîtra après votre première leçon.', reports: 'Rapports mensuels', noReports: 'Votre premier rapport apparaîtra après un mois d’apprentissage.', lessons: 'leçons', notifications: 'Notifications', noNotifications: 'Aucune nouvelle notification.', referralTitle: 'J’ai reçu un code de parrainage', apply: 'Appliquer', share: 'Partager mon lien de parrainage', update: 'Vérifier les mises à jour APK', checking: 'Vérification…', signOut: 'Se déconnecter', delete: 'Supprimer mon compte', unavailable: 'Indisponible', siteMissing: 'Le site officiel doit être configuré avant le partage.', shareMessage: 'Découvrez GramApp avec moi', applied: 'Code appliqué', appliedBody: 'Le bonus sera activé après votre première leçon terminée.', invalid: 'Code invalide', invalidBody: 'Vérifiez le code ou votre éligibilité.', current: 'Application à jour', currentBody: 'Vous utilisez déjà la dernière version.', updateError: 'Impossible de vérifier les mises à jour.', deleteTitle: 'Supprimer définitivement le compte ?', deleteBody: 'Les progrès et enregistrements associés seront supprimés.', cancel: 'Annuler', confirmDelete: 'Supprimer', deleteError: 'Impossible de supprimer le compte.', loadError: 'Certaines données du profil n’ont pas pu être chargées.',
  } : {
    learner: 'Learner', level: 'Level', days: 'DAYS', plan: 'PLAN', free: 'Free', mastery: 'Grammar mastery', noMastery: 'Your progress will appear after your first lesson.', reports: 'Monthly reports', noReports: 'Your first report will appear after one month of learning.', lessons: 'lessons', notifications: 'Notifications', noNotifications: 'No new notifications.', referralTitle: 'I received a referral code', apply: 'Apply', share: 'Share my referral link', update: 'Check for APK updates', checking: 'Checking…', signOut: 'Sign out', delete: 'Delete my account', unavailable: 'Unavailable', siteMissing: 'The official site must be configured before sharing.', shareMessage: 'Discover GramApp with me', applied: 'Code applied', appliedBody: 'Your bonus will activate after your first completed lesson.', invalid: 'Invalid code', invalidBody: 'Check the code or your eligibility.', current: 'App is up to date', currentBody: 'You already have the latest version.', updateError: 'Unable to check for updates.', deleteTitle: 'Permanently delete account?', deleteBody: 'Your progress and associated recordings will be deleted.', cancel: 'Cancel', confirmDelete: 'Delete', deleteError: 'Unable to delete the account.', loadError: 'Some profile data could not be loaded.',
  };
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referralInput, setReferralInput] = useState('');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!env.isSupabaseConfigured) return () => { active = false; };
    void (async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active || authError || !auth.user) return;
      const [profileResult, masteryResult, reportResult, notificationResult, referralResult] = await Promise.all([
        supabase.from('profiles').select('display_name,xp,streak_days,referral_code,premium_until').eq('id', auth.user.id).single(),
        supabase.from('grammar_mastery').select('topic,mastery_score').eq('user_id', auth.user.id).order('mastery_score', { ascending: false }),
        supabase.from('monthly_reports').select('id,report_month,summary').eq('user_id', auth.user.id).order('report_month', { ascending: false }).limit(6),
        supabase.from('in_app_notifications').select('id,title,body,read_at').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(5),
        supabase.rpc('ensure_referral_code'),
      ]);
      if (!active) return;
      const metadataName = typeof auth.user.user_metadata?.full_name === 'string' ? auth.user.user_metadata.full_name : auth.user.email?.split('@')[0] ?? null;
      if (profileResult.data) setProfile({ ...(profileResult.data as ProfileData), display_name: profileResult.data.display_name ?? metadataName, referral_code: referralResult.data ? String(referralResult.data) : profileResult.data.referral_code });
      else setProfile((current) => ({ ...current, display_name: metadataName, referral_code: referralResult.data ? String(referralResult.data) : null }));
      setMastery((masteryResult.data ?? []) as Mastery[]);
      setReports((reportResult.data ?? []) as Report[]);
      setNotifications((notificationResult.data ?? []) as Notification[]);
      setLoadError(Boolean(profileResult.error || masteryResult.error || reportResult.error || notificationResult.error || referralResult.error));
    })();
    return () => { active = false; };
  }, []);

  const shareReferral = async () => {
    if (!env.officialSiteUrl || !profile.referral_code) return Alert.alert(copy.unavailable, copy.siteMissing);
    const base = env.officialSiteUrl.replace(/\/$/, '');
    await Share.share({ message: `${copy.shareMessage}: ${base}/?ref=${encodeURIComponent(profile.referral_code)}` });
  };

  const checkUpdate = async () => {
    if (!env.isSupabaseConfigured || checkingUpdate) return;
    try {
      setCheckingUpdate(true);
      const versionCode = Constants.expoConfig?.android?.versionCode ?? 1;
      const { data, error } = await supabase.functions.invoke('app-version', { body: { versionCode } });
      if (error) throw error;
      if (data?.updateAvailable && data.release?.apk_url) await Linking.openURL(data.release.apk_url);
      else Alert.alert(copy.current, copy.currentBody);
    } catch { Alert.alert(copy.unavailable, copy.updateError); }
    finally { setCheckingUpdate(false); }
  };

  const applyReferral = async () => {
    const code = referralInput.trim();
    if (!code) return;
    const { data, error } = await supabase.rpc('register_referral', { referral_code_value: code });
    Alert.alert(data && !error ? copy.applied : copy.invalid, data && !error ? copy.appliedBody : copy.invalidBody);
    if (data) setReferralInput('');
  };

  const deleteAccount = () => Alert.alert(copy.deleteTitle, copy.deleteBody, [
    { text: copy.cancel, style: 'cancel' },
    { text: copy.confirmDelete, style: 'destructive', onPress: () => void (async () => { const { error } = await supabase.functions.invoke('delete-account', { body: { confirmation: 'DELETE' } }); if (error) Alert.alert(copy.unavailable, copy.deleteError); else await supabase.auth.signOut(); })() },
  ]);

  const name = profile.display_name ?? copy.learner;
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View><Text style={styles.name}>{name}</Text><Text style={styles.level}>{copy.level} {level}</Text></View>
    {loadError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{copy.loadError}</Text> : null}
    <View style={styles.stats}><Metric icon={<Star color={colors.xp} fill={colors.xp} size={23} />} label="XP" value={profile.xp.toLocaleString(fr ? 'fr-FR' : 'en')} /><Metric icon={<Flame color={colors.streak} size={23} />} label={copy.days} value={String(profile.streak_days)} /><Metric icon={<Crown color={colors.premium} size={23} />} label={copy.plan} value={profile.premium_until ? 'Premium' : copy.free} /></View>
    <SectionTitle title={copy.mastery} /><View style={styles.card}>{mastery.length ? mastery.map((item) => <View key={item.topic} style={styles.masteryRow}><Text style={styles.masteryTopic}>{item.topic}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, Number(item.mastery_score))}%` }]} /></View><Text style={styles.score}>{Math.round(Number(item.mastery_score))}%</Text></View>) : <Text style={styles.empty}>{copy.noMastery}</Text>}</View>
    <SectionTitle title={copy.reports} /><View style={styles.card}>{reports.length ? reports.map((report) => <View key={report.id} style={styles.listRow}><FileText color={colors.primary} size={22} /><View style={styles.listCopy}><Text style={styles.listTitle}>{report.report_month}</Text><Text style={styles.listBody}>{report.summary.completedLessons ?? 0} {copy.lessons} • {report.summary.xpEarned ?? 0} XP</Text></View></View>) : <Text style={styles.empty}>{copy.noReports}</Text>}</View>
    <SectionTitle title={copy.notifications} /><View style={styles.card}>{notifications.length ? notifications.map((item) => <View key={item.id} style={styles.listRow}><Bell color={item.read_at ? colors.textMuted : colors.primary} size={21} /><View style={styles.listCopy}><Text style={styles.listTitle}>{item.title}</Text><Text style={styles.listBody}>{item.body}</Text></View></View>) : <Text style={styles.empty}>{copy.noNotifications}</Text>}</View>
    <View style={styles.actions}><View style={styles.referralBox}><Text style={styles.listTitle}>{copy.referralTitle}</Text><TextInput accessibilityLabel={copy.referralTitle} autoCapitalize="characters" onChangeText={setReferralInput} placeholder="CODE" style={styles.input} value={referralInput} /><Pressable accessibilityRole="button" disabled={!referralInput.trim()} onPress={() => void applyReferral()} style={[styles.smallButton, !referralInput.trim() && styles.disabled]}><Text style={styles.smallButtonText}>{copy.apply}</Text></Pressable></View><Action icon={<Gift color={colors.success} size={22} />} label={copy.share} onPress={() => void shareReferral()} /><Action disabled={checkingUpdate} icon={<Download color={colors.primary} size={22} />} label={checkingUpdate ? copy.checking : copy.update} onPress={() => void checkUpdate()} /><Action icon={<LogOut color={colors.textMuted} size={22} />} label={copy.signOut} onPress={() => void supabase.auth.signOut()} /><Action icon={<Trash2 color={colors.error} size={22} />} label={copy.delete} onPress={deleteAccount} /></View>
  </ScrollView></SafeAreaView>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <View style={styles.metric}>{icon}<Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }
function Action({ disabled = false, icon, label, onPress }: { disabled?: boolean; icon: ReactNode; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.disabled]}>{icon}<Text style={styles.actionText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 }, identity: { alignItems: 'center', gap: spacing.xs }, avatar: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 82, justifyContent: 'center', width: 82 }, avatarText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 34 }, name: { color: colors.text, fontFamily: fonts.bold, fontSize: 27 }, level: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 14 }, error: { color: colors.error, fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' }, stats: { flexDirection: 'row', gap: spacing.sm }, metric: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: spacing.xs, padding: spacing.md }, metricValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 }, metricLabel: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 0.7 }, sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 21, marginTop: spacing.sm }, card: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg }, masteryRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, masteryTopic: { color: colors.text, fontFamily: fonts.medium, fontSize: 12, width: 105 }, track: { backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, flex: 1, height: 9, overflow: 'hidden' }, fill: { backgroundColor: colors.primary, borderRadius: radius.pill, height: '100%' }, score: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, width: 34 }, listRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md }, listCopy: { flex: 1, gap: 2 }, listTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 }, listBody: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 }, empty: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }, actions: { gap: spacing.md }, action: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 58, paddingHorizontal: spacing.lg }, actionText: { color: colors.text, flex: 1, fontFamily: fonts.semibold, fontSize: 14 }, referralBox: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg }, input: { borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 46, paddingHorizontal: spacing.md }, smallButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, justifyContent: 'center', minHeight: 44 }, smallButtonText: { color: colors.onPrimary, fontFamily: fonts.semibold }, disabled: { opacity: 0.45 },
});
