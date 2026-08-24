/**
 * Kocum Benim — tasarim sistemi.
 *
 * Hedef kitle 12-18 yas. Yumusak pastel lavanta zemin, beyaz kartlar,
 * mor-sari agirlikli canli ama goz yormayan vurgular. Sert neon yerine
 * yumusak golgeler: "okul uygulamasi" degil, sicak ve oyunsu bir his.
 */

export const Palette = {
  /** Sayfa zemini — cok acik lavanta */
  bg: '#F4F0FD',
  /** Cerceve / koyu lavanta bloklar (basliklar, secili alanlar) */
  bgDeep: '#DED2F7',
  /** Kart zemini */
  surface: '#FFFFFF',
  /** Ikincil yuzey — ic kartlar, ilerleme cubugu zemini */
  surfaceHi: '#EDE6FB',
  /** Ince ayirici cizgiler */
  border: '#E4DAF7',
  overlay: 'rgba(62, 53, 96, 0.45)',

  text: '#3E3560',
  textDim: '#7A6F99',
  textFaint: '#A79FC0',

  /** Birincil mor — ana aksiyon, XP, seviye */
  purple: '#8B6BD9',
  purpleSoft: '#E7DEFB',
  /** Sari — coin, odul, enerji */
  gold: '#F2B93B',
  goldSoft: '#FDF1D4',
  /** Turuncu — streak / ates */
  orange: '#F3924E',
  orangeSoft: '#FDE6D5',
  /** Pembe — dikkat, favoriler */
  pink: '#EE7C9B',
  pinkSoft: '#FCDFE6',
  /** Mavi — odak, sakinlik */
  blue: '#5B9BE8',
  blueSoft: '#DCEAFB',
  /** Yesil — tamamlandi, basari */
  green: '#4FC48A',
  greenSoft: '#D9F3E6',
} as const;

/** Uygulamanin birincil vurgu rengi. */
export const Accent = Palette.purple;

/** Renkli kartlarin pastel zemini — vurgu rengine karsilik gelen acik ton. */
export const SoftOf: Record<string, string> = {
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
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

/**
 * Yumusak renkli golge. Acik temada "neon parlama" yerine kartlari
 * zeminden hafifce yukari kaldiran pastel bir golge kullaniyoruz.
 */
export function glow(color: string = '#8B6BD9', intensity = 0.45) {
  return {
    shadowColor: color,
    shadowOpacity: intensity * 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  };
}

/** Kartlarin varsayilan yumusak golgesi. */
export const cardShadow = {
  shadowColor: '#6A5A9C',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;

export const Font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_800ExtraBold',
} as const;

export const Type = {
  hero: { fontFamily: Font.black, fontSize: 38, lineHeight: 46 },
  title: { fontFamily: Font.bold, fontSize: 26, lineHeight: 32 },
  section: { fontFamily: Font.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: Font.semibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: Font.semibold, fontSize: 13, lineHeight: 18 },
  tiny: { fontFamily: Font.medium, fontSize: 11, lineHeight: 15 },
  /** Zamanlayici rakamlari */
  timer: { fontFamily: Font.black, fontSize: 52, lineHeight: 58 },
} as const;

/** Renkli zemin uzerine yazilan metin (butonlar, rozetler). */
export const OnColor = '#FFFFFF';
