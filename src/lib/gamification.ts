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
} as const;

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
