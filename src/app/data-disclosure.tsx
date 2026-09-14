import { LegalScreen, type LegalSection } from '@/components/legal-screen';
import { APP_NAME, APP_OWNER, SUPPORT_EMAIL } from '@/lib/legal-constants';

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Veri Sorumlusunun Kimliği',
    body:
      `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerin ` +
      `${APP_OWNER} ("Veri Sorumlusu") tarafından aşağıda açıklanan kapsamda işlenmektedir. ` +
      `Veri Sorumlusuna ${SUPPORT_EMAIL} adresinden ulaşabilirsin.`,
  },
  {
    heading: '2. Kişisel Verilerin Hangi Amaçla İşleneceği',
    body:
      `${APP_NAME} üzerinden topladığımız kişisel veriler; hesabının oluşturulması ve ` +
      'yönetilmesi, sana koçluk hizmeti verilebilmesi, günlük görev ve odak takibinin yapılması, ' +
      '"Hızlı Soru Sor" özelliğiyle gönderdiğin soruların koçuna iletilmesi, ilerleme ' +
      'istatistiklerinin hesaplanması, onay verdiysen veli e-postana rapor gönderilmesi ve ' +
      'yasal yükümlülüklerimizin yerine getirilmesi amaçlarıyla işlenmektedir.',
  },
  {
    heading: '3. İşlenen Kişisel Veriler',
    body:
      'Kimlik ve iletişim verileri (ad, soyad, takma ad, e-posta, veli e-postası), eğitim ' +
      'verileri (sınıf seviyesi, hedef okul/bölüm, çalışılan konular, çalışma saatleri), ' +
      'kullanım verileri (odak oturumları, görev tamamlama durumu, seri ve XP puanları), ' +
      'görsel veriler (soru fotoğrafları ve üzerlerine eklenen çizim/notlar) ve işlem ' +
      'güvenliği verileri (şifrelenmiş parola, bildirim push token\'ı, temel cihaz bilgisi) ' +
      'işlenmektedir.',
  },
  {
    heading: '4. Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği',
    body:
      'Görevlerin, sorularin ve ilerleme verilerin, Uygulamanın temel işlevi gereği sana ' +
      'koçluk yapan öğretmenle paylaşılır. Veli e-postası eklediysen ilerleme özetleri o ' +
      'adrese iletilebilir. Verilerin, Uygulamayı barındıran ve çalıştıran sunucu/altyapı ' +
      'hizmet sağlayıcıları dışında ticari amaçla üçüncü kişilerle paylaşılmaz; yalnızca ' +
      'yasal olarak zorunlu olduğumuz hallerde yetkili kamu kurum ve kuruluşlarına ' +
      'aktarılabilir.',
  },
  {
    heading: '5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi',
    body:
      'Kişisel verilerin, Uygulamayı kullanman sırasında doğrudan senin tarafından girilen ' +
      'bilgiler (kayıt formu, İlk Kurulum sihirbazı, görev ve soru gönderimleri) ile elektronik ' +
      'ortamda otomatik yollarla toplanmaktadır. Bu veriler, KVKK\'nın 5. maddesinde yer alan ' +
      '"bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması" ve "veri ' +
      'sorumlusunun meşru menfaati için veri işlenmesinin zorunlu olması" hukuki sebeplerine ' +
      'dayanılarak işlenmektedir.',
  },
  {
    heading: '6. KVKK Madde 11 Kapsamındaki Haklarınız',
    body:
      'KVKK\'nın 11. maddesi uyarınca; kişisel verinin işlenip işlenmediğini öğrenme, işlenmişse ' +
      'buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını ' +
      'öğrenme, yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme, eksik ' +
      'veya yanlış işlenmişse düzeltilmesini isteme, işlenmesini gerektiren sebeplerin ortadan ' +
      'kalkması hâlinde silinmesini veya yok edilmesini isteme, düzeltme/silme işlemlerinin ' +
      'verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, işlenen verilerin münhasıran ' +
      'otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhine bir sonucun ortaya ' +
      'çıkmasına itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğraman hâlinde zararın ' +
      'giderilmesini talep etme haklarına sahipsin.',
  },
  {
    heading: '7. Başvuru Yöntemi',
    body:
      `Yukarıdaki haklarını kullanmak için talebini ${SUPPORT_EMAIL} adresine, hesabına kayıtlı ` +
      'e-posta adresinden yazılı olarak iletebilirsin. Başvurun, KVKK\'da öngörülen süre ' +
      '(en geç 30 gün) içinde ücretsiz olarak sonuçlandırılır.',
  },
];

export default function DataDisclosure() {
  return (
    <LegalScreen
      title="Aydınlatma Metni"
      subtitle="KVKK kapsamında kişisel veri işleme bilgilendirmesi"
      updatedAt="15 Eylül 2026"
      sections={SECTIONS}
    />
  );
}
