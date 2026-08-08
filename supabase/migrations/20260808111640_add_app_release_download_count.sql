alter table public.app_releases
  add column download_count bigint not null default 0 check (download_count >= 0);

create or replace function public.get_app_download_stats()
returns table(version_name text, version_code integer, apk_url text, download_count bigint)
language sql stable security definer set search_path = ''
as $$
  select r.version_name, r.version_code, r.apk_url, r.download_count
  from public.app_releases r where r.active = true
  order by r.version_code desc limit 1;
$$;

create or replace function public.record_app_download()
returns table(version_name text, version_code integer, apk_url text, download_count bigint)
language sql volatile security definer set search_path = ''
as $$
  update public.app_releases r set download_count = r.download_count + 1
  where r.id = (select latest.id from public.app_releases latest where latest.active = true order by latest.version_code desc limit 1)
  returning r.version_name, r.version_code, r.apk_url, r.download_count;
$$;

revoke all on function public.get_app_download_stats() from public, anon, authenticated;
revoke all on function public.record_app_download() from public, anon, authenticated;
grant execute on function public.get_app_download_stats() to anon, authenticated;
grant execute on function public.record_app_download() to anon, authenticated;
