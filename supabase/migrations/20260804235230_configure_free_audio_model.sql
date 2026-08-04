update public.ai_models
set model_id = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    free_only = true,
    updated_at = now()
where purpose = 'speaking_evaluation'
  and enabled = true;
