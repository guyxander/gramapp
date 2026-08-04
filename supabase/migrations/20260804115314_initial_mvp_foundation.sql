create type public.app_role as enum (
  'learner',
  'tutor',
  'super_admin',
  'content_admin',
  'support_admin',
  'finance_admin',
  'moderator'
);

create type public.cefr_level as enum ('A2', 'B1', 'B2');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'learner',
  display_name text,
  avatar_url text,
  locale text not null default 'fr',
  level public.cefr_level not null default 'A2',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (key, enabled) values
  ('premium', false),
  ('referrals', false),
  ('tutor_assistance', false),
  ('moderation', false),
  ('forced_updates', false);

create table public.in_app_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index in_app_notifications_user_created_idx
  on public.in_app_notifications (user_id, created_at desc);

create table public.daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  used_seconds integer not null default 0 check (used_seconds >= 0),
  referral_bonus_seconds integer not null default 0 check (referral_bonus_seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.profiles enable row level security;
alter table public.feature_flags enable row level security;
alter table public.in_app_notifications enable row level security;
alter table public.daily_usage enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "feature_flags_read_authenticated"
  on public.feature_flags for select
  to authenticated
  using (true);

create policy "notifications_select_own"
  on public.in_app_notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "notifications_update_own"
  on public.in_app_notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "daily_usage_select_own"
  on public.daily_usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.profiles, public.feature_flags, public.in_app_notifications, public.daily_usage
  to authenticated;
grant update (display_name, avatar_url, locale, level) on public.profiles to authenticated;
grant update (read_at) on public.in_app_notifications to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

comment on table public.daily_usage is
  'Server-maintained daily learning usage. Clients have read-only access to their own row.';
comment on column public.profiles.role is
  'Authorization role. Server-managed; never derived from user_metadata.';
