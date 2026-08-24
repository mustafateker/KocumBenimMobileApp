/**
 * Oyunlastirma kurallari tek yerde.
 *
 * Ekranlar bu dosyadan okur; boylece "1 dakika kac XP" gibi bir karar
 * degistiginde tum uygulama ayni anda guncellenir.
 */

export const Rules = {
  /** Odaklanilan her dakika icin kazanilan XP */
  xpPerMinute: 2,
  /** Bir gunluk gorevi bitirmenin odulu */
  xpPerTask: 50,
  /** Soru gonderince (utanmadan sormak da odullendirilir) */
  xpPerQuestion: 10,
  /** Streak'in kirilmamasi icin gereken gunluk odak dakikasi */
  dailyGoalMinutes: 60,
  /** Oyun odasinin acilmasi icin gereken gunluk odak dakikasi */
  gameUnlockMinutes: 45,
} as const;

/** Seviye esikleri — kumulatif XP. Sirali olmali. */
export const Levels = [
  { level: 1, title: 'Çırak', minXp: 0 },
  { level: 2, title: 'Meraklı Zihin', minXp: 200 },
  { level: 3, title: 'Formül Avcısı', minXp: 500 },
  { level: 4, title: 'Kalfa', minXp: 1000 },
  { level: 5, title: 'Denklem Ustası', minXp: 2000 },
  { level: 6, title: 'Geometri Şövalyesi', minXp: 3500 },
  { level: 7, title: 'Sayıların Efendisi', minXp: 5500 },
  { level: 8, title: 'Matematik Dehası', minXp: 8000 },
] as const;

export type LevelInfo = {
  level: number;
  title: string;
  /** Bu seviyede kazanilmis XP */
  xpIntoLevel: number;
  /** Bu seviyenin toplam genisligi. Son seviyede 0 olur. */
  xpForLevel: number;
  /** 0-1 arasi ilerleme. Son seviyede her zaman 1. */
  progress: number;
  nextTitle: string | null;
};

export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let index = 0;
  for (let i = 0; i < Levels.length; i++) {
    if (safeXp >= Levels[i].minXp) index = i;
  }

  const current = Levels[index];
  const next = Levels[index + 1] ?? null;
  const xpIntoLevel = safeXp - current.minXp;
  const xpForLevel = next ? next.minXp - current.minXp : 0;

  return {
    level: current.level,
    title: current.title,
    xpIntoLevel,
    xpForLevel,
    progress: next ? Math.min(1, xpIntoLevel / xpForLevel) : 1,
    nextTitle: next?.title ?? null,
  };
}

/** Bir odak oturumunun kazandirdigi XP. */
export function sessionReward(durationSec: number) {
  const minutes = Math.floor(durationSec / 60);
  return { minutes, xp: minutes * Rules.xpPerMinute };
}

/**
 * Streak guncellemesi. Gun atlanmissa sifirlanir, ayni gunse degismez.
 * Tarihler 'YYYY-MM-DD' formatinda.
 */
export function nextStreak(currentStreak: number, lastDate: string | null, today: string): number {
  if (!lastDate) return 1;
  if (lastDate === today) return currentStreak;

  const diffDays = Math.round(
    (Date.parse(today + 'T00:00:00') - Date.parse(lastDate + 'T00:00:00')) / 86_400_000
  );
  return diffDays === 1 ? currentStreak + 1 : 1;
}

/** Bugunku odak dakikasina gore oyun odasinin durumu. */
export function gameGate(focusedMinutes: number) {
  const remaining = Math.max(0, Rules.gameUnlockMinutes - focusedMinutes);
  return {
    unlocked: remaining === 0,
    remainingMinutes: remaining,
    progress: Math.min(1, focusedMinutes / Rules.gameUnlockMinutes),
  };
}
