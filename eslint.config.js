// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "designs/*",
      "scripts/*",
      "app-store-assets/*",
      "store-assets/*",
      "playstore_tmp/*",
      "graphify-out/*",
      "modules/play-update/android/*",
    ],
  }
]);
