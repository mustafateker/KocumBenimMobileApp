import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, Txt } from '@/components/ui';
import { getNotifications, markNotificationRead } from '@/lib/api';
import { logHandledError } from '@/lib/crash-reporter';
import { relativeTime } from '@/lib/date';
import { useNotificationCenter } from '@/lib/notification-center';
import { hrefForNotification } from '@/lib/notification-route';
import { useStudent } from '@/lib/session';
import type { AppNotification, NotificationType } from '@/lib/types';
import { Accent, Palette, Space } from '@/theme/tokens';

const TYPE_META: Record<NotificationType, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  task_assigned: { icon: 'clipboard', color: Accent },
  question_answered: { icon: 'chatbubble-ellipses', color: Palette.green },
  streak_reminder: { icon: 'flame', color: Palette.orange },
  announcement: { icon: 'megaphone', color: Accent },
  lesson_scheduled: { icon: 'calendar', color: Accent },
  lesson_updated: { icon: 'calendar', color: Accent },
  lesson_cancelled: { icon: 'calendar-outline', color: Palette.pink },
};

export default function Notifications() {
  useStudent();
  const router = useRouter();
  const { markOneRead, refresh } = useNotificationCenter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useFocusEffect(
    useCallback(() => {
      getNotifications()
        .then((res) => {
          setNotifications(res.data);
          // Baslikta duran rozeti sunucudaki gercekle esitle.
          refresh();
        })
        .catch((err) => {
          // Aglama hatasi ekrani bozmasin; liste bos gorunur.
          logHandledError('NOTIFICATIONS_LOAD', err);
        });
    }, [refresh])
  );

  /**
   * Bildirime dokunuldugunda okundu isaretlenir ve ilgili ekrana gidilir —
   * push bildirimine dokunmakla ayni hedef (bkz. notification-route).
   */
  const open = useCallback(
    (notification: AppNotification) => {
      if (!notification.read) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        markOneRead();
        markNotificationRead(notification.id).catch((err) => {
          // Sunucuya yazilamadiysa bir sonraki acilista tekrar "okunmadi" gorunur.
          logHandledError('NOTIFICATION_READ', err);
        });
      }

      router.push(hrefForNotification(notification));
    },
    [markOneRead, router]
  );

  return (
    <Screen tint={Accent}>
      <ScreenHeader title="Bildirimler" subtitle="Görevlerin ve uygulama duyuruların" onBack={() => router.back()} />

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="Henüz bildirim yok"
          subtitle="Hocan sana bir görev atadığında ya da bir sorunu cevapladığında burada göreceksin."
          color={Accent}
        />
      ) : (
        <View style={styles.list}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <PressScale key={n.id} onPress={() => open(n)}>
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
                  <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
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
