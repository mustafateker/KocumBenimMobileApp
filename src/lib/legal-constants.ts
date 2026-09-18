/**
 * Yardım, gizlilik, kullanım şartları ve aydınlatma metni sayfalarının
 * paylaştığı kimlik/iletişim bilgileri — tek yerden güncellenir.
 *
 * Şirket olarak tescil edilirseniz APP_OWNER'ı ticari unvanınızla
 * değiştirin; şu an için uygulamayı işleten taraf marka adıyla anılıyor.
 */
export const SUPPORT_EMAIL = 'infokocumbenim@gmail.com';
export const APP_NAME = 'Koçum Benim';
export const APP_OWNER = 'Koçum Benim';
export const MAILTO_SUPPORT = `mailto:${SUPPORT_EMAIL}`;

export function mailtoWithSubject(subject: string): string {
  return `${MAILTO_SUPPORT}?subject=${encodeURIComponent(subject)}`;
}
