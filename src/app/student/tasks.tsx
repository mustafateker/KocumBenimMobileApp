import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { IconButton, NeonButton, PressScale } from '@/components/button';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Segmented, Txt } from '@/components/ui';
import { completeTask, getTasks } from '@/lib/api';
import { formatShortDate } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { useSession, useStudent } from '@/lib/session';
import type { Task } from '@/lib/types';
import { categoryColor, categoryIcon, categoryLabel, taskGoal, taskGoalLabel, taskTopicLabel } from '@/lib/task-categories';
import { Accent, Border, DetailAccent, Palette, Space, pillRadius } from '@/theme/tokens';

type RangeKey = 'daily' | 'weekly' | 'monthly';

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'daily', label: 'Günlük' },
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
];

const API_RANGE: Record<RangeKey, 'day' | 'week' | 'month'> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
};

export default function Tasks() {
  useStudent();
  const { refresh } = useSession();
  const { showError } = useErrorDialog();

  const [range, setRange] = useState<RangeKey>('daily');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await getTasks(API_RANGE[range]));
    } catch (err) {
      showError(err, { title: 'Görevler yüklenemedi', code: 'TASKS_LOAD' });
    }
  }, [range, showError]);

  useFocusEffect(
    useCallback(() => {
      load();
      refresh().catch(() => {});
    }, [load, refresh])
  );

  const handleCompleted = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const doneCount = tasks.filter((t) => t.completedAt).length;

  return (
    <Screen tint={Palette.green}>
      <ScreenHeader
        title="Ödevlerim"
        subtitle={`${doneCount}/${tasks.length} tamamlandı`}
        left={<MenuButton />}
        right={<NotificationBell />}
      />

      <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} color={Palette.green} />

      {tasks.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Bu aralıkta ödev yok"
          subtitle="Koçum veya öğretmenin yeni ödev atadığında burada göreceksin."
          color={Palette.green}
        />
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              expanded={expandedId === task.id}
              onToggle={() => setExpandedId((cur) => (cur === task.id ? null : task.id))}
              onCompleted={handleCompleted}
            />
          ))}
        </View>
      )}

      <AdBanner style={{ marginTop: Space.md, marginBottom: Space.xl }} />
    </Screen>
  );
}

function TaskCard({
  task,
  expanded,
  onToggle,
  onCompleted,
}: {
  task: Task;
  expanded: boolean;
  onToggle: () => void;
  onCompleted: (task: Task) => void;
}) {
  const router = useRouter();
  const { showError } = useErrorDialog();
  const completed = task.completedAt !== null;
  const progress = task.target === 0 ? 0 : task.done / task.target;
  const catColor = categoryColor(task.category);
  const goal = taskGoal(task);
  const topicLabel = taskTopicLabel(task);
  const isAiTask = String(task.createdBy) === 'ai';
  const isFocusTask = task.category === 'focus' || goal === 'minutes';

  const { refresh } = useSession();
  const [completing, setCompleting] = useState(false);
  const [correct, setCorrect] = useState(task.target);
  const [wrong, setWrong] = useState(0);
  const [busy, setBusy] = useState(false);

  const startCompleting = useCallback(() => {
    if (isFocusTask) return;
    setCorrect(task.target);
    setWrong(0);
    setCompleting(true);
  }, [task.target, isFocusTask]);

  // Dogru + yanlis hedefi asamaz: biri artinca gerekirse digeri azalir, kalan sorular bos sayilir.
  const changeCorrect = useCallback(
    (value: number) => {
      setCorrect(value);
      setWrong((current) => Math.min(current, task.target - value));
    },
    [task.target]
  );
  const changeWrong = useCallback(
    (value: number) => {
      setWrong(value);
      setCorrect((current) => Math.min(current, task.target - value));
    },
    [task.target]
  );

  const submit = useCallback(async () => {
    if (isFocusTask) return;
    setBusy(true);
    try {
      // Dogru/yanlis yalnizca soru hedefli gorevlerde sorulur; konu ve odak gorevlerinde 0 gider.
      const updated = goal === 'questions' ? await completeTask(task.id, correct, wrong) : await completeTask(task.id, 0, 0);
      onCompleted(updated);
      setCompleting(false);
      await refresh().catch(() => {});
    } catch (err) {
      showError(err, { title: 'Görev tamamlanamadı', code: 'TASK_COMPLETE' });
    } finally {
      setBusy(false);
    }
  }, [task.id, goal, isFocusTask, correct, wrong, onCompleted, refresh, showError]);

  return (
    <PressScale onPress={onToggle} scaleTo={0.99}>
      <Card style={[styles.row, completed && styles.rowCompleted]}>
        <View style={styles.rowTop}>
          <IconBubble
            name={completed ? 'checkmark-circle' : categoryIcon(task.category)}
            color={DetailAccent}
            size={40}
          />
          <View style={styles.flex}>
            <View style={styles.titleLine}>
              <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                {task.title}
              </Txt>
              {isAiTask ? (
                <View style={styles.aiBadge}>
                  <Txt variant="tiny" color={Accent}>
                    Koçum
                  </Txt>
                </View>
              ) : null}
            </View>
            {topicLabel ? (
              <Txt variant="tiny" color={Palette.textDim} numberOfLines={1}>
                {topicLabel}
              </Txt>
            ) : null}
            <Txt variant="tiny" color={Palette.textFaint}>
              {categoryLabel(task.category)} ·{' '}
              {completed ? `Tamamlandı: ${formatShortDate(task.completedAt!)}` : `Teslim: ${formatShortDate(task.dueDate)}`}
            </Txt>
          </View>
          <Txt variant="smallStrong" color={completed ? Palette.green : Palette.text}>
            {taskGoalLabel(task)}
          </Txt>
        </View>
        <ProgressBar
          progress={progress}
          color={completed ? Palette.green : catColor}
          track={Palette.bg}
          height={7}
        />

        {expanded ? (
          <View style={styles.details}>
            <DetailRow label="Görev türü" value={categoryLabel(task.category)} />
            {task.topic ? (
              <>
                <DetailRow label="Ders" value={task.grade ? `${task.subject} · ${task.grade}. Sınıf` : task.subject} />
                <DetailRow label="Konu" value={task.topic} />
              </>
            ) : null}
            <DetailRow label="Atanma tarihi" value={formatShortDate(task.createdAt)} />
            {completed ? (
              <DetailRow label="Tamamlanma tarihi" value={formatShortDate(task.completedAt!)} />
            ) : (
              <DetailRow label="Teslim tarihi" value={formatShortDate(task.dueDate)} />
            )}
            {goal === 'questions' && <DetailRow label="Hedef soru sayısı" value={`${task.target} soru`} />}
            {goal === 'questions' && task.durationMinutes ? <DetailRow label="Süre" value={`${task.durationMinutes} dk`} /> : null}
            {goal === 'minutes' && <DetailRow label="Çalışma süresi" value={`${task.durationMinutes} dk`} />}
            {completed && goal === 'questions' && (
              <DetailRow label="Sonuç" value={`${task.correctCount} doğru · ${task.wrongCount} yanlış`} />
            )}

            {!completed && !completing && (
              <View style={styles.actionButtons}>
                {isFocusTask ? (
                  <View style={styles.focusTaskWrap}>
                    <NeonButton
                      label={`Pomodoro'yu Başlat (${task.durationMinutes || 25} dk)`}
                      icon="timer-outline"
                      color={Palette.orange}
                      onPress={() =>
                        router.push({
                          pathname: '/focus',
                          params: {
                            seconds: String((task.durationMinutes || 25) * 60),
                            taskId: String(task.id),
                          },
                        })
                      }
                      full
                    />
                    <Txt variant="tiny" color={Palette.textDim} center>
                      Bu görev Pomodoro odaklanma seansı bittiğinde otomatik olarak tamamlanır.
                    </Txt>
                  </View>
                ) : (
                  <NeonButton label="Ödevi Tamamla" icon="checkmark" color={Palette.green} onPress={startCompleting} full />
                )}
              </View>
            )}

            {!completed && completing && goal === 'questions' && (
              <View style={styles.completeForm}>
                <Txt variant="small" color={Palette.textDim}>
                  Kaç soru doğru, kaç soru yanlış yaptın?
                </Txt>
                <View style={styles.stepperRow}>
                  <MiniStepper label="Doğru" value={correct} color={Palette.green} onChange={changeCorrect} max={task.target} />
                  <MiniStepper label="Yanlış" value={wrong} color={Palette.pink} onChange={changeWrong} max={task.target} />
                </View>
                <Txt variant="tiny" color={Palette.textFaint} center>
                  Boş bıraktığın: {task.target - correct - wrong} soru
                </Txt>
                <NeonButton label={busy ? 'Kaydediliyor…' : 'Kaydet ve Bitir'} color={Palette.green} disabled={busy} onPress={submit} full />
              </View>
            )}

            {!completed && completing && goal !== 'questions' && !isFocusTask && (
              <View style={styles.completeForm}>
                <Txt variant="small" color={Palette.textDim}>
                  Bu konuyu çalışmayı tamamladın mı?
                </Txt>
                <NeonButton label={busy ? 'Kaydediliyor…' : 'Evet, Bitir'} color={Palette.green} disabled={busy} onPress={submit} full />
              </View>
            )}
          </View>
        ) : null}
      </Card>
    </PressScale>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Txt variant="small" color={Palette.textFaint}>
        {label}
      </Txt>
      <Txt variant="smallStrong" style={styles.detailValue}>
        {value}
      </Txt>
    </View>
  );
}

function MiniStepper({
  label,
  value,
  color,
  onChange,
  max,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <View style={styles.miniStepper}>
      <Txt variant="tiny" color={Palette.textFaint}>
        {label.toUpperCase()}
      </Txt>
      <View style={styles.miniStepperControls}>
        <IconButton icon="remove" onPress={() => onChange(Math.max(0, value - 1))} />
        <Txt variant="title" color={color}>
          {value}
        </Txt>
        <IconButton icon="add" color={color} onPress={() => onChange(Math.min(max, value + 1))} />
      </View>
    </View>
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
  rowCompleted: {
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.surface,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  aiBadge: {
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: pillRadius(18),
  },
  actionButtons: {
    gap: Space.xs,
  },
  focusTaskWrap: {
    gap: Space.xs,
  },
  details: {
    gap: Space.sm,
    marginTop: Space.xs,
    paddingTop: Space.sm,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  // Uzun konu adlari satira sigmayinca etiketi itmeden alt satira insin.
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  completeForm: {
    gap: Space.md,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space.xl,
  },
  miniStepper: {
    alignItems: 'center',
    gap: Space.xs,
  },
  miniStepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
});
