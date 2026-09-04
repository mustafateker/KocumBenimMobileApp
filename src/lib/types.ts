/**
 * Backend API'sinin dondurdugu veri sekilleri — docs API_SPEC.md ile birebir.
 * Kocluk su an yalnizca matematik icin veriliyor; ders secimi arayuzden
 * tamamen kaldirildi, `subject` alanlari sunucu tarafinda hep "Matematik".
 */

export type Role = 'student' | 'teacher';

export type Student = {
  id: number;
  role: 'student';
  email: string;
  name: string;
  surname: string | null;
  nickname: string | null;
  grade: string | null;
  parentEmail: string | null;
  teacherId: number | null;

  goal: string | null;
  career: string | null;
  targetHighSchool: string | null;
  targetUniversity: string | null;
  targetDepartment: string | null;
  mathTopics: string[];
  dailyHours: string | null;
  timeframe: string | null;
  motivationSources: string[];
  onboardingCompletedAt: string | null;

  xp: number;
  streak: number;
  lastActiveDate: string | null;

  createdAt: string;
  updatedAt: string;
};

/** "Ilk Kurulum" sihirbazinin sonunda tek seferde gonderilen hedef profili. */
export type OnboardingInput = {
  firstName: string;
  lastName: string;
  grade: string;
  goal: string;
  career: string;
  targetHighSchool: string;
  targetUniversity: string;
  targetDepartment: string;
  mathTopics: string[];
  dailyHours: string;
  timeframe: string;
  motivation: string[];
};

export type Task = {
  id: number;
  studentId: number;
  title: string;
  subject: string;
  target: number;
  done: number;
  dueDate: string;
  createdBy: number | null;
  completedAt: string | null;
  createdAt: string;
};

export type FocusSession = {
  id: number;
  studentId: number;
  subject: string;
  plannedSec: number;
  actualSec: number;
  startedAt: string;
  endedAt: string;
  day: string;
  completed: boolean;
};

export type QuestionStatus = 'pending' | 'in_lesson' | 'answered';

/** Kanvas uzerinde tek bir cizim hareketi. */
export type StrokeItem = {
  kind: 'stroke';
  /** SVG path verisi */
  d: string;
  color: string;
  width: number;
  /** Vurgulayici yari saydam ve kalin cizilir */
  highlight?: boolean;
};

/** Kanvasa birakilan not. Koordinatlar piksel uzayinda, w/h ile birlikte olcekli. */
export type TextItem = {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
};

export type CanvasItem = StrokeItem | TextItem;

export type CanvasData = {
  w: number;
  h: number;
  items: CanvasItem[];
};

export const EMPTY_CANVAS: CanvasData = { w: 1, h: 1, items: [] };

export type Question = {
  id: number;
  studentId: number;
  subject: string;
  imageUrl: string;
  strokes: CanvasData;
  note: string | null;
  status: QuestionStatus;
  teacherReply: string | null;
  createdAt: string;
  answeredAt: string | null;
};

export type NotificationType =
  | 'task_assigned'
  | 'question_answered'
  | 'streak_reminder'
  | 'announcement'
  | 'lesson_scheduled'
  | 'lesson_updated'
  | 'lesson_cancelled';

export type AppNotification = {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  relatedTaskId: number | null;
  relatedQuestionId: number | null;
  relatedLessonId: number | null;
  read: boolean;
  createdAt: string;
};

export type LessonStatus = 'scheduled' | 'cancelled';

/** Ogretmenin ogrenciyle birebir yapacagi ozel ders — gorev takviminden ayri bir kavram. */
export type PrivateLesson = {
  id: number;
  studentId: number;
  teacherId: number;
  scheduledAt: string;
  durationMinutes: number;
  note: string | null;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeaderboardRow = {
  id: number;
  nickname: string;
  xp: number;
  minutes: number;
};

/** GET /me/summary yaniti — Ana Sayfa/Gorevlerim/Profil ekranlarinin ozeti. */
export type StudentSummary = {
  todayMinutes: number;
  weekMinutes: number;
  tasksTotal: number;
  tasksDone: number;
  pendingQuestions: number;
  isActive: boolean;
};

export type Preferences = {
  taskNotifs: boolean;
  streakNotifs: boolean;
  announcements: boolean;
  sound: boolean;
  haptics: boolean;
};

/** Emoji avatarlarin yerine gecen isim bas harfleri. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase('tr');
}
