import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'kocumbenim.db';

/** Su anki sema surumu. Sema degistiginde artir ve asagiya bir blok ekle. */
const LATEST_VERSION = 3;

/**
 * PRAGMA user_version uzerinden artimli migration.
 * SQLiteProvider'in onInit'i tarafindan, ilk render'dan once calisir.
 */
export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version >= LATEST_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE users (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        role              TEXT    NOT NULL,
        name              TEXT    NOT NULL,
        nickname          TEXT,
        avatar            TEXT    NOT NULL DEFAULT '',
        pin               TEXT    NOT NULL,
        grade             TEXT,
        linked_student_id INTEGER REFERENCES users(id),
        xp                INTEGER NOT NULL DEFAULT 0,
        coins             INTEGER NOT NULL DEFAULT 0,
        streak            INTEGER NOT NULL DEFAULT 0,
        last_active       TEXT,
        created_at        TEXT    NOT NULL
      );

      CREATE TABLE tasks (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id   INTEGER NOT NULL REFERENCES users(id),
        title        TEXT    NOT NULL,
        subject      TEXT    NOT NULL,
        target       INTEGER NOT NULL DEFAULT 1,
        done         INTEGER NOT NULL DEFAULT 0,
        due_date     TEXT    NOT NULL,
        created_by   INTEGER REFERENCES users(id),
        completed_at TEXT
      );

      CREATE TABLE focus_sessions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id  INTEGER NOT NULL REFERENCES users(id),
        subject     TEXT    NOT NULL,
        planned_sec INTEGER NOT NULL,
        actual_sec  INTEGER NOT NULL,
        started_at  TEXT    NOT NULL,
        ended_at    TEXT    NOT NULL,
        day         TEXT    NOT NULL,
        completed   INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE questions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id    INTEGER NOT NULL REFERENCES users(id),
        image_uri     TEXT    NOT NULL,
        strokes       TEXT    NOT NULL DEFAULT '[]',
        note          TEXT,
        subject       TEXT    NOT NULL,
        status        TEXT    NOT NULL DEFAULT 'pending',
        tag           TEXT,
        teacher_reply TEXT,
        created_at    TEXT    NOT NULL,
        answered_at   TEXT
      );

      CREATE TABLE rewards (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        title  TEXT    NOT NULL,
        emoji  TEXT    NOT NULL DEFAULT '',
        cost   INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE purchases (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        reward_id  INTEGER NOT NULL REFERENCES rewards(id),
        cost       INTEGER NOT NULL,
        status     TEXT    NOT NULL DEFAULT 'pending',
        created_at TEXT    NOT NULL
      );

      CREATE INDEX idx_tasks_student_day     ON tasks(student_id, due_date);
      CREATE INDEX idx_sessions_student_day  ON focus_sessions(student_id, day);
      CREATE INDEX idx_questions_student     ON questions(student_id, created_at);
      CREATE INDEX idx_questions_status      ON questions(status);
    `);
    version = 1;
  }

  if (version === 1) {
    // Odul/coin sistemi ve emoji avatarlar kaldirildi. Avatar yerine artik
    // isim bas harfleri gosteriliyor.
    await db.execAsync(`
      DROP TABLE IF EXISTS purchases;
      DROP TABLE IF EXISTS rewards;
      ALTER TABLE users DROP COLUMN coins;
      ALTER TABLE users DROP COLUMN avatar;
    `);
    version = 2;
  }

  if (version === 2) {
    // E-posta/parola ile dogrudan kayit + "Ilk Kurulum" hedef belirleme
    // sihirbazi icin ogrenci profili alanlari.
    await db.execAsync(`
      ALTER TABLE users ADD COLUMN email TEXT;
      ALTER TABLE users ADD COLUMN password TEXT;
      ALTER TABLE users ADD COLUMN surname TEXT;
      ALTER TABLE users ADD COLUMN exam_type TEXT;
      ALTER TABLE users ADD COLUMN goal TEXT;
      ALTER TABLE users ADD COLUMN career TEXT;
      ALTER TABLE users ADD COLUMN life_dream TEXT;
      ALTER TABLE users ADD COLUMN target_high_school TEXT;
      ALTER TABLE users ADD COLUMN target_university TEXT;
      ALTER TABLE users ADD COLUMN target_department TEXT;
      ALTER TABLE users ADD COLUMN math_topics TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE users ADD COLUMN daily_hours TEXT;
      ALTER TABLE users ADD COLUMN timeframe TEXT;
      ALTER TABLE users ADD COLUMN motivation_sources TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE users ADD COLUMN onboarding_completed_at TEXT;

      CREATE UNIQUE INDEX idx_users_email ON users(email);
    `);
    version = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${version}`);
}
