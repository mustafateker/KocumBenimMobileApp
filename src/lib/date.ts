/** Tarih anahtarlari her yerde yerel saate gore 'YYYY-MM-DD'. */

export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dayKey();
}

/** Bugun dahil, eskiden yeniye son n gunun anahtarlari. */
export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export function dayLabel(key: string): string {
  const d = new Date(key + 'T00:00:00');
  return DAY_LABELS[d.getDay()];
}

/** 3725 -> "1s 2dk" · 180 -> "3dk" */
export function humanDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}s ${m}dk` : `${h}s`;
  if (m > 0) return `${m}dk`;
  return `${total}sn`;
}

/** Zamanlayici icin 05:00 bicimi. */
export function clockFormat(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/** "2 saat once" gibi kisa bagil zaman. */
export function relativeTime(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR');
}
