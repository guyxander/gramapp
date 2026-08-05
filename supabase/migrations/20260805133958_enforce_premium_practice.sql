drop policy if exists speaking_attempts_own_insert on public.speaking_attempts;
create policy speaking_attempts_premium_insert
on public.speaking_attempts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and premium_until > now()
  )
);
