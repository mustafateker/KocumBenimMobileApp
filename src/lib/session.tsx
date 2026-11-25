import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  ApiError,
  clearTokens,
  getRefreshToken,
  hasAccessToken,
  loadStoredTokens,
  setTokens as persistTokens,
} from './api-client';
import {
  AppleLoginInput,
  getMe,
  login as apiLogin,
  loginWithApple as apiLoginWithApple,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  studentSignup,
} from './api';
import { CacheKeys, CacheTTL, clearAllAppCache, getCachedData, setCachedData } from './cache';
import { registerForPushNotifications } from './push-notifications';
import type { Student } from './types';

export type AuthProviderType = 'email' | 'google' | 'apple' | null;
const AUTH_PROVIDER_KEY = 'kocumbenim.auth.provider';

type SessionValue = {
  user: Student | null;
  /** Kullanicinin hangi yontemle oturum actigi (Apple hesap silme iptali icin). */
  authProvider: AuthProviderType;
  /** Ilk acilista kayitli oturum okunana kadar true. */
  loading: boolean;
  /** Basarisizsa ApiError firlatir; hatayi gosterme isi cagirana aittir. */
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  /** Google idToken ile giris yapar veya ogrenci hesabi acar. */
  signInWithGoogle: (idToken: string) => Promise<void>;
  /** Apple kimlik bilgileri ile giris yapar veya ogrenci hesabi acar. */
  signInWithApple: (input: AppleLoginInput) => Promise<void>;
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
  const [authProvider, setAuthProvider] = useState<AuthProviderType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [, storedProvider, cachedUser] = await Promise.all([
          loadStoredTokens(),
          AsyncStorage.getItem(AUTH_PROVIDER_KEY).catch(() => null),
          getCachedData<Student>(CacheKeys.USER_PROFILE, true),
        ]);

        if (!hasAccessToken()) {
          if (!cancelled) setLoading(false);
          return;
        }

        // 1. Önbellekte kayıtlı öğrenci varsa beklemeden anında yükle (0ms açılış)
        if (cachedUser && cachedUser.role === 'student' && !cancelled) {
          setUser(cachedUser);
          if (storedProvider === 'email' || storedProvider === 'google' || storedProvider === 'apple') {
            setAuthProvider(storedProvider);
          }
          setLoading(false);
        }

        // 2. Arka planda sunucudan taze profil bilgisini al (Stale-While-Revalidate)
        try {
          const me = await getMe();
          if (me.role !== 'student') {
            await clearTokens();
            await clearAllAppCache();
            if (!cancelled) {
              setUser(null);
              setAuthProvider(null);
            }
            return;
          }
          if (!cancelled) {
            setUser(me);
            void setCachedData(CacheKeys.USER_PROFILE, me, CacheTTL.HOUR_24);
            if (storedProvider === 'email' || storedProvider === 'google' || storedProvider === 'apple') {
              setAuthProvider(storedProvider);
            }
          }
        } catch (netErr: any) {
          if (netErr?.status === 401) {
            await clearTokens();
            await clearAllAppCache();
            if (!cancelled) {
              setUser(null);
              setAuthProvider(null);
            }
          }
        }
      } catch {
        await clearTokens();
        await clearAllAppCache();
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
    const cleanEmail = email.trim().toLowerCase();
    const { user: signedInUser, tokens } = await apiLogin(cleanEmail, password, remember);

    if (signedInUser.role !== 'student') {
      await clearTokens();
      throw new ApiError(
        403,
        'FORBIDDEN_ROLE',
        'Bu mobil uygulama yalnızca öğrenci hesapları içindir. Koç / Öğretmen hesabınızla web yönetim panelinden giriş yapabilirsiniz.'
      );
    }

    await persistTokens(tokens, remember);
    await AsyncStorage.setItem(AUTH_PROVIDER_KEY, 'email').catch(() => {});
    await setCachedData(CacheKeys.USER_PROFILE, signedInUser, CacheTTL.HOUR_24);
    setAuthProvider('email');
    setUser(signedInUser);
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const { user: signedInUser, tokens } = await apiLoginWithGoogle(idToken);
    if (signedInUser.role !== 'student') {
      await clearTokens();
      throw new ApiError(
        403,
        'FORBIDDEN_ROLE',
        'Bu mobil uygulama yalnızca öğrenci hesapları içindir.'
      );
    }
    await persistTokens(tokens, true);
    await AsyncStorage.setItem(AUTH_PROVIDER_KEY, 'google').catch(() => {});
    await setCachedData(CacheKeys.USER_PROFILE, signedInUser, CacheTTL.HOUR_24);
    setAuthProvider('google');
    setUser(signedInUser);
  }, []);

  const signInWithApple = useCallback(async (input: AppleLoginInput) => {
    const { user: signedInUser, tokens } = await apiLoginWithApple(input);
    if (signedInUser.role !== 'student') {
      await clearTokens();
      throw new ApiError(
        403,
        'FORBIDDEN_ROLE',
        'Bu mobil uygulama yalnızca öğrenci hesapları içindir.'
      );
    }
    await persistTokens(tokens, true);
    await AsyncStorage.setItem(AUTH_PROVIDER_KEY, 'apple').catch(() => {});
    await setCachedData(CacheKeys.USER_PROFILE, signedInUser, CacheTTL.HOUR_24);
    setAuthProvider('apple');
    setUser(signedInUser);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { user: newUser, tokens } = await studentSignup(email.trim().toLowerCase(), password);
    await persistTokens(tokens, true);
    await AsyncStorage.setItem(AUTH_PROVIDER_KEY, 'email').catch(() => {});
    await setCachedData(CacheKeys.USER_PROFILE, newUser, CacheTTL.HOUR_24);
    setAuthProvider('email');
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    setUser(null);
    setAuthProvider(null);
    await Promise.all([
      clearTokens(),
      clearAllAppCache(),
      AsyncStorage.removeItem(AUTH_PROVIDER_KEY).catch(() => {}),
    ]);
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
      void setCachedData(CacheKeys.USER_PROFILE, fresh, CacheTTL.HOUR_24);
    } catch {
      // Gecici bir aglama hatasi ekrani bozmasin — mevcut deger korunur.
    }
  }, [user]);

  const handleSetUser = useCallback((updated: Student) => {
    setUser(updated);
    void setCachedData(CacheKeys.USER_PROFILE, updated, CacheTTL.HOUR_24);
  }, []);

  const value = useMemo(
    () => ({ user, authProvider, loading, signIn, signInWithGoogle, signInWithApple, signUp, signOut, refresh, setUser: handleSetUser }),
    [user, authProvider, loading, signIn, signInWithGoogle, signInWithApple, signUp, signOut, refresh, handleSetUser]
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
