import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { Brand, OnboardingPalette, Space } from '@/theme/tokens';

import { Mascot } from './mascot';
import { Txt } from './ui';

/**
 * Native acilis ekraninin uzerine binen JS katmani.
 *
 * app.json'daki expo-splash-screen eklentisi ayni maskotu ayni zemine basar.
 * Native ekran gizlendigi anda bu bilesen tipatip ayni kareyi gosterdigi icin
 * gecis gorunmez; sonrasinda maskot olcek degistirmeden yumusakca yukari
 * yerlesir, kelime isareti belirir ve katman sakin bir gecisle silinir.
 *
 * DIKKAT — iki genislik ayni sey degil:
 *  - app.json > imageWidth (320) native ikonun TUVAL genisligi. Android 12+
 *    acilis ekrani ikonu dairesel maskeyle kirptigi icin splash-icon.png
 *    kare ve bol payli: cizim tuvalin yaklasik %59'unu kapliyor (1024 px
 *    tuvalde 600 px). Pay olmadan maskotun kafasi ve ayaklari kesiliyordu.
 *  - Buradaki MASCOT_WIDTH ise CIZIMIN ekrandaki genisligi.
 *
 * Yani: MASCOT_WIDTH = imageWidth x (600 / 1024) ≈ 188.
 * Biri degisirse digeri bu orana gore yeniden hesaplanmali, yoksa devir
 * teslim aninda gorsel sicrar.
 */
const MASCOT_WIDTH = 188;

/** Katmanin toplam omru — _layout bu sureden sonra bilesen kaldirilir. */
const SPLASH_DURATION = 2050;

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const hero = useSharedValue(0);
  const caption = useSharedValue(0);
  const cover = useSharedValue(1);

  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);
    hero.value = withDelay(80, withTiming(1, { duration: 720, easing: easeOut }));
    caption.value = withDelay(300, withTiming(1, { duration: 680, easing: easeOut }));
    cover.value = withDelay(1500, withTiming(0, { duration: 500, easing: Easing.inOut(Easing.cubic) }));

    const timer = setTimeout(onFinish, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [hero, caption, cover, onFinish]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));
  const heroStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + hero.value * 0.28,
    transform: [{ translateY: (1 - hero.value) * 18 }],
  }));
  const captionStyle = useAnimatedStyle(() => ({
    opacity: caption.value,
    transform: [{ translateY: (1 - caption.value) * 10 }],
  }));

  return (
    <Animated.View style={[styles.root, coverStyle]} pointerEvents="none">
      <SplashBackdrop />

      <Animated.View style={heroStyle}>
        <Mascot width={MASCOT_WIDTH} mood="wink" />

        <Animated.View style={[styles.caption, captionStyle]}>
          <Txt variant="title" color={OnboardingPalette.text} center style={styles.wordmark}>
            Koçum Benim
          </Txt>
          <Txt variant="small" color={OnboardingPalette.textDim} center>
            Hedefine giden yolda yanındayım
          </Txt>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

/** Ikondaki acik bej ve turuncu organik yuzeylerin sade splash yorumu. */
function SplashBackdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      <Rect width="100" height="100" fill={Brand.bg} />
      <Path
        d="M100 0H64C58 11 62 20 52 30C43 39 31 37 22 48C12 60 16 75 0 87V100H100Z"
        fill={OnboardingPalette.blob}
      />
    </Svg>
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
