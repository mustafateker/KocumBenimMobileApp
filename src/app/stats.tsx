import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Txt } from '@/components/ui';
import { getCompletedTasks, getStats } from '@/lib/api';
import { relativeTime } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { Rules } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import type { StudentStats, Task, TopicBreakdown, TopicReport } from '@/lib/types';
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
  const { showError } = useErrorDialog();
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
        .catch((err) => showError(err, { title: 'İstatistikler yüklenemedi', code: 'STATS_LOAD' }));
    }, [showError])
  );

  const rate = Math.round(stats.completionRate * 100);
  // Dogru/yanlis girilmeyen gorevler (konu ve odakli calisma) bu listede %0 basari gibi gorunmesin.
  const answeredTopics = stats.byTopic.filter((topic) => topic.correct + topic.wrong > 0);
  // Yalnizca sonucu girilmis ya da calisilmis konular; bekleyen gorevler Gorevlerim ekraninda duruyor.
  const activeSubjects = (stats.subjects ?? [])
    .map((subject) => ({ ...subject, topics: subject.topics.filter((topic) => topic.solved > 0 || topic.studyCompleted > 0) }))
    .filter((subject) => subject.topics.length > 0);
  const weakTopics = (stats.weakTopics ?? []).slice(0, 5);

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

      {weakTopics.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="smallStrong" color={Palette.textDim}>
            Geliştirmen Gereken Konular
          </Txt>
          <Card style={styles.weakCard}>
            {weakTopics.map((topic) => (
              <View key={`${topic.subject}-${topic.grade}-${topic.topic}`} style={styles.weakRow}>
                <Txt variant="smallStrong" color={DetailAccent} style={styles.weakRate}>
                  %{Math.round(topic.successRate * 100)}
                </Txt>
                <View style={styles.flex}>
                  <Txt variant="small" numberOfLines={1}>
                    {topic.topic}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint}>
                    {topic.subject} · {topic.correct} doğru, {topic.wrong} yanlış, {topic.blank} boş
                  </Txt>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {/* Sunucu ders → konu kirilimini dondurmuyorsa (eski surum) basliga gore eski liste gosterilir. */}
      {stats.subjects ? (
        activeSubjects.map((subject) => (
          <View key={subject.subject} style={styles.section}>
            <View style={styles.subjectHead}>
              <Txt variant="smallStrong" color={Palette.textDim} style={styles.flex}>
                {subject.subject}
              </Txt>
              {subject.successRate !== null ? (
                <Txt variant="tiny" color={Palette.textFaint}>
                  {subject.solved} soru · %{Math.round(subject.successRate * 100)} başarı
                </Txt>
              ) : null}
            </View>
            <View style={styles.list}>
              {subject.topics.map((topic) => (
                <TopicReportRow key={`${topic.grade}-${topic.topic}`} topic={topic} />
              ))}
            </View>
          </View>
        ))
      ) : answeredTopics.length > 0 ? (
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

/** Bir konunun sonucu: soru cozulduyse basari orani ve dogru/yanlis/bos, calisildiysa "Konu calisildi". */
function TopicReportRow({ topic }: { topic: TopicReport }) {
  const rate = topic.successRate;
  // Panel ve rapordaki esikle ayni: %70'in altindaki konular gelistirilmesi gereken sayilir.
  const color = rate !== null && Math.round(rate * 100) < 70 ? DetailAccent : Palette.green;

  return (
    <Card style={styles.topicRow}>
      <View style={styles.topicHead}>
        <Txt variant="bodyStrong" numberOfLines={2} style={styles.flex}>
          {topic.topic}
        </Txt>
        {rate !== null ? (
          <Txt variant="smallStrong" color={color}>
            %{Math.round(rate * 100)}
          </Txt>
        ) : null}
      </View>
      {rate !== null ? <ProgressBar progress={rate} color={color} height={7} /> : null}
      <View style={styles.topicFoot}>
        <Txt variant="tiny" color={Palette.textDim}>
          {rate !== null ? `${topic.correct} doğru · ${topic.wrong} yanlış · ${topic.blank} boş` : ''}
        </Txt>
        {topic.studyCompleted > 0 ? (
          <Txt variant="tiny" color={Palette.green}>
            Konu çalışıldı
          </Txt>
        ) : null}
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
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  weakCard: {
    gap: Space.md,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  weakRate: {
    width: 44,
  },
});
