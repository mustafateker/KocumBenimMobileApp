import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  clearTokens,
  getRefreshToken,
  hasAccessToken,
  loadStoredTokens,
  setTokens as persistTokens,
} from './api-client';
import { getMe, login as apiLogin, logout as apiLogout, studentSignup } from './api';
import { registerForPushNotifications } from './push-notifications';
import type { Student } from './types';

type SessionValue = {
  user: Student | null;
  /** Ilk acilista kayitli oturum okunana kadar true. */
  loading: boolean;
  /** Basarisizsa ApiError firlatir; hatayi gosterme isi cagirana aittir. */
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  /** Basarisizsa ApiError firlatir (CONFLICT: e-posta zaten kayitli). */
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** XP/coin degistikten sonra ust bardaki degerleri tazelemek icin. */
  refresh: () => Promise<void>;
  /**
   * Bir mutasyon endpoint'i (ornegin /me/onboarding, /me) zaten guncel
   * Student'i donduruyorsa, ayri bir GET /me atmak yerine dogrudan bunu
   * kullan. Boylece refresh()'in sessizce yuttugu bir aglama hatasi,
   * zaten basarili olmus bir islemin sonucunu geciktirmez.
   */
  setUser: (user: Student) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadStoredTokens();
        if (!hasAccessToken()) return;
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        // Token gecersiz/suresi dolmus ve refresh basarisizsa oturumsuz baslamak dogru davranis.
        await clearTokens();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Sadece oturum acan/degisen kullanicida bir kez calissin diye id'ye bagli —
    // refresh() sonrasi ayni kullanici icin yeni obje referansi geldiginde tekrar tetiklenmemeli.
    if (user) registerForPushNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const signIn = useCallback(async (email: string, password: string, remember = true) => {
    const { user: signedInUser, tokens } = await apiLogin(email.trim(), password, remember);
    await persistTokens(tokens, remember);
    setUser(signedInUser);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { user: newUser, tokens } = await studentSignup(email.trim().toLowerCase(), password);
    await persistTokens(tokens, true);
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    setUser(null);
    await clearTokens();
    if (refreshToken) {
      apiLogout(refreshToken).catch(() => {
        // Cikis her halukarda yerelde tamamlanir; sunucu tarafi en iyi cabayla iptal edilir.
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const fresh = await getMe();
      setUser(fresh);
    } catch {
      // Gecici bir aglama hatasi ekrani bozmasin — mevcut deger korunur.
    }
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, refresh, setUser }),
    [user, loading, signIn, signUp, signOut, refresh]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession, SessionProvider icinde kullanilmali');
  return ctx;
}

/**
 * Ogrenci ekranlari icin kisayol. Ogrenci disi bir rolde cagrilirsa
 * hata firlatir — yanlis rolun ekrani sessizce bos gostermesindense
 * gelistirme sirasinda patlamasi iyidir.
 */
export function useStudent(): Student {
  const { user } = useSession();
  if (!user || user.role !== 'student') {
    throw new Error('Bu ekran yalnizca ogrenci oturumunda kullanilabilir');
  }
  return user;
}
