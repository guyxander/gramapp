create type public.lesson_status as enum ('draft', 'review', 'published', 'archived');
create type public.attempt_status as enum ('in_progress', 'completed', 'abandoned');
create type public.assistance_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'cancelled', 'expired');
create type public.update_kind as enum ('optional', 'required');

alter table public.profiles
  add column xp integer not null default 0 check (xp >= 0),
  add column streak_days integer not null default 0 check (streak_days >= 0),
  add column last_learning_date date,
  add column premium_until timestamptz,
  add column referral_code text unique;

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  level public.cefr_level not null,
  topic text not null,
  status public.lesson_status not null default 'draft',
  estimated_seconds integer not null check (estimated_seconds between 60 and 3600),
  xp_reward integer not null default 15 check (xp_reward between 0 and 1000),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  created_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_level_status_idx on public.lessons (level, status);

create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  current_stage text not null default 'experience',
  practice_score integer not null default 0 check (practice_score >= 0),
  practice_total integer not null default 0 check (practice_total >= 0),
  production_response text,
  ai_feedback jsonb,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index lesson_attempts_user_updated_idx on public.lesson_attempts (user_id, updated_at desc);
create unique index lesson_attempts_one_active_idx on public.lesson_attempts (user_id, lesson_id) where status = 'in_progress';

create table public.grammar_mastery (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  mastery_score numeric(5,2) not null default 0 check (mastery_score between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic)
);

create table public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  criteria jsonb not null default '{}'::jsonb
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.tutor_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  headline text not null,
  bio text not null,
  specialties text[] not null default '{}',
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  learner_count integer not null default 0 check (learner_count >= 0),
  accepting_learners boolean not null default true,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_follows (
  learner_id uuid primary key references auth.users (id) on delete cascade,
  tutor_id uuid not null references auth.users (id) on delete cascade,
  followed_at timestamptz not null default now(),
  check (learner_id <> tutor_id)
);

create index tutor_follows_tutor_idx on public.tutor_follows (tutor_id);

create table public.tutor_comments (
  id bigint generated always as identity primary key,
  learner_id uuid not null references auth.users (id) on delete cascade,
  tutor_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users (id) on delete cascade,
  tutor_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  body text not null,
  status public.assistance_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assistance_requests_tutor_status_idx on public.assistance_requests (tutor_id, status, created_at desc);

create table public.conversation_messages (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.assistance_requests (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  message_id bigint references public.conversation_messages (id) on delete cascade,
  risk public.risk_level not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  reason_code text not null,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'dismissed', 'warned', 'suspended')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index moderation_flags_status_risk_idx on public.moderation_flags (status, risk, created_at desc);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referred_user_id uuid not null unique references auth.users (id) on delete cascade,
  qualified_at timestamptz,
  expires_on date,
  created_at timestamptz not null default now(),
  check (referrer_id <> referred_user_id)
);

create index referrals_referrer_idx on public.referrals (referrer_id, qualified_at);

create table public.subscription_plans (
  id text primary key,
  name text not null,
  price_minor integer not null check (price_minor > 0),
  currency char(3) not null default 'NGN',
  interval text not null check (interval in ('monthly', 'annual')),
  active boolean not null default true,
  paystack_plan_code text unique,
  benefits jsonb not null default '[]'::jsonb
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  status public.subscription_status not null default 'pending',
  paystack_customer_code text,
  paystack_subscription_code text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_status_idx on public.subscriptions (user_id, status);

create table public.payment_events (
  id bigint generated always as identity primary key,
  paystack_event_id text unique,
  event_type text not null,
  reference text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report_month date not null,
  summary jsonb not null,
  storage_path text,
  generated_at timestamptz not null default now(),
  unique (user_id, report_month)
);

create table public.app_releases (
  id bigint generated always as identity primary key,
  version_name text not null unique,
  version_code integer not null unique check (version_code > 0),
  kind public.update_kind not null default 'optional',
  minimum_supported_code integer not null check (minimum_supported_code > 0),
  apk_url text not null check (apk_url ~ '^https://'),
  sha256 text not null check (sha256 ~ '^[a-fA-F0-9]{64}$'),
  notes text not null,
  published_at timestamptz not null default now(),
  active boolean not null default true
);

create table public.ai_models (
  id text primary key,
  provider text not null default 'openrouter',
  model_id text not null,
  purpose text not null,
  priority integer not null default 100,
  enabled boolean not null default true,
  free_only boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.grammar_mastery enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tutor_follows enable row level security;
alter table public.tutor_comments enable row level security;
alter table public.assistance_requests enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.referrals enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_events enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.app_releases enable row level security;
alter table public.ai_models enable row level security;

create or replace function private.has_any_role(allowed public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = any(allowed)
  );
$$;

revoke all on function private.has_any_role(public.app_role[]) from public, anon;
grant execute on function private.has_any_role(public.app_role[]) to authenticated;

create policy lessons_read_published on public.lessons for select to authenticated using (status = 'published' or private.has_any_role(array['super_admin','content_admin']::public.app_role[]));
create policy attempts_read_own on public.lesson_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy mastery_read_own on public.grammar_mastery for select to authenticated using ((select auth.uid()) = user_id);
create policy achievements_read on public.achievements for select to authenticated using (true);
create policy user_achievements_read_own on public.user_achievements for select to authenticated using ((select auth.uid()) = user_id);
create policy tutor_profiles_read on public.tutor_profiles for select to authenticated using (verified = true or (select auth.uid()) = user_id or private.has_any_role(array['super_admin','support_admin']::public.app_role[]));
create policy tutor_follows_read_participant on public.tutor_follows for select to authenticated using ((select auth.uid()) in (learner_id, tutor_id));
create policy tutor_follows_insert_own on public.tutor_follows for insert to authenticated with check ((select auth.uid()) = learner_id);
create policy tutor_follows_delete_own on public.tutor_follows for delete to authenticated using ((select auth.uid()) = learner_id);
create policy tutor_comments_read_participant on public.tutor_comments for select to authenticated using ((select auth.uid()) in (learner_id, tutor_id));
create policy tutor_comments_insert_tutor on public.tutor_comments for insert to authenticated with check ((select auth.uid()) = tutor_id and exists (select 1 from public.tutor_follows f where f.learner_id = tutor_comments.learner_id and f.tutor_id = (select auth.uid())));
create policy assistance_read_participant on public.assistance_requests for select to authenticated using ((select auth.uid()) in (learner_id, tutor_id));
create policy assistance_insert_learner on public.assistance_requests for insert to authenticated with check ((select auth.uid()) = learner_id and exists (select 1 from public.tutor_follows f where f.learner_id = (select auth.uid()) and f.tutor_id = assistance_requests.tutor_id));
create policy assistance_update_tutor on public.assistance_requests for update to authenticated using ((select auth.uid()) = tutor_id) with check ((select auth.uid()) = tutor_id);
create policy messages_read_participant on public.conversation_messages for select to authenticated using (exists (select 1 from public.assistance_requests r where r.id = conversation_messages.request_id and (select auth.uid()) in (r.learner_id, r.tutor_id)));
create policy messages_insert_participant on public.conversation_messages for insert to authenticated with check ((select auth.uid()) = sender_id and exists (select 1 from public.assistance_requests r where r.id = conversation_messages.request_id and (select auth.uid()) in (r.learner_id, r.tutor_id)));
create policy moderation_admin_read on public.moderation_flags for select to authenticated using (private.has_any_role(array['super_admin','moderator','support_admin']::public.app_role[]));
create policy referrals_read_own on public.referrals for select to authenticated using ((select auth.uid()) in (referrer_id, referred_user_id));
create policy plans_read_active on public.subscription_plans for select to authenticated using (active = true or private.has_any_role(array['super_admin','finance_admin']::public.app_role[]));
create policy subscriptions_read_own on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id or private.has_any_role(array['super_admin','finance_admin']::public.app_role[]));
create policy reports_read_own_or_tutor on public.monthly_reports for select to authenticated using ((select auth.uid()) = user_id or exists (select 1 from public.tutor_follows f where f.learner_id = monthly_reports.user_id and f.tutor_id = (select auth.uid())));
create policy releases_read_active on public.app_releases for select to authenticated using (active = true);
create policy ai_models_admin_read on public.ai_models for select to authenticated using (private.has_any_role(array['super_admin','content_admin']::public.app_role[]));

grant select on public.lessons, public.lesson_attempts, public.grammar_mastery, public.achievements, public.user_achievements, public.tutor_profiles, public.tutor_comments, public.moderation_flags, public.referrals, public.subscription_plans, public.subscriptions, public.monthly_reports, public.app_releases, public.ai_models to authenticated;
grant select, insert, delete on public.tutor_follows to authenticated;
grant select, insert, update on public.assistance_requests to authenticated;
grant select, insert on public.conversation_messages to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('lesson-assets', 'lesson-assets', true, 20971520, array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4']),
  ('monthly-reports', 'monthly-reports', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy avatars_public_read on storage.objects for select to public using (bucket_id = 'avatars');
create policy avatars_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_owner_update on storage.objects for update to authenticated using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text)) with check (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));
create policy reports_owner_read on storage.objects for select to authenticated using (bucket_id = 'monthly-reports' and (storage.foldername(name))[1] = (select auth.uid())::text);

comment on table public.payment_events is 'Server-only Paystack webhook ledger. Never expose payload writes to clients.';
comment on table public.ai_models is 'Admin-configured OpenRouter model routing. Model IDs are not embedded in the mobile app.';

create or replace function public.consume_learning_seconds(seconds_to_add integer)
returns table (allowed boolean, used_seconds integer, available_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  row_usage public.daily_usage%rowtype;
  premium boolean;
  daily_limit integer;
  referral_bonus integer;
begin
  if caller is null or seconds_to_add <= 0 or seconds_to_add > 3600 then
    raise exception 'invalid usage request';
  end if;

  select premium_until > now() into premium from public.profiles where id = caller;
  if coalesce(premium, false) then
    return query select true, 0, 2147483647;
    return;
  end if;

  insert into public.daily_usage (user_id, usage_date)
  values (caller, current_date)
  on conflict (user_id, usage_date) do nothing;

  select * into row_usage from public.daily_usage
  where user_id = caller and usage_date = current_date
  for update;

  select count(*)::integer * 600 into referral_bonus from public.referrals
    where referrer_id = caller and qualified_at is not null and expires_on >= current_date;
  update public.daily_usage set referral_bonus_seconds = referral_bonus
    where user_id = caller and usage_date = current_date;
  daily_limit := 600 + referral_bonus;
  if row_usage.used_seconds + seconds_to_add > daily_limit then
    return query select false, row_usage.used_seconds, greatest(0, daily_limit - row_usage.used_seconds);
    return;
  end if;

  update public.daily_usage
  set used_seconds = daily_usage.used_seconds + seconds_to_add, updated_at = now()
  where user_id = caller and usage_date = current_date
  returning daily_usage.used_seconds into row_usage.used_seconds;

  return query select true, row_usage.used_seconds, greatest(0, daily_limit - row_usage.used_seconds);
end;
$$;

revoke all on function public.consume_learning_seconds(integer) from public, anon;
grant execute on function public.consume_learning_seconds(integer) to authenticated;

create or replace function public.start_lesson_attempt(lesson_id_value uuid)
returns public.lesson_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  attempt public.lesson_attempts%rowtype;
begin
  if caller is null then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.lessons where id = lesson_id_value and status = 'published') then
    raise exception 'lesson unavailable';
  end if;
  select * into attempt from public.lesson_attempts
    where user_id = caller and lesson_id = lesson_id_value and status = 'in_progress';
  if found then return attempt; end if;
  insert into public.lesson_attempts (user_id, lesson_id)
  values (caller, lesson_id_value) returning * into attempt;
  return attempt;
end;
$$;

revoke all on function public.start_lesson_attempt(uuid) from public, anon;
grant execute on function public.start_lesson_attempt(uuid) to authenticated;

create or replace function public.complete_lesson_attempt(
  attempt_id uuid,
  practice_score_value integer,
  practice_total_value integer,
  production_response_value text
)
returns public.lesson_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  attempt public.lesson_attempts%rowtype;
  reward integer;
  today date := current_date;
begin
  if caller is null then raise exception 'authentication required'; end if;
  select a.* into attempt from public.lesson_attempts a
    where a.id = attempt_id and a.user_id = caller for update;
  if not found then raise exception 'attempt not found'; end if;
  if attempt.status = 'completed' then return attempt; end if;

  select xp_reward into reward from public.lessons where id = attempt.lesson_id;
  if practice_total_value > 0 and practice_score_value = practice_total_value then reward := reward + 5; end if;

  update public.lesson_attempts set
    status = 'completed', current_stage = 'review', practice_score = practice_score_value,
    practice_total = practice_total_value, production_response = production_response_value,
    xp_awarded = reward, completed_at = now(), updated_at = now()
  where id = attempt_id returning * into attempt;

  update public.profiles set
    xp = profiles.xp + reward,
    streak_days = case when last_learning_date = today - 1 then streak_days + 1 when last_learning_date = today then streak_days else 1 end,
    last_learning_date = today,
    updated_at = now()
  where id = caller;

  insert into public.grammar_mastery (user_id, topic, mastery_score, attempts, last_practiced_at)
  select caller, l.topic,
    case when practice_total_value = 0 then 50 else round((practice_score_value::numeric / practice_total_value) * 100, 2) end,
    1, now()
  from public.lessons l where l.id = attempt.lesson_id
  on conflict (user_id, topic) do update set
    mastery_score = round((grammar_mastery.mastery_score * grammar_mastery.attempts + excluded.mastery_score) / (grammar_mastery.attempts + 1), 2),
    attempts = grammar_mastery.attempts + 1, last_practiced_at = now(), updated_at = now();

  return attempt;
end;
$$;

revoke all on function public.complete_lesson_attempt(uuid,integer,integer,text) from public, anon;
grant execute on function public.complete_lesson_attempt(uuid,integer,integer,text) to authenticated;
