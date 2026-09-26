/**
 * Kocum Benim — sakin egitim tasarim sistemi.
 *
 * Sicak notr zeminler uzun calisma oturumlarinda goz yormaz. Adacayi yesili
 * markayi ve ana aksiyonlari tasir; mavi, kayisi ve kirmizi yalnizca anlamli
 * bilgi/durum geri bildirimlerinde kullanilir. Buyuk yuzeyler renkli degil,
 * beyaz veya notrdur. Boylece arayuz cocuk dostu kalirken oyuncaklasmaz.
 */

export const Palette = {
  /** Sicak kagit hissi veren ana sayfa zemini. */
  bg: '#F6F7F3',
  /** Marka renginin sakin, genis yuzey tonu. */
  bgDeep: '#D9E5DF',
  /** Odak modunun isigi azaltan tek parca koyu zemini. */
  focusBg: '#27483F',
  /** Kart zemini */
  surface: '#FFFFFF',
  /** Ikincil yuzey — ic kartlar, ilerleme cubugu zemini */
  surfaceHi: '#EEF2EF',
  border: '#DCE4DF',
  borderStrong: '#AFC4BA',
  overlay: 'rgba(24, 39, 33, 0.46)',

  text: '#24332D',
  textDim: '#5D6E66',
  textFaint: '#68776F',

  /** Birincil marka ve aksiyon rengi — beyaz metinle AA kontrastli. */
  amber: '#3F7667',
  amberSoft: '#E5F0EB',
  /** Ikincil sakin ton — dekoratif morun yerini alan yesil-gri. */
  purple: '#667A76',
  purpleSoft: '#EBEFEE',
  /** Sicak vurgu — odul/enerji gibi az sayida anlamli noktada. */
  gold: '#98613D',
  goldSoft: '#F7EEE6',
  /** Seri ve bekleme durumlari icin koyu kayisi. */
  orange: '#9D6043',
  orangeSoft: '#F8ECE6',
  /** Hata ve tehlike. */
  pink: '#B8575F',
  pinkSoft: '#F8E9EA',
  /** Bilgi ve rehberlik. */
  blue: '#527B8C',
  blueSoft: '#E8F0F3',
  /** Basari ve tamamlanma. */
  green: '#4F7D5C',
  greenSoft: '#E9F1EB',
} as const;

/** Uygulamanin birincil vurgu rengi. */
export const Accent = Palette.amber;

/**
 * Native acilis ekrani ve Android adaptif ikon zemini — app.json'daki
 * expo-splash-screen ve android.adaptiveIcon degerleriyle birebir ayni
 * olmali, yoksa devir teslim aninda renk atlar.
 */
export const Brand = {
  bg: Palette.amber,
} as const;

/** Renkli kartlarin pastel zemini — vurgu rengine karsilik gelen acik ton. */
export const SoftOf: Record<string, string> = {
  [Palette.amber]: Palette.amberSoft,
  [Palette.purple]: Palette.purpleSoft,
  [Palette.gold]: Palette.goldSoft,
  [Palette.orange]: Palette.orangeSoft,
  [Palette.pink]: Palette.pinkSoft,
  [Palette.blue]: Palette.blueSoft,
  [Palette.green]: Palette.greenSoft,
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
export function glow(color: string = Palette.amber, intensity = 0.3) {
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
    shadowColor: '#24332D',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: '#24332D',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#24332D',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  /** En ust katman — modal, hamburger menu, tam ekran kutlama. */
  xl: {
    shadowColor: '#24332D',
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
export const OnColor = '#FFFFFF';
