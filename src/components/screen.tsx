import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Space } from '@/theme/tokens';

import { IconButton } from './button';
import { PatternBackground } from './pattern-background';
import { Txt } from './ui';

/**
 * Tum ekranlarin ortak zemini: duz, neredeyse beyaz. Duolingo tarzinda renk
 * zeminde degil bilesenlerde (kart kenarligi, buton dolgusu) yasar.
 *
 * `pattern` verilen ekranlar bunun yerine dekoratif ama yine gradyansiz bir
 * zemin alir (defter izgarasi + pastel tepe bandi); `tint` o bandin rengini
 * belirler. Varsayilan kapalidir ki icerik yogun ekranlar sade kalsin.
 */
export function ScreenBackground({
  tint,
  pattern,
  children,
}: {
  tint?: string;
  pattern?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      {pattern ? <PatternBackground color={tint ?? Palette.purple} /> : null}
      {children}
    </View>
  );
}

/** Kaydirilabilir ekran govdesi. Alt tab cubugunun altinda kalmayi onler. */
export function Screen({
  tint,
  pattern,
  contentContainerStyle,
  children,
  ...rest
}: ScrollViewProps & { tint?: string; pattern?: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground tint={tint} pattern={pattern}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Space.md, paddingBottom: insets.bottom + 96 },
          contentContainerStyle,
        ]}
        {...rest}
      >
        {children}
      </ScrollView>
    </ScreenBackground>
  );
}

/** Kaydirmayan ekranlar icin (kamera, oyun tahtasi). */
export function FixedScreen({
  tint,
  pattern,
  style,
  children,
  ...rest
}: ViewProps & { tint?: string; pattern?: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground tint={tint} pattern={pattern}>
      <View style={[styles.fixed, { paddingTop: insets.top, paddingBottom: insets.bottom }, style]} {...rest}>
        {children}
      </View>
    </ScreenBackground>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Verilirse basligin solunda geri oku gosterir — ust seviye (yigin) sayfalarda. */
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onBack ? <IconButton icon="chevron-back" onPress={onBack} /> : null}
      <View style={styles.headerText}>
        <Txt variant="title">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" color={Palette.textDim}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  content: {
    paddingHorizontal: Space.lg,
    gap: Space.lg,
  },
  fixed: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
});
