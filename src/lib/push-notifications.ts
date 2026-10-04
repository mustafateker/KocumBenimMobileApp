import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { DetailAccent } from '@/theme/tokens';

import { registerPushToken } from './api';
import { logHandledError } from './crash-reporter';
import { hrefForPush, type PushPayload } from './notification-route';

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

/**
 * Android'de kanal, izin isteginden ve native token alinmadan once var olmali
 * (Expo SDK 57 dokumani).
 */
async function ensureAndroidChannel(
  Notifications: typeof import('expo-notifications')
): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Genel',
    // Gorev atamasi ekranda banner olarak gorunmeli; DEFAULT sessiz kalabiliyor.
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: DetailAccent,
  });
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

    await ensureAndroidChannel(Notifications);

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      logHandledError('PUSH_PERMISSION_DENIED', `Bildirim izni verilmedi (${finalStatus}).`);
      return;
    }

    // expo-notifications native cihaz tokeni Android'de FCM, iOS'ta APNs tokenidir.
    // Backend dogrudan FCM kullandigi icin ham APNs tokenini Firebase'e kaydetme.
    if (Platform.OS !== 'android') {
      logHandledError(
        'PUSH_UNSUPPORTED_PLATFORM',
        'Dogrudan FCM token kaydi su anda yalnizca Android icin yapilandirildi.'
      );
      return;
    }

    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    if (typeof tokenResponse.data !== 'string') {
      throw new Error('FCM cihaz tokeni beklenen string biciminde degil.');
    }
    await registerPushToken(tokenResponse.data);
  } catch (err) {
    // Push kaydi en iyi caba niteligindedir; basarisiz olursa bildirimler
    // ekran-ici listede gorunmeye devam eder. Yine de sebebi kayit altina al.
    logHandledError('PUSH_REGISTER_FAILED', err);
  }
}

/**
 * Ayni bildirim yanitinin iki kez yonlendirmemesi icin. Uygulama kapaliyken
 * gelen bildirime dokunuldugunda `getLastNotificationResponseAsync()` acilista
 * onu dondurur; hook yeniden monte olursa ayni yanit tekrar gelir.
 */
const handledResponses = new Set<string>();

/**
 * Bildirime dokunuldugunda ilgili ekrana gider. Uygulama acikken gelen
 * dokunuslari dinler, kapaliyken acilmis olma ihtimalini de acilista bir kez
 * kontrol eder. Ogrenci yigininin icinde (oturum dogrulandiktan sonra)
 * cagrilmali ki yonlendirilen ekranlar mevcut olsun.
 */
export function useNotificationRouting(): void {
  const router = useRouter();

  useEffect(() => {
    if (!canRegisterPush()) return;

    let cancelled = false;
    let subscription: { remove: () => void } | undefined;

    const handle = (response: {
      notification: { request: { identifier: string; content: { data?: unknown } } };
    }) => {
      const key = response.notification.request.identifier;
      if (handledResponses.has(key)) return;
      handledResponses.add(key);

      const data = (response.notification.request.content.data ?? {}) as PushPayload;
      router.push(hrefForPush(data));
    };

    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        if (cancelled) return;

        subscription = Notifications.addNotificationResponseReceivedListener(handle);

        // Uygulama bildirime dokunularak acildiysa yanit burada bekliyor olur.
        const last = await Notifications.getLastNotificationResponseAsync();
        if (!cancelled && last) handle(last);
      } catch (err) {
        logHandledError('PUSH_ROUTING_FAILED', err);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [router]);
}
