import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Brand, Motion, Space } from '@/theme/tokens';

import { Mascot } from './mascot';
import { Txt } from './ui';

/**
 * Native acilis ekraninin uzerine binen JS katmani.
 *
 * app.json'daki expo-splash-screen eklentisi ayni maskotu ayni mor zemine,
 * ayni genislikte basar. Native ekran gizlendigi anda bu bilesen tipatip
 * ayni kareyi gosterdigi icin gecis gorunmez; sonrasinda maskot bir zipla,
 * kelime isareti asagidan gelir ve katman silinir.
 *
 * MASCOT_WIDTH degisirse app.json > expo-splash-screen > imageWidth de
 * ayni degere cekilmeli, yoksa devir teslim aninda gorsel siçrar.
 */
const MASCOT_WIDTH = 180;

/** Katmanin toplam omru — _layout bu sureden sonra bilesen kaldirilir. */
export const SPLASH_DURATION = 1700;

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const pop = useSharedValue(1);
  const caption = useSharedValue(0);
  const cover = useSharedValue(1);

  useEffect(() => {
    pop.value = withDelay(
      120,
      withSequence(withSpring(1.08, Motion.spring.playful), withSpring(1, Motion.spring.soft))
    );
    caption.value = withDelay(260, withTiming(1, { duration: Motion.duration.slow }));
    cover.value = withDelay(1250, withTiming(0, { duration: Motion.duration.moderate }));

    const timer = setTimeout(onFinish, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [pop, caption, cover, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const captionStyle = useAnimatedStyle(() => ({
    opacity: caption.value,
    transform: [{ translateY: (1 - caption.value) * 14 }],
  }));

  return (
    <Animated.View style={[styles.root, coverStyle]} pointerEvents="none">
      <Animated.View style={popStyle}>
        <Mascot width={MASCOT_WIDTH} mood="happy" />

        <Animated.View style={[styles.caption, captionStyle]}>
          <Txt variant="title" color="#FFFFFF" center style={styles.wordmark}>
            Koçum Benim
          </Txt>
          <Txt variant="small" color="#FFFFFFB8" center>
            Hedefine giden yolda yanindayim
          </Txt>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.bg,
    zIndex: 10,
  },
  /**
   * Maskot ekranin tam ortasinda kalmali (native gorselle ortusmesi icin),
   * bu yuzden yazi akista yer kaplamaz; maskotun hemen altina konumlanir.
   */
  caption: {
    position: 'absolute',
    top: '100%',
    left: '-50%',
    right: '-50%',
    marginTop: Space.lg,
    alignItems: 'center',
    gap: 2,
  },
  wordmark: {
    letterSpacing: -0.5,
  },
});
