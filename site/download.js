const releaseApi = 'https://yylsyzlnrfdyrulokrju.supabase.co/rest/v1/rpc';
const releaseKey = 'sb_publishable_NSczqtMNT5qhESZzRuCv1A_SCkWGt41';
const fallbackApk = `${window.location.origin}/downloads/GramApp-latest.apk`;
const releaseHeaders = {
  apikey: releaseKey,
  Authorization: `Bearer ${releaseKey}`,
  'Content-Type': 'application/json',
};

Object.assign(copy.en, {
  navCta: 'Download app',
  heroCta: 'Download for Android',
  ctaButton: 'Download GramApp',
  downloads: 'downloads',
});
Object.assign(copy.fr, {
  navCta: "Télécharger l'app",
  heroCta: 'Télécharger pour Android',
  ctaButton: 'Télécharger GramApp',
  downloads: 'téléchargements',
});

const countElement = document.querySelector('#download-count');
const versionElement = document.querySelector('#release-version');
const downloadButtons = [...document.querySelectorAll('[data-download]')];

const firstRow = (payload) => Array.isArray(payload) ? payload[0] : payload;
const showRelease = (release) => {
  if (!release) return;
  countElement.textContent = Number(release.download_count || 0).toLocaleString();
  versionElement.textContent = `v${release.version_name} · Android APK`;
};

const callReleaseRpc = async (name) => {
  const response = await fetch(`${releaseApi}/${name}`, { method: 'POST', headers: releaseHeaders, body: '{}' });
  if (!response.ok) throw new Error(`Release service returned ${response.status}`);
  return firstRow(await response.json());
};

void callReleaseRpc('get_app_download_stats').then(showRelease).catch(() => {
  countElement.textContent = '0';
});

downloadButtons.forEach((button) => button.addEventListener('click', async (event) => {
  event.preventDefault();
  downloadButtons.forEach((item) => item.classList.add('is-loading'));
  try {
    const release = await callReleaseRpc('record_app_download');
    showRelease(release);
    window.location.assign(release?.apk_url || fallbackApk);
  } catch {
    window.location.assign(fallbackApk);
  } finally {
    downloadButtons.forEach((item) => item.classList.remove('is-loading'));
  }
}));
