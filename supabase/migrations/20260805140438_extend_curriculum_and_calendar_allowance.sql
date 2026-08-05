with curriculum_bases(level, base_slug, topic, base_title, base_summary, xp_reward) as (
  values
    ('A2'::public.cefr_level, 'present-continuous-park', 'present_continuous', 'A2 Grammar Discovery', 'Build accurate everyday grammar through guided discovery.', 15),
    ('B1'::public.cefr_level, 'past-narrative-city', 'past_narrative', 'B1 Grammar Discovery', 'Connect ideas and narrate events with confident intermediate grammar.', 20),
    ('B2'::public.cefr_level, 'conditionals-debate', 'conditionals', 'B2 Grammar Discovery', 'Develop precise, nuanced grammar for complex communication.', 25)
), generated_lessons as (
  select
    base_slug || '-day-' || day_number as slug,
    base_title || ' - Day ' || day_number as title,
    base_summary || ' Spiral cycle ' || (((day_number - 1) / 6) + 1) || '.' as summary,
    level,
    topic || '_cycle_' || (((day_number - 1) / 6) + 1) as topic,
    day_number,
    xp_reward
  from curriculum_bases
  cross join generate_series(181, 270) as day_number
)
insert into public.lessons (slug, title, summary, level, topic, status, estimated_seconds, xp_reward, published_at, content)
select slug, title, summary, level, topic, 'published', 600, xp_reward, now(),
  jsonb_build_object('curriculumDay', day_number, 'catalogBase', split_part(slug, '-day-', 1), 'durationSeconds', 600)
from generated_lessons
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, level = excluded.level,
  topic = excluded.topic, status = excluded.status, estimated_seconds = excluded.estimated_seconds,
  xp_reward = excluded.xp_reward, content = excluded.content, updated_at = now();

create or replace function public.consume_learning_seconds(seconds_to_add integer)
returns table (allowed boolean, used_seconds integer, available_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  lagos_today date := (now() at time zone 'Africa/Lagos')::date;
  row_usage public.daily_usage%rowtype;
  premium boolean;
  daily_limit integer;
  referral_bonus integer;
begin
  if caller is null or seconds_to_add < 0 or seconds_to_add > 3600 then
    raise exception 'invalid usage request';
  end if;

  select premium_until > now() into premium from public.profiles where id = caller;
  if coalesce(premium, false) then
    return query select true, 0, 2147483647;
    return;
  end if;

  insert into public.daily_usage (user_id, usage_date)
  values (caller, lagos_today)
  on conflict (user_id, usage_date) do nothing;

  select * into row_usage from public.daily_usage
  where user_id = caller and usage_date = lagos_today
  for update;

  select count(*)::integer * 600 into referral_bonus from public.referrals
    where referrer_id = caller and qualified_at is not null and expires_on >= lagos_today;
  update public.daily_usage set referral_bonus_seconds = referral_bonus
    where user_id = caller and usage_date = lagos_today;
  daily_limit := 600 + referral_bonus;

  if row_usage.used_seconds + seconds_to_add > daily_limit then
    return query select false, row_usage.used_seconds, greatest(0, daily_limit - row_usage.used_seconds);
    return;
  end if;

  if seconds_to_add > 0 then
    update public.daily_usage
    set used_seconds = daily_usage.used_seconds + seconds_to_add, updated_at = now()
    where user_id = caller and usage_date = lagos_today
    returning daily_usage.used_seconds into row_usage.used_seconds;
  end if;

  return query select true, row_usage.used_seconds, greatest(0, daily_limit - row_usage.used_seconds);
end;
$$;

revoke all on function public.consume_learning_seconds(integer) from public, anon;
grant execute on function public.consume_learning_seconds(integer) to authenticated;
