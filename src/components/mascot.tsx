import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Motion } from '@/theme/tokens';

const MASCOT_SOURCE = require('../../assets/images/mascot.png');

/** assets/images/mascot.png dosyasinin en/boy orani. */
const MASCOT_ASPECT = 700 / 738;

export type MascotMood =
  /** Varsayilan durus. */
  | 'happy'
  /** Kutlama: buyur ve dikkat ceker. */
  | 'cheer'
  /** Dusunuyor: hafif sakin ve donuk. */
  | 'think'
  /** Selamlama: canli bir yan durus. */
  | 'wink';

/**
 * Her "mood" icin sabit durus. Gercek yuz ifadesi cizimi yok (tek bir
 * fotoreal maskot gorseli kullaniliyor); farkli mimikler yerine hafif
 * donme/olcek/saydamlikla duygusal ton veriliyor.
 */
const POSE: Record<MascotMood, { rotate: number; scale: number; opacity: number }> = {
  happy: { rotate: 0, scale: 1, opacity: 1 },
  wink: { rotate: -4, scale: 1, opacity: 1 },
  cheer: { rotate: 3, scale: 1.06, opacity: 1 },
  think: { rotate: -2, scale: 0.98, opacity: 0.92 },
};

type MascotProps = {
  width?: number;
  mood?: MascotMood;
  style?: StyleProp<ViewStyle>;
};

/** Kocum Benim maskotu — porsuk ogretmen. */
export function Mascot({ width = 96, mood = 'happy', style }: MascotProps) {
  const height = width / MASCOT_ASPECT;
  const pop = useSharedValue(0.85);
  const pose = POSE[mood];

  useEffect(() => {
    pop.value = withDelay(60, withSpring(1, Motion.spring.playful));
  }, [pop, mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pose.opacity,
    transform: [{ scale: pop.value * pose.scale }, { rotate: `${pose.rotate}deg` }],
  }));

  return (
    <Animated.View style={[{ width, height }, style, animatedStyle]}>
      <Image source={MASCOT_SOURCE} style={styles.image} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
