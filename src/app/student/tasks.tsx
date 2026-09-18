import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, NeonButton, PressScale } from '@/components/button';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Segmented, Txt } from '@/components/ui';
import { completeTask, getTasks } from '@/lib/api';
import { formatShortDate } from '@/lib/date';
import { useStudent } from '@/lib/session';
import type { Task } from '@/lib/types';
import { categoryColor, categoryIcon, categoryLabel } from '@/lib/task-categories';
import { Border, Palette, Space } from '@/theme/tokens';

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

  const [range, setRange] = useState<RangeKey>('daily');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await getTasks(API_RANGE[range]));
    } catch {
      // Aglama hatasi ekrani bozmasin; liste bos gorunur.
    }
  }, [range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCompleted = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const doneCount = tasks.filter((t) => t.completedAt).length;

  return (
    <Screen tint={Palette.green}>
      <ScreenHeader
        title="Görevlerin"
        subtitle={`${doneCount}/${tasks.length} tamamlandı`}
        left={<MenuButton />}
        right={<NotificationBell />}
      />

      <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} color={Palette.green} />

      {tasks.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Bu aralıkta görev yok"
          subtitle="Yeni görevler atandığında burada göreceksin."
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
  const completed = task.completedAt !== null;
  const progress = task.target === 0 ? 0 : task.done / task.target;
  const catColor = categoryColor(task.category);

  const [completing, setCompleting] = useState(false);
  const [correct, setCorrect] = useState(task.target);
  const [wrong, setWrong] = useState(0);
  const [busy, setBusy] = useState(false);

  const startCompleting = useCallback(() => {
    setCorrect(task.target);
    setWrong(0);
    setCompleting(true);
  }, [task.target]);

  const submit = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await completeTask(task.id, correct, wrong);
      onCompleted(updated);
      setCompleting(false);
    } catch {
      // Aglama hatasi karti bozmasin; kullanici tekrar deneyebilir.
    } finally {
      setBusy(false);
    }
  }, [task.id, correct, wrong, onCompleted]);

  return (
    <PressScale onPress={onToggle} scaleTo={0.99}>
      <Card style={[styles.row, completed && styles.rowCompleted]}>
        <View style={styles.rowTop}>
          <IconBubble
            name={completed ? 'checkmark-circle' : categoryIcon(task.category)}
            color={completed ? Palette.green : catColor}
            size={40}
          />
          <View style={styles.flex}>
            <Txt variant="bodyStrong" numberOfLines={1}>
              {task.title}
            </Txt>
            <Txt variant="tiny" color={Palette.textFaint}>
              {categoryLabel(task.category)} ·{' '}
              {completed ? `Tamamlandı: ${formatShortDate(task.completedAt!)}` : `Teslim: ${formatShortDate(task.dueDate)}`}
            </Txt>
          </View>
          <Txt variant="smallStrong" color={completed ? Palette.green : Palette.text}>
            {task.done}/{task.target}
          </Txt>
        </View>
        <ProgressBar progress={progress} color={completed ? Palette.green : catColor} height={7} />

        {expanded ? (
          <View style={styles.details}>
            <DetailRow label="Görev türü" value={categoryLabel(task.category)} />
            <DetailRow label="Atanma tarihi" value={formatShortDate(task.createdAt)} />
            {completed ? (
              <DetailRow label="Tamamlanma tarihi" value={formatShortDate(task.completedAt!)} />
            ) : (
              <DetailRow label="Teslim tarihi" value={formatShortDate(task.dueDate)} />
            )}
            <DetailRow label="Hedef soru sayısı" value={`${task.target} soru`} />
            {completed && <DetailRow label="Sonuç" value={`${task.correctCount} doğru · ${task.wrongCount} yanlış`} />}

            {!completed && !completing && (
              <NeonButton label="Görevi Tamamla" icon="checkmark" color={Palette.green} onPress={startCompleting} full />
            )}

            {!completed && completing && (
              <View style={styles.completeForm}>
                <Txt variant="small" color={Palette.textDim}>
                  Kaç soru doğru, kaç soru yanlış yaptın?
                </Txt>
                <View style={styles.stepperRow}>
                  <MiniStepper label="Doğru" value={correct} color={Palette.green} onChange={setCorrect} max={task.target} />
                  <MiniStepper label="Yanlış" value={wrong} color={Palette.pink} onChange={setWrong} max={task.target} />
                </View>
                <NeonButton label={busy ? 'Kaydediliyor…' : 'Kaydet ve Bitir'} color={Palette.green} disabled={busy} onPress={submit} full />
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
      <Txt variant="smallStrong">{value}</Txt>
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
    borderColor: Palette.green,
    backgroundColor: Palette.greenSoft,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
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
