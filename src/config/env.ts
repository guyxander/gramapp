const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const officialSiteUrl = process.env.EXPO_PUBLIC_OFFICIAL_SITE_URL?.trim() ?? '';

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  officialSiteUrl,
  isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
} as const;
