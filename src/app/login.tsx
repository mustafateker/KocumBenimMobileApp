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
import { ApiError } from '@/lib/api-client';
import { useErrorDialog } from '@/lib/error-dialog';
import { STUDENT_SELF_SIGNUP_ENABLED } from '@/lib/feature-flags';
import { useSession } from '@/lib/session';
import { Accent, Border, OnColor, Palette, Radius, Space } from '@/theme/tokens';

/**
 * Giris: kullanici adi (veya e-posta) + parola. Hesabi kocu acar ve bilgileri paylasir;
 * kayit ekrani gecis doneminde `STUDENT_SELF_SIGNUP_ENABLED` ile acik tutulur.
 */
export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const { showMessage, showError } = useErrorDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if (submitting) return;
    if (!email.trim() || !password) {
      setHasError(true);
      showMessage('Eksik bilgi', 'Kullanıcı adı ve parolanı gir.');
      return;
    }

    setSubmitting(true);
    setHasError(false);
    try {
      await signIn(email, password, remember);
      router.replace('/');
    } catch (err) {
      setHasError(true);
      if (err instanceof ApiError && (err.code === 'INVALID_CREDENTIALS' || err.status === 401)) {
        showMessage('Giriş yapılamadı', 'Kullanıcı adı veya parola hatalı.');
      } else {
        showError(err, { title: 'Giriş yapılamadı', code: 'LOGIN' });
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, email, password, remember, signIn, router, showMessage, showError]);

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
          <Field label="Kullanıcı adı veya e-posta">
            <TextField
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setHasError(false);
              }}
              placeholder="kullanıcı adın"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              error={hasError}
            />
          </Field>

          <Field label="Parola">
            <TextField
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setHasError(false);
              }}
              placeholder="Parolanı gir"
              secureTextEntry
              autoComplete="password"
              error={hasError}
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

        {STUDENT_SELF_SIGNUP_ENABLED ? (
          <PressScale onPress={() => router.push('/signup')}>
            <Txt variant="small" color={Palette.textDim} center>
              Hesabın yok mu?{' '}
              <Txt variant="smallStrong" color={Accent}>
                Kayıt ol
              </Txt>
            </Txt>
          </PressScale>
        ) : (
          <Txt variant="small" color={Palette.textDim} center>
            Giriş bilgilerini koçundan alabilirsin.
          </Txt>
        )}
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
