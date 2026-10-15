/**
 * Kocum Benim — sicak, yumusak egitim tasarim sistemi.
 *
 * Pudra ana zemin ve krem yuzeyler sakinligi; koyu mor metin ve ana
 * aksiyonlar guvenilir hiyerarsiyi; ikondan gelen bej ile kayisi ise
 * kontrollu vurgu noktalarini tasir.
 */

export const Palette = {
  /** Ana uygulama zemini. */
  bg: '#F5EFF1',
  /** Ikon zemininden turetilen, dekoratif alanlarda kullanilan koyu bej. */
  bgDeep: '#FFD19A',
  /** Pomodoro/odak ekraninin yuksek kontrastli zemini. */
  focusBg: '#3A3967',
  /** Kart, modal, menu ve alt navigasyonun sakin notr yuzeyi. */
  surface: '#FFF9F1',
  /** Secili alanlar ve ikincil bloklar icin dusuk yogunluklu acik bej. */
  surfaceHi: 'rgba(255, 209, 154, 0.32)',
  border: 'rgba(58, 57, 103, 0.14)',
  borderStrong: '#3A3967',
  overlay: 'rgba(58, 57, 103, 0.52)',

  text: '#3A3967',
  textDim: 'rgba(58, 57, 103, 0.78)',
  textFaint: 'rgba(58, 57, 103, 0.62)',

  /** Ana aksiyon ve yuksek kontrast. */
  amber: '#3A3967',
  amberSoft: 'rgba(255, 209, 154, 0.32)',
  purple: '#3A3967',
  purpleSoft: 'rgba(255, 209, 154, 0.32)',
  /** Ikonlar, rozetler ve kucuk enerji vurgulari. */
  gold: '#FBAE75',
  goldSoft: 'rgba(251, 174, 117, 0.20)',
  orange: '#FBAE75',
  orangeSoft: 'rgba(251, 174, 117, 0.20)',
  /** Durum renkleri de sinirli marka paletinden turetilir; anlam ikon/metinle desteklenir. */
  pink: '#3A3967',
  pinkSoft: 'rgba(255, 209, 154, 0.32)',
  blue: '#3A3967',
  blueSoft: 'rgba(255, 209, 154, 0.32)',
  green: '#3A3967',
  greenSoft: 'rgba(255, 209, 154, 0.32)',
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
  [OnboardingPalette.accent]: OnboardingPalette.accentSoft,
};

export function softOf(color: string): string {
  return SoftOf[color] ?? Palette.surfaceHi;
}

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
    shadowOpacity: intensity * 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  };
}

/** Notrsuz yukselti katmanlari — yalnizca yuzen katmanlar icin (bkz yukarisi). */
export const Elevation = {
  none: {},
  sm: {
    shadowColor: Palette.purple,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: Palette.purple,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lg: {
    shadowColor: Palette.purple,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  /** En ust katman — modal, hamburger menu, tam ekran kutlama. */
  xl: {
    shadowColor: Palette.purple,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
} as const;

/**
 * Sure ve yay ayarlari. Chunky butonlarin basma animasyonu hizli-kesin
 * (fast), serbest birakma biraz daha yumusak geri sekmeli.
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
    snappy: { damping: 18, stiffness: 320 },
    /** Serbest birakma / geri donus. */
    soft: { damping: 14, stiffness: 260 },
    /** Kutlama, rozet gibi oynak vurgular — dikkatli kullan. */
    playful: { damping: 10, stiffness: 200 },
  },
} as const;

export const Font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_800ExtraBold',
} as const;

/** Okunakli, yumusak hiyerarsi; agirlik yalnizca ana basliklarda artar. */
export const Type = {
  hero: { fontFamily: Font.bold, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: Font.bold, fontSize: 24, lineHeight: 31 },
  section: { fontFamily: Font.semibold, fontSize: 18, lineHeight: 25 },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: Font.semibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 18 },
  tiny: { fontFamily: Font.semibold, fontSize: 11, lineHeight: 15 },
  /** Zamanlayici rakamlari */
  timer: { fontFamily: Font.bold, fontSize: 52, lineHeight: 58 },
} as const;

/** Renkli zemin uzerine yazilan metin (butonlar, rozetler). */
export const OnColor = Palette.bg;
