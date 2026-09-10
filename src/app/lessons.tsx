import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Pill, SectionLabel, Txt } from '@/components/ui';
import { getLessons } from '@/lib/api';
import { formatLessonDateTime, relativeTime } from '@/lib/date';
import { useStudent } from '@/lib/session';
import type { PrivateLesson } from '@/lib/types';
import { Palette, Space } from '@/theme/tokens';

const DAY_MS = 24 * 60 * 60 * 1000;

function upcomingRelativeLabel(iso: string): string {
  const days = Math.floor((Date.parse(iso) - Date.now()) / DAY_MS);
  if (days <= 0) return 'Bugün';
  if (days === 1) return 'Yarın';
  return `${days} gün sonra`;
}

export default function Lessons() {
  useStudent();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [upcoming, setUpcoming] = useState<PrivateLesson[]>([]);
  const [past, setPast] = useState<PrivateLesson[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLessons()
        .then((all) => {
          const now = Date.now();
          setUpcoming(all.filter((l) => Date.parse(l.scheduledAt) >= now));
          setPast(all.filter((l) => Date.parse(l.scheduledAt) < now));
          setLoaded(true);
        })
        .catch(() => {
          // Aglama hatasi ekrani bozmasin; liste bos gorunur.
          setLoaded(true);
        });
    }, [])
  );

  const isEmpty = loaded && upcoming.length === 0 && past.length === 0;

  return (
    <Screen tint={Palette.purple}>
      <ScreenHeader title="Özel Derslerim" subtitle="Hocanın planladığı birebir dersler" onBack={() => router.back()} />

      {isEmpty ? (
        <EmptyState
          icon="calendar-outline"
          title="Planlanmış özel ders yok"
          subtitle="Hocan bir özel ders planladığında burada göreceksin."
          color={Palette.purple}
        />
      ) : (
        <View style={styles.list}>
          {upcoming.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel>Yaklaşan Dersler</SectionLabel>
              <View style={styles.list}>
                {upcoming.map((l) => (
                  <LessonCard key={l.id} lesson={l} past={false} />
                ))}
              </View>
            </View>
          ) : null}

          {past.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel>Geçmiş Dersler</SectionLabel>
              <View style={styles.list}>
                {past.map((l) => (
                  <LessonCard key={l.id} lesson={l} past />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function LessonCard({ lesson, past }: { lesson: PrivateLesson; past: boolean }) {
  const color = past ? Palette.textFaint : Palette.purple;

  return (
    <Card style={styles.row} accent={past ? undefined : Palette.purple}>
      <View style={styles.rowTop}>
        <IconBubble name={past ? 'checkmark-done' : 'calendar'} color={color} size={40} />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" color={past ? Palette.textDim : Palette.text}>
            {formatLessonDateTime(lesson.scheduledAt)}
          </Txt>
          <Txt variant="small" color={Palette.textFaint}>
            {lesson.durationMinutes} dakika{lesson.note ? ` · ${lesson.note}` : ''}
          </Txt>
        </View>
        <Pill label={past ? relativeTime(lesson.scheduledAt) : upcomingRelativeLabel(lesson.scheduledAt)} color={color} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    gap: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  row: {
    gap: Space.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
