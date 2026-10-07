/**
 * Backend API'sinin dondurdugu veri sekilleri — docs API_SPEC.md ile birebir.
 * Ogrenci arayuzunde ders secimi yok; soru ve odak oturumlarinda `subject` sunucu
 * tarafinda hep "Matematik". Gorevlerde dersi ve konuyu ogretmen panelden secer.
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
  dailyHours: string | null;
  disciplineMeaning: string[];
  commitmentDuration: string | null;
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
  dailyHours: string;
  disciplineMeaning: string[];
  commitmentDuration: string;
  motivation: string[];
};

export type TaskCategory = 'question' | 'topic' | 'focus';

export type Task = {
  id: number;
  studentId: number;
  title: string;
  /** Ogretmenin sectigi ders; konu secilmeden atanan gorevlerde sunucunun varsayilani ("Matematik"). */
  subject: string;
  /** Konunun sinifi (1-12) ve mufredattaki adi; konu secilmeden atanan gorevlerde null. */
  grade: number | null;
  topic: string | null;
  /** Hedef; birimi gorev turune gore degisir (bkz. task-categories.ts `taskGoal`). */
  target: number;
  /** Dakika: soru cozmede istege bagli sure siniri, odakli calismada calisma suresi. */
  durationMinutes: number | null;
  category: TaskCategory;
  done: number;
  correctCount: number;
  wrongCount: number;
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
  resolvedByStudent: boolean;
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

export type TopicBreakdown = {
  title: string;
  correct: number;
  wrong: number;
  attempts: number;
};

/** Ders → konu kirilimindaki sayaclar (backend: modules/tasks/breakdown.py). */
export type TopicCounts = {
  studyAssigned: number;
  studyCompleted: number;
  questionTasks: number;
  questionTasksCompleted: number;
  questionsAssigned: number;
  correct: number;
  wrong: number;
  /** Sonucu girilmis gorevlerde hedef - dogru - yanlis. */
  blank: number;
  /** Dogru/yanlis girilmeden tamamlanan soru gorevi sayisi. */
  unreportedTasks: number;
  /** correct + wrong + blank */
  solved: number;
  /** correct / solved; hic sonuc yoksa null. */
  successRate: number | null;
};

export type TopicReport = TopicCounts & { grade: number | null; topic: string; lastActivityAt: string | null };

export type SubjectReport = TopicCounts & { subject: string; topics: TopicReport[] };

/** Basari orani esigin altinda kalan konu; en dusukten baslayarak gelir. */
export type WeakTopic = {
  subject: string;
  grade: number | null;
  topic: string;
  correct: number;
  wrong: number;
  blank: number;
  solved: number;
  successRate: number;
};

export type StudentStats = {
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
  currentStreak: number;
  last7Days: { day: string; minutes: number; tasksCompleted: number }[];
  byTopic: TopicBreakdown[];
  /** Tum gorevlerin ders → konu kirilimi; eski sunucu surumleri bu alanlari dondurmez. */
  subjects?: SubjectReport[];
  weakTopics?: WeakTopic[];
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
