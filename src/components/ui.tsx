import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Accent, Border, Font, OnColor, Palette, Radius, Space, Type, pillRadius, softOf } from '@/theme/tokens';

import { PressScale } from './button';

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
        accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : null,
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
      <View style={[styles.accentStripe, { backgroundColor: accent }]} />
      {children}
    </View>
  );
}

/* --------------------------------- rozetler -------------------------------- */

export function Pill({
  label,
  color = Accent,
  icon,
  style,
}: {
  label: string;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: softOf(color), borderColor: Palette.border }, style]}>
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
  color = Accent,
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
          backgroundColor: softOf(color),
          borderColor: Palette.border,
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
  color = Accent,
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
      <View style={{ width: `${clamped * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

/* --------------------------------- sekmeler --------------------------------- */

/** Sekme secicinin kutu yuksekligi — kose yaricapi bundan turetilir. */
const SEGMENT_HEIGHT = 38;

/** Kapsul icinde yer degistiren sekme secici — Gorevlerim, Liderlik Tablosu. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  color = Palette.text,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  color?: string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <PressScale key={o.key} onPress={() => onChange(o.key)} style={styles.flex} scaleTo={0.97}>
            <View style={[styles.segmentedItem, active && { backgroundColor: color }]}>
              <Txt variant="smallStrong" color={active ? OnColor : Palette.textDim}>
                {o.label}
              </Txt>
            </View>
          </PressScale>
        );
      })}
    </View>
  );
}

/* --------------------------------- girdiler --------------------------------- */

/** Formlarda kullanilan ortak metin girisi — auth ve onboarding ekranlarinda. */
export function TextField({
  style,
  multiline,
  error,
  ...rest
}: TextInputProps & { error?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={Palette.textFaint}
      autoCapitalize="none"
      multiline={multiline}
      style={[
        styles.field,
        multiline && styles.fieldMultiline,
        error && styles.fieldError,
        style,
      ]}
      {...rest}
    />
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
    borderWidth: Border.thin,
    borderColor: Palette.border,
    padding: Space.lg,
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
    // 15 (tiny satir yuksekligi) + 10 (dikey dolgu) + 4 (kenarlik) = 29
    borderRadius: pillRadius(29),
    borderWidth: Border.thin,
    alignSelf: 'flex-start',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
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
  field: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.lg,
    color: Palette.text,
    fontFamily: Font.regular,
    fontSize: 15,
  },
  fieldMultiline: {
    height: undefined,
    minHeight: 120,
    paddingTop: Space.md,
    paddingBottom: Space.md,
    textAlignVertical: 'top',
  },
  fieldError: {
    borderColor: Palette.pink,
  },
  flex: { flex: 1 },
  segmented: {
    flexDirection: 'row',
    gap: Space.xs,
    padding: Space.xs,
    backgroundColor: Palette.surfaceHi,
    // 38 (oge) + 8 (dolgu) + 4 (kenarlik) = 50
    borderRadius: pillRadius(50),
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  segmentedItem: {
    height: SEGMENT_HEIGHT,
    borderRadius: pillRadius(SEGMENT_HEIGHT),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
