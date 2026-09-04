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
