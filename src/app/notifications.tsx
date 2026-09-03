import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { assignedTaskNotifications } from '@/db/repo';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Txt } from '@/components/ui';
import type { Task } from '@/db/types';
import { relativeTime } from '@/lib/date';
import { useStudent } from '@/lib/session';
import { Palette, Space } from '@/theme/tokens';

/**
 * Uygulama-ici bildirimler: su an tek gercek kaynak hocanin atadigi
 * gorevler (tasks.created_by). Sistem bildirimleri (hos geldin, seri
 * hatirlatmasi) statik ornekler olarak listenin altina eklenir.
 */
export default function Notifications() {
  const db = useSQLiteContext();
  const student = useStudent();
  const router = useRouter();
  const [assigned, setAssigned] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      assignedTaskNotifications(db, student.id).then(setAssigned);
    }, [db, student.id])
  );

  const hasAny = assigned.length > 0;

  return (
    <Screen tint={Palette.gold}>
      <ScreenHeader title="Bildirimler" subtitle="Görevlerin ve uygulama duyuruların" onBack={() => router.back()} />

      {!hasAny ? (
        <EmptyState
          icon="notifications-outline"
          title="Henüz bildirim yok"
          subtitle="Hocan sana bir görev atadığında burada göreceksin."
          color={Palette.gold}
        />
      ) : (
        <View style={styles.list}>
          {assigned.map((task) => (
            <Card key={task.id} style={styles.row} accent={task.completed_at ? Palette.green : Palette.gold}>
              <IconBubble
                name={task.completed_at ? 'checkmark-done' : 'clipboard'}
                color={task.completed_at ? Palette.green : Palette.gold}
                size={40}
              />
              <View style={styles.flex}>
                <Txt variant="bodyStrong" numberOfLines={2}>
                  {task.completed_at ? 'Görevi tamamladın' : 'Yeni görev atandı'}
                </Txt>
                <Txt variant="small" color={Palette.textDim} numberOfLines={2}>
                  {task.title} · {task.target} soru
                </Txt>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Son tarih: {task.due_date}
                </Txt>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Uygulama
        </Txt>
        <Card style={styles.row}>
          <IconBubble name="flame" color={Palette.orange} size={40} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">Serini korumayı unutma!</Txt>
            <Txt variant="small" color={Palette.textDim}>
              {relativeTime(new Date().toISOString())} · günlük hedefine ulaşınca serin devam eder.
            </Txt>
          </View>
        </Card>
      </View>
    </Screen>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
