import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';

import { localTodayStr } from './ai-coach-engine';
import { parseGradeNumber } from './maarif-curriculum';
import type { Student } from './types';

export { localTodayStr };

const STORAGE_KEY = 'kocumbenim.mockExams.v1';

export type ExamSubjectScore = {
  subject: string;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
};

export type MockExamType = 'lgs' | 'tyt' | 'ayt' | 'yks' | 'branch' | 'general';
export type YksField = 'sayisal' | 'esitagirlik' | 'sozel' | 'dil';

export type SessionBreakdown = {
  sozelNet?: number;
  sayisalNet?: number;
  tytNet?: number;
  aytNet?: number;
  ydtNet?: number;
};

export type MockExam = {
  id: string;
  title: string;
  examType: MockExamType;
  yksField?: YksField;
  sessionBreakdown?: SessionBreakdown;
  date: string;
  subjects: ExamSubjectScore[];
  totalCorrect: number;
  totalWrong: number;
  totalEmpty: number;
  totalNet: number;
  estimatedScore?: number;
  targetNet?: number;
  notes?: string;
  createdAt: string;
};

export type AiExamAnalysis = {
  summary: string;
  targetProbability: string; // Örn: "%82 (Hedefe Yakın)"
  shortcutTopics: { subject: string; topic: string; potentialGain: string }[];
  strategyTip: string;
};

export type ExamTrack = 'lgs' | 'yks';

/** Öğrencinin sınıfına göre LGS mi YKS mi takip ettiğini belirler */
export function getExamTrack(gradeRaw?: string | number | null): ExamTrack {
  const g = parseGradeNumber(gradeRaw);
  return g <= 8 ? 'lgs' : 'yks';
}

export type ExamCountdownInfo = {
  examTrack: ExamTrack;
  title: string;
  examName: string;
  targetYear: number;
  examDateStr: string;
  targetDate: Date;
  days: number;
  hours: number;
  minutes: number;
  subInfo: string;
  penaltyRule: string;
  sessionRule: string;
};

/**
 * LGS ve YKS için güncel kalan süre ve oturum kurallarını hesaplar.
 * LGS: Haziran ayının ilk Pazarı (09:30)
 * YKS: Haziran ayının üçüncü Cumartesi/Pazarı (10:15)
 */
export function getExamCountdown(gradeRaw?: string | number | null): ExamCountdownInfo {
  const track = getExamTrack(gradeRaw);
  const now = new Date();
  const currentYear = now.getFullYear();

  if (track === 'lgs') {
    // LGS: Haziran ilk Pazar
    let targetYear = currentYear;
    let targetDate = getLgsDate(targetYear);
    if (now.getTime() > targetDate.getTime()) {
      targetYear += 1;
      targetDate = getLgsDate(targetYear);
    }

    const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return {
      examTrack: 'lgs',
      title: `LGS ${targetYear}'ye Kalan Süre`,
      examName: 'LGS',
      targetYear,
      examDateStr: `${targetDate.getDate()} Haziran ${targetYear}`,
      targetDate,
      days,
      hours,
      minutes,
      subInfo: 'Sözel: 50 S / 75 dk · Sayısal: 40 S / 80 dk (Toplam 90 Soru)',
      penaltyRule: '3 Yanlış 1 Doğruyu Götürür (Net = D - Y/3)',
      sessionRule: '2 Oturum Arası 45 dk Mola',
    };
  }

  // YKS: Haziran 3. Cumartesi
  let targetYear = currentYear;
  let targetDate = getYksDate(targetYear);
  if (now.getTime() > targetDate.getTime()) {
    targetYear += 1;
    targetDate = getYksDate(targetYear);
  }

  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    examTrack: 'yks',
    title: `YKS ${targetYear}'ye Kalan Süre`,
    examName: 'YKS',
    targetYear,
    examDateStr: `${targetDate.getDate()}-${targetDate.getDate() + 1} Haziran ${targetYear}`,
    targetDate,
    days,
    hours,
    minutes,
    subInfo: 'TYT: 120 S / 165 dk · AYT: 80 S / 180 dk',
    penaltyRule: '4 Yanlış 1 Doğruyu Götürür (Net = D - Y/4)',
    sessionRule: 'Cumartesi TYT, Pazar AYT/YDT',
  };
}

function getLgsDate(year: number): Date {
  // Haziran ayının 1'inden sonraki ilk Pazar
  const d = new Date(year, 5, 1, 9, 30, 0); // 1 Haziran
  const dayOfWeek = d.getDay(); // 0 is Sunday
  const daysToAdd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  d.setDate(d.getDate() + daysToAdd);
  return d;
}

function getYksDate(year: number): Date {
  // Haziran ayının 3. Cumartesisi (TYT)
  const d = new Date(year, 5, 1, 10, 15, 0);
  let countSaturdays = 0;
  for (let day = 1; day <= 30; day++) {
    d.setDate(day);
    if (d.getDay() === 6) {
      countSaturdays += 1;
      if (countSaturdays === 3) break;
    }
  }
  return d;
}

// -----------------------------------------------------------------------------
// LGS DERS VE OTURUM SABİTLERİ (90 Soru, 3Y = 1D)
// -----------------------------------------------------------------------------

export const LGS_SOZEL_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 20, session: 'sozel' as const, coefficient: 4.35 },
  { subject: 'T.C. İnkılap Tarihi', totalQuestions: 10, session: 'sozel' as const, coefficient: 1.45 },
  { subject: 'Din Kültürü', totalQuestions: 10, session: 'sozel' as const, coefficient: 1.45 },
  { subject: 'İngilizce', totalQuestions: 10, session: 'sozel' as const, coefficient: 1.45 },
];

export const LGS_SAYISAL_SUBJECTS = [
  { subject: 'Matematik', totalQuestions: 20, session: 'sayisal' as const, coefficient: 4.35 },
  { subject: 'Fen Bilimleri', totalQuestions: 20, session: 'sayisal' as const, coefficient: 4.35 },
];

export const LGS_DEFAULT_SUBJECTS = [...LGS_SOZEL_SUBJECTS, ...LGS_SAYISAL_SUBJECTS];

// -----------------------------------------------------------------------------
// YKS DERS VE OTURUM SABİTLERİ (4Y = 1D)
// -----------------------------------------------------------------------------

/** TYT Oturumu (120 Soru / 165 dk) */
export const TYT_DEFAULT_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 40, session: 'tyt' as const },
  { subject: 'Temel Matematik', totalQuestions: 40, session: 'tyt' as const },
  { subject: 'Fen Bilimleri', totalQuestions: 20, session: 'tyt' as const },
  { subject: 'Sosyal Bilimler', totalQuestions: 20, session: 'tyt' as const },
];

/** AYT Sayısal (80 Soru / 180 dk) */
export const AYT_SAYISAL_SUBJECTS = [
  { subject: 'AYT Matematik', totalQuestions: 40, session: 'ayt' as const },
  { subject: 'AYT Fen Bilimleri', totalQuestions: 40, session: 'ayt' as const }, // Fizik 14, Kimya 13, Biyoloji 13
];

/** AYT Eşit Ağırlık (80 Soru / 180 dk) */
export const AYT_ESITAGIRLIK_SUBJECTS = [
  { subject: 'AYT Matematik', totalQuestions: 40, session: 'ayt' as const },
  { subject: 'Edebiyat - Sosyal-1', totalQuestions: 40, session: 'ayt' as const }, // Edebiyat 24, Tarih-1 10, Coğrafya-1 6
];

/** AYT Sözel (80 Soru / 180 dk) */
export const AYT_SOZEL_SUBJECTS = [
  { subject: 'Edebiyat - Sosyal-1', totalQuestions: 40, session: 'ayt' as const },
  { subject: 'Sosyal Bilimler-2', totalQuestions: 40, session: 'ayt' as const }, // Tarih-2 11, Coğrafya-2 11, Felsefe 12, Din 6
];

/** YDT Yabancı Dil (80 Soru / 120 dk) */
export const AYT_DIL_SUBJECTS = [
  { subject: 'Yabancı Dil (YDT)', totalQuestions: 80, session: 'ydt' as const },
];

export function getAytSubjectsForField(field: YksField) {
  switch (field) {
    case 'sayisal':
      return AYT_SAYISAL_SUBJECTS;
    case 'esitagirlik':
      return AYT_ESITAGIRLIK_SUBJECTS;
    case 'sozel':
      return AYT_SOZEL_SUBJECTS;
    case 'dil':
      return AYT_DIL_SUBJECTS;
    default:
      return AYT_SAYISAL_SUBJECTS;
  }
}

/** Genel / Ara Sınıf Deneme Sabitleri */
export const GENERAL_DEFAULT_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 20, session: 'genel' as const },
  { subject: 'Matematik', totalQuestions: 20, session: 'genel' as const },
  { subject: 'Fen Bilimleri', totalQuestions: 20, session: 'genel' as const },
  { subject: 'Sosyal Bilgiler', totalQuestions: 15, session: 'genel' as const },
];

// -----------------------------------------------------------------------------
// NET VE PUAN HESAPLAMA MOTORLARI
// -----------------------------------------------------------------------------

/**
 * Net Hesaplama:
 * LGS'de 3 Yanlış 1 Doğruyu Götürür: Net = D - Y/3
 * YKS/TYT/AYT'de 4 Yanlış 1 Doğruyu Götürür: Net = D - Y/4
 */
export function calculateNet(
  correct: number,
  wrong: number,
  examType: MockExamType | ExamTrack
): number {
  const penalty = examType === 'lgs' ? 3 : 4;
  const rawNet = correct - wrong / penalty;
  return Math.max(0, Math.round(rawNet * 100) / 100);
}

/**
 * LGS Puan Tahmini (100 - 500 Puan)
 * Formül: 100 Taban + (Ders Katsayısı * Net) * Normalize Çarpanı
 * Tam net (90 net) = 500.00 Puan
 */
export function estimateLgsScore(subjects: ExamSubjectScore[]): number {
  let weightedNetSum = 0;
  for (const s of subjects) {
    const isMajor = s.subject === 'Türkçe' || s.subject === 'Matematik' || s.subject === 'Fen Bilimleri';
    const coef = isMajor ? 4.35 : 1.45;
    weightedNetSum += s.net * coef;
  }
  // Max weightedNetSum = 3 * 20 * 4.35 + 3 * 10 * 1.45 = 261 + 43.5 = 304.5
  // (weightedNetSum / 304.5) * 400 + 100 = 500.00
  const normalized = 100 + (weightedNetSum / 304.5) * 400;
  return Math.min(500, Math.max(100, Math.round(normalized * 100) / 100));
}

/**
 * TYT Puan Tahmini (100 - 500 Puan)
 * 120 Soru, 4 Yanlış 1 Doğru.
 * Tam net (120 net) = 500.00 Puan.
 */
export function estimateTytScore(subjects: ExamSubjectScore[]): number {
  let weightedSum = 0;
  for (const s of subjects) {
    if (s.subject === 'Türkçe' || s.subject === 'Temel Matematik') {
      weightedSum += s.net * 3.3; // 40 * 3.3 = 132 x 2 = 264
    } else {
      weightedSum += s.net * 3.4; // 20 * 3.4 = 68 x 2 = 136
    }
  }
  // Max weightedSum = 264 + 136 = 400. 100 + 400 = 500.
  const score = 100 + weightedSum;
  return Math.min(500, Math.max(100, Math.round(score * 100) / 100));
}

/**
 * AYT Puan Tahmini (100 - 500 Puan)
 * 80 Soru, 4 Yanlış 1 Doğru.
 * 80 net = 500.00 Puan.
 */
export function estimateAytScore(subjects: ExamSubjectScore[]): number {
  const totalAytNet = subjects.reduce((sum, s) => sum + s.net, 0);
  const score = 100 + (totalAytNet / 80) * 400;
  return Math.min(500, Math.max(100, Math.round(score * 100) / 100));
}

/**
 * Birleşik YKS Puanı: TYT %40 + AYT %60
 */
export function estimateYksCompositeScore(tytScore: number, aytScore: number): number {
  const composite = tytScore * 0.4 + aytScore * 0.6;
  return Math.min(500, Math.max(100, Math.round(composite * 100) / 100));
}

// -----------------------------------------------------------------------------
// VERİ DEPOLAMA (ASYNC STORAGE)
// -----------------------------------------------------------------------------

export async function loadMockExams(): Promise<MockExam[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export async function saveMockExam(
  examData: Omit<MockExam, 'id' | 'createdAt'>
): Promise<MockExam> {
  const existing = await loadMockExams();
  const newExam: MockExam = {
    ...examData,
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newExam, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newExam;
}

export async function deleteMockExam(id: string): Promise<void> {
  const existing = await loadMockExams();
  const filtered = existing.filter((e) => e.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// -----------------------------------------------------------------------------
// AI NET TAHMİNİ & HEDEF EĞRİSİ ANALİZİ
// -----------------------------------------------------------------------------

export async function generateAiExamAnalysis(
  exams: MockExam[],
  student: Student
): Promise<AiExamAnalysis> {
  const track = getExamTrack(student.grade);
  const isLgs = track === 'lgs';
  const grade = student.grade ?? (isLgs ? '8. Sınıf' : '12. Sınıf');
  const targetName =
    (isLgs ? student.targetHighSchool : student.targetUniversity || student.targetDepartment) ||
    student.goal ||
    (isLgs ? 'Hedef Fen Lisesi' : 'Hedef Üniversite');

  if (exams.length === 0) {
    return {
      summary: `${student.name.split(' ')[0]}, henüz kayıtlı bir ${isLgs ? 'LGS' : 'YKS'} denemen bulunmuyor. Girdiğin ilk denemeyi eklediğinde net tahminin ve hedef eğrin burada hesaplanacak.`,
      targetProbability: 'Henüz Veri Yok',
      shortcutTopics: isLgs
        ? [
            { subject: 'Matematik', topic: 'Kareköklü İfadeler & Çarpanlar', potentialGain: '+3 Net' },
            { subject: 'Türkçe', topic: 'Paragrafta Anlam & Söz Sanatları', potentialGain: '+3 Net' },
          ]
        : [
            { subject: 'Temel Matematik', topic: 'Problemler & Fonksiyonlar', potentialGain: '+4 Net' },
            { subject: 'Türkçe', topic: 'Paragraf Taktikleri & Dil Bilgisi', potentialGain: '+3 Net' },
          ],
      strategyTip: isLgs
        ? 'LGS sözelde 75 dakikada 50 soruyu çözerken paragraflarda ilk okuyuşta ana fikri yakalamaya odaklan.'
        : 'TYT 165 dakikalık sürede turlama tekniği kullanarak takıldığın sorulara en fazla 1.5 dakika ayır.',
    };
  }

  const latest = exams[0];
  const totalExams = exams.length;
  const avgNet = Math.round((exams.reduce((sum, e) => sum + e.totalNet, 0) / totalExams) * 10) / 10;
  const maxNet = Math.max(...exams.map((e) => e.totalNet));

  // En düşük netli dersi bul
  const subjectTotals: Record<string, { totalNet: number; count: number }> = {};
  for (const e of exams) {
    for (const s of e.subjects) {
      if (!subjectTotals[s.subject]) subjectTotals[s.subject] = { totalNet: 0, count: 0 };
      subjectTotals[s.subject].totalNet += s.net;
      subjectTotals[s.subject].count += 1;
    }
  }

  let lowestSubj = isLgs ? 'Matematik' : 'Temel Matematik';
  let lowestAvg = 999;
  for (const [subj, data] of Object.entries(subjectTotals)) {
    const avg = data.totalNet / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestSubj = subj;
    }
  }

  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  if (geminiKey) {
    try {
      const prompt = `ÖĞRENCİ SINAV TAKİP BİLGİSİ:
- Sınav Sistemi: ${isLgs ? 'LGS (Liselere Geçiş Sistemi, 8. Sınıf)' : 'YKS (Yükseköğretim Kurumları Sınavı, TYT/AYT)'}
- Yanlış Kuralı: ${isLgs ? '3 Yanlış 1 Doğruyu Götürür' : '4 Yanlış 1 Doğruyu Götürür'}
- İsim: ${student.name}
- Sınıf: ${grade}
- Hedef: ${targetName}
- Kayıtlı Deneme Sayısı: ${totalExams}
- Son Deneme Neti: ${latest.totalNet} Net (Tahmini Puan: ${latest.estimatedScore ?? '-'})
- Ortalama Net: ${avgNet} Net (En Yüksek: ${maxNet} Net)
- En Zorlandığı / En Düşük Netli Ders: ${lowestSubj} (${Math.round(lowestAvg * 10) / 10} ortalama net)

GÖREV:
Yukarıdaki öğrenci için Türkiye'deki ${isLgs ? 'MEB LGS' : 'ÖSYM YKS (TYT/AYT)'} sınav formatı standartlarına göre JSON formatında net analizi ve kestirme konu tavsiyesi üret.
Hiçbir emoji kullanma. Samimi, gerçekçi ve motive edici ol.

JSON ŞEMASI:
{
  "summary": "2-3 cümlelik net durum özeti",
  "targetProbability": "Yüzde ve durum, örn: %78 (Yükseliş Trendinde)",
  "shortcutTopics": [
    {"subject": "Ders Adı", "topic": "En hızlı net kazandıracak konu adı", "potentialGain": "+3 Net"},
    {"subject": "Ders Adı", "topic": "İkinci konu", "potentialGain": "+2 Net"}
  ],
  "strategyTip": "Deneme sınavında süre veya taktik ile ilgili 1 cümlelik strateji ipucu"
}`;

      const res = await expoFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 380,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.summary && parsed.shortcutTopics) {
            return parsed;
          }
        }
      }
    } catch {
      // API çağrısı başarısız olursa sezgisel hesaplamaya devam
    }
  }

  // Heuristic Fallback
  const maxPossibleNet = isLgs ? 90 : 120;
  const estimatedProb = Math.min(96, Math.max(45, Math.round((latest.totalNet / maxPossibleNet) * 100) + 12));

  return {
    summary: `${student.name.split(' ')[0]}, son denemende ${latest.totalNet} net yaptın. ${targetName} hedefine ulaşmak için özellikle ${lowestSubj} netlerini yukarı çekmen kritik öneme sahip.`,
    targetProbability: `%${estimatedProb} (İstikrarlı İlerleme)`,
    shortcutTopics: isLgs
      ? [
          {
            subject: lowestSubj,
            topic: 'Kareköklü İfadeler & Veri Analizi',
            potentialGain: '+3 Net',
          },
          {
            subject: lowestSubj === 'Fen Bilimleri' ? 'Matematik' : 'Fen Bilimleri',
            topic: 'Mevsimler ve İklim',
            potentialGain: '+2 Net',
          },
        ]
      : [
          {
            subject: lowestSubj,
            topic: 'Problemler & Fonksiyonlar',
            potentialGain: '+4 Net',
          },
          {
            subject: lowestSubj === 'Fen Bilimleri' ? 'Temel Matematik' : 'Sosyal Bilimler',
            topic: 'Maddenin Halleri & Karışımlar',
            potentialGain: '+2 Net',
          },
        ],
    strategyTip: isLgs
      ? 'Sözel oturumda 75 dakikayı iyi yönetip sayısal oturumundaki 80 dakikada zorlandığın soruları ikinci tura bırakmalısın.'
      : 'TYT 165 dakika boyunca turlama taktiğiyle önce garanti soruları çözüp AYT için konuyu derinlemesine pekiştir.',
  };
}
