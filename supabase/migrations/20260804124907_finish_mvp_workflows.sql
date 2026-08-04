create table public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null check (char_length(prompt) between 1 and 1000),
  storage_path text not null unique,
  duration_ms integer not null check (duration_ms between 500 and 300000),
  status text not null default 'uploaded' check (status in ('uploaded', 'evaluated', 'failed')),
  transcript text,
  feedback jsonb,
  created_at timestamptz not null default now()
);

alter table public.speaking_attempts enable row level security;
create policy speaking_attempts_own_select on public.speaking_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy speaking_attempts_own_insert on public.speaking_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
grant select, insert on public.speaking_attempts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaking-audio', 'speaking-audio', false, 10485760, array['audio/m4a', 'audio/mp4', 'audio/aac', 'audio/webm'])
on conflict (id) do nothing;

create policy speaking_audio_insert_own on storage.objects for insert to authenticated
with check (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy speaking_audio_select_own on storage.objects for select to authenticated
using (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy speaking_audio_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.register_referral(referral_code_value text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare referrer uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if exists (select 1 from public.referrals where referred_user_id = auth.uid()) then return false; end if;
  select id into referrer from public.profiles
  where upper(referral_code) = upper(trim(referral_code_value)) and id <> auth.uid();
  if referrer is null then return false; end if;
  insert into public.referrals (referrer_id, referred_user_id) values (referrer, auth.uid());
  return true;
end;
$$;
revoke all on function public.register_referral(text) from public, anon;
grant execute on function public.register_referral(text) to authenticated;

create or replace function public.ensure_referral_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare code text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select referral_code into code from public.profiles where id = auth.uid();
  if code is null then
    code := upper(substr(replace(auth.uid()::text, '-', ''), 1, 8));
    update public.profiles set referral_code = code where id = auth.uid();
  end if;
  return code;
end;
$$;
revoke all on function public.ensure_referral_code() from public, anon;
grant execute on function public.ensure_referral_code() to authenticated;

create policy feature_flags_admin_update on public.feature_flags for update to authenticated
using (private.has_any_role(array['super_admin','content_admin']::public.app_role[]))
with check (private.has_any_role(array['super_admin','content_admin']::public.app_role[]));
create policy moderation_admin_update on public.moderation_flags for update to authenticated
using (private.has_any_role(array['super_admin','moderator','support_admin']::public.app_role[]))
with check (private.has_any_role(array['super_admin','moderator','support_admin']::public.app_role[]));
grant update on public.feature_flags, public.moderation_flags to authenticated;
