import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Segmented, Txt } from '@/components/ui';
import { tasksForDay, tasksInRange, todayMinutes } from '@/db/repo';
import type { Task } from '@/db/types';
import { monthRange, weekRange } from '@/lib/date';
import { Rules } from '@/lib/gamification';
import { useHamburgerMenu } from '@/lib/hamburger-menu-context';
import { useStudent } from '@/lib/session';
import { Palette, Space } from '@/theme/tokens';

type RangeKey = 'daily' | 'weekly' | 'monthly';

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'daily', label: 'Günlük' },
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
];

export default function Tasks() {
  const db = useSQLiteContext();
  const student = useStudent();
  const { open: openMenu } = useHamburgerMenu();

  const [range, setRange] = useState<RangeKey>('daily');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [minutesToday, setMinutesToday] = useState(0);

  const load = useCallback(async () => {
    if (range === 'daily') {
      const [t, m] = await Promise.all([tasksForDay(db, student.id), todayMinutes(db, student.id)]);
      setTasks(t);
      setMinutesToday(m);
      return;
    }
    const [from, to] = range === 'weekly' ? weekRange() : monthRange();
    setTasks(await tasksInRange(db, student.id, from, to));
  }, [db, student.id, range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const doneCount = tasks.filter((t) => t.completed_at).length;

  const pomodoroRow = useMemo(
    () =>
      range === 'daily'
        ? {
            title: `${Rules.dailyGoalMinutes} Dakika Odaklan`,
            subtitle: 'Pomodoro',
            done: Math.min(minutesToday, Rules.dailyGoalMinutes),
            target: Rules.dailyGoalMinutes,
          }
        : null,
    [range, minutesToday]
  );

  return (
    <Screen tint={Palette.green}>
      <ScreenHeader
        title="Görevlerin"
        subtitle={`${doneCount}/${tasks.length}${pomodoroRow ? ' + odak hedefin' : ''} tamamlandı`}
        right={<IconButton icon="menu" onPress={openMenu} />}
      />

      <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} color={Palette.green} />

      {tasks.length === 0 && !pomodoroRow ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Bu aralıkta görev yok"
          subtitle="Yeni görevler atandığında burada göreceksin."
          color={Palette.green}
        />
      ) : (
        <View style={styles.list}>
          {pomodoroRow ? (
            <TaskRow
              title={pomodoroRow.title}
              subtitle={pomodoroRow.subtitle}
              done={pomodoroRow.done}
              target={pomodoroRow.target}
              icon="time"
              color={Palette.purple}
            />
          ) : null}
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              title={task.title}
              subtitle="Bitir"
              done={task.done}
              target={task.target}
              icon="flash"
              color={Palette.gold}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function TaskRow({
  title,
  subtitle,
  done,
  target,
  icon,
  color,
}: {
  title: string;
  subtitle: string;
  done: number;
  target: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  const completed = target > 0 && done >= target;
  const progress = target === 0 ? 0 : done / target;

  return (
    <Card style={styles.row}>
      <View style={styles.rowTop}>
        <IconBubble name={completed ? 'checkmark-circle' : icon} color={completed ? Palette.green : color} size={40} />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {title}
          </Txt>
          <Txt variant="tiny" color={Palette.textFaint}>
            {subtitle}
          </Txt>
        </View>
        <Txt variant="smallStrong" color={completed ? Palette.green : Palette.text}>
          {done}/{target}
        </Txt>
      </View>
      <ProgressBar progress={progress} color={completed ? Palette.green : color} height={7} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    gap: Space.md,
  },
  row: {
    gap: Space.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
