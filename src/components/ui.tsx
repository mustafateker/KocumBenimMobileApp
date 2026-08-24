import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Palette, Radius, Space, Type, cardShadow, glow } from '@/theme/tokens';

/* ----------------------------------- yazi ---------------------------------- */

type TxtVariant = keyof typeof Type;

export function Txt({
  variant = 'body',
  color = Palette.text,
  center,
  style,
  ...rest
}: TextProps & { variant?: TxtVariant; color?: string; center?: boolean }) {
  return (
    <Text
      style={[Type[variant], { color }, center && styles.center, style]}
      {...rest}
    />
  );
}

/* ----------------------------------- kart ---------------------------------- */

export function Card({
  style,
  accent,
  children,
  ...rest
}: ViewProps & { accent?: string }) {
  return (
    <View
      style={[
        styles.card,
        accent ? { borderColor: accent + '55', ...glow(accent, 0.18) } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/** Ust kenarinda ince renkli bir seritle vurgulanan kart. */
export function AccentCard({
  accent,
  style,
  children,
  ...rest
}: ViewProps & { accent: string }) {
  return (
    <View style={[styles.card, styles.accentCard, style]} {...rest}>
      <LinearGradient
        colors={[accent, accent + '00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentStripe}
      />
      {children}
    </View>
  );
}

/* --------------------------------- rozetler -------------------------------- */

export function Pill({
  label,
  color = Palette.blue,
  icon,
  style,
}: {
  label: string;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '55' }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={color} /> : null}
      <Txt variant="tiny" color={color}>
        {label}
      </Txt>
    </View>
  );
}

/** Yuvarlak ikon kabarcigi — kart basliklarinda ve bos durumlarda. */
export function IconBubble({
  name,
  color = Palette.blue,
  size = 44,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '1F',
          borderColor: color + '44',
        },
      ]}
    >
      <Ionicons name={name} size={size * 0.48} color={color} />
    </View>
  );
}

/* -------------------------------- ilerleme --------------------------------- */

export function ProgressBar({
  progress,
  color = Palette.blue,
  height = 8,
  track = Palette.surfaceHi,
}: {
  /** 0-1 arasi */
  progress: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }]}>
      <LinearGradient
        colors={[color + 'AA', color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${clamped * 100}%`, height: '100%', borderRadius: height / 2 }}
      />
    </View>
  );
}

/* ------------------------------- bos durumlar ------------------------------ */

export function EmptyState({
  icon,
  title,
  subtitle,
  color = Palette.textFaint,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <View style={styles.empty}>
      <IconBubble name={icon} color={color} size={64} />
      <Txt variant="bodyStrong" color={Palette.textDim} center>
        {title}
      </Txt>
      {subtitle ? (
        <Txt variant="small" color={Palette.textFaint} center>
          {subtitle}
        </Txt>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/** Basliklarda kullanilan bolum etiketi. */
export function SectionLabel({ children, color = Palette.textFaint }: { children: string; color?: string }) {
  return (
    <Txt variant="tiny" color={color} style={styles.sectionLabel}>
      {children.toUpperCase()}
    </Txt>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Space.lg,
    ...cardShadow,
  },
  accentCard: {
    overflow: 'hidden',
    paddingTop: Space.lg + 3,
  },
  accentStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    paddingVertical: Space.huge,
    paddingHorizontal: Space.xl,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  sectionLabel: {
    letterSpacing: 1.2,
  },
});
