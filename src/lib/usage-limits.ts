import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Question } from './types';

const STORAGE_KEY_AI_DAILY = 'kocumbenim.usage.aiDaily';
const STORAGE_KEY_MONTHLY_QUESTIONS = 'kocumbenim.usage.monthlyQuestions';

export const FREE_DAILY_AI_LIMIT = 1;
export const PRO_MONTHLY_QUESTION_LIMIT = 60;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/* -------------------------------------------------------------------------- */
/* AI KULLANIM KOTASI (Free: 1/gun, Pro: Sinirsiz)                            */
/* -------------------------------------------------------------------------- */

type AiDailyUsage = {
  date: string;
  count: number;
};

async function loadAiDailyUsage(): Promise<AiDailyUsage> {
  const today = getTodayString();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_AI_DAILY);
    if (!raw) return { date: today, count: 0 };
    const parsed: AiDailyUsage = JSON.parse(raw);
    if (parsed.date !== today) {
      return { date: today, count: 0 };
    }
    return parsed;
  } catch {
    return { date: today, count: 0 };
  }
}

export async function getRemainingAiQuota(isPro: boolean): Promise<number> {
  if (isPro) return Infinity;
  const usage = await loadAiDailyUsage();
  return Math.max(0, FREE_DAILY_AI_LIMIT - usage.count);
}

export async function canUseAi(isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const remaining = await getRemainingAiQuota(false);
  return remaining > 0;
}

export async function consumeAiQuota(isPro: boolean): Promise<{ success: boolean; remaining: number }> {
  if (isPro) {
    return { success: true, remaining: Infinity };
  }
  const today = getTodayString();
  const usage = await loadAiDailyUsage();
  if (usage.count >= FREE_DAILY_AI_LIMIT) {
    return { success: false, remaining: 0 };
  }
  const updated: AiDailyUsage = {
    date: today,
    count: usage.count + 1,
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY_AI_DAILY, JSON.stringify(updated));
  } catch {}
  return { success: true, remaining: Math.max(0, FREE_DAILY_AI_LIMIT - updated.count) };
}

/* -------------------------------------------------------------------------- */
/* GORSEL SORU AYLIK KOTASI (Free: 0, Pro: 60/ay)                              */
/* -------------------------------------------------------------------------- */

type MonthlyQuestionUsage = {
  month: string;
  count: number;
};

async function loadMonthlyQuestionUsage(): Promise<MonthlyQuestionUsage> {
  const currentMonth = getCurrentMonthString();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_MONTHLY_QUESTIONS);
    if (!raw) return { month: currentMonth, count: 0 };
    const parsed: MonthlyQuestionUsage = JSON.parse(raw);
    if (parsed.month !== currentMonth) {
      return { month: currentMonth, count: 0 };
    }
    return parsed;
  } catch {
    return { month: currentMonth, count: 0 };
  }
}

export async function getMonthlyQuestionUsage(isPro = false): Promise<{
  used: number;
  limit: number;
  remaining: number;
  month: string;
}> {
  const currentMonth = getCurrentMonthString();
  if (!isPro) {
    return {
      used: 0,
      limit: 0,
      remaining: 0,
      month: currentMonth,
    };
  }
  const usage = await loadMonthlyQuestionUsage();
  const remaining = Math.max(0, PRO_MONTHLY_QUESTION_LIMIT - usage.count);
  return {
    used: usage.count,
    limit: PRO_MONTHLY_QUESTION_LIMIT,
    remaining,
    month: currentMonth,
  };
}

export async function canAskQuestion(isPro: boolean): Promise<{
  allowed: boolean;
  reason?: 'free_plan' | 'monthly_quota_exceeded';
  remaining: number;
}> {
  if (!isPro) {
    return { allowed: false, reason: 'free_plan', remaining: 0 };
  }
  const usage = await loadMonthlyQuestionUsage();
  if (usage.count >= PRO_MONTHLY_QUESTION_LIMIT) {
    return { allowed: false, reason: 'monthly_quota_exceeded', remaining: 0 };
  }
  return {
    allowed: true,
    remaining: PRO_MONTHLY_QUESTION_LIMIT - usage.count,
  };
}

export async function recordQuestionSent(): Promise<number> {
  const currentMonth = getCurrentMonthString();
  const usage = await loadMonthlyQuestionUsage();
  const updated: MonthlyQuestionUsage = {
    month: currentMonth,
    count: usage.count + 1,
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY_MONTHLY_QUESTIONS, JSON.stringify(updated));
  } catch {}
  return updated.count;
}

export async function syncMonthlyQuestionsFromList(questions: Question[]): Promise<number> {
  if (!Array.isArray(questions)) return 0;
  const currentMonth = getCurrentMonthString();
  const countThisMonth = questions.filter((q) => {
    if (!q.createdAt) return false;
    return q.createdAt.startsWith(currentMonth);
  }).length;

  const usage = await loadMonthlyQuestionUsage();
  const finalCount = Math.max(usage.count, countThisMonth);
  if (finalCount !== usage.count) {
    const updated: MonthlyQuestionUsage = {
      month: currentMonth,
      count: finalCount,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MONTHLY_QUESTIONS, JSON.stringify(updated));
    } catch {}
  }
  return finalCount;
}
