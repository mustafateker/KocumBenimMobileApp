import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuButton, NotificationBell } from '@/components/header-actions';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, Pill, Txt } from '@/components/ui';
import { getSummary } from '@/lib/api';
import { humanDuration } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { useStudent } from '@/lib/session';
import type { Student, StudentSummary } from '@/lib/types';
import { Accent, Border, DetailAccent, Palette, Radius, Space, glow, pillRadius, softOf } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Hayal bolumundeki kutular — ikonlar onboarding adimlariyla ayni. */
const DREAM_ITEMS: { icon: IconName; label: string; pick: (s: Student) => string | null }[] = [
  { icon: 'briefcase', label: 'Mesleğim', pick: (s) => s.career },
  { icon: 'business', label: 'Gideceğim Lise', pick: (s) => s.targetHighSchool },
  { icon: 'library', label: 'Gideceğim Üniversite', pick: (s) => s.targetUniversity },
  { icon: 'book', label: 'Okuyacağım Bölüm', pick: (s) => s.targetDepartment },
];

export default function Profile() {
  const student = useStudent();
  const { showError } = useErrorDialog();

  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSummary()
        .then(setSummary)
        .catch((err) => showError(err, { title: 'Profil yüklenemedi', code: 'SUMMARY_LOAD' }));
    }, [showError])
  );

  const dreams = DREAM_ITEMS.map((item) => ({ ...item, value: item.pick(student) })).filter((item) => item.value);
  const discipline = student.disciplineMeaning ?? [];
  const motivation = student.motivationSources ?? [];

  return (
    <Screen tint={Accent}>
      <ScreenHeader
        title="Profil"
        subtitle="Karakterin ve hedeflerin."
        left={<MenuButton />}
        right={<NotificationBell />}
      />

      {/* Karakter karti */}
      <Card accent={Accent} style={styles.hero}>
        <View style={[styles.avatar, glow(Accent, 0.3)]}>
          <Ionicons name="person" size={44} color={Accent} />
        </View>

        <View style={styles.heroInfo}>
          <Txt variant="title" color={Palette.text} numberOfLines={2}>
            {student.nickname ?? student.name}
          </Txt>
          {student.grade ? <Pill label={student.grade} color={Accent} icon="school" /> : null}

          <View style={styles.streakPill}>
            <Ionicons name="flame" size={16} color={Palette.text} />
            <Txt variant="smallStrong" color={Palette.text}>
              {student.streak} günlük seri
            </Txt>
          </View>
        </View>
      </Card>

      {/* Istatistik doseme */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Bu Hafta
        </Txt>
        <View style={styles.tiles}>
          <StatTile icon="star" color={DetailAccent} value={String(student.xp)} label="Toplam XP" />
          <StatTile
            icon="time"
            color={DetailAccent}
            value={humanDuration((summary?.weekMinutes ?? 0) * 60)}
            label="Odak Süresi"
          />
          <StatTile
            icon="checkmark-done"
            color={DetailAccent}
            value={`${summary?.tasksDone ?? 0}/${summary?.tasksTotal ?? 0}`}
            label="Görev"
          />
        </View>
      </View>

      {/* En buyuk hedef */}
      {student.goal ? (
        <Card accent={Accent} style={styles.goalHero}>
          <View style={styles.goalHeroHead}>
            <IconBubble name="trophy" color={Accent} size={36} />
            <Txt variant="tiny" color={Accent} style={styles.goalHeroLabel}>
              EN BÜYÜK HEDEFİM
            </Txt>
          </View>
          <Txt variant="title" color={Palette.text}>
            {student.goal}
          </Txt>
        </Card>
      ) : null}

      {/* Hayallerim */}
      {dreams.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="smallStrong" color={Palette.textDim}>
            Hayallerim
          </Txt>
          <View style={styles.dreamGrid}>
            {dreams.map((item) => (
              <View key={item.label} style={styles.dreamTile}>
                <IconBubble name={item.icon} color={Accent} size={36} />
                <Txt variant="tiny" color={Palette.textDim}>
                  {item.label}
                </Txt>
                <Txt variant="bodyStrong" color={Palette.text}>
                  {item.value}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Disiplin ve motivasyon */}
      {discipline.length > 0 ? <ChipSection title="Disiplin benim için" icon="shield-checkmark" values={discipline} /> : null}
      {motivation.length > 0 ? <ChipSection title="Beni motive edenler" icon="star" values={motivation} /> : null}
    </Screen>
  );
}

function ChipSection({ title, icon, values }: { title: string; icon: IconName; values: string[] }) {
  return (
    <View style={styles.section}>
      <Txt variant="smallStrong" color={Palette.textDim}>
        {title}
      </Txt>
      <View style={styles.chips}>
        {values.map((value) => (
          <Pill key={value} label={value} color={Accent} icon={icon} />
        ))}
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: softOf(Accent),
    borderWidth: Border.thin,
    borderColor: Accent,
  },
  heroInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Space.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Space.md,
    height: 34,
    borderRadius: pillRadius(34),
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceHi,
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
  goalHero: {
    gap: Space.md,
  },
  goalHeroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  goalHeroLabel: {
    letterSpacing: 1,
  },
  dreamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  dreamTile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
});
