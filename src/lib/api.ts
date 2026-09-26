import { api } from './api-client';
import { localImageUri } from './photo-store';
import type {
  AppNotification,
  CanvasData,
  LeaderboardRow,
  OnboardingInput,
  Preferences,
  PrivateLesson,
  Question,
  Student,
  StudentStats,
  StudentSummary,
  Task,
} from './types';

/* -------------------------------- kimlik dogrulama ------------------------------- */

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
  return api.patch<void>('/me/password', { currentPassword, newPassword });
}

export function deleteAccount() {
  return api.delete<void>('/me');
}

/* ------------------------------------- profil ------------------------------------ */

export function getMe() {
  return api.get<Student>('/me');
}

export function patchMe(input: { nickname?: string; parentEmail?: string | null }) {
  return api.patch<Student>('/me', input);
}

export function completeOnboarding(input: OnboardingInput) {
  return api.post<Student>('/me/onboarding', input);
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

export function getCompletedTasks(limit = 30) {
  return api.get<Task[]>(`/me/tasks/completed?limit=${limit}`);
}

/* ---------------------------------- odak oturumlari ------------------------------- */

export function logFocusSession(input: { plannedSec: number; actualSec: number; startedAt: string }) {
  return api.post<{ minutes: number; xp: number; streak: number }>('/focus-sessions', input);
}

export function getDailyMinutes(days = 7) {
  return api.get<{ day: string; minutes: number }[]>(`/focus-sessions/daily-minutes?days=${days}`);
}

/* --------------------------------------- gorevler ---------------------------------- */

export type TaskRange = 'day' | 'week' | 'month';

export function getTasks(range: TaskRange = 'day', date?: string) {
  const q = new URLSearchParams({ range, ...(date ? { date } : {}) });
  return api.get<Task[]>(`/tasks?${q.toString()}`);
}

export function completeTask(taskId: number, correct: number, wrong: number) {
  return api.patch<Task>(`/tasks/${taskId}/complete`, { correct, wrong });
}

/* --------------------------------------- sorular ----------------------------------- */

export function createQuestion(input: { imageUri: string; strokes: CanvasData; note: string }) {
  return api.uploadFile<Question>('/questions', {
    fieldName: 'image',
    fileUri: localImageUri(input.imageUri),
    fields: {
      strokes: JSON.stringify(input.strokes),
      note: input.note,
    },
  });
}

export function getQuestions() {
  return api.get<Question[]>('/questions');
}

export function resolveQuestion(id: number) {
  return api.patch<Question>(`/questions/${id}/resolve`);
}

/* -------------------------------------- liderlik ------------------------------------ */

export type LeaderboardRange = 'weekly' | 'monthly' | 'all';

export function getLeaderboard(range: LeaderboardRange) {
  return api.get<LeaderboardRow[]>(`/leaderboard?range=${range}`);
}

/* ------------------------------------ bildirimler ------------------------------------ */

export function getNotifications(limit = 30) {
  return api.get<{ data: AppNotification[]; nextCursor: string | null }>(`/notifications?limit=${limit}`);
}

export function markNotificationRead(id: number) {
  return api.patch<void>(`/notifications/${id}/read`);
}

export function registerPushToken(fcmToken: string) {
  return api.post<void>('/notifications/register-push', { fcmToken });
}

/* ------------------------------------- ozel dersler ----------------------------------- */

export function getUpcomingLessons(limit = 5) {
  return api.get<PrivateLesson[]>(`/lessons/upcoming?limit=${limit}`);
}

/** "Özel Derslerim" ekranı için TAM liste — gelecekteki VE geçmiş dersler dahil. */
export function getLessons() {
  return api.get<PrivateLesson[]>('/lessons');
}
