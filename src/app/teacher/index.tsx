import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, Pill, ProgressBar, Txt } from '@/components/ui';
import { allStudentSummaries, createStudent } from '@/db/repo';
import { initials, type StudentSummary } from '@/db/types';
import { humanDuration } from '@/lib/date';
import { levelFromXp, Rules } from '@/lib/gamification';
import { useSession } from '@/lib/session';
import { Palette, Radius, Space } from '@/theme/tokens';

export default function TeacherHome() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { user, signOut } = useSession();

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    allStudentSummaries(db).then(setStudents);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const activeCount = students.filter((s) => s.isActive).length;
  const pendingCount = students.reduce((sum, s) => sum + s.pendingQuestions, 0);

  return (
    <>
      <Screen tint={Palette.purple}>
        <ScreenHeader
          title={user?.name ?? 'Panel'}
          subtitle={`${students.length} öğrenci · ${activeCount} şu an çalışıyor`}
          right={<IconButton icon="person-add" color={Palette.purple} onPress={() => setAdding(true)} />}
        />

        {/* Ozet seridi */}
        <View style={styles.summaryRow}>
          <SummaryTile
            icon="pulse"
            color={Palette.green}
            value={String(activeCount)}
            label="çalışıyor"
          />
          <SummaryTile
            icon="mail-unread"
            color={Palette.orange}
            value={String(pendingCount)}
            label="bekleyen soru"
          />
          <SummaryTile
            icon="people"
            color={Palette.purple}
            value={String(students.length)}
            label="öğrenci"
          />
        </View>

        {students.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Henüz öğrenci yok"
            subtitle="Sağ üstteki butondan ilk öğrencini ekle."
            color={Palette.purple}
          />
        ) : (
          students.map((s) => (
            <StudentRow
              key={s.user.id}
              summary={s}
              onPress={() => router.push({ pathname: '/teacher/student/[id]', params: { id: String(s.user.id) } })}
            />
          ))
        )}

        <GhostButton
          label="Çıkış yap"
          icon="log-out-outline"
          color={Palette.pink}
          full
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
        />
      </Screen>

      <AddStudentModal
        visible={adding}
        onClose={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          load();
        }}
      />
    </>
  );
}

function SummaryTile({
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
    <View style={[styles.summaryTile, { backgroundColor: color + '18', borderColor: color + '3A' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Txt variant="section" color={color}>
        {value}
      </Txt>
      <Txt variant="tiny" color={Palette.textDim}>
        {label}
      </Txt>
    </View>
  );
}

function StudentRow({ summary, onPress }: { summary: StudentSummary; onPress: () => void }) {
  const { user, todayMinutes, weekMinutes, tasksDone, tasksTotal, pendingQuestions, isActive } = summary;
  const level = levelFromXp(user.xp);
  const taskRatio = tasksTotal === 0 ? 0 : tasksDone / tasksTotal;
  const goalRatio = Math.min(1, todayMinutes / Rules.dailyGoalMinutes);

  return (
    <PressScale onPress={onPress} scaleTo={0.98}>
      <Card accent={isActive ? Palette.green : undefined} style={styles.studentCard}>
        <View style={styles.studentHead}>
          <View style={styles.avatar}>
            <Txt variant="smallStrong" color={Palette.purple}>
              {initials(user.name)}
            </Txt>
            {isActive ? <View style={styles.onlineDot} /> : null}
          </View>

          <View style={styles.flex}>
            <Txt variant="bodyStrong" numberOfLines={1}>
              {user.name}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              {user.grade ?? '—'} · Sv.{level.level} {level.title}
            </Txt>
          </View>

          <Pill
            label={isActive ? 'Çalışıyor' : 'Çevrimdışı'}
            color={isActive ? Palette.green : Palette.textFaint}
            icon={isActive ? 'radio-button-on' : 'moon'}
          />
        </View>

        <View style={styles.metrics}>
          <Metric
            label="Haftalık hedef"
            value={`%${Math.round(taskRatio * 100)}`}
            progress={taskRatio}
            color={Palette.purple}
            detail={`${tasksDone}/${tasksTotal} görev`}
          />
          <Metric
            label="Bugün"
            value={humanDuration(todayMinutes * 60)}
            progress={goalRatio}
            color={goalRatio >= 1 ? Palette.green : Palette.orange}
            detail={`hafta ${humanDuration(weekMinutes * 60)}`}
          />
        </View>

        <View style={styles.studentFoot}>
          <View style={styles.footItem}>
            <Ionicons name="flame" size={13} color={Palette.orange} />
            <Txt variant="tiny" color={Palette.textDim}>
              {user.streak} gün seri
            </Txt>
          </View>
          {pendingQuestions > 0 ? (
            <Pill label={`${pendingQuestions} bekleyen soru`} color={Palette.orange} icon="help-circle" />
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={Palette.textFaint} />
        </View>
      </Card>
    </PressScale>
  );
}

function Metric({
  label,
  value,
  progress,
  color,
  detail,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
  detail: string;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.metricHead}>
        <Txt variant="tiny" color={Palette.textDim}>
          {label}
        </Txt>
        <Txt variant="smallStrong" color={color}>
          {value}
        </Txt>
      </View>
      <ProgressBar progress={progress} color={color} height={6} />
      <Txt variant="tiny" color={Palette.textFaint} style={styles.metricDetail}>
        {detail}
      </Txt>
    </View>
  );
}

/* ------------------------------ ogrenci ekleme ----------------------------- */

function AddStudentModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName('');
    setNickname('');
    setGrade('');
    setPin('');
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (name.trim().length < 2) return setError('İsim en az 2 karakter olmalı.');
    if (!/^\d{4}$/.test(pin)) return setError('Giriş kodu 4 rakam olmalı.');

    await createStudent(db, {
      name: name.trim(),
      nickname: nickname.trim() || name.trim().split(' ')[0],
      pin,
      grade: grade.trim() || '—',
    });
    reset();
    onCreated();
  }, [db, name, nickname, pin, grade, reset, onCreated]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Txt variant="section">Yeni öğrenci</Txt>
            <IconButton icon="close" onPress={onClose} size={34} />
          </View>

          <Field label="Ad Soyad" value={name} onChange={setName} placeholder="Deniz Yılmaz" />
          <Field label="Takma ad (liderlik tablosunda görünür)" value={nickname} onChange={setNickname} placeholder="KaranlıkŞövalye99" />
          <Field label="Sınıf" value={grade} onChange={setGrade} placeholder="11. Sınıf" />
          <Field label="4 haneli giriş kodu" value={pin} onChange={setPin} placeholder="1234" numeric />

          {error ? (
            <Txt variant="small" color={Palette.pink}>
              {error}
            </Txt>
          ) : null}

          <NeonButton label="Öğrenciyi ekle" icon="checkmark" color={Palette.purple} full onPress={save} />
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <View>
      <Txt variant="tiny" color={Palette.textDim} style={styles.fieldLabel}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Palette.textFaint}
        keyboardType={numeric ? 'number-pad' : 'default'}
        maxLength={numeric ? 4 : undefined}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  studentCard: {
    gap: Space.md,
  },
  studentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purpleSoft,
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.green,
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  metrics: {
    flexDirection: 'row',
    gap: Space.lg,
  },
  metricHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  metricDetail: {
    marginTop: 4,
  },
  studentFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  footItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
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
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChosen: {
    borderColor: Palette.purple,
    backgroundColor: Palette.purpleSoft,
  },
});
