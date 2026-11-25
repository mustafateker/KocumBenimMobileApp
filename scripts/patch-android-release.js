// CI: `expo prebuild` sonrası android/app/build.gradle dosyasına release imzası ve versionCode ekler.
// Gerekli env: KEYSTORE_PATH, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD, VERSION_CODE
const fs = require("fs");
const path = require("path");
const os = require("os");

// `expo prebuild --clean` android klasorunu sifirladiginda debug.keystore'un degismemesi icin
// sabit debug keystore'u geri yukle (boylece SHA-1 parmak izi her build'de degismez).
const permanentDebugKeystore = path.join(os.homedir(), "keystores", "kocumbenim-debug.keystore");
const appDebugKeystore = "android/app/debug.keystore";
if (fs.existsSync(permanentDebugKeystore)) {
  fs.copyFileSync(permanentDebugKeystore, appDebugKeystore);
} else if (fs.existsSync(appDebugKeystore)) {
  fs.mkdirSync(path.dirname(permanentDebugKeystore), { recursive: true });
  fs.copyFileSync(appDebugKeystore, permanentDebugKeystore);
}

const file = "android/app/build.gradle";
let gradle = fs.readFileSync(file, "utf8");

for (const name of ["KEYSTORE_PATH", "KEYSTORE_PASSWORD", "KEY_ALIAS", "KEY_PASSWORD", "VERSION_CODE"]) {
  if (!process.env[name]) throw new Error(`${name} tanımlı değil`);
}

const releaseSigning = `
        release {
            // Release sonrasi ayni native klasor debug build icin de kullanilabilir.
            // Ortam degiskenleri yeni terminalde yoksa file(null) ile Gradle
            // konfigurasyonunu dusurme; release gorevi zaten bu betik tarafindan
            // tum degerler dogrulandiktan sonra calistirilir.
            def releaseKeystorePath = System.getenv("KEYSTORE_PATH")
            if (releaseKeystorePath) {
                storeFile file(releaseKeystorePath)
                storePassword System.getenv("KEYSTORE_PASSWORD")
                keyAlias System.getenv("KEY_ALIAS")
                keyPassword System.getenv("KEY_PASSWORD")
            }
        }`;

const patched = gradle
  .replace(/versionCode \d+/, `versionCode ${process.env.VERSION_CODE}`)
  .replace("signingConfigs {", `signingConfigs {${releaseSigning}`)
  // release buildType debug imzasını kullanıyor, release ile değiştir
  .replace(/(release \{\s*\/\/ Caution![\s\S]*?)signingConfig signingConfigs\.debug/, "$1signingConfig signingConfigs.release")
  // R8 optimizasyonlarini etkinlestir (Google Play Console onerisi)
  .replace('getDefaultProguardFile("proguard-android.txt")', 'getDefaultProguardFile("proguard-android-optimize.txt")');

if (patched === gradle || !patched.includes("signingConfigs.release")) {
  throw new Error("build.gradle yaması uygulanamadı, şablon değişmiş olabilir");
}

fs.writeFileSync(file, patched);

// R8 (minifyReleaseWithR8) varsayilan 2 GB heap ile OutOfMemoryError veriyor.
// prebuild --clean gradle.properties'i sifirladigi icin bellegi burada yukseltiyoruz.
const propsFile = "android/gradle.properties";
const JVM_ARGS = "org.gradle.jvmargs=-Xmx6144m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8";
let props = fs.readFileSync(propsFile, "utf8");
props = /^org\.gradle\.jvmargs=.*$/m.test(props)
  ? props.replace(/^org\.gradle\.jvmargs=.*$/m, JVM_ARGS)
  : `${props.trimEnd()}\n${JVM_ARGS}\n`;
fs.writeFileSync(propsFile, props);
