import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { dayLabel, todayKey } from '@/lib/date';
import { Palette, Radius, Space } from '@/theme/tokens';

import { Txt } from './ui';

/* ------------------------------ haftalik bar ------------------------------- */

/**
 * Son gunlerin odak dakikalari. Bugun vurgulanir, hedef cizgisi
 * gunluk hedefin nerede oldugunu gosterir.
 */
export function WeekBars({
  data,
  goalMinutes,
  color = Palette.blue,
  height = 132,
}: {
  data: { day: string; minutes: number }[];
  goalMinutes?: number;
  color?: string;
  height?: number;
}) {
  const today = todayKey();
  const peak = Math.max(goalMinutes ?? 0, ...data.map((d) => d.minutes), 30);

  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {goalMinutes ? (
          <View style={[styles.goalLine, { bottom: (goalMinutes / peak) * (height - 22) + 22 }]} />
        ) : null}

        {data.map((d) => {
          const isToday = d.day === today;
          const barHeight = Math.max(4, (d.minutes / peak) * (height - 22));
          const barColor = isToday ? color : Palette.surfaceHi;

          return (
            <View key={d.day} style={styles.barCol}>
              <LinearGradient
                colors={isToday ? [color, color + '55'] : [Palette.surfaceHi, Palette.surfaceHi]}
                style={[styles.bar, { height: barHeight, backgroundColor: barColor }]}
              />
              <Txt variant="tiny" color={isToday ? color : Palette.textFaint}>
                {dayLabel(d.day)}
              </Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* --------------------------- saat bazli dagilim ---------------------------- */

/**
 * 24 saatlik odak yogunlugu seridi. Ogrencinin ne zaman verimli oldugunu
 * gorsel olarak gosterir; metin analizi `peakWindow` ile uretilir.
 */
export function HourStrip({ buckets, color = Palette.purple }: { buckets: number[]; color?: string }) {
  const peak = Math.max(1, ...buckets);

  return (
    <View>
      <View style={styles.hourRow}>
        {buckets.map((minutes, hour) => (
          <View
            key={hour}
            style={[
              styles.hourCell,
              {
                backgroundColor: minutes === 0 ? Palette.surfaceHi : color,
                opacity: minutes === 0 ? 0.4 : 0.25 + (minutes / peak) * 0.75,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.hourLabels}>
        <Txt variant="tiny" color={Palette.textFaint}>
          00:00
        </Txt>
        <Txt variant="tiny" color={Palette.textFaint}>
          12:00
        </Txt>
        <Txt variant="tiny" color={Palette.textFaint}>
          23:00
        </Txt>
      </View>
    </View>
  );
}

/**
 * En verimli 2 saatlik pencereyi bulur.
 * Hic veri yoksa null doner — ekran o zaman analiz cumlesini gizler.
 */
export function peakWindow(buckets: number[]): { start: number; end: number; minutes: number } | null {
  const total = buckets.reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  let bestStart = 0;
  let bestSum = -1;
  for (let h = 0; h < 23; h++) {
    const sum = buckets[h] + buckets[h + 1];
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = h;
    }
  }
  return { start: bestStart, end: bestStart + 2, minutes: bestSum };
}

const styles = StyleSheet.create({
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Palette.green + '66',
  },
  hourRow: {
    flexDirection: 'row',
    gap: 2,
    height: 26,
  },
  hourCell: {
    flex: 1,
    borderRadius: 3,
  },
  hourLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});
