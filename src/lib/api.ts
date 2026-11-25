import {
  buildLiveAiCoachContext,
  completeStoredAiTask,
  generateLiveAiCoachChat,
  getStoredAiTasks,
  loadAllStoredAiTasks,
  saveStoredAiTasks,
} from './ai-coach-engine';
import { api, getRefreshToken } from './api-client';
import { CacheKeys, removeCachedData } from './cache';
import {
  loadExtraCompletedTopics,
  loadLocalCurriculumProgress,
  markTopicStudiedAndCompleted,
  mergeExtraIntoCurriculumProgress,
  saveLocalCurriculumProgress,
  type CurriculumProgressMap,
} from './maarif-curriculum';
import { localImageUri } from './photo-store';
import type {
  AiChatResponse,
  AiCoachContext,
  AppNotification,
  CanvasData,
  OnboardingInput,
  Preferences,
  PrivateLesson,
  Question,
  Student,
  StudentStats,
  StudentSummary,
  Task,
} from './types';

export type AuthResponse = { user: Student; tokens: { accessToken: string; refreshToken: string | null } };

export function studentSignup(email: string, password: string) {
  return api.post<AuthResponse>('/auth/student/signup', { email, password }, { auth: false });
}

export function login(email: string, password: string, remember: boolean) {
  return api.post<AuthResponse>('/auth/login', { email, password, remember }, { auth: false });
}

export function loginWithGoogle(idToken: string) {
  return api.post<AuthResponse>('/auth/google', { idToken }, { auth: false });
}

export type AppleLoginInput = {
  identityToken: string;
  authorizationCode?: string | null;
  fullName?: {
    givenName?: string | null;
    familyName?: string | null;
    middleName?: string | null;
    nickname?: string | null;
  } | null;
  email?: string | null;
};

export function loginWithApple(input: AppleLoginInput) {
  return api.post<AuthResponse>('/auth/apple', input, { auth: false });
}

export function logout(refreshToken: string | null) {
  return api.post<void>('/auth/logout', { refreshToken });
}

export function changePassword(currentPassword: string, newPassword: string) {
  // Sunucu parola degisince tum oturumlari kapatir; bu cihazin refresh token'ini gondererek
  // yalnizca diger cihazlarin cikis yapmasini, buranin acik kalmasini saglariz. Govde gonderim
  // aninda uretilir: access token suresi dolmussa yenilenen refresh token kullanilir.
  return api.patch<void>('/me/password', () => ({
    currentPassword,
    newPassword,
    refreshToken: getRefreshToken(),
  }));
}

export function deleteAccount(appleAuthCode?: string | null) {
  const query = appleAuthCode ? `?apple_auth_code=${encodeURIComponent(appleAuthCode)}` : '';
  return api.delete<void>(`/me${query}`);
}

export function getMe() {
  return api.get<Student>('/me');
}

export async function patchMe(input: {
  nickname?: string;
  parentEmail?: string | null;
  curriculumProgress?: CurriculumProgressMap;
}) {
  if (input.curriculumProgress) {
    await saveLocalCurriculumProgress(input.curriculumProgress);
  }
  return api.patch<Student>('/me', input);
}

export async function completeOnboarding(input: OnboardingInput) {
  if (input.curriculumProgress && Object.keys(input.curriculumProgress).length > 0) {
    await saveLocalCurriculumProgress(input.curriculumProgress);
  }
  const updated = await api.post<Student>('/me/onboarding', input);
  if (input.curriculumProgress) {
    await saveLocalCurriculumProgress(input.curriculumProgress, updated.id);
    return {
      ...updated,
      curriculumProgress: {
        ...(updated.curriculumProgress ?? {}),
        ...input.curriculumProgress,
      },
    };
  }
  return updated;
}

export async function getCurriculumProgress(student?: Student | null): Promise<CurriculumProgressMap> {
  const [local, extra] = await Promise.all([
    loadLocalCurriculumProgress(student?.id),
    loadExtraCompletedTopics(student?.id),
  ]);
  const remote = student?.curriculumProgress ?? {};
  const combined = { ...remote, ...local };
  const effective = mergeExtraIntoCurriculumProgress(student?.grade, combined, extra);

  // Eğer yerel işaretlenen konular sunucudaki curriculumProgress'ten ilerideyse arka planda senkronize et
  const hasDiff = Object.keys(effective).some((k) => effective[k] && effective[k] !== remote[k]);
  if (hasDiff && Object.keys(effective).length > 0) {
    void saveLocalCurriculumProgress(effective, student?.id);
    api.patch('/me/curriculum-progress', effective).catch(() => {
      api.patch('/me', { curriculumProgress: effective }).catch(() => {});
    });
  }

  return effective;
}

export async function updateCurriculumProgress(
  progress: CurriculumProgressMap,
  studentId?: number | null
): Promise<CurriculumProgressMap> {
  const extra = await loadExtraCompletedTopics(studentId);
  const merged = await saveLocalCurriculumProgress(progress, studentId);
  const effective = mergeExtraIntoCurriculumProgress(undefined, merged, extra);
  await removeCachedData(CacheKeys.HOME_AI_CONTEXT);
  try {
    await api.patch('/me/curriculum-progress', effective);
  } catch {
    try {
      await api.patch('/me', { curriculumProgress: effective });
    } catch {
      // Canli sunucu guncellenene kadar yerel kayit uzerinden kesintisiz calisir
    }
  }
  return effective;
}

export function getSummary() {
  return api.get<StudentSummary>('/me/summary');
}

export function getPreferences() {
  return api.get<Preferences>('/me/preferences');
}

export function patchPreferences(input: Partial<Preferences>) {
  return api.patch<Preferences>('/me/preferences', input);
}

export function getStats() {
  return api.get<StudentStats>('/me/stats');
}

export async function getCompletedTasks(limit = 30) {
  const [remote, stored] = await Promise.all([
    api.get<Task[]>(`/me/tasks/completed?limit=${limit}`).catch(() => [] as Task[]),
    loadAllStoredAiTasks(),
  ]);
  const completedStored = stored.filter((t) => t.completedAt !== null);
  const remoteIds = new Set(remote.map((t) => t.id));
  return [...completedStored.filter((t) => !remoteIds.has(t.id)), ...remote].slice(0, limit);
}

export { completeStoredAiTask } from './ai-coach-engine';

export function logFocusSession(input: {
  plannedSec: number;
  actualSec: number;
  startedAt: string;
  taskId?: number;
}) {
  return api.post<{
    minutes: number;
    xp: number;
    streak: number;
    completedTaskId?: number | null;
  }>('/focus-sessions', input);
}

export type TaskRange = 'day' | 'week' | 'month';

export async function getTasks(range: TaskRange = 'day', date?: string): Promise<Task[]> {
  const q = new URLSearchParams({ range, ...(date ? { date } : {}) });
  const [remoteTasks, storedAiTasks] = await Promise.all([
    api.get<Task[]>(`/tasks?${q.toString()}`).catch(() => [] as Task[]),
    getStoredAiTasks(range, date),
  ]);
  const remoteIds = new Set(remoteTasks.map((t) => t.id));
  const merged = [...storedAiTasks.filter((t) => !remoteIds.has(t.id)), ...remoteTasks];
  merged.sort((a, b) => {
    const aDone = a.completedAt !== null ? 1 : 0;
    const bDone = b.completedAt !== null ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.dueDate.localeCompare(b.dueDate);
  });
  return merged;
}

export async function completeTask(taskId: number, correct: number, wrong: number): Promise<Task> {
  let completed: Task | null = null;
  let backendSucceeded = false;

  // 1. Önce canlı sunucuda tamamlamayı dene (sunucu XP, streak ve veri tabanını günceller)
  try {
    completed = await api.patch<Task>(`/tasks/${taskId}/complete`, { correct, wrong });
    backendSucceeded = true;
  } catch (err) {
    // Sunucu çağrısı başarısız olduysa (yerel oluşturulmuş AI görevi veya ağ hatası)
    const local = await completeStoredAiTask(taskId, correct, wrong);
    if (local) {
      completed = local;
    } else {
      throw err;
    }
  }

  // 2. Eğer aynı görev yerel AI görevleri listesinde de kayıtlıysa, yerel depoyu da senkronize et
  if (backendSucceeded) {
    await completeStoredAiTask(taskId, correct, wrong).catch(() => {});
  }

  // 3. Konu çalışması ise müfredat ilerlemesini tamamlandı olarak işaretle
  if (completed?.subject && completed?.topic) {
    await markTopicStudiedAndCompleted(completed.subject, completed.topic, completed.studentId);
  }

  // 4. Eğer odak görevi ise ve sunucuya odak oturumu gitmediyse
  if (completed?.category === 'focus' && completed?.durationMinutes) {
    const sec = completed.durationMinutes * 60;
    logFocusSession({
      plannedSec: sec,
      actualSec: sec,
      startedAt: new Date(Date.now() - sec * 1000).toISOString(),
      taskId: completed.id,
    }).catch(() => {});
  }

  await Promise.all([
    removeCachedData(CacheKeys.HOME_TASKS),
    removeCachedData(CacheKeys.HOME_SUMMARY),
    removeCachedData(CacheKeys.HOME_AI_CONTEXT),
  ]);

  return completed;
}

export function createQuestion(input: {
  imageUri: string;
  strokes: CanvasData;
  note: string;
  subject?: string;
}) {
  return api.uploadFile<Question>('/questions', {
    fieldName: 'image',
    fileUri: localImageUri(input.imageUri),
    fields: {
      strokes: JSON.stringify(input.strokes),
      note: input.note,
      subject: input.subject || 'Matematik',
    },
  });
}

export function getQuestions() {
  return api.get<Question[]>('/questions');
}

export function resolveQuestion(id: number) {
  return api.patch<Question>(`/questions/${id}/resolve`);
}

export function getNotifications(limit = 30) {
  return api.get<{ data: AppNotification[]; nextCursor: string | null }>(`/notifications?limit=${limit}`);
}

export function markNotificationRead(id: number) {
  return api.patch<void>(`/notifications/${id}/read`);
}

export function registerPushToken(fcmToken: string) {
  return api.post<void>('/notifications/register-push', { fcmToken });
}

export function getUpcomingLessons(limit = 5) {
  return api.get<PrivateLesson[]>(`/lessons/upcoming?limit=${limit}`);
}

/** "Özel Derslerim" ekranı için TAM liste — gelecekteki VE geçmiş dersler dahil. */
export function getLessons() {
  return api.get<PrivateLesson[]>('/lessons');
}

// -----------------------------------------------------------------------------
// AI KOÇ (RAKUN) İSTEMCİ METOTLARI
// -----------------------------------------------------------------------------

async function getEffectiveLocalProgress(): Promise<CurriculumProgressMap> {
  const [local, extra] = await Promise.all([
    loadLocalCurriculumProgress(),
    loadExtraCompletedTopics(),
  ]);
  return mergeExtraIntoCurriculumProgress(undefined, local, extra);
}

export async function getAiCoachContext(): Promise<AiCoachContext> {
  try {
    const localProg = await getEffectiveLocalProgress();
    if (Object.keys(localProg).length > 0) {
      await api.patch('/me/curriculum-progress', localProg).catch(() => {});
    }
    return await api.get<AiCoachContext>('/me/ai-coach/context');
  } catch {
    return await buildLiveAiCoachContext();
  }
}

export async function sendAiCoachMessage(
  message: string,
  history?: { role: string; text: string }[]
): Promise<AiChatResponse> {
  try {
    const curriculumProgress = await getEffectiveLocalProgress();
    const res = await api.post<AiChatResponse>('/me/ai-coach/chat', {
      message,
      history,
      curriculumProgress: Object.keys(curriculumProgress).length > 0 ? curriculumProgress : undefined,
    });
    if (res.createdTasks && res.createdTasks.length > 0) {
      await saveStoredAiTasks(res.createdTasks);
      await Promise.all([
        removeCachedData(CacheKeys.HOME_TASKS),
        removeCachedData(CacheKeys.HOME_AI_CONTEXT),
      ]);
    }
    if (!res.geminiUsed) {
      try {
        const clientRes = await generateLiveAiCoachChat(message, history, res.createdTasks);
        if (clientRes.geminiUsed) {
          const finalTasks =
            res.createdTasks && res.createdTasks.length > 0 ? res.createdTasks : clientRes.createdTasks;
          if (finalTasks && finalTasks.length > 0) {
            await saveStoredAiTasks(finalTasks);
            await Promise.all([
              removeCachedData(CacheKeys.HOME_TASKS),
              removeCachedData(CacheKeys.HOME_AI_CONTEXT),
            ]);
          }
          return {
            ...res,
            reply: clientRes.reply,
            createdTasks: finalTasks,
            geminiUsed: true,
          };
        }
      } catch {}
    }
    return res;
  } catch {
    const fallbackRes = await generateLiveAiCoachChat(message, history);
    if (fallbackRes.createdTasks && fallbackRes.createdTasks.length > 0) {
      await Promise.all([
        removeCachedData(CacheKeys.HOME_TASKS),
        removeCachedData(CacheKeys.HOME_AI_CONTEXT),
      ]);
    }
    return fallbackRes;
  }
}

export async function requestAiCoachTask(subject?: string, topic?: string): Promise<Task[]> {
  try {
    const curriculumProgress = await getEffectiveLocalProgress();
    const tasks = await api.post<Task[]>('/me/ai-coach/request-task', {
      subject,
      topic,
      curriculumProgress: Object.keys(curriculumProgress).length > 0 ? curriculumProgress : undefined,
    });
    if (tasks && tasks.length > 0) {
      await saveStoredAiTasks(tasks);
      await Promise.all([
        removeCachedData(CacheKeys.HOME_TASKS),
        removeCachedData(CacheKeys.HOME_AI_CONTEXT),
      ]);
    }
    return tasks;
  } catch {
    const prompt = topic
      ? `${subject ?? 'Matematik'} dersi ${topic} konusundan bugün bana ödev ata`
      : 'Bugün bana ödev ata';
    const res = await generateLiveAiCoachChat(prompt);
    await Promise.all([
      removeCachedData(CacheKeys.HOME_TASKS),
      removeCachedData(CacheKeys.HOME_AI_CONTEXT),
    ]);
    return res.createdTasks;
  }
}

