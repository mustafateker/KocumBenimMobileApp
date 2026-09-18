import { LegalScreen, type LegalSection } from '@/components/legal-screen';
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/legal-constants';

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Giriş',
    body:
      `${APP_NAME} ("Uygulama"), ortaöğretim öğrencilerinin çalışmalarını takip etmelerine ` +
      've koçlarıyla iletişim kurmalarına yardımcı olan bir odaklanma ve koçluk uygulamasıdır. ' +
      'Bu Gizlilik Politikası, Uygulamayı kullanırken hangi kişisel verilerin toplandığını, bu ' +
      'verilerin nasıl kullanıldığını ve haklarını nasıl kullanabileceğini açıklar.',
  },
  {
    heading: '2. Topladığımız Veriler',
    body:
      'Hesap bilgileri: e-posta adresi, ad, soyad, takma ad, sınıf seviyesi ve parola (şifrelenmiş ' +
      'olarak saklanır). Hedef profili: kariyer hedefin, hedef lise/üniversite/bölüm, çalışmak ' +
      'istediğin matematik konuları, günlük çalışma süren ve motivasyon kaynakların (İlk Kurulum ' +
      'sırasında verdiğin cevaplar). Opsiyonel veli e-postası. Kullanım verileri: tamamladığın odak ' +
      'oturumları, günlük görevlerin, seri (streak) ve XP puanların, en verimli çalışma saatlerin. ' +
      'İçerik: "Hızlı Soru Sor" özelliğiyle çektiğin soru fotoğrafları ve üzerlerine eklediğin çizim/' +
      'notlar. Cihaz ve bildirim bilgisi: bildirim gönderebilmek için cihaz push token\'ı ve temel ' +
      'cihaz modeli bilgisi.',
  },
  {
    heading: '3. Verilerin Kullanım Amaçları',
    body:
      'Verilerini şu amaçlarla kullanırız: hesabını oluşturmak ve doğrulamak; odak oturumların, ' +
      'görevlerin ve sorularının koçuna iletilmesini sağlamak; ilerleme istatistiklerini ve seri/XP ' +
      'takibini hesaplamak; tercih ettiğin bildirimleri göndermek; onay verdiysen ilerleme raporlarını ' +
      'veli e-postana iletmek; Uygulamayı güvenli tutmak ve teknik sorunları gidermek.',
  },
  {
    heading: '4. Verilerin Paylaşımı',
    body:
      'Görevlerin, sorularin, odak geçmişin ve ilerleme istatistiklerin, sana koçluk yapan öğretmenin ' +
      'tarafından görülebilir — bu, Uygulamanın temel işlevidir. Veli e-postası eklediysen, ilerleme ' +
      'özetleri o adrese gönderilebilir. Verilerin, Uygulamayı çalıştırmamıza yardımcı olan sunucu ve ' +
      'altyapı sağlayıcıları dışında hiçbir üçüncü tarafla pazarlama amacıyla paylaşılmaz veya satılmaz. ' +
      'Yasal bir yükümlülük gerektirmedikçe verilerin yetkili makamlarla paylaşılmaz.',
  },
  {
    heading: '5. Veri Güvenliği',
    body:
      'Parolan şifrelenmiş olarak saklanır, tüm veri iletimi şifreli bağlantı üzerinden yapılır. ' +
      'Verilerine yalnızca yetkilendirilmiş sistemler ve senin koçun erişebilir. Buna rağmen internet ' +
      'üzerinden hiçbir aktarımın %100 güvenli olmadığını hatırlatırız.',
  },
  {
    heading: '6. Veri Saklama Süresi',
    body:
      'Verilerini, hesabın aktif olduğu sürece ve Uygulamanın sana hizmet verebilmesi için gerekli ' +
      'olduğu müddetçe saklarız. Hesabını sildiğinde tüm kişisel verilerin, Ayarlar sayfasındaki ' +
      'açıklamada belirtilen süre içinde kalıcı olarak silinir.',
  },
  {
    heading: '7. Çocukların Gizliliği',
    body:
      `${APP_NAME}, hedef kitlesi 12-18 yaş arası ortaöğretim öğrencileri olan bir uygulamadır. ` +
      'Reşit olmayan kullanıcılar için veli e-postası ekleme özelliği sunulur ki aileler çocuklarının ' +
      'ilerlemesinden haberdar olabilsin. Ebeveynler, çocuklarının hesabıyla ilgili bilgi almak ya da ' +
      `hesabın silinmesini talep etmek için ${SUPPORT_EMAIL} adresinden bizimle iletişime geçebilir.`,
  },
  {
    heading: '8. Haklarınız',
    body:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında; verilerinin işlenip ' +
      'işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına ' +
      'uygun kullanılıp kullanılmadığını öğrenme, verilerinin düzeltilmesini veya silinmesini isteme ' +
      've bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına ' +
      `sahipsin. Bu haklarını kullanmak için ${SUPPORT_EMAIL} adresine yazabilirsin. Ayrıntılı bilgi ` +
      'için Aydınlatma Metni sayfasına bakabilirsin.',
  },
  {
    heading: '9. Çerezler ve İzleme',
    body:
      'Uygulama, reklam veya pazarlama amaçlı izleme araçları ya da üçüncü taraf analitik/reklam ' +
      'SDK\'ları kullanmaz. Bildirim göndermek için yalnızca cihazının push token\'ı saklanır.',
  },
  {
    heading: '10. Politika Değişiklikleri',
    body:
      'Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde Uygulama içinden ' +
      'bilgilendirme yaparız. Güncel sürüm her zaman bu sayfada yer alır.',
  },
  {
    heading: '11. İletişim',
    body:
      `Gizlilikle ilgili sorularının için ${SUPPORT_EMAIL} adresinden bize ulaşabilirsin.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalScreen
      title="Gizlilik Politikası"
      subtitle="Verilerini nasıl topladığımızı ve kullandığımızı açıklar"
      updatedAt="15 Eylül 2026"
      sections={SECTIONS}
    />
  );
}
