import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { IconButton, NeonButton, PressScale } from '@/components/button';
import { FocusRing } from '@/components/focus-ring';
import { Screen } from '@/components/screen';
import { Card, IconBubble, Pill, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import { bumpTask, tasksForDay, todayMinutes } from '@/db/repo';
import { initials, type Task } from '@/db/types';
import { gameGate, levelFromXp, Rules } from '@/lib/gamification';
import { useSession, useStudent } from '@/lib/session';
import { Palette, Radius, Space } from '@/theme/tokens';

const DURATIONS = [
  { label: '25 dk', seconds: 25 * 60 },
  { label: '45 dk', seconds: 45 * 60 },
  { label: '60 dk', seconds: 60 * 60 },
];

export default function Home() {
  const db = useSQLiteContext();
  const router = useRouter();
  const student = useStudent();
  const { refresh } = useSession();

  const [duration, setDuration] = useState(DURATIONS[0].seconds);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [minutesToday, setMinutesToday] = useState(0);

  /** Halka bugunku hedefe ne kadar yaklasildigini gosterir. */
  const goalProgress = useSharedValue(0);

  const load = useCallback(async () => {
    const [t, m] = await Promise.all([tasksForDay(db, student.id), todayMinutes(db, student.id)]);
    setTasks(t);
    setMinutesToday(m);
  }, [db, student.id]);

  useFocusEffect(
    useCallback(() => {
      load();
      refresh();
    }, [load, refresh])
  );

  useEffect(() => {
    goalProgress.value = Math.min(1, minutesToday / Rules.dailyGoalMinutes);
  }, [minutesToday, goalProgress]);

  const level = levelFromXp(student.xp);
  const gate = gameGate(minutesToday);
  const goalReached = minutesToday >= Rules.dailyGoalMinutes;

  const onBumpTask = useCallback(
    async (task: Task, delta: number) => {
      const step = task.target > 10 ? Math.max(1, Math.round(task.target / 10)) : 1;
      await bumpTask(db, task.id, delta * step);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      await Promise.all([load(), refresh()]);
    },
    [db, load, refresh]
  );

  return (
    <Screen tint={Palette.purple}>
      {/* Ust bar */}
      <View style={styles.topBar}>
        <PressScale onPress={() => router.push('/student/profile')} style={styles.who}>
          <View style={styles.avatar}>
            <Txt variant="smallStrong" color={Palette.purple}>
              {initials(student.name)}
            </Txt>
          </View>
          <View style={styles.whoText}>
            <Txt variant="bodyStrong" numberOfLines={1}>
              Selam {student.name.split(' ')[0]}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              Seviye {level.level} · {level.title}
            </Txt>
          </View>
        </PressScale>

        <View style={[styles.statChip, { borderColor: Palette.orange + '55' }]}>
          <Ionicons name="flame" size={15} color={Palette.orange} />
          <Txt variant="smallStrong" color={Palette.orange}>
            {student.streak}
          </Txt>
        </View>
      </View>

      {/* Bugunku ilerleme */}
      <FocusRing
        progress={goalProgress}
        color={goalReached ? Palette.green : Palette.purple}
        size={252}
      >
        <Txt variant="tiny" color={Palette.textFaint}>
          BUGÜN
        </Txt>
        <Txt variant="timer" color={goalReached ? Palette.green : Palette.text}>
          {minutesToday}
        </Txt>
        <Txt variant="small" color={Palette.textDim}>
          / {Rules.dailyGoalMinutes} dakika
        </Txt>
      </FocusRing>

      {/* Sure secimi ve baslatma */}
      <View style={styles.setup}>
        <View style={styles.chipRow}>
          {DURATIONS.map((d) => {
            const selected = duration === d.seconds;
            return (
              <PressScale key={d.seconds} onPress={() => setDuration(d.seconds)} style={styles.flex}>
                <View style={[styles.chip, selected && styles.chipActive]}>
                  <Txt variant="smallStrong" color={selected ? Palette.purple : Palette.textDim}>
                    {d.label}
                  </Txt>
                </View>
              </PressScale>
            );
          })}
        </View>

        <NeonButton
          label="Çalışmaya Başla"
          icon="play"
          color={Palette.purple}
          size="lg"
          full
          onPress={() => router.push({ pathname: '/focus', params: { seconds: String(duration) } })}
        />
      </View>

      {/* Oyun kilidi */}
      <PressScale onPress={() => router.push('/student/games')}>
        <Card accent={gate.unlocked ? Palette.green : undefined} style={styles.gateCard}>
          <IconBubble
            name={gate.unlocked ? 'lock-open' : 'lock-closed'}
            color={gate.unlocked ? Palette.green : Palette.textFaint}
            size={40}
          />
          <View style={styles.flex}>
            <Txt variant="bodyStrong" color={gate.unlocked ? Palette.green : Palette.text}>
              {gate.unlocked ? 'Oyun odası açıldı' : `Oyun odasına ${gate.remainingMinutes} dk`}
            </Txt>
            <View style={styles.gateBar}>
              <ProgressBar
                progress={gate.progress}
                color={gate.unlocked ? Palette.green : Palette.purple}
                height={6}
              />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
        </Card>
      </PressScale>

      {/* Gunluk gorevler */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <SectionLabel>Bugünün görevleri</SectionLabel>
          <Txt variant="tiny" color={Palette.textFaint}>
            {tasks.filter((t) => t.completed_at).length}/{tasks.length}
          </Txt>
        </View>

        {tasks.length === 0 ? (
          <Card>
            <Txt variant="small" color={Palette.textDim}>
              Bugün için atanmış görev yok. Kendi temponla çalışabilirsin.
            </Txt>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.taskRow}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onBump={onBumpTask} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Seri durumu */}
      <Card>
        <Txt variant="smallStrong">Günlük hedef</Txt>
        <Txt variant="tiny" color={Palette.textFaint} style={styles.goalHint}>
          {goalReached
            ? 'Hedefi tutturdun, serin güvende.'
            : `Seriyi korumak için ${Rules.dailyGoalMinutes - minutesToday} dk daha.`}
        </Txt>
      </Card>
    </Screen>
  );
}

/* ------------------------------- gorev karti ------------------------------- */

function TaskCard({ task, onBump }: { task: Task; onBump: (t: Task, delta: number) => void }) {
  const done = task.completed_at !== null;
  const progress = task.target === 0 ? 0 : task.done / task.target;

  return (
    <Card accent={done ? Palette.green : Palette.purple} style={styles.taskCard}>
      <View style={styles.taskHead}>
        <Pill
          label={done ? 'Tamamlandı' : 'Devam ediyor'}
          color={done ? Palette.green : Palette.purple}
        />
        {done ? <Ionicons name="checkmark-circle" size={18} color={Palette.green} /> : null}
      </View>

      <Txt variant="bodyStrong" numberOfLines={2} style={styles.taskTitle}>
        {task.title}
      </Txt>

      <Txt variant="tiny" color={Palette.textDim}>
        {task.done} / {task.target} soru
      </Txt>
      <ProgressBar progress={progress} color={done ? Palette.green : Palette.purple} height={6} />

      <View style={styles.taskActions}>
        <IconButton icon="remove" size={34} onPress={() => onBump(task, -1)} disabled={task.done === 0} />
        <IconButton
          icon="add"
          size={34}
          color={Palette.purple}
          onPress={() => onBump(task, 1)}
          disabled={done}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  who: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    flexShrink: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.purple + '55',
    backgroundColor: Palette.purpleSoft,
  },
  whoText: { flexShrink: 1 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.md,
    height: 34,
    borderRadius: Radius.pill,
    borderWidth: 1,
    backgroundColor: Palette.surface,
  },
  setup: {
    gap: Space.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  chip: {
    height: 42,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Palette.purpleSoft,
    borderColor: Palette.purple,
  },
  gateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  gateBar: {
    marginTop: 6,
  },
  section: {
    gap: Space.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskRow: {
    gap: Space.md,
    paddingRight: Space.lg,
  },
  taskCard: {
    width: 190,
    gap: Space.sm,
    padding: Space.md,
  },
  taskHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    minHeight: 44,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  goalHint: {
    marginTop: 4,
  },
});
