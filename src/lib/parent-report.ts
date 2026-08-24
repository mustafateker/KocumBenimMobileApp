import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { Share } from 'react-native';

import type { StudentSummary } from '@/db/types';
import { humanDuration } from '@/lib/date';
import { levelFromXp } from '@/lib/gamification';

export type ReportData = {
  summary: StudentSummary;
  week: { day: string; minutes: number }[];
  unansweredQuestions: number;
  teacherName: string;
};

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function longDayLabel(key: string) {
  return DAY_NAMES[new Date(key + 'T00:00:00').getDay()];
}

/** Kullanicinin yazdigi metinlerin HTML'i bozmamasi icin. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** WhatsApp'a yapistirilabilecek kisa ozet. */
export function reportText(data: ReportData): string {
  const { summary, week, unansweredQuestions } = data;
  const level = levelFromXp(summary.user.xp);
  const activeDays = week.filter((d) => d.minutes > 0).length;

  return [
    `${summary.user.name} - Haftalık Matematik Çalışma Raporu`,
    '',
    `Toplam odak: ${humanDuration(summary.weekMinutes * 60)}`,
    `Çalışılan gün: ${activeDays}/7`,
    `Tamamlanan görev: ${summary.tasksDone}/${summary.tasksTotal}`,
    `Günlük seri: ${summary.user.streak} gün`,
    `Seviye: ${level.level} - ${level.title}`,
    `Cevap bekleyen soru: ${unansweredQuestions}`,
    '',
    `${data.teacherName} tarafından Koçum Benim ile hazırlandı.`,
  ].join('\n');
}

/** Yazdirmaya uygun HTML rapor. */
function reportHtml(data: ReportData): string {
  const { summary, week, unansweredQuestions, teacherName } = data;
  const level = levelFromXp(summary.user.xp);
  const peak = Math.max(1, ...week.map((d) => d.minutes));
  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const bars = week
    .map((d) => {
      const height = Math.round((d.minutes / peak) * 90);
      return `
        <div class="bar-col">
          <div class="bar-value">${d.minutes || ''}</div>
          <div class="bar" style="height:${Math.max(3, height)}px"></div>
          <div class="bar-label">${longDayLabel(d.day).slice(0, 3)}</div>
        </div>`;
    })
    .join('');

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #3E3560; margin: 0; padding: 36px 40px; background: #ffffff;
  }
  .head { display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 3px solid #8B6BD9; padding-bottom: 16px; }
  h1 { margin: 0; font-size: 26px; }
  .sub { color: #7A6F99; font-size: 13px; margin-top: 4px; }
  .badge { background: #E7DEFB; color: #8B6BD9; padding: 8px 14px;
           border-radius: 999px; font-size: 13px; font-weight: 700; }
  .tiles { display: flex; gap: 12px; margin: 24px 0; }
  .tile { flex: 1; background: #F4F0FD; border-radius: 14px; padding: 16px; text-align: center; }
  .tile .n { font-size: 22px; font-weight: 800; color: #8B6BD9; }
  .tile .l { font-size: 11px; color: #7A6F99; margin-top: 2px; }
  h2 { font-size: 15px; margin: 26px 0 12px; }
  .chart { display: flex; align-items: flex-end; gap: 10px; height: 130px;
           border-bottom: 1px solid #E4DAF7; padding-bottom: 6px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
  .bar { width: 100%; background: #8B6BD9; border-radius: 6px 6px 0 0; }
  .bar-value { font-size: 10px; color: #7A6F99; margin-bottom: 4px; }
  .bar-label { font-size: 10px; color: #7A6F99; margin-top: 6px; }
  .foot { margin-top: 32px; font-size: 11px; color: #A79FC0; text-align: center;
          border-top: 1px solid #E4DAF7; padding-top: 14px; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h1>${escapeHtml(summary.user.name)}</h1>
      <div class="sub">${escapeHtml(summary.user.grade ?? '')} &middot; Haftalık matematik raporu &middot; ${today}</div>
    </div>
    <div class="badge">Seviye ${level.level} - ${escapeHtml(level.title)}</div>
  </div>

  <div class="tiles">
    <div class="tile"><div class="n">${humanDuration(summary.weekMinutes * 60)}</div><div class="l">toplam odak</div></div>
    <div class="tile"><div class="n">${summary.tasksDone}/${summary.tasksTotal}</div><div class="l">görev</div></div>
    <div class="tile"><div class="n">${summary.user.streak}</div><div class="l">günlük seri</div></div>
    <div class="tile"><div class="n">${unansweredQuestions}</div><div class="l">bekleyen soru</div></div>
  </div>

  <h2>Günlük çalışma süresi (dakika)</h2>
  <div class="chart">${bars}</div>

  <div class="foot">${escapeHtml(teacherName)} tarafından Koçum Benim ile hazırlandı.</div>
</body>
</html>`;
}

/** Dosya adinda kullanilamayacak karakterleri temizler. */
function slug(value: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  return value
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * PDF uretip paylasim sayfasini acar.
 * Paylasim desteklenmeyen ortamlarda (web) metin paylasimina duser.
 */
export async function shareReportPdf(data: ReportData) {
  if (!(await isAvailableAsync())) {
    await Share.share({ message: reportText(data) });
    return;
  }

  // expo-print ciktisini uygulamanin ham onbellegine yaziyor. Expo Go'da bu
  // yol deneyimin kapsami disinda kaldigi icin ne okunabiliyor ne de
  // paylasilabiliyor ("Not allowed to read file under given URL"). Bu yuzden
  // PDF'i base64 olarak alip kapsam icindeki bir dosyaya kendimiz yaziyoruz;
  // veliye giden dosya da boylece anlamli bir isimle ulasiyor.
  const { base64 } = await Print.printToFileAsync({ html: reportHtml(data), base64: true });
  if (!base64) throw new Error('PDF oluşturulamadı.');

  const target = new File(Paths.cache, `${slug(data.summary.user.name)}-haftalik-rapor.pdf`);
  if (target.exists) target.delete();
  target.create();
  target.write(base64, { encoding: 'base64' });

  await shareAsync(target.uri, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Veli raporu',
  });
}

/** Kisa ozeti sistem paylasim sayfasiyla (WhatsApp dahil) gonderir. */
export async function shareReportText(data: ReportData) {
  await Share.share({ message: reportText(data) });
}
