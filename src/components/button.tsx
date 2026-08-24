import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { OnColor, Palette, Radius, Space, Type, glow } from '@/theme/tokens';

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

/** Basinca yayli kuculen dokunma alani. Tum butonlarin temeli. */
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

type NeonButtonProps = {
  label: string;
  onPress?: () => void;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  size?: 'md' | 'lg';
  full?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Birincil aksiyon — pastel gradyan dolgulu. */
export function NeonButton({
  label,
  onPress,
  color = Palette.blue,
  icon,
  disabled,
  size = 'md',
  full,
  style,
}: NeonButtonProps) {
  const height = size === 'lg' ? 56 : 46;

  return (
    <PressScale
      onPress={onPress}
      disabled={disabled}
      hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
      style={[full && styles.full, style]}
    >
      <LinearGradient
        colors={[color, shade(color)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.solid,
          { height, borderRadius: height / 2 },
          !disabled && glow(color, 0.35),
        ]}
      >
        {icon ? <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={OnColor} /> : null}
        <Animated.Text
          style={[size === 'lg' ? Type.section : Type.bodyStrong, styles.solidLabel]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </LinearGradient>
    </PressScale>
  );
}

/** Ikincil aksiyon — cerceveli, saydam. */
export function GhostButton({
  label,
  onPress,
  color = Palette.textDim,
  icon,
  disabled,
  full,
  style,
}: Omit<NeonButtonProps, 'size'>) {
  return (
    <PressScale onPress={onPress} disabled={disabled} style={[full && styles.full, style]}>
      <View style={[styles.ghost, { borderColor: color + '55', backgroundColor: color + '12' }]}>
        {icon ? <Ionicons name={icon} size={16} color={color} /> : null}
        <Animated.Text style={[Type.bodyStrong, { color }]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </View>
    </PressScale>
  );
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
            backgroundColor: color + '22',
            borderColor: color + '3A',
          },
        ]}
      >
        <Ionicons name={icon} size={size * 0.46} color={color} />
      </View>
    </PressScale>
  );
}

/**
 * Gradyanin ikinci durağı için rengi biraz koyulastirir.
 * #RRGGBB bekler; baska bicimde gelirse rengi oldugu gibi dondurur.
 */
function shade(hex: string, amount = 0.78): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.round(((num >> 16) & 255) * amount);
  const g = Math.round(((num >> 8) & 255) * amount);
  const b = Math.round((num & 255) * amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  solid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.xl,
  },
  solidLabel: {
    color: OnColor,
  },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    height: 46,
    paddingHorizontal: Space.xl,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
