// expo-notifications eklentisi yalnizca kucuk (tek renkli) ikonu ayarlar. Bildirimin
// solundaki renkli maskot icin Android manifestine large icon kaydi eklenir.
const fs = require("fs");
const path = require("path");
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const DRAWABLE = "notification_large_icon";
const META_KEY = "expo.modules.notifications.large_notification_icon";

module.exports = function withNotificationLargeIcon(config, { icon }) {
  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, "app/src/main/res/drawable-nodpi");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.resolve(cfg.modRequest.projectRoot, icon), path.join(dir, `${DRAWABLE}.png`));
      return cfg;
    },
  ]);

  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(app, META_KEY, `@drawable/${DRAWABLE}`, "resource");
    return cfg;
  });
};
