/**
 * Kocum Benim — sicak, yumusak egitim tasarim sistemi.
 *
 * Pudra ana zemin ve krem yuzeyler sakinligi; koyu mor metin ve ana
 * aksiyonlar guvenilir hiyerarsiyi; ikondan gelen bej ile kayisi ise
 * kontrollu vurgu noktalarini tasir.
 */

export const Palette = {
  /** Ana uygulama zemini — ferah, sicak dogal keten tonu. */
  bg: '#F8F6F4',
  /** Ikon zemininden turetilen, dekoratif alanlarda kullanilan koyu bej. */
  bgDeep: '#FFD19A',
  /** Pomodoro/odak ekraninin yuksek kontrastli zemini. */
  focusBg: '#3A3967',
  /** Kart, modal, menu ve alt navigasyonun saf beyaz ferah yuzeyi. */
  surface: '#FFFFFF',
  /** Secili alanlar ve ikincil bloklar icin yumusak sicak kontrast alanlari. */
  surfaceHi: '#F3EEEA',
  /** Gozu yormayan, sac teli inceliginde zarif sinir. */
  border: 'rgba(58, 57, 103, 0.08)',
  borderStrong: '#3A3967',
  overlay: 'rgba(45, 43, 82, 0.48)',

  /** Derin gece moru. Yuksek kontrastli ve net okunabilir. */
  text: '#2D2B52',
  /** Aciklamalar ve ikincil metinler icin yumusak mor-gri. */
  textDim: '#6B688D',
  /** Pasif ipuclari ve zaman damgalari. */
  textFaint: '#9C99B6',

  /** Ana aksiyon ve marka vurgusu. */
  amber: '#3A3967',
  amberSoft: '#F3EEEA',
  purple: '#3A3967',
  purpleSoft: '#F3EEEA',

  /** Ikonlar, rozetler ve enerji vurgulari (Seri, XP, motivasyon). */
  gold: '#FF7828',
  goldSoft: 'rgba(255, 120, 40, 0.14)',
  orange: '#FF7828',
  orangeSoft: 'rgba(255, 120, 40, 0.14)',

  /** Durum ve anlam vurgulari — artik tek tona zorlanmaz, net ve canli. */
  pink: '#F43F5E',
  pinkSoft: '#FFF1F2',
  blue: '#4F46E5',
  blueSoft: '#EEF2FF',
  green: '#10B981',
  greenSoft: '#ECFDF5',
} as const;

/** Uygulamanin birincil vurgu rengi. */
export const Accent = Palette.amber;

/** Ikon ve kucuk bilesen vurgusu. */
export const DetailAccent = Palette.orange;

/**
 * Onboarding ve marka acilisi icin uygulama ikonundan turetilen sicak palet.
 * Bu alan bilerek ana uygulama temasindan ayridir: uzun sureli calisma
 * ekranlari sakin kalirken ilk karsilama maskotun turuncu enerjisini tasir.
 */
export const OnboardingPalette = {
  bg: '#FDE8D0',
  bgDeep: '#FFD19A',
  surface: '#FFF9F1',
  track: 'rgba(102, 55, 37, 0.12)',
  border: 'rgba(102, 55, 37, 0.18)',
  text: '#4A281D',
  textDim: 'rgba(74, 40, 29, 0.76)',
  textFaint: 'rgba(74, 40, 29, 0.58)',
  accent: '#B94718',
  accentBright: '#F47732',
  accentSoft: 'rgba(244, 119, 50, 0.16)',
  blob: '#FF9D56',
} as const;

/**
 * Native acilis ekrani ve Android adaptif ikon zemini — app.json'daki
 * expo-splash-screen ve android.adaptiveIcon degerleriyle birebir ayni
 * olmali, yoksa devir teslim aninda renk atlar.
 */
export const Brand = {
  bg: OnboardingPalette.bg,
} as const;

/** Renkli kartlarin pastel zemini — vurgu rengine karsilik gelen acik ton. */
const SoftOf: Record<string, string> = {
  [Palette.amber]: Palette.amberSoft,
  [Palette.orange]: Palette.orangeSoft,
  [Palette.pink]: Palette.pinkSoft,
  [Palette.blue]: Palette.blueSoft,
  [Palette.green]: Palette.greenSoft,
  [OnboardingPalette.accent]: OnboardingPalette.accentSoft,
};

export function softOf(color: string): string {
  return SoftOf[color] ?? Palette.surfaceHi;
}

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const Radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  sheet: 36,
  pill: 9999,
} as const;

/**
 * Kapsul (tam yuvarlak uc) kose yaricapi.
 *
 * Android'in yeni mimarisinde bir yuzeyin arka plani, kose yaricapi kendi
 * boyutundan buyuk verildiginde duz kose cizilir — kenarlik yolu dogru
 * yuvarlanir ama dolgu kare kalir. Bu yuzden sabit bir buyuk sayi (or. 999) degil, ogenin kendi
 * yuksekliginin yarisi kullanilmali: her iki platformda da tam kapsul verir.
 *
 * @param height Ogenin kenarlik dahil toplam yuksekligi (px).
 */
export function pillRadius(height: number): number {
  return Math.round(height / 2);
}

/** Ince, sakin ayrimlar; secili durumda ikinci kademe kullanilir. */
export const Border = {
  thin: 1,
  thick: 1,
} as const;

/**
 * Yumusak renkli golge — yalnizca gercekten yuzen ogelerde (modal,
 * hamburger menu) kullanilir. Kartlarda ve butonlarda hiyerarsiyi kalin
 * kenarlik tasir, golge degil.
 */
export function glow(color: string = Palette.purple, intensity = 0.3) {
  return {
    shadowColor: color,
    shadowOpacity: intensity * 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  };
}

/** Notrsuz yukselti katmanlari — modern yumusak golgeler. */
export const Elevation = {
  none: {},
  /** Standart kart golgesi (yumusak ve ferah derinlik) */
  card: {
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  /** Modal ve yuzen diyalog golgesi */
  modal: {
    shadowColor: '#1A1836',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  sm: {
    shadowColor: Palette.text,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: Palette.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lg: {
    shadowColor: Palette.text,
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  /** En ust katman — modal, hamburger menu, tam ekran kutlama. */
  xl: {
    shadowColor: Palette.text,
    shadowOpacity: 0.15,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
} as const;

/**
 * Sure ve yay ayarlari.
 */
export const Motion = {
  duration: {
    fast: 100,
    base: 200,
    moderate: 300,
    slow: 500,
  },
  spring: {
    /** Dokunma geri bildirimi — sekmeler, kucuk kartlar. */
    snappy: { damping: 15, stiffness: 300 },
    /** Serbest birakma / geri donus. */
    soft: { damping: 14, stiffness: 260 },
    /** Kutlama, rozet gibi oynak vurgular — dikkatli kullan. */
    playful: { damping: 10, stiffness: 200 },
  },
} as const;

export const Font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  black: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Nefes alan, okunakli ve genisletilmis ritim (Turkce karakter dostu). */
export const Type = {
  hero: { fontFamily: Font.bold, fontSize: 32, lineHeight: 42, letterSpacing: -0.6 },
  title: { fontFamily: Font.bold, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 },
  section: { fontFamily: Font.semibold, fontSize: 18, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
  bodyStrong: { fontFamily: Font.semibold, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
  small: { fontFamily: Font.medium, fontSize: 13, lineHeight: 20, letterSpacing: 0.15 },
  smallStrong: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 20, letterSpacing: 0.15 },
  tiny: { fontFamily: Font.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 0.3 },
  /** Zamanlayici rakamlari */
  timer: { fontFamily: Font.bold, fontSize: 48, lineHeight: 56, letterSpacing: -1.0 },
} as const;

/** Renkli zemin uzerine yazilan metin (butonlar, rozetler). */
export const OnColor = '#FFFFFF';
