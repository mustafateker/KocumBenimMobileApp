import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Space } from '@/theme/tokens';

/**
 * Cokme ekrani.
 *
 * Bilerek `Txt`/`Poppins` kullanilmiyor: hata tam da yazi tipleri yuklenirken
 * olusmussa Android'de var olmayan bir `fontFamily` yeni bir cokmeye yol acar.
 * Burada yalnizca sistem yazi tipi ve duz React Native bilesenleri var.
 */
export function CrashScreen({
  code,
  message,
  stack,
  onRetry,
}: {
  code: string;
  message: string;
  stack?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>😵‍💫</Text>
        <Text style={styles.title}>Bir şeyler ters gitti</Text>
        <Text style={styles.subtitle}>
          Uygulama beklenmedik bir hatayla karşılaştı. Aşağıdaki kodu destekle paylaşırsan sorunu
          hızlıca bulabiliriz.
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>HATA KODU</Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {stack ? (
          <View style={styles.stackBox}>
            <Text style={styles.codeLabel}>TEKNİK DETAY</Text>
            <Text style={styles.stack}>{stack.slice(0, 2000)}</Text>
          </View>
        ) : null}

        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.button}>
            <Text style={styles.buttonLabel}>Tekrar dene</Text>
          </Pressable>
        ) : null}

        <Text style={styles.hint}>
          Bu hata Ayarlar → Hata Kayıtları ekranına da kaydedildi.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Space.md,
    padding: Space.xl,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.textDim,
    textAlign: 'center',
  },
  codeBox: {
    gap: 4,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Palette.pink,
    backgroundColor: Palette.pinkSoft,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Palette.textDim,
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.text,
  },
  stackBox: {
    gap: 4,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceHi,
  },
  stack: {
    fontSize: 11,
    lineHeight: 16,
    color: Palette.textDim,
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purple,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: Palette.textFaint,
    textAlign: 'center',
  },
});
