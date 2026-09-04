import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, UploadType } from 'expo-file-system';

/**
 * Backend'in mobil uygulamadan gorunen adresi. EXPO_PUBLIC_ ile basladigi
 * icin derlenmis pakete gomulur — bu yuzden burada asla sunucu sirri
 * (DB baglantisi, JWT_SECRET, AWS anahtarlari) tutulmaz, sadece bu URL.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

const ACCESS_TOKEN_KEY = 'kocumbenim.auth.accessToken';
const REFRESH_TOKEN_KEY = 'kocumbenim.auth.refreshToken';

export type Tokens = { accessToken: string; refreshToken: string | null };

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

/** Uygulama acilisinda kayitli oturumu bellege yukler. */
export async function loadStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [a, r] = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  accessToken = a[1];
  refreshToken = r[1];
  return { accessToken, refreshToken };
}

/**
 * `remember` kapaliysa token'lar yalnizca bellekte tutulur, kalici
 * depolamaya yazilmaz — uygulama yeniden acildiginda oturum devam etmez.
 */
export async function setTokens(tokens: Tokens, remember: boolean): Promise<void> {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;

  if (remember && tokens.refreshToken) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, tokens.accessToken],
      [REFRESH_TOKEN_KEY, tokens.refreshToken],
    ]);
  } else {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function hasAccessToken(): boolean {
  return accessToken !== null;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const err = body?.error ?? {};
    return new ApiError(res.status, err.code ?? 'UNKNOWN', err.message ?? 'Bir hata oluştu.', err.details ?? null);
  } catch {
    return new ApiError(res.status, 'UNKNOWN', 'Bir hata oluştu.');
  }
}

/**
 * 401 alindiginda refresh token'i bir kez deneyip istegi tekrar eder.
 * Ayni anda birden fazla istek 401 alirsa hepsi tek bir refresh cagrisini
 * paylasir (refreshPromise), boylece refresh token'i coklu kullanip
 * gecersiz kilma riskini onler (rotation, bkz. API_SPEC §2.4).
 */
async function doRefresh(): Promise<boolean> {
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await doFetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          await clearTokens();
          return false;
        }
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        await setTokens(data, true);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Bu istek kimlik dogrulama gerektirmiyorsa false (ornek: /auth/login). Varsayilan true. */
  auth?: boolean;
};

/** Native fetch, sunucu hic cevap vermezse dakikalarca bekleyebilir (OS varsayilani) — bu yuzden kendi suremizi koyuyoruz. */
const REQUEST_TIMEOUT_MS = 15000;

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ApiError(
        0,
        'TIMEOUT',
        `Sunucuya ${REQUEST_TIMEOUT_MS / 1000} saniye içinde ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.`,
        { url }
      );
    }
    const originalMessage = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.',
      { url, originalMessage }
    );
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  if (!BASE_URL) {
    throw new ApiError(
      0,
      'CONFIG_ERROR',
      'EXPO_PUBLIC_API_BASE_URL tanımlı değil — .env.local dosyasını kontrol et.'
    );
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await doFetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !retried) {
    const refreshed = await doRefresh();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

type UploadFileOptions = {
  /** Multipart alan adi (backend'in File(...) parametresiyle eslesmeli). */
  fieldName: string;
  /** Yerel dosya URI'si (file://...). */
  fileUri: string;
  mimeType: string;
  /** Dosyayla birlikte gonderilecek diger form alanlari (strokes, note gibi). */
  fields?: Record<string, string>;
  auth?: boolean;
};

/**
 * Bu Expo surumunun global `fetch`'i (winter runtime) React Native'in eski
 * `{uri, name, type}` FormData kisayolunu desteklemiyor — bir Blob/File veya
 * `.bytes()` metodu olan bir nesne bekliyor, aksi halde "Unsupported
 * FormDataPart implementation" hatasi firlatiyor. Bu yuzden dosya yuklemede
 * FormData yerine expo-file-system'in native `File#upload` metodunu kullaniyoruz.
 */
async function uploadFile<T>(path: string, options: UploadFileOptions, retried = false): Promise<T> {
  const { fieldName, fileUri, mimeType, fields, auth = true } = options;

  if (!BASE_URL) {
    throw new ApiError(
      0,
      'CONFIG_ERROR',
      'EXPO_PUBLIC_API_BASE_URL tanımlı değil — .env.local dosyasını kontrol et.'
    );
  }

  const headers: Record<string, string> = {};
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let result: { status: number; body: string };
  try {
    result = await new File(fileUri).upload(`${BASE_URL}${path}`, {
      uploadType: UploadType.MULTIPART,
      fieldName,
      mimeType,
      headers,
      parameters: fields,
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ApiError(
        0,
        'TIMEOUT',
        `Sunucuya ${REQUEST_TIMEOUT_MS / 1000} saniye içinde ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.`,
        { url: path }
      );
    }
    const originalMessage = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.',
      { url: path, originalMessage }
    );
  } finally {
    clearTimeout(timer);
  }

  if (result.status === 401 && auth && !retried) {
    const refreshed = await doRefresh();
    if (refreshed) return uploadFile<T>(path, options, true);
  }

  if (result.status < 200 || result.status >= 300) {
    try {
      const body = JSON.parse(result.body);
      const err = body?.error ?? {};
      throw new ApiError(result.status, err.code ?? 'UNKNOWN', err.message ?? 'Bir hata oluştu.', err.details ?? null);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(result.status, 'UNKNOWN', 'Bir hata oluştu.');
    }
  }

  return (result.body ? JSON.parse(result.body) : undefined) as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
  uploadFile: <T>(path: string, options: UploadFileOptions) => uploadFile<T>(path, options),
};
