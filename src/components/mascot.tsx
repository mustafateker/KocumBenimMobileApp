import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

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
  /** Varsayilan: acik gozler, hafif gulumseme. */
  | 'happy'
  /** Kutlama: gozler kapali yay, agiz acik kahkaha. */
  | 'cheer'
  /** Dusunuyor: gozbebekleri yana kaymis, agiz duz. */
  | 'think'
  /** Goz kirpma — selamlama anlarinda. */
  | 'wink';

type MascotProps = {
  width?: number;
  mood?: MascotMood;
  style?: StyleProp<ViewStyle>;
};

export function Mascot({ width = 96, mood = 'happy', style }: MascotProps) {
  return (
    <View style={style}>
      <Svg width={width} height={width / MASCOT_ASPECT} viewBox={VIEW_BOX}>
        {/* kulaklar */}
        <Circle cx={23} cy={80} r={7.5} fill={Brand.skin} />
        <Circle cx={85} cy={80} r={7.5} fill={Brand.skin} />

        {/* bas */}
        <Rect x={24} y={44} width={60} height={60} rx={21} fill={Brand.skin} />

        {/* kasket: siper once, band ustune biner */}
        <Path d="M80 48 C 94 46, 108 49, 109 56 C 110 63, 93 62, 80 59 Z" fill={Brand.capBrim} />
        <Path d="M23 53 C 23 18, 85 18, 85 53 Z" fill={Brand.cap} />
        <Rect x={21} y={48} width={66} height={10} rx={5} fill={Brand.cap} />
        <Circle cx={54} cy={27} r={3} fill={Brand.skin} />

        {/* yanaklar */}
        <Circle cx={34} cy={87} r={5} fill={Brand.cheek} />
        <Circle cx={74} cy={87} r={5} fill={Brand.cheek} />

        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </Svg>
    </View>
  );
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'cheer') {
    // Kapali, yukari kavisli mutlu gozler.
    return (
      <>
        <Path
          d="M38 79 Q44 71 50 79"
          stroke={Brand.ink}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M58 79 Q64 71 70 79"
          stroke={Brand.ink}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }

  if (mood === 'wink') {
    return (
      <>
        <Circle cx={44} cy={76} r={6} fill={Brand.ink} />
        <Circle cx={46} cy={74} r={2} fill={Brand.skin} />
        <Path
          d="M58 78 Q64 70 70 78"
          stroke={Brand.ink}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }

  // 'think' halinde gozbebekleri hafifce yana kayar.
  const shift = mood === 'think' ? 2 : 0;

  return (
    <>
      <Circle cx={44 + shift} cy={76} r={6} fill={Brand.ink} />
      <Circle cx={64 + shift} cy={76} r={6} fill={Brand.ink} />
      <Circle cx={46 + shift} cy={74} r={2} fill={Brand.skin} />
      <Circle cx={66 + shift} cy={74} r={2} fill={Brand.skin} />
    </>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === 'cheer') {
    return <Path d="M45 88 Q54 103 63 88 Z" fill={Brand.ink} />;
  }

  if (mood === 'think') {
    return (
      <Path
        d="M48 92 Q54 89 60 92"
        stroke={Brand.ink}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  return (
    <Path
      d="M46 90 Q54 98 62 90"
      stroke={Brand.ink}
      strokeWidth={4.5}
      strokeLinecap="round"
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
