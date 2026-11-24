import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { preloadInterstitialAd } from './ads';
import { useSession } from './session';

export const PRO_ENTITLEMENT_ID = 'pro';

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
        Purchases.configure({ apiKey });
        purchasesConfigured = true;
      }
      Promise.resolve().then(() => {
        setSdkReady(true);
      });

      // Ilk durumu al
      Purchases.getCustomerInfo()
        .then((info: any) => {
          const hasPro = Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
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
        const hasPro = Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
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
          .then((res: any) => {
            if (cancelled) return;
            const hasPro = Boolean(res?.customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
            setIsPro(hasPro);
            if (!hasPro) {
              preloadInterstitialAd(false);
            }
          })
          .catch(() => {});
      } else {
        Purchases.isAnonymous()
          .then((isAnon: boolean) => {
            if (cancelled || isAnon) return;
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
      const hasPro = Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
      setIsPro(hasPro);
      if (!hasPro) {
        preloadInterstitialAd(false);
      }
    } catch {}
  }, [sdkReady]);

  // 4. Paywall acma fonksiyonu (RevenueCat UI)
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !sdkReady) return false;

    try {
      const RevenueCatUI = require('react-native-purchases-ui').default;
      const { PAYWALL_RESULT } = require('react-native-purchases-ui');
      const Purchases = require('react-native-purchases').default;

      const result = await RevenueCatUI.presentPaywall();
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        const info = await Purchases.getCustomerInfo();
        const hasPro = Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
        setIsPro(hasPro);
        return hasPro;
      }
      return false;
    } catch {
      return false;
    }
  }, [sdkReady]);

  // 5. Satin alimlari geri yukleme fonksiyonu
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !sdkReady) return false;

    try {
      const Purchases = require('react-native-purchases').default;
      const info = await Purchases.restorePurchases();
      const hasPro = Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
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

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription, SubscriptionProvider icinde kullanilmali');
  }
  return ctx;
}
