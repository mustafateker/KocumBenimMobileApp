import { StyleSheet, View } from 'react-native';

import { dayLabel, todayKey } from '@/lib/date';
import { Accent, Palette, Radius, Space } from '@/theme/tokens';

import { Txt } from './ui';

/**
 * Son gunlerin odak dakikalari. Bugun vurgulanir, hedef cizgisi
 * gunluk hedefin nerede oldugunu gosterir.
 */
export function WeekBars({
  data,
  goalMinutes,
  color = Accent,
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
              <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
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
});
