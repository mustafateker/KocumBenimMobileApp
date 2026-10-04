import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Txt } from '@/components/ui';
import { getCompletedTasks, getStats } from '@/lib/api';
import { relativeTime } from '@/lib/date';
import { Rules } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import type { StudentStats, Task, TopicBreakdown } from '@/lib/types';
import { Accent, Border, DetailAccent, Palette, Radius, Space } from '@/theme/tokens';

const EMPTY_STATS: StudentStats = {
  totalTasks: 0,
  doneTasks: 0,
  completionRate: 0,
  currentStreak: 0,
  last7Days: [],
  byTopic: [],
};

export default function Stats() {
  useStudent();
  const router = useRouter();

  const [stats, setStats] = useState<StudentStats>(EMPTY_STATS);
  const [completed, setCompleted] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getStats(), getCompletedTasks()])
        .then(([s, c]) => {
          setStats(s);
          setCompleted(c);
        })
        .catch(() => {
          // Aglama hatasi ekrani bozmasin.
        });
    }, [])
  );

  const rate = Math.round(stats.completionRate * 100);
  // Dogru/yanlis girilmeyen gorevler (konu ve odakli calisma) bu listede %0 basari gibi gorunmesin.
  const answeredTopics = stats.byTopic.filter((topic) => topic.correct + topic.wrong > 0);

  return (
    <Screen tint={Palette.blue}>
      <ScreenHeader title="İstatistiklerin" subtitle="Görev tamamlama geçmişin" onBack={() => router.back()} />

      <View style={styles.tiles}>
        <StatTile icon="flame" color={DetailAccent} value={String(stats.currentStreak)} label="Seri" />
        <StatTile icon="checkmark-done" color={DetailAccent} value={String(stats.doneTasks)} label="Tamamlanan" />
        <StatTile icon="trending-up" color={DetailAccent} value={`%${rate}`} label="Tamamlama" />
      </View>

      <Card>
        <Txt variant="section" style={styles.cardTitle}>
          Son 7 gün odak süren
        </Txt>
        <WeekBars data={stats.last7Days} goalMinutes={Rules.dailyGoalMinutes} color={Accent} />
      </Card>

      {answeredTopics.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="smallStrong" color={Palette.textDim}>
            Konu Bazlı Doğru / Yanlış
          </Txt>
          <View style={styles.list}>
            {answeredTopics.map((topic) => (
              <TopicRow key={topic.title} topic={topic} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Tamamlanan Görevler
        </Txt>

        {completed.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="Henüz tamamlanmış görev yok"
            subtitle="İlk görevini bitirdiğinde burada listelenecek."
            color={DetailAccent}
          />
        ) : (
          <View style={styles.list}>
            {completed.map((task) => (
              <Card key={task.id} style={styles.row}>
                <IconBubble name="checkmark-circle" color={DetailAccent} size={40} />
                <View style={styles.flex}>
                  <Txt variant="bodyStrong" numberOfLines={1}>
                    {task.title}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint}>
                    {task.correctCount + task.wrongCount > 0
                      ? `${task.correctCount} doğru · ${task.wrongCount} yanlış · `
                      : ''}
                    tamamlandı {relativeTime(task.completedAt ?? task.dueDate)}
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

function TopicRow({ topic }: { topic: TopicBreakdown }) {
  const total = topic.correct + topic.wrong;
  const rate = total === 0 ? 0 : topic.correct / total;

  return (
    <Card style={styles.topicRow}>
      <View style={styles.topicHead}>
        <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
          {topic.title}
        </Txt>
        <Txt variant="smallStrong" color={Palette.green}>
          %{Math.round(rate * 100)}
        </Txt>
      </View>
      <ProgressBar progress={rate} color={Palette.green} height={7} />
      <View style={styles.topicFoot}>
        <Txt variant="tiny" color={Palette.green}>
          {topic.correct} doğru
        </Txt>
        <Txt variant="tiny" color={Palette.pink}>
          {topic.wrong} yanlış
        </Txt>
      </View>
    </Card>
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
    <View style={styles.tile}>
      <IconBubble name={icon} color={color} size={36} />
      <Txt variant="section" color={Palette.text}>
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
    gap: Space.md,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Space.lg,
    paddingHorizontal: Space.xs,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
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
  topicRow: {
    gap: Space.sm,
  },
  topicHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  topicFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
