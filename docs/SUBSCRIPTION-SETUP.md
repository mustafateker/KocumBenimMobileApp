# KOCUM BENIM - ABONELIK VE REKLAM ENTEGRASYON KILAVUZU

Bu dokuman, Kocum Benim mobil uygulamasinda (`KocumBenimMobileApp`) kullanilan RevenueCat abonelik / paywall altyapisi ile Google AdMob gecis reklamlari sisteminin magazalar (App Store & Google Play) ve paneller uzerindeki eksiksiz kurulumunu aciklar.

---

## 1. Planlar, Fiyatlandirma ve Limit Kurallari

### Ucretsiz Plan (Free)
1. **Pomodoro Odak Reklami:** `src/app/focus.tsx` uzerindeki `SuccessScreen` ve `DiscardedScreen` cikislarinda (`onDone`) gecis reklami (Interstitial) tetiklenir. Reklam kapandiginda veya 30 dakikalik bekleme suresi aktifse `router.back()` calisir.
2. **Analiz ve Raporlar Ekrani Reklami:** `src/app/stats.tsx` sayfasina girildiginde kullanici ucretsiz plandaysa gecis reklami gosterilir (global 30 dakika periyot kuralina tabidir).
3. **Koc Analizi Kilitli:** `src/app/student/index.tsx` ana sayfasindaki "Bugunun Kocluk Analizi" ucretsiz kullaniciya kilitli gosterilir ve tiklandiginda RevenueCat Paywall acilir.
4. **Soru Sorma Kapali:** `src/app/student/questions.tsx` ve `src/app/annotate.tsx` ekranlarinda ucretsiz kullanici yeni soru gonderemez. Soru sorma butonuna tiklandiginda Paywall acilir. Gecmis cozulmus sorular salt-okunur listelenmeye devam eder.
5. **Yapay Zeka Gunluk 1 Hak:** Ucretsiz kullanicilar gunde yalnizca 1 kez yapay zeka servisi (`src/app/student/ai-coach.tsx`, `src/lib/ai-question-hint.ts`, `src/lib/mock-exams.ts`) kullanabilir. 1 hak doldugunda Paywall tetiklenir.

### Kocum Pro Plani (Ucretli)
1. **Fiyatlandirma:**
   - Aylik Paket: 149,00 TL / ay (`kocum_pro_monthly`)
   - Yillik Paket (%30 Indirimli): 1.249,99 TL / yil (~104,17 TL/ay - `kocum_pro_yearly`)
   - Entitlement ID: `pro`
2. **Reklamsiz Deneyim:** Tum gecis reklamlari otomatik devredisi kalir, AdMob on yukleme yapilmaz.
3. **Sinirsiz Yapay Zeka:** Kocum AI sohbeti, soru cozumu ipuclari ve deneme analizi sinirsizdir.
4. **Gorsel Soru Cozumu Aylik 60 Soru:** `PRO_MONTHLY_QUESTION_LIMIT = 60` olarak belirlenmistir. Kalan soru hakki Sorularim ekraninda goruntulenir ve limit doldugunda kullanici bilgilendirilir.
5. **Geri Yukleme (Restore):** Ayarlar sayfasinda "Satin Alimlari Geri Yukle" butonu ile magaza makbuzu otomatik dogrulanir.

---

## 2. RevenueCat Yapilandirmasi

### 2.1. Entitlement Olusturma
- RevenueCat Dashboard -> Project -> Entitlements sekmesine gidin.
- Yeni bir Entitlement ekleyin:
  - **Identifier:** `pro`
  - **Description:** Kocum Pro Aboneligi

### 2.2. Offering ve Paketler (Packages)
- Project -> Offerings sekmesine gidin.
- `default` adli ana Offering icerisine su 2 paketi ekleyin:
  - **Package Identifier:** `$rc_monthly`
    - Bagli Urun: `kocum_pro_monthly`
  - **Package Identifier:** `$rc_annual`
    - Bagli Urun: `kocum_pro_yearly`

### 2.3. Paywall Tasarimi
- RevenueCat Dashboard -> Paywalls sekmesinden varsayilan bir Paywall sablonu secin.
- Baslik: "Kocum Pro ile Hedeflerine Ulas"
- Maddeler:
  - Sinirsiz Yapay Zeka Kocu ve Calisma Onerileri
  - Ayda 60 Adet Gorsel Soru Cozumu
  - Tamamen Reklamsiz Odak Deneyimi
  - Tum Konu Analizleri ve Deneme Raporlari
- Renkler: Marka ana rengi (`#FB6F92`) ve arka plan tonlariyla uyumlu hale getirin.
- Emojisiz, sade ve profesyonel bir metin dili kullanin.

### 2.4. API Anahtarlari
- RevenueCat Dashboard -> Project Settings -> API Keys:
  - iOS icin Public Apple API Key alin: `appl_hkLUzJpdoZjWzDXJQWOxbQhvIDx`
  - Android icin Public Google API Key alin: `goog_QayxUaDRCrSjeysaKvqtVqQBurB`
- Ortam degiskenlerine ekleyin:
  - `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_QayxUaDRCrSjeysaKvqtVqQBurB`
  - `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_hkLUzJpdoZjWzDXJQWOxbQhvIDx`

---

## 3. Apple App Store Connect Yapilandirmasi

1. App Store Connect -> Uygulamaniz -> **Abonelikler (Subscriptions)** bolumune gidin.
2. Yeni bir Abonelik Grubu olusturun:
   - **Grup Adi:** `Kocum Pro Subscriptions`
3. Iki adet otomatik yenilenen abonelik urunu ekleyin:
   - **Urun 1 (Aylik):**
     - Referans Adi: `Kocum Pro Aylik`
     - Urun Kimligi (Product ID): `kocum_pro_monthly`
     - Fiyat: 149,00 TRY
     - Sure: 1 Ay
   - **Urun 2 (Yillik):**
     - Referans Adi: `Kocum Pro Yillik`
     - Urun Kimligi (Product ID): `kocum_pro_yearly`
     - Fiyat: 1.249,99 TRY
     - Sure: 1 Yil
4. **App Store Server Notifications V2:**
   - URL: `https://api.revenuecat.com/v1/webhooks/apple`
   - In-App Purchase Key (Shared Secret veya StoreKit private key .p8) RevenueCat panelindeki Apple ayarlari bolumune yuklenmelidir.

---

## 4. Google Play Console Yapilandirmasi

1. Google Play Console -> Uygulamaniz -> **Abonelikler (Subscriptions)** bolumune gidin.
2. Abonelik urunlerini olusturun:
   - **Urun ID:** `kocum_pro_monthly`
     - Temel Plan: Otomatik yenilenen, 1 Aylik faturalandirma donemi.
     - Fiyat: 149,00 TRY
   - **Urun ID:** `kocum_pro_yearly`
     - Temel Plan: Otomatik yenilenen, 1 Yillik faturalandirma donemi.
     - Fiyat: 1.249,99 TRY
3. **Google Play Real-Time Developer Notifications (RTDN):**
   - Google Cloud Pub/Sub topigi olusturun.
   - RevenueCat belgelerindeki `service-account` JSON anahtarini RevenueCat Google Play ayarlari altina ekleyin.
   - Pub/Sub bildirimlerini RevenueCat'e yonlendirin.

---

## 5. Google AdMob Reklam Altyapisi

### 5.1. Test ve Canli Reklam Kimlikleri
- **Test App ID (Android):** `ca-app-pub-3940256099942544~3347511713`
- **Test App ID (iOS):** `ca-app-pub-3940256099942544~1458783705`
- **Test Interstitial Unit (Android):** `ca-app-pub-3940256099942544/1033173712`
- **Test Interstitial Unit (iOS):** `ca-app-pub-3940256099942544/4411468910`

- **Canli AdMob App ID (Android):** `ca-app-pub-4455914992803909~7764190271`
- **Canli AdMob App ID (iOS):** `ca-app-pub-4455914992803909~6345051417`
- **Canli Interstitial Unit (Android):** `ca-app-pub-4455914992803909/1821598458`
- **Canli Interstitial Unit (iOS):** `ca-app-pub-4455914992803909/9344865257`

Canli reklam birimleri `.env.local` ve `.env.production` dosyasina atanir:
- `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-4455914992803909/1821598458`
- `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=ca-app-pub-4455914992803909/9344865257`

### 5.2. 30 Dakikalik Global Reklam Soguma Suresi (Cooldown)
- Uygulama icerisindeki tum gecis reklamlari merkezi `src/lib/ads.ts` dosyasindaki `showInterstitialIfEligible` fonksiyonu uzerinden gosterilir.
- Son reklam gosterim zamani `AsyncStorage` uzerinde `kocumbenim.ads.lastShownAt` anahtariyla kalici saklanir.
- Kullanici uygulamayi kapatip acsa dahi 30 dakika dolmadan yeni bir gecis reklami gosterilmez.
- Pro kullanicilarda reklam cagrilari aninda atlanir ve sureci duraklatmaz.

---

## 6. Sunucu / Backend Webhook Onerisi (Opsiyonel)

RevenueCat, kullanicinin abonelik durumu her degistiginde (yeni satin alma, yenileme, iptal, suresi dolma) webhook gonderebilir.

Onerilen Entegrasyon:
1. RevenueCat Dashboard -> Project Settings -> Webhooks bolumune sunucu uc noktanizi ekleyin:
   `POST https://api.kocumbenim.com/api/webhooks/revenuecat`
2. Olay Turleri:
   - `INITIAL_PURCHASE` -> Ogrencinin veritabanindaki `is_pro` degerini `true` yapin.
   - `RENEWAL` -> Abonelik gecerlilik tarihini uzatin.
   - `EXPIRATION` -> `is_pro` degerini `false` yapin.
   - `CANCELLATION` -> Donem sonuna kadar Pro haklarini koruyun, iptal nedenini kaydedin.
3. Webhook basligindaki `Authorization: Bearer <WEBHOOK_SECRET>` token'i ile gelen istekleri dogrulayin.
