insert into public.achievements (id, name, description, icon, xp_reward, criteria) values
  ('first-discovery', 'Première découverte', 'Terminer votre première leçon inductive.', 'sparkles', 10, '{"completed_lessons":1}'),
  ('seven-day-streak', 'Série de 7 jours', 'Apprendre pendant sept jours consécutifs.', 'flame', 25, '{"streak_days":7}'),
  ('speaking-starter', 'Prise de parole', 'Terminer votre première pratique orale.', 'mic', 15, '{"speaking_sessions":1}')
on conflict (id) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, xp_reward = excluded.xp_reward, criteria = excluded.criteria;

insert into public.subscription_plans (id, name, price_minor, currency, interval, active, benefits) values
  ('premium-monthly', 'Premium mensuel', 500000, 'NGN', 'monthly', true, '["unlimited_learning","unlimited_ai","tutor_assistance","advanced_analytics"]'),
  ('premium-annual', 'Premium annuel', 5000000, 'NGN', 'annual', true, '["unlimited_learning","unlimited_ai","tutor_assistance","advanced_analytics"]')
on conflict (id) do update set name = excluded.name, price_minor = excluded.price_minor, currency = excluded.currency, interval = excluded.interval, active = excluded.active, benefits = excluded.benefits;

insert into public.ai_models (id, model_id, purpose, priority, enabled, free_only) values
  ('lesson-primary', 'openrouter/free', 'lesson_generation', 10, true, true),
  ('evaluation-primary', 'openrouter/free', 'production_evaluation', 10, true, true),
  ('speaking-primary', 'openrouter/free', 'speaking_evaluation', 10, true, true),
  ('report-primary', 'openrouter/free', 'monthly_report', 10, true, true),
  ('moderation-primary', 'openrouter/free', 'contact_exchange_moderation', 10, true, true)
on conflict (id) do update set model_id = excluded.model_id, purpose = excluded.purpose, priority = excluded.priority, enabled = excluded.enabled, free_only = excluded.free_only;

insert into public.lessons (slug, title, summary, level, topic, status, estimated_seconds, xp_reward, published_at, content)
values (
  'present-continuous-park',
  'Le présent continu',
  'Observez des actions en cours et découvrez le motif.',
  'A2',
  'present_continuous',
  'published',
  600,
  15,
  now(),
  '{
    "experience": {
      "context": "Une matinée au parc",
      "prompt": "Look at the park. What is happening right now?",
      "examples": [
        {"subject":"The woman","action":"is jogging","detail":"near the lake."},
        {"subject":"The dog","action":"is chasing","detail":"a red ball."},
        {"subject":"Two children","action":"are playing","detail":"under the trees."}
      ]
    },
    "notice": {
      "question": "Qu’est-ce qui revient dans ces actions en cours ?",
      "options": [
        {"id":"past","label":"Le verbe se termine toujours par -ed."},
        {"id":"progressive","label":"On voit am/is/are, puis un verbe en -ing."},
        {"id":"future","label":"La phrase commence toujours par will."}
      ],
      "correctOptionId":"progressive"
    },
    "discover": {"explanation":"Pour parler d’une action en cours, les exemples utilisent am, is ou are devant un verbe terminé par -ing."},
    "practice": {"prompt":"My friends ___ football right now.","options":["play","are playing","played"],"answer":"are playing"},
    "produce": {"prompt":"Décrivez en deux phrases ce qui se passe maintenant dans une rue animée."}
  }'::jsonb
)
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, level = excluded.level, topic = excluded.topic, status = excluded.status, estimated_seconds = excluded.estimated_seconds, xp_reward = excluded.xp_reward, content = excluded.content, updated_at = now();
