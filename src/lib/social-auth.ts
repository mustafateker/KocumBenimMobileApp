import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import type { AppleLoginInput } from './api';

const GOOGLE_WEB_CLIENT_ID = '437940693097-nrq7b3hsr3q93iorc2k5paadag3mfre9.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '437940693097-avtqiuecbkmvg75je3k1cohm5bo1s1ss.apps.googleusercontent.com';

let googleConfigured = false;

/**
 * Google Sign-In SDK ilk yapılandırması.
 */
export function configureGoogleSignIn() {
  if (googleConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });
    googleConfigured = true;
  } catch (err) {
    console.warn('[SocialAuth] Google Sign-In yapılandırılamadı:', err);
  }
}

/**
 * Oturum kapatıldığında cihazdaki Google Sign-In önbelleğini temizler.
 */
export async function signOutGoogleSilently(): Promise<void> {
  try {
    configureGoogleSignIn();
    await GoogleSignin.signOut();
  } catch {
    // Google oturumu zaten kapalıysa sessizce geç
  }
}

/**
 * Native Google hesap seçici penceresini açar.
 * Kullanıcı vazgeçerse null döner; hata oluşursa hata fırlatır.
 */
export async function promptGoogleSignIn(): Promise<{ idToken: string } | null> {
  try {
    configureGoogleSignIn();
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    // Önceki yarım kalmış veya farklı hesaba ait oturumu temizle ki hesap seçici her zaman açılsın
    await GoogleSignin.signOut().catch(() => {});
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) {
      return null;
    }

    if (isSuccessResponse(response)) {
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Google oturumundan kimlik jetonu (idToken) alınamadı.');
      }
      return { idToken };
    }

    // Fallback if data is directly on response (older types)
    const fallbackIdToken = (response as any)?.data?.idToken ?? (response as any)?.idToken;
    if (fallbackIdToken) {
      return { idToken: fallbackIdToken };
    }

    return null;
  } catch (error: any) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return null;
      }
    }
    if (error?.code === '12501' || error?.code === 'SIGN_IN_CANCELLED') {
      return null;
    }
    throw error;
  }
}

/**
 * Apple ile Giriş Yap modalını açar (yalnızca iOS).
 * Kullanıcı vazgeçerse null döner; hata oluşursa hata fırlatır.
 */
export async function promptAppleSignIn(): Promise<AppleLoginInput | null> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple ile Giriş Yap yalnızca iOS cihazlarda desteklenir.');
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Bu cihazda Apple ile Giriş Yap kullanılamıyor.');
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple oturumundan kimlik jetonu alınamadı.');
    }

    return {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      fullName: credential.fullName
        ? {
            givenName: credential.fullName.givenName,
            familyName: credential.fullName.familyName,
            middleName: credential.fullName.middleName,
            nickname: credential.fullName.nickname,
          }
        : null,
      email: credential.email,
    };
  } catch (error: any) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      return null;
    }
    throw error;
  }
}

/**
 * Hesap silme anında Apple'dan taze bir yetkilendirme kodu (authorizationCode) ister (opsiyonel fallback).
 * Backend'de kayıtlı appleRefreshToken yoksa veya ek doğrulama istenirse kullanılır.
 */
export async function requestAppleRevocationCode(): Promise<string | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) return null;

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [],
    });
    return credential.authorizationCode || null;
  } catch {
    return null;
  }
}
