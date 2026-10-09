// CI: `expo prebuild` sonrası android/app/build.gradle dosyasına release imzası ve versionCode ekler.
// Gerekli env: KEYSTORE_PATH, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD, VERSION_CODE
const fs = require("fs");

const file = "android/app/build.gradle";
let gradle = fs.readFileSync(file, "utf8");

for (const name of ["KEYSTORE_PATH", "KEYSTORE_PASSWORD", "KEY_ALIAS", "KEY_PASSWORD", "VERSION_CODE"]) {
  if (!process.env[name]) throw new Error(`${name} tanımlı değil`);
}

const releaseSigning = `
        release {
            storeFile file(System.getenv("KEYSTORE_PATH"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }`;

const patched = gradle
  .replace(/versionCode \d+/, `versionCode ${process.env.VERSION_CODE}`)
  .replace("signingConfigs {", `signingConfigs {${releaseSigning}`)
  // release buildType debug imzasını kullanıyor, release ile değiştir
  .replace(/(release \{\s*\/\/ Caution![\s\S]*?)signingConfig signingConfigs\.debug/, "$1signingConfig signingConfigs.release");

if (patched === gradle || !patched.includes("signingConfigs.release")) {
  throw new Error("build.gradle yaması uygulanamadı, şablon değişmiş olabilir");
}

fs.writeFileSync(file, patched);
