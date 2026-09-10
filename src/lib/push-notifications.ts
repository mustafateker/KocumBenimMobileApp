import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { registerPushToken } from './api';

/**
 * `expo-notifications` paketini import etmek bile yan etkili modullerini
 * (DevicePushTokenAutoRegistration.fx, PushTokenManager) calistirir. Gelistirme
 * modunda Metro bu modul-yukleme hatalarini try/catch'e dusmeden fatal olarak
 * raporlar, bu yuzden push'un calisamayacagi ortamlarda paketi hic yuklemiyoruz.
 * Iki ayri durum var, ikisi de ayri kontrol ister:
 *
 *  1. Expo Go: SDK 53'ten beri Android'de remote push yok. Native modul
 *     mevcut ama paket `isRunningInExpoGo()` gorunce bilerek firlatiyor
 *     (bkz. expo-notifications/build/warnOfExpoGoPushUsage.js). Ayni kontrolu
 *     burada yapiyoruz. `Constants.appOwnership` kullanimdan kalkti ve Expo Go
 *     57'de 'expo' donmuyor, ona guvenilemez.
 *  2. Native kabugu expo-notifications eklenmeden once derlenmis bir build:
 *     'ExpoPushTokenManager' modulu hic yok, paket `requireNativeModule` ile
 *     arayip bulamayinca firlatiyor. `requireOptionalNativeModule` ayni aramanin
 *     firlatmayan hali.
 */
function canRegisterPush(): boolean {
  if (isRunningInExpoGo()) return false;
  return requireOptionalNativeModule('ExpoPushTokenManager') != null;
}

export async function registerForPushNotifications(): Promise<void> {
  if (!canRegisterPush()) return;

  try {
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await registerPushToken(tokenResponse.data);
  } catch {
    // Push kaydi en iyi caba niteligindedir; basarisiz olursa bildirimler ekran-ici listede gorunmeye devam eder.
  }
}
