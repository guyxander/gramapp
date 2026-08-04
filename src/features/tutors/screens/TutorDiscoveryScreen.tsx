import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, UserRoundCheck } from 'lucide-react-native';

import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Tutor = { user_id: string; display_name: string; headline: string; specialties: string[]; rating: number; learner_count: number };
const previewTutors: Tutor[] = [
  { user_id: 'preview-sarah', display_name: 'Sarah Jenkins', headline: 'Spécialiste Business English', specialties: ['Business', 'Conversation'], rating: 4.9, learner_count: 2400 },
  { user_id: 'preview-david', display_name: 'David Miller', headline: 'Préparation IELTS & TOEFL', specialties: ['Examens', 'Grammaire'], rating: 4.8, learner_count: 1800 },
];

export function TutorDiscoveryScreen() {
  const [tutors, setTutors] = useState<Tutor[]>(previewTutors);
  const [followed, setFollowed] = useState<string | null>(null);
  const [subject, setSubject] = useState('Question sur ma leçon');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!env.isSupabaseConfigured) return;
    void supabase.from('tutor_profiles').select('user_id,display_name,headline,specialties,rating,learner_count')
      .eq('verified', true).eq('accepting_learners', true).order('rating', { ascending: false })
      .then(({ data }) => { if (data?.length) setTutors(data as Tutor[]); });
    void supabase.from('tutor_follows').select('tutor_id').maybeSingle().then(({ data }) => setFollowed(data?.tutor_id ?? null));
  }, []);

  const follow = async (tutorId: string) => {
    if (!env.isSupabaseConfigured || tutorId.startsWith('preview-')) { setFollowed(tutorId); return; }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from('tutor_follows').upsert({ learner_id: user.user.id, tutor_id: tutorId });
    setFollowed(tutorId);
  };

  const requestHelp = async () => {
    if (!followed || followed.startsWith('preview-') || !message.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from('assistance_requests').insert({ learner_id: auth.user.id, tutor_id: followed, subject: subject.trim(), body: message.trim() });
    if (error) Alert.alert('Envoi impossible', error.message);
    else { setMessage(''); Alert.alert('Demande envoyée', 'Votre tuteur peut maintenant vous répondre dans cet espace.'); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ACCOMPAGNEMENT HUMAIN</Text>
        <Text style={styles.title}>Découvrez votre tuteur</Text>
        <Text style={styles.subtitle}>Vous pouvez suivre un seul tuteur à la fois.</Text>
        {tutors.map((tutor) => (
          <View key={tutor.user_id} style={styles.card}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{tutor.display_name.slice(0, 1)}</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.name}>{tutor.display_name}</Text>
              <Text style={styles.headline}>{tutor.headline}</Text>
              <View style={styles.meta}><Star color={colors.xp} fill={colors.xp} size={16} /><Text style={styles.metaText}>{tutor.rating} • {tutor.learner_count.toLocaleString('fr-FR')} apprenants</Text></View>
              <Text style={styles.specialties}>{tutor.specialties.join(' • ')}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => void follow(tutor.user_id)} style={[styles.follow, followed === tutor.user_id && styles.followed]}>
              <UserRoundCheck color={followed === tutor.user_id ? colors.success : colors.onPrimary} size={20} />
              <Text style={[styles.followText, followed === tutor.user_id && styles.followedText]}>{followed === tutor.user_id ? 'Suivi' : 'Suivre'}</Text>
            </Pressable>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Demander de l’aide</Text>
        <View style={styles.helpCard}>
          <TextInput accessibilityLabel="Sujet" onChangeText={setSubject} placeholder="Sujet" style={styles.input} value={subject} />
          <TextInput accessibilityLabel="Message" multiline onChangeText={setMessage} placeholder="Expliquez ce qui vous bloque…" style={[styles.input, styles.messageInput]} value={message} />
          <Pressable accessibilityRole="button" disabled={!followed || !message.trim()} onPress={() => void requestHelp()} style={styles.send}><Text style={styles.sendText}>Envoyer au tuteur</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 110 },
  eyebrow: { color: colors.success, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 30 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 15 },
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg },
  avatar: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, height: 58, justifyContent: 'center', width: 58 },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 24 },
  cardCopy: { flex: 1, gap: spacing.xs, minWidth: 190 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 19 },
  headline: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: 14 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  metaText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
  specialties: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12 },
  follow: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.lg, width: '100%' },
  followed: { backgroundColor: colors.successSoft },
  followText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 14 },
  followedText: { color: colors.success },
  sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, marginTop: spacing.md }, helpCard: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg }, input: { borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontFamily: fonts.regular, minHeight: 48, padding: spacing.md }, messageInput: { minHeight: 110, textAlignVertical: 'top' }, send: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, justifyContent: 'center', minHeight: 48 }, sendText: { color: colors.onPrimary, fontFamily: fonts.semibold },
});
