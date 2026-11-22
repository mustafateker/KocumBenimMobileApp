import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MAARIF_CURRICULUM,
  type CurriculumSubject,
  type CurriculumUnit,
} from './maarif-curriculum-data';

export type { CurriculumSubject, CurriculumUnit };
export { MAARIF_CURRICULUM };

const LOCAL_CURRICULUM_PROGRESS_KEY = 'kocumbenim.maarif.curriculumProgress.v1';
const LOCAL_EXTRA_COMPLETED_TOPICS_KEY = 'kocumbenim.maarif.extraCompletedTopics.v1';

/**
 * Veritabanında ve yerel depoda tutulan kompakt ilerleme haritası:
 * Her ders için yalnızca öğrencinin okulda şu an geldiği son konunun adı tutulur.
 * Örn: { "Matematik": "Kareköklü İfadeler", "Türkçe": "Fiilde Çatı" }
 * Bu konudan önceki tüm konular "Tamamlandı (Eski İşlenen)", bu konu "Şu An İşleniyor",
 * sonraki konular ise "Henüz İşlenmedi" olarak O(1) sürede hesaplanır.
 */
export type CurriculumProgressMap = Record<string, string>;

/**
 * Öğrencinin okulda geldiği yerin dışında sonradan konu çalışarak veya
 * Derslerim ekranında tik atarak tamamladığı ek konular:
 * Örn: { "Matematik": ["Veri Analizi", "Basit Olayların Olma Olasılığı"] }
 */
export type ExtraCompletedTopicsMap = Record<string, string[]>;

export type TopicPerformanceGradeLevel = 'critical' | 'weak' | 'developing' | 'strong' | 'untested';

export type TopicPerformanceGrade = {
  level: TopicPerformanceGradeLevel;
  label: string;
  shortLabel: string;
  needsTopicStudy: boolean;
  needsQuestionPractice: boolean;
  accuracyRate: number | null;
  reason: string;
};

export type SubjectTopicItem = {
  subject: string;
  unitName: string;
  topic: string;
  orderIndex: number;
  status: 'completed' | 'current' | 'uncovered';
  isCovered: boolean;
  solved: number;
  correct: number;
  wrong: number;
  blank: number;
  studyCompleted: number;
  performance: TopicPerformanceGrade;
};

export type SubjectCurriculumState = {
  subject: string;
  units: CurriculumUnit[];
  allTopics: string[];
  currentTopic: string;
  currentIndex: number;
  hasExplicitSelection: boolean;
  pastTopics: string[];
  coveredTopics: string[];
  uncoveredTopics: string[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
};

export function parseGradeNumber(gradeRaw?: string | number | null): number {
  if (typeof gradeRaw === 'number' && MAARIF_CURRICULUM[gradeRaw]) {
    return gradeRaw;
  }
  if (!gradeRaw) return 8;
  const s = String(gradeRaw).trim().toLowerCase();
  for (const num of [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]) {
    if (s.includes(String(num))) return num;
  }
  if (s.includes('lgs')) return 8;
  if (s.includes('yks') || s.includes('tyt') || s.includes('ayt') || s.includes('mezun')) return 12;
  return 8;
}

export function getCurriculumSubjectsForGrade(gradeRaw?: string | number | null): CurriculumSubject[] {
  const g = parseGradeNumber(gradeRaw);
  return MAARIF_CURRICULUM[g] ?? MAARIF_CURRICULUM[8];
}

export function getSubjectNamesForGrade(gradeRaw?: string | number | null): string[] {
  return getCurriculumSubjectsForGrade(gradeRaw).map((s) => s.name);
}

export function getUnitsForSubject(gradeRaw: string | number | null | undefined, subjectName: string): CurriculumUnit[] {
  const subjects = getCurriculumSubjectsForGrade(gradeRaw);
  return subjects.find((s) => s.name === subjectName)?.units ?? [];
}

export function getFlatTopicsForSubject(
  gradeRaw: string | number | null | undefined,
  subjectName: string
): { topic: string; unitName: string; index: number }[] {
  const units = getUnitsForSubject(gradeRaw, subjectName);
  const list: { topic: string; unitName: string; index: number }[] = [];
  const seen = new Set<string>();
  for (const unit of units) {
    for (const topic of unit.topics) {
      if (!seen.has(topic)) {
        seen.add(topic);
        list.push({ topic, unitName: unit.name, index: list.length });
      }
    }
  }
  return list;
}

const FOLD_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
  Ç: 'c',
  Ğ: 'g',
  İ: 'i',
  I: 'i',
  Ö: 'o',
  Ş: 's',
  Ü: 'u',
};

export function foldTurkish(text: string): string {
  return text
    .replace(/[çğıöşüâîûÇĞİIÖŞÜ]/g, (ch) => FOLD_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/[’'`]/g, '');
}

export function searchSubjectUnits(units: CurriculumUnit[], query: string): CurriculumUnit[] {
  const words = foldTurkish(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return units;
  const matches = (text: string) => {
    const folded = foldTurkish(text);
    return words.every((w) => folded.includes(w));
  };
  return units
    .map((u) => (matches(u.name) ? u : { ...u, topics: u.topics.filter(matches) }))
    .filter((u) => u.topics.length > 0);
}

/**
 * Bir derste öğrencinin seçtiği güncel konuya (currentTopic) göre
 * tamamlanan (eski), şu anki ve henüz işlenmeyen konuları ayırır.
 */
export function deriveSubjectCurriculumState(
  gradeRaw: string | number | null | undefined,
  subjectName: string,
  selectedCurrentTopic?: string | null
): SubjectCurriculumState {
  const units = getUnitsForSubject(gradeRaw, subjectName);
  const flat = getFlatTopicsForSubject(gradeRaw, subjectName);
  const allTopics = flat.map((f) => f.topic);

  if (allTopics.length === 0) {
    return {
      subject: subjectName,
      units: [],
      allTopics: [],
      currentTopic: '',
      currentIndex: -1,
      hasExplicitSelection: false,
      pastTopics: [],
      coveredTopics: [],
      uncoveredTopics: [],
      completedCount: 0,
      totalCount: 0,
      progressPercent: 0,
    };
  }

  let currentIndex = -1;
  let hasExplicitSelection = false;
  if (selectedCurrentTopic && selectedCurrentTopic.trim().length > 0) {
    const targetFolded = foldTurkish(selectedCurrentTopic.trim());
    currentIndex = allTopics.findIndex((t) => foldTurkish(t) === targetFolded);
    if (currentIndex === -1) {
      currentIndex = allTopics.findIndex(
        (t) => foldTurkish(t).includes(targetFolded) || targetFolded.includes(foldTurkish(t))
      );
    }
    if (currentIndex !== -1) {
      hasExplicitSelection = true;
    }
  }

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  const currentTopic = allTopics[currentIndex];
  const pastTopics = allTopics.slice(0, currentIndex);
  const coveredTopics = allTopics.slice(0, currentIndex + 1);
  const uncoveredTopics = allTopics.slice(currentIndex + 1);
  const completedCount = coveredTopics.length;
  const totalCount = allTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    subject: subjectName,
    units,
    allTopics,
    currentTopic,
    currentIndex,
    hasExplicitSelection,
    pastTopics,
    coveredTopics,
    uncoveredTopics,
    completedCount,
    totalCount,
    progressPercent,
  };
}

/**
 * Çözülen sorulardaki doğru/yanlış miktarına göre konuyu derecelendirir.
 * Yanlış sayısı fazlaysa (veya başarı oranı %70 altındaysa) eski konu olsa bile
 * 'needsTopicStudy = true' olarak işaretlenir ki AI Koç konu çalışması atasın.
 */
export function gradeTopicPerformance(correct: number, wrong: number, blank = 0): TopicPerformanceGrade {
  const solved = correct + wrong + blank;
  if (solved <= 0) {
    return {
      level: 'untested',
      label: 'Soru Çözülmedi',
      shortLabel: 'Çözülmedi',
      needsTopicStudy: false,
      needsQuestionPractice: true,
      accuracyRate: null,
      reason: 'Bu konudan henüz soru çözümü kaydı yok.',
    };
  }

  const accuracyRate = Math.round((correct / solved) * 100);

  // Kritik Eksik: Başarı <%55 veya yanlış sayısı >= 4 ve başarı <%65
  if (accuracyRate < 55 || (wrong >= 4 && accuracyRate < 65)) {
    return {
      level: 'critical',
      label: 'Kritik Eksik · Konu Çalışması Şart',
      shortLabel: 'Kritik Eksik',
      needsTopicStudy: true,
      needsQuestionPractice: true,
      accuracyRate,
      reason: `Çözdüğün ${solved} soruda ${wrong} yanlışın çıkmış (%${accuracyRate} başarı). Önce konu çalışması yapmalısın.`,
    };
  }

  // Eksik Konu: Başarı <%70 veya yanlış sayısı >= 3 ve başarı <%75
  if (accuracyRate < 70 || (wrong >= 3 && accuracyRate < 75)) {
    return {
      level: 'weak',
      label: 'Eksik Konu · Konu Tekrarı Gerekli',
      shortLabel: 'Eksik Konu',
      needsTopicStudy: true,
      needsQuestionPractice: true,
      accuracyRate,
      reason: `Bu konudan ${wrong} yanlışın var (%${accuracyRate} başarı). Kısa konu tekrarı ve soru çözümü önerilir.`,
    };
  }

  // Gelişiyor: %70 - %84
  if (accuracyRate < 85) {
    return {
      level: 'developing',
      label: 'Gelişiyor · Soruyla Pekiştir',
      shortLabel: 'Gelişiyor',
      needsTopicStudy: false,
      needsQuestionPractice: true,
      accuracyRate,
      reason: `%${accuracyRate} başarı oranındasın. Konu eksiğin yok, soru çözümüyle hız kazanabilirsin.`,
    };
  }

  // Çok İyi: >= %85
  return {
    level: 'strong',
    label: 'Çok İyi · Konu Pekişmiş',
    shortLabel: 'Tamam',
    needsTopicStudy: false,
    needsQuestionPractice: false,
    accuracyRate,
    reason: `%${accuracyRate} başarı ile bu konuya hakimsin.`,
  };
}

export async function loadLocalCurriculumProgress(studentId?: number | null): Promise<CurriculumProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CURRICULUM_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const key = studentId ? String(studentId) : 'default';
    return (parsed[key] as CurriculumProgressMap) ?? (parsed.default as CurriculumProgressMap) ?? {};
  } catch {
    return {};
  }
}

export async function saveLocalCurriculumProgress(
  progress: CurriculumProgressMap,
  studentId?: number | null
): Promise<CurriculumProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CURRICULUM_PROGRESS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const key = studentId ? String(studentId) : 'default';
    const merged: CurriculumProgressMap = {
      ...(all.default ?? {}),
      ...(all[key] ?? {}),
      ...progress,
    };
    all[key] = merged;
    all.default = merged;
    await AsyncStorage.setItem(LOCAL_CURRICULUM_PROGRESS_KEY, JSON.stringify(all));
    return merged;
  } catch {
    return progress;
  }
}

export async function loadExtraCompletedTopics(studentId?: number | null): Promise<ExtraCompletedTopicsMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_EXTRA_COMPLETED_TOPICS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const key = studentId ? String(studentId) : 'default';
    return (parsed[key] as ExtraCompletedTopicsMap) ?? (parsed.default as ExtraCompletedTopicsMap) ?? {};
  } catch {
    return {};
  }
}

export async function toggleExtraCompletedTopic(
  subjectName: string,
  topicName: string,
  studentId?: number | null
): Promise<ExtraCompletedTopicsMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_EXTRA_COMPLETED_TOPICS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const key = studentId ? String(studentId) : 'default';
    const currentMap: ExtraCompletedTopicsMap = {
      ...(all.default ?? {}),
      ...(all[key] ?? {}),
    };
    const list = currentMap[subjectName] ?? [];
    const exists = list.some((t) => foldTurkish(t) === foldTurkish(topicName));
    const nextList = exists
      ? list.filter((t) => foldTurkish(t) !== foldTurkish(topicName))
      : [...list, topicName];
    const nextMap: ExtraCompletedTopicsMap = {
      ...currentMap,
      [subjectName]: nextList,
    };
    all[key] = nextMap;
    all.default = nextMap;
    await AsyncStorage.setItem(LOCAL_EXTRA_COMPLETED_TOPICS_KEY, JSON.stringify(all));
    return nextMap;
  } catch {
    return {};
  }
}

export async function markTopicStudiedAndCompleted(
  subjectName: string,
  topicName: string,
  studentId?: number | null
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_EXTRA_COMPLETED_TOPICS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const key = studentId ? String(studentId) : 'default';
    const currentMap: ExtraCompletedTopicsMap = {
      ...(all.default ?? {}),
      ...(all[key] ?? {}),
    };
    const list = currentMap[subjectName] ?? [];
    if (!list.some((t) => foldTurkish(t) === foldTurkish(topicName))) {
      const nextMap: ExtraCompletedTopicsMap = {
        ...currentMap,
        [subjectName]: [...list, topicName],
      };
      all[key] = nextMap;
      all.default = nextMap;
      await AsyncStorage.setItem(LOCAL_EXTRA_COMPLETED_TOPICS_KEY, JSON.stringify(all));
    }
  } catch {
    // sessizce devam
  }
}

