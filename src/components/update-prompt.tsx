import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { logHandledError } from '@/lib/crash-reporter';
import { isUpdateAvailable } from '@/lib/play-update';

import { AppDialog } from './app-dialog';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.triworkster.kocumbenimmobileapp';

/**
 * Play Store'da yeni surum yayinlandiysa "Guncelle" pop-up'ini gosterir.
 * Surum bilgisi Google Play'den gelir; yani pop-up ancak guncelleme gercekten
 * indirilebilir oldugunda cikar (inceleme bitmeden cikmaz).
 * Acilista ve uygulama arka plandan donunce kontrol eder; bir acilista en fazla bir kez gosterir.
 */
export function UpdatePrompt({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const check = () => {
      if (shown.current) return;
      isUpdateAvailable().then((available) => {
        if (!available || cancelled || shown.current) return;
        shown.current = true;
        setVisible(true);
      });
    };

    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [enabled]);

  const update = useCallback(() => {
    setVisible(false);
    Linking.openURL(PLAY_STORE_URL).catch((err) => logHandledError('UPDATE_OPEN_STORE', err));
  }, []);

  return (
    <AppDialog
      visible={visible}
      icon="cloud-download-outline"
      title="Yeni güncelleme mevcut"
      message="Uygulamanın yeni bir sürümü yayında. Güncelleyerek en yeni özelliklerden ve düzeltmelerden yararlan."
      confirmLabel="Güncelle"
      cancelLabel="Sonra"
      onConfirm={update}
      onCancel={() => setVisible(false)}
    />
  );
}
