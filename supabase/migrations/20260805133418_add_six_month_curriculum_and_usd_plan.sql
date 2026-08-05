-- Six calendar months of daily lessons for every supported CEFR level.
with curriculum_bases(level, base_slug, topic, base_title, base_summary, xp_reward) as (
  values
    ('A2'::public.cefr_level, 'present-continuous-park', 'present_continuous', 'The present continuous', 'Observe actions in progress and discover the pattern.', 15),
    ('B1'::public.cefr_level, 'past-narrative-city', 'past_narrative', 'Telling a story in the past', 'Connect events using the past simple and past continuous.', 20),
    ('B2'::public.cefr_level, 'conditionals-debate', 'conditionals', 'Nuance with conditionals', 'Compare real and hypothetical outcomes in a discussion.', 25)
), generated_lessons as (
  select
    base_slug || '-day-' || day_number as slug,
    base_title || ' - Day ' || day_number as title,
    base_summary || ' Daily spiral cycle ' || (((day_number - 1) / 6) + 1) || '.' as summary,
    level,
    topic || '_cycle_' || (((day_number - 1) / 6) + 1) as topic,
    day_number,
    xp_reward
  from curriculum_bases
  cross join generate_series(1, 180) as day_number
)
insert into public.lessons (slug, title, summary, level, topic, status, estimated_seconds, xp_reward, published_at, content)
select slug, title, summary, level, topic, 'published', 600, xp_reward, now(),
  jsonb_build_object('curriculumDay', day_number, 'catalogBase', split_part(slug, '-day-', 1), 'durationSeconds', 600)
from generated_lessons
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  level = excluded.level,
  topic = excluded.topic,
  status = excluded.status,
  estimated_seconds = excluded.estimated_seconds,
  xp_reward = excluded.xp_reward,
  content = excluded.content,
  published_at = coalesce(public.lessons.published_at, excluded.published_at),
  updated_at = now();

insert into public.subscription_plans (id, name, price_minor, currency, interval, active, benefits)
values ('premium-monthly', 'GramApp Premium Monthly', 2000, 'USD', 'monthly', true,
  '["premium_practice","unlimited_ai_feedback","level_matched_exercises"]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price_minor = excluded.price_minor,
  currency = excluded.currency,
  interval = excluded.interval,
  active = excluded.active,
  benefits = excluded.benefits;
