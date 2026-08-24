import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GhostButton } from '@/components/button';
import { HourStrip, peakWindow, WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, Pill, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import {
  dailyMinutes,
  focusByHour,
  questionsForStudent,
  recentSessions,
  studentSummary,
} from '@/db/repo';
import { initials, type FocusSession, type Question, type StudentSummary } from '@/db/types';
import { humanDuration, relativeTime } from '@/lib/date';
import { levelFromXp, Rules } from '@/lib/gamification';
import { useSession } from '@/lib/session';
import { Palette, Radius, Space } from '@/theme/tokens';

export default function ParentHome() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { user, signOut } = useSession();

  const childId = user?.linked_student_id ?? null;

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [week, setWeek] = useState<{ day: string; minutes: number }[]>([]);
  const [hours, setHours] = useState<number[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (childId === null) return;
      Promise.all([
        studentSummary(db, childId),
        dailyMinutes(db, childId, 7),
        focusByHour(db, childId),
        recentSessions(db, childId, 5),
        questionsForStudent(db, childId),
      ]).then(([s, w, h, rs, q]) => {
        setSummary(s);
        setWeek(w);
        setHours(h);
        setSessions(rs);
        setQuestions(q);
      });
    }, [db, childId])
  );

  const signOutAndLeave = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  if (childId === null || !summary) {
    return (
      <Screen tint={Palette.pink}>
        <ScreenHeader title="Veli Paneli" />
        <EmptyState
          icon="link-outline"
          title="Bağlı öğrenci yok"
          subtitle="Hesabın bir öğrenciye bağlandığında çocuğunun ilerlemesi burada görünecek."
          color={Palette.pink}
        />
        <GhostButton label="Çıkış yap" icon="log-out-outline" color={Palette.pink} full onPress={signOutAndLeave} />
      </Screen>
    );
  }

  const level = levelFromXp(summary.user.xp);
  const peak = peakWindow(hours);
  const taskRatio = summary.tasksTotal === 0 ? 0 : summary.tasksDone / summary.tasksTotal;
  const activeDays = week.filter((d) => d.minutes > 0).length;
  const pendingQuestions = questions.filter((q) => q.status !== 'answered').length;

  return (
    <Screen tint={Palette.pink}>
      <ScreenHeader title="Veli Paneli" subtitle="Çocuğunun bu haftaki çalışma özeti." />

      {/* Cocuk karti */}
      <Card accent={Palette.pink} style={styles.childCard}>
        <View style={styles.avatar}>
          <Txt variant="section" color={Palette.pink}>
            {initials(summary.user.name)}
          </Txt>
        </View>
        <View style={styles.flex}>
          <Txt variant="section">{summary.user.name}</Txt>
          <Txt variant="small" color={Palette.textDim}>
            {summary.user.grade ?? '—'} · Seviye {level.level} — {level.title}
          </Txt>
          <Pill
            label={summary.isActive ? 'Şu an çalışıyor' : 'Şu an çevrimdışı'}
            color={summary.isActive ? Palette.green : Palette.textFaint}
            icon={summary.isActive ? 'radio-button-on' : 'moon'}
            style={styles.statusPill}
          />
        </View>
      </Card>

      {/* Ozet doseme */}
      <View style={styles.tiles}>
        <Tile
          icon="time"
          value={humanDuration(summary.weekMinutes * 60)}
          label="bu hafta odak"
          color={Palette.purple}
        />
        <Tile icon="calendar" value={`${activeDays}/7`} label="çalışılan gün" color={Palette.blue} />
        <Tile icon="flame" value={`${summary.user.streak}`} label="günlük seri" color={Palette.orange} />
        <Tile
          icon="help-circle"
          value={`${pendingQuestions}`}
          label="bekleyen soru"
          color={Palette.pink}
        />
      </View>

      {/* Gorevler */}
      <Card>
        <View style={styles.cardHead}>
          <Txt variant="section">Görev tamamlama</Txt>
          <Txt variant="smallStrong" color={Palette.green}>
            %{Math.round(taskRatio * 100)}
          </Txt>
        </View>
        <ProgressBar progress={taskRatio} color={Palette.green} />
        <Txt variant="tiny" color={Palette.textFaint} style={styles.hint}>
          {summary.tasksDone} / {summary.tasksTotal} görev tamamlandı
        </Txt>
      </Card>

      {/* Haftalik grafik */}
      <Card>
        <View style={styles.cardHead}>
          <Txt variant="section">Günlük çalışma</Txt>
          <Txt variant="tiny" color={Palette.textFaint}>
            hedef {Rules.dailyGoalMinutes} dk
          </Txt>
        </View>
        <WeekBars data={week} goalMinutes={Rules.dailyGoalMinutes} color={Palette.pink} />
      </Card>

      {/* Verimli saat */}
      <Card>
        <Txt variant="section" style={styles.cardTitle}>
          En verimli olduğu saatler
        </Txt>
        <HourStrip buckets={hours} color={Palette.purple} />
        {peak ? (
          <View style={styles.insight}>
            <Ionicons name="bulb" size={16} color={Palette.gold} />
            <Txt variant="small" color={Palette.textDim} style={styles.flex}>
              Genellikle{' '}
              <Txt variant="smallStrong" color={Palette.text}>
                {String(peak.start).padStart(2, '0')}:00 - {String(peak.end).padStart(2, '0')}:00
              </Txt>{' '}
              arası odaklanıyor.
            </Txt>
          </View>
        ) : (
          <Txt variant="small" color={Palette.textFaint} style={styles.insight}>
            Henüz analiz için yeterli veri yok.
          </Txt>
        )}
      </Card>

      {/* Son oturumlar */}
      <View style={styles.section}>
        <SectionLabel>Son çalışmalar</SectionLabel>
        {sessions.length === 0 ? (
          <Card>
            <Txt variant="small" color={Palette.textDim}>
              Henüz kayıtlı çalışma yok.
            </Txt>
          </Card>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} style={styles.sessionRow}>
              <Ionicons
                name={s.completed ? 'checkmark-circle' : 'time-outline'}
                size={20}
                color={s.completed ? Palette.green : Palette.orange}
              />
              <View style={styles.flex}>
                <Txt variant="smallStrong">Matematik</Txt>
                <Txt variant="tiny" color={Palette.textFaint}>
                  {relativeTime(s.ended_at)}
                </Txt>
              </View>
              <Txt variant="smallStrong" color={Palette.purple}>
                {humanDuration(s.actual_sec)}
              </Txt>
            </Card>
          ))
        )}
      </View>

      <Txt variant="tiny" color={Palette.textFaint} center>
        Veli panelinde sadece görüntüleme yapabilirsin; görev ve ödül ayarları koçta.
      </Txt>

      <GhostButton label="Çıkış yap" icon="log-out-outline" color={Palette.pink} full onPress={signOutAndLeave} />
    </Screen>
  );
}

function Tile({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: color + '18', borderColor: color + '3A' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Txt variant="bodyStrong" color={color}>
        {value}
      </Txt>
      <Txt variant="tiny" color={Palette.textDim} center>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.pinkSoft,
  },
  statusPill: {
    marginTop: 6,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
  cardTitle: {
    marginBottom: Space.md,
  },
  hint: {
    marginTop: Space.sm,
  },
  insight: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
    marginTop: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
});
