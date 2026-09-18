# Telefona bildirim gitmesi için gereken kurulum

Uygulama tarafı hazır: izin isteniyor, Android kanalı açılıyor, Expo push token
alınıp backend'e (`POST /notifications/register-push`) gönderiliyor, gelen
bildirime dokunulunca ilgili ekrana gidiliyor. Backend de zaten görev
atandığında `https://exp.host/--/api/v2/push/send` adresine istek atıyor
(`app-manager-backend/modules/notifications/service.py`).

Eksik olan tek şey **kimlik bilgileri**. Bunlar olmadan `getExpoPushTokenAsync()`
token üretemez, backend'in gönderecek adresi olmaz ve telefona hiçbir şey düşmez.
Uygulama bu durumu artık sessizce yutmuyor: sebep **Ayarlar → Hata Kayıtları**
ekranına `PUSH_NO_PROJECT_ID` / `PUSH_REGISTER_FAILED` koduyla yazılıyor.

## 1. EAS projesi ve projectId

```bash
npm install -g eas-cli
eas login
eas init          # app.json içine expo.extra.eas.projectId yazar
```

`eas init` çalıştıramıyorsan projectId'yi elle de verebilirsin:

```jsonc
// app.json
{
  "expo": {
    "extra": { "eas": { "projectId": "<expo.dev panelindeki uuid>" } }
  }
}
```

Alternatif olarak `.env.local` içine `EXPO_PUBLIC_EAS_PROJECT_ID=<uuid>` yazmak
da yeterli — kod iki kaynağı da okuyor (`src/lib/push-notifications.ts`).

## 2. Android için FCM (Firebase)

Expo push servisi Android'e ancak FCM üzerinden ulaşabiliyor:

1. [Firebase Console](https://console.firebase.google.com)'da proje aç,
   paket adı **`com.crossborders.KocumBenimMobileApp`** olacak şekilde bir
   Android uygulaması ekle.
2. `google-services.json` dosyasını indir, proje köküne koy ve `app.json`'a
   tanıt:

   ```jsonc
   { "expo": { "android": { "googleServicesFile": "./google-services.json" } } }
   ```

3. Firebase → Proje ayarları → Hizmet hesapları → **yeni özel anahtar oluştur**
   (JSON). Bu dosyayı Expo'ya yükle:

   ```bash
   eas credentials          # Android > Push Notifications > FCM V1 service account key
   ```

4. Native tarafı yeniden üret ve derle:

   ```bash
   npx expo prebuild --platform android
   npx expo run:android
   ```

   > `android/` klasörü depoda duruyor; `prebuild` onu yeniden üretir. Elle
   > yapılmış bir düzenleme varsa önce yedekle.

## 3. Doğrulama

1. Uygulamayı aç, bildirim iznini ver.
2. Backend'de `push_tokens` koleksiyonunda `ExponentPushToken[...]` ile başlayan
   bir kayıt oluştuğunu gör.
3. Test gönderimi:

   ```bash
   curl -X POST https://exp.host/--/api/v2/push/send \
     -H "Content-Type: application/json" \
     -d '{"to":"ExponentPushToken[...]","title":"Test","body":"Deneme","data":{"type":"task_assigned"}}'
   ```

4. Gelen bildirime dokunduğunda **Görevlerim** ekranının açılması gerekir.
   Eşleşmelerin tamamı `src/lib/notification-route.ts` içinde:

   | Bildirim türü       | Açılan ekran          |
   | ------------------- | --------------------- |
   | `task_assigned`     | Görevlerim            |
   | `question_answered` | Sorularım (liste)     |
   | `lesson_*`          | Özel Derslerim        |
   | `streak_reminder`   | Ana Sayfa             |
   | `announcement`      | Bildirimler           |

## Notlar

- **Expo Go'da Android push çalışmaz** (SDK 53'ten beri). Test için
  `expo run:android` ile üretilen geliştirme derlemesi gerekir.
- Android 13+ bildirim izni kullanıcıdan ayrıca isteniyor; reddedilirse
  `PUSH_PERMISSION_DENIED` kaydı düşer.
