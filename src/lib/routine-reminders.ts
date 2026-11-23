import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';
import { useEffect } from 'react';

import { logHandledError } from './crash-reporter';
import { getExamTrack, isExamYearStudent } from './mock-exams';
import type { Student, Task } from './types';

const ROUTINE_POMODORO_ID = 'routine_pomodoro_daily';
const ROUTINE_TASK_ID = 'routine_task_daily';
const ROUTINE_MOCK_EXAM_ID = 'routine_mock_exam_weekly';
const ROUTINE_CURRICULUM_ID = 'routine_curriculum_weekly';

function canScheduleLocalNotifications(): boolean {
  if (isRunningInExpoGo()) return false;
  return (
    requireOptionalNativeModule('ExpoPushTokenManager') != null ||
    requireOptionalNativeModule('ExpoNotificationScheduler') != null
  );
}

export type RoutineSyncOptions = {
  tasks?: Task[];
  pomodoroMinutesToday?: number;
  hasIncompleteTopics?: boolean;
};

/**
 * Öğrencinin durumuna ve sınıfına göre periyodik rutin bildirimleri senkronize eder.
 * Kesinlikle hiçbir bildirim metninde veya başlığında emoji kullanılmaz.
 */
export async function syncRoutineReminders(
  student: Student | null | undefined,
  options?: RoutineSyncOptions
): Promise<void> {
  if (!student || !canScheduleLocalNotifications()) return;

  try {
    const Notifications = await import('expo-notifications');
    const { SchedulableTriggerInputTypes } = Notifications;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // 1. Günlük Pomodoro Hatırlatıcısı (Her gün 17:30)
    // Bugün hiç odaklanma oturumu yapılmadıysa hatırlatır.
    await Notifications.scheduleNotificationAsync({
      identifier: ROUTINE_POMODORO_ID,
      content: {
        title: 'Günün İlk Odak Oturumu',
        body: 'Bugün henüz odaklanma başlatmadın. Hedefine ulaşmak için 25 dakikalık bir çalışma seansı yapabilirsin.',
        data: { type: 'pomodoro_reminder' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: 17,
        minute: 30,
        channelId: 'study_reminders',
      },
    });

    // 2. Günlük Ödev ve Görev Hatırlatıcısı (Her gün 16:30)
    // Öğrencinin tamamlanmamış görevleri varsa uyarır.
    const hasPendingTasks = options?.tasks ? options.tasks.some((t) => !t.completedAt) : true;
    if (hasPendingTasks) {
      await Notifications.scheduleNotificationAsync({
        identifier: ROUTINE_TASK_ID,
        content: {
          title: 'Bugün Tamamlanması Gereken Görevler',
          body: 'Programında bekleyen ödevlerin bulunuyor. Günlük hedeflerini tamamlamak için görev listeni kontrol edebilirsin.',
          data: { type: 'task_reminder' },
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: 16,
          minute: 30,
          channelId: 'tasks_homework',
        },
      });
    } else {
      await Notifications.cancelScheduledNotificationAsync(ROUTINE_TASK_ID);
    }

    // 3. Haftalık Deneme Sınavı Hatırlatıcısı (Cumartesi 10:00)
    // YALNIZCA 8. sınıf (LGS) ve 12. sınıf (YKS) hazırlık öğrencilerine kurulur.
    const isExamStudent = isExamYearStudent(student.grade);
    if (isExamStudent) {
      const isLgs = getExamTrack(student.grade) === 'lgs';
      await Notifications.scheduleNotificationAsync({
        identifier: ROUTINE_MOCK_EXAM_ID,
        content: {
          title: isLgs ? 'Haftalık LGS Deneme Vakti' : 'Haftalık YKS Deneme Vakti',
          body: 'Haftalık denemeni çözüp netlerini sisteme kaydedebilir ve yapay zeka analizini inceleyebilirsin.',
          data: { type: 'mock_exam_reminder' },
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: 7, // Cumartesi
          hour: 10,
          minute: 0,
          channelId: 'streak_motivation',
        },
      });
    } else {
      // 8 ve 12 dışındaki sınıflarda deneme bildirimi iptal edilir.
      await Notifications.cancelScheduledNotificationAsync(ROUTINE_MOCK_EXAM_ID);
    }

    // 4. Eksik Konu İlerlemesi Bildirimi (Salı 18:00)
    // Öğrenci müfredatındaki tüm derslerin geldiği konuyu henüz işaretlemediyse hatırlatır.
    if (options?.hasIncompleteTopics) {
      await Notifications.scheduleNotificationAsync({
        identifier: ROUTINE_CURRICULUM_ID,
        content: {
          title: 'Konu İlerlemeni Tamamla',
          body: 'Koçunun sana daha doğru ödev atayabilmesi için lütfen tüm derslerden geldiğin konuya kadar işaretle.',
          data: { type: 'curriculum_reminder' },
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: 3, // Salı
          hour: 18,
          minute: 0,
          channelId: 'streak_motivation',
        },
      });
    } else {
      await Notifications.cancelScheduledNotificationAsync(ROUTINE_CURRICULUM_ID);
    }
  } catch (err) {
    logHandledError('ROUTINE_NOTIFS_SCHEDULE_FAILED', err);
  }
}

/**
 * Ana ekranda öğrenci, görevler veya konu verisi değiştikçe rutin bildirimleri senkronlar.
 */
export function useSyncRoutineReminders(
  student: Student | null | undefined,
  options?: RoutineSyncOptions
): void {
  const tasksLength = options?.tasks?.length;
  const pomodoroMinutes = options?.pomodoroMinutesToday;
  const hasIncomplete = options?.hasIncompleteTopics;

  useEffect(() => {
    if (student) {
      syncRoutineReminders(student, options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, tasksLength, pomodoroMinutes, hasIncomplete]);
}
