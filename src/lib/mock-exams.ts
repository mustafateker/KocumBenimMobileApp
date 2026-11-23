import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';

import { localTodayStr } from './ai-coach-engine';
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

export type MockExamType = 'lgs' | 'tyt' | 'ayt' | 'branch' | 'general';

export type MockExam = {
  id: string;
  title: string;
  examType: MockExamType;
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

/** LGS Ders Sabitleri (90 Soru, 3 Yanlış 1 Doğruyu Götürür) */
export const LGS_DEFAULT_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 20 },
  { subject: 'Matematik', totalQuestions: 20 },
  { subject: 'Fen Bilimleri', totalQuestions: 20 },
  { subject: 'T.C. İnkılap Tarihi', totalQuestions: 10 },
  { subject: 'Din Kültürü', totalQuestions: 10 },
  { subject: 'Yabancı Dil (İngilizce)', totalQuestions: 10 },
];

/** TYT Ders Sabitleri (120 Soru, 4 Yanlış 1 Doğruyu Götürür) */
export const TYT_DEFAULT_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 40 },
  { subject: 'Temel Matematik', totalQuestions: 40 },
  { subject: 'Fen Bilimleri', totalQuestions: 20 },
  { subject: 'Sosyal Bilimler', totalQuestions: 20 },
];

/** Genel / Ara Sınıf Deneme Sabitleri */
export const GENERAL_DEFAULT_SUBJECTS = [
  { subject: 'Türkçe', totalQuestions: 20 },
  { subject: 'Matematik', totalQuestions: 20 },
  { subject: 'Fen Bilimleri', totalQuestions: 20 },
  { subject: 'Sosyal Bilgiler', totalQuestions: 15 },
];

export function calculateNet(correct: number, wrong: number, examType: MockExamType): number {
  const penalty = examType === 'lgs' ? 3 : 4;
  const rawNet = correct - wrong / penalty;
  return Math.max(0, Math.round(rawNet * 100) / 100);
}

/** LGS Puan Tahmini (Standart formül yaklaşık katsayıları) */
export function estimateLgsScore(subjects: ExamSubjectScore[]): number {
  let score = 100; // Taban puan
  for (const s of subjects) {
    if (s.subject === 'Türkçe' || s.subject === 'Matematik' || s.subject === 'Fen Bilimleri') {
      score += s.net * 4.35;
    } else {
      score += s.net * 1.45;
    }
  }
  return Math.min(500, Math.round(score * 100) / 100);
}

/** TYT Puan Tahmini (Yaklaşık katsayılar) */
export function estimateTytScore(subjects: ExamSubjectScore[]): number {
  let score = 100;
  for (const s of subjects) {
    if (s.subject === 'Türkçe' || s.subject === 'Temel Matematik') {
      score += s.net * 3.3;
    } else {
      score += s.net * 3.4;
    }
  }
  return Math.min(500, Math.round(score * 100) / 100);
}

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

/**
 * Öğrencinin geçmiş denemelerine ve hedef okuluna göre AI Net & Hedef Analizi üretir.
 */
export async function generateAiExamAnalysis(
  exams: MockExam[],
  student: Student
): Promise<AiExamAnalysis> {
  const grade = student.grade ?? '8. Sınıf';
  const targetName =
    student.targetHighSchool ||
    student.targetUniversity ||
    student.targetDepartment ||
    student.goal ||
    'Hedef Derece';

  if (exams.length === 0) {
    return {
      summary: `${student.name.split(' ')[0]}, henüz kaydedilmiş bir deneme sınavın bulunmuyor. Girdiğin ilk denemeyi eklediğinde net tahminin ve hedef eğrin burada hesaplanacak.`,
      targetProbability: 'Henüz Veri Yok',
      shortcutTopics: [
        { subject: 'Matematik', topic: 'Temel İşlemler & Yeni Nesil', potentialGain: '+3 Net' },
        { subject: 'Türkçe', topic: 'Paragrafta Anlam', potentialGain: '+4 Net' },
      ],
      strategyTip: 'İlk denemeni çözerken süre tutmayı ve boş bıraktığın soruları işaretlemeyi unutma.',
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

  let lowestSubj = 'Matematik';
  let lowestAvg = 999;
  for (const [subj, data] of Object.entries(subjectTotals)) {
    const avg = data.totalNet / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestSubj = subj;
    }
  }

  // Gemini API ile kişiselleştirilmiş tahmin dene
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  if (geminiKey) {
    try {
      const prompt = `ÖĞRENCİ BİLGİSİ:
- İsim: ${student.name}
- Sınıf: ${grade}
- Hedef: ${targetName}
- Kayıtlı Deneme Sayısı: ${totalExams}
- Son Deneme Neti: ${latest.totalNet} Net (Puan: ${latest.estimatedScore ?? '-'})
- Ortalama Net: ${avgNet} Net (En Yüksek: ${maxNet} Net)
- En Zorlandığı / En Düşük Netli Ders: ${lowestSubj} (${Math.round(lowestAvg * 10) / 10} ortalama net)

GÖREV:
Yukarıdaki öğrenci için Türkçe Yüzyılı Maarif Modeli ve sınav hazırlığı (LGS/YKS) standartlarına göre JSON formatında kısa bir net analizi ve kestirme konu tavsiyesi üret.
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
      // API çağrısı başarısız olursa yerel sezgisel hesaplamaya geç
    }
  }

  // Heuristic Fallback
  const diff = latest.totalNet - avgNet;
  const trendText = diff >= 0 ? `+${Math.round(diff * 10) / 10} net yükseliş` : `${Math.round(diff * 10) / 10} net dalgalanma`;
  const estimatedProb = Math.min(95, Math.max(50, Math.round((latest.totalNet / (grade.includes('8') ? 90 : 120)) * 100) + 15));

  return {
    summary: `${student.name.split(' ')[0]}, son denemende ${latest.totalNet} nete ulaştın (${trendText}). ${targetName} hedefine ulaşmak için özellikle ${lowestSubj} netlerini yukarı çekmen kritik öneme sahip.`,
    targetProbability: `%${estimatedProb} (İstikrarlı İlerleme)`,
    shortcutTopics: [
      {
        subject: lowestSubj,
        topic: grade.includes('8') ? 'Kareköklü İfadeler & Veri Analizi' : 'Fonksiyonlar & Problemler',
        potentialGain: '+3 Net',
      },
      {
        subject: lowestSubj === 'Fen Bilimleri' ? 'Matematik' : 'Fen Bilimleri',
        topic: grade.includes('8') ? 'Mevsimler ve İklim' : 'Maddenin Halleri',
        potentialGain: '+2 Net',
      },
    ],
    strategyTip: 'Denemede takıldığın sorulara 2 dakikadan fazla harcamayıp turlama tekniğiyle ikinci tura bırakmalısın.',
  };
}
