const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Expo prebuild sirasinda AndroidManifest.xml icine donanim ozelliklerini
 * (portrait ekrani ve kamera) optional (required="false") olarak ekler.
 * Bu sayede Google Play Console, uygulamanin tablet, katlanabilir ekran,
 * Chromebook veya Android XR cihazlarinda engellenmesini onler.
 */
module.exports = function withHardwareFeatures(config) {
  return withAndroidManifest(config, (cfg) => {
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
};
