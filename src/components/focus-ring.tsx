import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Accent, Motion, Palette, glow } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0-1 arasi ilerleme. Reanimated degeri olarak gelir ki her saniye
   *  JS tarafinda yeniden render tetiklemesin. */
  progress: SharedValue<number>;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** Bos halkanin rengi. Acik temada zeminden ayrisacak kadar koyu olmali. */
  track?: string;
  /** Cemberin ortasinda gosterilecek icerik (sure, etiket, buton). */
  children?: React.ReactNode;
};

/**
 * Sade dairesel zamanlayici halkasi.
 *
 * Halka saat 12'den baslar ve saat yonunde dolar; bu yuzden -90 derece
 * dondurulmus bir SVG kullaniyoruz.
 */
export function FocusRing({
  progress,
  size = 264,
  strokeWidth = 16,
  color = Accent,
  track = Palette.bgDeep,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Yumusak gecis: her tik'te ani siçrama yerine kisa bir yaklasma.
  const smooth = useDerivedValue(() => withTiming(progress.value, { duration: Motion.duration.moderate }));

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.max(0, Math.min(1, smooth.value))),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }, glow(color, 0.3)]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Zemin halkasi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dolan halka */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
