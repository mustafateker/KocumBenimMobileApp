import { ApiError } from './api-client';

export type ErrorCopy = { title: string; message: string };

/**
 * Bir hatayi kullaniciya gosterilecek baslik + mesaja cevirir. API hatalarinin
 * mesaji backend'den Turkce gelir; ag, zaman asimi ve sunucu cokmesi gibi
 * durumlar icin ortak, anlasilir metinler burada toplanir.
 */
export function describeError(err: unknown, fallbackTitle: string): ErrorCopy {
  if (err instanceof ApiError) {
    if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT') {
      return { title: 'Bağlantı sorunu', message: err.message };
    }
    if (err.code === 'CONFIG_ERROR') {
      return { title: 'Yapılandırma hatası', message: err.message };
    }
    if (err.status >= 500) {
      return { title: 'Sunucu hatası', message: 'Sunucuda bir sorun oluştu. Biraz sonra tekrar dene.' };
    }
    if (err.status === 429) {
      return { title: 'Çok fazla deneme', message: 'Kısa sürede çok fazla istek gönderdin. Biraz bekleyip tekrar dene.' };
    }
    return { title: fallbackTitle, message: err.message };
  }

  return { title: fallbackTitle, message: 'Beklenmeyen bir hata oluştu. Tekrar dene.' };
}
