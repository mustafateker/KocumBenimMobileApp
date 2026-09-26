# Doğrudan FCM bildirim kurulumu

Mobil uygulama Android'de `expo-notifications` ile native FCM tokenını alır ve
`POST /notifications/register-push` üzerinden backend'e gönderir. Backend,
Firebase Admin SDK ile bildirimi doğrudan FCM'e yollar. Expo Push Service bu
akışta kullanılmaz.

## 1. Android uygulamasını Firebase'e bağla

1. [Firebase Console](https://console.firebase.google.com) içindeki
   `kocum-benim-6c5b0` projesine paket adı
   **`com.triworkster.kocumbenimmobileapp`** olan bir Android uygulaması ekle.
2. Bu Android uygulamasına ait `google-services.json` dosyasını indirip mobil
   proje köküne koy. `app.json` dosyası bu konumu
   `./google-services.json` olarak kullanacak şekilde ayarlıdır.
3. Native uygulamayı yeniden derle:

   ```bash
   npx expo prebuild --platform android
   npx expo run:android
   ```

   `google-services.json` bir Firebase **Web** yapılandırması değildir. Web
   yapılandırmasındaki `apiKey`, `appId` ve benzeri alanlar bu dosyanın yerine
   kullanılamaz.

## 2. Backend Firebase Admin kimliğini ayarla

Firebase Console → Proje ayarları → Hizmet hesapları → **Yeni özel anahtar
oluştur** yoluyla Service Account JSON dosyasını indir. Bu gizli dosyayı repoya
ekleme.

Yerel `.env` örneği:

```dotenv
FIREBASE_PROJECT_ID=kocum-benim-6c5b0
FIREBASE_SERVICE_ACCOUNT_PATH=/mutlak/yol/firebase-service-account.json
```

Dosya yerine secret yöneticisinden tek satırlık JSON vermek için
`FIREBASE_SERVICE_ACCOUNT_JSON` kullanılabilir. `GOOGLE_APPLICATION_CREDENTIALS`
ile Application Default Credentials da desteklenir.

Backend bağımlılıklarını kurup uygulamayı yeniden başlat:

```bash
pip install -r requirements.txt
```

Firebase Admin uygulaması FastAPI başlangıcında bir kez başlatılır. Kimlik
bilgisi eksik veya hatalıysa backend başlangıçta hata vererek durur.

## 3. Doğrulama

1. Expo Go yerine development/release build'i fiziksel Android cihazda aç.
2. Bildirim iznini ver.
3. MongoDB `push_tokens` koleksiyonunda `fcmToken` alanlı kaydın oluştuğunu
   doğrula.
4. Öğretmen panelinden bir görev ata. Bildirime dokununca **Görevlerim**
   ekranının açıldığını doğrula.

Yönlendirme eşleşmeleri `src/lib/notification-route.ts` içindedir:

| Bildirim türü       | Açılan ekran      |
| ------------------- | ----------------- |
| `task_assigned`     | Görevlerim        |
| `question_answered` | Sorularım (liste) |
| `lesson_*`          | Özel Derslerim    |
| `streak_reminder`   | Ana Sayfa         |
| `announcement`      | Bildirimler       |

## Platform notları

- Expo SDK 57'de `getDevicePushTokenAsync()` Android'de FCM tokenı, iOS'ta APNs
  tokenı döndürür. Firebase Admin ham APNs tokenına gönderim yapmadığı için bu
  doğrudan FCM kurulumu şu anda Android ile sınırlıdır. iOS için uygulamaya
  Firebase Messaging native SDK'sı eklenerek bir FCM registration tokenı
  üretilmelidir.
- Expo Go'da Android remote push SDK 53'ten beri çalışmaz; development build
  gerekir.
- Android 13+ için kanal izin isteğinden önce oluşturulur. Kullanıcı izni
  reddederse `PUSH_PERMISSION_DENIED` hata kaydı oluşur.
