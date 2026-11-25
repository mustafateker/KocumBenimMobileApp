/* eslint-disable @typescript-eslint/no-require-imports */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { preloadInterstitialAd } from './ads';
import { useSession } from './session';

export const PRO_ENTITLEMENT_ID = 'pro';

function checkHasPro(info: any): boolean {
  if (!info) return false;
  const activeEntitlements = info?.entitlements?.active;
  if (activeEntitlements && typeof activeEntitlements === 'object') {
    if (activeEntitlements[PRO_ENTITLEMENT_ID]) return true;
    if (Object.keys(activeEntitlements).length > 0) return true;
  }
  if (Array.isArray(info?.activeSubscriptions) && info.activeSubscriptions.length > 0) {
    return true;
  }
  return false;
}

type SubscriptionContextValue = {
  isPro: boolean;
  loading: boolean;
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

let purchasesConfigured = false;

function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() || null;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() || null;
  }
  return null;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(() => Platform.OS !== 'web' && Boolean(getRevenueCatApiKey()));
  const [sdkReady, setSdkReady] = useState(false);

  // 1. RevenueCat SDK Ilklendirme
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      // API Key henuz tanimlanmamissa Free modda guvenle calis
      preloadInterstitialAd(false);
      return;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      if (!purchasesConfigured) {
        // SDK loglarinin konsola yazilmasini ve Metro hata katmanini tetiklemesini engelle
        Purchases.setLogHandler(() => {});

        Purchases.configure({ apiKey });
        purchasesConfigured = true;
      }
      Promise.resolve().then(() => {
        setSdkReady(true);
      });

      // Ilk durumu al
      Purchases.getCustomerInfo()
        .then((info: any) => {
          const hasPro = checkHasPro(info);
          setIsPro(hasPro);
          if (!hasPro) {
            preloadInterstitialAd(false);
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });

      // Dinleyici: satin alma / iptal / yenilenme durumlarini aninda yakala
      const listener = (info: any) => {
        const hasPro = checkHasPro(info);
        setIsPro(hasPro);
      };
      Purchases.addCustomerInfoUpdateListener(listener);

      return () => {
        try {
          Purchases.removeCustomerInfoUpdateListener(listener);
        } catch {}
      };
    } catch {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  // 2. Kullanici oturumu acildiginda / kapandiginda RevenueCat user ID senkronizasyonu
  useEffect(() => {
    if (Platform.OS === 'web' || !sdkReady) return;

    let cancelled = false;

    try {
      const Purchases = require('react-native-purchases').default;
      if (user?.id) {
        Purchases.logIn(String(user.id))
          .then(async (res: any) => {
            if (cancelled) return;
            let hasPro = checkHasPro(res?.customerInfo);
            // Cihazdaki Google Play / App Store hesabinda zaten aktif abonelik varsa
            // ("This product is already active for the user" hatasini onlemek icin) mevcut makbuzu senkronize et
            if (!hasPro) {
              try {
                if (typeof Purchases.syncPurchases === 'function') {
                  await Purchases.syncPurchases();
                }
                const syncedInfo = await Purchases.getCustomerInfo();
                hasPro = checkHasPro(syncedInfo);
              } catch {}
            }
            if (cancelled) return;
            setIsPro(hasPro);
            if (!hasPro) {
              preloadInterstitialAd(false);
            }
          })
          .catch(() => {});
      } else {
        Purchases.isAnonymous()
          .then((isAnon: boolean) => {
            if (cancelled) return;
            setIsPro(false);
            if (isAnon) return;
            return Purchases.logOut().catch(() => {});
          })
          .catch(() => {});
      }
    } catch {}

    return () => {
      cancelled = true;
    };
  }, [user?.id, sdkReady]);

  // 3. Durumu manuel tazeleyici
  const refreshSubscription = useCallback(async () => {
    if (Platform.OS === 'web' || !sdkReady) return;
    try {
      const Purchases = require('react-native-purchases').default;
      const info = await Purchases.getCustomerInfo();
      const hasPro = checkHasPro(info);
      setIsPro(hasPro);
      if (!hasPro) {
        preloadInterstitialAd(false);
      }
    } catch {}
  }, [sdkReady]);

  // 4. Paywall acma fonksiyonu (RevenueCat Dashboard uzerinde tasarlanan Paywall)
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    if (isPro) return true;

    if (!sdkReady) {
      Alert.alert(
        'Abonelik Servisi Hazırlanıyor',
        'Mağaza bağlantısı kuruluyor. Lütfen birkaç saniye sonra tekrar deneyin.'
      );
      return false;
    }

    try {
      const RevenueCatUI = require('react-native-purchases-ui').default;
      const { PAYWALL_RESULT } = require('react-native-purchases-ui');
      const Purchases = require('react-native-purchases').default;

      // Paywall acilmadan once cihazda aktif bir abonelik varsa senkronize et
      try {
        const preInfo = await Purchases.getCustomerInfo();
        if (checkHasPro(preInfo)) {
          setIsPro(true);
          return true;
        }
      } catch {}

      const result = await RevenueCatUI.presentPaywall({ displayCloseButton: true });
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        const info = await Purchases.getCustomerInfo();
        const hasPro = checkHasPro(info);
        setIsPro(hasPro);
        return hasPro;
      }

      // Kullanici "This product is already active for the user" uyarisi alip paywall'u kapattiysa
      // mevcut magaza aboneligini otomatik geri yukle / senkronize et
      try {
        const restoredInfo = await Purchases.restorePurchases();
        if (checkHasPro(restoredInfo)) {
          setIsPro(true);
          return true;
        }
      } catch {}

      if (result === PAYWALL_RESULT.ERROR) {
        Alert.alert(
          'Paketler Yüklenemedi',
          'Abonelik paketleri şu anda mağazadan alınamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
        );
      }
      return false;
    } catch {
      Alert.alert(
        'Paketler Yüklenemedi',
        'Abonelik paketleri şu anda mağazadan alınamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
      );
      return false;
    }
  }, [isPro, sdkReady]);

  // 5. Satin alimlari geri yukleme fonksiyonu
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !sdkReady) return false;

    try {
      const Purchases = require('react-native-purchases').default;
      const info = await Purchases.restorePurchases();
      const hasPro = checkHasPro(info);
      setIsPro(hasPro);
      return hasPro;
    } catch (err) {
      throw err;
    }
  }, [sdkReady]);

  const value = useMemo(
    () => ({
      isPro,
      loading,
      presentPaywall,
      restorePurchases,
      refreshSubscription,
    }),
    [isPro, loading, presentPaywall, restorePurchases, refreshSubscription]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription, SubscriptionProvider icinde kullanilmali');
  }
  return ctx;
}
