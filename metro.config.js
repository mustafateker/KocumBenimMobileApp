// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite web support ships a wasm binary that Metro must treat as an asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
