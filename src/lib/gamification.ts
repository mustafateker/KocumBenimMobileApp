/**
 * Oyunlastirma kurallari — gercek hesap backend'de yapilir (API_SPEC.md §5),
 * istemci hile yapabileceginden guven sinirlari orada. Burada yalnizca
 * arayuzde gosterilen sabitler tutulur (ornek: gunluk hedef cubugu).
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
} as const;

export type LevelInfo = {
  level: number;
  title: string;
  floorXp: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressPercent: number;
};

export const LEVEL_TITLES = [
  'Çırak Kaşif',
  'İstikrarlı Yolcu',
  'Odak Mimarı',
  'Görev Avcısı',
  'Disiplin Ustası',
  'Soru Stratejisti',
  'Zirve Adayı',
  'Maraton Koşucusu',
  'Akademi Lideri',
  'Sınav Şampiyonu',
] as const;

export function getLevelInfo(xpRaw?: number | null): LevelInfo {
  const xp = Math.max(0, xpRaw || 0);
  const XP_PER_LEVEL = 500;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const floorXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const currentLevelXp = xp - floorXp;
  const progressPercent = Math.min(1, Math.max(0.08, currentLevelXp / XP_PER_LEVEL));

  const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
  const title = LEVEL_TITLES[titleIndex];

  return {
    level,
    title,
    floorXp,
    nextLevelXp,
    currentLevelXp,
    progressPercent,
  };
}
