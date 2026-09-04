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
