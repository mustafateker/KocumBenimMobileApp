import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export type MascotMood =
  /** Varsayilan durus. */
  | 'happy'
  /** Kutlama: buyur ve dikkat ceker. */
  | 'cheer'
  /** Dusunuyor: hafif sakin ve donuk. */
  | 'think'
  /** Selamlama: canli bir yan durus. */
  | 'wink';

/** Kullanici tarafindan saglanan jest sayfasindan uretilmis seffaf pozlar. */
const MASCOT_SOURCE: Record<MascotMood, number> = {
  happy: require('../../assets/images/mascot-happy.png'),
  cheer: require('../../assets/images/mascot-cheer.png'),
  think: require('../../assets/images/mascot-think.png'),
  wink: require('../../assets/images/mascot-wave.png'),
};

/**
 * Her jest kendi kaynak gorseline sahip; asagidaki degerler pozu sabit tutar.
 * Maskot kendi icinde olcek animasyonu yapmaz; boylece ekran gecislerinde
 * buyuyup kuculmez.
 */
const POSE: Record<MascotMood, { rotate: number; opacity: number }> = {
  happy: { rotate: 0, opacity: 1 },
  wink: { rotate: -4, opacity: 1 },
  cheer: { rotate: 3, opacity: 1 },
  think: { rotate: -2, opacity: 0.92 },
};

type MascotProps = {
  width?: number;
  mood?: MascotMood;
  style?: StyleProp<ViewStyle>;
};

/** Kocum Benim maskotu — porsuk ogretmen. */
export function Mascot({ width = 96, mood = 'happy', style }: MascotProps) {
  const height = width;
  const pose = POSE[mood];

  return (
    <View
      style={[
        { width, height, opacity: pose.opacity, transform: [{ rotate: `${pose.rotate}deg` }] },
        style,
      ]}
    >
      <Image source={MASCOT_SOURCE[mood]} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
