/**
 * Kocluk su an yalnizca matematik icin veriliyor; ders secimi arayuzden
 * tamamen kaldirildi. Veritabanindaki `subject` sutunlari duruyor, boylece
 * ileride baska dersler eklenirse yalnizca arayuz geri getirilir.
 */
export const SUBJECT = 'Matematik';

export type Role = 'student' | 'teacher' | 'parent';

export type User = {
  id: number;
  role: Role;
  name: string;
  nickname: string | null;
  pin: string;
  grade: string | null;
  linked_student_id: number | null;
  xp: number;
  streak: number;
  last_active: string | null;
  created_at: string;
  email: string | null;
  password: string | null;
  surname: string | null;
  exam_type: string | null;
  goal: string | null;
  career: string | null;
  life_dream: string | null;
  target_high_school: string | null;
  target_university: string | null;
  target_department: string | null;
  /** JSON string dizisi */
  math_topics: string;
  daily_hours: string | null;
  timeframe: string | null;
  /** JSON string dizisi */
  motivation_sources: string;
  onboarding_completed_at: string | null;
};

/** "Ilk Kurulum" sihirbazinin sonunda tek seferde kaydedilen hedef profili. */
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
  student_id: number;
  title: string;
  subject: string;
  target: number;
  done: number;
  due_date: string;
  created_by: number | null;
  completed_at: string | null;
};

export type FocusSession = {
  id: number;
  student_id: number;
  subject: string;
  planned_sec: number;
  actual_sec: number;
  started_at: string;
  ended_at: string;
  day: string;
  completed: number;
};

export type QuestionStatus = 'pending' | 'in_lesson' | 'answered';

export type Question = {
  id: number;
  student_id: number;
  image_uri: string;
  /** JSON: Stroke[] — kanvas cizimleri */
  strokes: string;
  note: string | null;
  subject: string;
  status: QuestionStatus;
  tag: string | null;
  teacher_reply: string | null;
  created_at: string;
  answered_at: string | null;
};

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

/** Kanvasa birakilan not. Koordinatlar 0-1 arasi orandir, boylece
 *  farkli ekran genisliklerinde ayni yerde durur. */
export type TextItem = {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
};

export type CanvasItem = StrokeItem | TextItem;

/**
 * Kanvasin tamami. Cizimler olusturuldugu andaki piksel uzayinda saklanir;
 * w/h ile birlikte SVG viewBox'a verilince her ekran boyutunda dogru olcekte
 * gorunur (cizgi kalinliklari dahil).
 */
export type CanvasData = {
  w: number;
  h: number;
  items: CanvasItem[];
};

export const EMPTY_CANVAS: CanvasData = { w: 1, h: 1, items: [] };

/** Veritabanindaki JSON metnini guvenle cozer; bozuksa bos kanvas doner. */
export function parseCanvas(raw: string | null | undefined): CanvasData {
  if (!raw) return EMPTY_CANVAS;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed as CanvasData;
  } catch {
    // Bozuk kayit yuzunden ekranin patlamasindansa bos kanvas gostermek iyi.
  }
  return EMPTY_CANVAS;
}

/** Emoji avatarlarin yerine gecen isim bas harfleri. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase('tr');
}

/** Ekranlarda kullanilan, birden fazla tablodan derlenmis ogrenci ozeti. */
export type StudentSummary = {
  user: User;
  todayMinutes: number;
  weekMinutes: number;
  tasksTotal: number;
  tasksDone: number;
  pendingQuestions: number;
  /** Son 15 dakika icinde oturum bitirdiyse "calisiyor" sayilir. */
  isActive: boolean;
};
