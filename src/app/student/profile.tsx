import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, Divider, IconBubble, ProgressBar, SectionLabel, Segmented, Txt } from '@/components/ui';
import { getLeaderboard, getSummary, type LeaderboardRange } from '@/lib/api';
import { humanDuration } from '@/lib/date';
import { useHamburgerMenu } from '@/lib/hamburger-menu-context';
import { useStudent } from '@/lib/session';
import { initials, type LeaderboardRow, type Student, type StudentSummary } from '@/lib/types';
import { Border, OnColor, Palette, Radius, Space } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const BOARD_OPTIONS: { key: LeaderboardRange; label: string }[] = [
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
  { key: 'all', label: 'Tüm Zamanlar' },
];

/** Ilk uc siranin rozet rengi: altin, gumus, bronz. */
const PODIUM = [Palette.gold, Palette.textFaint, Palette.orange];

/** Onboarding'de toplanan hedef alanlari — yalnizca dolu olanlar gosterilir. */
const GOAL_FIELDS: { key: keyof Student; label: string; icon: IconName; color: string }[] = [
  { key: 'goal', label: 'Hedef', icon: 'trophy', color: Palette.gold },
  { key: 'career', label: 'Meslek hayali', icon: 'briefcase', color: Palette.blue },
  { key: 'targetHighSchool', label: 'Hedef lise', icon: 'business', color: Palette.orange },
  { key: 'targetUniversity', label: 'Hedef üniversite', icon: 'library', color: Palette.purple },
  { key: 'targetDepartment', label: 'Hedef bölüm', icon: 'book', color: Palette.green },
];

const ACCOUNT_LINKS: { label: string; icon: IconName; href: Href }[] = [
  { label: 'İstatistikler', icon: 'stats-chart', href: '/stats' },
  { label: 'Bildirimler', icon: 'notifications', href: '/notifications' },
  { label: 'Ayarlar', icon: 'settings', href: '/settings' },
];

export default function Profile() {
  const student = useStudent();
  const router = useRouter();
  const { open: openMenu } = useHamburgerMenu();

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [boardRange, setBoardRange] = useState<LeaderboardRange>('weekly');
  const [board, setBoard] = useState<LeaderboardRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSummary()
        .then(setSummary)
        .catch(() => {
          // Ag hatasi ekrani bozmasin.
        });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      getLeaderboard(boardRange)
        .then(setBoard)
        .catch(() => {
          // Ag hatasi ekrani bozmasin.
        });
    }, [boardRange])
  );

  // Backend `name` alaninda ad ve soyadi birlikte tutuyor; `surname` eklemek soyadi tekrarlar.
  const fullName = student.name;
  const weekMinutes = summary?.weekMinutes ?? 0;
  const handle = [student.nickname ? `@${student.nickname}` : null, student.grade].filter(Boolean).join(' · ');
  const goals = GOAL_FIELDS.filter((f) => {
    const value = student[f.key];
    return typeof value === 'string' && value.trim().length > 0;
  });

  const tasksDone = summary?.tasksDone ?? 0;
  const tasksTotal = summary?.tasksTotal ?? 0;

  return (
    <Screen tint={Palette.purple}>
      <ScreenHeader title="Profil" right={<IconButton icon="menu" onPress={openMenu} />} />

      {/* Kimlik karti */}
      <Card style={styles.identity}>
        <View style={styles.identityTop}>
          <View style={styles.avatar}>
            <Txt variant="section" color={OnColor}>
              {initials(fullName)}
            </Txt>
          </View>
          <View style={styles.flex}>
            <Txt variant="section" numberOfLines={1}>
              {fullName}
            </Txt>
            {handle ? (
              <Txt variant="small" color={Palette.textDim} numberOfLines={1}>
                {handle}
              </Txt>
            ) : null}
          </View>
        </View>

        <Divider />

        <View style={styles.statStrip}>
          <Stat icon="star" color={Palette.gold} value={student.xp.toLocaleString('tr-TR')} label="Toplam XP" />
          <View style={styles.statDivider} />
          <Stat icon="flame" color={Palette.orange} value={`${student.streak} gün`} label="Seri" />
          <View style={styles.statDivider} />
          <Stat
            icon="time"
            color={Palette.green}
            value={weekMinutes === 0 ? '0 dk' : humanDuration(weekMinutes * 60)}
            label="Bu hafta"
          />
        </View>
      </Card>

      {/* Gorev ilerlemesi */}
      <Card style={styles.progressCard}>
        <View style={styles.rowBetween}>
          <Txt variant="bodyStrong">Görev ilerlemesi</Txt>
          <Txt variant="smallStrong" color={Palette.textDim}>
            {tasksDone} / {tasksTotal}
          </Txt>
        </View>
        <ProgressBar
          progress={tasksTotal === 0 ? 0 : tasksDone / tasksTotal}
          color={Palette.purple}
          height={8}
        />
      </Card>

      {/* Hedefler */}
      {goals.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel>Hedeflerim</SectionLabel>
          <Card style={styles.listCard}>
            {goals.map((f, index) => (
              <View key={f.key}>
                {index > 0 ? <Divider style={styles.inset} /> : null}
                <View style={styles.listRow}>
                  <IconBubble name={f.icon} color={f.color} size={36} />
                  <View style={styles.flex}>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      {f.label.toLocaleUpperCase('tr')}
                    </Txt>
                    <Txt variant="smallStrong" numberOfLines={2}>
                      {String(student[f.key])}
                    </Txt>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {/* Liderlik tablosu */}
      <View style={styles.section}>
        <SectionLabel>Liderlik Tablosu</SectionLabel>
        <Segmented options={BOARD_OPTIONS} value={boardRange} onChange={setBoardRange} color={Palette.purple} />

        <Card style={styles.listCard}>
          {board.length === 0 ? (
            <Txt variant="small" color={Palette.textDim} center style={styles.boardEmpty}>
              Bu dönem için henüz sıralama yok.
            </Txt>
          ) : (
            board.map((row, index) => (
              <BoardRow key={row.id} row={row} rank={index + 1} isMe={row.id === student.id} />
            ))
          )}
        </Card>
      </View>

      {/* Hesap */}
      <View style={styles.section}>
        <SectionLabel>Hesap</SectionLabel>
        <Card style={styles.listCard}>
          {ACCOUNT_LINKS.map((link, index) => (
            <View key={link.label}>
              {index > 0 ? <Divider style={styles.inset} /> : null}
              <PressScale onPress={() => router.push(link.href)} scaleTo={0.98}>
                <View style={styles.listRow}>
                  <IconBubble name={link.icon} color={Palette.textDim} size={36} />
                  <Txt variant="bodyStrong" style={styles.flex}>
                    {link.label}
                  </Txt>
                  <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
                </View>
              </PressScale>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValue}>
        <Ionicons name={icon} size={15} color={color} />
        <Txt variant="bodyStrong" numberOfLines={1}>
          {value}
        </Txt>
      </View>
      <Txt variant="tiny" color={Palette.textFaint}>
        {label}
      </Txt>
    </View>
  );
}

function BoardRow({ row, rank, isMe }: { row: LeaderboardRow; rank: number; isMe: boolean }) {
  const podium = PODIUM[rank - 1];

  return (
    <View style={[styles.boardRow, isMe && styles.boardRowMe]}>
      <View style={[styles.rank, podium ? { backgroundColor: podium } : styles.rankPlain]}>
        <Txt variant="tiny" color={podium ? OnColor : Palette.textDim}>
          {rank}
        </Txt>
      </View>
      <View style={styles.boardAvatar}>
        <Txt variant="tiny" color={Palette.purple}>
          {initials(row.nickname)}
        </Txt>
      </View>
      <View style={styles.flex}>
        <Txt variant="smallStrong" numberOfLines={1}>
          {row.nickname}
          {isMe ? ' (sen)' : ''}
        </Txt>
        <Txt variant="tiny" color={Palette.textFaint}>
          {row.xp.toLocaleString('tr-TR')} XP
        </Txt>
      </View>
      <Txt variant="smallStrong" color={isMe ? Palette.purple : Palette.textDim}>
        {row.minutes} dk
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: {
    gap: Space.lg,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purple,
  },
  statStrip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.border,
  },
  progressCard: {
    gap: Space.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: Space.sm,
  },
  listCard: {
    paddingVertical: Space.xs,
    paddingHorizontal: Space.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  /** Ayiricilar ikonun hizasindan baslasin diye soldan iceride. */
  inset: {
    marginLeft: 36 + Space.md,
  },
  boardEmpty: {
    paddingVertical: Space.lg,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.sm,
    marginHorizontal: -Space.sm,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: 'transparent',
  },
  boardRowMe: {
    backgroundColor: Palette.purpleSoft,
    borderColor: Palette.purple,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPlain: {
    backgroundColor: Palette.surfaceHi,
  },
  boardAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purpleSoft,
    borderWidth: Border.thick,
    borderColor: Palette.border,
  },
});
