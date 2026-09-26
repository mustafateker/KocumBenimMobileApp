import type { Href } from 'expo-router';

import type { AppNotification, NotificationType } from './types';

/**
 * Bir bildirimin acilmasi gereken ekran.
 *
 * Hem push bildirimine dokunuldugunda (expo-notifications yaniti) hem de
 * uygulama icindeki Bildirimler listesinde dokunuldugunda ayni eslesme
 * kullanilir — kullanici iki yerde de ayni yere dussun.
 */

/** Sunucunun push `data` alaninda gonderdigi govde (bkz. backend notifications/service.py). */
export type PushPayload = {
  type?: string;
  // FCM data payload degerleri her zaman string olarak teslim edilir.
  taskId?: string | number | null;
  questionId?: string | number | null;
  lessonId?: string | number | null;
};

const ROUTES: Record<NotificationType, Href> = {
  task_assigned: '/student/tasks',
  question_answered: { pathname: '/student/questions', params: { mode: 'list' } },
  streak_reminder: '/student',
  announcement: '/notifications',
  lesson_scheduled: '/lessons',
  lesson_updated: '/lessons',
  lesson_cancelled: '/lessons',
};

function isKnownType(type: string | undefined): type is NotificationType {
  return !!type && type in ROUTES;
}

/** Tanimsiz/yeni bir tur gelirse liste ekranina dus — kullanici yine de icerigi gorur. */
export function hrefForPush(payload: PushPayload | undefined): Href {
  return isKnownType(payload?.type) ? ROUTES[payload.type] : '/notifications';
}

export function hrefForNotification(notification: AppNotification): Href {
  return isKnownType(notification.type) ? ROUTES[notification.type] : '/notifications';
}
