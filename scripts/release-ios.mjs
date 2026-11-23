import { setProvisioningProfileForPbxproj } from '@expo/config-plugins/build/ios/ProvisioningProfile.js';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paketYolu = resolve(kok, 'package.json');
const appYolu = resolve(kok, 'app.json');
const iosKoku = resolve(kok, 'ios');
const workspaceYolu = resolve(iosKoku, 'KocumBenim.xcworkspace');
const pbxprojYolu = resolve(iosKoku, 'KocumBenim.xcodeproj/project.pbxproj');
const infoPlistYolu = resolve(iosKoku, 'KocumBenim/Info.plist');
const buildKlasoru = resolve(kok, 'build/ios');
const archiveYolu = resolve(buildKlasoru, 'KocumBenim.xcarchive');
const exportKlasoru = resolve(buildKlasoru, 'export');
const exportOptionsYolu = resolve(buildKlasoru, 'ExportOptions.plist');
const ipaYolu = resolve(exportKlasoru, 'KocumBenim.ipa');

const apiKeyYolu = resolve(kok, '.release-secrets/AuthKey_A746S8QJ2Y.p8');
const profilYolu = resolve(kok, '.release-secrets/AppStore_com.triworkster.kocumbenim.mobileprovision');

const BUNDLE_ID = 'com.triworkster.kocumbenim';
const TEAM_ID = '3RRAH7Q65B';
const KEY_ID = 'A746S8QJ2Y';
const ISSUER_ID = 'c52e6cf6-318d-452a-9a47-82f5b2d39467';
const PROFILE_NAME = 'com.triworkster.kocumbenim AppStore';

function calistir(komut, args, secenekler = {}) {
  const sonuc = spawnSync(komut, args, {
    cwd: kok,
    stdio: 'inherit',
    shell: false,
    ...secenekler,
    env: { ...process.env, NODE_ENV: 'production', ...secenekler.env },
  });
  if (sonuc.error) throw sonuc.error;
  if (sonuc.status !== 0) {
    throw new Error(`${komut} ${args.join(' ')} komutu ${sonuc.status ?? 1} koduyla basarisiz oldu.`);
  }
}

const args = process.argv.slice(2);
const kip = args[0] ?? 'testflight';
if (!['build', 'testflight'].includes(kip)) {
  console.error('Kullanim: npm run release:ios veya npm run build:ios');
  process.exit(1);
}

console.log('\n=== Kocum Benim iOS TestFlight Release Akisi ===\n');

// 1. On gereksinim kontrolleri
console.log('1/5 On kosullar dogrulaniyor...');
if (!existsSync(apiKeyYolu)) {
  throw new Error(`App Store Connect AuthKey bulunamadi: ${apiKeyYolu}`);
}

// Profil yoksa fastlane sigh ile otomatik indir
if (!existsSync(profilYolu)) {
  console.log('App Store Provisioning Profile eksik, fastlane ile indiriliyor...');
  calistir('fastlane', ['ios', 'get_profile'], {
    env: {
      APP_STORE_CONNECT_API_KEY_PATH: apiKeyYolu,
      APP_STORE_CONNECT_KEY_ID: KEY_ID,
      APP_STORE_CONNECT_ISSUER_ID: ISSUER_ID,
    },
  });
}

const paket = JSON.parse(readFileSync(paketYolu, 'utf8'));
const app = JSON.parse(readFileSync(appYolu, 'utf8'));

if (app.expo?.ios?.bundleIdentifier !== BUNDLE_ID) {
  console.log(`Bundle ID guncelleniyor: ${app.expo?.ios?.bundleIdentifier} -> ${BUNDLE_ID}`);
  if (!app.expo) app.expo = {};
  if (!app.expo.ios) app.expo.ios = {};
  app.expo.ios.bundleIdentifier = BUNDLE_ID;
  writeFileSync(appYolu, JSON.stringify(app, null, 2) + '\n');
}

const surum = app.expo?.version ?? paket.version ?? '1.0.0';
// Dakika cinsinden zaman damgasi: Apple TestFlight'ta her yukleme kesinlikle benzersiz ve artan kod alir
const buildKodu = String(Math.floor(Date.now() / 60000));
console.log(`Surum: ${surum} | Derleme Kodu (Build Number): ${buildKodu}`);

// 2. Surum bilgilerini Info.plist ve project.pbxproj ile senkronize et
console.log('2/5 Surum ve imzalama ayarlari yapilandiriliyor...');
if (existsSync(infoPlistYolu)) {
  const plistIcerik = readFileSync(infoPlistYolu, 'utf8')
    .replace(/(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/, `$1${surum}$2`)
    .replace(/(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/, `$1${buildKodu}$2`);
  writeFileSync(infoPlistYolu, plistIcerik);
}

if (existsSync(pbxprojYolu)) {
  let pbxproj = readFileSync(pbxprojYolu, 'utf8')
    .replaceAll(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${surum};`)
    .replaceAll(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${buildKodu};`)
    .replaceAll(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${BUNDLE_ID};`);

  if (!pbxproj.includes(`DEVELOPMENT_TEAM = ${TEAM_ID};`)) {
    pbxproj = pbxproj.replaceAll(/(PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)/g, `$1\n\t\t\t\tDEVELOPMENT_TEAM = ${TEAM_ID};`);
  }
  writeFileSync(pbxprojYolu, pbxproj);
}

setProvisioningProfileForPbxproj(kok, {
  targetName: 'KocumBenim',
  profileName: PROFILE_NAME,
  appleTeamId: TEAM_ID,
  buildConfiguration: 'Release',
  codeSignIdentity: 'Apple Distribution',
});

// 3. ExportOptions.plist hazirla
mkdirSync(buildKlasoru, { recursive: true });
rmSync(exportKlasoru, { recursive: true, force: true });
rmSync(archiveYolu, { recursive: true, force: true });

writeFileSync(
  exportOptionsYolu,
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>method</key>
\t<string>app-store-connect</string>
\t<key>teamID</key>
\t<string>${TEAM_ID}</string>
\t<key>signingStyle</key>
\t<string>manual</string>
\t<key>signingCertificate</key>
\t<string>Apple Distribution</string>
\t<key>provisioningProfiles</key>
\t<dict>
\t\t<key>${BUNDLE_ID}</key>
\t\t<string>${PROFILE_NAME}</string>
\t</dict>
\t<key>uploadSymbols</key>
\t<true/>
</dict>
</plist>
`,
);

// 4. Native iOS Archive ve IPA uret
console.log('3/5 Native iOS Archive uretiliyor (xcodebuild archive)...');
calistir('xcodebuild', [
  '-workspace',
  workspaceYolu,
  '-scheme',
  'KocumBenim',
  '-configuration',
  'Release',
  '-destination',
  'generic/platform=iOS',
  '-archivePath',
  archiveYolu,
  `DEVELOPMENT_TEAM=${TEAM_ID}`,
  'archive',
]);

console.log('4/5 Imzali IPA paketi cikariliyor (xcodebuild -exportArchive)...');
calistir('xcodebuild', [
  '-exportArchive',
  '-archivePath',
  archiveYolu,
  '-exportOptionsPlist',
  exportOptionsYolu,
  '-exportPath',
  exportKlasoru,
]);

if (!existsSync(ipaYolu) || statSync(ipaYolu).size === 0) {
  throw new Error(`Imzali KocumBenim.ipa uretilemedi: ${ipaYolu}`);
}

const boyutMB = (statSync(ipaYolu).size / (1024 * 1024)).toFixed(2);
console.log(`\nImzali IPA basariyla olusturuldu: ${ipaYolu} (${boyutMB} MB)`);

// 5. TestFlight Yuklemesi
if (kip === 'testflight') {
  console.log('\n5/5 IPA App Store Connect (TestFlight) kanalina yukleniyor...');
  calistir('fastlane', ['ios', 'upload_testflight'], {
    env: {
      IOS_IPA_PATH: ipaYolu,
      APP_STORE_CONNECT_API_KEY_PATH: apiKeyYolu,
      APP_STORE_CONNECT_KEY_ID: KEY_ID,
      APP_STORE_CONNECT_ISSUER_ID: ISSUER_ID,
    },
  });

  const etiket = `v${surum}-ios-build.${buildKodu}`;
  console.log(`\nTestFlight yuklemesi tamamlandi! Etiket: ${etiket}`);
} else {
  console.log('\nDerleme modu tamamlandi. Yükleme yapilmadi (--build-only).');
}
