import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, Pill, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import { createTask, deleteTask, listUsers, moveTask, tasksForDay } from '@/db/repo';
import { initials, type Task, type User } from '@/db/types';
import { dayKey, dayLabel } from '@/lib/date';
import { useSession } from '@/lib/session';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

/** Gorev tamamlanmis mi? */
function done(task: Task): boolean {
  return task.completed_at !== null;
}

/** Bugunden itibaren 14 gunluk pencere. */
function planningDays(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return dayKey(d);
  });
}

export default function Planner() {
  const db = useSQLiteContext();
  const { user } = useSession();

  const days = useMemo(() => planningDays(), []);
  const [day, setDay] = useState(days[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState<Task | null>(null);

  useFocusEffect(
    useCallback(() => {
      listUsers(db, 'student').then((list) => {
        setStudents(list);
        setStudentId((current) => current ?? list[0]?.id ?? null);
      });
    }, [db])
  );

  const load = useCallback(() => {
    if (studentId === null) return setTasks([]);
    tasksForDay(db, studentId, day).then(setTasks);
  }, [db, studentId, day]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const student = students.find((s) => s.id === studentId);
  const doneCount = tasks.filter((t) => t.completed_at).length;

  return (
    <>
      <Screen tint={Palette.blue}>
        <ScreenHeader
          title="Program"
          subtitle="Günlük görevleri buradan ata."
          right={
            <IconButton
              icon="add"
              color={Palette.blue}
              onPress={() => setAdding(true)}
              disabled={studentId === null}
            />
          }
        />

        {/* Ogrenci secimi */}
        <View>
          <SectionLabel>Öğrenci</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {students.map((s) => {
              const active = s.id === studentId;
              return (
                <PressScale key={s.id} onPress={() => setStudentId(s.id)} scaleTo={0.95}>
                  <View style={[styles.studentChip, active && styles.studentChipActive]}>
                    <Txt variant="tiny" color={active ? OnColor : Palette.textFaint}>
                      {initials(s.name)}
                    </Txt>
                    <Txt variant="smallStrong" color={active ? OnColor : Palette.textDim}>
                      {s.name.split(' ')[0]}
                    </Txt>
                  </View>
                </PressScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Gun seridi */}
        <View>
          <SectionLabel>Gün</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {days.map((d, i) => {
              const active = d === day;
              const date = new Date(d + 'T00:00:00');
              return (
                <PressScale key={d} onPress={() => setDay(d)} scaleTo={0.93}>
                  <View style={[styles.dayChip, active && styles.dayChipActive]}>
                    <Txt variant="tiny" color={active ? OnColor : Palette.textFaint}>
                      {i === 0 ? 'Bugün' : dayLabel(d)}
                    </Txt>
                    <Txt variant="bodyStrong" color={active ? OnColor : Palette.text}>
                      {date.getDate()}
                    </Txt>
                  </View>
                </PressScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Gorev listesi */}
        <View style={styles.section}>
          <View style={styles.listHead}>
            <SectionLabel>
              {student ? `${student.name.split(' ')[0]} · ${tasks.length} görev` : 'Görevler'}
            </SectionLabel>
            {tasks.length > 0 ? (
              <Txt variant="tiny" color={Palette.textFaint}>
                {doneCount} tamamlandı
              </Txt>
            ) : null}
          </View>

          {tasks.length === 0 ? (
            <Card>
              <Txt variant="small" color={Palette.textDim}>
                Bu gün için görev yok. Sağ üstteki + ile ekleyebilirsin.
              </Txt>
            </Card>
          ) : (
            tasks.map((task) => {
              const color = done(task) ? Palette.green : Palette.purple;
              return (
                <Card key={task.id} accent={color} style={styles.taskCard}>
                  <View style={styles.taskHead}>
                    <Pill
                      label={done(task) ? 'Tamamlandı' : 'Devam ediyor'}
                      color={color}
                    />
                    <View style={styles.taskActions}>
                      <IconButton
                        icon="calendar-outline"
                        size={32}
                        onPress={() => setMoving(task)}
                      />
                      <IconButton
                        icon="trash-outline"
                        size={32}
                        color={Palette.pink}
                        onPress={async () => {
                          await deleteTask(db, task.id);
                          load();
                        }}
                      />
                    </View>
                  </View>

                  <Txt variant="bodyStrong">{task.title}</Txt>
                  <Txt variant="tiny" color={Palette.textDim}>
                    {task.done} / {task.target} soru
                  </Txt>
                  <ProgressBar
                    progress={task.target === 0 ? 0 : task.done / task.target}
                    color={color}
                    height={6}
                  />
                </Card>
              );
            })
          )}
        </View>
      </Screen>

      <AddTaskModal
        visible={adding}
        day={day}
        studentId={studentId}
        teacherId={user?.id}
        onClose={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          load();
        }}
      />

      <MoveTaskModal
        task={moving}
        days={days}
        onClose={() => setMoving(null)}
        onMoved={() => {
          setMoving(null);
          load();
        }}
      />
    </>
  );
}

function AddTaskModal({
  visible,
  day,
  studentId,
  teacherId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  day: string;
  studentId: number | null;
  teacherId?: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const db = useSQLiteContext();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('20');

  const save = useCallback(async () => {
    if (studentId === null || title.trim().length === 0) return;

    await createTask(db, {
      studentId,
      title: title.trim(),
      target: Math.max(1, parseInt(target, 10) || 1),
      dueDate: day,
      createdBy: teacherId,
    });
    setTitle('');
    setTarget('20');
    onCreated();
  }, [db, studentId, title, target, day, teacherId, onCreated]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Txt variant="section">Görev ekle</Txt>
            <IconButton icon="close" onPress={onClose} size={34} />
          </View>

          <View>
            <Txt variant="tiny" color={Palette.textDim} style={styles.fieldLabel}>
              Başlık
            </Txt>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Türev karma test"
              placeholderTextColor={Palette.textFaint}
              style={styles.input}
            />
          </View>

          <View>
            <Txt variant="tiny" color={Palette.textDim} style={styles.fieldLabel}>
              Soru sayısı
            </Txt>
            <TextInput
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
              maxLength={4}
              style={styles.input}
            />
          </View>

          <NeonButton
            label="Görevi ata"
            icon="checkmark"
            color={Palette.blue}
            full
            disabled={title.trim().length === 0}
            onPress={save}
          />
        </View>
      </View>
    </Modal>
  );
}

function MoveTaskModal({
  task,
  days,
  onClose,
  onMoved,
}: {
  task: Task | null;
  days: string[];
  onClose: () => void;
  onMoved: () => void;
}) {
  const db = useSQLiteContext();

  return (
    <Modal visible={task !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Txt variant="section">Başka güne taşı</Txt>
            <IconButton icon="close" onPress={onClose} size={34} />
          </View>

          <Txt variant="small" color={Palette.textDim}>
            “{task?.title}” görevini hangi güne alalım?
          </Txt>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {days.map((d, i) => {
              const date = new Date(d + 'T00:00:00');
              const current = d === task?.due_date;
              return (
                <PressScale
                  key={d}
                  disabled={current}
                  onPress={async () => {
                    if (!task) return;
                    await moveTask(db, task.id, d);
                    onMoved();
                  }}
                  scaleTo={0.93}
                >
                  <View style={[styles.dayChip, current && styles.dayChipCurrent]}>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      {i === 0 ? 'Bugün' : dayLabel(d)}
                    </Txt>
                    <Txt variant="bodyStrong">{date.getDate()}</Txt>
                  </View>
                </PressScale>
              );
            })}
          </ScrollView>

          <GhostButton label="Vazgeç" onPress={onClose} full />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingRight: Space.lg,
    paddingTop: Space.sm,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  studentChipActive: {
    backgroundColor: Palette.purple,
    borderColor: Palette.purple,
  },
  dayChip: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  dayChipActive: {
    backgroundColor: Palette.blue,
    borderColor: Palette.blue,
  },
  dayChipCurrent: {
    opacity: 0.4,
  },
  section: {
    gap: Space.sm,
  },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskCard: {
    gap: 6,
  },
  taskHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskActions: {
    flexDirection: 'row',
    gap: Space.xs,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Palette.overlay,
  },
  modalCard: {
    gap: Space.md,
    padding: Space.xl,
    paddingBottom: Space.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Palette.bg,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    marginBottom: 5,
  },
  input: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.lg,
    color: Palette.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
});
