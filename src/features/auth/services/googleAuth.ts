import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { env } from '../../../config/env';
import { supabase } from '../../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  if (!env.isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Add the public project URL and publishable key.');
  }

  const redirectTo = makeRedirectUri({ scheme: 'grammardiscovery', path: 'auth/callback' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in could not be started.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return null;

  const callbackUrl = new URL(result.url.replace('#', '?'));
  const errorCode = callbackUrl.searchParams.get('error_description') ?? callbackUrl.searchParams.get('error');
  if (errorCode) throw new Error(errorCode);

  const accessToken = callbackUrl.searchParams.get('access_token');
  const refreshToken = callbackUrl.searchParams.get('refresh_token');

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    throw new Error('Google sign-in returned an invalid session.');
  }

  const sessionResult = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionResult.error) throw sessionResult.error;
  return sessionResult.data.session;
}
