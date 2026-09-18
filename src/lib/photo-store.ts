import { Directory, File, Paths } from 'expo-file-system';

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

/** Cekilen fotograflarin kalici klasoru. */
const PHOTO_FOLDER = 'sorular';

function photoDirectory(): Directory {
  const directory = new Directory(Paths.document, PHOTO_FOLDER);
  if (!directory.exists) directory.create({ intermediates: true });
  return directory;
}

/**
 * Kameradan gelen fotografi kalici klasore kopyalar ve yeni yolu dondurur.
 *
 * `takePictureAsync` dosyayi onbellek klasorune yaziyor; expo-camera dokumani
 * bu yolun gecici oldugunu, saklanacaksa kopyalanmasi gerektigini soyluyor.
 * Android dusuk bellekte onbellegi temizleyebiliyor — cizim ekranina gecip
 * "Kaydet" denene kadar gecen surede dosya silinirse sunucuya bos bir govde
 * gidiyordu ("bos foto kaydediyor" sikayeti). Kalici kopya bunu bitirir.
 *
 * Kopyalama basarisiz olursa orijinal yol dondurulur: fotografi hic
 * kaybetmektense gecici yolla devam etmek daha iyi.
 */
export async function persistCapturedPhoto(temporaryUri: string): Promise<string> {
  try {
    const source = new File(temporaryUri);
    const extension = source.extension || '.jpg';
    const target = new File(photoDirectory(), `soru-${Date.now()}${extension}`);

    await source.copy(target, { overwrite: true });
    // Kopya bos cikarsa (disk dolu, yarim yazim) orijinale geri dus.
    if (!target.exists || target.size === 0) return temporaryUri;

    return target.uri;
  } catch {
    return temporaryUri;
  }
}

/** Fotograf sunucuya gonderildikten (ya da vazgecildikten) sonra yerelden siler. */
export function discardPhoto(uri: string): void {
  try {
    if (!uri.includes(PHOTO_FOLDER)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Silinemeyen dosya kullaniciya bir sey ifade etmiyor; sessizce birak.
  }
}
