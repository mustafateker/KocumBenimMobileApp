import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getUser, verifyPin } from '@/db/repo';
import type { User } from '@/db/types';

const STORAGE_KEY = 'kocumbenim.session.userId';

type SessionValue = {
  user: User | null;
  /** Ilk acilista kayitli oturum okunana kadar true. */
  loading: boolean;
  signIn: (userId: number, pin: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /** XP/coin degistikten sonra ust bardaki degerleri tazelemek icin. */
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const found = await getUser(db, Number(stored));
          if (!cancelled && found) setUser(found);
        }
      } catch {
        // Depolama okunamazsa oturumsuz baslamak dogru davranis.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const signIn = useCallback(
    async (userId: number, pin: string) => {
      const found = await verifyPin(db, userId, pin);
      if (!found) return false;

      setUser(found);
      await AsyncStorage.setItem(STORAGE_KEY, String(found.id));
      return true;
    },
    [db]
  );

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const fresh = await getUser(db, user.id);
    if (fresh) setUser(fresh);
  }, [db, user]);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refresh }),
    [user, loading, signIn, signOut, refresh]
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
export function useStudent(): User {
  const { user } = useSession();
  if (!user || user.role !== 'student') {
    throw new Error('Bu ekran yalnizca ogrenci oturumunda kullanilabilir');
  }
  return user;
}
