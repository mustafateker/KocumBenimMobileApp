# Koçum Benim — Modern Tasarım Sistemi & Stil Rehberi (design-style.md)

> **Sürüm:** 2.0 (Modern Soft-EdTech Redesign)  
> **Tasarım Felsefesi:** Ferah, sıcak, organik, modern ve yüksek motivasyonlu öğrenci deneyimi.  
> **Odak:** Nefes alan tipografi, akıcı köşe kavisleri (organic squircle radii), katmanlı derinlik ve kusursuz Türkçe karakter desteği.

---

## 1. Tasarım Vizyonu & Değişim Manifestosu

### Mevcut Durumun Analizi ve Sorunlar
1. **Sert ve Kutu Görünümlü Köşe Yuvarlamaları (Radius Düşüklüğü):**
   * Mevcut sistemde kartlar ve bloklar `8px - 16px` gibi düşük kavislerle sınırlı kalmış. Bu durum modern iOS 18 / Material 3 ve önde gelen eğitim uygulamalarında (Duolingo, Opal, Headspace, Notion) görülen samimi, yumuşak ve akıcı havayı engellemekte; uygulamayı köşeli ve eski göstermektedir.
2. **Sıkışık ve "Dip Dibe" Tipografi (Poppins Sorunu):**
   * Mevcut `Poppins` font ailesi yüksek harf genişliğine sahip olmasına rağmen, dar satır aralıkları (`lineHeight: 18-22px`) ve sıfır harf aralığı (letter-spacing) ile kullanıldığında metinler birbirine giriyor.
   * Türkçe'ye özgü noktalı ve kuyruklu harfler (`ğ, ş, ı, İ, ç, ö, ü`) satır aralarında basık kalmakta, okunabilirlik düşmektedir.
3. **Monokrom ve Donuk Renk Hiyerarşisi:**
   * Kartların solundaki 3px renkli şerit klişesi ve tüm durum renklerinin (mavi, yeşil, pembe) tek bir mor-bej tona zorlanması arayüzdeki kontrastı ve canlılığı öldürmüş durumda.

### 2.0 Tasarım İlkeleri
* **Breathe (Nefes Al):** Ekrandaki her öğe çevresiyle rahat nefes almalı. Dar kutulardan, geniş iç dolgulu (`padding: 18-20px`) ferah yüzeylere geçiş.
* **Tactile & Soft (Dokunulası & Yumuşak):** Geniş ve eşmerkezli köşe kavisleri (`20px - 34px`) ile dokunmatik hissi güçlendir, yapay ve sert kutuları kır.
* **Readable & Intentional Typography:** Türkçe diyakritikleri kusursuz işleyen, satır aralıkları genişletilmiş, modern bir neo-grotesk font ailesi.
* **Premium Restraint:** Gereksiz emoji, süs ve sert çizgilerden kaçın; kaliteyi tipografi, dengeli boşluklar ve rafine renklerle göster.

---

## 2. Tipografi Sistemi (Typography & Modern Font)

### Önerilen Yeni Font: **Plus Jakarta Sans**
*Modern mobil arayüzler ve dijital ürünler için özel olarak tasarlanmış geometrik neo-grotesk font ailesi.*

```
Neden Plus Jakarta Sans?
├── Kusursuz Türkçe Desteği: 'ğ, ş, ı, İ, ç, ö, ü' harfleri dikeyde taşmaz, dengelidir.
├── Yüksek X-Height & Açık Boşluklar (Open Counters): Küçük boyutlarda (11-13px) bile birbirine yapışmaz, son derece net okunur.
├── Modern & Premium Duruş: Duolingo ve Linear gibi çağdaş arayüzlerin tercih ettiği temiz ve dinamik karakter yapısı.
└── Alternatif: 'Inter' (Daha nötr ve kurumsal bir deneyim istenirse).
```

### Tipografi Skalası & Ritim (Type Scale)

Metinlerin "dip dibe" görünmesini engelleyen temel kural: **Genişletilmiş Satır Yüksekliği (Line-Height ~1.4 - 1.55x)** ve **Pozitif Küçük Harf Boşluğu (Letter-Spacing)**.

| Varyant | Font Weight | Boyut (px) | Satır Yüksekliği | Harf Boşluğu (Tracking) | Kullanım Alanı |
|---|---|---|---|---|---|
| **Display / Hero** | `Bold (700)` | `32px` | `42px` (1.31x) | `-0.6px` | Ana tebrikler, büyük sayaçlar, karşılama |
| **Title** | `Bold (700)` | `24px` | `32px` (1.33x) | `-0.4px` | Ekran başlıkları, modal başlıkları |
| **Section** | `SemiBold (600)` | `18px` | `26px` (1.44x) | `-0.2px` | Kart grup başlıkları, bölüm adları |
| **Body** | `Regular (400)` | `15px` | `24px` (1.60x) | `0px` | Genel açıklamalar, soru notları, mesajlar |
| **Body Strong** | `SemiBold (600)` | `15px` | `24px` (1.60x) | `0px` | Vurgulu açıklamalar, liste başlıkları |
| **Small** | `Medium (500)` | `13px` | `20px` (1.53x) | `+0.15px` | İkincil bilgiler, meta etiketler, koç notları |
| **Small Strong** | `SemiBold (600)` | `13px` | `20px` (1.53x) | `+0.15px` | Buton metinleri, rozet içi yazılar |
| **Tiny** | `SemiBold (600)` | `11px` | `16px` (1.45x) | `+0.3px` | Zaman damgası, sayaç alt etiketleri |
| **Timer / Stat** | `Bold (700)` | `48px` | `56px` (1.16x) | `-1.0px` | Pomodoro süresi, soru sayıları |

---

## 3. Köşe Yuvarlama & Geometri Sistemi (Radius)

Uygulamanın daha modern, dost canlısı ve organik hissettirmesi için radius skalası hissedilir şekilde genişletilmiştir.

```
       ESKİ (8-16px)                  YENİ (Organik Squircle Skalası)
  ┌──────────────────────┐        ╭──────────────────────────────╮
  │                      │   ─>   │                              │
  │   Sert, Kutu Hissi   │        │     Yumuşak, Modern Kavis    │
  └──────────────────────┘        ╰──────────────────────────────╯
```

### Yeni Radius Standartları

| Token | Değer | Karşılık Gelen Bileşenler | Tasarım Nedeni |
|---|---|---|---|
| **`Radius.xs`** | `8px` | Mini bildirim noktaları, çizelge içi barlar | Detay bloklarında mikro kavis |
| **`Radius.sm`** | `12px` | Küçük rozetler, etiketler (Pill), iç ikon kutucukları | Küçük öğelerin göze batmayan kavisleri |
| **`Radius.md`** | `18px` | Metin girişleri (Input), açılır menüler, küçük kartlar | Kullanıcının dokunduğu form bileşenlerinde yumuşak his |
| **`Radius.lg`** | `24px` | **Standart Kartlar**, Soru Kartı, İstatistik Kutuları | Modern arayüzün temel taşı, ferah yüzey hissi |
| **`Radius.xl`** | `32px` | **Hero Kartlar**, Büyük İlerleme Blokları, Pomodoro Paneli | Vurgu alanlarında güçlü, çağdaş kimlik |
| **`Radius.sheet`** | `36px` | **Alt Çekmeceler (Bottom Sheets)**, Modallar | Üst köşelerde kusursuz, telefon kasasıyla uyumlu kavis |
| **`Radius.pill`** | `9999px` | **Ana Butonlar, Tab Geçişleri, Durum Hapları** | Tam yuvarlak oval kapsül formu (`pillRadius(height)`) |

> [!TIP]
> **Eşmerkezli Kavis Kuralı (Concentric Radius):**  
> Dış kartın radius'u `24px` ve iç dolgusu (padding) `16px` ise, içindeki fotoğraf veya öğenin radius'u `24 - 16 = 8px` olmalıdır. Bu kural geometrik uyumsuzlukları ve garip kenar boşluklarını engeller.

---

## 4. Renk Mimarisi & Atmosfer (Color Palette)

Uygulamanın özgün sıcak kimliği korunurken, donuklaştıran tek-renk filtreleri kaldırılmış; kontrast ve canlılık artırılmıştır.

### 4.1. Zemin ve Yüzeyler (Base Surfaces)
* **Ana Zemin (`bg`):** `#F8F6F4`  
  *Eski gri-pudra yerine temiz, ferah, sıcak doğal keten/kağıt tonu.*
* **Kart & Yüzey (`surface`):** `#FFFFFF`  
  *Kartlar saf temiz beyaz zemin üzerine oturarak ferahlık sağlar.*
* **İkincil / Seçili Yüzey (`surfaceHi`):** `#F3EEEA`  
  *Hafif sıcak kontrast alanları.*
* **Kenarlık (`border`):** `rgba(58, 57, 103, 0.08)`  
  *Gözü yormayan, saç teli inceliğinde (hairline) zarif sınır.*

### 4.2. Tipografi Renkleri (Text Hierarchy)
* **Birincil Metin (`text`):** `#2D2B52`  
  *Derin gece moru. Siyah kadar sert değil, ancak yüksek kontrastlı ve kusursuz okunabilir.*
* **İkincil Metin (`textDim`):** `#6B688D`  
  *Açıklamalar ve alt başlıklar için yumuşak mor-gri.*
* **Yardımcı / Pasif Metin (`textFaint`):** `#9C99B6`  
  *Zaman damgaları ve pasif ipuçları.*

### 4.3. Enerji & Durum Vurguları (Semantic Accents)
* **Marka Vurgusu (`primary / amber`):** `#3A3967` (Derin Karakter)
* **Enerji Turuncusu / Kayısı (`orange / detailAccent`):** `#FBAE75` (Yumuşak zemin: `rgba(251, 174, 117, 0.20)`)  
  *Orijinal sıcak, sakin kayısı/turuncu tonu; gözü yormayan sıcak aksiyon ve rozet vurguları.*
* **Başarı Zümrüdü (`green`):** `#10B981` (Yumuşak zemin: `#ECFDF5`)  
  *Doğru çözülen sorular, tamamlanan görevler, "Çözümü Gör" butonu.*
* **Odak & Ders İndigosu (`blue`):** `#4F46E5` (Yumuşak zemin: `#EEF2FF`)  
  *Özel dersler, planlı aktiviteler.*
* **Dikkat & Hata Kırmızı (`rose`):** `#F43F5E` (Yumuşak zemin: `#FFF1F2`)  
  *Yanlışlar, iptal edilenler, kritik uyarılar.*

---

## 5. Boşluk (Spacing) & Yüzey Derinliği

### Boşluk Skalası (Spacing Rhythm)
* `xs`: `4px` (İkon - metin arası mikro boşluk)
* `sm`: `8px` (Grup içi öğe mesafeleri)
* `md`: `12px` (Bileşen içi varsayılan boşluk)
* `lg`: `18px` *(16'dan 18'e yükseltildi)* — **Kart içi ideal iç dolgu (padding)**
* `xl`: `24px` — Bölümler arası nefes alma mesafesi
* `xxl`: `32px` — Büyük ekran geçişleri

### Modern Derinlik & Gölge (Layered Elevation)
Eski çamurlu tek-katman gölgeler yerine, nesneleri zeminden nazikçe ayıran modern ambient gölgeler:

```typescript
// Modern Kart Gölgesi (Yumuşak & Derin)
export const Elevation = {
  card: {
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  modal: {
    shadowColor: '#1A1836',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
};
```

---

## 6. Bileşen Bazlı Modernizasyon Şablonları

### 6.1. Kartlar (`Card`)
* **Önce:** 12px padding, 16px radius, solunda 3px kalın renkli dikey çizgi.
* **Sonra:** 
  * `Radius.lg` (`24px`).
  * `18px` iç dolgu (padding).
  * Sol dikey çizgi kaldırıldı; durum bilgisi kartın içinde zarif bir `Pill` ve ikon ile verilir.
  * Zemin saf beyaz (`#FFFFFF`), kenarlık çok hafif `rgba(58, 57, 103, 0.08)`.

### 6.2. Butonlar (`Button` & `PressScale`)
* **Önce:** 12px radius, sert basma efekti.
* **Sonra:**
  * Tam kapsül (`pillRadius`) veya `18px` kavis.
  * Dokunma animasyonunda yay esnekliği: `damping: 15, stiffness: 300` (daha tatmin edici dokunsal geri bildirim).
  * Yükseklik: Rahat dokunma hedefi için `48px - 52px`.

### 6.3. İstatistik & Özet Bileşenleri (Bento Box Mimarisi)
* Ana sayfadaki "Günün Çalışma Özeti" ve Raporlar sayfasındaki kutucuklar için **Bento Grid** yapısı.
* Her metrik kutusunda:
  * `20px` köşe kavisleri.
  * Üstte soft renkli ikon kabarcığı (`size: 38px`, `icon: 18px`).
  * İri ve net rakam (`20-24px SemiBold`), altında nefes alan küçük açıklama (`12px Medium`).

### 6.4. Sekmeler ve Seçiciler (`Segmented`)
* Kapsül şeklinde arka plan (`height: 44px`, `backgroundColor: '#EFEAE6'`).
* Aktif sekme: Beyaz zemin, yumuşak gölge (`shadowOpacity: 0.06`), `Radius.pill`.
* İkon ve metin arasında 6px rahat mesafe.

---

## 7. Uygulama ve Geçiş Adımları (Roadmap)

1. **Paket Yüklemesi:**
   * `@expo-google-fonts/plus-jakarta-sans` paketinin projeye eklenmesi.
2. **Tokens Dosyasının Güncellenmesi ([tokens.ts](file:///Users/mustafa/Desktop/cod/KocumBenimMobileApp/src/theme/tokens.ts)):**
   * `Font` objesinin `PlusJakartaSans_400Regular`, `_500Medium`, `_600SemiBold`, `_700Bold` olarak güncellenmesi.
   * `Type` skalasındaki `lineHeight` değerlerinin %20-25 oranında ferahlatılması ve `letterSpacing` tanımlanması.
   * `Radius` değerlerinin `sm: 12, md: 18, lg: 24, xl: 32` olarak güncellenmesi.
   * `Palette.bg` ve yüzey renklerinin modern keten/beyaz kontrastına çekilmesi.
3. **Temel Bileşenlerin Revizyonu ([ui.tsx](file:///Users/mustafa/Desktop/cod/KocumBenimMobileApp/src/components/ui.tsx)):**
   * `Card` bileşenindeki eski `borderLeftWidth: 3` mantığının temizlenip yeni yumuşak kavis ve gölgeye geçilmesi.
   * `Pill` ve `Input` bileşenlerinin yeni radius standartlarına bağlanması.
4. **Ekranların İncelenmesi:**
   * Ana Sayfa, Sorularım ([questions.tsx](file:///Users/mustafa/Desktop/cod/KocumBenimMobileApp/src/app/student/questions.tsx)), Raporlar ([stats.tsx](file:///Users/mustafa/Desktop/cod/KocumBenimMobileApp/src/app/stats.tsx)) ve Görevler sayfalarındaki dikey boşlukların ferahlatılması.
