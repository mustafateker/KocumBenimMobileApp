/**
 * Kocum Benim — sicak, yumusak egitim tasarim sistemi.
 *
 * Pudra zemin ve acik notr yuzeyler sakinligi; koyu mor metin ve ana
 * aksiyonlar guvenilir hiyerarsiyi; pembe ile kayisi ise yalnizca kontrollu
 * vurgu noktalarini tasir.
 */

export const Palette = {
  /** Ana uygulama zemini. */
  bg: '#F5EFF1',
  /** Yalnizca dekoratif ve secili alanlarda kullanilan pembe marka tonu. */
  bgDeep: '#FDCEDF',
  /** Pomodoro/odak ekraninin yuksek kontrastli zemini. */
  focusBg: '#3A3967',
  /** Kart, modal, menu ve alt navigasyonun sakin notr yuzeyi. */
  surface: '#FFFBFC',
  /** Secili alanlar ve ikincil bloklar icin dusuk yogunluklu pembe. */
  surfaceHi: 'rgba(253, 206, 223, 0.36)',
  border: 'rgba(58, 57, 103, 0.14)',
  borderStrong: '#3A3967',
  overlay: 'rgba(58, 57, 103, 0.52)',

  text: '#3A3967',
  textDim: 'rgba(58, 57, 103, 0.78)',
  textFaint: 'rgba(58, 57, 103, 0.62)',

  /** Ana aksiyon ve yuksek kontrast. */
  amber: '#3A3967',
  amberSoft: 'rgba(253, 206, 223, 0.36)',
  purple: '#3A3967',
  purpleSoft: 'rgba(253, 206, 223, 0.36)',
  /** Ikonlar, rozetler ve kucuk enerji vurgulari. */
  gold: '#FBAE75',
  goldSoft: 'rgba(251, 174, 117, 0.20)',
  orange: '#FBAE75',
  orangeSoft: 'rgba(251, 174, 117, 0.20)',
  /** Durum renkleri de sinirli marka paletinden turetilir; anlam ikon/metinle desteklenir. */
  pink: '#3A3967',
  pinkSoft: 'rgba(253, 206, 223, 0.36)',
  blue: '#3A3967',
  blueSoft: 'rgba(253, 206, 223, 0.36)',
  green: '#3A3967',
  greenSoft: 'rgba(253, 206, 223, 0.36)',
} as const;

/** Uygulamanin birincil vurgu rengi. */
export const Accent = Palette.amber;

/** Ikon ve kucuk bilesen vurgusu. */
export const DetailAccent = Palette.orange;

/**
 * Native acilis ekrani ve Android adaptif ikon zemini — app.json'daki
 * expo-splash-screen ve android.adaptiveIcon degerleriyle birebir ayni
 * olmali, yoksa devir teslim aninda renk atlar.
 */
export const Brand = {
  bg: Palette.bg,
} as const;

/** Renkli kartlarin pastel zemini — vurgu rengine karsilik gelen acik ton. */
export const SoftOf: Record<string, string> = {
  [Palette.amber]: Palette.amberSoft,
  [Palette.orange]: Palette.orangeSoft,
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
 * yuvarlanir ama dolgu kare kalir. Eskiden kullandigimiz `Radius.pill = 999`
 * bu yuzden "Gunluk / Haftalik / Aylik" secicisinin secili kutusunu kare
 * gosteriyordu. Cozum sabit bir buyuk sayi degil, ogenin kendi yuksekliginin
 * yarisi: her iki platformda da tam kapsul verir.
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
 * Yumusak renkli golge — artik yalnizca gercekten yuzen ogelerde (modal,
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

/** Kartlarin varsayilan cok hafif golgesi — asil hiyerarsi kenarliktan gelir. */
export const cardShadow = Elevation.sm;

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
