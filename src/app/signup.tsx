import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NeonButton, PressScale } from '@/components/button';
import { Mascot } from '@/components/mascot';
import { ScreenBackground } from '@/components/screen';
import { TextField, Txt } from '@/components/ui';
import { useSession } from '@/lib/session';
import { Accent, Palette, Space } from '@/theme/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kayit: e-posta + parola. Basarili olursa direkt "Ilk Kurulum" sihirbazina gecer. */
export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if (submitting) return;

    if (!EMAIL_RE.test(email.trim())) {
      setError('Geçerli bir e-posta adresi gir.');
      return;
    }
    if (password.length < 4) {
      setError('Parola en az 4 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Parolalar eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await signUp(email, password);
      if (result.ok) {
        router.replace('/onboarding');
      } else {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, email, password, confirm, signUp, router]);

  return (
    <ScreenBackground tint={Accent}>
      {/* Android edge-to-edge modunda pencere klavye icin kucultulmuyor;
          odaklanan alani yukari kaydirma isini bu bilesen ustleniyor. */}
      <KeyboardAwareScrollView
        bottomOffset={Space.xl}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Space.xxl, paddingBottom: insets.bottom + Space.xl, minHeight: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Mascot width={118} mood="cheer" />
          <Txt variant="hero" center>
            Hesap Oluştur
          </Txt>
          <Txt variant="small" color={Palette.textDim} center>
            Birkaç adımda seni tanıyalım, sonra yolculuğa başlayalım.
          </Txt>
        </View>

        <View style={styles.form}>
          <Field label="E-posta">
            <TextField
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError(null);
              }}
              placeholder="ornek@eposta.com"
              keyboardType="email-address"
              autoComplete="email"
              error={!!error}
            />
          </Field>

          <Field label="Parola">
            <TextField
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError(null);
              }}
              placeholder="En az 4 karakter"
              secureTextEntry
              autoComplete="password-new"
              error={!!error}
            />
          </Field>

          <Field label="Parola (tekrar)">
            <TextField
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                setError(null);
              }}
              placeholder="Parolanı tekrar gir"
              secureTextEntry
              autoComplete="password-new"
              error={!!error}
            />
          </Field>

          {error ? (
            <Txt variant="small" color={Palette.pink}>
              {error}
            </Txt>
          ) : null}

          <NeonButton
            label={submitting ? 'Kaydediliyor…' : 'Kayıt Ol'}
            icon="arrow-forward"
            color={Accent}
            size="lg"
            full
            disabled={submitting}
            onPress={submit}
            style={styles.submit}
          />
        </View>

        <PressScale onPress={() => router.replace('/login')}>
          <Txt variant="small" color={Palette.textDim} center>
            Zaten hesabın var mı?{' '}
            <Txt variant="smallStrong" color={Accent}>
              Giriş yap
            </Txt>
          </Txt>
        </PressScale>
      </KeyboardAwareScrollView>
    </ScreenBackground>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Txt variant="smallStrong" color={Palette.textDim}>
        {label}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
    gap: Space.xxl,
  },
  brand: {
    alignItems: 'center',
    gap: Space.sm,
  },
  form: {
    gap: Space.lg,
  },
  field: {
    gap: 6,
  },
  submit: {
    marginTop: Space.sm,
  },
});
