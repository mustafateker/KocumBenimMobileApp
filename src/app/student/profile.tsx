import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GhostButton } from '@/components/button';
import { HourStrip, peakWindow, WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, Pill, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import {
  dailyMinutes,
  focusByHour,
  leaderboard,
  studentSummary,
  type LeaderboardRow,
} from '@/db/repo';
import { initials, type StudentSummary } from '@/db/types';
import { humanDuration } from '@/lib/date';
import { levelFromXp, Rules } from '@/lib/gamification';
import { useSession, useStudent } from '@/lib/session';
import { Palette, Radius, Space, glow } from '@/theme/tokens';

export default function Profile() {
  const db = useSQLiteContext();
  const student = useStudent();
  const router = useRouter();
  const { signOut } = useSession();

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [week, setWeek] = useState<{ day: string; minutes: number }[]>([]);
  const [hours, setHours] = useState<number[]>([]);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        studentSummary(db, student.id),
        dailyMinutes(db, student.id, 7),
        focusByHour(db, student.id),
        leaderboard(db, 7),
      ]).then(([s, w, h, lb]) => {
        setSummary(s);
        setWeek(w);
        setHours(h);
        setBoard(lb);
      });
    }, [db, student.id])
  );

  const level = levelFromXp(student.xp);
  const peak = peakWindow(hours);

  return (
    <Screen tint={Palette.purple}>
      <ScreenHeader title="Profil" subtitle="Karakterin, serin ve rakiplerin." />

      {/* Karakter karti */}
      <Card accent={Palette.purple} style={styles.hero}>
        <View style={[styles.avatar, glow(Palette.purple, 0.3)]}>
          <Txt variant="title" color={Palette.purple}>
            {initials(student.name)}
          </Txt>
        </View>

        <Txt variant="title" center>
          {student.nickname ?? student.name}
        </Txt>
        <Pill label={`Seviye ${level.level} · ${level.title}`} color={Palette.purple} icon="sparkles" />

        <View style={styles.xpBlock}>
          <View style={styles.xpHead}>
            <Txt variant="tiny" color={Palette.textDim}>
              {student.xp} XP
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              {level.nextTitle
                ? `${level.xpForLevel - level.xpIntoLevel} XP sonra: ${level.nextTitle}`
                : 'En üst seviye'}
            </Txt>
          </View>
          <ProgressBar progress={level.progress} color={Palette.purple} />
        </View>
      </Card>

      {/* Istatistik doseme */}
      <View style={styles.tiles}>
        <StatTile
          icon="flame"
          color={Palette.orange}
          value={String(student.streak)}
          label="günlük seri"
        />
        <StatTile
          icon="time"
          color={Palette.blue}
          value={humanDuration((summary?.weekMinutes ?? 0) * 60)}
          label="bu hafta"
        />
        <StatTile
          icon="checkmark-done"
          color={Palette.green}
          value={`${summary?.tasksDone ?? 0}/${summary?.tasksTotal ?? 0}`}
          label="görev"
        />
      </View>

      {/* Haftalik odak */}
      <Card>
        <View style={styles.cardHead}>
          <Txt variant="section">Son 7 gün</Txt>
          <Txt variant="tiny" color={Palette.textFaint}>
            hedef {Rules.dailyGoalMinutes} dk
          </Txt>
        </View>
        <WeekBars data={week} goalMinutes={Rules.dailyGoalMinutes} color={Palette.purple} />
      </Card>

      {/* Verimli saat analizi */}
      <Card>
        <Txt variant="section" style={styles.cardTitle}>
          Ne zaman verimlisin?
        </Txt>
        <HourStrip buckets={hours} color={Palette.blue} />
        {peak ? (
          <View style={styles.insight}>
            <Ionicons name="bulb" size={16} color={Palette.gold} />
            <Txt variant="small" color={Palette.textDim} style={styles.flex}>
              Genellikle{' '}
              <Txt variant="smallStrong" color={Palette.text}>
                {String(peak.start).padStart(2, '0')}:00 - {String(peak.end).padStart(2, '0')}:00
              </Txt>{' '}
              arası odaklanıyorsun. Zor dersleri bu saate almayı dene.
            </Txt>
          </View>
        ) : (
          <Txt variant="small" color={Palette.textFaint} style={styles.insight}>
            Birkaç oturum sonra burada en verimli saatini göstereceğim.
          </Txt>
        )}
      </Card>

      {/* Liderlik */}
      <View style={styles.section}>
        <View style={styles.cardHead}>
          <SectionLabel>Haftanın liderleri</SectionLabel>
          <Txt variant="tiny" color={Palette.textFaint}>
            takma adlarla
          </Txt>
        </View>

        <Card style={styles.boardCard}>
          {board.map((row, index) => {
            const isMe = row.id === student.id;

            return (
              <View
                key={row.id}
                style={[styles.boardRow, isMe && styles.boardRowMe]}
              >
                <Txt variant="bodyStrong" color={Palette.textDim} style={styles.rank}>
                  {index + 1}
                </Txt>
                <View style={styles.flex}>
                  <Txt variant="smallStrong" numberOfLines={1}>
                    {row.nickname}
                    {isMe ? ' (sen)' : ''}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint}>
                    {row.xp} XP
                  </Txt>
                </View>
                <Txt variant="bodyStrong" color={isMe ? Palette.purple : Palette.textDim}>
                  {row.minutes} dk
                </Txt>
              </View>
            );
          })}
        </Card>

        <Txt variant="tiny" color={Palette.textFaint} center>
          Tabloda gerçek isimler görünmez, sadece takma adlar.
        </Txt>
      </View>

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
    <View style={[styles.tile, { backgroundColor: color + '18', borderColor: color + '3A' }]}>
      <IconBubble name={icon} color={color} size={36} />
      <Txt variant="section" color={color}>
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
  hero: {
    alignItems: 'center',
    gap: Space.sm,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purpleSoft,
    borderWidth: 2,
    borderColor: Palette.purple + '55',
  },
  xpBlock: {
    alignSelf: 'stretch',
    marginTop: Space.sm,
    gap: 6,
  },
  xpHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
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
  insight: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
    marginTop: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  boardCard: {
    padding: Space.sm,
    gap: 2,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
  },
  boardRowMe: {
    backgroundColor: Palette.purpleSoft,
  },
  rank: {
    width: 26,
    textAlign: 'center',
  },
});
