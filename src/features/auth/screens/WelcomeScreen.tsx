import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Search, Sparkles } from 'lucide-react-native';

import { BrandMark } from '../../../components/BrandMark';
import { colors, fonts, radius, spacing } from '../../../theme/tokens';
import { signInWithGoogle } from '../services/googleAuth';
import { env } from '../../../config/env';

type Props = { onSignedIn: () => void };

export function WelcomeScreen({ onSignedIn }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const session = await signInWithGoogle();
      if (session) onSignedIn();
    } catch (error) {
      Alert.alert('Connexion indisponible', error instanceof Error ? error.message : 'Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const openLegalPage = async (page: 'terms' | 'privacy') => {
    const base = env.officialSiteUrl.replace(/\/$/, '');
    if (!base) return Alert.alert('Lien indisponible', 'Le site officiel n’est pas configuré.');
    try { await Linking.openURL(`${base}/${page}`); }
    catch { Alert.alert('Lien indisponible', 'Impossible d’ouvrir cette page pour le moment.'); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BrandMark />

        <View style={styles.visual}>
          <View style={[styles.orbit, styles.orbitLarge]} />
          <View style={[styles.orbit, styles.orbitSmall]} />
          <View style={styles.visualCenter}>
            <Compass color={colors.primary} size={50} strokeWidth={1.8} />
          </View>
          <View style={[styles.floatingIcon, styles.searchIcon]}>
            <Search color={colors.discovery} size={24} />
          </View>
          <View style={[styles.floatingIcon, styles.sparkleIcon]}>
            <Sparkles color={colors.success} size={24} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>L'ANGLAIS PAR LA DÉCOUVERTE</Text>
          <Text style={styles.title}>Observez. Comprenez. Maîtrisez.</Text>
          <Text style={styles.subtitle}>
            Découvrez la grammaire anglaise à partir de situations réelles, avec un accompagnement IA adapté à votre niveau.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [styles.googleButton, (pressed || loading) && styles.buttonPressed]}
          >
            <View style={styles.googleBadge}><Text style={styles.googleLetter}>G</Text></View>
            <Text style={styles.googleButtonText}>{loading ? 'Connexion…' : 'Continuer avec Google'}</Text>
          </Pressable>
          <Text style={styles.legal}>En continuant, vous acceptez nos{' '}<Text accessibilityRole="link" onPress={() => void openLegalPage('terms')} style={styles.legalLink}>Conditions d'utilisation</Text>{' '}et notre{' '}<Text accessibilityRole="link" onPress={() => void openLegalPage('privacy')} style={styles.legalLink}>Politique de confidentialité</Text>.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xxl, paddingVertical: spacing.xl },
  visual: { alignItems: 'center', height: 255, justifyContent: 'center', marginTop: spacing.md },
  orbit: { borderColor: colors.primarySoft, borderRadius: radius.pill, borderWidth: 1, position: 'absolute' },
  orbitLarge: { height: 240, width: 240 },
  orbitSmall: { backgroundColor: colors.primarySoft, height: 170, opacity: 0.55, width: 170 },
  visualCenter: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, elevation: 4, height: 112, justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.14, shadowRadius: 18, width: 112 },
  floatingIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, elevation: 3, height: 52, justifyContent: 'center', position: 'absolute', width: 52 },
  searchIcon: { left: '13%', top: 48 },
  sparkleIcon: { bottom: 30, right: '13%' },
  copy: { gap: spacing.md },
  eyebrow: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.1, textAlign: 'center' },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1.1, lineHeight: 41, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  actions: { gap: spacing.lg },
  googleButton: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.md, justifyContent: 'center', minHeight: 56, paddingHorizontal: spacing.xl },
  buttonPressed: { opacity: 0.75 },
  googleBadge: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 27, justifyContent: 'center', width: 27 },
  googleLetter: { color: '#4285F4', fontFamily: fonts.bold, fontSize: 17 },
  googleButtonText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 16 },
  legal: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, paddingHorizontal: spacing.sm, textAlign: 'center' },
  legalLink: { color: colors.primaryDark, fontFamily: fonts.semibold, textDecorationLine: 'underline' },
});
