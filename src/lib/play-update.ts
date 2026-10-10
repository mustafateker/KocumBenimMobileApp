import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type PlayUpdateModule = { isUpdateAvailable(): Promise<boolean> };

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
