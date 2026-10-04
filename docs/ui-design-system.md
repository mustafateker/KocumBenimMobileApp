# Koçum Benim arayüz sistemi

## Tasarım yönü

Koçum Benim sakin, destekleyici ve güven veren bir eğitim koçudur. Arayüz
çocuk dostu olabilir; fakat oyuncak, yarışma ekranı veya kurumsal panel gibi
görünmemelidir. Uzun odak ve okuma oturumlarında içerik her zaman dekorasyonun
önünde gelir.

## Renk kullanımı

- Ana zemin `#F5EFF1`; kart, modal ve container yüzeyleri sakin `#FFFBFC`
  kullanır.
- `#3A3967` metni, seçili durumu, ana aksiyonu ve yüksek kontrastı taşır.
- `#FBAE75` ikon kabarcıkları, küçük kontroller ve sınırlı enerji vurguları içindir.
- `#FDCEDF` geniş yüzeyleri doldurmaz; seçili alanlarda, organik arka plan
  detaylarında ve ikincil vurgularda düşük yoğunlukla kullanılır.
- Ana sayfa düz `#F5EFF1` zemin kullanır; pembe organik arka plan, halka izi
  veya seçili kontrol dolgusu içermez.
- Başarı, hata ve uyarı yalnızca ayrı renklerle değil ikon ve açık metinle anlatılır.
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
- Kartlar açık nötr yüzey, 1 px mor saydam kenarlık ve 16 px köşe yarıçapı kullanır.
- Görev kartları tamamlanma durumunda da nötr kalır; durum dolgu rengi yerine
  onay ikonu, belirgin kenarlık ve ilerleme bilgisiyle anlatılır.
- Renkli gradyan, 3D alt şerit ve dekoratif parıltı kullanılmaz.
- Dokunma alanları en az 44–48 px olmalıdır.
- Durum yalnızca renkle anlatılmaz; ikon ve metin etiketi de bulunur.
- Alt gezinmede bütün aktif sekmeler aynı marka rengini kullanır.
- Sistem uyarıları yerine açık yüzeyli, turuncu ikonlu ve mor aksiyonlu ortak
  `AppDialog` bileşeni kullanılır.

## Arka plan ve hareket

- Varsayılan zemin düzdür. Desenli ekranlarda yalnızca düşük kontrastlı,
  tek renkli organik şekiller kullanılabilir.
- Animasyon yalnızca dokunma geri bildirimi, ilerleme veya durum değişimini
  açıklamak için kullanılır.
- Odak modunda ekran rengi durumlar arasında değişmez; çalışma sırasında
  dikkat çekecek konfeti veya sürekli güçlü animasyon bulunmaz.
