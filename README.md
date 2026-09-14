# Koçum Benim

Ortaöğretim öğrencileri için koçluk ve takip sistemi. Öğrenci odaklanır, görevlerini
bitirir, XP ve coin kazanır; koç panelden süreci yönetir; veli çocuğunun ilerlemesini
görür. Tek bir Expo uygulaması içinde üç rol.

## Hızlı başlangıç

```bash
npm install
npx expo start        # sonra a (Android) / i (iOS) / w (web)
```

İlk açılışta örnek veri kurulur. Demo girişleri:

| Rol | Kişi | Kod |
|---|---|---|
| Öğrenci | Deniz Yılmaz | `1111` |
| Öğrenci | Ege Demir | `2222` |
| Öğrenci | Mert Kaya | `3333` |
| Öğretmen | Bahar Hoca | `1234` |
| Veli | Ayşe Yılmaz | `9999` |

Örnek verileri temizlemek için `resetDemoData` (`src/db/seed.ts`) kullanılabilir.

## Ekranlar

**Öğrenci** (`src/app/student/`)
- **Üs** — dairesel odak zamanlayıcı, günlük görev kartları, seri ve coin göstergesi,
  oyun odası kilidinin ilerlemesi
- **Sorular** — "Şipşak Soru ": soruyu fotoğrafla, üzerine çiz, hocaya yolla
- **Oyun** — günlük odak hedefi tutunca açılan zeka molası (2048, Sudoku, Hafıza)
- **Market** — kazanılan coin ile koçun belirlediği ödülleri alma
- **Ben** — RPG tarzı seviye/karakter kartı, haftalık grafik, en verimli saat analizi,
  takma adlarla liderlik tablosu

**Öğretmen** (`src/app/teacher/`)
- **Öğrenciler** — kim şu an çalışıyor, haftalık hedefin yüzde kaçı tamam
- **Gelen Kutusu** — gelen sorular; "derste çözülecek" etiketi veya anında cevap
- **Program** — 14 günlük pencerede görev atama, taşıma, silme
- **Ödüller** — market içeriğini yönetme, satın almaları onaylama
- **Öğrenci detayı** — istatistikler + tek dokunuşla veli raporu (PDF veya WhatsApp metni)

**Veli** (`src/app/parent/`) — çocuğunun haftalık özeti, salt görüntüleme.

## Mimari

```
src/
  app/          expo-router rotaları (student / teacher / parent + login, annotate, game)
  components/   ortak arayüz parçaları (kart, buton, grafik, kanvas, tab bar)
  db/           SQLite şeması, migration, örnek veri ve tüm sorgular (repo.ts)
  features/     oyunlar — saf mantık ayrı dosyada, görünümden bağımsız test edilebilir
  lib/          oturum, tarih, oyunlaştırma kuralları, zamanlayıcı, veli raporu
  theme/        renk paleti, tipografi, aralıklar
```

Ekranlar SQL yazmaz; her şey `src/db/repo.ts` üzerinden geçer. Oyunlaştırma kuralları
(XP, coin, seri, oyun kilidi) tek yerde: `src/lib/gamification.ts`.

## Veri nerede duruyor

Tüm veri cihazdaki **SQLite** dosyasında (`expo-sqlite`). Bu, uygulamanın internetsiz
çalışması demek — ama aynı zamanda **öğretmen paneli ile öğrenci uygulamasının veriyi
ancak aynı cihazdaysa paylaştığı** anlamına gelir. Gerçek kullanımda öğrencilerin kendi
telefonları olacağı için bir sunucu katmanı gerekir; `repo.ts` bunun için tek giriş
noktası olacak şekilde yazıldı: fonksiyon gövdelerini ağ çağrılarıyla değiştirmek
ekranlara dokunmadan mümkün.

## Testler

Oyun mantığı saf fonksiyonlar hâlinde ayrıldığı için doğrudan Node ile çalıştırılabilir:

```bash
npx tsc src/features/games/logic-2048.ts  --ignoreConfig --outDir /tmp/t --module commonjs --target es2020
npx tsc src/features/games/logic-sudoku.ts --ignoreConfig --outDir /tmp/t --module commonjs --target es2020
```

Sudoku üreteci her bulmacanın **tek çözümlü** olduğunu doğrulayarak hücre siler.

## Doğrulama

```bash
npx tsc --noEmit    # tip kontrolü
npx expo lint       # React Compiler kuralları dahil
```

Proje `reactCompiler: true` ile derleniyor; lint bu yüzden shared value mutasyonu ve
render sırasında ref erişimi gibi konularda katı davranıyor.
