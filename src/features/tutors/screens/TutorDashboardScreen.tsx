import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquareText, UsersRound } from 'lucide-react-native';

import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';

type Follow = { learner_id: string; followed_at: string };
type Request = { id: string; learner_id: string; subject: string; body: string; status: string };

export function TutorDashboardScreen() {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');

  const load = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const [followResult, requestResult] = await Promise.all([
      supabase.from('tutor_follows').select('learner_id,followed_at').eq('tutor_id', user.user.id),
      supabase.from('assistance_requests').select('id,learner_id,subject,body,status').eq('tutor_id', user.user.id).order('created_at', { ascending: false }),
    ]);
    setFollowers((followResult.data ?? []) as Follow[]);
    setRequests((requestResult.data ?? []) as Request[]);
  };

  useEffect(() => { void load(); }, []);

  const addComment = async () => {
    if (!followers[0] || !comment.trim()) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from('tutor_comments').insert({ learner_id: followers[0].learner_id, tutor_id: user.user.id, body: comment.trim() });
    setComment('');
  };

  const replyToRequest = async (request: Request) => {
    if (!reply.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: message } = await supabase.from('conversation_messages').insert({ request_id: request.id, sender_id: auth.user.id, body: reply.trim() }).select('id').single();
    if (message) await supabase.functions.invoke('moderation-score', { body: { messageId: message.id, text: reply.trim() } });
    await supabase.from('assistance_requests').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', request.id);
    setReply('');
    await load();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ESPACE TUTEUR</Text><Text style={styles.title}>Vos apprenants</Text>
        <View style={styles.metrics}><Metric icon={<UsersRound color={colors.primary} size={24} />} label="Abonnés" value={followers.length} /><Metric icon={<MessageSquareText color={colors.discovery} size={24} />} label="Demandes ouvertes" value={requests.filter((item) => item.status === 'open').length} /></View>
        <Text style={styles.sectionTitle}>Demandes d’assistance</Text>
        {requests.length ? requests.map((request) => <View key={request.id} style={styles.card}><Text style={styles.cardTitle}>{request.subject}</Text><Text style={styles.cardBody}>{request.body}</Text><Text style={styles.status}>{request.status.toUpperCase()}</Text><TextInput multiline onChangeText={setReply} placeholder="Votre réponse…" style={styles.input} value={reply} /><Pressable accessibilityRole="button" onPress={() => void replyToRequest(request)} style={styles.button}><Text style={styles.buttonText}>Répondre</Text></Pressable></View>) : <View style={styles.card}><Text style={styles.cardBody}>Aucune demande en attente.</Text></View>}
        <Text style={styles.sectionTitle}>Commentaire de progression</Text>
        <View style={styles.card}><TextInput multiline onChangeText={setComment} placeholder="Ajoutez un commentaire au premier apprenant suivi…" style={styles.input} value={comment} /><Pressable accessibilityRole="button" onPress={() => void addComment()} style={styles.button}><Text style={styles.buttonText}>Enregistrer le commentaire</Text></Pressable></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) { return <View style={styles.metric}>{icon}<Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, content: { gap: spacing.lg, padding: spacing.xl }, eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 32 }, metrics: { flexDirection: 'row', gap: spacing.md }, metric: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: spacing.xs, padding: spacing.lg }, metricValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 27 }, metricLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12, textAlign: 'center' }, sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 21 }, card: { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg }, cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 }, cardBody: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 }, status: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 11 }, input: { borderColor: colors.outline, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontFamily: fonts.regular, minHeight: 110, padding: spacing.md, textAlignVertical: 'top' }, button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, minHeight: 50, justifyContent: 'center' }, buttonText: { color: colors.onPrimary, fontFamily: fonts.semibold },
});
