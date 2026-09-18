import { LegalScreen, type LegalSection } from '@/components/legal-screen';
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/legal-constants';

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Kabul',
    body:
      `${APP_NAME}'i ("Uygulama") indirerek, hesap oluşturarak veya kullanarak bu Kullanım ` +
      'Şartlarını kabul etmiş sayılırsın. Şartları kabul etmiyorsan Uygulamayı kullanmamalısın. ' +
      '18 yaşından küçüksen, bu şartları bir ebeveyn veya yasal vasi gözetiminde kabul ettiğini ' +
      'varsayıyoruz.',
  },
  {
    heading: '2. Hizmet Tanımı',
    body:
      'Uygulama; odaklanma (Pomodoro tarzı) oturumları takip etmeni, koçunun sana atadığı günlük ' +
      'görevleri tamamlamanı, çözemediğin soruları fotoğraflayıp koçuna göndermeni, özel derslerini ' +
      'görmeni ve ilerlemeni (seri, XP, istatistikler) takip etmeni sağlayan bir koçluk ve çalışma ' +
      'takip aracıdır. Uygulama tıbbi, psikolojik veya profesyonel eğitim danışmanlığı hizmeti ' +
      'vermez; koçunla aranızdaki eğitim ilişkisini teknik olarak kolaylaştırır.',
  },
  {
    heading: '3. Hesap Oluşturma ve Güvenlik',
    body:
      'Hesap oluştururken verdiğin bilgilerin doğru olduğunu kabul edersin. Parolanın gizliliğinden ' +
      've hesabın altında gerçekleşen tüm işlemlerden sen sorumlusun. Hesabınla ilgili yetkisiz bir ' +
      `erişim şüphesi durumunda derhal ${SUPPORT_EMAIL} adresinden bize bildir.`,
  },
  {
    heading: '4. Kullanım Kuralları',
    body:
      'Uygulamayı yalnızca kendi eğitim amaçların için, yasalara ve genel ahlaka uygun şekilde ' +
      'kullanmayı kabul edersin. "Hızlı Soru Sor" özelliğiyle paylaştığın fotoğraf, çizim ve notların ' +
      'yalnızca ders içeriğiyle ilgili olmalı; uygunsuz, zararlı, taciz edici veya başkalarının ' +
      'haklarını ihlal eden içerik paylaşmak yasaktır. Başka bir kullanıcının hesabını izinsiz ' +
      'kullanamaz, Uygulamanın işleyişine müdahale edemez veya tersine mühendislik yapamazsın. Bu ' +
      'kurallara uyulmaması hesabının askıya alınmasına veya kapatılmasına yol açabilir.',
  },
  {
    heading: '5. Fikri Mülkiyet',
    body:
      `Uygulama içindeki tasarım, logo, maskot, metin ve yazılımın tüm hakları ${APP_NAME}'e aittir. ` +
      'Görevlerin, sorularin ve notların gibi kendi oluşturduğun içerik sana aittir; bunu Uygulamanın ' +
      'işleyişi için (örneğin koçuna iletmek amacıyla) kullanmamıza izin vermiş olursun.',
  },
  {
    heading: '6. Ücretlendirme',
    body:
      'Uygulama şu anda ücretsiz olarak sunulmaktadır. İleride yeni ücretli özellikler eklenirse, ' +
      'bu şartlar güncellenir ve hangi özelliklerin ücretli olduğu Uygulama içinde açıkça belirtilir; ' +
      'onayın olmadan mevcut ücretsiz özelliklerden ücret alınmaz.',
  },
  {
    heading: '7. Hizmetin Değiştirilmesi ve Sonlandırılması',
    body:
      'Uygulamanın özelliklerini geliştirmek, değiştirmek veya bazı özellikleri kaldırmak hakkını ' +
      'saklı tutarız. Hesabını istediğin zaman Ayarlar sayfasından veya bizimle iletişime geçerek ' +
      'kapatabilirsin; kurallara aykırı kullanım tespit edilirse hesabını askıya alabilir veya ' +
      'kapatabiliriz.',
  },
  {
    heading: '8. Sorumluluğun Sınırlandırılması',
    body:
      'Uygulama "olduğu gibi" sunulur. Kesintisiz veya hatasız çalışacağını garanti etmeyiz. ' +
      'Uygulamanın kullanımından doğabilecek dolaylı zararlardan, yasaların izin verdiği azami ölçüde, ' +
      'sorumlu tutulamayız.',
  },
  {
    heading: '9. Şartlarda Değişiklik',
    body:
      'Bu Kullanım Şartlarını zaman zaman güncelleyebiliriz. Önemli değişikliklerde Uygulama içinden ' +
      'bilgilendirme yaparız; güncel sürüm her zaman bu sayfada yer alır.',
  },
  {
    heading: '10. Uygulanacak Hukuk',
    body:
      'Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir. Doğabilecek uyuşmazlıklarda Türkiye ' +
      'mahkemeleri ve icra daireleri yetkilidir.',
  },
  {
    heading: '11. İletişim',
    body:
      `Kullanım Şartlarıyla ilgili sorularının için ${SUPPORT_EMAIL} adresinden bize ulaşabilirsin.`,
  },
];

export default function Terms() {
  return (
    <LegalScreen
      title="Kullanım Şartları"
      subtitle="Uygulamayı kullanırken kabul ettiğin kurallar"
      updatedAt="15 Eylül 2026"
      sections={SECTIONS}
    />
  );
}
