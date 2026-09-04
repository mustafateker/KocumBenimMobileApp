import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Txt } from '@/components/ui';
import { getUpcomingLessons } from '@/lib/api';
import { formatLessonDateTime } from '@/lib/date';
import { useStudent } from '@/lib/session';
import type { PrivateLesson } from '@/lib/types';
import { Palette, Space } from '@/theme/tokens';

export default function Lessons() {
  useStudent();
  const router = useRouter();
  const [lessons, setLessons] = useState<PrivateLesson[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUpcomingLessons(20)
        .then(setLessons)
        .catch(() => {
          // Aglama hatasi ekrani bozmasin; liste bos gorunur.
        });
    }, [])
  );

  return (
    <Screen tint={Palette.purple}>
      <ScreenHeader title="Özel Derslerim" subtitle="Hocanın planladığı birebir dersler" onBack={() => router.back()} />

      {lessons.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Planlanmış özel ders yok"
          subtitle="Hocan bir özel ders planladığında burada göreceksin."
          color={Palette.purple}
        />
      ) : (
        <View style={styles.list}>
          {lessons.map((l) => (
            <Card key={l.id} style={styles.row} accent={Palette.purple}>
              <IconBubble name="calendar" color={Palette.purple} size={40} />
              <View style={styles.flex}>
                <Txt variant="bodyStrong">{formatLessonDateTime(l.scheduledAt)}</Txt>
                <Txt variant="small" color={Palette.textDim}>
                  {l.durationMinutes} dakika{l.note ? ` · ${l.note}` : ''}
                </Txt>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    gap: Space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
