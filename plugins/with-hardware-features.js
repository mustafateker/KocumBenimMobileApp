const { withAndroidManifest, withGradleProperties, withInfoPlist } = require("expo/config-plugins");

/**
 * Expo prebuild sirasinda:
 * 1. AndroidManifest.xml icine donanim ozelliklerini (portrait ekrani ve kamera)
 *    optional (required="false") olarak ekler. Bu sayede Google Play Console,
 *    uygulamanin tablet, katlanabilir ekran veya Chromebook cihazlarinda engellenmesini onler.
 * 2. gradle.properties icine R8 optimized resource shrinking ayarini ekler.
 * 3. iOS Info.plist icinde NSUserTrackingUsageDescription bulunmamasini garanti eder
 *    (uygulama yalnizca kisisellestirilmemis reklam gosterir ve ATT izni istemez).
 */
module.exports = function withHardwareFeatures(config) {
  config = withInfoPlist(config, (cfg) => {
    delete cfg.modResults.NSUserTrackingUsageDescription;
    return cfg;
  });

  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!manifest["uses-feature"]) {
      manifest["uses-feature"] = [];
    }

    const featuresToAdd = [
      "android.hardware.screen.portrait",
      "android.hardware.screen.landscape",
      "android.hardware.camera",
      "android.hardware.camera.autofocus",
      "android.hardware.camera.front",
    ];

    for (const name of featuresToAdd) {
      const existing = manifest["uses-feature"].find(
        (f) => f.$ && f.$["android:name"] === name
      );
      if (existing) {
        existing.$["android:required"] = "false";
      } else {
        manifest["uses-feature"].push({
          $: {
            "android:name": name,
            "android:required": "false",
          },
        });
      }
    }

    return cfg;
  });

  config = withGradleProperties(config, (cfg) => {
    const propKey = "android.r8.optimizedResourceShrinking";
    const existing = cfg.modResults.find((p) => p.type === "property" && p.key === propKey);
    if (existing) {
      existing.value = "true";
    } else {
      cfg.modResults.push({
        type: "property",
        key: propKey,
        value: "true",
      });
    }
    return cfg;
  });

  return config;
};
