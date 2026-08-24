import { Directory, File, Paths } from 'expo-file-system';

const QUESTIONS_DIR = 'questions';

/**
 * Kamera fotograflari onbellege yazilir ve sistem tarafindan silinebilir.
 * Soru kalici bir kayit oldugu icin fotografi belgeler klasorune kopyalariz.
 *
 * Kopyalama basarisiz olursa (disk dolu vb.) orijinal onbellek yolu doner —
 * soru yine de gonderilebilsin, en kotu ihtimalle fotograf sonradan kaybolur.
 */
export async function persistQuestionPhoto(cacheUri: string): Promise<string> {
  try {
    const dir = new Directory(Paths.document, QUESTIONS_DIR);
    if (!dir.exists) dir.create({ intermediates: true });

    const extension = cacheUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const target = new File(dir, `soru-${Date.now()}.${extension}`);

    await new File(cacheUri).copy(target);
    return target.uri;
  } catch {
    return cacheUri;
  }
}

/** Soruya ait fotografi diskten siler. Yoksa sessizce gecer. */
export function deleteQuestionPhoto(uri: string) {
  if (!uri.includes(QUESTIONS_DIR)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Silinemeyen dosya kullaniciyi ilgilendirmez.
  }
}

/**
 * Yerel bir dosya yolunu goruntu bilesenlerine vermeden once guvenli hale getirir.
 *
 * Expo Go her deneyimi yuzde-kodlu bir klasorde tutuyor:
 *   .../ExperienceData/%40anonymous%2FKocumBenimMobileApp-<id>/Camera/foto.jpg
 * Hem expo-image hem React Native Image, URI'yi cozerken %2F'yi gercek bir '/'
 * sanip var olmayan bir yola bakiyor ve sessizce bos kare gosteriyor. Yuzde
 * isaretini bir kez daha kodlarsak cozum sonrasinda klasorun gercek adi elde
 * edilir. Uretim derlemelerinde yolda % bulunmadigi icin bu donusum etkisizdir.
 */
export function localImageUri(uri: string): string {
  return uri.replace(/%/g, '%25');
}
