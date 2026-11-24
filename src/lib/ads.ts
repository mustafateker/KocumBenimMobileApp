/* eslint-disable @typescript-eslint/no-require-imports */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_LAST_SHOWN = 'kocumbenim.ads.lastShownAt';
export const AD_COOLDOWN_MS = 30 * 60 * 1000; // 30 dakika

export type AdPlacement = 'pomodoro_exit' | 'stats_open';

let lastShownAtMemory: number | null = null;
let isLoaded = false;
let isLoading = false;
let isShowing = false;
let interstitialAdInstance: any = null;
let unsubscribeLoaded: (() => void) | null = null;
let unsubscribeClosed: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let adsInitPromise: Promise<void> | null = null;

async function initMobileAdsSdk(): Promise<void> {
  try {
    const mobileAdsModule = require('react-native-google-mobile-ads');
    const mobileAds = mobileAdsModule.default;
    const MaxAdContentRating = mobileAdsModule.MaxAdContentRating;
    if (MaxAdContentRating) {
      await mobileAds()
        .setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForUnderAgeOfConsent: true,
        })
        .catch(() => {});
    }
    await mobileAds().initialize();
  } catch {
    // Reklam SDK ilklendirme hatasi uygulama akisini engellemez
  }
}

export async function ensureAdsInitialized(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!adsInitPromise) {
    adsInitPromise = initMobileAdsSdk();
  }
  return adsInitPromise;
}

export function cleanupInterstitialAd(): void {
  unsubscribeLoaded?.();
  unsubscribeClosed?.();
  unsubscribeError?.();
  unsubscribeLoaded = null;
  unsubscribeClosed = null;
  unsubscribeError = null;
  interstitialAdInstance = null;
  isLoaded = false;
  isLoading = false;
}

async function getLastShownAt(): Promise<number> {
  if (lastShownAtMemory !== null) {
    return lastShownAtMemory;
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_SHOWN);
    const parsed = raw ? parseInt(raw, 10) : 0;
    lastShownAtMemory = isNaN(parsed) ? 0 : parsed;
    return lastShownAtMemory;
  } catch {
    lastShownAtMemory = 0;
    return 0;
  }
}

async function setLastShownAt(timestamp: number): Promise<void> {
  lastShownAtMemory = timestamp;
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_SHOWN, String(timestamp));
  } catch {
    // Depolama hatasi akisi engellemez
  }
}

function getAdUnitId(): string {
  if (Platform.OS === 'web') return '';
  try {
    const { TestIds } = require('react-native-google-mobile-ads');
    if (__DEV__) {
      return TestIds.INTERSTITIAL;
    }
    const isIos = Platform.OS === 'ios';
    const releaseId = isIos
      ? process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
      : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID;
    return (releaseId && releaseId.trim().length > 0) ? releaseId.trim() : TestIds.INTERSTITIAL;
  } catch {
    return '';
  }
}

function setupInterstitialAd() {
  if (Platform.OS === 'web') return null;
  if (interstitialAdInstance) return interstitialAdInstance;

  try {
    const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
    const unitId = getAdUnitId();
    if (!unitId) return null;

    interstitialAdInstance = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    unsubscribeLoaded = interstitialAdInstance.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
    });

    unsubscribeError = interstitialAdInstance.addAdEventListener(AdEventType.ERROR, () => {
      isLoaded = false;
      isLoading = false;
    });

    unsubscribeClosed = interstitialAdInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isLoaded = false;
      isLoading = false;
      // Sonraki seans icin arka planda yeniden yukle
      setTimeout(() => {
        preloadInterstitialAd(false);
      }, 5000);
    });

    return interstitialAdInstance;
  } catch {
    return null;
  }
}

export function preloadInterstitialAd(isPro = false): void {
  if (isPro || Platform.OS === 'web') return;
  if (isLoaded || isLoading) return;

  ensureAdsInitialized()
    .then(() => {
      if (isLoaded || isLoading) return;
      try {
        const ad = setupInterstitialAd();
        if (!ad) return;
        isLoading = true;
        ad.load();
      } catch {
        isLoading = false;
        isLoaded = false;
      }
    })
    .catch(() => {});
}

export async function isAdCooldownActive(): Promise<boolean> {
  const lastShown = await getLastShownAt();
  if (lastShown === 0) return false;
  return Date.now() - lastShown < AD_COOLDOWN_MS;
}

export async function getRemainingCooldownSeconds(): Promise<number> {
  const lastShown = await getLastShownAt();
  if (lastShown === 0) return 0;
  const diff = Date.now() - lastShown;
  if (diff >= AD_COOLDOWN_MS) return 0;
  return Math.ceil((AD_COOLDOWN_MS - diff) / 1000);
}

export async function resetAdCooldownForTesting(): Promise<void> {
  lastShownAtMemory = 0;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_LAST_SHOWN);
  } catch {}
}

/**
 * Kullanici uygunsa (ucretsiz planda, 30 dk cooldown suresi dolmus ve reklam yuklenmis)
 * tam ekran gecis reklamini gosterir. Reklam kapandiginda veya hata olusursa resolve eder.
 * Kullaniciyi hicbir zaman ekranda bekletmez; reklam hazir degilse arka planda yukler ve aninda false doner.
 */
export async function showInterstitialIfEligible(
  placement: AdPlacement,
  isPro = false
): Promise<boolean> {
  if (isPro || Platform.OS === 'web' || isShowing) {
    return false;
  }

  // Cooldown kontrolu (30 dakika)
  const inCooldown = await isAdCooldownActive();
  if (inCooldown) {
    return false;
  }

  await ensureAdsInitialized();

  const ad = setupInterstitialAd();
  if (!ad || !isLoaded) {
    // Reklam hazir degil, sonraki firsat icin arkada yukle
    preloadInterstitialAd(false);
    return false;
  }

  isShowing = true;
  isLoaded = false;

  return new Promise<boolean>((resolve) => {
    let handled = false;
    let openTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let onOpenedListener: (() => void) | null = null;
    let onClosedListener: (() => void) | null = null;
    let onErrorListener: (() => void) | null = null;

    const cleanup = () => {
      if (openTimeoutId) {
        clearTimeout(openTimeoutId);
        openTimeoutId = null;
      }
      try {
        if (onOpenedListener) onOpenedListener();
        if (onClosedListener) onClosedListener();
        if (onErrorListener) onErrorListener();
      } catch {
        // Dinleyici temizleme hatasi akisi engellemez
      }
      onOpenedListener = null;
      onClosedListener = null;
      onErrorListener = null;
    };

    const finish = (shown: boolean) => {
      if (handled) return;
      handled = true;
      isShowing = false;
      cleanup();
      cleanupInterstitialAd();
      if (shown) {
        setLastShownAt(Date.now());
      }
      setTimeout(() => {
        preloadInterstitialAd(false);
      }, 5000);
      resolve(shown);
    };

    try {
      const { AdEventType } = require('react-native-google-mobile-ads');

      // Reklam ekranda gercekten acildiginda acilis timeout'unu iptal et (uzun video reklamlar kesilmez)
      onOpenedListener = ad.addAdEventListener(AdEventType.OPENED, () => {
        if (openTimeoutId) {
          clearTimeout(openTimeoutId);
          openTimeoutId = null;
        }
      });

      // Reklam kullanici tarafindan kapatildiginda cooldown zamanini kaydet ve finish(true) yap
      onClosedListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
        finish(true);
      });

      onErrorListener = ad.addAdEventListener(AdEventType.ERROR, () => {
        finish(false);
      });

      // Eger reklam 8 saniye icinde acilamazsa kullanici kilitlenmesin
      openTimeoutId = setTimeout(() => {
        finish(false);
      }, 8000);

      ad.show().catch(() => {
        finish(false);
      });
    } catch {
      finish(false);
    }
  });
}
