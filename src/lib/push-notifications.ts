import Constants, { AppOwnership } from 'expo-constants';
import { Platform } from 'react-native';

import { registerPushToken } from './api';

/**
 * SDK 53'ten itibaren Expo Go, remote push (uzak bildirim) ozelligini kaldirdi —
 * `expo-notifications` paketini import etmek bile Expo Go'da senkron bir hataya
 * yol aciyor (bkz. warnOfExpoGoPushUsage). Bu yuzden paketi STATIK import etmiyoruz;
 * sadece gercek bir development/production build'de, dinamik olarak yukluyoruz.
 * Expo Go'da bu fonksiyon hicbir sey yapmadan geri doner.
 */
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

export async function registerForPushNotifications(): Promise<void> {
  if (isExpoGo) return;

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
