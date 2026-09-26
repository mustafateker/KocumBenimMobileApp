import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuButton, NotificationBell } from '@/components/header-actions';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, Pill, Segmented, Txt } from '@/components/ui';
import { getLeaderboard, getSummary, type LeaderboardRange } from '@/lib/api';
import { humanDuration } from '@/lib/date';
import { useStudent } from '@/lib/session';
import { initials, type LeaderboardRow, type StudentSummary } from '@/lib/types';
import { Accent, Border, Palette, Radius, Space, glow, pillRadius, softOf } from '@/theme/tokens';

type BoardRange = LeaderboardRange;

const BOARD_OPTIONS: { key: BoardRange; label: string }[] = [
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
  { key: 'all', label: 'Tüm Zamanlar' },
];

export default function Profile() {
  const student = useStudent();

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [boardRange, setBoardRange] = useState<BoardRange>('weekly');
  const [board, setBoard] = useState<LeaderboardRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSummary()
        .then(setSummary)
        .catch(() => {
          // Aglama hatasi ekrani bozmasin.
        });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      getLeaderboard(boardRange)
        .then(setBoard)
        .catch(() => {
          // Aglama hatasi ekrani bozmasin.
        });
    }, [boardRange])
  );

  return (
    <Screen tint={Accent}>
      <ScreenHeader
        title="Profil"
        subtitle="Karakterin, hedeflerin ve rakiplerin."
        left={<MenuButton />}
        right={<NotificationBell />}
      />

      {/* Karakter karti */}
      <Card accent={Accent} style={styles.hero}>
        <View style={[styles.avatar, glow(Accent, 0.3)]}>
          <Txt variant="hero" color={Accent}>
            {initials(student.name)}
          </Txt>
        </View>

        <Txt variant="title" center>
          {student.nickname ?? student.name}
        </Txt>
        {student.grade ? <Pill label={student.grade} color={Accent} icon="school" /> : null}

        <View style={styles.streakPill}>
          <Ionicons name="flame" size={16} color={Palette.orange} />
          <Txt variant="smallStrong" color={Palette.orange}>
            {student.streak} günlük seri
          </Txt>
        </View>
      </Card>

      {/* Istatistik doseme */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Bu Hafta
        </Txt>
        <View style={styles.tiles}>
          <StatTile icon="star" color={Accent} value={String(student.xp)} label="Toplam XP" />
          <StatTile
            icon="time"
            color={Accent}
            value={humanDuration((summary?.weekMinutes ?? 0) * 60)}
            label="Odak Süresi"
          />
          <StatTile
            icon="checkmark-done"
            color={Accent}
            value={`${summary?.tasksDone ?? 0}/${summary?.tasksTotal ?? 0}`}
            label="Görev"
          />
        </View>
      </View>

      {/* Liderlik tablosu */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Liderlik Tablosu
        </Txt>
        <Segmented options={BOARD_OPTIONS} value={boardRange} onChange={setBoardRange} color={Accent} />

        <Card style={styles.boardCard}>
          {board.map((row, index) => {
            const isMe = row.id === student.id;
            const isFirst = index === 0;

            return (
              <View key={row.id} style={[styles.boardRow, isMe && styles.boardRowMe]}>
                {isFirst ? (
                  <Ionicons name="trophy" size={18} color={Palette.gold} style={styles.rank} />
                ) : (
                  <Txt variant="bodyStrong" color={Palette.textDim} style={styles.rank}>
                    {index + 1}
                  </Txt>
                )}
                <View style={styles.flex}>
                  <Txt variant="smallStrong" numberOfLines={1}>
                    {row.nickname}
                    {isMe ? ' (sen)' : ''}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint}>
                    {row.xp} XP
                  </Txt>
                </View>
                <Txt variant="bodyStrong" color={isMe ? Accent : Palette.textDim}>
                  {row.minutes} dk
                </Txt>
              </View>
            );
          })}
        </Card>
      </View>
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
    backgroundColor: softOf(Accent),
    borderWidth: Border.thin,
    borderColor: Accent,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Space.xs,
    paddingHorizontal: Space.md,
    height: 34,
    borderRadius: pillRadius(34),
    borderWidth: Border.thick,
    borderColor: Palette.orange,
    backgroundColor: Palette.orangeSoft,
  },
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
    backgroundColor: softOf(Accent),
  },
  rank: {
    width: 26,
    textAlign: 'center',
  },
});
