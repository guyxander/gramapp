import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const appConfig = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8')).expo;
const versionName = String(appConfig.version);
const versionCode = Number(appConfig.android.versionCode);

if (!/^\d+\.\d+\.\d+$/.test(versionName) || !Number.isInteger(versionCode) || versionCode < 1) {
  throw new Error('app.json must contain a semantic version and a positive Android versionCode.');
}

const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, shell: process.platform === 'win32', stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed.`);
};

run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleRelease'], resolve(root, 'android'));

const builtApk = resolve(root, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const publicDirectory = resolve(root, 'site', 'downloads');
const publicApk = resolve(publicDirectory, 'GramApp-latest.apk');
mkdirSync(publicDirectory, { recursive: true });
copyFileSync(builtApk, publicApk);

const sha256 = createHash('sha256').update(readFileSync(publicApk)).digest('hex');
const apkUrl = 'https://gramapp-two.vercel.app/downloads/GramApp-latest.apk';
const sql = `begin;
update public.app_releases set active = false where active = true;
insert into public.app_releases (version_name, version_code, kind, minimum_supported_code, apk_url, sha256, notes, active)
values ('${versionName}', ${versionCode}, 'optional', 1, '${apkUrl}', '${sha256}', 'Latest GramApp Android release.', true)
on conflict (version_code) do update set version_name = excluded.version_name, apk_url = excluded.apk_url, sha256 = excluded.sha256, notes = excluded.notes, published_at = now(), active = true;
commit;`;

const supabase = resolve(root, 'node_modules', '.bin', process.platform === 'win32' ? 'supabase.cmd' : 'supabase');
run(supabase, ['db', 'push', '--linked', '--yes']);
run(supabase, ['db', 'query', '--linked', sql]);

const vercel = process.platform === 'win32' ? 'npx.cmd' : 'npx';
run(vercel, ['vercel', '--prod', '--yes']);

console.log(`Published GramApp ${versionName} (${versionCode}) with SHA-256 ${sha256}.`);
