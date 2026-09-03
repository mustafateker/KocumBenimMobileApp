import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Border, deepOf, Font, Motion, OnColor, Palette, Space } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Dokunmatik geri bildirim — web'de haptics yok, sessizce atlanir. */
function tap(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(style).catch(() => {});
}

type PressScaleProps = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** Basildiginda kucuLme orani */
  scaleTo?: number;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
};

/** Basinca yayli kuculen dokunma alani. Kart, sekme gibi buton-disi ogelerin temeli. */
export function PressScale({
  onPress,
  disabled,
  style,
  children,
  scaleTo = 0.96,
  hapticStyle,
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        // Reanimated paylasilan degerleri mutasyon icin tasarlandi; React
        // Compiler'in degismezlik kurali bu kullanimi tanimiyor.
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      onPress={() => {
        if (disabled) return;
        tap(hapticStyle);
        onPress?.();
      }}
      style={[animatedStyle, disabled && styles.disabled, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

type ChunkyButtonProps = {
  label: string;
  onPress?: () => void;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  size?: 'md' | 'lg';
  full?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Duolingo'nun imza mekanigi: dinlenirken rengin koyu tonundan 4px'lik bir
 * "3D basma" seridi gorunur; basinca ic katman asagi kayar ve seridi yutar.
 * Gradyan/parlama yerine duz dolgu + kati kenarlik hiyerarsiyi tasir.
 */
function ChunkyButton({
  label,
  onPress,
  color = Palette.purple,
  icon,
  disabled,
  size = 'md',
  full,
  fill,
  textColor,
  borderColor,
  style,
}: ChunkyButtonProps & { fill: string; textColor: string; borderColor?: string }) {
  const height = size === 'lg' ? 56 : 46;
  const lift = Border.chunky;
  const press = useSharedValue(0);

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * lift }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
         
        press.value = withTiming(1, { duration: Motion.duration.fast });
      }}
      onPressOut={() => {
         
        press.value = withTiming(0, { duration: Motion.duration.base });
      }}
      onPress={() => {
        if (disabled) return;
        tap(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      style={[full && styles.full, disabled && styles.disabled, style]}
    >
      <View
        style={[
          styles.slab,
          {
            height: height + lift,
            borderRadius: height / 2,
            backgroundColor: deepOf(color),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.solid,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: fill,
              borderWidth: borderColor ? Border.thick : 0,
              borderColor,
            },
            innerStyle,
          ]}
        >
          {icon ? <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={textColor} /> : null}
          <Animated.Text
            style={[size === 'lg' ? styles.labelLg : styles.labelMd, { color: textColor }]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

/** Birincil aksiyon — vurgu renginde duz dolgu, chunky 3D basma. */
export function NeonButton(props: ChunkyButtonProps) {
  const color = props.color ?? Palette.purple;
  return <ChunkyButton {...props} fill={color} textColor={OnColor} />;
}

/** Ikincil aksiyon — beyaz dolgu, renkli kati kenarlik, ayni chunky mekanik. */
export function GhostButton(props: Omit<ChunkyButtonProps, 'size'>) {
  const color = props.color ?? Palette.textDim;
  return <ChunkyButton {...props} fill={Palette.surface} textColor={color} borderColor={color} />;
}

export function IconButton({
  icon,
  onPress,
  color = Palette.textDim,
  size = 40,
  disabled,
  style,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressScale onPress={onPress} disabled={disabled} scaleTo={0.88} style={style}>
      <View
        style={[
          styles.iconButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '18',
            borderColor: color + '55',
          },
        ]}
      >
        <Ionicons name={icon} size={size * 0.46} color={color} />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  slab: {
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  solid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.xl,
  },
  labelMd: {
    fontFamily: Font.black,
    fontSize: 15,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: Font.black,
    fontSize: 17,
    lineHeight: 22,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
  },
});
