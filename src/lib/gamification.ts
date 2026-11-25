import { ImageSourcePropType } from 'react-native';

/**
 * Koçum Benim - Seviye, XP & Erime (Decay) Oyunlaştırma Kuralları
 * LGS / YKS Tam Hazırlık Maratonu (70.000 - 100.000 XP) Modeli
 * NOT: Sıfır emoji kuralı geçerlidir.
 */

export const LEVEL_CHARACTERS: Record<number, ImageSourcePropType> = {
  1: require('../../assets/images/levels/level_1.png'),
  2: require('../../assets/images/levels/level_2.png'),
  3: require('../../assets/images/levels/level_3.png'),
  4: require('../../assets/images/levels/level_4.png'),
  5: require('../../assets/images/levels/level_5.png'),
  6: require('../../assets/images/levels/level_6.png'),
  7: require('../../assets/images/levels/level_7.png'),
  8: require('../../assets/images/levels/level_8.png'),
  9: require('../../assets/images/levels/level_9.png'),
  10: require('../../assets/images/levels/level_10.png'),
};

export const Rules = {
  /** 25 dk odak seansı için XP */
  xpPerPomodoro: 15,
  /** Günlük Pomodoro'dan kazanılabilecek tavan XP (6 seans) */
  maxDailyPomodoroXp: 90,
  /** Günlük soru hedefini tamamlama ödülü */
  xpPerQuestionTarget: 30,
  /** Hata / yanlış analizi kaydı ödülü */
  xpPerErrorAnalysis: 15,
  /** Günlük genel görev bitirme ödülü */
  xpPerTask: 30,
  /** Soru gönderme ödülü */
  xpPerQuestion: 10,
  /** Günlük giriş / check-in */
  xpDailyCheckin: 10,
  /** Haftalık deneme sınavı analizi girişi */
  xpBonusTrialExam: 50,
  /** 7 günlük kesintisiz seri tamamlama bonusu */
  xpBonusStreak7: 40,
  /** Günlük maksimum tavan (Hard Cap) */
  dailyHardCap: 150,
  /** Streak için gereken günlük odak dakikası */
  dailyGoalMinutes: 60,
} as const;

export type LevelDefinition = {
  level: number;
  title: string;
  cumulativeXp: number;
  levelXp: number;
  stage: string;
  characterKey: string;
};

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: 1,
    title: 'Çırak Kaşif',
    cumulativeXp: 0,
    levelXp: 0,
    stage: 'Sisteme adaptasyon, ilk alışkanlık',
    characterKey: 'level_1',
  },
  {
    level: 2,
    title: 'İstikrarlı Yolcu',
    cumulativeXp: 400,
    levelXp: 400,
    stage: 'Masaya oturma ritmi',
    characterKey: 'level_2',
  },
  {
    level: 3,
    title: 'Odak Mimarı',
    cumulativeXp: 1200,
    levelXp: 800,
    stage: 'Pomodoro disiplini',
    characterKey: 'level_3',
  },
  {
    level: 4,
    title: 'Görev Avcısı',
    cumulativeXp: 2800,
    levelXp: 1600,
    stage: 'Günlük ödev ve rutin takibi',
    characterKey: 'level_4',
  },
  {
    level: 5,
    title: 'Disiplin Ustası',
    cumulativeXp: 6000,
    levelXp: 3200,
    stage: 'Kış dönemi platosunu aşma',
    characterKey: 'level_5',
  },
  {
    level: 6,
    title: 'Soru Stratejisti',
    cumulativeXp: 11500,
    levelXp: 5500,
    stage: 'Hata analizi ve eksik kapatma',
    characterKey: 'level_6',
  },
  {
    level: 7,
    title: 'Zirve Adayı',
    cumulativeXp: 20000,
    levelXp: 8500,
    stage: 'Hızlanma ve branş denemeleri',
    characterKey: 'level_7',
  },
  {
    level: 8,
    title: 'Maraton Koşucusu',
    cumulativeXp: 33000,
    levelXp: 13000,
    stage: 'Mental dayanıklılık & tempo artışı',
    characterKey: 'level_8',
  },
  {
    level: 9,
    title: 'Akademi Lideri',
    cumulativeXp: 50000,
    levelXp: 17000,
    stage: 'Final virajına giriş',
    characterKey: 'level_9',
  },
  {
    level: 10,
    title: 'Sınav Şampiyonu',
    cumulativeXp: 70000,
    levelXp: 20000,
    stage: 'Zirveye Tutunma & Derece Öğrencisi',
    characterKey: 'level_10',
  },
];

export const LEVEL_TITLES = LEVEL_DEFINITIONS.map((def) => def.title) as readonly string[];

export type LevelInfo = {
  level: number;
  title: string;
  floorXp: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressPercent: number;
  character: ImageSourcePropType;
  stars: number;
  starTitle: string | null;
  isMaxLevel: boolean;
  pedagogicalStage: string;
};

export function getLevelInfo(xpRaw?: number | null): LevelInfo {
  const xp = Math.max(0, xpRaw || 0);

  let level = 1;
  for (const def of LEVEL_DEFINITIONS) {
    if (xp >= def.cumulativeXp) {
      level = def.level;
    } else {
      break;
    }
  }

  const currentDef = LEVEL_DEFINITIONS[level - 1];
  let title = currentDef.title;
  let floorXp = currentDef.cumulativeXp;
  let nextLevelXp = floorXp;
  let currentLevelXp = xp - floorXp;
  let progressPercent = 0.08;
  let stars = 0;
  let starTitle: string | null = null;
  const isMaxLevel = level === 10;

  if (level < 10) {
    const nextDef = LEVEL_DEFINITIONS[level];
    nextLevelXp = nextDef.cumulativeXp;
    const span = Math.max(1, nextLevelXp - floorXp);
    currentLevelXp = xp - floorXp;
    progressPercent = Math.min(1, Math.max(0.06, currentLevelXp / span));
  } else {
    // Seviye 10 Yıldız Kademeleri (70.000 / 85.000 / 100.000)
    if (xp >= 100000) {
      stars = 3;
      title = 'Efsane Şampiyon';
      starTitle = 'Efsane Şampiyon (3 Yıldız)';
      floorXp = 100000;
      nextLevelXp = 100000;
      currentLevelXp = xp - 100000;
      progressPercent = 1;
    } else if (xp >= 85000) {
      stars = 2;
      title = 'Sınav Şampiyonu';
      starTitle = 'Sınav Şampiyonu (2 Yıldız)';
      floorXp = 85000;
      nextLevelXp = 100000;
      currentLevelXp = xp - 85000;
      progressPercent = Math.min(1, Math.max(0.06, currentLevelXp / 15000));
    } else {
      stars = 1;
      title = 'Sınav Şampiyonu';
      starTitle = 'Sınav Şampiyonu (1 Yıldız)';
      floorXp = 70000;
      nextLevelXp = 85000;
      currentLevelXp = xp - 70000;
      progressPercent = Math.min(1, Math.max(0.06, currentLevelXp / 15000));
    }
  }

  const character = LEVEL_CHARACTERS[level] || LEVEL_CHARACTERS[1];

  return {
    level,
    title,
    floorXp,
    nextLevelXp,
    currentLevelXp,
    progressPercent,
    character,
    stars,
    starTitle,
    isMaxLevel,
    pedagogicalStage: currentDef.stage,
  };
}

export function getCharacterForLevel(level: number): ImageSourcePropType {
  const clamped = Math.max(1, Math.min(10, level));
  return LEVEL_CHARACTERS[clamped] || LEVEL_CHARACTERS[1];
}
