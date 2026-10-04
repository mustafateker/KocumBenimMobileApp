import { Ionicons } from '@expo/vector-icons';
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
import { Accent, Border, OnColor, Palette, Radius, Space } from '@/theme/tokens';

/** Giris: e-posta + parola. Hesap yoksa kayit ekranina yonlendirir. */
export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('E-posta ve parolanı gir.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const ok = await signIn(email, password, remember);
      if (ok) {
        router.replace('/');
      } else {
        setError('E-posta veya parola hatalı.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, email, password, remember, signIn, router]);

  return (
    <ScreenBackground tint={Accent} pattern>
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
          <Mascot width={130} mood="wink" />
          <Txt variant="hero" center>
            Koçum Benim
          </Txt>
          <Txt variant="small" color={Palette.textDim} center>
            Odaklan, seviye atla, hedefine yaklaş.
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
              placeholder="Parolanı gir"
              secureTextEntry
              autoComplete="password"
              error={!!error}
            />
          </Field>

          <PressScale onPress={() => setRemember((r) => !r)} style={styles.rememberRow}>
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember ? <Ionicons name="checkmark" size={14} color={OnColor} /> : null}
            </View>
            <Txt variant="small" color={Palette.textDim}>
              Beni hatırla
            </Txt>
          </PressScale>

          {error ? (
            <Txt variant="small" color={Palette.pink}>
              {error}
            </Txt>
          ) : null}

          <NeonButton
            label={submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            icon="log-in"
            color={Accent}
            size="lg"
            full
            disabled={submitting}
            onPress={submit}
            style={styles.submit}
          />
        </View>

        <PressScale onPress={() => router.push('/signup')}>
          <Txt variant="small" color={Palette.textDim} center>
            Hesabın yok mu?{' '}
            <Txt variant="smallStrong" color={Accent}>
              Kayıt ol
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Accent,
    borderColor: Accent,
  },
});
