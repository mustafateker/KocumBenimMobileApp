import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Border, Motion, OnColor, Palette, Space, softOf } from '@/theme/tokens';

import { Txt } from './ui';

const MASCOT_SOURCE = require('../../assets/images/mascot.png');

/** assets/images/mascot.png dosyasinin en/boy orani. */
export const MASCOT_ASPECT = 700 / 738;

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

/**
 * Maskotu renkli bir kabarcigin icine oturtur — onboarding adim basliklarinda
 * IconBubble'in yerini alir. Renk adimdan gelir, maskot sabit kalir.
 */
export function MascotBadge({
  color = Palette.amber,
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
  /** Amber zemin uzerinde kullanilirken yazilari beyaza cevirir. */
  onDark?: boolean;
}) {
  return (
    <View style={styles.lockup}>
      <Mascot width={width} mood={mood} />
      <Txt variant="title" color={onDark ? OnColor : Palette.text} style={styles.wordmark}>
        Koçum Benim
      </Txt>
      {tagline ? (
        <Txt variant="small" color={onDark ? OnColor : Palette.textDim} center>
          {tagline}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
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
