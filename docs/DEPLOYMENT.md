# Deployment runbook

1. Create the hosted Supabase project and enable Google as the only sign-in provider.
2. Set the app redirect URI `grammardiscovery://auth/callback` in Supabase and Google OAuth.
3. Run `npx supabase link --project-ref <ref>` then `npx supabase db push --include-seed`.
4. Set Edge Function secrets: `OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`, `PAYSTACK_SECRET_KEY`, and `OFFICIAL_SITE_URL`.
5. Deploy every function in `supabase/functions`; schedule `referral-qualify` daily and `monthly-reports` monthly using Supabase Cron with a secret authorization header.
6. Register the Paystack webhook at `/functions/v1/paystack-webhook` and verify live-mode payments in a non-production account first.
7. Copy `.env.example` to `.env.local`, add the hosted URL/publishable key/site URL, and run `npm run release:check`.
8. Configure the EAS project and Android signing credentials, then run `eas build --profile preview --platform android`; test Google OAuth, lesson completion, usage limits, tutor access, payment, and update delivery on a physical device.
9. Increment `expo.version` and `expo.android.versionCode`, then run `npm run release:android`. The command builds the signed APK, replaces the stable landing-page artifact, applies pending Supabase migrations, updates `app_releases`, and deploys the landing page. Both the website and in-app updater then use the new build automatically.

Never place service-role, OpenRouter, Paystack, cron, or signing secrets in the Expo environment.
