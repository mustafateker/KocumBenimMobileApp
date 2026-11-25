import { Redirect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NeonButton, PressScale } from '@/components/button';
import { Mascot } from '@/components/mascot';
import { ScreenBackground } from '@/components/screen';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField, Txt } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { useErrorDialog } from '@/lib/error-dialog';
import { STUDENT_SELF_SIGNUP_ENABLED } from '@/lib/feature-flags';
import { getRunningApkSha1 } from '@/lib/play-update';
import { useSession } from '@/lib/session';
import { promptAppleSignIn, promptGoogleSignIn } from '@/lib/social-auth';
import { EMAIL_RE } from '@/lib/validation';
import { OnboardingPalette, Space } from '@/theme/tokens';

/** Kayit: e-posta + parola. Basarili olursa direkt "Ilk Kurulum" sihirbazina gecer. */
export default function SignUp() {
  // Kayit kapatildiginda eski derin baglantilar da girise donsun.
  if (!STUDENT_SELF_SIGNUP_ENABLED) return <Redirect href="/login" />;
  return <SignUpForm />;
}

function SignUpForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signInWithGoogle, signInWithApple } = useSession();
  const { showMessage, showError } = useErrorDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [invalidField, setInvalidField] = useState<'email' | 'password' | 'confirm' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignUp = useCallback(async () => {
    if (submitting || socialLoading) return;
    setSocialLoading('google');
    try {
      const result = await promptGoogleSignIn();
      if (!result) return;
      await signInWithGoogle(result.idToken);
      router.replace('/');
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'FORBIDDEN_ROLE') {
        showMessage('Öğrenci Hesabı Gerekli', err.message);
      } else if (err?.code === '10' || err?.code === 'DEVELOPER_ERROR') {
        const runningSha1 = await getRunningApkSha1();
        const shaNote = runningSha1 ? `\n\nEksik SHA-1: ${runningSha1}` : '';
        showMessage(
          'Google İmzası Tanımsız',
          `Bu uygulamanın SHA-1 sertifika parmak izi Firebase Console / Google Cloud kimlik bilgilerine eklenmemiş (Kod: DEVELOPER_ERROR 10).${shaNote}`
        );
      } else if (err?.code === '7' || err?.code === 'NETWORK_ERROR') {
        showMessage('Bağlantı Hatası', 'Google Play Services ağ bağlantısı kuramadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        showError(err, { title: 'Google ile kayıt olunamadı', code: 'GOOGLE_SIGNUP' });
      }
    } finally {
      setSocialLoading(null);
    }
  }, [submitting, socialLoading, signInWithGoogle, router, showMessage, showError]);

  const handleAppleSignUp = useCallback(async () => {
    if (submitting || socialLoading) return;
    setSocialLoading('apple');
    try {
      const result = await promptAppleSignIn();
      if (!result) return;
      await signInWithApple(result);
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'FORBIDDEN_ROLE') {
        showMessage('Öğrenci Hesabı Gerekli', err.message);
      } else {
        showError(err, { title: 'Apple ile kayıt olunamadı', code: 'APPLE_SIGNUP' });
      }
    } finally {
      setSocialLoading(null);
    }
  }, [submitting, socialLoading, signInWithApple, router, showMessage, showError]);

  const submit = useCallback(async () => {
    if (submitting) return;

    if (!EMAIL_RE.test(email.trim())) {
      setInvalidField('email');
      showMessage('Geçersiz e-posta', 'Geçerli bir e-posta adresi gir.');
      return;
    }
    if (password.length < 4) {
      setInvalidField('password');
      showMessage('Parola çok kısa', 'Parola en az 4 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setInvalidField('confirm');
      showMessage('Parolalar eşleşmiyor', 'Parola ve parola tekrarı aynı olmalı.');
      return;
    }

    setSubmitting(true);
    setInvalidField(null);
    try {
      await signUp(email, password);
      router.replace('/onboarding');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CONFLICT') {
        setInvalidField('email');
        showMessage('Kayıt olunamadı', 'Bu e-posta ile zaten bir hesap var.');
      } else {
        showError(err, { title: 'Kayıt olunamadı', code: 'SIGNUP' });
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, email, password, confirm, signUp, router, showMessage, showError]);

  return (
    <ScreenBackground
      tint={OnboardingPalette.accentBright}
      backgroundColor={OnboardingPalette.bg}
      blobColor={OnboardingPalette.blob}
      pattern
    >
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
          <Mascot width={144} mood="cheer" />
          <Txt variant="hero" color={OnboardingPalette.text} center>
            Hesap Oluştur
          </Txt>
          <Txt variant="small" color={OnboardingPalette.textDim} center>
            Birkaç adımda seni tanıyalım, sonra yolculuğa başlayalım.
          </Txt>
        </View>

        <View style={styles.form}>
          <Field label="E-posta">
            <TextField
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setInvalidField(null);
              }}
              placeholder="ornek@eposta.com"
              keyboardType="email-address"
              autoComplete="email"
              error={invalidField === 'email'}
              tone="onboarding"
            />
          </Field>

          <Field label="Parola">
            <TextField
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setInvalidField(null);
              }}
              placeholder="En az 4 karakter"
              secureTextEntry
              autoComplete="password-new"
              error={invalidField === 'password' || invalidField === 'confirm'}
              tone="onboarding"
            />
          </Field>

          <Field label="Parola (tekrar)">
            <TextField
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                setInvalidField(null);
              }}
              placeholder="Parolanı tekrar gir"
              secureTextEntry
              autoComplete="password-new"
              error={invalidField === 'confirm'}
              tone="onboarding"
            />
          </Field>

          <NeonButton
            label={submitting ? 'Kaydediliyor…' : 'Kayıt Ol'}
            icon="arrow-forward"
            color={OnboardingPalette.accent}
            size="lg"
            full
            disabled={submitting}
            onPress={submit}
            style={styles.submit}
          />

          <SocialAuthButtons
            mode="signup"
            loadingProvider={socialLoading}
            disabled={submitting || socialLoading != null}
            onApplePress={handleAppleSignUp}
            onGooglePress={handleGoogleSignUp}
          />

          <View style={styles.legalNotice}>
            <Txt variant="tiny" color={OnboardingPalette.textFaint} center>
              Kayıt olarak{' '}
              <Txt
                variant="tiny"
                color={OnboardingPalette.accent}
                weight="semibold"
                onPress={() => router.push('/terms')}
              >
                Kullanım Şartları
              </Txt>
              {' '}ve{' '}
              <Txt
                variant="tiny"
                color={OnboardingPalette.accent}
                weight="semibold"
                onPress={() => router.push('/privacy-policy')}
              >
                Gizlilik Politikası
              </Txt>
              &apos;nı kabul etmiş olursun.
            </Txt>
          </View>
        </View>

        <PressScale onPress={() => router.replace('/login')}>
          <Txt variant="small" color={OnboardingPalette.textDim} center>
            Zaten hesabın var mı?{' '}
            <Txt variant="smallStrong" color={OnboardingPalette.accent}>
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
      <Txt variant="smallStrong" color={OnboardingPalette.textDim}>
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
  legalNotice: {
    paddingHorizontal: Space.sm,
    paddingTop: Space.xs,
  },
  field: {
    gap: 6,
  },
  submit: {
    marginTop: Space.sm,
  },
});
