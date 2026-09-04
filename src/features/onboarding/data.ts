import type { Ionicons } from '@expo/vector-icons';

import { Palette } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type StepKey =
  | 'welcome'
  | 'name'
  | 'grade'
  | 'goal'
  | 'career'
  | 'highSchool'
  | 'university'
  | 'department'
  | 'mathTopics'
  | 'dailyHours'
  | 'timeframe'
  | 'motivation'
  | 'summary';

/** Sihirbazin sabit sirasi. Bazi adimlar sinifa gore atlanir, bkz onboarding.tsx. */
export const ALL_STEPS: StepKey[] = [
  'welcome',
  'name',
  'grade',
  'goal',
  'career',
  'highSchool',
  'university',
  'department',
  'mathTopics',
  'dailyHours',
  'timeframe',
  'motivation',
  'summary',
];

export const STEP_META: Record<
  StepKey,
  { icon: IconName; color: string; title: string; subtitle: string }
> = {
  welcome: {
    icon: 'hand-left',
    color: Palette.purple,
    title: 'Hadi seni tanıyalım! 👋',
    subtitle: 'Bu yolculukta seni daha iyi tanımak istiyoruz.',
  },
  name: {
    icon: 'person',
    color: Palette.purple,
    title: 'Adın ne?',
    subtitle: 'Sana nasıl hitap etmemizi istersin?',
  },
  grade: {
    icon: 'school',
    color: Palette.green,
    title: 'Hangi sınıftasın?',
    subtitle: 'Sana uygun bir program oluşturabilmemiz için.',
  },
  goal: {
    icon: 'trophy',
    color: Palette.gold,
    title: 'En büyük hedefin ne?',
    subtitle: 'Bu hedef, seni motive edecek pusulan olacak.',
  },
  career: {
    icon: 'briefcase',
    color: Palette.blue,
    title: 'İlerde hangi mesleği seçmek istiyorsun?',
    subtitle: 'Hayalindeki mesleği seç ya da yazabilirsin.',
  },
  highSchool: {
    icon: 'business',
    color: Palette.orange,
    title: 'Hangi lisede okumak istiyorsun?',
    subtitle: 'Hedeflediğin lise seni bir adım öne taşır.',
  },
  university: {
    icon: 'library',
    color: Palette.purple,
    title: 'Hangi üniversitede okumak istiyorsun?',
    subtitle: 'Hayalindeki üniversiteyi seç ya da yaz.',
  },
  department: {
    icon: 'book',
    color: Palette.orange,
    title: 'Hangi bölümü hedefliyorsun?',
    subtitle: 'İlgilendiğin bölümü seç ya da yazabilirsin.',
  },
  mathTopics: {
    icon: 'calculator',
    color: Palette.purple,
    title: 'Matematikte seni en çok korkutan konular neler?',
    subtitle: 'Birlikte çalışacağımız konuları seçebilirsin.',
  },
  dailyHours: {
    icon: 'time',
    color: Palette.green,
    title: 'Günlük kaç saat çalışmayı planlıyorsun?',
    subtitle: 'Gerçekçi bir süre seçmek çok önemli!',
  },
  timeframe: {
    icon: 'calendar',
    color: Palette.orange,
    title: 'Hedeflerine ne kadar sürede ulaşmak istiyorsun?',
    subtitle: 'Sabırlı ol, istikrarlı ilerle!',
  },
  motivation: {
    icon: 'star',
    color: Palette.gold,
    title: 'Motivasyon kaynağın nedir?',
    subtitle: 'Seni motive eden şeyleri seçebilirsin.',
  },
  summary: {
    icon: 'checkmark-circle',
    color: Palette.purple,
    title: 'Hazırsın!',
    subtitle: 'Hedeflerine ulaşmak için harika bir yolculuğa çıkıyoruz.',
  },
};

export const GRADES = [
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
];

/** "Hangi lisede/universitede/bolumde" adimlari yalnizca ortaokul (5-8) icin sorulur. */
export const ORTAOKUL_GRADES = new Set(['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf']);

export const GOALS = [
  'Odak yeteneğimi geliştirmek istiyorum.',
  'Ders çalışma disiplini kazanmak istiyorum.',
  'Ders çalışıyorum ama işe yaramıyor, Koçum Benim ile bu döngüyü kırmak istiyorum.',
  'Matematikte daha iyi olmak istiyorum.',
  'Sınavlarda daha başarılı olmak istiyorum.',
  'Zamanımı daha iyi yönetmek istiyorum.',
  'Ertelemeyi bırakıp düzenli çalışmak istiyorum.',
  'Kendime olan güvenimi artırmak istiyorum.',
  'Hedeflediğim liseye/bölüme girmek istiyorum.',
  'Ailemi gururlandırmak istiyorum.',
];

export const CAREERS = [
  'Doktor',
  'Diş Hekimi',
  'Eczacı',
  'Veteriner Hekim',
  'Mühendis (Bilgisayar)',
  'Mühendis (Yazılım)',
  'Mühendis (Elektrik-Elektronik)',
  'Mühendis (Makine)',
  'Mühendis (İnşaat)',
  'Mühendis (Endüstri)',
  'Mühendis (Kimya)',
  'Mühendis (Havacılık ve Uzay)',
  'Mimar',
  'Avukat',
  'Hâkim / Savcı',
  'Öğretmen',
  'Akademisyen',
  'Yazılım Geliştirici',
  'Yapay Zekâ Mühendisi',
  'Veri Bilimci',
  'Siber Güvenlik Uzmanı',
  'Oyun Geliştirici',
  'Grafik Tasarımcı',
  'Endüstriyel Tasarımcı',
  'Mimari Görselleştirme Uzmanı',
  'Psikolog',
  'Psikiyatrist',
  'Fizyoterapist',
  'Diyetisyen',
  'Hemşire',
  'Ebe',
  'Pilot',
  'Kabin Memuru',
  'Denizci / Kaptan',
  'Gazeteci',
  'Yönetmen',
  'Senarist',
  'Oyuncu',
  'Müzisyen',
  'Ressam / Sanatçı',
  'Moda Tasarımcısı',
  'İç Mimar',
  'Şef / Aşçı',
  'Pastane Şefi',
  'Girişimci',
  'İşletmeci',
  'Ekonomist',
  'Bankacı',
  'Finansal Analist',
  'Muhasebeci / Mali Müşavir',
  'İnsan Kaynakları Uzmanı',
  'Pazarlama Uzmanı',
  'Reklamcı',
  'Sosyolog',
  'Arkeolog',
  'Tarihçi',
  'Diplomat',
  'Siyaset Bilimci',
  'Uluslararası İlişkiler Uzmanı',
  'Polis',
  'Asker',
  'İtfaiyeci',
  'Jandarma',
  'Biyolog',
  'Genetik Mühendisi',
  'Kimyager',
  'Fizikçi',
  'Astronom',
  'Matematikçi',
  'Meteorolog',
  'Jeolog',
  'Ziraat Mühendisi',
  'Gıda Mühendisi',
  'Orman Mühendisi',
  'Çevre Mühendisi',
  'Denetçi / Sigortacı',
  'Antrenör / Spor Bilimci',
  'Fizyoterapist (Spor)',
  'Turizm ve Otelcilik Uzmanı',
  'Sosyal Hizmet Uzmanı',
  'Çocuk Gelişimci',
  'Özel Eğitim Öğretmeni',
];

export const HIGH_SCHOOLS = [
  'Galatasaray Lisesi',
  'İstanbul Erkek Lisesi',
  'Kabataş Erkek Lisesi',
  'Vefa Lisesi',
  'Pertevniyal Lisesi',
  'Kadıköy Anadolu Lisesi',
  'İstanbul Lisesi',
  'Üsküdar Amerikan Lisesi',
  'Robert Kolej',
  'Notre Dame de Sion Fransız Lisesi',
  'Saint-Joseph Fransız Lisesi',
  'Deutsche Schule Istanbul (Alman Lisesi)',
  'İstanbul Erkek Lisesi Fen Bölümü',
  'İstanbul Fen Lisesi',
  'Kabataş Fen Lisesi',
  'Ankara Fen Lisesi',
  'Ankara Atatürk Anadolu Lisesi',
  'TED Ankara Koleji',
  'Bilkent Erzurum Laboratuvar Lisesi',
  'Ankara Gazi Anadolu Lisesi',
  'İzmir Fen Lisesi',
  'Bornova Anadolu Lisesi',
  'İzmir Amerikan Koleji (İzmir Özel Türk Koleji)',
  'Karşıyaka Lisesi',
  'Bursa Erkek Lisesi',
  'Bursa Fen Lisesi',
  'Adana Fen Lisesi',
  'Antalya Fen Lisesi',
  'Eskişehir Fen Lisesi',
  'Kayseri Fen Lisesi',
  'Konya Meram Anadolu Lisesi',
  'Samsun Bahçelievler Anadolu Lisesi',
  'Trabzon Fen Lisesi',
  'Gaziantep Fen Lisesi',
  'Denizli Fen Lisesi',
  'Kocaeli Fen Lisesi',
  'MEF Lisesi',
  'Darüşşafaka Lisesi',
];

export const UNIVERSITIES = [
  'Boğaziçi Üniversitesi',
  'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  'İstanbul Teknik Üniversitesi (İTÜ)',
  'İstanbul Üniversitesi',
  'Ankara Üniversitesi',
  'Hacettepe Üniversitesi',
  'Bilkent Üniversitesi',
  'Koç Üniversitesi',
  'Sabancı Üniversitesi',
  'Galatasaray Üniversitesi',
  'Marmara Üniversitesi',
  'Ege Üniversitesi',
  'Dokuz Eylül Üniversitesi',
  'Gazi Üniversitesi',
  'Yıldız Teknik Üniversitesi',
  'Çukurova Üniversitesi',
  'Akdeniz Üniversitesi',
  'Karadeniz Teknik Üniversitesi',
];

export const DEPARTMENTS = [
  'Bilgisayar Mühendisliği',
  'Yazılım Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Makine Mühendisliği',
  'Endüstri Mühendisliği',
  'İnşaat Mühendisliği',
  'Kimya Mühendisliği',
  'Tıp',
  'Diş Hekimliği',
  'Eczacılık',
  'Veterinerlik',
  'Hukuk',
  'Psikoloji',
  'Mimarlık',
  'İşletme',
  'İktisat',
  'Uluslararası İlişkiler',
  'Öğretmenlik',
  'Endüstriyel Tasarım',
  'Mimari Restorasyon',
];

/** Ortaokul MEB muhtevasindan sik korkulan/zorlanilan konu basliklari. */
export const MATH_TOPICS = [
  'Doğal Sayılar ve İşlemler',
  'Tam Sayılar',
  'Kesirler',
  'Ondalık Sayılar',
  'Yüzdeler',
  'Oran ve Orantı',
  'Cebirsel İfadeler',
  'Denklemler',
  'Eşitsizlikler',
  'Üslü Sayılar',
  'Kareköklü Sayılar',
  'Veri Analizi',
  'Olasılık',
  'Doğrular ve Açılar',
  'Üçgenler',
  'Dörtgenler ve Çokgenler',
  'Çember ve Daire',
  'Alan ve Çevre Hesaplamaları',
  'Geometrik Cisimler (Prizma, Silindir, Küre)',
  'Simetri ve Öteleme',
];

export const DAILY_HOURS = [
  '30 dakika',
  '1 saat',
  '1,5 saat',
  '2 saat',
  '3 saat',
  '4 saat',
  '5 saat',
  '6 saat',
];

export const TIMEFRAMES = ['3 ay', '6 ay', '1 yıl', '2 yıl', 'Daha uzun'];

export const MOTIVATIONS = ['Ailem', 'Geleceğim', 'Başarılarım', 'Arkadaşlarım', 'Hayallerim'];
