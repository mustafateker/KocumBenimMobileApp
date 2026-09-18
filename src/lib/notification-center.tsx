import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { getNotifications } from './api';
import { useSession } from './session';

/**
 * Basliktaki zil ikonunun okunmamis sayaci. Tek yerde tutuluyor ki her sekme
 * ayni degeri gostersin, ekran degistirmek yeni bir istek acmasin ve
 * Bildirimler ekraninda bir kayit okundugunda rozet hemen guncellensin.
 */
type NotificationCenterValue = {
  unread: number;
  /** Sunucudan tazeler — ekran odaklandiginda ve uygulama one geldiginde. */
  refresh: () => void;
  /** Bir bildirim okundu isaretlendiginde sayaci beklemeden dusurur. */
  markOneRead: () => void;
};

const NotificationCenterContext = createContext<NotificationCenterValue | null>(null);

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    if (userId === null) return;
    getNotifications()
      .then((res) => setUnread(res.data.filter((n) => !n.read).length))
      .catch(() => {
        // Ag hatasi rozeti bozmasin; onceki sayi kalir.
      });
  }, [userId]);

  const markOneRead = useCallback(() => setUnread((n) => Math.max(0, n - 1)), []);

  useEffect(() => {
    refresh();

    // Bildirim uygulama arka plandayken gelmis olabilir: one dondugunde tazele.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  // Cikis yapildiginda sayac sifirlanir: state'i efekt icinde sifirlamak
  // yerine turetiyoruz, boylece oturum degisimi fazladan render tetiklemez.
  const value = useMemo(
    () => ({ unread: userId === null ? 0 : unread, refresh, markOneRead }),
    [userId, unread, refresh, markOneRead]
  );

  return (
    <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error('useNotificationCenter, NotificationCenterProvider icinde kullanilmali');
  return ctx;
}
