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

const ROUTES: Record<string, Href> = {
  task_assigned: '/student/tasks',
  ai_task_assigned: '/student/tasks',
  task_reminder: '/student/tasks',
  question_answered: { pathname: '/student/questions', params: { mode: 'list' } },
  streak_reminder: '/student',
  decay_warning: '/student',
  announcement: '/notifications',
  lesson_scheduled: '/lessons',
  lesson_updated: '/lessons',
  lesson_cancelled: '/lessons',
  pomodoro_reminder: '/student',
  mock_exam_reminder: '/mock-exams',
  curriculum_reminder: '/subjects',
};

function isKnownType(type: string | undefined): type is NotificationType {
  return !!type && type in ROUTES;
}

/** Tanimsiz/yeni bir tur gelirse liste ekranina dus — kullanici yine de icerigi gorur. */
export function hrefForPush(payload: PushPayload | undefined): Href {
  if (!payload) return '/notifications';
  if (payload.taskId || (payload.type && payload.type.includes('task'))) {
    return '/student/tasks';
  }
  if (payload.questionId || (payload.type && payload.type.includes('question'))) {
    return { pathname: '/student/questions', params: { mode: 'list' } };
  }
  if (payload.lessonId || (payload.type && payload.type.includes('lesson'))) {
    return '/lessons';
  }
  return isKnownType(payload.type) ? ROUTES[payload.type] : '/notifications';
}

export function hrefForNotification(notification: AppNotification): Href {
  const type = (notification.type as string) || '';
  if (type === 'task_assigned' || type === 'ai_task_assigned' || type.includes('task')) {
    return '/student/tasks';
  }
  return isKnownType(notification.type) ? ROUTES[notification.type] : '/notifications';
}
