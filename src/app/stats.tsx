import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Txt } from '@/components/ui';
import { completedTasksForStudent, dailyMinutes, taskStats } from '@/db/repo';
import type { Task } from '@/db/types';
import { relativeTime } from '@/lib/date';
import { Rules } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import { Border, Palette, Radius, Space } from '@/theme/tokens';

export default function Stats() {
  const db = useSQLiteContext();
  const student = useStudent();
  const router = useRouter();

  const [stats, setStats] = useState({ total: 0, done: 0 });
  const [week, setWeek] = useState<{ day: string; minutes: number }[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([taskStats(db, student.id), dailyMinutes(db, student.id, 7), completedTasksForStudent(db, student.id)]).then(
        ([s, w, c]) => {
          setStats(s);
          setWeek(w);
          setCompleted(c);
        }
      );
    }, [db, student.id])
  );

  const rate = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return (
    <Screen tint={Palette.blue}>
      <ScreenHeader title="İstatistiklerin" subtitle="Görev tamamlama geçmişin" onBack={() => router.back()} />

      <View style={styles.tiles}>
        <StatTile icon="checkmark-done" color={Palette.blue} value={String(stats.done)} label="Tamamlanan" />
        <StatTile icon="list" color={Palette.purple} value={String(stats.total)} label="Toplam Görev" />
        <StatTile icon="trending-up" color={Palette.green} value={`%${rate}`} label="Tamamlama Oranı" />
      </View>

      <Card>
        <Txt variant="section" style={styles.cardTitle}>
          Son 7 gün odak süren
        </Txt>
        <WeekBars data={week} goalMinutes={Rules.dailyGoalMinutes} color={Palette.blue} />
      </Card>

      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Tamamlanan Görevler
        </Txt>

        {completed.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="Henüz tamamlanmış görev yok"
            subtitle="İlk görevini bitirdiğinde burada listelenecek."
            color={Palette.blue}
          />
        ) : (
          <View style={styles.list}>
            {completed.map((task) => (
              <Card key={task.id} style={styles.row}>
                <IconBubble name="checkmark-circle" color={Palette.green} size={40} />
                <View style={styles.flex}>
                  <Txt variant="bodyStrong" numberOfLines={1}>
                    {task.title}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint}>
                    {task.target} soru · tamamlandı {relativeTime(task.completed_at ?? task.due_date)}
                  </Txt>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function StatTile({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: color + '18', borderColor: color }]}>
      <IconBubble name={icon} color={color} size={36} />
      <Txt variant="section" color={color}>
        {value}
      </Txt>
      <Txt variant="tiny" color={Palette.textDim}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  tile: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
  },
  cardTitle: {
    marginBottom: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  list: {
    gap: Space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
