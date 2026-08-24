import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GhostButton, IconButton, NeonButton } from '@/components/button';
import { HourStrip, peakWindow, WeekBars } from '@/components/charts';
import { Screen } from '@/components/screen';
import { Card, Pill, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import { dailyMinutes, focusByHour, questionsForStudent, studentSummary } from '@/db/repo';
import { initials, type Question, type StudentSummary } from '@/db/types';
import { humanDuration, relativeTime } from '@/lib/date';
import { levelFromXp, Rules } from '@/lib/gamification';
import { shareReportPdf, shareReportText, type ReportData } from '@/lib/parent-report';
import { useSession } from '@/lib/session';
import { Palette, Radius, Space } from '@/theme/tokens';

export default function StudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { user } = useSession();

  const studentId = Number(id);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [week, setWeek] = useState<{ day: string; minutes: number }[]>([]);
  const [hours, setHours] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sharing, setSharing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!Number.isFinite(studentId)) return;
      Promise.all([
        studentSummary(db, studentId),
        dailyMinutes(db, studentId, 7),
        focusByHour(db, studentId),
        questionsForStudent(db, studentId),
      ]).then(([s, w, h, q]) => {
        setSummary(s);
        setWeek(w);
        setHours(h);
        setQuestions(q);
      });
    }, [db, studentId])
  );

  const share = useCallback(
    async (kind: 'pdf' | 'text') => {
      if (!summary || sharing) return;
      setSharing(true);
      try {
        const data: ReportData = {
          summary,
          week,
          unansweredQuestions: questions.filter((q) => q.status !== 'answered').length,
          teacherName: user?.name ?? 'Koç',
        };
        await (kind === 'pdf' ? shareReportPdf(data) : shareReportText(data));
      } finally {
        setSharing(false);
      }
    },
    [summary, sharing, week, questions, user]
  );

  if (!summary) {
    return <Screen tint={Palette.purple} />;
  }

  const level = levelFromXp(summary.user.xp);
  const peak = peakWindow(hours);
  const taskRatio = summary.tasksTotal === 0 ? 0 : summary.tasksDone / summary.tasksTotal;

  return (
    <Screen tint={Palette.purple}>
      {/* Baslik */}
      <View style={styles.head}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <View style={styles.avatar}>
          <Txt variant="smallStrong" color={Palette.purple}>
            {initials(summary.user.name)}
          </Txt>
        </View>
        <View style={styles.flex}>
          <Txt variant="section" numberOfLines={1}>
            {summary.user.name}
          </Txt>
          <Txt variant="tiny" color={Palette.textDim}>
            {summary.user.grade ?? '—'} · Sv.{level.level} {level.title}
          </Txt>
        </View>
        <Pill
          label={summary.isActive ? 'Çalışıyor' : 'Çevrimdışı'}
          color={summary.isActive ? Palette.green : Palette.textFaint}
          icon={summary.isActive ? 'radio-button-on' : 'moon'}
        />
      </View>

      {/* Ozet */}
      <View style={styles.tiles}>
        <Tile value={humanDuration(summary.weekMinutes * 60)} label="bu hafta" color={Palette.purple} />
        <Tile value={humanDuration(summary.todayMinutes * 60)} label="bugün" color={Palette.blue} />
        <Tile value={`${summary.user.streak}`} label="seri" color={Palette.orange} />
      </View>

      {/* Gorev tamamlama */}
      <Card>
        <View style={styles.cardHead}>
          <Txt variant="section">Haftalık hedef</Txt>
          <Txt variant="smallStrong" color={Palette.purple}>
            %{Math.round(taskRatio * 100)}
          </Txt>
        </View>
        <ProgressBar progress={taskRatio} color={Palette.purple} />
        <Txt variant="tiny" color={Palette.textFaint} style={styles.hint}>
          {summary.tasksDone} / {summary.tasksTotal} görev tamamlandı
        </Txt>
      </Card>

      {/* Haftalik grafik */}
      <Card>
        <View style={styles.cardHead}>
          <Txt variant="section">Son 7 gün</Txt>
          <Txt variant="tiny" color={Palette.textFaint}>
            hedef {Rules.dailyGoalMinutes} dk
          </Txt>
        </View>
        <WeekBars data={week} goalMinutes={Rules.dailyGoalMinutes} color={Palette.purple} />
      </Card>

      {/* Verimli saat */}
      <Card>
        <Txt variant="section" style={styles.cardTitle}>
          Verimli saatleri
        </Txt>
        <HourStrip buckets={hours} color={Palette.blue} />
        {peak ? (
          <View style={styles.insight}>
            <Ionicons name="bulb" size={16} color={Palette.gold} />
            <Txt variant="small" color={Palette.textDim} style={styles.flex}>
              En yoğun odağı{' '}
              <Txt variant="smallStrong" color={Palette.text}>
                {String(peak.start).padStart(2, '0')}:00 - {String(peak.end).padStart(2, '0')}:00
              </Txt>{' '}
              aralığında. Zor konuları bu saate koymayı düşünebilirsin.
            </Txt>
          </View>
        ) : (
          <Txt variant="small" color={Palette.textFaint} style={styles.insight}>
            Henüz analiz için yeterli oturum yok.
          </Txt>
        )}
      </Card>

      {/* Sorular */}
      <View style={styles.section}>
        <SectionLabel>{`Gönderdiği sorular (${questions.length})`}</SectionLabel>
        {questions.length === 0 ? (
          <Card>
            <Txt variant="small" color={Palette.textDim}>
              Henüz soru göndermemiş.
            </Txt>
          </Card>
        ) : (
          questions.slice(0, 5).map((q) => (
            <Card key={q.id} style={styles.questionRow}>
              <View style={styles.flex}>
                <Txt variant="smallStrong" numberOfLines={2}>
                  {q.note || 'Fotoğraflı soru'}
                </Txt>
                <Txt variant="tiny" color={Palette.textFaint}>
                  {relativeTime(q.created_at)}
                </Txt>
              </View>
              <Pill
                label={
                  q.status === 'answered' ? 'Cevaplandı' : q.status === 'in_lesson' ? 'Derste' : 'Bekliyor'
                }
                color={
                  q.status === 'answered'
                    ? Palette.green
                    : q.status === 'in_lesson'
                      ? Palette.blue
                      : Palette.orange
                }
              />
            </Card>
          ))
        )}
      </View>

      {/* Veli raporu */}
      <Card accent={Palette.pink} style={styles.reportCard}>
        <Txt variant="section">Veli raporu</Txt>
        <Txt variant="small" color={Palette.textDim}>
          Bu haftanın istatistiklerini tek dokunuşla veliye gönder.
        </Txt>
        <View style={styles.reportActions}>
          <GhostButton
            label="WhatsApp"
            icon="logo-whatsapp"
            color={Palette.green}
            onPress={() => share('text')}
            style={styles.flex}
            full
          />
          <NeonButton
            label={sharing ? 'Hazırlanıyor…' : 'PDF gönder'}
            icon="document-text"
            color={Palette.pink}
            disabled={sharing}
            onPress={() => share('pdf')}
            style={styles.flex}
            full
          />
        </View>
      </Card>
    </Screen>
  );
}

function Tile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: color + '18', borderColor: color + '3A' }]}>
      <Txt variant="bodyStrong" color={color}>
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
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purpleSoft,
  },
  tiles: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
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
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  reportCard: {
    gap: Space.md,
  },
  reportActions: {
    flexDirection: 'row',
    gap: Space.sm,
  },
});
