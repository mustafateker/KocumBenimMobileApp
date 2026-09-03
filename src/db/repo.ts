import type { SQLiteDatabase } from 'expo-sqlite';

import { dayKey, lastNDays, todayKey } from '@/lib/date';
import { nextStreak, Rules, sessionReward } from '@/lib/gamification';

import {
  SUBJECT,
  type FocusSession,
  type OnboardingInput,
  type Question,
  type QuestionStatus,
  type Role,
  type StudentSummary,
  type Task,
  type User,
} from './types';

/* ------------------------------- kullanicilar ------------------------------ */

export async function listUsers(db: SQLiteDatabase, role: Role): Promise<User[]> {
  return db.getAllAsync<User>('SELECT * FROM users WHERE role = ? ORDER BY name', role);
}

export async function getUser(db: SQLiteDatabase, id: number): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', id);
}

export async function verifyPin(db: SQLiteDatabase, id: number, pin: string): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ? AND pin = ?', id, pin);
}

export async function createStudent(
  db: SQLiteDatabase,
  input: { name: string; nickname: string; pin: string; grade: string }
): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO users (role, name, nickname, pin, grade, created_at)
     VALUES ('student', ?, ?, ?, ?, ?)`,
    input.name,
    input.nickname,
    input.pin,
    input.grade,
    new Date().toISOString()
  );
  return res.lastInsertRowId;
}

/* ------------------------- e-posta / parola ile kayit ----------------------- */

export async function getUserByEmail(db: SQLiteDatabase, email: string): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM users WHERE email = ?', email.trim().toLowerCase());
}

/**
 * Dogrudan uygulama icinden ogrenci kaydi. Ad/soyad "Ilk Kurulum" sihirbazinda
 * sorulur; kayit anda henuz bilinmedigi icin gecici olarak e-postanin basi
 * kullanilir ve `completeOnboarding` ile uzerine yazilir.
 */
export async function createStudentAccount(
  db: SQLiteDatabase,
  input: { email: string; password: string }
): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const res = await db.runAsync(
    `INSERT INTO users (role, name, pin, email, password, created_at)
     VALUES ('student', ?, '', ?, ?, ?)`,
    email.split('@')[0],
    email,
    input.password,
    new Date().toISOString()
  );
  const user = await getUser(db, res.lastInsertRowId);
  if (!user) throw new Error('Kullanıcı oluşturulamadı');
  return user;
}

export async function updatePassword(db: SQLiteDatabase, userId: number, newPassword: string) {
  await db.runAsync('UPDATE users SET password = ? WHERE id = ?', newPassword, userId);
}

/** Hesabi ve ona ait tum verileri siler — geri alinamaz. */
export async function deleteAccount(db: SQLiteDatabase, userId: number) {
  await db.runAsync('DELETE FROM focus_sessions WHERE student_id = ?', userId);
  await db.runAsync('DELETE FROM questions WHERE student_id = ?', userId);
  await db.runAsync('DELETE FROM tasks WHERE student_id = ?', userId);
  await db.runAsync('DELETE FROM users WHERE id = ?', userId);
}

/** Hocanin atadigi gorevler — Bildirimler ekraninda "yeni gorev" olarak gosterilir. */
export async function assignedTaskNotifications(
  db: SQLiteDatabase,
  studentId: number,
  limit = 30
): Promise<Task[]> {
  return db.getAllAsync<Task>(
    `SELECT * FROM tasks WHERE student_id = ? AND created_by IS NOT NULL
     ORDER BY due_date DESC LIMIT ?`,
    studentId,
    limit
  );
}

export async function verifyEmailPassword(
  db: SQLiteDatabase,
  email: string,
  password: string
): Promise<User | null> {
  return db.getFirstAsync<User>(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    email.trim().toLowerCase(),
    password
  );
}

/** "Ilk Kurulum" sihirbazinin son adiminda tum hedef profilini tek seferde yazar. */
export async function completeOnboarding(db: SQLiteDatabase, studentId: number, input: OnboardingInput) {
  await db.runAsync(
    `UPDATE users SET
       name = ?, surname = ?, grade = ?, goal = ?, career = ?,
       target_high_school = ?, target_university = ?, target_department = ?,
       math_topics = ?, daily_hours = ?, timeframe = ?, motivation_sources = ?,
       onboarding_completed_at = ?
     WHERE id = ?`,
    `${input.firstName} ${input.lastName}`.trim(),
    input.lastName,
    input.grade,
    input.goal,
    input.career,
    input.targetHighSchool,
    input.targetUniversity,
    input.targetDepartment,
    JSON.stringify(input.mathTopics),
    input.dailyHours,
    input.timeframe,
    JSON.stringify(input.motivation),
    new Date().toISOString(),
    studentId
  );
}

/**
 * XP ekler ve gerekiyorsa streak'i ilerletir.
 * Streak yalnizca gunluk odak hedefi tutturuldugunda artar.
 */
export async function grantXp(db: SQLiteDatabase, studentId: number, xp: number) {
  const today = todayKey();

  await db.runAsync('UPDATE users SET xp = MAX(0, xp + ?) WHERE id = ?', xp, studentId);

  const minutes = await todayMinutes(db, studentId);
  if (minutes < Rules.dailyGoalMinutes) return;

  const user = await db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', studentId);
  if (!user || user.last_active === today) return;

  await db.runAsync(
    'UPDATE users SET streak = ?, last_active = ? WHERE id = ?',
    nextStreak(user.streak, user.last_active, today),
    today,
    studentId
  );
}

/* --------------------------------- gorevler -------------------------------- */

export async function tasksForDay(
  db: SQLiteDatabase,
  studentId: number,
  day = todayKey()
): Promise<Task[]> {
  return db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE student_id = ? AND due_date = ? ORDER BY completed_at IS NOT NULL, id',
    studentId,
    day
  );
}

/** Belirli tarih araligindaki gorevler — Gorevlerim ekraninin haftalik/aylik sekmeleri. */
export async function tasksInRange(
  db: SQLiteDatabase,
  studentId: number,
  fromDay: string,
  toDay: string
): Promise<Task[]> {
  return db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE student_id = ? AND due_date >= ? AND due_date <= ? ORDER BY due_date, completed_at IS NOT NULL, id',
    studentId,
    fromDay,
    toDay
  );
}

export async function createTask(
  db: SQLiteDatabase,
  input: {
    studentId: number;
    title: string;
    target: number;
    dueDate: string;
    createdBy?: number;
  }
): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO tasks (student_id, title, subject, target, due_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.studentId,
    input.title,
    SUBJECT,
    input.target,
    input.dueDate,
    input.createdBy ?? null
  );
  return res.lastInsertRowId;
}

export async function deleteTask(db: SQLiteDatabase, taskId: number) {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', taskId);
}

export async function moveTask(db: SQLiteDatabase, taskId: number, dueDate: string) {
  await db.runAsync('UPDATE tasks SET due_date = ? WHERE id = ?', dueDate, taskId);
}

/**
 * Gorev ilerlemesini degistirir. Hedefe ulasildiginda tamamlanmis isaretler
 * ve XP verir; geri alinirsa XP de geri alinir.
 */
export async function bumpTask(
  db: SQLiteDatabase,
  taskId: number,
  delta: number
): Promise<Task | null> {
  const task = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', taskId);
  if (!task) return null;

  const done = Math.max(0, Math.min(task.target, task.done + delta));
  const wasComplete = task.completed_at !== null;
  const isComplete = done >= task.target;

  await db.runAsync(
    'UPDATE tasks SET done = ?, completed_at = ? WHERE id = ?',
    done,
    isComplete ? task.completed_at ?? new Date().toISOString() : null,
    taskId
  );

  if (isComplete && !wasComplete) {
    await grantXp(db, task.student_id, Rules.xpPerTask);
  } else if (!isComplete && wasComplete) {
    await grantXp(db, task.student_id, -Rules.xpPerTask);
  }

  return db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', taskId);
}

/* ----------------------------- odak oturumlari ----------------------------- */

export async function logSession(
  db: SQLiteDatabase,
  input: { studentId: number; plannedSec: number; actualSec: number; startedAt: string }
) {
  const endedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO focus_sessions (student_id, subject, planned_sec, actual_sec, started_at, ended_at, day, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.studentId,
    SUBJECT,
    input.plannedSec,
    input.actualSec,
    input.startedAt,
    endedAt,
    dayKey(new Date(input.startedAt)),
    input.actualSec >= input.plannedSec ? 1 : 0
  );

  const reward = sessionReward(input.actualSec);
  await grantXp(db, input.studentId, reward.xp);
  return reward;
}

export async function todayMinutes(
  db: SQLiteDatabase,
  studentId: number,
  day = todayKey()
): Promise<number> {
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(actual_sec) AS total FROM focus_sessions WHERE student_id = ? AND day = ?',
    studentId,
    day
  );
  return Math.floor((row?.total ?? 0) / 60);
}

/** Son n gunun gunluk dakika toplamlari — grafikler icin sirali dizi. */
export async function dailyMinutes(db: SQLiteDatabase, studentId: number, days = 7) {
  const keys = lastNDays(days);
  const rows = await db.getAllAsync<{ day: string; total: number }>(
    `SELECT day, SUM(actual_sec) AS total FROM focus_sessions
     WHERE student_id = ? AND day >= ? GROUP BY day`,
    studentId,
    keys[0]
  );
  const byDay = new Map(rows.map((r) => [r.day, Math.floor(r.total / 60)]));
  return keys.map((day) => ({ day, minutes: byDay.get(day) ?? 0 }));
}

/**
 * Saat dilimlerine gore odak dagilimi — "sen aksam 20:00-22:00 arasi daha cok
 * odaklaniyorsun" analizini besler.
 */
export async function focusByHour(db: SQLiteDatabase, studentId: number): Promise<number[]> {
  const rows = await db.getAllAsync<{ started_at: string; actual_sec: number }>(
    'SELECT started_at, actual_sec FROM focus_sessions WHERE student_id = ?',
    studentId
  );

  const buckets: number[] = new Array(24).fill(0);
  for (const r of rows) {
    const hour = new Date(r.started_at).getHours();
    buckets[hour] += Math.floor(r.actual_sec / 60);
  }
  return buckets;
}

export async function recentSessions(
  db: SQLiteDatabase,
  studentId: number,
  limit = 5
): Promise<FocusSession[]> {
  return db.getAllAsync<FocusSession>(
    'SELECT * FROM focus_sessions WHERE student_id = ? ORDER BY ended_at DESC LIMIT ?',
    studentId,
    limit
  );
}

/** Tum zamanlarda tamamlanan/toplam gorev sayisi — Istatistikler ekrani. */
export async function taskStats(
  db: SQLiteDatabase,
  studentId: number
): Promise<{ total: number; done: number }> {
  const row = await db.getFirstAsync<{ total: number; done: number | null }>(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS done
     FROM tasks WHERE student_id = ?`,
    studentId
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

/** En son tamamlanan gorevler — en yeniden eskiye. */
export async function completedTasksForStudent(
  db: SQLiteDatabase,
  studentId: number,
  limit = 30
): Promise<Task[]> {
  return db.getAllAsync<Task>(
    `SELECT * FROM tasks WHERE student_id = ? AND completed_at IS NOT NULL
     ORDER BY completed_at DESC LIMIT ?`,
    studentId,
    limit
  );
}

/* --------------------------------- sorular --------------------------------- */

export async function createQuestion(
  db: SQLiteDatabase,
  input: { studentId: number; imageUri: string; strokes: string; note: string }
): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO questions (student_id, image_uri, strokes, note, subject, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.studentId,
    input.imageUri,
    input.strokes,
    input.note,
    SUBJECT,
    new Date().toISOString()
  );
  await grantXp(db, input.studentId, Rules.xpPerQuestion);
  return res.lastInsertRowId;
}

export async function questionsForStudent(
  db: SQLiteDatabase,
  studentId: number
): Promise<Question[]> {
  return db.getAllAsync<Question>(
    'SELECT * FROM questions WHERE student_id = ? ORDER BY created_at DESC',
    studentId
  );
}

export type InboxQuestion = Question & { student_name: string };

/** Ogretmen gelen kutusu — ogrenci adiyla birlikte. */
export async function teacherInbox(
  db: SQLiteDatabase,
  status?: QuestionStatus
): Promise<InboxQuestion[]> {
  if (status) {
    return db.getAllAsync<InboxQuestion>(
      `SELECT q.*, u.name AS student_name
       FROM questions q JOIN users u ON u.id = q.student_id
       WHERE q.status = ?
       ORDER BY q.created_at DESC`,
      status
    );
  }
  return db.getAllAsync<InboxQuestion>(
    `SELECT q.*, u.name AS student_name
     FROM questions q JOIN users u ON u.id = q.student_id
     ORDER BY q.status = 'answered', q.created_at DESC`
  );
}

export async function setQuestionStatus(db: SQLiteDatabase, id: number, status: QuestionStatus) {
  await db.runAsync(
    'UPDATE questions SET status = ?, answered_at = ? WHERE id = ?',
    status,
    status === 'answered' ? new Date().toISOString() : null,
    id
  );
}

export async function replyToQuestion(db: SQLiteDatabase, id: number, reply: string) {
  await db.runAsync(
    "UPDATE questions SET teacher_reply = ?, status = 'answered', answered_at = ? WHERE id = ?",
    reply,
    new Date().toISOString(),
    id
  );
}

/* ---------------------------- liderlik / ozetler --------------------------- */

export type LeaderboardRow = {
  id: number;
  nickname: string;
  minutes: number;
  xp: number;
};

/** Liderlik tablosu — gercek isim degil, takma ad ile. `days` verilmezse tum zamanlar. */
export async function leaderboard(db: SQLiteDatabase, days?: number): Promise<LeaderboardRow[]> {
  if (days == null) {
    return db.getAllAsync<LeaderboardRow>(
      `SELECT u.id, COALESCE(u.nickname, 'Gizli Kahraman') AS nickname, u.xp,
              COALESCE(SUM(f.actual_sec), 0) / 60 AS minutes
       FROM users u
       LEFT JOIN focus_sessions f ON f.student_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY minutes DESC, u.xp DESC`
    );
  }

  const since = lastNDays(days)[0];
  return db.getAllAsync<LeaderboardRow>(
    `SELECT u.id, COALESCE(u.nickname, 'Gizli Kahraman') AS nickname, u.xp,
            COALESCE(SUM(f.actual_sec), 0) / 60 AS minutes
     FROM users u
     LEFT JOIN focus_sessions f ON f.student_id = u.id AND f.day >= ?
     WHERE u.role = 'student'
     GROUP BY u.id
     ORDER BY minutes DESC, u.xp DESC`,
    since
  );
}

export async function studentSummary(
  db: SQLiteDatabase,
  studentId: number
): Promise<StudentSummary | null> {
  const user = await getUser(db, studentId);
  if (!user) return null;

  const weekStart = lastNDays(7)[0];

  const [week, tasks, questions, lastSession, today] = await Promise.all([
    db.getFirstAsync<{ total: number | null }>(
      'SELECT SUM(actual_sec) AS total FROM focus_sessions WHERE student_id = ? AND day >= ?',
      studentId,
      weekStart
    ),
    db.getFirstAsync<{ total: number; done: number | null }>(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS done
       FROM tasks WHERE student_id = ? AND due_date >= ?`,
      studentId,
      weekStart
    ),
    db.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM questions WHERE student_id = ? AND status != 'answered'",
      studentId
    ),
    db.getFirstAsync<{ ended_at: string }>(
      'SELECT ended_at FROM focus_sessions WHERE student_id = ? ORDER BY ended_at DESC LIMIT 1',
      studentId
    ),
    todayMinutes(db, studentId),
  ]);

  const activeWindowMs = 15 * 60 * 1000;

  return {
    user,
    todayMinutes: today,
    weekMinutes: Math.floor((week?.total ?? 0) / 60),
    tasksTotal: tasks?.total ?? 0,
    tasksDone: tasks?.done ?? 0,
    pendingQuestions: questions?.total ?? 0,
    isActive: lastSession ? Date.now() - Date.parse(lastSession.ended_at) < activeWindowMs : false,
  };
}

export async function allStudentSummaries(db: SQLiteDatabase): Promise<StudentSummary[]> {
  const students = await listUsers(db, 'student');
  const summaries = await Promise.all(students.map((s) => studentSummary(db, s.id)));
  return summaries.filter((s): s is StudentSummary => s !== null);
}
