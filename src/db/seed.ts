import type { SQLiteDatabase } from 'expo-sqlite';

import { dayKey } from '@/lib/date';

import { SUBJECT } from './types';

/**
 * Ilk acilista uygulamanin bos gorunmemesi icin ornek veri.
 * Yalnizca users tablosu bosken calisir, tekrar tekrar veri uretmez.
 *
 * Gercek kullanima gecerken: ogretmen panelinden kendi ogrencilerini ekle,
 * sonra `resetDemoData` ile bu ornekleri temizle.
 */
export async function seedIfEmpty(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM users');
  if ((row?.count ?? 0) > 0) return;

  const now = new Date().toISOString();

  const teacher = await db.runAsync(
    `INSERT INTO users (role, name, pin, created_at) VALUES ('teacher', ?, ?, ?)`,
    'Bahar Hoca',
    '1234',
    now
  );
  const teacherId = teacher.lastInsertRowId;

  const studentSeeds = [
    { name: 'Deniz Yılmaz', nickname: 'KaranlıkŞövalye99', pin: '1111', grade: '11. Sınıf' },
    { name: 'Ege Demir', nickname: 'SayıAvcısı', pin: '2222', grade: '10. Sınıf' },
    { name: 'Mert Kaya', nickname: 'TurboBeyin', pin: '3333', grade: '12. Sınıf' },
  ];

  const studentIds: number[] = [];
  for (const s of studentSeeds) {
    const res = await db.runAsync(
      `INSERT INTO users (role, name, nickname, pin, grade, created_at)
       VALUES ('student', ?, ?, ?, ?, ?)`,
      s.name,
      s.nickname,
      s.pin,
      s.grade,
      now
    );
    studentIds.push(res.lastInsertRowId);
  }

  await db.runAsync(
    `INSERT INTO users (role, name, pin, linked_student_id, created_at)
     VALUES ('parent', ?, ?, ?, ?)`,
    'Ayşe Yılmaz',
    '9999',
    studentIds[0],
    now
  );

  /* Son 7 gunun odak gecmisi. Aksam saatleri agirlikli — istatistik
     ekranindaki "en verimli saatin" analizi anlamli ciksin diye. */
  const eveningHours = [16, 19, 20, 20, 21, 21, 22];

  for (let s = 0; s < studentIds.length; s++) {
    const studentId = studentIds[s];
    let totalXp = 0;

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      // Her ogrencinin farkli bir calisma temposu olsun.
      const sessionCount = [3, 2, 1][s] + (daysAgo % 2);

      for (let i = 0; i < sessionCount; i++) {
        const start = new Date();
        start.setDate(start.getDate() - daysAgo);
        start.setHours(eveningHours[(daysAgo + i) % eveningHours.length], (i * 17) % 60, 0, 0);

        const plannedSec = 25 * 60;
        const actualSec = plannedSec - ((i + daysAgo) % 4) * 90;
        const end = new Date(start.getTime() + actualSec * 1000);

        await db.runAsync(
          `INSERT INTO focus_sessions (student_id, subject, planned_sec, actual_sec, started_at, ended_at, day, completed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          studentId,
          SUBJECT,
          plannedSec,
          actualSec,
          start.toISOString(),
          end.toISOString(),
          dayKey(start),
          actualSec >= plannedSec ? 1 : 0
        );

        totalXp += Math.floor(actualSec / 60) * 2;
      }
    }

    await db.runAsync(
      'UPDATE users SET xp = ?, streak = ?, last_active = ? WHERE id = ?',
      totalXp,
      [5, 3, 1][s],
      dayKey(new Date()),
      studentId
    );
  }

  /* Bugunun gorevleri. */
  const today = dayKey(new Date());
  const todayTasks = [
    { studentId: studentIds[0], title: 'Türev karma test', target: 50 },
    { studentId: studentIds[0], title: 'Limit tekrar soruları', target: 20 },
    { studentId: studentIds[0], title: 'Fonksiyon grafikleri', target: 15 },
    { studentId: studentIds[1], title: 'Köklü sayılar', target: 40 },
    { studentId: studentIds[1], title: 'Mutlak değer', target: 25 },
    { studentId: studentIds[2], title: 'Integral tekrar', target: 60 },
  ];
  for (const t of todayTasks) {
    await db.runAsync(
      `INSERT INTO tasks (student_id, title, subject, target, due_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      t.studentId,
      t.title,
      SUBJECT,
      t.target,
      today,
      teacherId
    );
  }

  /* Ogretmen gelen kutusu bos acilmasin diye iki ornek soru.
     image_uri bos: arayuz bu durumda fotograf yerine yalnizca notu gosterir. */
  const sampleQuestions = [
    {
      studentId: studentIds[1],
      note: 'Hocam burada eksi mi artı mı olacak, türevi alırken karıştırdım?',
    },
    {
      studentId: studentIds[2],
      note: 'Bu integralde değişken değiştirmeyi nasıl kuracağımı bulamadım.',
    },
  ];
  for (const q of sampleQuestions) {
    await db.runAsync(
      `INSERT INTO questions (student_id, image_uri, strokes, note, subject, created_at)
       VALUES (?, '', '[]', ?, ?, ?)`,
      q.studentId,
      q.note,
      SUBJECT,
      new Date(Date.now() - 3 * 3600_000).toISOString()
    );
  }
}

/** Ornek verileri siler; kullanicilar kalir. */
export async function resetDemoData(db: SQLiteDatabase) {
  await db.execAsync(`
    DELETE FROM focus_sessions;
    DELETE FROM tasks;
    DELETE FROM questions;
    UPDATE users SET xp = 0, streak = 0, last_active = NULL;
  `);
}
