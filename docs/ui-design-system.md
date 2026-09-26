# Koçum Benim arayüz sistemi

## Tasarım yönü

Koçum Benim sakin, destekleyici ve güven veren bir eğitim koçudur. Arayüz
çocuk dostu olabilir; fakat oyuncak, yarışma ekranı veya kurumsal panel gibi
görünmemelidir. Uzun odak ve okuma oturumlarında içerik her zaman dekorasyonun
önünde gelir.

## Renk kullanımı

- Ana zemin sıcak kırık beyaz, kartlar beyazdır.
- Adaçayı yeşili markayı, seçili durumu ve birincil aksiyonu taşır.
- Mavi yalnızca bilgi, yeşil başarı, kayısı bekleme/seri ve kırmızı hata veya
  geri döndürülemez işlem anlamında kullanılır.
- Büyük kart yüzeyleri durum rengine boyanmaz. Renk ikon, ince sol kenar,
  ilerleme veya küçük rozetle sınırlandırılır.
- Aynı gezinme grubu içindeki öğelere ayrı dekoratif renk atanmaz.
- Metin ve aksiyon kontrastı WCAG AA seviyesinin altına düşürülmez.

Uygulamadaki tek kaynak `src/theme/tokens.ts` dosyasıdır. Bileşenlere doğrudan
hex renk eklenmemeli; semantik token kullanılmalıdır.

## Tipografi ve hiyerarşi

- Poppins Regular gövde, SemiBold bölüm/aksiyon, Bold ekran başlıkları içindir.
- Sayfa başlıkları 24 px ve ortalıdır; büyük tanıtım başlıkları 32 px ile sınırlıdır.
- ExtraBold yalnızca özel bir marka ihtiyacı varsa kullanılmalıdır.
- Bir ekranda tek ana başlık ve tek baskın aksiyon bulunmalıdır.
- Yardımcı metin daha açık renkle gösterilir; okunabilirlik için gövde metni
  13 px altına indirilmez.

## Bileşen ilkeleri

- Butonlar düz dolgulu, en az 46 px yüksekliğinde ve kapsül biçimindedir.
- Kartlar 1 px nötr kenarlık ve 16 px köşe yarıçapı kullanır.
- Renkli gradyan, 3D alt şerit ve dekoratif parıltı kullanılmaz.
- Dokunma alanları en az 44–48 px olmalıdır.
- Durum yalnızca renkle anlatılmaz; ikon ve metin etiketi de bulunur.
- Alt gezinmede bütün aktif sekmeler aynı marka rengini kullanır.

## Arka plan ve hareket

- Varsayılan zemin düzdür. Desenli ekranlarda yalnızca düşük kontrastlı,
  tek renkli organik şekiller kullanılabilir.
- Animasyon yalnızca dokunma geri bildirimi, ilerleme veya durum değişimini
  açıklamak için kullanılır.
- Odak modunda ekran rengi durumlar arasında değişmez; çalışma sırasında
  dikkat çekecek konfeti veya sürekli güçlü animasyon bulunmaz.
