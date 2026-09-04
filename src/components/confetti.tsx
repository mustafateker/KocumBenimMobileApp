import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/theme/tokens';

const COLORS = [Palette.blue, Palette.green, Palette.orange, Palette.purple, Palette.gold, Palette.pink];

/**
 * Deterministik sozde-rastgele. useMemo'nun saf kalmasi gerektigi icin
 * Math.random yerine index'ten turetiyoruz; sonuc yine dagilmis gorunur.
 */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type PieceSpec = {
  x: number;
  delay: number;
  color: string;
  size: number;
  spin: number;
  drift: number;
};

function Piece({ spec, height, trigger }: { spec: PieceSpec; height: number; trigger: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withDelay(
      spec.delay,
      withTiming(1, { duration: 1900, easing: Easing.out(Easing.quad) })
    );
  }, [trigger, spec.delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value * t.value,
    transform: [
      { translateY: -40 + t.value * (height + 80) },
      { translateX: Math.sin(t.value * Math.PI * 2) * spec.drift },
      { rotate: `${t.value * spec.spin}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: spec.x,
          width: spec.size,
          height: spec.size * 1.6,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

/**
 * Kutlama konfetisi. `trigger` degeri her degistiginde yeniden patlar,
 * boylece ayni ekranda birden fazla kez tetiklenebilir.
 */
export function Confetti({ trigger, count = 34 }: { trigger: number; count?: number }) {
  const { width, height } = useWindowDimensions();

  const specs = useMemo<PieceSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: noise(i + 1) * width,
        delay: noise(i + 2) * 450,
        color: COLORS[Math.floor(noise(i + 3) * COLORS.length)],
        size: 6 + noise(i + 4) * 7,
        spin: 260 + noise(i + 5) * 620,
        drift: 14 + noise(i + 6) * 34,
      })),
    [width, count]
  );

  if (trigger === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {specs.map((spec, i) => (
        <Piece key={i} spec={spec} height={height} trigger={trigger} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
