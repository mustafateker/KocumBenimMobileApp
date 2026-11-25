import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accent, Palette, Space } from '@/theme/tokens';

import { IconButton } from './button';
import { PatternBackground } from './pattern-background';
import { Txt } from './ui';

/**
 * Tum ekranlarin ortak zemini: sicak ve neredeyse beyaz. Renk zeminde degil,
 * anlamli durumlarda ve ana aksiyonda yasar.
 *
 * `pattern` verilen ekranlar bunun yerine dekoratif ama yine gradyansiz bir
 * zemin alir (tek renkli organik tepe bandi); `tint` o bandin rengini belirler.
 * Varsayilan kapalidir ki icerik yogun ekranlar sade kalsin.
 */
export function ScreenBackground({
  tint,
  pattern,
  backgroundColor,
  blobColor,
  children,
}: {
  tint?: string;
  pattern?: boolean;
  backgroundColor?: string;
  blobColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.root, backgroundColor ? { backgroundColor } : null]}>
      {pattern ? (
        <PatternBackground
          color={tint ?? Accent}
          backgroundColor={backgroundColor}
          blobColor={blobColor}
        />
      ) : null}
      {children}
    </View>
  );
}

/**
 * Kaydirilabilir ekran govdesi. Alt tab cubugunun altinda kalmayi onler.
 *
 * Android SDK 54'ten beri edge-to-edge zorunlu; bu modda `adjustResize`
 * pencereyi kucultmuyor, uygulama klavyenin altina ciziyor ve odaklanan
 * girdi klavyenin arkasinda kalir. `KeyboardAwareScrollView` klavye
 * yuksekligini olcup icerigi yukari kaydiriyor — RN'in kendi
 * KeyboardAvoidingView'i bu modda ise yaramiyor.
 */
export function Screen({
  tint,
  pattern,
  keyboardAware = false,
  contentContainerStyle,
  children,
  ...rest
}: ScrollViewProps & { tint?: string; pattern?: boolean; keyboardAware?: boolean }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + 96;

  const resolvedContentStyle = [
    styles.content,
    { paddingTop: insets.top + Space.md, paddingBottom: bottomPadding },
    contentContainerStyle,
  ];

  return (
    <ScreenBackground tint={tint} pattern={pattern}>
      {keyboardAware ? (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={Space.xl}
          contentContainerStyle={resolvedContentStyle}
          {...rest}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={resolvedContentStyle}
          {...rest}
        >
          {children}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  /** Sol ustteki aksiyon — ogrenci sekmelerinde hamburger menu. */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Verilirse basligin solunda geri oku gosterir — ust seviye (yigin) sayfalarda. */
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={[styles.headerSide, styles.headerSideLeft]}>
        {onBack ? (
          <IconButton
            icon="chevron-back"
            onPress={onBack}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          />
        ) : left}
      </View>
      <View style={styles.headerText}>
        <Txt variant="title" center>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" color={Palette.textDim} center>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.headerSide, styles.headerSideRight]}>{right}</View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerSide: {
    width: 40,
    minHeight: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  headerSideLeft: {
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
});
