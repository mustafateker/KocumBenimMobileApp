import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

import { api } from './api-client';

const PLAY_REVIEW_STORAGE_KEY = 'kocumbenim.playReviewState.v1';
export const PLAY_STORE_PACKAGE = 'com.triworkster.kocumbenimmobileapp';
export const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;
export const PLAY_STORE_MARKET_URL = `market://details?id=${PLAY_STORE_PACKAGE}`;
export const APP_STORE_URL = 'https://apps.apple.com/app/kocum-benim/id6742512999';

type PlayReviewState = {
  aiCoachUsed: boolean;
  promptShownCount: number;
  completedAt: string | null;
  lastDismissedAt: string | null;
};

const DEFAULT_STATE: PlayReviewState = {
  aiCoachUsed: false,
  promptShownCount: 0,
  completedAt: null,
  lastDismissedAt: null,
};

type Listener = (visible: boolean) => void;
const listeners = new Set<Listener>();
let currentVisible = false;
let sessionAiCoachUsed = false;
let sessionTriggeredOnce = false;

function notify(visible: boolean) {
  currentVisible = visible;
  for (const l of listeners) {
    l(visible);
  }
}

export function subscribePlayReviewPrompt(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentVisible);
  return () => {
    listeners.delete(listener);
  };
}

export async function getPlayReviewState(): Promise<PlayReviewState> {
  try {
    const raw = await AsyncStorage.getItem(PLAY_REVIEW_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function savePlayReviewState(patch: Partial<PlayReviewState>): Promise<PlayReviewState> {
  const current = await getPlayReviewState();
  const next = { ...current, ...patch };
  try {
    await AsyncStorage.setItem(PLAY_REVIEW_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // sessizce devam
  }
  return next;
}

/**
 * Kullanıcı Koçum ekranına girdiğinde veya etkileşime geçtiğinde çağrılır.
 */
export async function markAiCoachUsed(): Promise<void> {
  sessionAiCoachUsed = true;
  await savePlayReviewState({ aiCoachUsed: true });
}

/**
 * Kullanıcı Koçum ekranını kullandıktan sonra başka bir ekrana ilk geçtiğinde
 * değerlendirme popup'ını tetikler.
 */
export async function triggerPlayReviewOnLeaveAiCoach(): Promise<void> {
  if (!sessionAiCoachUsed || sessionTriggeredOnce) return;
  const state = await getPlayReviewState();
  if (state.completedAt) return;

  sessionTriggeredOnce = true;
  await savePlayReviewState({
    aiCoachUsed: true,
    promptShownCount: (state.promptShownCount || 0) + 1,
  });
  notify(true);
}

export async function dismissPlayReviewPrompt(): Promise<void> {
  notify(false);
  await savePlayReviewState({ lastDismissedAt: new Date().toISOString() });
}

export async function submitPlayReviewAndOpenStore(options: {
  rating: number;
  comment?: string;
  studentName?: string;
  studentEmail?: string;
}): Promise<void> {
  notify(false);
  await savePlayReviewState({ completedAt: new Date().toISOString() });

  // Kullanıcı yorum yazdıysa arka planda geri bildirim olarak da kaydet
  const cleanComment = (options.comment ?? '').trim();
  if (cleanComment.length > 0) {
    api
      .post('/feedback', {
        name: options.studentName || 'Öğrenci',
        email: options.studentEmail || 'ogrenci@kocumbenim.app',
        subject: `${Platform.OS === 'ios' ? 'App Store' : 'Google Play'} Değerlendirmesi (${options.rating} Yıldız)`,
        message: cleanComment,
      })
      .catch(() => {});
  }

  try {
    if (Platform.OS === 'android') {
      const canOpenMarket = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
      if (canOpenMarket) {
        await Linking.openURL(PLAY_STORE_MARKET_URL);
        return;
      }
      await Linking.openURL(PLAY_STORE_WEB_URL);
    } else if (Platform.OS === 'ios') {
      await Linking.openURL(APP_STORE_URL);
    }
  } catch {
    // sessizce devam
  }
}
