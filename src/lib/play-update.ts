import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type PlayUpdateModule = {
  isUpdateAvailable(): Promise<boolean>;
  getSigningCertSha1?(): Promise<string | null>;
};

const native = Platform.OS === 'android' ? requireOptionalNativeModule<PlayUpdateModule>('PlayUpdate') : null;

/**
 * Play Store'da bu kullanici icin yeni bir surum varsa true. Uygulama Play'den
 * kurulmadiysa (debug, elle yuklenen APK) ya da modul yoksa false doner.
 */
export async function isUpdateAvailable(): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.isUpdateAvailable();
  } catch {
    return false;
  }
}

/**
 * Android cihazda calisan APK'nin gercek SHA-1 sertifika parmak izini doner.
 */
export async function getRunningApkSha1(): Promise<string | null> {
  if (!native || typeof native.getSigningCertSha1 !== 'function') return null;
  try {
    return await native.getSigningCertSha1();
  } catch {
    return null;
  }
}
