/**
 * Kocum Benim — tasarim sistemi.
 *
 * Hedef kitle 12-18 yas. Duolingo'dan ilham alan "oyunlastirma render
 * edilmis gorsel dil": duz (gradyansiz) doygun renkler, her etkilesimli
 * ogede 2-4px kati kenarlik + alt kenarda daha koyu bir "3D basma" seridi,
 * beyaza yakin duz zemin (renk kartlarda/butonlarda yasar, zeminde degil).
 * Sert neon degil ama yumusak-bulanik golge de degil — kontur ve dolgu
 * hiyerarsiyi tasir.
 */

export const Palette = {
  /** Sayfa zemini — duz, neredeyse beyaz. Renk zeminde degil bilesenlerde yasar. */
  bg: '#FCFBFF',
  /** Cerceve / vurgulu bloklar */
  bgDeep: '#DED2F7',
  /** Kart zemini */
  surface: '#FFFFFF',
  /** Ikincil yuzey — ic kartlar, ilerleme cubugu zemini */
  surfaceHi: '#F1ECFB',
  /** Standart kati kenarlik — Duolingo'nun 2px "Swan" cizgisinin karsiligi */
  border: '#E1D6F5',
  /** Vurgulu kenarlik — secili sekme, odakli girdi */
  borderStrong: '#C9B8ED',
  overlay: 'rgba(38, 31, 61, 0.5)',

  text: '#2E2650',
  textDim: '#6E6390',
  textFaint: '#A79FC0',

  /** Birincil mor — ana aksiyon, XP, seviye */
  purple: '#8257E5',
  purpleSoft: '#EDE6FB',
  /** Sari — coin, odul, enerji */
  gold: '#FFC12B',
  goldSoft: '#FDF1D4',
  /** Turuncu — streak / ates */
  orange: '#FF8A34',
  orangeSoft: '#FDE6D5',
  /** Pembe/kirmizi — dikkat, hata */
  pink: '#FF4B6E',
  pinkSoft: '#FCDFE6',
  /** Mavi — odak, sakinlik, ipucu */
  blue: '#1CB0F6',
  blueSoft: '#DCEAFB',
  /** Yesil — tamamlandi, basari */
  green: '#4FC44E',
  greenSoft: '#D9F3E6',
} as const;

/** Uygulamanin birincil vurgu rengi. */
export const Accent = Palette.purple;

/**
 * Maskot logosunun sabit renkleri. assets/images/icon.png ve kardeslerini
 * ureten betikle birebir ayni degerler — biri degisirse digeri de degismeli,
 * yoksa acilis ekraninda native gorsel ile JS katmani arasinda renk atlar.
 */
export const Brand = {
  /** Ikon zemini ve acilis ekrani rengi. */
  bg: Palette.purple,
  skin: '#FFFFFF',
  cap: Palette.gold,
  /** Kasket siperi — kubbeden ayrissin diye bir tik koyu. */
  capBrim: '#F0A81E',
  ink: Palette.text,
  cheek: '#FFC7D2',
  /** Kutlama ifadesinde acik agizdaki dil. */
  tongue: '#FF7A93',
} as const;

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

/**
 * Bir rengi koyulastirir — chunky butonlarin "3D basma" seridi ve kart
 * vurgu kenarliklari icin. #RRGGBB bekler.
 */
export function shade(hex: string, amount = 0.74): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.round(((num >> 16) & 255) * amount);
  const g = Math.round(((num >> 8) & 255) * amount);
  const b = Math.round((num & 255) * amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Her vurgu renginin "3D basma" seridi icin koyu tonu. */
export const DeepOf: Record<string, string> = {
  [Palette.purple]: shade(Palette.purple),
  [Palette.gold]: shade(Palette.gold),
  [Palette.orange]: shade(Palette.orange),
  [Palette.pink]: shade(Palette.pink),
  [Palette.blue]: shade(Palette.blue),
  [Palette.green]: shade(Palette.green),
};

export function deepOf(color: string): string {
  return DeepOf[color] ?? shade(color);
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
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

/** Kati kenarlik kalinliklari — Duolingo hiç kilcal cizgi kullanmaz. */
export const Border = {
  thin: 1,
  /** Standart kart/buton kenarligi */
  thick: 2,
  /** Chunky butonlarin dinlenme durumundaki "3D" alt serit yuksekligi */
  chunky: 4,
} as const;

/**
 * Yumusak renkli golge — artik yalnizca gercekten yuzen ogelerde (modal,
 * hamburger menu) kullanilir. Kartlarda ve butonlarda hiyerarsiyi kalin
 * kenarlik tasir, golge degil.
 */
export function glow(color: string = '#8257E5', intensity = 0.45) {
  return {
    shadowColor: color,
    shadowOpacity: intensity * 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  };
}

/** Notrsuz yukselti katmanlari — yalnizca yuzen katmanlar icin (bkz yukarisi). */
export const Elevation = {
  none: {},
  sm: {
    shadowColor: '#3E3560',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: '#3E3560',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#2E2650',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  /** En ust katman — modal, hamburger menu, tam ekran kutlama. */
  xl: {
    shadowColor: '#2E2650',
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

/**
 * Cesur, kendinden emin tip skalasi — basliklar ve buton etiketleri
 * varsayilan olarak extra-bold (Duolingo'nun "800 is default" kurali).
 */
export const Type = {
  hero: { fontFamily: Font.black, fontSize: 40, lineHeight: 46 },
  title: { fontFamily: Font.black, fontSize: 28, lineHeight: 34 },
  section: { fontFamily: Font.bold, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: Font.bold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: Font.bold, fontSize: 13, lineHeight: 18 },
  tiny: { fontFamily: Font.bold, fontSize: 11, lineHeight: 15 },
  /** Zamanlayici rakamlari */
  timer: { fontFamily: Font.black, fontSize: 52, lineHeight: 58 },
} as const;

/** Renkli zemin uzerine yazilan metin (butonlar, rozetler). */
export const OnColor = '#FFFFFF';
