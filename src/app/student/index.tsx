import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { FocusRing } from '@/components/focus-ring';
import { Screen } from '@/components/screen';
import { Card, IconBubble, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import { getTasks, getUpcomingLessons } from '@/lib/api';
import { clockFormat, formatLessonDateTime } from '@/lib/date';
import { useHamburgerMenu } from '@/lib/hamburger-menu-context';
import { useSession, useStudent } from '@/lib/session';
import { categoryColor, categoryIcon } from '@/lib/task-categories';
import { initials, type PrivateLesson, type Task } from '@/lib/types';
import { Border, Palette, Radius, Space } from '@/theme/tokens';

const DURATIONS = [
  { label: '25 dk', seconds: 25 * 60 },
  { label: '45 dk', seconds: 45 * 60 },
  { label: '60 dk', seconds: 60 * 60 },
];

const MIN_SECONDS = 5 * 60;
const MAX_SECONDS = 180 * 60;

export default function Home() {
  const router = useRouter();
  const student = useStudent();
  const { refresh } = useSession();
  const { open: openMenu } = useHamburgerMenu();

  const [duration, setDuration] = useState(DURATIONS[0].seconds);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextLesson, setNextLesson] = useState<PrivateLesson | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(DURATIONS[0].seconds);
  /** Halka bu ekranda ilerleme degil, secilen sureyi gosteren dekoratif bir cerceve. */
  const ringProgress = useSharedValue(1);

  const load = useCallback(async () => {
    try {
      setTasks(await getTasks('day'));
    } catch {
      // Aglama hatasi ekrani bozmasin; gorevler bos gorunur, sonraki focus'ta tekrar denenir.
    }
    try {
      const upcoming = await getUpcomingLessons(1);
      setNextLesson(upcoming[0] ?? null);
    } catch {
      // Aglama hatasi ekrani bozmasin; banner gorunmez.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      refresh();
    }, [load, refresh])
  );

  const openPicker = useCallback(() => {
    setDraft(duration);
    setPickerOpen(true);
  }, [duration]);

  const applyDraft = useCallback(() => {
    setDuration(draft);
    setPickerOpen(false);
  }, [draft]);

  const bumpMinutes = useCallback((delta: number) => {
    setDraft((d) => Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, d + delta * 60)));
  }, []);

  const bumpSeconds = useCallback((delta: number) => {
    setDraft((d) => {
      const next = d + delta * 15;
      return Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, next));
    });
  }, []);

  const draftMinutes = Math.floor(draft / 60);
  const draftSeconds = draft % 60;

  return (
    <Screen tint={Palette.purple} pattern>
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
              Merhaba, {student.nickname ?? student.name.split(' ')[0]}
            </Txt>
          </View>
        </PressScale>

        <View style={styles.topActions}>
          <View style={[styles.statChip, { borderColor: Palette.orange }]}>
            <Ionicons name="flame" size={15} color={Palette.orange} />
            <Txt variant="smallStrong" color={Palette.orange}>
              {student.streak}
            </Txt>
          </View>
          <IconButton icon="menu" onPress={openMenu} />
        </View>
      </View>

      {/* Odak zamani secici */}
      <PressScale onPress={openPicker} scaleTo={0.98}>
        <FocusRing progress={ringProgress} color={Palette.purple} size={252}>
          <Txt variant="tiny" color={Palette.textFaint}>
            ODAK ZAMANI
          </Txt>
          <Txt variant="timer">{clockFormat(duration)}</Txt>
          <View style={styles.editHint}>
            <Ionicons name="pencil" size={12} color={Palette.textFaint} />
            <Txt variant="small" color={Palette.textDim}>
              dokun, değiştir
            </Txt>
          </View>
        </FocusRing>
      </PressScale>

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
          <PressScale onPress={openPicker} style={styles.flex}>
            <View style={[styles.chip, !DURATIONS.some((d) => d.seconds === duration) && styles.chipActive]}>
              <Txt
                variant="smallStrong"
                color={!DURATIONS.some((d) => d.seconds === duration) ? Palette.purple : Palette.textDim}
              >
                Özel
              </Txt>
            </View>
          </PressScale>
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

      {/* Hizli soru sor */}
      <PressScale onPress={() => router.push('/student/questions')}>
        <Card accent={Palette.orange} style={styles.quickCard}>
          <IconBubble name="camera" color={Palette.orange} size={48} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">Hızlı Soru Sor</Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              Sorunu çek, üstüne çiz, hocana gönder!
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
        </Card>
      </PressScale>

      {/* Yaklasan ozel ders */}
      {nextLesson ? (
        <PressScale onPress={() => router.push('/lessons')}>
          <Card accent={Palette.purple} style={styles.quickCard}>
            <IconBubble name="calendar" color={Palette.purple} size={48} />
            <View style={styles.flex}>
              <Txt variant="bodyStrong">Yaklaşan Özel Ders</Txt>
              <Txt variant="tiny" color={Palette.textDim}>
                {formatLessonDateTime(nextLesson.scheduledAt)}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
          </Card>
        </PressScale>
      ) : null}

      {/* Gunluk gorevler */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <SectionLabel>Günlük Görevler</SectionLabel>
          <PressScale onPress={() => router.push('/student/tasks')}>
            <Txt variant="tiny" color={Palette.purple}>
              Tümünü Gör
            </Txt>
          </PressScale>
        </View>

        {tasks.length === 0 ? (
          <Card>
            <Txt variant="small" color={Palette.textDim}>
              Bugün için atanmış görev yok. Kendi temponla çalışabilirsin.
            </Txt>
          </Card>
        ) : (
          <View style={styles.taskGrid}>
            {tasks.slice(0, 3).map((task) => (
              <MiniTaskCard key={task.id} task={task} />
            ))}
          </View>
        )}
      </View>

      {/* Manuel sure secici */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Txt variant="section" center>
              Odak süresini ayarla
            </Txt>

            <View style={styles.stepperRow}>
              <Stepper label="Dakika" value={String(draftMinutes).padStart(2, '0')} onDec={() => bumpMinutes(-1)} onInc={() => bumpMinutes(1)} />
              <Txt variant="hero">:</Txt>
              <Stepper
                label="Saniye"
                value={String(draftSeconds).padStart(2, '0')}
                onDec={() => bumpSeconds(-1)}
                onInc={() => bumpSeconds(1)}
              />
            </View>

            <View style={styles.modalActions}>
              <GhostButton label="Vazgeç" onPress={() => setPickerOpen(false)} style={styles.flex} full />
              <NeonButton label="Uygula" color={Palette.purple} onPress={applyDraft} style={styles.flex} full />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Txt variant="tiny" color={Palette.textFaint}>
        {label.toUpperCase()}
      </Txt>
      <View style={styles.stepperControls}>
        <IconButton icon="remove" onPress={onDec} />
        <Txt variant="title">{value}</Txt>
        <IconButton icon="add" color={Palette.purple} onPress={onInc} />
      </View>
    </View>
  );
}

function MiniTaskCard({ task }: { task: Task }) {
  const done = task.completedAt !== null;
  const progress = task.target === 0 ? 0 : task.done / task.target;
  const color = done ? Palette.green : categoryColor(task.category);

  return (
    <View style={[styles.miniCard, done && { borderColor: Palette.green }]}>
      <IconBubble name={done ? 'checkmark-circle' : categoryIcon(task.category)} color={color} size={32} />
      <Txt variant="tiny" color={Palette.textDim} numberOfLines={2} style={styles.miniTitle}>
        {task.title}
      </Txt>
      <Txt variant="smallStrong" color={done ? Palette.green : Palette.text}>
        {task.done}/{task.target}
      </Txt>
      <ProgressBar progress={progress} color={color} height={5} />
    </View>
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
    borderWidth: Border.thick,
    borderColor: Palette.purple,
    backgroundColor: Palette.purpleSoft,
  },
  whoText: { flexShrink: 1 },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.md,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: Border.thick,
    backgroundColor: Palette.surface,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Palette.purpleSoft,
    borderColor: Palette.purple,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskGrid: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  miniCard: {
    flex: 1,
    gap: 6,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  miniTitle: {
    minHeight: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
  },
  modalCard: {
    width: '100%',
    gap: Space.xl,
    padding: Space.xl,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Space.lg,
  },
  stepper: {
    alignItems: 'center',
    gap: Space.sm,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Space.md,
  },
});
