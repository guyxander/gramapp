import 'react-native-url-polyfill/auto';

import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

import { env } from '../config/env';

const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderKey = 'sb_publishable_placeholder';

export const supabase = createClient(
  env.supabaseUrl || placeholderUrl,
  env.supabasePublishableKey || placeholderKey,
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      detectSessionInUrl: false,
      lock: processLock,
      persistSession: true,
    },
  },
);

if (Platform.OS !== 'web' && env.isSupabaseConfigured) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
