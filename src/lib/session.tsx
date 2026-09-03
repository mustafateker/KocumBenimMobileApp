import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createStudentAccount, getUser, getUserByEmail, verifyEmailPassword } from '@/db/repo';
import type { User } from '@/db/types';

const STORAGE_KEY = 'kocumbenim.session.userId';

export type SignUpResult = { ok: true } | { ok: false; error: string };

type SessionValue = {
  user: User | null;
  /** Ilk acilista kayitli oturum okunana kadar true. */
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
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
    async (email: string, password: string, remember = true) => {
      const found = await verifyEmailPassword(db, email, password);
      if (!found) return false;

      setUser(found);
      // "Beni Hatirla" kapaliysa oturum sadece bu calisma boyunca surer —
      // uygulama yeniden acildiginda tekrar giris istenir.
      if (remember) {
        await AsyncStorage.setItem(STORAGE_KEY, String(found.id));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      return true;
    },
    [db]
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const trimmed = email.trim().toLowerCase();
      const existing = await getUserByEmail(db, trimmed);
      if (existing) return { ok: false, error: 'Bu e-posta ile zaten bir hesap var.' };

      const created = await createStudentAccount(db, { email: trimmed, password });
      setUser(created);
      await AsyncStorage.setItem(STORAGE_KEY, String(created.id));
      return { ok: true };
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
    () => ({ user, loading, signIn, signUp, signOut, refresh }),
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
export function useStudent(): User {
  const { user } = useSession();
  if (!user || user.role !== 'student') {
    throw new Error('Bu ekran yalnizca ogrenci oturumunda kullanilabilir');
  }
  return user;
}
