import {
  buildLiveAiCoachContext,
  completeStoredAiTask,
  generateLiveAiCoachChat,
  getStoredAiTasks,
  loadAllStoredAiTasks,
  saveStoredAiTasks,
} from './ai-coach-engine';
import { api, getRefreshToken } from './api-client';
import {
  loadLocalCurriculumProgress,
  markTopicStudiedAndCompleted,
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

export function deleteAccount() {
  return api.delete<void>('/me');
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
  const local = await loadLocalCurriculumProgress(student?.id);
  const remote = student?.curriculumProgress ?? {};
  return { ...remote, ...local };
}

export async function updateCurriculumProgress(
  progress: CurriculumProgressMap,
  studentId?: number | null
): Promise<CurriculumProgressMap> {
  const merged = await saveLocalCurriculumProgress(progress, studentId);
  try {
    await api.patch('/me/curriculum-progress', merged);
  } catch {
    try {
      await api.patch('/me', { curriculumProgress: merged });
    } catch {
      // Canli sunucu guncellenene kadar yerel kayit uzerinden kesintisiz calisir
    }
  }
  return merged;
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
  const localCompleted = await completeStoredAiTask(taskId, correct, wrong);
  if (localCompleted) {
    if (localCompleted.subject && localCompleted.topic) {
      await markTopicStudiedAndCompleted(localCompleted.subject, localCompleted.topic, localCompleted.studentId);
    }
    if (localCompleted.category === 'focus' && localCompleted.durationMinutes) {
      const sec = localCompleted.durationMinutes * 60;
      logFocusSession({
        plannedSec: sec,
        actualSec: sec,
        startedAt: new Date(Date.now() - sec * 1000).toISOString(),
      }).catch(() => {});
    }
    return localCompleted;
  }
  const completed = await api.patch<Task>(`/tasks/${taskId}/complete`, { correct, wrong });
  if (completed?.subject && completed?.topic) {
    await markTopicStudiedAndCompleted(completed.subject, completed.topic, completed.studentId);
  }
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

export async function getAiCoachContext(): Promise<AiCoachContext> {
  try {
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
    const res = await api.post<AiChatResponse>('/me/ai-coach/chat', { message, history });
    if (res.createdTasks && res.createdTasks.length > 0) {
      await saveStoredAiTasks(res.createdTasks);
    }
    return res;
  } catch {
    return await generateLiveAiCoachChat(message, history);
  }
}

export async function requestAiCoachTask(subject?: string, topic?: string): Promise<Task[]> {
  try {
    const tasks = await api.post<Task[]>('/me/ai-coach/request-task', { subject, topic });
    if (tasks && tasks.length > 0) {
      await saveStoredAiTasks(tasks);
    }
    return tasks;
  } catch {
    const prompt = topic
      ? `${subject ?? 'Matematik'} dersi ${topic} konusundan bugün bana ödev ata`
      : 'Bugün bana ödev ata';
    const res = await generateLiveAiCoachChat(prompt);
    return res.createdTasks;
  }
}

