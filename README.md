# Grammar Discovery

Android-first, iOS-ready React Native application for inductive English grammar learning by French-speaking A2-B2 learners.

## MVP scope

- Expo React Native and TypeScript foundation
- PRD-aligned design tokens and Inter typography
- Google-only authentication entry point through Supabase OAuth
- Learner dashboard shell based on the approved Stitch direction
- Feature-first source layout
- Four-tab learner navigation for learning, practice, tutors, and profile
- Complete first lesson loop: Experience -> Notice -> Discover -> Practice -> Produce -> Review
- Persistent attempts, XP, streaks, mastery, daily usage limits, achievements, referrals, and monthly reports
- Speaking recorder, tutor discovery/following, assistance dashboard, and role-based admin dashboard
- RLS-protected Supabase schema, private storage policies, AI/moderation/usage/payment/report/update Edge Functions
- Paystack checkout and signed webhook processing; OpenRouter model selection remains server-configured
- EAS Android APK/AAB profiles and GitHub Actions checks for mobile builds and database migrations

## Lesson acceptance criteria

- The learner sees contextual examples before any explanation.
- The Notice stage asks the learner to identify a repeated pattern.
- An incorrect observation cannot advance and receives a contextual hint.
- The grammatical explanation appears only after the learner identifies the pattern.
- Practice feedback explains the observed pattern instead of exposing a rule early.
- Production requires original learner output before the review stage.
- OpenRouter evaluation remains behind a Supabase Edge Function boundary.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key. Never place a secret or service-role key in the app.
3. Configure Google as the only enabled Supabase Auth provider and allow the app redirect URL.
4. Run `npm start` or `npm run android`.
5. Run `npm run release:check` before submitting changes.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosted Supabase, secrets, Paystack, cron, and EAS release setup. The official legal notices identify Nadbooks Ventures and are published with the production site.

## Guardrails

- Lessons begin with examples, never explicit rules.
- Notifications are in-app only for the MVP.
- AI calls, usage enforcement, referral validation, pricing, and payment verification stay server-side.
- OpenRouter model identifiers and feature availability are configuration, not client constants.
