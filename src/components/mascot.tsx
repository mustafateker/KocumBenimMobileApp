import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { Border, Brand, Palette, Space, softOf } from '@/theme/tokens';

import { Txt } from './ui';

/**
 * Koc maskotu — markanin yuzu.
 *
 * Geometri assets/images/*.png dosyalarini ureten betikle birebir aynidir:
 * ayni viewBox, ayni koordinatlar. Boylece native acilis ekranindaki PNG ile
 * bu bilesen ust uste bindiginde kaymaz (bkz components/animated-splash.tsx).
 */

/** PNG varyantlariyla ortak, bosluksuz kirpilmis cerceve. */
const VIEW_BOX = '15.5 24 94 80';

/** Genislik/yukseklik orani — yukseklik hesaplamak icin. */
export const MASCOT_ASPECT = 94 / 80;

export type MascotMood =
  /** Varsayilan: parlak acik gozler, kedi agzi. */
  | 'happy'
  /** Kutlama: gozler kapali yay, dil gorunen acik agiz. */
  | 'cheer'
  /** Dusunuyor: bakis sag-yukari kaymis, kucuk "o" agiz. */
  | 'think'
  /** Goz kirpma — selamlama anlarinda. */
  | 'wink';

type MascotProps = {
  width?: number;
  mood?: MascotMood;
  style?: StyleProp<ViewStyle>;
};

/*
 * Yuz oranlari "bebek semasi"na gore: gozler buyuk ve yuzun alt yarisinda,
 * agiz kucuk ve gozlere yakin, yanaklar oval. Gozlerde iki parlama noktasi
 * (buyuk + kucuk) bakisi canli gosterir.
 */
const EYE_L = 42;
const EYE_R = 66;
const EYE_Y = 80;
const EYE_SIZE = 7.5;

/** Kasket onundeki bes koseli yildiz — basari/rozet cagrisimi. */
const CAP_STAR = starPath(54, 39.5, 5.6);

function starPath(cx: number, cy: number, outer: number, inner = outer * 0.46): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join(' L')} Z`;
}

export function Mascot({ width = 96, mood = 'happy', style }: MascotProps) {
  return (
    <View style={style}>
      <Svg width={width} height={width / MASCOT_ASPECT} viewBox={VIEW_BOX}>
        {/* kulaklar */}
        <Circle cx={24} cy={83} r={6} fill={Brand.skin} />
        <Circle cx={84} cy={83} r={6} fill={Brand.skin} />

        {/* bas — neredeyse yuvarlak */}
        <Rect x={24} y={44} width={60} height={60} rx={27} fill={Brand.skin} />

        {/* kasket: siper once, band ustune biner */}
        <Path d="M80 48 C 94 46, 108 49, 109 56 C 110 63, 93 62, 80 59 Z" fill={Brand.capBrim} />
        <Path d="M23 53 C 23 18, 85 18, 85 53 Z" fill={Brand.cap} />
        <Rect x={21} y={48} width={66} height={10} rx={5} fill={Brand.cap} />
        <Circle cx={54} cy={27} r={3} fill={Brand.skin} />
        <Path d={CAP_STAR} fill={Brand.skin} stroke={Brand.skin} strokeWidth={1} strokeLinejoin="round" />

        {/* yanaklar */}
        <Ellipse cx={32.5} cy={90} rx={6} ry={4} fill={Brand.cheek} />
        <Ellipse cx={75.5} cy={90} rx={6} ry={4} fill={Brand.cheek} />

        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </Svg>
    </View>
  );
}

function OpenEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={EYE_SIZE} fill={Brand.ink} />
      <Circle cx={cx + 2.6} cy={cy - 2.6} r={2.8} fill={Brand.skin} />
      <Circle cx={cx - 2.4} cy={cy + 2.8} r={1.2} fill={Brand.skin} />
    </>
  );
}

/** Kapali, yukari kavisli mutlu goz. */
function ClosedEye({ cx }: { cx: number }) {
  return (
    <Path
      d={`M${cx - 7} ${EYE_Y + 2} Q${cx} ${EYE_Y - 7} ${cx + 7} ${EYE_Y + 2}`}
      stroke={Brand.ink}
      strokeWidth={3.8}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'cheer') {
    return (
      <>
        <ClosedEye cx={EYE_L} />
        <ClosedEye cx={EYE_R} />
      </>
    );
  }

  if (mood === 'wink') {
    return (
      <>
        <OpenEye cx={EYE_L} cy={EYE_Y} />
        <ClosedEye cx={EYE_R} />
      </>
    );
  }

  // 'think' halinde bakis hafifce sag-yukari kayar.
  const shift = mood === 'think' ? 1.5 : 0;

  return (
    <>
      <OpenEye cx={EYE_L + shift} cy={EYE_Y - shift} />
      <OpenEye cx={EYE_R + shift} cy={EYE_Y - shift} />
    </>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === 'cheer') {
    return (
      <>
        <Path
          d="M48 87 Q54 98 60 87 Z"
          fill={Brand.ink}
          stroke={Brand.ink}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Circle cx={54} cy={92.4} r={2.5} fill={Brand.tongue} />
      </>
    );
  }

  if (mood === 'think') {
    // Kucuk "o" — "hmm?" ifadesi.
    return <Circle cx={55.5} cy={90} r={2.1} stroke={Brand.ink} strokeWidth={2.8} fill="none" />;
  }

  // Kedi agzi (ω) — happy ve wink icin.
  return (
    <Path
      d="M49 88 Q51.5 91.5 54 88 Q56.5 91.5 59 88"
      stroke={Brand.ink}
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/**
 * Maskotu renkli bir kabarcigin icine oturtur — onboarding adim basliklarinda
 * IconBubble'in yerini alir. Renk adimdan gelir, maskot sabit kalir.
 */
export function MascotBadge({
  color = Palette.purple,
  size = 116,
  mood = 'happy',
}: {
  color?: string;
  size?: number;
  mood?: MascotMood;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: softOf(color),
          borderColor: color,
        },
      ]}
    >
      <Mascot width={size * 0.72} mood={mood} />
    </View>
  );
}

/**
 * Maskot + kelime isareti. Giris/kayit ekranlarinin ve acilis ekraninin
 * ortak kilidi.
 */
export function LogoLockup({
  width = 132,
  mood = 'happy',
  tagline,
  onDark,
}: {
  width?: number;
  mood?: MascotMood;
  tagline?: string;
  /** Mor zemin uzerinde kullanilirken yazilari beyaza cevirir. */
  onDark?: boolean;
}) {
  return (
    <View style={styles.lockup}>
      <Mascot width={width} mood={mood} />
      <Txt variant="title" color={onDark ? '#FFFFFF' : Palette.text} style={styles.wordmark}>
        Koçum Benim
      </Txt>
      {tagline ? (
        <Txt variant="small" color={onDark ? '#FFFFFFB8' : Palette.textDim} center>
          {tagline}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
  },
  lockup: {
    alignItems: 'center',
    gap: Space.sm,
  },
  wordmark: {
    letterSpacing: -0.5,
  },
});
