alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

do $$
begin
  alter table public.profiles
    add constraint profiles_locale_supported_check check (locale in ('en', 'fr'));
exception
  when duplicate_object then null;
end
$$;

comment on column public.profiles.onboarding_completed_at is
  'Set after a learner explicitly chooses an interface language and CEFR level.';

grant update (onboarding_completed_at) on public.profiles to authenticated;

insert into public.lessons (slug, title, summary, level, topic, status, estimated_seconds, xp_reward, published_at, content)
values
  (
    'past-narrative-city',
    'Raconter au passé',
    'Reliez des événements et choisissez entre le prétérit simple et continu.',
    'B1',
    'past_narrative',
    'published',
    720,
    20,
    now(),
    '{"catalogKey":"past-narrative-city"}'::jsonb
  ),
  (
    'conditionals-debate',
    'Nuancer avec les conditionnels',
    'Comparez des hypothèses réelles et imaginaires dans une discussion.',
    'B2',
    'conditionals',
    'published',
    840,
    25,
    now(),
    '{"catalogKey":"conditionals-debate"}'::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  level = excluded.level,
  topic = excluded.topic,
  status = excluded.status,
  estimated_seconds = excluded.estimated_seconds,
  xp_reward = excluded.xp_reward,
  content = excluded.content,
  updated_at = now();
