import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Koçum Benim - Güvenli ve Hafif Yerel Önbellek Sistemi (Cache)
 *
 * Tasarım İlkeleri ve Apple / Google Uyumluluğu:
 * 1. Apple App Store Guideline 5.1.1 (Veri Toplama ve Güvenlik):
 *    - Önbellek yalnızca uygulama içi çalışma/ders özetlerini içerir; şifre, token veya kişisel hassas veri tutulmaz.
 *    - Oturum kapatıldığında veya kullanıcı hesabını sildiğinde tüm önbellek kökten temizlenir (`clearAllAppCache`).
 * 2. Stale-While-Revalidate:
 *    - Uygulama açılışında veya sekme geçişlerinde önce yerel önbellekteki veri anında ekrana basılır (0ms gecikme).
 *    - Arka planda sunucudan taze veri çekilip arayüz sessizce güncellenir.
 * 3. Bellek İçi (In-Memory) + Kalıcı Depolama (AsyncStorage):
 *    - Aynı oturum içindeki okumalar bellek içi Map üzerinden 0ms'de döner, I/O yükü yapmaz.
 */

const CACHE_PREFIX = 'kocumbenim.cache.';

type CacheEnvelope<T> = {
  data: T;
  cachedAt: number;
  ttlMs: number;
};

// 0ms bellek ici LRU-benzeri Map katmani
const memoryStore = new Map<string, CacheEnvelope<any>>();

export const CacheKeys = {
  USER_PROFILE: 'user_profile',
  HOME_TASKS: 'home_tasks',
  HOME_SUMMARY: 'home_summary',
  HOME_AI_CONTEXT: 'home_ai_context',
  HOME_NEXT_LESSON: 'home_next_lesson',
  CURRICULUM_PROGRESS: 'curriculum_progress',
  CURRICULUM_EXTRA: 'curriculum_extra',
} as const;

export const CacheTTL = {
  MINUTE_5: 5 * 60 * 1000,
  MINUTE_15: 15 * 60 * 1000,
  HOUR_1: 60 * 60 * 1000,
  HOUR_24: 24 * 60 * 60 * 1000,
} as const;

/**
 * Önbellekten veriyi getirir. Bellek içindeyse 0ms'de, değilse AsyncStorage'dan okur.
 * TTL dolmuşsa null döner (isteğe bağlı ignoreExpiry=true ile bayat veri de alınabilir).
 */
export async function getCachedData<T>(
  key: string,
  ignoreExpiry = false
): Promise<T | null> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();

  // 1. Bellek katmanı
  const mem = memoryStore.get(fullKey);
  if (mem) {
    if (ignoreExpiry || now - mem.cachedAt < mem.ttlMs) {
      return mem.data as T;
    }
  }

  // 2. Kalıcı disk katmanı
  try {
    const raw = await AsyncStorage.getItem(fullKey);
    if (!raw) return null;

    const parsed: CacheEnvelope<T> = JSON.parse(raw);
    memoryStore.set(fullKey, parsed);

    if (ignoreExpiry || now - parsed.cachedAt < parsed.ttlMs) {
      return parsed.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Veriyi hem bellek içi Map'e hem de kalıcı depolamaya yazar.
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlMs: number = CacheTTL.MINUTE_15
): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const envelope: CacheEnvelope<T> = {
    data,
    cachedAt: Date.now(),
    ttlMs,
  };

  memoryStore.set(fullKey, envelope);

  try {
    await AsyncStorage.setItem(fullKey, JSON.stringify(envelope));
  } catch {
    // Depolama hatası akışı bozmaz
  }
}

/**
 * Belirli bir anahtarı önbellekten siler.
 */
export async function removeCachedData(key: string): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  memoryStore.delete(fullKey);
  try {
    await AsyncStorage.removeItem(fullKey);
  } catch {}
}

/**
 * Oturum kapatıldığında veya hesap silindiğinde tüm önbelleği temizler (Apple Guideline 5.1.1).
 */
export async function clearAllAppCache(): Promise<void> {
  memoryStore.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {}
}
