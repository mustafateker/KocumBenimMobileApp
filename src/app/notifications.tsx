import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Txt } from '@/components/ui';
import { getNotifications, markNotificationRead } from '@/lib/api';
import { relativeTime } from '@/lib/date';
import { useStudent } from '@/lib/session';
import type { AppNotification, NotificationType } from '@/lib/types';
import { Palette, Space } from '@/theme/tokens';

const TYPE_META: Record<NotificationType, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  task_assigned: { icon: 'clipboard', color: Palette.gold },
  question_answered: { icon: 'chatbubble-ellipses', color: Palette.green },
  streak_reminder: { icon: 'flame', color: Palette.orange },
  announcement: { icon: 'megaphone', color: Palette.blue },
};

export default function Notifications() {
  useStudent();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useFocusEffect(
    useCallback(() => {
      getNotifications()
        .then((res) => setNotifications(res.data))
        .catch(() => {
          // Aglama hatasi ekrani bozmasin; liste bos gorunur.
        });
    }, [])
  );

  const markRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch(() => {
      // Sunucuya yazilamadiysa bir sonraki acilista tekrar "okunmadi" gorunur.
    });
  }, []);

  return (
    <Screen tint={Palette.gold}>
      <ScreenHeader title="Bildirimler" subtitle="Görevlerin ve uygulama duyuruların" onBack={() => router.back()} />

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="Henüz bildirim yok"
          subtitle="Hocan sana bir görev atadığında ya da bir sorunu cevapladığında burada göreceksin."
          color={Palette.gold}
        />
      ) : (
        <View style={styles.list}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <PressScale key={n.id} onPress={() => markRead(n.id)} disabled={n.read}>
                <Card style={styles.row} accent={n.read ? undefined : meta.color}>
                  <IconBubble name={meta.icon} color={meta.color} size={40} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong" numberOfLines={2}>
                      {n.title}
                    </Txt>
                    <Txt variant="small" color={Palette.textDim} numberOfLines={2}>
                      {n.body}
                    </Txt>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      {relativeTime(n.createdAt)}
                    </Txt>
                  </View>
                </Card>
              </PressScale>
            );
          })}
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
