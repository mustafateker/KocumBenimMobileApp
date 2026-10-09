#!/usr/bin/env bash
# Yerel Android release: derle, Play Alpha'ya yükle, git etiketi + GitHub release oluştur.
# Kullanım: npm run release   (veya TRACK=production npm run release)
# Ön koşul: .env.release dosyası (örnek: .env.release.example), fastlane (brew install fastlane), gh, JDK 17
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env.release ] || { echo ".env.release yok (.env.release.example dosyasına bakın)"; exit 1; }
set -a; . ./.env.release; set +a
for v in KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD PLAY_JSON_KEY_PATH; do
  [ -n "${!v:-}" ] || { echo "$v .env.release içinde tanımlı değil"; exit 1; }
done
command -v fastlane >/dev/null || { echo "fastlane kurulu değil: brew install fastlane"; exit 1; }
command -v gh >/dev/null || { echo "gh kurulu değil: brew install gh"; exit 1; }

[ -z "$(git status --porcelain)" ] || { echo "Çalışma dizini temiz değil, önce commit'leyin"; exit 1; }

TRACK="${TRACK:-alpha}"
PACKAGE="com.triworkster.kocumbenimmobileapp"
VERSION=$(node -p "require('./app.json').expo.version")
# Dakika cinsinden zaman: her çalıştırmada artar, EAS'ın son kodu (3) üstünde kalır
export VERSION_CODE=$(( $(date +%s) / 60 ))
TAG="v${VERSION}-build.${VERSION_CODE}"

echo "==> $TAG ($TRACK) derleniyor"
npx expo prebuild --platform android --no-install --clean
node scripts/patch-android-release.js
(cd android && ./gradlew bundleRelease)

AAB=android/app/build/outputs/bundle/release/app-release.aab
mkdir -p builds && cp "$AAB" "builds/KocumBenim-${VERSION}-build-${VERSION_CODE}.aab"

echo "==> Play Console'a yükleniyor"
fastlane supply --aab "$AAB" --track "$TRACK" --package_name "$PACKAGE" \
  --json_key "$PLAY_JSON_KEY_PATH" --release_status completed \
  --skip_upload_metadata --skip_upload_images --skip_upload_screenshots

echo "==> Etiket ve GitHub release"
git tag "$TAG"
git push origin "$TAG"
gh release create "$TAG" --title "$VERSION (build $VERSION_CODE)" --generate-notes --prerelease
echo "Tamam: $TAG"
